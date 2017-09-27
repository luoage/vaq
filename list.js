/**
 * 分页
 *
 * @example
 * 接口返回数据格式
 * {
 * 	code: 0,
 * 	info: {
 * 		list: [],
 * 		pagination: {
 * 			total: 总条数,
 * 			page: 当前第几页(可选)
 * 		}
 * 	}
 * }
 *
 * column字段约定
 * [
 *	{title:, field:, escape:, nowrap:}
 * ]
 *
 * new List({opts}).setQuery()
 */
define(function(require) {
	var $ = require('jquery');
	var base = require('./base');
	var Seq = require('./seq');
	var request = require('./request');

	var pageTpl = ''
		+ '	<div class="lg-pagination">'
		+ '		<[ if (+pagination.total) {]>'
		+ '		<p class="lg-pagination-detail">'
		+ '			显示第 <[- pagination.from ]>-<[- pagination.to ]> 条记录, 每页 <[- opts.perpage ]> 条, 共 <[- pagination.total ]> 条'
		+ '		</p>'
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
		+ '		<[ } else { ]>'
		+ '			<div class="lg-empty"><p>暂无数据 !</p></div>'
		+ '		<[ } ]>'
		+ '	</div>';
	var template = ''
		+ '<div class="lg-table-list">'
		+ '	<table cellpadding="0" cellspacing="0" border="0">'
		+ '		<thead>'
		+ '			<tr>'
		+ '				<[ opts.columns.forEach(function(item) { ]>'
		+ '					<th <[ if(item.className) {]> class="<[= item.className ]>" <[ } ]> ><[- item.title||\'\' ]></th>'
		+ '				<[ }) ]>'
		+ '			</tr>'
		+ '		</thead>'
		+ '		<tbody class="lg-table-tr">'
		+ '			<[list.forEach(function(record, key) { ]>'
		+ '			<tr data-index="<[- key ]>">'
		+ '				<['
		+ '					opts.columns.forEach(function(column) { '
		+ '					var value = record[column.field];'
		+ '				]>'
		+ '				<td <[- column.nowrap ? \'class="lg-white-space-nowrap"\' : \'\' ]> ><[- value === undefined ? \'\' : value ]></td>'
		+ '				<[ }) ]>'
		+ '			</tr>'
		+ '			<[ }) ]>'
		+ '		</tbody>'
		+ '	</table>'
		+ '</div>';

	var options = {
		container: undefined, // 容器，必填 {node|HTMLElement}
		template: template,
		pageTpl: pageTpl,
		page: 1, // 默认从第一页开始
		perpage: 10, // 每个页面的个数
		ajaxOpts: {},
		columns: [],
		isMask: true,
		maskOpts: {},
		pageFromServer: false // 以服务器返回的page作为当前页面
	};

	var List = base.inherit({
		initialize: function(opts) {
			this.opts = $.extend({}, options, opts);
			this.page = this.opts.page;
			this._query = function() {};
			this._parse = function(list) {
				return list;
			};
			this._resetcolumn = function(column) {
				return column;
			};

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
				page: page,
				total: total,
				totalPage: Math.ceil(total / opts.perpage),
				pageArray: array,
				from: (page - 1) * opts.perpage + 1,
				to: Math.min(page * opts.perpage, total)
			};
		},

		toList: function(list, pagination) {
			var opts = this.opts;
			var tpl = '<div class="lg-table-wrap lg-lg-lg">' + opts.template + opts.pageTpl + '</div>';

			var build = base.template(tpl)({
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
						? ((column.escape || column.escape === undefined) ? base.escapeHtml(value) : value)
						: '';
				});

				item._original_ = obj;

				_list.push(item);
			});

			return _list;
		},

		recolumn: function(cb) {
			typeof cb === 'function' && (this._resetcolumn = cb);

			return this;
		},

		_recolumn: function() {
			var columns = this.opts.columns || [];
			var _this = this;

			return (columns || []).map(function(column) {
				return $.extend({}, _this._resetcolumn(column));
			});
		},

		/**
		 * 渲染记录
		 *
		 * @param {object} options
		 */
		render: function() {
			var _this = this;
			var opts = this.opts;

			if (opts.columns) {
				opts.columns = this._recolumn();
			}

			this.request()
				.seq(function(list, pagination) {
					_this.toList(list, pagination);
					this(list);
				})
				.seq(function(list) {
					_this.attachData(list);
				})
				.resolve();
		},

		setQuery: function(cb) {
			typeof cb === 'function' && (this._query = cb);

			return this;
		},

		setParse: function(cb) {
			typeof cb === 'function' && (this._parse = cb);

			return this;
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

			var data = this._query();

			ajaxOpts.data = base.param(ajaxOpts.data, data);
			return ajaxOpts;
		},

		request: function() {
			var opts = this.opts;
			var _this = this;
			var ajaxOpts = this.query();

			if (opts.isMask) {
				ajaxOpts.mask = $.extend({
					target: $(opts.container)
				}, opts.maskOpts);
			}

			return new Seq()
				.seq(function() {
					request(ajaxOpts, this);
				})
				.seq(function(info) {
					info = info || {};

					var list = info.list || [];

					list = _this.build(_this._parse(list));

					var pagination = info.pagination || {};

					_this.page = opts.pageFromServer ? pagination.page : _this.page;

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
		},

		/**
		 * 把数据依附到对应的行
		 */
		attachData: function(list) {
			$(this.opts.container).find('.lg-table-tr').find('tr').each(function() {
				var $this = $(this);
				var index = $this.data('index');

				$this.data('record', (list[index] || {})._original_);
			});
		}
	});

	return List;
});
