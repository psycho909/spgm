initialPage(
	function () {
		if (APPLICATION.data.selectedCommunityId) $("#criteria_community_id").val(APPLICATION.data.selectedCommunityId).trigger("change");
		refresh();
	},
	null,
	["knob", "chartjs", "chartjs-datalabels"]
);

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
	red: "#dc3545",
	orange: "#fd7e14",
	blue: "#0d6efd",
	indigo: "#6610f2",
	purple: "#6f42c1",
	pink: "#d63384",
	yellow: "#ffc107",
	green: "#198754",
	teal: "#20c997",
	cyan: "#0dcaf0",
	cyan: "#0dcaf0",
	grey: "#808080",
	lightgrey: "#d3d3d3",
	white: "#ffffff"
};

var chartLabels = [];
for (var i = 0; i < 24; i++) chartLabels.push(i);

var parkingGarages;
var chargingStatus;
var columns;

var sharedFloor = "000";
var sharedFloorText;

var parkingGarageId;
var parkingGarageFloors;
var activeFloor;
var statusCountTotal;
function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, "index-message", "parking_record-message", "garage-message"],
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: "map",
		cache: false,
		callback: function () {
			APPLICATION.documentTitle = $.i18n.prop("index.charging.management") + "-" + $.i18n.prop("index.floor");
			$("#title_section").text(APPLICATION.documentTitle);

			$("#criteria_record_time_label").text($.i18n.prop("terms.date.only"));

			$(".charging_summary_floor_title").text($.i18n.prop("index.charging.now"));
			$(".charging_percentage_title").text($.i18n.prop("index.charging.summary"));
			$(".permanent_charg_point_status_title").text($.i18n.prop("index.charging.permanent.charge_point.status"));
			$(".charging_consumption_time_title").text($.i18n.prop("index.charging.time"));

			$("#consumption_percent_label1").text($.i18n.prop("index.charging.consumption.permanent"));
			$("#consumption_percent_label2").text($.i18n.prop("index.charging.consumption.shared"));
			$("#consumption_percent_label3").text($.i18n.prop("index.charging.consumption.device"));

			$(".shared_charge_point").text($.i18n.prop("index.charging.shared"));

			$("#refresh").append($.i18n.prop("operation.refresh"));

			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	"use strict";
	applyLayoutOption({ showQueryResultHeader: true });

	parkingGarageId = getUrlParam("p");
	activeFloor = getUrlParam("f");

	$(document).ajaxStart(function () {
		Pace.restart();
	});

	var dashedLanguage = language.replace("_", "-");
	moment.locale(dashedLanguage.toLowerCase());
	criteriaForm = $("#criteria_form");

	var deferred = $.Deferred();
	var deferreds = [];

	deferreds.push($.getScript(getDataTableTranslation(language)));

	deferreds.push(
		ajaxGet(URLS.PARKING_GARAGE.LIST_BY_COMMUNITY + APPLICATION.data.selectedCommunityId, null, (json) => {
			parkingGarages = json;
		}),
		ajaxGet(URLS.CODE.LIST.CHARGING_STATUS, null, (json) => {
			chargingStatus = json;
		})
	);

	//createDatePicker($('#criteria_record_time'), moment().format(APPLICATION.SETTING.defaultDateFormat), false, true);
	createDatePicker($("#criteria_record_time"), "2025-05-27", false, true);

	if (!language.startsWith("en")) deferreds.push($.getScript(getValidatorTranslation(language)));

	$.when.apply($, deferreds).done(function () {
		if (parkingGarages) {
			if (!parkingGarageId) parkingGarageId = parkingGarages[0].id;
			sharedFloorText = $.i18n.prop("garage.shared");

			ajaxGet(URLS.GARAGE.LIST_FLOOR_BY_PARKING_GARAGE + parkingGarageId, null, (data) => {
				parkingGarageFloors = data;
				if (parkingGarageFloors) {
					var floorText = $.i18n.prop("garage.floor");
					if (!activeFloor) activeFloor = parkingGarageFloors[0];
					parkingGarageFloors.forEach((f) => {
						$(".floor_button_container").append('<li class="nav-item mr-2"><a class="nav-link h5 {1}" floor="{0}">{0} {2}</a></li>'.format(f, f == activeFloor ? "active" : "", floorText));
					});
					$(".floor_button_container").append('<li class="nav-item mr-2"><a class="nav-link h5 {1}" floor="{0}">{2}</a></li>'.format(sharedFloor, sharedFloor == activeFloor ? "active" : "", sharedFloorText));

					$(".floor_button_container .nav-link").on("click", (e) => {
						e.preventDefault();
						$(".floor_button_container .active").removeClass("active");
						$(e.target).addClass("active");
						activeFloor = $(e.target).attr("floor");
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
				}
			}
		});
		configValidator(criteriaValidator);

		addTitleOperation($("#title_operation_container"), null, { search: true });

		loadChartDefaults();
		Chart.plugins.register(ChartDataLabels);

		$("#refresh").on("click", refresh);

		if (!parkingGarages) {
			return deferred.resolve();
		}
	});

	return deferred.promise();
}

function getColor(status) {
	var color;
	if (!status) {
		color = colors.blue;
	} else {
		switch (status) {
			case APPLICATION.codeHelper.chargingStatusIdle.id:
				color = colors.blue;
				break;
			case APPLICATION.codeHelper.chargingStatusQueuing.id:
				color = colors.yellow;
				break;
			case APPLICATION.codeHelper.chargingStatusCharging.id:
				color = colors.red;
				break;
			case APPLICATION.codeHelper.chargingStatusNotUsed.id:
				color = colors.lightgrey;
				break;
			case APPLICATION.codeHelper.chargingStatusFault.id:
				color = colors.grey;
				break;
			default:
				color = colors.white;
		}
	}
	return color;
}

function refresh(e) {
	if (e) e.preventDefault();
	if (!parkingGarages) return false;

	if (parkingGarageFloors) {
		if (!activeFloor) activeFloor = parkingGarageFloors[0];
	}

	var floorContainer = $("#floor_container");
	floorContainer.empty();

	//var sharedFloor = $.i18n.prop('index.charging.consumption.shared');

	//parkingGarages.forEach((p) => {
	//if (!parkingGarageId) parkingGarageId = parkingGarages[0].id;
	var containerElement = $("#container_template")
		.clone()
		.attr("id", "floor_container" + parkingGarageId);
	containerElement.removeClass("d-none");
	floorContainer.append(containerElement);

	//if (parkingGarages.length > 1) $('.parking_garage_title', parkingGarageElement).text(p.name).removeClass('d-none');

	var floorInfoContainer = $(".floor_info_container", containerElement);
	var floorConsumptionContainer = $(".floor_consumption_container", containerElement);
	floorInfoContainer.empty();
	floorConsumptionContainer.empty();

	$(".charge_point_status_title", containerElement).text($.i18n.prop("index.charge_point.status"));
	$(".hour_consumption_title", containerElement).text($.i18n.prop("index.charging.time"));

	var table = $(".status_table", containerElement).DataTable(
		getDataTableOptions({
			info: false,
			paging: false,
			columns: [
				{ data: "description", width: 80 },
				{ data: "count", width: 120, class: "align-middle status_count" }
			],
			ordering: false,
			serverSide: false
		})
	);

	var ownershipId;
	if (activeFloor == sharedFloor) {
		$(".floor_caption").text($.i18n.prop("terms.shared"));
		ownershipId = APPLICATION.codeHelper.garageOwnershipShared.id;
	} else {
		$(".floor_caption").text(activeFloor);
		ownershipId = APPLICATION.codeHelper.garageOwnershipPrivate.id;
	}

	//ajaxGet(URLS.GARAGE.LIST_FLOOR_BY_PARKING_GARAGE + parkingGarageId, null, (data) => {

	/*
	var criteria = {
		'parkingGarageId': parkingGarageId,
		'floor': activeFloor,
		'serviceTypeId': APPLICATION.codeHelper.serviceTypeCharging.id,
		'fromTime': $('#criteria_record_time').val() + ' 00:00:00',
		'toTime': $('#criteria_record_time').val() + ' 23:59:59'
	};
	*/

	var floors = [];
	floors.push({ floor: sharedFloor, consumption: 0 });
	if (parkingGarageFloors && parkingGarageFloors.length) {
		parkingGarageFloors.forEach((f) => floors.push({ floor: f, consumption: 0, count: 0 }));
	}

	var latestCriteria = {
		parkingGarageId: parkingGarageId,
		serviceTypeId: APPLICATION.codeHelper.serviceTypeCharging.id,
		fromTime: $("#criteria_record_time").val() + " 00:00:00",
		ownershipId: ownershipId,
		//'floor': activeFloor,
		floor: activeFloor != sharedFloor ? activeFloor : null,
		toTime: $("#criteria_record_time").val() + " 23:59:59"
	};

	ajaxPost(URLS.METER_RECORD.STATISTICS_BY_LATEST, latestCriteria, (consumptions) => {
		var privateTotal = 0;
		var sharedTotal = 0;
		var theFloor;

		consumptions.forEach((c) => {
			if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) {
				//theFloor = floors.find((f) => f.floor == c.floor);
				privateTotal += c.consumption;
			} else if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id) {
				//theFloor = floors.find((f) => f.floor == sharedFloor);
				sharedTotal += c.consumption;
			}
			//if (theFloor) theFloor.consumption += c.consumption;
		});

		var template = $("#floor_info_template");

		theFloor = floors.find((f) => f.floor == activeFloor);
		if (theFloor) {
			var total = privateTotal + sharedTotal;
			var floorTotal = ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id ? sharedTotal : privateTotal;
			var element = template.clone().prop("id", "floor_info_" + i);
			element.removeClass("d-none");
			var percentage = Math.round((floorTotal / total) * 100);
			$(".knob", element).val(percentage);
			var consumptionText = $.i18n.prop("index.charging.consumption") + " " + '<span class="px-1 h5 {0} rounded">'.format(floorTotal > 0 ? "bg-warning" : "bg-light") + formatDecimal(floorTotal / 1000, 1).toString() + "</span> " + APPLICATION.systemConfig.defaultTotalizerUnit;
			$(".floor_consumption_label", element).html(consumptionText);
			floorInfoContainer.append(element);
			// let gauge = new Gauge(document.getElementById("floor_consumption_gauge"), {
			// 	R: 100,
			// 	stroke: 14,
			// 	value: 35,
			// 	gradient: [
			// 		{ offset: "0%", color: "#84c7ac" },
			// 		{ offset: "100%", color: "#14ae67" }
			// 	]
			// });
			// $(".knob", element).knob({
			// 	angleArc: 200,
			// 	angleOffset: -100,
			// 	fgColor: colors[i],
			// 	//"skin": "tron",
			// 	readOnly: true,
			// 	width: 180,
			// 	height: 100,
			// 	format: function (v) {
			// 		return v > 0 ? v + "%" : "-";
			// 	}
			// });
		}
		//});
	});
	//});

	var statusCriteria = {
		parkingGarageId: parkingGarageId,
		ownershipId: ownershipId,
		floor: activeFloor != sharedFloor ? activeFloor : null,
		serviceTypeId: APPLICATION.codeHelper.serviceTypeCharging.id,
		fromTime: $("#criteria_record_time").val() + " 00:00:00",
		toTime: $("#criteria_record_time").val() + " 23:59:59"
	};

	ajaxPost(URLS.GARAGE.COUNT_CHARGING_STATUS_BY_PARKING_GARAGE, statusCriteria, (json) => {
		//console.log(json);
		if (json && json.length) {
			var rows = [];
			if (chargingStatus && chargingStatus.length) {
				var icon;
				chargingStatus.forEach((c, i) => {
					if (c.id != APPLICATION.codeHelper.chargingStatusFault.id) {
						//element.append('<span class="mx-1"><i class="fa-solid fa-square" style="color: {0};"></i>&nbsp;<span>{1}</span></span>'.format(getColor(c.id), c.description));
						if (c.id == APPLICATION.codeHelper.chargingStatusCharging.id) icon = "fas fa-bolt text-success";
						else if (c.id == APPLICATION.codeHelper.chargingStatusQueuing.id) icon = "fas fa-cars text-orange";
						else if (c.id == APPLICATION.codeHelper.chargingStatusNotUsed.id) icon = "fa fa-circle-question text-warning";
						else if (c.id == APPLICATION.codeHelper.chargingStatusIdle.id) icon = "fas fa-power-off text-info";
						rows.push({
							id: c.id,
							textDescription: c.description,
							description: '<i class="p-3 fa-2x {0}"></i>'.format(icon) + ' <span class="h5">' + c.description + "</span>",
							count: 0
						});
					}
				});
			}

			if (json && json.length) {
				var floors = [];
				var privateCount = 0;
				var sharedCount = 0;
				var row;
				json.forEach((f) => {
					floor = null;
					row = null;
					if (f.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) privateCount += f.count;
					else sharedCount += f.count;
					floor = floors.find((r) => f.floor == r.floor);
					if (!floor) {
						floor = { floor: f.floor };
						floors.push(floor);
					}

					if (f.chargingStatusId) row = rows.find((r) => r.id == f.chargingStatusId);
					else row = rows.find((r) => r.id == APPLICATION.codeHelper.chargingStatusIdle.id);
					if (row) row.count += f.count;

					if (!f.chargingStatusId) floor["status_" + APPLICATION.codeHelper.chargingStatusIdle.id] += f.count;
					else floor["status_" + f.chargingStatusId] += f.count;
				});

				$(".private_charge_point_count_label").text($.i18n.prop("index.charge_point.private"));
				$(".shared_charge_point_count_label").text($.i18n.prop("index.charge_point.shared"));

				$(".private_charge_point_count").text(privateCount);
				$(".shared_charge_point_count").text(sharedCount);

				var data = [];
				var labels = [];
				statusCountTotal = 0;
				rows.forEach((r) => {
					if (r.count > 0) {
						statusCountTotal += r.count;
						data.push(r.count);
						labels.push(r.textDescription);
					}
				});

				var pieChart = getPieChart($(".status_count_chart", containerElement));
				pieChart.data.datasets[0].data = data;
				pieChart.data.labels = labels;
				pieChart.update();
			}

			table.rows.add(rows).draw(false);
		}
	});

	var dailyStart = moment($("#criteria_record_time").val()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format(APPLICATION.SETTING.defaultDateTimeFormat);
	var dailyEnd = moment(dailyStart).add(1, "days").subtract(1, "millisecond").format(APPLICATION.SETTING.defaultDateTimeFormat);
	var dailyCriteria = {
		parkingGarageId: parkingGarageId,
		ownershipId: ownershipId,
		//'floor': activeFloor,
		floor: activeFloor != sharedFloor ? activeFloor : null,
		serviceTypeId: APPLICATION.codeHelper.serviceTypeCharging.id,
		fromTime: dailyStart,
		toTime: dailyEnd
	};

	var latetCriteria = dailyCriteria;

	var monthStart = moment($("#criteria_record_time").val()).set({ date: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).format(APPLICATION.SETTING.defaultDateTimeFormat);
	var monthEnd = moment(monthStart).add(1, "month").subtract(1, "millisecond").format(APPLICATION.SETTING.defaultDateTimeFormat);
	var monthlyCriteria = {
		parkingGarageId: parkingGarageId,
		ownershipId: ownershipId,
		//'floor': activeFloor,
		floor: activeFloor != sharedFloor ? activeFloor : null,
		serviceTypeId: APPLICATION.codeHelper.serviceTypeCharging.id,
		fromTime: monthStart,
		toTime: monthEnd
	};

	var template = $("#floor_consumption_template");
	var element = template.clone().attr("id", "floor_consumption");
	$(".floor_consumption_unit", element).text(APPLICATION.systemConfig.defaultTotalizerUnit);
	element.removeClass("d-none");
	floorConsumptionContainer.append(element);

	ajaxPost(URLS.METER_RECORD.STATISTICS_BY_LATEST, latetCriteria, (consumptions) => {
		var privateTotal = 0;
		var sharedTotal = 0;
		var voltage = 0;
		var power = 0;
		consumptions.forEach((c) => {
			if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) privateTotal += c.consumption;
			else if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id) sharedTotal += c.consumption;
			voltage += c.voltage;
			power += c.power;
		});
		var total = privateTotal + sharedTotal;
		$(".floor_consumption_latest_label", element).text($.i18n.prop("index.charging.consumption.latest"));
		$(".floor_consumption_latest", element).text(formatTotalizer(total / 1000, 1));

		latetCriteria.fromTime = moment(dailyStart).subtract(1, "days").format(APPLICATION.SETTING.defaultDateTimeFormat);
		latetCriteria.toTime = moment(dailyEnd).subtract(1, "days").format(APPLICATION.SETTING.defaultDateTimeFormat);

		$(".floor_voltage_guage_label", element).text($.i18n.prop("index.voltage"));
		$(".floor_power_guage_label", element).text($.i18n.prop("index.power"));
		$(".floor_consumption_guage_label", element).text($.i18n.prop("index.consumption"));
		// $(".floor_voltage_guage", element).val(voltage);
		// $(".floor_power_guage", element).val(power);

		// $(".floor_voltage_guage", element).knob({
		// 	min: 0,
		// 	max: 400,
		// 	angleArc: 200,
		// 	angleOffset: -100,
		// 	fgColor: colors.yellow,
		// 	//"skin": "tron",
		// 	readOnly: true,
		// 	width: 150,
		// 	height: 90,
		// 	format: function (v) {
		// 		return v > 0 ? v : "-";
		// 	}
		// });

		// $(".floor_power_guage", element).knob({
		// 	min: 0,
		// 	max: 1000,
		// 	angleArc: 200,
		// 	angleOffset: -100,
		// 	fgColor: colors.orange,
		// 	//"skin": "tron",
		// 	readOnly: true,
		// 	width: 150,
		// 	height: 90,
		// 	format: function (v) {
		// 		return v > 0 ? v : "-";
		// 	}
		// });

		// $(".floor_consumption_guage", element).knob({
		// 	min: 0,
		// 	max: 1000,
		// 	angleArc: 200,
		// 	angleOffset: -100,
		// 	fgColor: colors.red,
		// 	//"skin": "tron",
		// 	readOnly: true,
		// 	width: 150,
		// 	height: 90,
		// 	format: function (v) {
		// 		return v > 0 ? v : "-";
		// 	}
		// });
		// let g1 = createGauge(document.getElementById("floor_voltage_guage"), {
		// 	segments: 10,
		// 	colors: ["#0e6fb9", "#0e6fb9", "#0e6fb9", "#0e6fb9", "#f89b00", "#f89b00", "#f89b00", "#f89b00", "#ec3228", "#ec3228"],
		// 	value: 250
		// });
		// let g2 = createGauge(document.getElementById("floor_power_guage"), {
		// 	segments: 10,
		// 	colors: ["#0e6fb9", "#0e6fb9", "#0e6fb9", "#0e6fb9", "#f89b00", "#f89b00", "#f89b00", "#f89b00", "#ec3228", "#ec3228"],
		// 	value: 750
		// });
		// let g3 = createGauge(document.getElementById("floor_consumption_guage"), {
		// 	segments: 10,
		// 	colors: ["#0e6fb9", "#0e6fb9", "#0e6fb9", "#0e6fb9", "#f89b00", "#f89b00", "#f89b00", "#f89b00", "#ec3228", "#ec3228"],
		// 	value: 550
		// });
		ajaxPost(URLS.METER_RECORD.STATISTICS_BY_LATEST, latetCriteria, (consumptions) => {
			var privateTotal = 0;
			var sharedTotal = 0;
			consumptions.forEach((c) => {
				if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) privateTotal += c.consumption;
				else if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id) sharedTotal += c.consumption;
			});
			var yesterdayTotal = privateTotal + sharedTotal;
			$(".floor_latest_compare_label", element).text($.i18n.prop("index.compare.yesterday"));
			if (yesterdayTotal > 0) $(".floor_latest_compare_percentage", element).text(formatTotalizer((total / yesterdayTotal) * 100, 0));
			else $(".floor_latest_compare_percentage", element).text("-");
		});
	});

	ajaxPost(URLS.METER_RECORD.STATISTICS_BY_DATES, dailyCriteria, (consumptions) => {
		var privateTotal = 0;
		var sharedTotal = 0;
		consumptions.forEach((c) => {
			if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) privateTotal += c.consumption;
			else if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id) sharedTotal += c.consumption;
		});
		var total = privateTotal + sharedTotal;
		$(".floor_consumption_daily_label", element).text($.i18n.prop("index.charging.consumption.daily"));
		$(".floor_consumption_daily", element).text(formatTotalizer(total / 1000, 1));
		//
		dailyCriteria.fromTime = moment(dailyStart).subtract(1, "days").format(APPLICATION.SETTING.defaultDateTimeFormat);
		dailyCriteria.toTime = moment(dailyEnd).subtract(1, "days").format(APPLICATION.SETTING.defaultDateTimeFormat);
		ajaxPost(URLS.METER_RECORD.STATISTICS_BY_DATES, dailyCriteria, (consumptions) => {
			var privateTotal = 0;
			var sharedTotal = 0;
			consumptions.forEach((c) => {
				if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) privateTotal += c.consumption;
				else if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id) sharedTotal += c.consumption;
			});
			var yesterdayTotal = privateTotal + sharedTotal;
			$(".floor_daily_compare_label", element).text($.i18n.prop("index.compare.yesterday"));
			if (yesterdayTotal > 0) $(".floor_daily_compare_percentage", element).text(formatTotalizer((total / yesterdayTotal) * 100, 0));
			else $(".floor_daily_compare_percentage", element).text("-");
		});
	});

	ajaxPost(URLS.METER_RECORD.STATISTICS_BY_DATES, monthlyCriteria, (consumptions) => {
		var privateTotal = 0;
		var sharedTotal = 0;
		consumptions.forEach((c) => {
			if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) privateTotal += c.consumption;
			else if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id) sharedTotal += c.consumption;
		});
		var total = privateTotal + sharedTotal;
		$(".floor_consumption_monthly_label", element).text($.i18n.prop("index.charging.consumption.monthly"));
		$(".floor_consumption_monthly", element).text(formatTotalizer(total / 1000, 1));
		//
		monthlyCriteria.fromTime = moment(monthStart).subtract(1, "months").format(APPLICATION.SETTING.defaultDateTimeFormat);
		monthlyCriteria.toTime = moment(monthEnd).subtract(1, "months").format(APPLICATION.SETTING.defaultDateTimeFormat);
		ajaxPost(URLS.METER_RECORD.STATISTICS_BY_DATES, monthlyCriteria, (consumptions) => {
			var privateTotal = 0;
			var sharedTotal = 0;
			consumptions.forEach((c) => {
				if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipPrivate.id) privateTotal += c.consumption;
				else if (c.ownershipId == APPLICATION.codeHelper.garageOwnershipShared.id) sharedTotal += c.consumption;
			});
			var lastMonthTotal = privateTotal + sharedTotal;
			$(".floor_monthly_compare_label", element).text($.i18n.prop("index.compare.last_month"));
			if (lastMonthTotal > 0) $(".floor_monthly_compare_percentage", element).text(formatTotalizer((total / lastMonthTotal) * 100, 0));
			else $(".floor_monthly_compare_percentage", element).text("-");
		});
	});

	//
	var chartCriteria = {
		parkingGarageId: parkingGarageId,
		//'floor': activeFloor,
		floor: activeFloor != sharedFloor ? activeFloor : null,
		serviceTypeId: APPLICATION.codeHelper.serviceTypeCharging.id,
		ownershipId: APPLICATION.codeHelper.garageOwnershipPrivate.id,
		fromTime: $("#criteria_record_time").val() + " 00:00:00",
		toTime: $("#criteria_record_time").val() + " 23:59:59"
	};
	var deferreds = [];
	var hourConsumptionChart = getLineChart($(".hour_consumption_chart", containerElement));
	deferreds.push(
		ajaxPost(URLS.METER_RECORD.STATISTICS_BY_HOUR, chartCriteria, (json) => {
			var data = new Array(24);
			data.fill(0);
			if (json && json.length) json.forEach((e) => (data[e.hour] = roundDecimal(e.consumption / 1000, 3)));
			hourConsumptionChart.data.datasets[0].data = data;
		})
	);

	chartCriteria.ownershipId = APPLICATION.codeHelper.garageOwnershipShared.id;

	deferreds.push(
		ajaxPost(URLS.METER_RECORD.STATISTICS_BY_HOUR, chartCriteria, (json) => {
			//console.log(json);
			var data = new Array(24);
			data.fill(0);
			if (json && json.length) json.forEach((e) => (data[e.hour] = roundDecimal(e.consumption / 1000, 3)));
			hourConsumptionChart.data.datasets[1].data = data;
		})
	);

	$.when.apply($, deferreds).done(() => hourConsumptionChart.update());
}

