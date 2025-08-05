initialPage(function() {
	//if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	//if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	if (APPLICATION.data.activeParkingGarageId) $('#criteria_parking_garage_id').val(APPLICATION.data.activeParkingGarageId).trigger('change');
	refresh();
});

var language;

var form;
var validator;
var editForm;

var cardReaderTableElement;
var powerMeterTableElement;
var smartPowerMeterTableElement;

var cardReaderTable;
var powerMeterTable;
var smartPowerMeterTable;

var criteriaForm;
var criteriaValidator;

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCommunityId;
var activeParkingGarageId;

var floorText;

var parkingGarages;
var parkingGarageFloors;
var parkingGarageId;
var previousFloor;
var previousDtuId;
var activeFloor;
var activeDtuId;

var floorDtus;
var dtuContainer;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'organization-message', 'parking_garage-message', 'customer-message', 'garage-message', 'device-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('device.management');
			$('#title_section').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));
			
			//$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_device_no_label, #device_no_label').text($.i18n.prop('device.device_no'));
			//$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			
			$('#tab1').text($.i18n.prop('device.card_reader'));
			$('#tab2').text($.i18n.prop('device.power_meter'));
			$('#tab3').text($.i18n.prop('device.smart_power_meter'));

			/*
			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));
			*/
			
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
	
	floorText = $.i18n.prop('garage.floor');
	dtuContainer = $('#dtu_container');

	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));

	deferreds.push(
		ajaxGet(URLS.PARKING_GARAGE.LIST_BY_COMMUNITY + APPLICATION.data.selectedCommunityId, null, (json) => {
			parkingGarages = json;
		}),
		createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'),
		//createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')), 
	);
	
	deferreds.push(
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id, #community_id'), data, true);
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}), 
	);

	buildSelect2($('#criteria_parking_garage_id, #parking_garage_id'), null, false);
	
	// Table
	var cardReaderTableElement = $('#card_reader_table');
	var powerMeterTableElement = $('#power_meter_table');
	var smartPowerMeterTableElement = $('#smart_power_meter_table');
	
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		cardReaderTable = cardReaderTableElement.DataTable(
			getDataTableOptions({
				"columns": [
					{"data": 'no', "title": $.i18n.prop('device.no'), "sortable": true, 'width': 80},
					{"data": 'deviceNo', "title": $.i18n.prop('device.device_no'), "sortable": true, 'width': 80},
					//{"data": 'deviceStatusDescription', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
					{"data": 'connectionStatusId', "title": $.i18n.prop('device.status.connection'), "sortable": false, 'width': 60, "class": "text-center", "render": dataTableHelper.render.connectionStatusRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "class": "text-center", "render": dataTableHelper.render.commonButtonRender},
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadCardReaderTable
			})
		);
				
		powerMeterTable = powerMeterTableElement.DataTable(
			getDataTableOptions({
				"columns": [
					{"data": "garageNo", "title": $.i18n.prop('garage.no'), "sortable": true, 'width': 60},
					{"data": 'customerNo', "title": $.i18n.prop('customer.no'), "sortable": false, "visible": true, 'width': 60},
					{"data": 'powerPhase', "title": $.i18n.prop('device.power_phase'), "sortable": true, 'width': 80},
					{"data": "no", "title": $.i18n.prop('device.no'), "sortable": false, 'width': 100},
					{"data": 'stationNo', "title": $.i18n.prop('device.station_no'), "sortable": true, 'width': 80},
					{"data": "chargingStatusDescription", "title": $.i18n.prop('device.status.charging'), "sortable": false, 'width': 100},
					//{"data": 'connectionStatusDescription', "title": $.i18n.prop('status'), "sortable": false, 'width': 60},
					{"data": 'connectionStatusId', "title": $.i18n.prop('device.status.connection'), "sortable": false, 'width': 60, "class": "text-center", "render": dataTableHelper.render.connectionStatusRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "class": "text-center", "render": dataTableHelper.render.commonButtonRender},
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadPowerMeterTable
			})
		);
		
		smartPowerMeterTable = smartPowerMeterTableElement.DataTable(
			getDataTableOptions({
				"columns": [
					{"data": 'no', "title": $.i18n.prop('device.no'), "sortable": true, 'width': 80},
					{"data": 'deviceNo', "title": $.i18n.prop('device.device_no'), "sortable": true, 'width': 80},
					//{"data": 'deviceStatusDescription', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
					{"data": 'connectionStatusId', "title": $.i18n.prop('device.status.connection'), "sortable": false, 'width': 60, "class": "text-center", "render": dataTableHelper.render.connectionStatusRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "class": "text-center", "render": dataTableHelper.render.commonButtonRender},
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadSmartPowerMeterTable
			})
		);
	}));

	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
	
	$.when.apply($, deferreds).then(function() {
		
		if (parkingGarages) {
			if (!parkingGarageId) parkingGarageId = parkingGarages[0].id;
			
			ajaxGet(URLS.GARAGE.LIST_FLOOR_BY_PARKING_GARAGE + parkingGarageId, null, (data) => {
				parkingGarageFloors = data;
				if (parkingGarageFloors) {
					if (!activeFloor) activeFloor = parkingGarageFloors[0];
					parkingGarageFloors.forEach((f) => {
						$('.floor_button_container').append('<li class="nav-item mr-2"><a class="nav-link h5 {1}" href="#" floor="{0}">{0} {2}</a></li>'
							.format(f, (f == activeFloor ? "active" : ""), floorText));
					});
					/*
					$('.floor_button_container .nav-link').on('click', (e) => {
						e.preventDefault();
						$('.floor_button_container .active').removeClass('active');
						$(e.target).addClass('active');
						activeFloor = $(e.target).attr('floor');
						refresh();
					});
					*/
				}
				return deferred.resolve();
			});
		}
		
		addValidatorMethod();
		
		criteriaValidator = criteriaForm.validate({
			rules: {
				parkingGarageId: {
					requiredid: true 
				}
			}
		});
	
		addTitleOperation($('#title_operation_container'), null, {'import': true, 'export': true, 'add': true});

		/*
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), null, null);
		});
		
		$('#community_id').on('change', function(e) {
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), null, null);
		});
		*/
		
		$('.floor_button_container').on('click', '.nav-link', (e) => {
			e.preventDefault();
			$('.floor_button_container .active').removeClass('active');
			$(e.target).addClass('active');
			activeFloor = $(e.target).attr('floor');
			refresh();
		});
		
		dtuContainer.on('click', 'a.dtu_link', (e) => {
			e.preventDefault();
			selectDtu($(e.target));
			refresh();
		});

		dtuContainer.on('click', 'a.dtu_edit_link', (e) => {
			e.preventDefault();
			var element = $(e.target);
			var id = element.closest('.dtu_edit_link').attr('device_id');
			openDevicePage(URLS.CONTENT.DEVICE.CONTROLLER, CONSTANT.ACTION.UPDATE, id);
		});

		cardReaderTableElement.on('click', 'button.operation', (e) => {
			e.preventDefault();
			var element = $(e.target);
			var operation = element.attr('value');
			if (operation) {
				var data = cardReaderTable.row(element.closest('tr')).data();
				openDevicePage(URLS.CONTENT.DEVICE.CARD_READER, operation, data.id);
			}
		});

		powerMeterTableElement.on('click', 'button.operation', (e) => {
			e.preventDefault();
			var element = $(e.target);
			var operation = element.attr('value');
			if (operation) {
				var data = powerMeterTable.row(element.closest('tr')).data();
				openDevicePage(URLS.CONTENT.DEVICE.POWER_METER, operation, data.id);
			}
		});

		smartPowerMeterTableElement.on('click', 'button.operation', (e) => {
			e.preventDefault();
			var element = $(e.target);
			var operation = element.attr('value');
			if (operation) {
				var data = smartPowerMeterTable.row(element.closest('tr')).data();
				openDevicePage(URLS.CONTENT.DEVICE.SMART_POWER_METER, operation, data.id);
			}
		});

		$('#refresh').on('click', refresh);
		
		if (!parkingGarages) deferred.resolve();
	});

	return deferred.promise();
}

