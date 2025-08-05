APPLICATION.communityDialog = {
	element: $('#community_form_modal'),
	form: $('#modal_community_form'), 
	communities: null, 
	loaded: false,
	shown: false,
	initial: function() {
		if (APPLICATION.communityDialog.loaded) return;
		//var deferred = $.Deferred();
		//
		$.i18n.properties({
			language: getPageLocale(),
		    name: ['common-message'], 
		    path: APPLICATION.SETTING.defaultLanguageFilePath, 
		    mode: 'map',
		    cache: true,
		    callback: function() {
		    	$('#community_confirm', APPLICATION.communityDialog.form).text($.i18n.prop('operation.sure'));
		    	$('#modal_community_form_title', APPLICATION.communityDialog.element).text($.i18n.prop('terms.community'));
		    	$('#modal_community_text', APPLICATION.communityDialog.element).text(i18nCombine(language, 'operation.choose', 'terms.community'));
		    }
		});

		/*
		ajaxGet(URLS.COMMUNITY.LIST_BY_USER + APPLICATION.user.id, null, function(json) {
			APPLICATION.communityDialog.communities = json;
			var data = [];
			for (var i = 0; i < json.length; i++) data.push({'id': json[i].id, 'text': json[i].no + '-' + json[i].name});
			buildSelect2($('#modal_community_id'), data, false, false);
			deferred.resolve();
		});
		*/
		var data = [];
		APPLICATION.data.communities.forEach((c) => {
			data.push({'id': c.id, 'text': c.no + '-' + c.name});
		});
		buildSelect2($('#modal_community_id'), data, false, false);
		
		//return deferred;
	},
	show: function() {
		if (APPLICATION.communityDialog.shown) return;
		APPLICATION.communityDialog.shown = true;
		APPLICATION.communityDialog.element.modal('toggle');
	}
};

function buildSelect2(selector, options, addDefaultOption, multiple) {
	if (addDefaultOption) options = [{'id': '-1', 'text': $.i18n.prop('operation.choose')}].concat(options);
	if (!multiple) multiple = false;
	var options = {
		"data": options ? options : [],
		"multiple": multiple,
		"allowClear": true, 
		"closeOnSelect": !multiple,
		"theme": 'bootstrap4',
		"placeholder": $.i18n.prop('operation.choose')
	};
	return selector.select2(options).maximizeSelect2Height();
}
