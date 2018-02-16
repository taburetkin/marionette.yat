import _ from 'underscore';
import $ from 'underscore';
import mix from '../helpers/mix.js';
import State from './stateable.js';
import YatError from '../YatError.js';
import camelCase from '../functions/common/camel-case';

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

function workoutArgumentPromises(arg, context){
	if(arg == null) return [];
	else if(_.isArray(arg)){
		let raw = _(arg).map((a) => {
			if(_.isFunction(a))
				return a.call(context, a);
			else if(_.isObject(a))
				return a;
		});
		return _(raw).filter((f) => f != null);
	}else if(_.isObject(arg)){
		return [arg];
	}
}



const LifecycleMixin = {
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

	isIdle(){
		return this._lifestate.isIn(STATES.INITIALIZED, STATES.RUNNING, STATES.WAITING);
	},
}


const StartableHidden = {
	setLifecycleListeners(){
			
		let freezeWhileStarting = this.getProperty('freezeWhileStarting') === true;
		if(freezeWhileStarting){
			if(_.isFunction(this.freezeUI))
				this.on(`state:${STATE_KEY}:${STATES.STARTING}`,() => {
					this.freezeUI();
				});
			if(_.isFunction(this.unFreezeUI))
				this.on('start start:decline',() => {
					this.unFreezeUI();
				});
		}

		this.on('destroy',() => this._lifestate.set(STATES.DESTROYED));

	},	

	isIntact(opts = { throwError: false }) {
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

	isIdle(opts = {throwError:false}){
		
		let isNotIntact = this._startable.isIntact(opts);

		let message = 'Startable is not idle. current state: ' + this._lifestate.get();
		let error = new YatError({
			name: 'StartableLifecycleError',
			message: message
		});

		let notIdle = this._lifestate.isInProcess();
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

	canNotStart(opts = {throwError:false}){
		
		let message = 'Startable has already been started.';
		let error = new YatError({
			name: 'StartableLifecycleError',
			message: message
		});			
		let notIdle = this._startable.isIdle(opts);
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
	
	
	canNotStop(opts = {throwError:false}){
		
		let message = 'Startable should be in `running` state.';
		let error = new YatError({
			name: 'StartableLifecycleError',
			message: message
		});				
		let notIdle = this._startable.isIdle(opts);

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

	addRuntimePromise(type, promise){
		if(promise == null) return;
		let name = `_${type}RuntimePromises`;
		this[name] || (this[name] = []);
		this[name].push(promise);
	}	
}


const Overridable = {
	freezeWhileStarting: false,
	freezeUI(){ },
	unFreezeUI(){ },
	
	preventStart(){ },
	preventStop(){ },

	triggerStartBegin(){},
	triggerBeforeStart(...args){
		this.triggerMethod('before:start', ...args);
	},	
	triggerStart(...args) {
		this.triggerMethod('start', ...args);
	},
	triggerStartDecline(...args){
		this.triggerMethod('start:decline', ...args);
	},

	triggerStopBegin(){},
	triggerBeforeStop(...args) {
		this.triggerMethod('before:stop', ...args);
	},		
	triggerStop(...args) {
		this.triggerMethod('stop', ...args);
	},	
	triggerStopDecline(...args){
		this.triggerMethod('stop:decline', ...args);
	},
};


const ProcessEngine = {

	process(context) {

		if(context == null || !_.isObject(context) || !_.isObject(context.startable))
			throw new Error('process context missing or incorrect');

		this.clearRuntimePromises(context);

		//collect all parents promises, instance promises and runtime promises
		let prepare = this.prepare(context);

		let promise = new Promise((resolve, reject) => {
			
			context.reject = reject;
			context.resolve = resolve;

			//notify on begin (not before:start)
			this.triggerBegin(context);

			//check if a process can be done.
			if(this.canNotBeDone(context)) return;

			//check if a process allowed to be done.
			if(this.isNotAllowed(context)) return;

			
			//notify about `before:start` or `before:stop`
			this.triggerBefore(context);

			//remember current state and change it to starting or stopping
			this.updateState(context);

			//call success or fail callbacks when all promisess resolved
			return prepare.then(() => this.success(context), (reason) => this.fail(reason, context));
		});
		return promise;
	},

	triggerBegin(context){
		this._executeOnStartable(context.startable, 
			`trigger:${context.process}:begin`, 
			context.args);
	},

	canNotBeDone(context){
		let _this = context.startable._startable;
		let reason = this._executeOnStartable(_this, 
			`can:not:${context.process}`);
		if(!reason) return;
		
		context.reject(reason);
		return reason;
	},

	isNotAllowed(context){
		let _this = context.startable;
		let reason = this._executeOnStartable(_this, 
			`prevent:${context.process}`, 
			context.args);
		if(!reason) return;
		
		context.reject(reason);
		return reason;		
	},

	triggerBefore(context){
		this._executeOnStartable(context.startable, 
			`trigger:before:${context.process}`, 
			context.args);
	},

	updateState(context){
		let _this = context.startable;
		context.stateRollback = _this._lifestate.get();
		_this._lifestate.set(context.stateProcess);
	},

	success(context){
		
		let _this = context.startable;
		_this._lifestate.set(context.stateEnd);
		context.resolve(...context.args);

		//under question. is it necessary at all
		//this.once('start', (...args) => resolve(...args));

		this._executeOnStartable(context.startable, 
			`trigger:${context.process}`, 
			context.args);
	},

	fail(reason, context){

		let _this = context.startable;
		_this._lifestate.set(context.stateRollback);

		let newreason = this._executeOnStartable(context.startable, 
			`trigger:${context.process}:decline`, 
			context.args);		

		return context.reject(newreason || reason);
	},

	prepare(context){
		if(!context.startable) return;

		let raw = [
			this.parentPromise(context),
			this.instancePromise(context),
			this.runtimePromise(context)
		];
		let promises = _(raw).filter((f) => f!=null);
		if(context.skipRuntimePromises)
			return promises.length ? Promise.all(promises) : undefined;
		else
			return Promise.all(promises);
	},

	parentPromise(context){
		let _this = context.startable;
		var parent = _.result(_this, 'getParent');
		if(!parent) return;

		let parentContext = {
			startable: parent,
			process : context.process,
			skipRuntimePromises: true
		}
		return this.prepare(parentContext);
	},

	instancePromise(context){
		return this._propertyPromise(context.startable, `${context.process}Promises`)
	},

	runtimePromise(context){
		if(context.skipRuntimePromises) return;
		return this._propertyPromise(context.startable, `_${context.process}RuntimePromises`, 'getProperty')
	},

	clearRuntimePromises(context){
		let _this = context.startable;
		_this[`_${context.process}RuntimePromises`] = [];
	},

	_propertyPromise(instance, property, method = 'getOption'){
		let raw = instance[method](property);
		let promises = workoutArgumentPromises(raw, instance);
		return promises.length ? Promise.all(promises) : undefined;		
	},

	_executeOnStartable(startable, rawmethod, args){
		let method = camelCase(rawmethod);
		return _.isFunction(startable[method]) && startable[method](...args);		
	}

}




function bindAll(holder, context){
	context || (context = holder);
	_(holder).each((fn,name) => { 
		if(_.isFunction(fn, name)){
			holder[name] = _.bind(fn, context);
		}
	});
}

export default (Base) => {
	let Middle = mix(Base).with(State, Overridable);
	let Mixin = Middle.extend({
		constructor(...args){
			
			
			this._startPromises = [];
			this._stopPromises = [];			
			
			Middle.apply(this,args);

			this._initializeStartable();

		},

		start(...args){
			let context = {
				startable: this,
				process: 'start',
				stateProcess: STATES.STARTING,
				stateEnd: STATES.RUNNING,
				args: args
			}
			return ProcessEngine.process(context);
		},

		stop(...args){
			let context = {
				startable: this,
				process: 'stop',
				stateProcess: STATES.STOPPING,
				stateEnd: STATES.WAITING,
				args: args
			}
			return ProcessEngine.process(context);
		},

		restart(...args){
			if(!this.isStarted())
				return this.start(...args);
			else{
				return this.stop().then(() => this.start(...args));
			}
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
			this._startable.addRuntimePromise('start',promise);
		},	
		addStopPromise(promise){
			this._startable.addRuntimePromise('stop',promise);
		},


		_lifestate : _.extend({}, LifecycleMixin),
		_startable : _.extend({}, StartableHidden),
		

		_initializeStartable(){
			
			if(!(this.constructor.Startable && this.constructor.Stateable)) return;

			bindAll(this._lifestate, this);
			bindAll(this._startable, this);
			

			this._lifestate.set(STATES.INITIALIZED);

		},	
		
	});

	Mixin.Startable = true;

	return Mixin;
}
