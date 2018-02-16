/**
* @license
* Marionette.Yat extension for Backbone.Marionette
* Yet Another Toolkit
* ----------------------------------
* v0.0.32
*
* Distributed under MIT license
* author: dimtabu
*/


import Bb from 'backbone';
import Mn from 'backbone.marionette';
import _ from 'underscore';
import $ from 'jquery';

var version = "0.0.32";

var getCompareABModel = function getCompareABModel(arg) {
	if (arg instanceof Bb.Model) return arg;else if (arg instanceof Mn.View) return arg.model;else return;
};
var getCompareABView = function getCompareABView(arg) {
	if (arg instanceof Bb.View) return arg;else return;
};

var compareAB = function compareAB(a, b, func) {
	if (typeof func === 'function') {
		a = func.call(a, getCompareABModel(a), getCompareABView(a));
		b = func.call(b, getCompareABModel(b), getCompareABView(b));
	}
	return a < b ? -1 : a > b ? 1 : 0;
};

/*
*	accepts:
*		variant #1: a, b, function
*		variant #2: [[a,b,function], [a,b,function]]
*		function can be undefined
*		example:
*			ascending	:		return viewComparator(viewA, viewB, function(model, view){ return model && model.get('someTextField') });
*			descending	:		return viewComparator(viewB, viewA, function(model, view){ return model && model.get('someTextField') });
			multiple compares: 	return viewComparator([[viewB, viewA, func], [viewB, viewA, func]])
*/
var viewComparator = function viewComparator() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	var compareArray = [];
	var result = 0;

	if (args.length >= 2) // single compare
		return compareAB.apply(null, args);else if (args.length === 1 && args[0] instanceof Array) // array of compare
		compareArray = args[0];

	_(compareArray).every(function (singleCompare) {
		result = compareAB.apply(null, singleCompare);
		return result === 0;
	});

	return result;
};

var view = { compareAB: compareAB, viewComparator: viewComparator };

function normalizeValue(context, value, args) {
	if (_.isFunction(value)) value = value.apply(context, args || []);
	return value;
}

function smartGet(context) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if (opts.fields == null || opts.fileds && !opts.fileds.length) throw new Error('fields option missing');

	opts.checked || (opts.checked = {});

	if (context == null) return;

	var value = void 0;
	var isModel = context instanceof Bb.Model;
	var hasOptions = _.isObject(context.options);
	var exclude = opts.exclude instanceof Array ? opts.exclude : typeof opts.exclude === 'string' ? [opts.exclude] : [];

	_(opts.fields).some(function (fieldName) {
		if (fieldName in opts.checked) return;
		opts.checked[fieldName] = true;

		if (exclude.indexOf(fieldName) >= 0) {
			return;
		}

		if (isModel && value == null) value = normalizeValue(context, context.get(fieldName), opts.args);

		if (value == null) value = normalizeValue(context, context[fieldName], opts.args);

		if (value == null && hasOptions) value = normalizeValue(context, context.options[fieldName], opts.args);

		return value != null;
	});

	return value == null ? opts.default : value;
}

var getLabel = (function (context) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var fields = ['getLabel', 'label', 'getName', 'name', 'getValue', 'value'];
	opts.fields = fields.concat(opts.fields || []);
	return smartGet(context, opts);
});

var getName = (function (context) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var fields = ['getName', 'name', 'getLabel', 'label', 'getValue', 'value'];
	opts.fields = fields.concat(opts.fields || []);
	return smartGet(context, opts);
});

var getValue = (function (context) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var fields = ['getValue', 'value', 'getId', 'id', 'getName', 'name', 'getLabel', 'label', 'cid'];
	opts.fields = fields.concat(opts.fields || []);
	return smartGet(context, opts);
});

function cid (prefix, value) {
	var delimeter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ':';

	prefix || (prefix = '');
	value = value == null ? '' : value.toString();
	return prefix + delimeter + value;
}

function unwrap (value, prefix) {
	var delimeter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ":";


	if (value == null) return;
	value = value.toString();
	prefix || (prefix = '');
	if (!value.length) return value;

	var pattern = new RegExp('^' + prefix + delimeter);
	return value.replace(pattern, '');
}

function getProperty(context, name) {
	if (context == null || !_.isObject(context) || name == null || name == '') return;
	if (context instanceof Bb.Model) return context.get(name);else return context[name];
}

function setProperty(context, name, value, options) {
	if (context instanceof Bb.Model) {
		context.set(name, value, { silent: true });
	} else {
		context[name] = value;
	}

	if (value instanceof Bb.Model) {
		options.models.push({
			path: options.passPath.join(':'),
			property: name,
			model: value
		});
	}

	options.passPath.push(name);

	return getProperty(context, name);
}

function setByPathArr(context, propertyName, pathArray, value, options) {

	if (context == null || !_.isObject(context) || propertyName == null || propertyName == '') return;

	if (!pathArray.length) return setProperty(context, propertyName, value, options);

	var prop = getProperty(context, propertyName);

	if (!_.isObject(prop) && !options.force) return;else if (!_.isObject(prop) && options.force) prop = setProperty(context, propertyName, {}, options);

	var nextName = pathArray.shift();

	return setByPathArr(prop, nextName, pathArray, value, options);
}

var setByPath = function setByPath(context, path, value, opts) {

	if (context == null || !_.isObject(context) || path == null || path == '') return;

	var options = _.extend({}, opts);
	options.silent = options.silent === true;
	options.force = options.force !== false;

	if (_.isObject(path) && !(path instanceof Array)) {
		value = path.value;
		options.force = path.force !== false;
		options.silent = path.silent === true;
		path = path.path;
	}

	options.path = path;
	options.passPath = [];
	options.models = [];

	if (path == null || path == '') return;

	var pathArray = typeof path === 'string' ? path.split('.') : path instanceof Array ? [].slice.call(path) : [path];

	options.pathArray = [].slice.call(pathArray);

	if (!pathArray.length) return;

	var chunksCount = pathArray.length;
	var prop = pathArray.shift();

	if (context instanceof Bb.Model) {
		options.models.push({
			path: '',
			property: prop,
			model: context
		});
	}

	var result = setByPathArr(context, prop, pathArray, value, options);

	if (result === undefined && value !== undefined) return result;

	//triggering change event on all met models
	if (!options.silent) {
		var originPath = options.pathArray.join(':');
		while (options.models.length) {
			var modelContext = options.models.pop();
			var propertyEventName = modelContext.path == '' ? originPath : originPath.substring(modelContext.path.length + 1);
			if (propertyEventName) {
				modelContext.model.trigger('change:' + propertyEventName, value);
			}
			modelContext.model.trigger('change', modelContext.model);
		}
	}

	return result;
};

function getByPathArray(context, propertyName, pathArray) {

	if (context == null || !_.isObject(context) || propertyName == null || propertyName == '') return;

	var prop = getProperty(context, propertyName);

	if (!pathArray.length || pathArray.length && prop == null) return prop;

	var nextName = pathArray.shift();

	return getByPathArray(prop, nextName, pathArray);
}

function getByPath(obj, path) {

	if (obj == null || !_.isObject(obj) || path == null || path == '') return;

	var pathArray = typeof path === 'string' ? path.split('.') : path instanceof Array ? [].slice.call(path) : [path];

	var prop = pathArray.shift();

	return getByPathArray(obj, prop, pathArray);
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function traverse(fields, root) {
	root = root || '';
	if (this == null || _typeof(this) != 'object') return;

	var hash = this instanceof Bb.Model ? this.attributes : this;
	var props = Object.getOwnPropertyNames(hash);
	for (var x = 0; x < props.length; x++) {
		var name = props[x];
		var prop = this[name];

		if (prop == null || (typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) != 'object' || prop instanceof Date || prop instanceof Array) fields[root + name] = prop;else if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) == 'object') traverse.call(prop, fields, root + name + '.');
	}
}

function flattenObject(obj) {
	if (obj == null || !_.isObject(obj)) return;
	var res = {};
	traverse.call(obj, res);
	return res;
}

function unFlattenObject(obj) {

	if (obj == null || !_.isObject(obj)) return;
	var res = {};
	for (var e in obj) {
		setByPath(res, e, obj[e], true);
	}
	return res;
}

var isView = (function (arg) {
  return arg instanceof Bb.View;
});

// camelCase('asd:qwe:zxc') -> asdQweZxc
// camelCase('asd:qwe:zxc', true) -> AsdQweZxc
function camelCase(text, first) {
	if (!_.isString(text)) return text;
	var splitter = first === true ? /(^|:)(\w)/gi : /(:)(\w)/gi;
	return text.replace(splitter, function (match, prefix, text) {
		return text.toUpperCase();
	});
}

var __ = {
	camelCase: camelCase, getLabel: getLabel, getName: getName, getValue: getValue, wrap: cid, unwrap: unwrap, setByPath: setByPath, getByPath: getByPath, flattenObject: flattenObject, unFlattenObject: unFlattenObject, isView: isView
};

var Functions = { view: view, common: __ };

var knownCtors = [Bb.Model, Bb.Collection, Bb.View, Bb.Router, Mn.Object];

function isKnownCtor(arg) {
	var isFn = _.isFunction(arg);
	var result = _(knownCtors).some(function (ctor) {
		return arg === ctor || arg.prototype instanceof ctor;
	});
	return isFn && result;
}

var YatError = Mn.Error.extend({}, {
	Http400: function Http400(message) {
		return this.Http(400, message);
	},
	Http401: function Http401(message) {
		return this.Http(401, message);
	},
	Http403: function Http403(message) {
		return this.Http(403, message);
	},
	Http404: function Http404(message) {
		return this.Http(404, message);
	},
	Http500: function Http500(message) {
		return this.Http(500, message);
	},
	Http: function Http(status, message) {
		var error = new this({ message: message, name: "HttpError" });
		error.status = status;
		return error;
	},
	HttpRedirect: function HttpRedirect(message) {
		return this.Http(301, message);
	},
	NotFound: function NotFound(message) {
		return this.Http404(message);
	},
	NotAuthorized: function NotAuthorized(message) {
		return this.Http401(message);
	},
	Forbidden: function Forbidden(message) {
		return this.Http403(message);
	}
});

function smartExtend(Src, Dst) {
	if (_.isFunction(Dst)) {
		return Dst(Src);
	} else if (_.isObject(Dst)) {
		return Src.extend(Dst);
	} else throw new YatError('Mixin fail, argument should be an object hash or mixin function');
}

function mix(BaseClass) {
	var Mixed = null;
	if (_.isFunction(BaseClass)) {
		Mixed = BaseClass;
	} else if (_.isObject(BaseClass) && BaseClass !== null) {
		var tmp = function tmp() {};
		tmp.extend = Mn.extend;
		Mixed = tmp.extend(BaseClass);
	} else {
		throw new Error('argument should be an object or class definition');
	}
	if (!Mixed.extend) {
		Mixed = Mn.extend.call(BaseClass, {});
		Mixed.extend = Mn.extend;
	}
	var fake = {
		with: function _with() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return _.reduce(args, function (memo, arg) {
				return smartExtend(memo, arg);
			}, Mixed);
		},
		class: Mixed
	};
	return fake;
}

var GetOptionProperty = (function (Base) {
	var Mixin = Base.extend({
		//property first approach
		getProperty: function getProperty(key, options) {
			return this._getOptionOrProperty(this, key, options, this.getOption);
		},

		//options first approach
		getOption: function getOption(key, options) {
			return this._getOptionOrProperty(this.getProperty('options', { deep: false }), key, options, this.getProperty);
		},
		_getOptionOrProperty: function _getOptionOrProperty(valueContext, key) {
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
			var fallback = arguments[3];

			options.deep !== undefined || (options.deep = true);
			options.force !== undefined || (options.force = true);
			options.args || (options.args = []);

			//key and valueContext should be passed
			if (key == null) return;

			//getting raw value
			var value = valueContext && valueContext[key];

			//if there is no raw value and deep option is true then getting value from fallback
			if (value === undefined && options.deep && _.isFunction(fallback)) {
				var fallbackOptions = _.extend({}, options, { deep: false, force: false });
				value = fallback.call(this, key, fallbackOptions);
			}

			//if returned value is function and is not any of known constructors and options property force set to true 
			//we should return value of that function
			//options.args will be passed as arguments
			if (_.isFunction(value) && options.force && !isKnownCtor(value)) value = value.apply(this, options.args || []);

			//console.log('key', key, value);

			//if value is still undefined we will return default option value
			return value === undefined ? options.default : value;
		}
	});
	return Mixin;
});

