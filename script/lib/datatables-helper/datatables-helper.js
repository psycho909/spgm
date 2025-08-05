var dataTableHelper = {
	constant: {
		statusText: null,
	}, 
	render: {
		noRender: function(data, type, row) {
			if (typeof data == 'object') return data.no;
			if (data) return data.no;
			else return '';
		},
		 
		nameRender: function(data, type, row) {
			if ((data) && (data.name)) return data.name;
			else return '-';
		}, 
	
		shortNameRender: function(data, type, row) {
			if ((data) && (data.shortName)) return data.shortName;
			else return '-';
		}, 
	
		codeRender: function(data, type, row) {
			if ((data) && (data.description)) return data.description;
			else return '-';
		}, 
	
		aliasRender: function(data, type, row) {
			if ((data) && (data.alias)) return data.alias;
			else return '-';
		}, 
	
		totalizerRender: function(data, type, row) {
			if (data == null) return "-";
			return roundTotalizer(data);
		},

		instantRender: function(data, type, row) {
			return roundInstant(data);
		},

		numberRender: function(data, type, row) {
			if (data == null) return "-";
			return formatNumber(data);
		},
		
		// Date Time
		dateRender: function(data, type, row) {
			if (data) return moment(data, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
			else return '-';
		},

		dateTimeRender: function(data, type, row) {
			if (data) return moment(data, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm');
			else return '-';
		},

		shortDateTimeRender: function(data, type, row) {
			if (data) return moment(data, 'YYYY-MM-DD HH:mm:ss').format('MM/DD HH:mm');
			else return '-';
		},

		numericDateTimeRender: function(data, type, row) {
			var result;
			if (data) {
				var result = data.toString();
				if (result.length >= 14) {
					result = result.substring(0, 4) + "-" + result.substring(4, 6) + "-" + result.substring(6, 8) + " " 
							+ result.substring(8, 10) + ":" + result.substring(10, 12); // + ":" + result.substring(12, 14);
				}
			}
			if (!result) result = '-';
			return result;
		},

		// Common status
		statusRender: function(data, type, row) {
			if (!dataTableHelper.constant.statusText) dataTableHelper.constant.statusText = [$.i18n.prop('status.inactive'), $.i18n.prop('status.active')]; 
			if (!data) data = 0;
			//return '<i class="fas ' + (data == 1 ? 'fa-check text-blue' : 'fa-times text-red') + '"></i>&nbsp;' + dataTableHelper.constant.statusText[data];
			return '<i class="fas fa-lg ' + (data == 1 ? 'fa-circle-check text-success' : 'fa-times-circle text-danger') + '"></i>&nbsp;';
		},

		// Connection status
		connectionStatusRender: function(data, type, row) {
			if (!data) return '<i class="fas fa-lg fa-question-circle text-purple"></i>';
			return '<i class="fas fa-lg ' + (data == APPLICATION.codeHelper.connectionStatusConnected.id ? 'fa-circle-check text-success' : 'fa-times-circle text-danger') + '"></i>&nbsp;';
		},

		commonButtonRender: function(data, type, row) {
			return '<div class="d-flex justify-content-end"><button class="operation inquiry btn btn-sm btn-info" type="button" value="I"><i class="fa-regular fa-eye"></i>&nbsp;{0}</button>'.format($.i18n.prop('operation.view')) 
				+ '<button class="operation edit btn btn-sm btn-success ml-2" type="button" value="U"><i class="fas fa-pen"></i>&nbsp;{0}</button></div>'.format($.i18n.prop('operation.edit'))
				//+ '<button class="operation delete btn btn-xs btn-danger" type="button" value="D"><i class="fas fa-trash"></i></button>'
		}, 

		checkboxRender: function(data, type, row) {
			//if (data) return '<input type="checkbox" class="icheck" name="checkedTableRow" value="true"/>';
			if (row) return '<input type="checkbox" class="icheck" name="checkedTableRow" value="true"/>';
			else return '';
		}, 

		booleanRender: function(data, type, row) {
			if (data) return '<span class="text-info"><i class="fas fa-check"></i></span>';
			else return '';
		},
		
		addressRender: function(data, type, row) {
			if (!dataTableHelper.constant.addressNo) {
				dataTableHelper.constant.addressNo = $.i18n.prop('address.no'); 
				dataTableHelper.constant.addressFloor = $.i18n.prop('address.floor'); 
				dataTableHelper.constant.addressRoom = $.i18n.prop('address.room');
			} 
			var customer = typeof row.addressNo != 'undefined' ? row : typeof row.customer != 'undefined' ? row.customer : (typeof data.customer != 'undefined') ? data.customer : null;
			if (customer) return (customer.addressNo ? customer.addressNo + dataTableHelper.constant.addressNo : '') + 
				(customer.addressFloor ? customer.addressFloor + dataTableHelper.constant.addressFloor : '') + 
				(customer.addressRoom ? customer.addressRoom + dataTableHelper.constant.addressRoom : '');
			else return '';
		}

	}
};