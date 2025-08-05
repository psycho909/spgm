// IE 11
if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function (str) {
		return this.indexOf(str) == 0;
	};
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
	Object.keys = (function() {
		'use strict';
		var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !({
			toString : null
		}).propertyIsEnumerable('toString'), dontEnums = [ 'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor' ], dontEnumsLength = dontEnums.length;

		return function(obj) {
			if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [];
			var prop;
			var i;

			for (prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	}());
}

function loadChartDefaults() {
	if (typeof(Chart) != "undefined") {
		Chart.defaults.global.defaultFontFamily = '"微軟正黑體", "Microsoft JhengHei", "新細明體", "PMingLiU", "細明體", "MingLiU", "Trebuchet MS", Helvetica, sans-serif';
		Chart.defaults.global.defaultFontSize = 16;
	}
}

function beautifyNull(text, pattern) {
	return (text ? text : (pattern ? pattern : " "));
}

function formatLabel(time, timeUnit) {
	if (!time) return '';
	var result = '';
	switch (timeUnit) {
	case '5': result = (time.getMonth() + 1) + '/' + time.getDate() + ' ' + time.getHours(); break;
	case '4':
	case '3': result = (time.getMonth() + 1) + '/' + time.getDate(); break;
	case '2':
	case '1': result = time; break;
	}
	return result;
}

function formatDate(date, dateOnly) {
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var theDate = date.getFullYear() + '-' + 
		(month < 10 ? '0' + month : month) + "-" + 
		(day < 10 ? '0' + day : day); 
	if (dateOnly) {
		return theDate;
	}
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	return theDate + ' ' + 
		(hours < 10 ? '0' + hours : hours) + ":" + 
		(minutes < 10 ? '0' + minutes : minutes) + ":" + 
		(seconds < 10 ? '0' + seconds : seconds);
}

function beautifyTime(datetime) {
	if (datetime == null) {
		return '';
	}
	var date = datetime.substring(0, 7);
	var time = datetime.substring(7);
	var result = date.substring(0, 3) + '-' + date.substring(3, 5) + '-' + date.substring(5, 7) + " " + time.substring(0, 2) + ':' + time.substring(2, 4) + ':' + time.substring(4, 6);
	return result;
}

function trim(str) {
	if ((str == undefined) || (str == null)) {
		return "";
	}
	return str.replace(/^\s+|\s+$/g, '');
}

String.prototype.trim = function() {
	var str = this.toString();
	var start = -1,
	end = str.length;
	while (str.charCodeAt(--end) < 33);
	while (str.charCodeAt(++start) < 33);
	return str.slice(start, end + 1);
};

function trimAttribute(json) {
	var jsons = JSON.stringify(json);
	var begin = 0;
	var end = 0;
	while (jsons.indexOf(" \"") >= 0) {
		end = jsons.indexOf(" \"");
		for (var i = (end - 1); i >= 0; i--) {
			if (jsons.charAt(i) != ' ') {
				begin = i;
				break;
			}
		}
		jsons = jsons.substring(0, begin + 1) + jsons.substring(end + 1);
	}
	return JSON.parse(jsons);
}

String.prototype.isEmpty = function() {
	return isEmpty(this.toString());
};

function isEmpty(str) {
	return ((null == str) || ("" == str) || ("null" == str));
};

function padLeft(number, length, pattern) {
	var str = number.toString();
	if (!str.isEmpty()) {
		while (str.length < length) {
			str = pattern + str;
		}
	}
	return str;
}

function padRight(number, length, pattern) {
	var str = number.toString();
	if (!str.isEmpty()) {
		while (str.length < length) {
			str = str + pattern;
		}
	}
	return str;
}

String.prototype.padLeft = function(length, pattern) {
	return padLeft(this, length, pattern);
};

String.prototype.padRight = function(length, pattern) {
	return padRight(this, length, pattern);
};

function removeSpace(text) {
	return text.replace(/\s/g, '').replace(/　/g, '');
}

function formatNumber(number) {
	if ((typeof(number) == "undefined") || (null == number)) return '';
	var n = number.toString().split(".");
	n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return n.join(".");
}

function formatDecimal(number) {
	if (isNaN(number)) return "-";
	else if (number == 0) return "0";
	return formatNumber(roundDecimal(number));
}

function formatTotalizer(number, places) {
	return formatNumber(roundTotalizer(number, places));
}

function formatInstant(number, places) {
	return formatNumber(roundInstant(number, places));
}

function roundInstant(number, places) {
	if ((number == 0) || (isNaN(number))) return 0;
	if (isNaN(places)) places = !isNaN(APPLICATION.systemConfig.instantDecimalPlace) ? APPLICATION.systemConfig.instantDecimalPlace : APPLICATION.SETTING.defaultDecimalPlaces;
	return roundDecimal(number, places);
}

function roundTotalizer(number, places) {
	if ((number == 0) || (isNaN(number))) return 0;
	if (isNaN(places)) places = !isNaN(APPLICATION.systemConfig.totalizerDecimalPlace) ? APPLICATION.systemConfig.totalizerDecimalPlace : APPLICATION.SETTING.defaultDecimalPlaces;
	return roundDecimal(number, places);
}

function roundDecimal(number, places) {
	if ((number == 0) || (isNaN(number))) return 0;
	if (isNaN(places)) places = !isNaN(APPLICATION.systemConfig.displayDecimalPlace) ? APPLICATION.systemConfig.displayDecimalPlace : APPLICATION.SETTING.defaultDecimalPlaces;
	//return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
	return (Math.floor(number * Math.pow(10, places)) / Math.pow(10, places)).toFixed(places);
}

var KB = 1024;
var MB = KB*1024;
var GB = MB*1024;

function formatSize(number) {
	var unit;
	var divider;
	if (number > GB) {
		unit = "GB"; divider = GB;
	}
	else if (number > MB) {
		unit = "MB"; divider = MB;
	}
	else if (number > KB) {
		unit = "KB"; divider = KB;
	}
	else {
		unit = "B"; divider = 1;
	}
	return formatNumber((number/divider).toFixed(1)).replace(/\.0$/, "") + unit;
}

function getUrlParam(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20')) || null;
}

var COOKIE_KEYS = ['authentication', 'systemConfig', 'codeHelper', 'user', 'data', 'menu', 'userConfig', 'communityConfig', 'blacklist'];

function isCookieEnabled() {
	var cookieEnabled = false;
	//if (!APPLICATION.ENV.runningCordova) {
	if ((typeof(cordova) == 'undefined')) {
		cookieEnabled = (navigator.cookieEnabled) ? true : false;
		if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) {
			document.cookie ="testcookie";
			cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
		}
	}
    return cookieEnabled;
}

function saveCookieItem(key, value) {
	var deferred = $.Deferred();
	try {
		if (localforage) {
			localforage.setItem(key, value, function(error, result) {
				deferred.resolve();
			});
		}
		else if (isCookieEnabled()) {
			$.cookie(key, value, {expires: 1, path: '/'});
			deferred.resolve();
		}
	}
	catch (e) {
		console.log('Exception in saveCookieItem: %o', e);
		deferred.reject();
	}
	return deferred.promise();
}

