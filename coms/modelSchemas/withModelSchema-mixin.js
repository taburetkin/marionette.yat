import schemas from './schemas';
export default Base => Base.extend({
	getSchema(key) {
		if (arguments.length === 0) {
			return schemas(this.schemaName || this.constructor).instanced(this);
		} else if (key != null) {
			return this.getSchema().prop(key);
		}
	},
	display(key) {
		let value = this.get(key);
		let schema = this.getSchema();
		if (!schema) {
			return value;
		}
		return schema.display(key, value, { model: this });
	},
	propertyLabel(key) {
		let schema = this.getSchema();
		if (!schema) {
			return key;
		}
		return schema.getLabel(key, { model: this });
	}
}, {
	schema(props, opts) {
		if (arguments.length == 0) {
			return schemas(this);
		}
		schemas(this, props, opts);
		return this;
	}
});
