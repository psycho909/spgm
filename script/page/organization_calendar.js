requirejs(['year-calendar']);
initialPage(function() {
	var organizationId = APPLICATION.data.activeOrganizationId;
	if (!organizationId) organizationId = APPLICATION.user.organizationId;
	if (organizationId) {
		$('#criteria_organization_id').val(organizationId).trigger('change');
		refresh();
	}
});

var DATE_COLORS = ['red', 'green'];

var now;
var nowTimer;
var language;

var years;
var year;
var calendar;
var dateTypes;

var criteriaForm;
var form; 
var editForm;

var validator;
var criteriaValidator;

//var dates;
var dataSource = [];
var calendarCountry;
var contextMenuItems = [];
var organizations;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'calendar-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('calendar');
			$('#title_section').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('terms.organization'));
			$('#criteria_year_label, #year_label').text($.i18n.prop('calendar.year'));
			$('#refresh').append($.i18n.prop('operation.refresh'));

			/*			
			$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			*/
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
	applyLayoutOption({'showQueryCriteriaCard': true, 'showQueryResultCard': true});

	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);

	form = $('#form');
	criteriaForm = $('#criteria_form');
	//var dashedLanguage = language.replace('_', '-');

	showOperationButtons($('.operation_container'), {
		'add': false,
		'copy': true,
		'update': true,
		'delete': false,
		'save': true,
		'cancel': true, 
		'calculate': false, 
		'backToList': false 
	});

	//$('#calendar_container table.month thead tr:nth-child(2) td').addClass('py-2');

	deferreds.push(
		$.when(createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), null))
		.done(function(json) {
			organizations = json;
		})
	);
	
	if (!language.startsWith('en')) {
		var calendarCountry = language.substring(language.length - 2).toLowerCase();
		deferreds.push($.getScript(getYearCalendarTranslation(calendarCountry)));
	}
	
	year = moment().get('year');
	years = [];
	for (var i = year - 5; i <= year + 5; i++) {
		years.push({'id': i, 'text': i});
	}
	buildSelect2($('#criteria_year'), years, false);
	buildSelect2($('#year'), years, false);
	$('#criteria_year').val(year).trigger('change');
	
	
	$.when.apply($, deferreds).then(function() {
		calendar = $('#calendar_container');
		calendar.addClass('disabled');
		calendar.calendar({
			allowOverlap: false, 
			startYear: $('#criteria_year').val(),
			language: calendarCountry,
			style: 'background',
			dataSource: dataSource,
			/*
			enableContextMenu: true,
			contextMenuItems: contextMenuItems,
			*/
			/*
			mouseOnDay: function(e) {
				if(e.events.length == 0) return;
			},
			mouseOutDay: function(e) {
			},
			customDayRenderer: function(element, date) {
				console.log(element); 
			},
			*/
			clickDay: function(event) {
				if (calendar.hasClass('disabled')) return;
				/*
				*/
				if (event.events.length) {
					event.events[0].dateType = (event.events[0].dateType == 1 ? 0 : 1);
					$(event.element[0]).css('background-color', DATE_COLORS[event.events[0].dateType]);
				}
			}
		});
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				year: {
					min: 2020, 
					max: 2050 
				}, 
			}
		});
		
		validator = form.validate({
			rules: {
				year: {
					min: 2020, 
					max: 2050 
				}, 
			}
		});
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true});
		
		editForm = form.editForm({
			form: form,
			table: null,
			dataTable: null,
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			alwaysShowOperation: true, 
			saveUrl: URLS.CALENDAR.SAVE_ORGANIZATION_YEAR, 
			beforePopulate: function(action) {
				if ((action == CONSTANT.ACTION.COPY) || (action == CONSTANT.ACTION.UPDATE)) {
					var data = editForm.formData();
					if ((!data.organizationId) && (APPLICATION.user.organizationId)) data.organizationId = APPLICATION.user.organizationId;
					if (!data.year) data.year = $('#criteria_year').val();
					editForm.formData(data);
				}
				/*
				else {
					var criteria = criteriaForm.serializeObject();
					ajaxPost(URLS.CALENDAR.ROOT_ORGANIZATION_YEAR, criteria, function(dates) {
					});
				}
				*/
			},
			afterPopulate: function(action) {
				if ((action == CONSTANT.ACTION.COPY) || (action == CONSTANT.ACTION.UPDATE)) {
					calendar.removeClass('disabled');
					//$('.day-content').removeClass('text-primary');
				}
				else {
					calendar.addClass('disabled');
					//$('.day-content').addClass('text-primary');
				}
			}, 
			afterCopy: function() {
				swal.fire({
					title: $.i18n.prop('operation.copy'),
					type: 'info',
					html: '<label class="control-label" id="copy_organization_id_label" for="copy_organization_id">{0}</label> '.format($.i18n.prop('terms.organization')) +
							'<select class="form-control select2" name="copyOrganizationId" id="copy_organization_id" style="width:100%;"></select>' + 
							'<label class="control-label mt-3" id="copy_year_label" for="copy_year">{0}</label>'.format($.i18n.prop('calendar.year')) +
							'<select class="form-control select2" name="copyYear" id="copy_year" style="width:100%;"></select>', 
					showCancelButton: false,
					onOpen: () => {
						buildSelect2($('#copy_year'), years, false);
						loadOrganizationSelect($('#copy_organization_id'), organizations);
						if ($('#criteria_organization_id').val() > 0) {
							$('#copy_organization_id').val($('#criteria_organization_id').val()).trigger('change');
						}
						else {
							$('#copy_organization_id').val(APPLICATION.user.organizationId).trigger('change');
						}
						$('#copy_year').val($('#criteria_year').val()).trigger('change');
					}
				})
				.then(function() {
					$('#organization_id').val($('#copy_organization_id').val()).trigger('change');
					$('#year').val($('#copy_year').val()).trigger('change');
				});
			},  
			beforeSave: function(saving) {
				var organizationId = saving.organizationId;
				saving = dataSource;
				if ((saving) && (saving.length > 0)) {
					for (var i = 0; i < saving.length; i++) {
						saving[i].id = (editForm.mode == CONSTANT.ACTION.COPY) ? 0 : saving[i].id, 
						saving[i].organizationId = organizationId;
						saving[i].theDate = moment(saving[i].startDate).format("YYYY-MM-DD HH:mm:ss");
						delete saving[i].startDate;
						delete saving[i].endDate;
						delete saving[i].color;
					}
				}
				return saving;
			}
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);

		$('#refresh').on('click', refresh);
		
		deferred.resolve();
	});

	return deferred.promise();
}

