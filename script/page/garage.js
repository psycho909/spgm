initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
}, null, ['address-picker']);

var editForm;
var language;

var table;
var tableElement;

var parkingCardTable;
var garageUserTable;

var parkingCards;
var users;

var communities;
var parkingGarages;
var parkingGarageTypes;
var parkingGarageCategories;

var form;
var validator;
var criteriaForm;
var criteriaValidator;

var activeCriteriaCommunityId;
var activeCriteriaParkingGarageId;
var activeCommunityId;
var activeParkingGarageId;

var activeGarageId;

var customerUsers;
var parkingCards;

var parkingCardRowTemplate;
var garageUserRowTemplate;

var noFloorRooms;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', 'address-message', 'city-message', 'district-message', 'parking_garage-message', 'garage-message', 'parking_card-message', 'user-message', 'address-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('garage');
			$('#title_section').text(APPLICATION.documentTitle);
			/*
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_basic_information').text($.i18n.prop('breadcrumb.basic_information'));
			$('#breadcrumb_configuration_garage').text(APPLICATION.documentTitle);
			*/
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('organization'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			//$('#criteria_building_id_label, #building_id_label').text($.i18n.prop('building'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			//$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#criteria_customer_no_label, #customer_no_label').text($.i18n.prop('customer.no'));

			$('#no_label').text($.i18n.prop('garage.no'));
			$('#plate_identity_label').text($.i18n.prop('garage.garage_plate_no'));
			$('#name_label').text($.i18n.prop('garage.name'));
			$('#floor_label').text($.i18n.prop('garage.floor'));
			$('#area_label').text($.i18n.prop('garage.area'));
			$('#note_label').text($.i18n.prop('garage.note'));
			$('#ownership_id_label').text($.i18n.prop('garage.ownership'));
			$('#status_label').text($.i18n.prop('garage.status'));
			$('#enable_charging_label').text($.i18n.prop('garage.enable_charging'));
			$('#enable_charging_time_label').text($.i18n.prop('garage.enable_charging_time'));
			$('#qrcode_label').text($.i18n.prop('garage.qrcode'));

			$('#criteria_address_label, #address_label').text($.i18n.prop('customer.address'));
			$('#criteria_address_floor_label, #address_floor_label').text($.i18n.prop('address.floor'));
			$('#criteria_address_no_label, #address_no_label').text($.i18n.prop('address.no'));
			$('#criteria_address_room_label, #address_room_label').text($.i18n.prop('address.room'));
			
			$('#refresh').append($.i18n.prop('operation.refresh'));
			
			$('#tab1').append($.i18n.prop('garage'));
			$('#tab2').append($.i18n.prop('parking_card'));
			//$('#tab_parking_card_user').append($.i18n.prop('parking_card') + '/' + $.i18n.prop('user'));
			$('#tab3').append($.i18n.prop('terms.user'));
			
			$('.parking_card_user_id_label').text($.i18n.prop('terms.user'));
			$('.garage_user_label').text($.i18n.prop('terms.user'));
			
			$('button.parking_card_operation[value="S"]').append($.i18n.prop('operation.save'));
			$('button.parking_card_operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.garage_user_operation[value="S"]').append($.i18n.prop('operation.save'));
			$('button.garage_user_operation[value="C"]').append($.i18n.prop('operation.cancel'));

			
			//$('#tab4').append($.i18n.prop('garage.qrcode'));

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
	
	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));

	garageUserRowTemplate = $('#garage_user_row_template');
	parkingCardRowTemplate = $('#parking_card_row_template');
			
	if (APPLICATION.systemConfig.machineGarageEnabled) $('.machine_garage').removeClass('d-none');
	
	$('input[type="checkbox"].icheck').iCheck({
		checkboxClass: 'icheckbox_square-blue' 
	});

	// Date
	moment.locale(language);

	deferreds.push(
		createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'), 
		createCodeRadio($('#ownership_id_container'), 'ownershipId', URLS.CODE.LIST.GARAGE_ONWERSHIP)
	);

	deferreds.push(
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null, function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id'), data, true);
			buildSelect2($('#community_id'), data, true);
		}),
		ajaxGet(URLS.CUSTOMER.LIST_ADDRESS_BY_COMMUNITY + APPLICATION.data.selectedCommunityId, null)
		.done(function(json) {
			noFloorRooms = json;
		})
	);
	
	//buildSelect2($('#criteria_parking_garage_id, #criteria_customer_id'), null, true);
	//buildSelect2($('#community_id, #parking_garage_id, #customer_id'), null, false);
	buildSelect2($('#criteria_parking_garage_id'), null, true);
	buildSelect2($('#community_id, #parking_garage_id'), null, false);
	
	createDatePicker($('#enable_charging_time'), moment().format(APPLICATION.SETTING.defaultDateTimeFormat), true, true);
	
	$('.nav-tabs a:first').tab('show');

	tableElement = $('#table');
	//parkingCardTableElement = $('#parking_card_table');
	//userTableElement = $('#user_table');
	
	parkingCardTable = $('#parking_card_table');
	garageUserTable = $('#garage_user_table');

	//var height = configTableHeight(tableElement, true, false);

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		//
		table = tableElement.DataTable(
			getDataTableOptions({
				"columns": [
					{"data": "no", "title": $.i18n.prop('garage.no'), "sortable": true, 'width': 80},
					//{"data": "name", "title": $.i18n.prop('garage.name'), "sortable": true, 'width': 80},
					//{"data": "parkingGarage.community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					//{"data": "parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": "customer", "title": $.i18n.prop('customer.no'), "sortable": false, 'width': 80, "render": dataTableHelper.render.noRender},
					{"data": "customer", "title": $.i18n.prop('customer.address'), "sortable": false, 'width': 100, "render": dataTableHelper.render.addressRender},
					//{"data": "plateIdentity", "title": $.i18n.prop('garage.plate_identity'), "sortable": false, 'width': 60},
					{"data": "ownership", "title": $.i18n.prop('garage.ownership'), "sortable": false, 'width': 60, "render": dataTableHelper.render.codeRender},
					{"data": "enableChargingTime", "title": $.i18n.prop('garage.enable_charging_time'), "sortable": false, 'width': 100, "render": dataTableHelper.render.dateTimeRender},
					{"data": "status", "title": $.i18n.prop('status'), "sortable": false, 'width': 100, "render": dataTableHelper.render.statusRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadTable
			})
		);

		/*
		parkingCardTable = parkingCardTableElement.DataTable(
			getDataTableOptions({
				"columns": [
					//{"data": null, "title": "", "sortable": false, 'width': 30, "render": buttonRender},
					{"data": "no", "title": $.i18n.prop('parking_card.no'), "sortable": true, 'width': 60},
					{"data": "remoteControllerNo", "title": $.i18n.prop('parking_card.remote_controller_no'), "sortable": false, 'width': 60},
					{"data": "magneticBuckleNo", "title": $.i18n.prop('parking_card.magnetic_buckle_no'), "sortable": false, 'width': 60},
					{"data": "status", "title": $.i18n.prop('parking_card.status'), "sortable": false, 'width': 60, render: dataTableHelper.render.statusRender}, 
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": true,
				"ajax": loadParkingCardTable  
			})
		);
		
		userTable = userTableElement.DataTable(
			getDataTableOptions({
				"columns": [
					{"data": 'loginId', "title": $.i18n.prop('user.login.id'), "sortable": true, 'width': 80},
					{"data": "name", "title": $.i18n.prop('user.name'), "sortable": true, 'width': 80},
					{"data": 'email', "title": $.i18n.prop('user.email'), "sortable": true, 'width': 150},
					//{"data": 'organization', "title": $.i18n.prop('terms.organization'), "sortable": false, 'width': 100, "render": dataTableHelper.render.shortNameRender},
					{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"serverSide": false
			})
		);
		*/
		
	}));
	//
	$.when.apply($, deferreds).then(function() {
		
		$('.address_picker_container', criteriaForm).addressPicker({'data': noFloorRooms});
		$('.address_picker_container', form).addressPicker({data: noFloorRooms, autoOpen: false});
		
		/*
		$('.nav-tabs .nav-link').on('shown.bs.tab', function(e) {
			var tableInTab;
			if ($(e.target).is('#tab2')) tableInTab = parkingCardTable;
			else if ($(e.target).is('#tab3')) tableInTab = userTable;
			if (tableInTab) {
				tableInTab.responsive.recalc();
				tableInTab.columns.adjust().responsive.recalc();
			}
		});
		*/
		
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
					maxlength: 12, 
					remote: {
						url: URLS.GARAGE.CHECK_NO,
						type: "post",
						data: {
							no: function() {return $("#no").val();}, 
							id: function() {return $("#id").val();}, 
							parkingGarageId: function() {return $("#parking_garage_id").val();}
						}
					}
				},
				communityId: {requiredid: true},
				parkingGarageId: {requiredid: true},
				floor: {maxlength: 3},
				area: {maxlength: 4},
				garagePlateNo: {digits: true, maxlength: 4},
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
			saveUrl: URLS.GARAGE.SAVE_GARAGE, 
			removeUrl: URLS.GARAGE.DELETE, 
			afterPopulate: function(action) {
				var data = editForm.formData();
				if (data.qrcodeUrl) {
					if ($('#qrcode_container img.qrcode').length == 0) $('#qrcode_container').append('<img class="qrcode" id="qrcode" src=""/>');
					//$('#qrcode_container #qrcode').attr('src', APPLICATION.systemConfig.applicationRootUrl + APPLICATION.systemConfig.qrcodeUrl + data.qrcodeUrl);
					$('#qrcode_container #qrcode').attr('src', URLS.ROOT + APPLICATION.systemConfig.qrcodeUrl + data.qrcodeUrl);
					
				}
				else $('#qrcode_container').empty();
				$('#community_id').val(data.communityId ? data.communityId : '').trigger('change');
				$('#parking_garage_id').val(data.parkingGarageId ? data.parkingGarageId : '').trigger('change');
				$('#customer_id').val(data.customerId ? data.customerId : '').trigger('change');
				$('#enable_charging').iCheck(data.enableCharging ? 'check' : 'uncheck');
				if (action == CONSTANT.ACTION.ADD) $('input[name="ownershipId"]:first').iCheck('check');
				
				loadParkingCardTable();
				loadGarageUserTable();
				
				if (data.customer) {
					$(':input[name="addressNo"]', form).val(data.customer.addressNo).trigger('change');
					$(':input[name="addressFloor"]', form).val(data.customer.addressFloor).trigger('change');
					$(':input[name="addressRoom"]', form).val(data.customer.addressRoom).trigger('change');
				}
				else {
					$(':input[name="addressNo"], :input[name="addressFloor"], :input[name="addressRoom"]', form).val('').trigger('change');
				}
			},
			beforeSave: function(saving) {
				if (!saving.enableCharging) saving.enableCharging = false;
			}
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);
		
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), null, null);
		});
		
		/*
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, null, $('#criteria_customer_id'));
		});
		*/
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, null, null);
		});
		
		/*		
		$('#community_id').on('change', function(e) {
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), $('#customer_id'), null);
		});
		*/
		$('#community_id').on('change', function(e) {
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), null, null);
		});
		
		$('#garage_user_form').on('click', 'a.add_user', function(e) {
			/*
			e.preventDefault();
			var currentRow = $(this).closest('.garage_user_row');
			if (currentRow.length) $('.add_user_link', currentRow).addClass('d-none');
			var count = $('#garage_user_form .garage_user_row').length;
			var rowId = 'garage_user_row' + count;
			var row = garageUserRowTemplate.clone();
			row.prop('id', rowId);
			row.removeClass('d-none');
			$('.add_user_link', row).removeClass('d-none');
			$('.delete_user_link', row).removeClass('d-none');
			garageUserTable.append(row);
			row = $('#' + rowId, garageUserTable);
			
			var select = $('select[name="userId"]', row);
			select.append(new Option($.i18n.prop('operation.choose'), -1));
			for (var j = 0; j < customerUsers.length; j++) select.append(new Option(customerUsers[j].loginId + ' ' + customerUsers[j].name, customerUsers[j].id));
			//$('option[value="{0}"]'.format(json[i].id), select).attr("selected", "selected");
			select.select2({
				"theme": 'bootstrap4',
				"placeholder": $.i18n.prop('operation.choose')
			}).maximizeSelect2Height();
			*/
			addUser(e);
		});
		
		$('#garage_user_form').on('click', 'a.delete_user', function(e) {
			e.preventDefault();
			$(this).closest('.garage_user_row').remove();
			var row = $('.garage_user_row:last', garageUserTable);
			if (row) $('.add_user_link', row).removeClass('d-none');
			if (!$('.garage_user_row', garageUserTable).length) addUser();
		});
		
		$('#garage_user_form').on('click', '.garage_user_operation[value="S"]', function(e) {
			e.preventDefault();
			console.log('SAVE User');
			var rows = $('#garage_user_table .garage_user_row');
			if (rows.length) {
				if (toast) toast.fire({
					type: 'info', 
					title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
				});
				
				var saving = {'id': $('#id').val()};
				saving.garageUsers = [];
				for (var i = 0; i< rows.length; i++) {
					var userId = $('select[name="userId"]', rows[i]).val();
					if (userId) {
						saving.garageUsers.push({
							'userId': userId 
						});
					}
				}
				console.log(saving);
				ajaxPost(URLS.GARAGE.SAVE_USER, saving)
				.done(function(json) {
					console.log(json);
					if (toast) toast.fire({
						type: 'info', 
						title: $.i18n.prop('operation.saved') 
					});
				});
			}
		});
		
		$('#garage_user_form').on('click', '.garage_user_operation[value="C"]', function(e) {
			e.preventDefault();
			editForm.process(CONSTANT.ACTION.CANCEL);
			//loadGarageUserTable();
		});
		
		$('.parking_card_operation[value="S"]').on('click', null, function(e) {
			e.preventDefault();
			var rows = $('#parking_card_table .parking_card_row');
			if (rows.length) {
				if (toast) toast.fire({
					type: 'info', 
					title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
				});
				
				var saving = {'id': $('#id').val()};
				saving.parkingCards = [];
				for (var i = 0; i< rows.length; i++) {
					var userId = $('select[name="parkingCardUserId"]', rows[i]).val();
					if (userId <= 0) userId = null;
					saving.parkingCards.push({
						'id': $('input[name="parkingCardId"]', rows[i]).val(), 
						'userId': userId 
					});
				}
				//console.log(saving);
				ajaxPost(URLS.GARAGE.SAVE_PARKING_CARD, saving)
				.done(function(json) {
					console.log(json);
					if (toast) toast.fire({
						type: 'info', 
						title: $.i18n.prop('operation.saved') 
					});
				});
			}
		});
		
		$('.parking_card_operation[value="C"]').on('click', null, function(e) {
			e.preventDefault();
			//loadParkingCardTable();
			editForm.process(CONSTANT.ACTION.CANCEL);
		});
		
		$('#refresh').on('click', refresh);
		
		deferred.resolve();
	});
	//
	return deferred.promise();
}

