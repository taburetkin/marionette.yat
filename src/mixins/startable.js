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
		return;

	let _promises1 = context['_'+propertyName] || [];
	let _promises2 = _.result(context, propertyName) || [];

	let rawPromises = _promises1.concat(_promises2);
		//context[propertyName] || [];

	let promises = [];
	_(rawPromises).each((promiseArg) => {
		if(_.isFunction(promiseArg)){
			let invoked = promiseArg.call(this);
			if(invoked)
				promises.push(invoked);
		}
		else if(promiseArg != null)
			promises.push(promiseArg);
	});
	return Promise.all(promises.filter((f) => f!=null));
}

function addPropertyPromise(context, propertyName, promise){

	if(context == null || propertyName == null || promise == null) return;
	
	context[propertyName] || (context[propertyName] = []);

	context[propertyName].push(promise);

}



export default (Base) => {
	let Middle = mix(Base).with(State);
	let Mixin = Middle.extend({
		constructor(...args){
			this._startRuntimePromises = [];
			this._startPromises = [];
			this._stopPromises = [];
			
			Middle.apply(this,args);
			this.initializeStartable();
		},

		freezeWhileStarting: false,
		freezeUI(){ },
		unFreezeUI(){ },
		isStartNotAllowed(){ },
		isStopNotAllowed(){ },

		isStarted(){
			return this._isLifeState(STATES.RUNNING);
		},

		isStoped(){
			return this._isLifeStateIn(STATES.WAITING, STATES.INITIALIZED);
		},

		addStartPromise(promise){
			addPropertyPromise(this, '_startRuntimePromises', promise);
		},

		addStopPromise(promise){
			addPropertyPromise(this,'_stopPromises', promise);
		},		

		initializeStartable(){
			
			if(!(this.constructor.Startable && this.constructor.Stateable)) return;

			this._registerStartableLifecycleListeners();
			this._setLifeState(STATES.INITIALIZED);
		},	
		prepareForStart(){},
		start(...args){
			let options = args[0];
			let _this = this;
			this.prepareForStart();
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

				_this.triggerBeforeStart(...args);				
				let currentState = _this._getLifeState();
				this._setLifeState(STATES.STARTING);

				let dependedOn = _this._getStartPromise();
				dependedOn.then(() => {
					_this._tryMergeStartOptions(options);		
					_this.once('start', (...args) => resolve(...args));
					this._setLifeState(STATES.RUNNING);
					_this.triggerStart(options);
				},(...args) => {
					_this._setLifeState(currentState);
					reject(...args);
				});
			});
			return promise;
		},
		triggerBeforeStart(...args){
			this.triggerMethod('before:start', ...args);
		},
		triggerStart(options) {
			this.triggerMethod('start', options);
		},

		restart(options){
			let canBeStarted = this._ensureStartableCanBeStarted();
			let promise = new Promise((resolve, reject) => {
				if(this.isStarted())
					this.stop().then((arg) => this.start().then((arg) => resolve(arg), (arg) => reject(arg)), (arg) => reject(arg));
				else if(this.isStoped())
					this.start().then((arg) => resolve(arg), (arg) => reject(arg));
				else
					reject(new YatError({
						name: 'StartableLifecycleError',
						message: 'Restart not allowed when startable not in idle',
					}));
			});
			return promise;
		},

		stop(...args){
			let options = args[0];

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
				_this.triggerMethod('before:stop', ...args);
				this._setLifeState(STATES.STOPPING);
				let dependedOn = _this._getStopPromise();
				dependedOn.then(() => {
					_this._tryMergeStopOptions(options);		
					_this.once('stop', (...args) => resolve(...args));
					this._setLifeState(STATES.WAITING);
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


			// this.on('before:start', () => this._setLifeState(STATES.STARTING));
			// this.on('start', () => this._setLifeState(STATES.RUNNING));
			// this.on('before:stop',() => this._setLifeState(STATES.STOPPING));
			// this.on('stop',() => this._setLifeState(STATES.WAITING));
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

		_ensureStartableIsIntact(opts = { throwError: false }) {
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
			let parent = this._getStartParentPromise();
			parent && promises.push(parent);
			let instance = this._getStartInstancePromise();
			instance && promises.push(instance);

			if(options.noruntime !== true){
				let runtime = this._getStartRuntimePromise();
				runtime && promises.push(runtime)
			}
			return promises;
		},

		_getStartRuntimePromise(){
			return getPropertyPromise(this,'startRuntimePromises');
		},
		_getStartInstancePromise(){
			let promises = getPropertyPromise(this,'startPromises');
			return promises;
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
