import _ from 'underscore';
import { toStateValue } from './utils';

const StateModelMixin = {
	trackChanges: true,
	getEventsModel() {
		return this;
	},
	toggle(key, options) {
		let current = this.get(key);
		this.state(key, !current, options);
	},
	enable(key, options) {
		this.state(key, true, options);
	},
	disable(key, options) {
		this.state(key, false, options);
	},
	prevState(key) {
		return this.state('.' + key);
	},
	state(key, newvalue, options) {
		let attrs;
		if (_.isString(key) && arguments.length == 1) {
			return this.get(key);
		}
		if (_.isObject(key)) {
			attrs = key;
			options = newvalue;
		} else {
			attrs = { [key]: newvalue }
		}

		if ((options && options.trackChanges !== false) || this.trackChanges) {
			_.each(_.keys(attrs), (k) => {
				if (k.startsWith('.')) return;
				attrs['.' + k] = this.get(k);
			});
		}
		this.set(attrs);
		// if (arguments.length == 1) {
		// 	let val = this.get(key);
		// 	return val;
		// } else if (arguments.length >= 2) {
		// 	let prev = this.get(key);
		// 	if ((options && options.trackChanges !== false) || this.trackChanges) {
		// 		this.set({
		// 			['.' + key]: prev,
		// 			[key]: newvalue
		// 		});
		// 	} else {
		// 		this.set({
		// 			[key]: newvalue
		// 		});
		// 	}
		// }
	},
	hasValue(key, strict) {
		if (strict) {
			return this.get(key) != null;
		} else {
			return !!this.get(key);
		}
	},
	toStateValue(key, value) {
		if (arguments.length == 1) {
			value = this.state(key);
		}
		return toStateValue(key, value);
	},
	getStates({ predicate, stateValues = false, onlyValued = true, valuesArray } = {}) {
		if (!predicate && onlyValued) {
			predicate = key => this.hasValue(key);
		} else if (predicate && onlyValued) {
			let givenPredicate = predicate;
			predicate = (key, value) => this.hasValue(key) && givenPredicate(key, value)
		}

		let returnResult = valuesArray ? [] : {};

		return _.reduce(this.attributes, (memo, value, key) => {
			if (key[0] === '.') return memo;
			if (!predicate || predicate(key, value)) {
				let res = stateValues ? toStateValue(key, value) : value;
				if (valuesArray) {
					memo.push(res);
				} else {
					memo[key] = res;
				}
			}
			return memo;
		}, returnResult);
	},
	toString(options = {}) {
		options.stateValues = true;
		let founded = this.getStates(options);
		let vals = _.map(founded, (value) => value);
		return vals.join(options.delimeter || ' ');
	}
}

export default StateModelMixin;
