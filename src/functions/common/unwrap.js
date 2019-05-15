import _ from 'underscore';
export default function(value, prefix, delimeter = ":"){

	if(value == null) return;
	value = value.toString();
	prefix || (prefix = '');
	if(!value.length) return value;

	let pattern = new RegExp(`^${prefix}${delimeter}`);
	return value.replace(pattern, '');

}