function getLineChart(element) {
	return new Chart(element.get(0).getContext("2d"), {
		type: "line",
		data: {
			labels: chartLabels,
			datasets: [
				{
					borderColor: "#50e3c2",
					borderWidth: 3,
					pointRadius: 0,
					lineTension: 0,
					backgroundColor: "transparent",
					label: $.i18n.prop("index.charging.consumption.permanent"),
					data: []
				},
				{
					borderColor: "#1976d2",
					borderWidth: 3,
					pointRadius: 0,
					lineTension: 0,
					backgroundColor: "transparent",
					label: $.i18n.prop("index.charging.consumption.shared"),
					data: []
				}
			]
		},
		options: {
			responsive: true,
			animation: false, // for Performance
			maintainAspectRatio: false,
			title: { display: false },
			tooltips: {
				mode: "index",
				intersect: false
			},
			scales: {
				xAxes: [
					{
						gridLines: {
							color: "rgba(255,255,255,0.05)"
						},
						scaleLabel: {
							display: true,
							labelString: $.i18n.prop("terms.hour"),
							fontColor: "#ccc",
							fontSize: 16
						},
						ticks: {
							fontColor: "#ccc",
							fontSize: 14
						}
					}
				],
				yAxes: [
					{
						gridLines: {
							color: "rgba(255,255,255,0.08)"
						},
						scaleLabel: {
							display: true,
							labelString: APPLICATION.systemConfig.defaultTotalizerUnit,
							fontColor: "#ccc",
							fontSize: 16
						},
						ticks: {
							min: 0,
							max: 500,
							stepSize: 100,
							fontColor: "#ccc",
							fontSize: 14
						}
					}
				]
			},
			legend: {
				display: true,
				position: "bottom",
				labels: {
					fontColor: "#ccc",
					fontSize: 16,
					boxWidth: 40,
					padding: 24,
					fontStyle: "bold"
				}
			},
			plugins: {
				datalabels: {
					display: false
				}
			}
		}
	});
}

