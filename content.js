import Vue from 'vue';
import Ruler from './Vue/Ruler';
import { getAppKey } from "./utils";

let app = window[getAppKey()];

if (app) {
	app.remove();
	app.vm.$destroy();

	delete app.vm;
	delete window[getAppKey()];
} else {
	let vm = new Vue({
		el: document.createElement('div'),
		render: h => h(Ruler)
	});

	let app = document.createElement('div');
	let shadow = app.attachShadow({mode: 'open'});
	app.vm = vm;
	shadow.appendChild(vm.$el);
	document.body.appendChild(app);
	window[getAppKey()] = app;

	let link = document.createElement('link');
	link.rel = "stylesheet";
	link.href = chrome.extension.getURL('css.css');
	shadow.appendChild(link)

}

