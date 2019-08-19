import { isClass, isInstance } from './is-utils';
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

function extractGetOptions(buildOptions = {}) {
	let { getArgs, getOptions } = buildOptions;
	let options = getOptions
		|| _.isArray(getArgs) ? { args: getArgs }
		: void 0;
	return options
}

//#endregion

export function buildItem(arg, buildOptions = {}) {
	if (arg == null) return;

	let { BaseClass, ctorArgs, ctorArgsIndex, context } = buildOptions;

	// if given argument is a function we should call it
	if (_.isFunction(arg) && !isClass(arg, BaseClass)) {

		return buildItem(arg.call(context, ctorArgs, buildOptions, context), buildOptions);

	} else if (isClass(arg, BaseClass)) {
		// if arg is a class, just creating the instance
		return create(arg, ctorArgs);

	} else if (isInstance(arg, BaseClass)) {
		// if arg is an instance of a given BaseClass just return it
		return arg;

	} else if (_.isObject(arg) && arg.class && !arg.build) {
		//if argument is a context and there is no build in it, then trying to operate with it like with context
		let args = normalizeArgs(arg.ctorArgs, ctorArgs, ctorArgsIndex, arg.ctorArgsIndex);
		return create(arg.class, args);

	} else if (_.isFunction(arg.build)) {
		// if context has build, use it
		return arg.buid.call(context, arg, ctorArgs, buildOptions, context);
	} else if (typeof arg == 'string' && buildOptions.buildFromText) {
		return buildOptions.buildFromText(arg, ...buildOptions.ctorArgs);
	}
}

export function buildByKey(context, key, buildOptions = {}) {
	let getOptions = extractGetOptions(buildOptions);
	let arg;
	if (isClass(key, buildOptions.BaseClass)) {
		arg = key;
	} else {
		if (context.getOption) {
			arg = context.getOption(key, getOptions);
		} else {
			arg = context[key];
		}
	}

	if (!buildOptions.context) {
		buildOptions.context = context;
	}
	return buildItem(arg, buildOptions);
}

export function buildInstanceByKey(context, key, buildOptions = {}) {
	if (!buildOptions.ctorArgs) {
		let { keyToCamelCase, defaultOptions, options, optionsKey } = buildOptions;
		if (!optionsKey) {
			optionsKey = keyToCamelCase ? camelCase(key, 'options') : key + 'Options';
		}
		let getOptions = extractGetOptions(buildOptions);
		let contextOptions;
		if (context.getOption) {
			contextOptions = context.getOption(optionsKey, getOptions);
		} else {
			contextOptions = context[optionsKey];
		}
		let instanceOptions = _.extend({}, defaultOptions, contextOptions, options);

		buildOptions.ctorArgs = [instanceOptions];
	}
	return buildByKey(context, key, buildOptions);
}

export function buildViewByKey(context, key, buildOptions = {}) {
	if (!buildOptions.BaseClass) {
		buildOptions.BaseClass = BackboneView;
	}
	return buildInstanceByKey(context, key, buildOptions);
}
