initialPage(function() {
	//if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

var language;

var form;
var validator;
var editForm;
var table;
var tableElement;

//var chargingPileTable; 
//var chargingPileTableElement;

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
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'organization-message', 'parking_garage-message', 'community-message', 'garage-message', 'device-message', 'vender-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('device');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_basic_information').text($.i18n.prop('breadcrumb.basic_information'));
			$('#breadcrumb_deviec').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));
			
			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_device_no_label, #device_no_label').text($.i18n.prop('device.device_no'));
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_vender_id_label, #vender_id_label').text($.i18n.prop('vender'));
			$('#device_category_id_label').text($.i18n.prop('device.category'));
			$('#no_label').text($.i18n.prop('device.no'));
			$('#brand_label').text($.i18n.prop('device.brand'));
			$('#model_no_label').text($.i18n.prop('device.model'));
			$('#internet_ip_label').text($.i18n.prop('device.ip.internet'));
			$('#intranet_ip_label').text($.i18n.prop('device.ip.intranet'));
			$('#intranet_ip_label').text($.i18n.prop('device.ip.intranet'));
			$('#station_no_label').text($.i18n.prop('device.station_no'));
			$('#register_time_label').text($.i18n.prop('device.register_time'));
			$('#note_label').text($.i18n.prop('device.note'));
			$('#status_label').text($.i18n.prop('status'));

			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));

			$('#refresh').append($.i18n.prop('operation.query'));
			
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

	deferreds.push(
		createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'),
		//createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')), 
		createCodeSelect2($('#device_category_id'), URLS.CODE.LIST.DEVICE_CATEGORY, true, true, false), 
		createVenderSelect($('#criteria_vender_id'), true), 
		createVenderSelect($('#criteria_vender_id, #vender_id'), true)
	);
	
	var registerTimePicker = createDatePicker($('#register_time'), moment(), true, true);

	deferreds.push(
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
	//var chargingPileTableElement = $('#charging_pile_table');
	
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable(
			/*
			{
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
				{"data": "no", "title": $.i18n.prop('device.no'), "sortable": true, 'width': 60},
				{"data": 'deviceCategory', "title": $.i18n.prop('device.category'), "sortable": false, "visible": true, 'width': 60, "render": dataTableHelper.render.codeRender},
				{"data": 'deviceNo', "title": $.i18n.prop('device.device_no'), "sortable": true, 'width': 80},
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
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": "no", "title": $.i18n.prop('device.no'), "sortable": true, 'width': 60},
					{"data": 'deviceCategory', "title": $.i18n.prop('device.category'), "sortable": false, "visible": true, 'width': 60, "render": dataTableHelper.render.codeRender},
					{"data": 'deviceNo', "title": $.i18n.prop('device.device_no'), "sortable": true, 'width': 80},
					{"data": "community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": "parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
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
				communityId: {
					requiredid: true 
				}
			}
		});
	
		validator = form.validate({
			onkeyup: function (element) {
				return element.id != 'no';
			},			
			rules: {
				/*
				organizationId: {
					min: 1, 
					required: true 
				},
				*/
				no: {
					required: true, 
					minlength: 2, 
					maxlength: 14, 
					remote: {
						url: URLS.DEVICE.CHECK_NO,
						type: "post",
						data: {
							no: function() {return $("#no").val();}, 
							id: function() {return $("#id").val();}
						}
					}
				},
				deviceNo: {
					minlength: 2, 
					maxlength: 20, 
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
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = form.editForm({
			form: form,
			table: $('#table'),
			dataTable: table,
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.DEVICE.SAVE, 
			removeUrl: URLS.DEVICE.REMOVE,
			loadData: function(action, activeRow) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						id: 0,
						status: 1
					});
				}
			}, 
			afterPopulate: function(action) {
				var data = editForm.formData();
				//$('#organization_id').val((data.organizationId) ? data.organizationId : "").trigger('change');
				$('#community_id').val((data.communityId) ? data.communityId : "").trigger('change');
				$('#parking_garage_id').val((data.parkingGarageId) ? data.parkingGarageId : "").trigger('change');
				$('#vender_id').val((data.venderId) ? data.venderId : "").trigger('change');
				//$('input[name="status"]').iCheck('update');
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
	
	ajaxPost(URLS.DEVICE.QUERY, data)
	.done(function(json) {
		if ((json) && (json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	})
	.always(function() {
		toast.close();
	});
}

function refresh(e) {
	if (e) e.preventDefault();
	
	if (!criteriaForm.valid()) return false;
	
	var organizationId = $('#criteria_organization_id').val();
	if (organizationId != APPLICATION.data.activeOrganizationId) {
		APPLICATION.data.activeOrganizationId = organizationId;
	}
	saveDataCookie();
	
	if (table) table.ajax.reload(function() {
		if (table.data().any()) $('#table tbody tr:first').trigger('click');
	}, false);
}
