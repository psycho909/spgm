/**
 * Author: Jack Lee
 * Version: 0.1
 * Date: 2024.8.30
 */

(function($) {
	
	$.fn.cardExpander = function(options) {
		
		var self = this;
		var defaults = {
			expanded: false, 
			expendClass: 'col-12', 
			collapseClass: 'col-0 d-none', 
			expendedIcon: 'fa-forward-step', 
			collapsedIcon: 'fa-backward-step'
		};
		
		options = $.extend(defaults, options);
		
		self.expanded = options.expanded;
		self.expendClass = options.expendClass;
		self.collapseClass = options.collapseClass;
		self.expendedIcon = options.expendedIcon;
		self.collapsedIcon = options.collapsedIcon;
		self.row = null;
		self.leftCol = null;
		self.rightCol = null;
		self.leftColClass = null;
		self.rightColClass = null;

		if (!self.row) {
			self.row = $(self).closest('div.row');
			var divs = $('> div', self.row);
			if (divs.length > 1) {
				self.leftCol = $('> div', self.row)[0];
				self.rightCol = $('> div', self.row)[1];
				if ((self.leftCol) && (self.rightCol)) {
					self.leftColClass = $(self.leftCol).attr('class');
					self.rightColClass = $(self.rightCol).attr('class');
				}
			}
		}

		self.expand = function(expanding) {
			if ((self.row) && (self.leftCol) && (self.rightCol)) {
				if (expanding) {
					$(self.rightCol).removeClass();
					$(self.rightCol).addClass(self.collapseClass);
					$(self.leftCol).removeClass();
					$(self.leftCol).addClass(self.expendClass);
					$('i', self).removeClass(self.expendedIcon).addClass(self.collapsedIcon);
				}
				else {
					$(self.leftCol).removeClass(self.collapseClass);
					$(self.leftCol).attr('class', self.leftColClass);
					$(self.rightCol).removeClass(self.expendClass);
					$(self.rightCol).attr('class', self.rightColClass);
					$('i', self).removeClass(self.collapsedIcon).addClass(self.expendedIcon);
				}
				self.expanded = expanding;
			}
		};
		
		self.on('click', function(e) {
			e.preventDefault();
			self.expand(!self.expanded);
		});
		
		if (self.expanded) {
			self.expand(self.expanded);
		}

		return self;
	}
	
}(jQuery));