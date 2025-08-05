/**
 * Author: Jack Lee
 * Version: 0.1
 * Date: 2024.10.08
 */

(function($) {
	
	$.fn.cardSwitcher = function(options) {
		
		var self = this;
		var defaults = {
			switched: 1, 
			form: null,
			expendClass: 'col-12', 
			collapseClass: 'col-0 d-none', 
			expendedIcon: 'fa-forward-step', 
			collapsedIcon: 'fa-backward-step'
		};
		
		options = $.extend(defaults, options);
		
		self.switched = options.switched;
		self.expendClass = options.expendClass;
		self.collapseClass = options.collapseClass;
		self.expendedIcon = options.expendedIcon;
		self.collapsedIcon = options.collapsedIcon;
		self.form = options.form;
		//self.row = null;
		self.leftCol = null;
		self.rightCol = null;
		self.leftColClass = null;
		self.rightColClass = null;

		//if (!self.row) {
			//self.row = $(self).closest('div.row');
			//var divs = $('> div', self.row);
			var divs = $('> div', self);
			if (divs.length > 1) {
				//self.leftCol = $('> div', self.row)[0];
				//self.rightCol = $('> div', self.row)[1];
				self.leftCol = $('> div', self)[0];
				self.rightCol = $('> div', self)[1];
				if ((self.leftCol) && (self.rightCol)) {
					self.leftColClass = $(self.leftCol).attr('class');
					self.rightColClass = $(self.rightCol).attr('class');
				}
			}
		//}

		self.switch = function(switching) {
			//if ((self.row) && (self.leftCol) && (self.rightCol)) {
			if ((self.leftCol) && (self.rightCol)) {
				if (switching == 1) {
					//if (editForm) editForm.process(CONSTANT.ACTION.INQUIRY);
					$(self.rightCol).removeClass();
					$(self.rightCol).addClass(self.collapseClass);
					$(self.leftCol).removeClass();
					$(self.leftCol).addClass(self.expendClass);
					//$('i', self).removeClass(self.expendedIcon).addClass(self.collapsedIcon);
					//if (!self.form.alwaysShowOperation) {
						$('#title_operation_container a.title_back_to_list').addClass('d-none');
						$('#title_operation_container a:not(.title_back_to_list)').removeClass('d-none');
					//}
				}
				else {
					$(self.leftCol).removeClass(self.expendClass);
					$(self.leftCol).addClass(self.collapseClass);
					//$(self.leftCol).attr('class', self.leftColClass);
					$(self.rightCol).removeClass(self.collapseClass);
					$(self.rightCol).addClass(self.expendClass);
					//$(self.rightCol).attr('class', self.rightColClass);
					//$('i', self).removeClass(self.collapsedIcon).addClass(self.expendedIcon);
					
					if (!self.form) {
						if (typeof editForm == CONSTANT.TYPE.OBJECT) self.form = editForm;
					}
					if (self.form) {
						var action = self.form.action();
						if (action) {
							if (action == CONSTANT.ACTION.INQUIRY) {
								//if (!self.form.alwaysShowOperation) {
									$('#title_operation_container a.title_back_to_list').removeClass('d-none');
									$('#title_operation_container a:not(.title_back_to_list)').addClass('d-none');
								//}
							}
							else if ((action == CONSTANT.ACTION.ADD) || (action == CONSTANT.ACTION.UPDATE)) {
								$('#title_operation_container a').addClass('d-none');
							}
						}
					}
				}
				self.switched = switching;
			}
		};
		
		$('.card_switcher_button').on('click', function(e) {
			e.preventDefault();
			self.switch(self.switched == 1 ? 2 : 1);
		});
		
		if (self.switched) {
			self.switch(self.switched);
		}

		return self;
	}
	
}(jQuery));