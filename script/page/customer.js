initialPage(function() {
	/*
	try {
		requirejs(['address-picker']);
	}
	catch (e) {
		console.log(e);
	}
	*/
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
}, null, ['address-picker']);

var now;
var nowTimer;
var language;

var form;
var editForm;

var table;
var tableElement;
var parkingCardTable;
var parkingCardTableElement;

var criteriaForm;
var validator;
var criteriaValidator;

var noFloorRooms;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', 'parking_garage-message', 'parking_card-message', 'address-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('customer');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_basic_information').text($.i18n.prop('breadcrumb.basic_information'));
			$('#breadcrumb_customer').text(APPLICATION.documentTitle);
			*/

			$('#tab1').append($.i18n.prop('customer'));
			$('#tab2').append($.i18n.prop('parking_card'));
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			//$('#criteria_organization_id_label').text($.i18n.prop('organization'));
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_no_label, #no_label').text($.i18n.prop('customer.no'));
			$('#criteria_name_label, #name_label').text($.i18n.prop('customer.name'));
			$('#search').append($.i18n.prop('operation.query'));
			
			$('#form_title').text($.i18n.prop('operation.input'));
			
			$('#criteria_address_label, #address_label').text($.i18n.prop('customer.address'));
			$('#criteria_address_floor_label, #address_floor_label').text($.i18n.prop('address.floor'));
			$('#criteria_address_no_label, #address_no_label').text($.i18n.prop('address.no'));
			$('#criteria_address_room_label, #address_room_label').text($.i18n.prop('address.room'));
			
			$('#email_label').text($.i18n.prop('customer.email'));
			$('#note_label').text($.i18n.prop('customer.note'));
			$('#phone_no_label').text($.i18n.prop('customer.phone'));
			$('#mobile_phone_no_label').text($.i18n.prop('customer.mobile_phone'));
			//$('#web_enable_label').text($.i18n.prop('customer.web.enable'));
			$('#status_label').text($.i18n.prop('status'));

			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));
			
			$('#customer_table_title').text($.i18n.prop('terms.list'));

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
	
	var dashedLanguage = language.replace('_', '-');

	form = $('#form');
	criteriaForm = $('#criteria_form');
	
	showOperationButtons($('.operation_container'));

	deferreds.push(createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	
	deferreds.push(
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id, #community_id'), data, true);
		}), 
		ajaxGet(URLS.CUSTOMER.LIST_ADDRESS_BY_COMMUNITY + APPLICATION.data.selectedCommunityId, null)
		.done(function(json) {
			noFloorRooms = json;
			/*
			var nos = [];
			//noFloorRooms.forEach((e) => {if (nos.indexOf(e.addressNo) < 0) nos.push({id: e.addressNo, text: e.addressNo});});
			noFloorRooms.forEach((e) => {if (nos.indexOf(e.addressNo) < 0) nos.push(e.addressNo)});
			buildSelect2($('#criteria_address_no'), nos, false, false, true);
			
			buildSelect2($('#criteria_address_floor'), null, false, false, false);
			buildSelect2($('#criteria_address_room'), null, false, false, false);
			
			$('#criteria_address_no').on('change', null, function(e) {
				var no = $(this).val();
				if (!no) {
					$('#criteria_address_floor').select2({'data': null});
					$('#criteria_address_room').select2({'data': null});
					$('#criteria_address_floor').val('');
					$('#criteria_address_room').val('');
					$('#criteria_id').val('');
				}
				else {
					var addresses = noFloorRooms.filter((e) => e.addressNo === no);
					var floors = [];
					addresses.forEach((e) => {if (floors.indexOf(e.addressFloor) < 0) floors.push(e.addressFloor)});
					$('#criteria_address_floor').select2({'data': floors, 'allowClear': false});
					//if (floors.length == 1) $('#criteria_address_floor').val(floors[0]).trigger('change');
					$('#criteria_address_floor').select2('open');
				}
			});
			
			$('#criteria_address_floor').on('change', null, function(e) {
				var no = $('#criteria_address_no').val();
				var floor = $(this).val();
				if (floor) {
					var rooms = [];
					var addresses = noFloorRooms.filter((e) => e.addressNo === no && e.addressFloor === floor);
					addresses.forEach((e) => {if (rooms.indexOf(e.addressRoom) < 0) rooms.push(e.addressRoom);});
					$('#criteria_address_room').select2({'data': rooms, 'allowClear': false});
					//if (rooms.length == 1) $('#criteria_address_room').val(rooms[0]).trigger('change');
					$('#criteria_address_room').select2('open');
				}
			});
			
			$('#criteria_address_room').on('change', null, function(e) {
				var no = $('#criteria_address_no').val();
				var floor = $('#criteria_address_floor').val();
				var room = $(this).val();
				var customer = noFloorRooms.find((e) => e.addressNo === no && e.addressFloor === floor && e.addressRoom === room);
				if (customer) {
					$('#criteria_no').prop('value', customer.no);
					$('#criteria_id').prop('value', customer.id);
				}
			});
			
			$('#criteria_no').on('change', null, function(e) {
				if ($('#criteria_id').val()) $('#criteria_id').val('');
			});
			
			//if (nos.length == 1) $('#criteria_address_no').val(nos[0]).trigger('change');
			*/
		})
	);

	tableElement = $('#table');
	parkingCardTableElement = $('#parking_card_table');
	var height = configTableHeight(tableElement, false, true);
	deferreds.push($.getScript(getDataTableTranslation(language), function() {

		table = tableElement.DataTable(
			getDataTableOptions({
				"columns": [
					{"data": 'no', "title": $.i18n.prop('customer.no'), "sortable": true, 'width': 80},
					{"data": 'addressNo', "title": $.i18n.prop('address.no'), "sortable": false, 'width': 60},
					{"data": 'addressFloor', "title": $.i18n.prop('address.floor'), "sortable": false, 'width': 60},
					{"data": 'addressRoom', "title": $.i18n.prop('address.room'), "sortable": false, 'width': 60},
					{"data": "name", "title": $.i18n.prop('customer.name'), "sortable": true, 'width': 100},
					{"data": 'phoneNo', "title": $.i18n.prop('customer.phone'), "sortable": false, 'width': 150},
					{"data": 'mobilePhoneNo', "title": $.i18n.prop('customer.mobile_phone'), "sortable": false, 'width': 150},
					{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 100, "render": dataTableHelper.render.commonButtonRender}, 
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			}
		));

		/*
		parkingCardTable = parkingCardTableElement.DataTable({
			"data": null,
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
			"autoWidth": false,
			"columns": [
				{"data": "no", "title": $.i18n.prop('parking_card.no'), "sortable": true, 'width': 100},
				{"data": "garage.parkingGarage.community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": "garage.parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": "garage", "title": $.i18n.prop('terms.garage'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadParkingCardTable, 
		});
		*/

	}));

	$('.nav-tabs a:first').tab('show');
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
	
	$.when.apply($, deferreds).then(function() {

		criteriaForm.addressPicker({'data': noFloorRooms});
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {
					requiredid: true
				},
			}
		});
		
		validator = form.validate({
			onkeyup: function (element) {
				return element.id != 'no';
			},			
			rules: {
				communityId: {
					requiredid: true
				},
				no: {
					required: true, 
					minlength: 2, 
					maxlength: 10, 
					remote: {
						url: URLS.CUSTOMER.CHECK_NO,
						type: "post",
						data: {
							no: function() {return $("#no").val();}, 
							id: function() {return $("#id").val();}
						}
					}
				},
				name: {
					required: true,
					minlength: 2, 
					maxlength: 50
				},
				address: {
					required: false,
					maxlength: 100
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

		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = form.editForm({
			form: form,
			table: $('#table'),
			dataTable: table,
			validator: validator,
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.CUSTOMER.SAVE,
			removeUrl: URLS.CUSTOMER.DELETE, 
			loadData: function(action, activeRow) {
				if (action == CONSTANT.ACTION.ADD) {
					var organizationId = $('#criteria_organization_id').val() ? $('#criteria_organization_id').val() : APPLICATION.data.activeOrganizationId;
					editForm.formData({
						'id': 0,
						'locale': APPLICATION.SETTING.defaultLocale,
						'organizationId': organizationId, 
						'status': 1
					});
				}
			},
			afterPopulate: function() {
				/*
				parkingCardTable.clear();
				if (parkingCardTable) parkingCardTable.ajax.reload();
				*/
				var data = editForm.formData();
				var communityId;
				if ((data.community) && (data.community.id)) communityId = data.community.id;
				else communityId = '';
				$('#community_id').val(communityId).trigger('change');
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
	
	data.parameters = $('#criteria_form').serializeObject();
	if (data.parameters.id) {
		data.parameters = {'id': data.parameters.id};
	}
	
	deferreds.push(
		ajaxPost(URLS.CUSTOMER.QUERY, data)
		.done(function(json) {
			if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
			else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
		})
	);
	
	$.when.apply($, deferreds).then(function() {
		toast.close();
	});
	
}

function loadParkingCardTable(data, callback, settings) {
	var deferreds = [];
	data.parameters = {
		"customerId": $('#id').val()
	};
	ajaxPost(URLS.PARKING_CARD.QUERY, data)
	.done(function(json) {
		if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
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
	}
	saveDataCookie();
	
	if (table) table.ajax.reload(function() {
		if (table.data().any()) {
			$('#table tbody tr:first').trigger('click');
		}
	}, false);
}
