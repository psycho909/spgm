/*
requirejs(['moment', 'sweetalert2', 'app', 'pace', 'datatables.net-responsive', 'datatables-helper', 'daterangepicker', 'select2-maxheight', 'icheck', 'form-control', 'editForm', 'jquery-validate-messages'], function(moment, swal) {
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
*/
initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
}, null, null);

var nowTimer;
var language;

var form;
var validator;
var editForm;

var criteriaForm;
var criteriaValidator;

var tableElement;
var table;
var garageTableElement;
var garageTable;

var previousCustomerId;

var activeCriteriaCommunityId;

var activeCommunityId = null;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'user-message', 'garage-message'/*, 'parking_card-message'*/, 'address-message', 'customer-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('user') + '/' + $.i18n.prop('terms.garage');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_form_title').text($.i18n.prop('terms.query.criteria'));
			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('terms.organization'));
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('terms.community'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('terms.customer'));
			$('#criteria_login_id_label, #login_id_label').text($.i18n.prop('user.login.id'));
			$('#criteria_name_label, #user_name_label').text($.i18n.prop('user.name'));
			$('#login_id_label').text($.i18n.prop('user.login.id'));
			//$('#criteria_vender_id_label, #vender_id_label').text($.i18n.prop('terms.vender'));
			$('#user_form_title').text($.i18n.prop('operation.input'));
			
			$('#parking_garage_id_label').text($.i18n.prop('terms.parking_garage'));
			$('#garage_id_label').text($.i18n.prop('terms.garage'));
			$('#parking_card_id_label').text($.i18n.prop('terms.parking_card'));
			
			$('#customer_administrator_label').text($.i18n.prop('user.customer_administrator'));
			//$('#license_plate_no_label').text($.i18n.prop('terms.license_plate'));
			
			/*
			$('#user_form button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('#user_form button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('#user_form button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('#user_form button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('#user_form button.operation[value="S"]').append($.i18n.prop('operation.save'));
			
			$('#saving').text($.i18n.prop('operation.saving'));
			$('#waiting').text($.i18n.prop('operation.waiting'));
			$('#close_waiting').text($.i18n.prop('operation.close'));
			*/
			
			$('#tab1').append($.i18n.prop('terms.garage') + '/' + $.i18n.prop('terms.parking_card'));

			$('#search').append($.i18n.prop('operation.query'));

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

	/*
	$('#customer_id_container').hide();
	$('#vender_id_container').hide();
	*/

	$(document).ajaxStart(function() {Pace.restart();});
	
	var nowTimer = setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);

	var dashedLanguage = language.replace('_', '-');
	
	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));

	moment.locale(dashedLanguage.toLowerCase());
	
	$('input[type="checkbox"].icheck').iCheck({
		checkboxClass: 'icheckbox_square-blue', 
		tap: true
	});
				
	deferreds.push(createCommunitySelect($('#criteria_community_id, #community_id')));
	buildSelect2($('#criteria_customer_id'), null, false, false);

	tableElement = $('#table');
	garageTableElement = $('#garage_table');

	var garageCheckboxRender = function(data, type, row) {
		if (row.garageRow) return '<input type="checkbox" class="icheck" name="garageId" value="{0}"/>'.format(row.garageId);
		else return '';
	};

	var garageRender = function(data, type, row) {
		if (row.garageRow) return data;
		else return '';
	};

	var parkingCardCheckboxRender = function(data, type, row) {
		//return '<input type="checkbox" class="icheck" name="parkingCardId" value="{0}"/>'.format(row.id);
		return '<input type="checkbox" class="icheck" name="parkingCardId" name="parkingCardId_{0}" value="{0}"/>  <label for="parkingCardId_{0}">{1}</label>'.format(row.id, row.no);
	};

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable(
			getDataTableOptions({
				"ordering": true,
				"order": [[0, "asc"]],
				"columns": [
					//{"data": 'communityNo', "visible": true, "title": $.i18n.prop('terms.community'), "sortable": true, 'width': 100}, 
					//{"data": 'communityName', "title": $.i18n.prop('terms.community'), "sortable": false, 'width': 100}, 
					//{"data": 'customerNo', "visible": false, "title": $.i18n.prop('customer.no'), "sortable": true, 'width': 100},
					//{"data": 'customerName', "title": $.i18n.prop('terms.customer'), "sortable": false, 'width': 100},
					{"data": 'loginId', "title": $.i18n.prop('user.login.id'), "sortable": true, 'width': 80},
					{"data": "userName", "title": $.i18n.prop('user.name'), "sortable": false, 'width': 80},
					{"data": 'email', "title": $.i18n.prop('terms.email'), "sortable": true, 'width': 150},
					{"data": "customerNo", "title": $.i18n.prop('customer.no'), "sortable": false, 'width': 80},
					{"data": "addressNo", "title": $.i18n.prop('customer.address'), "sortable": false, 'width': 100, "render": dataTableHelper.render.addressRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"deferLoading": 0,
				"processing": false,
				"serverSide": true,
				"ajax": loadTable
			})
		);
		
		garageTable = garageTableElement.DataTable(
			getDataTableOptions({
				"paging": false,
				"lengthChange": false,
				"searching": false,
				"ordering": false,
				"info": false,
				"autoWidth": false,
				"columns": [
					/*
					{"data": 'garageId', "sortable": false, 'width': 30, "render": garageCheckboxRender}, 
					{"data": "parkingGarageName", "title": $.i18n.prop('terms.parking_garage'), "sortable": false, 'width': 80, "render": garageRender}, 
					{"data": "garageNo", "title": $.i18n.prop('garage.no'), "sortable": false, 'width': 80, "render": garageRender}, 
					{"data": "garageName", "title": $.i18n.prop('garage.name'), "sortable": false, 'width': 80, "render": garageRender}, 
					{"data": 'id', "sortable": false, 'width': 30, "render": parkingCardCheckboxRender}, 
					{"data": "no", "title": $.i18n.prop('terms.parking_card'), "sortable": false, 'width': 100}, 
					{"data": "userName", "title": $.i18n.prop('user'), "sortable": false, 'width': 80},
					*/
					{"data": "parkingGarageName", "title": $.i18n.prop('terms.parking_garage'), "sortable": false, 'width': 100, "render": garageRender}, 
					{"data": 'garageId', "sortable": false, "title": $.i18n.prop('garage'), 'width': 40, "render": garageCheckboxRender}, 
					{"data": "garageNo", "title": $.i18n.prop('garage.no'), "sortable": false, 'width': 80, "render": garageRender}, 
					//{"data": "garageName", "title": $.i18n.prop('garage.name'), "sortable": false, 'width': 80, "render": garageRender}, 
					{"data": 'id', "sortable": false, "title": $.i18n.prop('terms.parking_card'), 'width': 100, "render": parkingCardCheckboxRender}, 
					//{"data": "no", "title": $.i18n.prop('terms.parking_card'), "sortable": false, 'width': 100}, 
					{"data": "userName", "title": $.i18n.prop('user'), "sortable": false, 'width': 100},
					{"data": "parkingGarageId", "visible": false, "title": $.i18n.prop('terms.parking_garage'), "sortable": false, 'width': 80}, 
				],
				"deferLoading": 0,
				"processing": false,
				"serverSide": false,
				"stateSave": false,
			})
		);
		
	}));

	$('.nav-tabs a:first').tab('show');
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));

	$.when.apply($, deferreds)
	.done(function() {
		
		addValidatorMethod();
		
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {
					requiredid: function(element) {
						return (APPLICATION.user.userType.id == APPLICATION.codeHelper.userTypeCustomer.id);
        			}
				}
			}
		});

		validator = form.validate({
			rules: {
				communityId: {
					requiredid: true
				}, 
				customerId: {
					requiredid: true
				}, 
			},
			/*
			messages: {
				loginId: {
					remote: $.i18n.prop('validation.duplicate')
				}
			}
			*/		
		});
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = form.editForm({
			form: form,
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			table: tableElement,
			dataTable: table, 
			saveUrl: URLS.USER_REGISTRATION.SAVE, 
			beforePopulate: function(action) {
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						"id": 0,
						"status": 1,
						"communityId": APPLICATION.data.activecommunityId, 
						"registerTime": moment().format(APPLICATION.SETTING.defaultDateTimeFormat)
					});
				}
			},
			afterPopulate: function(action) {
				var data = editForm.formData();
				$('input[name="customerAdministrator"]').iCheck(data.customerAdministrator ? 'check' : 'uncheck').iCheck('update');
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				$('#customer_id').val(data.customerId ? data.customerId : "").trigger('change');
				$('input.icheck', garageTableElement).iCheck('update');
				
				$.when(loadGarageTable()).
				done(function() {
					$('input[name="garageId"]', garageTableElement).iCheck("uncheck");
					$('input[name="parkingCardId"]', garageTableElement).iCheck("uncheck");
					$.when(
						ajaxGet(URLS.GARAGE.LIST_BY_USER + data.userId, null).
						done(function(json) {
							if (json) json.forEach(v => $('input[name="garageId"][value="{0}"]'.format(v.id), garageTableElement).iCheck("check"));
						}), 
						ajaxGet(URLS.PARKING_CARD.LIST_BY_USER + data.userId, null).
						done(function(json) {
							if (json) json.forEach(v => $('input[name="parkingCardId"][value="{0}"]'.format(v.id), garageTableElement).iCheck("check"));
						})
					).
					done(function() {
						$('.icheck', garageTableElement).iCheck('update');
					});
				});
			},
			beforeSave: function(saving) {
				saving.garages = [];
				saving.parkingCards = [];
				$('input[name="garageId"]:checked', garageTableElement).each((i, v) => saving.garages.push({'id': $(v).val()}));
				$('input[name="parkingCardId"]:checked', garageTableElement).each((i, v) => saving.parkingCards.push({'id': $(v).val()}));
				return saving;
			}, 
			afterSave: function() {
				table.ajax.reload();
			}
		});
		
		editForm.process(CONSTANT.ACTION.INQUIRY);
		
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, null, $('#criteria_customer_id'), null);
		});

		$('#community_id').on('change', function(e) {
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, null, $('#customer_id'), null);
		});

		$('#customer_id').on('change', loadGarageTable); 
		
		$('#search').on('click', refresh);
		
		deferred.resolve();
	});
	
	return deferred.promise();
}

