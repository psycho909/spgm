requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'jquery-serialize', 'editForm', 'jquery-serialize', 'jquery-validate-messages', 'card-expander'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 5000
	});	
	//app.initialize();
	app.initialize(function() {
		if (APPLICATION.data.activeCommunityId) $('#criteria_community_id').val(APPLICATION.data.activeCommunityId).trigger('change');
	});
});

var language;
var table;
var tableElement;
var criteriaForm;
var criteriaValidator;

var detailTable;
var detailTableElement;

var fromDate;
var toDate;
var datesPicker;

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCriteriaCustomerId;
var activeCriteriaGarageId;

var activeRow;
var activeRowClass = 'selected_row';

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', 'building-message', 'parking_garage-message', 'garage-message', 'parking_card-message', 'charge-message', 'balance-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('balance.query');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_charge').text($.i18n.prop('breadcrumb.charge'));
			$('#breadcrumb_account_balance').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#query_result_detail_title').text(i18nCombine('terms.query.result', 'terms.detail'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			//$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('community'));

			$('#criteria_community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_customer_id_label').text($.i18n.prop('customer'));
			$('#criteria_garage_id_label').text($.i18n.prop('garage'));
			$('#dates_label').text($.i18n.prop('charge.period'));

			$('#search').append($.i18n.prop('operation.refresh'));
			//$('#export_spreadsheet').append($.i18n.prop('operation.export.spreadsheet'));

			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";

	var deferred = $.Deferred();
	var deferreds = [];
	
	var dashedLanguage = language.replace('_', '-');

	var nowTimer = setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);

	criteriaForm = $('#criteria_form');

	// Date
	moment.locale(dashedLanguage.toLowerCase());
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);

	deferreds.push(createCodeRadio('#charge_status_container', 'chargeStatusId', URLS.CODE.LIST.CHARGE_STATUS, 'id'));

	deferreds.push(
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id'), data, true);
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}),
	);
	
	buildSelect2($('#criteria_parking_garage_id'), null, false);
	buildSelect2($('#criteria_customer_id'), null, false);
	buildSelect2($('#criteria_garage_id'), null, false);
	
	tableElement = $('#table');
	detailTableElement = $('#detail_table');

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable({
			"data": null, 
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
				{"data": "updateTime", "title": $.i18n.prop('balance.time.update'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
				{"data": "parkingGarageName", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 80},
				{"data": "customerName", "title": $.i18n.prop('customer'), "sortable": false, 'width': 80},
				{"data": "garageNo", "title": $.i18n.prop('garage'), "sortable": false, 'width': 40},
				{"data": "debitAmount", "title": $.i18n.prop('balance.amount.debit'), "sortable": false, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": "creditAmount", "title": $.i18n.prop('balance.amount.credit'), "sortable": false, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": "balance", "title": $.i18n.prop('balance.amount.balance'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
		});
		detailTable = detailTableElement.DataTable({
			"data": null, 
			"language": getDataTablesLanguage(),
			"paging": true,
			//'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			//"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"pageLength": 10000,
			"lengthChange": false,
			"searching": false,
			"ordering": true,
			"order": [[0, "asc"]],
			"orderClasses": false, 
			"info": true,
			"stateSave": false,
			"autoWidth": false,
			"responsive": false,
			"columns": [
				{"data": "recordTime", "title": $.i18n.prop('balance.detail.record.time'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
				{"data": "debitAmount", "title": $.i18n.prop('balance.detail.amount.debit'), "sortable": false, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": "chargeTypeDescription", "title": $.i18n.prop('charge.charge_type'), "sortable": false, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "creditAmount", "title": $.i18n.prop('balance.detail.amount.credit'), "sortable": false, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": "balance", "title": $.i18n.prop('balance.amount.balance'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": false
		});
	}));
	//
	$.when.apply($, deferreds).then(function() {

		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
		});
		
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, $('#criteria_garage_id'));
		});

		$('#criteria_customer_id').on('change', function(e) {
			activeCriteriaCustomerId = changeCustomer(criteriaForm.serializeObject(), $(this), activeCriteriaCustomerId, $('#criteria_garage_id'), null);
		});
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {
					requiredid: true
				},
				dates: {
					required: true
				},
			}
		});
		
		$('tbody', tableElement).on('click', 'tr', function(e) {
			if (e) e.preventDefault();
			var that = this;
			activeRow = table.row(that);
			$('tbody tr.' + activeRowClass, tableElement).removeClass(activeRowClass);
			$(that).addClass(activeRowClass);
			if (activeRow) {
				var data = activeRow.data();
				detailTable.clear();
				$.when(ajaxGet(URLS.ACCOUNT_BALANCE.LIST_DETAIL + data.id, null).
				done(function(json) {
					detailTable.rows.add(json).draw(false);
				}));
			}
	    });
		
		$('button.card_expander').cardExpander({expanded: true});
		$('#search').on('click', refresh);
		
		deferred.resolve();
	});
	
	return deferred.promise();
}

function loadTable(data, callback, settings) {
	
	data.parameters = criteriaForm.serializeObject();
	data.parameters.fromTime = datesPicker.data('daterangepicker').startDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	data.parameters.toTime = datesPicker.data('daterangepicker').endDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	delete data.parameters.dates;
	
	var deferreds = [];
	
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
	});

	deferreds.push(
		ajaxPost(URLS.ACCOUNT_BALANCE.QUERY, data)
		.done(function(json) {
			if ((json) && (json.data) && (json.data.length)) {
				callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
				if (table.data().any()) {
					var tableRow = $('tbody tr:first', tableElement);
					if (tableRow) tableRow.trigger('click');
				}
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
	);
	
	$.when.apply($, deferreds).then(function() {
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
