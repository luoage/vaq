/**
 * popup
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
	var Mask = require('./mask');
	var $ = require('jquery');
	var base = require('./base');

	var layout = $('body');
	var eleHtml = $('html');
	var body = $('<div>').addClass('lg-popup').addClass('lg-lg-lg');

	var getItemByName = function(buttons, name) {
		var item;

		(buttons || []).some(function(button) {
			if (button.name === name) {
				item = button;
				return true;
			}
		});

		return item;
	};

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
			if (body.data('popup')) {
				return body.data('popup').inline($.extend({}, options, opt));
			}
			this.opts = $.extend({}, options, opt);
			this._stack = []; // 弹窗队列, 用于在一个弹窗中切换内容
			this._callback = function() {};

			var opts = this.opts;

			eleHtml.addClass('lg-overflow');

			body.css(opts.css);
			this.helpInline();

			body.remove();
			opts.layout.append(body);
			this.addEvent();

			if (opts.isMask && !this.mask) {
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
			} else if (opts.autoBack === true) {
				base.delay(function() {
					this.back();
				}.bind(this), opts.delayTime)();
			}
		},

		createTarget: function() {
			return $('<div>').addClass('lg-container');
		},

		anyway: function(cb) {
			if (typeof cb === 'function') {
				this._callback = cb;
				this._callback(this);
			}

			return this;
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

			if (!stack) {
				this.remove();
				return;
			}

			$.extend(this, stack);

			this._callback(this);
			this.target.show();
		},

		inline: function(inlineOpts) {
			var target = this.target;

			target.hide();

			this._stack.push({
				target: target,
				popup: target,
				opts: this.opts,
				_callback: this._callback
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

			body.data('popup', this);

			body.on('click', '.lg-close', function() {
				_this.remove();
			})
			.on('click', '.lg-buttons>a', function() {
				var name = $(this).data('name');
				var opts = _this.opts;
				var opt = getItemByName(opts.buttons, name);

				var result = opt.cb ? opt.cb(_this) : undefined;

				if (opt.cb === undefined || result === true) {
					_this._stack.length ? _this.back() : _this.remove();
				}
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
