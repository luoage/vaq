/**
 * fix jquery clone function
 */
define(function(require) {

	// 重写clone, 修复select, textarea 值clone丢失的问题
	((function(original) {
		$.fn.clone = function() {
			var result = original.apply(this, arguments);

			var myTextareas = this.find('textarea').add(this.filter('textarea'));
			var resultTextareas = result.find('textarea').add(result.filter('textarea'));

			var mySelects = this.find('select').add(this.filter('select'));
			var resultSelects = result.find('select').add(result.filter('select'));

			var i = 0;
			var l = myTextareas.length;

			for (; i < l; ++i) {
				$(resultTextareas[i]).val($(myTextareas[i]).val());
			}

			i = 0;
			l = mySelects.length;

			for (; i < l; ++i) {
				resultSelects[i].selectedIndex = mySelects[i].selectedIndex;
			}

			return result;
		};
	})($.fn.clone));
});