var devicePageWindow;
var devicePageWindowName = 'devicePage';

function openDevicePage(url, operation, id) {
	if ((!operation) || (!id)) return;
	if (!devicePageWindow || devicePageWindow.closed) devicePageWindow = window.open(url + '?a={0}&id={1}'.format(operation, id), devicePageWindowName);
	else devicePageWindow.open(url + '?a={0}&id={1}'.format(operation, id), devicePageWindowName);
}

function selectDtu(selector) {
	var link = selector.closest('a.dtu_link');
	$('.dtu_icon', dtuContainer).removeClass('text-primary');
	$('.dtu_no', dtuContainer).removeClass('bg-primary');
	$('.dtu_icon', link).addClass('text-primary');
	$('.dtu_no', link).addClass('bg-primary');
	var deviceId = link.attr('device_id');
	if (deviceId) activeDtuId = deviceId;
}

function getCriteria(deviceCategoryId, dtuId) {
	return {
		'parkingGarageId': parkingGarageId,
		'deviceCategoryId': deviceCategoryId, 
		'floor': activeFloor,
		'controllerId': dtuId, 
	};
}

function loadCardReaderTable(data, callback, settings) {
	data.parameters = getCriteria(APPLICATION.codeHelper.deviceCategoryReduceValueMachine.id, activeDtuId);
	ajaxPost(URLS.DEVICE.QUERY, data)
	.done(function(json) {
		if ((json) && (json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	});
}

function loadPowerMeterTable(data, callback, settings) {
	data.parameters = getCriteria(APPLICATION.codeHelper.deviceCategoryPowerMeter.id, activeDtuId);
	ajaxPost(URLS.DEVICE.QUERY, data)
	.done(function(json) {
		if ((json) && (json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	});
}

function loadSmartPowerMeterTable(data, callback, settings) {
	data.parameters = getCriteria(APPLICATION.codeHelper.deviceCategorySmartPowerMeter.id, activeDtuId);
	ajaxPost(URLS.DEVICE.QUERY, data)
	.done(function(json) {
		if ((json) && (json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	});
}

function loadTables() {
	cardReaderTable.ajax.reload();
	powerMeterTable.ajax.reload();
	smartPowerMeterTable.ajax.reload();
}

function refresh(e) {
	if (e) e.preventDefault();
	if (!criteriaForm.valid()) return false;

	var parkingGarageId = $('#criteria_parking_garage_id').val();
	if (parkingGarageId != APPLICATION.data.activeParkingGarageId) {
		APPLICATION.data.activeParkingGarageId = parkingGarageId;
		saveDataCookie();
	}
	
	if ((parkingGarageFloors) && (!activeFloor)) activeFloor = parkingGarageFloors[0];
	
	if (previousFloor != activeFloor) {
		dtuContainer.empty();
		previousFloor = activeFloor;
		activeDtuId = null;
		var template = $('#dtu_template');
		var critera = getCriteria(APPLICATION.codeHelper.deviceCategoryController.id);
		ajaxPost(URLS.DEVICE.LIST_BY_CRITERIA, critera, function(json) {
			floorDtus = json;
			if ((json) && (json.length)) {
				var dtuText = $.i18n.prop('device.controller');
				floorDtus.forEach((e) => {
					var element = template.clone().attr('id', 'dtu_' + e.id);
					element.removeClass('d-none');
					$('.dtu_link', element).attr('device_id', e.id);
					$('.dtu_edit_link', element).attr('device_id', e.id);
					$('.dtu_name', element).text(dtuText);
					$('.dtu_no', element).text(e.no);
					dtuContainer.append(element);
					if (!activeDtuId) {
						activeDtuId = e.id;
						selectDtu($('.dtu_no', element));
					}
				});
			}
			
			if (activeDtuId) loadTables();
		});
	}
	else {
		if (activeDtuId != previousDtuId) {
			previousDtuId = activeDtuId;
			loadTables();
		}
	}
	
}
