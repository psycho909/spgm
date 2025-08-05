initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

var language;
var table;
var tableElement;

var criteriaForm;
var criteriaValidator;

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCriteriaCustomerId;
var activeCriteriaGarageId;

var fromDate;
var toDate;
var datesPicker;
var planServiceTimePicker;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'user-message', 'community-message', 'parking_garage-message', 'garage-message', 'reserve-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('reserve.record');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_reserve_record').text(APPLICATION.documentTitle);
			*/
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#dates_label').text($.i18n.prop('reserve.time'));

			$('#refresh').append($.i18n.prop('operation.refresh'));

			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";
	applyLayoutOption({'showQueryCriteriaCard': true, 'showQueryResultCard': true});

	var deferred = $.Deferred();
	var deferreds = [];
	
	var dashedLanguage = language.replace('_', '-');

	criteriaForm = $('#criteria_form');

	// Date
	moment.locale(dashedLanguage.toLowerCase());
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);

	deferreds.push(
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id, #community_id'), data, true);
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		})
	);	
	
	buildSelect2($('#criteria_parking_garage_id, #criteria_customer_id, #criteria_garage_id'), null, false);

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
			"order": [[0, "asc"]],
			"orderClasses": false, 
			"info": true,
			"autoWidth": false,
			"columns": [
				{"data": "no", "title": $.i18n.prop('reserve.no'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "reserveTime", "title": $.i18n.prop('reserve.time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "user", "title": $.i18n.prop('user'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
				{"data": "community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": "parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
				{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": false, 'width': 40},
				{"data": "customer", "title": $.i18n.prop('customer'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
				{"data": "serviceType.description", "title": $.i18n.prop('reserve.service.type'), "sortable": false, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "planServiceTime", "title": $.i18n.prop('reserve.service.time.plan'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "realServiceTime", "title": $.i18n.prop('reserve.service.time.real'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "reserveStatus.description", "title": $.i18n.prop('reserve.status'), "sortable": false, 'width': 80, "className": 'min-tablet-p'}, 
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
					{"data": "no", "title": $.i18n.prop('reserve.no'), "sortable": true, 'width': 80, "className": 'min-tablet-p'}, 
					{"data": "reserveTime", "title": $.i18n.prop('reserve.time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
					{"data": "user", "title": $.i18n.prop('user'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
					{"data": "community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": "parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
					{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": false, 'width': 40},
					{"data": "customer", "title": $.i18n.prop('customer'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender},
					{"data": "serviceType.description", "title": $.i18n.prop('reserve.service.type'), "sortable": false, 'width': 80, "className": 'min-tablet-p'}, 
					{"data": "planServiceTime", "title": $.i18n.prop('reserve.service.time.plan'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
					{"data": "realServiceTime", "title": $.i18n.prop('reserve.service.time.real'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
					{"data": "reserveStatus.description", "title": $.i18n.prop('reserve.status'), "sortable": false, 'width': 80, "className": 'min-tablet-p'}, 
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

		$('#criteria_customer_id').on('change', function(e) {
			activeCriteriaCustomerId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaCustomerId, $('#criteria_garage_id'), null);
		});

		$('#refresh').on('click', refresh);
		
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
		ajaxPostJson(URLS.RESERVATION.QUERY, data)
		.done(function(json) {
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
	}
	saveDataCookie();
	
	if (table) table.ajax.reload();
}
