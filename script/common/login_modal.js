APPLICATION.loginDialog = {
	element: $('#login_form_modal'),
	form: $('#modal_login_form'),
	loaded: false,
	shown: false,
	initial: function() {
		if (APPLICATION.loginDialog.loaded) return;
		var deferred = $.Deferred();
		//
		$.i18n.properties({
			language: getPageLocale(),
		    name: ['login-message'], 
		    path: APPLICATION.SETTING.defaultLanguageFilePath, 
		    mode: 'map',
		    cache: true,
		    callback: function() {
		    	$('#login_id', APPLICATION.loginDialog.form).prop('placeholder', $.i18n.prop('login.user.id'));
		    	$('#password', APPLICATION.loginDialog.form).prop('placeholder', $.i18n.prop('login.password'));
				$('#captcha', APPLICATION.loginDialog.form).prop('placeholder', $.i18n.prop('login.captcha'));
		    	$('#login', APPLICATION.loginDialog.form).text($.i18n.prop('login.login'));
		    	$('#close', APPLICATION.loginDialog.form).text($.i18n.prop('operation.close'));
		    	$('#login_text', APPLICATION.loginDialog.form).text($.i18n.prop('login.session.timeout'));
		    	$('#modal_login_form_title', APPLICATION.loginDialog.element).text($.i18n.prop('login.relogin'));
		    	//$('#remember_me_text').text($.i18n.prop('login.rememberMe'));
				deferred.resolve();
		    }
		});
		
		APPLICATION.loginDialog.form.validate({
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
		
		APPLICATION.loginDialog.form.on('click', '#close', function(e) {
			APPLICATION.loginDialog.element.modal('toggle');
			APPLICATION.loginDialog.shown = false;
			//window.location = URLS.LOGIN;
		});
		
		APPLICATION.loginDialog.form.on('click', '#login', function(e) {
			e.preventDefault();
			var formData = $('#modal_login_form').serializeObject();
			console.log("*** formData: %o ***", formData);
			/*
			var formData = {};
			formData['j_username'] = encodeForTransfer($('#user_id', APPLICATION.loginDialog.form).val());
			formData['j_password'] = encodeForTransfer($('#password', APPLICATION.loginDialog.form).val());
			//console.log('formData: %o', formData);
			*/
			/*
			$.when(checkTicket()).
			done(function() {
				$.post(URLS.AUTHENTICATE.LOGIN, formData, function(authentication) {
					//console.log('*** Authentication return ***', authentication);
					if ((authentication) && (authentication.past == 2)) {
						$('.warning').empty();
						APPLICATION.authentication = authentication;
						APPLICATION.user = authentication.user;
						console.log('*** Authentication success ***');
						APPLICATION.loginDialog.shown = false;
						APPLICATION.loginDialog.element.modal('toggle');
					}
					else {
						if ((authentication.past == 401)|| (authentication.past == 402)) {
							$('#login, #require').hide();
						}
			       		$('.warning').html('<i class="fa fa-lg fa-warning" style="color:red;"></i>&nbsp;{0}！'.format(authentication.message ? authentication.message : $.i18n.prop('login.fail'))).show();
					}
		        });
			}).
			fail(function(jqXHR, status, error) {
				console.log("*** checkTicket failed: %o ***", jqXHR);
			});
			*/
			$.post(URLS.AUTHENTICATE.LOGIN, formData).
			done(function(authentication) {
				//console.log('*** Authentication return ***', authentication);
				if ((authentication) && (authentication.past == 2)) {
					$('.warning').empty();
					APPLICATION.authentication = authentication;
					APPLICATION.user = authentication.user;
					APPLICATION.loginDialog.shown = false;
					APPLICATION.loginDialog.element.modal('toggle');
					console.log('*** Authentication success ***');
				}
				else {
					if ((authentication.past == 401)|| (authentication.past == 402)) {
						$('#login, #require').hide();
					}
		       		$('.warning').html('<i class="fa fa-lg fa-warning" style="color:red;"></i>&nbsp;{0}！'.format(authentication.message ? authentication.message : $.i18n.prop('login.fail'))).show();
				}
				deferred.resolve();
			}).
			fail(function(jqXHR, status, error) {
				console.log("*** Fail to re-login ***");
				deferred.resolve();
			});
		});
		//
		return deferred;
	},
	show: function() {
		if (APPLICATION.loginDialog.shown) return;
		APPLICATION.loginDialog.shown = true;
		APPLICATION.loginDialog.element.modal('toggle');
		$('#user_id', APPLICATION.loginDialog.element).focus();
	}
};
