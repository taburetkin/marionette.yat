import _ from 'underscore';
import $ from 'jquery';
import Mn from 'backbone.marionette';
import Bb from 'backbone';
import YatObject from '../YatObject';

/*
	StateEntry = {
		get: fn(view, options),
		set: fn(view, options)
	}

*/

const stateEntries = {
	scrollable:{
		get(view, options = {}){
			let result = {};
			view.$('[data-scrollable]').each((i, el) => {
				let $el = $(el);
				let name = $el.data('scrollable');
				result[name] = { 
					top: $el.scrollTop(),
					left: $el.scrollLeft(),
				};
			});
			return result;
		},
		set(view, state = {}, options = {}){
			view.$('[data-scrollable]').each((i, el) => {
				let $el = $(el);
				let name = $el.data('scrollable');
				let stored = state[name];
				if(!isNaN(stored.top))
				  $el.scrollTop(stored.top);
			  	if(!isNaN(stored.left))
				  $el.scrollLeft(stored.left);				  
			});
		},
	}
};

const stateStore = {};

const Api = YatObject.extend({
	initialize(options){
		this._initStates();
	},
	_initStates(){
		this._states = {};
		let states = this.getOption('states');
		_(states).each((state, name) => {
			if(typeof state === 'string'){
				name = state;
				state = stateEntries[state];
			}
			if(!this._isStateEntry(state)) return;
			this._states[name] = state;
		});

	},
	_isStateEntry(arg){
		return _.isObject(arg) && _.isFunction(arg.get) && _.isFunction(arg.set);
	},
	apply(view, options = {}){
		let store = this.getStore(view, options);
		_(this._states).each((state, name) => {
			state.set(view, store[name], options);
		});
	},
	collect(view, options = {}){
		let store = this.getStore(view, options);
		_(this._states).each((state, name) => {
			store[name] = state.get(view, options);
		});
	},
	getStore(view, options = {}){
		let key = this.getStoreKey(view, options);
		stateStore[key] || (stateStore[key] = {});
		return stateStore[key];
	},
	getStoreKey(view, options = {}){
		let prefix = this.getOption('storeIdPrefix');
		return (prefix ? prefix + ":" : '') + String(view.id || view.cid);
	},
});

Api.set = function(name, entry){
	stateEntries[name] = entry;
};
Api.remove = function(name){
	delete stateEntries[name];
}
Api.clear = function(){
	let keys = _(stateEntries).keys();
	_(keys).each((key) => delete stateEntries[key]);
}
Api.states = function(){
	return stateEntries;
}
Api.store = function(){
	return stateStore;
}

export default Api;