function getPieChart(element) {
	return new Chart(element.get(0).getContext("2d"), {
		type: "pie",
		options: {
			title: { display: false },
			legend: { display: false },
			responsive: true,
			plugins: {
				datalabels: {
					color: "#fff",
					font: (ctx) => {
						return {
							weight: "bold",
							size: 20
						};
					},
					formatter: (value) => {
						return statusCountTotal ? Math.round((value * 100) / statusCountTotal) + "%" : "";
					}
				}
			}
		},
		data: {
			datasets: [
				{
					backgroundColor: ["#a2d335", "#f5a623", "#888888"],
					data: [0]
				}
			]
			//labels: []
		}
	});
}

// 刻度儀錶板
function createGauge(container, opts = {}) {
	const { segments = 10, colors, radius = 120, needleLen = radius - 20, value = 0, min = 0, max = 1000 } = opts;

	const Cx = radius + 30,
		Cy = radius + 30;
	const svgNS = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(svgNS, "svg");

	/* ★ 只設 viewBox + preserveAspectRatio，寬高交給 CSS */
	svg.setAttribute("viewBox", `0 0 ${Cx * 2} ${Cy + 40}`);
	svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
	container.appendChild(svg);

	/* ------- 畫刻度 ------- */
	for (let i = 0; i < segments; i++) {
		const theta = -Math.PI + (i * Math.PI) / (segments - 1);
		const x = Cx + radius * Math.cos(theta);
		const y = Cy + radius * Math.sin(theta);
		const deg = (theta * 180) / Math.PI;
		const rect = document.createElementNS(svgNS, "rect");
		rect.setAttribute("x", -28);
		rect.setAttribute("y", -5);
		rect.setAttribute("width", 28);
		rect.setAttribute("height", 10);
		rect.setAttribute("fill", colors[i % colors.length]);
		rect.setAttribute("transform", `translate(${x} ${y}) rotate(${deg})`);
		svg.appendChild(rect);
	}

	/* ------- 指針 ------- */
	const needle = document.createElementNS(svgNS, "polygon");
	needle.setAttribute("points", `0,6 0,-6 ${needleLen},0`);
	needle.setAttribute("fill", "#ccc");
	needle.style.transition = "transform .4s ease";
	svg.appendChild(needle);

	const hub = document.createElementNS(svgNS, "circle");
	hub.setAttribute("cx", Cx);
	hub.setAttribute("cy", Cy);
	hub.setAttribute("r", 12);
	hub.setAttribute("fill", "#666");
	svg.appendChild(hub);

	const addLabel = (txt, x, y) => {
		const t = document.createElementNS(svgNS, "text");
		t.setAttribute("x", x);
		t.setAttribute("y", y);
		t.setAttribute("fill", "#bbb");
		t.setAttribute("font-size", 18);
		t.setAttribute("text-anchor", "middle");
		t.setAttribute("dominant-baseline", "middle");
		t.textContent = txt;
		svg.appendChild(t);
	};
	addLabel(min, Cx - radius - 30, Cy);
	addLabel(max, Cx + radius + 30, Cy);

	const setValue = (v) => {
		const val = Math.max(min, Math.min(max, v));
		const deg = -180 + ((val - min) * 180) / (max - min);
		needle.setAttribute("transform", `translate(${Cx} ${Cy}) rotate(${deg})`);
	};
	setValue(value);
	return { setValue };
}

