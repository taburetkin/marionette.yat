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
	initRadioOnInitialize: false,
	getChildOptions(){
		let opts = Base.prototype.getChildOptions() || {};
		opts.channel = this.getChannel();
		opts.passToChildren = true;
		return opts;
	},
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
		this._initPageManagerRadio(opts);
		this.createRouter();

	},

	getChannel () {
		if(!this._channel) this._initPageManagerRadio(this.options);
		return this._channel;
	},

	_initPageManagerRadio(opts = {})
	{
		this.mergeOptions(opts, ['channel','channelName']);

		if(this._radioInitialized) return;


		let name = this.getName();
		if(!this._channel && name){
			this.channelName = `pagemanager:${name}`;
			this._initRadio({skip:false});
		}

		this._registerRadioHandlers();
		this._proxyRadioEvents();

		this._radioInitialized = true;
	},

	_registerRadioHandlers(){
		let channel = this.getChannel();
		if(this._radioHandlersRegistered || !channel) return;

		this.listenTo(channel,'page:before:start', this._pageBeforeStart);
		this.listenTo(channel,'page:start', this._pageStart);
		this.listenTo(channel,'page:decline', this._pageDecline);

		this._radioHandlersRegistered = true;
	},

	_proxyRadioEvents(){
		let channel = this.getChannel();
		if(this._radioEventsProxied || !channel) return;


		let proxyRadioEvents = this.getProperty('proxyRadioEvents') || [];
		_(['page:before:start', 'page:start'].concat(proxyRadioEvents)).each((event) => {
			this.listenTo(channel, event, (...args) => this.triggerMethod(event, ...args));
		});

		this._radioEventsProxied = true;

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

	},
});

export default YatPageManager;
