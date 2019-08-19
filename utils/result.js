import { getByPath } from './byPath-utils';
import { isKnownCtor } from './is-utils';

export default function result(instance, key, { shouldInvoke = v => !isKnownCtor(v), args, context, byPath }) {

	if (!instance || key == null) return;

	let value = byPath ? getByPath(instance, key) : instance[key];

	if (typeof (value) !== 'function' || !shouldInvoke) {
		return value;
	}

	if (typeof (shouldInvoke) === 'function' && !shouldInvoke(value)) {
		return value;
	}

	!context && (context = instance);
	// for supporting arrow functions: context => ...
	!args && (args = [context]);

	return value.apply(context, args);

}
