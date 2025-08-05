initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	refresh();
});

var language;
var form;
var editForm;
var validator;
var table;
var tableElement;
var contactTable;
var contactTableElement; 

var criteriaForm;
var criteriaValidator;

var activeOrganizationId;

var fileTypes = ['png', 'jpg', 'jpeg', 'gif'];
var logoFile;
var loadFileInput;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'organization-message', 'community-message', 'contact-message', 'city-message', 'district-message', 'address-message', 'service_team-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('community');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_basic_information').text($.i18n.prop('breadcrumb.basic_information'));
			$('#breadcrumb_configuration_community').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_construction_company_id_label').text($.i18n.prop('community.construction_company'));
			$('#criteria_name_label').text($.i18n.prop('community.name'));
			
			$('#no_label').text($.i18n.prop('community.no'));
			$('#name_label').text($.i18n.prop('community.name'));
			$('#phone_no_label').text($.i18n.prop('community.phone'));
			$('#fax_no_label').text($.i18n.prop('community.fax'));

			$('#city_label').text($.i18n.prop('city') + '/' + $.i18n.prop('district'));
			$('#road_section_label').text($.i18n.prop('address.road') + '/' + $.i18n.prop('address.section') + '/' + $.i18n.prop('address'));
			$('#road').prop('placeholder', $.i18n.prop('address.road'));
			$('#section').prop('placeholder', $.i18n.prop('address.section'));
			$('#address_label').text($.i18n.prop('address'));
			$('#address').prop('placeholder', $.i18n.prop('address'));

			$('#note_label').text($.i18n.prop('community.note'));
			$('#service_note_label').text($.i18n.prop('community.service_note'));
			$('#construction_company_id_label').text($.i18n.prop('community.construction_company'));
			$('#service_team_id_label').text($.i18n.prop('service_team'));

			$('#status_label').text($.i18n.prop('community.status'));
			/*
			$('#status0_label').append($.i18n.prop('status.active'));
			$('#status1_label').append($.i18n.prop('status.inactive'));
			*/

			$('#contact_name_label').text($.i18n.prop('contact.name'));
			$('#contact_unit_label').text($.i18n.prop('contact.unit'));
			$('#contact_title_label').text($.i18n.prop('contact.title'));
			$('#contact_phone_label').text($.i18n.prop('contact.phone'));
			$('#contact_mobile_phone_label').text($.i18n.prop('contact.mobile_phone'));
			$('#contact_email_label').text($.i18n.prop('contact.email'));

			$('#refresh').append($.i18n.prop('operation.refresh'));

			/*
			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			*/
			
			$('#logo_image_label').text($.i18n.prop('community.logo'))
			$('#logo_file_label').append($.i18n.prop('community.logo.upload'));
			$('#logo_hint').text($.i18n.prop('community.logo.hint'));

			$('#qrcode_label').text($.i18n.prop('community.qrcode'))
			$('#login_url_label').text($.i18n.prop('community.login_url'))
			
			$('#tab1').append($.i18n.prop('community'));
			$('#tab2').append($.i18n.prop('contact'));
			$('#tab3').append($.i18n.prop('community.logo'));

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

	/*
	var nowTimer = setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);
	*/
	
	form = $('#form');
	criteriaForm = $('#criteria_form');

	showOperationButtons($('.operation_container'));
	
	logoFile = $('#logo_file');
	
	moment.locale(language);

	deferreds.push(createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	deferreds.push(createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')));
	
	/*
	if ((APPLICATION.user) && (APPLICATION.user.organization)) {
		deferreds.push(
			ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
			.done(function(json) {
				var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
				buildSelect2($('#criteria_community_id'), data, true);
			})
			.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
				console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
			})
		);
	}
	*/
	
	deferreds.push(
		ajaxGet(URLS.CONSTRUCTION_COMPANY.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].shortName});
				}
			}
			buildSelect2($('#criteria_construction_company_id, #construction_company_id'), data, true);
		}), 
		
		ajaxGet(URLS.SERVICE_TEAM.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			buildSelect2($('#criteria_service_team_id, #service_team_id'), data, true);
		}), 
		
		ajaxGet(URLS.CITY.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			buildSelect2($('#city_id'), data, true);
		}),

		ajaxGet(URLS.DISTRICT.LIST, null)
		.done(function(json) {
			var data = [];
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) {
					data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				}
			}
			buildSelect2($('#district_id'), data, true);
		})
	);
	
	requirejs(['fileinput'], function() {
		loadFileInput = function() {
			logoFile.fileinput({
				language: dashedLanguage,
				//msgPlaceholder: $.i18n.prop('community.logo.select') + ' (' + fileTypes.join() + ' )', 
				allowedFileExtensions: fileTypes, 
				allowedFileTypes: ['image'], 
				maxFileCount: 1,
				uploadAsync: false,
				showPreview: false,
				showRemove: false,
				showUpload: false,
				uploadUrl: URLS.COMMUNITY.UPLOAD.LOGO, 
				uploadExtraData: function() {
					return {id: $("#id").val()};
				}
			});	
		};
	
		if (!language.startsWith('en')) {
			var url = getFileInputTranslation(language);
			if (url) {
				deferreds.push($.getScript(url, function() {
					loadFileInput();
				}));
			}
			else loadFileInput()
		}
	});
	
	$('.nav-tabs a:first').tab('show');
	
	tableElement = $('#table');
	contactTableElement = $('#contact_table');

	//var height = configTableHeight(tableElement, true, false);

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable(
			getDataTableOptions({
				//"language": getDataTablesLanguage(),
				"columns": [
					{"data": "no", "title": $.i18n.prop('community.no'), "sortable": true, 'width': 60},
					{"data": "name", "title": $.i18n.prop('community.name'), "sortable": false, 'width': 150},
					{"data": "phoneNo", "title": $.i18n.prop('community.phone'), "sortable": false, 'width': 100},
					{"data": "city", "title": $.i18n.prop('city'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender}, 
					{"data": "district", "title": $.i18n.prop('district'), "sortable": false, 'width': 80, "render": dataTableHelper.render.nameRender}, 
					{"data": "road", "title": $.i18n.prop('address.road'), "sortable": false, 'width': 80}, 
					{"data": "section", "title": $.i18n.prop('address.section'), "sortable": false, 'width': 60}, 
					{"data": "address", "title": $.i18n.prop('community.address'), "sortable": false, 'width': 150}, 
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
			getDataTableOptions({
				"columns": [
					//{"data": null, "title": "", "sortable": false, 'width': 30, "render": dataTableHelper.render.commonButtonRender},
					{"data": "name", "title": $.i18n.prop('contact.name'), "sortable": false, 'width': 100},
					{"data": "unit", "title": $.i18n.prop('contact.unit'), "sortable": false, 'width': 60},
					{"data": "title", "title": $.i18n.prop('contact.title'), "sortable": false, 'width': 60},
					{"data": "phoneNo", "title": $.i18n.prop('contact.phone'), "sortable": false, 'width': 100},
					{"data": "mobilePhoneNo", "title": $.i18n.prop('contact.mobile_phone'), "sortable": false, 'width': 120},
					{"data": "email", "title": $.i18n.prop('contact.email'), "sortable": false, 'width': 60},
				],
				"ordering": false,
				"serverSide": true,
				"ajax": loadContactTable, 
			})
		);

	}));
	
	$.when.apply($, deferreds).then(function() {

		$('.nav-tabs .nav-link').on('shown.bs.tab', function(e) {
			contactTable.responsive.recalc();
			contactTable.columns.adjust().responsive.recalc();
		});
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				organizationId: {
					requiredid: true 
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
				constructionCompanyId: {
					required: false
				},
				no: {
					required: true, 
					minlength: 2, 
					maxlength: 14, 
					remote: {
						url: URLS.COMMUNITY.CHECK_NO,
						type: "post",
						data: {
							no: function() {return $("#no").val();}, 
							id: function() {return $("#id").val();}
						}
					}
				},
				name: {
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
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true, 'import': true, 'export': true});
		
		editForm = form.editForm({
			form: form,
			table: tableElement,
			dataTable: table,
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.COMMUNITY.SAVE, 
			removeUrl: URLS.COMMUNITY.DELETE, 
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
						var data = editForm.activeRow.data();
						editForm.formData(data);
					}
				}
				*/
			},
			afterPopulate: function(action) {
				var data = editForm.formData();
				$('#construction_company_id').val(data.constructionCompanyId ? data.constructionCompanyId : "").trigger('change');
				$('#organization_id').val(data.organizationId ? data.organizationId : "").trigger('change');
				$('#service_team_id').val(data.serviceTeamId ? data.serviceTeamId : "").trigger('change');
				$('#city_id').val(data.cityId ? data.cityId : "").trigger('change');
				
				if (data.qrcodeUrl) {
					//$('#qrcode').attr('src', APPLICATION.systemConfig.applicationRootUrl + APPLICATION.systemConfig.qrcodeUrl + data.qrcodeUrl);
					$('#qrcode').attr('src', URLS.ROOT + APPLICATION.systemConfig.qrcodeUrl + data.qrcodeUrl);
					$('#qrcode').removeClass('d-none');
				}
				else $('#qrcode').addClass('d-none');

				if (data.logoUrl) {
					//$('#logo_image').attr('src', APPLICATION.systemConfig.applicationRootUrl + APPLICATION.systemConfig.logoUrl + data.logoUrl);
					$('#logo_image').attr('src', URLS.ROOT + APPLICATION.systemConfig.logoUrl + data.logoUrl);
					$('#logo_image').removeClass('d-none');
				}
				else $('#logo_image').addClass('d-none');

				if (data.loginUrl) {
					$('#login_url').val(URLS.ROOT + "/" + data.loginUrl);
				}
				
				contactTable.ajax.reload();
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
						if ((saved) && ($('#logo_file').fileinput('getFilesCount') > 0)) {
							$('#id').val(saved.id);
							$('#logo_file').fileinput('upload');
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
				confirmButtonText: $.i18n.prop('operation.confirm')
			});
		});
		
		logoFile.on('filebatchuploadsuccess', function(event, data, previewId, index) {
			//console.log(data);
			toast.close();
			if (data) {
				if (data.files.length) $('#original_file_name').val(data.files[0].name);
				table.clear();
				var error = 0;
				if (data.response.length) {
					table.rows.add(data.response).draw();
					for (var i = 0; i < data.response.length; i++) {
						if ((data.response[i].validWaterNo == 0) || (data.response[i].validMeterNo == 0) || 
							(data.response[i].duplicateWaterNo == 1) || (data.response[i].duplicateMeterNo == 1) || (data.response[i].duplicateTransmitterNo == 1)) 
							error++;
					}
					if (error) {
						swal.fire({
							text: $.i18n.prop('meter.upload.error').format(error),
							type: "warning",
							showCancelButton: false,
							confirmButtonClass: "btn-danger",
							confirmButtonText: $.i18n.prop('operation.confirm')
						});
					}
				}
				if (table.rows().data().length > error) {
					$('#save').attr('disabled', false);
				}
			}
		});
		
		$('#refresh').on('click', refresh);
		
		table.responsive.recalc();
		table.columns.adjust().responsive.recalc();
		
		deferred.resolve();
	});

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
		ajaxPost(URLS.COMMUNITY.QUERY, data)
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
	
	ajaxGet(URLS.CONTACT.LIST_BY_COMMUNITY + $('#id').val())
	.done(function(json) {
		if ((json) && (json.length)) callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
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
		saveDataCookie();
	}
	
	if (table) table.ajax.reload();
}
