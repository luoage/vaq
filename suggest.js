/**
 * [suggestvalue], [suggestname] 作为suggest的值和名称，所以就算是input元素也不需要name
 *
 * @example
 *
 * <input class="suggest-input" type="text" suggestname="bid_mgr_id" data-url="/new/api/adminuser/suggest" data-sug_arg_role="bid_mgr">
 *
 * class="suggest-input"是标志位用来辨认是否需要增加suggest
 * data-url用于获取数据
 * suggestname用于form获取值suggestvalue值使用, suggestvalue属性会在点击后或者选择后被修改
 * 所有该input元素的所有data都会以键值对的以参数的形式传入后端, 不包括data-url
 *
 */
define(function(require) {
	var $ = require('jquery');
	var base = require('./base');
	var Scroll = require('./scroll');
	var keyboard = require('./keyboard');
	var observe = require('./observe');
	var Seq = require('./seq');
	var request = require('./request');

	var $div = $('<div class="lg-suggest lg-lg-lg"></div>');
	var cacheObj = {};

	/**
	 * @constructor
	 * @param {HTMLElement|Node} target
	 *
	 * @return void
	 */
	var Suggest = base.inherit().$extend({
		init: function(target) {
			this.index = -1;

			target = $(target);

			var data = target.data();

			if (!data.url) {
				return;
			}

			this.target = target;
			this.div = $div.css(this.css()).html('<div class="lg-loading" style="height:50px"></div>').appendTo('body').show();

			this.clearValue();
			this.getData(data);
		},

		getTarget: function() {
			return this.target && this.target.get(0);
		},

		css: function() {
			var target = this.target;
			var offset = target.offset();
			var size = {
				width: target.outerWidth(),
				height: target.outerHeight()
			};
			var css = {
				top: offset.top + size.height - 1, // TODO -1 可以使用微调
				left: offset.left,
				width: size.width
			};

			return css;
		},

		setContent: function(list) {
			var html = '<div wheel="true">';

			list = list || [];

			list.forEach(function(item) {
				html += '<p ' + (+item.isDeleted ? 'class="lg-deleted"' : '') + ' data-value="'
					+ base.escapeHtml(item.value) + '">' + base.escapeHtml(item.display) + '</p>';
			});

			if (list.length) {
				html += '<div scrollbar="true"></div>';
			} else {
				html += '未找到结果</div>';
			}

			this.div.html(html);
			this.scroll = new Scroll(this.div.find('[wheel="true"]'), {slide: false, iosSupport: true});
		},

		inputInit: function(target) {
			var $target = $(target);
			var data = $target.data();
			var value = $target.attr('suggestvalue');

			if (!value) {
				return;
			}

			this.request(data, value)
				.seq(function(list) {
					list = list || [];

					if (list.length !== 1) { // @TODO 这里可以使用options, 目前只针对精确查找
						return;
					}

					var display = list && list[0] && list[0].display;

					if (!display) {
						return;
					}

					$target
						.val(base.escapeHtml(display))
						.attr('suggestvalue', value);
				})
				.resolve();
		},

		request: function(data, value) {
			var requestData = base.copy(data) || {};
			var url = requestData.url;

			delete requestData.url;

			if (value) {
				requestData.suggest = ('' + (value || '')).trim();
			}

			var sign = url + $.param(requestData);

			return new Seq()
				.seq(function() {
					return cacheObj[sign] !== undefined
						? this(cacheObj[sign])
						: request({url: url, data: requestData}, this);
				})
				.seq(function(list) {
					cacheObj[sign] = list;

					this(list);
				});
		},

		getData: base.debounce(function(data) {
			var value = this.target.val();
			var _this = this;

			this.request(data, value)
				.seq(function(list) {
					_this.setContent(list);
				})
				.resolve();
		}, 200),

		setInputValue: function(input, value, suggestvalue) {
			input.val(value).attr('suggestvalue', suggestvalue);
		},

		/**
		 * 设置target元素的内容
		 *
		 * @param {DOM} 点击的元素
		 * @reurn void
		 *
		 */
		setValue: function(ele) {
			this.target
				.val(ele.innerHTML)
				.attr('suggestvalue', $(ele).data('value'));
		},

		clearValue: function(value) {
			this.target.attr('suggestvalue', '');
		},

		bindEvent: function() {
			var _this = this;

			$div.on('click', 'p', function(e) {
				$(this).addClass('bg-gray').siblings().removeClass('bg-gray');
				_this.setValue(this);
				_this.scroll.scrollTo(this);
				_this.target.trigger('focus');
				observe.publish('set-suggest-input-value', this, _this.target);
			});
		},

		/**
		 * 选择内容
		 * @param {boolean} 向下选择
		 * @return void
		 */
		keyboardNext: function(isNext) {
			this.index += isNext ? 1 : -1;

			var children = $div.find('p[data-value]');

			if (!children.length) {
				return;
			}

			if (this.index > children.length - 1) {
				this.index = 0;
			}
			if (this.index <= -1) {
				this.index = children.length - 1;
			}

			children.eq(this.index).trigger('click', true);
		}
	});


	var selector = '.suggest-input';
	var suggest = new Suggest();
	var timer;

	suggest.bindEvent();

	var fn = base.debounce(function() {
		suggest.init(this);
	}, 200);

	$(document).on('input', selector, function(e) {
		if (keyboard.isUp(e) || keyboard.isDown(e) || keyboard.isEnter(e)) {
			return;
		}
		timer && clearTimeout(timer);
		fn.bind(this)();
	})
	.on('keydown', selector, function(e) {
		if (!suggest) {
			return;
		}
		if (this !== suggest.getTarget()) {
			return;
		}
		keyboard.isEnter(e) && $div.hide();
		if (keyboard.isUp(e) || keyboard.isDown(e)) {
			suggest.keyboardNext(keyboard.isDown(e));
		}
	})
	.on('blur', selector, function() {
		timer = setTimeout(function() {
			$div.hide();
		}, 150);
	})
	.on('click', selector, function() {
		return false;
	});

	return Suggest;
});
