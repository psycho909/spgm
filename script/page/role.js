initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	refresh();
});

var language;

var form;
var criteriaForm;
var editForm;
var validator;
var table;
var tableElement;
var authorizationTable;

var editting;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'role-message', 'menu-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('role');
			$('#title_section').text(APPLICATION.documentTitle);

			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));
			
			$('#criteria_no_label, #no_label').text($.i18n.prop('role.no'));
			$('#criteria_name_label, #name_label').text($.i18n.prop('role.name'));
			$('#criteria_title_label, #title_label').text($.i18n.prop('role.title'));
			//$('#title_label').text($.i18n.prop('role.title'));
			//$('#role_level_label').text($.i18n.prop('role.level'));
			$('#system_used_label').text($.i18n.prop('role.system_used'));
			$('#system_used1_label').append($.i18n.prop('yes'));
			$('#system_used2_label').append($.i18n.prop('no'));
			$('#status_label').text($.i18n.prop('status'));
			
			/*
			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));

			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));
			*/
			
			$('#tab1').append($.i18n.prop('role'));
			$('#tab2').append($.i18n.prop('role.authorization'));
			$('#check_all').append($.i18n.prop('operation.check.all'));

			$('#uncheck_all').append($.i18n.prop('operation.uncheck.all'));

			$('#table_title').text($.i18n.prop('role.table.title'));
			$('#authorization_table_title').text($.i18n.prop('role.authorization.list'));
			$('#search').append($.i18n.prop('operation.query'));
			
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
	
	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));
	
	$('.nav-tabs a:first').tab('show');

	deferreds.push(createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	$('#system_used_container').iCheck({
		tap: true,
		radioClass: 'iradio_square-blue' 
	});
	
	var checkboxRender = function(data, type, row) {
		//if (row.action) return '<input type="checkbox" class="icheck" name="authorized" value="{0}"/>'.format(row.action.id);
		if (row.actionId) return '<input type="checkbox" class="icheck" name="authorized" value="{0}"/>'.format(row.actionId);
		else return '';
	};

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
			"ordering": true,
			"orderClasses": false, 
			"order": [[1, "asc"]],
			"info": true,
			"autoWidth": false,
			"responsive": false,
			//"scrollX": true, 
			"columns": [
				{"data": null, "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
				{"data": 'no', 'title': $.i18n.prop('role.no'), 'width': 60, "sortable": true},
				{"data": "name", 'title': $.i18n.prop('role.name'), 'width': 100, "sortable": false},
				{"data": "title", 'title': $.i18n.prop('role.title'), 'width': 100, "sortable": false},
				{"data": 'status', 'title': $.i18n.prop('status'), "sortable": false, 'width': 40, "render": dataTableHelper.render.statusRender},
				{"data": 'id', "visible": false} 
			],
			"deferLoading": 0,
			"processing": false,
			"serverSide": true,
			"stateSave": true,
			"ajax": loadTable
			*/
			getDataTableOptions({
				"columns": [
					{"data": 'no', 'title': $.i18n.prop('role.no'), 'width': 60, "sortable": true},
					{"data": "name", 'title': $.i18n.prop('role.name'), 'width': 100, "sortable": false},
					{"data": "title", 'title': $.i18n.prop('role.title'), 'width': 100, "sortable": false},
					{"data": 'status', 'title': $.i18n.prop('status'), "sortable": false, 'width': 40, "render": dataTableHelper.render.statusRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[1, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);
		
		authorizationTable = $('#authorization_table').DataTable(
			/*
			{
			"language": getDataTablesLanguage(),
			"paging": false,
			"lengthChange": false,
			"searching": false,
			"ordering": false,
			//"order": [[1, "asc"]],
			"info": false,
			"autoWidth": false,
			//"scrollX": true, 
			"columns": [
				{"data": 'authorized', 'title': '', 'width': 40, "sortable": false, "render": checkboxRender},
				//{"data": 'applicationType', 'title': $.i18n.prop('menu.application_type'), 'width': 80, "sortable": false, "render": dataTableHelper.render.codeRender},
				{"data": 'no', 'title': $.i18n.prop('role.no'), 'width': 80, "sortable": false},
				{"data": "description_zh_TW", 'title': $.i18n.prop('role.authorization.function'), 'width': 300, "sortable": false},
				{"data": 'id', "visible": false} 
			],
			"deferLoading": 0,
			"processing": false,
			"serverSide": true,
			"stateSave": true,
			"ajax": loadAuthorizationTable
			*/
			getDataTableOptions({
				"columns": [
					{"data": 'authorized', 'title': '', 'width': 40, "sortable": false, "render": checkboxRender},
					//{"data": 'applicationType', 'title': $.i18n.prop('menu.application_type'), 'width': 80, "sortable": false, "render": dataTableHelper.render.codeRender},
					{"data": 'no', 'title': $.i18n.prop('role.no'), 'width': 80, "sortable": false},
					{"data": "description_zh_TW", 'title': $.i18n.prop('role.authorization.function'), 'width': 300, "sortable": false},
					{"data": 'id', "visible": false} 
				],
				"paging": false,
				"ordering": false,
				"serverSide": true,
				"ajax": loadAuthorizationTable
			})
		);
		
	}));

	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
		
	$.when.apply($, deferreds).then(function() {
		
		$('.nav-tabs .nav-link').on('shown.bs.tab', function(e) {
			var tableInTab;
			if ($(e.target).is('#tab2')) tableInTab = authorizationTable;
			if (tableInTab) {
				tableInTab.responsive.recalc();
				tableInTab.columns.adjust().responsive.recalc();
			}
		});
		
		if (authorizationTable) authorizationTable.ajax.reload();
		
		$('button.inner_operation[value="CA"]').on('click', function(e) {
			e.preventDefault();
			$('input[name="authorized"]').iCheck("check");
		});
		$('button.inner_operation[value="UA"]').on('click', function(e) {
			e.preventDefault();
			$('input[name="authorized"]').iCheck("uncheck");
		});
		
		addValidatorMethod();
		validator = form.validate({
			onkeyup: function (element) {
				return element.id != 'no';
			},			
			rules: {
				no: {
					required: true,
					minlength: 1,
					maxlength: 10, 
					remote: {
						url: URLS.ROLE.CHECK,
						type: "post",
						data: {
							no: function() {return $("#no").val();}, 
							id: function() {return $("#id").val();}, 
						}
					}
				},
				name: {
					required: true,
					minlength: 1,
					maxlength: 50
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
		configValidator(validator);
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = form.editForm({
			form: form,
			table: $('#table'),
			dataTable: table,
			validator: validator,
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.ROLE.SAVE,
			removeUrl: URLS.ROLE.DELETE,
			load: function(action, activeRow) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						id: 0,
						systemUsed: false,
						status: 1
					});
				}
				else {
					if (editForm.activeRow) editForm.formData(editForm.activeRow.data());
				}
				$('input[name="authorized"]').iCheck("uncheck");
			},
			afterPopulate: function(action) {
				var data = editForm.formData();
				//$('input[name="status"]').iCheck('update');
				//$('input[name="systemUsed"]').iCheck('update');
				
				$('input[name="authorized"]').iCheck("uncheck");
				if (data.actions) {
					var menu;
					$.each(data.actions, function(actionIndex, actionValue) {
						authorizationTable.rows().every(function() {
							menu = this.data();
							if (menu.actionId == actionValue.id) {
								$('input[name="authorized"]', this.node()).iCheck("check");
								return false;
								//console.log(menu);
							}
						});
					});
				}
				$('input[name="authorized"]').iCheck('update');
				
				editting = (action == CONSTANT.ACTION.ADD || action == CONSTANT.ACTION.UPDATE);
				/*
				$('button.operation[value="CA"]').prop('disabled', !editting);
				$('button.operation[value="UA"]').prop('disabled', !editting);
				$('input[name="authorized"]').prop('disabled', !editting);
				*/
			},
			save: function() {
				toast.fire({
					type: 'info', 
					title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
				});
				//
				var saving = form.serializeObject();
				if (!saving.id) saving.id = 0;
				delete saving.updated;
				
				var deferred = $.Deferred();
				saving.actions = [];
				var checkbox;
				authorizationTable.rows().every(function() {
					checkbox = $('input[name="authorized"]', this.node());
					if (checkbox.is(":checked")) {
						saving.actions.push({'id': checkbox.val()});
					}
				});
				
				try {
					ajaxPost(URLS.ROLE.SAVE, saving)
					.done(function(saved) {
						if (saving.id != 0) {
							if ((editForm.activeRow) && (editForm.activeRow.data)) {
								editForm.activeRow.data(saved);
							}
						}
						else refresh();
						deferred.resolve(saved);
					})
					.fail(function() {
						deferred.resolve(null);
					})
					.always(function() {
						toast.close();
					});
				}
				catch (e) {
					console.log(e);
				}
				return deferred.promise();
			}
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);
			
		$('#search').on('click', refresh);
		
		deferred.resolve();
	});
	//
	$('#no').focus();
	//
	return deferred.promise();
}
//
function loadTable(data, callback, settings) {
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});
	
	/*
	data.parameters = {
		"no": $('#criteria_no').val(), 
		"name": $('#criteria_name').val()
	};
	*/
	data.parameters = criteriaForm.serializeObject();
	
	deferreds.push(
		ajaxPost(URLS.ROLE.QUERY, data)
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

function loadAuthorizationTable(data, callback, settings) {
	ajaxGet(URLS.MENU.LIST, null)
	.done(function(json) {
		if ((json) && (json.length)) {
			for (var i = 0; i < json.length; i++) {
				json[i].authorized = false;
			}
			callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
			$('#authorization_table .icheck').iCheck({
				checkboxClass: 'icheckbox_square-blue', 
				tap: true
			});			
		}
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	});
}	

function refresh(e) {
	if (e) e.preventDefault();
	if (!criteriaForm.valid()) return false;
	if (table) table.ajax.reload(null, false);
}
