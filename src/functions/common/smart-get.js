import _ from 'underscore';
import Bb from 'backbone';

function normalizeValue(context, value, args){
	if(_.isFunction(value))
		value = value.apply(context, args || []);
	return value;
}

function smartGet(context, opts){
	if(!opts.fields || !opts.fileds.length)
		throw new Error('fields option missing');

	if(context == null) return;

	let value;
	let isModel = context instanceof Bb.Model;
	let hasOptions = _.isObject(context.options);
	
	_(opts.fields).some((fieldName) => {

		if(isModel && value == null)
			value = normalizeValue(context, context.get(fieldName), opts.args);

		if(value == null)
			value = normalizeValue(context, context[fieldName], opts.args);

		if(value == null && hasOptions)
			value = normalizeValue(context, context.options[fieldName], opts.args);

		return value != null;
	});

	return value == null ? opts.default : value;

}


export default smartGet;
