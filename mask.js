/**
 * 遮罩
 * @author luoage@msn.cn
 *
 * @dep jquery
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

	var mask = $('<div>').addClass('lg-mask').addClass('lg-lg-lg');
	var config = {
		loading: true, // 是否增加背景loading图片
		layout: $('body'),
		css: {
			zIndex: 100
		},
		setPos: true
	};

	/**
	 * @constructor
	 */
	var Mask = function(target, _config) {
		this.config = {};

		$.extend(this.config, config, _config);
		// 遮罩层
		this._mask = mask.css(this.config.css);
		this.config.loading && this._mask.addClass('lg-ajax-loading');
		this.target = target;
	};


	Mask.prototype = {
		render: function() {
			this._mask.css(this._size());
			this.config.setPos && this._mask.css(this._position());
			this.config.layout.append(this._mask);

			return this;
		},

		remove: function() {
			this._mask.remove();

			return this;
		},

		_position: function() {
			var pos = this.target.offset();

			return {
				top: pos ? pos.top : 0,
				left: pos ? pos.left : 0
			};
		},

		_size: function() {
			return {
				width: this.target.outerWidth(),
				height: this.target.outerHeight()
			};
		}

	};

	return Mask;
});
