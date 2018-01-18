import _ from 'underscore';
import Mn from 'backbone.marionette';
import Bb from 'backbone';
import mixin from './helpers/mix.js';

import GetOptionProperty from './mixins/get-option-property.js';
import RadioMixin from './mixins/radioable.js';
import Startable from './mixins/startable.js';
import Childrenable from './mixins/childrenable.js';

let Base = mixin(Mn.Application).with(GetOptionProperty, RadioMixin, Childrenable, Startable);

export default Base.extend({

	initRadioOnInitialize: true,
	_initRegion(opts = {skip:true}){
		if(opts.skip) return;
		var region = this.getProperty('region');
		this.region = region;
		Base.prototype._initRegion();
	}, 

	getRegion() {
		if(!this._region) this._initRegion({skip:false});
		return this._region;
	},

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
		this.listenTo(pageManager, 'state:currentPage',(...args) => this.triggerMethod('page:swapped',...args));
		
	},

	hasPageManagers(){
		return this._pageManagers && this._pageManagers.length > 0;
	},

	getMenuTree(opts = {rebuild:false}){
		if(this._menuTree && !opts.rebuild) return this._menuTree;
		let managers = this._pageManagers || [];
		let links = _(managers).chain().map((manager) => manager.getLinks()).flatten().value();
		this._menuTree = new Bb.Collection(links);
		return this._menuTree;
	},

	getPage(key){
		if(!this.hasPageManagers()) return;
		return _(this._pageManagers).find((mngr) => mngr.getPage(key));
	},

});
