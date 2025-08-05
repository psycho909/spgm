APPLICATION.controlSidebar = {
	
	initial: function() {
		$('#control_sidebar_user_name_label').text($.i18n.prop('terms.user'));
		$('#control_sidebar_organization_name_label').text($.i18n.prop('terms.organization'));
		$('#control_sidebar_community_name_label').text($.i18n.prop('terms.community'));
		$('#control_sidebar_confirm').append($.i18n.prop('operation.sure'));
		$('#control_sidebar_reset').append($.i18n.prop('operation.reset'));
		
		$('#control_sidebar_organization_id_label').text($.i18n.prop('terms.organization'));
		$('#control_sidebar_community_id_label').text($.i18n.prop('terms.community'));
		
		if (APPLICATION.user) {
			$('#control_sidebar_content #user_info_container #user_name').text(APPLICATION.user.name);
			//if (APPLICATION.user.organization) $('#control_sidebar_organization_name').text(APPLICATION.user.organization.name);
			//if (APPLICATION.user.community) $('#control_sidebar_community_name').text(APPLICATION.user.community.name);
			if (APPLICATION.user.organization) $('#control_sidebar_organization_name').text(APPLICATION.user.organization.shortName);
			if (APPLICATION.data.selectedCommunity) $('#control_sidebar_community_name').text(APPLICATION.data.selectedCommunity.name);
			
			var deferred = $.Deferred();
			var deferreds = [];
			
			var communities;
			deferreds.push(
				createOrganizationSelect($('#control_sidebar_organization_id'), null, $('#control_sidebar_organization_id_container')), 
				createCommunitySelect($('#control_sidebar_community_id'), false, function(c) {communities = c;})
			);
			
			$.when.apply($, deferreds).then(function() {
				
				if (APPLICATION.user.organization) {
					$('#control_sidebar_organization_id').val(APPLICATION.user.organization.id).trigger('change');
				}
				if (APPLICATION.user.userType) {
					if (APPLICATION.user.userType.id == APPLICATION.codeHelper.userTypeOrganization.id) {
						$('#control_sidebar_organization_id').prop('disabled', false);
						APPLICATION.data.activeOrganizationId = APPLICATION.user.organization.id;
					}
					else {
						$('#control_sidebar_organization_id').prop('disabled', true);
					}
					/*
					if (APPLICATION.user.userType.id == APPLICATION.codeHelper.userTypeCustomer.id) {
						APPLICATION.data.activeCommunityId = APPLICATION.user.community.id;
						$('#control_sidebar_community_id').val(APPLICATION.user.community.id).trigger('change');
					}
					*/
					$('#control_sidebar_community_id').val(APPLICATION.data.selectedCommunityId).trigger('change');
				}
				
				$('#control_sidebar_content #control_sidebar_confirm').on('click', function(e) {
					e.preventDefault();
					var organizationId = $('#control_sidebar_organization_id').val();
					if ((organizationId) && (organizationId > 0)) {
						APPLICATION.data.activeOrganizationId = organizationId;
					}
					var communityId = $('#control_sidebar_community_id').val();
					if ((communityId) && (communityId > 0)) {
						APPLICATION.data.activeCommunityId = communityId;
						APPLICATION.data.selectedCommunityId = communityId;
						APPLICATION.data.selectedCommunity = communities.find((c) => c.id == communityId);
						$('#header_community_name').text(APPLICATION.data.selectedCommunity.name);
					}
					$.when(saveDataCookie()).
					done(function() {
						//$("#control_sidebar").removeClass("control-sidebar-open");
						//$('#nav_user_link').trigger('click');
						location.reload();
					});
				});
				
				/*
				$('#control_sidebar_content #control_sidebar_reset').on('click', function(e) {
					e.preventDefault();
					APPLICATION.data.activeOrganizationId = APPLICATION.user.organization.id;
					if (APPLICATION.user.userType.id == APPLICATION.codeHelper.userTypeCustomer.id) {
						APPLICATION.data.selectedCommunityId = APPLICATION.user.community.id;
					}
					$.when(saveDataCookie()).
					done(function() {
						location.reload();
					});
				});
				*/
				
				/*
				$(".wrapper").click(function() {
					if ($("#control_sidebar").hasClass("control-sidebar-open")) {
						$("#control_sidebar").removeClass("control-sidebar-open");
					}
				});
				*/				
				
				deferred.resolve();
				
			});
	
		}
		
	}
};
