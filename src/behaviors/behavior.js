import _ from 'underscore';
import Mn from 'backbone.marionette';
import mix from '../helpers/mix';
import GetOptionProperty from '../mixins/get-option-property';
import fns from '../functions/common/common';
const BaseBehavior = mix(Mn.Behavior).with(GetOptionProperty);
export default BaseBehavior.extend({
	constructor(){
		this.on('before:render initialize', _.once(_.partial(this.triggerMethod, 'view:initialize')));
		BaseBehavior.apply(this, arguments);
	},
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
