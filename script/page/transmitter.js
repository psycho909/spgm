requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'editForm', 'jquery-serialize', 'jquery-validate-messages'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 5000
	});	
	app.initialize(function() {
		if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	});
});

var nowTimer;
var language;

var form;
var validator;
var editForm;
var table;
var tableElement;

var chargingPileTable; 
var chargingPileTableElement;

var organizationId;
var lastOrganizationId;
var transmitterId;

var criteriaForm;
var criteriaValidator;

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCommunityId;
var activeParkingGarageId;

var registerTimePicker;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'organization-message', 'parking_garage-message', 'community-message', 'garage-message', 'transmitter-message', 'charging_pile-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('transmitter');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_basic_information').text($.i18n.prop('breadcrumb.basic_information'));
			$('#breadcrumb_configuration_transmitter').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));
			
			$('#transmitter_form_title').text($.i18n.prop('operation.input'));
			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_device_no_label').text($.i18n.prop('transmitter.device_no'));
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#no_label').text($.i18n.prop('transmitter.no'));
			$('#brand_label').text($.i18n.prop('transmitter.brand'));
			$('#brand_label').text($.i18n.prop('transmitter.brand'));
			$('#model_no_label').text($.i18n.prop('transmitter.model_no'));
			$('#device_no_label').text($.i18n.prop('transmitter.device_no'));
			$('#register_time_label').text($.i18n.prop('transmitter.register_time'));
			$('#note_label').text($.i18n.prop('transmitter.note'));
			$('#status_label').text($.i18n.prop('status'));
			/*
			$('.status_active').append($.i18n.prop('status.active'));
			$('.status_inactive').append($.i18n.prop('status.inactive'));
			*/
			
			/*	
			$('#add').append($.i18n.prop('operation.add'));
			$('#update').append($.i18n.prop('operation.update'));
			$('#remove').append($.i18n.prop('operation.remove'));
			$('#cancel').append($.i18n.prop('operation.cancel'));
			$('#save').append($.i18n.prop('operation.save'));
			*/
			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));
			/*
			$('#transmitter_table_title').text($.i18n.prop('transmitter.table.title'));
			$('#transmitter_table_header_name').text($.i18n.prop('transmitter.name'));
			$('#transmitter_table_header_water_no').text($.i18n.prop('transmitter.no'));
			//$('#transmitter_table_header_sendInterval').text($.i18n.prop('transmitter.sendInterval'));
			$('#transmitter_table_header_note').text($.i18n.prop('transmitter.note'));
			$('#transmitter_table_header_status').text($.i18n.prop('transmitter.status'));
			*/
			$('#tab1').append($.i18n.prop('transmitter'));
			$('#tab2').append($.i18n.prop('charging_pile'));

			$('#refresh').append($.i18n.prop('operation.query'));
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";

	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	var nowTimer = setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);

	var dashedLanguage = language.replace('_', '-');

	form = $('#form');
	criteriaForm = $('#criteria_form');

	/*
	$('#status_container').iCheck({
		tap: true,
		radioClass: 'iradio_square-blue' 
	});
	*/
	
	deferreds.push(createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	deferreds.push(createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')));
	
	var registerTimePicker = createDatePicker($('#register_time'), moment(), true, true);

	deferreds.push(
		/*
		ajaxGet(URLS.COMMUNITY.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			$('#criteria_community_id, #community_id').select2({
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
		}), 
		*/
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id, #community_id'), data, true);
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}), 
	);

	buildSelect2($('#criteria_parking_garage_id, #parking_garage_id'), null, false);
	
	// Table
	var tableElement = $('#table');
	var chargingPileTableElement = $('#charging_pile_table');
	
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable({
			"language": getDataTablesLanguage(),
			"paging": true,
			'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": true,
			"searching": false,
			"ordering": true,
			"orderClasses": false, 
			"order": [[1, "asc"]],
			"info": true,
			"autoWidth": false,
			"columns": [
				{"data": null, "title": "", "sortable": false, 'width': 30, "render": dataTableHelper.render.commonButtonRender},
				{"data": "no", "title": $.i18n.prop('transmitter.no'), "sortable": true, 'width': 60},
				{"data": 'deviceNo', "title": $.i18n.prop('transmitter.device_no'), "sortable": true, 'width': 80},
				{"data": "community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": "parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
				{"data": 'id', "visible": false} 
			],
			"deferLoading": 0,
			"processing": false,
			"serverSide": true,
			"scrollCollapse": true,
			"scroller": true,
			"ajax": loadTable
		});
		
		// 充電樁
		chargingPileTable = chargingPileTableElement.DataTable({
			"data": null, 
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
		});
		
	}));

	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
	
	$.when.apply($, deferreds).then(function() {
		
		criteriaValidator = criteriaForm.validate({
			rules: {
				organizationId: {
					min: 1, 
					required: true 
				}
			}
		});
	
		validator = form.validate({
			onkeyup: function (element) {
				return element.id != 'no';
			},			
			rules: {
				organizationId: {
					min: 1, 
					required: true 
				},
				no: {
					required: true, 
					minlength: 2, 
					maxlength: 10, 
					remote: {
						url: URLS.TRANSMITTER.CHECK_NO,
						type: "post",
						data: {
							no: function() {return $("#no").val();}, 
							id: function() {return $("#id").val();}
						}
					}
				},
				status: {
					required: true
				}
			},
			messages: {
				no: {
					remote: $.i18n.prop('validation.duplicate')
				}
			}
		});
		
		editForm = form.editForm({
			form: form,
			table: $('#table'),
			dataTable: table,
			validator: validator, 
			saveUrl: URLS.TRANSMITTER.SAVE, 
			removeUrl: URLS.TRANSMITTER.REMOVE,
			/*
			loadData: function(action, activeRow) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						id: 0,
						status: 1
					});
				}
			},
			*/
			afterPopulate: function(action) {
				var data = editForm.formData();
				$('#organization_id').val((data.organizationId) ? data.organizationId : "").trigger('change');
				$('#community_id').val((data.communityId) ? data.communityId : "").trigger('change');
				$('#parking_garage_id').val((data.parkingGarageId) ? data.parkingGarageId : "").trigger('change');
				$('input[name="status"]').iCheck('update');
				if (chargingPileTable) chargingPileTable.ajax.reload();
			}
		});
		
		editForm.process(CONSTANT.ACTION.INQUIRY);
		
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), null, null);
		});
		
		$('#community_id').on('change', function(e) {
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), null, null);
		});
		
		$('#refresh').on('click', refresh);
		
		deferred.resolve();
	});

	return deferred.promise();
}

function loadTable(data, callback, settings) {
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.query') + ' ' + $.i18n.prop('operation.waiting') 
	});
	
	data.parameters = criteriaForm.serializeObject();
	
	ajaxPost(URLS.TRANSMITTER.QUERY, data)
	.done(function(json) {
		if ((json) && (json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	})
	.always(function() {
		toast.close();
	});
}

function loadChargingPileTable(data, callback, settings) {
	
	if (!$('#id').val()) return;
	data.parameters = {
		"parkingGarageId": $('#id').val()
	};
	
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
	
	var organizationId = $('#criteria_organization_id').val();
	if (organizationId != APPLICATION.data.activeOrganizationId) {
		APPLICATION.data.activeOrganizationId = organizationId;
	}
	saveDataCookie();
	
	if (table) table.ajax.reload(function() {
		if (table.data().any()) $('#table tbody tr:first').trigger('click');
	}, false);
}
