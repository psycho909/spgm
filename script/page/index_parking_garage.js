initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
}, null, ['knob', 'chartjs']);

/*
var noControlSidebar = false;
var noNotification = true;
var noReload = true;
var noThemeSwitch = true;
*/

var language;

var criteriaForm;
var criteriaValidator;

var hourConsumptionChart;

//initialPage(null, {sidebar: false});

var colors = {
	'red': '#dc3545',
	'orange': '#fd7e14',
	'blue': '#0d6efd',
	'indigo': '#6610f2',
	'purple': '#6f42c1',
	'pink': '#d63384',
	'yellow': '#ffc107',
	'green': '#198754',
	'teal': '#20c997',
	'cyan': '#0dcaf0',
	'cyan': '#0dcaf0',
	'grey': '#808080',
	'lightgrey': '#d3d3d3',
	'white': ' #ffffff'
};

var chartLabels = [];
for (var i = 0; i < 24; i++) chartLabels.push(i);

var parkingGarages;
var parkingGarageId;
var parkingGarageFloors;
var chargingStatus;
var columns;

var sharedFloor = '000';

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'index-message', 'parking_record-message', 'garage-message'],
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('index.charging.management');
			$('#title_section').text(APPLICATION.documentTitle);
			
			$('#criteria_record_time_label').text($.i18n.prop('terms.date.only'));
			
			$('.charging_summary_floor_title').text($.i18n.prop('index.charging.consumption.latest'));
			$('.charging_percentage_title').text($.i18n.prop('index.charging.summary'));
			$('.permanent_charg_point_status_title').text($.i18n.prop('index.charging.permanent.charge_point.status'));
			$('.charging_consumption_time_title').text($.i18n.prop('index.charging.time'));
			
			$('#consumption_percent_label1').text($.i18n.prop('index.charging.consumption.permanent'));
			$('#consumption_percent_label2').text($.i18n.prop('index.charging.consumption.shared'));
			$('#consumption_percent_label3').text($.i18n.prop('index.charging.consumption.device'));
			
			$('.shared_charge_point').text($.i18n.prop('index.charging.shared'));
			
			
			$('#refresh').append($.i18n.prop('operation.refresh'));
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	"use strict";
	applyLayoutOption({'showQueryResultHeader': true});

	$(document).ajaxStart(function() { Pace.restart(); });
	
	var dashedLanguage = language.replace('_', '-');
	criteriaForm = $('#criteria_form');
	
	moment.locale(dashedLanguage.toLowerCase());

	var deferred = $.Deferred();
	var deferreds = [];

	deferreds.push($.getScript(getDataTableTranslation(language)));
	
	deferreds.push(
		ajaxGet(URLS.PARKING_GARAGE.LIST_BY_COMMUNITY + APPLICATION.data.selectedCommunityId, null, (json) => parkingGarages = json),
		ajaxGet(URLS.CODE.LIST.CHARGING_STATUS, null, (json) => {
			//var element = $('.charge_point_status_legend');
			//element.empty();
			chargingStatus = json;
			if ((json) && (json.length)) {
				columns = [];
				columns.push({"data": 'floor', "title": '', 'width': 60});
				var icon;
				json.forEach((c, i) => {
					if (c.id != APPLICATION.codeHelper.chargingStatusFault.id) {
						//element.append('<span class="mx-1"><i class="fa-solid fa-square" style="color: {0};"></i>&nbsp;<span>{1}</span></span>'.format(getColor(c.id), c.description));
						if (c.id == APPLICATION.codeHelper.chargingStatusCharging.id) icon = 'fa-bolt text-success';
						else if (c.id == APPLICATION.codeHelper.chargingStatusQueuing.id) icon = 'fa-cars text-orange';
						else if (c.id == APPLICATION.codeHelper.chargingStatusNotUsed.id) icon = 'fa-circle-question text-warning';
						else if (c.id == APPLICATION.codeHelper.chargingStatusIdle.id) icon = 'fa-power-off text-info';
						columns.push({
							"data": 'status_' + c.id, 
							"title": '<i class="fas fa-lg {0}"></i><br/>'.format(icon) + '<span class="pt-1 text-light">' + c.description + '</span>', 
							'width': 80, 
							'class': 'text-center'
						});
					}
				});
			}
		})
	);

	//createDatePicker($('#criteria_record_time'), moment().format(APPLICATION.SETTING.defaultDateFormat), false, true);
	createDatePicker($('#criteria_record_time'), '2025-05-27', false, true);

	$.when.apply($, deferreds)
	.done(function() {
		
		if (parkingGarages) {
			if (!parkingGarageId) parkingGarageId = parkingGarages[0].id;
			ajaxGet(URLS.GARAGE.LIST_FLOOR_BY_PARKING_GARAGE + parkingGarageId, null, (data) => {
				var sharedFloorText = $.i18n.prop('garage.shared');
				parkingGarageFloors = data;
				if (parkingGarageFloors) {
					var floorText = $.i18n.prop('garage.floor')
					parkingGarageFloors.forEach((f) => {
						$('.floor_button_container').append('<button class="btn btn-lg btn-primary mr-3 h5" floor="{0}">{0} {1}</button>'
							.format(f, floorText));
					});
					$('.floor_button_container').append('<button class="btn btn-lg btn-primary mr-3 h5" floor="{0}">{1}</button>'
						.format(sharedFloor, sharedFloorText));
					
					$('.floor_button_container button').on('click', (e) => {
						e.preventDefault();
						var floor = $(e.target).attr('floor');
						if (floor) openPage(URLS.FLOOR_INDEX, parkingGarageId, floor);
					});
				}
				return deferred.resolve();
			});
		}
		
		addTitleOperation($('#title_operation_container'), null, {'search': true});
		
		loadChartDefaults();

		$('#refresh').on('click', refresh);
	
		return deferred.resolve();
	});

	return deferred.promise();
}

