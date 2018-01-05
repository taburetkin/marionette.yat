import Mn from 'backbone.marionette';
import mixin from './helpers/mixin.js';

import GetOptionProperty from './mixins/get-option-property.js';
import RadioMixin from './mixins/radioable.js';
import Startable from './mixins/startable.js';
import Childrenable from './mixins/childrenable.js';
import {Collection} from 'backbone';

export default class extends mixin(Mn.Application).with(GetOptionProperty, RadioMixin, Childrenable, Startable){
	constructor(...args){
		super(...args);
	}
	get initRadioOnInitialize() { return true; }
	_initRegion(opts = {skip:true}){
		if(opts.skip) return;
		var region = this.getProperty('region');
		this.region = region;
		super._initRegion();
	}
	getRegion() {
		if(!this._region) this._initRegion({skip:false});
		return this._region;
	}
	addPageManager(pageManager){
		this._pageManagers || (this._pageManagers = []);
		this._pageManagers.push(pageManager);

		let prefix = pageManager.getName();
		if(!prefix){
			console.warn('pageManager prefix not defined');
			return;
		}

		this.listenTo(pageManager, 'all', (eventName, ...args) => {
			let prefixedEventName = prefix + ':' + eventName;
			this.triggerMethod(prefixedEventName, ...args);
		});

	}
	hasPageManagers(){
		return this._pageManagers && this._pageManagers.length > 0;
	}
	getMenuTree(opts = {rebuild:false}){
		if(this._menuTree && !opts.rebuild) return this._menuTree;
		let managers = this._pageManagers || [];
		let links = _(managers).chain().map((manager) => manager.getLinks()).flatten().value();
		this._menuTree = new Collection(links);
		return this._menuTree;
	}
}