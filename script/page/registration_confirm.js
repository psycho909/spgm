/*
requirejs(['moment', 'sweetalert2', 'app', 'pace', 'datatables.net-responsive', 'datatables-helper', 'select2-maxheight', 'icheck', 'datetimepicker', 'form-control', 'editForm', 'jquery-validate-messages'], function(moment, swal) {
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
		if (APPLICATION.data.activeCommunityId) $('#criteria_community_id').val(APPLICATION.data.activeCommunityId).trigger('change');
	});
});
*/
initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

var language;

var form;
var editForm;

var table;
var tableElement;
var parkingCardTable;
var parkingCardTableElement;

var criteriaForm;
var validator;
var criteriaValidator;

var activeCriteriaCommunityId;
var activeCommunityId;
var activeCriteriaParkingGarageId;
var activeParkingGarageId;
var activeCriteriaGarageId;
var activeGarageId;
var activeCriteriaCustomerId;
var activeCustomerId;

var garageModal;
var garageForm;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'organization-message', 'customer-message', 'user-message', 'community-message', 'parking_garage-message', 'garage-message', 'registration-message', 'address-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('registration.confirm');
			$('#title_section').text(APPLICATION.documentTitle);

			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#criteria_organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#criteria_register_status_id_label, #register_status_id_label').text($.i18n.prop('registration.register_status'));

			$('#criteria_address_label, #address_label').text($.i18n.prop('customer.address'));
			$('#criteria_address_floor_label, #address_floor_label').text($.i18n.prop('address.floor'));
			$('#criteria_address_no_label, #address_no_label').text($.i18n.prop('address.no'));
			$('#criteria_address_room_label, #address_room_label').text($.i18n.prop('address.room'));
			$('#criteria_customer_no_label, #customer_no_label').text($.i18n.prop('customer.no'));
			
			$('#refresh').append($.i18n.prop('operation.query'));
			
			$('#form_title').text($.i18n.prop('operation.input'));
			$('#register_time_label').text($.i18n.prop('user.register_time'));
			$('#name_label').text($.i18n.prop('registration.name'));
			$('#garage_id_label').text($.i18n.prop('garage'));
			$('#license_plate_no_label').text($.i18n.prop('terms.license_plate'));
			$('#login_id_label').text($.i18n.prop('user.login.id'));
			$('#password_label').text($.i18n.prop('user.password'));
			$('#reentry_password_label').last().prepend($.i18n.prop('user.password.reentry'));
			$('#confirm_time_label').text($.i18n.prop('registration.confirm_time'));
			$('#confirm_time, #register_time').attr('placeholder', $.i18n.prop('user.datetime.format'));
			$('#email_label').text($.i18n.prop('customer.email'));
			$('#phone_no_label').text($.i18n.prop('customer.phone'));
			$('#mobile_phone_no_label').text($.i18n.prop('customer.mobile_phone'));
			$('#line_id_label').text($.i18n.prop('user.line.id'));
			$('#user_name_label').text($.i18n.prop('user'));
			$('#garage_no_label').text($.i18n.prop('garage'));

			/*
			$('button.operation[value="M"]').append($.i18n.prop('operation.confirm'));
			$('button.operation[value="J"]').append($.i18n.prop('operation.reject'));
			$('button.operation[value="K"]').append($.i18n.prop('operation.back_to_list'));
			*/
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";
	applyLayoutOption({'showQueryCriteriaCard': false, 'showQueryCriteriaHeader': false, 'showQueryResultCard': true, 'showQueryResultHeader': false});

	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	var dashedLanguage = language.replace('_', '-');

	moment.locale(dashedLanguage.toLowerCase());

	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'), {
		save: false, 
		delete: false, 
		confirm: true,
		reject: true,
		cancel: true,
		backToList: true,
	});
	
	garageModal = $('#garage_modal');
	if (garageModal) {
		garageForm =  $('#garage_form', garageModal);
		$('#garage_confirm', garageModal).append($.i18n.prop('operation.confirm'));
		$('#garage_close', garageModal).append($.i18n.prop('operation.cancel'));
		$('#content_text', garageModal).html($.i18n.prop('login.password.forget.text'));
		$('#garage_title', garageModal).append($.i18n.prop('garage'));
		$('#garage_hint', garageModal).append($.i18n.prop('registration.select_garage'));
		$('#customer_administrator_label').text($.i18n.prop('user.customer_administrator'));
		$('.icheck', garageForm).iCheck({
			checkboxClass: 'icheckbox_square-blue' 
		});
	}

	deferreds.push(
		createOrganizationSelect($('#criteria_organization_id'), null, $('#criteria_organization_id_container')), 
		createCommunitySelect($('#criteria_community_id, #community_id'), true), 
		createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'),  
		createCodeSelect2($('#criteria_register_status_id, #register_status_id'), URLS.CODE.LIST.REGISTRATION_STATUS, true, true, false)
		/*
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id, #community_id'), data, true);
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}), 
		*/
	);

	buildSelect2($('#criteria_parking_garage_id, #parking_garage_id'), null, false);
	//buildSelect2($('#criteria_customer_id, #customer_id'), null, false);
	buildSelect2($('#criteria_garage_id, #garage_id'), null, false);
	
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
			"orderClasses": false, 
			"order": [[1, "asc"]],
			"info": true,
			"scrollX": true, 
			//"scrollY": height,
			//"scrollCollapse": true, 
			"autoWidth": false,
			"columns": [
				{"data": null, "sortable": false, 'width': 30, "render": dataTableHelper.render.commonButtonRender}, 
				{"data": "registerTime", "title": $.i18n.prop('registration.register_time'), "sortable": true, "visible": true, 'width': 100},
				{"data": "name", "title": $.i18n.prop('registration.name'), "sortable": false, "visible": true, 'width': 100},
				{"data": 'registerStatus', "title": $.i18n.prop('registration.register_status'), "sortable": false, "visible": true, 'width': 60, "render": dataTableHelper.render.codeRender},
				{"data": "confirmTime", "title": $.i18n.prop('registration.confirm_time'), "sortable": true, "visible": true, 'width': 100},
				//{"data": "user", "title": $.i18n.prop('user'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender}, 
				{"data": "customer", "title": $.i18n.prop('customer'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender}, 
				{"data": 'mobilePhoneNo', "title": $.i18n.prop('customer.mobile_phone'), "sortable": false, "visible": true, 'width': 100},
				{"data": 'email', "title": $.i18n.prop('customer.email'), "sortable": false, "visible": true, 'width': 100},
				{"data": 'address', "title": $.i18n.prop('customer.address'), "sortable": false, "visible": true, 'width': 150},
				{"data": 'id', "visible": false} 
			],
			"deferLoading": 0,
			"processing": false,
			"serverSide": true,
			"stateSave": false,
			"ajax": loadTable
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": "registerTime", "title": $.i18n.prop('registration.register_time'), "sortable": true, "visible": true, 'width': 100},
					{"data": "loginId", "title": $.i18n.prop('registration.login.id'), "sortable": false, "visible": true, 'width': 100},
					{"data": "name", "title": $.i18n.prop('registration.name'), "sortable": false, "visible": true, 'width': 100},
					{"data": 'registerStatus', "title": $.i18n.prop('registration.register_status'), "sortable": false, "visible": true, 'width': 60, "class": "text-center", "render": dataTableHelper.render.codeRender},
					{"data": "confirmTime", "title": $.i18n.prop('registration.confirm_time'), "sortable": true, "visible": true, 'width': 100},
					//{"data": "user", "title": $.i18n.prop('user'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender}, 
					{"data": "customer", "title": $.i18n.prop('customer'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender}, 
					{"data": 'mobilePhoneNo', "title": $.i18n.prop('customer.mobile_phone'), "sortable": false, "visible": true, 'width': 100},
					{"data": 'email', "title": $.i18n.prop('customer.email'), "sortable": false, "visible": true, 'width': 100},
					{"data": 'address', "title": $.i18n.prop('customer.address'), "sortable": false, "visible": true, 'width': 150},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"responsive": false,
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);
	}));

	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
	
	$.when.apply($, deferreds).then(function() {
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {
					requiredid: true
				},
			}
		});
		
		validator = form.validate({
			rules: {
				confirmTime: {
					required: true
				}, 
				registerStatusId: {
					required: true
				}
			}
		});
		
		if (APPLICATION.codeHelper) $('#criteria_register_status_id').val(APPLICATION.codeHelper.registrationStatusConfirming.id).trigger('change');

		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), null, {'search': true});
		
		editForm = form.editForm({
			form: form,
			table: tableElement,
			dataTable: table,
			validator: validator,
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.REGISTRATION.SAVE,
			removeUrl: URLS.REGISTRATION.DELETE, 
			beforePopulate: function(action) {
				$('#password, #reentry_password').attr('placeholder', (action == CONSTANT.ACTION.UPDATE) ? $.i18n.prop('user.password.hint') : '');
			},
			afterPopulate: function() {
				var data = editForm.formData();
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				$('#parking_garage_id').val(data.parkingGarageId ? data.parkingGarageId : "").trigger('change');
				$('#customer_id').val(data.customerId ? data.customerId : "").trigger('change');
				//$('#garage_id').val(data.garageId ? data.garageId : "").trigger('change');
				$('#garage_no').val(data.garage ? data.garage.no : "").trigger('change');
				$('#user_name').val(data.user ? data.user.name : "").trigger('change');
			},
			confirm: function() {
				var container = $('#garages_container');
				container.empty();
				$.when(ajaxGet(URLS.GARAGE.LIST_BY_CUSTOMER + $('#customer_id').val(), null))
				.done(function(json) {
					if (json) {
						var html = "";
						for (var i = 0; i < json.length; i++) {
							html += ('<div class="pt-3"><input type="checkbox" class="icheck" name="{0}" id="{0}{1}" value="{1}"/><label class="control-label pl-1" for="{0}{1}">{2}</label></div>'.
								format('garage', json[i].id, json[i].no + '-' + i18nText(json[i], 'name', language)));
						}
						container.append(html);
						$('.icheck', container).iCheck({
							checkboxClass: 'icheckbox_square-blue' 
						});
						$('.icheck', container).iCheck('check');
					}
					garageModal.modal('show');
				});
			}
		});
		
		editForm.process(CONSTANT.ACTION.INQUIRY);
		
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
		});
		
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, $('#criteria_garage_id'));
		});

		/*		
		$('#criteria_customer_id').on('change', function(e) {
			activeCriteriaCustomerId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaCustomerId, $('#criteria_garage_id'), null);
		});

		$('#garage_close', garageForm).on('click', null, function(e) {
			garageModal.modal('hide');
		});
		*/

		$('#garage_confirm').on('click', function(e) {
			garageModal.modal('hide');
			
			var data = editForm.formData();
			data.confirmTime = moment().format(APPLICATION.SETTING.defaultDateTimeFormat);
			data.confirmUserId = APPLICATION.user.id;
			data.customerAdministrator = $('input[name="customerAdministrator"]').is(':checked');
			
			data.garages = [];
			//$('input[type="checkbox"]:checked', garageForm).each(function(i, e) {
			$('input[name="garage"]:checked', garageForm).each(function(i, e) {
				data.garages.push({"id": $(this).val()});
			});

			if (toast) toast.fire({
				type: 'info', 
				title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
			});
			
			$.when(ajaxPost(URLS.REGISTRATION.SAVE_CONFIRM, data))
			.done(function(json) {
				if (json) {
					console.log(json);
					refresh();
				}
				editForm.cancel();
			})
			.always(function() {
				if (toast) toast.close();
			});
		});

		$('#refresh').on('click', refresh);
		
		deferred.resolve();
	});

	return deferred.promise();
}

function loadTable(data, callback, settings) {
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});
	
	data.parameters = criteriaForm.serializeObject();
	
	deferreds.push(
		ajaxPost(URLS.REGISTRATION.QUERY, data) 
		.done(function(json) {
			if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
			else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
		})
	);
	
	$.when.apply($, deferreds).then(function() {
		toast.close();
	});
	
}

function refresh(e) {
	if (e) e.preventDefault();
	if (!criteriaForm.valid()) return;
	
	var organizationId = $('#criteria_organization_id').val();
	if ((organizationId) && (organizationId != APPLICATION.data.activeOrganizationId)) {
		APPLICATION.data.activeOrganizationId = organizationId;
	}
	var communityId = $('#criteria_community_id').val();
	if ((communityId) && (communityId != APPLICATION.data.activeCommunityId)) {
		APPLICATION.data.activeCommunityId = communityId;
	}
	saveDataCookie();
	
	if (table) table.ajax.reload(function() {
		if (table.data().any()) {
			$('#table tbody tr:first').trigger('click');
		}
	}, false);
}
