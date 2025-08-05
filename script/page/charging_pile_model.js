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
var editForm;
var validator;

var criteriaForm;
var criteriaValidator;

var table;
var tableElement;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'charging_pile_model-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('charging_pile_model');
			$('#title_section').text($.i18n.prop('charging_pile_model'));
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_basic_information').text($.i18n.prop('breadcrumb.basic_information'));
			$('#breadcrumb_configuration_charging_pile_model').text(APPLICATION.documentTitle);

			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_no_label, #no_label').text($.i18n.prop('charging_pile_model.no'));
			$('#criteria_name_label, #name_label').text($.i18n.prop('charging_pile_model.name'));
			$('#brand_label').text($.i18n.prop('charging_pile_model.brand'));
			$('#power_type_id_label').text($.i18n.prop('charging_pile_model.power_type'));
			$('#power_connector_type_id_label').text($.i18n.prop('charging_pile_model.power_connector_type'));
			$('#charging_pile_type_id_label').text($.i18n.prop('charging_pile_model.charging_pile_type'));
			$('#status_label').text($.i18n.prop('status'));
			$('#status_active').append($.i18n.prop('status.active'));
			$('#status_inactive').append($.i18n.prop('status.inactive'));
			
			$('#refresh').append($.i18n.prop('operation.refresh'));

			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			
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
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	var dashedLanguage = language.replace('_', '-');

	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));
	
	$('#status_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});

	deferreds.push(createCodeRadio($('#power_type_id_container'), 'powerTypeId', URLS.CODE.LIST.POWER_TYPE));
	deferreds.push(createCodeRadio($('#charging_pile_type_id_container'), 'chargingPileTypeId', URLS.CODE.LIST.CHARGING_PILE_TYPE));
	deferreds.push(createCodeSelect2($('#power_connector_type_id'), URLS.CODE.LIST.POWER_CONNECTOR_TYPE, false, true, false));

	/*
	deferreds.push(ajaxGetJson(URLS.CODE.LIST.POWER_CONNECTOR_TYPE, null, function(json) {
		var data = [];
		if (json) {
			data.push({'id': '', 'text': ''});
			for (var i = 0; i < json.length; i++) {
				data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].description});
			}
		}
		$('#power_connector_type_id').select2({
			data: data,
			maximumSelectionSize: 1,
			allowClear: true,
			closeOnSelect: true,
			theme: 'bootstrap4', 
			placeholder: $.i18n.prop('operation.choose')
		}).maximizeSelect2Height();
	}));
	*/
	
	tableElement = $('#table');
	
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable(
			/*
			{
			"language": getDataTablesLanguage(),
			"paging": true,
			'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": true,
			"orderClasses": false, 
			"ordering": true, 
			"order": [[1, "asc"]],
			"searching": false, 
			"info": true,
			"autoWidth": false,
			"columns": [
				{"data": null, "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
				{"data": "no", "title": $.i18n.prop('charging_pile_model.no'), "sortable": true, 'width': 80},
				{"data": 'name', "title": $.i18n.prop('charging_pile_model.name'), "sortable": false, 'width': 150},
				{"data": 'status', "title": $.i18n.prop('charging_pile_model.status'), "status": false, 'width': 60, "render": dataTableHelper.render.statusRender},
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
					{"data": "no", "title": $.i18n.prop('charging_pile_model.no'), "sortable": true, 'width': 80},
					{"data": 'name', "title": $.i18n.prop('charging_pile_model.name'), "sortable": false, 'width': 150},
					{"data": 'status', "title": $.i18n.prop('charging_pile_model.status'), "status": false, 'width': 60, "render": dataTableHelper.render.statusRender},
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
	
	$.when.apply($, deferreds).then(function() {

		$('#refresh').on('click', refresh);

		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				no: {maxlength: 15}, 
				name: {maxlength: 30}
				/* 
				organizationId: {
					requiredid: true
				}
				*/
			}
		});
		
		var validator = form.validate({
			rules: {
				no: {
					required: true
				}
			}
		});
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = $('#form').editForm({
			form: form,
			table: tableElement,
			dataTable: table,
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.CHARGING_PILE_MODEL.SAVE, 
			removeUrl: URLS.CHARGING_PILE_MODEL.DELETE, 
			afterPopulate: function(action) {
				var data = editForm.formData();
				
				if (data.powerConnectorTypeId) $('#power_connector_type_id').val(data.powerConnectorTypeId).trigger('change');
				else $('#power_connector_type_id').val('').trigger('change');

				if (action == CONSTANT.ACTION.ADD) {
					$('input[name="chargingPileTypeId"]:first').iCheck('check');
					$('input[name="powerTypeId"]:first').iCheck('check');
				}
				
				$('input[name="chargingPileTypeId"]').iCheck('update');
				$('input[name="powerTypeId"]').iCheck('update');
				$('input[name="status"]').iCheck('update');
			}
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);
		//
		deferred.resolve();
	});
	//
	return deferred.promise();
}
//
function loadTable(data, callback, settings) {
	ajaxGet(URLS.CHARGING_PILE_MODEL.LIST, null)
	.done(function(json) {
		if ((json) && (json.length)) callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	});
}
//
function refresh(e) {
	if (e) e.preventDefault();
	if (!criteriaForm.valid()) return false;
	if (table) table.ajax.reload(function() {
		if (table.data().any()) {
			$('#table tbody tr:first').trigger('click');
		}
	}, false);
}
