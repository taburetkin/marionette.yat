import _ from 'underscore';
import App from './YatApp';
import GetNameLabel from './mixins/get-name-label';
import Router from './YatRouter';
import mixin from './helpers/mix';

let Base = mixin(App).with(GetNameLabel);

let YatPageManager = Base.extend({
	constructor(...args){
		Base.apply(this, args);
		this._initializeYatPageManager(...args);
	},
	// initRadioOnInitialize: false,
	// getChildOptions(){
	// 	let opts = Base.prototype.getChildOptions() || {};
	// 	opts.channel = this.getChannel();
	// 	opts.passToChildren = true;
	// 	return opts;
	// },
	createRouter(){
		let children = this.getChildren();
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

	getPage(key){

		let found = _(this._routesHash)
			.find((pageContext, route) => {
				if(route === key) return true;
				if(pageContext.context.getName() === key) return true;
			});
		return found && found.context;

	},

	_initializeYatPageManager(opts = {}){
		this.mergeOptions(opts, ['id','name','label']);
		this._registerPageHandlers(opts);
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
		this.on('page:decline', this._pageDecline);
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
		console.log("decline", args)
	},
});

export default YatPageManager;
