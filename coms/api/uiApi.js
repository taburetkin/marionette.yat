import { hasFlags } from '../../utils/enum-utils';
let typeCounter = 0;
export const SymbolTypeIndex = Symbol('uiapi-typeindex');

const optionsSymbol = Symbol('options');
export const UiApi = function UiApi(name, method, options, instance) {
	Object.assign(this, options, { method, name });
	Object.defineProperty(this, optionsSymbol, {
		writable: false, iterable: false,
		value: options
	});
	if (instance) {
		this._instance = instance;
	}
}
UiApi.prototype = {
	exec(instance, args = []) {
		if (!this._instance) {
			return this.method.apply(instance, args);
		} else {
			args = [...args];
			args.unshift(instance);
			return this.method.apply(this._instance, args);
		}
	},
	getOptions() {
		return this[optionsSymbol];
	},
	is(arg) {
		return arg == this || this.name.toLowerCase() == (arg || '').toLowerCase();
	},
	toInstance(instance) {
		return new UiApi(this.name, this.method, this[optionsSymbol], instance)
	}
}

const uiApiStore = {
	publicMethods: {}, /* { name: api } */
	typeMethods: {}, /* { [type[SymbolTypeIndex]]: { name: api }} */
	_build(name, method, options) {
		return new UiApi(name, method, Object.assign({}, options));
	},
	_set(store, name, method, options) {
		let builded = this._build(name, method, options);
		store[name] = builded;
	},
	_get(store, key) {
		return store[key];
	},
	set(name, method, options) {
		this._set(this.publicMethods, name, method, options);
	},
	get(name) {
		return this._get(this.publicMethods, name);
	},
	getInstanceMethods(instance, withInheritance) {
		return Object.keys(this.typeMethods).reduce((memo, typeKey, index) => {
			let typeMethods = this.typeMethods[typeKey];
			let type = typeMethods[SymbolTypeIndex];
			if (instance instanceof type) {
				if (withInheritance || (instance.constructor == type)) {
					let methods = Object.keys(typeMethods).map(key => typeMethods[key].toInstance(instance));
					memo.push(...methods);
				}
			}
			return memo;
		}, []);
	},
	getTypeKey(type, create) {
		if (create && !(SymbolTypeIndex in type)) {
			type[SymbolTypeIndex] = typeCounter++;
		}
		return type[SymbolTypeIndex];
	},
	getTypeMethods(type, { create = false, raw = false }) {
		let index = this.getTypeKey(type, create);
		let typeMethods = index != null && this.typeMethods[index];
		if (!typeMethods && create && index != null) {
			typeMethods = this.typeMethods[index] = {};
			typeMethods[SymbolTypeIndex] = type;
		}
		if (raw) {
			return typeMethods || {};
		}
		if (!typeMethods) {
			return [];
		}
		return Object.keys(typeMethods).map(key => typeMethods[key]);
	},
	setTypeMethod(type, name, method, options) {
		let typeMethods = this.getTypeMethods(type, { create: true, raw: true });
		let publicApi;
		if (!method) {
			publicApi = this.get(name);
			if (!publicApi) {
				throw new Error('Method not found:' + name);
			}
		}
		if (publicApi) {
			if (options && options.replacePublicOptions !== true) {
				options = Object.assign({}, publicApi.getOptions(), options);
			}
		}
		this._set(typeMethods, name, method, options);
		if (options && options.publicMethod === false && !publicApi) {
			this.set(name, method, options);
		}
	}
}

// function getTypeRawActions(type) {
// 	let raw = uiApiMethods.getTypeMethods(type);
// 	return Object.keys(raw).map(key => raw[key]);
// }

// function getInstanceRawActions(instance, options) {
// 	let indexes = uiApiMethods.getInstanceTypesIndexes(instance, options && options.withInheritance === true);
// 	return indexes.reduce((memo, index) => {
// 		memo.push(getTypeRawActions(index));
// 	}, [])
// }

function normalizeArguments(Model, name, method, options) {
	if (typeof Model === 'string') {
		options = method;
		method = name;
		name = Model;
		Model = void 0;
	}
	if (typeof method !== 'function') {
		options = method;
		method = void 0;
	}
	return { Model, name, method, options };
}

export function addUiApi() {
	let { Model, name, method, options } = normalizeArguments(...arguments);
	if (arguments.length < 2) {
		console.warn('addUiApi called with malformed arguments. method does not registered', name); /* eslint-disable-line */
		return;
	}
	if ((Model == null && method == null) || !name) {
		console.warn('addUiApi failed, Model, method or name not specified', name); /* eslint-disable-line */
		return;
	}
	if (Model) {
		uiApiStore.setTypeMethod(Model, name, method, options);
	} else {
		uiApiStore.set(name, method, options);
	}
}

export function typeApi(Model, hash) {
	Object.keys(hash).forEach(methodName => {
		let val = hash[methodName];
		let method;
		let options;
		if (Array.isArray(val)) {
			method = val[0];
			options = val[1];
		}
		addUiApi(Model, methodName, method, options);
	});
}

export function getInstanceActions(instance, opts) {
	let raw = uiApiStore.getInstanceMethods(instance);
	let { unique, actionFilter } = (opts || {});
	let names = {};
	!actionFilter && (actionFilter = () => true);
	return raw.reduce((memo, action) => {
		if (unique !== false && action.name in names) {
			return memo;
		}
		if (actionFilter(action, opts)) {
			memo.push(action);
		}
		return memo;
	}, []).sort((a1, a2) => a2.order - a1.order);
}

/*
const Model = null;
const method = null;
const options = null;
const instance = null;
addUiApi('add-one-user'); //does nothing
addUiApi('add-one-user', method, options); //stores named api method
addUiApi(Model, 'add-one-user'); //adds named api method with default options to a model;
addUiApi(Model, 'add-one-user', options); //adds named api method with own options to a model;
addUiApi(Model, 'add-one-user', method); //stores named api method if "own" method is false and adds named api method with default options to a model;
addUiApi(Model, 'add-one-user', method, options); //stores named api method and adds named api method with cloned options to a model;
instance.getUiActions({}); // gets ui actions for instance
*/
export const withUiActionsMixin = Base => Base.extend({
	_uiActionFilter(action, options = {}) {
		return ensurePlacement(action, options);
	},
	getUiActions(options = {}) {
		if (!options.actionFilter) {
			options.actionFilter = this._uiActionFilter.bind(this);
		}
		return getInstanceActions(this, options);
	},
	getUiAction(action, options) {
		let actions = this.getUiActions(options);
		return actions.filter(f => f.is(action))[0];
	},
	execUiAction(action, ...args) {
		action = this.getUiAction(action);
		return action && action.exec(this, args);
	},
}, {
	extendDefaultUiActions(hash) {
		this._defaultUiActions = Object.assign({}, this._defaultUiActions, hash);
		return this;
	},
	setUiActions(hash) {
		let typeHash = Object.assign({}, this._defaultUiActions, hash);
		typeApi(this, typeHash);
		return this;
	}
});

function ensurePlacement(action, options) {
	let desiredPlacement = (options || {}).placement;
	let actionPlacement = action.placement;
	if (desiredPlacement == null || actionPlacement == null) return true;
	return hasFlags(actionPlacement, desiredPlacement, { any: true });
}