function saveDataCookie() {
	return saveCookieItem('data', APPLICATION.data);
}

function saveMenuCookie() {
	return saveCookieItem('menu', APPLICATION.menu);
}

function saveCommunityConfigCookie() {
	return saveCookieItem('communityConfig', APPLICATION.communityConfig);
}

function saveCookie() {
	var deferred = $.Deferred();
	try {
		var deferreds = [];
		for (var i = 0; i < COOKIE_KEYS.length; i++) {
			if (APPLICATION[COOKIE_KEYS[i]]) deferreds.push(saveCookieItem(COOKIE_KEYS[i], APPLICATION[COOKIE_KEYS[i]]));
		}
		/*
		if (APPLICATION.data) deferreds.push(saveCookieItem('data', APPLICATION.data));
		if (APPLICATION.user) deferreds.push(saveCookieItem('user', APPLICATION.user));
		if (APPLICATION.authentication) deferreds.push(saveCookieItem('authentication', APPLICATION.authentication));
		if (APPLICATION.userConfig) deferreds.push(saveCookieItem('userConfig', APPLICATION.userConfig));
		if (APPLICATION.systemConfig) deferreds.push(saveCookieItem('systemConfig', APPLICATION.systemConfig));
		if (APPLICATION.codeHelper) deferreds.push(saveCookieItem('systemConfig', APPLICATION.codeHelper));
		*/
		$.when.apply($, deferreds).then(function() {
			deferred.resolve();
		});
	}
	catch (e) {
		console.log('Exception in saveCookie: %o', e);
		deferred.reject();
	}
	return deferred.promise();
}

function clearCookie() {
	var deferred = $.Deferred();
	try {
		if (localforage) {
			/*
			localforage.clear().then(function() {
				deferred.resolve();
			});
			*/
			var deferreds = [];
			for (var i = 0; i < COOKIE_KEYS.length; i++) {
				deferreds.push(saveCookieItem(COOKIE_KEYS[i], null));
				console.log(' clearCookie: s%', COOKIE_KEYS[i]);
			}
			$.when.apply($, deferreds).
			done(function() {
				deferred.resolve();
			});
		}
		else if (isCookieEnabled()) {
			for (var i = 0; i < COOKIE_KEYS.length; i++) {
				$.cookie(COOKIE_KEYS[i], null, {expires: 1, path: '/'});
			}
			deferred.resolve();
		}
	}
	catch (e) {
		console.log('Exception in clearCookie: o%', e);
		deferred.resolve();
	}
	return deferred.promise();
}

function loadCookie() {
	var deferred = $.Deferred();
	try {
		if (localforage) {
			localforage.getItems(COOKIE_KEYS, function(error, results) {
				var currentToken = APPLICATION.data.token;
				if (!error) {
					for (var i = 0; i < COOKIE_KEYS.length; i++) {
						if (results[COOKIE_KEYS[i]]) APPLICATION[COOKIE_KEYS[i]] = results[COOKIE_KEYS[i]];
					}
					if (currentToken) APPLICATION.data.token = currentToken;
				}
				deferred.resolve();
			});
		}
		else if (isCookieEnabled()) {
			for (var i = 0; i < COOKIE_KEYS.length; i++) {
				APPLICATION[COOKIE_KEYS[i]] = JSON.parse($.cookie(COOKIE_KEYS[i], {path: '/'}));
			}
			deferred.resolve();
		}
		else {
			deferred.resolve();
		}
	}
	catch (e) {
		console.log('Exception in loadCookie: %o', e);
		deferred.reject();
	}
	return deferred.promise();
}

if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

function checkTicket(forced) {
	if ((APPLICATION.authentication) && (APPLICATION.authentication.ticket)) {
		var deferred = $.Deferred();
		$.post(URLS.AUTHENTICATE.CHECK, {'ticket': APPLICATION.authentication.ticket})
		.done(function(json) {
			deferred.resolve(json);
		})
		.fail(function(jqXHR, status, errorThrown) {
			console.log(errorThrown);
			deferred.resolve(null);
		});
		return deferred.promise();
	}
	return true;
}

function loadTocken(forced) {
	var deferred = $.Deferred();
	$.ajax({
		type: 'GET',
		global: true, 
		url: (!forced) ? URLS.AUTHENTICATE.TICKET : URLS.AUTHENTICATE.HOST_TICKET, 
		success: function(data, textStatus, jqXHR) {
			var json = data;
			if (json.OK) {
				APPLICATION.data.headerName = jqXHR.getResponseHeader(CONSTANT.SECURITY.HEADER.NAME);
				APPLICATION.data.token = jqXHR.getResponseHeader(CONSTANT.SECURITY.HEADER.TOKEN);
				if (localforage) {
					localforage.getItem('data', function(error, result) {
						if (result) {
							result.token = APPLICATION.data.token;
							result.headerName = APPLICATION.data.headerName;
							localforage.setItem('data', result);
						}
						else {
							localforage.setItem('data', APPLICATION.data);
						}
					});
					$(document).ajaxSend(function(e, jqXHR, options) {
						jqXHR.setRequestHeader(CONSTANT.SECURITY.HEADER.NAME, APPLICATION.data.headerName);
						jqXHR.setRequestHeader(CONSTANT.SECURITY.HEADER.TOKEN, APPLICATION.data.token);
					});
					$(document).ajaxSuccess(function(e, request, options) {
						var token = jqXHR.getResponseHeader(CONSTANT.SECURITY.HEADER.TOKEN);
						if ((token) && (token != APPLICATION.data.token)) {
							APPLICATION.data.headerName = jqXHR.getResponseHeader(CONSTANT.SECURITY.HEADER.NAME);
							APPLICATION.data.token = token;
							//console.log('Got Updated Tocken:', APPLICATION.data.token);
						}
					});	
				}
				else if (isCookieEnabled()) {
					saveCookieItem('data', APPLICATION.data);
					$(document).ajaxSend(function(e, jqXHR, options) {
						jqXHR.setRequestHeader(CONSTANT.SECURITY.HEADER.NAME, APPLICATION.data.headerName);
						jqXHR.setRequestHeader(CONSTANT.SECURITY.HEADER.TOKEN, APPLICATION.data.token);
						//console.log('jqXHR.setRequestHeader: ', $.cookie('token'));
					});			
				}
			}
			deferred.resolve();
		},
		fail: function(jqXHR, textStatus, errorThrown) {
			console.log('Failed when checkTicket(): %o', errorThrown);
			deferred.resolve();
		}
	});
	return deferred.promise();
}
/*
function ajaxJsonAndHeader(httpMethod, url, parameters, tableName, successHandler, errorHandler) {
	if ((arguments) && (arguments.length > 3)) {
		if (typeof tableName === "function") {
			return ajaxJson(httpMethod, url, parameters, tableName, successHandler);
		}
		else if (typeof tableName === "string") {
			return ajaxJson(httpMethod, url, parameters, successHandler, errorHandler);
		}
	}
	else {
		return ajaxJson(httpMethod, url, parameters);
	}
}

function ajaxPostJsonAndHeader(url, parameters, tableName, successHandler, errorHandler) {
	return ajaxJsonAndHeader('POST', url, parameters, tableName, successHandler, errorHandler);
}

function ajaxGetJsonAndHeader(url, parameters, tableName, successHandler, errorHandler) {
	return ajaxJsonAndHeader('GET', url, parameters, tableName, successHandler, errorHandler);
}
*/
function ajaxJson(httpMethod, url, parameters, successHandler, errorHandler) {
	var calling = $.ajax({
		global: true,
		type: httpMethod,
		contentType: 'application/json; charset=utf-8',
		mimeType: 'application/json; charset=utf-8',
		url: url,
		async: true,
		timeout: 15 * 1000, 
		dataType: 'json',
		data: ((null != parameters) ? (httpMethod == 'POST' ?  JSON.stringify(parameters) : parameters) : {})
	});
	calling.
	done(function(response, textStatus, jqXHR) {
		if ((successHandler) && (typeof(successHandler) === CONSTANT.TYPE.FUNCTION)) {
			successHandler(response);
		}
	}).
	fail(function(jqXHR, status, errorThrown) {
		if ((jqXHR) && (jqXHR.responseJSON) && (jqXHR.responseJSON.status) && (jqXHR.responseJSON.status == '403')) {
			if (window.location != URLS.LOGIN) {
				$.when(loadTocken()).
				then(loadCookie).
				then(loadConfig).
				done(function() {
					$.when(checkTicket())
					.done(function(json) {
						var dialogContainerId = 'login_dialog_modal_container';
						if (!$('#' + dialogContainerId).length) $('body').append('<div id="{0}"></div>'.format(dialogContainerId));
						$('#' + dialogContainerId).load(URLS.LOGIN_MODAL, function() {
							APPLICATION.loginDialog.initial();
							APPLICATION.loginDialog.show();
						});
					})
				});
			}
		}
		else if ((errorHandler) && (typeof(errorHandler) === CONSTANT.TYPE.FUNCTION)) {
			errorHandler(jqXHR, status, errorThrown);
		}
	});
	return calling;
}