// 沒刻度儀錶板
class Gauge {
	static _gid = 0;

	constructor(svg, opt = {}) {
		this.svg = svg;
		this._defaults();
		this.cfg = { ...this.def, ...opt };
		this._build();
		this._update(this.cfg.value);
	}

	setValue(v) {
		this._update(Math.max(0, Math.min(100, v)));
	}
	animateTo(v, d = 1) {
		this.tween?.kill();
		this.tween = gsap.to(
			{ p: this.cur },
			{
				p: v,
				duration: d,
				ease: "power1.inOut",
				onUpdate: () => this._update(this.tween.targets()[0].p)
			}
		);
	}
	update(opts) {
		const keep = this.cur;
		this.cfg = { ...this.cfg, ...opts };
		this.svg.innerHTML = "";
		this._build();
		this._update(keep);
	}

	_defaults() {
		this.def = {
			R: 80,
			stroke: 12,
			color: "#00d4aa",
			gradient: null,
			value: 0,
			bgExtra: 1.2,
			gap: 0.45,
			arrowScale: 0.23,
			valueDy: -0.15
		};
	}

	_build() {
		const { R, stroke, bgExtra, gradient, color, arrowScale, valueDy } = this.cfg;

		const WH = R * 2;
		this.svg.setAttribute("width", WH);
		this.svg.setAttribute("height", R + stroke);
		this.svg.setAttribute("viewBox", `0 0 ${WH} ${R + stroke}`);

		const Cx = R,
			Cy = R;
		this.Cx = Cx;
		this.Cy = Cy;

		let strokePaint = color;
		if (gradient) {
			const id = `grad_${++Gauge._gid}`;
			const defs = this._elm("defs");
			const lg = this._elm("linearGradient", { id, x1: "0%", y1: "0%", x2: "100%", y2: "0%" }, defs);
			gradient.forEach((s) => this._elm("stop", { offset: s.offset, "stop-color": s.color }, lg));
			strokePaint = `url(#${id})`;
			this.arrowColor = gradient.at(-1).color;
		} else this.arrowColor = color;

		const arc = `M 0 ${Cy} A ${R} ${R} 0 0 1 ${R * 2} ${Cy}`;

		this._path({
			d: arc,
			stroke: "#fff",
			"stroke-width": stroke * (1 + bgExtra),
			"stroke-linecap": "butt",
			fill: "none"
		});
		this.bar = this._path({
			d: arc,
			stroke: strokePaint,
			"stroke-width": stroke,
			"stroke-linecap": "butt",
			fill: "none"
		});

		this.gArrow = this._elm("g");
		const ah = R * arrowScale;
		this._elm("polygon", { points: `-${ah * 0.45},0 ${ah * 0.45},0 0,-${ah}`, fill: this.arrowColor }, this.gArrow);

		this.txt = this._elm("text", {
			x: Cx,
			y: Cy + valueDy * R,
			"font-size": R * 0.45
		});
	}

