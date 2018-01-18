import common from '../functions/common/common';
export default function (Base) {
	return Base.extend({
		getName(...args){
			return common.getName(this, ...args);
		},
		getLabel(...args){
			return common.getLabel(this, ...args);
		},
		getValue(...args){
			return common.getValue(this, ...args);
		}
	});
}

