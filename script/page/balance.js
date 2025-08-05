requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'jquery-serialize', 'editForm', 'jquery-serialize', 'jquery-validate-messages'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 5000
	});	
	app.initialize(function() {
		if (APPLICATION.data.activeCommunityId) $('#criteria_community_id').val(APPLICATION.data.activeCommunityId).trigger('change');
	});
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
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', 'parking_garage-message', 'parking_card-message', 'charge-message', 'recharge-message', 'balance-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('balance');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_balance').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			//$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('community'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#criteria_parking_card_id_label, #parking_card_id_label').text($.i18n.prop('parking_card'));

			$('#latest_update_time_label').text($.i18n.prop('balance.time.update.latest'));
			$('#debit_amount_label').text($.i18n.prop('balance.amount.debit'));
			$('#credit_amount_label').text($.i18n.prop('balance.amount.credit'));
			$('#balance_amount_label').text($.i18n.prop('balance.amount.balance'));

			$('#status_label').text($.i18n.prop('status'));
			$('#status_active_label').append($.i18n.prop('status.active'));
			$('#status_inactive_label').append($.i18n.prop('status.inactive'));

			$('#search').append($.i18n.prop('operation.refresh'));
			$('#export_spreadsheet').append($.i18n.prop('operation.export.spreadsheet'));

			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));

			$('#tab1').append($.i18n.prop('balance'));
			$('#tab2').append($.i18n.prop('balance.detail'));

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

	form = $('#form');

	// Date
	moment.locale(dashedLanguage.toLowerCase());

	$('#status_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});

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
		ajaxGetJson(URLS.PARKING_CARD.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			$('#criteria_parking_card_id, #parking_card_id').select2({
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
				{"data": "parkingCard.parkingGarage.community.name", "title": $.i18n.prop('parking_garage'), "sortable": true, 'width': 80},
				{"data": "parkingCard.parkingGarage.name", "title": $.i18n.prop('parking_garage'), "sortable": true, 'width': 80},
				{"data": "customer.name", "title": $.i18n.prop('customer'), "sortable": true, 'width': 80},
				{"data": "parkingCard.no", "title": $.i18n.prop('parking_card'), "sortable": true, 'width': 80},
				{"data": "debitAmount", "title": $.i18n.prop('balance.amount.debit'), "sortable": true, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": "creditAmount", "title": $.i18n.prop('balance.amount.credit'), "sortable": true, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": "balanceAmount", "title": $.i18n.prop('balance.amount.balance'), "sortable": true, 'width': 60, "class": "numeric", "render": dataTableHelper.render.numberRender},
				//{"data": "latestUpdateTimeTime", "title": $.i18n.prop('balance.time.update.latest'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				//{"data": "status", "title": $.i18n.prop('status'), "sortable": true, 'width': 60, "class": "numeric", "render": dataTableHelper.render.statusRender},
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
				parkingCardId: {
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
				if ((data.customer) && (data.customer.id)) {
					$('#customer_id').val(data.customer.id).trigger('change');
				}
				else {
					$('#customer_id').val("").trigger('change');
				}
				if ((data.parkingCard) && (data.parkingCard.id)) {
					$('#parking_card_id').val(data.parkingCard.id).trigger('change');
					if ((data.parkingCard.parkingGarage) && (data.parkingCard.parkingGarage.id)) {
						$('#parking_garage_id').val(data.parkingCard.parkingGarage.id).trigger('change');
						if (data.parkingCard.parkingGarage.community.id) {
							$('#community_id').val(data.parkingCard.parkingGarage.community.id).trigger('change');
							if (data.parkingCard.parkingGarage.community.id) $('#community_id').val(data.parkingCard.parkingGarage.community.id).trigger('change');
							else $('#community_id').val('').trigger('change');
						}
						else {
							$('#community_id').val('').trigger('change');
						}
					}
					else {
						$('#parking_card_id, #parking_garage_id, #community_id').val('').trigger('change');
					}
				}
				else {
					$('#parking_card_id').val('').trigger('change');
				}

				$('input[name="status"]').iCheck('check');
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
		ajaxPostJson(URLS.BALANCE.LIST, data)
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
