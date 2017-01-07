/**
 * by jl
 *
 * @example
 */
define(function() {
	var base = require('lib/base');
	var observe = require('lib/observe');

	var Dates = base.inherit({
		initialize: function(time) {
			this.date = new Date(time || new Date());
		},

		size: function() {
			return [31, this.isLeapYear() ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
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

		isToday: function(day) {
			return base.formatDate('yyyy-mm-d') === base.formatDate('yyyy-mm', this.date) + '-' + day;
		},

		isSelected: function(value) {
			return this.date.getDate() === value;
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
			var y = y || this.year();
			var m = m || this.month();
			var size = this.size();

			var firstDay = new Date(y, m, 1);
			var lastDay = new Date(y, m, size[m]);

			var dayOfFirst = firstDay.getDay();
			var dayOfLast = lastDay.getDay();
			var lastMonthLength = dayOfFirst ? dayOfFirst - 1 : 6;
			var nextMonthLength = dayOfLast ? 7 - dayOfLast : 0;
			var length =  lastMonthLength + size[m] + nextMonthLength;
			var array = new Array(length);
			var value;
			var prevMonthStart = size[this.prevMonth(m)] - lastMonthLength;

			var a = 1;
			var b = 1;
			var i = 0;

			for(; i< length; i++) {
				if (lastMonthLength  > i) {
					value = ++prevMonthStart;
				} else if(lastMonthLength + size[m] > i) {
					value = a++;
				} else {
					value = b++;
				}

				array[i] = value;
			}

			return array;
		},

		prevMonth: function(month) {
			var realMonth = month - 1;

			return realMonth < 0 ? 11 : realMonth;
		},

		nextMonth: function(month) {
			var realMonth = month + 1;

			return realMonth > 11 ? 0 : realMonth;
		}
	});

	var U = function(target) {
		return new U.init(target);
	};

	U.init = base.inherit({
		initialize: function(target) {
			this.target = target;
		},

		attr: function(attrName) {
			return this.target.getAttribute(attrName);
		},

		data: function(dataName) {
			return this.target.dataset
				? this.target.dataset.value
				: this.attr('data-' + dataName);
		},

		_setPx: function(attr, value) {
			var usePx = ['height'];

			return usePx.indexOf(attr) === -1 ? value : value + 'px';
		},

		css: function(styleObj) {
			var target = this.target;

			Object.keys(styleObj).forEach(function(key) {
				target.style[key] = this._setPx(key, styleObj[key]);
			}.bind(this));

			return this;
		},

		isChildOf: function(parent, level) {
			var target = this.target;
			var is = false;
			
			while ((level !== undefined ? level-- : true) && target) {
				if (target === parent) {
					is = true;
					break;
				}
				target = target.parentNode;
			}

			return is;
		}
	});

	// default options
	var options = {
		target: document.querySelector('[name="date"]'),
	};

	var Time = base.inherit({
		initialize: function(opts) {
			this.opts = opts || options;

			var target = this.opts.target;

			this.targetValue = target.tagName.toLowerCase() === 'input' ? target.value : target.innerHTML || base.formatDate('yyyy-mm-dd hh:ii:ss');

			this.init();
			this.addEvent();
		},

		init: function() {
			var div = document.createElement('div');

			div.className = 'lg-dates';
			this.body = div;
			this.setBody();
		},

		nextMonth: function() {
			var dates = new Dates(this.targetValue);
			var dateObj = dates.dateObj();

			var nextMonth = function(month) {
				var m = month + 2;
				var y = dateObj.year;


				if (m > 12) {
					m = 1;
					y = y + 1;
				}

				return {m: m, y: y};
			};

			var next = nextMonth(dateObj.month);
			var stringDate = [next.y, next.m, dateObj.day].join('-') + ' ' + [dateObj.hour, dateObj.minute, dateObj.second].join(':');

			this.targetValue = stringDate;
			this.setBody();
		},

		dateString: function() {
			var nodes = this.nodes;

			return {
			};
		},

		prevMonth: function() {
			var dates = new Dates(this.targetValue);
			var dateObj = dates.dateObj();

			var prevMonth = function(month) {
				var m = month;
				var y = dateObj.year;

				if (m <= 0) {
					m = 12;
					y = y - 1;
				}

				return {m: m, y: y};
			};

			var prev = prevMonth(dateObj.month);
			var stringDate = [prev.y, prev.m, dateObj.day].join('-') + ' ' + [dateObj.hour, dateObj.minute, dateObj.second].join(':');

			this.targetValue = stringDate;

			this.setBody();
		},

		setBody: function() {
			this.body.innerHTML = this.template.apply(this, arguments);
		},

		template: function(date) {
			var date = date || base.formatDate(this.targetValue);
			var dates = new Dates(date);

			var template = base.template(document.querySelector('[type="template"]').innerHTML)({
				pad: base.pad,
				dates: dates,
				info: Object.assign(dates.dateObj(), {
					days: dates.days(),
				})
			});

			return template;
		},

		/**
		 * 添加事件
		 */
		addEvent: function() {
			var nodes = this.nodes;
			var _this = this;

			// 控制时间控件的显示
			var timePanel = base.toggle(function() {
					_this.setTimeHeight();
					U(nodes.lgTimePanel).css({display: 'block'});
				}, function() {
					U(nodes.lgTimePanel).css({display: 'none'});
				});

			this.body.addEventListener('click', function(e) {
				_this.nodes = nodes = base.getNodes(this);

				var target = e.target;
				var parentNode = target.parentNode;


				if (parentNode === nodes.lgDays) { // 选择日期
					parentNode.childNodes.forEach(function(node) {
						node.className = '';
					});

					target.className = 'lg-selected';

				} else if(U(target).isChildOf(nodes.lgTime, 2)) { // 选择时间
					timePanel();
				} else if (target === nodes.lgLeft) {
					_this.prevMonth();
				} else if (target === nodes.lgRight) {
					_this.nextMonth();
				}
			}, false);
		},

		setTimeHeight: function() {
			var nodes = this.nodes;
			var height = nodes.lgMain.clientHeight;

			U(nodes.lgHour).css({height: height});
			U(nodes.lgMinute).css({height: height});
			U(nodes.lgSecond).css({height: height});
		},

		render: function() {
			var nodes = base.getNodes();

			nodes.named.appendChild(this.body);

			this.nodes = base.getNodes(this.body);
		}
	});


	// @example
	var time = new Time();

	time.render();


	return Time;
});
