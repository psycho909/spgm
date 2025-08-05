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
		if (APPLICATION.data.activeCommunityId) $('#criteria_community_id').val(APPLICATION.data.activeCommunityId).trigger('change');
	});
});
*/
initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
}, null, ['address-picker']);

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

var noFloorRooms;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'user-message', 'community-message', 'parking_garage-message', 'garage-message', 'registration-message', 'address-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('registration');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_organization_user').text($.i18n.prop('breadcrumb.organization_user'));
			$('#breadcrumb_registration').text(APPLICATION.documentTitle);

			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			//$('#criteria_organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_name_label, #name_label').text($.i18n.prop('registration.name'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			//$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			
			$('#criteria_address_label, #address_label').text($.i18n.prop('customer.address'));
			$('#criteria_address_floor_label, #address_floor_label').text($.i18n.prop('address.floor'));
			$('#criteria_address_no_label, #address_no_label').text($.i18n.prop('address.no'));
			$('#criteria_address_room_label, #address_room_label').text($.i18n.prop('address.room'));
			$('#criteria_customer_no_label, #customer_no_label').text($.i18n.prop('customer.no'));
			
			$('#refresh').append($.i18n.prop('operation.query'));
			
			$('#form_title').text($.i18n.prop('operation.input'));
			$('#register_time_label').text($.i18n.prop('user.register_time'));
			$('#login_id_label').text($.i18n.prop('user.login.id'));
			$('#password_label').text($.i18n.prop('user.password'));
			$('#reentry_password_label').last().prepend($.i18n.prop('user.password.reentry'));
			$('#confirm_time_label').text($.i18n.prop('user.review_time'));
			$('#confirm_time, #register_time').attr('placeholder', $.i18n.prop('user.datetime.format'));
			$('#address_label').text($.i18n.prop('customer.address'));
			/*
			$('#address_floor_label').text($.i18n.prop('address.floor'));
			$('#address_no_label').text($.i18n.prop('address.no'));
			$('#address_room_label').text($.i18n.prop('address.room'));
			*/
			$('#email_label').text($.i18n.prop('customer.email'));
			$('#phone_no_label').text($.i18n.prop('customer.phone'));
			$('#mobile_phone_no_label').text($.i18n.prop('customer.mobile_phone'));
			$('#license_plate_no_label').text($.i18n.prop('terms.license_plate'));
			$('#line_id_label').text($.i18n.prop('user.line.id'));
			$('#register_status_id_label').text($.i18n.prop('registration.register_status'));
			$('#user_name_label').text($.i18n.prop('registration.confirm_user'));

			/*
			$('#add').append($.i18n.prop('operation.add'));
			$('#update').append($.i18n.prop('operation.update'));
			$('#remove').append($.i18n.prop('operation.remove'));
			$('#cancel').append($.i18n.prop('operation.cancel'));
			$('#save').append($.i18n.prop('operation.save'));
			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));
			*/
			
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
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));

	deferreds.push(
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id, #community_id'), data, true);
		}), 
		ajaxGet(URLS.CUSTOMER.LIST_ADDRESS_BY_COMMUNITY + APPLICATION.data.selectedCommunityId, null)
		.done(function(json) {
			noFloorRooms = json;
		}), 
		createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'), 
		createCodeSelect2($('#register_status_id'), URLS.CODE.LIST.REGISTRATION_STATUS, false, true, false)
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
				{"data": "confirmUser", "title": $.i18n.prop('registration.confirm_user'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender}, 
				{"data": "community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender}, 
				{"data": "customer", "title": $.i18n.prop('customer'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender}, 
				{"data": "name", "title": $.i18n.prop('registration.name'), "sortable": false, "visible": true, 'width': 100},
				{"data": 'mobilePhoneNo', "title": $.i18n.prop('customer.mobile_phone'), "sortable": false, "visible": true, 'width': 100},
				{"data": 'email', "title": $.i18n.prop('customer.email'), "sortable": false, "visible": true, 'width': 100},
				{"data": 'address', "title": $.i18n.prop('customer.address'), "sortable": false, "visible": true, 'width': 150},
				{"data": 'registerStatus', "title": $.i18n.prop('registration.register_status'), "sortable": false, "visible": true, 'width': 60, "render": dataTableHelper.render.codeRender},
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
					//{"data": "community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender}, 
					//{"data": 'addressNo', "title": $.i18n.prop('address.no'), "sortable": false, 'width': 40, "class": "text-center"},
					//{"data": 'addressFloor', "title": $.i18n.prop('address.floor'), "sortable": false, 'width': 40, "class": "text-center"},
					//{"data": 'addressRoom', "title": $.i18n.prop('address.room'), "sortable": false, 'width': 40, "class": "text-center"},
					//{"data": "customer", "title": $.i18n.prop('customer'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender}, 
					{"data": "customer", "title": $.i18n.prop('customer.no'), "sortable": false, 'width': 80, "render": dataTableHelper.render.noRender},
					{"data": "customer", "title": $.i18n.prop('customer.address'), "sortable": false, 'width': 100, "render": dataTableHelper.render.addressRender},
					{"data": "name", "title": $.i18n.prop('registration.name'), "sortable": false, "visible": true, 'width': 100},
					{"data": 'mobilePhoneNo', "title": $.i18n.prop('customer.mobile_phone'), "sortable": false, "visible": true, 'width': 100},
					{"data": 'email', "title": $.i18n.prop('customer.email'), "sortable": false, "visible": true, 'width': 100},
					//{"data": 'address', "title": $.i18n.prop('customer.address'), "sortable": false, "visible": true, 'width': 150},
					{"data": 'registerStatus', "title": $.i18n.prop('registration.register_status'), "sortable": false, "visible": true, 'width': 60, "class": "text-center", "render": dataTableHelper.render.codeRender},
					{"data": "confirmUser", "title": $.i18n.prop('registration.confirm_user'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender}, 
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

	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
	
	$.when.apply($, deferreds).then(function() {
		
		$('.address_picker_container', criteriaForm).addressPicker({'data': noFloorRooms});
		$('.address_picker_container', form).addressPicker({data: noFloorRooms, autoOpen: false});
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {
					requiredid: true
				},
			}
		});
		
		addValidatorMethod();
		validator = form.validate({
			rules: {
				communityId: {
					requiredid: true
				},
				requiredid: {
					required: true
				},
				requiredid: {
					required: true
				},
				loginId: {
					required: true,
					minlength: APPLICATION.systemConfig.minLoginIdLength, 
					maxlength: APPLICATION.systemConfig.maxLoginIdLength
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
					minlength: 2, 
					maxlength: 50
				},
				address: {
					maxlength: 100
				},
				status: {
					required: true
				}
			}
		});

		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = form.editForm({
			form: form,
			table: $('#table'),
			dataTable: table,
			validator: validator,
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.REGISTRATION.SAVE,
			removeUrl: URLS.REGISTRATION.DELETE, 
			loadData: function(action, activeRow) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						'id': 0,
						'userName': APPLICATION.user.nmame, 
						'locale': APPLICATION.SETTING.defaultLocale,
						'status': 1
					});
				}
			},
			beforePopulate: function(action) {
				$('#password, #reentry_password').attr('placeholder', (action == CONSTANT.ACTION.UPDATE) ? $.i18n.prop('user.password.hint') : '');
			},
			afterPopulate: function() {
				var data = editForm.formData();
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				$('#parking_garage_id').val(data.parkingGarageId ? data.parkingGarageId : "").trigger('change');
				//$('#customer_id').val(data.customerId ? data.customerId : "").trigger('change');
				$('#customer_id').trigger('change'); // Hidden Input
				$('#garage_id').val(data.garageId ? data.garageId : "").trigger('change');
				$('#user_name').val(data.user ? data.user.name : "").trigger('change');
				
				$(':input[name="addressNo"]', form).val(data.addressNo).trigger('change');
				$(':input[name="addressFloor"]', form).val(data.addressFloor).trigger('change');
				$(':input[name="addressRoom"]', form).val(data.addressRoom).trigger('change');
			},
			beforeSave: function(saving) {
				if (saving.reentryPassword) delete saving.reentryPassword;
			}
		});
		
		editForm.process(CONSTANT.ACTION.INQUIRY);
		
		$('#criteria_community_id').on('change', function(e) {
			//activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
			if (criteriaForm.serializeObject().communityId != activeCommunityId) activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), null, null);
		});
		
		$('#criteria_parking_garage_id').on('change', function(e) {
			if (criteriaForm.serializeObject().parkingGarageId != activeParkingGarageId) activeCriteriaParkingGarageId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, $('#criteria_garage_id'));
		});

		/*
		$('#criteria_customer_id').on('change', function(e) {
			activeCriteriaCustomerId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaCustomerId, $('#criteria_garage_id'), null);
		});
		*/
		
		$('#community_id').on('change', function(e) {
			//activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), $('#customer_id'), null);
			if (editForm.formData().communityId != activeCommunityId) activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), null, null);
		});

		$('#parking_garage_id').on('change', function(e) {
			if (editForm.formData().parkingGarageId != activeParkingGarageId) activeParkingGarageId = changeParkingGarage(editForm.formData(), $(this), activeParkingGarageId, null, null);
		});

		/*
		*/
		$('#customer_id').on('change', function(e) {
			if (editForm.formData().customerId != activeCustomerId) activeCustomerId = changeCustomer(editForm.formData(), $(this), activeCustomerId, $('#garage_id'), null);
			//activeCustomerId = changeCustomer(editForm.formData(), $(this), activeCustomerId, $('#garage_id'), null);
		});
		
		$('#refresh').on('click', refresh);

		deferred.resolve();
	});

	return deferred.promise();
}
//
function loadTable(data, callback, settings) {
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});
	
	data.parameters = $('#criteria_form').serializeObject();
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
	if (!criteriaForm.valid()) return false;
	
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
