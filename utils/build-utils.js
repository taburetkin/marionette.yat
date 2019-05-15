import { isClass, isInstance, isViewClass } from './is-utils';
import camelCase from './camelCase';
import { BackboneView } from '../vendors';
import _ from 'underscore';

//#region helpers

function create(InstanceClass, args) {
	if (args == null) {
		return new InstanceClass();
	} else if (_.isArray(args)) {
		return new InstanceClass(...args);
	} else {
		return new InstanceClass(args);
	}
}

function merge(v1, v2) {
	if (v1 != null && v2 != null) {
		if (_.isObject(v1) && _.isObject(v2)) {
			return _.extend({}, v1, v2);
		} else {
			return v2;
		}
	}
	return v2 || v1;
}

function normalizeArgs(ownArgs, cmnArgs, cmnArgsIndex = 0, ownArgsIndex = 0) {
	if (cmnArgs == null && ownArgs == null) {

		return;

	} else if (cmnArgs != null && ownArgs != null) {

		if (_.isArray(ownArgs) && _.isArray(cmnArgs)) {
			let len = _.max([ownArgs.length, cmnArgs.length]);
			let args = [];
			for (let x = 0; x < len; x++) {
				args[x] = merge(ownArgs[x], cmnArgs[x]);
			}
			return args;

		} else if (_.isArray(ownArgs) && !_.isArray(cmnArgs)) {
			let arr = [];
			arr[cmnArgsIndex] = cmnArgs;
			return normalizeArgs(ownArgs, arr);

		} else if (!_.isArray(ownArgs) && _.isArray(cmnArgs)) {
			let arr = [];
			arr[ownArgsIndex] = ownArgs;
			return normalizeArgs(arr, cmnArgs);

		} else {
			return merge(ownArgs, cmnArgs);
		}

	} else {

		return ownArgs || cmnArgs;

	}
}

//#endregion

export function buildItem(context, arg, buildOptions = {}) {
	if (arg == null) return;

	let { BaseClass, ctorArgs, ctorArgsIndex } = buildOptions;

	if (_.isFunction(arg) && !isClass(arg, BaseClass)) {

		return buildItem(arg.call(context, context, ctorArgs), buildOptions);

	} else if (isClass(arg, BaseClass)) {

		return create(arg, ctorArgs);

	} else if (isInstance(arg, BaseClass)) {

		return arg;

	} else if (_.isObject(arg) && arg.class) {
		let args = normalizeArgs(arg.ctorArgs, ctorArgs, ctorArgsIndex, arg.ctorArgsIndex);
		return create(arg.class, args);

	} else if (_.isFunction(arg.build)) {
		return arg.buid.call(context, arg, ctorArgs, context);
	}
}


export function buildView(context, arg, { BaseClass, options } = {}) {
	const buildOptions = {
		BaseClass: BaseClass || BackboneView
	}
	if (isViewClass(arg)) {
		buildOptions.BaseClass = arg;
	}
	if (options != null) {
		buildOptions.ctorArgs = [options];
	}
	return buildItem(context, arg, buildOptions);
}

export function buildViewByKey(context, key, { defaultOptions, options, keyToCamelCase = true } = {}) {
	let arg = context.getOption(key);
	let optionsKey = keyToCamelCase ? camelCase(key, 'options') : key + 'Options';
	let viewOptions = _.extend({}, defaultOptions, context.getOption(optionsKey), options);
	return buildView(context, arg, { options: viewOptions});
}
