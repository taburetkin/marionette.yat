import Mn from 'backbone.marionette';
import mixin from './helpers/mixin.js';

import GetOptionProperty from './mixins/get-option-property.js';
import Startable from './mixins/startable.js';
import Childrenable from './mixins/childrenable.js';

export default class extends mixin(Mn.Application).with(GetOptionProperty, Childrenable, Startable){
	constructor(...args){
		super(...args);
	}

	_initRegion(){}

	__initRegion(){
		var region = this.getProperty('region');
		this.region = region;
		super._initRegion();
	}



	getRegion() {
		if(!this._region)
			this.__initRegion();
		return this._region;
	}
}