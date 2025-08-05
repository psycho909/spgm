requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'datatables-helper', 'daterangepicker', 'form-control', 'jquery-serialize', 'editForm', 'jquery-serialize', 'jquery-validate-messages'], function(moment, swal) {
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

var language;

var table;
var tableElement;

var fromDate;
var toDate;
var datesPicker;

var editForm;
var form;
var validator;
var criteriaForm;
var criteriaValidator;

var activeCriteriaCommunityId;
var activeParkingGarageId;
var activeCriteriaGarageId;
var activeCriteriaCustomerId;

var activeCommunityId;
var activeCriteriaParkingGarageId;
var activeCustomerId;
var activeGarageId;


function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', 'user-message', 'parking_garage-message', 'garage-message', 'parking_card-message', 'recharge-message', 'transmitter-message', 'device-message', 'user-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('recharge');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_charge').text($.i18n.prop('breadcrumb.charge'));
			$('#breadcrumb_recharge').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			//$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('community'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			$('#criteria_parking_card_id_label, #parking_card_id_label').text($.i18n.prop('parking_card'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#criteria_no_label, #no_label').text($.i18n.prop('recharge.recharge_no'));
			
			$('#dates_label').text($.i18n.prop('recharge.period'));

			$('#no, #recharge_time, #recharge_user_name').prop('placeholder', $.i18n.prop('hint.auto_number'));
			//$('#account_type_id_label').text($.i18n.prop('recharge.account_type'));
			$('#recharge_time_label').text($.i18n.prop('recharge.recharge_time'));
			$('#amount_label').text($.i18n.prop('recharge.amount'));
			$('#note_label').text($.i18n.prop('recharge.note'));
			//$('#user_id_label').text($.i18n.prop('user'));
			$('#recharge_user_id_label').text($.i18n.prop('recharge.recharge_user'));

			$('#recharge_status_label').text($.i18n.prop('recharge.recharge_status'));

			$('#search').append($.i18n.prop('operation.refresh'));

			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));

			$('button.operation[value="P"]').append($.i18n.prop('operation.print'));

			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";

	var deferred = $.Deferred();
	var deferreds = [];
	
	setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);

	form = $('#recharge_form');
	criteriaForm = $('#criteria_form');

	if (APPLICATION.systemConfig.rechargeMachineEnabled) {
		$('.recharge_machine_enabled ').removeClass('d-none');
	}

	moment.locale(language);
	fromDate = moment().subtract(1, 'months').add(1, 'days');
	toDate = moment();
	datesPicker = createDateRangePicker($('#dates'), $('#dates_range_button'), null, null, fromDate, toDate, false, false, true);

	deferreds.push(
		createCommunitySelect($('#criteria_community_id, #community_id'), true), 
		//createCodeRadio('#account_type_container', 'accountTypeId', URLS.CODE.LIST.ACCOUNT_TYPE, 'id'), 
		createCodeRadio('#recharge_status_container', 'rechargeStatusId', URLS.CODE.LIST.RECHARGE_STATUS, 'id')
	);
	
	buildSelect2($('#criteria_parking_garage_id, #criteria_customer_id, #criteria_garage_id, #criteria_parking_card_id'), null, true, false);
	buildSelect2($('#parking_garage_id, #customer_id, #garage_id'), null, false, false);
	buildSelect2($('#parking_card_id, #user_id, #recharge_user_id'), null, true, false);
	
	tableElement = $('#table');

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		//
		table = tableElement.DataTable({
			"data": null, 
			"language": getDataTablesLanguage(),
			"paging": true,
			'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": true,
			"searching": false,
			"ordering": true,
			"order": [[0, "asc"]],
			"orderClasses": false, 
			"info": true,
			"autoWidth": false,
			"columns": [
				{"data": "no", "sortable": true, "title": $.i18n.prop('recharge.recharge_no'), "width": 80, "className": "min-mobile-p"},
				{"data": "rechargeTime", "sortable": true, "title": $.i18n.prop('recharge.recharge_time'),"render": dataTableHelper.render.dateTimeRender, "width": 60, "className": "min-mobile-p"},
				{"data": 'amount', "sortable": false, "title": $.i18n.prop('recharge.amount'), "width": 40, "className": "max-tablet-p", "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": 'userName', "visible": APPLICATION.systemConfig.rechargeMachineEnabled, "sortable": false, "title": $.i18n.prop('user'), "width": 40, "className": "max-tablet-p"},
				{"data": 'rechargeUserName', "sortable": false, "title": $.i18n.prop('recharge.recharge_user'), "width": 40, "className": "max-tablet-p", "class": "numeric", "render": dataTableHelper.render.numberRender},
				{"data": 'communityName', "sortable": false, "title": $.i18n.prop('community'), "width": 60, "className": "max-tablet-p"},
				{"data": 'parkingGarageName', "sortable": false, "title": $.i18n.prop('parking_garage'), "width": 60, "className": "max-tablet-p"}, 
				{"data": 'customerName', "sortable": false, "title": $.i18n.prop('customer'), "width": 60, "className": "max-tablet-p"},
				{"data": 'garageNo', "visible": APPLICATION.systemConfig.rechargeMachineEnabled, "sortable": false, "title": $.i18n.prop('garage'), "width": 60, "className": "max-tablet-p"},
				{"data": 'parkingCardNo', "visible": APPLICATION.systemConfig.rechargeMachineEnabled, "sortable": false, "title": $.i18n.prop('parking_card.no'), "width": 60, "className": "max-tablet-p"},
				{"data": 'transmitterNo', "visible": APPLICATION.systemConfig.rechargeMachineEnabled, "sortable": false, "title": $.i18n.prop('transmitter'), "width": 60, "className": "max-tablet-p"}, 
				{"data": 'deviceNo', "visible": APPLICATION.systemConfig.rechargeMachineEnabled, "sortable": false, "title": $.i18n.prop('device'), "width": 60, "className": "max-tablet-p"}, 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
		});
	}));
	
	$.when.apply($, deferreds).then(function() {
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {
					requiredid: true
				},
				dates: {
					required: true
				},
			}
		});
		
		validator = form.validate({
			rules: {
				amount: {
					min: 0, max: 99999
				},
				communityId: {
					requiredid: true
				},
				parkingGarageId: {
					requiredid: true
				},
				/*
				garageId: {
					requiredid: true
				},
				*/
			}
		});
		
		editForm = form.editForm({
			form: form,
			table: tableElement,
			dataTable: table,
			validator: validator, 
			saveUrl: URLS.RECHARGE.SAVE,
			removeUrl: URLS.RECHARGE.DELETE, 
			loadData: function(action) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						id: 0, 
						//accountTypeId: APPLICATION.systemConfig.rechargeMachineEnabled ? APPLICATION.codeHelper.accountTypeGarage.id : APPLICATION.codeHelper.accountTypeCustomer.id, 
						communityId: APPLICATION.data.activeCommunityId, 
						//rechargeUserId: APPLICATION.user.id, 
						rechargeUserName: APPLICATION.user.name, 
						rechargeStatusId: APPLICATION.codeHelper.rechargeStatusNormal.id 
					});
				}
			},
			/* 
			beforePopulate: function(action) {
				if (action == CONSTANT.ACTION.ADD) {
				}
			},
			*/ 
			beforeSave: function(saving) {
				saving.rechargeUserId = APPLICATION.user.id;
				return saving;
			}, 
			afterPopulate: function() {
				var data = editForm.formData();
				//$('#account_type_id').val(data.chargeTypeId ? data.chargeTypeId : "").iCheck('update');
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				$('#parking_garage_id').val(data.parkingGarageId ? data.parkingGarageId : "").trigger('change');
				$('#customer_id').val(data.customerId ? data.customerId : "").trigger('change');
				$('#garage_id').val(data.garageId ? data.garageId : "").trigger('change');
				$('#parking_card_id').val(data.parkingCardId ? data.parkingCardId : "").trigger('change');
				$('#user_id').val(data.userId ? data.userId : "").trigger('change');
				$('#recharge_user_id').val(data.rechargeUserId ? data.rechargeUserId : "").trigger('change');
				$('input[name="accountTypeId"][value="{0}"]'.format(data.accountTypeId)).iCheck('check').iCheck('update');
				$('input[name="rechargeStatusId"][value="{0}"]'.format(data.rechargeStatusId)).iCheck('check').iCheck('update');
			},
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);

		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
		});
		
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, $('#criteria_garage_id'));
		});

		$('#criteria_customer_id').on('change', function(e) {
			activeCriteriaCustomerId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaCustomerId, $('#criteria_garage_id'), null);
		});
		
		$('#criteria_garage_id').on('change', function(e) {
			activeGarageId = changeGarage(criteriaForm.serializeObject(), $(this), activeCriteriaGarageId, $('#criteria_parking_card_id'));
		});
		
		$('#community_id').on('change', function(e) {
			//activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), $('#customer_id'), null);
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), null, null);
		});

		$('#parking_garage_id').on('change', function(e) {
			activeParkingGarageId = changeParkingGarage(editForm.formData(), $(this), activeParkingGarageId, $('#garage_id'), $('#customer_id'));
		});

		$('#customer_id').on('change', function(e) {
			activeCustomerId = changeCustomer(editForm.formData(), $(this), activeCustomerId, $('#garage_id'), $('#user_id'));
		});
		
		$('#garage_id').on('change', function(e) {
			activeGarageId = changeGarage(editForm.formData(), $(this), activeGarageId, $('#parking_card_id'));
		});
			
		$('#search').on('click', refresh);
		
		deferred.resolve();
	});
	
	return deferred.promise();
}

function loadTable(data, callback, settings) {
	data.parameters = criteriaForm.serializeObject();
	data.parameters.fromTime = datesPicker.data('daterangepicker').startDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	data.parameters.toTime = datesPicker.data('daterangepicker').endDate.format(APPLICATION.SETTING.defaultDateTimeFormat);
	delete data.parameters.dates;

	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
	});
	
	ajaxPost(URLS.RECHARGE.QUERY, data)
	.done(function(json) {
		if ((json) && (json.data) && (json.data.length)) {
			callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
			toast.close();
			if (table.data().any()) $('tbody tr:first', tableElement).trigger('click');
		}
		else {
			toast.fire({
				type: 'warning', 
				title: $.i18n.prop('operation.empty.result'),
				timer: 5 * 1000
			});
			callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
		}
	});
}

function refresh(e) {
	if (e) e.preventDefault();
	if (!criteriaForm.valid()) return false;
	
	var communityId = $('#criteria_community_id').val();
	if ((communityId) && (communityId != APPLICATION.data.activeCommunityId)) {
		APPLICATION.data.activeCommunityId = communityId;
		saveDataCookie();
	}
	if (table) table.ajax.reload();
}
