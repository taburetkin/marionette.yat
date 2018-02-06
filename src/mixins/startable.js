import _ from 'underscore';
import mix from '../helpers/mix.js';
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

	if(context == null || propertyName == null)
		return Promise.resolve();

	let _promises1 = context['_'+propertyName] || [];
	let _promises2 = _.result(context, propertyName) || [];

	let rawPromises = _promises1.concat(_promises2);
		//context[propertyName] || [];

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
	let Middle = mix(Base).with(State);
	let Mixin = Middle.extend({
		constructor(...args){
			Middle.apply(this,args);
			this.initializeStartable();
		},

		freezeWhileStarting: false,
		freezeUI(){ },
		unFreezeUI(){ },
		isStartNotAllowed(){ },
		isStopNotAllowed(){ },

		addStartPromise(promise){
			addPropertyPromise(this,'_startRuntimePromises', promise);
		},

		addStopPromise(promise){
			addPropertyPromise(this,'_stopPromises', promise);
		},		

		initializeStartable(){
			
			if(!(this.constructor.Startable && this.constructor.Stateable)) return;

			this._registerStartableLifecycleListeners();
			this._setLifeState(STATES.INITIALIZED);
			this._startRuntimePromises = [];
			this._startPromises = [];
			this._stopPromises = [];
		},	

		start(...args){
			let options = args[0];
			/*
			let canNotBeStarted = this._ensureStartableCanBeStarted();
			let resultPromise = null;
			let catchMethod = null;

			if(canNotBeStarted){
				catchMethod = () => this.triggerMethod('start:decline',canNotBeStarted);
				//resultPromise = Promise.reject(canNotBeStarted);				
			}

			if(resultPromise == null){
				let declineReason = this.isStartNotAllowed(options);
				if(declineReason) {
					catchMethod = () => this.triggerMethod('start:decline',declineReason);
					resultPromise = Promise.reject(declineReason);
				}
			}

			if(resultPromise == null){
				var currentState = this._getLifeState();
				this._tryMergeStartOptions(options);		
				this.triggerMethod('before:start', ...args);

				resultPromise = this._getStartPromise();
			}
			*/	
			
			
			// return resultPromise.then(() => {
			// 	this.triggerStart(options)
			// }, (error) => {				
			// 	this._setLifeState(currentState);
			// 	if(catchMethod) catchMethod();
			// 	return Promise.reject(error);
			// });	
			let _this = this;
			let promise = new Promise(function(resolve, reject){
				let canNotBeStarted = _this._ensureStartableCanBeStarted();

				if(canNotBeStarted){
					_this.triggerMethod('start:decline',canNotBeStarted);
					reject(canNotBeStarted)
					return;
				}

				let declineReason = _this.isStartNotAllowed(options);
				if(declineReason) {
					_this.triggerMethod('start:decline',declineReason);
					reject(declineReason);
					return;
				}				

				let currentState = _this._getLifeState();
				let dependedOn = _this._getStartPromise();
				_this.triggerMethod('before:start', ...args);
				dependedOn.then(() => {
					_this._tryMergeStartOptions(options);		
					_this.once('start', (...args) => resolve(...args));
					_this.triggerStart(options);
				},(...args) => {
					_this._setLifeState(currentState);
					reject(...args);
				});
			});
			return promise;
		},

		triggerStart(options) {
			this.triggerMethod('start', options);
		},

		stop(...args){
			let options = args[0];
			/*
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
			*/

			let _this = this;
			let promise = new Promise(function(resolve, reject){
				let canNotBeStopped = _this._ensureStartableCanBeStopped();

				if(canNotBeStopped){
					_this.triggerMethod('stop:decline',canNotBeStopped);
					reject(canNotBeStopped)
					return;
				}

				let declineReason = _this.isStopNotAllowed(options);
				if(declineReason) {
					_this.triggerMethod('stop:decline',declineReason);
					reject(declineReason);
					return;
				}				

				let currentState = _this._getLifeState();
				let dependedOn = _this._getStopPromise();
				_this.triggerMethod('before:stop', ...args);
				dependedOn.then(() => {
					_this._tryMergeStopOptions(options);		
					_this.once('stop', (...args) => resolve(...args));
					_this.triggerStop(options);
				},(...args) => {
					_this._setLifeState(currentState);
					reject(...args);
				});
			});
			return promise;

		},

		triggerStop(options) {
			this.triggerMethod('stop', options);
		},





		//lifecycle state helpers
		_setLifeState(newstate){
			this.setState(STATE_KEY, newstate);
		},

		_getLifeState(){
			return this.getState(STATE_KEY);
		},

		_isLifeState(state){
			return this._getLifeState() === state;
		},

		_isLifeStateIn(...states){
			return _(states).some((state) => this._isLifeState(state));
		},

		_isInProcess(){
			return this._isLifeStateIn(STATES.STARTING, STATES.STOPPING);
		},


		_registerStartableLifecycleListeners(){
			let freezeWhileStarting = this.getProperty('freezeWhileStarting') === true;
			if(freezeWhileStarting && _.isFunction(this.freezeUI))
				this.on(`state:${STATE_KEY}:${STATES.STARTING}`,() => {
					this.freezeUI();
				});
			if(freezeWhileStarting && _.isFunction(this.unFreezeUI))
				this.on('start',() => {
					this.unFreezeUI();
				});


			this.on('before:start', () => this._setLifeState(STATES.STARTING));
			this.on('start', () => this._setLifeState(STATES.RUNNING));
			this.on('before:stop',() => this._setLifeState(STATES.STOPPING));
			this.on('stop',() => this._setLifeState(STATES.WAITING));
			this.on('destroy',() => this._setLifeState(STATES.DESTROYED));

		},	

		_tryMergeStartOptions(options){
			if(!this.mergeOptions) return;
			var mergeoptions = this.getProperty('mergeStartOptions') || [];
			this.mergeOptions(options, mergeoptions);
		},

		_tryMergeStopOptions(options){
			if(!this.mergeOptions) return;
			var mergeoptions = this.getProperty('mergeStopOptions') || [];
			this.mergeOptions(options, mergeoptions);
		},

		_ensureStartableIsIntact(opts = {throwError: false}) {
			let message = 'Startable has already been destroyed and cannot be used.';
			let error = new YatError({
				name: 'StartableLifecycleError',
				message: message
			});
			let destroyed = this._isLifeState(STATES.DESTROYED);
			if(opts.throwError && destroyed){
				throw error;
			}
			else if(destroyed){
				return error;
			}
		},

		_ensureStartableIsIdle(opts = {throwError:false}){
			let message = 'Startable is not idle. current state: ' + this._getLifeState();
			let error = new YatError({
				name: 'StartableLifecycleError',
				message: message
			});			
			let isNotIntact = this._ensureStartableIsIntact(opts);
			let notIdle = this._isInProcess();
			if(opts.throwError && notIdle){
				throw error;
			}
			else if(isNotIntact){
				return isNotIntact;
			}
			else if(notIdle){
				return error;
			}
		},

		_ensureStartableCanBeStarted(opts = {throwError:false}){
			
			let message = 'Startable has already been started.';
			let error = new YatError({
				name: 'StartableLifecycleError',
				message: message
			});			
			let notIdle = this._ensureStartableIsIdle(opts);
			let allowStartWithoutStop = this.getProperty('allowStartWithoutStop') === true;

			if(!notIdle && allowStartWithoutStop) return;

			let running = this._isLifeState(STATES.RUNNING);
			if(opts.throwError && running){
				throw error;
			}else if(notIdle){
				return notIdle;
			}else if(running){
				return error;
			}
		},
		
		
		_ensureStartableCanBeStopped(opts = {throwError:false}){
			
			let message = 'Startable should be in `running` state.';
			let error = new YatError({
				name: 'StartableLifecycleError',
				message: message
			});				
			let notIdle = this._ensureStartableIsIdle(opts);

			let allowStopWithoutStart = this.getProperty('allowStopWithoutStart') === true;
			if(!notIdle && allowStopWithoutStart) return;

			let running = this._isLifeState(STATES.RUNNING);

			if(opts.throwError && !running){
				throw error;
			}else if(notIdle){
				return notIdle;
			}else if(!running){
				return error;
			}

		},	
		
		_getStartPromise(options = {}){
			return Promise.all(this._getStartPromises(options));
		},

		_getStartPromises(options = {}){
			let promises = [];
			promises.push(this._getStartParentPromise());
			promises.push(this._getStartPagePromise());
			if(options.noruntime !== true)
				promises.push(this._getStartRuntimePromise());
			return promises;
		},

		_getStartRuntimePromise(){
			return getPropertyPromise(this,'startRuntimePromises');
		},
		_getStartPagePromise(){
			return getPropertyPromise(this,'startPromises');
		},
		_getStartParentPromise(){
			var parent = _.result(this, 'getParent');
			if(_.isObject(parent) && _.isFunction(parent._getStartPromise))
				return parent._getStartPromise({noruntime: true});
		},

		_getStopPromise(){
			return Promise.all(this._getStopPromises());
		},
		
		_getStopPromises(){
			let promises = [];
			promises.push(this._getStopRuntimePromise());
			return promises;
		},

		_getStopRuntimePromise(){
			return getPropertyPromise(this,'stopPromises');
		},

		_getStopParentPromise(){
			var parent = _.result(this, 'getParent');
			if(_.isObject(parent) && _.isFunction(parent._getStopPromise))
				return parent._getStopPromise();
		},


	});

	Mixin.Startable = true;

	return Mixin;
}
