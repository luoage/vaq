/**
 * 图片查看器
 *
 * @author luoage@msn.cn
 *
 * @TODO 对图片列表做瘦身, 这样显得会更规则
 * @TODO 旋转平滑，显示平滑，缩放平滑，反转平滑
 * @TODO 左右点击切换图片
 * @TODO 窗口调整
 *
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
	var keyboard = require('./keyboard');

	var body = $('body');
	var html = $('html');
	var win = $(window);
	var doc = $(document);
	var overflow = 'lg-overflow';
	var eventScope = 'lg-viewer';
	var layout = $('<div>').addClass('lg-viewer');

	// 事件
	var mousewheel = 'mousewheel.' + eventScope;
	var mousescroll = ' DOMMouseScroll.' + eventScope;
	var mousemove = 'mousemove.' + eventScope;
	var mouseup = 'mouseup.' + eventScope;
	var mousedown = 'mousedown.' + eventScope;
	var keyup = 'keyup.' + eventScope;

	var options = {
		pointer: 0, // 从第一个开始处理
		scale: 0.05, // 每次操作的缩放比例
		escKey: true, // esc操作关闭
		closeIcon: true, // 显示关闭按钮
		wheelKey: true, // 鼠标滑轮滚动图片缩放
		leftRightKey: true, // 左右按键切换图片
		loadingIcon: true, // loading图片
		imgAttr: '' // 使用什么属性获取图片链接
	};

	var toolbarTemplate = ''
		+ '	<ul class="lg-viewer-toolbar">'
		+ '		<li class="lg-viewer-zoom-in" data-action="zoom-in"></li>'
		+ '		<li class="lg-viewer-zoom-out" data-action="zoom-out"></li>'
		+ '		<li class="lg-viewer-reset" data-action="reset"></li>'
		+ '		<li class="lg-viewer-prev" data-action="prev"></li>'
		+ '		<li class="lg-viewer-next" data-action="next"></li>'
		+ '		<li class="lg-viewer-rotate-left" data-action="rotate-left"></li>'
		+ '		<li class="lg-viewer-rotate-right" data-action="rotate-right"></li>'
		+ '		<li class="lg-viewer-flip-horizontal" data-action="flip-horizontal"></li>'
		+ '		<li class="lg-viewer-flip-vertical" data-action="flip-vertical"></li>'
		+ '	</ul>'
		;

	var Viewer = base.inherit({
		initialize: function(opts) {
			this.opts = $.extend({}, options, opts);
			this.size = this._size();
			this.resetParam();

			this.showPanel();
		},

		render: function(index) {
			this.prepare();
			this._render(index);
		},

		/**
		 * 点击图片触发界面
		 */
		showPanel: function() {
			var _this = this;
			var target = this.opts.target;

			target.on('click.' + eventScope, function() {
				var index = target.toArray().indexOf(this);

				_this.render(index);
			});
		},

		image: function(target) {
			var img = new Image();

			img.src = this.opts.imgAttr && $(target).attr(this.opts.imgAttr) || target.src;

			return img;
		},

		imgsList: function() {
			var opts = this.opts;
			var target = opts.target;
			var list = document.createElement('div');
			var _this = this;

			list.className = 'lg-position-list';

			var imgTmp;

			target.each(function(key) {
				imgTmp = _this.image(this);
				$(imgTmp).data('index', key);

				list.appendChild(imgTmp);
			});

			return $(list);
		},

		prepare: function() {
			layout.html('');

			this.imgList = this.imgsList();
			this.represent = $('<div>').addClass('lg-represent');
			this.toolbar = $('<div>').addClass('lg-viewer-toolbar-wrap').html(toolbarTemplate);
			this.close = $('<div class="lg-viewer-button lg-viewer-close"></div>');
			this.layout = layout;

			!this.opts.closeIcon && this.close.hide();

			var bottom = $('<div>').addClass('lg-img-bottom').html(this.imgList);

			layout.append(this.close);
			layout.append(this.represent);
			layout.append(this.toolbar);
			layout.append(bottom);

			body.append(layout);

			this.addListener();
		},

		/**
		 * 删除界面和事件
		 */
		remove: function() {
			html.removeClass(overflow);
			doc.off(mousewheel).off(mousescroll).off(keyup).off(mousemove);

			this.layout.remove();
		},

		/**
		 * 渲染图片, 可用于直接触发界面
		 *
		 * @param {number} pointer
		 * @return {jquery} image
		 */
		_render: function(pointer) {
			!html.hasClass(overflow) && html.addClass(overflow);

			var opts = this.opts;
			var target = opts.target || [];

			pointer = pointer !== undefined ? pointer : opts.pointer;
			pointer = this.setPointer(pointer);

			var img = target[pointer];

			if (!img) {
				return;
			}

			this.imgActive(pointer);
			opts.pointer = pointer;

			var image = this.image(img);
			var _this = this;

			image = $(image).addClass('lg-represent-img').css('visibility', 'hidden');

			this.represent.addClass('lg-loading').html(image);

			image.on('load', function() {
				_this.represent.removeClass('lg-loading');
				_this.imgOffset(image);
				_this.centreImgList();

				image.css('visibility', 'visible');
			});
		},

		_size: function() {
			return {
				height: win.height(),
				width: win.width()
			};
		},

		/**
		 * 设置图片位置
		 * @param 图片
		 * @param 是否可以超过wrap
		 */
		imgOffset: function(image) {
			var height = image.height();
			var size = this.size;
			var topHeight = size.height - this.imgList.height() - this.toolbar.height();

			// 重置图片高度, 宽度会自适应
			var _height = Math.min(height, topHeight);

			image.css({
				height: _height
			});

			var _width = image.width();

			image.css({
				top: (topHeight - _height) / 2,
				left: (size.width - _width) / 2
			});
		},

		setPointer: function(pointer) {
			var opts = this.opts;
			var length = opts.target.length;

			pointer = +pointer >= length ? length - 1 : pointer;

			return pointer < 0 ? 0 : pointer;
		},

		// 下一张图
		nextImg: function() {
			var pointer = this.setPointer(++this.opts.pointer);

			this._render(pointer);
		},

		// 前一张图
		prevImg: function() {
			var pointer = this.setPointer(--this.opts.pointer);

			this._render(pointer);
		},

		// 重置
		resetImg: function() {
			var pointer = this.setPointer(this.opts.pointer);

			this.resetParam();
			this._render(pointer);
		},

		_transform: function(cb) {
			var prefix = ['', '-webkit-', '-o-', '-ms-', '-moz-'];
			var length = prefix.length;
			var image = this.represent.find('img');
			var i = 0;

			for (; i < length; i++) {
				image.css(prefix[i] + 'transform', cb.bind(this)(image));
			}
		},

		resetParam: function() {
			this.rotateAngle = 0;
			this.horizontal = 1;
			this.vertical = 1;
		},

		/**
		 * 缩放图片不更改中心点
		 *
		 * @param
		 * @param
		 */
		fixCenter: function(image, scale) {
			var height = image.height();
			var width = image.width();
			var _height = image.height() * scale;

			image.height(_height);

			var _width = image.width();
			var offset = {};

			offset.left = parseFloat(image.css('left'));
			offset.top = parseFloat(image.css('top'));

			image.css({
				top: offset.top - (_height - height) / 2,
				left: offset.left - (_width - width) / 2
			});
		},

		// 放大
		zoomInImg: function() {
			var image = this.represent.find('img');

			this.fixCenter(image, 1 + this.opts.scale);
		},

		// 缩小
		zoomOutImg: function() {
			var image = this.represent.find('img');

			this.fixCenter(image, 1 - this.opts.scale);
		},

		fixTransform: function() {
			return 'scale(' + this.horizontal + ', ' + this.vertical + ') rotate(' + this.rotateAngle + 'deg)';
		},

		rotateLeftImg: function() {
			var rotateAngle = this.rotateAngle + 90;

			this.rotateAngle = rotateAngle % 360;
			this._transform(function(image) {
				return this.fixTransform();
			});
		},

		rotateRightImg: function() {
			var rotateAngle = this.rotateAngle - 90;

			this.rotateAngle = rotateAngle % 360;
			this._transform(function(image) {
				return this.fixTransform();
			});
		},

		flipHorizontalImg: function() {
			this.horizontal *= -1;

			this._transform(function(image) {
				return this.fixTransform();
			});
		},

		flipVerticalImg: function() {
			this.vertical *= -1;

			this._transform(function(image) {
				return this.fixTransform();
			});
		},

		/**
		 * 拖拽图片
		 */
		drag: function(e) {
			var represent = this.represent.find('img');
			var offset = {};

			offset.left = parseFloat(represent.css('left'));
			offset.top = parseFloat(represent.css('top'));

			var spaceX = e.clientX - offset.left;
			var spaceY = e.clientY - offset.top;

			doc.on(mousemove, function(evt) {
				evt.preventDefault && evt.preventDefault();

				represent.css({
					left: evt.clientX - spaceX,
					top: evt.clientY - spaceY
				});
			});

			doc.on(mouseup, function() {
				doc.off(mousemove);
				doc.off(mouseup);
			});
		},

		/**
		 * 对元素添加事件
		 */
		addListener: function() {
			var _this = this;
			var opts = this.opts;

			this.toolbar.on('click', 'li', function() {
				var action = $(this).data('action');
				var act = action.replace(/-([a-z])/g, function(all, first) {
					return (first || '').toUpperCase();
				});

				_this[act + 'Img']();
			});

			this.imgList.on('click', 'img', function() {
				var index = $(this).data('index');

				_this._render(+index);
			});

			// 拖拽
			this.represent.on(mousedown, '.lg-represent-img', this.drag.bind(this));

			// 关闭界面
			this.close.on('click', function() {
				_this.remove();
			});

			var isUp = function(e) {
				if (e.type === 'DOMMouseScroll') {
					return e.originalEvent.detail > 0;
				} else {
					return e.originalEvent.wheelDelta < 0;
				}
			};

			// 放大缩小
			opts.wheelKey && doc.on([mousewheel, mousescroll].join(' '), function(e) {
				!isUp(e) ? _this.zoomInImg() : _this.zoomOutImg();
			});

			doc.on(keyup, function(e) {
				if (opts.escKey) {
					keyboard.isEsc(e) && _this.remove();
				}
				if (opts.leftRightKey) {
					keyboard.isLeft(e) && _this.prevImg();
					keyboard.isRight(e) && _this.nextImg();
				}
			});
		},

		/**
		 * 居中图片列表
		 */
		centreImgList: function() {
			var image = this.imgList.find('.lg-img-active');

			if (!image.length) {
				return;
			}

			var _left = 0;

			image.prevAll().each(function() {
				_left += $(this).outerWidth();
			});

			var width = image.outerWidth();
			var size = this.size;
			var left = (size.width / 2) - _left - width;

			this.imgList.css({
				left: left
			});
		},

		/**
		 * 设置图片
		 *
		 * @param {number} 需要显示的图片位置
		 * @param image 需要显示的图片
		 */
		imgActive: function(pointer, image) {
			var images = this.imgList.find('img');

			images.removeClass('lg-img-active');
			$(image || images[pointer]).addClass('lg-img-active');
		}
	});

	return Viewer;
});
