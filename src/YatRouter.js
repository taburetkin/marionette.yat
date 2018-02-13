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
				.then(() => { 
					conext.routedPage = handlerContext.context;
				})
				.catch((error) => {
					conext.routedPage = handlerContext.context;
					_this._catchError(error, context, handlerContext.context);
				});
			}
		});
		return new this({controller, appRoutes});
	},
	_catchError(error, context, page){
		if(!context || context.getProperty('throwChildErrors') === true){
			throw error;
		}else{
			let postfix = error.status ? ":" + error.status.toString() : '';
			let commonEvent = 'error';
			let event = commonEvent + postfix;


			context.triggerMethod(commonEvent, error, page);

			if(event != commonEvent) 
				context.triggerMethod(event, error, page);

		}

	}
});
