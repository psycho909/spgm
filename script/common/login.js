requirejs(['moment', 'sweetalert2', 'app', 'pace', 'icheck', 'jquery-serialize', 'jquery-validate-messages', 'util', 'select2-maxheight'/*, 'form-control'*/, ], function(moment, swal) {
	$('#captcha_image').attr('src', URLS.AUTHENTICATE.CAPTCHA);
	$('#captcha_image').show();
	require(['../../script/common/forget_password.js', '../../script/common/community_modal.js']);
	window.moment = moment;
	window.swal = swal;
	window.toast = swal.mixin({
		toast: true,
		showConfirmButton: false,
		//allowOutsideClick: true, 
		timer: 3000
	});
	$.when(getConfig(true))
	.done(function() {
		/*
		app.initialize(function() {
			getConfig(true);		
		});
		*/
		app.initialize();
	});
});

var language;
var form;
var validator;

function loadI18n() {
	var deferred = $.Deferred();
	language = getUrlParam('lang');
	if (!language) language = getPageLocale();
	if (!language) language = APPLICATION.systemConfig.defaultLocale;
	$.i18n.properties({
		language: language,
		name: [APPLICATION.SETTING.defaultLanguageFileName, 'login-message', 'announcement-message'],
		path: APPLICATION.SETTING.defaultLanguageFilePath,
		mode: 'map',
		cache: true,
		callback: function() {
			if ((APPLICATION.systemConfig) && (APPLICATION.systemConfig.locales)) {
				document.title = APPLICATION.systemConfig.locales[language].DOCUMENT_TITLE + '-' + $.i18n.prop('login.login');
				$('#application_title').text(APPLICATION.systemConfig.locales[language].APPLICATION_TITLE);
			}
			else {
				document.title = APPLICATION.CODE.toUpperCase() + '-' + $.i18n.prop('login.login');
				$('#application_title').text($.i18n.prop('login.application.title'));
			}
			
			/*
			document.title = APPLICATION.CODE.toUpperCase() + '-' + $.i18n.prop('login.login');
			if ((APPLICATION.systemConfig.locales) && (APPLICATION.systemConfig.locales[language].APPLICATION_TITLE)) $('#application_title').text(APPLICATION.systemConfig.locales[language].APPLICATION_TITLE);
			else $('#application_title').text($.i18n.prop('login.document.title'));
			*/

			$('#please_login_title').text($.i18n.prop('login.please.login'));
			$('#login_id').prop('placeholder', $.i18n.prop('login.login_id'));
			$('#password').prop('placeholder', $.i18n.prop('login.password'));
			$('#captcha').prop('placeholder', $.i18n.prop('login.captcha'));
			$('#refresh_captcha').append($.i18n.prop('login.refresh'));
			$('#captcha_hint').text($.i18n.prop('login.captcha.hint'));
			$('#login').append($.i18n.prop('login.login'));
			$('#forget_password').append($.i18n.prop('login.password.forget'));
			//$('#remember_me_text').text($.i18n.prop('login.rememberMe'));
			if ((APPLICATION.systemConfig) && (APPLICATION.systemConfig.rememberMeEnabled)) $('#remember_me_label').text($.i18n.prop('login.remember_me').format(APPLICATION.systemConfig.rememberMeDays));
			deferred.resolve();
		}
	});
	return deferred.promise();
}

