import _ from 'underscore';

export default (BaseClass) => {
	let Mixin = BaseClass.extend({
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
				_(value).each((propertyValue, propertyName) => _this.setState(propertyName, propertyValue, options));
				this._triggerStateChange(value, options);
			}else{
				const state = this.getState();
				state[key] = value;
				this._triggerStateChange(key, value, options);
			}
		},
		clearState(opts = {}){
			let state = this.getState();
			let broadcast = _.extend({}, state);
			_(state).each((s,key) => {
				broadcast[key] = undefined;
				delete state[key];
			});
			this._triggerStateChange(broadcast);
		},
		_triggerStateChange(key, value, options){

			if(!_.isFunction(this.triggerMethod)) return;

			if(!_.isObject(key)){
				this.triggerMethod('state:' + key, value, options);
				if(value === true || value === false)
					this.triggerMethod('state:' + key + ':' + value.toString(), options);
			}else{
				//key is a hash of states
				//value is options
				options = value;
				value = key;
				this.triggerMethod('state', value, options);
			}
		},		
	});
	Mixin.Stateable = true;

	return Mixin;

}
