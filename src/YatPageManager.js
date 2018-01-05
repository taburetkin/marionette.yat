import App from './YatApp';
import GetNameLabel from './mixins/get-name-label';
import Router from './YatRouter';
import mixin from './helpers/mixin';

class YatPageManager extends mixin(App).with(GetNameLabel) {
	constructor(...args){
		super(...args);
		this._initializeYatPageManager(...args);
	}
	get initRadioOnInitialize() { return false; }
	getChildOptions(){
		let opts = super.getChildOptions() || {};
		opts.channel = this.getChannel();
		opts.passToChildren = true;
		return opts;
	}
	createRouter(){
		let children = this.getChildren();
		let hash = {};
		_(children).each(function(page){
			if(_.isFunction(page.getRouteHash)){
				_.extend(hash, page.getRouteHash());
			}
		});
		this.setRouter(new Router(hash));
	}
	setRouter(router){
		this.router = router;
	}
	getRouter(){
		return this.router;
	}
	_initializeYatPageManager(opts = {}){
		this.mergeOptions(opts, ['id','name','label']);
		this._initPageManagerRadio(opts);
		this.createRouter();

	}
	getChannel () {
		if(!this._channel) this._initPageManagerRadio(this.options);
		return this._channel;
	}
	_initPageManagerRadio(opts = {})
	{
		if(this._radioInitialized) return;

		this.mergeOptions(opts, ['channel','channelName']);
		//let channel = super.getChannel();
		let name = this.getName();
		if(!this._channel && name){
			this.channelName = `pagemanager:${name}`;
			super._initRadio({skip:false});
		}
		this._registerRadioHandlers();
		this._proxyRadioEvents();
		this._radioInitialized = true;
	}
	_registerRadioHandlers(){
		let channel = this.getChannel();
		if(this._radioHandlersRegistered || !channel) return;

		this.listenTo(channel,'page:before:start', this._pageBeforeStart);
		this.listenTo(channel,'page:start', this._pageStart);
		
		this._radioHandlersRegistered = true;
	}
	_proxyRadioEvents(){
		let channel = this.getChannel();
		if(this._radioEventsProxied || !channel) return;


		let proxyRadioEvents = this.getProperty('proxyRadioEvents') || [];
		_(['page:before:start', 'page:start'].concat(proxyRadioEvents)).each((event) => {
			this.listenTo(channel, event, (...args) => this.triggerMethod(event, ...args));
		});

		this._radioEventsProxied = true;

	}
	_pageBeforeStart(page){
		let current = this.getState('currentPage');
		if(current && current != page){
			current.stop();
		}
	}
	_pageStart(page){
		this.setState('currentPage', page);
	}
}

export default YatPageManager;