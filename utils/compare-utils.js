import _ from 'underscore';
import { isModel } from './is-utils';

function stringDirection(str) {
	let desc = str[0] === '-';
	return {
		desc,
		field: desc ? str.substring(1) : str
	}
}

export function compareAB(a, b, func, getArgs) {
	if (arguments.length === 2) {

		if (a < b) return -1;
		if (a > b) return 1;
		return 0;

	} else if (arguments.length > 2) {
		if (_.isArray(func)) {

			let result = 0;

			_(func).every((f) => {
				result = compareAB(a,b,f);
				return result === 0;
			});

			return result;
		} else {
			if (_.isFunction(func)) {
				let argsA = _.isFunction(getArgs) && getArgs(a) || [a];
				let argsB = _.isFunction(getArgs) && getArgs(b) || [b];
				a = func.apply(a, argsA);
				b = func.apply(b, argsB);
			} else if (_.isString(func)) {
				let fldCntx = stringDirection(func);
				if (fldCntx.desc) {
					let x = a;
					a = b;
					b = x;
				}
				a = getFieldValue(a, fldCntx.field);
				b = getFieldValue(b, fldCntx.field);
			}

			if (a < b) return -1;
			if (a > b) return 1;
			return 0;

		}
	} else {
		return 0;
	}
}

function getFieldValue(cntx, field, nested) {
	if (!_.isObject(cntx) || !field) {
		return;
	}
	let chunks = field.split('.');
	let left = chunks.shift();
	let value = isModel(cntx) ? cntx.get(left) : cntx[left];
	if (chunks.length) {
		return getFieldValue(value, chunks.join('.'), true);
	} else {
		return value;
	}
}

function normalizeArgs(arr) {
	if (!_.isArray(arr) || arr.length <= 2 || !arr[2]) {
		return arr;
	}
	let arg = arr[2];
	if (_.isFunction(arg)) {

		return arr;

	} else if (_.isString(arg)) {
		let fields = arg.split(/\s*,\s*/mi);
		if (fields.length > 1) {
			arr[2] = fields;
		}
	}

	return arr;
}

export function compare(...args) {
	let result = 0;
	if (args.length <= 4 && !_.isArray(args[0])) {
		let callArgs = normalizeArgs(args);
		if (!callArgs.multiple) {
			return compareAB.apply(null, callArgs);
		} else {
			return compare.apply(null, callArgs.args);
		}

	} else {

		//for complex cases ([arg1, arg2, compare], [], .... [])
		//each arguments should be an array

		_(args).every((single) => {

			if (!_.isArray(single)) {
				return true;
			}
			let callArgs = normalizeArgs(single);
			if (!callArgs.multiple) {
				result = compareAB.apply(null, callArgs);
			} else {
				result = compare.apply(null, callArgs.args);
			}
			//result = compareAB.apply(null, normalizeArgs(single));
			return result === 0;
		});

		return result;
	}
}

function toComapreArgs(v1, v2, args, getArgs) {
	return _.map(args, arg => {
		if (_.isString(arg) || _.isFunction(arg)) {
			return [v1, v2, arg, getArgs];
		} else if (_.isArray(arg)) {
			if (arg[1]) {
				return [v2, v1, arg[0], getArgs];
			} else {
				return [v1, v2, arg[0], getArgs];
			}
		}
	});
}


export const comparator = function(args, getArgs) {

	!getArgs && (getArgs = v => ([v, v.model]));

	if (!_.isArray(args)) {
		args = [args]
	}


	return (v1, v2) => compare.apply(null, toComapreArgs(v1, v2, args, getArgs));
}


window._ = _;
