import _ from 'underscore';
import isKnownCtor from '../helpers/isKnownCtor.js';

function normalizeOptions(options){
	return _.extend({}, {deep: true, force: true, args: []}, options);
}

function getDeepOptions(options){
	return _.extend({}, options, {deep:false, force: false});
}


function getValue(deepMethodName, key)
{
	const context = deepMethodName === 'getOption' ? this
					: deepMethodName === 'getProperty' &&  _.isObject(this.options) ? this.options
					: null;
	if(context == null) return;

	return context[key];

}

function get(key, options, deepMethodName)
{
	
	if(key == null) return;

	let opts = normalizeOptions(options);
	let deepOpts = getDeepOptions(options);
	
	let value = getValue.call(this, deepMethodName, key);

	if(value === undefined && opts.deep)
		value = this[deepMethodName](key, deepOpts);

	if(typeof value !== 'function' || isKnownCtor(value) || !opts.force) return value;

	return value.apply(this, opts.args);
}


export default (Base) => class extends Base {
	constructor(...args){
		super(...args);
	}
	getProperty(key, options = {deep:true, force:true, args:[]}){

		return get.call(this, key, options, 'getOption');

	}
	getOption(key, options = {deep:true, force:true, args:[]}){

		return get.call(this, key, options, 'getProperty');

	}
	
}