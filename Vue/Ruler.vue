<style lang="less">
	@bgGray : #333;

	.vi_ruler{
		font-size: 12px;
		line-height: 1;
		font-family: -apple-system, BlinkMacSystemFont, "PingFang SC","Helvetica Neue",STHeiti,"Microsoft Yahei",Tahoma,Simsun,sans-serif;

		* {
			box-sizing: content-box !important;
		}


		.vi_rulerItem{
			position: absolute;
			z-index: 99995;
			user-select: none;

			.vi_txt{
				white-space: nowrap;
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				font-size: 12px;
				background-color: rgba(237,237,237,.85);
				border-radius: 3px;
				padding: 2px 3px;
				line-height: 1;
			}

			.vi_close{
				line-height: 1;
				position: absolute;
				right: 2px;
				top: 2px;
				background-color: rgba(50, 122, 228, 1);
				cursor: pointer;
				padding: 2px;
				color: rgba(237,237,237,1);
			}

			&.vi_cur > div{
				position: absolute;
				left: 0; top: 0;

				.vi_txt{
					transform: translate(0, -115%);
				}
			}
		}

		.vi_rulerCrossX{
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			height: 1px;
			pointer-events: none;
			z-index: 99996;
		}
		.vi_rulerCrossY{
			position: fixed;
			left: 0;
			top: 0;
			bottom: 0;
			width: 1px;
			pointer-events: none;
			z-index: 99996;
		}
	}
</style>

<template>
	<div class="vi_ruler">
		<div class="vi_rulerItem"
			:class="{vi_cur: items.length - 1 === index && startDraw}"
			@click.stop
			v-for="(item, index) in items" :key="index"
			v-show="item.w > 0 && item.h > 0"
			:style="{width: item.w + 'px', height: item.h + 'px', left: item.x + 'px', top: item.y + 'px', backgroundColor: bgc}">
			<div v-if="showSize">
				<span class="vi_close" :style="{backgroundColor: bgColor}" @touchstart.stop="remove(index)" @mousedown.stop="remove(index)" v-show="!startDraw">X</span>
				<span class="vi_txt">{{ item.w | toFixed }} x {{ item.h | toFixed }}</span>
			</div>
		</div>

		<span class="vi_rulerCrossX" :style="{transform: 'translateY(' + (top - offsetLine) + 'px) scale(1, ' + offsetLine + ')', backgroundColor: bgColor}"></span>
		<span class="vi_rulerCrossY" :style="{transform: 'translateX(' + (left - offsetLine) + 'px) scale(' + offsetLine + ', 1)', backgroundColor: bgColor}"></span>

		<Shadow v-if="showShadow" @positionShadow="handleShadowCrosshair" :showSize="showSize"/>

		<Toolbar v-if="showToolbar"/>
	</div>
</template>