function loadTable(data, callback, settings) {
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
	});

	data.parameters = criteriaForm.serializeObject();
	ajaxPost(URLS.USER_REGISTRATION.QUERY, data)
	.done(function(json) {
		if ((json.data) && (json.data.length)) {
			callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
			if (table.data().any()) {
				var tableRow;
				if ((editForm) && (editForm.activeRow)) tableRow = $('tbody tr:eq({0})'.format(editForm.activeRow.index()), tableElement);
				else tableRow = $('tbody tr:first', tableElement);
				if (tableRow) tableRow.trigger('click');
			}
			toast.close();
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

function loadGarageTable() {
	var customerId = $('#customer_id').val();
	if ((!customerId) || (customerId == previousCustomerId)) {
		return;
	}
	
	var deferred = $.Deferred();
	garageTable.clear().draw(false);
	/*
	ajaxGet(URLS.PARKING_CARD.LIST_BY_CUSTOMER + customerId, null)
	.done(function(json) {
		if ((json) && (json.length)) {
			var garageId = 0;
			for (var i = 0; i < json.length; i++) {
				json[i].garageRow = json[i].garageId != garageId;
				if (json[i].garageRow) garageId = json[i].garageId;
			}
			garageTable.rows.add(json).draw(false);
			$('.icheck', garageTableElement).iCheck({
				checkboxClass: 'icheckbox_square-blue', 
				tap: true
			});	
		}
		deferred.resolve();
	});
	*/
	ajaxGet(URLS.PARKING_CARD.LIST_BY_CUSTOMER + customerId, null)
	.done(function(json) {
		if ((json) && (json.length)) {
			var garageId = 0;
			for (var i = 0; i < json.length; i++) {
				if (APPLICATION.systemConfig.customerPrivilegeEnabled) {
					json[i].garageRow = json[i].customerPrivilegeId != garageId;
					if (json[i].garageRow) garageId = json[i].customerPrivilegeId;
				}
				else {
					json[i].garageRow = json[i].garageId != garageId;
					if (json[i].garageRow) garageId = json[i].garageId;
				}
			}
			garageTable.rows.add(json).draw(false);
			$('.icheck', garageTableElement).iCheck({
				checkboxClass: 'icheckbox_square-blue', 
				tap: true
			});	
		}
		
		$('input[name="garageId"]', garageTableElement).iCheck("uncheck");
		$('input[name="parkingCardId"]', garageTableElement).iCheck("uncheck");
		$('input.icheck', garageTableElement).iCheck('update');
				
		//garageTable.draw();
		
		deferred.resolve();
	});
	
	previousCustomerId = customerId;
	
	return deferred.promise();
}	

function refresh(e) {
	if (e) e.preventDefault();
	if (!criteriaForm.valid()) return false;
	
	var communityId = $('#criteria_community_id').val();
	if ((communityId) && (communityId != APPLICATION.data.activeCommunityId)) {
		APPLICATION.data.activeCommunityId = communityId;
		saveDataCookie();
	}
	
	if (table) table.ajax.reload(null, false);
}
