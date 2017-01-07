{%extends file="../common/layout.tpl"%}

{%block name="css"%}
	<link rel="stylesheet" type="text/css" href="../../src/css/example/date.less" />
{%/block%}

{%block name="main"%}
<div style="width: 800px;height: 800px; margin: 300px auto;">
时间：<input type="input" name="date" value="2017-1-07 22:22:21" readonly />

<div node-type="named"></div>

<script type="template">
	<div class="lg-dates-pos">
		<div class="lg-title">
			<span node-type="lgLeft">&lt;</span>
			<span data-name="year" data-value="<[- info.year ]>" ><[- info.year ]></span>年
			<span data-name="month" data-value="<[- info.month ]>" ><[- pad(info.month+1) ]></span>月
			<span node-type="lgRight">&gt;</span>
		</div>
		<div class="lg-main" node-type="lgMain">
			<ul class="lg-week">
				<[ ['一', '二', '三', '四', '五', '六', '日'].forEach(function(value) { ]>
				<li><[- value ]></li>
				<[ }) ]>
			</ul>
			<ul class="lg-day" node-type="lgDays">
				<[
					info.days.forEach(function(value) {
				]>
					<li data-value="<[- value ]>"
					<[ if(dates.isSelected(value)) { ]>
						class="lg-selected"
					<[ } else if (dates.isToday(value)) {]>
						class="lg-today"
					<[ } ]>
					><[- value ]></li>
				<[ }) ]>
			</ul>
		</div>
		<div class="lg-time" node-type="lgTimePanel">
			<div class="lg-time-title">
				<div class="lg-hour-title">小时</div>
				<div class="lg-minute-title">分钟</div>
				<div class="lg-second-title">秒数</div>
			</div>
			<ul class="lg-hour lg-scrollbar" node-type="lgHour">
				<[ for(var i=0; i<24; i++) { ]>
				<li><[- pad(i) ]></li>
				<[ } ]>
			</ul>
			<ul class="lg-minute lg-scrollbar" node-type="lgMinute">
				<[ for(var i=0; i<60; i++) { ]>
				<li><[- pad(i) ]></li>
				<[ } ]>
			</ul>
			<ul class="lg-second lg-scrollbar" node-type="lgSecond">
				<[ for(var i=0; i<60; i++) { ]>
				<li><[- pad(i) ]></li>
				<[ } ]>
			</ul>
		</div>
		<div class="lg-bottom">
			<div class="lg-buttons">
				<span class="lg-button">清空</span>
				<span class="lg-button">今天</span>
				<span class="lg-button">确认</span>
			</div>
			<div class="lg-time-button" node-type="lgTime">
				<span node-type="hour"><[- info.hour ]></span>:
				<span node-type="minute"><[- info.minute ]></span>:
				<span node-type="second"><[- info.second ]></span>
			</div>
		</div>
	</div>
</div>
</script>
{%/block%}

{%block name="script"%}
<script>
	require(['example/time']);
</script>
{%/block%}
