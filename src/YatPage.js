import _ from 'underscore';
import App from './YatApp.js';
import mixin from './helpers/mix';
import Startable from './mixins/startable';
import GetNameLabel from './mixins/get-name-label';
import LinkModel from './models/link';
import Bb from 'backbone';
import identity from './singletons/identity';

/* 
	YatPage
*/

let Base = mixin(App).with(GetNameLabel);

export default Base.extend({

	constructor(...args){
		Base.apply(this,args);
		this.initializeYatPage();
	},

	allowStopWithoutStart: true,
	allowStartWithoutStop: true,

	initializeYatPage(opts){
		this.mergeOptions(opts, ["manager"]);
		this._initializeLayoutModels(opts);
		this._initializeRoute(opts);
		//this._proxyEvents();
		this._registerIdentityHandlers();		
	},

	getLayout(opts = {rebuild: false}){
		if(!this._layoutView || opts.rebuild || (this._layoutView && this._layoutView.isDestroyed && this._layoutView.isDestroyed())){
			this.buildLayout();
		}
		return this._layoutView;
	},
	prepareForStart(){},

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
	},
	buildLayoutOptions(rawOptions){
		return rawOptions;
	},

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
	},
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
	},

	freezeWhileStarting: true,
	freezeUI(){ },
	unFreezeUI(){ },









	getRouteHash(){

		let hashes = [{},this._routeHandler].concat(this.getChildren({startable:false}).map((children) => children.getRouteHash()))
		return _.extend(...hashes);

	},

	hasRouteHash(){
		return _.isObject(this.getRouteHash())
	},

	_initializeRoute(){
		let route = this.getRoute({asPattern:true});
		if(route == null) return;
		let page = this;
		this._routeHandler = {
			[route]:{
				context: page, 
				action: (...args) => page.start(...args) 
			}
		};
	},

	getRoute(opts = {asPattern:false}){
		let relative = this.getProperty('relativeRoute');
		let route = this.getProperty('route');
		let parent = this.getParent();
		if(route == null) return;
		
		let result = route;

		if(relative && parent && parent.getRoute){
			let parentRoute = parent.getRoute();
			result = parentRoute + '/' + route;			
		}

		return this._normalizeRoute(result, opts);
	},
	_normalizeRoute(route, opts){		
		route = route.replace(/\/+/gmi,'/').replace(/^\//,'');
		if(opts.asPattern){
			return route;
		}
		else{
			let res = route.replace(/\(\/\)/gmi,'/').replace(/\/+/gmi,'/');
			return res;
		}
	},










	getLinkModel(level = 0){
		if(!this._canHaveLinkModel()) return;		
		if(this._linkModel) return this._linkModel;

		let url = this.getRoute();
		let label = this.getLabel();
		let children = this._getSublinks(level);
		this._linkModel = new LinkModel({ url, label, level, children });

		return this._linkModel;
	},
	_canHaveLinkModel(){
		return !((this.getProperty('skipMenu') === true) || (!!this.getProperty('isStartNotAllowed')));
	},
	_destroyLinkModel(){
		if(!this._linkModel) return;
		this._linkModel.destroy();
		delete this._linkModel;
	},

	getParentLinkModel(){
		let parent = this.getParent();
		if(!parent || !parent.getLinkModel) return;
		let model = parent.getLinkModel();
		return model;
	},

	getNeighbourLinks(){
		let link = this.getLinkModel();
		if(link && link.collection) return link.collection;
	},

	getChildrenLinks(){
		let model = this.getLinkModel();
		if(!model) return;
		return model.get('children');
	},

	_getSublinks(level){
		let children = this.getChildren();
		if(!children || !children.length) return;
		let sublinks = _(children).chain()
			.filter((child) => child.getProperty("skipMenu") !== true)
			.map((child) => child.getLinkModel(level + 1))
			.value();
		if(!sublinks.length) return;
		let col = new Bb.Collection(sublinks);
		return col;
	},

	_initializeLayoutModels(opts = {}){
		this.addModel(opts.model, opts);
		this.addCollection(opts.collection, opts);
	},

	_proxyEvents(){
		let proxyContexts = this._getProxyContexts();
		this._proxyEventsTo(proxyContexts);
	},
	_getProxyContexts(){
		let rdy = [];
		let manager = this.getProperty('manager');
		if(manager){
			rdy.push({context:manager})
		}
		let radio = this.getChannel();
		if(radio){
			let allowed = this.getProperty('proxyEventsToRadio');
			rdy.push({context:radio, allowed });
		}
		return rdy;
	},
	_proxyEventsTo(contexts){
		let all = [];
		let eventsHash = {};

		_(contexts).each((context) => {
			let events = [];
			if(!context.allowed)
				all.push(context.context);
			else {
				_(context.allowed).each(function(allowed){
					eventsHash[allowed] || (eventsHash[allowed] = []);
					eventsHash[allowed].push(context.context)
				});
			}
		});
		let page = this;
		page.on('all', (eventName, ...args) => {
			let contexts = (eventName in eventsHash) ? eventsHash[eventName] : all;
			let triggerArguments = [page].concat(args);
			_(contexts).each((context) => context.triggerMethod(`page:${eventName}`, ...triggerArguments))
		});

	},

	_buildChildOptions: function(def){
		let add = {};
		let manager = this.getProperty('manager');
		if(manager) add.manager = manager;
		return _.extend(def, this.getProperty('childOptions'), add);
	},	

	_registerIdentityHandlers(){
		this.listenTo(identity, 'change', (...args) => {
			this._destroyLinkModel();
			//this.triggerMethod('identity:change', ...args);
		});
	}

});