function ajaxGetJson(url, parameters, successHandler, errorHandler) {
	return ajaxJson('GET', url, parameters, successHandler, errorHandler);
}

function ajaxPostJson(url, parameters, successHandler, errorHandler) {
	return ajaxJson('POST', url, parameters, successHandler, errorHandler);
}

function ajaxPut(url, parameters, successHandler, errorHandler) {
	return ajaxJson('PUT', url, parameters, successHandler, errorHandler);
}

function ajaxDelete(url, parameters, successHandler, errorHandler) {
	return ajaxJson('DELETE', url, parameters, successHandler, errorHandler);
}

function ajaxGet(url, parameters, successHandler, errorHandler) {
	return ajaxJson('GET', url, parameters, successHandler, errorHandler);
}

function ajaxPost(url, parameters, successHandler, errorHandler) {
	return ajaxJson('POST', url, parameters, successHandler, errorHandler);
}

var REGULAR_CODE_FIELDS = ['no', 'description'];

/**
 * Check date object is valid.
 * @param date - Date Object 
 * @returns {Boolean}
 */
function isValidDate(date) {
	var result = false;
	if (Object.prototype.toString.call(date) === "[object Date]") {
		if (!isNaN(date.getTime())) {
			result = true;
		}
	}
	return result;
}

/**
 * 在 Json Object Array 中, 尋找符合指定屬性值的物件, 然後傳回指定屬性值 
 * @param searchValue 要尋找的值
 * @param searchList  要尋找的 Array
 * @param searchValueField 比對的屬性
 * @param returnValueField 傳回的屬性
 * @returns 屬性值, 找不到時傳回 null
 */
function getValueFromList(searchValue, searchList, searchValueField, returnValueField) {
	var value = null;
	if (searchList) {
		try {
			for (var i = 0; i < searchList.length; i++) {
				if (searchValue == searchList[i][searchValueField]) {
					if (returnValueField) value = searchList[i][returnValueField];
					else value = searchList[i];
					break;
				}
			}
		}
		catch (e) {
			console.log('Exception in getValueFromList("{0}",...)'.format(searchValue));
		}
	}
	return value;
}

/**
 * 清除 Form Element 值 
 * @param form 表單 jQuery Object, ex: $('#formid')
 */

function reset(form) {
	$('input[type="hidden"]', form).not('[name="action"]').val('');
	$('input[type="text"]', form).val('');
	$('input[type="radio"]:checked', form).prop('checked', false);
	$('input[type="checkbox"]:checked', form).prop('checked', false);
	$('select', form).val('');
	$('textarea', form).val('');	
}

/**
 * 檢查 selector 所屬表單的 action 的值
 * @param selector
 * @returns String: AUDI
 */
function checkAction(selector) {
	var action = null;
	if (typeof selector == "string") {
		selector = $(selector);
	}
	if (selector.is('form')) {
		action = $('#action', selector).val();
	}
	else {
		var parentForm = selector.closest("form");
		if ((parentForm) && (parentForm.length > 0)) {
			action = $('#action', parentForm).val();
		}
	}
	return action;
}; 

function isEditting(selector) {
	var action = checkAction(selector);
	return (action == CONSTANT.ACTION.ADD || action == CONSTANT.ACTION.UPDATE || action == CONSTANT.ACTION.IMPORT);
}

/**
 * 複製物件屬性, 只複製目標物件有的屬性
 * @param target 目標物件
 * @param source 來源物件
 * @param excludeProperty String[], ex: ['id', 'families']
 * @returns
 */
function copyProperty(target, source, excludeProperty) {
	for (var prop in source) {
	    if (((!excludeProperty) || (excludeProperty.indexOf(prop) < 0)) && (target.hasOwnProperty(prop))) {
	    	target[prop] = source[prop];
	    }
	}
	return target;
}

function isApp() {
	return ((document.URL.indexOf('http://') === -1) && (document.URL.indexOf('https://') === -1));
}

function sortBy(arg, sel, elem, order) {
	var $selector = $(sel);
	var $element = $selector.children(elem);
	$element.sort(function(a, b) {
		var an = a.getAttribute(arg);
		var bn = b.getAttribute(arg);
		if (order == 'asc') {
			if (an > bn)
				return 1;
			if (an < bn)
				return -1;
		} else if (order == 'desc') {
			if (an < bn)
				return 1;
			if (an > bn)
				return -1;
		}
		return 0;
	});
	$element.detach().appendTo($selector);
}

function hasValidRole(action) {
	var valid = false;
	if ((action) && (APPLICATION.user)) {
		for (var i = 0; i < action.roles.length; i++) {
			/*
			if (action.roles[i].name.toUpperCase() == APPLICATION.user.role.name.toUpperCase()) {
				valid = true;
				break;
			}
			*/
			for (var j = 0; j < APPLICATION.user.roles.length; j++) {
				if (action.roles[i].name.toUpperCase() == APPLICATION.user.roles[j].name.toUpperCase()) {
					valid = true;
					break;
				}
			}
			if (valid) break;
		}
	}
	return valid;
}

