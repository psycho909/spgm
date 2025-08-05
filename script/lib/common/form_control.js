/**
 * 
 */

function createCodeSelect(elementId, url) {
	return ajaxGetJson(url, null, function(json) {
		$(elementId).append('<option value=""></option>');
		if (json) {
			for (var i = 0; i < json.length; i++) {
				$(elementId).append('<option value="{0}">{1}</option>'.format(json[i].id, json[i].no + '-' + i18nText(json[i], 'description', language)));
			}
		}
	});
}

function buildCodeSelect2(elementId, codes, addingEmptyOption, optionHasNo, allowClear) {
	var data = [];
	if (codes) {
		if ((arguments.length < 3) || (addingEmptyOption)) {
			data.push({'id': "0", 'text': $.i18n.prop('operation.choose')});
		}
		for (var i = 0; i < codes.length; i++) {
			data.push({'id': codes[i].id, 'text': ((arguments.length < 4) || (optionHasNo) ? (codes[i].no + '-') : '') + i18nText(codes[i], 'description', language)});
		}
	}
	$(elementId).select2({
		data: data,
		maximumSelectionSize: 1,
		allowClear: (arguments.length > 4) ? allowClear : true,
		closeOnSelect: true,
		theme: 'bootstrap4', 
		placeholder: $.i18n.prop('operation.choose')
	}).maximizeSelect2Height();
}

function createCodeSelect2(elementId, url, addingEmptyOption, optionHasNo, allowClear) {
	return ajaxGetJson(url, null, function(json) {
		buildCodeSelect2(elementId, json, addingEmptyOption, optionHasNo, allowClear);
	});
}

function loadCodeRadio(elementId, controlName, codes, valueProperty, onlyNo) {
	if (!valueProperty) valueProperty = 'id';
	if (codes) {
		var element = $(elementId);
		for (var i = 0; i < codes.length; i++) {
			if (onlyNo) {
				element.append('<label for="{0}{1}"><input type="radio" no="{2}" name="{0}" id="{0}{1}" value="{4}" />&nbsp;{3}</label>&nbsp;&nbsp;'.
					format(controlName, i + 1, codes[i].no, codes[i].no, codes[i][valueProperty]));
			}
			else {
				element.append('<label for="{0}{1}"><input type="radio" no="{2}" name="{0}" id="{0}{1}" value="{4}" />&nbsp;{3}</label>&nbsp;&nbsp;'.
					format(controlName, i + 1, codes[i].no, codes[i].no + '-' + i18nText(codes[i], 'description', language), codes[i][valueProperty]));
			}
		}
		element.iCheck({
			radioClass: 'iradio_square-blue' 
		});
	}
}

function createCodeRadio(elementId, controlName, url, valueProperty, onlyNo) {
	if (!valueProperty) valueProperty = 'id';
	var deferred = $.Deferred();
	ajaxGetJson(url, null, function(json) {
		loadCodeRadio(elementId, controlName, json, valueProperty, onlyNo);
		deferred.resolve();
	});
	return deferred.promise();
}

function createCodeCheckbox(elementId, controlName, url, valueProperty) {
	if (!valueProperty) valueProperty = 'id';
	return ajaxGet(url, null, function(json) {
		if (json) {
			var element = $(elementId);
			for (var i = 0; i < json.length; i++) {
				element.append('<label for="{0}{1}"><input type="checkbox" name="{0}" id="{0}{1}" value="{3}" />&nbsp;{2}</label>&nbsp;&nbsp;'.
					format(controlName, json[i].id, json[i].no + '-' + i18nText(json[i], 'description', language), json[i][valueProperty]));
			}
			element.iCheck({
				checkboxClass: 'icheckbox_square-blue' 
			});
		}
	});
}

function createHourCheckbox(elementId, controlName) {
	var element = $(elementId);
	for (var i = 0; i < 24; i++) {
		element.append('<label for="{0}{1}"><input type="checkbox" class="icheck" name="{0}" id="{0}{1}" value="{1}" />&nbsp;{1}</label>'.format(controlName, i));
	}
	element.iCheck({
		checkboxClass: 'icheckbox_square-blue' 
	});
}

