import _ from 'underscore';
import BaseClass from '../coms/baseClass';
import * as ctorsNs from '../vendors';
import makeReadyUtil from './makeReady';
let ctors = _.reduce(ctorsNs, (memo, ctor) => {
	if (_.isFunction(ctor)) {
		memo.push(ctor);
	}
	return memo;
}, []);
ctors.unshift(BaseClass);

const config = {
	// for isKnownCtor, user should supply the array of known ctors
	knownCtors: ctors,

	// for mix utility
	mixOptions: {
		mergeObjects: true,
		wrapObjectWithConstructor: true,
	},

	// for views which does not support ready
	makeReadyUtil
};
export default config;
