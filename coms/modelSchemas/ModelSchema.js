import extend from '../../utils/extend';
import PropertySchema from './PropertySchema';

const ModelSchema = function(properties, options) {
	if (typeof properties !== 'object') {
		throw new Error('You must provide properties as first argument');
	}
	this.options = options || {};
	this.type = options.type;
	this.name = options.name;
	this._initProps(properties);
}
ModelSchema.extend = extend;

ModelSchema.prototype = {
	PropertySchema,
	getOption(key) {
		return this.options[key];
	},
	_initProps(properties) {
		let keys;
		let get;
		if (Array.isArray(properties)) {
			keys = new Array(properties.length);
			get = (v,i) => ([properties[i], i]);
		} else if (typeof properties === 'object') {
			keys = Object.keys(properties);
			get = v => ([properties[v], v])
		}
		this.properties = keys.reduce((memo, value, _key) => {
			let [prop, key] = get(value, _key);
			if (prop.name == null) {
				if (typeof key === 'string') {
					prop.name = key;
				} else {
					throw new Error('Unable to get property name');
				}
			}
			if (!(prop instanceof this.PropertySchema)) {
				prop = new this.PropertySchema(prop);
			}
			memo[prop.name] = prop;
			return memo;
		}, {});
	},
	prop(name) {
		return this.properties[name];
	},
	getLabel(key, ...rest) {
		let prop = this.prop(key);
		return prop && prop.getLabel(...rest);
	},
	getControl(key, ...rest) {
		let prop = this.prop(key);
		return prop && prop.getControl(...rest);
	},
	display(key, ...rest) {
		let prop = this.prop(key);
		return prop && prop.display(...rest);
	},

	// what is this??
	instanced(instance) {
		return this;
	},
}

export default ModelSchema;