function loadDates(dates) {
	dataSource = [];
	if ((dates) && (dates.length > 0)) {
		var date;
		for (var i = 0; i < dates.length; i++) {
			date = moment(dates[i].theDate, APPLICATION.SETTING.defaultDateFormat).toDate();
			dataSource.push({
				id: dates[i].id,
				organizationId: dates[i].organizationId, 
				dateType: dates[i].dateType,
				theDate: date,
				color: DATE_COLORS[dates[i].dateType],
				startDate: date,
				endDate: date
			});
		}
	}
	calendar.data('calendar').setDataSource(dataSource);
	calendar.data('calendar').setYear($('#year').val());
}

function refresh(e) {
	if (e) e.preventDefault();
	var criteria = criteriaForm.serializeObject();

	var organizationId = criteria.organizationId;
	if ((organizationId) && (organizationId != APPLICATION.data.activeOrganizationId)) {
		APPLICATION.data.activeOrganizationId = organizationId;
		saveDataCookie();
	}
	
	var deferred = $.Deferred();
	dataSource = [];
	
	toast.fire({
		type: 'info', 
		timer: 3000, 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});
	
	ajaxPost(URLS.CALENDAR.LIST_ORGANIZATION_YEAR, criteria, function(dates) {
		if ((dates) && (dates.length)) {
			$('#organization_id').val(criteria.organizationId).trigger('change');
			$('#year').val(criteria.year).trigger('change');
			$('#id').val('1');
			if (toast) toast.close();
		}
		else {
			$('#organization_id').val('').trigger('change');
			$('#year').val('').trigger('change');
			$('#id').val('0');
			if (toast) {
				toast.fire({
					type: 'info', 
					timer: 3000, 
					title: $.i18n.prop('operation.empty.result') 
				});
			}
		}
		
		editForm.formData({
			id: $('#id').val(),
			organizationId: criteria.organizationId,
			year: criteria.year,
			dataSource: dataSource
		});
		
		loadDates(dates);
		editForm.process(CONSTANT.ACTION.INQUIRY);
		deferred.resolve();
	});

	return deferred.promise();
}
