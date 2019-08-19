import _ from 'underscore';
import getOption from '../utils/getOption';
import { isView } from '../utils/is-utils';

export default {

	getOption(key, options = {}) {
		let args = options.args;
		if (!args && isView(this)) {
			args = [];
			args.push(this.model, this);
			options.args = args;
		}
		return getOption(this, key, options);
	},

	getOptions(...args) {
		let options = {};
		let keys;
		let lastArgument = _.last(args);

		if (lastArgument != null && _.isObject(lastArgument) && !Array.isArray(lastArgument)) {
			options = args.pop();
		}

		if (args.length == 1) {
			if (_.isArray(args[0])) {
				keys = args[0];
			} else {
				keys = [args];
			}
		} else {
			keys = args;
		}

		return _.reduce(keys, (memo, key) => {
			let option = this.getOption(key, options);
			if (option !== void 0 || options.takeUndefined) {
				memo[key] = option;
			}
			return memo;
		}, {});
	}
}