//function loadHeaderSidebar(noControlSidebar) {
function loadHeaderSidebar(navbarOption) {
	if ($('#header_sidebar_wrapper').length == 0) {
		return true;
	}
	
	var option = {
		sidebar: true,
		controlSidebar: true,
		notification: true,
		announcement: true,
		reloadPage: true,
		controlSidebar: true,
		userInfo: true, 
		loadSideMenuCallback: null
	};
	
	if (navbarOption) {
		option = $.extend(option, navbarOption);
	}
	
	var deferred = $.Deferred();
	try {
		$.when($.get(option.sidebar ? URLS.HEADER_SIDEBAR : URLS.HEADER)).
		done(function(text) {
			$('#header_sidebar_wrapper').append(text);
			if ($.i18n) {
				$('#menu_header').text($.i18n.prop('index.menu.header'));
			}

			loadTitleAndFooter();
			
			if (option.sidebar) {
				$.when(loadSideMenu())
				.done(() => {
					if (typeof loadSideMenuCallback == CONSTANT.TYPE.FUNCTION) loadSideMenuCallback();
					else if (typeof option.loadSideMenuCallback == CONSTANT.TYPE.FUNCTION) option.loadSideMenuCallback();
				});
			}

			if (option.controlSidebar) {
				$('#control_sidebar').load(URLS.CONTROL_SIDEBAR, () => APPLICATION.controlSidebar.initial());
			}

			$('#main_header, #sidebar_container').on('click', 'a.nav-link', (e) => {
				if (e) e.preventDefault();
				var href = $(this).attr('href');
				if (!href) href = $(e.target).closest('.nav-link').attr('href');
				if (href) {
					if (href.indexOf('logout') >= 0) {
						if (APPLICATION.authentication) {
							$.when(clearCookie())
							.done(function() {
								ajaxPost(URLS.AUTHENTICATE.LOGOUT, null)
								.always(function() {
									window.location = URLS.LOGIN;
								});
							});
						}
						else {
							window.location = URLS.LOGIN;
						}
					}
					else if (href.indexOf('.html') > 0) transitionToPage(href);
				}
			});
			
			$('#nav_home_link').prop("title", $.i18n.prop('terms.home'));
			//$('#nav_announcement_link').prop("title", $.i18n.prop('terms.announcement'));
			
			if (option.notification) {
				$('#nav_notification_link').prop("title", $.i18n.prop('terms.notification'));
				$('#nav_notification').removeClass('d-none');
			}
			
			if (option.reloadPage) {
				$('#nav_reload_page_link').prop("title", $.i18n.prop('operation.refresh'));
				$('#nav_reload_page').removeClass('d-none');
			}
			
			$('#nav_logout_link').prop("title", $.i18n.prop('operation.logout'));
			
			if (option.userInfo) {
				$('#nav_user_link').prop("title", $.i18n.prop('terms.user.info'));
				$('#nav_user').removeClass('d-none');
			}
			
			$('[data-toggle="tooltip"]').tooltip({delay: {"show": 500, "hide": 100}});
			
			/*
			$('#nav_announcement_link').attr('href', URLS.ANNOUNCEMENT.PAGE);
			$('#nav_meter_event_link').attr('href', URLS.EVENT.EFFECTIVE_PAGE + '?tab=1');
			$('#nav_transmitter_event_link').attr('href', URLS.EVENT.EFFECTIVE_PAGE + '?tab=2');
			*/
			/*
			if ((APPLICATION.userConfig) && (APPLICATION.userConfig.externalLinkUrl)) {
				$('#nav_external_link_container_link').attr('href', APPLICATION.userConfig.externalLinkUrl);
				$('#nav_external_link_container_link span').text(APPLICATION.userConfig.externalLinkText);
				$('#nav_external_link_container_link').css('display', 'block');
				$('#nav_external_link_container_link').on('click', null, function(e) {
					window.open($(this).attr('href'));
				});
			}
			*/
			/*
			if ($.AdminLTE) {
				$.AdminLTE.layout.fix();
				$.AdminLTE.controlSidebar.activate();
			}
			*/
				
			/*
			$('#nav_logout_link').on('click', function(e) {
				e.preventDefault();
				if (APPLICATION.authentication) {
					$.when($.post(URLS.AUTHENTICATE.LOGOUT, {'ticket': APPLICATION.authentication.ticket}))
					.then(clearCookie)
					.always(function() {
						window.location = URLS.LOGIN;
					});
				}
				else {
					window.location = URLS.LOGIN;
				}
			});
			*/
			
			//
			$('#nav_reload_page_link').on('click', (e) => {
				e.preventDefault();
				location.reload(); 
			});
			
			$('#nav_user_link').on('click', (e) => {
				e.preventDefault();
				$('#nav_user_link').tooltip('hide');
			});

			ajaxGet(URLS.NOTIFICATION.COUNT_READING + APPLICATION.user.id, null)
			.done((count) => $('#nav_notification_count').text((count) ? count : 0));
			
			/*
			//announcement count
			ajaxPostJson(URLS.ANNOUNCEMENT.COUNT, null)
				.done(function(json) {
					var element = $('#nav_announcement_count');
					if (json && json > 0) {
						element.text(json);
						element.removeClass('badge-info').addClass('badge-danger');
					} else {
						element.text(0);
						element.removeClass('badge-danger').addClass('badge-info');
					}
				})
				.fail(function(errorThrown) {
					console.log("errorThrown %o", errorThrown);
				});
			//
			*/
			$('#navbar_menu .dropdown').on('mouseenter mouseleave click tap', () => $(this).toggleClass("open"));
		});
		deferred.resolve();
	}
	catch (e) {
		console.log(e);
		deferred.resolve();
	}
	return deferred.promise();
}

function buildSideMenu(menu) {
	var url;
	var html = '';
	var subHtml;
	if (menu.subMenus) {
		subHtml = '';
		for (var j = 0; j < menu.subMenus.length; j++) {
			if (menu.subMenus[j].subMenus) {
				subHtml += buildSideMenu(menu.subMenus[j]);
			}
			else {
				//if (hasValidRole(menu.subMenus[j].action)) {
					url = (menu.subMenus[j].action) ? URLS.CONTENT.ROOT + menu.subMenus[j].action.url : null;
					subHtml += ('<li class="nav-item"><a class="nav-link" href="{0}">{2}<p menu_item_no="{2}" id="{3}">&nbsp;{4}</p></a></li>'.format(
							(url) ? url : '#', 
							menu.subMenus[j].classes, 
							menu.subMenus[j].no, 
							menu.subMenus[j].code.replace(/\./g,"_"), 
							i18nText(menu.subMenus[j], 'description', language)));
				//}
			}
		}
		if (subHtml) {
			html += ('<li class="nav-item has-treeview" menu_no="{1}"><a class="nav-link" href="#"><i class="{0}"></i>&nbsp;<p menu_no="{1}" id="{2}"><span class="bg-light font-weight-bold px-1">{1}</span> {3}<i class="right fas fa-angle-left"></i></p></a>'
				.format(menu.classes, menu.no, menu.code.replace(/\./g,"_"), i18nText(menu, 'description', language)));
			html += ('<ul class="nav nav-treeview">' + subHtml + '</ul></li>');
		}
	}
	else {
		if (menu.action) {
			url = URLS.CONTENT.ROOT + menu.action.url;
			html += '<li class="nav-item"><a class="nav-link" href="{0}"><i class="nav-icon"></i><p menu_item_no="{2}" id="{3}">{4}</p></a></li>'.format(
					(url) ? url : '#', 
					menu.classes, 
					menu.no, 
					menu.code.replace(/\./g,"_"),
					i18nText(menu, 'description', language)
				);
		}
	}
	return html;
}

