requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'jquery-serialize', 'editForm', 'jquery-serialize', 'jquery-validate-messages', 'card-expander'], function(moment, swal) {
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

var editForm;
var language;
var form;
var validator;

var criteriaForm;
var criteriaValidator;

var table;
var tableElement;

var fromDate;
var toDate;
var datesPicker;

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCriteriaCustomerId;
var activeCriteriaGarageId;
var activeCommunityId;
var activeParkingGarageId;
var activeCustomerId;
var activeGarageId;

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
			APPLICATION.documentTitle = $.i18n.prop('charge');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_charge').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			//$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('community'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			//$('#criteria_building_id_label, #building_id_label').text($.i18n.prop('building'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#criteria_parking_card_id_label, #parking_card_id_label').text($.i18n.prop('parking_card'));
			$('#dates_label').text($.i18n.prop('charge.from_time'));

			$('#parking_card_id_label').text($.i18n.prop('parking_card'));
			$('#charge_type_id_label').text($.i18n.prop('charge.charge_type'));
			$('#from_time_label').text($.i18n.prop('charge.from_time'));
			$('#to_time_label').text($.i18n.prop('charge.to_time'));
			$('#duration_label').text($.i18n.prop('charge.duration'));
			$('#from_totalizer_label').text($.i18n.prop('charge.from_totalizer'));
			$('#to_totalizer_label').text($.i18n.prop('charge.to_totalizer'));
			$('#consumption_label').text($.i18n.prop('charge.consumption'));
			$('#amount_label').text($.i18n.prop('charge.amount'));
			$('#charge_status_label').text($.i18n.prop('charge.charge_status'));

			//$('#price_label').text($.i18n.prop('charge.price'));

			$('#search').append($.i18n.prop('operation.refresh'));

			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));

			$('button.inner_operation[value="Y"]').append($.i18n.prop('transmitter.config.operation.select'));
			
			$('#tab1').append($.i18n.prop('charge_record'));
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

	form = $('#charge_record_form');
	criteriaForm = $('#criteria_form');

	// Date
	moment.locale(dashedLanguage.toLowerCase());
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);

	//deferreds.push(createCodeRadio('#charge_status_container', 'chargeStatusId', URLS.CODE.LIST.CHARGE_STATUS, 'id'));

	deferreds.push(
		createCodeSelect2($('#charge_type_id'), URLS.CODE.LIST.CHARGE_TYPE, false, true, false),
		createCodeSelect2($('#charge_status_id'), URLS.CODE.LIST.CHARGE_STATUS, false, true, false) 
	)

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
	
	buildSelect2($('#criteria_parking_garage_id, #criteria_customer_id, #criteria_garage_id, #criteria_parking_card_id'), null, false);
	buildSelect2($('#parking_garage_id, #customer_id, #garage_id, #parking_card_id'), null, false);
	
	//$('.nav-tabs a:first').tab('show');

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
		});
	}));
	
	$.when.apply($, deferreds).then(function() {

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
		
		validator = form.validate({
			rules: {
				communityId: {
					required: true
				},
				parkingGarageId: {
					required: true
				},
				/*
				garageId: {
					required: true
				},
				*/
				amount: {
					required: true, 
					min: 0, max: 9999.9
				},
			}
		});
		
		editForm = form.editForm({
			form: form,
			table: tableElement,
			dataTable: table,
			validator: validator, 
			saveUrl: URLS.CHARGE.SAVE,
			removeUrl: URLS.CHARGE.DELETE, 
			afterPopulate: function() {
				var data = editForm.formData();
				/*
				if ((data.parkingCard) && (data.parkingCard.id)) {
					$('#parking_card_id').val(data.parkingCard.id).trigger('change');
				}
				else {
					$('#parking_card_id').val('').trigger('change');
				}

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

				if ((data.chargeType) && (data.chargeType.id)) {
					$('#charge_type_id').val(data.chargeType.id).trigger('change');
				}
				else {
					$('#charge_type_id').val('').trigger('change');
				}
				$('input[name="chargeStatusId"][value="{0}"]'.format(data.chargeStatus.id)).iCheck('check');
				*/
				$('#charge_type_id').val(data.chargeTypeId ? data.chargeTypeId : "").trigger('change');
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				$('#parking_garage_id').val(data.parkingGarageId ? data.parkingGarageId : "").trigger('change');
				$('#customer_id').val(data.garage.customerId ? data.garage.customerId : "").trigger('change');
				$('#garage_id').val(data.garageId ? data.garageId : "").trigger('change');
				$('#parking_card_id').val(data.parkingCardId ? data.parkingCardId : "").trigger('change');
				//$('#charge_status_id').val(data.chargeStatusId ? data.chargeStatusId : "").trigger('change');
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
			
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
		});
		
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, $('#criteria_garage_id'));
		});

		$('#criteria_customer_id').on('change', function(e) {
			activeCriteriaCustomerId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaCustomerId, $('#criteria_garage_id'), null);
		});
		
		$('#criteria_garage_id').on('change', function(e) {
			activeGarageId = changeGarage(criteriaForm.serializeObject(), $(this), activeCriteriaGarageId, $('#criteria_parking_card_id'));
		});
		
		$('#community_id').on('change', function(e) {
			//activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), $('#customer_id'), null);
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), null, null);
		});

		$('#parking_garage_id').on('change', function(e) {
			activeParkingGarageId = changeParkingGarage(editForm.formData(), $(this), activeParkingGarageId, null, $('#customer_id'));
		});

		$('#customer_id').on('change', function(e) {
			activeCustomerId = changeCustomer(editForm.formData(), $(this), activeCustomerId, $('#garage_id'), null);
		});
		
		$('#garage_id').on('change', function(e) {
			activeGarageId = changeGarage(editForm.formData(), $(this), activeGarageId, $('#parking_card_id'));
		});
		
		$('button.card_expander').cardExpander({expanded: false});
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
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});

	deferreds.push(
		ajaxPost(URLS.CHARGE.QUERY, data)
		.done(function(json) {
			if ((json) && (json.data) && (json.data.length)) {
				callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
				if (table.data().any()) {
					var tableRow = $('tbody tr:first', tableElement);
					if (tableRow) tableRow.trigger('click');
				}
			}
			else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
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
