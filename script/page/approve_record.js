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
var dateTimeFormat;
var approveTimePicker;
var editForm;
var language;
var form;

var table;
var tableElement;

var approveHistoryTable;
var serviceRecordTable;
var serviceItemTable;

var communities;
var buildings;
var parkingGarages;
var parkingGarageTypes;
var parkingGarageCategories;

var fromDate;
var toDate;
var datesPicker;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'approve_record-message', 'service_record-message', 'service_item-message', 'customer-message', 'community-message', 'building-message', 'parking_garage-message', 'garage-message', 'parking_card-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('approve_record');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_service').text($.i18n.prop('breadcrumb.service'));
			$('#breadcrumb_approve_record').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('terms.organization'));
			$('#criteria_service_by_label').text($.i18n.prop('service_record.service_by'));
			$('#criteria_status_label').text($.i18n.prop('approve_record.approve_status'));
			$('#criteria_status1_label').append($.i18n.prop('approve_record.approving'));
			$('#criteria_status2_label').append($.i18n.prop('approve_record.all'));
			$('#dates_label').text($.i18n.prop('service_record.service_time'));

			$('#form_title').text($.i18n.prop('operation.input'));

			$('#approve_expire_label').text($.i18n.prop('approve_record.approve_expire'));
			$('#approve_time_label').text($.i18n.prop('approve_record.approve_time'));
			$('#actual_approve_by_label').text($.i18n.prop('approve_record.actual_approve_by'));
			$('#original_status_label').text($.i18n.prop('approve_record.original_status'));
			$('#approve_status_label').text($.i18n.prop('approve_record.approve_status'));
			$('#comment_label').text($.i18n.prop('approve_record.comment'));

			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="V"]').append($.i18n.prop('approve_record.approve'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));

			$('#parking_garage_type_id_label').text($.i18n.prop('parking_garage.type'));
			$('#parking_garage_category_id_label').text($.i18n.prop('parking_garage.category'));

			$('#organization_name_label').text($.i18n.prop('terms.organization'));
			$('#community_name_label').text($.i18n.prop('community'));
			//$('#building_name_label').text($.i18n.prop('building'));
			$('#parking_garage_name_label').text($.i18n.prop('parking_garage'));


			$('#service_time_label').text($.i18n.prop('service_record.service_time'));
			$('#service_by_name_label').text($.i18n.prop('service_record.service_by'));
			$('#note_label').text($.i18n.prop('service_record.note'));
			$('#service_status_label').text($.i18n.prop('service_record.status'));

			$('#refresh').append($.i18n.prop('operation.refresh'));

			$('#tab1').append($.i18n.prop('approve_record'));
			$('#tab2').append($.i18n.prop('service_record'));
			$('#tab3').append($.i18n.prop('service_item'));
			$('#tab4').append($.i18n.prop('service_record.photo'));
			$('#tab5').append($.i18n.prop('approve_record.history'));

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

	$('.nav-tabs a:first').tab('show');
	
	dateTimeFormat = APPLICATION.SETTING.defaultDateTimeFormat;

	var nowTimer = setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);

	form = $('#approve_record_form');

	// Date
	moment.locale(language);
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);
	
	$('#criteria_status_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});

	/*
	deferreds.push(ajaxGetJson(URLS.CODE.LIST.SERVICE_STATUS, null, function(json) {
		var approveAction = $('#approve_action');
		approveAction.empty();
		if (json) {
			for (var i = 0; i < json.length; i++) {
				approveAction.append('<li><a class="dropdown-item" href="#">{0}-{1}}</a></li>'.format(json[i].no, json[i].description));
			}
			approveAction.trigger('change');
		}
	}));
	*/

	deferreds.push(createCodeCheckbox('#parking_garage_type_container', 'parkingGarageTypeId', URLS.CODE.LIST.PARKING_GARAGE_TYPE, 'id'));

	deferreds.push(ajaxGetJson(URLS.CODE.LIST.APPROVE_ACTION, null, function(json) {
		var approveAction = $('#approve_action');
		approveAction.empty();
		if (json) {
			for (var i = 0; i < json.length; i++) {
				approveAction.append('<li><a class="dropdown-item" href="#" value="{0}">{1}-{2}</a></li>'.format(json[i].id, json[i].no, json[i].description));
			}
			approveAction.trigger('change');
		}
	}));

	var approveTime = moment().add(1, 'days').set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}).format(APPLICATION.SETTING.defaultDateTimeFormat);
	approveTimePicker = $('#service_time').daterangepicker(
		{
			startDate: approveTime,
			endDate: approveTime,
			timePicker: true,
			singleDatePicker: true,
			timePicker24Hour: true,
			timePickerSeconds: false,
			timePickerIncrement: 60,
			locale: {
				format: dateTimeFormat,
				separator: APPLICATION.SETTING.dateRangeSeparator,
				applyLabel: $.i18n.prop('operation.confirm'),
				cancelLabel: $.i18n.prop('operation.cancel')
			}
		}
	);

	deferreds.push(createCodeCheckbox('#parking_garage_type_container', 'parkingGarageTypeId', URLS.CODE.LIST.PARKING_GARAGE_TYPE, 'id'));

	deferreds.push(ajaxPostJson(URLS.ORGANIZATION.LIST, null, function(json) {
		var data = [];
		if (json) {
			data.push({'id': '', 'text': ''});
			for (var i = 0; i < json.length; i++) {
				data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
			}
		}
		$('#criteria_organization_id, #organization_id').select2({
			data: data,
			maximumSelectionSize: 1,
			allowClear: true,
			closeOnSelect: true,
			theme: 'bootstrap4', 
			placeholder: $.i18n.prop('operation.choose')
		}).maximizeSelect2Height();
	}));

	deferreds.push(ajaxGetJson(URLS.USER.LIST, null, function(json) {
		var data = [];
		if (json) {
			data.push({'id': '', 'text': ''});
			for (var i = 0; i < json.length; i++) {
				data.push({'id': json[i].id, 'text': json[i].displayName});
			}
		}
		$('#criteria_service_by').select2({
			data: data,
			maximumSelectionSize: 1,
			allowClear: true,
			closeOnSelect: true,
			theme: 'bootstrap4', 
			placeholder: $.i18n.prop('operation.choose')
		}).maximizeSelect2Height();
	}));

	deferreds.push(ajaxGetJson(URLS.PARKING_GARAGE_CATEGORY.LIST, null)
		.done(function(json) {
			var element = $('#parking_garage_category_container');
			for (var i = 0; i < json.length; i++) {
				element.append('<label for="{0}{1}"><input type="checkbox" name="{0}" id="{0}{1}" value="{3}" />&nbsp;{2}</label>&nbsp;&nbsp;'.
					format('parkingGarageCategoryId', i + 1, json[i].no + '-' + json[i].name, json[i].id));
			}
			element.iCheck({
				checkboxClass: 'icheckbox_square-blue' 
			});
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}
	));

	var propertyRender = function(data, type, row) {
		try {
			if (data) return data;
			else return '';
		}
		catch (e) {}
	}; 

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		
		tableElement = $('#table');

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
				{"data": "approveTime", 'title': $.i18n.prop('approve_record.approve_time'), 'width': 80, "sortable": false, 'width': 80},
				{"data": "originalStatus.description", "title": $.i18n.prop('approve_record.original_status'), "sortable": true, 'width': 60, "render": propertyRender},
				{"data": "approveStatus.description", "title": $.i18n.prop('approve_record.approve_status'), "sortable": true, 'width': 60, "render": propertyRender},
				{"data": "serviceRecord.no", "title": $.i18n.prop('service_record.no'), "sortable": true, 'width': 60},
				{"data": "serviceRecord.serviceTime", "title": $.i18n.prop('service_record.service_time'), "sortable": true, 'width': 80},
				{"data": "serviceRecord.parkingGarage.community.name", "title": $.i18n.prop('community'), "sortable": true, 'width': 200},
				//{"data": "serviceRecord.parkingGarage.building.name", "title": $.i18n.prop('building'), "sortable": true, 'width': 80},
				{"data": "serviceRecord.parkingGarage.name", "title": $.i18n.prop('parking_garage'), "sortable": true, 'width': 100},
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
		});
		
		var checkStatusRender = function(data, type, row) {
			if (!row) return '';
			return ('<input type="radio" class="btn-check" name="checkStatus{0}" id="check_status_{0}_1" value="{0}" autocomplete="off" checked> \
			<label class="btn btn-sm btn-outline-success service_item_radio" for="check_status_{0}_1"><ion-icon name="checkmark-circle-outline"></ion-icon></label> \
			<input type="radio" class="btn-check" name="checkStatus{0}" id="check_status_{0}_2" value="{0}" autocomplete="off"> \
			<label class="btn btn-sm btn-outline-danger service_item_radio" for="check_status_{0}_2"><ion-icon name="close-circle-outline"></ion-icon></label> \
			<input type="radio" class="btn-check" name="checkStatus{0}" id="check_status_{0}_3" value="{0}" autocomplete="off"> \
			<label class="btn btn-sm btn-outline-dark service_item_radio" for="check_status_{0}_3"><ion-icon name="remove-circle-outline"></ion-icon></label>').format(row.id);
		};
	
		serviceItemTable = $('#service_item_table').DataTable({
			"language": getDataTablesLanguage(),
			"paging": false,
			"lengthChange": false,
			"searching": false,
			"ordering": false,
			//"order": [[1, "asc"]],
			"info": true,
			"autoWidth": false,
			//"scrollX": true, 
			"columns": [
				{"data": null, 'title': $.i18n.prop('service_item.check_status'), 'width': 40, "sortable": false, 'width': 80, "render": checkStatusRender},
				{"data": 'no', 'title': $.i18n.prop('service_item.no'), 'width': 60, "sortable": false},
				{"data": "name", 'title': $.i18n.prop('service_item.name'), 'width': 200, "sortable": false},
				{"data": 'id', "visible": false} 
			],
			"deferLoading": 0,
			"processing": false,
			"serverSide": true,
			"stateSave": true,
			"ajax": loadServiceItemTable
		});

		
		approveHistoryTable = $('#approve_history_table').DataTable({
			"language": getDataTablesLanguage(),
			"paging": false,
			"lengthChange": false,
			"searching": false,
			"ordering": false,
			//"order": [[1, "asc"]],
			"info": true,
			"autoWidth": false,
			//"scrollX": true, 
			"columns": [
				{"data": "approveTime", 'title': $.i18n.prop('approve_record.approve_time'), 'width': 80, "sortable": false, 'width': 80},
				{"data": 'actualApproveBy.displayName', 'title': $.i18n.prop('approve_record.actual_approve_by'), 'width': 60, "sortable": false},
				{"data": "approveStatus.description", 'title': $.i18n.prop('approve_record.approve_status'), 'width': 60, "sortable": false},
				{"data": "comment", 'title': $.i18n.prop('approve_record.comment'), 'width': 200, "sortable": false},
				{"data": 'id', "visible": false} 
			],
			"deferLoading": 0,
			"processing": false,
			"serverSide": true,
			"stateSave": true,
			"ajax": loadApproveHistoryTable
		});


	}));
	//
	$.when.apply($, deferreds).then(function() {

		$('.nav-tabs a:first').tab('show');

		$('#refresh').on('click', function(e) {
			e.preventDefault();
			refresh();
		});

		var validator = form.validate({
			rules: {
				"dates": {
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
				if (data.serviceRecord.organization.id) $('#organization_name').val(data.serviceRecord.organization.name).trigger('change');
				else $('#organization_name').val('').trigger('change');

				if (data.serviceRecord.serviceTime) $('#service_time').val(data.serviceRecord.serviceTime).trigger('change');
				else $('#service_time').val('').trigger('change');

				if (data.serviceRecord.serviceStatus.id) $('#service_status_description').val(data.serviceRecord.serviceStatus.description).trigger('change');
				else $('#service_status_description').val('').trigger('change');

				if (data.serviceRecord.serviceBy.id) $('#service_by_name').val(data.serviceRecord.serviceBy.displayName);
				else $('#service_by_name').val('').trigger('change');

				if (data.actualApproveBy.id) $('#actual_approve_by').val(data.actualApproveBy.displayName).trigger('change');
				else $('#actual_approve_by').val('').trigger('change');

				if ((data.originalStatus) && (data.originalStatus.id)) $('#original_status').val(data.originalStatus.description).trigger('change');
				else $('#original_status').val('').trigger('change');

				if ((data.approveStatus) && (data.approveStatus.id)) $('#approve_status').val(data.approveStatus.description).trigger('change');
				else $('#approve_status').val('').trigger('change');

				if (data.serviceRecord.parkingGarage.id) {
					$('#parking_garage_name').val(data.serviceRecord.parkingGarage.name).trigger('change');
					if (data.serviceRecord.parkingGarage.building.id) {
						$('#building_name').val(data.serviceRecord.parkingGarage.building.name).trigger('change');
						if (data.serviceRecord.parkingGarage.building.community.id) $('#community_name').val(data.serviceRecord.parkingGarage.building.community.name).trigger('change');
						else $('#community_name').val('').trigger('change');
					}
					else {
						$('#building_name').val('').trigger('change');
					}
				}
				else {
					$('#parking_garage_name').val('').trigger('change');
				}

				$('input[name="parkingGarageTypeId"]').iCheck('uncheck');
				if (data.serviceRecord.parkingGarageTypes) {
					data.serviceRecord.parkingGarageTypes.forEach(parkingGarageType => {
						$('#parkingGarageTypeId{0}'.format(parkingGarageType.id)).iCheck('check');
					});
				}
				$('input[name="parkingGarageTypeId"').iCheck('update');

				$('input[name="parkingGarageCategoryId"]').iCheck('uncheck');
				if (data.serviceRecord.parkingGarageCategories) {
					data.serviceRecord.parkingGarageCategories.forEach(parkingGarageCategory => {
						$('#parkingGarageCategoryId{0}'.format(parkingGarageCategory.id)).iCheck('check');
					});
				}
				$('input[name="parkingGarageCategoryId"').iCheck('update');

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
		//	
		deferred.resolve();
	});
	//
	return deferred.promise();
}

function loadTable(data, callback, settings) {
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});

	deferreds.push(
		ajaxGetJson(URLS.APPROVE_RECORD.APPROVING, data)
		.done(function(json) {
			if ((json) && (json.length)) callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
			else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});

			if (table.data().any()) {
				var tableRow;
				if ((editForm) && (editForm.activeRow)) {d
					tableRow = $('tbody tr:eq({0})'.format(editForm.activeRow.index()), tableElement);
				}
				else {
					tableRow = $('tbody tr:first', tableElement);
				}
				if (tableRow) tableRow.trigger('click');
			}
		})
	);

	$.when.apply($, deferreds).then(function() {
		toast.close();
	});

}

function loadServiceItemTable(data, callback, settings) {
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});
	//
	deferreds.push(
		ajaxGetJson(URLS.SERVICE_ITEM.LIST, null)
		.done(function(json) {
			if ((json) && (json.length)) {
				for (var i = 0; i < json.length; i++) {
					json[i].checkStatus = 0;
				}
				callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
			}
			else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
		})
	);

	$.when.apply($, deferreds).then(function() {
		toast.close();
	});

}

function loadApproveHistoryTable(data, callback, settings) {
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});
	//
	deferreds.push(
		ajaxGetJson(URLS.APPROVE_RECORD.HISTORY, null)
		.done(function(json) {
			if ((json) && (json.length)) {
				callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
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
	if (table) table.ajax.reload();
	if (serviceItemTable) serviceItemTable.ajax.reload();
	if (approveHistoryTable) approveHistoryTable.ajax.reload();
}