function getMenuItems(forced) {
	var deferred = $.Deferred();
	if ((!forced) && (APPLICATION.menu) && (APPLICATION.menu.html)) {
		deferred.resolve(APPLICATION.menu.html);
	}
	else {
		ajaxGet(URLS.MENU.MANAGEMENT_TREE, null)
		.done(function(menus) {
			var html = '';
			if (menus) {
				for (var i = 0; i < menus.length; i++) {
					if ((!menus[i].action) || (hasValidRole(menus[i].action))) {
						html += buildSideMenu(menus[i]);
					}
				}
			}
			if (html) APPLICATION.menu = {'html' : html};
			$.when(saveMenuCookie())
			.done(function() {
				deferred.resolve(html);
			});
		})
		.fail(function() {
			console.log('*** Load Menu Error! ***');
			deferred.resolve(null);
		});
	}
	
	return deferred.promise();
}

function loadSideMenu() {
	var deferred = $.Deferred();

	if (APPLICATION.user.vender) $('.main-sidebar a').attr("href", URLS.HOME_VENDER);
	else if (APPLICATION.user.customer) $('.main-sidebar a').attr("href", URLS.HOME_CUSTOMER);
	else if (APPLICATION.user.organization) $('.main-sidebar a').attr("href", URLS.HOME);
	
	$.when(getMenuItems())
	.done(function(html) {
		if (html) {
			$('#sidebar_menu').append(html);
			$('#sidebar_menu li a i.fa').addClass('fa-lg');
			var trees = $('[data-widget="treeview"]');
			if (trees) trees.Treeview('init');
			var activeItem = $('#sidebar_menu a.nav-link[href^="{0}"]'.format(window.location));
			if (activeItem.length > 0) {
				activeItem.addClass('active');
				$('.nav-link:first', activeItem.closest('.has-treeview')).trigger('click');
			}
		}
		deferred.resolve();
	});
	return deferred.promise();
}

function loadSideMenuI18n() {
}

function getDateRange() {
	var dateRange = {};
	dateRange[$.i18n.prop('daterange.today')] = [moment(), moment()];
	dateRange[$.i18n.prop('daterange.yesterday')] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
	dateRange[$.i18n.prop('daterange.last7days')] = [moment().subtract(6, 'days'), moment()];
	dateRange[$.i18n.prop('daterange.last30days')] = [moment().subtract(29, 'days'), moment()];
	dateRange[$.i18n.prop('daterange.this_month')] = [moment().startOf('month'), moment().endOf('month')];
	dateRange[$.i18n.prop('daterange.last_month')] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];
	return dateRange;
}

function randomColorFactor() {
	return Math.round(Math.random() * 255);
}

function randomColor(opacity) {
	return 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',' + (opacity || '.3') + ')';
}

function getConfig(forced) {
	var deferred = $.Deferred();
	if ((forced) || (!APPLICATION.systemConfig) || (!APPLICATION.codeHelper)) {
		$.when(
			ajaxGet(URLS.SETTING.APPLICATION_CONFIG, null, function(systemConfig) {
				APPLICATION.systemConfig = systemConfig;
			}),
			ajaxGet(URLS.CODE.HELPER, null, function(codeHelper) {
				APPLICATION.codeHelper = codeHelper;
			}) 
		).
		done(function() {
			saveCookieItem('systemConfig', APPLICATION.systemConfig);
			saveCookieItem('codeHelper', APPLICATION.codeHelper);
			deferred.resolve();
		}).
		fail(function(jqXHR, status, errorThrown) {
			deferred.resolve();
		});
	}
	else {
		deferred.resolve();
	}
	return deferred.promise();
}

function getUserConfig(forced) {
	return true;
	/*
	var deferred = $.Deferred();
	if ((!forced) && ((APPLICATION.userConfig) || (!APPLICATION.data.activeCustomerId))) {
		deferred.resolve();
	}
	else {
		$.when(
	    	ajaxGetJson(URLS.CUSTOMER.CONFIG + APPLICATION.data.activeCustomerId, null, function(json) {
	    		APPLICATION.userConfig = json;
	    	})
	    ).
		done(function() {
			if (!APPLICATION.data.locale) {
				$.when(saveCookieItem('userConfig', APPLICATION.userConfig)).
				done(function() {
					deferred.resolve();
				});
			}
			else {
				deferred.resolve();
			}
		}).
		fail(function(jqXHR, status, errorThrown) {
			deferred.resolve();
		});
	}
	return deferred.promise();
	*/
}

function randomColor(opacity) {
	return 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',' + (opacity || '.3') + ')';
}

function setUserLocale() {
	if (APPLICATION.data.locale) return; 
	if ((APPLICATION.user) && (APPLICATION.user.locale)) APPLICATION.data.locale = APPLICATION.user.locale;
	else if (APPLICATION.systemConfig && APPLICATION.systemConfig.defaultLocale) APPLICATION.data.locale = APPLICATION.systemConfig.defaultLocale;
	else APPLICATION.data.locale = APPLICATION.SETTING.defaultLocale;
}

function loadConfig(forced) {
	var deferred = $.Deferred();
	if (localforage) {
		if ((forced) || (!APPLICATION.systemConfig)) {
			$.when(getConfig(forced), getUserConfig(forced)).
			done(function() {
				setUserLocale();
				deferred.resolve();
			});
		}
		/*
		else if (!APPLICATION.userConfig) {
			$.when(getUserConfig()).
			done(function() {
				setUserLocale();
				deferred.resolve();
			});
		}
		*/
		else {
			deferred.resolve();
		}
		/*		
		$.when(getConfig(forced)).
		done(function() {
			deferred.resolve();
		});
		*/
	}
	else if (isCookieEnabled()) {
		var userConfig = $.cookie('userConfig', {path: '/'});
		var systemConfig = $.cookie('systemConfig', {path: '/'});
		var codeHelper = $.cookie('codeHelper', {path: '/'});
		if (userConfig) APPLICATION.userConfig = JSON.parse(userConfig);
		if (systemConfig) APPLICATION.systemConfig = JSON.parse(systemConfig);
		if (codeHelper) APPLICATION.codeHelper = JSON.parse(codeHelper);
		
		if ((APPLICATION.user) && (APPLICATION.user.locale)) APPLICATION.data.locale = APPLICATION.user.locale;
		else if (APPLICATION.systemConfig && APPLICATION.systemConfig.defaultLocale) APPLICATION.data.locale = APPLICATION.systemConfig.defaultLocale;
		else APPLICATION.data.locale = APPLICATION.SETTING.defaultLocale;
		
		deferred.resolve();
	}
	return deferred.promise();
}

