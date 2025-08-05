initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

var editForm;
var language;
var form;
var criteriaForm;
var table;
var tableElement;

var fromDate;
var toDate;
var datesPicker;
var validator;
var criteriaValidator;

var activeCriteriaCommunityId;
var activeCommunityId;
var activeCriteriaCustomerId;
var activeCustomerId;
/*
var activeCriteriaParkingGarageId;
var activeParkingGarageId;
*/

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', 'parking_garage-message', 'user-message', 'blacklist-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('blacklist');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_charge').text($.i18n.prop('breadcrumb.charge'));
			$('#breadcrumb_bill').text(APPLICATION.documentTitle);
			*/
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			//$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#criteria_reason_id_label, #reason_id_label').text($.i18n.prop('blacklist.reason'));
			$('#dates_label').text($.i18n.prop('blacklist.from_time'));
			$('#user_id_label').text($.i18n.prop('user'));
			$('#from_time_label').text($.i18n.prop('blacklist.from_time'));
			$('#to_time_label').text($.i18n.prop('blacklist.to_time'));
			$('#note_label').text($.i18n.prop('blacklist.note'));
			$('#prohibit_reservation_label').text($.i18n.prop('blacklist.prohibit.reservation'));
			$('#prohibit_charging_label').text($.i18n.prop('blacklist.prohibit.charging'));
			$('#prohibit_parking_label').text($.i18n.prop('blacklist.prohibit.parking'));
			$('#notification_time_label').text($.i18n.prop('blacklist.notification_time'));

			$('#criteria_status_label, #status_label').text($.i18n.prop('status'));

			$('#search').append($.i18n.prop('operation.refresh'));
			/*
			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
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

	$('input[type="checkbox"].icheck').iCheck({
		checkboxClass: 'icheckbox_square-blue', 
		tap: true
	});			

	// Date
	moment.locale(dashedLanguage.toLowerCase());
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);
	$('#dates').val('');
	/*
	var fromTime = moment().add(1, 'days').set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}).format(APPLICATION.SETTING.defaultDateTimeFormat);
	fromTimePicker = createDatePicker($('#from_time'), fromTime, true, true);
	var toTime = moment().add(7, 'days').set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}).format(APPLICATION.SETTING.defaultDateTimeFormat);
	toTimePicker = createDatePicker($('#to_time'), toTime, true, true);
	*/

	deferreds.push(createCodeRadio('#criteria_status_container, #status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	
	deferreds.push(
		ajaxGetJson(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id, #community_id'), data, true);
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}), 
	);
	
	//buildSelect2($('#criteria_parking_garage_id, #parking_garage_id'), null, false);
	buildSelect2($('#criteria_customer_id, #customer_id'), null, false);
	
	//deferreds.push(createCustomerSelect($('#customer_id'), $('#criteria_customer_id'), $('#criteria_customer_id_container')));
	deferreds.push(createCodeSelect2($('#reason_id, #criteria_reason_id'), URLS.CODE.LIST.BLACKLIST_REASON, true, true, false));

	tableElement = $('#table');

	//var height = configTableHeight(tableElement, true, false);

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
			"orderClasses": false, 
			"ordering": true, 
			"order": [[1, "asc"]],
			"info": true,
			"autoWidth": false,
			"columns": [
				{"data": null, "title": "", "sortable": false, 'width': 30, "render": dataTableHelper.render.commonButtonRender},
				{"data": "fromTime", "title": $.i18n.prop('blacklist.from_time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "toTime", "title": $.i18n.prop('blacklist.to_time'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
				{"data": "community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": "customer", "title": $.i18n.prop('customer'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": "reason.description", "title": $.i18n.prop('blacklist.reason'), "sortable": false, 'width': 80, "className": 'min-tablet-p'}, 
				{"data": "status", "title": $.i18n.prop('blacklist.status'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.statusRender}, 
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
					{"data": "fromTime", "title": $.i18n.prop('blacklist.from_time'), "sortable": true, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
					{"data": "toTime", "title": $.i18n.prop('blacklist.to_time'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.dateTimeRender}, 
					{"data": "community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": "customer", "title": $.i18n.prop('customer'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": "reason.description", "title": $.i18n.prop('blacklist.reason'), "sortable": false, 'width': 80, "className": 'min-tablet-p'}, 
					{"data": "status", "title": $.i18n.prop('blacklist.status'), "sortable": false, 'width': 80, "className": 'min-tablet-p', "render": dataTableHelper.render.statusRender}, 
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
		
		$('input[name="status"]:first', criteriaForm).iCheck('check').iCheck('update');

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
				customerIdid: {
					min: 1,
					required: true
				},
				fromTime: {
					required: true
				},
				toTime: {
					required: true
				},
				reasonId: {
					required: true
				}
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
			saveUrl: URLS.BLACKLIST.SAVE, 
			removeUrl: URLS.BLACKLIST.DELETE, 
			afterPopulate: function() {
				var data = editForm.formData();
				$('#customer_id').val(data.customerId ? data.customerId : "").trigger('change');
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				$('#reason_id').val(data.reasonId ? data.reasonId : "").trigger('change');

				$('input[name=prohibitParking]').iCheck((data.prohibitParking) ? 'check' : 'uncheck');
				$('input[name=prohibitCharging]').iCheck((data.prohibitCharging) ? 'check' : 'uncheck');
				$('input[name=prohibitReservation]').iCheck((data.prohibitReservation) ? 'check' : 'uncheck');

				$('.icheck').iCheck('update');
			}
		});

		editForm.process(CONSTANT.ACTION.INQUIRY);

		$('#criteria_community_id').on('change', function(e) {
			//activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, null, $('#criteria_customer_id'), null);
		});

		$('#community_id').on('change', function(e) {
			//activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), $('#customer_id'), null);
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, null, $('#customer_id'), null);
		});
			
		$('#customer_id').on('change', function(e) {
			activeCustomerId = changeCustomer(editForm.formData(), $(this), activeCustomerId, null, $('#user_id'));
		});
			
		$('#search').on('click', refresh);
		
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

	if ($('#dates').val()) {
		var dates = $('#dates').val().split(APPLICATION.SETTING.dateRangeSeparator);
		$('#criteria_from_time').val(dates[0] + ' 00:00:00'); 
		$('#criteria_to_time').val(dates[1] + ' 23:59:59'); 
	}
	else {
		$('#criteria_from_time').val(''); 
		$('#criteria_to_time').val(''); 
	}

	data.parameters = criteriaForm.serializeObject();
	delete data.parameters.dates;

	deferreds.push(
		ajaxPostJson(URLS.BLACKLIST.QUERY, data)
		.done(function(json) {
			if ((json) && (json.data)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
			else callback({'data': null, 'recordsTotal': 0, 'recordsFiltered': 0});
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