function addUser(e) {
	var currentRow;
	if (e) {
		e.preventDefault();
		currentRow = $(e.target).closest('.garage_user_row');
	}
	else currentRow = null;
	if ((currentRow) && (currentRow.length)) $('.add_user_link', currentRow).addClass('d-none');
	
	var count = $('#garage_user_form .garage_user_row').length;
	var rowId = 'garage_user_row' + count;
	var row = garageUserRowTemplate.clone();
	row.prop('id', rowId);
	row.removeClass('d-none');
	$('.add_user_link', row).removeClass('d-none');
	$('.delete_user_link', row).removeClass('d-none');
	garageUserTable.append(row);
	row = $('#' + rowId, garageUserTable);
	
	var select = $('select[name="userId"]', row);
	select.append(new Option($.i18n.prop('operation.choose'), -1));
	if ((customerUsers) && (customerUsers.length)) {
		for (var j = 0; j < customerUsers.length; j++) select.append(new Option(customerUsers[j].loginId + ' ' + customerUsers[j].name, customerUsers[j].id));
		//$('option[value="{0}"]'.format(json[i].id), select).attr("selected", "selected");
		select.select2({
			"theme": 'bootstrap4',
			"placeholder": $.i18n.prop('operation.choose')
		}).maximizeSelect2Height();
	}
}
	

