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
	/*
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
	*/
});

var language;

var form;
var criteriaForm;

var table;
var editForm;
var validator;
var criteriaValidator;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'code-message', 'code_group-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('code');
			$('#title_section').text($.i18n.prop('code'));

			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_code_group_id_label, #code_group_id_label').text($.i18n.prop('code_group'));
			$('#criteria_no_label, #no_label').text($.i18n.prop('code.no'));
			$('#sort_order_label').text($.i18n.prop('code.sort_order'));
			//$('#criteria_description_label, #description_label').text($.i18n.prop('code.description'));
			$('#description_label').text($.i18n.prop('code.description'));
			/*
			$('#system_used_label').text($.i18n.prop('code.system_used'));
			$('#system_used_yes_label').append($.i18n.prop('yes'));
			$('#system_used_no_label').append($.i18n.prop('no'));
			*/
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
	
	"use strict";
	applyLayoutOption({'showQueryCriteriaCard': true, 'showQueryResultCard': true});

	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	form = $('#form');
	criteriaForm = $('#criteria_form');
	
	showOperationButtons($('.operation_container'));
	
	deferreds.push(
		ajaxGet(URLS.CODE_GROUP.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '0', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].no, 'text': json[i].no + '-' + json[i].description});
				}
			}
			$('#criteria_code_group_id').select2({
				data: data,
				maximumSelectionSize: 1,
				allowClear: true,
				closeOnSelect: true,
				theme: 'bootstrap4',
				placeholder: $.i18n.prop('operation.choose')
			}).maximizeSelect2Height();
			
			data = [];
			data.push({'id': '0', 'text': $.i18n.prop('operation.choose')});
			for (var i = 0; i < json.length; i++) {
				data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].description});
			}
			$('#code_group_id').select2({
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

	$('#status_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});
	
	// Table
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = $('#table').DataTable(
			/*
			{
			"language": getDataTablesLanguage(),
			"paging": false,
			"lengthChange": false,
			"searching": false,
			"ordering": false, 
			"order": [[1, "asc"]],
			"info": true,
			"autoWidth": false,
			"columns": [
				{"data": null, "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
				//{"data": 'codeGroup.no', "title": $.i18n.prop('code_group.no'), "sortable": false, 'width': 40},
				//{"data": 'codeGroup.description', "title": $.i18n.prop('code_group.description'), "sortable": false, 'width': 100},
				{"data": "no", "title": $.i18n.prop('code.no'), "sortable": true, 'width': 40},
				{"data": 'description', "title": $.i18n.prop('code.description'), "sortable": false, 'width': 100},
				{"data": 'sortOrder', "title": $.i18n.prop('code.sort_order'), "sortable": false, 'width': 40},
				{"data": 'status', "title": $.i18n.prop('code.status'), "status": false, 'width': 60, "render": dataTableHelper.render.statusRender},
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
					{"data": "no", "title": $.i18n.prop('code.no'), "sortable": true, 'width': 40},
					{"data": 'description', "title": $.i18n.prop('code.description'), "sortable": false, 'width': 100},
					{"data": 'sortOrder', "title": $.i18n.prop('code.sort_order'), "sortable": false, 'width': 40},
					{"data": 'status', "title": $.i18n.prop('code.status'), "status": false, 'width': 60, "render": dataTableHelper.render.statusRender},
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
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
	
	$.when.apply($, deferreds).then(function() {

		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				codeGroupId: {
					required: true
				}
			}
		});

		validator = form.validate({
			rules: {
				codeGroupId: {
					required: true
				}, 
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
			saveUrl: URLS.CODE.SAVE, 
			load: function(action) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						id: 0,
						status: 1
					});
				}
			},
			afterPopulate: function() {
				var data = editForm.formData();
				if (data.codeGroupId) $('#code_group_id').val(data.codeGroupId).trigger('change');
				$('input[name="status"]').iCheck('update');
			},
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
	var no = $('#criteria_code_group_id').val();
	if (!no) return;
	ajaxGet(URLS.CODE.LIST.ROOT + "/" + no, null)
	.done(function(json) {
		if ((json) && (json.length)) callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	});
}
//
function refresh(e) {
	if (!criteriaForm.valid()) return false;
	if (e) e.preventDefault();
	if (table) table.ajax.reload(function() {
		if (table.data().any()) {
			$('#table tbody tr:first').trigger('click');
		}
	}, false);
}
