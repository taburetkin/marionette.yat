import _ from 'underscore';
import Mn from 'backbone.marionette';
import mix from '../helpers/mix';
import GetOptionProperty from '../mixins/get-option-property';
import fns from '../functions/common/common';
const BaseBehavior = mix(Mn.Behavior).with(GetOptionProperty);
export default BaseBehavior.extend({

	listenViewInitialize: true,

	constructor(){

		if(this.getProperty('listenViewInitialize') === true)
			this.on('before:render initialize', _.once(_.partial(this.triggerMethod, 'view:initialize')));

		BaseBehavior.apply(this, arguments);
	},

	getModel: function () {
		return this.view.model;
	},	
	cidle(name){
		return fns.wrap(this.view.cid, name);
	},
	unCidle(name){
		return fns.unwrap(name, this.view.cid); 
	},
});