function loadUserSelect(element, users) {
	if (!element || !users) return;
	var data = [];
	data.push({'id': "0", 'text': $.i18n.prop('operation.choose')});
	for (var i = 0; i < users.length; i++) {
		data.push({'id': users[i].id, 'text': (users[i].userName ? users[i].userName + ' - ' : '') + users[i].displayName});
	}
	element.select2({
		data: data,
		maximumSelectionSize: 1,
		closeOnSelect: true,
		theme: 'bootstrap4', 
		allowClear: true,
		placeholder: $.i18n.prop('operation.choose')
	}).maximizeSelect2Height();
}

function loadUserSelect(element, users) {
	if (!element || !users) return;
	var data = [];
	data.push({'id': "0", 'text': $.i18n.prop('operation.choose')});
	for (var i = 0; i < users.length; i++) {
		data.push({'id': users[i].id, 'text': (users[i].userName ? users[i].userName + ' - ' : '') + users[i].displayName});
	}
	element.select2({
		data: data,
		maximumSelectionSize: 1,
		closeOnSelect: true,
		theme: 'bootstrap4', 
		allowClear: true,
		placeholder: $.i18n.prop('operation.choose')
	}).maximizeSelect2Height();
}

function createUserSelect(element, criteriaContainer) {
	var deferred = $.Deferred();
	ajaxGetJson(URLS.USER.LIST, null, function(json) {
		if (json) {
			if (element) {
				loadUserSelect(element, json);
				if (!element.val()) element.val(json[0].id).trigger('change');
			}
		}
			deferred.resolve();
	});
	if (criteriaContainer) criteriaContainer.show();
	if (deferred) return deferred.promise();
	else return;
}

function loadOrganizationSelect(element, organizations, autoDisable) {
	if (!element) return;
	var data = [];
	element.empty();
	data.push({'id': "0", 'text': $.i18n.prop('operation.choose')});
	if ((organizations) && (organizations.length)) {
		for (var i = 0; i < organizations.length; i++) {
			data.push({'id': organizations[i].id, 'text': (organizations[i].no ? organizations[i].no + ' - ' : '') + organizations[i].shortName});
		}
	}
	var placeholderText = ((organizations) && (organizations.length)) ? $.i18n.prop('operation.choose') : $.i18n.prop('terms.data.none');
	element.select2({
		data: data,
		maximumSelectionSize: 1,
		closeOnSelect: true,
		theme: 'bootstrap4', 
		allowClear: true,
		placeholder: placeholderText
	}).maximizeSelect2Height();
	/*
	if (arguments.length < 3) autoDisable = true;
	if (autoDisable) {
		if ((organizations) && (organizations.length)) {
			if (organizations.length == 0) {
				//element.val(organizations[0].id).trigger('change');
				element.prop("disabled", true);
			}
			else {
				element.prop("disabled", false);
			}
		}
		else {
			element.prop("disabled", true);
		}
	}
	*/
}

function createOrganizationSelect(element, criteriaElement, criteriaContainer) {
	return ajaxGet(URLS.ORGANIZATION.FAMILY + APPLICATION.user.organization.id, null) 
	.done(function(json) {
		if (element) {
			loadOrganizationSelect(element, json);
			//if ((!element.val()) || (element.val() <= 0)) element.val(organizationId).trigger('change');
		}
		if (criteriaElement) {
			loadOrganizationSelect(criteriaElement, json);
			//if ((!criteriaElement.val()) || (criteriaElement.val() <= 0)) criteriaElement.val(organizationId).trigger('change');
		}
	});
}

