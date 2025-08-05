/*
requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'editForm', 'jquery-serialize', 'jquery-validate-messages', 'lightbox'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 300 * 1000
	});	
	app.initialize(refresh);
});
*/
initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	else $('#criteria_organization_id').val(APPLICATION.user.organizationId).trigger('change');
	refresh();
});

var language;
var locale;

var form;
var editForm;
var table;
var tableElement;
var systemConfig;
var validator;

var fromTimePicker;

var criteriaForm;
var criteriaValidator;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
    $.i18n.properties({
    	language: language,
    	name: [APPLICATION.SETTING.defaultLanguageFileName, 'setting-message', 'user-message'], 
        path: APPLICATION.SETTING.defaultLanguageFilePath,
        mode: 'map',
        cache: true,
        callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('setting');

			$('#title_section').text($.i18n.prop('setting'));
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
        	$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('terms.organization'));
			
        	$('#tab1').append($.i18n.prop('setting.tab_system'));
        	$('#tab5').append($.i18n.prop('setting.tab_display'));
        	$('#tab6').append($.i18n.prop('setting.path'));
        	$('#tab2').append($.i18n.prop('setting.tab_mail'));
        	$('#tab3').append($.i18n.prop('setting.tab_schedule'));
        	$('#tab4').append($.i18n.prop('setting.tab_fail_lock'));
        	
			$('#refresh').append($.i18n.prop('operation.refresh'));
        	
        	$('#setting_form #company_name_label').text($.i18n.prop('setting.company_name'));
        	$('#setting_form #company_url_label').text($.i18n.prop('setting.company_url'));
        	$('#setting_form #application_alias_label').text($.i18n.prop('setting.application_alias'));
        	$('#setting_form #application_title_label').text($.i18n.prop('setting.application_title'));
        	$('#setting_form #document_title_label').text($.i18n.prop('setting.document_title'));
        	$('#setting_form #client_application_alias_label').text($.i18n.prop('setting.client_application_alias'));
        	$('#setting_form #client_application_title_label').text($.i18n.prop('setting.client_application_title'));
        	$('#setting_form #client_document_title_label').text($.i18n.prop('setting.client_document_title'));
        	$('#setting_form #application_version_label').text($.i18n.prop('setting.application_version'));
			$('#criteria_setting_status_id_label, #setting_status_id_label').text($.i18n.prop('setting.status'));

        	$('#update_time_label').text($.i18n.prop('setting.update_time'));
        	$('#criteria_from_time_label, #from_time_label').text($.i18n.prop('setting.time.from'));
        	$('#to_time_label').text($.i18n.prop('setting.time.to'));

        	$('#mail_host_label').text($.i18n.prop('setting.mail_host'));
        	$('#mail_port_label').text($.i18n.prop('setting.mail_port'));
        	$('#mail_protocol_label').text($.i18n.prop('setting.mail_protocol'));
        	$('#mail_tls_label').text($.i18n.prop('setting.mail_tls'));
        	$('#mail_tls_yes_label').append($.i18n.prop('yes'));
        	$('#mail_tls_no_label').append($.i18n.prop('no'));
        	$('#mail_auth_label').text($.i18n.prop('setting.mail_auth'));
        	$('#mail_auth_yes_label').append($.i18n.prop('yes'));
        	$('#mail_auth_no_label').append($.i18n.prop('no'));
        	$('#mail_account_label').text($.i18n.prop('setting.mail_account'));
        	$('#mail_password_label').text($.i18n.prop('setting.mail_password'));

			$('#mail_test').append($.i18n.prop('setting.mail_test'));

        	$('#report_file_path_label').text($.i18n.prop('setting.report_file_path'));
        	$('#report_template_path_label').text($.i18n.prop('setting.report_template_path'));
        	$('#mail_template_path_label').text($.i18n.prop('setting.mail_template_path'));
        	$('#qrcode_path_label').text($.i18n.prop('setting.qrcode_path'));
        	$('#logo_path_label').text($.i18n.prop('setting.logo_path'));

        	$('#default_voltage_unit_label').text($.i18n.prop('setting.default_voltage_unit'));
        	$('#instant_decimal_place_label').text($.i18n.prop('setting.default_instant_decimal_place'));
        	$('#default_instant_unit_label').text($.i18n.prop('setting.default_instant_unit'));
        	$('#totalizer_decimal_place_label').text($.i18n.prop('setting.default_totalizer_decimal_place'));
        	$('#default_totalizer_unit_label').text($.i18n.prop('setting.default_totalizer_unit'));
        	$('#default_consumption_unit_label').text($.i18n.prop('setting.default_consumption_unit'));

        	$('#default_timezone_label').text($.i18n.prop('setting.default_timezone'));
        	$('#default_locale_label').text($.i18n.prop('setting.default_locale'));

        	$('#default_data_date_label').text($.i18n.prop('setting.datedate'));
        	$('#default_data_date_today_label').append($.i18n.prop('setting.datedate.today'));
        	$('#default_data_date_yesterday_label').append($.i18n.prop('setting.datedate.yesterday'));
        	$('#default_page_length_menu_label').text($.i18n.prop('setting.default_page_length_menu'));
        	$('#default_page_length_label').text($.i18n.prop('setting.default_page_length'));

        	$('#send_test').append($.i18n.prop('setting.mail.test'));

			$('#login_fail_lock_label').text($.i18n.prop('setting.fail_lock'));
        	$('#login_fail_lock_yes_label').append($.i18n.prop('yes'));
        	$('#login_fail_lock_no_label').append($.i18n.prop('no'));
			$('#login_fail_lock_minutes_label').text($.i18n.prop('setting.fail_lock_minutes'));
			$('#login_allow_retry_times_label').text($.i18n.prop('setting.fail_lock_times'));

			/*
			$('#status_label').text($.i18n.prop('status'));
			$('#status1_label').append($.i18n.prop('status.active'));
			$('#status2_label').append($.i18n.prop('status.inactive'));
			*/
			
        	$('#saving').text($.i18n.prop('operation.saving'));
        	$('#waiting').text($.i18n.prop('operation.waiting'));
        	$('#close_waiting').text($.i18n.prop('operation.close'));

			$('#build_report_cron_label').append($.i18n.prop('setting.build_report_cron'));
			$('#send_report_cron_label').append($.i18n.prop('setting.send_report_cron'));
			$('#build_bill_cron_label').append($.i18n.prop('setting.build_bill_cron'));
			$('#send_bill_cron_label').append($.i18n.prop('setting.send_bill_cron'));

        	$('#send_mail_dialog_header_text').append($.i18n.prop('setting.mail.test'));
        	$('#send_mail_dialog #receiver_label').text($.i18n.prop('setting.mail.test.receiver'));
        	$('#send_mail_dialog_confirm').append($.i18n.prop('operation.send'));
        	$('#send_mail_dialog_cancel').append($.i18n.prop('operation.cancel'));

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
	
	form = $('#setting_form');
	criteriaForm = $('#criteria_form');
	
	showOperationButtons($('.operation_container'), {copy: true});
	
	moment.locale(language);
	
	$('.icheck').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});
	
	locale = APPLICATION.user.locale ? APPLICATION.user.locale : APPLICATION.systemConfig.defaultLocale;

	deferreds.push(
		//createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')),  
		createCodeSelect2($('#criteria_setting_status_id, #setting_status_id'), URLS.CODE.LIST.SETTING_STATUS, true, true, true)
	);
	
	//createDatePicker($('#criteria_from_time'), moment().format(APPLICATION.SETTING.defaultDateTimeFormat), true, false);
	createDatePicker($('#from_time'), moment().format(APPLICATION.SETTING.defaultDateTimeFormat), true, false);
	createDatePicker($('#to_time'), moment().format(APPLICATION.SETTING.defaultDateTimeFormat), true, false);
	
	var dashedLanguage = language.replace('_', '-');

	var nowTimer = setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);

	tableElement = $('#table');
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		var dataTableTranslation = getDataTableTranslation(language);
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
			"order": [[0, "asc"]],
			"info": true,
			"stateSave": false,
			"responsive": true,
			"autoWidth": false,
			"columns": [
				{"data": "fromTime", "sortable": true, "title": $.i18n.prop('setting.from_time'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
				{"data": "toTime", "sortable": false, "title": $.i18n.prop('setting.to_time'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
				{"data": "updateTime", "sortable": false, "title": $.i18n.prop('setting.update_time'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
				{"data": "user", "sortable": false, "title": $.i18n.prop('user'), "render": dataTableHelper.render.nameRender, "width": 100, "className": "min-mobile-p"},
				{"data": "settingStatus", "sortable": false, "title": $.i18n.prop('setting.status'), "render": dataTableHelper.render.codeRender, "width": 40, "className": "min-mobile-p"},
			], 
			"deferLoading": 0,
			"processing": false, 
			"serverSide": true,
			"ajax": loadTable
			*/
			getDataTableOptions({
				"columns": [
					{"data": "fromTime", "sortable": true, "title": $.i18n.prop('setting.time.from'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
					{"data": "toTime", "sortable": false, "title": $.i18n.prop('setting.time.to'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
					{"data": "updateTime", "sortable": false, "title": $.i18n.prop('setting.time.update'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
					{"data": "user", "sortable": false, "title": $.i18n.prop('user'), "render": dataTableHelper.render.nameRender, "width": 100, "className": "min-mobile-p"},
					{"data": "settingStatus", "sortable": false, "title": $.i18n.prop('setting.status'), "render": dataTableHelper.render.codeRender, "width": 40, "className": "min-mobile-p"},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
				],
				//"responsive": true,
				//"autoWidth": true,
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);	
	}));
	
	$('.nav-tabs a:first').tab('show');
	
	$.when.apply($, deferreds)
	.done(function() {
		
		criteriaValidator = criteriaForm.validate({
			rules: {
				//fromTime: {required: true}
			}
		});
		
		validator = form.validate({
			rules: {
				fromTime: {
					required: true
				},
				companyName: {
					required: true
				},
				documentTitle: {
					required: true
				},
				applicationTitle: {
					required: true
				},
				applicationAlias: {
					required: true
				},
				applicationVersion: {
					required: true
				},
				reportTemplatePath: {
					required: true
				},
				reportFilePath: {
					required: true
				},
				mailTemplatePath: {
					required: true
				},
				qrcodePath: {
					required: true
				},
				logoPath: {
					required: true
				},
				defaultTimezone: {
					required: true
				},
				defaultLocale: {
					required: true
				}, 
				defaultEncoding: {
					required: true
				}
			}
		});
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		//addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': false, 'add': true});
		
		editForm = form.editForm({
			form: form, 
			table: tableElement,
			dataTable: table,
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.SETTING.SAVE_APPLICATION, 
			beforePopulate: function() {
				var data = editForm.formData();
				if (data.applicationConfig) {
					$.extend(data, data.applicationConfig);
					delete data.applicationConfig;
				}
				//data.fromTime = moment().format(APPLICATION.SETTING.defaultDateTimeFormat);
				editForm.formData(data);
			}, 
			afterPopulate: function(action) {
				var data = editForm.formData();
				if ((data.defaultPageLengthMenu) && (data.defaultPageLengthMenu.length)) $('input[name="defaultPageLengthMenu"]').val(data.defaultPageLengthMenu.join());
				if ((data.locales) && (data.locales[language])) {
					$('input[name="companyName"]').val(data.locales[language]["COMPANY_NAME"]);
					$('input[name="applicationTitle"]').val(data.locales[language]["APPLICATION_TITLE"]);
					$('input[name="applicationAlias"]').val(data.locales[language]["APPLICATION_ALIAS"]);
					$('input[name="documentTitle"]').val(data.locales[language]["DOCUMENT_TITLE"]);
					$('input[name="clientApplicationTitle"]').val(data.locales[language]["CLIENT_APPLICATION_TITLE"]);
					$('input[name="clientApplicationAlias"]').val(data.locales[language]["CLIENT_APPLICATION_ALIAS"]);
					$('input[name="clientDocumentTitle"]').val(data.locales[language]["CLIENT_DOCUMENT_TITLE"]);
				}
				$('#from_time').data('daterangepicker').setStartDate(data.fromTime);
				$('#to_time').data('daterangepicker').setStartDate(data.toTime);
			}, 
			beforeSave(saving) {
				var data = editForm.serializeObject();
				data.locale = language; // For Backend
				saving = {
					id: (editForm.mode == CONSTANT.ACTION.COPY) ? 0 : data.id, 
					//organizationId: data.organizationId, 
					//fromTime: data.fromTime + ' 00:00:00', 
					//toTime: data.toTime + ' 23:59:59', 
					fromTime: data.fromTime, 
					toTime: data.toTime, 
					settingStatusId: data.settingStatusId
				};
				var pagelengthMenu = data.defaultPageLengthMenu.split(',');
				if (pagelengthMenu) data.defaultPageLengthMenu = pagelengthMenu;
				delete data.id;
				delete data.fromTime;
				saving.applicationConfig = data;
				//console.log('*** Cloned saving: %o ***', saving);
				return saving;
			}, 
			afterCopy: function() {
				var data = editForm.formData();
				var fromTime = moment(data.toTime).add('days', 1).format(APPLICATION.SETTING.defaultDateFormat);
				var toTime = moment(data.toTime).add('years', 1).format(APPLICATION.SETTING.defaultDateFormat);
				data.id = 0;
				data.settingStatusId = APPLICATION.codeHelper.settingStatusExpiring.id;
				editForm.formData(data);
				$('#id', form).val('0');
				
				swal.fire({
					title: $.i18n.prop('setting.copy.hint'),
					icon: 'info',
					html: '<label class="control-label" id="copy_from_time_label" for="copy_from_time">{0}</label>'.format($.i18n.prop('setting.time.from')) +
							'<input type="text" class="form-control" id="copy_from_time" name="copyFromTime" value="{0}" placeholder="{1}">'.format(fromTime, $.i18n.prop('setting.time.from')) +
							'<label class="control-label mt-3" id="copy_to_time_label" for="copy_to_time">{0}</label>'.format($.i18n.prop('setting.time.to')) + 
							'<input type="text" class="form-control" id="copy_to_time" name="copyTtoTime" value="{0}" placeholder="{1}">'.format(toTime, $.i18n.prop('setting.time.to')),
					showCancelButton: false,
					onOpen: () => {
						createDatePicker($('#copy_from_time'), fromTime.format(APPLICATION.SETTING.defaultDateFormat), false, false);
						createDatePicker($('#copy_to_time'), toTime.format(APPLICATION.SETTING.defaultDateFormat), false, false);
					}
				})
				.then(function() {
					//$('#from_time').val($('#copy_from_time').val());
					//$('#to_time').val($('#copy_to_time').val());
					$('#from_time').val($('#copy_from_time').val() + ' 00:00:00');
					$('#to_time').val($('#copy_to_time').val() + ' 23:59:59');
				});
			},  
		});

		$('#mail_test').on('click', function(e) {
			if (e) e.preventDefault();
			var sendMailDialog = $('#send_mail_dialog');
			var dialogTitle = $.i18n.prop('setting.mail.test.title');
			sendMailDialog.modal({backdrop: 'static', keyboard: false})
			.one('click', '#send_mail_dialog_confirm', function (e) {
				e.preventDefault();
				try {
					if (toast) toast.fire({
						type: 'info', 
						title: $.i18n.prop('operation.sending') + ' ' + $.i18n.prop('operation.waiting') 
					});
					
					var params = {
						mailHost: $('input[name="mailHost"]').val(), 
						mailPort: parseInt($('input[name="mailPort"]').val()), 
						mailProtocol: $('input[name="mailProtocol"]').val(), 
						mailTls: $('input[name="mailTls"]:checked').val() == "1", 
						mailAuth: $('input[name="mailAuth"]:checked').val() == "1", 
						mailAccount: $('input[name="mailAccount"]').val(), 
						mailPassword: $('input[name="mailPassword"]').val(), 
						receiver: $('input[name="receiver"]').val()
					};
					$.post(URLS.NOTIFICATION.SEND_TEST, params, function(response) {
						console.log('*** Send Mail Result: %o ***', response);
						$('#test_result').html(response);
						if (toast) toast.fire({
							type: 'info', 
							title: $.i18n.prop('operation.sent') 
						});
					}, 'text');
				}
				catch(e) {
					console.log('*** Send Mail Exception: %o ***', e);
				}
				//sendMailDialog.modal('toggle');
			})
			.one('click', '#send_mail_dialog_cancel', function (e) {
				e.preventDefault();
				sendMailDialog.modal('toggle');
			});
		});

		$('#refresh').on('click', refresh);
	
		return deferred.resolve();
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
		ajaxGet(URLS.SETTING.LIST_BY_APPLICATION, null)
		.done(function(json) {
			if ((json) && (json.length)) callback({'data': json, 'recordsTotal': json.length, 'recordsFiltered': json.length});
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

function refresh(e) {
	if (e) e.preventDefault();
	/*
	criteriaForm.valid();
	if (criteriaValidator.numberOfInvalids() > 0) return;
	*/
	if (table) table.ajax.reload(null, false);
}