function initial() {
	if (!APPLICATION.ENV.runningCordova) {
		$('#browser_compatibility_text').html($.i18n.prop('browser.compatibility.text'));
		$('#browser_compatibility').show();
		$('#browser_compatibility').on('click', 'a', function(e) {
			e.preventDefault();
			if (e.target.href) {
				window.open(e.target.href);
			}
		});
	}
	/*
	else {
		$('#application_title').addClass('fixed-top');
	}
	*/

	//$('[data-toggle="tooltip"]').tooltip({ delay: { "show": 500, "hide": 100 } });

	$('.icheck').iCheck({
		checkboxClass: 'icheckbox_square-blue',
		radioClass: 'iradio_square-blue',
		increaseArea: '20%'
	});

	$('#login_id').focus();

	if ((APPLICATION.systemConfig) && (APPLICATION.systemConfig.supportLocale) && (APPLICATION.systemConfig.supportLocale.length > 1)) {
		/*
		$('#language_container').iCheck({
			checkboxClass: 'icheckbox_square-blue',
			radioClass: 'iradio_square-blue',
			increaseArea: '20%'
		});
		*/
		$('#language_container').show();
		$('#language_container input').on('ifClicked', function(e) {
			window.location = URLS.LOGIN + '?lang=' + $(this).val();
		});
	}

	if (APPLICATION.systemConfig.rememberMeEnabled) $('#remember_me_container').removeClass('d-none'); 

	form = $('#login_form');
	validator = form.validate({
		rules: {
			j_username: {
				required: true,
				minlength: 2,
				maxlength: 15
				//pattern: /^[a-zA-Z0-9_@\.]+$/
			},
			j_password: {
				required: true,
				minlength: 2,
				maxlength: 30
			},
			captcha: {
				required: true
			}
		}
	});
	configValidator(validator);

	if (!language.startsWith('en')) $.getScript(getValidatorTranslation(language));
	
	$('#toggle_password').on('click', function(e) {
		var that = $(this);
		var inputType = password.getAttribute("type") === "password" ? "text" : "password";
		password.setAttribute("type", inputType);
		$('i', that).toggleClass("fal fa-eye-slash");
		$('i', that).toggleClass("fal fa-eye");
	});
	
	$('#login').on('click', function(e) {
		e.preventDefault();
		if (!form.valid()) return false;
		var formData = form.serializeObject();
		
		if (toast) toast.fire({
			type: 'info', 
			position: 'center',
			title: $.i18n.prop('operation.processing') + ', ' + $.i18n.prop('operation.waiting') 
		});
		
		/*
		formData['j_username'] = encodeForTransfer(formData['j_username']);
		formData['j_password'] = encodeForTransfer(formData['j_password']);
		*/
		/*
		var loginUrl = (APPLICATION.ENV.runningCordova) ? URLS.AUTHENTICATE.LOGIN_APP : URLS.AUTHENTICATE.LOGIN;
		*/
		var calling;
		//if ((APPLICATION.ENV.runningCordova) && (APPLICATION.ENV.isMac())) {
		if (APPLICATION.ENV.runningCordova) {
			calling = $.post(URLS.AUTHENTICATE.LOGIN_APP, formData);
		}
		else {
			calling = $.post(URLS.AUTHENTICATE.LOGIN, formData);
		}
		$.when(calling)
		.done(function(authentication) {
			if ((authentication) && (authentication.past == 2)) {
				APPLICATION.authentication = authentication;
				APPLICATION.user = authentication.user;
				delete APPLICATION.authentication.user;
				
				$('.warning').empty();
				$.when(getMenuItems(true)).
				done(function() {
					/*
					APPLICATION.authentication = authentication;
					APPLICATION.user = authentication.user;
					delete APPLICATION.authentication.user;
					*/
					if (APPLICATION.user) {
						APPLICATION.data.locale = APPLICATION.user.locale;
						var home = '';
						if (APPLICATION.user.organization) {
							APPLICATION.data.activeOrganizationId = APPLICATION.user.organization.id;
							//APPLICATION.data.activeCustomerId = APPLICATION.user.organization.id;
							home = URLS.HOME;
						}
						else if (APPLICATION.user.customer) {
							APPLICATION.data.activeCustomerId = APPLICATION.user.customer.id;
							//home = URLS.HOME_CUSTOMER;
							home = URLS.HOME;
						}
						
						$.when(saveCookie()).
						done(function() {
							if (!APPLICATION.systemConfig.loginSelectCommunity) {
								transitionToPage(home);
							}
							else {
								/*
								ajaxGet(URLS.USER_REGISTRATION.COUNT_BY_USER + APPLICATION.user.id, null, function(count) {
									if (!count) transitionToPage(home);
									else {
										APPLICATION.communityDialog.form.on('click', '#community_confirm', function(e) {
											e.preventDefault();
											APPLICATION.data.activeCommunityId = $('#modal_community_id').val();
											$.when(saveDataCookie()).done(() => transitionToPage(home));
										});
										APPLICATION.communityDialog.initial();
										APPLICATION.communityDialog.show();
									}
								});
								*/
								ajaxGet(URLS.COMMUNITY.LIST_BY_USER + APPLICATION.user.id, null, function(communities) {
									APPLICATION.data.communities = communities;
									if ((!communities) || (!communities.length)) {
										if (APPLICATION.user.userTypeId == APPLICATION.codeHelper.userTypeOrganization.id) {
											transitionToPage(home);
											return false;
										}
									}
									
									if (communities.length) {
										APPLICATION.data.selectedCommunity = communities[0];
										APPLICATION.data.selectedCommunityId = communities[0].id;
										APPLICATION.data.activeCommunityId = communities[0].id;
										if (communities.length <= 1) {
											$.when(saveDataCookie())
											.done(function() {
												if (APPLICATION.data.selectedCommunityId) {
													ajaxGet(URLS.SETTING.COMMUNITY_CONFIG + APPLICATION.data.selectedCommunityId, null, function(config) {
														APPLICATION.communityConfig = config;
														$.when(saveCommunityConfigCookie()).done(() => { 
															console.log(" *** Saved data & communityConfig ***");
															transitionToPage(home);
														});
													});
												}
											});
										}
										else {
											APPLICATION.communityDialog.form.on('click', '#community_confirm', function(e) {
												e.preventDefault();
												APPLICATION.data.selectedCommunityId = $('#modal_community_id').val();
												APPLICATION.data.selectedCommunity = APPLICATION.data.communities.find((e) => e.id == APPLICATION.data.selectedCommunityId);
												APPLICATION.data.activeCommunityId = APPLICATION.data.selectedCommunityId;
	
												$.when(saveDataCookie())
												.done(function() {
													ajaxGet(URLS.SETTING.COMMUNITY_CONFIG + APPLICATION.data.selectedCommunityId, null, function(config) {
														APPLICATION.communityConfig = config;
														$.when(saveCommunityConfigCookie()).done(() => { 
															console.log(" *** Saved data & communityConfig ***");
															transitionToPage(home);
														});
													});
												});
											});
											APPLICATION.communityDialog.initial();
											APPLICATION.communityDialog.show();
										}
									}
								});
								
							}
						});
					}
				});
			}
			/*
			else {
				if ((authentication.past == 401)|| (authentication.past == 402)) {
					$('#login, #require').hide();
				}
			}
			*/
		})
		.fail(function(xhr, status, error) {
			var errorNo = parseInt(error, 10);
			if (!errorNo) errorNo = xhr.responseJSON.status;
			switch (errorNo) {
				case 1: message = $.i18n.prop('login.fail.captcha.empty'); break;
				case 2: message = $.i18n.prop('login.fail.captcha.mismatch'); break;
				case 3: message = $.i18n.prop('login.fail.account.invalid'); break;
				default: message = $.i18n.prop('login.fail'); break;
			}
			$('.warning').html('<i class="fa fa-lg fa-warning"></i>&nbsp;{0}！'.format($.i18n.prop('login.fail') + ': ' + message)).removeClass('d-none');
		})
		.always(function() {
			if (toast) toast.close();
		});
	});
	//
	var captchaUrl = $("#captcha_image").attr("src");
	$('#refresh_captcha').on('click', function(e) {
		e.preventDefault();
		var d = new Date();
		$("#captcha_image").attr("src", captchaUrl + "?" + d.getTime());
	});
	//
	$('#forget_password').on('click', function(e) {
		e.preventDefault();
		$.when(forgetPasswordModal.initial())
		.done(forgetPasswordModal.show);
	});
	
	/*
	//announcement
	if (APPLICATION.systemConfig && APPLICATION.systemConfig.loginAnnouncement){
		ajaxPostJson(URLS.ANNOUNCEMENT.LIST, null)
		.done(function(json) {
			$('#announcement_btn').append($.i18n.prop('announcement.title') + '<span id = "unread_count">' + json.length + '</span>');
			var lis = [];
			if (json && json.length) {
				for (var i = 0; i < json.length; i++) {
					var li = document.createElement('li');
					var span = document.createElement('span');
					var p = document.createElement('p');
					
					li.id = "announcement_text";
					span.id = "announcement_title";
					p.id = "announcement_message";

					var title = document.createTextNode(json[i].title);
					var message = document.createTextNode(json[i].message);

					span.append(title);
					p.append(message);
					li.append(span, p);
					lis.push(li);
				}
				if (lis.length) {
					$('#announcement_btn').on('click', function(e) {
						e.preventDefault();
						swal.fire({
							title: $.i18n.prop('announcement.title') + ' ' + '<span id = "unread_count">' + json.length + '</span>',
							html: lis,
							confirmButtonText: $.i18n.prop('announcement.close'),
							showCloseButton: true
						})
					})
				}
			}
		})
		.fail(function(errorThrown) {
			console.log("errorThrown %o", errorThrown);
		});
	} else {
		$('#announcement_btn_div').hide();
	}
	*/
	
}

function loadSideMenu() { }
function refresh() { }