function createDateRangePicker(datesElement, dateRangeButtonElement, fromDateElement, toDateElement, fromDate, toDate, hasTimePicker, isAutoUpdateInput, settingValue) {
	var formatter = hasTimePicker ? APPLICATION.SETTING.defaultDateTimeFormat : APPLICATION.SETTING.defaultDateFormat;
	var picker = datesElement.daterangepicker(
		{
			startDate: fromDate,
			endDate: toDate,
			timePicker: hasTimePicker,
			timePicker24Hour: true,
			autoUpdateInput: isAutoUpdateInput ? true : false,
			locale: {
				format: formatter,
				separator: APPLICATION.SETTING.dateRangeSeparator,
				applyLabel: $.i18n.prop('operation.confirm'),
				cancelLabel: $.i18n.prop('operation.cancel')
			}
		},
		function (start, end) {
			if (fromDateElement) fromDateElement.val(start);
			if (toDateElement) toDateElement.val(end);
			datesElement.data('daterangepicker').setStartDate(start);
			datesElement.data('daterangepicker').setEndDate(end);
			datesElement.val(start.format(formatter) + APPLICATION.SETTING.dateRangeSeparator + end.format(formatter));
		}
	);
	if ((fromDate) && (toDate) && (settingValue)) {
		datesElement.val(fromDate.format(formatter) + APPLICATION.SETTING.dateRangeSeparator + toDate.format(formatter));
	}
	//
	if (dateRangeButtonElement) {
		dateRangeButtonElement.daterangepicker(
			{
				showCustomRangeLabel: true,
				ranges: getDateRange(),
				startDate: fromDate,
				endDate: toDate,
				locale: {
					format: APPLICATION.SETTING.defaultDateFormat,
					separator: APPLICATION.SETTING.dateRangeSeparator,
					customRangeLabel: $.i18n.prop('common.daterange.custom'),
					applyLabel: $.i18n.prop('operation.confirm'),
					cancelLabel: $.i18n.prop('operation.cancel')
				}
			},
			function (start, end) {
				if (fromDateElement) fromDateElement.val(start);
				if (toDateElement) toDateElement.val(end);
				datesElement.data('daterangepicker').setStartDate(start);
				datesElement.data('daterangepicker').setEndDate(end);
				datesElement.val(start.format(formatter) + APPLICATION.SETTING.dateRangeSeparator + end.format(formatter));
			}
		);
	}
	return picker;
}

function createDatePicker(dateElement, theDate, hasTimePicker, autoUpdateInput) {
	var formatter = hasTimePicker ? APPLICATION.SETTING.defaultDateTimeFormat : APPLICATION.SETTING.defaultDateFormat;
	var option = {
		timePicker: hasTimePicker,
		singleDatePicker: true,
		timePicker24Hour: true,
		timePickerMinutes: true,
		timePickerSeconds: true,
		timePickerIncrement: 1, 
		autoUpdateInput: false,
		locale: {
			format: hasTimePicker ? APPLICATION.SETTING.defaultDateTimeFormat : APPLICATION.SETTING.defaultDateFormat,
			separator: APPLICATION.SETTING.dateRangeSeparator,
			applyLabel: $.i18n.prop('operation.confirm'),
			cancelLabel: $.i18n.prop('operation.cancel')
		}
	};
	if (theDate) {
		option.startDate = theDate;
		option.endDate = theDate;
	}
	if (autoUpdateInput) option.autoUpdateInput = true;
	/*
	*/
	var picker = dateElement.daterangepicker(
		option, function(start, end) {
			dateElement.val(start.format(formatter));
		}
	);
	//var picker = dateElement.daterangepicker(option);
	/*
	if ((theDate) && (settingValue)) {
		dateElement.val(theDate.format(formatter));
	}
	*/
	return picker;
}

function loadTransmitterSelect(element, transmitters, valueProperty, initialValue) {
	if (!element || !transmitters) return;
	if (element.hasClass("select2-hidden-accessible")) {
		element.empty();
		element.select2('destroy');
	}
	var data = [];
	data.push({'id': (valueProperty == 'id') ? "0" : "", 'text': $.i18n.prop('operation.choose')});
	if (!valueProperty) valueProperty = 'id';
	for (var i = 0; i < transmitters.length; i++) {
		data.push({'id': transmitters[i][valueProperty], 'text': transmitters[i].transmitterNo + ' - ' + transmitters[i].name});
	}
	buildSelect2(element, data);
	if (initialValue) element.val(initialValue).trigger('change');
	else {
		if (data.length > 0) {
			element.val(data[0][valueProperty]).trigger('change');
		}
	}
}

function createDeviceSelect(element, communityId, deviceCategoryId, valueProperty, initialValue) {
	var deferred = $.Deferred();
	if ((!element) || (!communityId)) return;
	ajaxGet(URLS.DEVICE.QUERY, {'communityId': communityId, 'deviceCategoryId': deviceCategoryId}, function(json) {
		if (json) {
			if (json.length > 0) {
				loadTransmitterSelect(element, json, valueProperty, initialValue);
			}
		}
		deferred.resolve()
	});
	return deferred.promise();
}


