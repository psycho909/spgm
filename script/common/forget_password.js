var forgetPasswordDialog =	$('#forget_password_dialog');
var forgetPasswordForm =  $('#forget_password_form', forgetPasswordDialog);
var forgetPasswordModal = {
	initial: function () {
		var deferred = $.Deferred();
		//
		var validator = forgetPasswordForm.validate({
			rules: {
				forgetLoginId: {
					required: true,
					minlength: 2,
					maxlength: 20,
					pattern: /^[a-zA-Z0-9_@\.]+$/
				},
				email: {
					required: true,
					maxlength: 100,
					email: true
				}
			}, 
			messages: {
			}
		});
		//
		$('#close', forgetPasswordForm).on('click', null, function(e) {
			forgetPasswordDialog.modal('toggle');
		});
		//
		$('#confirm', forgetPasswordForm).on('click', function(e) {
			e.preventDefault();
			$(this).prop('disabled', true);
			var formData = {};
			formData['forgetLoginId'] = encodeForTransfer($('#forget_login_id', forgetPasswordForm).val());
			formData['email'] = encodeForTransfer($('#email').val(), forgetPasswordForm);
			formData[CONSTANT.SECURITY.HEADER.TOKEN] = APPLICATION.data.token;
			$.when(checkTicket()).
			done(function() {
				$.post(URLS.AUTHENTICATE.PASSWORD.FORGET, formData, function(json) {
					if (json.OK) {
						$('#sent_text').html($.i18n.prop('login.password.sent.text')).show();
					}
					forgetPasswordDialog.modal('toggle');
				});
			});
		});	
		//
		$.i18n.properties({
			language: getPageLocale(),
			name: [APPLICATION.SETTING.defaultLanguageFileName, 'login-message'], 
			path: APPLICATION.SETTING.defaultLanguageFilePath,
			mode: 'map',
			cache: true,
			callback: function() {
				$('#forget_login_id', forgetPasswordForm).prop('placeholder', $.i18n.prop('login.login_id'));
				$('#email', forgetPasswordForm).prop('placeholder', $.i18n.prop('login.email'));
				$('#confirm', forgetPasswordForm).append($.i18n.prop('operation.confirm'));
				$('#close', forgetPasswordForm).append($.i18n.prop('operation.close'));
				$('#content_text', forgetPasswordForm).html($.i18n.prop('login.password.forget.text'));
				$('#forget_password_form_title', forgetPasswordForm).append($.i18n.prop('login.password.forget'));
				deferred.resolve();
			}
		});
		//
		return deferred;
	},
	show: function() {
		forgetPasswordDialog.modal('show');
		$('#forget_login_id', forgetPasswordForm).focus();
	}
};