function loadTitleAndFooter() {
	$('footer #version_number').text(APPLICATION.systemConfig.applicationVersion);
	$('footer #copyright_year').text(APPLICATION.systemConfig.copyrightYear);
	
	var companyName, documentTitle, applicationTitle, applicationAlias, url;
	if (APPLICATION.systemConfig.locales) documentTitle = APPLICATION.systemConfig.locales[APPLICATION.user.locale ? APPLICATION.user.locale : APPLICATION.defaultLocale].DOCUMENT_TITLE + '-' + APPLICATION.documentTitle;
	else if (APPLICATION.documentTitle) documentTitle = APPLICATION.CODE.toUpperCase() + '-' + APPLICATION.documentTitle;
	if ((APPLICATION.userConfig) && (APPLICATION.user)) {
		//documentTitle = (APPLICATION.userConfig.documentTitle ? APPLICATION.userConfig.documentTitle : APPLICATION.systemConfig.locales[APPLICATION.user.locale].DOCUMENT_TITLE); // + '-' + $.i18n.prop('index.document.title');
		if (!APPLICATION.documentTitle) documentTitle = (APPLICATION.userConfig.documentTitle ? APPLICATION.userConfig.documentTitle : APPLICATION.systemConfig.locales[APPLICATION.user.locale].DOCUMENT_TITLE);
		companyName = APPLICATION.userConfig.companyName ? APPLICATION.userConfig.companyName : APPLICATION.systemConfig.locales[APPLICATION.user.locale].COMPANY_NAME;
		url = APPLICATION.userConfig.companyHomeUrl ? APPLICATION.userConfig.companyHomeUrl : APPLICATION.systemConfig.companyHomeUrl;
		applicationTitle = APPLICATION.userConfig.applicationTitle ? APPLICATION.userConfig.applicationTitle : APPLICATION.systemConfig.locales[APPLICATION.user.locale].APPLICATION_TITLE;
		applicationAlias = APPLICATION.userConfig.applicationAlias ? APPLICATION.userConfig.applicationAlias : APPLICATION.systemConfig.locales[APPLICATION.user.locale].APPLICATION_ALIAS;
	}
	else {
		var locale = ((APPLICATION.user) && (APPLICATION.user.locale)) ? APPLICATION.user.locale : APPLICATION.systemConfig.defaultLocale;
		if (!APPLICATION.documentTitle) documentTitle = APPLICATION.systemConfig.locales[locale].DOCUMENT_TITLE;
		url = APPLICATION.systemConfig.companyHomeUrl;
		companyName = APPLICATION.systemConfig.locales[locale].COMPANY_NAME;
		applicationTitle = APPLICATION.systemConfig.locales[locale].APPLICATION_TITLE;
		applicationAlias = APPLICATION.systemConfig.locales[locale].APPLICATION_ALIAS;
	}
	
	document.title = documentTitle;
	if (APPLICATION.data.selectedCommunity) $('#header_community_name').text(APPLICATION.data.selectedCommunity.name);
	$('#header_application_name').text(applicationAlias);
	//$('#application_title').html(applicationAlias);
	$('footer #company_name').html(companyName);
	$('footer #company_home_url').prop('href', url);
	//$('#application_title_short').html(applicationAlias);
	$('#company_home_url').click(function(e) {
		e.preventDefault();
		window.open($(this).prop('href'));
	});
	$('footer #version_label').html($.i18n.prop('index.version'));
	$('footer #copyright').text($.i18n.prop('index.copyright'));
	$('footer #copyright_declaration').text($.i18n.prop('index.copyright.declaration'));
	//
	$('body').prepend('<a href="#" class="back-to-top"><i class="fa fa-chevron-circle-up"></></a>');
	if (!amountScrolled) var amountScrolled = 200;
	//
	$(window).scroll(function() {
		if ( $(window).scrollTop() > amountScrolled ) {
			$('a.back-to-top').fadeIn('slow');
		} else {
			$('a.back-to-top').fadeOut('slow');
		}
	});
	//
	$('a.back-to-top, a.simple-back-to-top').click(function(e) {
		e.preventDefault();
		$('html, body').animate({
			scrollTop: 0
		}, 500);
		return false;
	});
}

function getMapApiUrl() {
	return 'https://maps.googleapis.com/maps/api/js?v=3&key={0}&language={1}&region={2}'.format(
			APPLICATION.systemConfig.mapApiKey, 
			APPLICATION.systemConfig.mapApiLanguage, 
			APPLICATION.systemConfig.mapApiRegion 
		);
}

function getPageLocale() {
	var locale = getUrlParam('lang');
	if (!locale) {
		if (APPLICATION.data && APPLICATION.data.locale) locale = APPLICATION.data.locale;
		else if (APPLICATION.user && APPLICATION.user.locale) locale = APPLICATION.user.locale;
		else if (APPLICATION.systemConfig && APPLICATION.systemConfig.defaultLocale) locale = APPLICATION.systemConfig.defaultLocale;
		else locale = APPLICATION.SETTING.defaultLocale;
	}
	return locale;
}

function getDataTableTranslation(locale) {
	var fileName;
	switch (locale) {
	case 'en_US': fileName = 'English'; break;
	case 'zh_CN': fileName = 'Chinese'; break;
	case 'zh_TW': fileName = 'Chinese-traditional'; break;
	case 'in_ID': fileName = 'Indonesian'; break;
	case 'ja_JP': fileName = 'Japanese'; break;
	case 'ms_MY': fileName = 'Malay'; break;
	case 'ph_PH': fileName = 'Filipino'; break;
	case 'th_TH': fileName = 'Thai'; break;
	case 'vi_VN': fileName = 'Vietnamese'; break;
	default: fileName = 'English';
	}
	return URLS.SCRIPT + '/lib/bootstrap-datatables/extensions/i18n/' + fileName + '.js';
}

function getValidatorTranslation(locale) {
	var fileName;
	switch (locale) {
	case 'zh_TW':
		fileName = locale; break;
	case 'zh_CN':
		fileName = 'zh'; break;
	case 'vi_VN': 
		fileName = 'vi'; break;
	default: 
		fileName = null;
	}
	if (!fileName) return null;
	else return URLS.SCRIPT + '/lib/jquery.validation/localization/messages_' + fileName + '.js';
}

function getDatePickerTranslation(locale) {
	if ((!locale) || (locale.startsWith('en'))) {
		return '';
	}
	var fileName;
	var country = locale.substring(0, 2);
	switch (country) {
	case 'zh':
	case 'pt':
	case 'rs':
		fileName = locale.replace('_', '-'); break;
	default:
		fileName = country; break;
	}
	return URLS.SCRIPT + '/lib/bootstrap-datepicker/locales/bootstrap-datepicker.' + fileName + '.min.js';
}

function getCalendarTranslation(dashedLocale) {
	if ((!dashedLocale) || (dashedLocale.startsWith('en'))) {
		return '';
	}
	var fileName = dashedLocale.toLowerCase();
	return URLS.SCRIPT + '/lib/fullcalendar/locale/' + fileName + '.js';
}

