requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'jquery-serialize', 'jquery-validate-messages', 'lightbox'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 300 * 1000
	});	
	app.initialize();
});

var validator;
var nowTimer;
var language;
var fromDate;
var toDate;
var table;
var form;
var datesPicker;
var dateFormat;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'user_record-message', 'organization-message', 'user-message', 'entity-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: true,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('user_record');
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_other').text($.i18n.prop('term.other'));
			$('#breadcrumb_user_record').text($.i18n.prop('user_record'));
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			//
			$('#title_section').text($.i18n.prop('user_record'));
			
			$('#date_label').text($.i18n.prop('user_record.request_time'));

			$('#criteria_organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_user_id_label').text($.i18n.prop('user'));
			$('#criteria_entity_id_label').text($.i18n.prop('entity'));
			
			$('#refresh').append($.i18n.prop('operation.refresh'));
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";

	form = $('#criteria_form');
	var dashedLanguage = language.replace('_', '-');
	
	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	moment.locale(dashedLanguage.toLowerCase());
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);

	deferreds.push(createOrganizationSelect($('#criteria_organization_id'), null, $('#criteria_organization_id_container')));

	deferreds.push(createUserSelect($('#criteria_user_id'), null, $('#criteria_user_id_container')));

	deferreds.push(
		ajaxGetJson(URLS.ENTITY.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			$('#criteria_entity_id').select2({
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

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		var dataTableTranslation = getDataTableTranslation(language);
		table = $('#table').DataTable({
			"language": getDataTablesLanguage(),
			"paging": true,
			'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": true,
			"searching": false,
			"ordering": false,
			"info": true,
			"stateSave": false,
			"responsive": true,
			"autoWidth": false,
			"columns": [
				{"data": "requestTime", "sortable": false, "title": $.i18n.prop('user_record.request_time'), "render": dataTableHelper.render.dateTimeRender, "width": 60, "className": "min-mobile-p"},
				{"data": "action.description", "sortable": false, "title": $.i18n.prop('user_record.action'), "width": 100, "className": "min-mobile-p"},
				{"data": "operation.description", "sortable": false, "title": $.i18n.prop('user_record.operation'), "width": 40, "className": "min-mobile-p"},
				{"data": "ip", "sortable": false, "title": 'IP', "width": 40, "className": "min-mobile-p"},
				{"data": "user.displayName", "sortable": false, "title": $.i18n.prop('user'), "width": 100, "className": "min-mobile-p"},
				{"data": "entity.name", "sortable": false, "title": $.i18n.prop('entity'), "width": 100, "className": "min-mobile-p"},
				{"data": "primaryKey", "sortable": false, "title": $.i18n.prop('user_record.primary_key'), "width": 100, "className": "min-mobile-p"},
				{"data": "recordCount", "sortable": false, "title": $.i18n.prop('user_record.record_count'), "width": 40, "className": "min-mobile-p"}
			],
			"deferLoading": 0,
			"processing": false, 
			"serverSide": true,
			"ajax": loadTable
		});	
	}));

	var nowTimer = setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));

	validator = form.validate({
		rules : {
			dates : {
				required : true
			}
		}
	});
	configValidator(validator);
	
	$.when.apply($, deferreds)
	.done(function() {
		$('#refresh').on('click', function(e) {
			e.preventDefault();			
			refresh();
		});
		return deferred.resolve();
	});

	return deferred.promise();
}

function loadTable(data, callback, settings) {
	var date = $('#dates').val();
	if (!date) return;
	var criteria = {};
	if (dates) {
		criteria.fromDate = dates[0] + ' 00:00:00';
		criteria.toDate = dates[1] + ' 23:59:59';
	}
	data.parameters = criteria;
	ajaxPostJson(URLS.USER_RECORD.LIST, data)
	.done(function(json) {
		if ((json) && (json.length)) {
			callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
		} else {
			callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		toast.close();
	});
}
//
function refresh() {
	try {
		if (table) {
			table.ajax.reload();
		}
	}
	catch (e) {
		console.log(e);
	}
}
