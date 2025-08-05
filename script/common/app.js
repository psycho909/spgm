var jqReady = $.Deferred();
var pageReady = $.Deferred();
 
function transitionToPage(href) {
	$('.container-fluid').css('opacity', 0);
    setTimeout(function() { 
        window.location.href = href;
    }, 800);
}

var app = {
		
	callback: null,
	headerOption: null,
	
	initialize: function(callback, headerOption) {
		app.callback = callback;
		app.headerOption = headerOption;
		var browser = document.URL.match(/^https?:/);
		if (browser) pageReady.resolve();
		else this.bindEvents();
	},
	
	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	
	onDeviceReady : function() {
		document.addEventListener('resume', app.onResume, false);
		pageReady.resolve();
	},
	
	onResume : function() {
		$.when(loadTocken()).
		then(loadCookie).
		then(loadConfig).
		done(function() {
			/*
			$.get(URLS.REMEMBER_ME, null, function(text) {
				//console.log("*** RESUME was done. ***");
			});
			*/
		});
	},
	
	loadingDone: function() {
		try {
			var body = $('body');
			if (body) {
				body.attr('height', 'auto');
				//body.attr('class', 'sidebar-mini layout-fixed layout-navbar-fixed sidebar-collapse');
				body.attr('class', 'sidebar-mini layout-fixed layout-navbar-fixed');
			}
			//$.when(loadTocken()).
			$.when(loadI18n()).
			then(loadTocken()).
			then(loadCookie).
			then(loadConfig).
			done(function() {
				$.when(checkTicket())
				.done(function(json) {
					//if ((APPLICATION.ENV.runningCordova) || (window.location.href.indexOf(URLS.CONTENT.PAGE.PUBLIC) >= 0) || ((json) && (json.past == 2))) {
						//$.when(loadI18n()).
						$.when(loadHeaderSidebar(app.headerOption)).
						then(initial).
						done(function() {
							if (app.callback) app.callback();
							//console.log('app.loadingDone() successfully.');
							themeSwitch = $('#theme_switch');
							themeSwitch.on('click', function(e) {
								var currentTheme = localStorage.getItem('theme');
								e.preventDefault();
								localStorage.setItem('theme', currentTheme === 'dark' ? 'light' : 'dark');
								switchTheme();
							});
							if ($(document.body).attr("switch-theme") != "off") {
								switchTheme();
							}
						});
					//}
				});
			}).
			fail(function(e) {
				console.log('app.loadingDone() failed. exception: ', e);
			});
		}
		catch (e) {
			console.log('Exception in app.loadingDone(): %o', e);
		}
	}
};

$(document).ready(function() {
	//$('.container-fluid').css({'opacity': '1'});
	jqReady.resolve();
});

$.when(jqReady, pageReady).then(function() {
	app.loadingDone();
	$('.container-fluid').css({'opacity': '1'});
});
