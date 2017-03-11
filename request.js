/**
 * ajax请求
 */
define(function(require) {
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
				cache: false,
				isThrowDoneError: true, // 请求成功，code !== 0 也不报错
				isThrowFailError: true // 请求失败也不报错
			}, options);

			var mask;

			if (options.mask) {
				mask = new Mask(options.mask.target, options.mask).render();

				delete options.mask;
			}

			var isThrowDoneError = options.isThrowDoneError;
			var isThrowFailError = options.isThrowFailError;

			return $.ajax(options)
				.done(function(res) {
					res = res || {};

					if (+res.code !== 0) {
						isThrowDoneError && tip(res.msg || '网络有误，请稍后重试！');
						return;
					}

					done(res.info);
				})
				.fail(function(res) {
					if (fail) {
						return fail(res);
					}

					isThrowFailError && tip(res.msg || '网络有误，请稍后重试！');
				})
				.always(function() {
					mask && mask.remove();
				});
		};
	};

	return request();
});