function getYearCalendarTranslation(countryCode) {
	if ((!countryCode) || (countryCode.startsWith('en'))) {
		return '';
	}
	switch (countryCode) {
	case 'zh_TW':
	case 'zh_TW':
		fileName = countryCode;
		break;
		
	default:
		fileName = countryCode.substring(0, 2);
	}
	return URLS.SCRIPT + '/lib/bootstrap-year-calendar/js/languages/bootstrap-year-calendar.' + fileName + '.js';
}

function getFileInputTranslation(locale) {
	var fileName = null;
	switch (locale) {
	case 'zh_CN':
		fileName = 'zh'; break;
	case 'zh_TW':
		fileName = 'zh-TW'; break;
	case 'id_ID':
		fileName = 'id'; break;
	case 'ja_JP':
		fileName = 'ja'; break;
	}
	if (fileName) return URLS.SCRIPT + '/lib/bootstrap-fileinput/js/locales/' + fileName + '.js';
	else return null;
}

function showDialog(dialogType, headerText, messageText, closeButtonText) {
	var dialog = $('#dialog');
	$('#dialog_header_text', dialog).text(headerText ? headerText: $.i18n.prop('operation.waiting'));
	var iconClass;
	switch (dialogType) {
	case 0:
		iconClass = 'fa-info-circle text-danger';
		break;
	case 1:
		iconClass = 'fa-refresh fa-spin text-info';
		break;
	}
	$('#dialog_message_icon', dialog).addClass(iconClass);
	$('#dialog_message_text', dialog).html(messageText ? messageText: $.i18n.prop('operation.saving'));
	$('#dialog_close_button', dialog).text(closeButtonText ? closeButtonText : $.i18n.prop('operation.close'));
	
	dialog.modal({backdrop: 'static', keyboard: false})
    .one('click', '#dialog_close_button', function (e) {
    	dialog.modal('hide');
		$('#dialog_message_icon', dialog).removeClass(iconClass);
    });
	
	dialog.modal('show');
	return dialog;
}

/*
$.getScript = function(url, callback, charset) {
	//return true;
	if (!charset) charset = APPLICATION.SETTING.defaultEncoding;
	return $.ajax({
		url : url,
		dataType : "script",
		scriptCharset : charset, 
		//callback: callback
		success : function() {
			if (callback) callback();
		}
	});
}
*/

function focusNext(element, nextTimes) {
	if (!element) return;
	if (!nextTimes) nextTimes = 1;
	$(':input:eq(' + ($(':input').index(element) + nextTimes) + ')').focus();
}

function buildDatePicker(selector, value, language) {
	$(selector).datepicker({
		autoclose: true,
		language: language, 
		format: 'yyyy-mm-dd',
		weekStart: 1
	});
	//if (value) $(selector).data({'date': value}).datepicker('update').children("input").val(value);
	if (value) $(selector).datepicker('update', value);
}

function i18nText(entity, propertyName, language) {
	if (entity.hasOwnProperty(propertyName + '_' + language) && (!isEmpty(entity[propertyName + '_' + language])))
		return entity[propertyName + '_' + language];
	else if (entity.hasOwnProperty(propertyName))
		return entity[propertyName];
	else
		return '';
}

if (typeof JSON.clone !== "function") {
	JSON.clone = function(obj) {
		return JSON.parse(JSON.stringify(obj));
	};
}

function combineMessage(language, message1, message2, message3, message4, message5) {
	var space = language.toLowerCase().startsWith("zh") ? "" : " ";
	var result = '';
	if (message1) result += message1;
	if (message2) result += (space + message2);
	if (message3) result += (space + message3);
	if (message4) result += (space + message4);
	if (message5) result += (space + message5);
	return result;
}

function i18nCombine(language, message1, message2, message3, message4, message5) {
	var space = language.toLowerCase().startsWith("zh") ? "" : " ";
	var result = '';
	if (message1) result += ($.i18n.prop(message1));
	if (message2) result += ($.i18n.prop(message2));
	if (message3) result += ($.i18n.prop(message3));
	if (message4) result += ($.i18n.prop(message4));
	if (message5) result += ($.i18n.prop(message5));
	return result;
}

function encodeForTransfer(original) {
	/*
	if (!aesjs || !APPLICATION.systemConfig.commonKey) return null;
	var bytes = aesjs.utils.utf8.toBytes(original);
	var aesCtr = new aesjs.ModeOfOperation.ctr(APPLICATION.systemConfig.commonKey);
	return aesCtr.encrypt(bytes);
	*/
	if (!$.base64) return original;
	return $.base64.encode(original);
}

function showLoginDialog() {
	if ($('#modal_login_form').length == 0) {
		var loading = $.get(URLS.LOGIN_MODAL);
		$.when(loading)
		.done(function(text) {
			$('body').append(text);
			$.when(APPLICATION.loginDialog.initial())
			.done(APPLICATION.loginDialog.show());
		});
	}
	else {
		APPLICATION.loginDialog.show();
	}
}
/*
if (!APPLICATION.ENV.runningCordova) {
	if (window.location.href.indexOf(URLS.LOGIN) < 0) {
		setInterval(
			function() {
				$.when(checkTicket())
				.done(function(authenticated) {
					if (!authenticated) showLoginDialog();
				})
				.fail(function(jqXHR, status, error) {
					if (jqXHR.status == 403) showLoginDialog();
			    });
			}, 
			1 * 60 * 1000
		);
	}
}

$.ajaxSetup({
	cache: false,
	complete: function(xhr, status) {
		if ((xhr.responseText == '901') || (xhr.responseText == '902')) {
			$.get(URLS.LOGIN_MODAL, function(text) {
				$('body').append(text);
				loginDialog.show();
			});
        }
    }
});
*/

function configTableHeight(tableElement, hasPagination, clearHeader) {
	configTableHeight(tableElement, false, hasPagination, clearHeader)
}

function configTableHeight(tableElement, hasSearch, hasPagination, clearHeader) {
	var windowHeight = $(window).height();
	var bottomBlank = 30;
	var tableContainer = tableElement.closest('div');
	var rowContainer = tableContainer.closest('.row');
	//var availableHeight = Math.ceil(windowHeight - $('#main_header').outerHeight() - footerHeight - tableElement.outerHeight() - bottomBlank) - 30;
	//var availableHeight = Math.ceil(windowHeight - $('.main-header').outerHeight() - $('.main-footer').outerHeight() - tableElement.outerHeight() - bottomBlank - 30);
	var availableHeight = Math.ceil(windowHeight - $('.main-header').outerHeight() - $('.content-header').outerHeight() - tableElement.outerHeight() - bottomBlank);
	
	/*
	console.log('$(window).height(): ', windowHeight);
	console.log("$('.main-header').outerHeight(): ", $('.main-header').outerHeight());
	console.log("$('.content-header').outerHeight(): ", $('.main-header').outerHeight());
	console.log("tableElement.outerHeight(): ", tableElement.outerHeight());
	console.log('availableHeight: ', availableHeight);
	console.log("table head outerHeight(): ", $('thead', tableElement).outerHeight());
	*/
	
	/*
	if ($('#criteria_area')) {
		availableHeight -= $('#criteria_area').outerHeight();
	}
	*/
	var siblings = rowContainer.siblings();
	for (var i = 0; i < siblings.length; i++) {
		availableHeight -= $(siblings[i]).outerHeight();
	}
	var vhHeight = Math.ceil(availableHeight / windowHeight * 100);
	tableContainer.height(availableHeight);
	tableContainer.css({'height': vhHeight + 'vh'});
	var viewportHeight = availableHeight;
	/*
	for (var i = 0; i < siblings.length; i++) {
		viewportHeight -= $(siblings[i]).outerHeight();
	}
	*/
	if (hasSearch) viewportHeight -= 40;
	if (hasPagination) viewportHeight -= 60;
	viewportHeight -= $('thead', tableElement).outerHeight();
	vhHeight = Math.ceil(viewportHeight / windowHeight * 100) + 'vh';
	if (clearHeader) $('thead tr', tableElement).empty();
	return vhHeight; //viewportHeight;
}

