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


(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('backbone'), require('backbone.marionette'), require('underscore'), require('jquery')) :
	typeof define === 'function' && define.amd ? define(['backbone', 'backbone.marionette', 'underscore', 'jquery'], factory) :
	(global.MarionetteYat = factory(global.Backbone,global.Marionette,global._,global.jQuery));
}(this, (function (Bb,Mn,_,$$1) { 'use strict';

Bb = Bb && Bb.hasOwnProperty('default') ? Bb['default'] : Bb;
Mn = Mn && Mn.hasOwnProperty('default') ? Mn['default'] : Mn;
_ = _ && _.hasOwnProperty('default') ? _['default'] : _;
$$1 = $$1 && $$1.hasOwnProperty('default') ? $$1['default'] : $$1;

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

var __ = {
	getLabel: getLabel, getName: getName, getValue: getValue, wrap: cid, unwrap: unwrap, setByPath: setByPath, getByPath: getByPath, flattenObject: flattenObject, unFlattenObject: unFlattenObject, isView: isView
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

var Helpers = {
	isKnownCtor: isKnownCtor,
	mix: mix
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
			if (key == null || valueContext == null) return;

			//getting raw value
			var value = valueContext[key];

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

var STATES = {
	INITIALIZED: 'initialized',
	STARTING: 'starting',
	RUNNING: 'running',
	STOPPING: 'stopping',
	WAITING: 'waiting',
	DESTROYED: 'destroyed'
};

var STATE_KEY = 'life';

function getPropertyPromise(context, propertyName) {
	var _this2 = this;

	if (context == null || propertyName == null) return;

	var _promises1 = context['_' + propertyName] || [];
	var _promises2 = _.result(context, propertyName) || [];

	var rawPromises = _promises1.concat(_promises2);
	//context[propertyName] || [];

	var promises = [];
	_(rawPromises).each(function (promiseArg) {
		if (_.isFunction(promiseArg)) {
			var invoked = promiseArg.call(_this2);
			if (invoked) promises.push(invoked);
		} else if (promiseArg != null) promises.push(promiseArg);
	});
	return Promise.all(promises.filter(function (f) {
		return f != null;
	}));
}

function addPropertyPromise(context, propertyName, promise) {

	if (context == null || propertyName == null || promise == null) return;

	context[propertyName] || (context[propertyName] = []);

	context[propertyName].push(promise);
}

var Startable = (function (Base) {
	var Middle = mix(Base).with(Stateable);
	var Mixin = Middle.extend({
		constructor: function constructor() {
			this._startRuntimePromises = [];
			this._startPromises = [];
			this._stopPromises = [];

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			Middle.apply(this, args);
			this.initializeStartable();
		},


		freezeWhileStarting: false,
		freezeUI: function freezeUI() {},
		unFreezeUI: function unFreezeUI() {},
		isStartNotAllowed: function isStartNotAllowed() {},
		isStopNotAllowed: function isStopNotAllowed() {},
		isStarted: function isStarted() {
			return this._isLifeState(STATES.RUNNING);
		},
		isStoped: function isStoped() {
			return this._isLifeStateIn(STATES.WAITING, STATES.INITIALIZED);
		},
		addStartPromise: function addStartPromise(promise) {
			addPropertyPromise(this, '_startRuntimePromises', promise);
		},
		addStopPromise: function addStopPromise(promise) {
			addPropertyPromise(this, '_stopPromises', promise);
		},
		initializeStartable: function initializeStartable() {

			if (!(this.constructor.Startable && this.constructor.Stateable)) return;

			this._registerStartableLifecycleListeners();
			this._setLifeState(STATES.INITIALIZED);
		},
		prepareForStart: function prepareForStart() {},
		start: function start() {
			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			var options = args[0];
			var _this = this;
			this.prepareForStart();
			var promise = new Promise(function (resolve, reject) {
				var canNotBeStarted = _this._ensureStartableCanBeStarted();

				if (canNotBeStarted) {
					_this.triggerMethod('start:decline', canNotBeStarted);
					reject(canNotBeStarted);
					return;
				}

				var declineReason = _this.isStartNotAllowed(options);
				if (declineReason) {
					_this.triggerMethod('start:decline', declineReason);
					reject(declineReason);
					return;
				}
				_this.triggerBeforeStart.apply(_this, args);

				var currentState = _this._getLifeState();
				var dependedOn = _this._getStartPromise();
				dependedOn.then(function () {
					_this._tryMergeStartOptions(options);
					_this.once('start', function () {
						return resolve.apply(undefined, arguments);
					});
					_this.triggerStart(options);
				}, function () {
					_this._setLifeState(currentState);
					reject.apply(undefined, arguments);
				});
			});
			return promise;
		},
		triggerBeforeStart: function triggerBeforeStart() {
			for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
				args[_key3] = arguments[_key3];
			}

			this.triggerMethod.apply(this, ['before:start'].concat(args));
		},
		triggerStart: function triggerStart(options) {
			this.triggerMethod('start', options);
		},
		restart: function restart(options) {
			var _this3 = this;

			var canBeStarted = this._ensureStartableCanBeStarted();
			var promise = new Promise(function (resolve, reject) {
				if (_this3.isStarted()) _this3.stop().then(function (arg) {
					return _this3.start().then(function (arg) {
						return resolve(arg);
					}, function (arg) {
						return reject(arg);
					});
				}, function (arg) {
					return reject(arg);
				});else if (_this3.isStoped()) _this3.start().then(function (arg) {
					return resolve(arg);
				}, function (arg) {
					return reject(arg);
				});else reject(new YatError({
					name: 'StartableLifecycleError',
					message: 'Restart not allowed when startable not in idle'
				}));
			});
			return promise;
		},
		stop: function stop() {
			for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
				args[_key4] = arguments[_key4];
			}

			var options = args[0];

			var _this = this;
			var promise = new Promise(function (resolve, reject) {
				var canNotBeStopped = _this._ensureStartableCanBeStopped();

				if (canNotBeStopped) {
					_this.triggerMethod('stop:decline', canNotBeStopped);
					reject(canNotBeStopped);
					return;
				}

				var declineReason = _this.isStopNotAllowed(options);
				if (declineReason) {
					_this.triggerMethod('stop:decline', declineReason);
					reject(declineReason);
					return;
				}

				var currentState = _this._getLifeState();
				var dependedOn = _this._getStopPromise();
				_this.triggerMethod.apply(_this, ['before:stop'].concat(args));
				dependedOn.then(function () {
					_this._tryMergeStopOptions(options);
					_this.once('stop', function () {
						return resolve.apply(undefined, arguments);
					});
					_this.triggerStop(options);
				}, function () {
					_this._setLifeState(currentState);
					reject.apply(undefined, arguments);
				});
			});
			return promise;
		},
		triggerStop: function triggerStop(options) {
			this.triggerMethod('stop', options);
		},


		//lifecycle state helpers
		_setLifeState: function _setLifeState(newstate) {
			this.setState(STATE_KEY, newstate);
		},
		_getLifeState: function _getLifeState() {
			return this.getState(STATE_KEY);
		},
		_isLifeState: function _isLifeState(state) {
			return this._getLifeState() === state;
		},
		_isLifeStateIn: function _isLifeStateIn() {
			var _this4 = this;

			for (var _len5 = arguments.length, states = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
				states[_key5] = arguments[_key5];
			}

			return _(states).some(function (state) {
				return _this4._isLifeState(state);
			});
		},
		_isInProcess: function _isInProcess() {
			return this._isLifeStateIn(STATES.STARTING, STATES.STOPPING);
		},
		_registerStartableLifecycleListeners: function _registerStartableLifecycleListeners() {
			var _this5 = this;

			var freezeWhileStarting = this.getProperty('freezeWhileStarting') === true;
			if (freezeWhileStarting && _.isFunction(this.freezeUI)) this.on('state:' + STATE_KEY + ':' + STATES.STARTING, function () {
				_this5.freezeUI();
			});
			if (freezeWhileStarting && _.isFunction(this.unFreezeUI)) this.on('start', function () {
				_this5.unFreezeUI();
			});

			this.on('before:start', function () {
				return _this5._setLifeState(STATES.STARTING);
			});
			this.on('start', function () {
				return _this5._setLifeState(STATES.RUNNING);
			});
			this.on('before:stop', function () {
				return _this5._setLifeState(STATES.STOPPING);
			});
			this.on('stop', function () {
				return _this5._setLifeState(STATES.WAITING);
			});
			this.on('destroy', function () {
				return _this5._setLifeState(STATES.DESTROYED);
			});
		},
		_tryMergeStartOptions: function _tryMergeStartOptions(options) {
			if (!this.mergeOptions) return;
			var mergeoptions = this.getProperty('mergeStartOptions') || [];
			this.mergeOptions(options, mergeoptions);
		},
		_tryMergeStopOptions: function _tryMergeStopOptions(options) {
			if (!this.mergeOptions) return;
			var mergeoptions = this.getProperty('mergeStopOptions') || [];
			this.mergeOptions(options, mergeoptions);
		},
		_ensureStartableIsIntact: function _ensureStartableIsIntact() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };

			var message = 'Startable has already been destroyed and cannot be used.';
			var error = new YatError({
				name: 'StartableLifecycleError',
				message: message
			});
			var destroyed = this._isLifeState(STATES.DESTROYED);
			if (opts.throwError && destroyed) {
				throw error;
			} else if (destroyed) {
				return error;
			}
		},
		_ensureStartableIsIdle: function _ensureStartableIsIdle() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };

			var message = 'Startable is not idle. current state: ' + this._getLifeState();
			var error = new YatError({
				name: 'StartableLifecycleError',
				message: message
			});
			var isNotIntact = this._ensureStartableIsIntact(opts);
			var notIdle = this._isInProcess();
			if (opts.throwError && notIdle) {
				throw error;
			} else if (isNotIntact) {
				return isNotIntact;
			} else if (notIdle) {
				return error;
			}
		},
		_ensureStartableCanBeStarted: function _ensureStartableCanBeStarted() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };


			var message = 'Startable has already been started.';
			var error = new YatError({
				name: 'StartableLifecycleError',
				message: message
			});
			var notIdle = this._ensureStartableIsIdle(opts);
			var allowStartWithoutStop = this.getProperty('allowStartWithoutStop') === true;

			if (!notIdle && allowStartWithoutStop) return;

			var running = this._isLifeState(STATES.RUNNING);
			if (opts.throwError && running) {
				throw error;
			} else if (notIdle) {
				return notIdle;
			} else if (running) {
				return error;
			}
		},
		_ensureStartableCanBeStopped: function _ensureStartableCanBeStopped() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };


			var message = 'Startable should be in `running` state.';
			var error = new YatError({
				name: 'StartableLifecycleError',
				message: message
			});
			var notIdle = this._ensureStartableIsIdle(opts);

			var allowStopWithoutStart = this.getProperty('allowStopWithoutStart') === true;
			if (!notIdle && allowStopWithoutStart) return;

			var running = this._isLifeState(STATES.RUNNING);

			if (opts.throwError && !running) {
				throw error;
			} else if (notIdle) {
				return notIdle;
			} else if (!running) {
				return error;
			}
		},
		_getStartPromise: function _getStartPromise() {
			var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			return Promise.all(this._getStartPromises(options));
		},
		_getStartPromises: function _getStartPromises() {
			var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var promises = [];
			var parent = this._getStartParentPromise();
			parent && promises.push(parent);
			var instance = this._getStartInstancePromise();
			instance && promises.push(instance);

			if (options.noruntime !== true) {
				var runtime = this._getStartRuntimePromise();
				runtime && promises.push(runtime);
			}
			return promises;
		},
		_getStartRuntimePromise: function _getStartRuntimePromise() {
			return getPropertyPromise(this, 'startRuntimePromises');
		},
		_getStartInstancePromise: function _getStartInstancePromise() {
			var promises = getPropertyPromise(this, 'startPromises');
			return promises;
		},
		_getStartParentPromise: function _getStartParentPromise() {
			var parent = _.result(this, 'getParent');
			if (_.isObject(parent) && _.isFunction(parent._getStartPromise)) return parent._getStartPromise({ noruntime: true });
		},
		_getStopPromise: function _getStopPromise() {
			return Promise.all(this._getStopPromises());
		},
		_getStopPromises: function _getStopPromises() {
			var promises = [];
			promises.push(this._getStopRuntimePromise());
			return promises;
		},
		_getStopRuntimePromise: function _getStopRuntimePromise() {
			return getPropertyPromise(this, 'stopPromises');
		},
		_getStopParentPromise: function _getStopParentPromise() {
			var parent = _.result(this, 'getParent');
			if (_.isObject(parent) && _.isFunction(parent._getStopPromise)) return parent._getStopPromise();
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
					return !c.getProperty('isStartNotAllowed');
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

var YatObject = mix(Mn.Object).with(GetOptionProperty, RadioMixin);

var IDENTITY_CHANNEL = 'identity';

var Base = mix(YatObject).with(Stateable);

var nativeAjax = $ && $.ajax;

var Identity2 = Base.extend({
	channelName: IDENTITY_CHANNEL,
	constructor: function constructor() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		Base.apply(this, args);
		this._initializeYatUser();
	},
	_initializeYatUser: function _initializeYatUser() {},

	bearerTokenUrl: undefined,
	bearerTokenRenewUrl: undefined, //if empty `bearerTokenUrl` will be used
	identityUrl: undefined, //if set then there will be a request to obtain identity data	
	tokenExpireOffset: 120000, // try to renew token on 2 minutes before access token expires 
	isAnonym: function isAnonym() {
		return !this.getState('id');
	},
	isUser: function isUser() {
		return !this.isAnonym();
	},
	isMe: function isMe(id) {
		return id && this.getState('id') === id;
	},
	update: function update(hash) {
		this.setState(hash);
		this.trigger('change');
	},
	logIn: function logIn(hash) {
		if (!hash.id) return;
		this.clearState();
		this.update(hash);
		this.trigger('log:in');
	},
	logOut: function logOut() {
		this.clearState();
		this.trigger('change');
		this.setTokenObject(null);
		this.trigger('log:out');
	},
	getBearerToken: function getBearerToken(data) {
		var _this = this;

		var url = this.getOption('bearerTokenUrl');
		var promise = new Promise(function (resolve, reject) {
			nativeAjax({ url: url, data: data, method: 'POST' }).then(function (token) {
				_this.setTokenObject(token);
				resolve(token);
				//this.triggerMethod('token', token);
			}, function (error) {
				return reject(error);
			});
		});
		return promise;
	},
	getIdentity: function getIdentity() {
		var _this2 = this;

		if (this.getProperty('identityUrl') == null) return;

		var model = new Bb.Model();
		model.url = this.getProperty('identityUrl');

		var promise = new Promise(function (resolve, reject) {
			model.fetch().then(function () {
				var hash = model.toJSON();
				_this2.logIn(hash);
				resolve(hash);
			}, function (error) {
				reject(error);
			});
		});
		return promise;
	},
	ajax: function ajax() {
		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		var options = args[0];
		options.headers = _.extend({}, options.headers, this.getAjaxHeaders());
		var needRefresh = this.isTokenRefreshNeeded();
		if (!needRefresh) {
			var _$;

			return (_$ = $).ajax.apply(_$, args); //nativeAjax.apply($, args);
		} else {
			return this.refreshBearerToken().then(function () {
				return nativeAjax.apply($, args);
			}).catch(function (error) {
				var promise = $.Deferred();
				promise.reject(error);
				return promise;
			});
		}
	},
	getAjaxHeaders: function getAjaxHeaders() {
		this._ajaxHeaders || (this._ajaxHeaders = {});
		return this._ajaxHeaders;
	},
	_updateHeaders: function _updateHeaders() {
		var token = this.getTokenValue();
		var headers = this.getAjaxHeaders();

		if (token) {
			headers.Authorization = 'Bearer ' + token;
			headers.Accept = 'application/json';
		} else {
			delete headers.Authorization;
		}
	},
	setTokenObject: function setTokenObject(token) {
		var _this3 = this;

		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


		if (token != null && _.isObject(token)) token.expires = new Date(Date.now() + token.expires_in * 1000);

		this._token = token;
		if (opts.silent !== true) this.triggerMethod('token:change', token);

		this._updateHeaders();
		this._replaceBackboneAjax();

		if (token != null && opts.identity !== false) this.getIdentity().catch().then(function () {
			return _this3.triggerMethod('token:identity:change');
		});else this.triggerMethod('token:identity:change');
	},
	getTokenObject: function getTokenObject() {
		return this._token;
	},
	_replaceBackboneAjax: function _replaceBackboneAjax() {
		var _this4 = this;

		var token = this.getTokenValue();
		if (!token) Bb.ajax = $.ajax; //$.ajax = nativeAjax;
		else Bb.ajax = function () {
				return _this4.ajax.apply(_this4, arguments);
			}; //$.ajax = (...args) => Yat.identity.ajax(...args);
	},
	getTokenValue: function getTokenValue() {
		var token = this.getTokenObject();
		return token && token.access_token;
	},
	getRefreshToken: function getRefreshToken() {
		var token = this.getTokenObject();
		return token.refresh_token;
	},
	getTokenExpires: function getTokenExpires() {
		var token = this.getTokenObject();
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
	isTokenRefreshNeeded: function isTokenRefreshNeeded() {
		var token = this.getTokenValue();
		if (!token) return false;
		return !this.getTokenSeconds();
	},
	refreshBearerToken: function refreshBearerToken() {
		var _this5 = this;

		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var bearerTokenRenewUrl = this.getProperty('bearerTokenRenewUrl') || this.getProperty('bearerTokenUrl');
		var doRefresh = opts.force === true || this.isTokenRefreshNeeded();
		return new Promise(function (resolve, reject) {
			if (!doRefresh) {
				resolve();
				return;
			}

			if (bearerTokenRenewUrl == null) {
				reject(new Error('Token expired and `bearerTokenRenewUrl` not set'));
				return;
			}
			var data = {
				'grant_type': 'refresh_token',
				'refresh_token': _this5.getRefreshToken()
			};
			nativeAjax({
				url: bearerTokenRenewUrl,
				data: data,
				method: 'POST'
			}).then(function (token) {
				_this5.setTokenObject(token);
				resolve();
			}, function () {
				_this5.triggerMethod('refresh:token:expired');
				reject(YatError.Http401());
			});
		});
	}
});

var Ajax = {

	tokenUrl: '',
	nativeAjax: $.ajax,

	ajax: function ajax() {
		var _this6 = this;

		for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
			args[_key3] = arguments[_key3];
		}

		return this.ensureToken().then(function () {
			var options = args[0];
			options.headers = _.extend({}, options.headers, _this6.getAjaxHeaders());
			return _this6.nativeAjax.apply($, args);
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
		return this.requestToken(data, url);
	},
	requestToken: function requestToken(data, url) {
		var _this7 = this;

		url || (url = this.getOption('tokenUrl'));
		if (!url) return Promise.reject('token url not specified');
		var promise = new Promise(function (resolve, reject) {
			_this7.tokenXhr(url, data).then(function (token) {
				_this7.setToken(token);
				resolve(token);
			}, function (error) {
				return reject(error);
			});
		});
		return promise;
	},
	getAjaxHeaders: function getAjaxHeaders() {
		this._ajaxHeaders || (this._ajaxHeaders = {});
		return _.extend({}, this._ajaxHeaders, this.getOption('ajaxHeader'));
	},
	replaceBackboneAjax: function replaceBackboneAjax() {
		var _this8 = this;

		var token = this.getTokenValue();
		if (!token) Bb.ajax = $.ajax;else Bb.ajax = function () {
			return _this8.ajax.apply(_this8, arguments);
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
	authorized: false,
	isAuth: function isAuth() {
		return this.authorized === true;
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
		var _this9 = this;

		var user = this.getUser();
		if (!user) {
			this.triggerChange();
			return;
		}
		user.fetch().then(function () {
			_this9.applyUser(user);
			_this9.triggerChange();
		}, function () {
			_this9.syncUserEror();
			_this9.triggerChange();
		});
	},
	syncUserEror: function syncUserEror() {
		this.reset();
	},
	applyUser: function applyUser(user) {
		var id = user == null ? null : user.id;
		this.setMe(id);
	},
	getUser: function getUser() {
		return this.user;
	},
	setUser: function setUser(user) {
		this.user = user;
		this.applyUser(user);
	},
	isUser: function isUser() {
		return this.user && !!this.user.id;
	}
};

var Identity = mix(YatObject).with(Auth, Ajax, Token, User).extend({
	triggerReady: function triggerReady() {
		this.triggerMethod('change');
	},
	reset: function reset() {
		var user = this.getUser();
		user.clear();
		this.applyUser(user);
		this.authorized = false;
		this.triggerMethod('reset');
	}
});

var identity = new Identity();

var YatView = mix(Mn.View).with(GlobalTemplateContext, GetOptionProperty).extend({

	instantRender: false,
	renderOnReady: false,
	triggerReady: false,

	manualAfterInitialize: true,

	constructor: function constructor() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		Mn.View.apply(this, args);

		var options = args[0];
		this.mergeOptions(options, ['instantRender', 'renderOnReady', 'triggerReady', 'manualAfterInitialize']);

		if (this.manualAfterInitialize === true) this._afterInitialize();
	},
	_afterInitialize: function _afterInitialize() {

		if (this.instantRender === true) this.render();

		if (this.renderOnReady === true) this.once('ready', this.render);

		if (this.renderOnReady === true || this.triggerReady === true) this.trigger('ready', this);
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
		$$1(function () {
			_this2.doc = $$1(document);
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

		var prefix = pageManager.getName();
		if (!prefix) {
			console.warn('pageManager prefix not defined');
			return;
		}

		this.listenTo(pageManager, 'all', function (eventName) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			var prefixedEventName = prefix + ':' + eventName;
			_this.triggerMethod.apply(_this, [prefixedEventName].concat(args));
		});
		this.listenTo(pageManager, 'state:currentPage', function () {
			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			return _this.triggerMethod.apply(_this, ['page:swapped'].concat(args));
		});
	},
	hasPageManagers: function hasPageManagers() {
		return this._pageManagers && this._pageManagers.length > 0;
	},
	getMenuTree: function getMenuTree() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { rebuild: false };

		if (this._menuTree && !opts.rebuild) return this._menuTree;
		var managers = this._pageManagers || [];
		var links = _(managers).chain().map(function (manager) {
			return manager.getLinks();
		}).flatten().value();
		this._menuTree = new Bb.Collection(links);
		return this._menuTree;
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

var Router = Mn.AppRouter.extend({}, {
	create: function create(hash, context) {
		var appRoutes = {};
		var controller = {};
		var _this = this;
		_(hash).each(function (handlerContext, key) {
			appRoutes[key] = key;
			controller[key] = function () {
				handlerContext.action.apply(handlerContext, arguments).catch(function (error) {
					_this._catchError(error, context);
				});
			};
		});
		return new this({ controller: controller, appRoutes: appRoutes });
	},
	_catchError: function _catchError(error, context) {
		if (!context || context.getProperty('throwChildErrors') === true) {
			throw error;
		} else {
			var postfix = error.status ? ":" + error.status.toString() : '';
			var commonEvent = 'error';
			var event = commonEvent + postfix;

			context.triggerMethod(commonEvent, error, this);

			if (event != commonEvent) context.triggerMethod(event, error, this);
		}
	}
});

var Model = Bb.Model.extend({});

var LinkModel = Model.extend({
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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* 
	YatPage
*/

var Base$2 = mix(App).with(GetNameLabel);

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

	initializeYatPage: function initializeYatPage(opts) {
		this.mergeOptions(opts, ["manager"]);
		this._initializeLayoutModels(opts);
		this._initializeRoute(opts);
		this._proxyEvents();
		this._tryCreateRouter();
		this._registerIdentityHandlers();
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
		return _.extend.apply(_, _toConsumableArray(hashes));
	},
	hasRouteHash: function hasRouteHash() {
		return _.isObject(this.getRouteHash());
	},
	getLinkModel: function getLinkModel() {
		var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

		if (!this._canHaveLinkModel()) return;
		if (this._linkModel) return this._linkModel;

		var url = this.getRoute();
		var label = this.getLabel();
		var children = this._getSublinks(level);
		this._linkModel = new LinkModel({ url: url, label: label, level: level, children: children });

		return this._linkModel;
	},
	_canHaveLinkModel: function _canHaveLinkModel() {
		return !(this.getProperty('skipMenu') === true || !!this.getProperty('isStartNotAllowed'));
	},
	_destroyLinkModel: function _destroyLinkModel() {
		if (!this._linkModel) return;
		this._linkModel.destroy();
		delete this._linkModel;
	},
	getParentLinkModel: function getParentLinkModel() {
		var parent = this.getParent();
		if (!parent || !parent.getLinkModel) return;
		var model = parent.getLinkModel();
		return model;
	},
	getNeighbourLinks: function getNeighbourLinks() {
		var link = this.getLinkModel();
		if (link && link.collection) return link.collection;
	},
	getChildrenLinks: function getChildrenLinks() {
		var model = this.getLinkModel();
		if (!model) return;
		return model.get('children');
	},
	_getSublinks: function _getSublinks(level) {
		var children = this.getChildren();
		if (!children || !children.length) return;
		var sublinks = _(children).chain().filter(function (child) {
			return child.getProperty("skipMenu") !== true;
		}).map(function (child) {
			return child.getLinkModel(level + 1);
		}).value();
		if (!sublinks.length) return;
		var col = new Bb.Collection(sublinks);
		return col;
	},
	_initializeLayoutModels: function _initializeLayoutModels() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		this.addModel(opts.model, opts);
		this.addCollection(opts.collection, opts);
	},
	_initializeRoute: function _initializeRoute() {
		var route = this.getRoute({ asPattern: true });
		if (route == null) return;
		var page = this;
		this._routeHandler = _defineProperty$2({}, route, { context: page, action: function action() {
				return page.start.apply(page, arguments);
			} });
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
	_tryCreateRouter: function _tryCreateRouter() {
		var create = this.getProperty('createRouter') === true;
		if (create) {
			this.router = this._createAppRouter();
		}
	},
	_createAppRouter: function _createAppRouter() {
		var hash = this.getRouteHash();
		if (!_.size(hash)) return;
		return new Router(hash);
	},
	_proxyEvents: function _proxyEvents() {
		var proxyContexts = this._getProxyContexts();
		this._proxyEventsTo(proxyContexts);
	},
	_getProxyContexts: function _getProxyContexts() {
		var rdy = [];
		var manager = this.getProperty('manager');
		if (manager) {
			rdy.push({ context: manager });
		}
		var radio = this.getChannel();
		if (radio) {
			var allowed = this.getProperty('proxyEventsToRadio');
			rdy.push({ context: radio, allowed: allowed });
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
				return context.triggerMethod.apply(context, ['page:' + eventName].concat(_toConsumableArray(triggerArguments)));
			});
		});
	},


	_buildChildOptions: function _buildChildOptions(def) {
		var add = {};
		var manager = this.getProperty('manager');
		if (manager) add.manager = manager;
		return _.extend(def, this.getProperty('childOptions'), add);
	},

	_registerIdentityHandlers: function _registerIdentityHandlers() {
		var _this = this;

		this.listenTo(identity, 'change', function () {
			_this._destroyLinkModel();
			//this.triggerMethod('identity:change', ...args);
		});
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
		var children = this.getChildren({ startable: false });
		var hash = {};
		_(children).each(function (page) {
			if (_.isFunction(page.getRouteHash)) {
				_.extend(hash, page.getRouteHash());
			}
		});
		this._routesHash = hash;
		this.setRouter(Router.create(hash, this));
	},
	setRouter: function setRouter(router) {
		this.router = router;
	},
	getRouter: function getRouter() {
		return this.router;
	},
	getLinks: function getLinks() {
		var children = this.getChildren();
		if (!children) return;
		return _(children).chain().map(function (child) {
			return child.getLinkModel();
		}).filter(function (child) {
			return !!child;
		}).value();
	},
	execute: function execute(route) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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
	},
	_pageDecline: function _pageDecline() {
		//console.log("decline", args)
	},
	_registerIdentityHandlers: function _registerIdentityHandlers() {
		var _this = this;

		this.listenTo(identity, 'change', function () {
			//this.triggerMethod('identity:change', ...args);
			if (!_this._moveToRootIfCurrentPageNotAllowed()) _this.restartCurrentPage();
		});
	},
	_moveToRootIfCurrentPageNotAllowed: function _moveToRootIfCurrentPageNotAllowed() {
		var current = this.getCurrentPage();

		if (!current || !current.isStartNotAllowed()) return;

		this.navigateToRoot();

		return true;
	},
	restartCurrentPage: function restartCurrentPage() {
		var current = this.getCurrentPage();
		current && current.restart();
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
	Router: Router,
	PageManager: YatPageManager,
	View: YatView,
	CollectionView: YatCollectionView,
	Model: Model,
	Collection: Collection,
	CollectionGroups: CollectionGroups
};

return marionetteYat;

})));
this && this.Marionette && (this.Marionette.Yat = this.MarionetteYat);
//# sourceMappingURL=marionette.yat.js.map
