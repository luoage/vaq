define('jquery', function() {
	return window.jQuery;
});

define('test', function(require) {
	var Time = require('../../time');
	var base = require('../../base');

	// 关闭控件
	$(document).on('click', function(e) {
		var isTarget = $(e.target).hasClass('lg-time-control');

		if (isTarget) {
			return;
		}

		Time.getWrap().remove();
	});

	// 控件生成
	$(document).on('click', 'input', function() {
		var params = {};

		$.each($(this).data(), function(key, value) {
			key = (key || '').replace(/_([a-z])/g, function(all, b) {
				return b.toUpperCase();
			});

			params[key] = value;
		});

		new Time($.extend({target: this}, params));
	});
});
