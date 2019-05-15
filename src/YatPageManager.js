import _ from 'underscore';
import App from './YatApp';
import GetNameLabel from './mixins/get-name-label';
import Router from './YatRouter';
import mixin from './helpers/mix';
import identity from './singletons/identity';
import YatError from './YatError';

let Base = mixin(App).with(GetNameLabel);

let YatPageManager = Base.extend({
	constructor(...args){
		Base.apply(this, args);
		this._initializeYatPageManager(...args);
	},
	throwChildErrors:true,
	createRouter(){
		let children = this.getChildren({startable:false});
		let hash = {};
		_(children).each(function(page){
			if(_.isFunction(page.getRouteHash)){
				_.extend(hash, page.getRouteHash());
			}
		});
		this._routesHash = hash;		
		this.setRouter(Router.create(hash, this));
	},
	setRouter(router){
		this.router = router;
	},
	getRouter(){
		return this.router;
	},
	getLinks(){
		let children = this.getChildren();
		if(!children) return;
		return _(children).chain()			
			.map((child) => child.getLinkModel())
			.filter((child) => !!child)
			.value();
	},
	execute(route){
		let page = this.getPage(route);
		if(!!page) 
			page.start({text: error.message});
		else if(route === '*NotFound')
			throw new YatError.NotFound('*NotFound handler is missing');
		else
			this.execute('*NotFound');
	},
	navigate(url, opts = {trigger:true}){

		let router = this.getRouter();
		if(router)
			router.navigate(url, opts);
		else
			console.warn('router not found');
	},

	getPage(key){

		let found = _(this._routesHash)
			.find((pageContext, route) => {
				if(route === key) return true;
				if(pageContext.context.getName() === key) return true;
			});
		return found && found.context;

	},


	navigateToRoot(){
		let current = this.getState('currentPage');
		let rootUrl = this.getProperty('rootUrl');
		if(!rootUrl){
			let children = this.getChildren();
			if(children && children.length) {
				let root = children.find((child) => child != current);
				rootUrl = root && root.getRoute()
			}
		}
		if(rootUrl != null)
			this.navigate(rootUrl);
		else
			console.warn('root page not found');
	},

	_initializeYatPageManager(opts = {}){
		this.mergeOptions(opts, ['id','name','label']);
		this._registerPageHandlers(opts);
		this._registerIdentityHandlers();
		this.createRouter();
	},

	_buildChildOptions: function(def){
		return _.extend(def, this.getProperty('childOptions'), {
			manager: this
		});
	},	

	_registerPageHandlers(){
		this.on('page:before:start', this._pageBeforeStart);
		this.on('page:start', this._pageStart);
		this.on('page:start:decline', this._pageDecline);
	},

	_pageBeforeStart(page){
		let current = this.getState('currentPage');
		if(current && current != page){
			current.stop();
		}
	},

	_pageStart(page){
		this.setState('currentPage', page);
	},

	_pageDecline(...args){
		//console.log("decline", args)
	},

	_registerIdentityHandlers(){
		this.listenTo(identity, 'change', (...args) => {
			this.triggerMethod('identity:change', ...args);
			this._moveToRootIfCurrentPageNotAllowed();
		});
	},
	
	_moveToRootIfCurrentPageNotAllowed(){
		let current = this.getState('currentPage');
		if(!current || !current.isStartNotAllowed()) return;
		
		this.navigateToRoot();
	}

});

export default YatPageManager;
