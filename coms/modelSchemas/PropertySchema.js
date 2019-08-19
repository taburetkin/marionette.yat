import extend from '../../utils/extend';
const PropertySchema = function(options) {
	if (typeof options !== 'object') {
		throw new Error('You must provide options as argument');
	}
	this.options = options;
	this.type = options.type;
	this.name = options.name;
	this.label = options.label;
}
PropertySchema.extend = extend;

PropertySchema.prototype = {
	getOptions(add) {
		return Object.assign({}, this.options, add);
	},
	getOption(key) {
		return this.options[key];
	},
	getLabel() {
		return this.label || this.name;
	},
	getControl() {
		return this.getOption('control');
	},
	display(value, options) {
		let display = this.getOption('display');
		if (typeof display === 'function') {
			return display.call(this, value, options);
		} else {
			return value;
		}
	},
	validate(value, allValues, options) {
		let validate = this.getOption('validate');
		if (typeof validate === 'function') {
			return validate.call(this, value, allValues, options);
		}
	},
}

export default PropertySchema;