	_update(p) {
		const { R, stroke, gap } = this.cfg,
			FULL = Math.PI * R;
		this.bar.setAttribute("stroke-dasharray", `${(p / 100) * FULL} ${FULL - (p / 100) * FULL}`);
		this.txt.textContent = Math.round(p) + "%";
		const θ = Math.PI - (p / 100) * Math.PI,
			ρ = R + stroke / 2 + R * gap,
			x = this.Cx + ρ * Math.cos(θ),
			y = this.Cy - ρ * Math.sin(θ),
			deg = 270 - (θ * 180) / Math.PI;
		this.gArrow.setAttribute("transform", `translate(${x} ${y}) rotate(${deg})`);
		this.cur = p;
	}

	_elm(tag, attr = {}, parent = this.svg) {
		const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
		for (const k in attr) el.setAttribute(k, attr[k]);
		parent.appendChild(el);
		return el;
	}
	_path(a, p) {
		return this._elm("path", a, p);
	}
}

class Gauge2 {
	static _gid = 0;

	constructor(canvas, opt = {}) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this._defaults();
		this.cfg = { ...this.def, ...opt };
		this._build();
		this._update(this.cfg.value);

		// Set up animation frame
		this.animating = false;
	}

	setValue(v) {
		this._update(Math.max(0, Math.min(100, v)));
	}

	animateTo(v, d = 1) {
		this.tween?.kill();
		this.tween = gsap.to(
			{ p: this.cur },
			{
				p: v,
				duration: d,
				ease: "power1.inOut",
				onUpdate: () => {
					this._update(this.tween.targets()[0].p);
					this._render();
				}
			}
		);
	}

	update(opts) {
		const keep = this.cur;
		this.cfg = { ...this.cfg, ...opts };
		this._build();
		this._update(keep);
		this._render();
	}

	clone(targetCanvas) {
		// Create new gauge instance with same configuration
		const newGauge = new Gauge(targetCanvas, { ...this.cfg });
		newGauge.setValue(this.cur);
		return newGauge;
	}

	copyCanvasContent(targetCanvas) {
		// Direct copy of canvas pixel content
		targetCanvas.width = this.canvas.width;
		targetCanvas.height = this.canvas.height;
		const targetCtx = targetCanvas.getContext("2d");
		targetCtx.drawImage(this.canvas, 0, 0);
	}

	_defaults() {
		this.def = {
			R: 80,
			stroke: 12,
			color: "#00d4aa",
			gradient: null,
			value: 0,
			bgExtra: 1.2,
			gap: 0.35, // Reduced gap slightly
			arrowScale: 0.2, // Reduced arrow scale slightly
			valueDy: -0.15,
			bgColor: "#e0e0e0",
			textColor: "#333",
			fontFamily: "Arial, sans-serif"
		};
	}

	_build() {
		const { R, stroke, gap, arrowScale, bgExtra } = this.cfg;

		// Calculate padding needed for arrow and stroke
		const arrowHeight = R * arrowScale;
		const arrowRadius = R + stroke / 2 + R * gap + arrowHeight;
		const strokePadding = (stroke * (1 + bgExtra)) / 2;

		// Add padding to ensure nothing gets clipped
		const padding = Math.max(arrowHeight, strokePadding) + 10;

		const WH = R * 2 + padding * 2;
		const H = R + padding * 2;

		this.canvas.width = WH;
		this.canvas.height = H;

		this.Cx = WH / 2;
		this.Cy = R + padding;

		// Setup gradient if specified
		if (this.cfg.gradient) {
			const gradient = this.ctx.createLinearGradient(0, this.Cy, WH, this.Cy);
			this.cfg.gradient.forEach((stop) => {
				gradient.addColorStop(parseFloat(stop.offset.replace("%", "")) / 100, stop.color);
			});
			this.strokePaint = gradient;
			this.arrowColor = this.cfg.gradient[this.cfg.gradient.length - 1].color;
		} else {
			this.strokePaint = this.cfg.color;
			this.arrowColor = this.cfg.color;
		}
	}

	_update(p) {
		this.cur = p;
		this._render();
	}

	_render() {
		const { R, stroke, bgExtra, gap, arrowScale, valueDy, bgColor, textColor, fontFamily } = this.cfg;
		const ctx = this.ctx;

		// Clear canvas
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw background arc
		ctx.beginPath();
		ctx.arc(this.Cx, this.Cy, R, Math.PI, 2 * Math.PI, false);
		ctx.strokeStyle = bgColor;
		ctx.lineWidth = stroke * (1 + bgExtra);
		ctx.lineCap = "butt";
		ctx.stroke();

		// Draw progress arc
		const startAngle = Math.PI;
		const endAngle = Math.PI + (this.cur / 100) * Math.PI;

		ctx.beginPath();
		ctx.arc(this.Cx, this.Cy, R, startAngle, endAngle, false);

		if (this.cfg.gradient) {
			ctx.strokeStyle = this.strokePaint;
		} else {
			ctx.strokeStyle = this.cfg.color;
		}

		ctx.lineWidth = stroke;
		ctx.lineCap = "butt";
		ctx.stroke();

		// Draw arrow
		const θ = Math.PI - (this.cur / 100) * Math.PI;
		const ρ = R + stroke / 2 + R * gap;
		const x = this.Cx + ρ * Math.cos(θ);
		const y = this.Cy - ρ * Math.sin(θ);
		const deg = 270 - (θ * 180) / Math.PI;

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate((deg * Math.PI) / 180);

		const ah = R * arrowScale;
		ctx.beginPath();
		ctx.moveTo(-ah * 0.45, 0);
		ctx.lineTo(ah * 0.45, 0);
		ctx.lineTo(0, -ah);
		ctx.closePath();
		ctx.fillStyle = this.arrowColor;
		ctx.fill();

		// Add arrow outline for better visibility
		ctx.strokeStyle = this.arrowColor;
		ctx.lineWidth = 1;
		ctx.stroke();

		ctx.restore();

		// Draw text
		ctx.fillStyle = textColor;
		ctx.font = `${R * 0.45}px ${fontFamily}`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(Math.round(this.cur) + "%", this.Cx, this.Cy + valueDy * R);
	}
}
// const gauges = [];
// document.querySelectorAll(".floor_consumption_gauge").forEach((el, idx) => {
// 	const g = new Gauge(el, {
// 		R: 100,
// 		stroke: 14,
// 		value: idx === 0 ? 35 : 65,
// 		gradient: [
// 			{ offset: "0%", color: "#84c7ac" },
// 			{ offset: "100%", color: "#14ae67" }
// 		]
// 	});
// 	gauges.push(g);
// });
const gauge1 = new Gauge2(document.getElementById("floor_consumption_gauge"), {
	value: 65,
	color: "#00d4aa"
});

