/**
 * Author: Jack Lee
 * Version: 0.1
 * Date: 2025.04.19
 */

(function($) {
	
	$.fn.addressPicker = function(options) {
		
		var self = this;
		var defaults = {
			form: null, 
			data: null,
			autoOpen: true, 
			noSelect: null, 
			floorSelect: null, 
			roomSelect: null,
			idInput: null,
			noInput: null 
		};
		
		options = $.extend(defaults, options);
		
		self.data = options.data;
		if (options.autoOpen) self.autoOpen = options.autoOpen;
		if (options.noSelect) self.noSelect = options.noSelect;
		if (options.floorSelect) self.floorSelect = options.floorSelect;
		if (options.roomSelect) self.roomSelect = options.roomSelect;
		if (options.idInput) self.idInput = options.idInput;
		if (options.noInput) self.noInput = options.noInput;
		
		if (!self.form) {
			if (self.is('form')) self.form = self;
			else self.form = self.closest('form');
		}
		
		if (self.form) {
			if (!self.noSelect) self.noSelect = $(':input[name="addressNo"]', self.form);
			if (!self.floorSelect) self.floorSelect = $(':input[name="addressFloor"]', self.form);
			if (!self.roomSelect) self.roomSelect = $(':input[name="addressRoom"]', self.form);
			if (!self.noInput) self.noInput = $(':input[name="customerNo"]', self.form);
			if (!self.noInput) self.noInput = $(':input[name="no"]', self.form);
			if (!self.idInput) self.idInput = $(':input[name="customerId"]', self.form);
			if (!self.idInput) self.idInput = $(':input[name="id"]', self.form);
		}

		if (self.noSelect) {
			if (self.data) {
				var nos = [];
				self.data.forEach((e) => {if (nos.indexOf(e.addressNo) < 0) nos.push(e.addressNo)});
				buildSelect2(self.noSelect, nos, true, false, true, '?');
				self.noSelect.val('');
			}		
		
			self.noSelect.on('change', null, function(e) {
				var no = $(this).val();
				if (!no) {
					self.floorSelect.select2({'data': null});
					self.roomSelect.select2({'data': null});
					self.floorSelect.val('');
					self.roomSelect.val('');
					if (self.idInput.val()) {
						self.idInput.val('');
						self.noInput.val('');
					}
				}
				else {
					var addresses = self.data.filter((e) => e.addressNo === no);
					var floors = [{'id': '', 'text': '?'}];
					addresses.forEach((e) => {if (floors.indexOf(e.addressFloor) < 0) floors.push(e.addressFloor)});
					self.floorSelect.select2({'data': floors, 'allowClear': false});
					if (self.autoOpen) self.floorSelect.select2('open');
				}
			});
		}
		
		if (self.floorSelect) {
			buildSelect2(self.floorSelect, null, false, false, false);
			self.floorSelect.on('change', null, function(e) {
				var no = self.noSelect.val();
				var floor = $(this).val();
				if (floor) {
					var rooms = [{'id': '', 'text': '?'}];
					var addresses = self.data.filter((e) => e.addressNo === no && e.addressFloor === floor);
					addresses.forEach((e) => {if (rooms.indexOf(e.addressRoom) < 0) rooms.push(e.addressRoom);});
					self.roomSelect.select2({'data': rooms, 'allowClear': false});
					if (self.autoOpen) self.roomSelect.select2('open');
				}
			});
		}
				
		if (self.roomSelect) {
			buildSelect2(self.roomSelect, null, false, false, false);
			self.roomSelect.on('change', null, function(e) {
				if ((self.noInput) && (self.idInput)) {
					var no = self.noSelect.val();
					var floor = self.floorSelect.val();
					var room = $(this).val();
					var item = self.data.find((e) => e.addressNo === no && e.addressFloor === floor && e.addressRoom === room);
					if (item) {
						self.noInput.prop('value', item.no);
						self.idInput.prop('value', item.id);
						self.idInput.trigger('change');
					}
				}
			});
		}
				
		if ((self.noInput) && (self.idInput)) {
			self.noInput.on('change', null, function(e) {
				if (self.idInput.val()) self.idInput.val('');
			});
		}
		
		return self;
	}
	
}(jQuery));