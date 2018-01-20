import _ from 'underscore';
export default function(prefix, value, delimeter = ':'){
	prefix || (prefix = '');	
	value = value == null ? '' : value.toString();
	return prefix + delimeter + value;
}
