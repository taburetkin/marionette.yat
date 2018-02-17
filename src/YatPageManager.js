import $ from 'jquery';
import Mn from 'backbone.marionette';
import _ from 'underscore';
import App from './YatApp';
import GetNameLabel from './mixins/get-name-label';
import mixin from './helpers/mix';
import identity from './singletons/identity';
import YatError from './YatError';



const PMRouterMixin = {

	routerClass: Mn.AppRouter,

	createRouter(opts = {}){		
		let options = this.getRouterOptions();
		let Router = this.getProperty('routerClass');
		let router = new Router(options);

		if(opts.doNotSet !== true)
			this.setRouter(router);

		return router;
	},

	_createRoutesHash(opts = {}){

		if(this._routesHash && opts.rebuild !== true) return this._routesHash;

		let children = this.getChildren({startable:false});
		let hash = {};
		_(children).each((page) => {
			if(_.isFunction(page.getRouteHash)){
				_.extend(hash, page.getRouteHash());
			}
		});
		this._routesHash = hash;
		return hash;

	},
	getRouterOptions(hash){
		this._routesHash = this._createRoutesHash();
		let appRoutes = {};
		let controller = {};
		_(hash).each((handlerContext, key) => {
			appRoutes[key] = key;
			controller[key] = this.createRouterControllerAction(handlerContext, key)
		});
		return { appRoutes, controller };
	},
	createRouterControllerAction(handlerContext, key){
		let page = handlerContext.context;
		return (...args) => {
			this.startPage(page, ...args);
		};
	},
	setRouter(router){
		if(this.router && _.isFunction(this.router.destroy)){
			this.router.destroy();
		}
		this.router = router;
	},
	getRouter(){
		return this.router;
	},
	
	execute(route, opts = {silent:true}){
		let page = this.getPage(route);
		if(page)
			page.start(opts);
		else
			throw new YatError.NotFound('Route not found'); 
	},
	navigate(url, opts = {trigger:true}){

		let router = this.getRouter();

		if(router)
			router.navigate(url, opts);
		else
			console.warn('router not found');

	},

	navigateToRoot(){

		let current = this.getState('currentPage');
		if(!current) throw new YatError({message:"navigateToRoot: root not found"});
		this.navigate(current.getRoot().url());

	},	

};

const PMIdentitySupport = {

	_registerIdentityHandlers(){
		this.listenTo(identity, 'change', this._restartOrGoToRoot);
		this.listenTo(identity, 'token:expired', this.tokenExpired);
	},

	_restartOrGoToRoot(){
		if(!this.routedPage) return;

		if(!this.routedPage.getProperty('preventStart'))
			this.restartRoutedPage();
		else
			this.navigateToRoot();
	},

	tokenExpired(){
		this.restartRoutedPage();
	},

}



let Base = mixin(App).with(GetNameLabel, PMRouterMixin, PMIdentitySupport);

let YatPageManager = Base.extend({
	constructor(...args){
		Base.apply(this, args);
		this._initializeYatPageManager(...args);
	},
	_initializeYatPageManager(opts = {}){
		this.mergeOptions(opts, ['id','name','label']);
		this._registerPageHandlers(opts);
		this._registerIdentityHandlers();
		this.createRouter();
	},

	throwChildErrors:true,


	startPage(page, ...args){
		this.previousRoutedPage = this.routedPage;
		this.routedPage = page;
		return page.start(...args).catch((error) => {
			if(this.getProperty('throwChildErrors') === true){				
				throw error;
			}
			let postfix = error.status ? ':' + error.status.toString() : '';
			let commonEvent = 'error';
			let event = commonEvent + postfix;
			this.triggerMethod(commonEvent, error, page);
			event != commonEvent && this.triggerMethod(event, error, page);
		});
	},
	restartRoutedPage(){
		this.routedPage && this.startPage(this.routedPage);
	},	
	getLinks(){
		let children = this.getChildren();
		if(!children) return [];
		return _(children).chain()			
			.map((child) => child.getLinks())
			.filter((child) => !!child)
			.flatten()
			.value();
	},
	getPage(key){

		let found = _(this._routesHash)
			.find((pageContext, route) => {
				if(route === key) return true;
				if(pageContext.context.getName() === key) return true;
			});
		return found && found.context;

	},
	getCurrentPage(){
		return this.getState('currentPage');
	},
	isCurrentPage(page){
		let current = this.getCurrentPage();
		return page === current;
	},



	//childrenable: settle manager reference to all children
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

	_pageStart(page, ...args){
		this.setState('currentPage', page);
	},
	_pageDecline(...args){ },



	


});

export default YatPageManager;