<script>
	import { throttle, hex2rgba, isChrome } from "../utils";
	// import getShadowVm from "./shadow";
	import Shadow from "./shadow.vue";
	import Toolbar from "./Toolbar";

	export default {
		name: "Ruler",
		components: {Toolbar, Shadow},
		data() {
			return {
				items: [],
				startDraw: false,
				left:0,
				top:0,
				showShadow: false,
				cursorFollowMouse: true,
				shadowItem: null,
				bgColor: '#1171cd',
				bgOpacity: .3,
				snapToAngle: 15,
				snapToLine: 50,
				offsetLine: isChrome ? .3 : .5,
				showSize:  true,
				showToolbar: false
			}
		},

		computed: {
			bgc() {
				return hex2rgba(this.bgColor, this.bgOpacity);
			}
		},

		watch: {
			showShadow(val) {
				if (!val) this.cursorFollowMouse = true;
			}
		},

		methods: {
			doAction: throttle(function (e){
				this.showShadow = e.altKey;

				let x = e.touches ? e.touches[0].pageX : e.pageX;
				let y = e.touches ? e.touches[0].pageY : e.pageY;

				if (this.cursorFollowMouse) this.moveCursor(x, y);

				if (this.startDraw) {
					if (this.cursorFollowMouse)
						this.draw(x, y);
					else
						this.draw(this.left + document.body.scrollLeft + document.documentElement.scrollLeft, this.top + document.body.scrollTop + document.documentElement.scrollTop);
				}
			}, 32),

			draw(ex, ey) {
				const item = this.items[this.items.length - 1];
				if (item) {
					let w = ex - item._x;
					let h = ey - item._y;

					if (w > 0) {
						item.w = w;
						item.x = item._x;
					} else {
						item.w = Math.abs(w);
						item.x = item._x + w;
					}

					if (h > 0) {
						item.h = h;
						item.y = item._y;
					} else {
						item.h = Math.abs(h);
						item.y = item._y + h;
					}
				}
			},

			actionStart(e) {
				if (this.showShadow && !this.cursorFollowMouse) {
					this.addItem(this.left + document.body.scrollLeft + document.documentElement.scrollLeft, this.top + document.body.scrollTop + document.documentElement.scrollTop);
				} else {
					let x = e.touches ? e.touches[0].pageX : e.pageX;
					let y = e.touches ? e.touches[0].pageY : e.pageY;
					this.addItem(x, y);
				}

				this.startDraw = true;
			},

			addItem(x, y) {
				this.items.push({
					w: 0,
					h: 0,
					_x: x,
					_y: y,
					x: x,
					y: y
				});
			},

			actionEnd() {
				this.drawDone();
			},

			drawDone() {
				this.startDraw = false;
				const item = this.items[this.items.length - 1];
				if (item && item.w === 0 && item.h === 0) this.items.pop();
			},

			remove(index) {
				this.items.splice(index, 1);
			},

			moveCursor(x, y) {
				x -= document.body.scrollLeft + document.documentElement.scrollLeft;
				y -= document.body.scrollTop + document.documentElement.scrollTop;

				this.left = x;
				this.top = y;
			},

			handleShadowCrosshair({left, top, width, height, pageX, pageY}) {
				if (!this.showShadow) return;

				let xPos = pageX - left < Math.abs(pageX - left - width) ?
					['left', pageX - left] :
					['right', Math.abs(pageX - left - width)],

					yPos = pageY - top < Math.abs(pageY - top - height) ?
						['top', pageY - top] :
						['bottom', Math.abs(pageY - top - height)];

				if (xPos[1] > this.snapToLine && yPos[1] > this.snapToLine) {
					this.cursorFollowMouse = true;
					return;
				}

				this.cursorFollowMouse = false;

				let x, y;
				if (xPos[1] < yPos[1]) {
					// 水平位置
					x= xPos[0] === 'left' ? left : left + width;
					y= pageY;

					if (yPos[1] < this.snapToAngle) {
						if (pageY - top < this.snapToAngle) y = top;
						else y = top + height;
					}
				} else {
					// 垂直位置
					x= pageX;
					y= yPos[0] === 'top' ? top : top + height;

					if (xPos[1] < this.snapToAngle) {
						if (pageX - left < this.snapToAngle) x = left;
						else x = left + width;
					}
				}

				this.moveCursor(x, y);
			},

			// addShadow() {
			// 	if (!this.showShadow) {
			// 		// this.showShadow = getShadowVm(function (el){
			// 		// 	return el.className.indexOf('vi_') !== 0
			// 		// }, this.showSize);
			// 		// this._shadow.$on('positionShadow', this.handleShadowCrosshair);
			//
			// 	}
			// },

			// removeShadow() {
			// 	if (this._shadow) {
			// 		this._shadow.$destroy();
			// 		this._shadow.$el.remove();
			// 		delete this._shadow;
			// 		delete document.body.dataset.vi_ruler_shadow;
			// 	}
			// },

			toggle(e) {
				if (e.target !== e.currentTarget) return;
				if (e.key === 'f' || e.which === 70) this.showToolbar = !this.showToolbar;
				this.showSize = !(e.key === 'Shift' || e.shiftKey);
			},

			toggleShowSize(e) {
				if (e.target !== e.currentTarget) return;
				this.showSize = true;
			},

			insertBodyCss() {
				this._style = document.createElement('style');
				this._style.innerHTML = `
					body[data-vi_ruler]{
						cursor: crosshair;
						-moz-user-select: none;
						-webkit-user-select: none;
						user-select: none;
					}
					body[data-vi_ruler]::after{
						content: '';
						position: fixed;
						left: 0;
						right: 0;
						top: 0;
						bottom: 0;
						background-color: rgba(0,0,0,.1);
						z-index: 99990;
					}
					body[data-vi_ruler][data-vi_ruler_shadow]::after{
						pointer-events: none;
					}
				`;
				(document.head||document.documentElement).appendChild(this._style);
			},

			removeBodyCss() {
				this._style.remove();
			},

			getStoredData() {
				chrome.storage.local.get(['bgColor', 'bgOpacity', 'snapToAngle', 'snapToLine'], ({bgColor, bgOpacity, snapToAngle, snapToLine}) => {
					if (bgColor) {
						this.bgColor = bgColor;
						this.bgOpacity = bgOpacity;
						this.snapToAngle = snapToAngle;
						this.snapToLine = snapToLine;
					}
				});
			},

			bindEvs() {
				document.addEventListener('touchstart', this.actionStart);
				document.addEventListener('touchmove', this.doAction);
				document.addEventListener('touchend', this.actionEnd);
				document.addEventListener('mousedown', this.actionStart);
				document.addEventListener('mousemove', this.doAction);
				document.addEventListener('mouseup', this.actionEnd);
				document.body.addEventListener('keydown', this.toggle);
				document.body.addEventListener('keyup', this.toggleShowSize);
			},

			removeEvs() {
				document.removeEventListener('touchstart', this.actionStart);
				document.removeEventListener('touchmove', this.doAction);
				document.removeEventListener('touchend', this.actionEnd);

				document.removeEventListener('mousedown', this.actionStart);
				document.removeEventListener('mousemove', this.doAction);
				document.removeEventListener('mouseup', this.actionEnd);

				document.body.removeEventListener('keydown', this.toggle);
				document.body.removeEventListener('keyup', this.toggleShowSize);
			}
		},
		created(){
			document.body.dataset.vi_ruler = 1;

			this.bindEvs();
			this.insertBodyCss();
			this.getStoredData();
		},
		beforeDestroy() {
			delete document.body.dataset.vi_ruler;

			this.removeEvs();
			this.removeBodyCss();
		},
		filters: {
			toFixed(n) {
				return +n.toFixed(1);
			}
		}
	}
</script>

