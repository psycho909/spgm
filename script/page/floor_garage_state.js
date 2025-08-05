initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
}, null, ['knob']);

var language;
var fromDate;
var toDate;
var criteriaForm;
var criteriaValidator;

var table;
var chargingStatusTtable;
var queuingStatusTtable;

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCriteriaCustomerId;
var activeCriteriaGarageId;

var datesPicker;

var parkingGarages;
var chargingStatus;
var columns;

var sharedFloor = '000';

var parkingGarageId;
var parkingGarageFloors;
var activeFloor;
var statusCountTotal;

var colors = {
	'green': '#198754',
	'orange': '#fd7e14',
	'blue': '#0d6efd',
	'yellow': '#ffc107',
	'white': '#ffffff', 
	'red': '#dc3545',
	'lightgrey': '#d3d3d3',
};

var datas;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'charging-message', 'charging_pile-message', 'customer-message', 'community-message', 'parking_garage-message', 'garage-message', 'device-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: true,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('garage.state.charging');
			$('#title_section').text(APPLICATION.documentTitle);

			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('.query_result_title').text($.i18n.prop('garage.state.charging'));
			
			$('.charging_status_title').text($.i18n.prop('garage.charging'));
			$('.queuing_status_title').text($.i18n.prop('garage.queuing'));
			
			$('#criteria_record_time_label').text($.i18n.prop('terms.date.only'));

			$('#refresh').append($.i18n.prop('operation.refresh'));
			//$('#export_spreadsheet').append($.i18n.prop('operation.export.spreadsheet'));
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";
	applyLayoutOption({'showQueryCriteriaCard': false, 'showQueryResultCard': true});

	parkingGarageId = getUrlParam('p');
	activeFloor = getUrlParam('f');

	$(document).ajaxStart(function() {Pace.restart();});
	
	criteriaForm = $('#criteria_form');
	
	var dashedLanguage = language.replace('_', '-');
	
	var deferred = $.Deferred();
	var deferreds = [];
	
	//createDatePicker($('#criteria_record_time'), moment().format(APPLICATION.SETTING.defaultDateFormat), false, true);
	createDatePicker($('#criteria_record_time'), '2025-05-27', false, true);

	//deferreds.push(createCodeCheckbox('#criteria_meter_record_type_container', 'criteriaMeterRecordTypeId', URLS.CODE.LIST.PARKING_SERVICE_TYPE, 'id'));

	deferreds.push(
		ajaxGet(URLS.PARKING_GARAGE.LIST_BY_COMMUNITY + APPLICATION.data.selectedCommunityId, null, (json) => {
			parkingGarages = json;
		}),
		ajaxGet(URLS.CODE.LIST.CHARGING_STATUS, null, (json) => {
			chargingStatus = json;
			if ((chargingStatus) && (chargingStatus.length)) {
				var icon;
				datas = [];
				chargingStatus.forEach((c, i) => {
					if (c.id != APPLICATION.codeHelper.chargingStatusFault.id) {
						//element.append('<span class="mx-1"><i class="fa-solid fa-square" style="color: {0};"></i>&nbsp;<span>{1}</span></span>'.format(getColor(c.id), c.description));
						if (c.id == APPLICATION.codeHelper.chargingStatusCharging.id) icon = 'fas fa-bolt text-success';
						else if (c.id == APPLICATION.codeHelper.chargingStatusQueuing.id) icon = 'fas fa-cars text-orange';
						else if (c.id == APPLICATION.codeHelper.chargingStatusNotUsed.id) icon = 'fa fa-circle-question text-warning';
						else if (c.id == APPLICATION.codeHelper.chargingStatusIdle.id) icon = 'fas fa-power-off text-info';
						datas.push({
							"id": c.id, 
							"icon": '<div><i class="p-3 fa-2x {0}"></i></div>'.format(icon),
							"description":  '<div><span class="status_label">' + c.description + '</span></div>', 
							'count': 0
						});
					}
				});
				
				var template = $('#status_block_template');
				datas.forEach((d) => {
					var element = template.clone().prop('id', 'status_block_' + d.id);
					element.removeClass('d-none');
					$('.status_icon', element).html(d.icon);
					$('.status_count', element).html(d.count);
					$('.status_description', element).html(d.description);
					$('.floor_info').append(element);
				});
				
			}
		})
	);

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		chargingStatusTtable = $('#charging_status_table').DataTable(
			getDataTableOptions({
				"columns": [
					//{"data": 'communityName', "sortable": false, "title": $.i18n.prop('community'), "width": 60},
					//{"data": 'parkingGarageName', "sortable": false, "title": $.i18n.prop('parking_garage'), "width": 60},
					//{"data": 'garageNo', "sortable": false, "title": $.i18n.prop('garage'), "width": 60},
					{"data": 'plateIdentity', "sortable": false, "title": $.i18n.prop('garage.plate_identity'), "width": 60, "class": "text-center"},
					{"data": 'voltage', "sortable": false, "title": $.i18n.prop('charging.voltage') + ' | <small>' + APPLICATION.systemConfig.defaultVoltageUnit + '</small>', "class": "numeric", "width": 60, "className": "max-tablet-p"},
					{"data": "power", "sortable": false, "title": $.i18n.prop('charging.power') + ' | <small>' + APPLICATION.systemConfig.defaultInstantUnit + '</small>', "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100},
					{"data": "duration", "sortable": true, "title": $.i18n.prop('charging.duration'), "width": 90},
					{"data": 'offline', "sortable": false, "title": $.i18n.prop('charging_pile.status.offline'), "width": 60}, 
					//{"data": "totalizer", "sortable": false, "title": $.i18n.prop('charging.totalizer') + ' | <small>' + APPLICATION.systemConfig.defaultTotalizerUnit + '</small>', "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100},
					//{"data": "consumption", "sortable": false, "title": $.i18n.prop('charging.consumption'), "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100},
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);
			
		queuingStatusTtable = $('#queuing_status_table').DataTable(
			getDataTableOptions({
				"columns": [
					{"data": 'queueOrder', "sortable": false, "title": $.i18n.prop('charging.queue.order'), "width": 60}, 
					{"data": 'plateIdentity', "sortable": false, "title": $.i18n.prop('garage.plate_identity'), "width": 60, "class": "text-center"},
					//{"data": "totalizer", "sortable": false, "title": $.i18n.prop('charging.totalizer') + ' | <small>' + APPLICATION.systemConfig.defaultTotalizerUnit + '</small>', "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100},
					//{"data": "consumption", "sortable": false, "title": $.i18n.prop('charging.consumption'), "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100},
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);
			
		table = $('#table').DataTable(
			getDataTableOptions({
				"columns": [
					//{"data": 'communityName', "sortable": false, "title": $.i18n.prop('community'), "width": 60},
					//{"data": 'parkingGarageName', "sortable": false, "title": $.i18n.prop('parking_garage'), "width": 60},
					//{"data": 'garageNo', "sortable": false, "title": $.i18n.prop('garage'), "width": 60},
					{"data": 'plateIdentity', "sortable": false, "title": $.i18n.prop('garage.plate_identity'), "width": 60, "class": "text-center"},
					{"data": 'customerNo', "sortable": false, "title": $.i18n.prop('customer.no'), "width": 60}, 
					{"data": 'customerName', "sortable": false, "title": $.i18n.prop('customer'), "width": 60}, 
					{"data": 'chargingStatusDescription', "sortable": false, "title": $.i18n.prop('charging.charge_status'), "width": 60, "className": "max-tablet-p"},
					{"data": 'queuingStatusDescription', "sortable": false, "title": $.i18n.prop('charging.queue.status'), "width": 60, "className": "max-tablet-p"},
					{"data": 'chargePointStatusDescription', "sortable": false, "title": $.i18n.prop('charging.charge_point.status'), "width": 60, "className": "max-tablet-p"},
					//{"data": "recordTime", "sortable": true, "title": $.i18n.prop('charging.record_time'),"render": dataTableHelper.render.dateTimeRender, "width": 90},
					//{"data": 'chargingPileNo', "sortable": false, "title": $.i18n.prop('charging_pile'), "width": 80}, 
					//{"data": 'parkingCardNo', "sortable": false, "title": $.i18n.prop('parking_card'), "width": 60},
					//{"data": "power", "sortable": false, "title": $.i18n.prop('charging.power') + ' | <small>' + APPLICATION.systemConfig.defaultInstantUnit + '</small>', "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100},
					//{"data": "totalizer", "sortable": false, "title": $.i18n.prop('charging.totalizer') + ' | <small>' + APPLICATION.systemConfig.defaultTotalizerUnit + '</small>', "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100},
					//{"data": "consumption", "sortable": false, "title": $.i18n.prop('charging.consumption'), "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100},
					//{"data": 'voltage', "sortable": false, "title": $.i18n.prop('charging.voltage') + ' | <small>' + APPLICATION.systemConfig.defaultVoltageUnit + '</small>', "class": "numeric", "width": 60, "className": "max-tablet-p"},
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);	
	}));
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));

	$.when.apply($, deferreds)
	.done(function() {
		if (parkingGarages) {
			if (!parkingGarageId) parkingGarageId = parkingGarages[0].id;
			var sharedFloorText = $.i18n.prop('garage.shared');
			
			ajaxGet(URLS.GARAGE.LIST_FLOOR_BY_PARKING_GARAGE + parkingGarageId, null, (data) => {
				parkingGarageFloors = data;
				if (parkingGarageFloors) {
					var floorText = $.i18n.prop('garage.floor')
					if (!activeFloor) activeFloor = parkingGarageFloors[0];
					parkingGarageFloors.forEach((f) => {
						$('.floor_button_container').append('<li class="nav-item mr-2"><a class="nav-link h5 {1}" href="#" floor="{0}">{0} {2}</a></li>'
							.format(f, (f == activeFloor ? "active" : ""), floorText));
					});
					$('.floor_button_container').append('<li class="nav-item mr-2"><a class="nav-link h5 {1}" href="#" floor="{0}">{2}</a></li>'
						.format(sharedFloor, (sharedFloor == activeFloor ? "active" : ""), sharedFloorText));
					
					$('.floor_button_container .nav-link').on('click', (e) => {
						e.preventDefault();
						$('.floor_button_container .active').removeClass('active');
						$(e.target).addClass('active');
						activeFloor = $(e.target).attr('floor');
						refresh();
					});
				}
				return deferred.resolve();
			});
		}
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				recordTime: {
					required: true
				},
			}
		});
		
		configValidator(criteriaValidator);
		
		addTitleOperation($('#title_operation_container'), null, {'search': true, 'export': false});
		
		$('#refresh').on('click', refresh);

		/*
		$('#export_spreadsheet').on('click', function(e) {
			e.preventDefault();
			if (!form.validate()) return false;
			downloadSpreadsheet();
		});
		
		$('#export_ods').on('click', function(e) {
			e.preventDefault();
			if (!form.validate()) return false;
			downloadOds();
		});
		*/
		
		if (!parkingGarages) {
			return deferred.resolve();
		}
	});
	//
	return deferred.promise();
}

function downloadText() {
	var criteria = getCriteria();
	var fileName = $.i18n.prop('meter_record') + '_' + (criteria.waterNo ? criteria.waterNo : criteria.meterNo) + '_' + $('#dates').val() + '.csv';
	ajaxPostDownload(URLS.RECORD.DAO.DOWNLOAD.CSV, criteria, fileName);
}

function downloadSpreadsheet() {
	var criteria = getCriteria();
	var fileName = $.i18n.prop('meter_record') + '_' + (criteria.waterNo ? criteria.waterNo : criteria.meterNo) + '_' + $('#dates').val() + '.xlsx';
	ajaxPostDownload(URLS.RECORD.DAO.DOWNLOAD.XLS_ORGANIZATION, criteria, fileName);
}

function loadTable(data, callback, settings) {
	if (!$('#dates').val()) {
		return false;
	}
	
	data.parameters = criteriaForm.serializeObject();
	data.parameters.fromTime = datesPicker.data('daterangepicker').startDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	data.parameters.toTime = datesPicker.data('daterangepicker').endDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	delete data.parameters.dates;
	
	if (Object.keys(data.parameters).length == 0) {
		swal.fire({
			text: $.i18n.prop('operation.empty.criteria'),
			type: "warning",
			showCancelButton: false,
			confirmButtonClass: "btn-danger",
			confirmButtonText: $.i18n.prop('operation.confirm')
		});
		return;
	}
	
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
	});
	ajaxPost(URLS.METER_RECORD.QUERY_CHARGING, data)
	.done(function(json) {
		if ((json) && (json.data) && (json.data.length)) {
			callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
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
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		toast.close();
	});
}

