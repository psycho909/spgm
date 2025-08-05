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
var table;
var tableElement;

//var chargingPileTable; 
//var chargingPileTableElement;

var parkingGarages;
var parkingGarageId;

var criteriaForm;
var criteriaValidator;

var chargingForm;

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCommunityId;
var activeParkingGarageId;

var urlAction;
var urlId;

var refreshPacketInterval;
var errorCount = 0;

var requests = [];
var responses = [];

var HOLIDAY_ROWS = 30;
var MAKEUP_DAY_ROWS = 15;
var MAX_CARD_NO = 6;
var MAX_CHARGE_POINT_NO = 48;

var holidayTable;
var makeupDayTable;

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
			APPLICATION.documentTitle = $.i18n.prop('device.controller');
			$('#title_section').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));
			
			//$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_device_no_label, #device_no_label').text($.i18n.prop('device.device_no'));
			//$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			//$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			//$('#criteria_vender_id_label, #vender_id_label').text($.i18n.prop('vender'));
			
			//$('#device_category_id_label').text($.i18n.prop('device.category'));
			//$('#controller_id_label').text($.i18n.prop('device.controller.id'));
			$('#gateway_id_label').text($.i18n.prop('device.gateway'));
			$('#criteria_device_no_label, #device_no_label').text($.i18n.prop('device.device_no'));
			$('#no_label').text($.i18n.prop('device.no'));
			$('#no').prop('placeholder', $.i18n.prop('device.hint.generate'));
			$('#name_label').text($.i18n.prop('device.name'));
			//$('#brand_label').text($.i18n.prop('device.brand'));
			$('#model_no_label').text($.i18n.prop('device.model'));
			//$('#power_phase_label').text($.i18n.prop('device.power_phase'));
			//$('#power_mode_id_label').text($.i18n.prop('device.power.mode'));
			$('#floor_label').text($.i18n.prop('device.floor'));
			$('#location_label').text($.i18n.prop('device.location'));
			$('#switchboard_label').text($.i18n.prop('device.switchboard'));
			
			$('#internet_ip_label').text($.i18n.prop('device.ip.internet'));
			$('#intranet_ip_label').text($.i18n.prop('device.ip.intranet'));
			//$('#station_no_label').text($.i18n.prop('device.station_no'));
			//$('#register_time_label').text($.i18n.prop('device.register_time'));
			$('#note_label').text($.i18n.prop('device.note'));
			//$('#connection_status_label').text($.i18n.prop('device.status.connection'));
			$('#status_label').text($.i18n.prop('status'));

			$('#max_power_limit_current_label').text($.i18n.prop('device.max_power.limit'));
			$('#max_power_limit_modify_label').text($.i18n.prop('operation.update'));
			$('#max_consumer_limit_label').text($.i18n.prop('device.max_consumer.limit'));
			
			$('#tab1').append($.i18n.prop('device.tab.info'));
			$('#tab2').append($.i18n.prop('device.tab.charging'));
			$('#tab3').append($.i18n.prop('device.tab.holiday'));
			$('#tab4').append($.i18n.prop('device.tab.parking_card'));
			$('#tab5').append($.i18n.prop('device.tab.charging.record'));

			$('#max_power_unit').text($.i18n.prop('device.unit.power'));
			$('#max_consumer_unit').text($.i18n.prop('device.unit.consumer'));
			$('.device_operation_report').text($.i18n.prop('device.operation.report'));
			$('.device_operation_config').text($.i18n.prop('device.operation.config'));
			
			
			$('#chargable_balance_label').text($.i18n.prop('device.balance.chargable'));
			
			$('#charge_point_account_balance_label').text($.i18n.prop('device.charge_point.account_balance'));
			$('#charge_point_no_label').text($.i18n.prop('device.charge_point.no'));
			$('#charge_point_balance_label').text($.i18n.prop('device.balance'));
			$('#balance_hint').text($.i18n.prop('device.balance.hint'));
			$('#config_charge_point_balance').text($.i18n.prop('device.balance.update'));

			$('#stop_charging_label').text($.i18n.prop('device.charging.stop.condition'));
			$('#stop_charging_power_label').text($.i18n.prop('device.charging.stop.power'));
			$('#stop_charging_duration_label').text($.i18n.prop('device.charging.stop.duration'));
			
			$('#screen_sleep_label').text($.i18n.prop('device.screen.sleep'));
			
			$('#fixed_price_label').text($.i18n.prop('device.price.fixed.update'));
			$('#fixed_price_label').text($.i18n.prop('device.price.fixed.update'));
			$('#firmware_version_label').text($.i18n.prop('device.version.firmware'));
			$('#date_time_label').text($.i18n.prop('device.date_time'));

			$('#smart_power_meter_totalizer_label').text($.i18n.prop('device.smart_power_meter.totalizer'));
			$('#clean_history_label').text($.i18n.prop('device.history.clean'));
			$('#clean_history').text($.i18n.prop('operation.remove'));
			$('#report_power_voltage_current_label').text($.i18n.prop('device.smart_power_meter.power'));
			$('#voltage_label').text($.i18n.prop('device.voltage'));
			$('#current_label').text($.i18n.prop('device.current'));
			$('.minute').text($.i18n.prop('terms.minutes'));

			//$('#voltage_unit_label').text(APPLICATION.systemConfig.defaultVoltageUnit);
			//$('#current_unit_label').text(APPLICATION.systemConfig.defaultVoltageUnit);

			$('#holiday_header').text($.i18n.prop('device.holiday.header'));
			$('#makeup_day_header').text($.i18n.prop('device.makeup_day.header'));

			$('#card_reader_no_label').text($.i18n.prop('device.card_reader.no'));
			$('.from_to').text($.i18n.prop('device.from_to'));
			
			$('#refresh').append($.i18n.prop('operation.query'));
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";
	applyLayoutOption();

	urlAction = getUrlParam('a');
	urlId = getUrlParam('id');

	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	//var dashedLanguage = language.replace('_', '-');

	moment.locale(language);
	
	form = $('#form');
	criteriaForm = $('#criteria_form');
	chargingForm = $('#charging_form');
	
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
					{"data": "no", "title": $.i18n.prop('device.no'), "sortable": false, 'width': 100},
					{"data": 'deviceNo', "title": $.i18n.prop('device.device_no'), "sortable": true, 'width': 80},
					//{"data": 'powerPhase', "title": $.i18n.prop('device.power_phase'), "sortable": true, 'width': 80},
					//{"data": "chargingStatusDescription", "title": $.i18n.prop('device.status.charging'), "sortable": false, 'width': 100},
					{"data": 'connectionStatusId', "title": $.i18n.prop('device.status.connection'), "sortable": false, 'width': 60, "class": "text-center", "render": dataTableHelper.render.connectionStatusRender},
					//{"data": null, "title": $.i18n.prop('device.power.latest'), "sortable": false, 'width': 100, "class": "numeric", "render": dataTableHelper.render.totalizerRender},
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
	
	var chargePointNoOptions = [];
	var chargePointNo;
	for (var i = 1; i <= MAX_CHARGE_POINT_NO; i++) {
		chargePointNo = i.toString().padStart(2, "0");
		chargePointNoOptions.push({"id": chargePointNo, "text": chargePointNo});
	}
	buildSelect2($('.charge_point_no'), chargePointNoOptions, true, false, true, null);

	var cardNoOptions = [];
	var cardNo;
	for (var i = 1; i <= MAX_CARD_NO; i++) {
		cardNo = i.toString().padStart(3, "0");
		cardNoOptions.push({"id": i, "text": cardNo});
	}
	buildSelect2($('.card_reader_no'), cardNoOptions, true, false, true, null);

	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
	
	$.when.apply($, deferreds).then(function() {
		
		if (parkingGarageId) {
			createControllerSelect($('#controller_id'), true, parkingGarageId);
			createGatewaySelect($('#gateway_id'), true, parkingGarageId);
			createFloorSelect($('#floor'), false, parkingGarageId, null);
		}
		
		var tableOption = {
			"language": getDataTablesLanguage(),
			"columns": [
				{'width': '5%', "title": $.i18n.prop('terms.no')},
				{'width': '40%', "title": $.i18n.prop('terms.date.only')},
				{'width': '55%', "title": $.i18n.prop('device.holiday.description'), "class": 'pr-3'},
			],
			"responsive": true, 
			"info": false, 
			"ordering": false,
			"paging": false,
			"searching": false,
			"autoWidth": true,
			"scrollX": false,
			"scrollY": '65vh',
			"scrollCollapse": true, 
		};

		holidayTable = $('#holiday_table');
		var holidayRowTemplate = $('tbody tr:first', holidayTable);
		for (var i = 1; i < HOLIDAY_ROWS; i++) {
			var row = holidayRowTemplate.clone();
			$('td:eq(0)', row).text(i + 1);
			$('tbody', holidayTable).append(row);
		}
		holidayTable.DataTable(tableOption);
		$('tbody .date_picker', holidayTable).each((i, e) => createDatePicker($(e), null, false, false));

		makeupDayTable = $('#makeup_day_table');
		var makeupDayRowTemplate = $('tbody tr:first', makeupDayTable);
		for (var i = 1; i < MAKEUP_DAY_ROWS; i++) {
			var row = makeupDayRowTemplate.clone();
			$('td:eq(0)', row).text(i + 1);
			$('tbody', makeupDayTable).append(row);
		}
		makeupDayTable.DataTable(tableOption);
		$('tbody .date_picker', makeupDayTable).each((i, e) => createDatePicker($(e), null, false, false));
		
		$('.nav-tabs .nav-link').on('shown.bs.tab', () => {
			$('.dataTable').DataTable().responsive.recalc();
			$('.dataTable').DataTable().columns.adjust();
		});
		
		addValidatorMethod();
		
		criteriaValidator = criteriaForm.validate({
			rules: {
				parkingGarageId: {requiredid: true}
			}
		});
	
		validator = form.validate({
			/*
			onkeyup: function (element) {
				return element.id != 'no';
			}, 
			*/
			rules: {
				parkingGarageId: {requiredid: true}, 
				maxPower: {digits: true, max: 99}, 
				//deviceNo: {minlength: 2, maxlength: 30},
				floor: {required: true, maxlength: 5}, 
				status: {required: true}
			},
			/*
			messages: {
				no: {
					remote: $.i18n.prop('validation.duplicate')
				}
			}
			*/
		});
		configValidator(validator);
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: (urlId) ? 2 : 1});
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
						deviceCategoryId: APPLICATION.codeHelper.deviceCategoryController.id, 
						//powerModeId: APPLICATION.codeHelper.powerModeMax.id, 
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
					//$('#controller_id').val((data.controllerId) ? data.controllerId : "").trigger('change');
					$('#gateway_id').val((data.gatewayId) ? data.gatewayId : "").trigger('change');
					//$('#vender_id').val((data.venderId) ? data.venderId : "").trigger('change');
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
			//activeParkingGarageId = changeParkingGarage(editForm.formData(), $(this), activeParkingGarageId, $('#garage_id'));
			var id = $('#parking_garage_id').val();
			if ((id) && ((!activeParkingGarageId) || (activeParkingGarageId != id))) {
				createFloorSelect($('#floor'), false, id, null);
				activeParkingGarageId = id;
			}
		});
		
		$('#max_power_unit').html(APPLICATION.systemConfig.defaultTotalizerUnit);
		
		$('#report_date_time').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_DATE_TIME + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_fixed_price').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_FIXED_PRICE + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#config_fixed_price').on('click', (e) => {
			if (e) e.preventDefault();
			if (APPLICATION.user.loginId) {
				var data = {
						'deviceId': $('#id', form).val(), 
						'payload': {
							'fixedRate': $('#fixed_price', chargingForm).val(), 
							'remoteChangerId': APPLICATION.user.loginId.padEnd(10, '_')
						}
					};
				ajaxPost(URLS.API.CONTROLLER_FIXED_PRICE, data, 
					(json) => {requests.push(json);}, () => {errorCount++;}
				);
			}
		});
		
		$('#report_chargable_balance').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_CHARGABLE_BALANCE + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#config_chargable_balance').on('click', (e) => {
			if (e) e.preventDefault();
			var data = {'deviceId': $('#id', form).val(), 'payload': {'lowestChargableBalance': $('#chargable_balance', chargingForm).val()}};
			ajaxPost(URLS.API.CONTROLLER_CHARGABLE_BALANCE, data, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_firmware_version').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_FIRMWARE_VERSION + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_totalizer').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_TOTALIZER + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_screen_sleep').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_SCREEN_SLEEP + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#config_screen_sleep').on('click', (e) => {
			if (e) e.preventDefault();
			var data = {'deviceId': $('#id', form).val(), 'payload': {'screenSleepTime': $('#screen_sleep', chargingForm).val()}};
			ajaxPost(URLS.API.CONTROLLER_SCREEN_SLEEP, data, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_stop_charging_condition').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_STOP_CHARGING_CONDITION + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#config_stop_charging_condition').on('click', (e) => {
			if (e) e.preventDefault();
			var data = {
				'deviceId': $('#id', form).val(), 
				'payload': {
					'powerConsumption': $('#stop_charging_power', chargingForm).val(), 
					'duration': $('#stop_charging_duration', chargingForm).val()
				}
			};
			ajaxPost(URLS.API.CONTROLLER_STOP_CHARGING_CONDITION, data, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_max_power').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_MAX_POWER + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#config_max_power').on('click', (e) => {
			if (e) e.preventDefault();
			var data = {
				'deviceId': $('#id', form).val(), 
				'payload': {
					'maxPowerR': $('#max_power_r', chargingForm).val(), 
					'maxPowerS': $('#max_power_s', chargingForm).val(), 
					'maxPowerT': $('#max_power_t', chargingForm).val() 
				}
			};
			ajaxPost(URLS.API.CONTROLLER_MAX_POWER, data, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_max_consumer').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_MAX_CONSUMER + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#config_max_consumer').on('click', (e) => {
			if (e) e.preventDefault();
			var data = {
				'deviceId': $('#id', form).val(), 
				'payload': {
					'maxCarsR': $('#max_consumer_r', chargingForm).val(), 
					'maxCarsS': $('#max_consumer_s', chargingForm).val(), 
					'maxCarsT': $('#max_consumer_t', chargingForm).val() 
				}
			};
			ajaxPost(URLS.API.CONTROLLER_MAX_CONSUMER, data, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_power_voltage_current').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_POWER_VOLTAGE_CURRENT + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_charge_point_balance').on('click', (e) => {
			if (e) e.preventDefault();
			var powerMeterNo = $('#charging_form #charge_point_no').val();
			if (powerMeterNo) {
				ajaxGet(URLS.API.CONTROLLER_CHARGE_POINT_BALANCE + "/" + $('#id', form).val() + "/" + powerMeterNo, null,  
					(json) => {requests.push(json);}, () => {errorCount++;}
				);
			}
		});
		
		$('#config_charge_point_balance').on('click', (e) => {
			if (e) e.preventDefault();
			var data = {
				'deviceId': $('#id', form).val(), 
				'payload': {
					'chargePointId': $('#charge_point_no', chargingForm).val(), 
					'balance': $('#charge_point_balance', chargingForm).val(), 
					'pseudoCardId': '1123456729'
				}
			};
			ajaxPost(URLS.API.CONTROLLER_CHARGE_POINT_BALANCE, data, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_holiday').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_HOLIDAY + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#config_holiday').on('click', (e) => {
			if (e) e.preventDefault();
			var holidays = [];
			$('tbody .date_picker', holidayTable).each((i, v) => {
				if ($(v).val()) holidays.push(moment($(v).val(), APPLICATION.SETTING.defaultDateFormat).format('YYYYMMDD'));
			});
			holidays.sort();
			var data = {
				'deviceId': $('#id', form).val(), 
				'payload': {
					'holidays': holidays
				}
			};
			ajaxPost(URLS.API.CONTROLLER_HOLIDAY, data, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_makeup_day').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_MAKEUP_DAY + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#config_makeup_day').on('click', (e) => {
			if (e) e.preventDefault();
			var makeupDays = [];
			$('tbody .date_picker', makeupDayTable).each((i, v) => {
				if ($(v).val()) makeupDays.push(moment($(v).val(), APPLICATION.SETTING.defaultDateFormat).format('YYYYMMDD'));
			});
			makeupDays.sort();
			var data = {
				'deviceId': $('#id', form).val(), 
				'payload': {
					'makeUpDays': makeupDays
				}
			};
			ajaxPost(URLS.API.CONTROLLER_MAKEUP_DAY, data, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#report_card_reader_no').on('click', (e) => {
			if (e) e.preventDefault();
			ajaxGet(URLS.API.CONTROLLER_CARD_READER + "/" + $('#id', form).val(), null, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#config_card_reader_no').on('click', (e) => {
			if (e) e.preventDefault();
			var cardReaderNoFrom = $('#card_reader_no_from').val();
			var cardReaderNoTo = $('#card_reader_no_to').val();
			var cardReaderId = [];
			var cardReaderStatus = [];
			for (var i = cardReaderNoFrom; i <= MAX_CARD_NO; i++) {
				if (i <= cardReaderNoTo) {
					cardReaderId.push(i.toString().padStart(3, '0'));
					cardReaderStatus.push('1');
				}
				else {
					cardReaderId.push(' '.repeat(3));
					cardReaderStatus.push('0');
				}
			}
			var data = {
				'deviceId': $('#id', form).val(), 
				'payload': {
					'cardReaderId': cardReaderId, 
					'status': cardReaderStatus 
				}
			};
			ajaxPost(URLS.API.CONTROLLER_CARD_READER, data, 
				(json) => {requests.push(json);}, () => {errorCount++;}
			);
		});
		
		$('#refresh').on('click', refresh);
		
		loadTimer();
		
		$(window).bind("unload", function () {
			console.log('unload');
			unloadTimer();
		});
		
		deferred.resolve();
	});

	return deferred.promise();
}

function loadDateTable(table, json) {
	if (!json || !json.length) return;
	$('tbody .date_picker', table).val('');
	$('tbody .date_picker', table).each((i, e) => {
		$(e).val(i < json.length ? (json[i] == '19700101' ? '' : moment(json[i], 'YYYYMMDD').format(APPLICATION.SETTING.defaultDateFormat)) : ''); 
	});
}

function loadTable(data, callback, settings) {
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.query') + ' ' + $.i18n.prop('operation.waiting') 
	});
	
	data.parameters = criteriaForm.serializeObject();
	data.parameters.deviceCategoryId = APPLICATION.codeHelper.deviceCategoryController.id;
	
	ajaxPost(URLS.DEVICE.QUERY, data)
	.done(function(json) {
		if ((json) && (json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	})
	.always(function() {
		toast.close();
	});
}

function refreshPacket() {
	if (!requests.length || errorCount > 10) return;
	requests.forEach((r) => {
		ajaxPost(URLS.PACKET.TRANSACTION_SEQUENCE, {"transactionNo": r.transactionNo, "sequence": 2}, (packet) => {
			if (packet) {
				var payload = JSON.parse(packet.responseContent);
				switch (packet.type) {
					case EMS_CHARGABLE_BALANCE:
						$('#chargable_balance').val(payload.lowestChargableBalance);
						break;
					case EMS_FIXED_PRICE:
						$('#fixed_price').val(payload.fixedRate);
						break;
					case EMS_DATE_TIME:
						$('#date_time').val(payload.datetime);
						break;
					case EMS_FIRMWARE_VERSION:
						$('#firmware_version').val(payload.firmwareVersion);
						break;
					case EMS_TOTALIZER:
						$('#smart_power_meter_totalizer').val(payload.totalEnergy);
						break;
					case EMS_SCREEN_SLEEP:
						$('#screen_sleep').val(payload.screenSleepTime);
						break;
					case EMS_STOP_CHARGING_CONDITION:	
						$('#stop_charging_power').val(payload.powerConsumption);
						$('#stop_charging_duration').val(payload.duration);
						break;
					case EMS_MAX_POWER:	
						$('#max_power_r').val(payload.maxPowerR);
						$('#max_power_s').val(payload.maxPowerS);
						$('#max_power_t').val(payload.maxPowerT);
						break;
					case EMS_MAX_CONSUMER:	
						$('#max_consumer_r').val(payload.maxCarsR);
						$('#max_consumer_s').val(payload.maxCarsS);
						$('#max_consumer_t').val(payload.maxCarsT);
						break;
					case EMS_POWER_VOLTAGE_CURRENT:	
						$('#voltage_r').val(payload.voltageR);
						$('#voltage_s').val(payload.voltageS);
						$('#voltage_t').val(payload.voltageT);
						$('#current_r').val(payload.currentR);
						$('#current_s').val(payload.currentS);
						$('#current_t').val(payload.currentT);
						break;
					case EMS_CHARGE_POINT_BALANCE:	
						$('#charge_point_balance').val(payload.balance);
						break;
					case EMS_HOLIDAY:
						loadDateTable(holidayTable, payload.holidays);
						break;
					case EMS_MAKEUP_DAY:
						loadDateTable(makeupDayTable, payload.makeUpDays);
						break;
					case EMS_CARD_READER:
						var cardReaderIds = payload.cardReaderId;
						if (cardReaderIds.length) {
							var cardReaderNoFrom;
							var cardReaderNoTo;
							var cardReaderStatus = payload.status;
							cardReaderIds.forEach((v, i) => {
								if ((cardReaderStatus[i] == "1") || (cardReaderStatus[i] == "2")) {
									if (!cardReaderNoFrom) cardReaderNoFrom = i + 1;
									cardReaderNoTo = i + 1;
								}
							});
							$('#card_reader_no_from').val(cardReaderNoFrom).trigger('change');
							$('#card_reader_no_to').val(cardReaderNoTo).trigger('change');;
						}
						break;
				}
				
				requests.forEach((r, i) => {
					if (r.transactionNo == packet.transactionNo) {
						requests.splice(i, 1);
						return false;
					}
				});
			}
			else {
				errorCount++;
			}
		});
	});
}

function loadTimer() {
	if (!refreshPacketInterval) {
		refreshPacket();
		refreshPacketInterval = setInterval(() => {
			refreshPacket();
		}, 1 * 1000);
	}
}

function unloadTimer() {
	if (refreshPacketInterval) {
		clearInterval(refreshPacketInterval);
		refreshPacketInterval = null;
	}
}

function refresh(e) {
	if (e) e.preventDefault();
	
	if ((urlId) && (urlAction)) $('#criteria_id').val(urlId);
	else if (!criteriaForm.valid()) return false;
	
	var parkingGarageId = $('#criteria_parking_garage_id').val();
	if (parkingGarageId != APPLICATION.data.activeParkingGarageId) {
		APPLICATION.data.activeParkingGarageId = parkingGarageId;
		saveDataCookie();
	}
	
	if (table) table.ajax.reload(function() {
		if (table.data().any()) {
			$('#table tbody tr:first').trigger('click');
			
			if ((urlId) && (urlAction)) {
				urlId = null;
				$('#criteria_id').val(null);
				editForm.process(urlAction);
			}
		}
	}, false);
}

var EMS_CHARGE_POINT_STATE = 64;

var EMS_CHARGE_POINT_SCHEDULE = 65;
var EMS_CHARGE_POINT_BALANCE = 66;
var EMS_CHARGE_POINT_ACCOUNT = 67;

var EMS_MAX_POWER = 96;
var EMS_HOLIDAY = 97;
var EMS_MAKEUP_DAY = 98;
var EMS_CARD_READER = 99;
var EMS_CHARGABLE_BALANCE = 100;
var EMS_FIXED_PRICE = 101;
var EMS_DATE_TIME = 102;
var EMS_FIRMWARE_VERSION = 103;
var EMS_TIME_BASED_PRICE = 104;
var EMS_POWER_VOLTAGE_CURRENT = 105;
var EMS_TOTALIZER = 106;
var EMS_MAX_CONSUMER = 107;
var EMS_STOP_CHARGING_CONDITION = 108;
var EMS_SCREEN_SLEEP = 109;
