import _ from 'underscore';
import Mn from 'backbone.marionette';
import mix from '../helpers/mix';
import GetOptionProperty from '../mixins/get-option-property';
import fns from '../functions/common/common';
const BaseBehavior = mix(Mn.Behavior).with(GetOptionProperty);
export default BaseBehavior.extend({
	constructor(){

		//this._viewInitialized = false;
		// this.on('initialize',() => {
		// 	if(!this._viewInitialized){
		// 		this._viewInitialized = true;
		// 		this.triggerMethod('view:initialize');
		// 	}
		// });		
		this.on('before:render initialize', _.once(_.partial(this.triggerMethod, 'view:initialize')));
		BaseBehavior.apply(this, arguments);
		// this.listenTo(this.view, 'before:render',() => {
		// 	if(!this._viewInitialized){
		// 		this._viewInitialized = true;
		// 		this.triggerMethod('view:initialize');
		// 	}
		// });
	},
	// getProperty(...args){
	// 	return this.getOption(...args);
	// },
	getModel: function () {
		return this.view.model;
	},	
	cidle(name){
		return fns.cid.call(this.view, name);
	},
	unCidle(name){
		return fns.uncid.call(this.view, name);
	},
});
