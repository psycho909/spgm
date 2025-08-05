initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
}, null, ['address-picker']);

var editForm;
var language;
var form;
var validator;
var table;
var tableElement;
var parkingCardTable;
var parkingCardTableElement;

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCriteriaCustomerId;
var activeCommunityId;
var activeParkingGarageId;
var activeCustomerId;


var criteriaForm;
var criteriaValidator;

var noFloorRooms;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', 'parking_garage-message', 'garage-message', 'parking_card-message', 'user-message', 'address-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('parking_card');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_basic_information').text($.i18n.prop('breadcrumb.basic_information'));
			$('#breadcrumb_configuration_parking_card').text(APPLICATION.documentTitle);
			*/
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			//$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('community'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#criteria_no_label, #no_label').text($.i18n.prop('parking_card.no'));

			$('#criteria_address_label, #address_label').text($.i18n.prop('customer.address'));
			$('#criteria_address_floor_label, #address_floor_label').text($.i18n.prop('address.floor'));
			$('#criteria_address_no_label, #address_no_label').text($.i18n.prop('address.no'));
			$('#criteria_address_room_label, #address_room_label').text($.i18n.prop('address.room'));
			$('#criteria_customer_no_label, #customer_no_label').text($.i18n.prop('customer.no'));
			
			$('#name_label').text($.i18n.prop('parking_card.name'));
			$('#user_id_label').text($.i18n.prop('user'));
			$('#remote_controller_no_label').text($.i18n.prop('parking_card.remote_controller_no'));
			$('#magnetic_buckle_no_label').text($.i18n.prop('parking_card.magnetic_buckle_no'));
			$('#note_label').text($.i18n.prop('parking_card.note'));

			$('#status_label').text($.i18n.prop('parking_card.status'));
			/*
			$('#status1_label').append($.i18n.prop('status.active'));
			$('#status2_label').append($.i18n.prop('status.inactive'));
			*/
			
			$('#refresh').append($.i18n.prop('operation.refresh'));

			$('button.inner_operation[value="Y"]').append($.i18n.prop('transmitter.config.operation.select'));
			
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

	var nowTimer = setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);

	// Date
	moment.locale(language);
	
	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));

	deferreds.push(
		createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'), 
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id, #community_id'), data, true);
		}), 
		ajaxGet(URLS.CUSTOMER.LIST_ADDRESS_BY_COMMUNITY + APPLICATION.data.selectedCommunityId, null)
		.done(function(json) {
			noFloorRooms = json;
		})
	);

	buildSelect2($('#criteria_parking_garage_id, #parking_garage_id'), null, false);
	//buildSelect2($('#criteria_customer_id, #customer_id'), null, false);
	buildSelect2($('#criteria_garage_id'), null, false);
	buildSelect2($('#garage_id'), null, false);
	buildSelect2($('#user_id'), null, false);
	
	tableElement = $('#table');

	//var height = configTableHeight(tableElement, true, false);

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable(
			getDataTableOptions({
				"columns": [
					{"data": "no", "title": $.i18n.prop('parking_card.no'), "sortable": true, 'width': 60},
					/*
					{"data": "communityName", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": "parkingGarageName", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": "customerName", "title": $.i18n.prop('customer'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					*/ 
					{"data": "communityName", "title": $.i18n.prop('community'), "sortable": false, 'width': 100},
					{"data": "parkingGarageName", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 100},
					//{"data": "customerName", "title": $.i18n.prop('customer'), "sortable": false, 'width': 100}, 
					{"data": "garage", "title": $.i18n.prop('garage'), "sortable": false, 'width': 80, "render": dataTableHelper.render.noRender},
					{"data": "garage.customer", "title": $.i18n.prop('customer.no'), "sortable": false, 'width': 80, "render": dataTableHelper.render.noRender},
					{"data": "garage", "title": $.i18n.prop('customer.address'), "sortable": false, 'width': 100, "render": dataTableHelper.render.addressRender},
					{"data": "userName", "title": $.i18n.prop('user'), "sortable": true, 'width': 80},
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
	}));
	//
	$.when.apply($, deferreds).then(function() {
		
		$('.address_picker_container', criteriaForm).addressPicker({'data': noFloorRooms});
		$('.address_picker_container', form).addressPicker({data: noFloorRooms, autoOpen: false});
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {requiredid: true}, 
				//addressNo: {required: true}, 
				//addressFloor: {required: true}, 
				//addressRoom: {required: true} 
			}
		});

		validator = form.validate({
			onkeyup: function (element) {
				return element.id != 'no';
			},			
			rules: {
				no: {
					required: true, 
					minlength: 2, 
					maxlength: 10, 
					remote: {
						url: URLS.PARKING_CARD.CHECK_NO,
						type: "post",
						data: {
							no: function() {return $("#no").val();}, 
							id: function() {return $("#id").val();}
						}
					}
				},
				communityId: {
					requiredid: true
				},
				parkingGarageId: {
					requiredid: true
				},
				addressNo: {required: true}, 
			},
			messages: {
				no: {
					remote: $.i18n.prop('validation.duplicate')
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
			saveUrl: URLS.PARKING_CARD.SAVE, 
			removeUrl: URLS.PARKING_CARD.DELETE, 
			afterPopulate: function() {
				var data = editForm.formData();
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				$('#parking_garage_id').val(data.parkingGarageId ? data.parkingGarageId : "").trigger('change');
				$('#customer_id').val(data.customerId ? data.customerId : "").trigger('change');
				$('#garage_id').val(data.garageId ? data.garageId : "").trigger('change');
				//$('input[name="status"]').iCheck('update');
				$('#user_id').val(data.userId ? data.userId : "").trigger('change');
				
				if ((data.garage) && (data.garage.customer)) {
					$(':input[name="addressNo"]', form).val(data.garage.customer.addressNo).trigger('change');
					$(':input[name="addressFloor"]', form).val(data.garage.customer.addressFloor).trigger('change');
					$(':input[name="addressRoom"]', form).val(data.garage.customer.addressRoom).trigger('change');
					$(':input[name="customerNo"]', form).val(data.garage.customer.no).trigger('change');
				}
				else {
					$(':input[name="addressNo"], :input[name="addressFloor"], :input[name="addressRoom"]', form).val('').trigger('change');
				}
			}
		});
		
		editForm.process(CONSTANT.ACTION.INQUIRY);

		$('#criteria_community_id').on('change', function(e) {
			//activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), null, null);
		});
		
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, $('#criteria_garage_id'));
		});

		$('#criteria_customer_id').on('change', function(e) {
			activeCriteriaCustomerId = changeCustomer(criteriaForm.serializeObject(), $(this), activeCriteriaCustomerId, $('#criteria_garage_id'));
		});

		$('#community_id').on('change', function(e) {
			//activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), $('#customer_id'), null);
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), null, null);
		});

		$('#parking_garage_id').on('change', function(e) {
			//activeParkingGarageId = changeParkingGarage(editForm.formData(), $(this), activeParkingGarageId, null, $('#customer_id'));
			activeParkingGarageId = changeParkingGarage(editForm.formData(), $(this), activeParkingGarageId, null, null);
		});

		$('#customer_id').on('change', function(e) {
			activeCustomerId = changeCustomer(editForm.formData(), $(this), activeCustomerId, $('#garage_id'), $('#user_id'), null, null);
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
		ajaxPost(URLS.PARKING_CARD.QUERY, data)
		.done(function(json) {
			if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
			else callback({'data': null, 'recordsTotal': 0, 'recordsFiltered': 0});

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
	
	var communityId = $('#criteria_community_id').val();
	if ((communityId) && (communityId != APPLICATION.data.activeCommunityId)) {
		APPLICATION.data.activeCommunityId = communityId;
	}
	saveDataCookie();
	
	if (table) table.ajax.reload();
}
