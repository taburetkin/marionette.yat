import _ from 'underscore';
import Bb from 'backbone';
import Mn from 'backbone.marionette';

const knownCtors = [
	Bb.Model,
	Bb.Collection,
	Bb.View,
	Bb.Router,
	Mn.Object
];

function isKnownCtor(arg) {
	let isFn = _.isFunction(arg);
	let result = _(knownCtors).some((ctor) => arg === ctor || arg.prototype instanceof ctor);
	return isFn && result;
}

export default isKnownCtor;
