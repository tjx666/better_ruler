import Vue from 'vue';
import Ruler from './Vue/Ruler';
import { getNoConflics } from "./utils";
// import Tip from "./Vue/Tip.plugin";
// Vue.use(Tip);

let vm = document.documentElement[getNoConflics()];

if (vm) {
	vm.$destroy();
	delete document.documentElement[getNoConflics()];
	vm.$el.remove();
} else {
	vm = new Vue({
		el: document.createElement('div'),
		render: h => h(Ruler)
	});
	document.body.appendChild(vm.$el);
	document.documentElement[getNoConflics()] = vm;
}

