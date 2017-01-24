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
		target: $('<div>'),
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
		// 初始化
		initialize: function(opt) {
			this.opts = $.extend({}, options, opt);

			this._stack = []; // 弹窗队列, 用于在一个弹窗中切换内容
			this.addEvent();

			var opts = this.opts;

			opts.target.addClass('lg-popup');
			eleHtml.addClass('lg-overflow');

			this.helpInline();

			opts.layout.append(opts.target);
			if (opts.isMask && !opts.mask) {
				this.mask = new Mask(opts.target, {loading: false}).render();
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
			typeof cb === 'function' && cb(this);
		},

		back: function() {
			var stack = this._stack.pop();

			$.extend(this, stack);
			this.opts.target.html(stack.target);
		},

		inline: function(inlineOpts) {
			this._stack.push({
				target: this.target.clone(true, true),
				opts: this.opts
			});

			this.opts = $.extend({}, options, inlineOpts);
			this.helpInline();
		},

		remove: function() {
			var opts = this.opts;

			this.mask && this.mask.remove();
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
			this.opts.target.html(this.target);
		}

	});

	return Popup;
});
