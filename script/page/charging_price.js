initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

var language;

var table;
var tableElement;

var form;
var editForm;
var validator;

var pricePeriodTable;
var pricePeriodTableElement;

var pricePeriodForm;
var pricePeriodEditForm;
var pricePeriodValidator;

var criteriaForm;
var criteriaValidator;

var activeCriteriaOrganizationId;
var activeOrganizationId;

var copyTitle;
var copyLabel;
var copyError;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'organization-message', 'charging_price-message', 'community-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			copyTitle = $.i18n.prop('charging_price.copy.hint');
			copyLabel = $.i18n.prop('charging_price.copy.percent');
			copyError = $.i18n.prop('charging_price.copy.percent.range');
			
			APPLICATION.documentTitle = $.i18n.prop('charging_price');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_charge').text($.i18n.prop('breadcrumb.charge'));
			$('#breadcrumb_charging_price').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));

			$('#from_time_label').text($.i18n.prop('charging_price.time.from'));
			$('#to_time_label').text($.i18n.prop('charging_price.time.to'));
			$('#summer_from_time_label').text($.i18n.prop('charging_price.time.summer.from'));
			$('#summer_to_time_label').text($.i18n.prop('charging_price.time.summer.to'));
			$('#cost_reference_label').text($.i18n.prop('charging_price.cost_reference'));
			$('#note_label').text($.i18n.prop('charging_price.note'));

			$('#from_weekday_label').text($.i18n.prop('charging_price.weekday'));
			$('#from_hour_label').text($.i18n.prop('charging_price.hour'));
			$('#summer_month_label').text($.i18n.prop('charging_price.summer_month'));
			$('#price_label').text($.i18n.prop('charging_price.price'));
			$('#peak_time_type_id_label').text($.i18n.prop('charging_price.peaktime'));

			$('#refresh').append($.i18n.prop('operation.query'));

			$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			/*
			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));

			$('button.inner_operation[value="A"]').append($.i18n.prop('operation.add'));
			$('button.inner_operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.inner_operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.inner_operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.inner_operation[value="S"]').append($.i18n.prop('operation.sure'));
			*/
			
			$('#tab1').append($.i18n.prop('charging_price'));
			$('#tab2').append($.i18n.prop('charging_price.period'));

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
	
	//var dashedLanguage = language.replace('_', '-');

	form = $('#form');
	pricePeriodForm = $('#price_period_form');
	criteriaForm = $('#criteria_form');

	showOperationButtons($('.operation_container'), {copy: true});
	
	// Date
	moment.locale(language);

	$('input[type="checkbox"].icheck').iCheck({
		checkboxClass: 'icheckbox_square-blue', 
		tap: true
	});
	
	deferreds.push(createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')));
	
	buildSelect2($('#criteria_community_id, #community_id'), null, true);

	deferreds.push(createCodeRadio($('#peak_time_type_id_container'), 'peakTimeTypeId', URLS.CODE.LIST.PEAK_TIME_TYPE));

	var nowTime = moment().format(APPLICATION.SETTING.defaultDateFormat);

	var fromTimeDatePicker = createDatePicker($('#from_time'), nowTime, false, false);
	var toTimeDatePicker = createDatePicker($('#to_time'), moment().format(APPLICATION.SETTING.defaultDateFormat), false, false);
	var summerFromTimeDatePicker = createDatePicker($('#summer_from_time'), moment().format(APPLICATION.SETTING.defaultDateFormat), false, false);
	var summerToTimeDatePicker = createDatePicker($('#summer_to_time'), moment().format(APPLICATION.SETTING.defaultDateFormat), false, false);
	/*
	var fromTimeDatePicker = createDatePicker($('#from_time'), moment().format(APPLICATION.SETTING.defaultDateTimeFormat), true, true);
	var toTimeDatePicker = createDatePicker($('#to_time'), moment().format(APPLICATION.SETTING.defaultDateTimeFormat), true, true);
	var summerFromTimeDatePicker = createDatePicker($('#summer_from_time'), moment().format(APPLICATION.SETTING.defaultDateTimeFormat), true, true);
	var summerToTimeDatePicker = createDatePicker($('#summer_to_time'), moment().format(APPLICATION.SETTING.defaultDateTimeFormat), true, true);
	*/
	//createDatePicker($('#from_time, #to_time, #summer_from_time, #summer_to_time'), moment().format(APPLICATION.SETTING.defaultDateTimeFormat), true, true);
	
	$('.nav-tabs a:first').tab('show');
	
	tableElement = $('#table');
	pricePeriodTableElement = $('#price_period_table');

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		
		table = tableElement.DataTable({
			"data": null, 
			"language": getDataTablesLanguage(),
			"paging": true,
			'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength, 
			"lengthChange": false,
			"searching": false,
			"ordering": true,
			"orderClasses": false, 
			"order": [[2, "asc"]],
			"info": false,
			"autoWidth": false,
			"columns": [
				//{"data": null, "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
				{"data": "costReference", "title": $.i18n.prop('charging_price.cost_reference'), "sortable": false, 'width': 80, "class": "text-center", "render": dataTableHelper.render.booleanRender},
				{"data": "fromTime", "title": $.i18n.prop('charging_price.time.from'), "sortable": true, 'width': 80, "render": dataTableHelper.render.dateRender},
				{"data": "toTime", "title": $.i18n.prop('charging_price.time.to'), "sortable": false, 'width': 80, "render": dataTableHelper.render.dateRender},
				{"data": "organization", "title": $.i18n.prop('organization'), "sortable": false, 'width': 80, render: dataTableHelper.render.shortNameRender},
				{"data": "community", "title": $.i18n.prop('community'), "sortable": false, 'width': 80, render: dataTableHelper.render.nameRender},
				{"data": "summerFromTime", "title": $.i18n.prop('charging_price.time.summer.from'), "sortable": false, 'width': 80, "render": dataTableHelper.render.dateRender},
				{"data": "summerToTime", "title": $.i18n.prop('charging_price.time.summer.to'), "sortable": false, 'width': 80, "render": dataTableHelper.render.dateRender},
				{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 100, "render": dataTableHelper.render.commonButtonRender}, 
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
		});
		
		pricePeriodTable = pricePeriodTableElement.DataTable({
			"data": null,
			"language": getDataTablesLanguage(), 
			"paging": false,
			"lengthChange": false,
			"searching": false,
			"ordering": true,
			"orderClasses": false, 
			"order": [[1, "desc"], [3, "asc"], [5, "asc"]],
			"info": false, 
			"fixedHeader": true,
			"autoWidth": false, 
			"columns": [
				//{"data": null, "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
				{"data": "summerMonth", "title": $.i18n.prop('charging_price.summer_month'), "sortable": false, 'width': 80, "class": "text-center", "render": dataTableHelper.render.booleanRender},
				{"data": "fromWeekday", "title": $.i18n.prop('charging_price.weekday.from'), "sortable": true, 'width': 80},
				{"data": "toWeekday", "title": $.i18n.prop('charging_price.weekday.to'), "sortable": false, 'width': 80},
				{"data": "fromHour", "title": $.i18n.prop('charging_price.hour.from'), "sortable": true, 'width': 80},
				{"data": "toHour", "title": $.i18n.prop('charging_price.hour.to'), "sortable": false, 'width': 80},
				{"data": "price", "title": $.i18n.prop('charging_price.price'), "sortable": false, 'width': 80},
				{"data": "peakTimeType", "title": $.i18n.prop('charging_price.peaktime'), "sortable": false, 'width': 80, "render": dataTableHelper.render.codeRender},
				{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 100, "render": dataTableHelper.render.commonButtonRender}, 
				{"data": 'id', "visible": false} 
			],
			"serverSide": false 
			/*
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadParkingCardTable 
			*/
		});
	}));
	
	$('.nav-tabs a:first').tab('show');
	
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
				/* 
				communityId: {
					required: true
				}
				*/
				fromTime: {
					required: true, 
				}, 
				toTime: {
					required: true, 
				}, 
				summerFromTime: {
					required: true, 
				}, 
				summerToTime: {
					required: true, 
				}, 
			}
		});
		
		pricePeriodValidator = pricePeriodForm.validate({
			rules: {
				fromWeekday: {
					required: true, 
					min: 1, max: 7
				}, 
				toWeekday: {
					required: true, 
					min: 1, max: 7
				}, 
				fromHour: {
					required: true, 
					min: 0, max: 23
				}, 
				toHour: {
					required: true, 
					min: 0, max: 23
				}, 
				price: {
					required: true, 
					min: 0, max: 1000
				},
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
			saveUrl: URLS.CHARGING_PRICE.SAVE, 
			removeUrl: URLS.CHARGING_PRICE.DELETE, 
			beforePopulate: function(action) {
				var data = editForm.formData();
				if (action == CONSTANT.ACTION.ADD) {
					data.id = 0;
					data.fromTime = moment().format(APPLICATION.SETTING.defaultDateFormat);
					data.toTime = moment().add(1, 'years').subtract(1, 'days').format(APPLICATION.SETTING.defaultDateFormat);
				}
				else {
					data.fromTime = moment(data.fromTime).format(APPLICATION.SETTING.defaultDateFormat);
					data.toTime = moment(data.toTime).format(APPLICATION.SETTING.defaultDateFormat);
					data.summerFromTime = moment(data.summerFromTime).format(APPLICATION.SETTING.defaultDateFormat);
					data.summerToTime = moment(data.summerToTime).format(APPLICATION.SETTING.defaultDateFormat);
				}
				editForm.formData(data);
			}, 
			afterPopulate: function() {
				var data = editForm.formData();
				$('#organization_id').val(data.organizationId ? data.organizationId : "").trigger('change');
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				$('#cost_reference').iCheck(data.costReference ? 'check' : 'uncheck');

				$('#from_time').data('daterangepicker').setStartDate(data.fromTime);
				$('#to_time').data('daterangepicker').setStartDate(data.toTime);
				$('#summer_from_time').data('daterangepicker').setStartDate(data.summerFromTime);
				$('#summer_to_time').data('daterangepicker').setStartDate(data.summerToTime);

				pricePeriodTable.clear();
				if (data.items) pricePeriodTable.rows.add(data.items);
				pricePeriodTable.draw(false);
				
				if (pricePeriodTable.data().any()) {
					var tableRow = $('tbody tr:first', pricePeriodTableElement);
					if (tableRow) tableRow.trigger('click');
				}
			},  
			afterCopy: function() {
				var data = editForm.formData();
				data.id = 0;
				data.costReference = false;
				data.fromTime = moment(data.fromTime).add(1, 'years').format(APPLICATION.SETTING.defaultDateFormat);
				data.toTime = moment(data.toTime).add(1, 'years').format(APPLICATION.SETTING.defaultDateFormat);
				data.summerFromTime = moment(data.summerFromTime).add(1, 'years').format(APPLICATION.SETTING.defaultDateFormat);
				data.summerToTime = moment(data.summerToTime).add(1, 'years').format(APPLICATION.SETTING.defaultDateFormat);
				editForm.formData(data);
				$('#id', form).val('0');
				$('#cost_reference').iCheck('uncheck');
				$('#from_time', form).val(data.fromTime);
				$('#to_time', form).val(data.toTime);
				$('#summer_from_time', form).val(data.summerFromTime);
				$('#summer_to_time', form).val(data.summerToTime);
				
				swal.fire({
					title: copyTitle,
					icon: 'info', 
					input: "text",
					inputLabel: copyLabel,
					inputValue: 100,
					showCancelButton: false, 
					inputValidator: (value) => {
						if ((!value) || (isNaN(value)) || ((value < 0) || (value > 1000))) {
					    	return copyError;
						}
					}
				})
				.then(function(percent) {
					if (percent) {
						//console.log(percent);
						data.items.forEach((e) => {
							e.price = roundDecimal(e.price * (percent.value / 100), 3);
						});
						pricePeriodTable.clear();
						pricePeriodTable.rows.add(data.items);
						pricePeriodTable.draw();
						if (pricePeriodTable.data().any()) {
							var tableRow = $('tbody tr:first', pricePeriodTableElement);
							if (tableRow) tableRow.trigger('click');
						}
					}
				});
			},  
			beforeSave: function(saving) {
				var data = editForm.formData();
				
				if (editForm.mode == CONSTANT.ACTION.COPY) {
					saving.id = 0;
					if (data.items) saving.items = data.items;
					saving.items.forEach(e => {
						e.chargingPriceId = 0;
						e.id = 0;
					});
				}
				
				saving.fromTime = saving.fromTime + ' 00:00:00'; 
				saving.toTime = saving.toTime + ' 23:59:59';
				saving.summerFromTime = saving.summerFromTime + ' 00:00:00'; 
				saving.summerToTime = saving.summerToTime + ' 23:59:59';
				
				return saving;
			}
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);

		pricePeriodEditForm = pricePeriodForm.editForm({
			form: pricePeriodForm,
			parentForm: editForm, 
			table: pricePeriodTableElement,
			dataTable: pricePeriodTable,
			validator: pricePeriodValidator, 
			cardSwitcher: null, 
			saveUrl: URLS.CHARGING_PRICE.ITEM.SAVE, 
			removeUrl: URLS.CHARGING_PRICE.ITEM.DELETE, 
			afterPopulate: function(action) {
				var data = pricePeriodEditForm.formData();
				//summerFromTimeDatePicker.val(data.summerFromTime);
				$('#summer_month').iCheck(data.summerMonth ? 'check' : 'uncheck');
			},  
			beforeSave: function(saving) {
				if (!saving.chargingPriceId) saving.chargingPriceId = $('#id', form).val();
				return saving;
			}
		});
		pricePeriodEditForm.process(CONSTANT.ACTION.INQUIRY);

		$('#criteria_organization_id').on('change', function(e) {
			activeCriteriaOrganizationId = changeOrganization(criteriaForm.serializeObject(), $('#criteria_organization_id'), activeCriteriaOrganizationId, $('#criteria_community_id'), null);
		});

		$('#organization_id').on('change', function(e) {
			activeOrganizationId = changeOrganization(editForm.formData(), $('#organization_id'), activeOrganizationId, $('#community_id'), null);
		});
			
		$('button.inner_operation[value="D"]').on('click', function(e) {
			e.preventDefault();
			var row = pricePeriodTable.row($(this).closest('tr'));
			if (row) pricePeriodTable.row(tr).remove().draw();
		});
	
		$('#refresh').on('click', refresh);
		
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
		ajaxPost(URLS.CHARGING_PRICE.QUERY, data)
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

function refresh(e) {
	if (e) e.preventDefault();
	if (table) table.ajax.reload();
}
