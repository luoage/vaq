define(function(require) {
	var $ = require('jquery');
	var Mask = require('./mask');
	var Popup = require('./popup');

	var tip = function(html) {
		return new Popup({html: html, delayTime: 3000});
	};

	var request = function() {
		$.ajaxPrefilter(function(options, originalOptions, jqXhr) {
			jqXhr.setRequestHeader('X-CSRF-TOKEN', $('meta[name="csrf-token"]').attr('content'));
		});

		return function(options, done, fail) {
			options = Object.assign({
				dataType: 'json',
				type: 'get',
				cache: false
			}, options);

			var mask;

			if (options.mask) {
				mask = new Mask(options.mask.target).mask(options.mask).render();

				delete options.mask;
			}

			return $.ajax(options)
				.done(function(res) {
					res = res || {};

					if (+res.code !== 0) {
						tip(res.msg || '网络有误，请稍后重试！');
						return;
					}

					done(res.info);
				})
				.fail(function(res) {
					if (fail) {
						return fail(res);
					}

					tip(res.msg || '网络有误，请稍后重试！');
				})
				.always(function() {
					mask && mask.remove();
				});
		};
	};

	var base = {
		/**
		 * ajax操作
		 *
		 * @param {object} ajax参数，同等于 $.ajax()参数
		 * @param {fn} 成功后执行方法
		 * @param {fn} 失败后执行方法
		 * @example
		 * base.request({type: 'POST'}, function(res) {
		 * 	console.log(res)
		 * })
		 *
		 * mask: {target:, loading: }
		 *
		 * @return Pormise
		 */
		request: request(),

		/**
		 * 继承和创建类
		 *
		 * var A = base.inherit().$extend({
		 *  // 增加prototype
		 * 	a:3,
		 * 	b:[2,3],
		 *
		 * 	initialize: function() {
		 * 		// 增加属性
		 * 		this.a = 1;
		 * 		this.b = 3;
		 * 	}
		 *
		 * });
		 *
		 * console.dir(new A);
		 *
		 * @param {object}
		 * @return {class}
		 */
		inherit: function(obj) {
			obj = obj || {};

			var F = function() {
				typeof this.initialize === 'function' && this.initialize.apply(this, arguments);
			};

			var proto = {};

			if (arguments.length > 1) {
				var fn = arguments[arguments.length - 1];

				if (typeof fn === 'function') {
					proto = Object.create(fn.prototype);
				}
			}

			Object.assign(proto, obj);
			F.prototype = proto;
			F.prototype.constructor = F;

			F.prototype.$parent = function(name) {
				if (!name) {
					return;
				}

				var _this = Object.getPrototypeOf(this);
				var proto = Object.getPrototypeOf(_this);

				return proto[name];
			};

			F.$extend = base.curry(base.inherit, F);

			return F;
		},

		/**
		 * 解析url
		 *
		 * @param {string} 可以是完整的可以是部分的url, 如果键值不存在则不显示
		 * @return {object}
		 */
		parseUrl: function(url) {
			var param = {};

			(url || '').replace(/([^=?&#]+)=([^=?&#]+)/g, function(all, first, second) {
				param[decodeURIComponent(first)] = decodeURIComponent(second);
			});

			return param;
		},

		/**
		 * 封装一个函数，此函数在固定时间内只能执行一次
		 *
		 * @param {function} 需要执行的函数
		 * @param {number} 等待时间/毫秒 默认1500毫秒
		 * @param {object} 作用域
		 * @return {function}
		 */
		throttle: function(fn, wait, context) {
			var timer = null;

			wait = wait || 1500;

			return function() {
				if (timer) {
					return;
				}

				timer = setTimeout(function() {
					timer = null;
				}, wait);

				fn.apply(context || this, arguments);
			};
		},

		/**
		 * 封装一个函数，此函数在指定毫秒后执行
		 *
		 * @param {function} 需要执行的函数
		 * @param {number} 等待时间/毫秒 默认1500毫秒
		 * @return {function}
		 */
		delay: function(fn, wait) {
			wait = wait || 1500;

			return function() {
				var args = arguments;
				var context = this;

				setTimeout(function() {
					fn.apply(context, args);
				}, wait);
			};
		},

		/**
		 * html格式化
		 * @param {string} html
		 * @return string
		 */
		escapeHtml: function(html) {
			if (typeof html !== 'string') {
				return html;
			}

			var map = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				'\'': '&#x27;',
				'`': '&#x60;'
			};
			var regexp = new RegExp('(?:' + Object.keys(map).join('|') + ')', 'g');

			return html.replace(regexp, function(match) {
				return map[match];
			});
		},

		/**
		 * 前端模板引擎类似与lodash/underscore的template方法
		 * @TODO 模板中非JS代码里面不能存在单引号，否则出错
		 *
		 * @param {string|html} 模板内容
		 * @example
		 *   <[- 显示代码 ]> <[= 格式化代码 ]> <[ 执行代码 ]>
		 *   var parseHtml = template(html);
		 *   var template = parseHtml(data); // 混合数据后的模板
		 *   document.createElement('div').innerHTML = template;
		 *
		 * @return {function}
		 */
		template: function(html) {
			/* eslint-disable */
			var body = ""
				+ "var _escapeHtml=" + this.escapeHtml.toString() + ";"
				+ "var s='';s+='"
				+ html.replace(/(\n|\r|\t| ){1,}/g, ' ')
					.replace(/<\[-(.*?)\]>/g, "';s+=($1)+'")
					.replace(/<\[=(.*?)\]>/g, "';s+=( _escapeHtml($1) )+'")
					.replace(/<\[(.*?)\]>/g, "';$1;s+='") + "'; return s;";

			return new Function('data', 'data=data||{};with(data) { '+body+'; }');
			/* eslint-enable */
		},

		/**
		 * 防抖动
		 *
		 * @param {function} 需要执行的方法
		 * @param {number} 这段时间内timeout会一直重置
		 *
		 * @return {function}
		 */
		debounce: function(fn, wait) {
			var timer = null;

			return function() {
				var args = arguments;
				var context = this;

				if (timer) {
					clearTimeout(timer);
					timer = null;
				}

				timer = setTimeout(function() {
					fn.apply(context, args);
				}, wait);
			};
		},

		/**
		 * 浏览器类型
		 * @TODO 持续增加中
		 *
		 * @return string
		 */
		detected: (function() {
			var platform = navigator.platform;
			var version = {};

			version.isMac = /^mac/i.test(platform);
			version.isIos = version.isMac || /iphone|ipad|ipod/i.test(platform);

			return version;
		}()),

		/**
		 * 获取当前页面下所有含有node-type的DOM节点并存储到对象中，以其名称为键值
		 *
		 * @param {HTMLElement} context
		 * @return {object}
		 */
		getNodes: function(context) {
			var nodes = {};
			var name;

			if (context && !(context instanceof HTMLElement)) {
				throw new Error('illegal parameter.');
			}

			Array.prototype.forEach.call((context || document).querySelectorAll('[node-type]'), function(ele) {
				name = ele.getAttribute('node-type');
				name && (nodes[name] = ele);
			});

			return nodes;
		},

		pad: function(n) {
			return n >= 10 ? n : '0' + n;
		},

		/**
		 * 时间格式化
		 *
		 * @param {string} format 格式 yyyy-mm-dd hh:ii:ss
		 * @param {Object|string} 时间对象,或符合格式的时间字符串, 默认当前时间
		 *
		 * @return {string} 返回字符串时间
		 */
		formatDate: function(format, date) {
			date = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();

			var y = date.getFullYear();
			var m = date.getMonth() + 1;
			var d = date.getDate();
			var h = date.getHours();
			var i = date.getMinutes();
			var s = date.getSeconds();

			var map = {
				yyyy: y,
				d: d,
				m: m,
				mm: this.pad(m),
				dd: this.pad(d),
				hh: this.pad(h),
				ii: this.pad(i),
				ss: this.pad(s)
			};

			return (format || '').replace(/y+|m+|d+|h+|i+|s+/g, function(s) {
				return map[s] || '';
			});
		},

		/**
		 * 触发器
		 * @param {function} [fn[fn[fn[fn]]]]
		 * @example
		 *
		 * var fn = base.toggle(function() {console.log('我第一次执行')}, function() { console.log(我第二次执行)})
		 *
		 * fn();
		 *
		 * @return {function}
		 */
		toggle: function() {
			var i = -1;
			var args = arguments;
			var length = args.length;

			return function() {
				i++;
				args[i % length].apply(this, arguments);
			};
		},

		/**
		 * 对象浅拷贝
		 * @param {object}
		 *
		 * @return {object}
		 */
		copy: function(obj) {
			return Object.assign({}, obj);
		},

		/**
		 * 浅拷贝并且去除obj空内容
		 *
		 * @return {object};
		 */
		compact: function(obj) {
			var newObj = {};

			$.each(obj, function(key, value) {
				value && (newObj[key] = value);
			});

			return newObj;
		},

		/**
		 * 柯里化
		 * @param {function} 需要执行的方法
		 * @param {mixed[mixed[mixed]]}
		 *
		 * @return {function}
		 */
		curry: function(fn) {
			var args = Array.prototype.slice.call(arguments, 1);

			return function() {
				return fn.apply(this, Array.prototype.slice.call(arguments).concat(args));
			};
		},

		/**
		 * 打开新页面，不支持异步操作，异步时需要先打开然后追加url
		 *
		 * @param {string} url
		 * @return
		 */
		open: function(url) {
			return window.open(url);
		},

		/**
		 * 对象filter
		 *
		 * @param {object} 需要处理的对象
		 * @param {function} callback
		 *
		 * @return obj
		 */
		filter: function(obj, cb) {
			var newObj = {};

			Object.keys(obj).forEach(function(key) {
				var item = obj[key];

				if (cb(key, item)) {
					newObj[key] = item;
				}
			});

			return newObj;
		}
	};

	return base;
});
