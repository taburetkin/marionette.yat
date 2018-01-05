import App from './YatApp.js';
import mixin from './helpers/mixin';
import Startable from './mixins/startable';
import GetNameLabel from './mixins/get-name-label';
import Router from './YatRouter.js';
import Radio from 'backbone.radio';
import LinkModel from './models/link';
import {Collection} from 'backbone';

export default class extends mixin(App).with(GetNameLabel) {
	constructor(...args){
		super(...args);
		this.allowStopWithoutStart = true;
		this.allowStartWithoutStop = true;
		this.initializeYatPage();
	}	
	initializeYatPage(opts){
		this._initializeModels(opts);
		this._initializeRoute(opts);
		this._tryCreateRouter();
		this._tryProxyToRadio();
	}

	getLayout(opts = {rebuild: false}){
		if(!this._layoutView || opts.rebuild || (this._layoutView && this._layoutView.isDestroyed && this._layoutView.isDestroyed())){
			this.buildLayout();
		}
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
		options.page = this;
		this._layoutView = new Layout(options);
		return this._layoutView;
	}
	buildLayoutOptions(rawOptions){
		return rawOptions;
	}

	addModel(model, opts = {}){				
		if(!model) return;
		this.model = model;
		let fetch = opts.fetch || this.getOption('fetchModelOnAdd');
		if(fetch === undefined){
			fetch = this.getProperty('fetchDataOnAdd');
		}
		if(fetch === true){
			this.addStartPromise(model.fetch(opts));
		}
	}

	addCollection(collection, opts = {}){
		if(!collection) return;
		this.collection = collection;
		let fetch = opts.fetch || this.getOption('fetchCollectionOnAdd');
		if(fetch === undefined){
			fetch = this.getProperty('fetchDataOnAdd');
		}
		if(fetch === true){
			this.addStartPromise(collection.fetch(opts));
		}
	}

	getRouteHash(){

		let hashes = [{},this._routeHandler].concat(this.getChildren().map((children) => children.getRouteHash()))
		return _.extend(...hashes);

	}
	hasRouteHash(){
		return _.isObject(this.getRouteHash())
	}

	getLinkModel(level = 0){
		if(this._linkModel) return this._linkModel;
		let url = this.getRoute();
		let label = this.getLabel();
		let children = this._getSublinks(level);
		this._linkModel = new LinkModel({ url, label, level, children });
		return this._linkModel;
	}

	getParentLinkModel(){
		let parent = this.getParent();
		if(!parent || !parent.getLinkModel) return;
		let model = parent.getLinkModel();
		return model;
	}

	getNeighbourLinks(){
		let link = this.getLinkModel();
		if(link.collection) return link.collection;
	}
	_getSublinks(level){
		let children = this.getChildren();
		if(!children || !children.length) return;
		let sublinks = _(children).map((child) => child.getLinkModel(level + 1));
		if(!sublinks.length) return;
		let col = new Collection(sublinks);
		return col;
	}

	_initializeModels(opts = {}){
		this.addModel(opts.model, opts);
		this.addCollection(opts.collection, opts);
	}

	_initializeRoute(){
		let route = this.getRoute();
		if(route == null) return;
		this._routeHandler = {
			[route]:{context:this, action: (...args) => this.start(...args) }
		};
	}
	getRoute(){
		let relative = this.getProperty('relativeRoute');
		let route = this.getProperty('route');
		let parent = this.getParent();
		if(route == null) return;
		if(!relative || !parent || !parent.getRoute) return route;
		let parentRoute = parent.getRoute();
		if(parentRoute == null) return route;
		let result = parentRoute + '/' + route;
		if(result.startsWith('/'))
			result = result.substring(1);
		return result;
	}

	_tryCreateRouter(){
		let create = this.getProperty('createRouter') === true;
		if(create){
			this.router = this._createAppRouter();
		}
	}
	_createAppRouter(){
		let hash = this.getRouteHash();
		if(!_.size(hash)) return;
		return new Router(hash);
	}
	_tryProxyToRadio(){
		
		let channel = this.getChannel();
		if(!channel) return;

		this.on('all', this._proxyEventToRadio)

	}
	_proxyEventToRadio(eventName, ...args){
		let allowed = this.getProperty('proxyEventsToRadio');
		if(!allowed || !allowed.length || allowed.indexOf(eventName))
			this.radioTrigger(`page:${eventName}`, ...[this].concat(args));		
	}
}