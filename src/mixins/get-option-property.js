import _ from 'underscore';
import isKnownCtor from '../helpers/isKnownCtor.js';

// function normalizeOptions(options){
// 	return _.extend({}, {deep: true, force: true, args: []}, options);
// }

// function getDeepOptions(options){
// 	return _.extend({}, options, {deep:false, force: false});
// }

// function getValue(deepMethodName, key)
// {
// 	const context = deepMethodName === 'getOption' ? this
// 					: deepMethodName === 'getProperty' &&  _.isObject(this.options) ? this.getProperty('options',{deep:false})
// 					: null;
// 	if(context == null) return;

// 	return context[key];

// }

let OptionPropertyHelpers = {
	
	normalizeOptions(options){
		return _.extend({}, {deep: true, force: true, args: []}, options);
	},

	getDeepOptions(options){
		return _.extend({}, options, {deep:false, force: false});
	},

	getValue(deepMethodName, key){
		const context = deepMethodName === 'getOption' ? this
					: deepMethodName === 'getProperty' &&  _.isObject(this.options) ? this.getProperty('options',{deep:false})
					: null;
		if(context == null) return;

		return context[key];
	},
	getOptionPropertyValue(key, options, deepMethodName)
	{
		
		if(key == null) return;
	
		let opts = OptionPropertyHelpers.normalizeOptions(options);
		let deepOpts = OptionPropertyHelpers.getDeepOptions(options);
		
		let value = OptionPropertyHelpers.getValue.call(this, deepMethodName, key);
	
		if(value === undefined && opts.deep)
			value = this[deepMethodName](key, deepOpts);
	
		if(typeof value !== 'function' || isKnownCtor(value) || !opts.force) return value;
	
		return value.apply(this, opts.args);
	},	
};


export default (Base) => {
	let Mixin = Base.extend({
		getProperty(key, options = {deep:true, force:true, args:[]}){
			return OptionPropertyHelpers.getOptionPropertyValue.call(this, key, options, 'getOption');
		},
		getOption(key, options = {deep:true, force:true, args:[]}){
			return OptionPropertyHelpers.getOptionPropertyValue.call(this, key, options, 'getProperty');
		},

	});
	return Mixin;
}
