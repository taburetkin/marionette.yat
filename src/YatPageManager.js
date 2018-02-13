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
	_initializeYatPageManager(opts = {}){
		this.mergeOptions(opts, ['id','name','label']);
		this._registerPageHandlers(opts);
		this._registerIdentityHandlers();
		this.createRouter();
	},

	throwChildErrors:true,
	createRouter(){
		this._routesHash = this._prepareRouterHash();
		let options = this._prepareRouterOptions(this._routesHash);
		let router = new Mn.AppRouter(options);
		this.setRouter(router);
	},
	_prepareRouterHash(){
		let children = this.getChildren({startable:false});
		let hash = {};
		_(children).each((page) => {
			if(_.isFunction(page.getRouteHash)){
				_.extend(hash, page.getRouteHash());
			}
		});
		return hash;
	},
	_prepareRouterOptions(hash){
		let appRoutes = {};
		let controller = {};
		let _this = this;
		_(hash).each((handlerContext, key) => {
			appRoutes[key] = key;
			controller[key] = (...args) => {
				delete _this.failedPage;
				_this.routedPage = handlerContext.context;
				handlerContext
					.action(...args)
					.catch((error) => {
						if(_this.getProperty('throwChildErrors') === true){
							throw error;
						}
						let postfix = error.status ? ":" + error.status.toString() : '';
						let commonEvent = 'error';
						let event = commonEvent + postfix;
						_this.failedPage = handlerContext.context
						_this.triggerMethod(commonEvent, error, handlerContext.context);
						event != commonEvent && _this.triggerMethod(event, error, handlerContext.context);
					});
			}
		});
		return { appRoutes, controller };
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
			if(!this._moveToRootIfCurrentPageNotAllowed())
				this.restartRoutedPage();
		});
	},
	
	_moveToRootIfCurrentPageNotAllowed(){
		let current = this.routedPage; // && routedPage.restart();
		//let current = this.getCurrentPage();
		
		if(!current || !current.isStartNotAllowed()) return;
		
		this.navigateToRoot();

		return true;
	},
	restartRoutedPage(){
		this.routedPage && routedPage.restart();
	}

});

export default YatPageManager;
