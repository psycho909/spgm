/**
 * Author: Jack Lee
 * Version: 0.4
 * Date: 2025-04-20
 */

(function($) {
	
	$.fn.editForm = function(options) {
		
		var self = this;
		var defaults = {
			data: null,
			form: null,
			table: null,
			dataTable: null,
			activeRow: null,
			//activeRowClass: 'bg-info',
			activeRowClass: 'selected_row',
			save: null,
			saveUrl: null,
			load: null,
			remove: null,
			removeUrl: null,
			cancel: null,
			confirm: null,
			refresh: null,
			beforeEdit: null,
			beforeSave: null,
			afterLoad: null,
			afterRefresh: null,
			afterCopy: null,
			afterSave: null,
			beforePopulate: null,
			afterPopulate: null,
			//beforeRefresh: null,
			//afterRefresh: null
			afterRowClick: null,
			postProcess: null,
			processAction: null,
			validator: null,
			cardSwitcher: null, 
			idField: null, 
			alwaysShowOperation: false
		}
		options = $.extend(defaults, options);

		self.form = options.form;
		self.table = options.table;
		self.dataTable = options.dataTable;
		self.activeRow = options.activeRow;
		self.activeRowClass = options.activeRowClass;
		self.saveUrl = options.saveUrl;
		self._action = CONSTANT.ACTION.INQUIRY;
		self._data = options.data;
		self._backupData = self._data;
		self.remove = options.remove;
		self.removeUrl = options.removeUrl;
		self.alwaysShowOperation = options.alwaysShowOperation;
		if (options.loadData) self.loadData = options.loadData;
		if (options.cancel) self.cancel = options.cancel;
		if (options.refresh) self.refresh = options.refresh;
		if (options.save) self.save = options.save;
		if (options.confirm) self.confirm = options.confirm;
		if (options.beforeEdit) self.beforeEdit = options.beforeEdit;
		if (options.beforeSave) self.beforeSave = options.beforeSave;
		if (options.afterSave) self.afterSave = options.afterSave;
		if (options.afterCopy) self.afterCopy = options.afterCopy;
		if (options.beforePopulate) self.beforePopulate = options.beforePopulate;
		if (options.afterPopulate) self.afterPopulate = options.afterPopulate;
		//if (options.beforeRefresh) self.beforeRefresh = options.beforeRefresh;
		//if (options.afterRefresh) self.afterRefresh = options.afterRefresh;
		if (options.afterRowClick) self.afterRowClick = options.afterRowClick;
		if (options.postProcess) self.postProcess = options.postProcess;
		if (options.processAction) self.processAction = options.processAction;
		if (options.validator) self.validator = options.validator;
		
		if (typeof options.cardSwitcher == CONSTANT.TYPE.OBJECT) self.cardSwitcher = options.cardSwitcher;
		else self.cardSwitcher = null;
		/*
		if (options.validator) {
			self.validator = options.validator;
			if (self.validator.settings) {
				if (!self.validator.settings.errorPlacement) {
					self.validator.settings.errorPlacement = function (error, element) {
						error.addClass("invalid-feedback");
						if (element.prop("type") === "checkbox") {
							error.insertAfter(element.next("label"));
						} 
						else {
							error.insertAfter(element);
						}
					};
					self.validator.settings.highlight = function(element, errorClass, validClass) {
						$(element).addClass("is-invalid").removeClass("is-valid");
					};
					self.validator.settings.unhighlight = function (element, errorClass, validClass) {
						$(element).addClass("is-valid").removeClass("is-invalid");
					};
				}
			}	
		}
		*/
		
		self.action = function(action) {
			if (action) self._action = action;
			else return self._action;
		}
		
		self.formData = function(json) {
			if (arguments.length > 0) self._data = json;
			else return self._data;
		};

		self.easySave = function() {
			if ((!self.saveUrl) || (!self.form)) return;
			if (self.validator) {
				if (!self.form.valid()) return false;
			}
			if (toast) toast.fire({
				type: 'info', 
				title: $.i18n.prop('operation.saving') + ' ' + $.i18n.prop('operation.waiting') 
			});
			
			var saving = self.form.serializeObject();
			if (saving.updated) delete saving.updated;
			if (!saving.id) saving.id = 0;
			
			if (self.beforeSave) {
				var modified = self.beforeSave(saving);
				if (modified) saving = modified;
			}
			
			var deferred = $.Deferred();
			try {
				ajaxPost(self.saveUrl, saving, function(saved) {
					if (toast) toast.close();
					deferred.resolve(saved);
				});
			}
			catch (e) {
				if (toast) toast.close();
				deferred.resolve(null);
			}
			return deferred.promise();
		};
		
		if (!self.loadData) self.loadData = function(action, activeRow) {
			if (action == CONSTANT.ACTION.ADD) {
				self.formData({
					id: 0,
					status: 1
				});
			}
			/*
			else {
				if (activeRow) editForm.formData(editForm.activeRow.data());
			}
			*/
		};
		
		if (!self.cancel) self.cancel = function() {
			$(':input:visible:not(.operation)', self.form).off('change', self.changeUpdated);
			self.form[0].reset();
			if (self._backupData) self._data = self._backupData;
			//if (self.validator) self.validator.resetForm();
			if ($('input[name="updated"]', self.form)) $('input[name="updated"]', self.form).val('0');
			
			self.action(CONSTANT.ACTION.INQUIRY);
			self.process(CONSTANT.ACTION.INQUIRY);
			//self.process(self.action());
			
			if (self.validator) {
				self.validator.resetForm();
				$(".error").removeClass("error");
				/*
				$(".is-valid").removeClass("is-valid");
				$(".is-invalid").removeClass("is-invalid");
				*/
			}
			self.refresh();
		};
		//
		if (!self.disable) self.disable = function(disabled) {
			if (!disabled) {
				$(':input', self.form).removeAttr('disabled');
			}
			else {
				$(':input:not(.operation, .btn-tool)', self.form).attr('disabled', 'disabled');
			}
		};
		//
		if (!$('input[name="updated"]', self.form).length) self.form.append('<input type="hidden" name="updated" value="0" />');
		self.changeUpdated = function(e) {
			if ($('input[name="updated"]', self.form)) {
				if ($('input[name="updated"]', self.form).val() == '0') $('input[name="updated"]', self.form).val('1');
			}
		}
		//
		if (!self.refresh) self.refresh = function() {
			//self.form[0].reset();
			$(':input:not(.operation)', self.form).off('change', self.changeUpdated);
			/*
			if (self.beforePopulate) self.beforePopulate(self._action);
			if (self._data) {
				self.form.populate(self._data);
				$('.select2', self.form).trigger('change.select2');
				$('.icheck, .icheckbox').iCheck('update');
			}
			if (self._action == CONSTANT.ACTION.COPY) self._data.id = '0';
			if (self.afterPopulate) self.afterPopulate(self._action);
			$(':input:not(.operation)', self.form).on('change', self.changeUpdated);
			*/
			if (self.beforePopulate) {
				var calling = self.beforePopulate(self._action);
				if (calling) {
					if (calling.promise) {
						$.when(calling).done(() => {
							if (self._data) {
								self.form.populate(self._data);
								$('.select2', self.form).trigger('change.select2');
								$('.icheck, .icheckbox').iCheck('update');
							}
							if (self._action == CONSTANT.ACTION.COPY) self._data.id = '0';
							if (self.afterPopulate) {
								$.when(self.afterPopulate(self._action)).done(() => {
									
								});
							}
							$(':input:not(.operation)', self.form).on('change', self.changeUpdated);
						});
					}
					else {
						//
						if (self._data) {
							self.form.populate(self._data);
							$('.select2', self.form).trigger('change.select2');
							$('.icheck, .icheckbox').iCheck('update');
						}
						if (self._action == CONSTANT.ACTION.COPY) self._data.id = '0';
						//
					}
				}
				else if (self.afterPopulate) {
					//
					if (self._data) {
						self.form.populate(self._data);
						$('.select2', self.form).trigger('change.select2');
						$('.icheck, .icheckbox').iCheck('update');
					}
					if (self._action == CONSTANT.ACTION.COPY) self._data.id = '0';
					//
					$.when(self.afterPopulate(self._action)).done(() => {
						
					});
				}
			}
			else if (self.afterPopulate) {
				//
				if (self._data) {
					self.form.populate(self._data);
					$('.select2', self.form).trigger('change.select2');
					$('.icheck, .icheckbox').iCheck('update');
				}
				if (self._action == CONSTANT.ACTION.COPY) self._data.id = '0';
				//
				$.when(self.afterPopulate(self._action)).done(() => {
					
				});
			}
		};
		//
		if (!self.process) self.process = function(action) {
			switch (action) {
			case CONSTANT.ACTION.INQUIRY:
				self.disable(true);
				if (self.validator) self.form.validate({'ignore': '*'});
				
				/*
				if (self._data) {
					$('.operation[value="A"], .operation[value="U"], .operation[value="D"], .operation[value="Y"], .operation[value="K"]', self.form).attr('disabled', false);
				}
				else {
					$('.operation[value="A"]', self.form).attr('disabled', false);
					$('.operation[value="U"], .operation[value="D"], .operation[value="Y"]', self.form).attr('disabled', true);
				}
				*/
				if (self.alwaysShowOperation) {
					$('.operation[value="K"]', self.form).attr('disabled', true);
					$('.operation[value="S"], .operation[value="C"]', self.form).attr('disabled', true);
					$('.operation[value="A"], .operation[value="U"], .operation[value="D"], .operation[value="Y"], .operation[value="M"], .operation[value="J"]', self.form).attr('disabled', false);
				}
				else {
					$('.operation[value="K"]', self.form).removeClass('d-none');
					$('.operation[value="A"], .operation[value="U"], .operation[value="D"], .operation[value="Y"], .operation[value="S"], .operation[value="C"], .operation[value="M"], .operation[value="J"]', self.form).addClass('d-none');
				}
					
				//$('.operation[value="{0}"], .operation[value="{1}"]'.format(CONSTANT.ACTION.CANCEL, CONSTANT.ACTION.SAVE), self.form).attr('disabled', true);
				if (self.table) $('button.operation', self.table[0]).attr('disabled', false);
				$('.inner_operation[value="U"], .inner_operation[value="D"], .inner_operation[value="Y"], .inner_operation[value="CA"], .inner_operation[value="UA"]', self.form).attr('disabled', true);
				//if (self.validator) self.validator.resetForm();
				
				$('.nav-tabs a:first').tab('show');
				
				break;
			case CONSTANT.ACTION.ADD:
			case CONSTANT.ACTION.COPY:
			case CONSTANT.ACTION.UPDATE:
			case CONSTANT.ACTION.APPROVE:
				$(':input:visible:not(.operation)', self.form).off('change', self.changeUpdated);
				if (self.table) $('button.operation', self.table[0]).attr('disabled', true);
				//if (self.loadData) self.loadData(action, self.activeRow);
				self.disable(false);
				$('.operation[value="K"]', self.form).addClass('d-none');
				if ((self._data) && (self._data.id > 0)) {
					if (self.alwaysShowOperation) {
						if (action != CONSTANT.ACTION.UPDATE) $('operation[value="Y"], .operation[value="S"], .operation[value="C"], .operation[value="M"], .operation[value="J"]', self.form).attr('disabled', false);
						else $('.operation[value="D"], .operation[value="Y"], .operation[value="S"], .operation[value="C"], .operation[value="M"], .operation[value="J"]', self.form).attr('disabled', false);
					}
					else {
						if (action != CONSTANT.ACTION.UPDATE) $('.operation[value="Y"], .operation[value="S"], .operation[value="C"], .operation[value="M"], .operation[value="J"]', self.form).removeClass('d-none');
						else $('.operation[value="D"], .operation[value="Y"], .operation[value="S"], .operation[value="C"], .operation[value="M"], .operation[value="J"]', self.form).removeClass('d-none');
					}
					//self._backupData = self._data;
					self._backupData = $.extend({}, self._data);
					//if (action == CONSTANT.ACTION.COPY) self._data.id = '0';
					if (action == CONSTANT.ACTION.COPY) {
						swal.fire({
							title: $.i18n.prop('operation.copy'),
							text: $.i18n.prop('operation.copy.hint'),
							type: "info",
							html: '',
							showCancelButton: true,
							confirmButtonClass: "btn-primary",
							confirmButtonText: $.i18n.prop('operation.copy'),
							cancelButtonText: $.i18n.prop('operation.cancel')
						})
						.then(function(result) {
							if (!result.value) {
								self.process(CONSTANT.ACTION.INQUIRY);
								return false;
							}
							else {
								self._data.id = 0;
								if (self.form) $('#id', self.form).val('0');
								self.mode = action;
								if (self.afterCopy) self.afterCopy();
							}
						});
					}
				}
				else {
					if (self.alwaysShowOperation) {
						$('.operation[value="S"], .operation[value="C"]', self.form).attr('disabled', false);
					}
					else {
						$('.operation[value="S"], .operation[value="C"]', self.form).removeClass('d-none');
					}
				}
				
				if (self.loadData) self.loadData(action, self.activeRow);
				self.refresh();
				
				$(':input:visible:not(.operation, [readonly], [disabled]):first', self.form).focus();
				//$('.operation:not([value="{0}"], [value="{1}"])'.format(CONSTANT.ACTION.CANCEL, CONSTANT.ACTION.SAVE), self.form).attr('disabled', true);
				//$('.operation[value="{0}"], .operation[value="{1}"]'.format(CONSTANT.ACTION.CANCEL, CONSTANT.ACTION.SAVE), self.form).attr('disabled', false);
				if (self.beforeEdit) self.beforeEdit();
				if ($('input[name="updated"]', self.form)) $('input[name="updated"]', self.form).val('0');
				$('.inner_operation[value="U"], .inner_operation[value="D"], .inner_operation[value="Y"], .inner_operation[value="CA"], .inner_operation[value="UA"]', self.form).attr('disabled', false);
				$(':input:visible:not(.operation)', self.form).on('change', self.changeUpdated);
				if (self.validator) self.form.validate({'ignore': ':disabled'});
				break;
			case CONSTANT.ACTION.DELETE:
				swal.fire({
					//title: $.i18n.prop('operation.confirm'),
					text: $.i18n.prop('operation.remove.confirm'),
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-danger",
					confirmButtonText: $.i18n.prop('operation.remove'),
					cancelButtonText: $.i18n.prop('operation.cancel')
				})
				.then(function(result) {
					if (result.value) {
						if (toast) {
							toast.fire({
								type: 'info', 
								title: $.i18n.prop('operation.removing') + ' ' + $.i18n.prop('operation.waiting') 
							});
						}
						if (self.remove) {
							self.remove();
						}
						else if (self.removeUrl) {
							try {
								/*
								var parameters = {};
								parameters.id = $('input[name="id"]', self.form).val();
								ajaxDelete(self.removeUrl, {'id': $('input[name="id"]', self.form).val()}, function(text) {
									var json = JSON.parse(text);
									if (json.success) {
										if ((self.dataTable) && (self.serverSide) && (self.dataTable.ajax)) {
											self.dataTable.ajax.reload();
										}
										else if (window.refresh) window.refresh();
									}
								});
								*/
								ajaxDelete(self.removeUrl + "/" + $('input[name="id"]', self.form).val(), null, function(text) {
									if (toast) toast.close();
									if ((text) && (!isNaN(text))) {
										if ((self.dataTable) && (self.serverSide) && (self.dataTable.ajax)) {
											self.dataTable.ajax.reload();
										}
										else if (window.refresh) window.refresh();
										if (self.cardSwitcher) self.cardSwitcher.switch(1);
									}
								});
							}
							catch (e) {
								if (toast) toast.close();
							}
						}
					} 
				});				
				break;
			case CONSTANT.ACTION.CANCEL:
				if ($('input[name="updated"]', self.form).val() == '1') {
					swal.fire({
						//title: $.i18n.prop('operation.confirm'),
						text: $.i18n.prop('operation.cancel.confirm'),
						type: "warning",
						showCancelButton: true,
						confirmButtonClass: "btn-warning",
						confirmButtonText: $.i18n.prop('operation.confirm'),
						cancelButtonText: $.i18n.prop('operation.cancel')
					})
					.then(function(result) {
						if (result.value) {
							self.cancel();
							if (self.validator) self.validator.resetForm();
							if (self.cardSwitcher) self.cardSwitcher.switch(1);
						}
					});
				}
				else {
					self.cancel();
					if (self.validator) self.validator.resetForm();
					if (self.cardSwitcher) self.cardSwitcher.switch(1);
				} 
				break;
			case CONSTANT.ACTION.BACK_TO_LIST:
				if ((self.action() == CONSTANT.ACTION.ADD) || (self.action() == CONSTANT.ACTION.UPDATE)) self.cancel();
				break;
			case CONSTANT.ACTION.SAVE:
				if ((!self.saveUrl) || (!self.form)) return;
				//var savingId = $('#id', self.form).val();
				if (self.validator) {
					if (!self.form.valid()) return false;
				}
				var saveMethod = self.save ? self.save : self.easySave;
				//if (self.save) {
				if (saveMethod) {
					//$.when(self.save()).
					$.when(saveMethod()).
					done(function(saved) {
						if (saved) self.formData(saved);
						if (self.afterSave) self.afterSave();
						//if (self.validator) self.form.validator('disableSubmitButtons', false);
						if (saved) {
							if (toast) {
								toast.fire({
									type: 'info', 
									title: $.i18n.prop('operation.saved') 
								});
							}
							
							if (self.table) {
								try {
									$('button.operation', self.table[0]).attr('disabled', false);
									//self.dataTable.row.add(saved);
									//if (savingId == 0) {
										//if (self.dataTable.serverSide) { 
											if (typeof loadTable == CONSTANT.TYPE.FUNCTION) {
												self.dataTable.ajax.reload(function() {
													var datas = self.dataTable.data();
													if (datas) {
														var rowIndex = 0;
														for (var i = 0; i < datas.length; i++) {
															if ((datas[i].id) && (datas[i].id == saved.id)) {
																rowIndex = i;
																break;
															}
														}
														self.activeRow = self.dataTable.row(rowIndex);
													}
													if (self.activeRow) $(self.activeRow.node()).trigger('click');
												}, false);
											}
										/*
										}
										else {
											self.dataTable.row.add(saved);
											//self.dataTable.draw();
										}
										*/
									/*
									}
									else {
										var tableRow;
										if (self.activeRow) {
											self.activeRow.data(saved).invalidate();
											tableRow = $('tbody tr:eq({0})'.format(self.activeRow.index()), self.dataTable.node());
										}
										else {
											tableRow = $('tbody tr:first', self.dataTable.node());
										}
										if (tableRow) tableRow.trigger('click');
									}
									*/
								}
								catch (e) {}
							}
						}
						if (self.validator) {
							self.validator.resetForm();
							try {self.form.validator('update', true);}
							catch (e) {}
						}
						self.refresh();
						//self.process(CONSTANT.ACTION.INQUIRY);
						if (self.cardSwitcher) self.cardSwitcher.switch(1);
					});
				}
				
				break;
			case CONSTANT.ACTION.CONFIRM:
				if (self.confirm) self.confirm();
				break;
			default:
				if (self.processAction) self.processAction(action);
			}
			if (self.postProcess) self.postProcess(action);
		};
		//
		if (self.table) {
			$('tbody', self.table[0]).on('click', 'td button.operation', function(e) {
				if (e) e.preventDefault();
				self.processTableOperation(e);
				if (self.closest('.card_switcher')) if ($('.card_switcher').cardSwitcher().switched != 2) $('.card_switcher').cardSwitcher().switch(2);
			});
			
			$('tbody', self.table[0]).on('click', 'tr', function(e) {
				if (e) e.preventDefault();
				var that = this;
				self.activeRow = self.dataTable.row(that);
				$('tbody tr.' + self.activeRowClass, self.table[0]).removeClass(self.activeRowClass);
				$(that).addClass(self.activeRowClass);
				if (self.afterRowClick) {
					self.afterRowClick(self.activeRow.data());
				}
				if (self.activeRow) {
					self.formData(self.activeRow.data());
					if (self.loadData) self.loadData(CONSTANT.ACTION.INQUIRY, self.activeRow);
					self.refresh();
					self.process(CONSTANT.ACTION.INQUIRY);
				}
		    });
		    
			$('tbody', self.table[0]).on('dblclick', 'tr', function(e) {
				if (e) e.preventDefault();
				if ($(self).closest('.card_switcher')) {
					if ($('.card_switcher').cardSwitcher().switched != 2) $('.card_switcher').cardSwitcher().switch(2);
				}
				//self.processTableOperation(e);
		    });
		}
		//
		self.processTableOperation = function(e) {
			var element = $(e.target.closest('button'));
			if (!element) return true;
			e.preventDefault();
			e.stopPropagation();
			var tableRow = element.closest('tr');
			$('tbody tr.' + self.activeRowClass, self.table[0]).toggleClass(self.activeRowClass);
			tableRow.toggleClass(self.activeRowClass);
			self.activeRow = self.dataTable.row(tableRow);
			if (self.activeRow) {
				self.formData(self.activeRow.data());
				self.refresh();
				if (element.hasClass('inquiry')) {
					self._action = CONSTANT.ACTION.INQUIRY;
					self.process(self._action);
				}
				else if (element.hasClass('edit')) {
					self._action = CONSTANT.ACTION.UPDATE;
					self.process(self._action);
				}
				else if (element.hasClass('delete')) {
					self._action = CONSTANT.ACTION.DELETE;
					self.process(self._action);
				}
			}
		};
		
		$('button.operation', self.form).on('click', function(e) {
			e.preventDefault();
			self._action = $(this).val();
			self.process(self._action);
		});

		$('#tab_reply').on('click', function(e) {
			if (e) e.preventDefault();
			if (self.cardSwitcher) self.cardSwitcher.switch(1);
		});
		

		return self;
	}
	
}(jQuery));