function getFormToJson(form) {
	var indexed_array = {};
	var jsonData = "";
	$.map(form, function(n, i) {
		indexed_array[n['name']] = n['value'];
	});
	jsonData = JSON.stringify(indexed_array);
	return jsonData;
}

function configValidator(validator) {
	if (!validator.settings) {
		return;
	}
	if (!validator.settings.errorPlacement) {
		validator.settings.errorPlacement = function (error, element) {
			error.addClass("invalid-feedback");
			if (element.prop("type") === "checkbox") {
				error.insertAfter(element.next("label"));
			} 
			else {
				error.insertAfter(element);
			}
		};
		validator.settings.highlight = function(element, errorClass, validClass) {
			$(element).addClass("is-invalid").removeClass("is-valid");
		};
		validator.settings.unhighlight = function (element, errorClass, validClass) {
			$(element).addClass("is-valid").removeClass("is-invalid");
		};
	}
}

function ajaxDownload(url, parameters, fileName) {
	try {
		if (toast) {
			toast.fire({
				type: 'info', 
				title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
			});
		}
		$.ajax(url, {
			'xhrFields': {'responseType' : 'blob'},
			'data': parameters,
			'dataType': 'binary'
		})
		.done(function(file) {
			if ((file) && (file.size)) {
				if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
					window.navigator.msSaveOrOpenBlob(file, fileName);
				}
				else {
					var link = document.createElement('a');
					link.href = (window.URL ? URL : webkitURL).createObjectURL(file);
					link.download = fileName;
					link.click();
				}
			}
			else {
				if (toast) {
					toast.fire({
						type: 'warning', 
						title: $.i18n.prop('operation.empty.result'), 
						timer: 5 * 1000
					});
				}
			}
		})
		.always(function() {
			if (toast) toast.close();
		});
	}
	catch(e) {
		console.log('*** Exception from ajaxDownload: ', e);
	}
}

function ajaxPostDownload(url, parameters, fileName) {
	try {
		if (toast) {
			toast.fire({
				type: 'info', 
				title: $.i18n.prop('operation.querying') + ' ' + $.i18n.prop('operation.waiting') 
			});
		}
		$.ajax(url, {
			'data': JSON.stringify(parameters),
			'dataType': 'binary',
			'type': "POST",
			'contentType': "application/json",
			'xhrFields': {'responseType' : 'blob'}
		})
		.done(function(file) {
			if ((file) && (file.size)) {
				if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
					window.navigator.msSaveOrOpenBlob(file, fileName);
				}
				else {
					var link = document.createElement('a');
					link.href = (window.URL ? URL : webkitURL).createObjectURL(file);
					link.download = fileName;
					link.click();
				}
			}
			else {
				if (toast) {
					toast.fire({
						type: 'warning', 
						title: $.i18n.prop('operation.empty.result'), 
						timer: 5 * 1000
					});
				}
			}
		})
		.always(function() {
			if (toast) toast.close();
		});
	}
	catch(e) {
		console.log('*** Exception from ajaxDownload: ', e);
	}
}

function toggleActiveRow(selector) {
	$('tbody', selector).on('click', 'tr', function(e) {
		var row = $(this);
		if (!activeRowClass) var activeRowClass = 'bg-primary';
		row.closest('tbody').find('tr.' + activeRowClass).removeClass(activeRowClass);
		row.addClass(activeRowClass);
	});
}

/*
function showTitleAndFooter() {
	$('footer #version_number').text(APPLICATION.systemConfig.applicationVersion);
	$('footer #copyright_year').text(APPLICATION.systemConfig.copyrightYear);
	$('footer #company_name').html(APPLICATION.systemConfig.companyName);
	$('footer #company_home_url').prop('href', APPLICATION.systemConfig.companyHomeUrl);
	$('#application_code').html(APPLICATION.systemConfig.applicationCode);
	$('#company_home_url').click(function(e) {
		e.preventDefault();
		window.open($(this).prop('href'));
	});
	$('footer #version_label').html($.i18n.prop('index.version'));
	$('footer #copyright').text($.i18n.prop('index.copyright'));
	$('footer #copyright_declaration').text($.i18n.prop('index.copyright.declaration'));
	document.title = APPLICATION.CODE.toUpperCase() + '-' + APPLICATION.documentTitle;
}
*/

var themeSwitch;

function switchTheme(currentTheme) {
	if (!currentTheme) currentTheme = localStorage.getItem('theme');
	if (!currentTheme) currentTheme = 'dark';
	if (currentTheme) {
		var themeSwitchContainer = $('#theme_switch_container');
		var themeSwitchLabel = $('#theme_switch_label');
		var header = $('.main-header');
		if (currentTheme === 'light') {
			themeSwitch.empty().append('<i class="fa fa-lg fa-toggle-off"></i>');
			if (themeSwitchContainer.hasClass('bg-dark')) themeSwitchContainer.removeClass('bg-dark');
			if ($(document.body).hasClass('dark-mode')) $(document.body).removeClass("dark-mode");
			if (header.hasClass('navbar-dark')) header.removeClass('navbar-dark');
			header.addClass('navbar-light');
		}
		else {
			themeSwitch.empty().append('<i class="fa fa-lg fa-toggle-on"></i>');
			if (!themeSwitchContainer.hasClass('bg-dark')) themeSwitchContainer.addClass('bg-dark');
			if (!$(document.body).hasClass('dark-mode')) $(document.body).addClass("dark-mode");
			if (header.hasClass('navbar-light')) header.removeClass("navbar-light");
			header.addClass('navbar-dark');
		}
		applyTableRowTheme(currentTheme);
	}
}

function applyTableRowTheme(currentTheme) {
	if (!currentTheme) currentTheme = localStorage.getItem('theme');
	var dataTableThemeElement = $('.dataTable tbody tr');
	var dataTablePageLengthElement = $('.dataTables_length label, .dataTables_info');
	if ((!currentTheme) || (!dataTableThemeElement)) return;
	if (currentTheme === 'dark') {
		dataTableThemeElement.addClass('dark-mode');
		dataTablePageLengthElement.addClass('text-light');
	}
	else {
		if (dataTableThemeElement.hasClass('dark-mode')) dataTableThemeElement.removeClass('dark-mode');
		if (dataTablePageLengthElement.hasClass('text-light')) dataTablePageLengthElement.removeClass('text-light');
	}
}

