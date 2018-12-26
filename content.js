import Vue from 'vue';
import Ruler from './Vue/Ruler';
import { getNoConflics } from "./utils";

let vm = window[getNoConflics()];

if (vm) {
	vm.$destroy();
	delete window[getNoConflics()];
	vm.$el.remove();
} else {
	vm = new Vue({
		el: document.createElement('div'),
		render: h => h(Ruler)
	});
	document.documentElement.appendChild(vm.$el);
	window[getNoConflics()] = vm;
}

