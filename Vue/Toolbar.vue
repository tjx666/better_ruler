<style lang="less">
	@bgGray: #333;
	.vi_toolbar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: @bgGray;
		z-index: 99999;
		color: white;
		padding: 5px 10px;
		cursor: auto;
		/*color: #666666;*/
		/*background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(246,246,246,1) 47%, rgba(237,237,237,1) 100%);*/

		.vi_close{
			position: absolute;
			right: 10px;
			font-size: 14px;
			top: 0;
			bottom: 0;
			line-height: 38px;
			width: 20px;
			text-align: center;
			cursor: pointer;
		}

		.vi_tit {
			font-weight: bold;
		}

		.vi_color {
			vertical-align: middle;
			border: none;
			appearance: textfield !important;
			outline: none;
			width: 50px;
			height: 28px;
			margin: 0;
			padding: 0;
		}

		.vi_text {
			width: 32px;
			height: 18px;
			padding: 0 2px;
			padding-right: 15px;
			text-align: right;

			color: #fff !important;
			background: #474747 !important;
			border: 1px solid #666 !important;
			appearance: textfield !important;

			&::-webkit-outer-spin-button,
			&::-webkit-inner-spin-button {
				/*-webkit-appearance: auto !important;*/
				/*transform: translateX(15px);*/
				display: none;
			}
		}

		.vi_tbItem {
			display: inline-block;
			white-space: nowrap;
			padding: 0 5px;

			* {
				vertical-align: middle;
			}
		}
		.vi_snap .vi_tbItem{
			position: relative;

			&::after{
				content: 'px';
				color: gray;
				position: absolute;
				right: 7px;
				top: 0;
				bottom: 0;
				line-height: 20px;
			}
		}

		::-webkit-color-swatch-wrapper {
			border: 1px solid @bgGray;
			background-color: @bgGray;
		}
		::-webkit-color-swatch {
			/*position: relative;*/
		}

		&.vi_toolbar_ff{
			.vi_color {
				height: 20px;
			}
		}
	}
</style>

<template>
	<div class="vi_toolbar" :class="{vi_toolbar_ff: isFF}" @mousemove.stop @touchmove.stop>
		<div class="vi_tbItem">
			<span class="vi_tit">颜色：</span>
			<input type="color" class="vi_color" v-model="$parent.bgColor"/>
		</div>
		<div class="vi_tbItem vi_snap">
			<!--<span>吸附设置 </span>-->

			<div class="vi_tbItem">
				<span class="vi_tit">边界吸附：</span>
				<input type="number" min="0" max="200" class="vi_text" v-validate v-model="$parent.snapToLine"/>
			</div>

			<div class="vi_tbItem">
				<span class="vi_tit">顶点吸附：</span>
				<input type="number" min="0" max="100" class="vi_text" v-validate v-model="$parent.snapToAngle"/>
			</div>
		</div>
		<span class="vi_close" @click="$parent.showToolbar = false">X</span>
	</div>
</template>

<script>
	import {isFF} from "../utils";

	export default {
		name: "Toolbar",

		data() {
			return {
				isFF
				// bgColor: '#1171cd',
				// angleValue: this.snapToAngle,
				// lineValue: this.snapToLine
			}
		},

		// props: {
		// 	snapToAngle: {
		// 		type: Number,
		// 		default() {
		// 			return 15
		// 		}
		// 	},
		//
		// 	snapToLine: {
		// 		type: Number,
		// 		default() {
		// 			return 50
		// 		}
		// 	}
		// },

		// watch: {
		// 	angleValue(val) {
		// 		this.$emit('update:snapToAngle', +val || 0);
		// 	},
		// 	lineValue(val) {
		// 		this.$emit('update:snapToLine', +val || 0);
		// 	}
		// },

		directives: {
			validate: {
				bind(el) {
					el._validate = function (){
						el.value = +el.value || 0;

						if (el.value > +el.max || el.value < +el.min) {
							if (el.value > +el.max) {
								el.value = el.max
							} else if (el.value < +el.min) {
								el.value = el.min
							}

							let event = document.createEvent('HTMLEvents');
							event.initEvent("input", true, true); // 3个参数：事件类型，是否冒泡，是否阻止浏览器的默认行为
							el.dispatchEvent(event);
						}
					};

					el.addEventListener('change', el._validate);
				},
				unbind(el) {
					el.removeEventListener('change', el._validate);
					delete el._validate;
				}
			}
		}
	}
</script>