function buildSelect2(selector, options, addDefaultOption, multiple, allowClear, defaultOptionText) {
	if (addDefaultOption) options = [{'id': '-1', 'text': defaultOptionText ? defaultOptionText : $.i18n.prop('operation.choose')}].concat(options);
	//if (addDefaultOption) options = [{'id': '-1', 'text': ' '}].concat(options);
	if (!multiple) multiple = false;
	var options = {
		"data": options ? options : [],
		//maximumSelectionSize: 1,
		"multiple": multiple,
		"allowClear": (allowClear === false ? false : true), 
		"closeOnSelect": !multiple,
		"theme": 'bootstrap4',
		"placeholder": defaultOptionText ? defaultOptionText : $.i18n.prop('operation.choose')
		//"placeholder": ' '
	};
	//return (multiple) ? selector.select2MultiCheckboxes(options).maximizeSelect2Height() : selector.select2(options).maximizeSelect2Height();
	return selector.select2(options).maximizeSelect2Height();
}

function changeOrganization(formData, organizationSelector, activeOrganizationId, communitySelector, userSelector) {
	var value = organizationSelector.val();
	if ((!value) || (value <= 0)) return activeOrganizationId;
	if (value == activeOrganizationId) return activeOrganizationId;
	 
	activeOrganizationId = value;
	
	if (communitySelector) {
		var communityId;
		if (formData) communityId = formData.communityId;
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + activeOrganizationId, null, function(json) {
			var data = [];
			communitySelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
			}
			communitySelector.select2({"data": data}, true);
			communitySelector.val(communityId).trigger("change");
		});
	}
	
	if (userSelector) {
		var userId;
		if (formData) userId = formData.userId;
		ajaxGet(URLS.USER.LIST_BY_ORGANIZATION + activeOrganizationId, null, function(json) {
			var data = [];
			userSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].name});
			}
			userSelector.select2({"data": data}, true);
			userSelector.val(userId).trigger("change");
		});
	}
	return activeOrganizationId;
}

function changeCommunity(formData, communitySelector, activeCommunityId, parkingGarageSelector, customerSelector, transmitterSelector, controllerSelector, parentMeterSelector) {
	var value = communitySelector.val();
	if ((!value) || (value <= 0)) return activeCommunityId;
	if (value == activeCommunityId) return activeCommunityId;
	 
	activeCommunityId = value;
	//var formData = editForm.formData();
	
	if (parkingGarageSelector) {
		var parkingGarageId;
		//if (formData) parkingGarageId = formData.garage.parkingGarageId;
		if (formData) parkingGarageId = formData.parkingGarageId;
		ajaxGet(URLS.PARKING_GARAGE.LIST_BY_COMMUNITY + activeCommunityId, null, function(json) {
			var data = [];
			parkingGarageSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
			}
			parkingGarageSelector.select2({"data": data}, true);
			if (json.length == 1) parkingGarageSelector.val(json[0].id).trigger("change");
			else parkingGarageSelector.val(parkingGarageId).trigger("change");
		});
	}
	
	if (customerSelector) {
		var customerId;
		//if (formData) customerId = formData.garage.customerId;
		if (formData) customerId = formData.customerId;
		ajaxGet(URLS.CUSTOMER.LIST_BY_COMMUNITY + activeCommunityId, null, function(json) {
			var data = [];
			customerSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
			}
			customerSelector.select2({"data": data}, true);
			customerSelector.val(customerId).trigger("change");
		});
	}
	
	/*
	if (transmitterSelector) {
		var transmitterId;
		if (formData) transmitterId = formData.transmitterId;
		ajaxGet(URLS.TRANSMITTER.LIST_BY_COMMUNITY + activeCommunityId, null, function(json) {
			var data = [];
			transmitterSelector.empty();
			
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].deviceNo});
			}
			transmitterSelector.select2({"data": data}, true);
			transmitterSelector.val(transmitterId).trigger("change");
		});
	}
	*/
	if (transmitterSelector) {
		var transmitterId;
		if (formData) transmitterId = formData.transmitterId;
		ajaxPost(URLS.DEVICE.LIST_BY_CRITERIA, {'communityId': activeCommunityId, 'deviceCategoryId': APPLICATION.codeHelper.deviceCategoryGateway.id}, function(json) {
			var data = [];
			transmitterSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].deviceNo});
			}
			transmitterSelector.select2({"data": data}, true);
			transmitterSelector.val(transmitterId).trigger("change");
		});
	}
	
	if (controllerSelector) {
		var controllerId;
		if (formData) controllerId = formData.controllerId;
		ajaxPost(URLS.DEVICE.LIST_BY_CRITERIA, {'communityId': activeCommunityId, 'deviceCategoryId': APPLICATION.codeHelper.deviceCategoryController.id}, function(json) {
			var data = [];
			controllerSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].deviceNo});
			}
			controllerSelector.select2({"data": data}, true);
			controllerSelector.val(controllerId).trigger("change");
		});
	}
	
	if (parentMeterSelector) {
		var parentMeterId;
		if (formData) parentMeterId = formData.parentMeterId;
		ajaxPost(URLS.DEVICE.LIST_BY_CRITERIA, {'communityId': activeCommunityId, 'deviceCategoryId': APPLICATION.codeHelper.deviceCategorySmartPowerMeter.id}, function(json) {
			var data = [];
			parentMeterSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].deviceNo});
			}
			parentMeterSelector.select2({"data": data}, true);
			parentMeterSelector.val(parentMeterId).trigger("change");
		});
	}
	
	return activeCommunityId;
}

