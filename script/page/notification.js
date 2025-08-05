initialPage(function() {
	//if (APPLICATION.user) $('#criteria_user_id').val(APPLICATION.data.user.id).trigger('change');
	refresh();
});

var language;
var fromDate;
var toDate;
var table;
var tableElement;
var form;
var editForm;
var datesPicker;
var dateFormat;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'notification-message', 'customer-message', 'user-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: true,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('notification');
			$('#title_section').text($.i18n.prop('notification'));
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#notification_form_title').text($.i18n.prop('notification'));
			
			$('#criteria_organization_id_label').text($.i18n.prop('terms.organization'));
			$('#criteria_user_id_label').text($.i18n.prop('user'));
			$('#date_label').text($.i18n.prop('notification.create_time'));

			

			$('#create_time_label').text($.i18n.prop('notification.create_time'));
			$('#send_time_label').text($.i18n.prop('notification.send_time'));
			$('#organization_name_label').text($.i18n.prop('organization.name'));
			$('#customer_name_label').text($.i18n.prop('customer.name'));
			$('#recipient_label').text($.i18n.prop('notification.receiver'));
			$('#subject_label').text($.i18n.prop('notification.subject'));
			$('#content_label').text($.i18n.prop('notification.content'));
			//$('#status_label').text($.i18n.prop('notification.status'));

			$('#refresh').append($.i18n.prop('operation.refresh'));
			//$('#mark_read').append($.i18n.prop('notification.mark.read'));
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";
	//applyLayoutOption({'showQueryCriteriaCard': false, 'showQueryCriteriaHeader': false, 'showQueryResultCard': true, 'showQueryResultHeader': false});
	applyLayoutOption();

	form = $('#form');
	showOperationButtons($('.operation_container'), {add: false, update: false, delete: false, save: false, cancel: false, backToList: true});
	
	var dashedLanguage = language.replace('_', '-');
	
	var deferred = $.Deferred();
	var deferreds = [];
	
	moment.locale(dashedLanguage.toLowerCase());
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);
	
	//deferreds.push(createCodeSelect2($('#status'), URLS.CODE.LIST.NOTIFICATION_STATUS, false, true, false));

	/*	
	deferreds.push(createOrganizationSelect($('#criteria_organization_id'), null, $('#criteria_organization_id_container')));
	deferreds.push(createOrganizationSelect($('#criteria_user_id'), null, $('#criteria_user_id_container')));
	*/
	/*
	var notifiedRender = function(data, type, row) {
		return '<input type="checkbox" class="icheck" name="notified" value="{0}" {1}/>'.format(data, data ? 'checked' : '');
	};
	*/
	var readedRender = function(data, type, row) {
		//return '<input type="checkbox" class="icheck" name="readed" value="{0}" {1}/>'.format(data, data ? 'checked' : '');
		return data ? '<i class="readed fas fa-lg fa-check-square text-primary"></i>' : '<i class="readed fas fa-lg fa-square text-primary"></i>';
	};
	
	var contentRender = function(data, type, row) {
		return (data) && (data.length > 30) ? data.substring(0, 29) + '...' : data;
	};
	
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		var dataTableTranslation = getDataTableTranslation(language);
		tableElement = $('#table');
		table = tableElement.DataTable({
			"language": getDataTablesLanguage(),
			"paging": true,
			//'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": false,
			"searching": false,
			"ordering": true,
			"order": [[1, "desc"]],
			"orderClasses": false, 
			"info": false,
			"stateSave": false,
			//"responsive": false,
			"autoWidth": false,
			"columns": [
				//{"data": "notified", "title": $.i18n.prop('notification.notified'), "sortable": false, "render": notifiedRender, "width": 40, "className": "min-mobile-p"},
				{"data": "readed", "title": $.i18n.prop('notification.read'), "sortable": false, "render": readedRender, "width": 40, "className": "min-mobile-p", "class": "text-center"},
				{"data": "createTime", "title": $.i18n.prop('notification.create_time'), "sortable": true, "render": dataTableHelper.render.dateTimeRender, "width": 120, "className": "min-mobile-p"},
				//{"data": "sendTime", "title": $.i18n.prop('notification.send_time'), "sortable": true, "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
				{"data": "subject", "title": $.i18n.prop('notification.subject'), "sortable": false, "width": 100, "className": "min-mobile-p"}, 
				{"data": "textContent", "title": $.i18n.prop('notification.content'), "sortable": false, "render": contentRender, "width": 200, "className": "min-mobile-p"}, 
				//{"data": "organization", "title": $.i18n.prop('organization'), "sortable": false, "render": dataTableHelper.render.aliasRender, "width": 60, "className": "min-mobile-p"},
				//{"data": "customer", "title": $.i18n.prop('customer'), "sortable": false, "render": dataTableHelper.render.nameRender, "width": 80, "className": "min-mobile-p"},
				//{"data": "receiver", "title": $.i18n.prop('notification.receiver'), "sortable": false, "render": dataTableHelper.render.nameRender, "width": 80, "className": "min-mobile-p"},
				//{"data": "sendTime", "title": $.i18n.prop('notification.send_time'), "sortable": false, "render": dataTableHelper.render.dateTimeRender, "width": 40, "className": "min-mobile-p"},
				//{"data": "severity", "sortable": false, "width": 40, "className": "min-mobile-p"},
				//{"data": "status", "title": $.i18n.prop('notification.status'), "sortable": false, "width": 100, "className": "min-mobile-p"}
				{"data": "priorityDescription", "title": $.i18n.prop('notification.priority'), "sortable": false, "width": 40, "className": "min-mobile-p"},
			],
			"deferLoading": 0,
			"processing": false, 
			"serverSide": true,
			"ajax": loadTable
		});	
	}));

	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));

	$.when.apply($, deferreds)
	.done(function() {

		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': false, 'import': false, 'export': false});
		
		editForm = form.editForm({
			form: form,
			table: tableElement,
			dataTable: table,
			cardSwitcher: cardSwitcher, 
			afterPopulate: function() {
				var data = editForm.formData();
				/*
				if (data.customer) $('#customer_name').val(data.customer.name);
				else $('#customer_name').val('');
				if (data.organization) $('#organization_name').val(data.organization.name);
				else $('#organization_name').val('');
				*/
				$('#status').val(data.status ? data.status : "").trigger('change');
				//$('input[name="readed"]').val(data.readed ? "1" : "0").iCheck('update');
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
		
		$('button.card_expander').cardExpander({expanded: true});

		$('#refresh').on('click', refresh);

		$('#mark_read').on('click', function(e) {
			if ($('#id').val()) ajaxPost(URLS.NOTIFICATION.UPDATE_READED, [$('#id').val()]);
		});
		
		return deferred.resolve();
	});
	//
	return deferred.promise();
}

function loadTable(data, callback, settings) {
	if (toast) {
		toast.fire({
			type: 'info', 
			title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
		});
	}
	var criteria = form.serializeObject();
	criteria.fromTime = datesPicker.data('daterangepicker').startDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	criteria.toTime = datesPicker.data('daterangepicker').endDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	criteria.userId = APPLICATION.user.id;
	data.parameters = criteria;
	ajaxPostJson(URLS.NOTIFICATION.QUERY, data)
	.done(function(json) {
		if ((json) && (json.data) && (json.data.length)) {
			callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
			if (table.data().any()) {
				tableRow = $('tbody tr:first', tableElement);
				if (tableRow) tableRow.trigger('click');
				$('#table .icheck').iCheck({
					checkboxClass: 'icheckbox_square-blue', 
					tap: true
				});
							
				$('#table tbody').on('click', '.readed', function(e) {
					if (e) e.preventDefault();
					var that = $(this);
					var row = table.row(that.closest('tr'));
					if (row) {
						var data = row.data();
						if (data) {
							data.readed = !data.readed;
							row.data(data);
							row.invalidate();
						
							ajaxPost(URLS.NOTIFICATION.UPDATE_READED, {'id': data.id, 'readed': data.readed}, function(json) {
								if (json.OK) {
									ajaxGet(URLS.NOTIFICATION.COUNT_READING + APPLICATION.user.id, null)
									.done((count) => $('#nav_notification_count').text((count) ? count : 0));
								}
							});
						}
					}
				});
			}
			toast.close();
		}
		else {
			toast.fire({
				type: 'warning', 
				title: $.i18n.prop('operation.empty.result'),
				timer: 5 * 1000
			});
			callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
		}
	});
}

function refresh(e) {
	if (e) e.preventDefault();
	try {
		if (table) table.ajax.reload();
	}
	catch (e) {
		console.log(e);
	}
}
