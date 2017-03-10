/**
 * 观察者模式
 *
 * @exampjle
 * // 订阅
 * observe.subscribe('trigger-body', function() {
 * });
 * // 解除订阅
 * observe.unsubscribe('trigger-body');
 * // 发布
 * observe.publish('trigger-body', $('body'), map, 222);
 */
define(function(require) {
	var base = require('./base');

	var Observe = base.inherit({

		/**
		 * @constructor
		 *
		 */
		initialize: function() {
			this._thens = {};
		},

		/**
		 * 发布
		 * @param {string}
		 * @param {mixed} [string[fn[obj[]]]]
		 *
		 * @return this
		 */
		publish: function(name) {
			var list = this._thens[name];

			if (!list) {
				return;
			}

			this._exec(list, arguments);

			return this;
		},

		/**
		 * 订阅
		 * 只接收两个参数，第一个参数是标志位，第二个是执行方法
		 *
		 * @param {string|array}
		 * @param {function}
		 *
		 * @return this
		 */
		subscribe: function(name, fn) {
			(Array.isArray(name) ? name : [name]).forEach(function(item) {
				this._flex(item, fn);
			}.bind(this));

			return this;
		},

		/**
		 * 解除订阅
		 *
		 * @param {string}
		 * @param {function} 可选, 针对该函数解除订阅
		 *
		 * @return this
		 */
		unsubscribe: function(name, fn) {
			var list = this._thens[name];

			if (!list) {
				return;
			}


			if (!fn) {
				delete this._thens[name];
			} else {
				var index;

				while ((index = list.indexOf(fn)) !== -1) {
					list.splice(index, 1);
				}

				if (!list.length) {
					delete this._thens[name];
				}
			}

			return this;
		},

		_flex: function(name, fn) {
			if (!this._thens[name]) {
				this._thens[name] = [];
			}

			if (typeof fn !== 'function') {
				return;
			}

			this._thens[name].push(fn);
		},

		_exec: function(list, args) {
			list.forEach(function(fn) {
				fn.apply(this, args);
			});
		}

	});

	return new Observe();
});