var RadioMixin = (function (Base) {
	var Mixin = Base.extend({
		constructor: function constructor() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			Base.apply(this, args);
			var initRadioOnInitialize = !(this.getProperty('initRadioOnInitialize') === true);
			this._initRadio({ skip: initRadioOnInitialize });
		},
		getChannel: function getChannel() {
			if (!this._channel) this._initRadio({ skip: false });
			return this._channel;
		},
		_initRadio: function _initRadio() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { skip: true };

			if (opts.skip == true) return;

			var channelName = this.getProperty('channelName');
			if (!channelName) {
				var channel = this.getProperty('channel');
				if (channel) this.channelName = channel.channelName;
			}
			Mn.Object.prototype._initRadio.call(this);
		},
		radioRequest: function radioRequest() {
			var channel = this.getChannel();
			if (channel) channel.request.apply(channel, arguments);
		},
		radioTrigger: function radioTrigger() {
			var channel = this.getChannel();
			if (channel) channel.trigger.apply(channel, arguments);
		}
	});

	return Mixin;
});

var YatObject = mix(Mn.Object).with(GetOptionProperty, RadioMixin);

/*
	StateEntry = {
		get: fn(view, options),
		set: fn(view, options)
	}

*/

var stateEntries = {
	scrollable: {
		get: function get(view) {
			var result = {};
			view.$('[data-scrollable]').each(function (i, el) {
				var $el = $(el);
				var name = $el.data('scrollable');
				result[name] = {
					top: $el.scrollTop(),
					left: $el.scrollLeft()
				};
			});
			return result;
		},
		set: function set(view) {
			var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			view.$('[data-scrollable]').each(function (i, el) {
				var $el = $(el);
				var name = $el.data('scrollable');
				var stored = state[name];
				if (!isNaN(stored.top)) $el.scrollTop(stored.top);
				if (!isNaN(stored.left)) $el.scrollLeft(stored.left);
			});
		}
	}
};

var stateStore = {};

var Api = YatObject.extend({
	initialize: function initialize(options) {
		this._initStates();
	},
	_initStates: function _initStates() {
		var _this = this;

		this._states = {};
		var states = this.getOption('states');
		_(states).each(function (state, name) {
			if (typeof state === 'string') {
				name = state;
				state = stateEntries[state];
			}
			if (!_this._isStateEntry(state)) return;
			_this._states[name] = state;
		});
	},
	_isStateEntry: function _isStateEntry(arg) {
		return _.isObject(arg) && _.isFunction(arg.get) && _.isFunction(arg.set);
	},
	apply: function apply(view) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		var store = this.getStore(view, options);
		_(this._states).each(function (state, name) {
			state.set(view, store[name], options);
		});
	},
	collect: function collect(view) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		var store = this.getStore(view, options);
		_(this._states).each(function (state, name) {
			store[name] = state.get(view, options);
		});
	},
	getStore: function getStore(view) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		var key = this.getStoreKey(view, options);
		stateStore[key] || (stateStore[key] = {});
		return stateStore[key];
	},
	getStoreKey: function getStoreKey(view) {
		var prefix = this.getOption('storeIdPrefix');
		return (prefix ? prefix + ":" : '') + String(view.id || view.cid);
	}
});

Api.set = function (name, entry) {
	stateEntries[name] = entry;
};
Api.remove = function (name) {
	delete stateEntries[name];
};
Api.clear = function () {
	var keys = _(stateEntries).keys();
	_(keys).each(function (key) {
		return delete stateEntries[key];
	});
};
Api.states = function () {
	return stateEntries;
};
Api.store = function () {
	return stateStore;
};

var Helpers = {
	isKnownCtor: isKnownCtor,
	mix: mix,
	ViewStateApi: Api
};

function GetNameLabel (Base) {
	return Base.extend({
		getName: function getName() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var options = _.extend({}, opts);
			options.exclude = 'getName';
			options.args = [options];
			return __.getName(this, options);
		},
		getLabel: function getLabel() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var options = _.extend({}, opts);
			options.exclude = 'getLabel';
			options.args = [options];
			return __.getLabel(this, options);
		},
		getValue: function getValue() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var options = _.extend({}, opts);
			options.exclude = 'getValue';
			options.args = [options];
			return __.getValue(this, options);
		}
	});
}

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Stateable = (function (BaseClass) {
	var Mixin = BaseClass.extend({
		constructor: function constructor() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			BaseClass.apply(this, args);
			this.initializeStateable();
		},
		initializeStateable: function initializeStateable() {
			this._state = {};
		},
		getState: function getState(key) {
			var state = this._state;
			if (!key) return state;else return state[key];
		},
		setState: function setState(key, value, options) {

			if (key == null) return;

			if (_.isObject(key)) {
				var _this = this;
				options = value;
				value = key;
				_(value).each(function (propertyValue, propertyName) {
					return _this.setState(propertyName, propertyValue, _.extend({}, options, { doNotTriggerFullState: true }));
				});
				this._triggerStateChange(value, options);
			} else {
				var state = this.getState();
				state[key] = value;
				this._triggerStateChange(key, value, options);
			}
		},
		clearState: function clearState() {
			var state = this.getState();
			var broadcast = _.extend({}, state);
			_(state).each(function (s, key) {
				broadcast[key] = undefined;
				delete state[key];
			});
			this._triggerStateChange(broadcast);
		},
		_triggerStateChange: function _triggerStateChange(key, value, options) {

			if (!_.isFunction(this.triggerMethod)) return;

			if (!_.isObject(key)) {
				this.triggerMethod('state:' + key, value, options);
				if (value === true || value === false || !!value && typeof value === 'string') this.triggerMethod('state:' + key + ':' + value.toString(), options);
				if (!options || options && !options.doNotTriggerFullState) {
					this.triggerMethod('state', _defineProperty({}, key, value), options);
				}
			} else {
				//key is a hash of states
				//value is options
				options = value;
				value = key;
				this.triggerMethod('state', value, options);
			}
		}
	});
	Mixin.Stateable = true;

	return Mixin;
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var STATES = {
	INITIALIZED: 'initialized',
	STARTING: 'starting',
	RUNNING: 'running',
	STOPPING: 'stopping',
	WAITING: 'waiting',
	DESTROYED: 'destroyed'
};

var STATE_KEY = 'life';

function workoutArgumentPromises(arg, context) {
	if (arg == null) return [];else if (_.isArray(arg)) {
		var raw = _(arg).map(function (a) {
			if (_.isFunction(a)) return a.call(context, a);else if (_.isObject(a)) return a;
		});
		return _(raw).filter(function (f) {
			return f != null;
		});
	} else if (_.isObject(arg)) {
		return [arg];
	}
}

var LifecycleMixin = {
	set: function set(newstate) {
		this.setState(STATE_KEY, newstate);
	},
	get: function get() {
		return this.getState(STATE_KEY);
	},
	is: function is(state) {
		return this._lifestate.get() === state;
	},
	isIn: function isIn() {
		var _this3 = this;

		for (var _len = arguments.length, states = Array(_len), _key = 0; _key < _len; _key++) {
			states[_key] = arguments[_key];
		}

		return _(states).some(function (state) {
			return _this3._lifestate.is(state);
		});
	},
	isInProcess: function isInProcess() {
		return this._lifestate.isIn(STATES.STARTING, STATES.STOPPING);
	},
	isIdle: function isIdle() {
		return this._lifestate.isIn(STATES.INITIALIZED, STATES.RUNNING, STATES.WAITING);
	}
};

var StartableHidden = {
	setLifecycleListeners: function setLifecycleListeners() {
		var _this4 = this;

		var freezeWhileStarting = this.getProperty('freezeWhileStarting') === true;
		if (freezeWhileStarting) {
			if (_.isFunction(this.freezeUI)) this.on('state:' + STATE_KEY + ':' + STATES.STARTING, function () {
				_this4.freezeUI();
			});
			if (_.isFunction(this.unFreezeUI)) this.on('start start:decline', function () {
				_this4.unFreezeUI();
			});
		}

		this.on('destroy', function () {
			return _this4._lifestate.set(STATES.DESTROYED);
		});
	},
	isIntact: function isIntact() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };

		var message = 'Startable has already been destroyed and cannot be used.';
		var error = new YatError({
			name: 'StartableLifecycleError',
			message: message
		});
		var destroyed = this._lifestate.is(STATES.DESTROYED);
		if (opts.throwError && destroyed) {
			throw error;
		} else if (destroyed) {
			return error;
		}
	},
	isIdle: function isIdle() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };


		var isNotIntact = this._startable.isIntact(opts);

		var message = 'Startable is not idle. current state: ' + this._lifestate.get();
		var error = new YatError({
			name: 'StartableLifecycleError',
			message: message
		});

		var notIdle = this._lifestate.isInProcess();
		if (opts.throwError && notIdle) {
			throw error;
		} else if (isNotIntact) {
			return isNotIntact;
		} else if (notIdle) {
			return error;
		}
	},
	canNotStart: function canNotStart() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };


		var message = 'Startable has already been started.';
		var error = new YatError({
			name: 'StartableLifecycleError',
			message: message
		});
		var notIdle = this._startable.isIdle(opts);
		var allowStartWithoutStop = this.getProperty('allowStartWithoutStop') === true;

		if (!notIdle && allowStartWithoutStop) return;

		var running = this._lifestate.is(STATES.RUNNING);
		if (opts.throwError && running) {
			throw error;
		} else if (notIdle) {
			return notIdle;
		} else if (running) {
			return error;
		}
	},
	canNotStop: function canNotStop() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };


		var message = 'Startable should be in `running` state.';
		var error = new YatError({
			name: 'StartableLifecycleError',
			message: message
		});
		var notIdle = this._startable.isIdle(opts);

		var allowStopWithoutStart = this.getProperty('allowStopWithoutStart') === true;
		if (!notIdle && allowStopWithoutStart) return;

		var running = this._lifestate.is(STATES.RUNNING);

		if (opts.throwError && !running) {
			throw error;
		} else if (notIdle) {
			return notIdle;
		} else if (!running) {
			return error;
		}
	},
	addRuntimePromise: function addRuntimePromise(type, promise) {
		if (promise == null) return;
		var name = '_' + type + 'RuntimePromises';
		this[name] || (this[name] = []);
		this[name].push(promise);
	}
};

var Overridable = {
	freezeWhileStarting: false,
	freezeUI: function freezeUI() {},
	unFreezeUI: function unFreezeUI() {},
	preventStart: function preventStart() {},
	preventStop: function preventStop() {},
	triggerStartBegin: function triggerStartBegin() {},
	triggerBeforeStart: function triggerBeforeStart() {
		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		this.triggerMethod.apply(this, ['before:start'].concat(args));
	},
	triggerStart: function triggerStart() {
		for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
			args[_key3] = arguments[_key3];
		}

		this.triggerMethod.apply(this, ['start'].concat(args));
	},
	triggerStartDecline: function triggerStartDecline() {
		for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
			args[_key4] = arguments[_key4];
		}

		this.triggerMethod.apply(this, ['start:decline'].concat(args));
	},
	triggerStopBegin: function triggerStopBegin() {},
	triggerBeforeStop: function triggerBeforeStop() {
		for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
			args[_key5] = arguments[_key5];
		}

		this.triggerMethod.apply(this, ['before:stop'].concat(args));
	},
	triggerStop: function triggerStop() {
		for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
			args[_key6] = arguments[_key6];
		}

		this.triggerMethod.apply(this, ['stop'].concat(args));
	},
	triggerStopDecline: function triggerStopDecline() {
		for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
			args[_key7] = arguments[_key7];
		}

		this.triggerMethod.apply(this, ['stop:decline'].concat(args));
	}
};

