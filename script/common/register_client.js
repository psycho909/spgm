requirejs(['moment', 'sweetalert2', 'app_client', 'pace', 'icheck', 'select2-maxheight', 'form-control', 'editForm', 'jquery-serialize', 'jquery-validate-messages'], function(moment, swal) {
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

var nowTimer;
var language;
var form;
//var editForm;
var validator;

var targetParkingGarageId; 
var targetGarageId;

var targetGarage;
var targetParkingGarage;
var targetCustomer;
var targetCommunity;

var garages;

var garageSelector;
var customerSelector;
var parkingGarageSelector;
var communitySelector;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'menu-message', 'customer-message', 'community-message', 'parking_garage-message', 'garage-message', 'user-message', 'registration-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('registration');
			loadNavigationBar();

			$('#welcome_title').append($.i18n.prop('registration.welcome.title'));
			$('#welcome_message').append($.i18n.prop('registration.welcome.message'));
			
			$('#user_tab_link').append($.i18n.prop('registration.user'));
			$('#garage_tab_link').append($.i18n.prop('garage'));
			$('#payment_tab_link').append($.i18n.prop('registration.payment'));
			$('#authentication_tab_link').append($.i18n.prop('registration.authentication'));
			$('#summary_tab_link').append($.i18n.prop('registration.summary'));

			$('#community_id_label').text($.i18n.prop('community'));
			$('#parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#garage_id_label').text($.i18n.prop('garage'));
			$('#customer_id_label').text($.i18n.prop('customer'));
			
			$('#welcome_hint').text($.i18n.prop('registration.welcome.hint'));
			
			$('#garage_hint').text($.i18n.prop('registration.garage.hint'));
			$('#user_hint').text($.i18n.prop('registration.user.hint'));
			$('#payment_hint').text($.i18n.prop('registration.payment.hint'));
			$('#authentication_hint').text($.i18n.prop('registration.authentication.hint'));
			$('#summary_hint').text($.i18n.prop('registration.summary.hint'));
			
			$('#notify_method_label').text($.i18n.prop('user.notify_method'));
			$('#name_label').text($.i18n.prop('user.name'));
			$('#address_label').text($.i18n.prop('user.address'));
			$('#email_label').text($.i18n.prop('user.email'));
			$('#phone_no_label').text($.i18n.prop('user.phone'));
			$('#mobile_phone_no_label').text($.i18n.prop('user.mobile_phone'));
			$('#line_id_label').text($.i18n.prop('user.line.id'));
			
			$('#payment_method_id_label').text($.i18n.prop('registration.payment.method'));

			$('#receive_notification_label').text($.i18n.prop('user.receive.notification'));
			$('#receive_report_label').text($.i18n.prop('user.receive.report'));
			$('#receive_notification_yes_label, #receive_report_yes_label').append($.i18n.prop('yes'));
			$('#receive_notification_no_label, #receive_report_no_label').append($.i18n.prop('no'));
			$('#notify_method_label').text($.i18n.prop('user.notify_method'));
			
			$('#login_id_label').text($.i18n.prop('user.login.id'));
			$('#password_label').text($.i18n.prop('user.password'));
			$('#reentry_password_label').last().prepend($.i18n.prop('user.password.reentry'));

			$('button.operation[value="PS"]').append($.i18n.prop('step.previous'));
			$('button.operation[value="NS"]').append($.i18n.prop('step.next'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.confirm'));

			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	"use strict";

	var dashedLanguage = language.replace('_', '-');
	
	if (APPLICATION.systemConfig.paymentMethodEnabled) $('#payment_nav').show();
	
	form = $('#register_form');
	
	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	moment.locale(dashedLanguage.toLowerCase());

	garageSelector = $('#garage_id');
	customerSelector = $('#customer_id');
	parkingGarageSelector = $('#parking_garage_id');
	communitySelector = $('#community_id');

	buildSelect2(parkingGarageSelector, null, false);
	buildSelect2(garageSelector, null, false);
	buildSelect2(customerSelector, null, false);
	buildSelect2(communitySelector, null, false);
	
	targetGarageId = getUrlParam("g");
	targetParkingGarageId = getUrlParam("pg");

	if (targetGarageId) {
		deferreds.push(
			ajaxGet(URLS.GARAGE.GET + targetGarageId, null)
			.done(function(json) {
				if (json) {
					targetGarage = json;
					targetParkingGarage = targetGarage.parkingGarage;
					targetCustomer = targetGarage.customer;
					targetCommunity = targetGarage.parkingGarage.community;
					if ((APPLICATION.authentication) && (APPLICATION.authentication.past) && (APPLICATION.user) && (APPLICATION.user.customerAdministrator)) {
						
					}
					else {
						garageSelector.select2({"data": [{'id': targetGarage.id, 'text': targetGarage.no + '-' + targetGarage.name}]}, false);
						//garageSelector.val(targetGarageId).trigger("change");
						customerSelector.select2({"data": [{'id': targetCustomer.id, 'text': targetCustomer.no + '-' + targetCustomer.name}]}, false);
						parkingGarageSelector.select2({"data": [{'id': targetParkingGarage.id, 'text': targetParkingGarage.no + '-' + targetParkingGarage.name}]}, false);
						communitySelector.select2({"data": [{'id': targetCommunity.id, 'text': targetCommunity.no + '-' + targetCommunity.name}]}, false);
					}
				}
			})
			.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
				console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
			}), 
		);	
	}
	else if (targetParkingGarageId) {
		deferreds.push(
			ajaxGet(URLS.PARKING_GARAGE.GET + targetParkingGarageId, null)
			.done(function(json) {
				if (json) {
					targetParkingGarage = json;
				}
			})
			.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
				console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
			}), 
		);	
	}

	deferreds.push(createCodeCheckbox('#payment_method_id_container', 'paymentMethod', URLS.CODE.LIST.PAYMENT_METHOD, 'id'));
	deferreds.push(createCodeCheckbox('#notify_method_container', 'notifyMethod', URLS.CODE.LIST.NOTIFY_METHOD, 'id'));
	
	$('#receive_notification_container, #receive_report_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});
	
	$('.nav-tabs a:first').tab('show');
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));

	$.when.apply($, deferreds)
	.done(function() {
		
		validator = $('#register_form').validate({
			//"ignore": ":hidden", 
			"ignore": "", 
			"rules": {
				garageId: {min: 1, required: true },  
				loginId: {required: true}, 
				password: {required: true, minlength: 6, maxlength: 12}, 
				reentryPassword: {equalTo: "#password"}, 
				email: {required: true, email, maxlength: 60},
				mobilePhoneNo: {required: true, maxlength: 30}, 
				name: {required: true, minlength: 2, maxlength: 30},
				notifyMethod: {required: true}, 
				//paymentMethod: {required: true}
			}
		});
		
		/*
		editForm = form.editForm({
			form: form,
			validator: validator, 
			saveUrl: URLS.REGISTRATION.SAVE_CLIENT, 
			beforePopulate: function(action) {
				$('input[name="notifyMethod"]:first').iCheck('check');
				$('input[name="receiveNotification"]:first').iCheck('check');
				$('input[name="receiveReport"]:first').iCheck('check');
				$('input[name="paymentMethod"]:first').iCheck('check');
				$('.icheck').iCheck('update');
			}, 
			beforeSave: function(saving) {
			}
		}); 
		editForm.process(CONSTANT.ACTION.ADD);
		*/
		if (targetCustomer) $('#address').val(targetCustomer.address);
		$('#loginId').val('');
		$('#password, #reentry_password').val('');
		$('input[name="notifyMethod"]:first').iCheck('check');
		$('input[name="receiveNotification"]:first').iCheck('check');
		$('input[name="receiveReport"]:first').iCheck('check');
		$('input[name="paymentMethod"]:first').iCheck('check');
		$('.icheck').iCheck('update');

		$(document).on('shown.bs.tab', 'a[data-toggle="tab"]:last', refreshSummary);
				
		$('button.operation[value="S"]').on('click', function(e) {
			e.preventDefault();
			if (!form.valid()) {
				var errors = validator.errors();
				console.log(errors);
				return;
			}
			
			if (toast) toast.fire({
				type: 'info', 
				title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
			});
			
			var saving = form.serializeObject();
			if (saving.updated) delete saving.updated;
			if (!saving.id) saving.id = 0;
			
			saving.notifyMethod = '';
			$('input[name="notifyMethod"]:checked').each(function() {
				if (saving.notifyMethod) saving.notifyMethod += ",";
				saving.notifyMethod += $(this).val();
			});
			
			saving.paymentMethod = '';
			$('input[name="paymentMethod"]:checked').each(function() {
				if (saving.paymentMethod) saving.paymentMethod += ",";
				saving.paymentMethod += $(this).val();
			});
			
			try {
				ajaxPost(URLS.REGISTRATION.SAVE_USER, saving, function(saved) {
					if (toast) toast.close();
				});
			}
			catch (e) {
				if (toast) toast.close();
			}
				
		});
		
		$('button.operation[value="PS"]').on('click', function(e) {
			e.preventDefault();
			var tabIndex = $(this).closest('.tab-pane').index('#tabs .tab-pane');
			$('.nav-tabs a').eq(tabIndex).removeClass('active');
			$('.nav-tabs a').eq(tabIndex - 1).tab('show');
		})
		
		$('button.operation[value="NS"]').on('click', function(e) {
			e.preventDefault();
			var tabIndex = $(this).closest('.tab-pane').index('#tabs .tab-pane');
			$('.nav-tabs a').eq(tabIndex).removeClass('active');
			$('.nav-tabs a').eq(tabIndex + 1).tab('show');
		})
		
		return deferred.resolve();
	});
	
	return deferred.promise();	
}

function refresh(e) {
	if (e) e.preventDefault();
}

function refreshSummary(e) {
	$('#summary_content').empty();
	var summary = '';
	var errors;
	if (!form.valid()) {
		errors = validator.errorMap;
		console.log(errors);
	}
	$.each($('.form-group', form), function() {
		var that = this;
		var label = $('label:first',  that).text();
		var input =  $(':input:first',  that);
		var value;
		if (input.is('.select2')) {
			var selected = input.select2('data');
			value = (selected.length > 0) ? selected[0].text : '';
		}
		else if ((input.attr('type') == 'radio') || (input.attr('type') == 'checkbox')) {
			input =  $(':checked',  that);
			value = input.closest("label").text();
		}
		else if (input.attr('type') == 'password') {
			value = '-';
		}
		else {
			value = input.val();
		}
		var error = (errors) ? errors[input.attr('name')] : null;
		var textClass = (error) ? "text-danger" : "text-success";
		summary = summary + ('<p><span class="{0}">{1}:</span> <span>{2}</span> <span class="text-warning">{3}</span></p>'.format(textClass, label, value, error ? error : ''));
	});
	$('#summary_content').html(summary);
}