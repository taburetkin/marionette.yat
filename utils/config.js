import _ from 'underscore';
import BaseClass from '../coms/baseClass';
import * as ctorsNs from '../vendors';

let ctors = _.map(ctorsNs, ctor => ctor);
ctors.unshift(BaseClass);

const config = {
	// for isKnownCtor, user should supply the array of known ctors
	knownCtors: ctors,

	// for mix utility
	mixOptions: {
		mergeObjects: true,
		wrapObjectWithConstructor: true,
	}
};
export default config;
