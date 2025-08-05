requirejs(['moment', 'sweetalert2', 'app_client', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'jquery-serialize', 'jquery-validate-messages'], function(moment, swal) {
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
var fromDate;
var toDate;
var table;
var parkingGarageReservedTable;
var form;
var validator;
var datesPicker;
var garages;
var data;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'menu-message', 'customer-message', 'community-message', 'parking_garage-message', 'garage-message', 'parking_card-message', 'reserve-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('reserve');
			loadNavigationBar();

			$('#reserving_service_link, #reserved_service_label').append($.i18n.prop('reserve.service.type'));
			$('#reserving_garage_link, #reserved_garage_label').append($.i18n.prop('garage'));
			$('#reserving_time_link, #reserved_time_label').append($.i18n.prop('terms.time.only'));
			$('#reserving_summary_link').append($.i18n.prop('reserve.summary'));

			$('#service_parking').append($.i18n.prop('reserve.service.parking'));
			$('#service_pickup').append($.i18n.prop('reserve.service.pickup'));
			$('#service_charging').append($.i18n.prop('reserve.service.charging'));

			$('#reserve_service_hint').text($.i18n.prop('reserve.service.hint'));
			$('#reserve_time_hint').text($.i18n.prop('reserve.time.hint'));
			$('#reserve_garage_hint').text($.i18n.prop('reserve.garage.hint'));
			$('#reserve_summary_hint').text($.i18n.prop('reserve.summary.hint'));

			$('#reserve_time_label').text($.i18n.prop('reserve.service.time'));

			$('#reserved_list_title').text($.i18n.prop('reserve.reserved.list'));
			$('#parking_garage_reserved_list_title').text($.i18n.prop('reserve.reserved.parking.garage.list'));

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

	form = $('#form');
	var dashedLanguage = language.replace('_', '-');
	
	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	moment.locale(dashedLanguage.toLowerCase());
	/*
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);
	*/

	deferreds.push(
		ajaxGetJson(URLS.GARAGE.LIST, null)
		.done(function(json) {
			garages = null;
			if (json) {
				for (var i = 0; i < json.length; i++) {
					$('#reserving_garage_list').append('<button type="button" class="list-group-item list-group-item-action list-group-item-light" id="service_parking">' + 
					(i+ 1) + '-' + json[i].parkingGarage.community.name + ' ' + json[i].parkingGarage.name + '-' + json[i].no + 
					'</button>');
				}
				garages = json;
			}
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}), 
	);	

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = $('#reserved_list_table').DataTable({
			"data": null, 
			"language": getDataTablesLanguage(),
			"paging": false,
			//'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			//"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": false,
			"searching": false,
			"ordering": false, 
			"info": false,
			"autoWidth": false,
			"columns": [
				{"data": "planServiceTime", "title": $.i18n.prop('reserve.service.time.plan'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "reserveServiceType.description", "title": $.i18n.prop('reserve.service.type'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "garage.parkingGarage.community.name", "title": $.i18n.prop('community'), "sortable": true, 'width': 100},
				{"data": "garage.parkingGarage.name", "title": $.i18n.prop('parking_garage'), "sortable": true, 'width': 80},
				{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": true, 'width': 40},
				//{"data": "reserveNo", "title": $.i18n.prop('reserve.no'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "reserveTime", "title": $.i18n.prop('reserve.time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
		});	
	}));
	
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		parkingGarageReservedTable = $('#parking_garage_reserved_list_table').DataTable({
			"data": null, 
			"language": getDataTablesLanguage(), 
			"paging": false,
			//'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			//"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": false,
			"searching": false,
			"ordering": false, 
			"info": false,
			"autoWidth": false,
			"columns": [
				{"data": "planServiceTime", "title": $.i18n.prop('reserve.service.time.plan'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "reserveServiceType.description", "title": $.i18n.prop('reserve.service.type'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "garage.parkingGarage.community.name", "title": $.i18n.prop('community'), "sortable": true, 'width': 100},
				{"data": "garage.parkingGarage.name", "title": $.i18n.prop('parking_garage'), "sortable": true, 'width': 80},
				{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": true, 'width': 40},
				//{"data": "reserveNo", "title": $.i18n.prop('reserve.no'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "reserveTime", "title": $.i18n.prop('reserve.time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
		});	
	}));

	nowTimer = setInterval(function() {
		$('#now_time').val(formatDate(new Date()));
	}, 1000);

	var reserveTime = moment().add(1, 'days').set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}).format(APPLICATION.SETTING.defaultDateTimeFormat);
	$('#reserve_time').daterangepicker(
		{
			startDate: reserveTime,
			endDate: reserveTime,
			timePicker: true,
			singleDatePicker: true,
			timePicker24Hour: true,
			timePickerSeconds: false,
			timePickerIncrement: 20,
			locale: {
				format: APPLICATION.SETTING.defaultDateTimeFormat,
				separator: APPLICATION.SETTING.dateRangeSeparator,
				applyLabel: $.i18n.prop('operation.confirm'),
				cancelLabel: $.i18n.prop('operation.cancel')
			}
		}
	);
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));

	$.when.apply($, deferreds)
	.done(function() {
		$('input[name="criteriaMeterRecordTypeId"]').iCheck('check');

		/*
		validator = form.validate({
			rules: {
				dates: {
					required: true
				}
			}
		});
		configValidator(validator);
		*/
		
		refresh();

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
		return deferred.resolve();
	});
	
	return deferred.promise();	
}
//
function downloadText() {
	var criteria = getCriteria();
	var fileName = $.i18n.prop('meter_record') + '_' + (criteria.waterNo ? criteria.waterNo : criteria.meterNo) + '_' + $('#dates').val() + '.csv';
	ajaxPostDownload(URLS.RECORD.DAO.DOWNLOAD.CSV, criteria, fileName);
	/*
	*/
}

function downloadSpreadsheet() {
	var criteria = getCriteria();
	var fileName = $.i18n.prop('meter_record') + '_' + (criteria.waterNo ? criteria.waterNo : criteria.meterNo) + '_' + $('#dates').val() + '.xlsx';
	ajaxPostDownload(URLS.RECORD.DAO.DOWNLOAD.XLS_ORGANIZATION, criteria, fileName);
}

function getCriteria() {
	var criteria = {};
	criteria.fromTime = datesPicker.data('daterangepicker').startDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	criteria.toTime = datesPicker.data('daterangepicker').endDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	return criteria;
}

function loadTable(data, callback, settings) {
	/*
	var criteria = getCriteria();
	if (Object.keys(criteria).length == 0) {
		swal.fire({
			text: $.i18n.prop('operation.empty.criteria'),
			type: "warning",
			showCancelButton: false,
			confirmButtonClass: "btn-danger",
			confirmButtonText: $.i18n.prop('operation.confirm')
		});
		return;
	}
	else {
	*/
		toast.fire({
			type: 'info', 
			title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
		});
		//data.parameters = criteria;
		//ajaxPostJson(URLS.RESERVE.LIST, data)
		ajaxPostJson(URLS.RESERVE.LIST, null)
		.done(function(json) {
			//if ((json) && (json.data) && (json.data.length)) {
			if ((json) && (json.length)) {
				//callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
				callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
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
	//}
}
//
function refresh(e) {
	if (e) e.preventDefault();
	if (table) table.ajax.reload();
	if (parkingGarageReservedTable) parkingGarageReservedTable.ajax.reload();
}
