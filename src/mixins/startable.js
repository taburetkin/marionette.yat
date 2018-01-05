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



export default (Base) => {
	class Mixin extends mixin(Base).with(State) {
		constructor(...args){
			super(...args);
			this.initializeStartable();
		}

		initializeStartable(){
			
			if(!(this.constructor.Startable && this.constructor.Stateable)) return;

			this._registerStartableLifecycleListeners();
			this._setLifeState(STATES.INITIALIZED);
		}	

		start(options){
			let canNotBeStarted = this._ensureStartableCanBeStarted();
			if(canNotBeStarted){
				this.triggerMethod('start:decline',canNotBeStarted);
				return Promise.reject(canNotBeStarted);				
			}
			let declineReason = this.isStartNotAllowed(options);
			if(declineReason){
				this.triggerMethod('start:decline', declineReason);
				return Promise.reject(declineReason);
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
			let canNotBeStopped = this._ensureStartableCanBeStopped();
			if(canNotBeStopped){
				this.triggerMethod('stop:decline',canNotBeStopped);
				return Promise.reject(canNotBeStopped);				
			}
			let declineReason = this.isStopNotAllowed(options);
			if(declineReason){
				this.triggerMethod('stop:decline', declineReason);
				return Promise.reject(declineReason);
			}
			

			var currentState = this._getLifeState();

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

		isStartNotAllowed(){ }
		isStopNotAllowed(){ }

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

		_ensureStartableIsIntact(opts = {throwError: false}) {
			let message = 'Startable has already been destroyed and cannot be used.';
			let destroyed = this._isLifeState(STATES.DESTROYED);
			if(opts.throwError && destroyed){
				throw new YatError({
					name: 'StartableLifecycleError',
					message: message
				});
			}
			else if(destroyed){
				return message;
			}
		}

		_ensureStartableIsIdle(opts = {throwError:false}){
			let message = 'Startable is not idle. current state: ' + this._getLifeState();
			let isNotIntact = this._ensureStartableIsIntact(opts);
			let notIdle = this._isInProcess();
			if(opts.throwError && notIdle){
				throw new YatError({
					name: 'StartableLifecycleError',
					message: message
				});
			}
			else if(isNotIntact){
				return isNotIntact;
			}
			else if(notIdle){
				return message;
			}
		}

		_ensureStartableCanBeStarted(opts = {throwError:false}){
			
			let message = 'Startable has already been started.';
			let notIdle = this._ensureStartableIsIdle(opts);
			let allowStartWithoutStop = this.getProperty('allowStartWithoutStop') === true;
			if(!notIdle && allowStartWithoutStop) return;

			let running = this._isLifeState(STATES.RUNNING);
			if(opts.throwError && running){
				throw new YatError({
					name: 'StartableLifecycleError',
					message: message
				});
			}else if(notIdle){
				return notIdle;
			}else if(running){
				return message;
			}
		}
		
		
		_ensureStartableCanBeStopped(opts = {throwError:false}){
			
			let message = 'Startable should be in `running` state.';
			let notIdle = this._ensureStartableIsIdle(opts);

			let allowStopWithoutStart = this.getProperty('allowStopWithoutStart') === true;
			if(!notIdle && allowStopWithoutStart) return;

			let running = this._isLifeState(STATES.RUNNING);

			if(opts.throwError && !running){
				throw new YatError({
					name: 'StartableLifecycleError',
					message: message
				});
			}else if(notIdle){
				return notIdle;
			}else if(!running){
				return message;
			}

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

	Mixin.Startable = true;

	return Mixin;
}