/*
requirejs(['moment', 'sweetalert2', 'app', 'pace', 'datatables.net-responsive', 'datatables-helper', 'select2-maxheight', 'icheck', 'datetimepicker', 'form-control', 'editForm', 'jquery-validate-messages'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 5000
	});	
	app.initialize(function() {
		if (APPLICATION.data.activeCommunityId) $('#criteria_community_id').val(APPLICATION.data.activeCommunityId).trigger('change');
	});
});
*/
initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	//if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

var form;
var editForm;
var validator;

var tableElement;
var table;

var criteriaForm;
var criteriaValidator;

var activeCriteriaOrganizationId;
var activeOrganizationId;
var activeCriteriaCommunityId;
var activeCommunityId;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'contact-message', 'community-message', 'organization-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('contact');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_basic_information').text($.i18n.prop('breadcrumb.basic_information'));
			$('#breadcrumb_contact').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));

			
			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('terms.organization'));
			$('#criteria_construction_company_id_label, #construction_company_id_label').text($.i18n.prop('community.construction_company'));
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));

			$('#criteria_name_label, #name_label').text($.i18n.prop('contact.name'));
			$('#contact_type_id_label').text($.i18n.prop('contact.type'));
			$('#email_label').text($.i18n.prop('contact.email'));
			$('#mobile_phone_no_label').text($.i18n.prop('contact.mobile_phone'));
			$('#phone_no_label').text($.i18n.prop('contact.phone'));
			$('#unit_label').text($.i18n.prop('contact.unit'));
			$('#title_label').text($.i18n.prop('contact.title'));
			$('#note_label').text($.i18n.prop('contact.note'));

			$('#status_label').text($.i18n.prop('status'));
			$('#search').append($.i18n.prop('operation.refresh'));

			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));

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
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	moment.locale(dashedLanguage.toLowerCase());
	
	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));
	
	deferreds.push(createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	deferreds.push(createCodeRadio('#contact_type_container', 'contactTypeId', URLS.CODE.LIST.CONTACT_TYPE, 'id'));

	deferreds.push(createOrganizationSelect($('#organization_id'), $('#criteria_organization_id')));
	//deferreds.push(createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')));

	deferreds.push(
		ajaxGetJson(URLS.CONSTRUCTION_COMPANY.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			$('#criteria_construction_company_id, #construction_company_id').select2({
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
		ajaxGetJson(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id, #community_id'), data, true);
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
			console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
		}) 
	);

	// Table
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
			"stateSave": true,
			"autoWidth": false,
			"rowId": "id",
			"columns": [
				{"data": null, "sortable": false, 'width': 50, "render": dataTableHelper.render.commonButtonRender}, 
				{"data": "name", "title": $.i18n.prop('contact.name'), "sortable": true, 'width': 100},
				{"data": "unit", "title": $.i18n.prop('contact.unit'), "sortable": false, 'width': 100},
				{"data": "title", "title": $.i18n.prop('contact.title'), "sortable": false, 'width': 100},
				{"data": "phoneNo", "title": $.i18n.prop('contact.phone'), "sortable": false, 'width': 100},
				{"data": "mobilePhoneNo", "title": $.i18n.prop('contact.mobile_phone'), "sortable": false, 'width': 200},
				{"data": "email", "title": $.i18n.prop('contact.email'), "sortable": false, 'width': 200},
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
					{"data": "name", "title": $.i18n.prop('contact.name'), "sortable": true, 'width': 100},
					{"data": "unit", "title": $.i18n.prop('contact.unit'), "sortable": false, 'width': 100},
					{"data": "title", "title": $.i18n.prop('contact.title'), "sortable": false, 'width': 100},
					{"data": "phoneNo", "title": $.i18n.prop('contact.phone'), "sortable": false, 'width': 100},
					{"data": "mobilePhoneNo", "title": $.i18n.prop('contact.mobile_phone'), "sortable": false, 'width': 200},
					{"data": "email", "title": $.i18n.prop('contact.email'), "sortable": false, 'width': 200},
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
	
	//
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));

	$.when.apply($, deferreds)
	.done(function() {
		
		$('#search').on('click', refresh);
	
		criteriaValidator = criteriaForm.validate({
			rules: {
			}
		});
		
		validator = form.validate({
			rules: {
				name: {
					minlength: 2, 
					required: true
				}, 
				contactTypeId: {
					required: true
				},
				status: {
					required: true
				} 
			}
		});
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = $('#contact_form').editForm({
			form: form,
			table: tableElement,
			dataTable: table,
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.CONTACT.SAVE, 
			removeUrl: URLS.CONTACT.DELETE, 
			beforePopulate: function(action) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						'id': 0,
						'status': 1 
					});
				} else {
					if (editForm.activeRow) {
						var data = editForm.activeRow.data();
						editForm.formData(data);
					}
				}
			},
			afterPopulate: function() {
				var data = editForm.formData();
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				$('#construction_company_id').val(data.constructionCompanyId ? data.constructionCompanyId : "").trigger('change');
				/*
				$('input[name="status"]').iCheck('update');
				//$('input[name="contactTypeId"][value="{0}"]'.format(data.contactTypeId)).iCheck('check');
				*/
				$('input[name="contactTypeId"]').iCheck('update');
			}
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);

		$('#criteria_organization_id').on('change', function(e) {
			activeCriteriaOrganizationId = changeOrganization(criteriaForm.serializeObject(), $(this), activeCriteriaOrganizationId, $('#criteria_community_id'), null);
		});
		
		$('#organization_id').on('change', function(e) {
			activeOrganizationId = changeOrganization(editForm.formData(), $(this), activeOrganizationId, $('#community_id'), null);
		});
		
		deferred.resolve();
	});
	return deferred.promise();
	
}

function loadTable(data, callback, settings) {
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
	});

	data.parameters = {
		"name": $('#criteria_name').val(), 
		"communityId": $('#criteria_community_id').val(), 
		"constructionCompanyId": $('#criteria_construction_company_id').val()
	};
	
	ajaxPost(URLS.CONTACT.QUERY, data)
	.done(function(json) {
		if ((json.data) && (json.data.length)) {
			callback({'data': json.data, 'recordsTotal': json.data.length, 'recordsFiltered': json.data.length});
			if (table.data().any()) {
				tableRow = $('tbody tr:first', tableElement);
				if (tableRow) tableRow.trigger('click');
			}
		} 
		else {
			callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
			if (table.data().any()) $('#table tbody tr:first').trigger('click');
		}
	});
	
	toast.close();

}

function refresh(e) {
	if (e) e.preventDefault();
	if (table) table.ajax.reload();
}
