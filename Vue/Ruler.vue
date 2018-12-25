<style lang="less">
	@bgGray : #333;

	.vi_ruler_cursor{
		cursor: crosshair;
		user-select: none;
		&::after{
			content: '';
			position: fixed;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			background-color: rgba(0,0,0,.1);
			z-index: 99990;
			pointer-events: none;
		}
	}
	.vi_ruler{
		.vi_rulerItem{
			position: absolute;
			/*background-color: rgba(50, 122, 228, 0.3);*/
			z-index: 99995;

			.vi_txt{
				white-space: nowrap;
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				font-size: 14px;
				background-color: rgba(237,237,237,1);
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
		}

		.vi_rulerCrossX{
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			height: 1px;
			/*background-color: red;*/
			pointer-events: none;
			z-index: 99996;
		}
		.vi_rulerCrossY{
			position: fixed;
			left: 0;
			top: 0;
			bottom: 0;
			width: 1px;
			/*background-color: red;*/
			pointer-events: none;
			z-index: 99996;
		}

		.vi_toolbar{
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: @bgGray;
			/*height: 50px;*/
			z-index: 99999;
			color: white;
			padding: 10px;

			.vi_tit{
				/*flex-basis: ;*/
				font-weight: bold;
			}

			.vi_color{
				vertical-align: middle;
				border: none;
				appearance: textfield !important;
				outline: none;
				width: 50px;
				height: 30px;
				margin: 0;
				padding: 0;
				/*background-color: red;*/
			}

			.vi_text{
				width: 52px;
				height: 20px;
				padding: 0 2px;

				color: #fff!important;
				background: #474747!important;
				border: 1px solid #2c2b2b!important;
			}

			.vi_tbItem{
				display: inline-block;
				white-space: nowrap;
				padding: 0 5px;
				vertical-align: middle;

				*{
					vertical-align: middle;
				}
			}

			::-webkit-color-swatch-wrapper {
				border: 1px solid @bgGray;
				background-color: @bgGray;
			}
			::-webkit-color-swatch {
				/*position: relative;*/
			}
		}
	}
</style>

<template>
	<div class="vi_ruler">
		<div class="vi_rulerItem"
			 @click.stop
			 v-for="(item, index) in items"
			 :style="{width: item.w + 'px', height: item.h + 'px', left: item.x + 'px', top: item.y + 'px', backgroundColor: bgc}">
			<span class="vi_close" @touchstart.stop="remove(index)" @mousedown.stop="remove(index)">X</span>
			<span class="vi_txt">{{ item.w | toFixed }}px {{ item.h | toFixed }}px</span>
		</div>

		<span class="vi_rulerCrossX" :style="{transform: 'translateY(' + (top - 0.5) + 'px) scale(1, .3)', backgroundColor: bglColor}"></span>
		<span class="vi_rulerCrossY" :style="{transform: 'translateX(' + (left - 0.5) + 'px) scale(.3, 1)', backgroundColor: bglColor}"></span>

		<div class="vi_toolbar">
			<div class="vi_tbItem">
				<span class="vi_tit">背景：</span> <input type="color" class="vi_color" v-model="bgColor" />
			</div>
			<div class="vi_tbItem">
				<span class="vi_tit">辅助线：</span> <input type="color" class="vi_color" v-model="bglColor" />
			</div>
			<div class="vi_tbItem">
				<span>吸附阙值：</span>
				<div class="vi_tbItem">
					<span class="vi_tit">边界</span> <input type="number" min="10" max="200" class="vi_text" v-model.number="snapToLine" />
				</div>
				<div class="vi_tbItem">
					<span class="vi_tit">顶点</span> <input type="number" min="5" max="50" class="vi_text" v-model.number="snapToAngle" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { throttle, hex2rgba } from "../utils";
	import getShadowVm from "./shadow";

	export default {
		name: "Ruler",

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
				bglColor: '#1171cd',
				opacity: .3,
				snapToAngle: 15,
				snapToLine: 100
			}
		},

		computed: {
			bgc() {
				return hex2rgba(this.bgColor, this.opacity);
			},
			bglc() {
				return hex2rgba(this.bglColor, 1);
			}
		},

		watch: {
			showShadow(val, oldValue) {
				if (val === oldValue) return;
				val ? this.addShadow() : this.removeShadow();
			}
		},

		methods: {
			doAction: throttle(function (e){
				if (e.altKey) this.showShadow = true;
				else this.showShadow = false;

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

			addShadow() {
				if (!this._shadow) {
					this._shadow = getShadowVm([function (el){
						return el.className.indexOf('vi_') !== 0
					}]);
					this._shadow.$on('positionShadow', this.handleShadowCrosshair);
				}
			},

			removeShadow() {
				if (this._shadow) {
					this.cursorFollowMouse = true;
					this._shadow.$destroy();
					this._shadow.$el.remove();
					delete this._shadow;
				}
			}
		},
		created(){
			document.body.addEventListener('touchstart', this.actionStart)
			document.body.addEventListener('touchmove', this.doAction)
			document.body.addEventListener('touchend', this.actionEnd)

			document.body.addEventListener('mousedown', this.actionStart)
			document.body.addEventListener('mousemove', this.doAction)
			document.body.addEventListener('mouseup', this.actionEnd)

			document.body.classList.add('vi_ruler_cursor');
		},
		beforeDestroy() {
			document.body.removeEventListener('touchstart', this.actionStart)
			document.body.removeEventListener('touchmove', this.doAction)
			document.body.removeEventListener('touchend', this.actionEnd)

			document.body.removeEventListener('mousedown', this.actionStart)
			document.body.removeEventListener('mousemove', this.doAction)
			document.body.removeEventListener('mouseup', this.actionEnd)

			document.body.classList.remove('vi_ruler_cursor');
		},
		filters: {
			toFixed(n) {
				return +n.toFixed(2);
			}
		}
	}
</script>

