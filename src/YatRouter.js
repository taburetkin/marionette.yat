import _ from 'underscore';
import {AppRouter} from 'backbone.marionette';
export default AppRouter.extend({},{
	create(hash, context){
		let appRoutes = {};
		let controller = {};
		_(hash).each((handlerContext, key) => {
			appRoutes[key] = key;
			controller[key] = (...args) => {
				handlerContext
				.action(...args)
				.catch((error) => {
					let commonEvent = 'error';
					let event = commonEvent + (error.status && ":" + error.status);
					if(event != commonEvent) context.triggerMethod(event, error, this);

					context.triggerMethod(commonEvent, error, this);					
				});
			}
		});
		return new this({controller, appRoutes});
	}
});
