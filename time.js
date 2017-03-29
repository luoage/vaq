/**
 * 时间控件
 * @TODO 当input时间不符合规范，生成的date有错误
 */
define(function(require) {
	var $ = require('jquery');
	var base = require('./base');

	var layout = $('body');
	var wrap = $('<div>').addClass('lg-dates').addClass('lg-lg-lg');

	// default options
	var options = {
		layout: layout,
		target: '',
		realTime: true, // 点击后实时显示
		closeSecondStep: true, // 点击确认按钮关闭
		hasSecond: true, // 是否存在秒
		hastime: true, // 是否存在时间
		zIndex: 99,
		nicetop: 1,
		autoClose: false, // 自动关闭
		setTodayAutoClose: false // 点击今天按钮自动关闭
	};

	var yearListTemplate = ''
		+ '		<div class="lg-time-title">'
		+ '			<span class="lg-enable" data-type="prev_group_year">&lt;</span>'
		+ '			<span><[- info.year ]></span>'
		+ '			<span class="lg-enable" data-type="next_group_year">&gt;</span>'
		+ '		</div>'
		+ '		<ul data-type="set_full_year">'
		+ '			<[ for(var i=info.year-9; i<=info.year+10; i++) { ]>'
		+ '			<li data-value="<[- i ]>"'
		+ '				<[ if(info.year === i) {]>'
		+ '				class="lg-selected"'
		+ '				<[ } ]>'
		+ '			><[- i ]></li>'
		+ '			<[ } ]>'
		+ '		</ul>'
		;
	var monthListTemplate = ''
		+ '		<ul data-type="set_month">'
		+ '			<[ for(var i=1; i<13; i++) { ]>'
		+ '			<li data-value="<[- i-1 ]>"'
		+ '				<[ if(info.month === (i-1)) {]>'
		+ '				class="lg-selected"'
		+ '				<[ } ]>'
		+ '			><[- i ]></li>'
		+ '			<[ } ]>'
		+ '		</ul>'
		;
	var timeListTemplate = ''
		+ '		<div class="lg-time-title">'
		+ '			<div class="lg-hour-title">小时</div>'
		+ '			<div class="lg-minute-title">分钟</div>'
		+ '			<[ if (opts.hasSecond) { ]>'
		+ '			<div class="lg-second-title">秒数</div>'
		+ '			<[ } ]>'
		+ '		</div>'
		+ '		<div>'
		+ '		<ul class="lg-hour lg-scrollbar" node-type="lgHour"  data-type="set_time" data-value="setHours">'
		+ '			<[ for(var i=0; i<24; i++) { ]>'
		+ '			<li data-value="<[- i ]>" <[- pad(i) === info.hour ? \'class="lg-selected"\' : \'\' ]>><[- pad(i) ]></li>'
		+ '			<[ } ]>'
		+ '		</ul>'
		+ '		<ul class="lg-minute lg-scrollbar" node-type="lgMinute"  data-type="set_time" data-value="setMinutes">'
		+ '			<[ for(var i=0; i<60; i++) { ]>'
		+ '			<li data-value="<[- i ]>" <[- pad(i) === info.minute ? \'class="lg-selected"\' : \'\' ]>><[- pad(i) ]></li>'
		+ '			<[ } ]>'
		+ '		</ul>'
		+ '		<[ if (opts.hasSecond) { ]>'
		+ '		<ul class="lg-second lg-scrollbar" node-type="lgSecond"  data-type="set_time" data-value="setSeconds">'
		+ '			<[ for(var i=0; i<60; i++) { ]>'
		+ '			<li data-value="<[- i ]>" <[- pad(i) === info.second ? \'class="lg-selected"\' : \'\' ]>><[- pad(i) ]></li>'
		+ '			<[ } ]>'
		+ '		</ul>'
		+ '		<[ } ]>'
		+ '		</div>'
		;
	var html = ''
		+ '	<div class="lg-title">'
		+ '		<span data-type="prev_month" class="lg-enable">&lt;</span>'
		+ '		<span data-type="year_list" data-value="<[- info.year ]>" class="lg-enable"><[- info.year ]></span>年'
		+ '		<span data-type="month_list" data-value="<[- info.month ]>" class="lg-enable"><[- pad(info.month+1) ]></span>月'
		+ '		<span data-type="next_month" class="lg-enable">&gt;</span>'
		+ '	</div>'
		+ '	<div class="lg-main" node-type="lgMain">'
		+ '		<ul class="lg-week">'
		+ '			<[ [\'一\', \'二\', \'三\', \'四\', \'五\', \'六\', \'日\'].forEach(function(value) { ]>'
		+ '			<li><[- value ]></li>'
		+ '			<[ }) ]>'
		+ '		</ul>'
		+ '		<ul class="lg-day" node-type="lgDays" data-type="set_date">'
		+ '			<['
		+ '				info.days.forEach(function(item) {'
		+ '			]>'
		+ '				<li data-value="<[- item.value ]>" data-month="<[- item.month ]>" data-year="<[- item.year ]>"'
		+ '					class="<[- dates.isToday(item) ? \'lg-today\' : \'\' ]> <[- dates.isSelected(item) ? \'lg-selected\' : \'\' ]>"'
		+ '				><[- item.value ]></li>'
		+ '			<[ }) ]>'
		+ '		</ul>'
		+ '	</div>'
		+ '	<div data-type="section_list" style="display: none">'
		+ '	</div>'
		+ '	<script node-type="lgMonthList">'
		+ '	</script>'
		+ '	<div class="lg-bottom">'
		+ '		<div class="lg-buttons">'
		+ '			<span class="lg-button" data-type="empty_value">清空</span>'
		+ '			<span class="lg-button" data-type="set_today">今天</span>'
		+ '			<[ if (opts.closeSecondStep) {]>'
		+ '			<span class="lg-button" data-type="make_up"><[- opts.realTime ? \'关闭\' : \'确定\' ]></span>'
		+ '			<[ } ]>'
		+ '		</div>'
		+ '		<div class="lg-time-button" node-type="lgTime" data-type="time_list">'
		+ '			<[ if(opts.hastime) {]>'
		+ '			<span class="lg-setHours"><[- info.hour ]></span>'
		+ '			: <span class="lg-setMinutes"><[- info.minute ]></span>'
		+ '			<[ if(opts.hasSecond){ ]>'
		+ '			: <span class="lg-setSeconds"><[- info.second ]></span>'
		+ '			<[ } ]>'
		+ '			<[ } ]>'
		+ '		</div>'
		+ '	</div>'
		;

	var Dates = base.inherit({
		initialize: function(time) {
			this.setDate(time);
		},

		setDate: function(time) {
			this.date = new Date(time || new Date());
		},

		size: function() {
			return [31, this.isLeapYear() ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		},

		dateStr: function() {
			var dateObj = this.dateObj();

			return [dateObj.year, base.pad(dateObj.month + 1), dateObj.day].join('-') + ' '
				+ [dateObj.hour, dateObj.minute, dateObj.second].join(':');
		},

		dateObj: function() {
			var date = this.date;
			var obj = {
				year: this.year(),
				month: this.month(),
				day: base.pad(date.getDate()),
				hour: base.pad(date.getHours()),
				minute: base.pad(date.getMinutes()),
				second: base.pad(date.getSeconds())
			};

			return obj;
		},

		/**
		 * is leap year
		 *
		 * @return boolean
		 */
		isLeapYear: function() {
			var y = this.year();

			return (y % 400 === 0) || (y % 4 === 0 && (y % 100 !== 0));
		},

		isToday: function(item) {
			var date = new Date();

			return [date.getFullYear(), date.getMonth(), date.getDate()].join('-')
				=== [item.year, item.month, item.value].join('-');
		},

		isSelected: function(item) {
			var date = this.date;

			return date.getDate() === item.value
				&& this.year() === item.year
				&& this.month() === item.month;
		},

		year: function() {
			return this.date.getFullYear();
		},

		month: function() {
			return this.date.getMonth();
		},

		/**
		 * 生成日期
		 *
		 * @param {number} y
		 * @param {number} m
		 * @return {Array}
		 */
		days: function(y, m) {
			y = y || this.year();
			m = m || this.month();

			var size = this.size();

			var firstDay = new Date(y, m, 1);
			var lastDay = new Date(y, m, size[m]);

			var dayOfFirst = firstDay.getDay();
			var dayOfLast = lastDay.getDay();
			var lastMonthLength = dayOfFirst ? dayOfFirst - 1 : 6;
			var nextMonthLength = dayOfLast ? 7 - dayOfLast : 0;
			var length = lastMonthLength + size[m] + nextMonthLength;
			var daysArray = [];

			var next = this.nextMonth(y, m);
			var prev = this.prevMonth(y, m);
			var prevMonthStart = size[prev.month] - lastMonthLength;

			var a = 1;
			var b = 1;
			var i = 0;

			var obj;

			for (; i < length; i++) {
				if (lastMonthLength > i) {
					obj = {
						value: ++prevMonthStart,
						month: prev.month,
						year: prev.year
					};
				} else if (lastMonthLength + size[m] > i) {
					obj = {
						value: a++,
						month: m,
						year: y
					};
				} else {
					obj = {
						value: b++,
						month: next.month,
						year: next.year
					};
				}

				daysArray[i] = obj;
			}

			return daysArray;
		},

		prevMonth: function(year, month) {
			var realMonth = month - 1;

			if (realMonth < 0) {
				realMonth = 11;
				year--;
			}

			return {
				month: realMonth,
				year: year
			};
		},

		nextMonth: function(year, month) {
			var realMonth = month + 1;

			if (realMonth > 11) {
				realMonth = 0;
				year++;
			}

			return {
				month: realMonth,
				year: year
			};
		}
	});

	var dates = new Dates();

	var Time = base.inherit({
		initialize: function(opts) {
			this.opts = $.extend({}, options, opts);

			var target = this.opts.target;
			var data = $(target).data();
			var optsKey = Object.keys(options);

			var additionOpts = base.filter(data, function(key) {
				return optsKey.indexOf(key) > -1;
			});

			$.extend(this.opts, additionOpts);

			var value = '';

			if (target.tagName.toLowerCase() === 'input') {
				value = target.value || '';
			} else {
				value = target.innerHTML || '';
			}

			value = value.trim() ? value.trim().replace(/-/g, '/') : base.formatDate('yyyy/mm/dd hh:ii:ss');

			this.targetValue = value;

			wrap.remove();
			this.opts.layout.append(wrap);

			this.body = $('<div>').addClass('lg-dates-pos');
			this.addEvent();

			this.render();
		},

		format: function() {
			return 'yyyy/mm/dd' + (this.opts.hastime ? ' hh:ii' + (this.opts.hasSecond ? ':ss' : '') : '');
		},

		setTargetValue: function() {
			this.targetValue = base.formatDate(this.format(), dates.date);
		},

		setValue: function() {
			this.setTargetValue();
			this.setBody();
		},

		setBody: function() {
			var template = this.template.apply(this, arguments);

			this.body.html(template);

			wrap.html(this.body);
			this.nodes = base.getNodes(this.body.get(0));
		},

		remove: function() {
			wrap.remove();
		},

		template: function(date) {
			date = date || base.formatDate(this.targetValue);

			dates.setDate(date);

			var template = base.template(html)({
				pad: base.pad,
				dates: dates,
				opts: this.opts,
				info: $.extend(dates.dateObj(), {
					days: dates.days()
				})
			});

			return template;
		},

		render: function() {
			this.setBody();
			this.setPosition();
		},

		/**
		 * 添加事件
		 */
		addEvent: function() {
			var _this = this;
			var upper = function(string) {
				return (string || '').replace(/_([a-z])/g, function(all, b) {
					return b.toUpperCase();
				});
			};

			wrap.on('click', function() {
				return false;
			});

			wrap.on('click', '[data-type]', function(e) {
				var type = $(this).data('type');
				var format = _this.format();

				type = upper(type);

				var result = _this[type] && _this[type]($(this), e);

				if (result) {
					_this.opts.realTime && (_this.opts.target.value = base.formatDate(format, dates.date).replace(/\//g, '-'));
				}
			});
		},

		setPosition: function() {
			var obj = $(this.opts.target).offset();
			var h = $(this.opts.target).outerHeight();

			wrap.css({
				left: obj.left,
				top: obj.top + h - this.opts.nicetop,
				zIndex: this.opts.zIndex
			});
		}
	})
	.$extend({
		nextGroupYear: function() {
			dates.date.setFullYear(dates.year() + 20);

			var template = base.template(yearListTemplate)({
				info: dates.dateObj()
			});

			var section = this.body.find('[data-type="section_list"]');
			var height = this.body.find('.lg-main').outerHeight();

			section.html(template);
			section.find('ul').height(height);
		},

		prevGroupYear: function() {
			dates.date.setFullYear(dates.year() - 20);

			var template = base.template(yearListTemplate)({
				info: dates.dateObj()
			});

			var section = this.body.find('[data-type="section_list"]');
			var height = this.body.find('.lg-main').outerHeight();

			section.html(template);
			section.find('ul').height(height);
		},

		/**
		 * 确定
		 */
		makeUp: function() {
			this.opts.closeSecondStep && this.remove();

			if (this.opts.realTime) {
				return;
			}

			var format = this.format();

			this.opts.target.value = base.formatDate(format, dates.date).replace(/\//g, '-');
		},

		/**
		 * 设置今天
		 */
		setToday: function() {
			dates.setDate();

			this.setValue();
			this.opts.setTodayAutoClose && this.remove();

			return true;
		},

		/**
		 * 操作清空
		 */
		emptyValue: function() {
			this.opts.target.value = '';
		},

		/**
		 * 操作下一个月
		 */
		nextMonth: function($this) {
			var y = this.body.find('[data-type="year_list"]').data('value');
			var m = this.body.find('[data-type="month_list"]').data('value');

			var obj = dates.nextMonth(y, m);

			dates.date.setMonth(obj.month);
			dates.date.setFullYear(obj.year);

			this.setValue();
			return true;
		},

		/**
		 * 操作上一个月
		 */
		prevMonth: function($this) {
			var y = this.body.find('[data-type="year_list"]').data('value');
			var m = this.body.find('[data-type="month_list"]').data('value');

			var obj = dates.prevMonth(y, m);

			dates.date.setMonth(obj.month);
			dates.date.setFullYear(obj.year);

			this.setValue();
			return true;
		},

		/**
		 * 操作时分秒
		 */
		setTime: function($this, e) {
			var target = $(e.target);
			var value = target.data('value');
			var type = $this.data('value');

			$this.children().removeClass('lg-selected');
			target.addClass('lg-selected');

			dates.date[type](value);

			this.body.find('.lg-' + type).html(base.pad(value));

			this.setTargetValue();
			return true;
		},

		/**
		 * 操作日期
		 */
		setDate: function($this, e) {
			var target = $(e.target);
			var value = target.data('value');

			// 	清空当前选择项
			$this.children().removeClass('lg-selected');
			target.addClass('lg-selected');

			// 设置日期
			var y = $(target).data('year');
			var m = $(target).data('month');

			dates.date.setDate(value);
			dates.date.setFullYear(y);
			dates.date.setMonth(m);

			this.body.find('[data-type="year_list"]').data('value', y).html(y);
			this.body.find('[data-type="month_list"]').data('value', m).html(base.pad(m + 1));

			this.setTargetValue();
			this.opts.autoClose && this.remove();
			return true;
		},

		/**
		 * 操作年份
		 */
		setFullYear: function($this, e) {
			var target = $(e.target);
			var value = target.data('value');

			$this.children().removeClass('lg-selected');
			target.addClass('lg-selected');

			dates.date.setFullYear(value);
			this.setValue();

			return true;
		},

		/**
		 * 操作月份
		 */
		setMonth: function($this, e) {
			var target = $(e.target);
			var value = target.data('value');

			$this.children().removeClass('lg-selected');
			target.addClass('lg-selected');

			dates.date.setMonth(value);
			this.setValue();

			return true;
		},

		/**
		 * 显示年份
		 */
		yearList: function() {
			var template = base.template(yearListTemplate)({
				info: dates.dateObj(),
				pad: base.pad
			});

			var section = this.body.find('[data-type="section_list"]');
			var height = this.body.find('.lg-main').outerHeight();

			section.attr('class', 'lg-years-list').html(template).show();
			section.find('ul').height(height);
		},

		/**
		 * 显示月份
		 */
		monthList: function() {
			var template = base.template(monthListTemplate)({
				info: dates.dateObj(),
				pad: base.pad
			});

			var section = this.body.find('[data-type="section_list"]');
			var height = this.body.find('.lg-main').outerHeight();

			section.attr('class', 'lg-month-list').html(template).show();
			section.find('ul').height(height);
		},

		/**
		 * 显示时间列表
		 */
		timeList: function() {
			var section = this.body.find('[data-type="section_list"]');

			if (section.css('display') === 'block') {
				section.hide();
				return;
			}

			var template = base.template(timeListTemplate)({
				opts: this.opts,
				pad: base.pad,
				info: dates.dateObj()
			});

			var height = this.body.find('.lg-main').outerHeight();

			section.attr('class', 'lg-time-list').html(template).show();

			var ul = section.find('ul');

			ul.height(height)
				.scrollTop(function() {
					return $(this).find('.lg-selected').position().top - 120;
				});

			// @TODO
			if (ul.length === 2) {
				ul.width(81);
				section.find('.lg-time-title').children().width(81);
			}
		}
	});

	Time.getWrap = function() {
		return wrap;
	};

	return Time;
});