var ProcessEngine = {
	process: function process(context) {
		var _this5 = this;

		if (context == null || !_.isObject(context) || !_.isObject(context.startable)) throw new Error('process context missing or incorrect');

		this.clearRuntimePromises(context);

		//collect all parents promises, instance promises and runtime promises
		var prepare = this.prepare(context);

		var promise = new Promise(function (resolve, reject) {

			context.reject = reject;
			context.resolve = resolve;

			//notify on begin (not before:start)
			_this5.triggerBegin(context);

			//check if a process can be done.
			if (_this5.canNotBeDone(context)) return;

			//check if a process allowed to be done.
			if (_this5.isNotAllowed(context)) return;

			//notify about `before:start` or `before:stop`
			_this5.triggerBefore(context);

			//remember current state and change it to starting or stopping
			_this5.updateState(context);

			//call success or fail callbacks when all promisess resolved
			return prepare.then(function () {
				return _this5.success(context);
			}, function (reason) {
				return _this5.fail(reason, context);
			});
		});
		return promise;
	},
	triggerBegin: function triggerBegin(context) {
		this._executeOnStartable(context.startable, 'trigger:' + context.process + ':begin', context.args);
	},
	canNotBeDone: function canNotBeDone(context) {
		var _this = context.startable._startable;
		var reason = this._executeOnStartable(_this, 'can:not:' + context.process);
		if (!reason) return;

		context.reject(reason);
		return reason;
	},
	isNotAllowed: function isNotAllowed(context) {
		var _this = context.startable;
		var reason = this._executeOnStartable(_this, 'prevent:' + context.process, context.args);
		if (!reason) return;

		context.reject(reason);
		return reason;
	},
	triggerBefore: function triggerBefore(context) {
		this._executeOnStartable(context.startable, 'trigger:before:' + context.process, context.args);
	},
	updateState: function updateState(context) {
		var _this = context.startable;
		context.stateRollback = _this._lifestate.get();
		_this._lifestate.set(context.stateProcess);
	},
	success: function success(context) {

		var _this = context.startable;
		_this._lifestate.set(context.stateEnd);
		context.resolve.apply(context, _toConsumableArray(context.args || []));

		//under question. is it necessary at all
		//this.once('start', (...args) => resolve(...args));

		this._executeOnStartable(context.startable, 'trigger:' + context.process, context.args);
	},
	fail: function fail(reason, context) {

		var _this = context.startable;
		_this._lifestate.set(context.stateRollback);

		var newreason = this._executeOnStartable(context.startable, 'trigger:' + context.process + ':decline', context.args);

		return context.reject(newreason || reason);
	},
	prepare: function prepare(context) {
		if (!context.startable) return;

		var raw = [this.parentPromise(context), this.instancePromise(context), this.runtimePromise(context)];
		var promises = _(raw).filter(function (f) {
			return f != null;
		});
		if (context.skipRuntimePromises) return promises.length ? Promise.all(promises) : undefined;else return Promise.all(promises);
	},
	parentPromise: function parentPromise(context) {
		var _this = context.startable;
		var parent = _.result(_this, 'getParent');
		if (!parent) return;

		var parentContext = {
			startable: parent,
			process: context.process,
			skipRuntimePromises: true
		};
		return this.prepare(parentContext);
	},
	instancePromise: function instancePromise(context) {
		return this._propertyPromise(context.startable, context.process + 'Promises');
	},
	runtimePromise: function runtimePromise(context) {
		if (context.skipRuntimePromises) return;
		return this._propertyPromise(context.startable, '_' + context.process + 'RuntimePromises', 'getProperty');
	},
	clearRuntimePromises: function clearRuntimePromises(context) {
		var _this = context.startable;
		_this['_' + context.process + 'RuntimePromises'] = [];
	},
	_propertyPromise: function _propertyPromise(instance, property) {
		var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'getOption';

		var raw = instance[method](property);
		var promises = workoutArgumentPromises(raw, instance);
		return promises.length ? Promise.all(promises) : undefined;
	},
	_executeOnStartable: function _executeOnStartable(startable, rawmethod) {
		var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

		var method = camelCase(rawmethod);
		return _.isFunction(startable[method]) && startable[method].apply(startable, _toConsumableArray(args));
	}
};

function bindAll(holder, context) {
	context || (context = holder);
	_(holder).each(function (fn, name) {
		if (_.isFunction(fn, name)) {
			holder[name] = _.bind(fn, context);
		}
	});
}

var Startable = (function (Base) {
	var Middle = mix(Base).with(Stateable, Overridable);
	var Mixin = Middle.extend({
		constructor: function constructor() {

			this._startPromises = [];
			this._stopPromises = [];

			for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
				args[_key8] = arguments[_key8];
			}

			Middle.apply(this, args);

			this._initializeStartable();
		},
		start: function start() {
			for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
				args[_key9] = arguments[_key9];
			}

			var context = {
				startable: this,
				process: 'start',
				stateProcess: STATES.STARTING,
				stateEnd: STATES.RUNNING,
				args: args
			};
			return ProcessEngine.process(context);
		},
		stop: function stop() {
			for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
				args[_key10] = arguments[_key10];
			}

			var context = {
				startable: this,
				process: 'stop',
				stateProcess: STATES.STOPPING,
				stateEnd: STATES.WAITING,
				args: args
			};
			return ProcessEngine.process(context);
		},
		restart: function restart() {
			var _this6 = this;

			for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
				args[_key11] = arguments[_key11];
			}

			if (!this.isStarted()) return this.start.apply(this, args);else {
				return this.stop().then(function () {
					return _this6.start.apply(_this6, args);
				});
			}
		},
		isStarted: function isStarted() {
			return this._lifestate.is(STATES.RUNNING);
		},
		isStoped: function isStoped() {
			return this._lifestate.in(STATES.WAITING, STATES.INITIALIZED);
		},
		isInProcess: function isInProcess() {
			return this._lifestate.isInProcess();
		},
		addStartPromise: function addStartPromise(promise) {
			this._startable.addRuntimePromise('start', promise);
		},
		addStopPromise: function addStopPromise(promise) {
			this._startable.addRuntimePromise('stop', promise);
		},


		_lifestate: _.extend({}, LifecycleMixin),
		_startable: _.extend({}, StartableHidden),

		_initializeStartable: function _initializeStartable() {

			if (!(this.constructor.Startable && this.constructor.Stateable)) return;

			bindAll(this._lifestate, this);
			bindAll(this._startable, this);

			this._lifestate.set(STATES.INITIALIZED);
		}
	});

	Mixin.Startable = true;

	return Mixin;
});

var Childrenable = (function (Base) {

	var CHILDREN_FIELD = '_children';

	var Mixin = Base.extend({
		constructor: function constructor() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			Base.apply(this, args);
			this.initializeChildrenable.apply(this, args);
		},
		initializeChildrenable: function initializeChildrenable() {
			var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			this._initializeParrent(options);
			this._initializeChildren(options);
		},
		hasChildren: function hasChildren() {
			var children = this.getChildren();
			return this[CHILDREN_FIELD].length > 0;
		},
		getChildren: function getChildren() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { startable: true };

			var all = this[CHILDREN_FIELD] || [];
			if (!opts.startable) {
				return all;
			} else {
				return all.filter(function (c) {
					return !c.getProperty('preventStart');
				});
			}
		},
		hasParent: function hasParent() {
			var parent = this.getParent();
			return _.isObject(parent);
		},
		getParent: function getParent() {
			return this.getProperty('parent', { deep: false });
		},
		_initializeChildren: function _initializeChildren() {
			var _this = this;

			var _children = this.getProperty('children');
			var children = [];
			_(_children).each(function (child) {

				var childContext = _this._normalizeChildContext(child);
				var initialized = _this._initializeChild(childContext);
				if (initialized) children.push(initialized);
			});
			this[CHILDREN_FIELD] = children;
		},
		_initializeChild: function _initializeChild(childContext) {
			if (childContext == null || !_.isFunction(childContext.Child)) return;

			var Child = childContext.Child;
			var opts = this._normalizeChildOptions(childContext);
			return this.buildChild(Child, opts);
		},
		_normalizeChildContext: function _normalizeChildContext(child) {
			var childContext = {};

			if (_.isFunction(child) && child.Childrenable) {
				_.extend(childContext, { Child: child });
			} else if (_.isFunction(child)) {
				childContext = this._normalizeChildContext(child.call(this));
			} else if (_.isObject(child)) {
				childContext = child;
			}
			return childContext;
		},
		_normalizeChildOptions: function _normalizeChildOptions(options) {
			var opts = _.extend({}, options);
			if (this.getOption('passToChildren') === true) {
				_.extend(opts, this.options);
			}
			opts.parent = this;
			delete opts.Child;
			return this._buildChildOptions(opts);
		},


		_buildChildOptions: function _buildChildOptions(def) {
			return _.extend(def, this.getProperty('childOptions'));
		},

		buildChild: function buildChild(ChildClass, options) {
			return new ChildClass(options);
		},
		_initializeParrent: function _initializeParrent(opts) {
			if (this.parent == null && opts.parent != null) this.parent = opts.parent;
		}
	});

	Mixin.Childrenable = true;

	return Mixin;
});

var templateContextStore = [function (view) {
	return {
		_v: view,
		_m: view.model || {},
		_cid: function _cid(arg) {
			return cid(view.cid, arg);
		}
	};
}];
var compiledContext = {}; //rethink how it can be used
var hasChanges = false;

function normalizeValue$1(value) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	if (_.isFunction(value)) return value.apply(undefined, args);else if (_.isObject(value)) return value;else return {};
}

var GlobalTemplateContext$1 = {
	mix: function mix(viewTemplateContext) {
		for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
			args[_key2 - 1] = arguments[_key2];
		}

		var global = this.get.apply(this, args);
		return _.extend(global, viewTemplateContext);
	},
	get: function get() {
		return this.compile.apply(this, arguments);
	},
	add: function add() {
		var _this = this;

		for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
			args[_key3] = arguments[_key3];
		}

		_(args).each(function (item) {
			return _this.push(item);
		});
	},
	compile: function compile() {
		for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
			args[_key4] = arguments[_key4];
		}

		if (hasChanges) compiledContext = {};

		var newcontext = {};

		_(templateContextStore).each(function (cntx) {
			if (_.isFunction(cntx)) _.extend(newcontext, normalizeValue$1.apply(undefined, [cntx].concat(args)));else if (hasChanges) {
				_.extend(compiledContext, cntx);
			}
		});
		if (!hasChanges) _.extend(newcontext, compiledContext);

		hasChanges = false;
		return newcontext;
	},
	pop: function pop() {
		hasChanges = true;
		return templateContextStore.pop();
	},
	shift: function shift() {
		hasChanges = true;
		return templateContextStore.shift();
	},
	push: function push(item) {
		hasChanges = true;
		templateContextStore.push(item);
	},
	unshift: function unshift(item) {
		hasChanges = true;
		templateContextStore.unshift(item);
	},
	clear: function clear() {
		hasChanges = false;
		compiledContext = {};
		templateContextStore = [];
	}
};

var GlobalTemplateContext = (function (Base) {
	return Base.extend({
		mixinTemplateContext: function mixinTemplateContext() {
			var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


			var templateContext = GlobalTemplateContext$1.mix(_.result(this, 'templateContext'), this);

			return _.extend(target, templateContext);
		}
	});
});

var Mixins = {
	GetNameLabel: GetNameLabel,
	GetOptionProperty: GetOptionProperty,
	Radioable: RadioMixin,
	Stateable: Stateable,
	Startable: Startable,
	Childrenable: Childrenable,
	GlobalTemplateContext: GlobalTemplateContext
};

var BaseBehavior = mix(Mn.Behavior).with(GetOptionProperty);
var Behavior = BaseBehavior.extend({

	listenViewInitialize: true,

	constructor: function constructor() {

		if (this.getProperty('listenViewInitialize') === true) this.on('before:render initialize', _.once(_.partial(this.triggerMethod, 'view:initialize')));

		BaseBehavior.apply(this, arguments);
	},


	getModel: function getModel() {
		return this.view.model;
	},
	cidle: function cidle(name) {
		return __.wrap(this.view.cid, name);
	},
	unCidle: function unCidle(name) {
		return __.unwrap(name, this.view.cid);
	}
});

