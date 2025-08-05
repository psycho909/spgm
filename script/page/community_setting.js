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
	app.initialize(function() {
		if (APPLICATION.data.activeCommunityId) $('#criteria_community_id').val(APPLICATION.data.activeCommunityId).trigger('change');
	});
});
*/
initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	//if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	else $('#criteria_organization_id').val(APPLICATION.user.organizationId).trigger('change');
	refresh();
});

var language;
var locale;

var form;
var editForm;
var validator; 
var table;
var tableElement;

var criteriaForm;
var criteriaValidator;

var activeCriteriaOrganizationId;
var activeOrganizationId;
var activeCriteriaCommunityId;
var activeCommunityId;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
    $.i18n.properties({
    	language: language,
    	name: [APPLICATION.SETTING.defaultLanguageFileName, 'organization-message', 'community_setting-message', 'community-message', 'user-message'], 
        path: APPLICATION.SETTING.defaultLanguageFilePath,
        mode: 'map',
        cache: true,
        callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('community_setting');
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_configuration').text($.i18n.prop('breadcrumb.configuration'));
			$('#breadcrumb_configuration_community_setting').text(APPLICATION.documentTitle);

			$('#title_section').text($.i18n.prop('community_setting'));
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
        	$('#form_title').text($.i18n.prop('operation.input'));

        	$('#tab1').append($.i18n.prop('community_setting.information'));
        	$('#tab2').append($.i18n.prop('community_setting.settlement'));
        	$('#tab3').append($.i18n.prop('community_setting.blacklist'));
        	$('#tab4').append($.i18n.prop('community_setting.reserve'));
        	$('#tab5').append($.i18n.prop('community_setting.charging'));
        	
			$('#refresh').append($.i18n.prop('operation.refresh'));
			$('.check_all').append($.i18n.prop('operation.check.all'));
			$('.uncheck_all').append($.i18n.prop('operation.uncheck.all'));

			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
        	$('#update_time_label').text($.i18n.prop('community_setting.update_time'));
        	$('#from_time_label').text($.i18n.prop('community_setting.time.from'));
        	$('#to_time_label').text($.i18n.prop('community_setting.time.to'));
        	//$('#overtime_threshhold_label').text($.i18n.prop('community_setting.overtime.threshhold'));
        	$('#minimum_balance_label').text($.i18n.prop('community_setting.balance.minimum'));
        	$('#paying_balance_label').text($.i18n.prop('community_setting.balance.paying'));

			$('#setting_status_id_label').text($.i18n.prop('community_setting.status'));
			
        	$('#settlement_date_from_label').text($.i18n.prop('community_setting.settlement.date.from'));
        	$('#settlement_date_to_label').text($.i18n.prop('community_setting.settlement.date.to'));
			

        	$('#paying_amount_label').text($.i18n.prop('community_setting.blacklist.paying.amount'));
			$('#cancelled_times_label').text($.i18n.prop('community_setting.blacklist.cancelled.times'));
			//$('#overtime_minutes_label').text($.i18n.prop('community_setting.blacklist.overtime.minutes'));

        	//$('#reserve_within_hours_label').text($.i18n.prop('community_setting.reserve.within.hours'));
        	$('#reserve_within_days_label').text($.i18n.prop('community_setting.reserve.within.days'));
        	$('#reserve_from_hours_label').text($.i18n.prop('community_setting.reserve.from.hours'));
        	$('#reserve_interval_label').text($.i18n.prop('community_setting.reserve.interval'));
        	
			$('#charging_hour_label').text($.i18n.prop('community_setting.charging.hour.weekday'));
			$('#holiday_charging_hour_label').text($.i18n.prop('community_setting.charging.hour.holiday'));
			$('#weekday_parking_hour_label').text($.i18n.prop('community_setting.parking.hour.weekday'));
			$('#holiday_parking_hour_label').text($.i18n.prop('community_setting.parking.hour.holiday'));

				
			$('#function_moudule_label').text($.i18n.prop('community_setting.function.moudule'));
			$('#enable_parking_label').text($.i18n.prop('community_setting.enable.parking'));
			$('#enable_charging_label').text($.i18n.prop('community_setting.enable.charging'));
			$('#enable_finance_label').text($.i18n.prop('community_setting.enable.finance'));
			$('#enable_blacklist_label').text($.i18n.prop('community_setting.enable.blacklist'));
			$('#enable_reservation_label').text($.i18n.prop('community_setting.enable.reservation'));
			$('#enable_check_distance_label').text($.i18n.prop('community.enable.check.distance'));
			$('#distance_label').text($.i18n.prop('community.distance'));

			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			
        	$('#saving').text($.i18n.prop('operation.saving'));
        	$('#waiting').text($.i18n.prop('operation.waiting'));
        	$('#close_waiting').text($.i18n.prop('operation.close'));

			$.i18n.prop('community_setting.copy.hint');
			
        	deferred.resolve();
        }
    });
    return deferred.promise();
}