function changeParkingGarage(formData, parkingGarageSelector, activeParkingGarageId, garageSelector, customerSelector) {
	var value = parkingGarageSelector.val();
	if ((!value) || (value <= 0)) return activeParkingGarageId;
	if (value == activeParkingGarageId) return activeParkingGarageId;
	 
	activeParkingGarageId = value;
	
	if (garageSelector) {
		var garageId;
		if (formData) garageId = formData.garageId;
		ajaxGet(URLS.GARAGE.LIST_BY_PARKING_GARAGE + activeParkingGarageId, null, function(json) {
			var data = [];
			garageSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				//for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				//for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].customer.no + '-' + json[i].name});
			}
			garageSelector.select2({"data": data}, true);
			garageSelector.val(garageId).trigger("change");
		});
	}
	
	if (customerSelector) {
		var customerId;
		if (formData) {
			if (formData.customerId) customerId = formData.customerId;
			else if (formData.garage) customerId = formData.garage.customerId;
		}
		//if (formData) customerId = formData.garage.customerId;
		ajaxGet(URLS.CUSTOMER.LIST_BY_PARKING_GARAGE + activeParkingGarageId, null, function(json) {
			var data = [];
			customerSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
			}
			customerSelector.select2({"data": data}, true);
			customerSelector.val(customerId).trigger("change");
		});
	}
	return activeParkingGarageId;
}

function changeCustomer(formData, customerSelector, activeCustomerId, garageSelector, userSelector, parkingCardSelector) {
	var value = customerSelector.val();
	if ((!value) || (value <= 0)) return activeCustomerId;
	if (value == activeCustomerId) return activeCustomerId;
	 
	activeCustomerId = value;
	
	if (garageSelector) {
		var garageId;
		if (formData) garageId = formData.garageId;
		ajaxGet(URLS.GARAGE.LIST_BY_CUSTOMER + activeCustomerId, null, function(json) {
			var data = [];
			garageSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				//for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no});
			}
			garageSelector.select2({"data": data}, true);
			garageSelector.val(garageId).trigger("change");
		});
	}
	
	if (userSelector) {
		var userId;
		if (formData) userId = formData.userId;
		ajaxGet(URLS.USER.LIST_BY_CUSTOMER + activeCustomerId, null, function(json) {
			var data = [];
			userSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].name});
			}
			userSelector.select2({"data": data}, true);
			userSelector.val(userId).trigger("change");
		});
	}
	
	if (parkingCardSelector) {
		var parkingCardId;
		if (formData.parkingCardId) parkingCardId = formData.parkingCardId;
		ajaxGet(URLS.PARKING_CARD.LIST_BY_CUSTOMER + activeCustomerId, null, function(json) {
			var data = [];
			parkingCardSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no});
			}
			parkingCardSelector.select2({"data": data}, true);
			parkingCardSelector.val(parkingCardId).trigger("change");
		});
	}
	
	return activeCustomerId;
}

function changeGarage(formData, garageSelector, activeGarageId, parkingCardSelector) {
	var value = garageSelector.val();
	if ((!value) || (value <= 0) || (value == activeGarageId)) return activeGarageId;
	 
	activeGarageId = value;
	
	if (parkingCardSelector) {
		var parkingCardId;
		if (formData.parkingCardId) parkingCardId = formData.parkingCardId;
		ajaxGet(URLS.PARKING_CARD.LIST_BY_GARAGE + activeGarageId, null, function(json) {
			var data = [];
			parkingCardSelector.empty();
			if (json) {
				data.push({'id': '-1', 'text': $.i18n.prop('operation.choose')});
				for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no});
			}
			parkingCardSelector.select2({"data": data}, true);
			parkingCardSelector.val(parkingCardId).trigger("change");
		});
	}
	
	return activeGarageId;
}

