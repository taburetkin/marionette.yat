import _ from 'underscore';

function toLabelValues(arg, { swapObjectKeyValues } = {}) {
	if (arg == null) return [];
	if (_.isArray(arg)) {
		return _.map(arg, (value, index) => ({ value, key: value }));
	}
	if (_.isString(arg)) {
		let arr = arg.split(/\s*,\s*/gmi);
		return toLabelValues(arr);
	}
	if (_.isObject(arg)) {
		let mapping = swapObjectKeyValues
			? (value, key) => ({ value, key })
			: (key, value) => ({ value, key })
		return _.map(arg, mapping);
	}
	return [];
}

export function hasFlags(allflags, expected, options = {}) {
	if (allflags == null || expected == null) return false;
	if (_.isNumber(expected)) {
		if (_.isNumber(allflags)) {
			return options.any ? ((allflags & expected) > 0) : ((allflags & expected) == expected); /* eslint-disable-line */
		} else {
			return false;
		}
	}
	let nAll = toLabelValues(allflags, options);
	let nExpected = toLabelValues(expected, options);
	let method = options.any ? 'some' : 'every';
	return _[method](nAll, kv => _.findWhere(nExpected, { value: kv.value }));
}
