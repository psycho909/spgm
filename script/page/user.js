/*
requirejs(['moment', 'sweetalert2', 'app', 'pace', 'datatables.net-responsive', 'datatables-helper', 'daterangepicker', 'select2-maxheight', 'icheck', 'form-control', 'editForm', 'jquery-validate-messages'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 5000
	});	
	app.initialize(function() {
		if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	});
});
*/
initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	refresh();
});

var language;

var form;
var validator;
var editForm;

var criteriaForm;
var criteriaValidator;

var tableElement;
var table;
var registrationTableElement;
var registrationTable;

var organizationId;
var customerId;
var venderId;

var countries;
var roles;

var activeCriteriaOrganizationId;
var activeCriteriaCommunityId;
var activeCriteriaCustomerId;

var activeOrganizationId = null;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'user-message'/*, 'organization-message', 'community-message', 'customer-message'*/], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('user');
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_organization_user').text($.i18n.prop('breadcrumb.organization_user'));
			$('#breadcrumb_user').text($.i18n.prop('terms.user'));
			$('#title_section').text($.i18n.prop('terms.user'));
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_form_title').text($.i18n.prop('terms.query.criteria'));
			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('terms.organization'));
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('terms.community'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('terms.customer'));
			$('#criteria_login_id_label, #login_id_label').text($.i18n.prop('user.login.id'));
			$('#criteria_name_label, #name_label').text($.i18n.prop('user.name'));
			
			//$('#criteria_vender_id_label, #vender_id_label').text($.i18n.prop('terms.vender'));
			$('#user_form_title').text($.i18n.prop('operation.input'));
			
			$('#parking_garage_id_label').text($.i18n.prop('terms.parking_garage'));
			$('#garage_id_label').text($.i18n.prop('terms.garage'));
			$('#parking_card_id_label').text($.i18n.prop('terms.parking_card'));
			
			$('#customer_administrator_label').text($.i18n.prop('user.customer_administrator'));
			$('#user_type_id_label').text($.i18n.prop('user.type'));
			$('#role_id_label').text($.i18n.prop('user.role'));
			//$('#locale_label').text($.i18n.prop('user.locale'));
			$('#email_label').text($.i18n.prop('user.email'));
			$('#phone_no_label').text($.i18n.prop('user.phone'));
			$('#mobile_phone_no_label').text($.i18n.prop('user.mobile_phone'));
			$('#mobile_phone_no').attr('placeholder', $.i18n.prop('placeholder.mobie_phone_no'));
			$('#line_id_label').text($.i18n.prop('user.line.id'));
			$('#license_plate_no_label').text($.i18n.prop('terms.license_plate'));
			$('#invoice_barcode_label').text($.i18n.prop('user.invoice.barcode'));
			
			$('#register_time_label').text($.i18n.prop('user.register_time'));
			$('#confirm_time_label').text($.i18n.prop('user.review_time'));
			//$('#tax_id_number_label').text($.i18n.prop('user.tax_id_number'));
			//$('#identity_card_number_label').text($.i18n.prop('user.identity_card_number'));
			$('#confirm_time, #register_time').attr('placeholder', $.i18n.prop('user.datetime.format'));
			//$('#tax_id_or_identity_card_number_label').text($.i18n.prop('user.tax_id_number') + '/' + $.i18n.prop('user.identity_card_number'));
			
			$('#address_label').text($.i18n.prop('user.address'));
			$('#note_label').text($.i18n.prop('user.notes'));
			$('#status_label').text($.i18n.prop('status'));
			$('#receive_notification_label').text($.i18n.prop('user.receive.notification'));
			$('#receive_report_label').text($.i18n.prop('user.receive.report'));
			$('#receive_notification_yes_label, #receive_report_yes_label').append($.i18n.prop('yes'));
			$('#receive_notification_no_label, #receive_report_no_label').append($.i18n.prop('no'));
			$('#notify_method_label').text($.i18n.prop('user.notify_method'));
			$('#password_label').text($.i18n.prop('user.password'));
			$('#reentry_password_label').last().prepend($.i18n.prop('user.password.reentry'));
			$('#ldap_authenticate_label').text($.i18n.prop('user.authenticate.ldap'));
			$('#ldap_authenticate_yes_label').append($.i18n.prop('yes'));
			$('#ldap_authenticate_no_label').append($.i18n.prop('no'));
			$('#credit_card_no_label').text($.i18n.prop('user.credit_card.no'));
			//$('#expired_year_month_label').text($.i18n.prop('user.credit_card.expired'));
			//$('#validation_code_label').text($.i18n.prop('user.credit_card.validation_code'));
			
			$('#user_form button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('#user_form button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('#user_form button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('#user_form button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('#user_form button.operation[value="S"]').append($.i18n.prop('operation.save'));
			
			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));
			
			$('#tab1').append($.i18n.prop('user'));
			$('#tab2').append($.i18n.prop('user.other'));

			$('#search').append($.i18n.prop('operation.query'));

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

	/*
	$('#customer_id_container').hide();
	$('#vender_id_container').hide();
	*/

	$(document).ajaxStart(function() {Pace.restart();});
	
	var dashedLanguage = language.replace('_', '-');
	
	form = $('#user_form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));

	if (APPLICATION.systemConfig.paymentMethodEnabled) $('.payment').removeClass('d-none');

	moment.locale(dashedLanguage.toLowerCase());
	
	$('input[type="checkbox"].icheck').iCheck({
		checkboxClass: 'icheckbox_square-blue', 
		tap: true
	});
				
	$('#receive_notification_container, #ldap_authenticate_container, #receive_report_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});

	deferreds.push(createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	deferreds.push(createCodeRadio($('#user_type_id_container'), 'userTypeId', URLS.CODE.LIST.USER_TYPE));
	deferreds.push(createCodeCheckbox('#notify_method_container', 'notifyMethod', URLS.CODE.LIST.NOTIFY_METHOD, 'id'));
	deferreds.push(createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')));
	//deferreds.push(createVenderSelect($('#vender_id'), $('#vender_id_container'), $('#criteria_vender_id'), $('#criteria_vender_id_container')));

	deferreds.push(ajaxGet(URLS.ROLE.LIST_EFFECTIVE, null, function(json) {
		roles= json;
		if (roles) {
			for (var i = 0; i < roles.length; i++) {
				$('#role_id').append('<option value="{0}">{1}</option>'.format(roles[i].id, roles[i].no + '-' + i18nText(roles[i], 'title', language)));
			}
		}
		$('#role_id').select2({
			maximumSelectionSize: 10, 
			multiple: true,
			allowClear: false,
			closeOnSelect: true,
			theme: 'bootstrap4', 
			placeholder: $.i18n.prop('operation.choose')
		}).maximizeSelect2Height();
	}));
	
	//buildSelect2($('#criteria_community_id, #criteria_customer_id'), null, true, false);
	buildSelect2($('#criteria_customer_id'), null, true, false);

	createDatePicker($('#register_time, #confirm_time'), moment().format(APPLICATION.SETTING.defaultDateTimeFormat), true, true);
	
	// Table
	tableElement = $('#table');
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable(
			/*
			{
			"language": getDataTablesLanguage(),
			"paging": true,
			'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": true,
			"searching": false,
			"ordering": true,
			//"order": [[1, "asc"], [2, "asc"]],
			"order": [[1, "asc"]],
			"orderClasses": false, 
			"info": true,
			"stateSave": true,
			"autoWidth": false,
			"responsive": false,
			"columns": [
				{"data": null, "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
				{"data": 'email', "title": $.i18n.prop('user.email'), "sortable": true, 'width': 150},
				{"data": "name", "title": $.i18n.prop('user.name'), "sortable": true, 'width': 80},
				{"data": 'organization', "title": $.i18n.prop('terms.organization'), "sortable": false, 'width': 100, "render": dataTableHelper.render.shortNameRender},
				//{"data": 'community', "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				//{"data": 'customer', "title": $.i18n.prop('customer'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": 'loginId', "title": $.i18n.prop('user.login.id'), "sortable": true, 'width': 80},
				{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
				{"data": 'id', "visible": false} 
			],
			"deferLoading": 0,
			"processing": false,
			"serverSide": true,
			"ajax": loadTable
			*/
			getDataTableOptions({
				"columns": [
					{"data": 'email', "title": $.i18n.prop('user.email'), "sortable": true, 'width': 150},
					{"data": "name", "title": $.i18n.prop('user.name'), "sortable": true, 'width': 80},
					{"data": 'organization', "title": $.i18n.prop('terms.organization'), "sortable": false, 'width': 100, "render": dataTableHelper.render.shortNameRender},
					{"data": 'loginId', "title": $.i18n.prop('user.login.id'), "sortable": true, 'width': 80},
					{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);
	}));

	$('.nav-tabs a:first').tab('show');
	
	/*
	deferreds.push(ajaxPostJson(URLS.ORGANIZATION.LIST, null, function(json) {
		var data = [];
		if (json) {
			data.push({'id': '', 'text': ''});
			for (var i = 0; i < json.length; i++) {
				data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
			}
		}
		$('#criteria_organization_id, #organization_id').select2({
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
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				organizationId: {requiredid: true}, 
				/* 
				communityId: {
					requiredid: function(element) {
						return (APPLICATION.user.userType.id == APPLICATION.codeHelper.userTypeCustomer.id);
        			}
				}
				*/
				name: {required: true}, 
				loginId: {required: true}, 
				email: {required: true}, 
				mobilePhoneNo: {required: true}, 
			}
		});

		validator = form.validate({
			onkeyup: function (element) {
				return element.id != 'login_id';
			},			
			rules: {
				organizationId: {
					requiredid: true 
				}, 
				loginId: {
					required: true,
					minlength: APPLICATION.systemConfig.minLoginIdLength, 
					maxlength: APPLICATION.systemConfig.maxLoginIdLength, 
					remote: {
						url: URLS.USER.CHECK_LOGIN_ID,
						type: "post",
						data: {
							loginId: function() {return $("#login_id").val();}, 
							id: function() {return $("#id").val();}
						}
					}
				},
				password: {
					//regex: /^[a-zA-Z0-9_@#*\.]+$/, 
					regex: /^[a-zA-Z0-9]+$/, 
					minlength: APPLICATION.systemConfig.minPasswordLength, 
					maxlength: APPLICATION.systemConfig.maxPasswordLength
				}, 
				reentryPassword: {
					equalTo: "#password"
				},
				name: {
					required: true,
					minlength: 2, 
					maxlength: 50
				},
				lineId: {
					required: true,
					minlength: 2, 
					maxlength: 50
				},
				mobilePhoneNo: {
					required: true,
					digits: true, 
					minlength: 10, 
					maxlength: 10
				},
				address: {
					maxlength: 100
				},
				status: {
					required: true
				}
			},
			messages: {
				loginId: {
					remote: $.i18n.prop('validation.duplicate')
				}
			}			
		});
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = $('#user_form').editForm({
			form: form,
			table: tableElement,
			dataTable: table, 
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.USER.SAVE, 
			removeUrl: URLS.USER.DELETE, 
			beforePopulate: function(action) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						"id": 0,
						"status": 1,
						"locale": APPLICATION.SETTING.defaultLocale, 
						"registerTime": moment().format(APPLICATION.SETTING.defaultDateTimeFormat)
					});
				}
				else {
					if (editForm.activeRow) {
						var data = editForm.activeRow.data();
						data.password = '';
						data.reentryPassword = '';
						if (data.role) data.roleId = data.role.id;
						editForm.formData(data);
					}
				}
				$('#password, #reentry_password').attr('placeholder', (action == CONSTANT.ACTION.UPDATE) ? $.i18n.prop('user.password.hint') : '');
			},
			afterPopulate: function(action) {
				var data = editForm.formData();
				
				$('#organization_id').val(data.organizationId ? data.organizationId : "").trigger('change');
				
				//$('input[name="status"]').iCheck('update');
				//$('input[name="ldapAuthenticate"]').iCheck('update');
				//$('input[name="receiveNotification"]').iCheck('update');
				//$('input[name="receiveReport"]').iCheck('update');
				
				if (action == CONSTANT.ACTION.ADD) $('input[name="userTypeId"]:first').iCheck('check').iCheck('update');
				else $('input[name="userTypeId"][value="{0}"]'.format(data.userTypeId)).iCheck('check').iCheck('update');
				
				$('#role_id').val('');
				var roleIds = [];
				if (data.roles) {
					data.roles.forEach((e) => roleIds.push(e.id.toString()));
					$('#role_id').val(roleIds);
				}
				$('#role_id').trigger('change');
				
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
				
				//saving.roles = $('#role_id', form).val();
				saving.userRoles = [];
				var roleIds = $('#role_id', form).val();
				roleIds.forEach(value => {
					if (value) saving.userRoles.push({'roleId': value})
					});
				if (saving.roleId) delete saving.roleId;
				
				//saving.registrations = registrationTable.rows().data();
				//console.log(saving);
			}
		});
		
		editForm.process(CONSTANT.ACTION.INQUIRY);
		
		$('#criteria_organization_id').on('change', function(e) {
			activeCriteriaOrganizationId = changeOrganization(criteriaForm.serializeObject(), $(this), activeCriteriaOrganizationId, $('#criteria_community_id'), null);
		});
		
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, null, $('#criteria_customer_id'), null);
		});

		$('#search').on('click', refresh);
		
		deferred.resolve();
	});
	
	return deferred.promise();
}

function loadTable(data, callback, settings) {
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
	});

	data.parameters = criteriaForm.serializeObject();
	ajaxPost(URLS.USER.QUERY, data)
	.done(function(json) {
		if ((json.data) && (json.data.length)) {
			callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
			if (table.data().any()) {
				var tableRow;
				if ((editForm) && (editForm.activeRow)) tableRow = $('tbody tr:eq({0})'.format(editForm.activeRow.index()), tableElement);
				else tableRow = $('tbody tr:first', tableElement);
				if (tableRow) tableRow.trigger('click');
			}
			toast.close();
		} 
		else {
			toast.fire({
				type: 'warning', 
				title: $.i18n.prop('operation.empty.result'),
				timer: 5 * 1000
			});
			callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
		}
	});
}

function refresh(e) {
	if (e) e.preventDefault();
	if (!criteriaForm.valid()) return false;
	
	var organizationId = $('#criteria_organization_id').val();
	if (organizationId != APPLICATION.data.activeOrganizationId) {
		APPLICATION.data.activeOrganizationId = organizationId;
	}
	saveDataCookie();
	
	if (table) table.ajax.reload(null, false);
}