function getColor(status) {
	var color;
	if (!status) {
		color = colors.blue;
	}
	else {
		switch (status) {
			case APPLICATION.codeHelper.chargingStatusIdle.id: color = colors.blue; break;
			case APPLICATION.codeHelper.chargingStatusQueuing.id: color = colors.yellow; break;
			case APPLICATION.codeHelper.chargingStatusCharging.id: color = colors.red; break;
			case APPLICATION.codeHelper.chargingStatusNotUsed.id: color = colors.lightgrey; break;
			case APPLICATION.codeHelper.chargingStatusFault.id: color = colors.grey; break;
			default: color = colors.white;
		}
	}
	return color;
}

var pageWindow;
var pageWindowName = 'floorPage';

function openPage(url, parkingGarageId, floor) {
	if ((!parkingGarageId) || (!floor)) return;
	if (!pageWindow || pageWindow.closed) pageWindow = window.open(url + '?p={0}&f={1}'.format(parkingGarageId, floor), pageWindowName);
	else pageWindow.open(url + '?p={0}&f={1}'.format(parkingGarageId, floor), pageWindowName);
}

function refresh(e) {
	if (e) e.preventDefault();
	if (!parkingGarages) return false;
	
	var parkingGarageContainer = $('#result_area');
	
	parkingGarages.forEach((p) => {
		
		var parkingGarageElement = $('#parking_garage_template').clone().attr('id', 'parking_garage_container' + p.id);
		parkingGarageElement.removeClass('d-none');
		parkingGarageContainer.append(parkingGarageElement);
		
		if (parkingGarages.length > 1) $('.parking_garage_title', parkingGarageElement).text(p.name).removeClass('d-none');
		
		var criteria = {
			'parkingGarageId': p.id, 
			'serviceTypeId': APPLICATION.codeHelper.serviceTypeCharging.id,  
			'fromTime': $('#criteria_record_time').val() + ' 00:00:00', 
			'toTime': $('#criteria_record_time').val() + ' 23:59:59' 
		};
		
		var floorConsumptionontainer = $('.floor_consumption_container', parkingGarageElement);
		floorConsumptionontainer.empty();
		
		var table = $('.status_table', parkingGarageElement).DataTable(
			getDataTableOptions({
				'info': false, 
				'paging': false, 
				"columns": columns,
				"ordering": false,
				"serverSide": false
			})
		);

		ajaxGet(URLS.GARAGE.LIST_FLOOR_BY_PARKING_GARAGE + p.id, null, (data) => {
			var floors = [];
			floors.push({'floor': sharedFloor, 'consumption': 0});
			if ((data) && (data.length)) {
				data.forEach((f) => floors.push({'floor': f, 'consumption': 0, 'count': 0}));
			}
				
			ajaxPost(URLS.METER_RECORD.STATISTICS_BY_LATEST, criteria, (consumptions) => {
				var privateTotal = 0;
				var sharedTotal = 0;
				
				consumptions.forEach((c) => {
					var floor;
					if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) {
						floor = floors.find((f) => f.floor == c.floor);
						privateTotal += c.consumption;
					}
					else if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id) {
						floor = floors.find((f) => f.floor == sharedFloor);
						sharedTotal += c.consumption;
					}
					if (floor) {
						floor.consumption += c.consumption;
						floor.count += c.count;
					}
				});
				
				var total = privateTotal + sharedTotal;
				var template = $('#floor_consumption_template');
				
				floors.forEach((f, i) => {
					var element = template.clone().prop('id', 'floor_consumption_' + i);
					element.removeClass('d-none');
					var percentage = Math.round(f.consumption / total * 100);
					$('.knob', element).val(percentage);
					var consumptionText = '<span class="px-1 h5 {0} rounded">'.format(f.consumption > 0 ? 'bg-warning' : 'bg-light') 
						+ Math.round(f.consumption / 1000).toString() + '</span> ' + APPLICATION.systemConfig.defaultTotalizerUnit;
					
					if (f.floor == sharedFloor) consumptionText = $.i18n.prop('index.charging.shared') + ' ' + consumptionText;
					else consumptionText = f.floor + ' ' + consumptionText;

					$('.floor_consumption_label', element).html(consumptionText);
					floorConsumptionontainer.append(element);
					
					$(".knob", element).knob({
						'angleArc': 200,
						'angleOffset': -100,
						"fgColor": colors[i],
						//"skin": "tron",
						"readOnly": true,
						'width': 150,
						'height': 100,
						'format': function(v) {
							return v > 0 ? v + '%' : '-';
						}
					});
				});
			});
		});

		
		var fromTime = moment($('#criteria_record_time').val()).set({date: 1, hour: 0, minute: 0, second: 0, millisecond: 0}).format(APPLICATION.SETTING.defaultDateTimeFormat);
		var toTime = moment(fromTime).add(1, 'month').subtract(1, 'millisecond').format(APPLICATION.SETTING.defaultDateTimeFormat);
		var percentageCriteria = {
			'parkingGarageId': p.id, 
			'serviceTypeId': APPLICATION.codeHelper.serviceTypeCharging.id,  
			'fromTime': fromTime, 
			'toTime': toTime
		};

		ajaxPost(URLS.METER_RECORD.STATISTICS_BY_DATES, percentageCriteria, (consumptions) => {
			var ownershipConsumptionontainer = $('.ownership_percentage_container', parkingGarageElement);
			ownershipConsumptionontainer.empty();
			var template = $('#ownership_consumption_template');
			var privateTotal = 0;
			var sharedTotal = 0;
			var total = 0;
			
			consumptions.forEach((c) => {
				if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) privateTotal += c.consumption;
				else if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id) sharedTotal += c.consumption;
			});
			
			total = privateTotal + sharedTotal;
			
			consumptions.forEach((c, i) => {
				var element = template.clone().attr('id', 'ownership_consumption_' + i);
				element.removeClass('d-none');
				if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) {
					$('.ownership_percentage', element).text(Math.round(privateTotal / total * 100));
					$('.ownership_percentage_label', element).html(
						$.i18n.prop('index.charging.consumption.permanent') 
							+ '<span class="mx-1 px-1 h5 {0} rounded">'.format(privateTotal > 0 ? 'bg-warning' : 'bg-light') 
							+ (Math.round(privateTotal / 1000).toString()) + '</span> ' + APPLICATION.systemConfig.defaultTotalizerUnit
					);
					$('.ownership_percentage_header', element).addClass('bg-danger');
				}
				else if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id) {
					$('.ownership_percentage', element).text(Math.round(sharedTotal / total * 100));
					$('.ownership_percentage_label', element).html(
						$.i18n.prop('index.charging.consumption.shared')  
							+ '<span class="mx-1 px-1 h5 {0} rounded">'.format(sharedTotal > 0 ? 'bg-warning' : 'bg-light') 
							+ (Math.round(sharedTotal / 1000).toString()) + '</span> ' + APPLICATION.systemConfig.defaultTotalizerUnit
					);
					$('.ownership_percentage_header', element).addClass('bg-orange');
				}
				
				ownershipConsumptionontainer.append(element);
			});
		});
		
		// Status/Floor Count
		ajaxPost(URLS.GARAGE.COUNT_CHARGING_STATUS_BY_PARKING_GARAGE, criteria, (json) => {
			//console.log(json);
			if ((json) && (json.length)) {
				var floors = [];
				var sharedFloor = $.i18n.prop('index.charging.consumption.shared');
				var floor = {
					'floor': sharedFloor
				};
				chargingStatus.forEach((c) => floor['status_' + c.id] = 0);
				
				floors.push(floor);
				
				if ((json) && (json.length)) {
					json.forEach((f) => {
						floor = null;
						if (f.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) {
							floor = floors.find((r) => f.floor == r.floor);
							if (!floor) {
								floor = {'floor': f.floor};
								chargingStatus.forEach((c) => floor['status_' + c.id] = 0);
								floors.push(floor);
							}
						}
						else {
							floor = floors.find((l) => l.floor == sharedFloor);
						}
						
						if (!f.chargingStatusId) floor['status_' + APPLICATION.codeHelper.chargingStatusIdle.id] += f.count;
						else floor['status_' + f.chargingStatusId] += f.count;
					});
					table.rows.add(floors).draw(false);
				}
				
				/*
				var chargePointStatusContainer = $('.charge_point_status_container');
				chargePointStatusContainer.empty();
				var privateChargePointStatusContainer;
				var sharedChargePointStatusContainer;
				var floorTemplate = $('#charge_point_status_floor_container_template');
				var template = $('#charge_point_status_template');
				var floor = null;
				var floorContainer;
				var sharedContainer;
				json.forEach((g) => {
					var color = getColor(g.chargPointStatusId);
					var element = template.clone();
					element.removeClass('d-none');
					element.text(g.plateIdentity);
					element.css('background', color);
					if (g.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) {
						if (g.floor != floor) {
							floorContainer = floorTemplate.clone();
							$('.charge_point_status_floor_label', floorContainer).text(g.floor);
							floorContainer.removeClass('d-none');
							chargePointStatusContainer.append(floorContainer);
							privateChargePointStatusContainer = $('.private_charge_point_status_container', floorContainer);
							floor = g.floor;
						}
						privateChargePointStatusContainer.append(element);
					}
					else {
						if (!sharedContainer) {
							sharedContainer = floorTemplate.clone();
							$('.charge_point_status_floor_label', sharedContainer).text($.i18n.prop('index.charging.shared'));
							sharedContainer.removeClass('d-none');
							chargePointStatusContainer.append(sharedContainer);
							sharedChargePointStatusContainer = $('.shared_charge_point_status_container', sharedContainer);
						}
						sharedChargePointStatusContainer.append(element);
					}
				});
				*/
			}
		});
		
		var chartCriteria = {
			'parkingGarageId': p.id, 
			'serviceTypeId': APPLICATION.codeHelper.serviceTypeCharging.id,
			'ownershipId': APPLICATION.codeHelper.garageOwnershipPrivate.id,   
			'fromTime': $('#criteria_record_time').val() + ' 00:00:00', 
			'toTime': $('#criteria_record_time').val() + ' 23:59:59' 
		};
		var deferreds = [];
		var hourConsumptionChart = getLineChart($('.hour_consumption_chart', parkingGarageElement));
		
		deferreds.push(
			ajaxPost(URLS.METER_RECORD.STATISTICS_BY_HOUR, chartCriteria, (json) => {
				var data = new Array(24);
				data.fill(0);
				if ((json) && (json.length)) json.forEach((e) => data[e.hour] = roundDecimal(e.consumption / 1000, 3));
				hourConsumptionChart.data.datasets[0].data = data;
			})
		);
		
		chartCriteria.ownershipId = APPLICATION.codeHelper.garageOwnershipShared.id;
		
		deferreds.push(
			ajaxPost(URLS.METER_RECORD.STATISTICS_BY_HOUR, chartCriteria, (json) => {
				//console.log(json);
				var data = new Array(24);
				data.fill(0);
				if ((json) && (json.length)) json.forEach((e) => data[e.hour] = roundDecimal(e.consumption / 1000, 3));
				hourConsumptionChart.data.datasets[1].data = data;
			})
		);

		$.when.apply($, deferreds)
		.done(() => hourConsumptionChart.update());
		
	});
	
}

