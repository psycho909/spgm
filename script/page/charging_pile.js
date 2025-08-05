/*
requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-responsive', 'datatables-helper', 'daterangepicker', 'form-control', 'editForm', 'jquery-serialize', 'jquery-validate-messages', 'card-switcher'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 5000
	});	
	app.initialize(function() {
		if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
		refresh();
	});
});
*/
initialPage(function() {
	if (APPLICATION.data.selectedCommunityId) $('#criteria_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
	refresh();
});

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
var activeCommunityId;
var activeParkingGarageId;

var criteriaForm;
var criteriaValidator;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'customer-message', 'community-message', 'building-message', 'parking_garage-message', 'garage-message', 'charging_pile-message', 'charging_pile_model-message', 'transmitter-message', 'address-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('charging_pile');
			$('#title_section').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#query_result_title').text($.i18n.prop('terms.query.result'));
			
			$('#form_title').text($.i18n.prop('operation.input'));

			$('#criteria_organization_id_label, #organization_id_label').text($.i18n.prop('community'));

			$('#criteria_community_id_label, #community_id_label').text($.i18n.prop('community'));
			$('#criteria_parking_garage_id_label, #parking_garage_id_label').text($.i18n.prop('parking_garage'));
			$('#criteria_garage_id_label, #garage_id_label').text($.i18n.prop('garage'));
			$('#criteria_customer_id_label, #customer_id_label').text($.i18n.prop('customer'));
			$('#transmitter_id_label').text($.i18n.prop('transmitter'));
			$('#controller_id_label').text($.i18n.prop('charging_pile.controller'));
			$('#parent_meter_id_label').text($.i18n.prop('charging_pile.parent_meter'));

			$('#no_label').text($.i18n.prop('charging_pile.no'));
			$('#name_label').text($.i18n.prop('charging_pile.name'));
			$('#charging_pile_type_id_label').text($.i18n.prop('charging_pile.type'));
			$('#charging_pile_model_id_label').text($.i18n.prop('charging_pile_model.no'));
			$('#note_label').text($.i18n.prop('charging_pile.note'));
			$('#power_phase_id_label').text($.i18n.prop('charging_pile.power_phase'));

			$('#status_label').text($.i18n.prop('charging_pile.status'));
			/*
			$('#status1_label').append($.i18n.prop('status.active'));
			$('#status2_label').append($.i18n.prop('status.inactive'));
			*/

			$('#refresh').append($.i18n.prop('operation.refresh'));
			
			/*
			$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
			//$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
			$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
			$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
			$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
			$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
			*/

			$('button.inner_operation[value="Y"]').append($.i18n.prop('transmitter.config.operation.select'));
			
			/*
			$('#tab1').append($.i18n.prop('charging_pile'));
			$('#tab2').append($.i18n.prop('charging_pile.qrcode'));
			*/
			$('#qrcode_label').text($.i18n.prop('charging_pile.qrcode'));

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

	form = $('#form');
	criteriaForm = $('#criteria_form');

	showOperationButtons($('.operation_container'));
	
	// Date
	moment.locale(language);

	deferreds.push(
		ajaxGetJson(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#criteria_community_id, #community_id'), data, true);
		}), 
		ajaxGet(URLS.CHARGING_PILE_MODEL.LIST, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2($('#charging_pile_model_id'), data, true);
		})
	);
	
	deferreds.push(
		createCodeRadio('#status_container', 'status', URLS.CODE.LIST.COMMON_STATUS, 'no'), 
		createCodeRadio($('#charging_pile_type_id_container'), 'chargingPileTypeId', URLS.CODE.LIST.CHARGING_PILE_TYPE), 
		createCodeRadio($('#power_phase_id_container'), 'powerPhaseId', URLS.CODE.LIST.POWER_PHASE), 
	);
	
	buildSelect2($('#criteria_parking_garage_id, #parking_garage_id'), null, false);
	buildSelect2($('#criteria_customer_id, #customer_id'), null, false);
	buildSelect2($('#garage_id'), null, false);
	buildSelect2($('#transmitter_id'), null, false);
	buildSelect2($('#controller_id'), null, false);
	buildSelect2($('#parent_meter_id'), null, false);

	$('.nav-tabs a:first').tab('show');
	
	tableElement = $('#table');

	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		//
		table = tableElement.DataTable(
			/*
			{
			"data": null, 
			"language": getDataTablesLanguage(),
			"paging": true,
			'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"pageLength": APPLICATION.systemConfig.defaultPageLength,
			"lengthChange": true,
			"searching": false,
			"orderClasses": false, 
			"info": true,
			"responsive": false,
			"autoWidth": false,
			"columns": [
				{"data": null, "title": "", "sortable": false, 'width': 30, "render": dataTableHelper.render.commonButtonRender},
				{"data": "no", "title": $.i18n.prop('charging_pile.no'), "sortable": true, 'width': 60},
				{"data": "garage.parkingGarage.community", "title": $.i18n.prop('community'), "sortable": true, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": "garage.parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": true, 'width': 100, "render": dataTableHelper.render.nameRender},
				{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": true, 'width': 60}, 
				{"data": 'id', "visible": false} 
			],
			"processing": false,
			"deferLoading": 0,
			"serverSide": true,
			"ajax": loadTable, 
			}
			*/
			getDataTableOptions({
				"columns": [
					{"data": "no", "title": $.i18n.prop('charging_pile.no'), "sortable": true, 'width': 60},
					//{"data": "garage.parkingGarage.community", "title": $.i18n.prop('community'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": "garage.parkingGarage", "title": $.i18n.prop('parking_garage'), "sortable": false, 'width': 100, "render": dataTableHelper.render.nameRender},
					{"data": "garage", "title": $.i18n.prop('customer.no'), "sortable": false, 'width': 80, "render": dataTableHelper.render.noRender},
					{"data": "garage", "title": $.i18n.prop('customer.address'), "sortable": false, 'width': 100, "render": dataTableHelper.render.addressRender},
					{"data": "garage.no", "title": $.i18n.prop('garage'), "sortable": false, 'width': 60}, 
					{"data": "chargingPileType", "title": $.i18n.prop('charging_pile.type'), "sortable": false, 'width': 80, "render": dataTableHelper.render.codeRender},
					{"data": "powerPhase", "title": $.i18n.prop('charging_pile.power_phase'), "sortable": false, 'width': 40,"class": "text-center", "render": dataTableHelper.render.codeRender},
					{"data": null, "title": $.i18n.prop('operation'), "sortable": false, 'width': 40, "render": dataTableHelper.render.commonButtonRender},
					{"data": 'id', "visible": false} 
				],
				"ordering": true,
				"order": [[0, "asc"]],
				"processing": false,
				"deferLoading": 0,
				"serverSide": true,
				"ajax": loadTable  
			})
		);
		//
	}));
	//
	$.when.apply($, deferreds).then(function() {
		
		$('#refresh').on('click', refresh);

		var cardSwitcher = $('.card_switcher').cardSwitcher({switched: 1});
		addTitleOperation($('#title_operation_container'), cardSwitcher, {'search': true, 'add': true});
		
		addValidatorMethod();
		criteriaValidator = criteriaForm.validate({
			rules: {
				communityId: {
					requiredid: true
				}
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
						url: URLS.CHARGING_PILE.CHECK_NO,
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
			},
			messages: {
				no: {
					remote: $.i18n.prop('validation.duplicate')
				}
			}
		});
		
		$('#criteria_community_id').on('change', function(e) {
			activeCriteriaCommunityId = changeCommunity(criteriaForm.serializeObject(), $(this), activeCriteriaCommunityId, $('#criteria_parking_garage_id'), $('#criteria_customer_id'), null);
		});
		
		$('#criteria_parking_garage_id').on('change', function(e) {
			activeCriteriaParkingGarageId = changeParkingGarage(criteriaForm.serializeObject(), $(this), activeCriteriaParkingGarageId, $('#criteria_garage_id'));
		});

		$('#community_id').on('change', function(e) {
			activeCommunityId = changeCommunity(editForm.formData(), $(this), activeCommunityId, $('#parking_garage_id'), null, $('#transmitter_id'), $('#controller_id'), $('#parent_meter_id'));
		});
		
		$('#parking_garage_id').on('change', function(e) {
			activeParkingGarageId = changeParkingGarage(editForm.formData(), $(this), activeParkingGarageId, $('#garage_id'));
		});
		
		editForm = form.editForm({
			form: form,
			table: tableElement,
			dataTable: table,
			validator: validator, 
			cardSwitcher: cardSwitcher, 
			saveUrl: URLS.CHARGING_PILE.SAVE, 
			removeUrl: URLS.CHARGING_PILE.DELETE, 
			afterPopulate: function() {
				var data = editForm.formData();
				if (data.qrcodeUrl) {
					if ($('#qrcode_container img.qrcode').length == 0) $('#qrcode_container').append('<img class="qrcode" id="qrcode" src=""/>');
					//$('#qrcode_container #qrcode').attr('src', APPLICATION.systemConfig.applicationRootUrl + APPLICATION.systemConfig.qrcodeUrl + data.qrcodeUrl);
					$('#qrcode_container #qrcode').attr('src', URLS.ROOT + APPLICATION.systemConfig.qrcodeUrl + data.qrcodeUrl);
				}
				else $('#qrcode_container').empty();
				
				$('#community_id').val(data.communityId ? data.communityId : "").trigger('change');
				$('#parking_garage_id').val(data.parkingGarageId ? data.parkingGarageId : "").trigger('change');
				$('#customer_id').val(data.customerId ? data.customerId : "").trigger('change');
				$('#garage_id').val(data.garageId ? data.garageId : "").trigger('change');
				$('#charging_pile_model_id').val(data.chargingPileModelId ? data.chargingPileModelId : "").trigger('change');
				$("#transmitter_id").val(data.transmitterId ? data.transmitterId : "").trigger("change");
				$("#controller_id").val(data.controllerId ? data.controllerId : "").trigger("change");
				$("#parent_meter_id").val(data.parentMeterId ? data.parentMeterId : "").trigger("change");
			} 
		});
		editForm.process(CONSTANT.ACTION.INQUIRY);

		deferred.resolve();
	});
	//
	return deferred.promise();
}

function loadTable(data, callback, settings) {
	var deferreds = [];
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.loading') + ' ' + $.i18n.prop('operation.waiting') 
	});

	/*
	data.parameters = {
		"communityId": $('#criteria_community_id').val(), 
		"parkingGarageId": $('#criteria_parking_garage_id').val() 
	};
	*/
	data.parameters = criteriaForm.serializeObject();
	
	deferreds.push(
		ajaxPost(URLS.CHARGING_PILE.QUERY, data)
		.done(function(json) {
			if ((json.data) && (json.data.length)) callback({'data': json.data, 'recordsTotal': json.data.length, 'recordsFiltered': json.data.length});
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
	
	var communityId = $('#criteria_community_id').val();
	if ((communityId) && (communityId != APPLICATION.data.activeCommunityId)) {
		APPLICATION.data.activeCommunityId = communityId;
	}
	saveDataCookie();
	
	if (table) table.ajax.reload();
}
