var LIBRARY_PATH = "lib";
require.config({
	baseUrl: "../../script",
	packages: [
		{
			name: "moment",
			location: LIBRARY_PATH + "/moment",
			main: "moment-with-locales.min"
		}
	],
	paths: {
		//"cordova": "../cordova",
		jquery: LIBRARY_PATH + "/plugins/jquery/jquery.min",
		"jquery-i18n": LIBRARY_PATH + "/jquery.i18n/jquery.i18n.properties.min",
		bootstrap: LIBRARY_PATH + "/bootstrap/js/bootstrap.bundle.min",
		//"bootstrap": LIBRARY_PATH + "/bootstrap/js/bootstrap.bundle",
		datepicker: LIBRARY_PATH + "/bootstrap-datepicker/js/bootstrap-datepicker.min",
		datetimepicker: LIBRARY_PATH + "/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min",
		localforage: LIBRARY_PATH + "/localforage/localforage.min",
		"localforage-getitems": LIBRARY_PATH + "/localforage/localforage-getitems",
		//
		//"adminlte": LIBRARY_PATH + "/adminlte/js/adminlte.min",
		adminlte: LIBRARY_PATH + "/adminlte/js/adminlte",
		pace: LIBRARY_PATH + "/plugins/pace-progress/pace.min",
		fastclick: LIBRARY_PATH + "/plugins/fastclick/fastclick",
		icheck: LIBRARY_PATH + "/iCheck/icheck.min",
		//"textillate": LIBRARY_PATH + "/textillate/jquery.textillate",
		//"textillate-lettering": LIBRARY_PATH + "/textillate/assets/jquery.lettering",
		select2: LIBRARY_PATH + "/plugins/select2/js/select2.full.min",
		"select2-maxheight": LIBRARY_PATH + "/plugins/select2/js/maximize-select2-height.min",
		//"select2.multi-checkboxes": LIBRARY_PATH + "/plugins/select2-multi-checkboxes/select2.multi-checkboxes",
		sweetalert2: LIBRARY_PATH + "/plugins/sweetalert2/sweetalert2",
		toastr: LIBRARY_PATH + "/plugins/toastr/toastr.min",
		daterangepicker: LIBRARY_PATH + "/plugins/daterangepicker/daterangepicker",
		fileinput: LIBRARY_PATH + "/bootstrap-fileinput/js/fileinput.min",
		"year-calendar": LIBRARY_PATH + "/bootstrap-year-calendar/js/bootstrap-year-calendar",
		"@fullcalendar/core": LIBRARY_PATH + "/plugins/fullcalendar/main.min",
		"@fullcalendar/locales": LIBRARY_PATH + "/plugins/fullcalendar/locales-all.min",
		"@fullcalendar/interaction": LIBRARY_PATH + "/plugins/fullcalendar-interaction/main.min",
		"@fullcalendar/daygrid": LIBRARY_PATH + "/plugins/fullcalendar-daygrid/main.min",
		"@fullcalendar/timegrid": LIBRARY_PATH + "/plugins/fullcalendar-timegrid/main.min",
		"@fullcalendar/bootstrap": LIBRARY_PATH + "/plugins/fullcalendar-bootstrap/main.min",
		//
		"jquery-easing": LIBRARY_PATH + "/jquery.easing/jquery.easing.min",
		"jquery-i18n": LIBRARY_PATH + "/jquery.i18n/jquery.i18n.properties.min",
		"jquery-serialize": LIBRARY_PATH + "/json/jquery.serialize-object.min",
		"jquery-populate": LIBRARY_PATH + "/json/jquery.populate",
		"jquery-base64": LIBRARY_PATH + "/jquery.base64/jquery.base64",
		"jquery-validate": LIBRARY_PATH + "/jquery.validation/jquery.validate.min",
		"jquery-validate-messages": LIBRARY_PATH + "/jquery.validation/localization/messages_zh_TW",
		//"jquery-validate-additional": LIBRARY_PATH + "jquery-validation/additional-methods.min",
		//
		"datatables.net": LIBRARY_PATH + "/plugins/datatables/jquery.dataTables.min",
		"datatables.net-bs4": LIBRARY_PATH + "/plugins/datatables-bs4/js/dataTables.bootstrap4.min",
		"datatables.net-responsive": LIBRARY_PATH + "/plugins/datatables-responsive/js/dataTables.responsive.min",
		"datatables.net-responsive-bs4": LIBRARY_PATH + "/plugins/datatables-responsive/js/responsive.bootstrap4.min",
		"datatables.net-fixedcolumns": LIBRARY_PATH + "/plugins/datatables-fixedcolumns/js/dataTables.fixedColumns.min",
		"datatables.net-fixedcolumns-bs4": LIBRARY_PATH + "/plugins/datatables-fixedcolumns/js/fixedColumns.bootstrap4.min",

		"datatables-helper": LIBRARY_PATH + "/datatables-helper/datatables-helper",

		"bootstrap-slider": LIBRARY_PATH + "/plugins/bootstrap-slider/bootstrap-slider.min",
		chartjs: LIBRARY_PATH + "/plugins/chart.js/Chart.bundle.min",
		"chartjs-datalabels": LIBRARY_PATH + "/plugins/chartjs-plugin-datalabels/chartjs-plugin-datalabels.min",
		//"chartjs": LIBRARY_PATH + "/plugins/chart.js/Chart.min",
		knob: LIBRARY_PATH + "/jquery.knob/jquery.knob.min",

		lightbox: LIBRARY_PATH + "/lightbox/ekko-lightbox.min",
		"json-viewer": LIBRARY_PATH + "/jsonviewer/jquery.json-viewer",

		editForm: LIBRARY_PATH + "/common/form_common",
		"form-control": LIBRARY_PATH + "/common/form_control",
		"card-expander": LIBRARY_PATH + "/card_expander/card_expander",
		"card-switcher": LIBRARY_PATH + "/card_switcher/card_switcher",
		"address-picker": LIBRARY_PATH + "/address_picker/address_picker",

		/*
		"svg": LIBRARY_PATH + "/svg/svg.min",
		"svg-select": LIBRARY_PATH + "/svg/svg-select/svg.select.min",
		"polyfills": LIBRARY_PATH + "/svg/polyfills",
		"apexcharts-js": LIBRARY_PATH + "/apexcharts/apexcharts.min",
		"apexcharts": LIBRARY_PATH + "/apexcharts/apexcharts.amd",
		*/
		//"treeview": LIBRARY_PATH + "/treeview/bootstrap-treeview.min",
		//
		//"app": "common/app",
		app: "common/app",
		app_client: "common/app_client",
		application: "common/application",
		cordova: "../cordova",
		runtime: "../config/runtime",
		urls: "common/urls",
		util: "common/util",
		constant: "common/constant",

		"event-common": "page/event_common",
		"notification-checker": "page/notification_checker",
		"meter-common": "page/meter_common",

		"map-common": LIBRARY_PATH + "/gmap/map_common",
		"map-marker": LIBRARY_PATH + "/gmap/markerwithlabel",
		// CSS
		//"bootstrap-css": LIBRARY_PATH + "/bootstrap/css/bootstrap.min",
		"bootstrap-css": LIBRARY_PATH + "/bootstrap/css/bootstrap",
		//"font-awesome-css": LIBRARY_PATH + "/plugins/fontawesome/css/all.min",
		"font-awesome-css": LIBRARY_PATH + "/plugins/font-awesome/css/all.min",
		//"adminlte-css": LIBRARY_PATH + "/adminlte/css/adminlte.min",
		"adminlte-css": LIBRARY_PATH + "/adminlte/css/adminlte.min",
		//"adminlte-css": LIBRARY_PATH + "/adminlte/css/adminlte",
		"ionicons-css": LIBRARY_PATH + "/plugins/ionicons/css/ionicons.min",
		"select2-css": LIBRARY_PATH + "/plugins/select2/css/select2.min",
		"select2-theme-css": LIBRARY_PATH + "/plugins/select2-bootstrap4-theme/select2-bootstrap4.min",
		"pace-css": LIBRARY_PATH + "/plugins/pace-progress/themes/orange/pace-theme-flat-top",
		"icheck-css": LIBRARY_PATH + "/iCheck/square/blue",
		"icheck-bootstrap-css": LIBRARY_PATH + "/plugins/icheck-bootstrap/icheck-bootstrap.min",
		//"textillate-css": LIBRARY_PATH + "/textillate/assets/animate",
		"datepicker-css": LIBRARY_PATH + "/bootstrap-datepicker/css/bootstrap-datepicker3.min",
		"datetimepicker-css": LIBRARY_PATH + "/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min",
		"year-calendar-css": LIBRARY_PATH + "/bootstrap-year-calendar/css/bootstrap-year-calendar",

		"bootstrap-slider-css": LIBRARY_PATH + "/plugins/bootstrap-slider/css/bootstrap-slider.min",

		//"jsonview-css": LIBRARY_PATH + "/jsonview/jsonview",
		"datatables.net-css": LIBRARY_PATH + "/bootstrap-datatables/css/jquery.dataTables.min",

		//"datatables.net-bs4-css": LIBRARY_PATH + "/plugins/datatables-bs4/css/dataTables.bootstrap4.min",
		"datatables.net-bs4-css": LIBRARY_PATH + "/plugins/datatables-bs4/css/dataTables.bootstrap4",
		"datatables.net-responsive-bs4-css": LIBRARY_PATH + "/plugins/datatables-responsive/css/responsive.bootstrap4.min",
		//"datatables.net-fixedheader-bs4-css": LIBRARY_PATH + "/plugins/datatables-fixedheader/css/fixedHeader.bootstrap4.min",
		//"datatables.net-fixedcolumns-bs4-css": LIBRARY_PATH + "/plugins/datatables-fixedcolumns/css/fixedColumns.bootstrap4.min",

		//"bootstrap-dialog-css": LIBRARY_PATH + "/bootstrap-dialog/css/bootstrap-dialog.min",
		"sweetalert2-css": LIBRARY_PATH + "/plugins/sweetalert2/sweetalert2.min",
		"toastr-css": LIBRARY_PATH + "/plugins/toastr/toastr.min",
		"daterangepicker-css": LIBRARY_PATH + "/plugins/daterangepicker/daterangepicker",

		"fileinput-css": LIBRARY_PATH + "/bootstrap-fileinput/css/fileinput.min",
		"fullcalendar-css": LIBRARY_PATH + "/plugins/fullcalendar/main.min",
		//"fullcalendar-interaction-css": LIBRARY_PATH + "/plugins/fullcalendar-interaction/main.min",
		"fullcalendar-daygrid-css": LIBRARY_PATH + "/plugins/fullcalendar-daygrid/main.min",
		"fullcalendar-timegrid-css": LIBRARY_PATH + "/plugins/fullcalendar-timegrid/main.min",
		"fullcalendar-bootstrap-css": LIBRARY_PATH + "/plugins/fullcalendar-bootstrap/main.min",

		"chartjs-css": LIBRARY_PATH + "/plugins/chart.js/Chart.min",
		"json-viewer-css": LIBRARY_PATH + "/jsonviewer/jquery.json-viewer",
		"lightbox-css": LIBRARY_PATH + "/lightbox/ekko-lightbox",

		//"treeview-css": LIBRARY_PATH + "/treeview/bootstrap-treeview.min",

		"style-css": "../css/common"
	},
	map: {
		"*": {
			css: "lib/requirecss/css.min"
		}
	},
	shim: {
		//'bootstrap' : {deps: ['css!bootstrap-css']},
		//'bootstrap-validator' : {deps: ['css!bootstrap-validator-css']},
		adminlte: { deps: ["css!select2-css", "css!select2-theme-css", "css!adminlte-css"] },
		select2: { deps: ["jquery", "css!select2-css", "css!select2-theme-css"] },
		"select2.multi-checkboxes": { deps: ["select2"] },
		//'select2-maxheight' : {deps: ['select2', 'select2.multi-checkboxes']},
		"select2-maxheight": { deps: ["select2"] },
		icheck: { deps: ["css!icheck-css"] },
		datepicker: { deps: ["jquery", "bootstrap", "css!datepicker-css"] },
		datetimepicker: { deps: ["jquery", "bootstrap", "css!datetimepicker-css"] },
		pace: { deps: ["css!pace-css"] },
		sweetalert2: { deps: ["jquery", "css!sweetalert2-css"], exports: "swal" },
		toastr: { deps: ["jquery", "css!toastr-css"], exports: "toastr" },
		daterangepicker: { deps: ["css!daterangepicker-css"] },
		fileinput: { deps: ["css!fileinput-css"] },
		"year-calendar": { deps: ["css!year-calendar-css"] },
		"@fullcalendar/locales": { deps: ["@fullcalendar/core"] },
		"@fullcalendar/core": { deps: ["css!fullcalendar-css"] },
		"@fullcalendar/interaction": { deps: ["@fullcalendar/core"] },
		"@fullcalendar/daygrid": { deps: ["@fullcalendar/core", "css!fullcalendar-daygrid-css"] },
		"@fullcalendar/timegrid": { deps: ["@fullcalendar/core", "css!fullcalendar-timegrid-css"] },
		"@fullcalendar/bootstrap": { deps: ["@fullcalendar/core", "css!fullcalendar-bootstrap-css"] },

		"bootstrap-slider": { deps: ["css!bootstrap-slider-css"] },
		lightbox: { deps: ["css!lightbox-css"] },
		"json-viewer": { deps: ["css!json-viewer-css"] },

		chartjs: { deps: ["css!chartjs-css"] },
		"chartjs-datalabels": { deps: ["chartjs"] },

		"datatables.net": { deps: ["css!datatables.net-css"] },
		"datatables.net-bs4": { deps: ["datatables.net", "css!datatables.net-bs4-css"] },
		"datatables.net-responsive": { deps: ["datatables.net", "datatables.net-bs4", "css!datatables.net-responsive-bs4-css"] },
		/*
		'datatables.net-fixedheader' : {deps: ['datatables.net', 'datatables.net-bs4']},
		'datatables.net-fixedheader-bs4' : {deps: ['datatables.net-fixedheader', 'css!datatables.net-fixedheader-bs4-css']},
		*/
		/*
		'datatables.net-fixedcolumns' : {deps: ['datatables.net']},
		'datatables.net-fixedcolumns-bs4' : {deps: ['datatables.net-bs4', 'datatables.net-fixedcolumns', 'css!datatables.net-fixedcolumns-bs4-css']},
		*/

		//'bootstrap-dialog' : {deps: ['jquery','bootstrap', 'css!bootstrap-dialog-css'], exports: 'BootstrapDialog'},
		urls: { deps: ["application"] },
		"jquery-i18n": { deps: ["jquery"] },
		"jquery-populate": { deps: ["jquery"] },
		"jquery-serialize": { deps: ["jquery"] },
		"jquery-base64": { deps: ["jquery"] },
		"jquery-validate": { deps: ["jquery"] },
		"jquery-validate-messages": { deps: ["jquery-validate"] },
		util: { deps: ["urls", "jquery", "jquery-i18n", "localforage", "localforage-getitems"] },
		app: { deps: ["jquery", "bootstrap", "util", "constant", "css!font-awesome-css", "css!ionicons-css"] },
		app_client: { deps: ["jquery", "bootstrap", "util", "constant", "css!font-awesome-css", "css!ionicons-css"] },
		"datatables-helper": { deps: ["jquery-i18n"] },
		"form-control": { deps: ["jquery"] },
		editForm: { deps: ["jquery", "jquery-serialize", "jquery-populate"] },
		"address-picker": { deps: ["jquery", "bootstrap", "select2-maxheight"] },
		"card-expander": { deps: ["jquery", "bootstrap"] },
		"card-switcher": { deps: ["jquery", "bootstrap"] }
	}
});

var localforage;
requirejs(["jquery", "bootstrap", "application", "adminlte"], function () {
	//requirejs(['adminlte'], function() {
	requirejs(["localforage", "urls", "util"], function (lf) {
		localforage = lf;
		localforage.config({
			name: APPLICATION.CODE,
			version: 1.0,
			storeName: APPLICATION.CODE + "_data"
		});
	});
	//});
});

function initialPage(callback, headerOption, otherComponents) {
	requirejs(["moment", "sweetalert2", "app", "pace", "icheck", "select2-maxheight", "datatables.net-responsive", "datatables-helper", "daterangepicker", "form-control", "editForm", "jquery-serialize", "jquery-validate-messages", "card-switcher", "card-expander"], function (moment, swal) {
		window.moment = moment;
		window.swal = swal;
		window.toast = swal.mixin({
			toast: true,
			position: "top-end",
			showConfirmButton: false,
			timer: 5000
		});
		app.initialize(function () {
			if (callback) callback();
		}, headerOption);
	});
	if (otherComponents) requirejs(otherComponents);
}