function getLineChart(element) {
	return new Chart(element.get(0).getContext("2d"), {
		type : 'line',
		data : {
			labels : chartLabels,
			datasets : [
				{
					//borderColor: 'rgba(0,0,255,0.7)',
		            borderColor: colors.red,
					borderWidth: 2,
					fill: false,
		            //backgroundColor: 'rgba(0,0,255,0.7)',
		            //pointBorderColor: 'rgba(0,0,255,0.7)',
		            backgroundColor: colors.red,
		            pointBorderColor: colors.red,
		            pointBorderWidth: 1,
					label: $.i18n.prop('index.charging.consumption.permanent'),
					data : []
				},
				{
					//borderColor: 'rgba(255,0,0,0.7)',
		            borderColor: colors.orange,
					borderWidth: 2,
					fill: false,
		            //backgroundColor: 'rgba(255,0,0,0.7)',
		            //pointBorderColor: 'rgba(255,0,0,0.7)',
		            backgroundColor: colors.orange,
		            pointBorderColor: colors.orange,
		            pointBorderWidth: 1,
					label: $.i18n.prop('index.charging.consumption.shared'),
					data : []
				}
			]
		},
		options : {
			responsive : true,
			animation : false, // for Performance
			maintainAspectRatio: false,
			title : {display : false},
	        tooltips : {
	        	mode: 'index',
	        	intersect: false
	        },
			scales : {
				xAxes : [ {
					display: true,					
					scaleLabel: {
						display : true,
						labelString : $.i18n.prop('terms.hour')
					}
				} ],
				yAxes : [{
					type : 'linear',
					position : 'left',
					scaleLabel: {
						display : true,
						labelString: APPLICATION.systemConfig.defaultTotalizerUnit
					}
				}]
			}, 
			//plugins: {
				legend: {
					position: 'bottom'
				}
			//}
		}
	});
				
}
