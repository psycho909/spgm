initialPage(function() {
	//if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

var language;

var form;
var validator;
var editForm;
var table;
var tableElement;

//var chargingPileTable; 
//var chargingPileTableElement;

var parkingGarages;
var parkingGarageId;

var criteriaForm;
var criteriaValidator;

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCommunityId;
var activeParkingGarageId;

var registerTimePicker;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'organization-message', 'parking_garage-message', 'community-message', 'customer-message', 'garage-message', 'device-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('device.charge_point');
			$('#title_section').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));
			
			//$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_device_no_label, #device_no_label').text($.i18n.prop('device.device_no'));
			//$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			//$('#criteria_vender_id_label, #vender_id_label').text($.i18n.prop('vender'));
			
			//$('#device_category_id_label').text($.i18n.prop('device.category'));
			//$('#controller_id_label').text($.i18n.prop('device.controller.id'));
			$('#gateway_id_label').text($.i18n.prop('device.gateway'));
			$('#no_label').text($.i18n.prop('device.no'));
			$('#no').prop('placeholder', $.i18n.prop('device.hint.generate'));
			$('#name_label').text($.i18n.prop('device.name'));
			//$('#brand_label').text($.i18n.prop('device.brand'));
			$('#model_no_label').text($.i18n.prop('device.model'));
			//$('#power_phase_label').text($.i18n.prop('device.power_phase'));
			$('#power_mode_id_label').text($.i18n.prop('device.power.mode'));
			$('#max_power_label').text($.i18n.prop('device.max_power'));
			$('#floor_label').text($.i18n.prop('device.floor'));
			$('#location_label').text($.i18n.prop('device.location'));
			
			$('#internet_ip_label').text($.i18n.prop('device.ip.internet'));
			$('#intranet_ip_label').text($.i18n.prop('device.ip.intranet'));
			//$('#station_no_label').text($.i18n.prop('device.station_no'));
			//$('#register_time_label').text($.i18n.prop('device.register_time'));
			$('#note_label').text($.i18n.prop('device.note'));
			//$('#connection_status_label').text($.i18n.prop('device.status.connection'));
			$('#status_label').text($.i18n.prop('status'));

			$('#refresh').append($.i18n.prop('operation.query'));
			
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
	
	//var dashedLanguage = language.replace('_', '-');

	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));

	deferreds.push(
		ajaxGet(URLS.PARKING_GARAGE.LIST_BY_COMMUNITY + APPLICATION.data.selectedCommunityId, null, (json) => {
			parkingGarages = json;
			if (parkingGarages) parkingGarageId = parkingGarages[0].id;
		}),
		createParkingGarageSelect($('#criteria_parking_garage_id, #parking_garage_id'), false, APPLICATION.data.selectedCommunityId), 
		createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'),
		//createCodeRadio('#connection_status_container', 'connectionStatus', URLS.CODE.LIST.CONNECTION_STATUS, 'id'),
		createCodeRadio('#power_mode_container', 'powerModeId', URLS.CODE.LIST.POWER_MODE, 'id'),
		//createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')), 
		//createCodeSelect2($('#device_category_id'), URLS.CODE.LIST.DEVICE_CATEGORY, true, true, false), 
		//createVenderSelect($('#criteria_vender_id'), true), 
		//createVenderSelect($('#criteria_vender_id, #vender_id'), true)
	);
	
	//var registerTimePicker = createDatePicker($('#register_time'), moment(), true, true);

	//buildSelect2($('#criteria_parking_garage_id, #parking_garage_id'), null, false);
	//buildSelect2($('#garage_id'), null, false);
	
	// Table
	var tableElement = $('#table');
	//var chargingPileTableElement = $('#charging_pile_table');
	
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable(
			getDataTableOptions({
				"columns": [
					//{"data": "garageNo", "title": $.i18n.prop('garage.no'), "sortable": true, 'width': 60},
					//{"data": 'customerNo', "title": $.i18n.prop('customer.no'), "sortable": false, "visible": true, 'width': 60},
					{"data": 'floor', "title": $.i18n.prop('device.floor'), "sortable": true, 'width': 40},
					//{"data": 'controllerDeviceNo', "title": $.i18n.prop('device.controller'), "sortable": false, 'width': 80},
					//{"data": 'gatewayDeviceNo', "title": $.i18n.prop('device.gateway'), "sortable": false, 'width': 80},
					{"data": 'gatewayNo', "title": $.i18n.prop('device.gateway'), "sortable": false, 'width': 80},
					{"data": "no", "title": $.i18n.prop('device.no'), "sortable": false, 'width': 100},
					{"data": 'deviceNo', "title": $.i18n.prop('device.device_no'), "sortable": true, 'width': 80},
					//{"data": 'powerPhase', "title": $.i18n.prop('device.power_phase'), "sortable": true, 'width': 80},
					//{"data": "chargingStatusDescription", "title": $.i18n.prop('device.status.charging'), "sortable": false, 'width': 100},
					//{"data": 'connectionStatusDescription', "title": $.i18n.prop('device.status.connection'), "sortable": false, 'width': 60, "class": "text-center", "render": dataTableHelper.render.connectionStatusRender},
					{"data": 'connectionStatusId', "title": $.i18n.prop('device.status.connection'), "sortable": false, 'width': 60, "class": "text-center", "render": dataTableHelper.render.connectionStatusRender},
					{"data": null, "title": $.i18n.prop('device.power.latest'), "sortable": false, 'width': 100, "class": "numeric", "render": dataTableHelper.render.totalizerRender},
					//{"data": null, "title": $.i18n.prop('device.consumption.latest'), "sortable": false, 'width': 100, "class": "numeric", "render": dataTableHelper.render.totalizerRender},
					{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "class": "text-center", "render": dataTableHelper.render.statusRender},
					{"data": null, "title": "", "sortable": false, 'width': 40, "class": "text-center", "render": dataTableHelper.render.commonButtonRender},
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
		
		if (parkingGarageId) {
			createGatewaySelect($('#gateway_id'), true, parkingGarageId);
			createFloorSelect($('#floor'), false, parkingGarageId, null);
		}
		 
		addValidatorMethod();
		
		criteriaValidator = criteriaForm.validate({
			rules: {
				parkingGarageId: {requiredid: true}
			}
		});
	
		validator = form.validate({
			rules: {
				parkingGarageId: {requiredid: true},
				maxPower: {digits: true, max: 99}, 
				deviceNo: {minlength: 2, maxlength: 30},
				floor: {required: true, maxlength: 5}, 
				status: {required: true}
			}
		});
		configValidator(validator);
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = form.editForm({
			form: form,
			table: $('#table'),
			dataTable: table,
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.DEVICE.SAVE, 
			removeUrl: URLS.DEVICE.REMOVE,
			loadData: function(action, activeRow) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						id: 0, 
						organizationId: APPLICATION.data.selectedCommunity.organizationId, 
						communityId: APPLICATION.data.selectedCommunity.id, 
						parkingGarageId: parkingGarageId, 
						deviceCategoryId: APPLICATION.codeHelper.deviceCategoryChargePoint.id, 
						powerModeId: APPLICATION.codeHelper.powerModeMax.id, 
						status: 1
					});
				}
			}, 
			afterPopulate: function(action) {
				var data = editForm.formData();
				if (data) {
					//$('#organization_id').val((data.organizationId) ? data.organizationId : "").trigger('change');
					//$('#community_id').val((data.communityId) ? data.communityId : "").trigger('change');
					$('#parking_garage_id').val((data.parkingGarageId) ? data.parkingGarageId : "").trigger('change');
					$('#garage_id').val((data.garageId) ? data.garageId : "").trigger('change');
					//$('#controller_id').val((data.controllerId) ? data.controllerId : "").trigger('change');
					$('#gateway_id').val((data.gatewayId) ? data.gatewayId : "").trigger('change');
					//$('#vender_id').val((data.venderId) ? data.venderId : "").trigger('change');
					//$('input[name="status"]').iCheck('update');
					$('#floor').val(data.floor).trigger('change');
				}
			}
		});
		
		editForm.process(CONSTANT.ACTION.INQUIRY);
		
		/*
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), null, null);
		});
		
		$('#community_id').on('change', function(e) {
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), null, null);
		});
		*/
		
		$('#parking_garage_id').on('change', function(e) {
			activeParkingGarageId = changeParkingGarage(editForm.formData(), $(this), activeParkingGarageId, $('#garage_id'));
			var id = $('#parking_garage_id').val();
			if ((id) && ((!activeParkingGarageId) || (activeParkingGarageId != id))) {
				createFloorSelect($('#floor'), false, id, null);
				activeParkingGarageId = id;
			}
		});
		
		$('#max_power_unit').html(APPLICATION.systemConfig.defaultTotalizerUnit);
		
		$('#refresh').on('click', refresh);
		
		deferred.resolve();
	});

	return deferred.promise();
}

function loadTable(data, callback, settings) {
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.query') + ' ' + $.i18n.prop('operation.waiting') 
	});
	
	data.parameters = criteriaForm.serializeObject();
	data.parameters.deviceCategoryId = APPLICATION.codeHelper.deviceCategoryChargePoint.id;
	
	ajaxPost(URLS.DEVICE.QUERY, data)
	.done(function(json) {
		if ((json) && (json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	})
	.always(function() {
		toast.close();
	});
}

function refresh(e) {
	if (e) e.preventDefault();
	
	if (!criteriaForm.valid()) return false;
	
	/*
	var organizationId = $('#criteria_organization_id').val();
	if (organizationId != APPLICATION.data.activeOrganizationId) {
		APPLICATION.data.activeOrganizationId = organizationId;
	}
	saveDataCookie();
	*/
	
	if (table) table.ajax.reload(function() {
		if (table.data().any()) $('#table tbody tr:first').trigger('click');
	}, false);
}