function createCommunitySelect(selector, addEmptyOption, callback) {
	if ((APPLICATION.user) && (APPLICATION.user.organization)) {
		var deferred = $.Deferred();
		ajaxGet(URLS.COMMUNITY.LIST_BY_ORGANIZATION + APPLICATION.user.organization.id, null)
		.done(function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2(selector, data, addEmptyOption);
			if (callback) callback(json);
			deferred.resolve();
		});
		return deferred.promise();
	}
}

function createParkingGarageSelect(selector, addEmptyOption, communityId, callback) {
	if ((APPLICATION.user) && (APPLICATION.user.organization)) {
		var deferred = $.Deferred();
		ajaxGet(URLS.PARKING_GARAGE.LIST_BY_COMMUNITY + communityId, null, function(json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.name};});
			buildSelect2(selector, data, addEmptyOption);
			if (callback) callback(json);
			deferred.resolve();
		});
		return deferred.promise();
	}
}

/*
function createVenderSelect(selector, addEmptyOption) {
	if (!selector) return null;
	var deferred = $.Deferred();
	ajaxPost(URLS.VENDER.LIST, {'organizationId': APPLICATION.user.organization.id})
	.done(function(json) {
		if (json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no + '-' + v.shortName};});
			buildSelect2(selector, data, addEmptyOption);
			deferred.resolve();
		}
	})
	.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
		console.error('*** status: %s, error: %s ***', textStatus, errorThrown);
	});
	return deferred.promise();
}
			
*/

