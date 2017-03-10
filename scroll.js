/**
 * 自定义scroll
 *
 * 不需要支持苹果系统
 */
define(function(require) {
	var $ = require('jquery');
	var base = require('./base');
	var $doc = $(document);

	/**
	 * @constructor
	 */
	var Scroll = base.inherit().$extend({
		/**
		 * @param {HTMLElement|Node} target
		 *
		 */
		initialize: function(target, options) {
			if (!target) {
				throw new Error('target parameter is undefined .');
			}

			/**
			 * @type {Object}
			 */
			this.options = Object.assign({
				span: 63, // 每次wheel的跨度/px
				delay: 25, // 间隔dlayms后会进行移动操作，该移动操作会在duration时间内完成/ms
				duration: 90, // 移动时间/ms
				slide: true, // 是否可以滑动
				iosSupport: false// 是否支持ios系统
			}, options || {});

			if (!this.options.iosSupport && base.detected.isIos) {
				return;
			}

			this.$target = $(target);

			var $scrollbar = this.$target.find('[scrollbar="true"]');

			// 不存在滚动条
			if (!$scrollbar.length) {
				return;
			}

			this.debounce = base.debounce(function() {
				this.$target.animate({top: this.top}, this.options.duration);
				this.$scrollbar.animate({top: this.thumbTop}, this.options.duration);
			}.bind(this), this.options.delay);

			this.nodebounce = function() {
				this.$target.css({top: this.top});
				this.$scrollbar.css({top: this.thumbTop});
			};

			this.calculate();

			/**
			 * @type {number}
			 */
			this.top = 0;
			this.thumbTop = 0;

			this.$scrollbar = $scrollbar;

			this.init();
		},

		/**
		 * 滚动操作初始化
		 */
		init: function() {
			var calc = this.calc;

			// 父元素和子元素相同高度
			if (calc.percent >= 1) {
				return;
			}

			// 初始化设置下拉条高度
			this.$scrollbar.css('height', calc.thumbHeight);
			this.addEvent();
		},

		/**
		 * 把对象调整到可见的位置
		 * @TODO 上中下选项
		 */
		scrollTo: function(child) {
			var childTop = $(child).position().top;

			this.top = childTop * -1;
			this.check();
			this.nodebounce();
		},

		/**
		 * 内容滚动带动下拉条
		 *
		 */
		sideMain: function(e) {
			e.preventDefault(); // 阻止默认滚动

			var isUp = function() {
				if (e.type === 'DOMMouseScroll') {
					return e.originalEvent.detail > 0;
				} else {
					return e.originalEvent.wheelDelta < 0;
				}
			};

			var calc = this.calc;
			var span = this.options.span;

			if (isUp()) {
				this.top -= span;
			} else {
				this.top += span;
			}

			this.thumbTop = this.top * (calc.percent * -1 - 1);
			this.check();
			this.debounce();
		},

		check: function() {
			var calc = this.calc;

			// 检查内容
			if (this.top > 0) {
				this.top = 0;
			}
			if (this.top < calc.maxTop * -1) {
				this.top = calc.maxTop * -1;
			}
			// 检查滑块
			if (this.thumbTop < 0) {
				this.thumbTop = 0;
			}

			if (this.thumbTop > calc.targetHeight - calc.thumbHeight) {
				this.thumbTop = calc.targetHeight - calc.thumbHeight;
			}
		},

		/**
		 * 下拉条滚动带动内容
		 * @param {jquery event}
		 * @return void
		 */
		sideThumb: function(e) {
			var mouseY = e.clientY; // 点击的位置
			var calc = this.calc;
			var _this = this;
			var top = this.top;
			var thumbTop = this.thumbTop;

			var mousemove = function(e) {
				var currentY = e.clientY;
				var scrollTop = (1 / calc.percent) * (currentY - mouseY) * -1;
				var scrollThumbTop = (1 / calc.percent + 1) * (currentY - mouseY);

				_this.top = top + scrollTop;
				_this.thumbTop = thumbTop + scrollThumbTop;
				_this.check();

				_this.nodebounce();
			};

			$doc.on('mousemove', mousemove)
				.one('mouseup dragend', function() {
					$doc.off('mousemove', mousemove);
				});
		},

		addEvent: function() {
			this.$target.on('mousewheel DOMMouseScroll', this.sideMain.bind(this));
			this.options.slide && this.$scrollbar.on('mousedown', this.sideThumb.bind(this));
		},

		/**
		 * 计算获取边框长度和百分比
		 *
		 * @return {void}
		 */
		calculate: function() {
			var targetParent = this.$target.parent(); // 父元素
			var visiableHeight = targetParent.height() - this.$target.position().top; // 父元素高度 - 目标元素所在位置
			var targetHeight = this.$target.outerHeight(); // 目标元素高度
			var maxHeight = targetHeight - visiableHeight;
			var percent = visiableHeight / targetHeight;

			this.calc = {
				percent: percent, // 下拉条的高度和可视高度的对比
				maxTop: maxHeight,
				visiableHeight: visiableHeight,
				targetHeight: targetHeight,
				thumbHeight: percent * visiableHeight
			};
		}
	});

	return Scroll;
});
