requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'jquery-serialize', 'editForm', 'jquery-serialize', 'jquery-validate-messages'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 5000
	});	
	app.initialize();
});

var activeRowClass = 'bg-info';
var editForm;
var language;
var form;
var table;
var tableElement;

var fromDate;
var toDate;
var datesPicker;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', /*'building-message', */'parking_garage-message', 'garage-message', 'bill-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('bill.notification');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_charge').text($.i18n.prop('breadcrumb.charge'));
			$('#breadcrumb_bill').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#dates_label').text($.i18n.prop('bill.from_time'));

			$('#search').append($.i18n.prop('operation.refresh'));
			$('#export_spreadsheet').append($.i18n.prop('operation.export.spreadsheet'));
			$('#check_all').append($.i18n.prop('operation.check.all'));
			$('#uncheck_all').append($.i18n.prop('operation.uncheck.all'));
			$('#send').append($.i18n.prop('operation.send'));

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

	form = $('#criteria_form');

	// Date
	moment.locale(dashedLanguage.toLowerCase());
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);

	deferreds.push(createCodeRadio('#charge_status_container', 'chargeStatusId', URLS.CODE.LIST.CHARGE_STATUS, 'id'));

	deferreds.push(
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
	);
	
	deferreds.push(createCustomerSelect($('#customer_id'), $('#criteria_customer_id'), $('#criteria_customer_id_container')));

	tableElement = $('#table');

	var height = configTableHeight(tableElement, true, false);

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable({
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
				{"data": null, "title": $.i18n.prop('operation.check'), "sortable": false, 'width': 30, "render": dataTableHelper.render.checkboxRender}, 
				{"data": "garage.parkingGarage.community.name", "title": $.i18n.prop('community'), "sortable": true, 'width': 100},
				{"data": "garage.parkingGarage.name", "title": $.i18n.prop('parking_garage'), "sortable": true, 'width': 80},
				{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": true, 'width': 60},
				{"data": "garage.customer.name", "title": $.i18n.prop('customer'), "sortable": true, 'width': 100},
				{"data": "billNo", "title": $.i18n.prop('bill.bill_no'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "fromTime", "title": $.i18n.prop('bill.from_time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "toTime", "title": $.i18n.prop('bill.to_time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "beginBalance", "title": $.i18n.prop('bill.begin_balance'), "sortable": true, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				//{"data": "recharge", "title": $.i18n.prop('bill.recharge'), "sortable": true, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				//{"data": "recharge", "title": $.i18n.prop('bill.recharge'), "sortable": true, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				//{"data": "consumption", "title": $.i18n.prop('bill.consumption'), "sortable": true, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": "endBalance", "title": $.i18n.prop('bill.end_balance'), "sortable": true, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
		});
	}));
	//
	$.when.apply($, deferreds).then(function() {
		
		$('#search').on('click', function(e) {
			e.preventDefault();
			refresh(e);
		});
		
		var validator = form.validate({
			rules: {
				communityId: {
					required: true
				},
				parkingGarageId: {
					required: true
				},
				garageId: {
					required: true
				},
			}
		});
		
		deferred.resolve();
	});
	
	return deferred.promise();
}

function loadTable(data, callback, settings) {
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});

	deferreds.push(
		ajaxPostJson(URLS.BILL.LIST, data)
		.done(function(json) {
			if ((json) && (json.length)) callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
			else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});

			if (table.data().any()) {
				$('#table .icheck').iCheck({
					checkboxClass: 'icheckbox_square-blue', 
					tap: true
				});			
				var tableRow = $('tbody tr:first', tableElement);
				if (tableRow) tableRow.trigger('click');
			}
		})
	);

	$.when.apply($, deferreds).then(function() {
		toast.close();
	});

}

function refresh(e) {
	if (e) e.preventDefault();
	if (table) table.ajax.reload();
}
