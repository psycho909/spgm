/*
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
*/
initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

var language;

var criteriaForm;
var criteriaValidator;

var fromDate;
var toDate;
var datesPicker;

var table;
var tableElement;
var detailTable;
var detailTableElement;

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
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', /*'building-message', */'parking_garage-message', 'garage-message', 'parking_card-message', 'charge-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('charge.calculate');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_charge').text($.i18n.prop('breadcrumb.charge'));
			$('#breadcrumb_charge_calculate').text(APPLICATION.documentTitle);
			*/
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#query_result_detail_title').text(i18nCombine('terms.query.result', 'terms.detail'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			//$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('community'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			//$('#criteria_building_id_label, #building_id_label').text($.i18n.prop('building'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			$('#criteria_customer_id_label').text($.i18n.prop('customer'));
			$('#dates_label').text($.i18n.prop('charge.period'));

			$('#calculate').append($.i18n.prop('operation.calculate'));
			$('#export_spreadsheet').append($.i18n.prop('operation.export.spreadsheet'));

			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";
	applyLayoutOption({'showQueryCriteriaCard': true, 'showQueryCriteriaHeader': false, 'showQueryResultCard': true, 'showQueryResultHeader': true});

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
		table = tableElement.DataTable(
			/*
			{
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
				{"data": "chargeTime", "title": $.i18n.prop('charge.charge_time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
				{"data": "parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
				{"data": "garageNo", "title": $.i18n.prop('garage'), "sortable": false, 'width': 40},
				//{"data": "parkingCard.no", "title": $.i18n.prop('parking_card'), "sortable": false, 'width': 80},
				{"data": "customerName", "title": $.i18n.prop('customer'), "sortable": false, 'width': 80},
				{"data": "consumption", "title": $.i18n.prop('charge.consumption'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
				{"data": "amount", "title": $.i18n.prop('charge.amount'), "sortable": false, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": "chargeTypeDescription", "title": $.i18n.prop('charge.charge_type'), "sortable": false, 'width': 80},
				{"data": "fromTime", "title": $.i18n.prop('charge.from_time'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
				{"data": "toTime", "title": $.i18n.prop('charge.to_time'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
				{"data": "fromTotalizer", "title": $.i18n.prop('charge.from_totalizer'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
				{"data": "toTotalizer", "title": $.i18n.prop('charge.to_totalizer'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
				{"data": "duration", "title": $.i18n.prop('charge.duration'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
				{"data": "chargeStatusDescription", "title": $.i18n.prop('charge.charge_status'), "sortable": false, 'width': 80},
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": 'saving', 'title': $.i18n.prop('charge.save'), 'width': 40, "sortable": false, "render": dataTableHelper.render.checkboxRender},
					{"data": "chargeTime", "title": $.i18n.prop('charge.charge_time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
					{"data": "parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
					{"data": "garageNo", "title": $.i18n.prop('garage'), "sortable": false, 'width': 40},
					//{"data": "parkingCard.no", "title": $.i18n.prop('parking_card'), "sortable": false, 'width': 80},
					{"data": "customerName", "title": $.i18n.prop('customer'), "sortable": false, 'width': 80},
					{"data": "consumption", "title": $.i18n.prop('charge.consumption'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
					{"data": "amount", "title": $.i18n.prop('charge.amount'), "sortable": false, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
					{"data": "chargeTypeDescription", "title": $.i18n.prop('charge.charge_type'), "sortable": false, 'width': 80},
					{"data": "fromTime", "title": $.i18n.prop('charge.from_time'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
					{"data": "toTime", "title": $.i18n.prop('charge.to_time'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
					{"data": "fromTotalizer", "title": $.i18n.prop('charge.from_totalizer'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
					{"data": "toTotalizer", "title": $.i18n.prop('charge.to_totalizer'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
					{"data": "duration", "title": $.i18n.prop('charge.duration'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
					{"data": "chargeStatusDescription", "title": $.i18n.prop('charge.charge_status'), "sortable": false, 'width': 80},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);
		detailTable = detailTableElement.DataTable(
			/*
			{
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
				{"data": "fromTime", "title": $.i18n.prop('charge.from_time'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
				{"data": "toTime", "title": $.i18n.prop('charge.to_time'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
				{"data": "consumption", "title": $.i18n.prop('charge.consumption'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
				{"data": "price", "title": $.i18n.prop('charge.amount'), "sortable": false, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": "amount", "title": $.i18n.prop('charge.amount'), "sortable": false, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": "fromTotalizer", "title": $.i18n.prop('charge.from_totalizer'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
				{"data": "toTotalizer", "title": $.i18n.prop('charge.to_totalizer'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
				{"data": "duration", "title": $.i18n.prop('charge.duration'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": false
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": "fromTime", "title": $.i18n.prop('charge.from_time'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
					{"data": "toTime", "title": $.i18n.prop('charge.to_time'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.shortDateTimeRender}, 
					{"data": "consumption", "title": $.i18n.prop('charge.consumption'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
					{"data": "price", "title": $.i18n.prop('charge.amount'), "sortable": false, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
					{"data": "amount", "title": $.i18n.prop('charge.amount'), "sortable": false, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
					{"data": "fromTotalizer", "title": $.i18n.prop('charge.from_totalizer'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
					{"data": "toTotalizer", "title": $.i18n.prop('charge.to_totalizer'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
					{"data": "duration", "title": $.i18n.prop('charge.duration'), "sortable": false, 'width': 80, "class": "numeric", "className": 'min-tablet-p', "render": dataTableHelper.render.numberRender}, 
					{"data": 'id', "visible": false} 
				],
				"pageLength": 99999,
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": false
			})
		);
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
		
		addTitleOperation($('#title_operation_container'), null, {'calculate': true, 'export': true});
		
		$('tbody', tableElement).on('click', 'tr', function(e) {
			if (e) e.preventDefault();
			var that = this;
			activeRow = table.row(that);
			$('tbody tr.' + activeRowClass, tableElement).removeClass(activeRowClass);
			$(that).addClass(activeRowClass);
			if (activeRow) {
				var data = activeRow.data();
				detailTable.clear();
				$.when(ajaxGet(URLS.CHARGE.LIST_DETAIL + data.id, null).
				done(function(json) {
					detailTable.rows.add(json).draw(false);
				}));
			}
	    });
		
		$('#calculate').on('click', calculate);
		
		$('button.card_expander').cardExpander({expanded: true});

		deferred.resolve();
	});
	
	return deferred.promise();
}

function calculate(e) {
	if (e) e.preventDefault();
	if (!criteriaForm.valid()) return false;
	
	//$('#calculate').prop('disabled', true);
	var data = criteriaForm.serializeObject();
	$(':input', criteriaForm).prop('disabled', true);
		
	if (toast) {
		toast.fire({
			type: 'info', 
			title: $.i18n.prop('operation.processing') + ', ' + $.i18n.prop('operation.waiting') 
		});
	}
	
	data.fromTime = datesPicker.data('daterangepicker').startDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	data.toTime = datesPicker.data('daterangepicker').endDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	delete data.dates;

	var refreshTimer = setInterval(refresh, 10 * 1000);
	
	var deferreds = [];
	deferreds.push(
		ajaxPost(URLS.CHARGE.CALCULATE, data)
		.done(function(json) {
			console.log(json);
		})
		.always(function() {
			clearInterval(refreshTimer);
			$(':input', criteriaForm).prop('disabled', false);
		})
	);

	$.when.apply($, deferreds).then(function() {
		toast.close();
		refresh();
	});
	
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
		ajaxPost(URLS.CHARGE.QUERY, data)
		.done(function(json) {
			if ((json) && (json.data) && (json.data.length)) {
				
				for (var i = 0; i < json.length; i++) json[i].saving = false;
				
				callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
				
				$('#table .icheck').iCheck({
					checkboxClass: 'icheckbox_square-blue', 
					tap: true
				});			
				
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
		/*
		.fail(function(jqXHR, textStatus, errorThrown) {
		})
		*/
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
		saveDataCookie();
	}
	if (table) table.ajax.reload();
}
