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

		this.triggerMethod('add:pageManager', pageManager);
		this.listenTo(pageManager, 'page:start', (...args) => this.triggerMethod('page:start', pageManager, ...args));
	
	},

	hasPageManagers(){
		return this._pageManagers && this._pageManagers.length > 0;
	},

	getLinksCollection(opts = {rebuild:false}){
		if(this._menuTree && !opts.rebuild) return this._menuTree;

		this.createLinksCollection();

		return this._menuTree;
	},
	createLinksCollection(){
		let managers = this._pageManagers || [];
		let links = _(managers).chain().map((manager) => manager.getLinks()).flatten().value();
		if(!this._menuTree)
			this._menuTree = new Bb.Collection(links);
		else
			this._menuTree.set(links);
	},
	getCurrentPages(){
		let pages = _(this._pageManagers).map((mngr) => mngr.getCurrentPage());
		return _(pages).filter((p) => p != null);
	},
	isCurrentPage(page){
		let current = this.getCurrentPages();
		return current.indexOf(page) > -1;
	},
	getPage(key){
		if(!this.hasPageManagers()) return;
		return _(this._pageManagers).find((mngr) => mngr.getPage(key));
	},

});
