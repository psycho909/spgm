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
		if (APPLICATION.data.activeCommunityId) $('#criteria_community_id').val(APPLICATION.data.activeCommunityId).trigger('change');
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

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCriteriaCustomerId;
var activeCriteriaGarageId;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', 'parking_garage-message', 'garage-message', 'parking_card-message', 'recharge-message', 'user-message', 'transmitter-message', 'device-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: true,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('recharge.query');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_charge').text($.i18n.prop('breadcrumb.charge'));
			$('#breadcrumb_recharge').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));

			$('#criteria_community_id_label').text($.i18n.prop('community'));
			//$('#criteria_building_id_label').text($.i18n.prop('building'));
			$('#criteria_parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label').text($.i18n.prop('garage'));
			$('#dates_label').text($.i18n.prop('recharge.recharge_time'));
			$('#criteria_parking_card_id_label, #parking_card_id_label').text($.i18n.prop('parking_card'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));

			$('#search').append($.i18n.prop('operation.query'));
			//$('#export_spreadsheet').append($.i18n.prop('operation.export.spreadsheet'));
			//$('#export_text').append($.i18n.prop('operation.export.text'));
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";

	var dashedLanguage = language.replace('_', '-');
	
	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	criteriaForm = $('#criteria_form');
	
	moment.locale(dashedLanguage.toLowerCase());
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);

	deferreds.push(createCommunitySelect($('#criteria_community_id'), true));
	
	buildSelect2($('#criteria_parking_garage_id, #criteria_customer_id, #criteria_garage_id, #criteria_parking_card_id'), null, true, false);

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
				{"data": "rechargeTime", "sortable": true, "title": $.i18n.prop('recharge.recharge_time'),"render": dataTableHelper.render.dateTimeRender, "width": 60, "className": "min-mobile-p"},
				{"data": 'amount', "sortable": false, "title": $.i18n.prop('recharge.amount'), "width": 40, "className": "max-tablet-p", "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": 'userName', "sortable": false, "title": $.i18n.prop('user'), "width": 40, "className": "max-tablet-p"},
				{"data": 'rechargeUserName', "sortable": false, "title": $.i18n.prop('recharge.recharge_user'), "width": 40, "className": "max-tablet-p", "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": 'communityName', "sortable": false, "title": $.i18n.prop('community'), "width": 60, "className": "max-tablet-p"},
				{"data": 'parkingGarageName', "sortable": false, "title": $.i18n.prop('parking_garage'), "width": 60, "className": "max-tablet-p"}, 
				{"data": 'customerName', "sortable": false, "title": $.i18n.prop('customer'), "width": 60, "className": "max-tablet-p"},
				{"data": 'parkingCardNo', "sortable": false, "title": $.i18n.prop('parking_card.no'), "width": 60, "className": "max-tablet-p"},
				{"data": 'transmitterNo', "sortable": false, "title": $.i18n.prop('transmitter'), "width": 60, "className": "max-tablet-p"}, 
				{"data": 'deviceNo', "sortable": false, "title": $.i18n.prop('device'), "width": 60, "className": "max-tablet-p"}, 
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

		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {requiredid: true}, 
				dates: {required: true}
			}
		});
		//configValidator(criteriaValidator);
		
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
		});
		
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, $('#criteria_garage_id'));
		});

		$('#criteria_customer_id').on('change', function(e) {
			activeCriteriaCustomerId = changeCustomer(criteriaForm.serializeObject(), $(this), activeCriteriaCustomerId, $('#criteria_garage_id'), null);
		});
		
		$('#search').on('click', refresh);

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
}

function downloadSpreadsheet() {
}

function loadTable(data, callback, settings) {
	data.parameters = criteriaForm.serializeObject();
	data.parameters.fromTime = datesPicker.data('daterangepicker').startDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	data.parameters.toTime = datesPicker.data('daterangepicker').endDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	delete data.parameters.dates;

	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
	});
	
	ajaxPost(URLS.RECHARGE.QUERY, data)
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
