/**
 * ajax请求
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
	var Popup = require('./popup');
	var Mask = require('./mask');

	var tip = function(html) {
		return new Popup({html: html, delayTime: 3000});
	};

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
				mask = new Mask(options.mask.target, options.mask).render();

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

	return request();
});
