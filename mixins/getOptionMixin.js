import _ from 'underscore';
import getOption from '../utils/getOption';
import { isView } from '../utils/is-utils';

export default {

	getOption(key, options = {}) {
		let args = options.args;
		if (!args && isView(this)) {
			args = [];
			if (this.model) {
				args.push(this.model);
			}
			args.push(this);
		}
		return getOption(this, key, options);
	},
	getOptions(...args) {
		let options;
		let keys;
		if (_.isObject(_.last(args))) {
			options = args.pop();
		}
		if (args.length == 1 && !_.isArray(args)) {
			keys = [args]
		} else {
			keys = args;
		}

		return _.reduce(keys, (memo, key) => {
			memo[key] = this.getOption(key, options);
			return memo;
		}, {});
	}
}