let g1 = createGauge(document.getElementById("floor_voltage_guage"), {
	segments: 10,
	colors: ["#0e6fb9", "#0e6fb9", "#0e6fb9", "#0e6fb9", "#f89b00", "#f89b00", "#f89b00", "#f89b00", "#ec3228", "#ec3228"],
	value: 250
});
let g2 = createGauge(document.getElementById("floor_power_guage"), {
	segments: 10,
	colors: ["#0e6fb9", "#0e6fb9", "#0e6fb9", "#0e6fb9", "#f89b00", "#f89b00", "#f89b00", "#f89b00", "#ec3228", "#ec3228"],
	value: 750
});
let g3 = createGauge(document.getElementById("floor_consumption_guage"), {
	segments: 10,
	colors: ["#0e6fb9", "#0e6fb9", "#0e6fb9", "#0e6fb9", "#f89b00", "#f89b00", "#f89b00", "#f89b00", "#ec3228", "#ec3228"],
	value: 550
});
var data = [
	[400, 300, 250, 300, 210, 180, 220, 190, 200, 210, 220, 250, 330, 340, 290, 260, 300, 320, 280, 330, 350, 310, 340, 360],
	[200, 220, 400, 300, 340, 200, 170, 150, 250, 230, 270, 300, 350, 390, 370, 350, 300, 330, 310, 400, 380, 320, 340, 300]
];
var hourConsumptionChart = getLineChart2(document.querySelector("#hour_consumption_chart"));
hourConsumptionChart.data.datasets[0].data = data[0];
hourConsumptionChart.data.datasets[1].data = data[1];
hourConsumptionChart.update();