var BaseDraggable = Behavior.extend({

	triggerEl: undefined, //drag initialization element, if not set equal to view.$el
	moveBeforeStart: 10,
	scope: 'drag',

	getDragEventsContext: function getDragEventsContext() {
		return this.$doc;
	},
	getDragEventsElementSelector: function getDragEventsElementSelector() {
		return '*';
	},
	getTriggerEl: function getTriggerEl() {
		if (this._$el) return this._$el;

		var el = this.getOption('triggerEl');
		if (el == null && this.view.$el) this._$el = this.view.$el;else if (el && el.jquery) this._$el = el;else if (el instanceof HTMLElement) this._$el = $(el);else if (typeof el === 'string' && el.length) this._$el = this.view.$(el);else throw new Error('trigger element should be a DOM or jQuery object or string selector.', el);

		return this._$el;
	},
	isSameScope: function isSameScope(dragging) {
		return dragging.scope === this.scope;
	},
	shouldHandleDomEvents: function shouldHandleDomEvents(dragging) {
		return this.isSameScope(dragging) && this !== dragging;
	},


	constructor: function constructor() {

		this._clearDragData();

		this.$doc = $(document);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		Behavior.apply(this, args);

		this._defineDocumentBindings();
	},
	_clearDragData: function _clearDragData() {
		this._dragData = {};
	},
	_defineDocumentBindings: function _defineDocumentBindings() {
		this.__b = {};
		this.__b.setupDragDetection = _.bind(this._setupDragDetection, this);
		this.__b.handleMouseUp = _.bind(this._handleMouseUp, this);
		this.__b.handleMoveAfterMouseDown = _.bind(this._handleMoveAfterMouseDown, this);
		this.__b.handleDragMove = _.bind(this._handleDragMove, this);
		this.__b.handleElementEnter = _.bind(this._handleElementEnter, this);
		this.__b.handleElementLeave = _.bind(this._handleElementLeave, this);
		this.__b.handleElementOver = _.bind(this._handleElementOver, this);
	},
	onInitialize: function onInitialize() {
		this._initializeDragListener();
	},
	_initializeDragListener: function _initializeDragListener() {
		var $el = this.getTriggerEl();
		$el.one('mousedown', this.__b.setupDragDetection);
	},
	_setupDragDetection: function _setupDragDetection(e) {
		if (this.view.dragDisabled === true) {
			this._initializeDragListener();
			return;
		}

		e.stopPropagation();

		this.$doc.one('mouseup', this.__b.handleMouseUp);

		this._dragData.startX = e.pageX;
		this._dragData.startY = e.pageY;
		this.$doc.on('mousemove', this.__b.handleMoveAfterMouseDown);
	},
	_handleMouseUp: function _handleMouseUp(e) {
		if (this._dragData.dragging) this._handleDragEnd(e);else this._handleEndWithoutDrag(e);

		this._initializeDragListener();
	},
	_handleEndWithoutDrag: function _handleEndWithoutDrag(e) {
		this.$doc.off('mousemove', this.__b.handleMoveAfterMouseDown);
	},
	_handleDragEnd: function _handleDragEnd(e) {
		this._dragData.dragging = false;

		this.$doc.off('mousemove', this.__b.handleDragMove);

		var $context = this.getDragEventsContext();
		$context.off('mouseenter', this.__b.handleElementEnter);
		$context.off('mousemove', this.__b.handleElementOver);

		if (this._dragData.drop && this._dragData.drop.context) {
			this._dragData.drop.context.catchDraggable(this, this._dragData.drop);
			this.triggerMethod('drag:drop', this._dragData.drop);
		}

		this.triggerMethod('drag:end');
	},
	_handleMoveAfterMouseDown: function _handleMoveAfterMouseDown(e) {
		e.stopPropagation();

		var distance = this._getStartPositionPixelOffset(e);
		var startIfMoreThan = this.getOption('moveBeforeStart');
		if (distance >= startIfMoreThan) this._startDragSession();
	},
	_getStartPositionPixelOffset: function _getStartPositionPixelOffset(e) {
		var x = Math.abs(e.pageX - this._dragData.startX);
		var y = Math.abs(e.pageY - this._dragData.startY);
		return x > y ? x : y;
	},
	_startDragSession: function _startDragSession() {
		this._dragData.dragging = true;
		this.$doc.off('mousemove', this.__b.handleMoveAfterMouseDown);

		this.$doc.on('mousemove', this.__b.handleDragMove);

		var $context = this.getDragEventsContext();
		var selector = this.getDragEventsElementSelector();

		$context.on('mouseenter', selector, this.__b.handleElementEnter);

		$context.on('mousemove', selector, this.__b.handleElementOver);

		this.view.triggerMethod('drag:start');
	},
	_handleDragMove: function _handleDragMove(ev) {
		ev.stopPropagation();

		this.triggerMethod('drag', ev);
	},
	_handleElementEnter: function _handleElementEnter(e) {
		var _this = this;

		var $over = $(e.target);

		if (this._dragData.over != $over) {
			this._dragData.over = $over;
			$over.trigger('drag:enter', this);
			$over.one('mouseleave', function () {
				return _this.trigger('drag:leave', _this);
			});
		}
	},
	_handleElementLeave: function _handleElementLeave(e) {
		var $over = $(e.target);
		$over.trigger('drag:leave', this);
	},
	_handleElementOver: function _handleElementOver(e) {
		var $over = $(e.target);
		var event = this._createCustomDomEvent('drag:over', e);
		$over.trigger(event, this);
	},

	_createCustomDomEvent: function _createCustomDomEvent(name, event, merge) {
		if (!merge) merge = ["pageX", "pageY", "clientX", "clientY", "offsetX", "offsetY", "target"];

		var customEvent = jQuery.Event(name);
		_(merge).each(function (prop) {
			return customEvent[prop] = event[prop];
		});

		return customEvent;
	}
});

var DraggableBehavior = BaseDraggable.extend({

	useGhost: true,
	viewCssClass: 'dragging',
	ghostCssClass: 'ghost',

	constructor: function constructor() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		BaseDraggable.apply(this, args);

		this.on('drag', this._onDrag);
		this.on('drag:start', this._onDragStart);
		this.on('drag:end', this._onDragEnd);
	},

	events: {
		'drag:enter': function dragEnter(e, dragging) {
			if (!this.shouldHandleDomEvents(dragging)) return;
		},
		'drag:over': function dragOver(e, dragging) {
			if (!this.isSameScope(dragging)) return;
			e.stopPropagation();

			var newEvent = this._createCustomDomEvent('drag:over', e);

			var parent = this.$el.parent();
			if (parent) parent.trigger(newEvent, [dragging, this]);
		}
	},

	_onDragEnd: function _onDragEnd(ev) {

		if (this.getOption('useGhost')) this._removeGhost();
		if (this.getOption('viewCssClass')) this.view.$el.removeClass(this.getOption('viewCssClass'));

		this._clearDragData();
	},
	_onDragStart: function _onDragStart(ev) {
		if (this.getOption('useGhost')) this._createGhost();
		if (this.getOption('viewCssClass')) this.view.$el.addClass(this.getOption('viewCssClass'));
	},
	_onDrag: function _onDrag(ev) {
		this.setGhostPosition(ev.pageY, ev.pageX);
	},
	_removeGhost: function _removeGhost() {
		this.$ghost.remove();
		delete this.$ghost;
	},
	createGhost: function createGhost() {
		var $g = this.$el.clone();

		var _$el$offset = this.$el.offset(),
		    top = _$el$offset.top,
		    left = _$el$offset.left;

		$g.css({
			top: top + 'px',
			left: left + 'px',
			width: this.$el.outerWidth(),
			height: this.$el.outerHeight()
		});
		return $g;
	},
	_createGhost: function _createGhost() {
		var $g = this.createGhost();
		if ($g.css('position') != 'absolute') $g.css('position', 'absolute');

		var addClasses = this.getOption('ghostCssClass');
		if (addClasses) $g.addClass(addClasses);

		$g.appendTo($('body'));
		this._setGhost($g);
	},
	_setGhost: function _setGhost($g) {
		this.$ghost = $g;
	},
	getGhost: function getGhost() {
		return this.$ghost;
	},
	setGhostPosition: function setGhostPosition(top, left) {

		var $ghost = this.getGhost();
		if (!$ghost) return;

		$ghost.css({
			top: top + 'px',
			left: left + 'px'
		});
	}
});

var DroppableBehavior = Behavior.extend({
	scope: 'drag',
	events: {
		'drag:over': '_onDomDragOver'
	},

	//because of mn 3.5.1 bug of first render isAtached flag
	_skipFirstAttach: true,

	isSameScope: function isSameScope(dragging) {
		return dragging.scope === this.scope;
	},
	getEventXY: function getEventXY(e) {
		return { x: e.pageX, y: e.pageY };
	},
	getChildren: function getChildren() {
		return _(this.view.children._views).filter(function (v) {
			return v.model && v.isRendered() && v.isAttached();
		});
	},
	catchDraggable: function catchDraggable(draggable, dropContext) {
		this._onDrop(draggable, dropContext);
	},


	constructor: function constructor() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		Behavior.apply(this, args);
		this._initReorderBehavior();
	},
	_initReorderBehavior: function _initReorderBehavior() {
		var _this = this;

		this.listenToOnce(this.view, 'render', function () {
			_this.reOrder({ silent: true });
			_this.listenTo(_this.view.collection, 'update', function (collection, options) {
				var changes = (options || {}).changes || {};
				this.reOrder();
			});
		});
	},
	reOrder: function reOrder() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


		this.view.sort();

		var children = this.children = [];
		var skipAttach = this._skipFirstAttach;
		_(this.view.children._views).each(function (view, index) {
			if (!view.model) return;
			view.model.set('order', index);
			if (view.isRendered() && (skipAttach || view.isAttached())) children.push(view);
		});

		this.hasChildren = this.children.length > 0;

		if (options.silent != true && this.view.collection) this.view.collection.trigger('reordered');

		this._skipFirstAttach = false;
	},


	// _triggerChildrenReady(){ this.triggerMethod('children:ready',this); },
	// _onChildrenReady(){
	// 	this._refreshChildren();
	// },
	// _refreshChildren(){

	// 	this.children = this.getChildren();
	// 	this.hasChildren = this.children.length > 0;

	// 	this.view.collection.trigger('reordered', this.view.collection.cid);
	// },


	_onDomDragOver: function _onDomDragOver(e, dragging, child) {
		if (!this.isSameScope(dragging)) return;
		e.stopPropagation();

		if (dragging === child || this.hasChildren && !child) return;

		dragging._dragData.drop || (dragging._dragData.drop = {});
		var storedDrop = dragging._dragData.drop;

		var xy = this.getEventXY(e);

		var drop = this._getDropContext(xy, child);
		drop.context = this;

		var mixedDrop = _.extend({}, storedDrop, drop);
		var keys = _.keys(mixedDrop);
		var hasChanges = _(keys).some(function (k) {
			return storedDrop[k] !== drop[k];
		});
		if (hasChanges) {
			dragging._dragData.drop = drop;
			this._onDropContextChange(dragging, drop);
		}
	},
	_getDropContext: function _getDropContext(xy, child) {

		var children = this.children || [];
		if (!children.length) return { insert: 'before' };

		var $el = child ? child.$el : this.$el;
		var position = this._getPositionByEventXY(xy, $el);
		return this._getDropContextByPosisiton(position, child);
	},
	_getPositionByEventXY: function _getPositionByEventXY(xy, $el) {

		var elOffset = $el.offset();
		var elDimension = { width: $el.outerWidth(), height: $el.outerHeight() };
		var xHalf = elOffset.left + elDimension.width / 2;
		var yHalf = elOffset.top + elDimension.height / 2;
		var r = { x: undefined, y: undefined };

		r.x = xy.x <= xHalf ? 'left' : 'right';
		r.y = xy.y <= yHalf ? 'top' : 'bottom';

		return r;
	},
	_getDropContextByPosisiton: function _getDropContextByPosisiton(position, child) {

		var direction = this.getOption('direction') || 'vertical';

		var insert = direction == 'horizontal' ? position.x == 'left' ? 'before' : 'after' : position.y == 'top' ? 'before' : 'after';

		var childView = undefined;

		if (child) {
			childView = child.view;
		} else {
			childView = insert == 'before' ? this.children[0] : this.children.length && _(this.children).last();
		}

		var index = this.view.children._views.indexOf(childView);

		return {
			insert: insert,
			childView: childView,
			index: index,
			noChild: !child
		};
	},
	_onDropContextChange: function _onDropContextChange(dragging, context) {
		this.triggerMethod('drop:context:change', dragging, context);
	},
	_onDrop: function _onDrop(draggable, dropContext) {
		this.triggerMethod('drop', draggable, dropContext);
	}
});

var DynamicClass = Behavior.extend({
	updateElementClass: function updateElementClass(changeSource) {
		var viewCls = _.result(this.view, 'className') || '';
		var addCls = _.result(this.view, 'dynamicClassName') || '';
		this.$el.attr({
			class: (viewCls + ' ' + addCls).trim()
		});
	},


	refreshOnModelChange: true,
	refreshOnDomChange: false,
	refreshOnViewRefresh: true,
	refreshOnViewBeforeRender: true,
	refreshOnViewRender: false,

	modelEvents: {
		'change': function change() {
			this.getProperty('refreshOnModelChange') && this.updateElementClass('model:change');
		}
	},
	events: {
		'change': function change() {
			this.getProperty('refreshOnDomChange') && this.updateElementClass('dom:change');
		}
	},
	onRefresh: function onRefresh() {
		this.getProperty('refreshOnViewRefresh') && this.updateElementClass('view:refresh');
	},
	onRender: function onRender() {
		this.getProperty('refreshOnViewRender') && this.updateElementClass('view:render');
	},
	onBeforeRender: function onBeforeRender() {
		this.getProperty('refreshOnViewBeforeRender') && this.updateElementClass('view:before:render');
	},
	onRefreshCssClass: function onRefreshCssClass() {
		this.updateElementClass();
	},
	onSetupRefreshCssClass: function onSetupRefreshCssClass(setup) {
		var _this = this;

		if (setup == null || !_.isObject(setup)) return;
		_(setup).each(function (value, property) {
			_this[property] = value === true;
		});
	}
});

