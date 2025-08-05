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
var form;
var validator;
var datesPicker;

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
			APPLICATION.documentTitle = i18nCombine(language, 'operation.query', 'reserve');
			loadNavigationBar();
			/*
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_park').text($.i18n.prop('breadcrumb.park'));
			$('#breadcrumb_meter_record').text(APPLICATION.documentTitle);
			*/

			$('#query_criteria_title').text(APPLICATION.documentTitle);
			$('#query_result_title').text($.i18n.prop('terms.query.result'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#dates_label').text($.i18n.prop('reserve.time'));

			$('#refresh').append($.i18n.prop('operation.refresh'));
			
			$('#table_title').text($.i18n.prop('reserve.record'));
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	"use strict";

	form = $('#criteria_form');
	var dashedLanguage = language.replace('_', '-');
	
	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	moment.locale(dashedLanguage.toLowerCase());
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);

	deferreds.push(createCodeCheckbox('#criteria_meter_record_type_container', 'criteriaMeterRecordTypeId', URLS.CODE.LIST.PARKING_SERVICE_TYPE, 'id'));

	deferreds.push(
		/*
		ajaxGetJson(URLS.COMMUNITY.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			$('#criteria_community_id').select2({
				data: data,
				maximumSelectionSize: 1,
				allowClear: true,
				closeOnSelect: true,
				theme: 'bootstrap4',
				placeholder: $.i18n.prop('operation.choose')
			}).maximizeSelect2Height();
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}), 
		
		ajaxGetJson(URLS.PARKING_GARAGE.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			$('#criteria_parking_garage_id').select2({
				data: data,
				maximumSelectionSize: 1,
				allowClear: true,
				closeOnSelect: true,
				theme: 'bootstrap4',
				placeholder: $.i18n.prop('operation.choose')
			}).maximizeSelect2Height();
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}), 
		*/
		ajaxGetJson(URLS.GARAGE.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			$('#criteria_garage_id').select2({
				data: data,
				maximumSelectionSize: 1,
				allowClear: true,
				closeOnSelect: true,
				theme: 'bootstrap4',
				placeholder: $.i18n.prop('operation.choose')
			}).maximizeSelect2Height();
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}), 
	);	

	//deferreds.push(createCustomerSelect($('#customer_id'), $('#criteria_customer_id'), $('#criteria_customer_id_container')));

	var buttonRender = function(data, type, row) {
		return '<button class="operation edit btn btn-xs btn-danger"><i class="fa-solid fa-lg fa-calendar-xmark"></i></button>&nbsp;';
	};

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = $('#table').DataTable({
			"data": null, 
			"language": getDataTablesLanguage(),
			"paging": true,
			'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength, 
			"lengthChange": true,
			"searching": false,
			"ordering": false, 
			"info": true,
			"autoWidth": false,
			"columns": [
				{"data": null, "title": "", "sortable": false, 'width': 30, "render": buttonRender},
				{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": true, 'width': 40},
				{"data": "reserveNo", "title": $.i18n.prop('reserve.no'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "reserveTime", "title": $.i18n.prop('reserve.time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "reserveServiceType.description", "title": $.i18n.prop('reserve.service.type'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "planServiceTime", "title": $.i18n.prop('reserve.service.time.plan'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "realServiceTime", "title": $.i18n.prop('reserve.service.time.real'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "reserveStatus.description", "title": $.i18n.prop('reserve.status'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
		});	
	}));
	//
	nowTimer = setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));

	$.when.apply($, deferreds)
	.done(function() {
		$('input[name="criteriaMeterRecordTypeId"]').iCheck('check');

		validator = form.validate({
			rules: {
				dates: {
					required: true
				}
			}
		});
		configValidator(validator);
		
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
	if (!$('#dates').val()) {
		return false;
	}
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
		toast.fire({
			type: 'info', 
			title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
		});
		data.parameters = criteria;
		ajaxPostJson(URLS.RESERVE.LIST, data)
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
	}
}
//
function refresh(e) {
	if (e) e.preventDefault();
	if (table) table.ajax.reload();
}
