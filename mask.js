/**
 * 遮罩
 *
 * @example
 * var mask = $('..').mask(); // 生成遮罩
 * mask.render(); // 遮罩生效
 * mask.remove();
 *
 */
define(function(require) {
	var $ = require('jquery');

	var Mask = function(target, _config) {
		this.mask = $('<div>');
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

		var mask = this.mask;

		// 遮罩层
		mask.addClass('lg-mask').addClass('lg-lg-lg').css(this.config.css);

		this.config.loading && mask.addClass('lg-ajax-loading');
		this.config.loading && mask.html('<div class="ui segment">\n' +
			 '  <div class="ui active loader"></div>\n' +
			 '  <p></p>\n' +
			 ' </div>');

		this.target = target;
	};


	Mask.prototype = {
		render: function() {
			var mask = this.mask;
			var config = this.config;

			mask.css(this._size());
			config.setPos && mask.css(this._position());
			config.layout.append(mask);

			return this;
		},

		remove: function() {
			this.mask.remove();

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
