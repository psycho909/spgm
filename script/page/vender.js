/*
requirejs(['moment', 'sweetalert2', 'app', 'adminlte', 'pace', 'datatables.net-responsive', 'datatables-helper', 'select2-maxheight', 'icheck', 'form-control', 'editForm', 'jquery-validate-messages'], function(moment, swal) {
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
*/
initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	refresh();
});

var language;

var form;
var editForm;
var validator;
var currentTab;
var saveCount;

var criteriaForm;
var criteriaValidator;

var table;
var tableElement;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'vender-message', 'organization-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('vender');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_basic_information').text($.i18n.prop('breadcrumb.basic_information'));
			$('#breadcrumb_vender').text(APPLICATION.documentTitle);
			*/
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));
			
			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('organization'));
			$('#no_label').text($.i18n.prop('vender.no'));
			$('#name_label').text($.i18n.prop('vender.name'));
			$('#short_name_label').text($.i18n.prop('vender.name.short'));
			$('#address_label').text($.i18n.prop('vender.address'));
			$('#status_label').text($.i18n.prop('status'));

			$('#contact_label').text($.i18n.prop('vender.contact'));
			$('#phone_no_label').text($.i18n.prop('vender.phone_no'));
			$('#mobile_phone_no_label').text($.i18n.prop('vender.mobile_phone_no'));
			$('#email_label').text($.i18n.prop('vender.email'));
			$('#refresh').append($.i18n.prop('operation.query'));
			/*
			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			*/
			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));
			$('#organization_id_label').text($.i18n.prop('terms.organization'));
			
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
	
	deferreds.push(createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	deferreds.push(createOrganizationSelect($('#criteria_organization_id, #organization_id')));

	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));
	
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
			"searching": false,
			"orderClasses": false, 
			"ordering": true,
			"order": [[1, "asc"]],
			"info": true,
			"scrollX": true, 
			"autoWidth": false,
			"columns": [
				{"data": null, "sortable": false, 'width': 50, "render": dataTableHelper.render.commonButtonRender}, 
				{"data": 'no', "title": $.i18n.prop('vender.no'), "sortable": false, "visible": true, 'width': 60},
				{"data": "shortName", "title": $.i18n.prop('vender.name.short'), "sortable": false, 'width': 100},
				{"data": 'contact', "title": $.i18n.prop('vender.contact'), "sortable": false, "visible": true, 'width': 150},
				{"data": 'phoneNo', "title": $.i18n.prop('vender.phone_no'), "sortable": false, "visible": true, 'width': 80},
				{"data": 'mobilePhoneNo', "title": $.i18n.prop('vender.mobile_phone_no'), "sortable": false, "visible": true, 'width': 100},
				{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
				{"data": 'id', "visible": false} 
			],
			"deferLoading": 0,
			"processing": false,
			"serverSide": true,
			"stateSave": true,
			"ajax": loadTable
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": 'no', "title": $.i18n.prop('vender.no'), "sortable": false, "visible": true, 'width': 60},
					{"data": "shortName", "title": $.i18n.prop('vender.name.short'), "sortable": false, 'width': 100},
					{"data": 'contact', "title": $.i18n.prop('vender.contact'), "sortable": false, "visible": true, 'width': 150},
					{"data": 'phoneNo', "title": $.i18n.prop('vender.phone_no'), "sortable": false, "visible": true, 'width': 80},
					{"data": 'mobilePhoneNo', "title": $.i18n.prop('vender.mobile_phone_no'), "sortable": false, "visible": true, 'width': 100},
					{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		)
	
	}));
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
	
	$.when.apply($, deferreds).then(function() {

		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				organizationId: {
					requiredid: true 
				}
			}
		});
		
		validator = form.validate({
			rules: {
				organizationId: {
					requiredid: true 
				}, 
				no: {
					required: true, 
					minlength: 2, 
					maxlength: 10, 
					remote: {
						url: URLS.VENDER.CHECK_NO,
						type: "post",
						data: {
							no: function() {return $("#no").val();}, 
							id: function() {return $("#id").val();}
						}
					}
				},
				name: {
					required: true,
					minlength: 3,
					maxlength: 50
				},
				title: {
					required: true,
					minlength: 3,
					maxlength: 100
				},
				address: {
					maxlength: 100
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
			saveUrl: URLS.VENDER.SAVE,
			removeUrl: URLS.VENDER.DELETE, 
			loadData: function(action, activeRow) {
				if (action == CONSTANT.ACTION.ADD) {
					var organizationId = $('#criteria_organization_id').val() ? $('#criteria_organization_id').val() : APPLICATION.data.activeOrganizationId;
					editForm.formData({
						'id': 0,
						'organizationId': organizationId, 
						'status': 1
					});
				}
			},
			afterPopulate: function() {
				var data = editForm.formData();
				$('#organization_id').val(data.organizationId ? data.organizationId : "").trigger('change');
			}
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);
			
		$('#refresh').on('click', refresh);
		
		deferred.resolve();
		
	})

	return deferred.promise();
}

function loadTable(data, callback, settings) {
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.query') + ' ' + $.i18n.prop('operation.waiting') 
	});
	
	data.parameters = criteriaForm.serializeObject();
	
	ajaxPost(URLS.VENDER.QUERY, data)
	.done(function(json) {
		if ((json) && (json.data) && (json.data.length)) {
			callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
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
	})
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
