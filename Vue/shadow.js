import Vue from "vue";
import Shadow from "./Shadow.vue";

export default function getShadowVm(filters = []){
	let vm = new Vue({
		el: document.createElement('div'),
		render: h => h(Shadow, {
			props: { filters },
			on: {
				positionShadow(e) {
					vm.$emit('positionShadow', e);
				}
			}
		})
	});
	document.body.appendChild(vm.$el);
	return vm;
}
