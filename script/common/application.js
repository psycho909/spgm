var APPLICATION = {
	SETTING: {
		defaultMapZoom: 14, 
		defaultLatitude: 25.016587, 
		defaultLongitude: 121.548156,
		defaultLanguageFileName: 'common-message',
		defaultMeterLanguageFileName: 'meter-message',
		defaultLanguageFilePath: '../../script/common/i18n/',
		dateRangeSeparator: '~',
		timeRangeSeparator: ';',
		defaultDecimalPlaces: 2,
		defaultInstantDecimalPlaces: 2,
		//defaultLocale: 'en_US',
		defaultLocale: 'zh_TW',
		defaultEncoding: 'UTF-8',
		defaultDateFormat: 'YYYY-MM-DD',
		defaultDateTimeFormat: 'YYYY-MM-DD HH:mm:ss', 
		showQueryCriteriaHeader: true, 
		showQueryResultHeader: false
	},
	ENV: {
		runningCordova: (typeof(cordova) != 'undefined'), 
		isNetworking: function() {
			return true;
		}
	},
	DEVICE: {
		camera: {ready: false},
		network: {ready: false, connection: null}
	},
	CODE: 'spgm',
	data: {
		token: null,
		locale: null,
		notificationToken: null
	},
	user: {
		vender: false, 
		customer: false, 
		organization: true, 
		displayName: 'Jack Lee'
	},
	menu: null, 
	clientMenu: null, 
	authentication: null,
	checkActiveConnection: null, 
	isSupervisor: function() {
		var result = false;
		if ((this.user) && (this.user.role)) {
			var name = this.user.role.name.toUpperCase();
			result = (name == CONSTANT.SECURITY.ROLE.SUPERVISOR) || (name == CONSTANT.SECURITY.ROLE.ADMIN);
		}
		return result;
	}, 
	isOperator: function() {
		var result = false;
		if ((this.user) && (this.user.role)) {
			var name = this.user.role.name.toUpperCase();
			result = (name == CONSTANT.SECURITY.ROLE.OPERATOR) || (name == CONSTANT.SECURITY.ROLE.SUPERVISOR) || (name == CONSTANT.SECURITY.ROLE.ADMIN);
		}
		return result;
	}, 
	isAdministrator: function() {
		var result = false;
		if ((this.user) && (this.user.role)) {
			result = this.user.role.name.toUpperCase() == CONSTANT.SECURITY.ROLE.ADMIN;
		}
		return result;
	},
	loginDialog: null,
};
