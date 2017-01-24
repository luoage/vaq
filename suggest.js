/**
 * by jl
 *
 * [suggestvalue], [suggestname] 作为suggest的值和名称，所以就算是input元素也不需要name
 *
 * @example
 *
 * <input class="suggest-input" type="text" suggestname="bid_mgr_id" data-url="/new/api/adminuser/suggest" data-sug_arg_role="bid_mgr">
 *
 * class="suggest-input"是标志位用来辨认是否需要增加suggest
 * data-url用于获取数据
 * suggestname用于jq_form获取值suggestvalue值使用, suggestvalue属性会在点击后或者选择后被修改
 * 所有该input元素的所有data都会以键值对的以参数的形式传入后端, 不包括data-url
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
	var base = require('lib/base');
	var Scroll = require('lib/scroll');
	var keyboard = require('lib/keyboard');
	var observe = require('lib/observe');
	var Seq = require('lib/seq');
	var request = require('./request');

	var $div = $('<div class="suggest"></div>');
	var cacheObj = {};

	/**
	 * @constructor
	 * @param {HTMLElement|Node} target
	 *
	 * @return void
	 */
	var Suggest = base.inherit().$extend({
		initialize: function(target) {
			this.index = -1;

			this.init(target);
			this.bindEvent();
		},

		init: function(target) {
			this.index = -1;

			target = $(target);

			var data = target.data();

			if (!data.url) {
				return;
			}

			this.target = target;
			this.div = $div.css(this.css()).html('<div class="loading" style="height:50px"></div>').appendTo('body').show();

			this.clearValue();
			this.getData(data);
		},

		getTarget: function() {
			return this.target.get(0);
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
				html += '<p data-value="' + base.escapeHtml(item.value) + '">' + base.escapeHtml(item.display) + '</p>';
			});

			if (list.length) {
				html += '<div scrollbar="true"></div>';
			} else {
				html += '未找到结果</div>';
			}

			this.div.html(html);
			this.scroll = new Scroll(this.div.find('[wheel="true"]'), {slide: false, iosSupport: true});
		},

		getData: base.debounce(function(data) {
			var requestData = base.copy(data) || {};
			var url = requestData.url;
			var value = this.target.val();

			delete requestData.url;

			if (value) {
				requestData.suggest = ('' + (value || '')).trim();
			}

			var sign = url + $.param(requestData);
			var _this = this;

			new Seq()
				.seq(function() {
					if (typeof cacheObj[sign] !== 'undefined') {
						return this(cacheObj[sign]);
					} else {
						request({url: url, data: requestData}, this);
					}
				})
				.seq(function(list) {
					_this.setContent(list);
					cacheObj[sign] = list;
				})
				.resolve();
		}, 200),

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
			var resize = base.debounce(function() {
				$div.css(_this.css());
			}, 50);

			$(window).on('resize', resize)
				.on('click', function(e, preventHide) {
					preventHide || $div.hide();
				});

			$div.on('click', 'p', function(e) {
				$(this).addClass('bg-gray').siblings().removeClass('bg-gray');
				_this.setValue(this);
				_this.scroll.scrollTo(this);
				_this.target.trigger('focus');
				observe.publish('set-suggest-input-value', this);
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
	var suggest;
	var timer;

	var fn = base.debounce(function() {
		if (!suggest) {
			suggest = new Suggest(this);
		} else {
			suggest.init(this);
		}
	}, 50);

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
