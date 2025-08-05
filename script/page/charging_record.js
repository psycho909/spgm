initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

var language;
var fromDate;
var toDate;
var table;
var criteriaForm;
var criteriaValidator;

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCriteriaCustomerId;
var activeCriteriaGarageId;

var datesPicker;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'charging-message', 'charging_pile-message', 'customer-message', 'community-message', 'parking_garage-message', 'garage-message', 'parking_card-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: true,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('charging.record');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_charging').text($.i18n.prop('charging'));
			$('#breadcrumb_charging_record').text(APPLICATION.documentTitle);
			*/
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));

			$('#criteria_community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_customer_id_label').text($.i18n.prop('customer'));
			$('#criteria_garage_id_label').text($.i18n.prop('garage'));
			$('#dates_label').text($.i18n.prop('charging.record_time'));
			//$('#criteria_meter_record_type_label').text($.i18n.prop('meter_record.record_type'));

			$('#refresh').append($.i18n.prop('operation.refresh'));
			//$('#export_spreadsheet').append($.i18n.prop('operation.export.spreadsheet'));
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";
	applyLayoutOption({'showQueryCriteriaCard': true, 'showQueryResultCard': true});

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
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id'), data, true);
		})
	);	

	buildSelect2($('#criteria_parking_garage_id, #criteria_customer_id, #criteria_garage_id'), null, false);

	var operationRender = function(data, type, row) {
		if ((row) && (row.operationId)) {
			if (row.operationId == APPLICATION.codeHelper.parkingOperationStartCharging.id) return '<span class="bg-danger"> ' + data + ' </span>';
			else if (row.operationId == APPLICATION.codeHelper.parkingOperationComplete.id) return '<span class="bg-primary"> ' + data + ' </span>';
		}
		return data;
	};
	
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = $('#table').DataTable(
			/*
			{
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
				{"data": "recordTime", "sortable": true, "title": $.i18n.prop('charging.record_time'),"render": dataTableHelper.render.dateTimeRender, "width": 90, "className": "min-mobile-p"},
				//{"data": 'receiveTime', "title": $.i18n.prop('charging.receive_time'), "sortable": false, 'width': 90, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender},
				{"data": 'communityName', "sortable": false, "title": $.i18n.prop('community'), "width": 60, "className": "max-tablet-p"},
				{"data": 'parkingGarageName', "sortable": false, "title": $.i18n.prop('parking_garage'), "width": 60, "className": "max-tablet-p"},
				{"data": 'garageNo', "sortable": false, "title": $.i18n.prop('garage'), "width": 60, "className": "max-tablet-p"},
				{"data": 'plateIdentity', "sortable": false, "title": $.i18n.prop('garage.plate_identity'), "width": 60, "className": "max-tablet-p"},
				{"data": 'customerName', "sortable": false, "title": $.i18n.prop('customer'), "width": 60, "className": "max-tablet-p"}, 
				{"data": 'chargingPileNo', "sortable": false, "title": $.i18n.prop('charging_pile'), "width": 80, "className": "max-tablet-p"}, 
				{"data": 'parkingCardNo', "sortable": false, "title": $.i18n.prop('parking_card'), "width": 60, "className": "max-tablet-p"},
				{"data": 'operationDescription', "sortable": false, "title": $.i18n.prop('charging.operation'), "width": 60, "className": "max-tablet-p", "render": operationRender}, 
				{"data": "power", "sortable": false, "title": $.i18n.prop('charging.power') + ' | <small>' + APPLICATION.systemConfig.defaultInstantUnit + '</small>', "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100, "className": "min-mobile-p"},
				{"data": "totalizer", "sortable": false, "title": $.i18n.prop('charging.totalizer') + ' | <small>' + APPLICATION.systemConfig.defaultTotalizerUnit + '</small>', "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100, "className": "min-mobile-p"},
				{"data": "consumption", "sortable": false, "title": $.i18n.prop('charging.consumption'), "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100, "className": "min-mobile-p"},
				//{"data": 'voltage', "sortable": false, "title": $.i18n.prop('charging.voltage') + ' | <small>' + APPLICATION.systemConfig.defaultVoltageUnit + '</small>', "class": "numeric", "width": 60, "className": "max-tablet-p"},
				//{"data": 'chargeStatus.description', "sortable": false, "title": $.i18n.prop('charging.charge_status'), "width": 60, "className": "max-tablet-p"},
			],
			"deferLoading": 0,
			"processing": false, 
			"serverSide": true,
			"ajax": loadTable
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": "recordTime", "sortable": true, "title": $.i18n.prop('charging.record_time'),"render": dataTableHelper.render.dateTimeRender, "width": 90},
					//{"data": 'receiveTime', "title": $.i18n.prop('charging.receive_time'), "sortable": false, 'width': 90, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender},
					{"data": 'communityName', "sortable": false, "title": $.i18n.prop('community'), "width": 60},
					{"data": 'parkingGarageName', "sortable": false, "title": $.i18n.prop('parking_garage'), "width": 60},
					{"data": 'garageNo', "sortable": false, "title": $.i18n.prop('garage'), "width": 60},
					{"data": 'plateIdentity', "sortable": false, "title": $.i18n.prop('garage.plate_identity'), "width": 60, "class": "text-center"},
					{"data": 'customerName', "sortable": false, "title": $.i18n.prop('customer'), "width": 60}, 
					{"data": 'chargingPileNo', "sortable": false, "title": $.i18n.prop('charging_pile'), "width": 80}, 
					{"data": 'parkingCardNo', "sortable": false, "title": $.i18n.prop('parking_card'), "width": 60},
					{"data": 'operationDescription', "sortable": false, "title": $.i18n.prop('charging.operation'), "width": 60, "render": operationRender}, 
					{"data": "power", "sortable": false, "title": $.i18n.prop('charging.power') + ' | <small>' + APPLICATION.systemConfig.defaultInstantUnit + '</small>', "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100},
					{"data": "totalizer", "sortable": false, "title": $.i18n.prop('charging.totalizer') + ' | <small>' + APPLICATION.systemConfig.defaultTotalizerUnit + '</small>', "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100},
					{"data": "consumption", "sortable": false, "title": $.i18n.prop('charging.consumption'), "class": "numeric", "render": dataTableHelper.render.totalizerRender, "width": 100},
					//{"data": 'voltage', "sortable": false, "title": $.i18n.prop('charging.voltage') + ' | <small>' + APPLICATION.systemConfig.defaultVoltageUnit + '</small>', "class": "numeric", "width": 60, "className": "max-tablet-p"},
					//{"data": 'chargeStatus.description', "sortable": false, "title": $.i18n.prop('charging.charge_status'), "width": 60, "className": "max-tablet-p"},
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
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {
					requiredid: true
				},
				dates: {
					required: true
				}
			}
		});
		configValidator(criteriaValidator);
		
		addTitleOperation($('#title_operation_container'), null, {'search': true, 'export': true});
		
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
		});
		
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, $('#criteria_garage_id'));
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
	
	var communityId = $('#criteria_community_id').val();
	if ((communityId) && (communityId != APPLICATION.data.activeCommunityId)) {
		APPLICATION.data.activeCommunityId = communityId;
	}
	saveDataCookie();
	
	if (table) table.ajax.reload();
}
