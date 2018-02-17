import _ from 'underscore';

export default (BaseClass) => {
	let Mixin = BaseClass.extend({

		verboseStateBoolean: false,
		verboseStateString: false,
		verboseStateHash: false,
		verboseState: false,

		constructor(...args){
			BaseClass.apply(this, args);
			this.initializeStateable();
		},

		initializeStateable(){
			this._state = {};
		},

		getState(key){
			const state = this._state;
			if(!key) return state
			else return state[key];
		},
		setState(key, value, options){
			
			if(key == null) return;

			if(_.isObject(key)){
				const _this = this;
				options = value;
				value = key;
				let propertyOptions = _.extend({}, options, {doNotTriggerStateHash: true});
				_(value).each(
					(propertyValue, propertyName) => 
						_this.setState(propertyName, propertyValue, propertyOptions)
				);
				this._tryTriggerStateChange(value, options);
			}else{
				const state = this.getState();
				state[key] = value;
				this._tryTriggerStateChange(key, value, options);
			}
		},
		clearState(opts = {}){
			let state = this.getState();
			let broadcast = _.extend({}, state);
			_(state).each((s,key) => {
				broadcast[key] = undefined;
				delete state[key];
			});
			this._tryTriggerStateChange(broadcast);
		},
		_tryTriggerStateChange(key, value, options = {}){

			if(options.silent === true) return;


			if(!_.isObject(key)){

				this._triggerStateChange('verboseState','state:' + key, value, this, options);

				let stringValue = String(value).toLowerCase().trim();

				if(['true','false'].indexOf(stringValue)>=0)
					this._triggerStateChange('verboseStateBoolean',`state:${key}:${stringValue}`, this, options);

				if(_.isString(value))
					this._triggerStateChange('verboseStateString',`state:${key}:${value}`, this, options);
				
				if(!options.doNotTriggerStateHash)
					this._triggerStateChange('verboseStateHash','state', {[key]:value}, this, options);
				
			}else{
				//key is a hash of states
				//value is options
				options = value;
				value = key;
				this._triggerStateChange('verboseStateHash', 'state', value, options);
			}
		},
		_triggerStateChange(type, ...args){
			let broadcast = _.isFunction(this.triggerMethod) ? this.triggerMethod
							: _.isFunction(this.trigger) ? this.trigger
							: null;
			let allowed = this.getProperty(type) === true;
			
			if(!broadcast || !allowed) return;

			broadcast.apply(this, args);
		}		
	});
	Mixin.Stateable = true;

	return Mixin;

}
