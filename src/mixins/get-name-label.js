import _ from 'underscore';
import common from '../functions/common/common';
export default function (Base) {
	return Base.extend({
		getName(opts = {}){
			let options = _.extend({}, opts);
			options.exclude = 'getName';
			options.args = [options];
			return common.getName(this, options);
		},
		getLabel(opts = {}){
			let options = _.extend({}, opts);
			options.exclude = 'getLabel';
			options.args = [options];
			return common.getLabel(this, options);
		},
		getValue(opts = {}){
			let options = _.extend({}, opts);
			options.exclude = 'getValue';
			options.args = [options];
			return common.getValue(this, options);
		}
	});
}

