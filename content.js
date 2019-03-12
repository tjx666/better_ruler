import Vue from 'vue';
import Ruler from './Vue/Ruler';
import { getAppKey } from "./utils";

let rulerEl = window[getAppKey()];

if (rulerEl) {
	rulerEl.remove();
	rulerEl.vm.$destroy();

	delete rulerEl.vm;
	delete window[getAppKey()];
} else {
	let vm = new Vue({
		el: document.createElement('div'),
		render: h => h(Ruler)
	});

	let rulerEl = document.createElement('div');
	let ruler = rulerEl.attachShadow({mode: 'open'});
	rulerEl.vm = vm;
	ruler.appendChild(vm.$el);
	document.body.appendChild(rulerEl);
	window[getAppKey()] = rulerEl;

	let link = document.createElement('link');
	link.rel = "stylesheet";
	link.href = chrome.extension.getURL('css.css');
	ruler.appendChild(link)

}

