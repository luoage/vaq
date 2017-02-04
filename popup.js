/**
 * popup
 * @author luoage@msn.cn
 *
 * @dep jquery
 * @dep ./mask
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

	var layout = $('body');
	var eleHtml = $('html');
	var body = $('<div>').addClass('lg-popup').addClass('lg-lg-lg');

	var template = ''
		+ '				<div class="lg-content">'
		+ '					<[ if(opts.closeIcon) {]>'
		+ '					<a class="lg-close" href="javascript:;">×</a>'
		+ '					<[ } ]>'
		+ '					<[ if(opts.title) {]>'
		+ '					<div class="lg-title"><[- opts.title ]></div>'
		+ '					<[ } ]>'
		+ '					<div class="lg-render">'
		+ '					<[- opts.html ]>'
		+ '					</div>'
		+ '					<[ if(opts.buttons && opts.buttons.length ) {]>'
		+ '						<div class="lg-buttons">'
		+ '							<[ opts.buttons.forEach(function(item) {]>'
		+ '							<a href="javascript:;" data-name="<[- item.name ]>"><[- item.name ]></a>'
		+ '							<[ }) ]>'
		+ '						</div>'
		+ '					<[ } ]>'
		+ '				</div>'
		;

	var options = {
		css: {},
		isMask: true,
		layout: layout,
		title: '',
		closeIcon: true,
		buttons: [],
		html: '',
		autoBack: false, // 自动返回，如果没有可返回会自动关闭, 和autoClose参数公用delayTime
		autoClose: false,
		delayTime: 3000 // delay time /ms
	};

	var Popup = base.inherit({
		initialize: function(opt) {
			this.opts = $.extend({}, options, opt);
			this._stack = []; // 弹窗队列, 用于在一个弹窗中切换内容

			var opts = this.opts;

			eleHtml.addClass('lg-overflow');

			body.css(opts.css);
			this.helpInline();

			body.remove();
			opts.layout.append(body);
			this.addEvent();

			if (opts.isMask && !opts.mask) {
				this.mask = new Mask(body, {loading: false}).render();
			}
		},

		helpInline: function() {
			this.target = this.createTarget();
			this.popup = this.target;

			this.render();
			this.auto();
		},

		auto: function() {
			var opts = this.opts;

			if (opts.autoClose === true) {
				base.delay(function() {
					this.remove();
				}.bind(this), opts.delayTime)();
			}

			if (opts.autoBack === true) {
				base.delay(function() {
					this.back();
				}.bind(this), opts.delayTime)();
			}
		},

		createTarget: function() {
			return $('<div>').addClass('lg-container');
		},

		complete: function(cb) {
			if (typeof cb === 'function') {
				cb(this);
			}

			return this;
		},

		back: function() {
			this.target.remove();

			var stack = this._stack.pop();

			$.extend(this, stack);

			this.target.show();
		},

		inline: function(inlineOpts) {
			var target = this.target;

			target.hide();

			this._stack.push({
				target: target,
				popup: target,
				opts: this.opts
			});

			this.opts = $.extend({}, options, inlineOpts);
			this.helpInline();

			return this;
		},

		remove: function() {
			this.mask && this.mask.remove();
			body.html('');
			body.remove();
			eleHtml.removeClass('lg-overflow');
		},

		addEvent: function() {
			var _this = this;

			body.on('click', '.lg-close', function() {
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

					if (opt.cb === undefined || result === true) {
						_this._stack.length ? _this.back() : _this.remove();
					}
				});
			});
		},

		render: function() {
			var html = base.template(template)({
				opts: this.opts
			});

			this.target.html(html);
			body.append(this.target);
		}

	});

	return Popup;
});