function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FormToHash = mix(Behavior).with(Stateable).extend({
	applyDelay: 1, //in ms
	autoApplyToModel: false, //finalize
	autoChangeModel: false, //on every change

	fillFormFromModel: true,

	applySelector: '.apply',
	cancelSelector: '.cancel',
	resetSelector: '.reset',

	initialize: function initialize(opts) {

		this.applyValue = _.debounce(this._applyValue, this.getProperty('applyDelay'));
		this.mergeOptions(opts, ['values']);

		this.extendDefaultValues({});
	},
	extendDefaultValues: function extendDefaultValues(hash) {

		this._values = _.extend(this._values || {}, hash);
	},
	onViewInitialize: function onViewInitialize() {

		//this.extendDefaultValues(this.getProperty('values'));

		var model = this.getModel();
		if (model) {
			this.extendDefaultValues(model.toJSON());
		}
	},
	onRender: function onRender() {

		if (!this.firstRender) {
			this.buildFormBindings();
			this.setState(this._tryFlatValues(this._values));
			this.setValuesToForm(this.getValues({ raw: true }));
		}
		this.firstRender = true;
	},


	//finallizing
	triggers: function triggers() {
		var _ref;

		return _ref = {}, _defineProperty$1(_ref, 'click ' + this.getProperty('applySelector'), 'trigger:apply'), _defineProperty$1(_ref, 'click ' + this.getProperty('cancelSelector'), 'trigger:cancel'), _defineProperty$1(_ref, 'click ' + this.getProperty('resetSelector'), 'trigger:reset'), _ref;
	},
	_tryFlatValues: function _tryFlatValues(raw) {
		return flattenObject(raw);
	},
	_tryUnFlatValues: function _tryUnFlatValues(raw) {
		return unFlattenObject(raw);
	},
	rollbackToDefaultValues: function rollbackToDefaultValues() {
		this.clearState();
		var rawvalues = this._values;
		var values = this._tryFlatValues(rawvalues);
		this.setState(values);
	},
	getValues: function getValues() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var raw = this.getState();
		if (options.raw) return raw;
		var values = this._tryUnFlatValues(raw);
		return values;
	},
	onTriggerApply: function onTriggerApply() {
		this._apply();
	},
	onTriggerCancel: function onTriggerCancel() {
		this._cancel();
	},
	onTriggerReset: function onTriggerReset() {
		this._reset();
	},
	_apply: function _apply() {
		var values = this.getValues();
		this.view.triggerMethod('values:apply', values);
		this._tryChangeModel(values);
	},
	_cancel: function _cancel() {
		this.rollbackToDefaultValues();
		var values = this._getFullHash(this._values);
		this.view.triggerMethod('values:cancel', values);

		this.setValuesToForm(values);
		this._tryChangeModel(values, { clear: true });
	},
	_reset: function _reset() {
		this.clearState();
		var values = this._getFullHash({});
		this.view.triggerMethod('values:reset', values);

		this.setValuesToForm(values);
		this._tryChangeModel(values, { clear: true });
	},
	onState: function onState(state) {
		this._tryChangeModel(state, { type: 'property' });
	},
	_tryChangeModel: function _tryChangeModel(hash) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		var canChangeProp = options.type === 'property' ? 'autoChangeModel' : 'autoApplyToModel';
		var canChange = this.getProperty(canChangeProp) === true;

		if (!canChange) return;
		var model = this.getModel();
		if (!model) return;

		hash = this._tryUnFlatValues(hash);
		if (options.clear === true) model.clear();
		model.set(hash);
	},
	_getFullHash: function _getFullHash() {
		var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var modelHash = this.getModel() && this.getModel().toJSON();
		var full = _.extend({}, this.values, this.mappings, modelHash);
		var res = {};
		_(full).each(function (v, key) {
			return res[key] = undefined;
		});
		return _.extend(res, values);
	},


	//dom manipulations
	buildFormBindings: function buildFormBindings() {
		var _this = this;

		this.mappings = {};
		var tags = ["input", "textarea", "select"];
		this.$("[name]").each(function (i, el) {
			if (tags.indexOf(el.tagName.toLowerCase()) == -1) return;

			var property = _this.unCidle(el.name);
			if (property in _this.mappings) return;

			var info = _this._getElementInfo(el, tags);
			if (info) _this.mappings[property] = info;
		});
		var ext = {};
		_(this.mappings).each(function (context, name) {
			context.values && (ext[name] = context.values);
		});

		this.extendDefaultValues(ext);
	},
	_getElementInfo: function _getElementInfo(el, tags) {
		var context = {
			name: el.name
		};
		var values = void 0;
		var selector = '[name="' + el.name + '"]';
		var $found = this.$(selector);
		if (!$found.length) return;

		if ($found.length > 1) {
			var foundValues = [];
			var isArray = false;
			$found.each(function (i, found) {
				if (tags.indexOf(found.tagName.toLowerCase()) == -1) return;
				var $el = $(found);
				if (found.type != 'checkbox' && found.type != 'radio' || $el.prop('checked')) {
					var val = $el.val();
					isArray || (isArray = found.type === 'checkbox' || val instanceof Array);
					if (val instanceof Array) foundValues = foundValues.concat(val);else foundValues.push($el.val());
				}
			});
			values = !foundValues.length || foundValues.length === 1 && !isArray ? foundValues[0] : foundValues;
		} else {
			values = $found.get(0).type === 'checkbox' ? $found.prop('checked') ? [$found.val()] : [] : $found.val();
		}
		context.values = values;
		context.isArray = values instanceof Array;
		context.$elements = $found;
		return context;
	},
	setValuesToForm: function setValuesToForm(values) {
		var _this2 = this;

		_(values).each(function (propertyValues, propertyName) {
			var property = _this2.mappings[propertyName];
			var $els = property.$elements;
			var arr = propertyValues instanceof Array ? propertyValues : [propertyValues];
			$els.each(function (i, el) {

				_this2._setValueToElement(el, i, arr);
			});
		});
	},
	_setValueToElement: function _setValueToElement(el, index, values) {
		var value = index < values.length && values[index];
		var $el = el.jquery ? el : $(el);
		el = $el.get(0);
		if (el.type === 'checkbox' || el.type === 'radio') {
			$el.prop('checked', values.indexOf($el.val()) >= 0);
		} else {
			$el.val(value);
		}
	},


	// dom listeners
	events: {
		'change': 'domChange',
		'input': 'domInput'
	},
	domChange: function domChange(e) {
		this.applyValue(e.target.name, e.target, e);
	},
	domInput: function domInput(e) {
		this.applyValue(e.target.name, e.target, e);
	},
	_applyValue: function _applyValue(name, el, event) {
		if (el.type == 'checkbox') this._applyCheckboxValue(name, el, event);else this._applySimpleValue(name, el, event);
	},
	_applySimpleValue: function _applySimpleValue(name, el, event) {
		name = this.unCidle(name);
		var $el = $(el);
		this.setState(name, $el.val());
	},
	_applyCheckboxValue: function _applyCheckboxValue(name, el, event) {
		var selector = 'input[type=checkbox][name="' + name + '"]:checked';
		var values = this.$(selector).map(function (i, el) {
			return el.value;
		}).toArray();
		name = this.unCidle(name);
		this.setState(name, values);
	}
});

var Behaviors = { Behavior: Behavior, Draggable: DraggableBehavior, Droppable: DroppableBehavior, DynamicClass: DynamicClass, FormToHash: FormToHash };

var Base = mix(YatObject).with(Stateable);

var Ajax = {

	tokenUrl: '',
	nativeAjax: $.ajax,

	ajax: function ajax() {
		var _this = this;

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return this.ensureToken().then(function () {
			var options = args[0];
			options.headers = _.extend({}, options.headers, _this.getAjaxHeaders());
			return _this.nativeAjax.apply($, args);
		}).catch(function (error) {
			var promise = $.Deferred();
			promise.reject(error);
			return promise;
		});
	},
	tokenXhr: function tokenXhr(url, data) {
		var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'POST';

		return this.nativeAjax({ url: url, data: data, method: method });
	},
	ensureToken: function ensureToken() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var refresh = this.isRefreshNecessary(opts);
		if (!refresh) return Promise.resolve();

		var url = this.getOption('refreshTokenUrl');
		var data = this.getRefreshTokenData();
		return this.requestToken(data, url, { refresh: true });
	},
	requestToken: function requestToken(data, url) {
		var _this2 = this;

		url || (url = this.getOption('tokenUrl'));
		if (!url) return Promise.reject('token url not specified');
		var promise = new Promise(function (resolve, reject) {
			_this2.tokenXhr(url, data).then(function (token) {
				_this2.setToken(token);
				resolve(token);
			}, function (error) {
				if ([400, 401].indexOf(error.status) > -1) {
					_this2.authenticated = false;
					_this2.triggerMethod('token:expired');
					reject(YatError.Http(error.status));
				} else {
					reject(error);
				}
			});
		});
		return promise;
	},
	getAjaxHeaders: function getAjaxHeaders() {
		this._ajaxHeaders || (this._ajaxHeaders = {});
		return _.extend({}, this._ajaxHeaders, this.getOption('ajaxHeader'));
	},
	replaceBackboneAjax: function replaceBackboneAjax() {
		var _this3 = this;

		var token = this.getTokenValue();
		if (!token) Bb.ajax = $.ajax;else Bb.ajax = function () {
			return _this3.ajax.apply(_this3, arguments);
		};
	},
	updateAjaxHeaders: function updateAjaxHeaders() {
		this._ajaxHeaders || (this._ajaxHeaders = {});
		var token = this.getTokenValue();
		var headers = this._ajaxHeaders;
		if (token) {
			headers.Authorization = 'Bearer ' + token;
			headers.Accept = 'application/json';
		} else {
			delete headers.Authorization;
		}
	}
};

var Token = {
	tokenExpireOffset: undefined,
	getToken: function getToken() {
		return this.token;
	},
	getTokenValue: function getTokenValue() {
		var token = this.getToken();
		return token && token.access_token;
	},
	getRefreshTokenData: function getRefreshTokenData() {
		var token = this.getToken() || {};
		return {
			'grant_type': 'refresh_token',
			'refresh_token': token.refresh_token
		};
	},
	getTokenExpires: function getTokenExpires() {
		var token = this.getToken();
		return (token || {}).expires;
	},
	getTokenSeconds: function getTokenSeconds() {
		var expires = this.getTokenExpires();

		if (expires == null || isNaN(expires.valueOf())) {
			console.warn('expires is null or wrong');
			return 0;
		}

		var offset = this.getProperty('tokenExpireOffset');
		if (offset == null) offset = 30000; //30 sec

		var deadline = expires.valueOf() - offset;
		var deadlineMs = deadline - Date.now();
		return deadlineMs > 0 ? deadlineMs / 1000 : 0;
	},
	isRefreshNecessary: function isRefreshNecessary(opts) {

		if (opts.force === true) return true;

		var token = this.getTokenValue();
		if (!token) return false;
		return !this.getTokenSeconds();
	},
	setToken: function setToken(token) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


		this.token = this.parseToken(token, opts);

		this.beforeTokenChange(opts);
		this.triggerMethod('before:token:change', this.token, opts);

		if (opts.silent !== true) this.triggerMethod('token:change', this.token);

		this.afterTokenChange(opts);
		if (opts.identity !== false) this.syncUser(opts);
	},
	parseToken: function parseToken(token) {
		if (token == null) return token;

		if (token != null && _.isObject(token)) token.expires = new Date(Date.now() + token.expires_in * 1000);

		return token;
	},
	beforeTokenChange: function beforeTokenChange(opts) {
		this.updateAjaxHeaders();
		this.replaceBackboneAjax();
	},
	afterTokenChange: function afterTokenChange() {}
};

var Auth = {
	authenticated: false,
	isAuth: function isAuth() {
		return this.authenticated === true;
	},
	isAnonym: function isAnonym() {
		return !this.isAuth();
	},
	isMe: function isMe(value) {
		return value && this.isAuth() && this.me == value;
	},
	setMe: function setMe(value) {
		this.me = value;
	}
};

