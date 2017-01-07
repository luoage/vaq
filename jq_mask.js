/**
 * by jl
 *
 * 遮罩
 *
 * @example
 *
 * var mask = $('..').mask(); // 生成遮罩
 * mask.render(); // 遮罩生效
 * mask.remove();
 *
 */
define(function() {
	var mask = $('<div>').addClass('mask');

	/**
	 * @constructor
	 */
	var Mask = function(target, _config) {
		this.config = {};

		var config = {
			loading: true, // 是否增加背景loading图片
			layout: $('body'),
			css: {
				zIndex: 100
			},
			setPos: true
		};

		$.extend(this.config, config, _config);
		// 遮罩层
		this._mask = mask.css(this.config.css);
		this.config.loading && this._mask.addClass('ajax-loading');
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

	$.fn.mask = function(config) {
		return new Mask(this, config);
	};
});
