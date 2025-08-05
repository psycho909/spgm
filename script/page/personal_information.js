requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'editForm', 'jquery-serialize', 'jquery-validate-messages', 'lightbox'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 300 * 1000
	});	
	app.initialize(function() {
		refresh();
	});
});

var nowTimer;
var language;
var locale;

var form;
var editForm;
var user;
var now;
var validator;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
    $.i18n.properties({
    	language: language,
        name: [APPLICATION.SETTING.defaultLanguageFileName, 'user-message'], 
        path: APPLICATION.SETTING.defaultLanguageFilePath,
        mode: 'map',
        cache: false,
        callback: function() {
        	APPLICATION.documentTitle = $.i18n.prop('user.personal_information');
        	$('#title_section').text(APPLICATION.documentTitle);
        	$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_organization_user').text($.i18n.prop('breadcrumb.organization_user'));
        	$('#breadcrumb_personal_information').text(APPLICATION.documentTitle);

        	$('#form_title').text($.i18n.prop('user.personal_information'));
        	$('#original_password_label').text($.i18n.prop('user.change_password.original_password'));
			
			$('#email_label').text($.i18n.prop('user.email'));
			$('#phone_label').text($.i18n.prop('user.phone'));
			$('#mobile_phone_label').text($.i18n.prop('user.mobile_phone'));
			$('#line_id_label').text($.i18n.prop('user.line.id'));
			$('#license_plate_no_label').text($.i18n.prop('terms.license_plate'));
			$('#register_time_label').text($.i18n.prop('user.register_time'));
			$('#login_id_label').text($.i18n.prop('user.login.id'));
			$('#name_label').text($.i18n.prop('user.name'));
			//$('#notes_label').text($.i18n.prop('user.notes'));
			$('#credit_card_no_label').text($.i18n.prop('user.credit_card.no'));
			$('#invoice_barcode_label').text($.i18n.prop('user.invoice.barcode'));
			$('#status_label').text($.i18n.prop('status'));
			$('#status_active').append($.i18n.prop('status.active'));
			$('#status_inactive').append($.i18n.prop('status.inactive'));
			$('#receive_notification_label').text($.i18n.prop('user.receive.notification'));
			$('#receive_report_label').text($.i18n.prop('user.receive.report'));
			$('#receive_notification_yes_label, #receive_report_yes_label').append($.i18n.prop('yes'));
			$('#receive_notification_no_label, #receive_report_no_label').append($.i18n.prop('no'));
			$('#notify_method_label').text($.i18n.prop('user.notify_method'));
			$('#password_label').text($.i18n.prop('user.password'));
			$('#reentry_password_label').text($.i18n.prop('user.password.reentry'));
			
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			
			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));

       		deferred.resolve();
        }
    });
    return deferred.promise();
}

function initial() {
	
	"use strict";
	applyLayoutOption();
	
	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});

	form = $('#form');
	showOperationButtons($('.operation_container'), {'add': false, 'update': true, 'delete': false, 'save': true, 'cancel': true, 'backToList': false});
	
	if (APPLICATION.systemConfig.paymentMethodEnabled) $('.payment').removeClass('d-none');
	
	$('#status_container, #receive_notification_container, #receive_report_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});

	deferreds.push(createCodeCheckbox('#notify_method_container', 'notifyMethod', URLS.CODE.LIST.NOTIFY_METHOD, 'id'));
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
	//
	$.when.apply($, deferreds)
	.done(function() {
		
		validator = form.validate({
			rules: {
				email: {
					required: true,
					email
				},
				name: {
					required: true
				}
			}
		});
		
		editForm = $('#form').editForm({
			form: form,
			alwaysShowOperation: true, 
			validator: validator, 
			saveUrl: URLS.USER.SAVE_PERSONAL, 
			beforePopulate: function(action) {
				var data = editForm.formData();
				if (data) {
					data.password = '';
					data.reentryPassword = '';
					editForm.formData(data);
					$('#password, #reentry_password').attr('placeholder', (action == CONSTANT.ACTION.UPDATE) ? $.i18n.prop('user.password.hint') : '');
				}
			},
			afterPopulate: function() {
				var data = editForm.formData();
				if ((data.organization) && (data.organization.id)) $('#organization_id').val(data.organization.id).trigger('change');
				else $('#organization_id').val('').trigger('change');
				if ((data.customer) && (data.customer.id)) $('#customer_id').val(data.customer.id).trigger('change');
				else $('#customer_id').val('').trigger('change');
				/*
				if (data.role.id) $('#role_id').val(data.role.id).trigger('change');
				else $('#role_id').val('').trigger('change');
				*/
				$('input[name="status"]').iCheck('update');
				$('input[name="ldapAuthenticate"]').iCheck('update');
				$('input[name="receiveNotification"]').iCheck('update');
				$('input[name="receiveReport"]').iCheck('update');
				$('input[name="userTypeId"][value="{0}"]'.format(data.userTypeId)).iCheck('check').iCheck('update');
				
				$('input[name="notifyMethod"]').iCheck('uncheck');
				if (data.notifyMethods) {
					data.notifyMethods.forEach((e) => {
						$('input[name="notifyMethod"][value="{0}"]'.format(e.notifyMethodId)).iCheck('check');
					});
				}
				$('input[name="notifyMethod"]').iCheck('update');
			},
			beforeSave: function(saving) {
				if (saving.reentryPassword) delete saving.reentryPassword;
				saving.notifyMethods = [];
				$('input[name="notifyMethod"]:checked', form).each((index, element) => {
					saving.notifyMethods.push({'notifyMethodId': $(element).val()});
				});
				if (saving.notifyMethod) delete saving.notifyMethod;
			}
		});
		//editForm.process(CONSTANT.ACTION.UPDATE);
		
		deferred.resolve();
	});

	return deferred.promise();
	
}

function refresh(e) {
	if (e) e.preventDefault();
	if (APPLICATION.user) {
		ajaxGet(URLS.USER.GET + APPLICATION.user.id, null)
		.done(function(json) {
			if (json) {
				user = json;
				editForm.formData(user);
				editForm.refresh();
				editForm.process(CONSTANT.ACTION.INQUIRY);
			}
		});
	}
}
