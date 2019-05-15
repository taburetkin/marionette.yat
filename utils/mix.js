import _ from 'underscore';
import config from './config';
import extend from './extend';

function createMixinFromObject(arg) {

	let mixedObj = _.clone(arg);
	let ctor = mixedObj.hasOwnProperty('constructor') && _.isFunction(mixedObj.constructor) && mixedObj.constructor;
	let hasConstructor = _.isFunction(ctor);

	return Base => {
		if (hasConstructor) {
			mixedObj.constructor = function mx() {
				Base.apply(this, arguments);
				ctor.apply(this, arguments);
			};
		}
		return Base.extend(mixedObj);
	};
}

function normalizeArguments(args, opts) {
	let raw = {};
	let wrap = opts.wrapObjectWithConstructor == true;
	let merge = opts.mergeObjects == true;
	let mixins = [];
	_(args).each(arg => {

		//if argument is function just put it to mixins array
		//and continue;
		if (_.isFunction(arg)) {
			mixins.push(arg);
			return;
		}

		//if argument is not an object just skip it
		if (!_.isObject(arg)) return;

		//if mergeObjects == false or wrapObjectWithConstructor == true
		//and there is a constructor function
		//converting to a mixin function
		//otherwise extend rawObject
		if (!merge || (wrap && _.has(arg.constructor) && _.isFunction(arg.constructor))) {
			mixins.push(createMixinFromObject(arg));
		} else {
			_.extend(raw, arg);
		}

	});

	//if rawObject is not empty
	//convert it to a mixin function
	//and put it to the begin of mixins array
	if (_.size(raw)) {
		mixins.unshift(createMixinFromObject(raw));
	}

	return mixins;
}

function withMethod(...args) {

	let mixins = normalizeArguments(args, this.options);
	let Mixed = this.class;
	if (!mixins.length) {
		return Mixed;
	} else {
		return _.reduce(mixins, (Memo, ctorMixin) => {
			let mixed = ctorMixin(Memo);
			return mixed;
		}, Mixed);
	}
}


export default function mix(_ctor, options) {

	let opts = _.extend({}, config.mixOptions, options);

	let ctor;

	if (_.isFunction(_ctor)) {

		ctor = _ctor;

	} else if (_.isObject(_ctor)) {
		let b = _.isFunction(_ctor.constructor) && _ctor.constructor;
		ctor = function mx() { b.apply(this, arguments); };
		_.extend(ctor.prototype, _.omit(_ctor,'constructor'));

	} else {

		throw new Error('Mix argument should be a class or a plain object');
	}

	if (!_.isFunction(ctor.extend)) {
		ctor.extend = extend;
	}

	return {
		options: opts,
		with: withMethod,
		class: ctor,
	};
}
