import config from './config';
import { Model, Collection, BackboneView } from '../vendors';

export function isInstance(arg, cls) {
	return arg instanceof cls;
}

export function isClass(arg, cls) {
	if (cls && cls.constructor && arg && arg.constructor) {
		return arg === cls || isInstance(arg.prototype, cls);
	} else {
		return false;
	}
}

export function isCtor(arg, ctors) {

	if (!Array.isArray(ctors)) {

		return isClass(arg, ctors);

	} else if (typeof (arg) === 'function') {

		return ctors.some(ctor => isClass(arg, ctor));

	} else {

		return false;

	}

}

export function isKnownCtor(arg) {
	return isCtor(arg, config.knownCtors);
}


export function isCollection(arg) {
	return isInstance(arg, Collection);
}

export function isCollectionClass(arg) {
	return isClass(arg, Collection);
}

export function isModel(arg) {
	return isInstance(arg, Model);
}

export function isModelClass(arg) {
	return isClass(arg, Model);
}

export function isView(arg) {
	return isInstance(arg, BackboneView);
}

export function isViewClass(arg) {
	return isClass(arg, BackboneView);
}

export function isModelOrCollection(arg) {
	return isModel(arg) || isCollection(arg);
}

export function isModelOrCollectionClass(arg) {
	return isModelClass(arg) || isCollectionClass(arg);
}

export function isSimpleValue(arg) {
	if (arg == null) return true;
	let typeofArg = typeof arg;
	if (typeofArg === 'function') return false;
	if (typeofArg !== 'object') return true;
	return typeofArg === 'object' && typeof arg.valueOf() !== 'object';
}
