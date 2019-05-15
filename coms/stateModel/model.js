import _ from 'underscore';
import { Model } from '../../vendors';

const toStateValue = function(name, value) {
	if (value === true) {
		return name;
	} else if (value) {
		return value;
	}
}

const StateModel = Model.extend({
	toggle(key) {
		let current = this.get(key);
		this.state(key, !current);
	},
	enable(key) {
		this.state(key, true);
	},
	disable(key) {
		this.state(key, false);
	},
	prevState(key) {
		return this.state('.' + key);
	},
	state(key, newvalue) {
		if (arguments.length == 1) {
			let val = this.get(key);
			return val;
		} else if (arguments.length == 2) {
			let prev = this.get(key);
			this.set({
				['.' + key]: prev,
				[key]: newvalue
			});
		}
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
	find({ predicate, stateValues = false, onlyValued = true } = {}) {
		if (!predicate && onlyValued) {
			predicate = key => this.hasValue(key);
		}
		return _.reduce(this.attributes, (memo, value, key) => {
			if (key[0] === '.') return memo;
			if (!predicate || predicate(key, value)) {
				memo[key] = stateValues ? this.toStateValue(key, value) : value;
			}
			return memo;
		}, {});
	},
	toString(options = {}) {
		options.stateValues = true;
		let founded = this.find(options);
		let vals = _.map(founded, (value) => value);
		return vals.join(options.delimeter || ' ');
	}
});

export default StateModel;
