/**
 * 键盘按键
 */
define(function() {
	var keyCode = function(e) {
		return (e || window.event).keyCode;
	};

	var right = 39;
	var left = 37;
	var up = 38;
	var down = 40;
	var enter = 13;

	var keyboard = {
		// 回车键
		isEnter: function(e) {
			return keyCode(e) === enter;
		},
		// 左移动
		isLeft: function(e) {
			return keyCode(e) === left;
		},

		// 右移动
		isRight: function(e) {
			return keyCode(e) === right;
		},

		// 下移
		isDown: function(e) {
			return keyCode(e) === down;
		},

		// 上移
		isUp: function(e) {
			return keyCode(e) === up;
		},

		// 上下左右键
		isMove: function(e) {
			return [left, up, right, down].indexOf(keyCode(e)) > -1;
		},

		// 退格键
		isBackspace: function(e) {
			return keyCode(e) === 8;
		},

		// tab键
		isTab: function(e) {
			return keyCode(e) === 9;
		},

		// delete键
		isDel: function(e) {
			return keyCode(e) === 46;
		},

		// 文本控制的一些按钮
		// 包括上下左右键
		// delete, backspace，tab键
		isTextControl: function(e) {
			return this.isMove(e)
				|| this.isTab(e)
				|| this.isDel(e)
				|| this.isBackspace(e);
		},

		// 输入的是否是数字
		isNumber: function(e) {
			var code = keyCode(e);

			// 数字, 小数字键盘
			return (code >= 48 && code <= 57) || (code >= 96 && code <= 105);
		},

		// 输入的是否实数
		isRealNumber: function(e) {
			var code = keyCode(e);

			// 数字, 小数字键盘
			return (code >= 48 && code <= 57) || (code >= 96 && code <= 105) || code === 190;
		},

		isEsc: function(e) {
			return keyCode(e) === 27;
		}
	};

	return keyboard;
});
