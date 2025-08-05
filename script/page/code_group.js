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
	app.initialize();
});
*/
initialPage(function() {
	refresh();
});

var language;

var form;
var criteriaForm;

var table;
var tableElement;
var codeTable;
var editForm;
var validator;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'code_group-message', 'code-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('code_group');
			$('#title_section').text($.i18n.prop('code_group'));
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));
			
			$('#tab1').append($.i18n.prop('code_group'));
			$('#tab2').append($.i18n.prop('code'));

			$('#criteria_no_label, #no_label').text($.i18n.prop('code_group.no'));
			$('#code_label').text($.i18n.prop('code_group.code'));
			$('#criteria_description_label, #description_label').text($.i18n.prop('code_group.description'));
			$('#system_used_label').text($.i18n.prop('code_group.system_used'));
			$('#system_used_yes_label').append($.i18n.prop('yes'));
			$('#system_used_no_label').append($.i18n.prop('no'));
			$('#status_label').text($.i18n.prop('status'));
			$('#status_active').append($.i18n.prop('status.active'));
			$('#status_inactive').append($.i18n.prop('status.inactive'));
			
			$('#refresh').append($.i18n.prop('operation.refresh'));

			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	//"use strict";
	applyLayoutOption();

	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));
	
	$('#status_container, #system_used_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});
	//
	var yesNoRender = function(data, type, row) {
		return '<i class="' + (data ? 'fa fa-check text-success' : '') + '"></i>';
	};
	
	// Table
	tableElement = $('#table');
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable(
			/*
			{
			"language": getDataTablesLanguage(),
			"paging": false,
			'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": false,
			"searching": false,
			"ordering": true,
			"orderClasses": false, 
			"order": [[1, "asc"]],
			"info": true,
			"autoWidth": false,
			"columns": [
				{"data": null, "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
				{"data": "no", "title": $.i18n.prop('code_group.no'), "sortable": false, 'width': 80},
				{"data": 'description', "title": $.i18n.prop('code_group.description'), "sortable": false, 'width': 150},
				{"data": 'systemUsed', "title": $.i18n.prop('code_group.system_used'), "sortable": false, 'width': 60, "render": yesNoRender},
				{"data": 'status', "title": $.i18n.prop('code_group.status'), "status": false, 'width': 60, "render": dataTableHelper.render.statusRender},
				{"data": 'id', "visible": false} 
			],
			"deferLoading": 0,
			"processing": false,
			"serverSide": true,
			"ajax": loadTable
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": "no", "title": $.i18n.prop('code_group.no'), "sortable": false, 'width': 80},
					{"data": 'description', "title": $.i18n.prop('code_group.description'), "sortable": false, 'width': 150},
					{"data": 'systemUsed', "title": $.i18n.prop('code_group.system_used'), "sortable": false, 'width': 60, "render": yesNoRender},
					{"data": 'status', "title": $.i18n.prop('code_group.status'), "status": false, 'width': 60, "render": dataTableHelper.render.statusRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);
		
		codeTable = $('#code_table').DataTable(
			/*
			{
			"language": getDataTablesLanguage(),
			"paging": true,
			'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": true,
			"searching": false,
			"ordering": true,
			"orderClasses": false, 
			"order": [[0, "asc"]],
			"info": true,
			"autoWidth": false,
			"columns": [
				{"data": "no", "title": $.i18n.prop('code.no'), "sortable": false, 'width': 40},
				{"data": 'description', "title": $.i18n.prop('code.description'), "sortable": false, 'width': 100},
				{"data": 'sortOrder', "title": $.i18n.prop('code.sort_order'), "sortable": false, 'width': 40},
				{"data": 'status', "title": $.i18n.prop('code.status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender}, 
				{"data": 'id', "visible": false} 
			],
			"deferLoading": 0,
			"processing": false,
			"serverSide": true,
			"ajax": loadCodeTable
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": "no", "title": $.i18n.prop('code_group.no'), "sortable": false, 'width': 80},
					{"data": 'description', "title": $.i18n.prop('code_group.description'), "sortable": false, 'width': 150},
					//{"data": 'systemUsed', "title": $.i18n.prop('code_group.system_used'), "sortable": false, 'width': 60, "render": yesNoRender},
					{"data": 'status', "title": $.i18n.prop('code_group.status'), "status": false, 'width': 60, "render": dataTableHelper.render.statusRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadCodeTable
			})
		);
		
	}));
	
	$.when.apply($, deferreds).then(function() {

		$('.nav-tabs .nav-link').on('shown.bs.tab', function(e) {
			var tableInTab;
			if ($(e.target).is('#tab2')) tableInTab = codeTable;
			if (tableInTab) {
				tableInTab.responsive.recalc();
				tableInTab.columns.adjust().responsive.recalc();
			}
		});
		
		validator = form.validate({
			rules: {
				no: {
					required: true,
				},
				description: {
					required: true
				}
			}
		});

		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = $('#form').editForm({
			form: form,
			table: $('#table'),
			dataTable: table, 
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.CODE_GROUP.SAVE, 
			load: function(action) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						id: 0,
						status: 1,
						systemUsed: false
					});
				}
			},
			afterPopulate: function() {
				//var data = editForm.formData();
				$('input[name="systemUsed"]').iCheck('update');
				$('input[name="status"]').iCheck('update');
				if (codeTable) codeTable.ajax.reload();
			}
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);

		$('#refresh').on('click', refresh);

		deferred.resolve();
	});
	//
	return deferred.promise();
}
//
function loadTable(data, callback, settings) {
	data.parameters = criteriaForm.serializeObject();
	ajaxPost(URLS.CODE_GROUP.QUERY, data)
	.done(function(json) {
		if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	});
}

function loadCodeTable(data, callback, settings) {
	if (!$('#no').val()) return;
	
	ajaxGet(URLS.CODE.LIST.ROOT + "/" + $('#no').val(), null)
	.done(function(json) {
		if ((json) && (json.length)) callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	})
}

function refresh(e) {
	if (e) e.preventDefault();
	if (table) table.ajax.reload(function() {
		if (table.data().any()) {
			$('#table tbody tr:first').trigger('click');
		}
	}, false);
}
