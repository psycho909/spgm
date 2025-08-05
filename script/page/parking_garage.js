/*
requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'jquery-serialize', 'editForm', 'jquery-serialize', 'jquery-validate-messages', 'card-switcher'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 5000
	});
	app.initialize(function() {
		if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
		refresh();
	});
});
*/
initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

var editForm;
var language;
var table;
var tableElement;
var garageTable;
var garageTableElement;
var chargingPileTable; 
var chargingPileTableElement;

var form;
var validator;

var criteriaForm;
var criteriaValidator;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'community-message', 'parking_garage-message', 'garage-message', 'charging_pile-message', 'customer-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('parking_garage');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_basic_information').text($.i18n.prop('breadcrumb.basic_information'));
			$('#breadcrumb_configuration_parking_garage').text(APPLICATION.documentTitle);
			*/
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			//$('#criteria_building_id_label, #building_id_label').text($.i18n.prop('building'));
			$('#criteria_name_label').text($.i18n.prop('parking_garage.name'));
			
			$('#no_label').text($.i18n.prop('parking_garage.no'));
			$('#name_label').text($.i18n.prop('parking_garage.name'));
			$('#address_label').text($.i18n.prop('parking_garage.address'));
			$('#note_label').text($.i18n.prop('parking_garage.note'));
			$('#service_note_label').text($.i18n.prop('parking_garage.service_note'));

			$('#type_id_label').text($.i18n.prop('parking_garage.type'));
			$('#category_id_label').text($.i18n.prop('parking_garage.category'));
			$('#model_id_label').text($.i18n.prop('parking_garage.model'));
			$('#elevator_type_id_label').text($.i18n.prop('parking_garage.elevator_type'));
			$('#door_type_id_label').text($.i18n.prop('parking_garage.door_type'));
			$('#option_id_label').text($.i18n.prop('parking_garage.option'));

			$('#status_label').text($.i18n.prop('community.status'));
			$('#status0_label').append($.i18n.prop('status.active'));
			$('#status1_label').append($.i18n.prop('status.inactive'));

			$('#refresh').append($.i18n.prop('operation.refresh'));
			
			/*
			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			*/

			$('button.inner_operation[value="Y"]').append($.i18n.prop('transmitter.config.operation.select'));
			
			$('#tab1').append($.i18n.prop('parking_garage'));
			$('#tab2').append($.i18n.prop('garage'));
			$('#tab3').append($.i18n.prop('charging_pile'));
			
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

	/*
	$('#status_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});
	*/
	
	// Date
	moment.locale(language);

	deferreds.push(createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	deferreds.push(createCodeCheckbox('#type_container', 'typeId', URLS.CODE.LIST.PARKING_GARAGE_TYPE, 'id'));
	deferreds.push(createCodeCheckbox('#category_container', 'categoryId', URLS.CODE.LIST.PARKING_GARAGE_CATEGORY, 'id'));

	deferreds.push(createCodeSelect2($('#model_id'), URLS.CODE.LIST.PARKING_GARAGE_MODEL, false, true, false));
	deferreds.push(createCodeSelect2($('#elevator_type_id'), URLS.CODE.LIST.ELEVATOR_TYPE, false, true, false));
	//deferreds.push(createCodeSelect2($('#door_type_id'), URLS.CODE.LIST.DOOR_TYPE, false, true, false));
	deferreds.push(createCodeCheckbox('#door_type_id_container', 'doorTypeId', URLS.CODE.LIST.DOOR_TYPE, 'id'));
	deferreds.push(createCodeCheckbox('#option_id_container', 'optionId', URLS.CODE.LIST.OPTION, 'id'));

	if ((APPLICATION.user) && (APPLICATION.user.organization)) {
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
	}
	
	$('.nav-tabs a:first').tab('show');
	
	tableElement = $('#table');
	garageTableElement = $('#garage_table');
	chargingPileTableElement = $('#charging_pile_table');

	//var height = configTableHeight(tableElement, true, false);

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
				{"data": "no", "title": $.i18n.prop('parking_garage.no'), "sortable": true, 'width': 40},
				{"data": "name", "title": $.i18n.prop('parking_garage.name'), "sortable": true, 'width': 100}, 
				{"data": 'community', "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": "address", "title": $.i18n.prop('parking_garage.address'), "sortable": false, 'width': 200}, 
				{"data": null, "title": "", "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender}
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": "no", "title": $.i18n.prop('parking_garage.no'), "sortable": true, 'width': 40},
					{"data": "name", "title": $.i18n.prop('parking_garage.name'), "sortable": true, 'width': 100}, 
					{"data": 'community', "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": "address", "title": $.i18n.prop('parking_garage.address'), "sortable": false, 'width': 200}, 
					{"data": null, "title": "", "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender}
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable 
			})
		);
		
		// 車位
		garageTable = garageTableElement.DataTable(
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
				{"data": "no", "title": $.i18n.prop('garage.no'), "sortable": true, 'width': 40},
				{"data": "name", "title": $.i18n.prop('garage.name'), "sortable": true, 'width': 100},
				{"data": 'customer', "title": $.i18n.prop('customer'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadGarageTable,
			} 
			*/
			getDataTableOptions({
				"columns": [
					{"data": "no", "title": $.i18n.prop('garage.no'), "sortable": true, 'width': 40},
					{"data": "name", "title": $.i18n.prop('garage.name'), "sortable": true, 'width': 100},
					{"data": 'customer', "title": $.i18n.prop('customer'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadGarageTable,
			})
		);
		
		// 充電樁
		chargingPileTable = chargingPileTableElement.DataTable(
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
			"order": [[0, "asc"]],
			"info": true,
			"responsive": false,
			"autoWidth": false,
			"columns": [
				{"data": "no", "title": $.i18n.prop('charging_pile.no'), "sortable": true, 'width': 60},
				{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": true, 'width': 60}, 
				{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadChargingPileTable, 
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": "no", "title": $.i18n.prop('charging_pile.no'), "sortable": true, 'width': 60},
					{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": true, 'width': 60}, 
					{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadChargingPileTable
			}) 
		);
		
	}));
	
	$.when.apply($, deferreds).then(function() {
		
		$('.nav-tabs .nav-link').on('shown.bs.tab', function(e) {
			var tableInTab;
			if ($(e.target).is('#tab2')) tableInTab = garageTable;
			else if ($(e.target).is('#tab3')) tableInTab = chargingPileTable;
			if (tableInTab) {
				tableInTab.responsive.recalc();
				tableInTab.columns.adjust().responsive.recalc();
			}
		});
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {
					requiredid: true
				}
			}
		});

		validator = form.validate({
			rules: {
				communityId: {
					requiredid: true
				},
				no: {
					required: true, 
					minlength: 2, 
					maxlength: 10, 
					remote: {
						url: URLS.PARKING_GARAGE.CHECK_NO,
						type: "post",
						data: {
							no: function() {return $("#no").val();}, 
							id: function() {return $("#id").val();},
							communityId: function() {return $("#community_id").val();}
						}
					}
				},
				name: {
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
			saveUrl: URLS.PARKING_GARAGE.SAVE, 
			deleteUrl: URLS.PARKING_GARAGE.DELETE, 
			afterPopulate: function() {
				var data = editForm.formData();

				if (data.communityId) $('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				if (data.modelId) $('#model_id').val(data.modelId ? data.modelId : "").trigger('change');
				if (data.elevatorTypeId) $('#elevator_type_id').val(data.elevatorTypeId ? data.elevatorTypeId : "").trigger('change');

				$('input[name="typeId"]').iCheck('uncheck');
				if (data.types) {
					data.types.forEach(e => {
						$('#typeId{0}'.format(e.featureId)).iCheck('check');
					});
				}
				$('input[name="typeId"').iCheck('update');

				$('input[name="categoryId"]').iCheck('uncheck');
				if (data.categories) {
					data.categories.forEach(e => {
						$('#categoryId{0}'.format(e.featureId)).iCheck('check');
					});
				}
				$('input[name="categoryId"').iCheck('update');

				$('input[name="doorTypeId"]').iCheck('uncheck');
				if (data.doorTypes) {
					data.doorTypes.forEach(e => {
						$('#doorTypeId{0}'.format(e.featureId)).iCheck('check');
					});
				}
				$('input[name="doorTypeId"').iCheck('update');

				$('input[name="optionId"]').iCheck('uncheck');
				if (data.options) {
					data.options.forEach(e => {
						$('#optionId{0}'.format(e.featureId)).iCheck('check');
					});
				}
				$('input[name="optionId"').iCheck('update');
				
				//$('input[name="status"]').iCheck('update');
				
				if (garageTable) garageTable.ajax.reload();
				if (chargingPileTable) chargingPileTable.ajax.reload();
			},
			beforeSave: function(saving) {
				saving.types = [];
				saving.categories = [];
				saving.doorTypes = [];
				saving.options = [];
				$('input[name="typeId"]:checked', form).each((index, checkbox) => {
					saving.types.push({"featureId": $(checkbox).val()});
				});
				$('input[name="categoryId"]:checked', form).each((index, checkbox) => {
					saving.categories.push({"featureId": $(checkbox).val()});
				});
				$('input[name="doorTypeId"]:checked', form).each((index, checkbox) => {
					saving.doorTypes.push({"featureId": $(checkbox).val()});
				});
				$('input[name="optionId"]:checked', form).each((index, checkbox) => {
					saving.options.push({"featureId": $(checkbox).val()});
				});
			}, 
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);
		
		$('#refresh').on('click', refresh);
	
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

	data.parameters = criteriaForm.serializeObject();
	
	deferreds.push(
		ajaxPost(URLS.PARKING_GARAGE.QUERY, data)
		.done(function(json) {
			if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
			else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});

			if (table.data().any()) {
				var tableRow;
				if ((editForm) && (editForm.activeRow)) {
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

function loadGarageTable(data, callback, settings) {
	if (!$('#id').val()) return;
	data.parameters = {"parkingGarageId": $('#id').val()};
	
	ajaxPost(URLS.GARAGE.QUERY, data)
	.done(function(json) {
		if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	});
}

function loadChargingPileTable(data, callback, settings) {
	if (!$('#id').val()) return;
	data.parameters = {"parkingGarageId": $('#id').val()};
	
	ajaxPost(URLS.CHARGING_PILE.QUERY, data)
	.done(function(json) {
		if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	});
}

function refresh(e) {
	if (e) e.preventDefault();
	criteriaForm.valid();
	if (criteriaValidator.numberOfInvalids() > 0) return;
	
	var communityId = $('#criteria_community_id').val();
	if ((communityId) && (communityId != APPLICATION.data.activeCommunityId)) {
		APPLICATION.data.activeCommunityId = communityId;
	}
	saveDataCookie();
	
	if (table) table.ajax.reload();
}
