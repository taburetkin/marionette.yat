import _ from 'underscore';

export default (BaseClass) => class extends BaseClass {
		constructor(...args){
			super(...args);
			this.initializeStateable();
		}
		
		static get Stateable() { return true; }

		initializeStateable(){
			this._state = {};
		}
		getState(key){
			const state = this._state;
			if(!key) return state
			else return state[key];
		}
		setState(key, value, options){
			
			if(key == null) return;

			if(typeof key === 'object'){
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
		}
		_triggerStateChange(key, value, options){

			if(!_.isFunction(this.triggerMethod)) return;

			if(typeof key !== 'object'){
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
		}
	}
