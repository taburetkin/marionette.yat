import _ from 'underscore';
import Mn from 'backbone.marionette';
export default Mn.AppRouter.extend({},{
	create(hash, context){
		let appRoutes = {};
		let controller = {};
		let _this = this;
		_(hash).each((handlerContext, key) => {
			appRoutes[key] = key;
			controller[key] = (...args) => {
				handlerContext
				.action(...args)
				.catch((error) => {
					_this._catchError(error, context);
				});
			}
		});
		return new this({controller, appRoutes});
	},
	_catchError(error, context){
		if(!context || context.getProperty('throwChildErrors') === true){
			throw error;
		}else{
			let postfix = error.status ? ":" + error.status.toString() : '';
			let commonEvent = 'error';
			let event = commonEvent + postfix;

			context.triggerMethod(commonEvent, error, this);

			if(event != commonEvent) 
				context.triggerMethod(event, error, this);

		}

	}
});
