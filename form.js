/**
 * 获取form或者任意标签中的表单值
 * 支持多个form合并获取值, input支持suggestname作为name值
 *
 * @example
 * $('...').formObj() // key-value Object
 * $('...').formStr() // url type string
 * $('...').form() // Array
 *
 */
(function(factory) {
	// CommonJs
	if (typeof exports === 'object' && typeof module === 'object') {
		module.exports = factory(require);
	// requirejs
	} else if (typeof define === 'function' && (define.amd || define.cmd)) {
		define(factory);
	} else {
		throw new Error('You can use webpack or third party plugins that support the AMD/CMD protocol.');
	}
})(function(require) {
	require('./jquery.clone');

	var $ = require('jquery');
	var jQuery = $;
	var rCRLF = /\r?\n/g;
	var rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i;
	var rsubmittable = /^(?:input|select|textarea|keygen)/i;
	var rcheckableType = (/^(?:checkbox|radio)$/i);
	var suggest = 'suggest-input';

	var _form = function(enableBaseLine, supportEmptyValue, trimSpace) {
		enableBaseLine = enableBaseLine === undefined ? false : enableBaseLine;
		supportEmptyValue = supportEmptyValue === undefined ? false : supportEmptyValue;
		trimSpace = trimSpace === undefined ? true : trimSpace;

		return this.map(function() {
			var that = this;
			var tagName = this.tagName.toLowerCase();

			if (!rsubmittable.test(tagName) && tagName !== 'form') {
				// throw new Error('jQuery selector must be a form tag');
				var clone = $(this).clone();

				if (clone.find('form').length) {
					throw new Error('元素内部不能存在form表单');
				}

				that = $('<form>').append(clone).get(0);
			}

			// Can add propHook for 'elements' to filter or add form elements
			var elements = jQuery.prop(that, 'elements');

			return elements ? jQuery.makeArray(elements) : that;
		})
		.filter(function() {
			var type = this.type;

			// Use .is(':disabled') so that fieldset[disabled] works
			return (this.name || $(this).attr('suggestname'))
				&& !jQuery(this).is(':disabled')
				&& rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type)
				&& (this.checked || !rcheckableType.test(type));
		})
		.map(function(i, elem) {
			var $this = jQuery(this);
			var isSuggest = $this.hasClass(suggest);
			var val = isSuggest ? $this.attr('suggestvalue') : $this.val();
			var name = isSuggest ? $this.attr('suggestname') || this.name : this.name;

			name = enableBaseLine ? name.replace(/([A-Z])/g, '_$1').toLowerCase() : name;

			if (val === null) {
				return null;
			}

			if (trimSpace) {
				val = $.trim(val);
			}

			if (val === '' && !supportEmptyValue) {
				return null;
			}

			return jQuery.isArray(val)
				? jQuery.map(val, function(val) {
					return {name: name, value: (trimSpace ? $.trim(val) : val).replace(rCRLF, "\r\n")}; // eslint-disable-line
				})
				: {name: name, value: val.replace(rCRLF, "\r\n")}; // eslint-disable-line
		});
	};


	jQuery.fn.extend({
		/**
		 * 获取form表单数据
		 * 注意：选择最好使用form包裹，可以提高数据获取效率
		 *
		 * 1. class含有suggest-input 会根据suggestname 和 suggestvalue获取名称和值
		 * 2. 不获取disabled标签的内容
		 *
		 * @param {boolean} 是否把大写字母转换成下划线+对应的小写 默认false
		 * @param {boolean} 是否支持空值 默认false
		 * @param {boolean} 是否去掉左右空格 默认true
		 *
		 * @return {Array} [{name: , value: }, {}]
		 */
		form: function() {
			var args = $.makeArray(arguments);

			return _form.apply(this, args).get();
		},

		/**
		 * 换成object类型
		 * 注意：如果name相同则使用数组代替
		 *
		 * 参数同 form
		 * @return {object} {name:value, name:value, name:[v1,v2]}
		 */
		formObj: function() {
			var args = $.makeArray(arguments);
			var obj = {};

			_form.apply(this, args).each(function() {
				if (this.name in obj) {
					if ($.isArray(obj[this.name])) {
						obj[this.name].push(this.value);
					} else {
						obj[this.name] = [].concat(obj[this.name], this.value);
					}
				} else {
					obj[this.name] = this.value;
				}
			});

			return obj;
		},

		/**
		 * 存在数组则使用逗号分割
		 */
		formComma: function() {
			var obj = this.formObj.apply(this, arguments);
			var _obj = {};

			$.each(obj, function(key, item) {
				_obj[key] = $.isArray(item) ? item.join(',') : item;
			});

			return _obj;
		},

		/**
		 * 返回值转换成url string类型, 特殊字符会进行编码
		 *
		 * 参数同form
		 *
		 * @return {string} 'a=b&b=c&c=d&d[]=1&d[]=2'
		 */
		formStr: function() {
			var args = $.makeArray(arguments);

			return jQuery.param(this.formObj.apply(this, args));
		}
	});
});
