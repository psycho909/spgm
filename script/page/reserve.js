/*
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
*/
initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

var editForm;
var language;
var form;
var table;
var tableElement;

var fromDate;
var toDate;
var datesPicker;
var planServiceTimePicker;

var criteriaForm;
var validator;
var criteriaValidator;

var activeCriteriaCommunityId;
var activeCommunityId;
var activeCriteriaParkingGarageId;
var activeParkingGarageId;
var activeCriteriaGarageId;
var activeGarageId;
var activeCriteriaCustomerId;
var activeCustomerId;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', 'parking_garage-message', 'garage-message', 'reserve-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('reserve');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_parking').text($.i18n.prop('terms.parking_charging'));
			$('#breadcrumb_reserve').text(APPLICATION.documentTitle);
			*/
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			//$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('community'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			//$('#criteria_building_id_label, #building_id_label').text($.i18n.prop('building'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#dates_label').text($.i18n.prop('reserve.time'));

			$('#reserve_no_label').text($.i18n.prop('reserve.no'));
			$('#reserve_time_label').text($.i18n.prop('reserve.time'));
			$('#reserve_service_type_id_label').text($.i18n.prop('reserve.service.type'));
			$('#plan_service_time_label').text($.i18n.prop('reserve.service.time.plan'));
			$('#real_service_time_label').text($.i18n.prop('reserve.service.time.real'));
			$('#notification_time_label').text($.i18n.prop('reserve.notification.time'));
			$('#reserve_status_id_label').text($.i18n.prop('reserve.status'));

			$('#refresh').append($.i18n.prop('operation.refresh'));

			/*
			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			//$('button.operation[value="P"]').append($.i18n.prop('operation.print'));
			*/
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";
	applyLayoutOption();

	var deferred = $.Deferred();
	var deferreds = [];
	
	var dashedLanguage = language.replace('_', '-');

	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));

	// Date
	moment.locale(dashedLanguage.toLowerCase());
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);

	var planServiceTime = moment().add(1, 'days').set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}).format(APPLICATION.SETTING.defaultDateTimeFormat);
	planServiceTimePicker = $('#plan_service_time').daterangepicker(
		{
			startDate: planServiceTime,
			endDate: planServiceTime,
			timePicker: true,
			singleDatePicker: true,
			timePicker24Hour: true,
			timePickerSeconds: false,
			timePickerIncrement: 60,
			locale: {
				format: APPLICATION.SETTING.defaultDateTimeFormat,
				separator: APPLICATION.SETTING.dateRangeSeparator,
				applyLabel: $.i18n.prop('operation.confirm'),
				cancelLabel: $.i18n.prop('operation.cancel')
			}
		}
	);

	deferreds.push(
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id, #community_id'), data, true);
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}), 
	);

	deferreds.push(createCodeSelect2($('#reserve_service_type_id'), URLS.CODE.LIST.PARKING_SERVICE_TYPE, false, true, false));
	deferreds.push(createCodeSelect2($('#reserve_status_id'), URLS.CODE.LIST.RESERVATION_STATUS, false, true, false));

	buildSelect2($('#criteria_parking_garage_id, #parking_garage_id'), null, false);
	buildSelect2($('#criteria_customer_id, #customer_id'), null, false);
	buildSelect2($('#criteria_garage_id, #garage_id'), null, false);

	tableElement = $('#table');

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		//
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
			"orderClasses": false, 
			"order": [[1, "asc"]],
			"info": true,
			"autoWidth": false,
			"columns": [
				{"data": null, "title": "", "sortable": false, 'width': 30, "render": dataTableHelper.render.commonButtonRender},
				{"data": "reserveTime", "title": $.i18n.prop('reserve.time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": "parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
				{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": false, 'width': 40},
				{"data": "customer", "title": $.i18n.prop('customer'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
				//{"data": "reserveNo", "title": $.i18n.prop('reserve.no'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "serviceType", "title": $.i18n.prop('reserve.service.type'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.codeRender}, 
				{"data": "planServiceTime", "title": $.i18n.prop('reserve.service.time.plan'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "realServiceTime", "title": $.i18n.prop('reserve.service.time.real'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "reserveStatus", "title": $.i18n.prop('reserve.status'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.codeRender}, 
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
					{"data": "reserveTime", "title": $.i18n.prop('reserve.time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
					{"data": "community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": "parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
					{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": false, 'width': 40},
					{"data": "customer", "title": $.i18n.prop('customer'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
					//{"data": "reserveNo", "title": $.i18n.prop('reserve.no'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
					{"data": "serviceType", "title": $.i18n.prop('reserve.service.type'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.codeRender}, 
					{"data": "planServiceTime", "title": $.i18n.prop('reserve.service.time.plan'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
					{"data": "realServiceTime", "title": $.i18n.prop('reserve.service.time.real'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
					{"data": "reserveStatus", "title": $.i18n.prop('reserve.status'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.codeRender}, 
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);
	}));
	//
	$.when.apply($, deferreds).then(function() {
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {
					requiredid: true
				},
			}
		});
		
		validator = form.validate({
			rules: {
				communityId: {
					requiredid: true
				},
				parkingGarageId: {
					requiredid: true
				},
				garageId: {
					requiredid: true
				},
			}
		});
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = form.editForm({
			form: form,
			table: tableElement,
			dataTable: table,
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.RESERVATION.SAVE,
			removeUrl: URLS.RESERVATION.DELETE, 
			afterPopulate: function() {
				var data = editForm.formData();
				/*
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
				*/
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				$('#parking_garage_id').val(data.parkingGarageId ? data.parkingGarageId : "").trigger('change');
				$('#customer_id').val(data.customerId ? data.customerId : "").trigger('change');
				$('#garage_id').val(data.garageId ? data.garageId : "").trigger('change');
			},
			/*
			save: function() {
				toast.fire({
					type: 'info', 
					title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
				});
				toast.close();
			}
			*/
		});

		editForm.process(CONSTANT.ACTION.INQUIRY);

		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
		});
		
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, $('#criteria_garage_id'));
		});

		$('#criteria_customer_id').on('change', function(e) {
			activeCriteriaCustomerId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaCustomerId, $('#criteria_garage_id'), null);
		});
		
		$('#community_id').on('change', function(e) {
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), $('#customer_id'), null);
		});

		$('#parking_garage_id').on('change', function(e) {
			activeParkingGarageId = changeParkingGarage(editForm.formData(), $(this), activeParkingGarageId, null, null);
		});

		$('#customer_id').on('change', function(e) {
			activeCustomerId = changeCustomer(editForm.formData(), $(this), activeCustomerId, $('#garage_id'), null);
		});
		
		$('#refresh').on('click', refresh);
			
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

	data.parameters = criteriaForm.serializeObject();
	data.parameters.fromTime = datesPicker.data('daterangepicker').startDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	data.parameters.toTime = datesPicker.data('daterangepicker').endDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	delete data.parameters.dates;

	deferreds.push(
		ajaxPostJson(URLS.RESERVATION.QUERY, data)
		.done(function(json) {
			//if ((json) && (json.length)) callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
			if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
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
	if (!criteriaForm.valid()) return false;
	
	var communityId = $('#criteria_community_id').val();
	if ((communityId) && (communityId != APPLICATION.data.activeCommunityId)) {
		APPLICATION.data.activeCommunityId = communityId;
		saveDataCookie();
	}
	
	if (table) table.ajax.reload();
}