var User = {
	syncUser: function syncUser(opts) {
		var _this4 = this;

		var user = this.getUser();
		if (!user) {
			this.triggerChange();
			return;
		}
		user.fetch().then(function () {
			_this4.applyUser(user);
		}, function () {
			_this4.syncUserEror();
		});
	},
	syncUserEror: function syncUserEror() {
		this.reset();
	},
	applyUser: function applyUser(user) {
		var id = user == null ? null : user.id;
		this.setMe(id);
		this.authenticated = id != null;
		this.triggerChange();
	},
	getUser: function getUser() {
		return this.user;
	},
	setUser: function setUser(user) {
		this.user = user;
		this.applyUser(user);
	},
	isUser: function isUser() {
		return this.isAuth() && this.user && !!this.user.id;
	}
};

var Identity = mix(YatObject).with(Auth, Ajax, Token, User).extend({
	triggerChange: function triggerChange() {
		this.triggerMethod('change');
	},
	reset: function reset() {
		this.authorized = false;
		var user = this.getUser();
		user.clear();
		this.setToken(null, { identity: false });
		this.applyUser(user);
		this.triggerMethod('reset');
	}
});

var identity = new Identity();

var Region = Mn.Region.extend({
	constructor: function constructor(options) {
		Mn.Region.apply(this, arguments);
		this.mergeOptions(options, ['stateApi']);
		this.stateApi && this._initStateApi();
	},
	_initStateApi: function _initStateApi() {
		this.off('show', this._onStatableShow);
		this.off('before:empty', this._onStatableBeforeEmpty);
		this.on('show', this._onStatableShow);
		this.on('before:empty', this._onStatableBeforeEmpty);
	},
	_onStatableShow: function _onStatableShow(region, view) {
		var api = this.stateApi && _.isFunction(this.stateApi.apply) ? this.stateApi : undefined;
		api && api.apply(view, { region: region });
	},
	_onStatableBeforeEmpty: function _onStatableBeforeEmpty(region, view) {
		var api = this.stateApi && _.isFunction(this.stateApi.collect) ? this.stateApi : undefined;
		api && api.collect(view, { region: region });
	},
	setStateApi: function setStateApi(api) {
		this.stateApi = api;
		this._initStateApi();
	},

	removeView: function removeView(view) {
		var removeBehavior = this.getOption('removeBehavior') || 'destroy';
		if (removeBehavior === 'detach') this.detachView(view);else this.destroyView(view);
	},
	getParentView: function getParentView() {
		return this._parentView;
	}
});

Region.Detachable = function () {
	var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	var detachable = _.extend({}, opts, { removeBehavior: 'detach' });
	return this.extend(detachable);
};

var YatView = mix(Mn.View).with(GlobalTemplateContext, GetOptionProperty).extend({

	instantRender: false,
	renderOnReady: false,

	constructor: function constructor() {

		this._fixRegionProperty();

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		Mn.View.apply(this, args);

		var options = args[0];
		this.mergeOptions(options, ['instantRender', 'renderOnReady', 'triggerReady', 'manualAfterInitialize']);

		if (this.renderOnReady === true) this.once('ready', this.render);
		if (this.instantRender === true && !this.renderOnReady) this.render();else if (this.instantRender === true && this.renderOnReady === true) this.triggerReady();
	},
	_fixRegionProperty: function _fixRegionProperty() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var detachable = this.getProperty('detachableRegion');
		if (detachable == null) detachable = options.detachableRegion === true;

		var stateApi = this.getProperty('stateApi');
		if (stateApi == null) stateApi = options.stateApi;

		var ViewRegion = stateApi ? Region.extend({ stateApi: stateApi }) : Region;
		this.regionClass = detachable ? ViewRegion.Detachable() : ViewRegion;
	},
	triggerReady: function triggerReady() {
		this.trigger('ready', this);
	},
	stateApi: function stateApi() {
		var options = this.getOption('stateApiOptions');
		return new Api(options);
	},
	stateApiOptions: function stateApiOptions() {
		var _this = this;
		return {
			storeIdPrefix: function storeIdPrefix() {
				return _this.getOption('id');
			},
			states: ['scrollable']
		};
	}
});

var YatConfig = YatObject.extend({
	initialize: function initialize(options) {
		this.mergeOptions(options, ['name', 'channelName', 'noRadio']);
		if (this.noRadio !== true && this.channelName == null) this.channelName = name;
	},
	getStore: function getStore() {
		this.store || (this.store = {});
		return this.store;
	},

	radioRequest: {
		get: function get() {
			this.get.apply(this, arguments);
		},
		set: function set(path, value) {
			this.set(path, value);
		}
	},
	get: function get(path) {
		var store = this.getStore();
		var value = getByPath(store, path);
		if (_.isFunction(value)) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			value = value.apply(this, args);
		}

		return value;
	},
	set: function set(path, value) {
		var store = this.getStore();
		var result = setByPath(store, path, value);
		this.triggerSet(path, value);
	},
	triggerSet: function triggerSet(path, value) {
		if (!path) return;
		var arr = path.split('/');
		var radio = this.getChannel();
		do {
			var event = arr.join(':');
			this.triggerMethod(event, value);
			radio && radio.trigger(event, value);
			arr.pop();
		} while (arr.length > 0);
	}
});

function Config (name) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	options.name = name;
	return new YatConfig(options);
}

var config = new Config('yat:modals:singleton', { noRadio: true });

var modalsShowFull = {
	bg: true,
	close: true
};

var modalsShowSimple = {
	bg: false,
	close: false
};

var modalOptionsDefault = {
	closeOnClickOutside: true,
	closeOnPromise: true,
	preventClose: false,
	asPromise: false
};

var modalsCssDefaults = {
	wrapper: 'yat-modal-wrapper',
	bg: 'yat-modal-bg',
	contentWrapper: 'yat-modal-content-wrapper',
	close: 'yat-modal-close',
	header: 'yat-modal-header',
	content: 'yat-modal-content',
	actions: 'yat-modal-actions',
	resolve: 'yat-modal-resolve',
	reject: 'yat-modal-reject'
};

var modalsLabelsDefaults = {
	close: '&times;',
	resolve: 'ok',
	reject: 'cancel'
};

var modalsDefaultModifiers = {
	'after:render': {
		'centering': function centering() {
			var box = this.$('[data-role=modal-content-wrapper]');
			if (!box.length) return;
			var ch = box.outerHeight();
			var wh = $(window).height();
			var dif = (wh - ch) / 3;
			if (dif > 0 && box.length) box.css({
				'margin-top': dif + 'px'
			});
		}
	}
};

var modalsTypes = {
	full: {
		css: modalsCssDefaults,
		show: modalsShowFull,
		labels: modalsLabelsDefaults,
		options: modalOptionsDefault,
		modifiers: modalsDefaultModifiers
	},
	simple: {
		css: modalsCssDefaults,
		show: modalsShowSimple,
		labels: modalsLabelsDefaults,
		options: modalOptionsDefault,
		modifiers: modalsDefaultModifiers
	},
	confirm: {
		css: modalsCssDefaults,
		show: modalsShowFull,
		labels: modalsLabelsDefaults,
		options: {
			closeOnClickOutside: true,
			closeOnPromise: true,
			preventClose: false,
			asPromise: true
		},
		modifiers: modalsDefaultModifiers
	}
};

config.set('types.full', modalsTypes.full);
config.set('types.simple', modalsTypes.simple);
config.set('types.confirm', modalsTypes.confirm);

config.set('defaultShow', modalsShowFull);
config.set('defaultCss', modalsCssDefaults);
config.set('defaultLabels', modalsLabelsDefaults);
config.set('defaultModifiers', modalsDefaultModifiers);

var template = _.template('<% if(show.bg) {%><div <%= css(\'bg\') %> data-role="modal-bg"></div><% } %>\n<div <%= css(\'contentWrapper\') %> data-role="modal-content-wrapper">\n\t<% if(show.close) {%><button  <%= css(\'close\') %> data-role="modal-close"><%= label(\'close\') %></button><% } %>\n\t<% if(show.header) {%><header <%= css(\'header\') %> data-role="modal-header"><%= header %></header><% } %>\n\t<div <%= css(\'content\') %> data-role="modal-content"><%= text %></div>\n\t<% if(show.actions) {%>\n\t<div <%= css(\'actions\') %> data-role="modal-actions">\n\t\t<% if(show.resolve) {%><button <%= css(\'resolve\') %> data-role="modal-resolve"><%= label(\'resolve\') %></button><% } %>\n\t\t<% if(show.reject) {%><button <%= css(\'reject\') %> data-role="modal-reject"><%= label(\'reject\') %></button><% } %>\n\t</div>\n\t<% } %>\n</div>\n');

var ModalView = mix(YatView).with(GetOptionProperty).extend({

	instantRender: true,
	renderOnReady: true,
	template: template,

	attributes: function attributes() {
		return { 'data-role': 'modal-wrapper' };
	},
	initialize: function initialize(options) {
		var _this2 = this;

		this.mergeOptions(options, ['content', 'header', 'text']);

		var _this = this;

		if (this.getOption('asPromise') === true) {
			this.promise = new Promise(function (resolve, reject) {
				_this.once('resolve', function (arg) {
					return resolve(arg);
				});
				_this.once('reject', function (arg) {
					return reject(arg);
				});
			});
		}

		this.once('resolve reject', function (arg, destroying) {
			_this2.preventClose = false;

			if (_this2.getConfigValue('options', 'closeOnPromise') && !destroying) {
				_this2.destroy();
			}
		});

		this.on('all', function (name) {
			return _this2.applyModifiers(name);
		});
	},
	canBeClosed: function canBeClosed() {
		return this.getConfigValue('options', 'preventClose') !== true;
	},
	destroy: function destroy() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


		if (!this.canBeClosed() && opts.force !== true) return;

		return YatView.prototype.destroy.apply(this, arguments);
	},

	ui: {
		'bg': '[data-role="modal-bg"]',
		'contentWrapper': '[data-role="modal-content-wrapper"]',
		'text': '[data-role="modal-content"]',
		'header': '[data-role="modal-header"]',
		'close': '[data-role="modal-close"]',
		'resolve': '[data-role="modal-resolve"]',
		'reject': '[data-role="modal-reject"]'
	},
	triggers: {
		'click @ui.close': { event: 'click:close', stopPropagation: true },
		'click @ui.reject': { event: 'click:reject', stopPropagation: true },
		'click @ui.resolve': { event: 'click:resolve', stopPropagation: true },
		'click @ui.text': { event: 'click:content', stopPropagation: true },
		'click @ui.contentWrapper': { event: 'click:content:wrapper', stopPropagation: true },
		'click @ui.bg': { event: 'click:bg', stopPropagation: true },
		'click': { event: 'click:wrapper', stopPropagation: true }
	},
	regions: {
		'content': '[data-role="modal-content"]'
	},
	onBeforeDestroy: function onBeforeDestroy() {
		this.trigger('reject', this.getProperty('reject'), true);
	},
	onClickClose: function onClickClose() {
		this.destroy();
	},
	onClickResolve: function onClickResolve() {
		this.trigger('resolve', this.getProperty('resolve'));
	},
	onClickReject: function onClickReject() {
		this.trigger('reject', this.getProperty('reject'));
	},
	onClickBg: function onClickBg() {
		this.clickedOutsideOfModal();
	},
	onClickWrapper: function onClickWrapper() {
		this.clickedOutsideOfModal();
	},
	clickedOutsideOfModal: function clickedOutsideOfModal() {
		if (this.getConfigValue('options', 'closeOnClickOutside') === true) this.destroy();
	},
	onBeforeRender: function onBeforeRender() {
		//apply wrapper class here;
		var cfg = this.getConfig();
		cfg.css.wrapper && this.$el.addClass(cfg.css.wrapper);

		this.$el.appendTo($('body'));
	},
	onRender: function onRender() {
		if (this.content instanceof Bb.View) {
			this.content.inModal = this;
			this.showChildView('content', this.content);
		}
		this.applyModifiers('after:render');
	},
	_getModalOptions: function _getModalOptions() {
		var h = {};
		if (this.getOption('closeOnClickOutside') != null) h.closeOnClickOutside = this.getOption('closeOnClickOutside');
		if (this.getOption('closeOnPromise') != null) h.closeOnPromise = this.getOption('closeOnPromise');
		if (this.getOption('preventClose') != null) h.preventClose = this.getOption('preventClose');
		if (this.getOption('asPromise') != null) h.asPromise = this.getOption('asPromise');

		return h;
	},
	getConfigValue: function getConfigValue(section, name) {
		var cfg = this.getConfig() || {};
		return (cfg[section] || {})[name];
	},
	getConfig: function getConfig(key) {
		if (this.config) return this.config;

		var typeName = this.getOption('type') || 'simple';
		var type = _.extend({}, config.get('types.' + typeName) || {});

		type.show = _.extend({}, config.get('dafaultShow'), type.show, this.getOption('show'));
		type.labels = _.extend({}, config.get('defaultLabels'), type.labels, this.getOption('labels'));
		type.css = _.extend({}, config.get('defaultCss'), type.css, this.getOption('css'));
		type.modifiers = _.extend({}, config.get('defaultModifiers'), type.modifiers, this.getOption('modifiers'));
		type.options = _.extend({}, config.get('defaultOptions'), type.options, this._getModalOptions());

		if (type.show.header == null && this.getOption('header')) type.show.header = true;

		if (type.show.resolve == null && (this.getOption('resolve') || type.options.asPromise)) type.show.resolve = true;
		if (type.show.reject == null && this.getOption('reject')) type.show.reject = true;

		if (type.show.actions == null && (type.show.resolve || type.show.reject)) type.show.actions = true;

		return this.config = type;
	},
	applyModifiers: function applyModifiers(name) {
		var _this3 = this;

		var modifiers = this.getConfigValue('modifiers', name);
		_(modifiers).each(function (mod) {
			return _.isFunction(mod) && mod.call(_this3);
		});
	},
	templateContext: function templateContext() {
		var cfg = this.getConfig();
		return {
			css: function css(name) {
				return cfg.css[name] ? ' class="' + cfg.css[name] + '"' : '';
			},
			label: function label(name) {
				return cfg.labels[name] || '';
			},

			show: cfg.show,
			text: this.getOption('text'),
			header: this.getOption('header')
		};
	}
});

