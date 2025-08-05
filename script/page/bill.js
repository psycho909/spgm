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
			APPLICATION.documentTitle = $.i18n.prop('bill');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_charge').text($.i18n.prop('breadcrumb.charge'));
			$('#breadcrumb_bill').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			//$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('community'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			//$('#criteria_building_id_label, #building_id_label').text($.i18n.prop('building'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#dates_label').text($.i18n.prop('bill.from_time'));

			$('#bill_no_label').text($.i18n.prop('bill.bill_no'));
			$('#from_time_label').text($.i18n.prop('bill.from_time'));
			$('#to_time_label').text($.i18n.prop('bill.to_time'));
			$('#begin_balance_label').text($.i18n.prop('bill.begin_balance'));
			$('#end_balance_label').text($.i18n.prop('bill.end_balance'));
			$('#consumption_label').text($.i18n.prop('bill.consumption'));
			$('#recharge_label').text($.i18n.prop('bill.recharge'));
			$('#report_time_label').text($.i18n.prop('bill.report_time'));
			$('#notification_time_label').text($.i18n.prop('bill.notification_time'));

			$('#search').append($.i18n.prop('operation.refresh'));

			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));

			$('button.operation[value="P"]').append($.i18n.prop('operation.print'));
			//$('button.inner_operation[value="Y"]').append($.i18n.prop('transmitter.config.operation.select'));
			
			$('#tab1').append($.i18n.prop('bill'));
			$('#tab2').append('');

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

	form = $('#bill_form');

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
			$('#criteria_community_id, #community_id').select2({
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
		/*
		ajaxGetJson(URLS.BUILDING.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			$('#criteria_building_id, #building_id').select2({
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
		ajaxGetJson(URLS.PARKING_GARAGE.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			$('#criteria_parking_garage_id, #parking_garage_id').select2({
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
			$('#criteria_garage_id, #garage_id').select2({
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
	
	$('.nav-tabs a:first').tab('show');

	deferreds.push(createCustomerSelect($('#customer_id'), $('#criteria_customer_id'), $('#criteria_customer_id_container')));

	tableElement = $('#table');

	var height = configTableHeight(tableElement, true, false);

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		//
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
				{"data": null, "title": "", "sortable": false, 'width': 30, "render": dataTableHelper.render.commonButtonRender},
				{"data": "garage.parkingGarage.community.name", "title": $.i18n.prop('community'), "sortable": true, 'width': 100},
				{"data": "garage.parkingGarage.name", "title": $.i18n.prop('parking_garage'), "sortable": true, 'width': 80},
				{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": true, 'width': 40},
				{"data": "garage.customer.name", "title": $.i18n.prop('customer'), "sortable": true, 'width': 100},
				{"data": "billNo", "title": $.i18n.prop('bill.bill_no'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "fromTime", "title": $.i18n.prop('bill.from_time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "toTime", "title": $.i18n.prop('bill.to_time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "beginBalance", "title": $.i18n.prop('bill.begin_balance'), "sortable": true, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
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
		//
		$('#search').on('click', function(e) {
			e.preventDefault();
			refresh(e);
		});
		//
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
		
		editForm = form.editForm({
			form: form,
			table: tableElement,
			dataTable: table,
			validator: validator, 
			afterPopulate: function() {
				var data = editForm.formData();
				if ((data.garage) && (data.garage.id)) {
					$('#garage_id').val(data.garage.id).trigger('change');
					if ((data.garage.customer) && (data.garage.customer.id)) {
						$('#customer_id').val(data.garage.customer.id).trigger('change');
					}
					else {
						$('#customer_id').val("").trigger('change');
					}
					if ((data.garage.parkingGarage) && (data.garage.parkingGarage.id)) {
						$('#parking_garage_id').val(data.garage.parkingGarage.id).trigger('change');
						if (data.garage.parkingGarage.community.id) {
							$('#community_id').val(data.garage.parkingGarage.community.id).trigger('change');
							if (data.garage.parkingGarage.community.id) $('#community_id').val(data.garage.parkingGarage.community.id).trigger('change');
							else $('#community_id').val('').trigger('change');
						}
						else {
							$('#community_id').val('').trigger('change');
						}
					}
					else {
						$('#parking_garage_id, #community_id').val('').trigger('change');
					}
				}
				else {
					$('#garage_id, #parking_garage_id, #community_id').val('').trigger('change');
				}
			},
			save: function() {
				toast.fire({
					type: 'info', 
					title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
				});
				toast.close();
			}
		});

		editForm.process(CONSTANT.ACTION.INQUIRY);
			
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