function refresh(e) {
	if (e) e.preventDefault();
	
	if (!criteriaForm.valid()) return false;
	
	var floors = [];
	floors.push({ 'floor': sharedFloor, 'consumption': 0 });
	if ((parkingGarageFloors) && (parkingGarageFloors.length)) {
		parkingGarageFloors.forEach((f) => floors.push({ 'floor': f, 'consumption': 0, 'count': 0 }));
	}

	var ownershipId;
	if (activeFloor == sharedFloor) {
		$('.floor_caption').text($.i18n.prop('terms.shared'));
		ownershipId = APPLICATION.codeHelper.garageOwnershipShared.id
	}
	else {
		$('.floor_caption').text(activeFloor);
		ownershipId = APPLICATION.codeHelper.garageOwnershipPrivate.id
	}
	
	var latestCriteria = {
		'parkingGarageId': parkingGarageId,
		'serviceTypeId': APPLICATION.codeHelper.serviceTypeCharging.id,
		'fromTime': $('#criteria_record_time').val() + ' 00:00:00',
		'ownershipId': ownershipId, 
		'floor': (activeFloor != sharedFloor ? activeFloor : null),
		'toTime': $('#criteria_record_time').val() + ' 23:59:59'
	};

	ajaxPost(URLS.METER_RECORD.STATISTICS_BY_LATEST, latestCriteria, (consumptions) => {
		var privateTotal = 0;
		var sharedTotal = 0;
		var theFloor;

		consumptions.forEach((c) => {
			if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) {
				privateTotal += c.consumption;
			}
			else if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id) {
				sharedTotal += c.consumption;
			}
		});

		theFloor = floors.find((f) => f.floor == activeFloor);
		if (theFloor) {
			var total = privateTotal + sharedTotal;
			var floorTotal = ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id ? sharedTotal : privateTotal;
			var percentage = Math.round(floorTotal / total * 100);
			$('.knob').val(percentage);

			/*			
			var consumptionText = $.i18n.prop('charging.consumption') + ' ' 
				+ '<span class="px-1 h5 {0} rounded">'.format(floorTotal > 0 ? 'bg-warning' : 'bg-light')
				+ formatDecimal(floorTotal / 1000, 1).toString() + '</span> ' + APPLICATION.systemConfig.defaultTotalizerUnit;
			$('.floor_consumption_label').html(consumptionText);
			*/
			var consumptionText = '<span class="px-1 {0} rounded">'.format(floorTotal > 0 ? 'bg-warning' : 'bg-light')
				+ formatDecimal(floorTotal / 1000, 1).toString() + '</span> ' + APPLICATION.systemConfig.defaultTotalizerUnit;
			$('.floor_consumption_label').html(consumptionText);

			$(".knob").knob({
				'angleArc': 200,
				'angleOffset': -100,
				//"fgColor": colors[i],
				//"skin": "tron",
				"readOnly": true,
				'width': 180,
				'height': 100,
				'format': function(v) {
					return v > 0 ? v + '%' : '-';
				}
			});
		}
		//});
	});
	
	var statusCriteria = {
		'parkingGarageId': parkingGarageId,
		'ownershipId': ownershipId, 
		'floor': (activeFloor != sharedFloor ? activeFloor : null),
		'serviceTypeId': APPLICATION.codeHelper.serviceTypeCharging.id,
		'fromTime': $('#criteria_record_time').val() + ' 00:00:00',
		'toTime': $('#criteria_record_time').val() + ' 23:59:59'
	};
	
	ajaxPost(URLS.GARAGE.COUNT_CHARGING_STATUS_BY_PARKING_GARAGE, statusCriteria, (json) => {
		//console.log(json);
		if ((json) && (json.length)) {
			datas.forEach((d) => d.count = 0);
			
			if ((json) && (json.length)) {
				var data;
				json.forEach((f) => {
					data = null;
					if (f.chargingStatusId) data = datas.find((r) => r.id == f.chargingStatusId);
					else data = datas.find((r) => r.id == APPLICATION.codeHelper.chargingStatusIdle.id);
					if (data) data.count += f.count;
				});
			}
			
			datas.forEach((d) => {
				var element = $('#status_block_' + d.id);
				if (element) $('.status_count', element).html(d.count);
			});
		}
	});
	
	var communityId = $('#criteria_community_id').val();
	if ((communityId) && (communityId != APPLICATION.data.activeCommunityId)) {
		APPLICATION.data.activeCommunityId = communityId;
	}
	saveDataCookie();
	
	if (table) table.ajax.reload();
}