var ModalEngine = mix(YatObject).with(Stateable).extend({
	constructor: function constructor() {
		var _this2 = this;

		this.modals = [];

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		YatObject.apply(this, args);
		this.listenForEsc = _.bind(this._listenForEsc, this);
		$(function () {
			_this2.doc = $(document);
			_this2.doc.on('keyup', _this2.listenForEsc);
		});
	},

	channelName: 'modals',

	show: function show() {
		var options = this._normalizeArguments.apply(this, arguments);
		return this._create(options);
	},
	remove: function remove(modal) {

		if (!modal) modal = _.last(this.modals);

		modal && modal.destroy();
	},
	_listenForEsc: function _listenForEsc(e) {
		if (e.keyCode !== 27) return;

		if (this.modals.length) this.remove();
	},
	_create: function _create(options) {
		var modal = new ModalView(options);
		var _this = this;
		this.listenToOnce(modal, 'destroy', function () {
			_this._remove(modal);
		});
		this.modals.push(modal);
		return modal;
	},
	_remove: function _remove(modal) {

		if (!modal) return;

		var ind = this.modals.indexOf(modal);
		if (ind > -1) this.modals.splice(ind, 1);

		this.stopListening(modal);
	},
	_normalizeArguments: function _normalizeArguments() {

		var options = {};
		var len = arguments.length;
		if (!len) return;

		if (len === 1) {
			if (__.isView(arguments.length <= 0 ? undefined : arguments[0])) options.content = arguments.length <= 0 ? undefined : arguments[0];else if (_.isString(arguments.length <= 0 ? undefined : arguments[0])) options.text = arguments.length <= 0 ? undefined : arguments[0];else if (_.isObject(arguments.length <= 0 ? undefined : arguments[0])) _.extend(options, arguments.length <= 0 ? undefined : arguments[0]);
		} else if (len === 2) {
			if (_.isString(arguments.length <= 0 ? undefined : arguments[0]) && _.isString(arguments.length <= 1 ? undefined : arguments[1])) {
				options.header = arguments.length <= 0 ? undefined : arguments[0];
				options.text = arguments.length <= 1 ? undefined : arguments[1];
			} else if (_.isString(arguments.length <= 0 ? undefined : arguments[0]) && __.isView(arguments.length <= 1 ? undefined : arguments[1])) {
				options.header = arguments.length <= 0 ? undefined : arguments[0];
				options.content = arguments.length <= 1 ? undefined : arguments[1];
			} else if (_.isString(arguments.length <= 1 ? undefined : arguments[1]) && __.isView(arguments.length <= 0 ? undefined : arguments[0])) {
				options.header = arguments.length <= 1 ? undefined : arguments[1];
				options.content = arguments.length <= 0 ? undefined : arguments[0];
			} else if (_.isString(arguments.length <= 0 ? undefined : arguments[0]) && _.isObject(arguments.length <= 1 ? undefined : arguments[1])) {
				_.extend(options, arguments.length <= 1 ? undefined : arguments[1]);
				if (__.isView(options.content)) options.header = arguments.length <= 0 ? undefined : arguments[0];else options.text = arguments.length <= 0 ? undefined : arguments[0];
			} else if (__.isView(arguments.length <= 0 ? undefined : arguments[0]) && _.isObject(arguments.length <= 1 ? undefined : arguments[1])) {
				_.extend(options, arguments.length <= 1 ? undefined : arguments[1]);
				options.content = arguments.length <= 0 ? undefined : arguments[0];
			}
		} else {
			if (_.isObject(arguments.length <= 3 ? undefined : arguments[3])) _.extend(options, arguments.length <= 3 ? undefined : arguments[3]);
			if (_.isObject(arguments.length <= 2 ? undefined : arguments[2])) _.extend(options, arguments.length <= 2 ? undefined : arguments[2]);else if (_.isString(arguments.length <= 2 ? undefined : arguments[2])) options.type = arguments.length <= 2 ? undefined : arguments[2];

			var two = this._normalizeArguments(arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1]);
			_.extend(options, two);
		}

		return options;
	},
	onBeforeDestroy: function onBeforeDestroy() {
		if (this.doc) this.doc.off('keyup', this.listenForEsc);
	}
});

var modalEngine = new ModalEngine();

var modals = {
	show: function show() {
		return modalEngine.show.apply(modalEngine, arguments);
	},
	addTypeConfig: function addTypeConfig(name, cfg) {
		if (!name || !_.isString(name)) return;
		config.set('types.' + name, cfg);
	},
	getTypeConfig: function getTypeConfig(name) {
		if (!name || !_.isString(name)) return;
		return config.get('types.' + name);
	}
};

var Singletons = { TemplateContext: GlobalTemplateContext$1, identity: identity, modals: modals };

var Base$1 = mix(Mn.Application).with(GetOptionProperty, RadioMixin, Childrenable, Startable);

var App = Base$1.extend({

	initRadioOnInitialize: true,
	_initRegion: function _initRegion() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { skip: true };

		if (opts.skip) return;
		var region = this.getProperty('region');
		this.region = region;
		Base$1.prototype._initRegion();
	},
	getRegion: function getRegion() {
		if (!this._region) this._initRegion({ skip: false });
		return this._region;
	},
	addPageManager: function addPageManager(pageManager) {
		var _this = this;

		this._pageManagers || (this._pageManagers = []);
		this._pageManagers.push(pageManager);

		this.triggerMethod('add:pageManager', pageManager);
		this.listenTo(pageManager, 'page:start', function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return _this.triggerMethod.apply(_this, ['page:start', pageManager].concat(args));
		});
	},
	hasPageManagers: function hasPageManagers() {
		return this._pageManagers && this._pageManagers.length > 0;
	},
	getLinksCollection: function getLinksCollection() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { rebuild: false };

		if (this._menuTree && !opts.rebuild) return this._menuTree;

		this.createLinksCollection();

		return this._menuTree;
	},
	createLinksCollection: function createLinksCollection() {
		var managers = this._pageManagers || [];
		var links = _(managers).chain().map(function (manager) {
			return manager.getLinks();
		}).flatten().value();
		if (!this._menuTree) this._menuTree = new Bb.Collection(links);else this._menuTree.set(links);
	},
	getCurrentPages: function getCurrentPages() {
		var pages = _(this._pageManagers).map(function (mngr) {
			return mngr.getCurrentPage();
		});
		return _(pages).filter(function (p) {
			return p != null;
		});
	},
	isCurrentPage: function isCurrentPage(page) {
		var current = this.getCurrentPages();
		return current.indexOf(page) > -1;
	},
	getPage: function getPage(key) {
		if (!this.hasPageManagers()) return;
		return _(this._pageManagers).find(function (mngr) {
			return mngr.getPage(key);
		});
	}
});

var Model = Bb.Model.extend({});

Model.extend({
	defaults: {
		url: undefined,
		label: undefined,
		target: '_self',
		level: 0
	},
	destroy: function destroy() {
		this.id = null;
		Model.prototype.destroy.apply(this, arguments);
	}
});

function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* 
	YatPage
*/

var PageLinksMixin = {
	hasLink: function hasLink() {
		return !this.getProperty('skipMenu') && !this.getProperty('preventStart');
	},
	getLink: function getLink(level, index) {
		if (!this.hasLink()) return;
		if (this._linkHash) return this._linkHash;

		var parentId = (this.getParentLink() || {}).id;
		var url = this.getRoute();
		var label = this.getLabel();
		this._linkHash = { id: this.cid, parentId: parentId, url: url, label: label, level: level, index: index };

		return this._linkHash;
	},
	getParentLink: function getParentLink() {
		var parent = this.getParent();
		return parent && parent.getLink && parent.getLink();
	},
	getLinks: function getLinks() {
		var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
		var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

		var link$$1 = this.getLink(level, index);
		if (!link$$1) return [];
		var sublinks = this._getSubLinks(level);
		return [link$$1].concat(sublinks);
	},
	_getSubLinks: function _getSubLinks(level) {
		var children = this.getChildren();
		if (!children || !children.length) return [];
		var sublinks = _(children).filter(function (child) {
			return child.hasLink();
		});
		sublinks = _(sublinks).map(function (child, index) {
			return child.getLinks(level + 1, index);
		});
		return _.flatten(sublinks);
	}
};

var Base$2 = mix(App).with(GetNameLabel, PageLinksMixin);

