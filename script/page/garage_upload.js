requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'datatables.net-fixedcolumns-bs4', 'fileinput', 'form-control', 'jquery-serialize', 'jquery-validate-messages', 'lightbox'], function(moment, swal) {
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		//allowOutsideClick: false, 
		timer: 300 * 1000
	});	
	app.initialize();
});

var nowTimer;
var language;
var table;
var form;
var criteriaForm;
var validator;
var criteriaValidator;

var acceptFileTypes = ['xlsx', 'xls'];
var meterDataFile;

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'garage-message', 'parking_garage-message', 'building-message', 'community-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: true,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('garage.data.upload');
			$('#title_section').text(APPLICATION.documentTitle);
			$('#breadcrumb_home').text($.i18n.prop('breadcrumb.home'));
			$('#breadcrumb_configuration').text($.i18n.prop('breadcrumb.configuration'));
			$('#breadcrumb_garage_data_upload').text(APPLICATION.documentTitle);
			
			$('#query_criteria_title').text($.i18n.prop('terms.query.criteria'));
			$('#upload_result_title').text($.i18n.prop('meter.data.upload.result'));
			//$('#date_label').text($.i18n.prop('garage.date'));
			$('#upload').append($.i18n.prop('operation.upload'));
			$('#save').append($.i18n.prop('operation.save'));

			$('#community_id_label').text($.i18n.prop('meter.data.upload.transmitter.vender'));

			$('#meter_data_file_label').text($.i18n.prop('meter.data.upload.file'));
			$('#original_file_name_label').text($.i18n.prop('meter.data.upload.file.name'));
			
			$('#table_title').text($.i18n.prop('meter.record.table.title'));
			
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	
	"use strict";

	criteriaForm = $('#criteria_form');
	form = $('#form');
	var dashedLanguage = language.replace('_', '-');
	
	var deferred = $.Deferred();
	var deferreds = [];
	
	$(document).ajaxStart(function() {Pace.restart();});
	
	$('#retrieve_photo_container').iCheck({
		radioClass: 'iradio_square-blue' 
	});
	
	deferreds.push(createVenderSelect($('#vender_id')));
	deferreds.push(createTelecomVenderSelect($('#telecom_vender_id')));
	deferreds.push(createContractSelect($('#contract_id')));
	//
	meterDataFile = $('#meter_data_file');
	var loadFileInput = function() {
		meterDataFile.fileinput({
			language: dashedLanguage,
			msgPlaceholder: $.i18n.prop('meter.data.upload.select') + ' (' + acceptFileTypes.join() + ' )', 
			allowedFileExtensions: acceptFileTypes, 
			maxFileCount: 1,
			uploadAsync: false,
			showPreview: false,
			showRemove: false,
			showUpload: false,
			uploadUrl: URLS.METER.UPLOAD.FILE
		});	
	};
	if (!language.startsWith('en')) {
		var url = getFileInputTranslation(language);
		if (url) {
			deferreds.push($.getScript(url, function() {
				loadFileInput();
			}));
		}
		else loadFileInput()
	}
	//
	deferreds.push($.getScript(getDataTableTranslation(language), function() {
		var errorRender = function(data, type, row) {
			if (type === 'display') {
				if (data == 0) return '<span class="text-danger"><i class="fas fa-lg fa-times"></i></span>';
				else return '<span class="text-success"><i class="fas fa-check"></i></span>';
			}
			else return data;
		};
		var waterNoErrorRender = function(data, type, row) {
			if (type === 'display') {
				if ((data == 0) || (row.duplicateWaterNo == 1)) return '<span class="text-danger"><i class="fas fa-lg fa-times"></i></span>';
				else return '<span class="text-success"><i class="fas fa-check"></i></span>';
			}
			else return data;
		};
		var meterNoErrorRender = function(data, type, row) {
			if (type === 'display') {
				if ((data == 0) || (row.duplicateMeterNo == 1)) return '<span class="text-danger"><i class="fas fa-lg fa-times"></i></span>';
				else return '<span class="text-success"><i class="fas fa-check"></i></span>';
			}
			else return data;
		};
		/*
		var transmitterNoErrorRender = function(data, type, row) {
			if (type === 'display') {
				if (row.duplicateTransmitterNo == 1) return '<span class="text-danger"><i class="fas fa-lg fa-times"></i></span>';
				else return '<span class="text-success"><i class="fas fa-check"></i></span>';
			}
			else return data;
		};
		*/
		//var dataTableTranslation = getDataTableTranslation(language);
		table = $('#table').DataTable({
			"language": getDataTablesLanguage(),
			"paging": false,
			//'lengthMenu': [100, 250, 500],
			//"pageLength": 100,
			//"lengthChange": true,
			"searching": false,
			"ordering": true,
			"order": [[3, "asc"], [5, "asc"], [2, "asc"], ],
			"info": true,
			"stateSave": false,
			"responsive": false,
			"autoWidth": false,
			"columns": [
				{"data": 'districtName', "title": $.i18n.prop('terms.district'), "sortable": false, 'width': 100, "className": 'min-tablet-p'},
				{"data": 'serviceOfficeNo', "title": $.i18n.prop('terms.service_office'), "sortable": true, 'width': 60, "className": 'min-mobile-p'},
				{"data": 'waterNo', "title": $.i18n.prop('terms.water_no'), "sortable": true, 'width': 100, "className": 'min-mobile-p'},
				{"data": 'validWaterNo', "sortable": true, 'width': 60, "render": waterNoErrorRender},
				{"data": 'meterNo', "title": $.i18n.prop('terms.meter_no'), "sortable": true, 'width': 100, "className": 'min-tablet-p'},
				{"data": 'validMeterNo', "sortable": true, 'width': 60, "render": meterNoErrorRender},
				{"data": 'meterVenderNo', "title": $.i18n.prop('meter.vender.no'), "sortable": true, 'width': 100, "className": 'min-tablet-p'},
				{"data": 'transmitterNo', "title": i18nCombine(language, 'terms.transmitter', 'terms.number'), "sortable": true, 'width': 100, "className": 'min-tablet-p'},
				//{"data": 'duplicateTransmitterNo', "sortable": false, 'width': 100, 'render': transmitterNoErrorRender, "className": 'min-tablet-p'},
				{"data": 'diameter', "title": $.i18n.prop('terms.diameter'), "sortable": true, 'width': 60, "className": 'min-tablet-p'},
				{"data": 'validDiameter', "sortable": true, 'width': 60, "render": errorRender},
				{"data": 'customerName', "title": $.i18n.prop('terms.customer'), "sortable": false, 'width': 200, "className": 'min-mobile-p'},
				{"data": 'contact', "title": $.i18n.prop('meter.contact'), "sortable": false, 'width': 80, "className": 'min-tablet-p'},
				{"data": 'address', "title": $.i18n.prop('terms.address'), "sortable": false, 'width': 200, "className": 'min-tablet-p'},
				{"data": 'industrySectorNo', "title": $.i18n.prop('meter.industry_sector'), "sortable": false, 'width': 200, "className": 'min-mobile-p'},
				{"data": 'longitude', "title": $.i18n.prop('terms.longitude'), "sortable": true, 'width': 60, "className": 'min-tablet-p'},
				{"data": 'latitude', "title": $.i18n.prop('terms.latitude'), "sortable": true, 'width': 60, "className": 'min-tablet-p'}
			],
			"serverSide": false,
			"dom": '<"top"i>'
			//"deferLoading": 0,
			//"processing": false, 
			//"dom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center"ip>>>'
		});	
	}));
	//
	var nowTimer = setInterval(function() {
		$('#now_datetime').text(formatDate(new Date()));
	}, 1000);
	
	if (!language.startsWith('en')) deferreds.push($.getScript(getValidatorTranslation(language)));
	criteriaValidator = criteriaForm.validate({
		rules: {
			meterDataFile: {
				required: true
			}
		}
	});
	configValidator(criteriaValidator);
	validator = form.validate({
		rules: {
			/*
			venderId: {
				required: true,
				min: '1'
			}
			*/
		}
	});
	configValidator(validator);
	//
	$.when.apply($, deferreds)
	.done(function() {
		$('#upload').on('click', function(e) {
			e.preventDefault();
			$('#save').attr('disabled', true);
			table.clear().draw();
			if (meterDataFile.fileinput('getFilesCount') > 0) {
				toast.fire({
					type: 'info', 
					title: combineMessage($.i18n.prop('operation.uploading'), $.i18n.prop('operation.waiting')) 
				});
				meterDataFile.fileinput('upload');
			}
		});
		
		$('#save').on('click', saveUploadFileData);
		
		meterDataFile.on('filebatchuploadsuccess', function(event, data, previewId, index) {
			//console.log(data);
			toast.close();
			if (data) {
				if (data.files.length) $('#original_file_name').val(data.files[0].name);
				table.clear();
				var error = 0;
				if (data.response.length) {
					table.rows.add(data.response).draw();
					for (var i = 0; i < data.response.length; i++) {
						if ((data.response[i].validWaterNo == 0) || (data.response[i].validMeterNo == 0) || 
							(data.response[i].duplicateWaterNo == 1) || (data.response[i].duplicateMeterNo == 1) || (data.response[i].duplicateTransmitterNo == 1)) 
							error++;
					}
					if (error) {
						swal.fire({
							text: $.i18n.prop('meter.upload.error').format(error),
							type: "warning",
							showCancelButton: false,
							confirmButtonClass: "btn-danger",
							confirmButtonText: $.i18n.prop('operation.confirm')
						});
					}
				}
				if (table.rows().data().length > error) {
					$('#save').attr('disabled', false);
				}
			}
		});
		meterDataFile.on('filebatchuploaderror', function(event, data, msg) {
			toast.close();
			swal.fire({
				text: $.i18n.prop('operation.upload.fail'),
				type: "warning",
				showCancelButton: false,
				confirmButtonClass: "btn-danger",
				confirmButtonText: $.i18n.prop('operation.confirm')
			});
		});
		//
		return deferred.resolve();
	});
	//
	return deferred.promise();
}
//
function saveUploadFileData() {
	if (!form.valid()) return false;
	var rowDatas = table.rows().data();
	if (!rowDatas) return false;
	toast.fire({
		type: 'info', 
		title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
	});
	var retrievePhoto = $('input[name="retrievePhoto"]:checked').val();
	if ("null" == retrievePhoto) retrievePhoto = null;
	var datas = [];
	for (var i = 0; i < rowDatas.length; i++) {
		datas.push(table.row(i).data());
	}
	var parameter = {
		'venderId': $('#vender_id').val(), 
		'telecomVenderId': $('#telecom_vender_id').val(), 
		'contractId': $('#contract_id').val(), 
		'retrievePhotoEnable': retrievePhoto,
		'originalFileName': $('#original_file_name').val(), 
		'datas': datas
	};
	ajaxPostJson(URLS.METER.UPLOAD.SAVE, parameter)
	.done(function(json) {
		if (json) {
			table.clear().draw();
		}
		toast.fire({
			type: 'info', 
			title: $.i18n.prop('operation.saved'),
			timer: 5 * 1000
		});
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		toast.close();
		swal.fire({
			text: $.i18n.prop('operation.save.fail'),
			type: "warning",
			showCancelButton: false,
			confirmButtonClass: "btn-danger",
			confirmButtonText: $.i18n.prop('operation.confirm')
		});
	});
}
//
function refresh() {
}
