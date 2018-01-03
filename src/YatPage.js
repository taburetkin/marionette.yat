import App from './YatApp.js';
import mixin from './helpers/mixin';
import Startable from './mixins/startable';

export default class extends mixin(App).with(Startable){
	constructor(...args){
		super(...args);
		this.initializeModule();
	}
	initializeModule(opts){
		this._registerStartableModuleHandlers();
		this._initializeModels(opts);
		this._initializeRoute(opts);
	}

	getLayout(){
		if(this._layoutView && this._layoutView.isDestroyed && !this._layoutView.isDestroyed())
			return this._layoutView;
	}
	buildLayout(){

		let Layout = this.getProperty('Layout');
		if(Layout == null) return;
		let opts = _.extend({},this.getProperty('layoutOptions'));

		if(this.model && !opts.model)
			_.extend(opts,{model: this.model});

		if(this.collection && !opts.collection)
			_.extend(opts,{collection: this.collection});
			
		let options = this.buildLayoutOptions(opts);

		this._layoutView = new Layout(options);
		return this._layoutView;

	}
	buildLayoutOptions(rawOptions){
		return rawOptions;
	}

	addModel(model){
		this.model = model;
	}
	addCollection(collection){
		this.collection = collection;
	}

	getRouteHash(){
		return this._routeHandler;
	}
	hasRouteHash(){
		return _.isObject(this.getRouteHash())
	}


	_registerStartableModuleHandlers(){
		this.on('start', this._onStartableModuleStart);
		this.on('stop', this._onStartableModuleStop);
	}
	_onStartableModuleStart(opts = {}){
		this._showLayout(opts = {});
	}
	_onStartableModuleStop(opts = {}){
		this._hideLayout(opts = {});
	}
	_showLayout(opts = {}){
		let layout = this.getLayout(opts);
		let view = this.getView();
		let region = this.getRegion();

		if(view && !view.isDestroyed() && view == layout)
			return;

		if(layout == null){
			layout == this.buildLayout(opts);
		}
		if(layout)
			this.showView(layout);
	}
	_hideLayout(opts = {}){
		let detach = this.getProperty('detachInsteadDestroy');
		if(detach)
			this.getRegion().detachView();
		else
			this.getRegion().reset();
	}

	_initializeModels(opts){
		this.mergeOptions(opts,['model','collection']);
	}

	_initializeRoute(){
		let route = this.getProperty('route');
		if(!route) return;
		this._routeHandler = {
			[route]:(...args) => this.start(...args)
		};
	}
}