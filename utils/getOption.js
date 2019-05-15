import _ from 'underscore';
import result from './result';
import { isKnownCtor } from './is-utils';

export default function getOption(instance, key, options = {}) {

	if (!_.isObject(instance)) return options.default;

	let shouldInvoke = options.force !== false ? arg => !isKnownCtor(arg) : false;
	let context = options.context || instance;
	let args = options.args;
	let value = result(instance.options, key, { shouldInvoke, args, context });
	if (value != null || options.deep === false) {
		return value != null ? value : options.default;
	}
	value = result(instance, key, { shouldInvoke, args });
	return value != null ? value : options.default;
}
