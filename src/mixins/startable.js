import _ from 'underscore';
import mixin from '../helpers/mixin.js';
import State from './stateable.js';
import YatError from '../YatError.js';

const STATES = {
	INITIALIZED: 'initialized',
	STARTING: 'starting',
	RUNNING: 'running',
	STOPPING: 'stopping',
	WAITING: 'waiting',
	DESTROYED: 'destroyed'
}

const STATE_KEY = 'life';


function getPropertyPromise(context, propertyName){
	let rawPromises = context[propertyName] || [];
	let promises = [];
	_(rawPromises).each((promiseArg) => {
		if(_.isFunction(promiseArg))
			promises.push(promiseArg.call(this));
		else
			promises.push(promiseArg);
	});
	return Promise.all(promises);
}

function addPropertyPromise(context, propertyName, promise){
	context[propertyName] || (context[propertyName] = []);
	let promises = context[propertyName];
	promises.push(promise);
}



export default (Base) => class extends mixin(Base).with(State) {
	constructor(...args){
		super(...args);
		this.initializeStartable();
	}

	static get Startable() { 
		return this.Stateable && _.isFunction(this.prototype.on) === true;
	}


	initializeStartable(){
		if(!this.constructor.Startable) return;

		this._registerStartableLifecycleListeners();
		this._setLifeState(STATES.INITIALIZED);
	}	

	start(options){
		
		this._ensureStartableCanBeStarted();
		
		if(!this.isStartAllowed(options)){
			this.triggerMethod('start:decline');
			return Promise.reject("start declined");
		}
		
		var currentState = this._getLifeState();

		
		this._tryMergeStartOptions(options);		
		this.triggerMethod('before:start', this, options);
		
		let promise = this._getStartPromise();

		return promise.then(() => {
			this.triggerStart(options)
		}, () => {
			this._setLifeState(currentState);
		});	


	}

	triggerStart(options) {
		this.triggerMethod('start', options);
	}

	stop(options){

		this._ensureStartableCanBeStopped();
		
		if(!this.isStopAllowed(options)) {
			this.triggerMethod('stop:decline');
			return this._createDisallowedPromise();			
		}

		var currentState = this._getLifeState();
		//this._setLifeState(STATES.STOPPING);

		this._tryMergeStopOptions(options);
		this.triggerMethod('before:stop', this, options);

		let promise = this._getStopPromise();

		return promise.then(() => {
			this.triggerStop(options)
		}, () => {
			this._setLifeState(currentState);
		});	

	}
	triggerStop(options) {
		this.triggerMethod('stop', options);
	}

	isStartAllowed(){ return true; }
	isStopAllowed(){ return true; }

	addStartPromise(promise){
		addPropertyPromise(this,'startPromises', promise);
	}
	addStopPromise(promise){
		addPropertyPromise(this,'stopPromises', promise);
	}

	//lifecycle state helpers
	_setLifeState(newstate){
		this.setState(STATE_KEY, newstate);
	}
	_getLifeState(){
		return this.getState(STATE_KEY);
	}
	_isLifeState(state){
		return this._getLifeState() === state;
	}
	_isLifeStateIn(...states){
		return _(states).some((state) => this._isLifeState(state));
	}

	_isInProcess(){
		return this._isLifeStateIn(STATES.STARTING, STATES.STOPPING);
	}


	_registerStartableLifecycleListeners(){

		this.on('before:start', () => this._setLifeState(STATES.STARTING));
		this.on('start', () => this._setLifeState(STATES.RUNNING));
		this.on('before:stop',() => this._setLifeState(STATES.STOPPING));
		this.on('stop',() => this._setLifeState(STATES.WAITING));
		this.on('destroy',() => this._setLifeState(STATES.DESTROYED))
	}	

	_tryMergeStartOptions(options){
		if(!this.mergeOptions) return;
		var mergeoptions = this.getProperty('mergeStartOptions') || [];
		this.mergeOptions(options, mergeoptions);
	}
	_tryMergeStopOptions(options){
		if(!this.mergeOptions) return;
		var mergeoptions = this.getProperty('mergeStopOptions') || [];
		this.mergeOptions(options, mergeoptions);
	}	

	_ensureStartableIsIntact() {
		if(this._isLifeState(STATES.DESTROYED)) 
			throw new YatError({
				name: 'StartableLifecycleError',
				message: 'Startable has already been destroyed and cannot be used.'
			});
	}

	_ensureStartableIsIdle(){
		if(this._isInProcess())
			throw new YatError({
				name: 'StartableLifecycleError',
				message: 'Startable is in process.'
			});				
	}

	_ensureStartableCanBeStarted(){
		
		this._ensureStartableIsIntact();

		this._ensureStartableIsIdle();

		if(this._isLifeState(STATES.RUNNING))
			throw new YatError({
				name: 'StartableLifecycleError',
				message: 'Startable has already been started.'
			});
	}
	
	
	_ensureStartableCanBeStopped(){
		this._ensureStartableIsIntact();

		this._ensureStartableIsIdle();

		if(!this._isLifeState(STATES.RUNNING)) 
			throw new YatError({
				name: 'StartableLifecycleError',
				message: 'Startable should be started.'
			});
	}	
	
	_getStartPromise(){
		return Promise.all(this._getStartPromises());
	}
	_getStartPromises(){
		let promises = [];
		promises.push(this._getStartUserPromise());
		promises.push(this._getStartParentPromise());
		return promises;
	}

	_getStartUserPromise(){
		return getPropertyPromise(this,'startPromises');
	}
	_getStartParentPromise(){
		var parent = _.result(this, 'getParent');
		if(_.isObject(parent) && _.isFunction(parent._getStartPromise))
			return parent._getStartPromise();
	}
	_getStopPromise(){
		return Promise.all(this._getStopPromises());
	}
	
	_getStopPromises(){
		let promises = [];
		promises.push(this._getStopUserPromise());
		return promises;
	}	
	_getStopUserPromise(){
		return getPropertyPromise(this,'stopPromises');
	}
	_getStopParentPromise(){
		var parent = _.result(this, 'getParent');
		if(_.isObject(parent) && _.isFunction(parent._getStopPromise))
			return parent._getStartPromise();
	}





}