var YatPage = Base$2.extend({
	constructor: function constructor() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		Base$2.apply(this, args);
		this.initializeYatPage();
	},


	allowStopWithoutStart: true,
	allowStartWithoutStop: true,

	proxyEventsToManager: ['before:start', 'start', 'start:decline', 'before:stop', 'stop', 'stop:decline'],

	initializeYatPage: function initializeYatPage(opts) {
		this.mergeOptions(opts, ["manager"]);
		this._initializeLayoutModels(opts);
		this._initializeRoute(opts);
		this._proxyEvents();
		//this._registerIdentityHandlers();
	},
	getLayout: function getLayout() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { rebuild: false };

		if (!this._layoutView || opts.rebuild || this._layoutView && this._layoutView.isDestroyed && this._layoutView.isDestroyed()) {
			this.buildLayout();
		}
		return this._layoutView;
	},
	prepareForStart: function prepareForStart() {},
	buildLayout: function buildLayout() {
		var Layout = this.getProperty('Layout');
		if (Layout == null) return;
		var opts = _.extend({}, this.getProperty('layoutOptions'));

		if (this.model && !opts.model) _.extend(opts, { model: this.model });

		if (this.collection && !opts.collection) _.extend(opts, { collection: this.collection });

		var options = this.buildLayoutOptions(opts);
		options.page = this;
		this._layoutView = new Layout(options);
		return this._layoutView;
	},
	buildLayoutOptions: function buildLayoutOptions(rawOptions) {
		return rawOptions;
	},
	addModel: function addModel(model) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		if (!model) return;
		this.model = model;
		var fetch = opts.fetch || this.getOption('fetchModelOnAdd');
		if (fetch === undefined) {
			fetch = this.getProperty('fetchDataOnAdd');
		}
		if (fetch === true) {
			this.addStartPromise(model.fetch(opts));
		}
	},
	addCollection: function addCollection(collection) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		if (!collection) return;
		this.collection = collection;
		var fetch = opts.fetch || this.getOption('fetchCollectionOnAdd');
		if (fetch === undefined) {
			fetch = this.getProperty('fetchDataOnAdd');
		}
		if (fetch === true) {
			this.addStartPromise(collection.fetch(opts));
		}
	},


	freezeWhileStarting: true,
	freezeUI: function freezeUI() {},
	unFreezeUI: function unFreezeUI() {},
	getRouteHash: function getRouteHash() {

		var hashes = [{}, this._routeHandler].concat(this.getChildren({ startable: false }).map(function (children) {
			return children.getRouteHash();
		}));
		return _.extend.apply(_, _toConsumableArray$1(hashes));
	},
	hasRouteHash: function hasRouteHash() {
		return _.isObject(this.getRouteHash());
	},
	_initializeRoute: function _initializeRoute() {
		var route = this.getRoute({ asPattern: true });
		if (route == null) return;
		var page = this;
		this._routeHandler = _defineProperty$2({}, route, {
			context: page,
			action: function action() {
				return page.start.apply(page, arguments);
			}
		});
	},
	getRoute: function getRoute() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { asPattern: false };

		var relative = this.getProperty('relativeRoute');
		var route = this.getProperty('route');
		var parent = this.getParent();
		if (route == null) return;

		var result = route;

		if (relative && parent && parent.getRoute) {
			var parentRoute = parent.getRoute();
			result = parentRoute + '/' + route;
		}

		return this._normalizeRoute(result, opts);
	},
	_normalizeRoute: function _normalizeRoute(route, opts) {
		route = route.replace(/\/+/gmi, '/').replace(/^\//, '');
		if (opts.asPattern) {
			return route;
		} else {
			var res = route.replace(/\(\/\)/gmi, '/').replace(/\/+/gmi, '/');
			return res;
		}
	},
	_initializeLayoutModels: function _initializeLayoutModels() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		this.addModel(opts.model, opts);
		this.addCollection(opts.collection, opts);
	},
	_proxyEvents: function _proxyEvents() {
		var proxyContexts = this._getProxyContexts();
		this._proxyEventsTo(proxyContexts);
	},
	_getProxyContexts: function _getProxyContexts() {
		var rdy = [];
		var manager = this.getProperty('manager');
		if (manager) {
			var allowed = this.getProperty('proxyEventsToManager');
			rdy.push({ context: manager, allowed: allowed });
		}
		var radio = this.getChannel();
		if (radio) {
			var _allowed = this.getProperty('proxyEventsToRadio');
			rdy.push({ context: radio, allowed: _allowed });
		}
		return rdy;
	},
	_proxyEventsTo: function _proxyEventsTo(contexts) {
		var all = [];
		var eventsHash = {};

		_(contexts).each(function (context) {
			if (!context.allowed) all.push(context.context);else {
				_(context.allowed).each(function (allowed) {
					eventsHash[allowed] || (eventsHash[allowed] = []);
					eventsHash[allowed].push(context.context);
				});
			}
		});
		var page = this;
		page.on('all', function (eventName) {
			for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
				args[_key2 - 1] = arguments[_key2];
			}

			var contexts = eventName in eventsHash ? eventsHash[eventName] : all;
			var triggerArguments = [page].concat(args);
			_(contexts).each(function (context) {
				return context.triggerMethod.apply(context, ['page:' + eventName].concat(_toConsumableArray$1(triggerArguments)));
			});
		});
	},


	_buildChildOptions: function _buildChildOptions(def) {
		var add = {};
		var manager = this.getProperty('manager');
		if (manager) add.manager = manager;
		return _.extend(def, this.getProperty('childOptions'), add);
	}

});

var Base$3 = mix(App).with(GetNameLabel);

var YatPageManager = Base$3.extend({
	constructor: function constructor() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		Base$3.apply(this, args);
		this._initializeYatPageManager.apply(this, args);
	},
	_initializeYatPageManager: function _initializeYatPageManager() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		this.mergeOptions(opts, ['id', 'name', 'label']);
		this._registerPageHandlers(opts);
		this._registerIdentityHandlers();
		this.createRouter();
	},


	throwChildErrors: true,
	createRouter: function createRouter() {
		this._routesHash = this._prepareRouterHash();
		var options = this._prepareRouterOptions(this._routesHash);
		var router = new Mn.AppRouter(options);
		this.setRouter(router);
	},
	_prepareRouterHash: function _prepareRouterHash() {
		var children = this.getChildren({ startable: false });
		var hash = {};
		_(children).each(function (page) {
			if (_.isFunction(page.getRouteHash)) {
				_.extend(hash, page.getRouteHash());
			}
		});
		return hash;
	},
	_prepareRouterOptions: function _prepareRouterOptions(hash) {
		var _this = this;

		var appRoutes = {};
		var controller = {};
		_(hash).each(function (handlerContext, key) {
			appRoutes[key] = key;
			controller[key] = function () {
				for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
					args[_key2] = arguments[_key2];
				}

				_this.startPage.apply(_this, [handlerContext.context].concat(args));
			};
		});
		return { appRoutes: appRoutes, controller: controller };
	},
	startPage: function startPage(page) {
		var _this2 = this;

		this.routedPage = page;

		for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
			args[_key3 - 1] = arguments[_key3];
		}

		page.start.apply(page, args).catch(function (error) {
			if (_this2.getProperty('throwChildErrors') === true) {
				throw error;
			}
			var postfix = error.status ? ':' + error.status.toString() : '';
			var commonEvent = 'error';
			var event = commonEvent + postfix;
			_this2.triggerMethod(commonEvent, error, page);
			event != commonEvent && _this2.triggerMethod(event, error, page);
		});
	},
	restartRoutedPage: function restartRoutedPage() {
		this.routedPage && this.startPage(this.routedPage);
	},
	setRouter: function setRouter(router) {
		this.router = router;
	},
	getRouter: function getRouter() {
		return this.router;
	},
	getLinks: function getLinks() {
		var children = this.getChildren();
		if (!children) return [];
		return _(children).chain().map(function (child) {
			return child.getLinks();
		}).filter(function (child) {
			return !!child;
		}).flatten().value();
	},
	execute: function execute(route) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { silent: true };

		var page = this.getPage(route);
		if (page) page.start(opts);else throw new YatError.NotFound('Route not found');
	},
	navigate: function navigate(url) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { trigger: true };


		var router = this.getRouter();
		if (router) router.navigate(url, opts);else console.warn('router not found');
	},
	getPage: function getPage(key) {

		var found = _(this._routesHash).find(function (pageContext, route) {
			if (route === key) return true;
			if (pageContext.context.getName() === key) return true;
		});
		return found && found.context;
	},
	getCurrentPage: function getCurrentPage() {
		return this.getState('currentPage');
	},
	isCurrentPage: function isCurrentPage(page) {
		var current = this.getCurrentPage();
		return page === current;
	},
	navigateToRoot: function navigateToRoot() {
		var current = this.getState('currentPage');
		var rootUrl = this.getProperty('rootUrl');
		if (!rootUrl) {
			var children = this.getChildren();
			if (children && children.length) {
				var root = children.find(function (child) {
					return child != current;
				});
				rootUrl = root && root.getRoute();
			}
		}
		if (rootUrl != null) this.navigate(rootUrl);else console.warn('root page not found');
	},


	_buildChildOptions: function _buildChildOptions(def) {
		return _.extend(def, this.getProperty('childOptions'), {
			manager: this
		});
	},

	_registerPageHandlers: function _registerPageHandlers() {
		this.on('page:before:start', this._pageBeforeStart);
		this.on('page:start', this._pageStart);
		this.on('page:start:decline', this._pageDecline);
	},
	_pageBeforeStart: function _pageBeforeStart(page) {
		var current = this.getState('currentPage');
		if (current && current != page) {
			current.stop();
		}
	},
	_pageStart: function _pageStart(page) {

		this.setState('currentPage', page);
		//this.triggerMethod('page:start', page, ...args)
	},
	_pageDecline: function _pageDecline() {},
	_registerIdentityHandlers: function _registerIdentityHandlers() {
		this.listenTo(identity, 'change', this._restartOrGoToRoot);
		this.listenTo(identity, 'token:expired', this.tokenExpired);
	},
	_restartOrGoToRoot: function _restartOrGoToRoot() {
		if (!this.routedPage) return;

		if (!this.routedPage.getProperty('preventStart')) this.restartRoutedPage();else this.navigateToRoot();
	},
	tokenExpired: function tokenExpired() {
		this.restartRoutedPage();
	}
});

var YatCollectionView = mix(Mn.NextCollectionView).with(GlobalTemplateContext);

var Collection = Bb.Collection.extend({});

var CollectionGroups = YatObject.extend({

	collection: undefined,
	groupBy: undefined,

	getGroups: function getGroups() {
		return this.groups;
	},
	getGroup: function getGroup(name) {
		var groups = this.getGroups();
		return groups[name];
	},
	isGroupExists: function isGroupExists(name) {
		return name in this.getGroups();
	},
	addGroup: function addGroup(name, models) {
		if (this.isGroupExists(name)) return;
		var groups = this.getGroups();
		groups[name] = this._createGroup(name, models);
		return groups[name];
	},
	removeGroup: function removeGroup(name) {
		var group = this.getGroup(name);

		if (!group) return;

		if (_.isFunction(group.destroy)) group.destroy();else if (_.isFunction(group.stopListening)) group.stopListening();

		delete this.groups[name];
	},
	group: function group() {
		var result = {};
		var colGroups = this.collection.groupBy(this.groupBy);
		var optionGroups = this.getOption('groups');
		_(optionGroups).each(function (name) {
			if (name in colGroups) {
				result[name] = colGroups[name];
				delete colGroups[name];
			} else result[name] = [];
		});
		_(colGroups).each(function (models, name) {
			return result[name] = models;
		});
		return result;
	},


	constructor: function constructor(options) {
		YatObject.apply(this, arguments);
		this._initializeGrouppedCollection(options);
	},
	_initializeGrouppedCollection: function _initializeGrouppedCollection(options) {
		if (this._initializedGC == true) return;

		this.mergeOptions(options, ['collection', 'groupBy']);
		this._ensureOptions();
		this._initializeGroups();
		this._initializeEventHandlers();

		this._initializedGC == true;
	},
	_ensureOptions: function _ensureOptions() {
		if (!this.collection) throw new Error('collection must be set');

		if (!this.groupBy) throw new Error('groupBy must be set');

		if (typeof this.groupBy === 'string') {
			var propertyName = this.getOption('groupBy');
			this.groupBy = function (model) {
				return model.get(propertyName);
			};
		}
	},
	_initializeGroups: function _initializeGroups() {
		var _this = this;

		this.groups = {};
		var groups = this.group();
		_(groups).each(function (models, name) {
			return _this.addGroup(name, models);
		});
	},
	_getCollectionClass: function _getCollectionClass() {
		return this.getOption('CollectionClass') || Collection;
	},
	_createGroup: function _createGroup(name, models) {
		var groupBy = this.groupBy;
		var Collection$$1 = this._getCollectionClass();
		var groupCol = new Collection$$1(models);
		groupCol.on('change', function (model) {
			if (groupBy(model) !== name) groupCol.remove(model);
		});
		groupCol.name = name;
		return groupCol;
	},
	_initializeEventHandlers: function _initializeEventHandlers() {
		this.listenTo(this.collection, 'update', this._onCollectionUpdate);
	},
	_onCollectionUpdate: function _onCollectionUpdate(col, opts) {
		var _this2 = this;

		var data = (opts.changes.added || []).concat(opts.changes.merged || []);

		var toAdd = _(data).groupBy(this.groupBy);
		var toRemove = _(opts.changes.removed).groupBy(this.groupBy);

		var groups = this.groups;
		_(toAdd).each(function (models, groupName) {
			if (groupName in groups) groups[groupName].add(models);else if (_this2.getOption('autoCreateNewGroups')) _this2.addGroup(groupName, models);
		});

		_(toRemove).each(function (models, groupName) {
			if (groupName in groups) groups[groupName].remove(models);
		});
	},
	_onModelChange: function _onModelChange(model) {
		var groupName = this.groupBy(model);
		if (this.groups[groupName]) this.groups[groupName].add(model);else {
			console.warn('model is out of groupping', model, groupName);
		}
	},
	destroy: function destroy() {

		_(this.groups).each(function (group) {
			group.stopListening();
			if (_.isFunction(group.destroy)) group.destroy();
		});
		delete this.groups;

		if (_.isFunction(YatObject.prototype.destroy)) YatObject.prototype.destroy.apply(this, arguments);

		if (_.isFunction(this.collection.destroy)) this.collection.destroy();

		delete this.collection;
	}
});

var marionetteYat = {
	VERSION: version,
	Functions: Functions,
	Helpers: Helpers,
	Mixins: Mixins,
	Behaviors: Behaviors,
	Singletons: Singletons,
	TemplateContext: GlobalTemplateContext$1,
	modals: modals,
	identity: identity,
	createConfig: Config,
	Object: YatObject,
	Error: YatError,
	App: App,
	Page: YatPage,
	PageManager: YatPageManager,
	View: YatView,
	CollectionView: YatCollectionView,
	Region: Region,
	Model: Model,
	Collection: Collection,
	CollectionGroups: CollectionGroups
};

export default marionetteYat;
//# sourceMappingURL=marionette.yat.esm.js.map