function loadTable(data, callback, settings) {
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});

	data.parameters = criteriaForm.serializeObject();
	
	deferreds.push(
		ajaxPost(URLS.GARAGE.QUERY, data)
		.done(function(json) {
			if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
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

	return deferreds;
}

function loadParkingCardTable() {
	var garageId = $('#id').val();
	if ((garageId <= 0) || (garageId == activeGarageId)) return;
	activeGarageId = garageId;
	console.log(activeGarageId);
	/*
	data.parameters = {
		"garageId": $('#id').val() 
	};
	
	ajaxPost(URLS.PARKING_CARD.QUERY, data)
	.done(function(json) {
		if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
		else callback({'data': [], 'recordsTotal': 0, 'recordsFiltered': 0});
	});	
	*/
	//parkingCardTable.empty();
			
	ajaxPost(URLS.PARKING_CARD.LIST, {"garageId": activeGarageId})
	.done(function(json) {
		//console.log(json);
		parkingCards = json;
		if ((json) && (json.length)) {
			ajaxGet(URLS.USER.LIST_BY_GARAGE + $('#id').val(), null)
			.done(function(users) {
				$('.parking_card_row', parkingCardTable).remove();
				for (var i = 0; i < json.length; i++) {
					var rowId = 'parking_card_row' + i;
					var row = parkingCardRowTemplate.clone();
					row.prop('id', rowId);
					row.removeClass('d-none');
					parkingCardTable.append(row);
					row = $('#' + rowId, parkingCardTable);
					$('.parking_card_id_label', row).text($.i18n.prop('parking_card.no') + ' ' + (i + 1));
					$('input[name="parkingCardId"]', row).attr('value', json[i].id);
					$('input[name="parkingCardNo"]', row).attr('value', json[i].no);
					
					var select = $('select[name="parkingCardUserId"]', row);
					if ((users) && (users.length)) {
						select.append(new Option($.i18n.prop('operation.choose'), -1));
						for (var j = 0; j < users.length; j++) select.append(new Option(users[j].loginId + ' ' + users[j].name, users[j].id));
					}
					if (json[i].userId) $('option[value="{0}"]'.format(json[i].userId), select).attr("selected", "selected");
					select.select2({
						"theme": 'bootstrap4',
						"placeholder": $.i18n.prop('operation.choose')
					}).maximizeSelect2Height();
				}
			});
		}
	});
}

function loadGarageUserTable() {
	customerUsers = null;
	//garageUserTable.empty();
	$('.garage_user_row', garageUserTable).remove();
	var parameters = {'communityId': $('#community_id').val(), 'customerId': $('#customer_id').val()};
	if ((parameters.communityId <= 0) || (parameters.customerId <= 0)) return;
	
	ajaxPost(URLS.USER.LIST_BY_COMMUNITY_CUSTOMER, parameters, function(users) {
		console.log(users);
		customerUsers = users;
		ajaxGet(URLS.USER.LIST_BY_GARAGE + $('#id').val(), null, function(json) {
			if ((json) && (json.length)) {
				$('.garage_user_row', garageUserTable).remove();
				
				for (var i = 0; i < json.length; i++) {
					var rowId = 'garage_user_row' + i;
					var row = garageUserRowTemplate.clone();
					row.prop('id', rowId);
					row.removeClass('d-none');
					garageUserTable.append(row);
					row = $('#' + rowId, garageUserTable);
					
					//$('input[name="garageUserId"]', row).attr('value', json[i].id);
					//$('input[name="garageUserName"]', row).attr('value', json[i].loginId + ' ' + json[i].name);
	
					var select = $('select[name="userId"]', row);
					select.append(new Option($.i18n.prop('operation.choose'), -1));
					for (var j = 0; j < customerUsers.length; j++) select.append(new Option(customerUsers[j].loginId + ' ' + customerUsers[j].name, customerUsers[j].id));
					$('option[value="{0}"]'.format(json[i].id), select).attr("selected", "selected");
					select.select2({
						"theme": 'bootstrap4',
						"placeholder": $.i18n.prop('operation.choose')
					}).maximizeSelect2Height();
					
					if (i == (json.length - 1)) $('.add_user_link', row).removeClass('d-none');
				}
				
			}
			else {
				if (!$('.garage_user_row', garageUserTable).length) addUser();
			}
		});
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
