/**
* @license
* Marionette.Yat extension for Backbone.Marionette
* Yet Another Toolkit
* ----------------------------------
* v0.0.5
*
* Distributed under MIT license
* author: dimtabu
*/


(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('underscore'), require('backbone'), require('backbone.marionette'), require('backbone.radio')) :
	typeof define === 'function' && define.amd ? define(['underscore', 'backbone', 'backbone.marionette', 'backbone.radio'], factory) :
	(global.MarionetteYat = factory(global._,global.Backbone,global.Marionette,global.Backbone.Radio));
}(this, (function (_$1,Bb,Mn,backbone_radio) { 'use strict';

_$1 = _$1 && _$1.hasOwnProperty('default') ? _$1['default'] : _$1;
var Bb__default = 'default' in Bb ? Bb['default'] : Bb;
var Mn__default = 'default' in Mn ? Mn['default'] : Mn;
backbone_radio = backbone_radio && backbone_radio.hasOwnProperty('default') ? backbone_radio['default'] : backbone_radio;

var version = "0.0.5";

function GetNameLabel (Base) {
	return Base.extend({
		getName: function getName() {
			return this.getProperty('name') || this.id || this.cid;
		},
		getLabel: function getLabel() {
			return this.getProperty('label') || this.getName();
		}
	});
}

var knownCtors = [Bb__default.Model, Bb__default.Collection, Bb__default.View, Bb__default.Router, Mn__default.Object];

function isKnownCtor(arg) {
	var isFn = _$1.isFunction(arg);
	var result = _$1(knownCtors).some(function (ctor) {
		return arg === ctor || arg.prototype instanceof ctor;
	});
	return isFn && result;
}

// function normalizeOptions(options){
// 	return _.extend({}, {deep: true, force: true, args: []}, options);
// }

// function getDeepOptions(options){
// 	return _.extend({}, options, {deep:false, force: false});
// }

// function getValue(deepMethodName, key)
// {
// 	const context = deepMethodName === 'getOption' ? this
// 					: deepMethodName === 'getProperty' &&  _.isObject(this.options) ? this.getProperty('options',{deep:false})
// 					: null;
// 	if(context == null) return;

// 	return context[key];

// }

var OptionPropertyHelpers = {
	normalizeOptions: function normalizeOptions(options) {
		return _$1.extend({}, { deep: true, force: true, args: [] }, options);
	},
	getDeepOptions: function getDeepOptions(options) {
		return _$1.extend({}, options, { deep: false, force: false });
	},
	getValue: function getValue(deepMethodName, key) {
		var context = deepMethodName === 'getOption' ? this : deepMethodName === 'getProperty' && _$1.isObject(this.options) ? this.getProperty('options', { deep: false }) : null;
		if (context == null) return;

		return context[key];
	},
	getOptionPropertyValue: function getOptionPropertyValue(key, options, deepMethodName) {

		if (key == null) return;

		var opts = OptionPropertyHelpers.normalizeOptions(options);
		var deepOpts = OptionPropertyHelpers.getDeepOptions(options);

		var value = OptionPropertyHelpers.getValue.call(this, deepMethodName, key);

		if (value === undefined && opts.deep) value = this[deepMethodName](key, deepOpts);

		if (typeof value !== 'function' || isKnownCtor(value) || !opts.force) return value;

		return value.apply(this, opts.args);
	}
};

var GetOptionProperty = (function (Base) {
	var Mixin = Base.extend({
		getProperty: function getProperty(key) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { deep: true, force: true, args: [] };

			return OptionPropertyHelpers.getOptionPropertyValue.call(this, key, options, 'getOption');
		},
		getOption: function getOption(key) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { deep: true, force: true, args: [] };

			return OptionPropertyHelpers.getOptionPropertyValue.call(this, key, options, 'getProperty');
		}
	});
	return Mixin;
});

var Radioable = (function (Base) {
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

			if (_$1.isObject(key)) {
				var _this = this;
				options = value;
				value = key;
				_$1(value).each(function (propertyValue, propertyName) {
					return _this.setState(propertyName, propertyValue, options);
				});
				this._triggerStateChange(value, options);
			} else {
				var state = this.getState();
				state[key] = value;
				this._triggerStateChange(key, value, options);
			}
		},
		_triggerStateChange: function _triggerStateChange(key, value, options) {

			if (!_$1.isFunction(this.triggerMethod)) return;

			if (!_$1.isObject(key)) {
				this.triggerMethod('state:' + key, value, options);
				if (value === true || value === false) this.triggerMethod('state:' + key + ':' + value.toString(), options);
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

function smartExtend(Src, Dst) {
	if (_$1.isFunction(Dst)) {
		return Dst(Src);
	} else if (_$1.isObject(Dst)) {
		return Src.extend(Dst);
	} else throw new YatError('Mixin fail, argument should be an object hash or mixin function');
}

function mix(BaseClass) {
	var Mixed = BaseClass;
	if (!Mixed.extend) {
		Mixed = Mn.extend.call(BaseClass, {});
		Mixed.extend = Mn.extend;
	}
	var fake = {
		with: function _with() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return _$1.reduce(args, function (memo, arg) {
				return smartExtend(memo, arg);
			}, Mixed);
		}
	};
	return fake;
}

var YatError$1 = Mn.Error.extend({}, {
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
	var _this = this;

	var rawPromises = context[propertyName] || [];
	var promises = [];
	_$1(rawPromises).each(function (promiseArg) {
		if (_$1.isFunction(promiseArg)) promises.push(promiseArg.call(_this));else promises.push(promiseArg);
	});
	return Promise.all(promises);
}

function addPropertyPromise(context, propertyName, promise) {
	context[propertyName] || (context[propertyName] = []);
	var promises = context[propertyName];
	promises.push(promise);
}

var Startable = (function (Base) {
	var Middle = mix(Base).with(Stateable);
	var Mixin = Middle.extend({
		constructor: function constructor() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			Middle.apply(this, args);
			this.initializeStartable();
		},
		initializeStartable: function initializeStartable() {

			if (!(this.constructor.Startable && this.constructor.Stateable)) return;

			this._registerStartableLifecycleListeners();
			this._setLifeState(STATES.INITIALIZED);
		},
		start: function start() {
			var _this2 = this;

			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			var options = args[0];
			var canNotBeStarted = this._ensureStartableCanBeStarted();
			var resultPromise = null;
			var catchMethod = null;

			if (canNotBeStarted) {
				catchMethod = function catchMethod() {
					return _this2.triggerMethod('start:decline', canNotBeStarted);
				};
				resultPromise = Promise.reject(canNotBeStarted);
			}

			if (resultPromise == null) {
				var declineReason = this.isStartNotAllowed(options);
				if (declineReason) {
					catchMethod = function catchMethod() {
						return _this2.triggerMethod('start:decline', declineReason);
					};
					//this.triggerMethod('start:decline', declineReason);
					resultPromise = Promise.reject(declineReason);
				}
			}

			if (resultPromise == null) {
				var currentState = this._getLifeState();
				this._tryMergeStartOptions(options);
				this.triggerMethod.apply(this, ['before:start'].concat(args));
				resultPromise = this._getStartPromise();
			}

			return resultPromise.then(function () {
				_this2.triggerStart(options);
			}, function (error) {
				_this2._setLifeState(currentState);
				if (catchMethod) catchMethod();
				return Promise.reject(error);
			});
		},
		triggerStart: function triggerStart(options) {
			this.triggerMethod('start', options);
		},
		stop: function stop(options) {
			var _this3 = this;

			var canNotBeStopped = this._ensureStartableCanBeStopped();
			if (canNotBeStopped) {
				this.triggerMethod('stop:decline', canNotBeStopped);
				return Promise.reject(canNotBeStopped);
			}
			var declineReason = this.isStopNotAllowed(options);
			if (declineReason) {
				this.triggerMethod('stop:decline', declineReason);
				return Promise.reject(declineReason);
			}

			var currentState = this._getLifeState();

			this._tryMergeStopOptions(options);
			this.triggerMethod('before:stop', this, options);

			var promise = this._getStopPromise();

			return promise.then(function () {
				_this3.triggerStop(options);
			}, function () {
				_this3._setLifeState(currentState);
			});
		},
		triggerStop: function triggerStop(options) {
			this.triggerMethod('stop', options);
		},
		isStartNotAllowed: function isStartNotAllowed() {},
		isStopNotAllowed: function isStopNotAllowed() {},
		addStartPromise: function addStartPromise(promise) {
			addPropertyPromise(this, 'startPromises', promise);
		},
		addStopPromise: function addStopPromise(promise) {
			addPropertyPromise(this, 'stopPromises', promise);
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

			for (var _len3 = arguments.length, states = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
				states[_key3] = arguments[_key3];
			}

			return _$1(states).some(function (state) {
				return _this4._isLifeState(state);
			});
		},
		_isInProcess: function _isInProcess() {
			return this._isLifeStateIn(STATES.STARTING, STATES.STOPPING);
		},
		_registerStartableLifecycleListeners: function _registerStartableLifecycleListeners() {
			var _this5 = this;

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
			var error = new YatError$1({
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
			var error = new YatError$1({
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
			var error = new YatError$1({
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
			var error = new YatError$1({
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
			return Promise.all(this._getStartPromises());
		},
		_getStartPromises: function _getStartPromises() {
			var promises = [];
			promises.push(this._getStartUserPromise());
			promises.push(this._getStartParentPromise());
			return promises;
		},
		_getStartUserPromise: function _getStartUserPromise() {
			return getPropertyPromise(this, 'startPromises');
		},
		_getStartParentPromise: function _getStartParentPromise() {
			var parent = _$1.result(this, 'getParent');
			if (_$1.isObject(parent) && _$1.isFunction(parent._getStartPromise)) return parent._getStartPromise();
		},
		_getStopPromise: function _getStopPromise() {
			return Promise.all(this._getStopPromises());
		},
		_getStopPromises: function _getStopPromises() {
			var promises = [];
			promises.push(this._getStopUserPromise());
			return promises;
		},
		_getStopUserPromise: function _getStopUserPromise() {
			return getPropertyPromise(this, 'stopPromises');
		},
		_getStopParentPromise: function _getStopParentPromise() {
			var parent = _$1.result(this, 'getParent');
			if (_$1.isObject(parent) && _$1.isFunction(parent._getStopPromise)) return parent._getStartPromise();
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
			return _$1.isObject(parent);
		},
		getParent: function getParent() {
			return this.getProperty('parent', { deep: false });
		},
		_initializeChildren: function _initializeChildren() {
			var _this = this;

			var _children = this.getProperty('children');
			var children = [];
			_$1(_children).each(function (child) {

				var childContext = _this._normalizeChildContext(child);
				var initialized = _this._initializeChild(childContext);
				if (initialized) children.push(initialized);
			});
			this[CHILDREN_FIELD] = children;
		},
		_initializeChild: function _initializeChild(childContext) {
			if (childContext == null || !_$1.isFunction(childContext.Child)) return;

			var Child = childContext.Child;
			var opts = this._normalizeChildOptions(childContext);
			return this.buildChild(Child, opts);
		},
		_normalizeChildContext: function _normalizeChildContext(child) {
			var childContext = {};

			if (_$1.isFunction(child) && child.Childrenable) {
				_$1.extend(childContext, { Child: child });
			} else if (_$1.isFunction(child)) {
				childContext = this._normalizeChildContext(child.call(this));
			} else if (_$1.isObject(child)) {
				childContext = child;
			}
			return childContext;
		},
		_normalizeChildOptions: function _normalizeChildOptions(options) {
			var opts = _$1.extend({}, options);
			if (this.getOption('passToChildren') === true) {
				_$1.extend(opts, this.options);
			}
			opts.parent = this;
			delete opts.Child;
			return this._buildChildOptions(opts);
		},


		_buildChildOptions: function _buildChildOptions(def) {
			return _$1.extend(def, this.getProperty('childOptions'));
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

var Mixins = {
	GetNameLabel: GetNameLabel,
	GetOptionProperty: GetOptionProperty,
	Radioable: Radioable,
	Stateable: Stateable,
	Startable: Startable,
	Childrenable: Childrenable
};

var Helpers = {
	isKnownCtor: isKnownCtor,
	mix: mix
};

var Base$1 = mix(Mn__default.Application).with(GetOptionProperty, Radioable, Childrenable, Startable);

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
	getPage: function getPage(key) {
		if (!this.hasPageManagers()) return;
		return _(this._pageManagers).find(function (mngr) {
			return mngr.getPage(key);
		});
	}
});

var Router = Mn.AppRouter.extend({}, {
	create: function create(hash, context) {
		var _this = this;

		var appRoutes = {};
		var controller = {};
		_$1(hash).each(function (handlerContext, key) {
			appRoutes[key] = key;
			controller[key] = function () {
				handlerContext.action.apply(handlerContext, arguments).catch(function (error) {
					var commonEvent = 'error';
					var event = commonEvent + (error.status && ":" + error.status);
					if (event != commonEvent) context.triggerMethod(event, error, _this);

					context.triggerMethod(commonEvent, error, _this);
				});
			};
		});
		return new this({ controller: controller, appRoutes: appRoutes });
	}
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_Model) {
	_inherits(_class, _Model);

	function _class() {
		var _ref;

		_classCallCheck(this, _class);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args)));
	}

	return _class;
}(Bb.Model);

var LinkModel = _class.extend({
	defaults: {
		url: undefined,
		label: undefined,
		target: '_self',
		level: 0
	}
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Base = mix(App).with(GetNameLabel);

var YatPage = Base.extend({
	constructor: function constructor() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		Base.apply(this, args);
		this.initializeYatPage();
	},


	allowStopWithoutStart: true,
	allowStartWithoutStop: true,

	initializeYatPage: function initializeYatPage(opts) {
		this.mergeOptions(opts, ["manager"]);
		this._initializeModels(opts);
		this._initializeRoute(opts);
		this._proxyEvents();
		this._tryCreateRouter();
	},
	getLayout: function getLayout() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { rebuild: false };

		if (!this._layoutView || opts.rebuild || this._layoutView && this._layoutView.isDestroyed && this._layoutView.isDestroyed()) {
			this.buildLayout();
		}
		return this._layoutView;
	},
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
	getRouteHash: function getRouteHash() {
		var _ref;

		var hashes = [{}, this._routeHandler].concat(this.getChildren().map(function (children) {
			return children.getRouteHash();
		}));
		return (_ref = _).extend.apply(_ref, _toConsumableArray(hashes));
	},
	hasRouteHash: function hasRouteHash() {
		return _.isObject(this.getRouteHash());
	},
	getLinkModel: function getLinkModel() {
		var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

		if (this._linkModel) return this._linkModel;
		if (this.getProperty('skipMenu') === true) return;
		if (!!this.getProperty('isStartNotAllowed')) return;
		var url = this.getRoute();
		var label = this.getLabel();
		var children = this._getSublinks(level);
		this._linkModel = new LinkModel({ url: url, label: label, level: level, children: children });
		return this._linkModel;
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
	_initializeModels: function _initializeModels() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		this.addModel(opts.model, opts);
		this.addCollection(opts.collection, opts);
	},
	_initializeRoute: function _initializeRoute() {
		var route = this.getRoute();
		if (route == null) return;
		var page = this;
		this._routeHandler = _defineProperty({}, route, { context: page, action: function action() {
				return page.start.apply(page, arguments);
			} });
	},
	getRoute: function getRoute() {
		var relative = this.getProperty('relativeRoute');
		var route = this.getProperty('route');
		var parent = this.getParent();
		if (route == null) return;
		if (!relative || !parent || !parent.getRoute) return route;
		var parentRoute = parent.getRoute();
		if (parentRoute == null) return route;
		var result = parentRoute + '/' + route;
		if (result.startsWith('/')) result = result.substring(1);
		return result;
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
	}

});

var YatObject = mix(Mn__default.Object).with(GetOptionProperty, Radioable);

var Base$2 = mix(App).with(GetNameLabel);

var YatPageManager = Base$2.extend({
	constructor: function constructor() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		Base$2.apply(this, args);
		this._initializeYatPageManager.apply(this, args);
	},

	// initRadioOnInitialize: false,
	// getChildOptions(){
	// 	let opts = Base.prototype.getChildOptions() || {};
	// 	opts.channel = this.getChannel();
	// 	opts.passToChildren = true;
	// 	return opts;
	// },
	createRouter: function createRouter() {
		var children = this.getChildren();
		var hash = {};
		_$1(children).each(function (page) {
			if (_$1.isFunction(page.getRouteHash)) {
				_$1.extend(hash, page.getRouteHash());
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
		return _$1(children).chain().map(function (child) {
			return child.getLinkModel();
		}).filter(function (child) {
			return !!child;
		}).value();
	},
	getPage: function getPage(key) {

		var found = _$1(this._routesHash).find(function (pageContext, route) {
			if (route === key) return true;
			if (pageContext.context.getName() === key) return true;
		});
		return found && found.context;
	},
	_initializeYatPageManager: function _initializeYatPageManager() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		this.mergeOptions(opts, ['id', 'name', 'label']);
		this._registerPageHandlers(opts);
		this.createRouter();
	},


	_buildChildOptions: function _buildChildOptions(def) {
		return _$1.extend(def, this.getProperty('childOptions'), {
			manager: this
		});
	},

	_registerPageHandlers: function _registerPageHandlers() {
		this.on('page:before:start', this._pageBeforeStart);
		this.on('page:start', this._pageStart);
		this.on('page:decline', this._pageDecline);
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
		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		console.log("decline", args);
	}
});

var Base$3 = mix(YatObject).with(Stateable);
var YatUser = Base$3.extend({
	constructor: function constructor() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		Base$3.apply(this, args);
		this._initializeYatUser();
	},
	_initializeYatUser: function _initializeYatUser() {},

	channelName: 'identity',
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
	}
});
var user = new YatUser();

var marionetteYat = {
	VERSION: version,
	Helpers: Helpers,
	Mixins: Mixins,
	Error: YatError$1,
	Object: YatObject,
	App: App,
	Page: YatPage,
	Router: Router,
	PageManager: YatPageManager,
	user: user
};

return marionetteYat;

})));
this && this.Marionette && (this.Marionette.Yat = this.MarionetteYat);
//# sourceMappingURL=marionette.yat.js.map
