export default function result(instance, key, { shouldInvoke, args, context }) {

	if (!instance || key == null || !(key in instance)) return;

	let value = instance[key];

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
