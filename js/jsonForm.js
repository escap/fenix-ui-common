/*

USAGE:
	jsonForm('#form-contact', 'json/schema.contact.json');

	//new dom element
	var form$ = $('<form>').prependTo('body');
	jsonForm(form$, 'json/schema.contact.json');

*/
define([
	'require','jquery','underscore','handlebars','jsoneditor',
	//'fmdTheme',
	'text!html/jsonForm.html'
], function (require, $, _, Handlebars, JSONEditor, 
	//FMDTheme,
	jsonFormHtml) {

	var tmplJsonForm = Handlebars.compile(jsonFormHtml);

	function jsonForm(target, opts) {

		opts = opts || {};

		var self = this;

		self.target = (target instanceof jQuery) ? target : $(target);


		self.opts = _.defaults(opts, {
			template: 'handlebars',
			theme: 'bootstrap3',		
			iconlib: 'fontawesome4',
			//TODO languages using module nls/jsoneditor_errors.js

			ajax: true,
			editable: false,
			disable_collapse: true,
			disable_edit_json: true,
			disable_properties: true,
			disable_array_reorder: true,

			values: {},
			schema: _.isString(opts.schema) ? {$ref: require.toUrl(opts.schema)} : opts.schema,
			disabled: [],

			tmpl: {
				idform: self.target.attr('id'),
				submit: 'Save',
				reset: 'Cancel'
			},
			//ballbacks
			onChange: $.noop,
			onSubmit: $.noop,
			onReset: $.noop
		});

		if(!_.isUndefined(opts.editable))
			self.opts = _.extend(self.opts, {
				editable:              opts.editable,
				disable_collapse:     !opts.editable,
				disable_edit_json:    !opts.editable,
				disable_properties:   !opts.editable,
				disable_array_reorder:!opts.editable
			});

		self.target.html( tmplJsonForm(self.opts.tmpl) );

		self.$form = self.target.find('form');

		self.editor = new JSONEditor(self.target.find('.form-wrapper-content')[0], self.opts);

		if(self.opts.disabled.length>0)
			_.each(self.opts.disabled, function(key) {
				self.editor.getEditor('root.'+key).disable();
			});

		self.editor.on('change', _.after(2, function(e) {
			self.opts.onChange.call(self, self.editor.getValue() );
		}) );

		if(!_.isEmpty(self.opts.values))
			self.editor.setValue(self.opts.values);

		self.target.find('.form-wrapper-submit').on('click', function(e) {
			e.preventDefault();
			self.opts.onChange.call(self, self.editor.getValue() );
			self.opts.onSubmit.call(self, self.editor.getValue() );
		});

		self.target.find('.form-wrapper-reset').on('click', function(e) {
			e.preventDefault();
			
			self.reset();

			self.opts.onChange.call(self, self.editor.getValue() );
			self.opts.onReset.call(self, self.editor.getValue() );
		});
	};


	jsonForm.prototype.reset = function() {
		
		this.$form[0].reset();

		this.editor.root.refreshValue();
	};


	//TODO add function to reset form and json-editor

	return jsonForm;
});