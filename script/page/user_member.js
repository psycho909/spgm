initialPage(function() {
	if (APPLICATION.data.activeOrganizationId) $('#criteria_organization_id').val(APPLICATION.data.activeOrganizationId).trigger('change');
	refresh();
}, null, ['address-picker']);

var activeRowClass = 'selected_row';

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
var parkingCardTableElement;
var parkingCardTable;

var organizationId;
var customerId;
var venderId;

var countries;
var roles;

var activeCriteriaOrganizationId;
var activeCriteriaCommunityId;
var activeCriteriaCustomerId;

var activeOrganizationId = null;

var previousCustomerId;
var noFloorRooms;

var selectedGarageId;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'user-message'/*, 'organization-message', 'community-message'*/, 'customer-message', 'address-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('user.member');
			$('#title_section').text($.i18n.prop('user.member'));
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_form_title').text($.i18n.prop('terms.query.criteria'));
			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('terms.organization'));
			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('terms.community'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('terms.customer'));
			$('#criteria_login_id_label, #login_id_label').text($.i18n.prop('user.login.id'));
			$('#criteria_name_label, #name_label').text($.i18n.prop('user.name'));
			$('#criteria_customer_no_label, #customer_no_label').text($.i18n.prop('customer.no'));
			
			//$('#criteria_vender_id_label, #vender_id_label').text($.i18n.prop('terms.vender'));
			$('#user_form_title').text($.i18n.prop('operation.input'));
			
			$('#parking_garage_id_label').text($.i18n.prop('terms.parking_garage'));
			$('#garage_id_label').text($.i18n.prop('terms.garage'));
			$('#parking_card_id_label').text($.i18n.prop('terms.parking_card'));
			
			$('#customer_administrator_label').text($.i18n.prop('user.customer_administrator'));
			$('#user_type_id_label').text($.i18n.prop('user.type'));
			$('#role_id_label').text($.i18n.prop('user.role'));
			//$('#locale_label').text($.i18n.prop('user.locale'));
			$('#email_label').text($.i18n.prop('user.email'));
			$('#phone_no_label').text($.i18n.prop('user.phone'));
			$('#mobile_phone_no_label').text($.i18n.prop('user.mobile_phone'));
			$('#mobile_phone_no').attr('placeholder', $.i18n.prop('placeholder.mobie_phone_no'));
			$('#line_id_label').text($.i18n.prop('user.line.id'));
			$('#license_plate_no_label').text($.i18n.prop('terms.license_plate'));
			$('#invoice_barcode_label').text($.i18n.prop('user.invoice.barcode'));
			
			$('#register_time_label').text($.i18n.prop('user.register_time'));
			$('#confirm_time_label').text($.i18n.prop('user.review_time'));
			//$('#tax_id_number_label').text($.i18n.prop('user.tax_id_number'));
			//$('#identity_card_number_label').text($.i18n.prop('user.identity_card_number'));
			$('#confirm_time, #register_time').attr('placeholder', $.i18n.prop('user.datetime.format'));
			//$('#tax_id_or_identity_card_number_label').text($.i18n.prop('user.tax_id_number') + '/' + $.i18n.prop('user.identity_card_number'));
			
			$('#address_label').text($.i18n.prop('user.address'));
			$('#note_label').text($.i18n.prop('user.notes'));
			$('#status_label').text($.i18n.prop('status'));
			$('#receive_notification_label').text($.i18n.prop('user.receive.notification'));
			$('#receive_report_label').text($.i18n.prop('user.receive.report'));
			$('#receive_notification_yes_label, #receive_report_yes_label').append($.i18n.prop('yes'));
			$('#receive_notification_no_label, #receive_report_no_label').append($.i18n.prop('no'));
			$('#notify_method_label').text($.i18n.prop('user.notify_method'));
			$('#password_label').text($.i18n.prop('user.password'));
			$('#reentry_password_label').last().prepend($.i18n.prop('user.password.reentry'));
			$('#ldap_authenticate_label').text($.i18n.prop('user.authenticate.ldap'));
			$('#ldap_authenticate_yes_label').append($.i18n.prop('yes'));
			$('#ldap_authenticate_no_label').append($.i18n.prop('no'));
			$('#credit_card_no_label').text($.i18n.prop('user.credit_card.no'));
			$('#criteria_address_label, #address_label').text($.i18n.prop('customer.address'));
			$('#criteria_address_floor_label, #address_floor_label').text($.i18n.prop('address.floor'));
			$('#criteria_address_no_label, #address_no_label').text($.i18n.prop('address.no'));
			$('#criteria_address_room_label, #address_room_label').text($.i18n.prop('address.room'));

			$('#tab1').append($.i18n.prop('user.member'));
			$('#tab2').append($.i18n.prop('terms.garage') + '/' + $.i18n.prop('terms.parking_card'));

			$('.garage_operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('.garage_operation[value="S"]').append($.i18n.prop('operation.save'));
			
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

	$(document).ajaxStart(function() {Pace.restart();});
	
	var dashedLanguage = language.replace('_', '-');
	
	form = $('#form');
	criteriaForm = $('#criteria_form');
	showOperationButtons($('.operation_container'));

	if (APPLICATION.systemConfig.paymentMethodEnabled) $('.payment').removeClass('d-none');

	moment.locale(dashedLanguage.toLowerCase());
	
	$('input[type="checkbox"].icheck').iCheck({
		checkboxClass: 'icheckbox_square-blue', 
		tap: true
	});
				
	$('#receive_notification_container, #ldap_authenticate_container, #receive_report_container').iCheck({
		radioClass: 'iradio_square-blue', 
		tap: true
	});

	deferreds.push(createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'));
	deferreds.push(createCodeRadio($('#user_type_id_container'), 'userTypeId', URLS.CODE.LIST.USER_TYPE));
	deferreds.push(createCodeCheckbox('#notify_method_container', 'notifyMethod', URLS.CODE.LIST.NOTIFY_METHOD, 'id'));
	deferreds.push(createOrganizationSelect($('#organization_id'), $('#criteria_organization_id'), $('#criteria_organization_id_container')));

	deferreds.push(
		createCommunitySelect($('#criteria_community_id, #community_id')), 
		ajaxGet(URLS.ROLE.LIST_EFFECTIVE, null, function(json) {
			roles= json;
			if (roles) {
				for (var i = 0; i < roles.length; i++) {
					$('#role_id').append('<option value="{0}">{1}</option>'.format(roles[i].id, roles[i].no + '-' + i18nText(roles[i], 'title', language)));
				}
			}
			$('#role_id').select2({
				maximumSelectionSize: 10, 
				multiple: true,
				allowClear: false,
				closeOnSelect: true,
				theme: 'bootstrap4', 
				placeholder: $.i18n.prop('operation.choose')
			}).maximizeSelect2Height();
		}), 
		ajaxGet(URLS.CUSTOMER.LIST_ADDRESS_BY_COMMUNITY + APPLICATION.data.selectedCommunityId, null)
		.done(function(json) {
			noFloorRooms = json;
		})
	);
	
	//buildSelect2($('#criteria_community_id, #criteria_customer_id'), null, true, false);
	buildSelect2($('#criteria_customer_id'), null, true, false);

	createDatePicker($('#register_time, #confirm_time'), moment().format(APPLICATION.SETTING.defaultDateTimeFormat), true, true);
	
	// Table
	tableElement = $('#table');
	garageTableElement = $('#garage_table');
	parkingCardTableElement = $('#parking_card_table');
	
	var garageCheckboxRender = function(data, type, row) {
		return '<div class="icheck_container"><input type="checkbox" class="icheck" name="garageId" value="{0}" id="garage_id{0}"/><label for="garage_id{0}">&nbsp;{1}</label></div>'
			.format(row.id, row.no);
	};

	var parkingCardCheckboxRender = function(data, type, row) {
		return '<div class="icheck_container"><input type="checkbox" class="icheck" name="parkingCardId" id="parking_card_id{0}" value="{0}"/><label for="parking_card_id{0}">&nbsp;{1}</label></div>'
			.format(row.id, row.no);
	};

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		table = tableElement.DataTable(
			getDataTableOptions({
				"columns": [
					{"data": "customerNo", "title": $.i18n.prop('customer.no'), "sortable": true, 'width': 80},
					{"data": "addressNo", "title": $.i18n.prop('customer.address'), "sortable": false, 'width': 100, "render": dataTableHelper.render.addressRender},
					{"data": 'loginId', "title": $.i18n.prop('user.login.id'), "sortable": true, 'width': 80},
					{"data": "userName", "title": $.i18n.prop('user.name'), "sortable": true, 'width': 80},
					//{"data": 'status', "title": $.i18n.prop('status'), "sortable": false, 'width': 60, "render": dataTableHelper.render.statusRender},
					{"data": 'email', "title": $.i18n.prop('user.email'), "sortable": true, 'width': 150},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"], [2, "asc"]],
				"serverSide": true,
				"ajax": loadingTable
			})
		);
		
		garageTable = garageTableElement.DataTable(
			getDataTableOptions({
				"paging": false,
				"lengthChange": false,
				"searching": false,
				"ordering": true,
				"order": [[0, "asc"]],
				"info": false,
				"autoWidth": false,
				"columns": [
					{"data": 'no', "visible": false, "sortable": true}, 
					{"data": "parkingGarageName", "title": $.i18n.prop('terms.parking_garage'), "sortable": false, 'width': 100}, 
					//{"data": 'garageId', "sortable": false, "title": $.i18n.prop('terms.garage'), 'width': 100, "render": garageCheckboxRender}, 
					{"data": null, "sortable": false, "title": $.i18n.prop('terms.garage'), 'width': 100, "render": garageCheckboxRender}, 
					{"data": 'id', "visible": false}, 
				],
				"serverSide": false,
			})
		);
		
		parkingCardTable = parkingCardTableElement.DataTable(
			getDataTableOptions({
				"paging": false,
				"lengthChange": false,
				"searching": true,
				"ordering": true,
				"order": [[0, "asc"]],
				"info": false,
				"autoWidth": false,
				"columns": [
					{"data": 'no', "visible": false, "sortable": true}, 
					{"data": null, "title": $.i18n.prop('terms.parking_card'), "sortable": false, 'width': 100, "render": parkingCardCheckboxRender}, 
					{"data": "userName", "title": $.i18n.prop('user'), "sortable": false, 'width': 100},
					{"data": 'garageId', "visible": false, "sortable": false, "searchable": true}, 
					{"data": 'id', "visible": false}, 
				],
				"serverSide": false,
			})
		);
		
	}));

	$('.nav-tabs a:first').tab('show');
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));

	$.when.apply($, deferreds)
	.done(function() {
		
		$('.address_picker_container', form).addressPicker({data: noFloorRooms, autoOpen: false});
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				//organizationId: {requiredid: true}
				/* 
				*/
				communityId: {
					requiredid: function(element) {
						return (APPLICATION.user.userType.id == APPLICATION.codeHelper.userTypeCustomer.id);
        			}
				}
			}
		});

		validator = form.validate({
			onkeyup: function (element) {
				return element.id != 'login_id';
			},			
			rules: {
				organizationId: {
					requiredid: true 
				}, 
				loginId: {
					required: true,
					minlength: APPLICATION.systemConfig.minLoginIdLength, 
					maxlength: APPLICATION.systemConfig.maxLoginIdLength, 
					remote: {
						url: URLS.USER.CHECK_LOGIN_ID,
						type: "post",
						data: {
							loginId: function() {return $("#login_id").val();}, 
							id: function() {return $("#id").val();}
						}
					}
				},
				password: {
					//regex: /^[a-zA-Z0-9_@#*\.]+$/, 
					regex: /^[a-zA-Z0-9]+$/, 
					minlength: APPLICATION.systemConfig.minPasswordLength, 
					maxlength: APPLICATION.systemConfig.maxPasswordLength
				}, 
				reentryPassword: {
					equalTo: "#password"
				},
				name: {
					required: true,
					minlength: 2, 
					maxlength: 50
				},
				lineId: {
					required: true,
					minlength: 2, 
					maxlength: 50
				},
				mobilePhoneNo: {
					required: true,
					digits: true, 
					minlength: 10, 
					maxlength: 10
				},
				addressNo: {required: true},
				addressFloor: {required: true},
				addressRoom: {required: true},
				status: {required: true}
			},
			messages: {
				loginId: {
					remote: $.i18n.prop('validation.duplicate')
				}
			}			
		});
		
		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1, form: form});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		editForm = form.editForm({
			form: form,
			table: tableElement,
			dataTable: table, 
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.USER_REGISTRATION.SAVE, 
			removeUrl: URLS.USER_REGISTRATION.DELETE,
			beforePopulate: function(action) {
				$('#password, #reentry_password').attr('placeholder', (action == CONSTANT.ACTION.UPDATE) ? $.i18n.prop('user.password.hint') : '');
				if (action == CONSTANT.ACTION.ADD) {
					editForm.formData({
						"id": 0,
						"communityId": APPLICATION.data.selectedCommunityId,
						"registrationId": 0,
						"status": 1,
						"locale": APPLICATION.SETTING.defaultLocale, 
						"registerTime": moment().format(APPLICATION.SETTING.defaultDateTimeFormat)
					});
					$('#tab2').addClass('d-none');
				}
				else {
					if ($('#tab2').is('.d-none')) $('#tab2').removeClass('d-none');
					$('.nav-tabs a:first').tab('show');
					var data = editForm.formData();
					if ((data.id > 0) && (editForm.activeRow)) {
					//if (editForm.activeRow) {
						var data = editForm.activeRow.data();
						if (data.role) data.roleId = data.role.id;
						//editForm.formData(data);
						if (data.userId) {
							var registration = {id: data.id, communityId: data.communityId, customerId: data.customerId}; 
							ajaxGet(URLS.USER.GET + data.userId)
							.done(function(json) {
								if (json) {
									var merged = $.extend(data, json);
									merged.registrationId = registration.id;
									merged.communityId = registration.communityId;
									merged.customerId = registration.customerId;
									merged.password = '';
									merged.reentryPassword = '';
									editForm.formData(merged);
									form.populate(merged);
								}
							});
						}
						else editForm.formData(data);
						
						/*
						if ((data.customerId) && (data.customerId != previousCustomerId)) {
							var deferreds = [];
							deferreds.push(loadParkingCardTable(data.customerId));
							deferreds.push(loadGarageTable(data.customerId));
							$.when.apply($, deferreds).done(() => {
								if (garageTable.data().any()) $('tbody tr:first', garageTableElement).trigger('click');
								console.log('customer #{0} garage & parking card loaded.'.format(data.customerId));
							});
						}
						previousCustomerId = data.customerId;
						*/
						
						return loadCustomerGarageAndParkingCards(data.customerId);
					}
				}
			},
			afterPopulate: function(action) {
				var data = editForm.formData();
				
				//$('#organization_id').val(data.organizationId ? data.organizationId : "").trigger('change');
				//if (action == CONSTANT.ACTION.ADD) $('input[name="userTypeId"]:first').iCheck('check').iCheck('update');
				//else $('input[name="userTypeId"][value="{0}"]'.format(data.userTypeId)).iCheck('check').iCheck('update');
				
				/*
				$('#role_id').val('');
				var roleIds = [];
				if (data.roles) {
					data.roles.forEach((e) => roleIds.push(e.id.toString()));
					$('#role_id').val(roleIds);
				}
				$('#role_id').trigger('change');
				*/
				
				$('input[name="notifyMethod"]').iCheck('uncheck');
				if (data.notifyMethods) {
					data.notifyMethods.forEach((e) => {
						$('input[name="notifyMethod"][value="{0}"]'.format(e.notifyMethodId)).iCheck('check');
					});
				}
				
				$('input[name="notifyMethod"]').iCheck('update');

				$(':input[name="communityId"]', form).val(data.communityId).trigger('change');
				$(':input[name="addressNo"]', form).val(data.addressNo).trigger('change');
				$(':input[name="addressFloor"]', form).val(data.addressFloor).trigger('change');
				$(':input[name="addressRoom"]', form).val(data.addressRoom).trigger('change');

				if (data.customerAdministrator) $('#customer_administrator').iCheck('check');
				else $('#customer_administrator').iCheck('uncheck');
				
				if (data.id > 0) { 
					parkingCardTable.column(3).search('').draw(); // Clear search
					$('input[name="garageId"]', garageTableElement).iCheck("uncheck");
					$('input[name="parkingCardId"]', parkingCardTableElement).iCheck("uncheck");
					if ((data.communityId > 0) && (data.userId > 0)) {
						var deferreds = [];
						//$('tbody', garageTableElement).off('ifChecked');
						deferreds.push(
							ajaxGet(URLS.GARAGE.LIST_BY_COMMUNITY_AND_CUSTOMER_AND_USER.format(data.communityId, data.customerId, data.userId), null).
							done(function(json) {
								if (json) {
									json.forEach(v => {
										var element = $('input[name="garageId"][value="{0}"]'.format(v.id), garageTableElement);
										element.iCheck("check").iCheck('update');
									});
								}
							}), 
							ajaxGet(URLS.PARKING_CARD.LIST_BY_COMMUNITY_AND_CUSTOMER_AND_USER.format(data.communityId, data.customerId, data.userId), null).
							done(function(json) {
								if (json) {
									json.forEach(v => {
										var element = $('input[name="parkingCardId"][value="{0}"]'.format(v.id), parkingCardTableElement);
										element.iCheck("check").iCheck('update');
									});
								}
							})
						);
						$.when.apply($, deferreds).done(function() {
							$('tbody tr:first', garageTableElement).trigger('click');
							//$('tbody', garageTableElement).on('ifChecked');
							console.log('User #{0} garage & parking card loaded.'.format(data.userId));
						});
					}
				}
			},
			save: function() {
				var saving = form.serializeObject();
				if (saving.reentryPassword) delete saving.reentryPassword;
				saving.userTypeId = APPLICATION.codeHelper.userTypeCustomer.id;
				saving.notifyMethods = [];
				$('input[name="notifyMethod"]:checked', form).each((index, element) => {
					saving.notifyMethods.push({'notifyMethodId': $(element).val()});
				});
				if (saving.notifyMethod) delete saving.notifyMethod;
				
				var deferred = $.Deferred();
				ajaxPost(URLS.USER.SAVE, saving, function(saved) {
					if ((saved) && (saved.id > 0)) {
						console.log('Saved user #{0}'.format(saved.id));
						var registration = {
							id: saving.registrationId, 
							communityId: saving.communityId, 
							customerId: saving.customerId, 
							customerAdministrator: (saving.customerAdministrator ? true :false), 
							userId: saved.id,
							status: 1
						}; 
						ajaxPost(URLS.USER_REGISTRATION.SAVE, registration, function(savedRegistration) {
							if (toast) toast.close();
							if ((savedRegistration) && (savedRegistration.id > 0)) console.log('Saved registration #{0}'.format(savedRegistration.id));
							deferred.resolve(saved);
						});
					}
					else return resolve(saved);
				});
				return deferred.promise();
			}, 	
			remove: function() {
				ajaxDelete(URLS.USER_REGISTRATION.DELETE, $('#registration_id').val(), null, (text) => {
					console.log('Deleted registration response: {0}'.format(text));
					if (toast) toast.close();
					table.ajax.reload();
					cardSwitcher.switch(1);
				});
			}
		});
		
		editForm.process(CONSTANT.ACTION.INQUIRY);
		
		/*
		*/
		$('#criteria_organization_id').on('change', function(e) {
			activeCriteriaOrganizationId = changeOrganization(criteriaForm.serializeObject(), $(this), activeCriteriaOrganizationId, $('#criteria_community_id'), null);
		});
		
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, null, $('#criteria_customer_id'), null);
		});
		
		$('#search').on('click', refresh);

		$('tbody', garageTableElement).on('click', 'tr', function(e) {
			var that = this;
			$('tbody tr.' + activeRowClass, garageTableElement).removeClass(activeRowClass);
			$(that).addClass(activeRowClass);
			var activeRow = garageTable.row(that);
			if (activeRow) {
				var data = activeRow.data();
				if (data) {
					selectedGarageId = data.id;
					if (selectedGarageId) parkingCardTable.column(3).search(selectedGarageId).draw();
				}
			}
	    });
		
		/*
		$('tbody', garageTableElement).on('ifChecked', '.icheck', function(e) {
			//e.preventDefault();
			var tr = $(this).closest('tr');
			if (tr) {
				var row = garageTable.row(tr);
				var rowData = row.data();
				rowData.garageId = rowData.id;
				row.data(rowData);
				//row.invalidate();
				$(e.target).iCheck('check').iCheck('update');
				console.log(rowData);
			}
		});
		*/
		
		$('.garage_operation[value="S"]').on('click', null, function(e) {
			e.preventDefault();
			console.log('SAVE Garage');
			var saving = {
				id: $('#id').val(), 
				communityId: $('#community_id').val(), 
				customerId: $('#customer_id').val(), 
				userId: $('#id').val(), 
				garages: [],
				parkingCards: []
			};
			
			parkingCardTable.column(3).search('').draw();
			$('input[name="garageId"]:checked', garageTableElement).each((i, v) => saving.garages.push({'id': $(v).val()}));
			$('input[name="parkingCardId"]:checked', parkingCardTableElement).each((i, v) => saving.parkingCards.push({'id': $(v).val()}));
			
			console.log(saving);

			if (toast) toast.fire({
				type: 'info', 
				title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
			});
			
			ajaxPost(URLS.USER_REGISTRATION.SAVE_GARAGE_AND_PARKING_CARD, saving)
			.done(function(json) {
				console.log(json);
				if (toast) toast.fire({
					type: 'info', 
					title: $.i18n.prop('operation.saved') 
				});
				
				previousCustomerId = null;
				editForm.refresh();
			});
		});
		
		$('.garage_operation[value="C"]').on('click', null, function(e) {
			e.preventDefault();
			editForm.process(CONSTANT.ACTION.CANCEL);
		});
		
		deferred.resolve();
	});
	
	return deferred.promise();
}