function createFloorSelect(selector, addEmptyOption, parkingGrageId, callback) {
	if ((!selector) || (!parkingGrageId)) return null;
	var deferred = $.Deferred();
	ajaxGet(URLS.GARAGE.LIST_FLOOR_BY_PARKING_GARAGE + parkingGarageId, null)
	.done(function(json) {
		if (json) {
			var data = json.map(function (v) {return {'id': v, 'text': v};});
			buildSelect2(selector, data, addEmptyOption);
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function createControllerSelect(selector, addEmptyOption, parkingGarageId) {
	if (!selector) return null;
	var deferred = $.Deferred();
	ajaxGet(URLS.DEVICE.CONTROLLER_BY_PARKING_GARAGE + parkingGarageId)
	.done(function(json) {
		if (json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no};});
			buildSelect2(selector, data, addEmptyOption);
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function createGatewaySelect(selector, addEmptyOption, parkingGarageId) {
	if (!selector) return null;
	var deferred = $.Deferred();
	ajaxGet(URLS.DEVICE.GATEWAY_BY_PARKING_GARAGE + parkingGarageId)
	.done(function(json) {
		if (json) {
			var data = json.map(function (v, i, a) {return {'id': v.id, 'text': v.no};});
			buildSelect2(selector, data, addEmptyOption);
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function addTitleOperation(container, cardSwitcher, options) {
	if (!options) return;
	
	if (options.search) {
		container.append('<a class="btn text-info title_search_criteria"><i class="fa-solid fa-lg fa-search"></i>&nbsp;</a>');
		$('.title_search_criteria', container).append($.i18n.prop('operation.query'));
		$('.title_search_criteria', container).on('click', function(e) {
			e.preventDefault();
			if ($('#criteria_area .card').is('.d-none')) $('#criteria_area .card').removeClass('d-none');
			else $('#criteria_area .card').addClass('d-none');
			if (typeof editForm == CONSTANT.TYPE.OBJECT) {
				editForm.action(CONSTANT.ACTION.INQUIRY);
				if (typeof editForm.cardSwitcher == CONSTANT.TYPE.OBJECT) if (editForm.cardSwitcher) editForm.cardSwitcher.switch(1);
			} 
		});
	}
			
	if (options.add) {
		container.append('<a class="btn text-success title_new_record"><i class="fa-regular fa-lg fa-circle-plus"></i>&nbsp;</a>');
		$('.title_new_record', container).append($.i18n.prop('operation.add'));
		$('.title_new_record', container).on('click', function(e) {
			e.preventDefault();
			if (typeof editForm == CONSTANT.TYPE.OBJECT) editForm.action(CONSTANT.ACTION.ADD);
			if (cardSwitcher) cardSwitcher.switch(2);
			if (typeof editForm == CONSTANT.TYPE.OBJECT) editForm.process(CONSTANT.ACTION.ADD);
		});
	}

	if (options.calculate) {
		container.append('<a class="btn text-success title_calculate"><i class="fa-solid fa-calculator-simple"></i>&nbsp;</a>');
		$('.title_calculate', container).append($.i18n.prop('operation.calculate'));
	}
	
	if (options.import) {
		container.append('<a class="btn text-warning title_import"><i class="fa-solid fa-lg fa-file-import"></i>&nbsp;</a>');
		$('.title_import', container).append($.i18n.prop('operation.import'));
	}		
	if (options.export) {
		container.append('<a class="btn text-primary title_export"><i class="fa-solid fa-lg fa-file-export"></i>&nbsp;</a>');
		$('.title_export', container).append($.i18n.prop('operation.export'));
	}
	
	container.append('<a class="btn title_back_to_list d-none"><i class="text-orange fa-solid fa-lg fa-reply"></i>&nbsp;</a>');
	$('.title_back_to_list', container).on('click', function(e) {
		e.preventDefault();
		if ((typeof editForm == CONSTANT.TYPE.OBJECT) && (typeof editForm.cardSwitcher == CONSTANT.TYPE.OBJECT)) {
			editForm.action(CONSTANT.ACTION.INQUIRY);
			if (editForm.cardSwitcher) editForm.cardSwitcher.switch(1);
			if ((editForm.action() == CONSTANT.ACTION.ADD) || (editForm.action() == CONSTANT.ACTION.UPDATE)) editForm.cancel();
		}
	});
}

/*
function addResultOperation(container, options) {
	if (!options) return;
	if (options.import) {
		container.append('<a class="btn btn-tool btn-warning header_operation_import"><i class="fa-solid fa-lg fa-file-import"></i></a>');
		$('.header_operation_import').append($.i18n.prop('operation.import'));
	}		
	if (options.export) {
		container.append('<a class="btn btn-tool btn-primary header_operation_export ml-2"><i class="fa-solid fa-lg fa-file-export"></i></a>');
		$('.header_operation_export').append($.i18n.prop('operation.export'));
	}
}
*/

var defaultDataTableOptions;
function getDataTableOptions(options) {
	$('.data_table_container table').removeClass('compact');
	if (!defaultDataTableOptions) {
		defaultDataTableOptions = {
			"language": getDataTablesLanguage(),
			"paging": true, 
			"start": 0, 
			//"lengthChange": true,
			//'lengthMenu': APPLICATION.systemConfig.defaultPageLengthMenu, 
			"lengthChange": false,
			"pageLength": APPLICATION.systemConfig.defaultPageLength, 
			"searching": false,
			"orderClasses": false, 
			"ordering": false, 
			//"order": [[0, "asc"]],
			"info": false,
			//"scrollX": true, 
			//"scrollY": height,
			//"scrollCollapse": true, 
			"responsive": false, 
			"stateSave": false, 
			"autoWidth": false,
			"processing": false, 
			"deferLoading": 0,
			//"serverSide": true,
			//"ajax": loadTable 
		};
	}
	return $.extend(defaultDataTableOptions, options);
}

var defaultOperationButtonOptions = {
	'add': true,
	'copy': false,
	'update': true,
	'delete': true,
	'save': true,
	'cancel': true, 
	'calculate': false, 
	'backToList': true 
};

function showOperationButtons(container, options) {
	options = $.extend(defaultOperationButtonOptions, options);
	container.append('<div class="d-flex justify-content-around"></div>');
	var buttonContainer = $('div:last', container);
	/*
	if (options.add) {
		buttonContainer.append('<button class="btn btn-info operation" value="A"><i class="fa fa-plus"></i>&nbsp;</button>');
		$('button.operation[value="A"]').append($.i18n.prop('operation.add'));
	}
	*/
	if (options.copy) {
		buttonContainer.append('<button class="btn btn-warning operation" value="Y"><i class="fa fa-copy"></i>&nbsp;</button>');
		$('button.operation[value="Y"]').append($.i18n.prop('operation.copy'));
	}
	if (options.update) {
		buttonContainer.append('<button class="btn btn-success operation" value="U"><i class="fas fa-pen"></i>&nbsp;</button>');
		$('button.operation[value="U"]').append($.i18n.prop('operation.update'));
	}
	if (options.delete) {
		buttonContainer.append('<button class="btn btn-danger operation" value="D"><i class="fa fa-trash"></i>&nbsp;</button>');
		$('button.operation[value="D"]').append($.i18n.prop('operation.remove'));
	}
	if (options.save) {
		buttonContainer.append('<button class="btn btn-primary operation" value="S" type="submit"><i class="fa fa-check"></i>&nbsp;</button>');
		$('button.operation[value="S"]').append($.i18n.prop('operation.save'));
	}
	if (options.confirm) {
		buttonContainer.append('<button class="btn btn-primary operation" value="M"><i class="fa fa-check"></i>&nbsp;</button>');
		$('button.operation[value="M"]').append($.i18n.prop('operation.confirm'));
	}
	if (options.reject) {
		buttonContainer.append('<button class="btn btn-danger operation" value="J"><i class="fa fa-times"></i>&nbsp;</button>');
		$('button.operation[value="J"]').append($.i18n.prop('operation.reject'));
	}
	if (options.cancel) {
		buttonContainer.append('<button class="btn btn-warning operation" value="C" type="reset"><i class="fas fa-sync"></i>&nbsp;</button>');
		$('button.operation[value="C"]').append($.i18n.prop('operation.cancel'));
	}
	if (options.backToList) {
		buttonContainer.append('<button class="btn btn-success operation card_switcher_button" value="K"><i class="fa-sharp fa-solid fa-backward-step"></i>&nbsp;</button>');
		$('button.operation[value="K"]').append($.i18n.prop('operation.back_to_list'));
	}
}

var defaultLayoutOptions = {
	'showQueryCriteriaCard': false,
	'showQueryCriteriaHeader': false,
	'showQueryResultCard': true,
	'showQueryResultHeader': false 
};

function applyLayoutOption(options) {
	options = $.extend(defaultLayoutOptions, options);
	if (typeof options == CONSTANT.TYPE.OBJECT) {
		if (options.showQueryCriteriaCard) $('#criteria_area .card').removeClass('d-none');
		else $('#criteria_area .card').addClass('d-none');
		if (options.showQueryCriteriaHeader) $('#criteria_area .card-header').removeClass('d-none');
		else  $('#criteria_area .card-header').addClass('d-none');
		if (options.showQueryResultCard) $('#result_area .card').removeClass('d-none');
		else $('#result_area .card').addClass('d-none');
		if (options.showQueryResultHeader) $('#result_area .card-header').removeClass('d-none');
		else $('#result_area .card-header').addClass('d-none');
	}
	else {	
		if (APPLICATION.SETTING.showQueryCriteriaHeader) $('#criteria_area .card-header').removeClass('d-none');
		else  $('#criteria_area .card-header').addClass('d-none');
		if (APPLICATION.SETTING.showQueryResultHeader) $('#result_area .card-header').removeClass('d-none');
		else $('#result_area .card-header').addClass('d-none');
	}
}

function addValidatorMethod() {
	$.validator.addMethod(
		"regex", function(value, element, regexp) {
			var re = new RegExp(regexp);
			return this.optional(element) || re.test(value);
		},
		$.i18n.prop('validation.password')
	);
	
	$.validator.addMethod(
		"requiredid", function(value, element, regexp) {
			return this.optional(element) || ((!isNaN(value)) && (parseInt(value) > 0));
		},
		$.i18n.prop('validation.required')
	);
	
	$.validator.addMethod(
		"greaterEqual", function(value, element, params) {
			try {
				if ($(params[0]).val() != '') {
					//if (!/Invalid|NaN/.test(new Date(value))) {
					if ((value.indexOf('-') > 0) && (value.indexOf(':') > 0)) {
						return new Date(value) >= new Date($(params[0]).val());
					}
					else if (isNaN(value) && isNaN($(params[0]).val())) {
						return true;
					}
					else if (Number(value) >= Number($(params[0]).val())) {
						if (params.length > 2) $(params[2]).val(Number(value) - Number($(params[0]).val()) + 1);
						return true;
					}
				};
			}
			catch (e) {
				console.log(e);
			}
			return true;
		}, 
		$.i18n.prop('validation.greater.equal')
	);
}