function initial() {
	
	"use strict";
	applyLayoutOption();

	$('.nav-tabs a:first').tab('show');
	
	var deferred = $.Deferred();
	var deferreds = [];
	
	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'), {copy: true});
	
	$('input[type="checkbox"].icheck').iCheck({
		checkboxClass: 'icheckbox_square-blue', 
		tap: true
	});			

	moment.locale(language);

	$('#status_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});
	
	locale = APPLICATION.user.locale ? APPLICATION.user.locale : APPLICATION.systemConfig.defaultLocale;

	/*
	if ((APPLICATION.user) && (APPLICATION.user.organization)) {
		deferreds.push(
			ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
			.done(function(json) {
				var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
				buildSelect2($('#criteria_community_id, #community_id'), data, false);
			})
			.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
				console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
			})
		);
	}
	*/
	deferreds.push(
		createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')), 
		createCommunitySelect($('#criteria_community_id, #community_id'), true),
		createCodeSelect2($('#setting_status_id'), URLS.CODE.LIST.SETTING_STATUS, false, true, false)
	);
	
	createDatePicker($('#from_time'), moment().format(APPLICATION.SETTING.defaultDateFormat), true, false);
	createDatePicker($('#to_time'), moment().format(APPLICATION.SETTING.defaultDateFormat), true, false);
	
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
			"ordering": false,
			"info": true,
			"stateSave": false,
			"responsive": true,
			"autoWidth": false,
			"columns": [
				{"data": "fromTime", "sortable": false, "title": $.i18n.prop('community_setting.from_time'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
				{"data": "toTime", "sortable": false, "title": $.i18n.prop('community_setting.to_time'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
				{"data": "updateTime", "sortable": false, "title": $.i18n.prop('community_setting.update_time'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
				{"data": "user", "sortable": false, "title": $.i18n.prop('user'), "render": dataTableHelper.render.nameRender, "width": 100, "className": "min-mobile-p"},
				//{"data": "community", "sortable": false, "title": $.i18n.prop('community'), "width": 100, "render": dataTableHelper.render.nameRender, "className": "min-mobile-p"},
				{"data": "settingStatus", "sortable": false, "title": $.i18n.prop('community_setting.status'), "render": dataTableHelper.render.codeRender, "width": 40, "className": "min-mobile-p"},
			], 
			"deferLoading": 0,
			"processing": false, 
			"serverSide": true,
			"ajax": loadTable
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": "communityNo", "visible": false, "sortable": true},
					{"data": "communityName", "title": $.i18n.prop('community.name'), "sortable": false, 'width': 120},
					{"data": "fromTime", "sortable": false, "title": $.i18n.prop('community_setting.time.from'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
					{"data": "toTime", "sortable": false, "title": $.i18n.prop('community_setting.time.to'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
					{"data": "active", "title": $.i18n.prop('community_setting.active'), "sortable": true, 'width': 40, "class": "text-center", "render": dataTableHelper.render.booleanRender},
					{"data": "updateTime", "sortable": false, "title": $.i18n.prop('community_setting.update_time'), "render": dataTableHelper.render.dateTimeRender, "width": 100, "className": "min-mobile-p"},
					{"data": "user", "sortable": false, "title": $.i18n.prop('user'), "render": dataTableHelper.render.nameRender, "width": 100, "className": "min-mobile-p"},
					//{"data": "community", "sortable": false, "title": $.i18n.prop('community'), "width": 100, "render": dataTableHelper.render.nameRender, "className": "min-mobile-p"},
					{"data": "settingStatus", "sortable": false, "title": $.i18n.prop('community_setting.status'), "render": dataTableHelper.render.codeRender, "width": 40, "className": "min-mobile-p"},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);
	}));

	/*
	var effectiveTime = moment().add(1, 'days').set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}).format(APPLICATION.SETTING.defaultDateTimeFormat);
	$('#effective_time').daterangepicker(
		{
			startDate: effectiveTime,
			endDate: effectiveTime,
			timePicker: true,
			singleDatePicker: true,
			timePicker24Hour: true,
			timePickerSeconds: false,
			timePickerIncrement: 60,
			locale: {
				format: APPLICATION.SETTING.defaultDateTimeFormat,
				separator: APPLICATION.SETTING.dateRangeSeparator,
				applyLabel: $.i18n.prop('operation.confirm'),
				cancelLabel: $.i18n.prop('operation.cancel')
			}
		}
	);
	*/
	
	createHourCheckbox($('#weekday_parking_hour_container'), 'weekdayParkingHour');
	createHourCheckbox($('#holiday_parking_hour_container'), 'holidayParkingHour');
	
	if (APPLICATION.systemConfig.communityChargingHourEnabled) {
		$('.community_charging_hour').removeClass('d-none');
		createHourCheckbox($('#charging_hour_container'), 'chargingHour');
		createHourCheckbox($('#holiday_charging_hour_container'), 'holidayChargingHour');
	}
	
	$.when.apply($, deferreds)
	.done(function() {
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				organizationId: {requiredid: true}
			}
		});
		
		validator = form.validate({
			rules: {
				organizationId: {requiredid: true}, 
				communityId: {requiredid: true},
				fromTime: {required: true},
				minimumBalance: {min: -99999, max: 99999}, 
				settlementDateFrom: {min: 1, max: 31}, 
				settlementDateTo: {min: 1, max: 31}, 
				reserveFromHours: {min: 0, max: 9999}, 
				reserveWithinHours: {min: 0, max: 9999}, 
				reserveInterval: {min: 1, max: 1440}, 
				settingStatusId: {required: true}
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
			saveUrl: URLS.SETTING.SAVE_COMMUNITY, 
			beforePopulate: function() {
				var data = editForm.formData();
				if (data.communityConfig) {
					$.extend(data, data.communityConfig);
					delete data.communityConfig;
				}
				editForm.formData(data);
			}, 
			afterPopulate: function(action) {
				var data = editForm.formData();
				
				if (data.active) $('button.operation[value="D"]').hide();
				else $('button.operation[value="D"]').show();
				
				//$('.select2', form).trigger('change');
				$('#organization_id').val(data.organizationId ? data.organizationId : "").trigger('change');
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				
				if (APPLICATION.systemConfig.communityChargingHourEnabled) {
					loadHourCheckbox(action, data.chargingHour, 'input[name="chargingHour"]');
					loadHourCheckbox(action, data.holidayChargingHour, 'input[name="holidayChargingHour"]');
				}
				$('input[name="enableParking"]').iCheck((data.enableParking) ? 'check' : 'uncheck');
				$('input[name="enableCharging"]').iCheck((data.enableCharging) ? 'check' : 'uncheck');
				$('input[name="enableFinance"]').iCheck((data.enableFinance) ? 'check' : 'uncheck');
				$('input[name="enableReservation"]').iCheck((data.enableReservation) ? 'check' : 'uncheck');
				$('input[name="enableBlacklist"]').iCheck((data.enableBlacklist) ? 'check' : 'uncheck');
				$('input[name="enableCheckDistance"]').iCheck((data.enableCheckDistance) ? 'check' : 'uncheck');
				/*
				loadHourCheckbox(action, data.weekdayParkingHour, 'input[name="weekdayParkingHour"]');
				loadHourCheckbox(action, data.holidayParkingHour, 'input[name="holidayParkingHour"]');
				*/
				$('#from_time').data('daterangepicker').startDate = moment(data.fromTime);
				$('#to_time').data('daterangepicker').toDate = moment(data.toTime);
			},
			beforeSave(saving) {
				var data = editForm.serializeObject();
				data.locale = language; // For Backend
				
				data.chargingHour = '';
				$('input[name="chargingHour"]:checked').each(function(i, v) {
					if (data.chargingHour.length > 0) data.chargingHour += ',';
					data.chargingHour += $(v).val();
				});
				data.holidayChargingHour = '';
				$('input[name="holidayChargingHour"]:checked').each(function(i, v) {
					if (data.holidayChargingHour.length > 0) data.holidayChargingHour += ',';
					data.holidayChargingHour += $(v).val();
				});

				data.weekdayParkingHour = '';
				$('input[name="weekdayParkingHour"]:checked').each(function(i, v) {
					if (data.weekdayParkingHour.length > 0) data.weekdayParkingHour += ',';
					data.weekdayParkingHour += $(v).val();
				});
				
				data.holidayParkingHour = '';
				$('input[name="holidayParkingHour"]:checked').each(function(i, v) {
					if (data.holidayParkingHour.length > 0) data.holidayParkingHour += ',';
					data.holidayParkingHour += $(v).val();
				});
				
				saving = {
					id: (editForm.mode == CONSTANT.ACTION.COPY) ? 0 : data.id, 
					organizationId: data.organizationId, 
					communityId: data.communityId, 
					//fromTime: data.fromTime + ' 00:00:00', 
					//toTime: data.toTime + ' 23:59:59', 
					fromTime: data.fromTime, 
					toTime: data.toTime, 
					settingStatusId: data.settingStatusId, 
				};
				delete data.id;
				delete data.updated;
				delete data.communityId;
				delete data.fromTime;
				delete data.toTime;
				delete data.updateTime;
				saving.communityConfig = data;
				
				console.log('*** Cloned saving: %o ***', saving);
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
					title: $.i18n.prop('community_setting.copy.hint'),
					type: 'info',
					html: '<input type="text" class="form-control" id="copy_from_time" name="copyFromTime" value="{0}" placeholder="{1}">'.format(fromTime, $.i18n.prop('community_setting.time.from')) + 
							'<input type="text" class="form-control mt-3" id="copy_to_time" name="copyTtoTime" value="{0}" placeholder="{1}">'.format(toTime, $.i18n.prop('community_setting.time.to')),
					showCancelButton: false,
					onOpen: () => {
						createDatePicker($('#copy_from_time'), fromTime.format(APPLICATION.SETTING.defaultDateFormat), false, false);
						createDatePicker($('#copy_to_time'), toTime.format(APPLICATION.SETTING.defaultDateFormat), false, false);
					}
				})
				.then(function() {
					$('#from_time').val($('#copy_from_time').val() + ' 00:00:00');
					$('#to_time').val($('#copy_to_time').val() + ' 23:59:59');
				});
			},  
		});

		$('.check_all').on('click', function(e) {
			e.preventDefault();
			var scope = $(this).attr('scope');
			if (scope) $('input[name="{0}"]'.format(scope)).iCheck('check').iCheck('update');
		});
		
		$('.uncheck_all').on('click', function(e) {
			e.preventDefault();
			var scope = $(this).attr('scope');
			if (scope) $('input[name="{0}"]'.format(scope)).iCheck('uncheck').iCheck('update');
		});

		$('#criteria_organization_id').on('change', function(e) {
			activeCriteriaOrganizationId = changeOrganization(criteriaForm.serializeObject(), $(this), activeCriteriaOrganizationId, $('#criteria_community_id'), null);
		});
		
		$('#organization_id').on('change', function(e) {
			activeOrganizationId = changeOrganization(editForm.formData(), $(this), activeOrganizationId, $('#community_id'), null);
		});
		
		$('#refresh').on('click', refresh);

		return deferred.resolve();
	});
	
	return deferred.promise();
}

function loadHourCheckbox(action, value, selector) {
	$(selector).iCheck('uncheck');
	if (action != CONSTANT.ACTION.ADD) {
		if (value) {
			var hours = value.split(',');
			hours.forEach(e => $(selector + '[value="{0}"]'.format(e)).iCheck('check'));
		}
	}
	$(selector).iCheck('update');
}

function loadTable(data, callback, settings) {
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});

	data.parameters = criteriaForm.serializeObject();
	data.parameters.scopeId = APPLICATION.codeHelper.settingScopeCommunity.id;
	var communityId = $('#criteria_community_id').val() > 0 ? $('#criteria_community_id').val() : 0;
	deferreds.push(
		ajaxGet(URLS.SETTING.LIST_BY_COMMUNITY + $('#criteria_organization_id').val() + '/' + communityId, null)
		//ajaxPost(URLS.SETTING.QUERY, data)
		.done(function(json) {
			//if ((json) && (json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
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
	if (!criteriaForm.valid()) return false;
	
	var organizationId = $('#criteria_organization_id').val();
	if (organizationId != APPLICATION.data.activeOrganizationId) {
		APPLICATION.data.activeOrganizationId = organizationId;
	}
	saveDataCookie();
	
	if (table) table.ajax.reload(null, false);
}
