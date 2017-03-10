/**
 * 顺序执行方法
 *
 * @example
 * var a = {a:1,b:3,c:3};
 *
 * var seq = new Seq()
 *
 * seq.fail(function() {
 * 	console.log(arguments);
 * 	console.log('怎么执行错了呢');
 * })
 * .done(function() {
 * 	console.log('执行完了');
 * 	seq.resolve(999999);
 * })
 * .seq(function() {
 * 	console.log(1);
 * 	seq.resolve(999999);
 * })
 * .seq(function() {
 * 	console.log(this);
 * 	seq.resolve(999999);
 * }.bind(a))
 * .seq(function() {
 * 	setTimeout(function() {
 * 		console.log(3);
 * 	seq.resolve(999999);
 * 	}, 1000);
 * })
 * .seq(function() {
 * 	setTimeout(function() {
 * 		console.log(4);
 * 	seq.resolve(999999);
 * 	}, 1000);
 * })
 * .seq(function() {
 * 	console.log(5);
 * 	seq.resolve(999999);
 * });
 *
 * seq.resolve();
 *
 * @example
 *
 * var aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa = function(a, b, c, cb) {
 * 		console.log(typeof cb, '我是cb');
 * 	cb(1, 2, 3);
 * };
 *
 * var seq = new Seq()
 * 	.seq(function() {
 * 		aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa(1, 2, 3, this);
 * 	})
 * 	.seq(function() {
 * 		console.log(arguments);
 * 	});
 *
 * 	seq.resolve();
 *
 */
define(function(require) {
	var base = require('./base');

	var Seq = base.inherit().$extend({
		/**
		 * @constructor
		 */
		initialize: function() {
			this._thens = [];
			this._failFn = function() {};
			this._doneFn = function() {};
			this._isEnd = false;
		},

		/**
		 * 一个方法完成后执行下一个方法
		 *
		 * @return void
		 */
		resolve: function() {
			var fn = this._thens.shift();

			if (this._isEnd) {
				return;
			}

			if (!fn) {
				this._isEnd = true;
			}

			fn = fn || this._doneFn;
			fn.apply(this.resolve.bind(this), arguments);
		},

		/**
		 * 一个方法完成后出现错误，在进入下一个方法前退出
		 *
		 * @return void
		 */
		reject: function() {
			this._failFn.apply(this, arguments);
		},

		/**
		 * 错误执行, 统一执行错误
		 *
		 * @return this
		 */
		fail: function(fn) {
			typeof fn === 'function' && (this._failFn = fn);
			return this;
		},

		/**
		 * 全部执行成功后统一执行
		 *
		 * @return this
		 */
		done: function(fn) {
			typeof fn === 'function' && (this._doneFn = fn);
			return this;
		},

		/**
		 * 添加队列函数
		 * @param {function} fn
		 *
		 * @return this
		 */
		seq: function(fn) {
			typeof fn === 'function' && this._thens.push(fn);
			return this;
		}
	});

	return Seq;
});
