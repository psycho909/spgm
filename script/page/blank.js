//requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'form-control', 'editForm', 'jquery-serialize', 'jquery-validate-messages'], function(moment, swal) {
requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'select2-maxheight', 'form-control'], function(moment, swal) {
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

var language;

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
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	"use strict";
	
	//$(document).ajaxStart(function() {Pace.restart();});
	
	var deferred = $.Deferred();
	var deferreds = [];
	/*
	deferreds.push(
		ajaxGet(URLS.NOTIFICATION.COUNT_READING + APPLICATION.user.id, null)
		.done(function(json) {
			$('#nav_notification_count').text((json) ? json : 0);
		})
	); 
	*/
	$.when.apply($, deferreds)
	.done(function() {
		return deferred.resolve();
	});
	
	return deferred.promise();
}

function refresh(e) {
	if (e) e.preventDefault();
}

var loadSideMenuCallback = function() {
	var menuNo = getUrlParam('m');
	if (menuNo) {
		//$('#sidebar_container li.nav-item[menu_no="{0}"]'.format(menuNo)).trigger('click');
		$('#sidebar_container li.nav-item[menu_no="{0}"]'.format(menuNo)).addClass('menu-is-opening menu-open');
	}
}

