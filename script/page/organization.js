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
		if (APPLICATION.data.activeOrganizationId) {
			$('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
		}
	});
});
*/
initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	refresh();
}, null, ['fileinput']);

var language;
var dashedLanguage;

var form;
var editForm;
var table;
var tableElement; 

var contactTable;
var contactTableElement; 

var validator;
var criteriaForm; 
var criteriaValidator;

var activeOrganizationId;

var fileTypes = ['png', 'jpg', 'jpeg', 'gif'];
var logoFile;
var imageFile;
var logoUrl;
var imageUrl;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'index-message', 'organization-message', 'contact-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('terms.organization');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_organization_user').text($.i18n.prop('breadcrumb.organization_user'));
			$('#breadcrumb_organization').text(APPLICATION.documentTitle);
			*/
			
			//$('#tab1').append($.i18n.prop('organization.tab.info'));
			//$('#tab2').append($.i18n.prop('organization.tab.contact'));
			//$('#criteria_area_title').text($.i18n.prop('terms.query.criteria'));
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#tab1').append($.i18n.prop('organization.tab.info'));
			$('#tab2').append($.i18n.prop('organization.logo'));
			$('#tab3').append($.i18n.prop('organization.qrcode'));
			$('#tab4').append($.i18n.prop('organization.tab.contact'));
			
			$('#organization_form_title').text($.i18n.prop('operation.input'));
			//$('#criteria_parent_id_label').text($.i18n.prop('organization.parent'));
			$('#criteria_name_label').text($.i18n.prop('organization.name'));
			$('#criteria_alias_label').text($.i18n.prop('organization.alias'));
			$('#search').append($.i18n.prop('operation.query'));
			
			//$('#industry_sector_label').text($.i18n.prop('organization.industry_sector'));
			$('#no_label').text($.i18n.prop('organization.no'));
			$('#name_label').text($.i18n.prop('organization.name'));
			$('#short_name_label').text($.i18n.prop('organization.alias'));
			$('#address_label').text($.i18n.prop('organization.address'));
			//$('#parent_id_label').text($.i18n.prop('organization.parent'));
			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('organization.organization'));
			//$('#locale_label').text($.i18n.prop('organization.locale'));
			//$('#contact_label').text($.i18n.prop('organization.contact'));
			//$('#email_label').text($.i18n.prop('organization.email'));
			$('#note_label').text($.i18n.prop('organization.note'));
			//$('#phone_label').text($.i18n.prop('organization.phone'));
			//$('#mobile_phone_label').text($.i18n.prop('organization.mobile_phone'));
			$('#status_label').text($.i18n.prop('status'));
			$('#status_active').append($.i18n.prop('status.active'));
			$('#status_inactive').append($.i18n.prop('status.inactive'));

			//$('#organization_type_id_label').text($.i18n.prop('organization.type'));
			$('#ldap_host_label').text($.i18n.prop('organization.ldap.host'));
			
			$('#logo_hint').text($.i18n.prop('organization.logo.hint'));
			$('#logo_label').text($.i18n.prop('organization.logo'))
			$('#logo_file_label').append($.i18n.prop('organization.logo.upload'));
			$('#delete_logo').append($.i18n.prop('organization.logo.delete'));

			$('#qrcode_label').text($.i18n.prop('organization.qrcode'))
			$('#login_url_label').text($.i18n.prop('organization.login_url'))

			$('#image_hint').text($.i18n.prop('organization.image.hint'));
			$('#image_label').text($.i18n.prop('organization.image'))
			$('#image_file_label').append($.i18n.prop('organization.image.upload'));
			$('#delete_image').append($.i18n.prop('organization.image.delete'));
			
			$('#organization_table_title').text($.i18n.prop('organization.maintenance.table.title'));

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
	
	dashedLanguage = language.replace('_', '-');

	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));
	
	if (APPLICATION.systemConfig.clientHomeImageEnabled) $('.client_home_image').removeClass('d-none'); 
	
	logoFile = $('#logo_file');
	imageFile = $('#image_file');

	//requirejs(['fileinput']);
	
	/*
	deferreds.push(ajaxPostJson(URLS.COUNTRY.EFFECTIVE, null, function(json) {
		var data = [];
		if (json) {
			data.push({'id': '', 'text': ''});
			for (var i = 0; i < json.length; i++) {
				data.push({'id': json[i].locale, 'text': i18nText(json[i], 'language', language) + '(' + i18nText(json[i], 'name', language) + ')'});
			}
		}
		$('#locale').select2({
			data: data,
			maximumSelectionSize: 1,
			allowClear: true,
			closeOnSelect: true,
			theme: 'bootstrap4', 
			placeholder: $.i18n.prop('operation.choose')
		}).maximizeSelect2Height();
	}));
	*/

	deferreds.push(createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	deferreds.push(createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')));
	
	$('.nav-tabs a:first').tab('show');

	// Table
	tableElement = $('#table');
	contactTableElement = $('#contact_table');
	
	//var height = configTableHeight(tableElement, false, true);
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
			//"scrollY": height,
			//"scrollCollapse": true, 
			"autoWidth": false,
			"columns": [
				{"data": null, "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
				{"data": 'no', "title": $.i18n.prop('organization.no'), "visible": true, 'width': 60},
				{"data": "shortName", "title": $.i18n.prop('organization.alias'), "sortable": true, 'width': 60},
				{"data": "name", "title": $.i18n.prop('organization.name'), "sortable": true, 'width': 150},
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
					{"data": 'no', "title": $.i18n.prop('organization.no'), "visible": true, 'width': 60},
					{"data": "shortName", "title": $.i18n.prop('organization.alias'), "sortable": true, 'width': 60},
					{"data": "name", "title": $.i18n.prop('organization.name'), "sortable": true, 'width': 150},
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
		
		contactTable = contactTableElement.DataTable(
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
				"responsive": true,
				"processing": false,
				"deferLoading": 0,
				"serverSide": true,
				"ajax": loadContactTable 
			})
		);
		
	}));
	
	/*
	deferreds.push(ajaxPostJson(URLS.CUSTOMER.CATEGORY.LIST_EFFECTIVE, null, function(json) {
		var data = [];
		if (json) {
			data.push({'id': '', 'text': ''});
			for (var i = 0; i < json.length; i++) {
				data.push({'id': json[i].id, 'text': json[i].name});
			}
		}
		$('#category_id').select2({
			data: data,
			maximumSelectionSize: 1,
			allowClear: true,
			closeOnSelect: true,
			placeholder: $.i18n.prop('operation.choose')
		}).maximizeSelect2Height();
	}));
	*/
	
	/*
	deferreds.push(ajaxGetJson(URLS.CODE.LIST.INDUSTRY_SECTOR, null, function(json) {
		var data = [];
		if (json) {
			data.push({'id': '', 'text': ''});
			for (var i = 0; i < json.length; i++) {
				data.push({'id': json[i].id, 'text': json[i].no + '-' + i18nText(json[i], 'description', language)});
			}
		}
		$('#industry_sector_id').select2({
			data: data,
			maximumSelectionSize: 1,
			allowClear: true,
			closeOnSelect: true,
			theme: 'bootstrap4', 
			placeholder: $.i18n.prop('operation.choose')
		}).maximizeSelect2Height();
	}));
	*/
	//deferreds.push(createCodeSelect2('#industry_sector_id', URLS.CODE.LIST.INDUSTRY_SECTOR, null, true));
	//deferreds.push(createCodeSelect2('#organization_type_id', URLS.CODE.LIST.ORGANIZATION_TYPE));
	//
	$.when.apply($, deferreds).then(function() {
		$('.nav-tabs .nav-link').on('shown.bs.tab', function(e) {
			var tableInTab;
			if ($(e.target).is('#tab4')) tableInTab = contactTable;
			if (tableInTab) {
				tableInTab.responsive.recalc();
				tableInTab.columns.adjust().responsive.recalc();
			}
		});
		
		if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				/*
				organizationId: {
					requiredid: true 
				}
				*/
			}
		});
		
		validator = form.validate({
			rules: {
				/*
				organizationId: {
					requiredid: true 
				}, 
				*/
				no: {
					required: true,
					minlength: 2,
					maxlength: 10
				},
				name: {
					required: true,
					minlength: 3,
					maxlength: 50
				},
				alias: {
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
			}
		});
		
		
		if (!language.startsWith('en')) {
			var url = getFileInputTranslation(language);
			if (url) {
				deferreds.push($.getScript(url, function() {
					loadFileInput();
				}));
			}
		}
		else loadFileInput();
		
		/*
		$('#organization_id').on('change', function(e) {
			var organizationId = $(this).val();
			if ((organizationId) && ($('#organization_type_id').val() == CONSTANT.ORGANIZATION.CUSTOMER)) {
				$.post(URLS.CUSTOMER.ANCESTOR_CUSTOMER, {'organizationId': organizationId}, function(json) {
					if ((json) && (json.length)) {
						var id = $('#id', form).val();
						if ((id) && (id > 0)) {
							for (var i = 0; i < json.length; i++) {
								if (json[i].id == id) json.splice(i, 1);
							}
						}
						loadOrganizationSelect($('#parent_id'), json, false);
					}
					else {
						$('#parent_id').empty();
					}
				});
			}
			else {
				$('#parent_id').empty();
			}
		});
		*/

		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = form.editForm({
			form: form,
			table: tableElement,
			dataTable: table,
			validator: validator,
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.ORGANIZATION.SAVE,
			removeUrl: URLS.ORGANIZATION.DELETE,
			load: function(action, activeRow) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						id: 0,
						locale: APPLICATION.SETTING.defaultLocale, 
						status: 1
					});
				}
				else {
					if (editForm.activeRow) editForm.formData(editForm.activeRow.data());
				}
			},
			afterPopulate: function() {
				var data = editForm.formData();
				
				//if (contactTable) contactTable.ajax.reload();
				
				$('input[name="status"]').iCheck('update');
				//$('#locale').trigger('change');
				/*
				if ((data) && (data.industrySector)) $('#industry_sector_id').val(data.industrySector.id).trigger('change');
				else $('#industry_sector_id').val('').trigger('change');
				//
				if ((data) && (data.organizationType)) $('#organization_type_id').val(data.organizationType.id).trigger('change');
				else $('#organization_type_id').val('').trigger('change');
				*/
				//
				//if ((data) && (data.organization) && (data.organization.id)) $('#organization_id').val(data.organization.id).trigger('change');
				if ((data) && (data.organizationId)) $('#organization_id').val(data.organizationId).trigger('change');
				else $('#organization_id').val('').trigger('change');
				//
				$(':input[type="checkbox"]', form).iCheck('update');
				
				if (data.qrcodeUrl) {
					//$('#qrcode').attr('src', APPLICATION.systemConfig.applicationRootUrl + APPLICATION.systemConfig.qrcodeUrl + data.qrcodeUrl);
					$('#qrcode').attr('src', URLS.ROOT + APPLICATION.systemConfig.qrcodeUrl + data.qrcodeUrl);
					$('#qrcode').removeClass('d-none');
				}
				else $('#qrcode').addClass('d-none');

				if (data.logoUrl) {
					//$('#logo_image').attr('src', APPLICATION.systemConfig.applicationRootUrl + APPLICATION.systemConfig.logoUrl + data.logoUrl);
					$('#logo').attr('src', URLS.ROOT + APPLICATION.systemConfig.logoUrl + data.logoUrl);
					$('#logo').removeClass('d-none');
				}
				else $('#logo').addClass('d-none');

				if (data.imageUrl) {
					$('#image').attr('src', URLS.ROOT + APPLICATION.systemConfig.imageUrl + data.imageUrl);
					$('#image').removeClass('d-none');
				}
				else $('#image').addClass('d-none');

				if (data.loginUrl) {
					$('#login_url').val(URLS.ROOT + data.loginUrl);
				}
			},
			beforeSave: function(saving) {
				if ((!saving.organizationId) || (saving.organizationId <= 0)) {
					saving.organizationId = null;
				}
			},
			save: function() {
				if (self.validator) {
					if (!self.form.valid()) return false;
				}
				if (toast) toast.fire({
					type: 'info', 
					title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
				});
				
				var saving = self.form.serializeObject();
				if (saving.updated) delete saving.updated;
				if (!saving.id) saving.id = 0;
				
				var deferred = $.Deferred();
				try {
					ajaxPost(editForm.saveUrl, saving, function(saved) {
						if (saved) { 
							var id = saved.id;
							$('#id').val(id);
							if ($('#logo_file').fileinput('getFilesCount') > 0) {
								$.when($('#logo_file').fileinput('upload'))
								.done(function() {
									setTimeout(function() {
										ajaxGet(URLS.ORGANIZATION.GET + id, null, function(o) {
											logoUrl = URLS.ROOT + APPLICATION.systemConfig.logoUrl + o.logoUrl;
											$('#logo').attr('src', logoUrl);
											$('#logo').removeClass('d-none');
										});
									}, 2000);
								});
							}
							
							if ($('#image_file').fileinput('getFilesCount') > 0) {
								$.when($('#image_file').fileinput('upload'))
								.done(function() {
									setTimeout(function() {
										ajaxGet(URLS.ORGANIZATION.GET + id, null, function(o) {
											imageUrl = URLS.ROOT + APPLICATION.systemConfig.imageUrl + o.imageUrl;
											$('#image').attr('src', imageUrl);
											$('#image').removeClass('d-none');
										});
									}, 2000);
								});
							}
						}
						if (toast) toast.close();
						deferred.resolve(saved);
					});
				}
				catch (e) {
					if (toast) toast.close();
					deferred.resolve(null);
				}
				return deferred.promise();
			}
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);
		
		logoFile.on('filebatchuploaderror', function(event, data, msg) {
			toast.close();
			swal.fire({
				text: $.i18n.prop('operation.upload.fail'),
				type: "warning",
				showCancelButton: false,
				confirmButtonClass: "btn-danger",
				confirmButtonText: $.i18n.prop('operation.sure')
			});
		});
		
		$('#delete_logo').on('click', function(e) {
			if (e) e.preventDefault();
			var id = $('#id').val();
			if (id > 0) {
				swal.fire({
					title: $.i18n.prop('operation.confirm'),
					text: $.i18n.prop('organization.logo.delete.confirm'),
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-danger",
					confirmButtonText: $.i18n.prop('operation.remove'),
					cancelButtonText: $.i18n.prop('operation.cancel')
				})
				.then(function(result) {
					if (result.value) {
						ajaxGet(URLS.ORGANIZATION.DELETE_LOGO + id, null, function(json) {
							$('#logo').attr('src', '');
							$('#logo').addClass('d-none');
							console.log(json);
						});
					}
				});
			}
		});
		
		$('#delete_image').on('click', function(e) {
			if (e) e.preventDefault();
			var id = $('#id').val();
			if (id > 0) {
				swal.fire({
					title: $.i18n.prop('operation.confirm'),
					text: $.i18n.prop('organization.image.delete.confirm'),
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-danger",
					confirmButtonText: $.i18n.prop('operation.remove'),
					cancelButtonText: $.i18n.prop('operation.cancel')
				})
				.then(function(result) {
					if (result.value) {
						ajaxGet(URLS.ORGANIZATION.DELETE_IMAGE + id, null, function(json) {
							$('#image').attr('src', '');
							$('#logo').addClass('d-none');
							console.log(json);
						});
					}
				});
			}
		});
		
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

	data.parameters = criteriaForm.serializeObject();
	
	deferreds.push(
		ajaxPost(URLS.ORGANIZATION.QUERY, data)
		.done(function(json) {
			if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.data.length, 'recordsFiltered': json.data.length});
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

function loadContactTable(data, callback, settings) {
	if (!$('#id').val()) return;
	ajaxGet(URLS.CONTACT.LIST_BY_ORGANIZATION + $('#id').val())
	.done(function(json) {
		if ((json) && (json.length)) callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	});
}

function refresh(e) {
	if (e) e.preventDefault();
	if (!criteriaForm.valid()) return false;
	
	if (table) table.ajax.reload();
}

function loadFileInput() {
	if (logoFile) {
		logoFile.fileinput({
			language: dashedLanguage,
			//msgPlaceholder: $.i18n.prop('community.logo.select') + ' (' + fileTypes.join() + ' )', 
			allowedFileExtensions: fileTypes, 
			allowedFileTypes: ['image'], 
			autoReplace: true, 
			elErrorContainer: '#logo_file_error',
			maxFileCount: 1,
			maxFileSize: 4096, 
			autoReplace: true, 
			uploadAsync: false,
			showPreview: false,
			showRemove: false,
			showUpload: false,
			uploadUrl: URLS.ORGANIZATION.UPLOAD.LOGO, 
			uploadExtraData: function() {
				return {id: $("#id").val()};
			}
		});
	}
	
	if (imageFile) {		
		imageFile.fileinput({
			language: dashedLanguage,
			//msgPlaceholder: $.i18n.prop('community.logo.select') + ' (' + fileTypes.join() + ' )', 
			allowedFileExtensions: fileTypes, 
			allowedFileTypes: ['image'], 
			maxFileCount: 1,
			maxFileSize: 4096, 
			autoReplace: true, 
			elErrorContainer: '#image_file_error',
			uploadAsync: false,
			showPreview: false,
			showRemove: false,
			showUpload: false,
			//hideThumbnailContent: true, 
			uploadUrl: URLS.ORGANIZATION.UPLOAD.IMAGE, 
			uploadExtraData: function() {
				return {id: $("#id").val()};
			}
		});	
	}
};

