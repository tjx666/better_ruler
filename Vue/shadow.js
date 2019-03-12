import Vue from "vue";
import Shadow from "./Shadow.vue";
import { getAppKey } from "../utils";

export default function getShadowVm(filter){
	let vm = new Vue({
		el: document.createElement('div'),
		render: h => h(Shadow, {
			props: { filter },
			on: {
				positionShadow(e) {
					vm.$emit('positionShadow', e);
				}
			}
		})
	});
	window[getAppKey()].shadowRoot.append(vm.$el);
	return vm;
}
