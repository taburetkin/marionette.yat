import _ from 'underscore';
import $ from 'underscore';
import Mn from 'backbone.marionette';
import Bb from 'backbone';
import YatObject from '../YatObject';

/*
	StateEntry = {
		get: fn(index, domElement),
		set: fn(index, domElement)
	}

*/

const stateEntries = {
	scrollable:{
		get(view, options = {}){
			let result = {};
			view.$('[data-scrollable]').each((i, el) => {
				let $el = $(el);
				let name = $el.data('scrollable');
				result[name] = $el.scrollTop();
			});
			return result;
		},
		set(view, state = {}, options = {}){
			view.$('[data-scrollable]').each((i, el) => {
				let $el = $(el);
				let name = $el.data('scrollable');
				if(!isNaN(state[name]))
				  $el.scrollTop(state[name]);
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
		return view.id || view.cid;
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