function loadingTable(data, callback, settings) {
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
	});

	data.parameters = criteriaForm.serializeObject();
	ajaxPost(URLS.USER_REGISTRATION.QUERY, data)
	//ajaxPost(URLS.USER.QUERY, data)
	.done(function(json) {
		if ((json.data) && (json.data.length)) {
			callback({'data': json.data, 'recordsTotal': json.recordsTotal, 'recordsFiltered': json.recordsFiltered});
			if (table.data().any()) $('tbody tr:first', tableElement).trigger('click');
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


function loadCustomerGarageAndParkingCards(customerId) {
	var deferred = $.Deferred();
	
	if ((customerId) && (customerId != previousCustomerId)) {
		$('table .icheck_container').remove();
		
		previousCustomerId = customerId;
		
		var deferreds = [];
		deferreds.push(loadParkingCardTable(customerId));
		deferreds.push(loadGarageTable(customerId));
		
		$.when.apply($, deferreds).done(() => {
			console.log('customer #{0} garage & parking card loaded.'.format(customerId));
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	else return false;
}

function loadGarageTable(customerId) {
	if(!customerId) customerId = $('#customer_id').val();
	if (!customerId) return null;
	
	var deferred = $.Deferred();
	garageTable.clear().draw(false);

	ajaxGet(URLS.GARAGE.LIST_BY_CUSTOMER + customerId, null)
	.done(function(json) {
		console.log('Customer #{0}, {1} Garage loaded.'.format(customerId, json.length ? json.length : 0));
		if ((json) && (json.length)) {
			json.forEach((v) => v.garageId = 0);
			garageTable.rows.add(json).draw(false);
			$(':input[name="garageId"]', garageTableElement).iCheck({
				checkboxClass: 'icheckbox_square-blue', 
				tap: true
			});	
		}
		
		$('input[name="garageId"]', garageTableElement).iCheck("uncheck");
				
		deferred.resolve();
	});
	
	return deferred.promise();
}	

function loadParkingCardTable(customerId) {
	if (!customerId) customerId = $('#customer_id').val();
	if (!customerId) return null;
	
	var deferred = $.Deferred();
	parkingCardTable.clear().draw(false);
	parkingCardTable.column(3).search('').draw(); // Clear search
	
	ajaxGet(URLS.PARKING_CARD.LIST_BY_CUSTOMER + customerId, null)
	.done(function(json) {
		console.log('Customer #{0}, {1} ParkingCard loaded.'.format(customerId, json.length ? json.length : 0));
		if ((json) && (json.length)) {
			json.forEach((v) => v.parkingCardId = 0);
			parkingCardTable.rows.add(json).draw(false);
			$(':input[name="parkingCardId"]', parkingCardTableElement).iCheck({
				checkboxClass: 'icheckbox_square-blue', 
				tap: true
			});	
		}
		deferred.resolve();
	});
	
	return deferred.promise();
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
