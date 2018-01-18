import common from '../functions/common/common';
export default function (Base) {
	return Base.extend({
		getName(opts = {}){
			options.exclude = 'getName';
			return common.getName(this, options);
		},
		getLabel(opts = {}){
			options.exclude = 'getLabel';
			return common.getLabel(this, options);
		},
		getValue(opts = {}){
			options.exclude = 'getValue';
			return common.getValue(this, options);
		}
	});
}

