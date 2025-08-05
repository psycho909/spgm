requirejs(['moment', 'sweetalert2', 'app_client', 'pace', 'select2-maxheight', 'icheck', 'form-control', 'editForm', 'jquery-validate-messages'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		//allowOutsideClick: false, 
		timer: 300 * 1000
	});	
	app.initialize();
});

var language;
var table;
var form;
var editForm
var data;
var validator;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'menu-message', 'user-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {

			APPLICATION.documentTitle = $.i18n.prop('terms.user');
			loadNavigationBar();

			$('#form_title').text(APPLICATION.documentTitle);

			$('#email_label').text($.i18n.prop('user.email'));
			$('#mobile_phone_label').text($.i18n.prop('user.mobile_phone'));
			$('#register_time_label').text($.i18n.prop('user.register_time'));
			$('#login_id_label').text($.i18n.prop('user.login.id'));
			$('#name_label').text($.i18n.prop('user.name'));
			$('#notes_label').text($.i18n.prop('user.notes'));
			$('#status_label').text($.i18n.prop('status'));
			$('#status_active').append($.i18n.prop('status.active'));
			$('#status_inactive').append($.i18n.prop('status.inactive'));
			$('#receive_notification_label').text($.i18n.prop('user.receive.notification'));
			$('#receive_report_label').text($.i18n.prop('user.receive.report'));
			$('#receive_notification_yes_label, #receive_report_yes_label').append($.i18n.prop('yes'));
			$('#receive_notification_no_label, #receive_report_no_label').append($.i18n.prop('no'));
			$('#notify_method_label').text($.i18n.prop('user.notify_method'));
			$('#password_label').text($.i18n.prop('user.password'));
			//$('#reentry_password_label').last().prepend($.i18n.prop('user.password.reentry'));
			$('#reentry_password_label').append($.i18n.prop('user.password.reentry'));
			
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			
			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));

			$('#status_label').text($.i18n.prop('status'));
			$('#status1_label').append($.i18n.prop('status.active'));
			$('#status2_label').append($.i18n.prop('status.inactive'));

			$('#search').append($.i18n.prop('operation.query'));

			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	"use strict";

	var deferred = $.Deferred();
	var deferreds = [];

	$(document).ajaxStart(function() {Pace.restart();});
	
	var dashedLanguage = language.replace('_', '-');

	form = $('#form');

	$('#password, #reentry_password').attr('placeholder', $.i18n.prop('user.password.hint'));

	$('#status_container, #receive_notification_container, #receive_report_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});

	deferreds.push(createCodeCheckbox('#notify_method_container', 'notifyMethod', URLS.CODE.LIST.NOTIFY_METHOD, 'id'));

	/*
	deferreds.push(createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')));
	deferreds.push(createVenderSelect($('#vender_id'), $('#vender_id_container'), $('#criteria_vender_id'), $('#criteria_vender_id_container')));
	*/
	/*
	deferreds.push(ajaxGetJson(URLS.ROLE.EFFECTIVE, null, function(json) {
		roles = json;
	}));
	*/
	/*
	deferreds.push(ajaxPostJson(URLS.COUNTRY.EFFECTIVE, null, function(json) {
		var data = [];
		if (json) {
			data.push({'id': '', 'text': ''});
			for (var i = 0; i < json.length; i++) {
				data.push({'id': json[i].locale, 'text': i18nText(json[i], 'language', language) + '(' + i18nText(json[i], 'name', language) + ')'});
			}
		}
		$('#locale').select2({
			data: data,
			maximumSelectionSize: 1,
			allowClear: true,
			closeOnSelect: true,
			theme: 'bootstrap4', 
			placeholder: $.i18n.prop('operation.choose')
		}).maximizeSelect2Height();
	}));
	*/

	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));

	$.when.apply($, deferreds)
	.done(function() {
		editForm = $('#form').editForm({
			form: form,
			validator: validator, 
			//table: tableElement,
			//dataTable: table,
			afterPopulate: function() {
				$('input[name="status"]').iCheck('update');
				$('input[name="receiveNotification"]').iCheck('update');
				$('input[name="receiveReport"]').iCheck('update');
				$('input[name="receiveReport"]').iCheck('update');

				$('input[name="notifyMethod"]').iCheck('uncheck');
				if (data.notifyMethods) {
					data.notifyMethods.forEach((e) => {
						$('input[name="notifyMethod"][value="{0}"]'.format(e.notifyMethodId)).iCheck('check');
					});
				}
				$('input[name="notifyMethod"]').iCheck('update');
				
			},
			save: function() {
				form.validate();
				if (!form.valid()) return;
				var saving = form.serializeObject();
				delete saving.updated;
				delete saving.reentryPassword;
				var deferred = $.Deferred();
				try {
					ajaxPostJson(URLS.USER.SAVE, saving, function(saved) {
						toast.close();
						deferred.resolve(saved);
					});
				}
				catch (e) {
					toast.close();
					deferred.resolve(null);
				}
				return deferred.promise();
			}
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);
		refresh();
		deferred.resolve();
	});
	
	return deferred.promise();
	
}

function refresh(e) {
	if (e) e.preventDefault();
	ajaxPostJson(URLS.USER.ONE, null, function(json) {
		if (json) {
			data = json;
			form.populate(json);
			editForm.afterPopulate();
		}
	});
}