function getLineChart2(element) {
	return new Chart(element.getContext("2d"), {
		type: "line",
		data: {
			labels: chartLabels,
			datasets: [
				{
					borderColor: "#50e3c2",
					borderWidth: 3,
					pointRadius: 0,
					lineTension: 0,
					backgroundColor: "transparent",
					label: "公共臨時充電樁",
					data: []
				},
				{
					borderColor: "#1976d2",
					borderWidth: 3,
					pointRadius: 0,
					lineTension: 0,
					backgroundColor: "transparent",
					label: "固定車位充電樁",
					data: []
				}
			]
		},
		options: {
			responsive: true,
			animation: false, // for Performance
			maintainAspectRatio: false,
			title: { display: false },
			tooltips: {
				mode: "index",
				intersect: false
			},
			scales: {
				xAxes: [
					{
						gridLines: {
							color: "rgba(255,255,255,0.05)"
						},
						scaleLabel: {
							display: true,
							labelString: "(h)",
							fontColor: "#ccc",
							fontSize: 16
						},
						ticks: {
							fontColor: "#ccc",
							fontSize: 14
						}
					}
				],
				yAxes: [
					{
						gridLines: {
							color: "rgba(255,255,255,0.08)"
						},
						scaleLabel: {
							display: true,
							labelString: "(度)",
							fontColor: "#ccc",
							fontSize: 16
						},
						ticks: {
							min: 0,
							max: 500,
							stepSize: 100,
							fontColor: "#ccc",
							fontSize: 14
						}
					}
				]
			},
			legend: {
				display: true,
				position: "bottom",
				labels: {
					fontColor: "#ccc",
					fontSize: 16,
					boxWidth: 40,
					padding: 24,
					fontStyle: "bold"
				}
			},
			plugins: {
				datalabels: {
					display: false
				}
			}
		}
	});
}

function getPieChart2(element) {
	return new Chart(element.getContext("2d"), {
		type: "pie",
		options: {
			title: { display: false },
			legend: { display: false },
			responsive: true,
			plugins: {
				datalabels: {
					color: "#fff",
					font: (ctx) => {
						return {
							weight: "bold",
							size: 20
						};
					},
					formatter: (value, ctx) => value + "%"
				}
			}
		},
		data: {
			datasets: [
				{
					backgroundColor: ["#a2d335", "#f5a623", "#888888"],
					data: [0]
				}
			]
			//labels: []
		}
	});
}

setTimeout(() => {
	var data2 = [42, 38, 20];
	var pieChart = getPieChart2(document.querySelector("#status_count_chart"));
	pieChart.data.datasets[0].data = data2;
	pieChart.update();
}, 0);
