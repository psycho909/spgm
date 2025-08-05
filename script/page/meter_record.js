requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'jquery-serialize', 'editForm', 'jquery-serialize', 'jquery-validate-messages'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 300 * 1000
	});	
	app.initialize(function() {
		if (APPLICATION.data.activeCommunityIdId) $('#criteria_community_id').val(APPLICATION.data.activeCommunityIdId).trigger('change');
	});
});

var nowTimer;
var language;
var fromDate;
var toDate;
var table;
var criteriaForm;
var criteriaValidator;
var datesPicker;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'meter_record-message', 'customer-message', 'community-message', 'parking_garage-message', 'garage-message', 'parking_card-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: true,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('meter_record');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_park').text($.i18n.prop('breadcrumb.park'));
			$('#breadcrumb_meter_record').text(APPLICATION.documentTitle);

			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));

			$('#criteria_organization_id_label').text($.i18n.prop('organization'));

			$('#criteria_community_id_label').text($.i18n.prop('community'));
			//$('#criteria_building_id_label').text($.i18n.prop('building'));
			$('#criteria_parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_customer_id_label').text($.i18n.prop('customer'));
			$('#criteria_garage_id_label').text($.i18n.prop('garage'));
			$('#dates_label').text($.i18n.prop('meter_record.record_time'));
			//$('#criteria_meter_record_type_label').text($.i18n.prop('meter_record.record_type'));

			$('#refresh').append($.i18n.prop('operation.refresh'));
			$('#export_spreadsheet').append($.i18n.prop('operation.export.spreadsheet'));
			//$('#export_text').append($.i18n.prop('operation.export.text'));
			
			$('#table_title').text($.i18n.prop('meter_record'));
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";

	criteriaForm = $('#criteria_form');
	var dashedLanguage = language.replace('_', '-');
	
	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	moment.locale(dashedLanguage.toLowerCase());
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);

	//deferreds.push(createCodeCheckbox('#criteria_meter_record_type_container', 'criteriaMeterRecordTypeId', URLS.CODE.LIST.PARKING_SERVICE_TYPE, 'id'));

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
		})
		*/
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id'), data, true);
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		})
	);	

	//deferreds.push(createCustomerSelect($('#customer_id'), $('#criteria_customer_id'), $('#criteria_customer_id_container')));
	buildSelect2($('#criteria_parking_garage_id'), null, false);
	buildSelect2($('#criteria_customer_id'), null, false);
	buildSelect2($('#criteria_garage_id'), null, false);

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = $('#table').DataTable({
			"language": getDataTablesLanguage(),
			"paging": true,
			'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": true,
			"searching": false,
			"ordering": true,
			"order": [[0, "asc"]],
			"orderClasses": false, 
			"info": true,
			"stateSave": false,
			"autoWidth": false,
			"responsive": false,
			"columns": [
				{"data": "recordTime", "sortable": true, "title": $.i18n.prop('meter_record.record_time'),"render": dataTableHelper.render.dateTimeRender, "width": 90, "className": "min-mobile-p"},
				{"data": 'receiveTime', "title": $.i18n.prop('meter_record.receive_time'), "sortable": false, 'width': 90, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender},
				{"data": 'garage.parkingGarage.community.name', "sortable": false, "title": $.i18n.prop('community'), "width": 60, "className": "max-tablet-p"},
				{"data": 'garage.parkingGarage.name', "sortable": false, "title": $.i18n.prop('parking_garage'), "width": 60, "className": "max-tablet-p"},
				{"data": 'garage.no', "sortable": false, "title": $.i18n.prop('garage'), "width": 60, "className": "max-tablet-p"},
				{"data": 'garage.customer.name', "sortable": false, "title": $.i18n.prop('customer'), "width": 60, "className": "max-tablet-p"}, 
				//{"data": 'meterRecordType.description', "sortable": false, "title": $.i18n.prop('meter_record.record_type'), "width": 40, "className": "max-tablet-p"},
				{"data": 'operation.description', "sortable": false, "title": $.i18n.prop('meter_record.operation'), "width": 60, "className": "max-tablet-p"}, 
				{"data": 'duration', "sortable": false, "title": $.i18n.prop('meter_record.duration'), "width": 60, "class": "numeric", "className": "max-tablet-p"}, 
				/*
				{"data": "totalizer", "sortable": false, "title": $.i18n.prop('meter_record.totalizer'), "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100, "className": "min-mobile-p"},
				{"data": 'voltage', "sortable": false, "title": $.i18n.prop('meter_record.voltage') + ' | <small>' + APPLICATION.systemConfig.defaultVoltageUnit + '</small>', "class": "numeric", "width": 60, "className": "max-tablet-p"},
				*/
			],
			"deferLoading": 0,
			"processing": false, 
			"serverSide": true,
			"ajax": loadTable
		});	
	}));
	//
	nowTimer = setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));

	$.when.apply($, deferreds)
	.done(function() {
		//$('input[name="criteriaMeterRecordTypeId"]').iCheck('check');

		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {
					required: true
				},
				dates: {
					required: true
				}
			}
		});
		configValidator(criteriaValidator);
		
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
		});
		
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, $('#criteria_garage_id'));
		});

		$('#criteria_customer_id').on('change', function(e) {
			activeCriteriaCCustomerId = changeCustomer(criteriaForm.serializeObject(), $(this), activeCriteriaCCustomerId, $('#criteria_garage_id'), null);
		});

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
	//
	return deferred.promise();
}

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
	return criteria;
}

function loadTable(data, callback, settings) {
	if (!$('#dates').val()) {
		return false;
	}
	
	data.parameters = criteriaForm.serializeObject();
	data.parameters.fromTime = datesPicker.data('daterangepicker').startDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	data.parameters.toTime = datesPicker.data('daterangepicker').endDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	delete parameters.dates;
	
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
	});

	ajaxPostJson(URLS.METER_RECORD.QUERY, data)
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
//
function refresh(e) {
	if (e) e.preventDefault();
	if (!criteriaForm.valid()) return false;
	
	var communityId = $('#criteria_community_id').val();
	if ((communityId) && (communityId != APPLICATION.data.activeCommunityIdId)) {
		APPLICATION.data.activeCommunityIdId = communityId;
	}
	saveDataCookie();
	if (table) table.ajax.reload();
}
