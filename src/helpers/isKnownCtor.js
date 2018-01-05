import _ from 'underscore';
import Bb from 'backbone';
import Mn from 'backbone.marionette';

//console.log('backbone', Bb != null);

const ctors = [
	Bb.Model,
	Bb.Collection,
	Bb.View,
	Bb.Router,
	Mn.Object
];

export default (arg) => {
	return _.isFunction(arg)
	&& _(ctors).some((ctor) => arg === ctor || arg.prototype instanceof ctor);
}