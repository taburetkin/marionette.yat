import _ from 'underscore';
import {AppRouter} from 'backbone.marionette';
export default class extends AppRouter {
	constructor(hash){
		super();
		let routes = {};
		let controller = {};

		_(hash).each((handlerContext, key) => {
			routes[key] = key;
			controller[key] = handlerContext.action;
		});
		this.processAppRoutes(controller, routes);
	}
	// onRoute(...args){
	// 	console.log(...args);
	// }
}