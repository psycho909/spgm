var noControlSidebar = true;
//var noNotification = true;
var noReload = true;
var noThemeSwitch = true;
var noUser = true;

var language;

initialPage(null, {sidebar: false});

function loadI18n() {
	var deferred = $.Deferred();
	if (!language) language = getPageLocale();
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'menu-message', 'index-message'], 
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: false,
		callback: function() {
			APPLICATION.documentTitle = $.i18n.prop('index');
			$('#charging').text($.i18n.prop('menu.charging'));
			$('#device').text($.i18n.prop('menu.device'));
			$('#finance').text($.i18n.prop('menu.finance'));
			$('#garage').text($.i18n.prop('menu.garage'));
			$('#user').text($.i18n.prop('menu.user'));
			$('#configuration').text($.i18n.prop('menu.configuration'));
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	"use strict";

	$(document).ajaxStart(function() {Pace.restart();});
	
	var deferred = $.Deferred();
	var deferreds = [];
	 
	$.when.apply($, deferreds)
	.done(function() {
		$('a.menu_link').on('click', function(e) {
			e.preventDefault();
			var menuNo = $(this).attr('menu_no');
			if (menuNo) {
				var link = $(this).attr('href');
				if (link.indexOf('#') >= 0) window.location = 'blank.html?m=' + menuNo;
				else window.location = link;
			}
		});
		
		return deferred.resolve();
	});
	
	return deferred.promise();
}

function refresh(e) {
	if (e) e.preventDefault();
}
