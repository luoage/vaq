/**
 * 分页
 *
 * @author jl
 *
 * @example
 * 接口返回数据格式
 *
 * {
 * 	code: 0,
 * 	info: {
 * 		list: [],
 * 		pagination: {
 * 			total: 总条数,
 * 			page: 当前第几页
 * 		}
 * 	}
 * }
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
	var base = require('./base');
	var Seq = require('./seq');
	var request = require('./request');

	var options = {
		page: 1, // 默认从第一页开始
		perpage: 10, // 每个页面的个数
		ajaxOpts: {},
		columns: [],
		setQquery: function() {} // query callback
	};

	var template = ''
		+ '<div class="lg-table-list lg-lg-lg">'
		+ '	<table>'
		+ '		<thead>'
		+ '			<tr>'
		+ '				<[ opts.columns.forEach(function(item) { ]>'
		+ '					<th><[- item.title||\'\' ]></th>'
		+ '				<[ }) ]>'
		+ '			</tr>'
		+ '		</thead>'
		+ '		<tbody>'
		+ '			<[list.forEach(function(record) { ]>'
		+ '			<tr>'
		+ '				<['
		+ '					opts.columns.forEach(function(column) { '
		+ '					var value = record[column.field];'
		+ '				]>'
		+ '				<td><[- value === undefined ? \'\' : value ]></td>'
		+ '				<[ }) ]>'
		+ '			</tr>'
		+ '			<[ }) ]>'
		+ '		</tbody>'
		+ '	</table>'
		+ '	<div class="lg-pagination">'
		+ '		<p class="lg-pagination-detail">'
		+ '			显示第 <[- pagination.from ]>-<[- pagination.to ]> 条记录, 每页 <[- opts.perpage ]> 条, 共 <[- pagination.total ]> 条'
		+ '		</p>'
		+ '		<[ if (+pagination.total) {]>'
		+ '		<ul>'
		+ '			<[ if (pagination.page > 1 ) { ]>'
		+ '			<li data-page="<[- pagination.page - 1 ]>" >&lt;</li>'
		+ '			<[ } ]>'
		+ '			<['
		+ '				for(var i=0; i<pagination.pageArray.length; i++) {'
		+ '				var current = pagination.pageArray[i];'
		+ '			]>'
		+ '				<li'
		+ '					<[- current === pagination.page ? \'class="lg-pagination-active"\' : \'\' ]>'
		+ '					data-page="<[- current ]>"'
		+ '					data-active="<[- +(current === pagination.page) ]>"'
		+ '				>'
		+ '					<[- current ]>'
		+ '				</li>'
		+ '			<[ } ]>'
		+ '			<[ if (!(pagination.page === pagination.totalPage)) { ]>'
		+ '			<li data-page="<[- pagination.page + 1 ]>" >&gt;</li>'
		+ '			<[ } ]>'
		+ '		</ul>'
		+ '		<[ } ]>'
		+ '	</div>'
		+ '</div>';

	var List = base.inherit({
		initialize: function(opts) {
			this.opts = $.extend({}, options, opts);
			this.page = this.opts.page;

			this.addListener();
		},

		addListener: function() {
			var node = this.opts.container;
			var _this = this;

			$(node).on('click', '.lg-pagination li', function() {
				var data = $(this).data();
				var page = +data.page;

				page && !+data.active && _this.setPage(page);
			});
		},

		_pagination: function(page, totalPage) {
			var array = [];

			if (totalPage <= 5) {
				var i = 0;

				while (++i <= totalPage) {
					array.push(i);
				}

				return array;
			}

			if (page > 3) {
				array.push(1);
				page !== 3 && array.push('...');
			}

			if (page === 3 || page === totalPage) {
				array.push(page - 2);
			}

			if (page >= 2) {
				array.push(page - 1);
			}

			array.push(page);

			(page + 1 <= totalPage) && array.push(page + 1);

			if (page === 1) {
				array.push(page + 2);
			}

			if (page + 1 < totalPage) {
				page + 2 !== totalPage && array.push('...');
				array.push(totalPage);
			}

			return array;
		},

		pagination: function(pagination) {
			var opts = this.opts;
			var page = this.page;
			var total = pagination.total;
			var totalPage = Math.ceil(total / opts.perpage);
			var array = this._pagination(page, totalPage);

			return {
				page: this.page,
				total: total,
				totalPage: Math.ceil(total / opts.perpage),
				pageArray: array,
				from: (pagination.page - 1) * opts.perpage + 1,
				to: pagination.page * opts.perpage
			};
		},

		toList: function(list, pagination) {
			var opts = this.opts;

			var build = base.template(template)({
				opts: opts,
				list: list,
				pagination: this.pagination(pagination)
			});

			opts.container.innerHTML = build;
		},

		build: function(list) {
			var columns = this.opts.columns || [];
			var _list = [];

			$.each(list, function(key, obj) {
				var item = {};

				// TODO 这里直接使用field作为键使用
				columns.forEach(function(column) {
					var value = base.get(obj, column.field);

					item[column.field] = value !== undefined && value !== null
						? (column.escape ? base.escapeHtml(value) : value)
						: '';
				});

				_list.push(item);
			});

			return _list;
		},

		/**
		 * 渲染记录
		 *
		 * @param {object} options
		 */
		render: function() {
			var _this = this;

			this.request()
				.seq(function(list, pagination) {
					_this.toList(list, pagination);
				})
				.resolve();
		},

		/**
		 * 设置请求参数
		 *
		 * @param {object}
		 * @return {object}
		 */
		query: function() {
			var opts = this.opts;
			var ajaxOpts = $.extend({}, opts.ajaxOpts);

			if (ajaxOpts.url) {
				ajaxOpts.url = base.url(ajaxOpts.url, {
					page: this.page,
					perpage: opts.perpage
				});
			}

			var data = opts.setQuery();

			ajaxOpts.data = base.param(ajaxOpts.data, data);
			return ajaxOpts;
		},

		request: function() {
			var _this = this;
			var ajaxOpts = this.query();

			return new Seq()
				.seq(function() {
					request(ajaxOpts, this);
				})
				.seq(function(info) {
					info = info || {};

					var list = _this.build(info.list);
					var pagination = info.pagination || {};

					_this.page = pagination.page;

					this(list, { total: pagination.total });
				});
		},

		/**
		 * 设置页面
		 *
		 * @param {int} 指定具体页面
		 * @return void
		 */
		setPage: function(page) {
			this.page = page;
			this.render();
		}
	});

	return List;
});
