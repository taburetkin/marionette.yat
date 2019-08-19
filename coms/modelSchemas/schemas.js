import ModelSchema from './ModelSchema';

let typeId = 0;

const schemas = {
	ModelSchema,
	schemas: {
		items: [],
		byName: {},
	},
	find(schema) {
		if (schema == null) return;
		return this.schemas.items.filter(stored => stored === schema)[0];
	},
	findByName(name) {
		if (!name) return;
		let schema = this.schemas.byName[name];
		if (schema) {
			return schema;
		}
	},
	findByType(type) {
		return this.schemas.items.filter(stored => stored.type === type)[0];
	},
	findByInstance(inst) {
		return this.schemas.items.filter(stored => inst instanceof stored.type)[0];
	},
	set(schema) {
		this.schemas.items.push(schema);
		this.schemas.byName[schema.name] = schema;
	},
	get(arg) {
		if (typeof arg === 'string') {
			return this.findByName(arg);
		} else if (typeof arg === 'function') {
			return this.findByType(arg);
		} else {
			return this.findByInstance(arg);
		}
	}
}

function ModelSchemas(type, schema, opts = {}) {
	if (typeof type !== 'string' && typeof type !== 'function') {
		throw new Error('Type must be a string or a function');
	}
	if (arguments.length === 1) {

		return schemas.get(type);

	}

	let sameSchema = schemas.find(schema);
	if (sameSchema) {
		throw new Error('This schema already registered');
	}

	if (schemas.get(type) || (schema.type && schemas.get(schema.type))) {
		throw new Error('Schema with such name/type already registered');
	}

	if (typeof type === 'string') {
		opts.name = type;
	} else {
		opts.type = type;
	}

	if (!opts.name) {
		opts.name = 'schema' + typeId;
		typeId++;
	}


	if (!(schema instanceof schemas.ModelSchema)) {
		schema = new schemas.ModelSchema(schema, opts);
	}

	schemas.set(schema);
}

ModelSchemas.setModelSchemaClass = function(cls) {
	schemas.ModelSchema = cls;
}

export default ModelSchemas;
