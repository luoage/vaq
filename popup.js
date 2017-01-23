/**
 * popup
 * @author luoage@msn.cn
 *
 * @dep jquery
 * @dep ./jq_mask
 * @dep ./base
 * @example
 *
 */
(function(factory) {
	// CommonJs
	if (typeof exports === 'object' && typeof module === 'object') {
		module.exports = factory(require);
	// requirejs
	} else if (typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		throw new Error('You can use webpack or third party plugins that support the CMD protocol.');
	}
})(function(require) {
	var $ = require('jquery');
	var base = require('./base');
	var Mask = require('./mask');

	var layout = $('body').addClass('lg-lg-lg');
	var eleHtml = $('html');

	var template = 
		'			<div class="lg-container">'
		+'				<div class="lg-content">'
		+'					<[ if(opts.close) {]>'
		+'					<a class="lg-close" href="javascript:;">×</a>'
		+'					<[ } ]>'
		+'					<[ if(opts.title) {]>'
		+'					<div class="lg-title"><[- opts.title ]></div>'
		+'					<[ } ]>'
		+'					<div class="lg-render">'
		+'					<[- opts.html ]>'
		+'					</div>'
		+'					<[ if(opts.buttons && opts.buttons.length ) {]>'
		+'						<div class="lg-buttons">'
		+'							<[ opts.buttons.forEach(function(item) {]>'
		+'							<a href="javascript:;" data-name="<[- item.name ]>"><[- item.name ]></a>'
		+'							<[ }) ]>'
		+'						</div>'
		+'					<[ } ]>'
		+'				</div>'
		+'			</div>'
		;

	var options = {
		layout: layout,
		title: '',
		css: {},
		close: true,
		buttons: [],
		html: ''
	};

	var Popup = base.inherit({
		// 初始化
		initialize: function(opts) {
			this.opts = $.extend({
				target: $('<div>'),
				isMask: true
			}, options, opts);

			this._stack = []; // 弹窗队列, 用于在一个弹窗中切换内容

			var opts = this.opts;

			opts.target.addClass('lg-popup').css(opts.css);
			eleHtml.addClass('lg-overflow');

			this.target = $('<div>');

			this.popup = this.target;
			this.addEvent();
			this.render();

			opts.layout.append(opts.target);
			if (opts.isMask && !opts.mask) {
				this.opts.mask = new Mask(opts.target, {loading: false}).render();
			}
		},

		complete: function(cb) {
			typeof cb === 'function' && cb(this);
		},

		/**
		 *
		 */
		back: function() {
			var stack = this._stack.pop();

			$.extend(this, stack);

			/*
			console.log(stack.target);
			console.log(stack.opts);
			console.log(this);return;
			*/

			this.opts.target.html(stack.target);	
		},

		inline: function(options) {
			this._stack.push({
				target: $(this.target).clone(true, true),
				opts: this.opts
			});

			this.target = $('<div>');
			this.render(options);
		},

		remove: function() {
			var opts = this.opts;

			opts.mask && opts.mask.remove();
			opts.target.remove();
			eleHtml.removeClass('lg-overflow');
		},

		addEvent: function() {
			var _this = this;

			this.opts.target.on('click', '.lg-close', function() {
				_this.remove();
			})
			.on('click', '.lg-buttons>a', function() {
				var name = $(this).data('name');
				var opts = _this.opts;

				opts.buttons.some(function(opt) {
					if (opt.name !== name) {
						return false;
					}

					var result = opt.cb ? opt.cb(_this) : undefined;

					if(opt.cb === undefined || result === true) {
						_this._stack.length ? _this.back() : _this.remove();
					}

				});
			});
		},

		render: function(opts) {
			this.opts = $.extend({}, this.opts, opts);

			var html = base.template(template)({
				opts: this.opts
			});

			this.target.html(html);
			this.opts.target.html(this.target);
		},

	});

	return Popup;
});
