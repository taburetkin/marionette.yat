import _ from 'underscore';
import flat from './functions/common/flatten-unflatten/flatten-object';
import unflat from './functions/common/flatten-unflatten/unflatten-object';
import getByPath from './functions/common/set-get-by-path/get-by-path';
import setByPath from './functions/common/set-get-by-path/set-by-path';
import YatObject from './YatObject';

const YatConfig = YatObject.extend({
	initialize(options){
		this.mergeOptions(options, ['name', 'channelName', 'noRadio']);
		if(this.noRadio !== true && this.channelName == null)
			this.channelName = name;
	},
	getStore(){
		this.store || (this.store = {});
		return this.store;
	},
	radioRequest: {
		get(...args){ this.get(...args); },
		set(path, value){ this.set(path,value); }
	},
	get(path, ...args){
		let store = this.getStore();
		let value = getByPath(store, path);
		if(_.isFunction(value)){
			value = value.apply(this, args);
		}
		
		return value;
	},
	set(path, value){
		let store = this.getStore();
		let result = setByPath(store, path, value);
		this.triggerSet(path, value);
	},
	triggerSet(path, value){
		if(!path) return;
		let arr = path.split('/');
		let radio = this.getChannel();
		do{
			let event = arr.join(':');
			this.triggerMethod(event, value);
			radio && radio.trigger(event, value);
			arr.pop();
		}while(arr.length > 0)
	}
});

export default function(name, options = {}){
	options.name = name;	
	return new YatConfig(options);
}
