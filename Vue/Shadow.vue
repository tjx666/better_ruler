<style scoped lang="less">
	.vi_shadow{
		position:absolute;
		/*background-color: rgba(0,0,0,.2);*/
		background-color: rgba(255, 170, 50, .5);
		z-index: 99991;

		.vi_txt{
			white-space: nowrap;
			position:absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			background-color: antiquewhite;
			padding: 3px 5px;
			border-radius: 3px;
		}
	}
</style>

<template>
	<div class="vi_shadow"
		 :style="{width: rect.w + 'px', height: rect.h + 'px', left: rect.x + 'px', top: rect.y + 'px'}">
		<span class="vi_txt">{{ rect.w | toFixed }}px {{ rect.h | toFixed }}px</span>
	</div>
</template>

<script>
	import { throttle } from "../utils";

	export default {
		name: "Shadow",
		props: ['filters'],
		data() {
			return {
				rect: {
					w: 0,
					h: 0,
					x: 0,
					y: 0
				}
			}
		},
		methods: {
			positionShadow(e) {
				let {target, clientX, clientY, pageX, pageY} = e,
					elements = document.elementsFromPoint(clientX, clientY);

				elements.some(el => {
					if (el !== this.$el
						&& this.filters.every(filter => filter(el))) {
						target = el;
						return true;
					}
				});

				if (!target) return;

				let {left, top, width, height} = target.getBoundingClientRect();
				top += document.documentElement.scrollTop + document.body.scrollTop;

				this.rect = {
					w: width,
					h: height,
					x: left,
					y: top
				};

				this.$emit('positionShadow', {left, top, width, height, pageX, pageY})
			},
		},
		created (){
			this._positionShadow = throttle(this.positionShadow, 100);
			document.addEventListener('mousemove', this._positionShadow);
		},
		beforeDestroy() {
			document.removeEventListener('mousemove', this._positionShadow);
		},
		filters: {
			toFixed(n) {
				return +n.toFixed(2);
			}
		}
	}
</script>
