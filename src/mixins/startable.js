import _ from 'underscore';
import $ from 'underscore';
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


const LifecycleMixin = {
	//lifecycle state helpers
	set(newstate){
		this.setState(STATE_KEY, newstate);
	},

	get(){
		return this.getState(STATE_KEY);
	},

	is(state){
		return this._lifestate.get() === state;
	},

	isIn(...states){
		return _(states).some((state) => this._lifestate.is(state));
	},

	isInProcess(){
		return this._lifestate.isIn(STATES.STARTING, STATES.STOPPING);
	},
}

const Overridable = {
	freezeWhileStarting: false,
	freezeUI(){ },
	unFreezeUI(){ },
	isStartNotAllowed(){ },
	isStopNotAllowed(){ },
	prepareForStart(){},
}

function nestMixin(context, property, mixin){
	let nested = context[property] = {};
	_(mixin).each((value, name) => {
		if(_.isFunction(value)){
			nested[name] = value;
			bind(nested[name], context);
		}else if(_.isArray(value)){
			nested[name] = value.slice(0);
		}else if(_.isObject(vale)){
			nested[name] = _.extend({}, value);
		}else
			nested[name] = value;
	});
}

function bindAll(holder, context){
	context || (context = holder);
	if(!_.isObject(holder)) return;
	_(holder).each((fn) => _.isFunction(fn) && _.bind(fn, context));
}

export default (Base) => {
	let Middle = mix(Base).with(State, Overridable, {_lifestate: _.extend({},LifecycleMixin)});
	let Mixin = Middle.extend({
		constructor(...args){
			
			bindAll(this._lifestate, this);

			this._startRuntimePromises = [];
			this._startPromises = [];
			this._stopPromises = [];			
			
			Middle.apply(this,args);

			this._initializeStartable();

		},

		initializeStartable(){
			
			if(!(this.constructor.Startable && this.constructor.Stateable)) return;

			//nestMixin(this, '_lifestate', LifecycleMixin);

			this._registerStartableLifecycleListeners();
			this._lifestate.set(STATES.INITIALIZED);

		},	


		isStarted(){
			return this._lifestate.is(STATES.RUNNING);
		},
		isStoped(){
			return this._lifestate.in(STATES.WAITING, STATES.INITIALIZED);
		},
		isInProcess(){
			return this._lifestate.isInProcess();
		},


		addStartPromise(promise){
			addPropertyPromise(this, '_startRuntimePromises', promise);
		},

		addStopPromise(promise){
			addPropertyPromise(this,'_stopPromises', promise);
		},	

		


		start(...args){
			let options = args[0];
			let _this = this;
			this.prepareForStart();
			let promise = new Promise((resolve, reject) => {
				let canNotBeStarted = this._ensureStartableCanBeStarted();

				if(canNotBeStarted){
					this.triggerMethod('start:decline',canNotBeStarted);
					reject(canNotBeStarted)
					return;
				}

				let declineReason = this.isStartNotAllowed(options);
				if(declineReason) {
					this.triggerMethod('start:decline',declineReason);
					reject(declineReason);
					return;
				}

				this.triggerBeforeStart(...args);				
				let currentState = this._lifestate.get();
				this._lifestate.set(STATES.STARTING);

				let dependedOn = this._getStartPromise();
				dependedOn.then(() => {
					this._tryMergeStartOptions(options);		
					this.once('start', (...args) => resolve(...args));
					this._lifestate.set(STATES.RUNNING);
					this.triggerStart(options);
				},(...args) => {
					this._lifestate.set(currentState);
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
			
			let canNotBeStarted = this._ensureStartableCanBeStarted();
			if(canNotBeStarted) return Promise.reject(canNotBeStarted);

			let promise = new Promise((resolve, reject) => {
				if(this.isStarted())
					this.stop()
						.then((stopArg) => {
							return this.start(options).then(
								(startArg) => resolve(startArg), 
								(startArg) => reject(startArg)
							);
						}, 
						(stopArg) => {
							return reject(stopArg);
						});
				else if(this.isStoped())
					this.start(options).then(
						(arg) => resolve(arg), 
						(arg) => reject(arg)
					);
				else
					reject(new YatError({
						name: 'StartableLifecycleError',
						message: 'Restart not allowed when startable not in idle. Current state' + this._lifestate.get(),
					}));
			});
			return promise;
		},

		stop(...args){
			let options = args[0];
			let promise = new Promise((resolve, reject) => {
				let canNotBeStopped = this._ensureStartableCanBeStopped();

				if(canNotBeStopped){
					this.triggerMethod('stop:decline',canNotBeStopped);
					reject(canNotBeStopped)
					return;
				}

				let declineReason = this.isStopNotAllowed(options);
				if(declineReason) {
					this.triggerMethod('stop:decline',declineReason);
					reject(declineReason);
					return;
				}				

				let currentState = this._lifestate.get();
				this.triggerMethod('before:stop', ...args);
				this._lifestate.set(STATES.STOPPING);
				let dependedOn = this._getStopPromise();
				dependedOn.then(() => {
					this._tryMergeStopOptions(options);		
					this.once('stop', (...args) => resolve(...args));
					this._lifestate.set(STATES.WAITING);
					this.triggerStop(options);
				},(...args) => {
					this._lifestate.set(currentState);
					reject(...args);
				});
			});
			return promise;

		},

		triggerStop(options) {
			this.triggerMethod('stop', options);
		},








		_registerStartableLifecycleListeners(){
			
			let freezeWhileStarting = this.getProperty('freezeWhileStarting') === true;

			if(freezeWhileStarting && _.isFunction(this.freezeUI))
				this.on(`state:${STATE_KEY}:${STATES.STARTING}`,() => {
					this.freezeUI();
				});
			if(freezeWhileStarting && _.isFunction(this.unFreezeUI))
				this.on('start start:decline',() => {
					this.unFreezeUI();
				});
			this.on('destroy',() => this._lifestate.set(STATES.DESTROYED));

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
			let destroyed = this._lifestate.is(STATES.DESTROYED);
			if(opts.throwError && destroyed){
				throw error;
			}
			else if(destroyed){
				return error;
			}
		},

		_ensureStartableIsIdle(opts = {throwError:false}){
			let message = 'Startable is not idle. current state: ' + this._lifestate.get();
			let error = new YatError({
				name: 'StartableLifecycleError',
				message: message
			});			
			let isNotIntact = this._ensureStartableIsIntact(opts);
			let notIdle = this.isInProcess();
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

			let running = this._lifestate.is(STATES.RUNNING);
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

			let running = this._lifestate.is(STATES.RUNNING);

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
