initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	refresh();
});

var editForm;
var language;

var form;
var validator;

var criteriaForm;
var criteriaValidator;

var table;
var contactTable;
var communityTable;
var tableElement;
var communityTableElement;
var contactTableElement; 

var constructionCompanies;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'construction_company-message', 'community-message', 'contact-message', 'address-message', 'city-message', 'district-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('construction_company');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_basic_information').text($.i18n.prop('breadcrumb.basic_information'));
			$('#breadcrumb_information_community').text(APPLICATION.documentTitle);
			*/
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_name_label').text($.i18n.prop('construction_company.name'));
			
			$('#no_label').text($.i18n.prop('construction_company.no'));
			$('#name_label').text($.i18n.prop('construction_company.name'));
			$('#short_name_label').text($.i18n.prop('construction_company.name.short'));
			$('#phone_no_label').text($.i18n.prop('construction_company.phone'));
			$('#fax_no_label').text($.i18n.prop('construction_company.fax'));
			$('#address_label').text($.i18n.prop('construction_company.address'));
			$('#note_label').text($.i18n.prop('construction_company.note'));

			$('#status_label').text($.i18n.prop('community.status'));

			$('#search').append($.i18n.prop('operation.refresh'));

			/*
			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			$('button.inner_operation[value="Y"]').append($.i18n.prop('transmitter.config.operation.select'));
			*/
			
			$('#tab1').append($.i18n.prop('construction_company'));
			$('#tab2').append($.i18n.prop('contact'));
			$('#tab3').append($.i18n.prop('community'));

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

	form = $('#construction_company_form');
	criteriaForm = $('#criteria_form');
	
	showOperationButtons($('.operation_container'));

	deferreds.push(createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	
	// Date
	moment.locale(language);
	//
	constructionCompanies = null;
	
	$('.nav-tabs a:first').tab('show');
	
	tableElement = $('#table');
	contactTableElement = $('#contact_table');
	communityTableElement = $('#community_table');

	//var height = configTableHeight(tableElement, true, false);

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable(
			/*
			{
			"language": getDataTablesLanguage(),
			"paging": true,
			"pageLength": 50, 
			"lengthChange": true,
			"lengthMenu": [50, 100, 1000], 
			"searching": false,
			"orderClasses": false, 
			"ordering": true,
			"order": [[1, "asc"]],
			"info": true,
			"scrollX": true, 
			"scrollY": height,
			"scrollCollapse": true, 
			"autoWidth": false,
			"columns": [
				{"data": null, "title": '', "sortable": false, 'width': 60, "render": dataTableHelper.render.commonButtonRender},
				{"data": "no", "title": $.i18n.prop('construction_company.no'), "sortable": true, 'width': 60},
				{"data": "shortName", "title": $.i18n.prop('construction_company.name.short'), "sortable": false, 'width': 100},
				{"data": "name", "title": $.i18n.prop('construction_company.name'), "sortable": false, 'width': 200},
				{"data": "phoneNo", "title": $.i18n.prop('construction_company.phone'), "sortable": false, 'width': 100},
				{"data": "faxNo", "title": $.i18n.prop('construction_company.fax'), "sortable": false, 'width': 100}, 
				{"data": "address", "title": $.i18n.prop('construction_company.address'), "sortable": false, 'width': 100}, 
				{"data": 'id', "visible": false} 
			],
			"processing": false, 
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": "no", "title": $.i18n.prop('construction_company.no'), "sortable": true, 'width': 60},
					//{"data": "shortName", "title": $.i18n.prop('construction_company.name.short'), "sortable": false, 'width': 100},
					{"data": "name", "title": $.i18n.prop('construction_company.name'), "sortable": false, 'width': 200},
					{"data": "phoneNo", "title": $.i18n.prop('construction_company.phone'), "sortable": false, 'width': 100},
					{"data": "faxNo", "title": $.i18n.prop('construction_company.fax'), "sortable": false, 'width': 100}, 
					{"data": "address", "title": $.i18n.prop('construction_company.address'), "sortable": false, 'width': 100}, 
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable  
			})
		);
		//
		contactTable = contactTableElement.DataTable(
			/*
			{
			"data": null,
			"language": getDataTablesLanguage(),
			"paging": false,
			"lengthChange": false,
			"searching": false,
			"ordering": false,
			"info": false,
			"autoWidth": false,
			"columns": [
				//{"data": null, "title": "", "sortable": false, 'width': 30, "render": dataTableHelper.render.commonButtonRender},
				{"data": "name", "title": $.i18n.prop('contact.name'), "sortable": true, 'width': 100},
				{"data": "unit", "title": $.i18n.prop('contact.unit'), "sortable": true, 'width': 60},
				{"data": "title", "title": $.i18n.prop('contact.title'), "sortable": true, 'width': 60},
				{"data": "phoneNo", "title": $.i18n.prop('contact.phone'), "sortable": true, 'width': 100},
				{"data": "mobilePhoneNo", "title": $.i18n.prop('contact.mobile_phone'), "sortable": true, 'width': 120},
				{"data": "email", "title": $.i18n.prop('contact.email'), "sortable": true, 'width': 60},
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadContactTable, 
			}
			*/
			getDataTableOptions({
				"columns": [
					//{"data": null, "title": "", "sortable": false, 'width': 30, "render": dataTableHelper.render.commonButtonRender},
					{"data": "name", "title": $.i18n.prop('contact.name'), "sortable": true, 'width': 100},
					{"data": "unit", "title": $.i18n.prop('contact.unit'), "sortable": true, 'width': 60},
					{"data": "title", "title": $.i18n.prop('contact.title'), "sortable": true, 'width': 60},
					{"data": "phoneNo", "title": $.i18n.prop('contact.phone'), "sortable": true, 'width': 100},
					{"data": "mobilePhoneNo", "title": $.i18n.prop('contact.mobile_phone'), "sortable": true, 'width': 120},
					{"data": "email", "title": $.i18n.prop('contact.email'), "sortable": true, 'width': 60},
				],
				"ordering": false,
				"serverSide": true,
				"ajax": loadContactTable  
			})
		);
		
		communityTable = communityTableElement.DataTable(
			/*
			{
			"data": null,
			"language": getDataTablesLanguage(),
			"paging": false,
			"lengthChange": false,
			"searching": false,
			"ordering": false,
			"info": false,
			"autoWidth": false,
			"columns": [
				//{"data": null, "title": "", "sortable": false, 'width': 30, "render": dataTableHelper.render.commonButtonRender},
				{"data": "no", "title": $.i18n.prop('community.no'), "sortable": true, 'width': 40},
				{"data": "name", "title": $.i18n.prop('community.name'), "sortable": true, 'width': 120},
				{"data": "city.name", "title": $.i18n.prop('city'), "sortable": true, 'width': 60},
				{"data": "district.name", "title": $.i18n.prop('district'), "sortable": true, 'width': 60},
				{"data": "road", "title": $.i18n.prop('address.road'), "sortable": true, 'width': 60},
				{"data": "section", "title": $.i18n.prop('address.section'), "sortable": true, 'width': 60},
				{"data": "address", "title": $.i18n.prop('address'), "sortable": true, 'width': 100}
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadCommunityTable, 
			}
			*/
			getDataTableOptions({
				"columns": [
					//{"data": null, "title": "", "sortable": false, 'width': 30, "render": dataTableHelper.render.commonButtonRender},
					{"data": "no", "title": $.i18n.prop('community.no'), "sortable": true, 'width': 40},
					{"data": "name", "title": $.i18n.prop('community.name'), "sortable": true, 'width': 120}, 
					/*
					*/
					{"data": "city.name", "title": $.i18n.prop('city'), "sortable": true, 'width': 60}, 
					{"data": "district.name", "title": $.i18n.prop('district'), "sortable": true, 'width': 60},
					{"data": "road", "title": $.i18n.prop('address.road'), "sortable": true, 'width': 60},
					{"data": "section", "title": $.i18n.prop('address.section'), "sortable": true, 'width': 60},
					{"data": "address", "title": $.i18n.prop('address'), "sortable": true, 'width': 150}
				],
				"ordering": false,
				"serverSide": true,
				"ajax": loadCommunityTable  
			})
		);
	}));
	//
	$.when.apply($, deferreds).then(function() {

		$('.nav-tabs .nav-link').on('shown.bs.tab', function(e) {
			var tableInTab;
			if ($(e.target).is('#tab2')) tableInTab = contactTable;
			else if ($(e.target).is('#tab3')) tableInTab = communityTable;
			if (tableInTab) {
				tableInTab.responsive.recalc();
				tableInTab.columns.adjust().responsive.recalc();
			}
		});

		criteriaValidator = criteriaForm.validate({
			rules: {
				"no": {
					maxlength: 10
				},
				"name": {
					maxlength: 50
				}
			}
		});

		validator = form.validate({
			rules: {
				"no": {
					maxlength: 10, 
					required: true
				},
				"name": {
					maxlength: 50, 
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
			saveUrl: URLS.CONSTRUCTION_COMPANY.SAVE, 
			removeUrl: URLS.CONSTRUCTION_COMPANY.DELETE,
			beforePopulate: function(action) {
				validator.resetForm();
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						id: 0,
						status: 1
					});
				}
				/*
				else {
					if (editForm.activeRow) {
						editForm.formData(data);
					}
				}
				*/
			},
			afterPopulate: function() {
				var data = editForm.formData();
				if (!data.id) {
					contactTable.clear();
					communityTable.clear();
				}
				else {
					contactTable.ajax.reload();
					communityTable.ajax.reload();
				}
			},
			save: function() {
				toast.fire({
					type: 'info', 
					title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
				});
				
				var saving = form.serializeObject();
				delete saving.updated;
				if (!saving.id) saving.id = 0;
				
				var deferred = $.Deferred();
				try {
					ajaxPost(URLS.CONSTRUCTION_COMPANY.SAVE, saving, function(saved) {
						toast.close();
						deferred.resolve(saved);
					});
				}
				catch (e) {
					toast.close();
					deferred.resolve(null);
				}
				return deferred.promise();
			}
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);

		$('#search').on('click', refresh);
		
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
	
	data.parameters = {"name": $("#criteria_name").val()};
	
	deferreds.push(
		ajaxPost(URLS.CONSTRUCTION_COMPANY.QUERY, data)
		.done(function(json) {
			if ((json) && (json.data)) {
				callback({'data': json.data, 'recordsTotal': json.data.length, 'recordsFiltered': json.data.length});
				if (table.data().any()) {
					tableRow = $('tbody tr:first', tableElement);
					if (tableRow) tableRow.trigger('click');
				}
			}
			else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
		})
	);

	$.when.apply($, deferreds).then(function() {
		toast.close();
	});

}

function loadContactTable(data, callback, settings) {
	if (!$('#id').val()) return;
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});

	deferreds.push(
		ajaxGet(URLS.CONTACT.LIST_BY_CONSTRUCTION_COMPANY + $('#id').val())
		.done(function(json) {
			if ((json) && (json.length)) callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
			else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
		})
	);

	$.when.apply($, deferreds).then(function() {
		toast.close();
	});

}

function loadCommunityTable(data, callback, settings) {
	if (!$('#id').val()) return;
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});
	//
	deferreds.push(
		ajaxGet(URLS.COMMUNITY.LIST_BY_CONSTRUCTION_COMPANY + $('#id').val())
		.done(function(json) {
			if ((json) && (json.length)) callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
			else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
		})
	);

	$.when.apply($, deferreds).then(function() {
		toast.close();
	});

}

function refresh(e) {
	if (e) e.preventDefault();
	if (!criteriaForm.valid()) return false;
	if (table) table.ajax.reload();
}
