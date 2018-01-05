(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("_"), require("Marionette"), require("Backbone"), require("Backbone.Radio"));
	else if(typeof define === 'function' && define.amd)
		define(["_", "Marionette", "Backbone", "Backbone.Radio"], factory);
	else if(typeof exports === 'object')
		exports["marionetteYat"] = factory(require("_"), require("Marionette"), require("Backbone"), require("Backbone.Radio"));
	else
		root["marionetteYat"] = factory(root["_"], root["Marionette"], root["Backbone"], root["Backbone.Radio"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_13__, __WEBPACK_EXTERNAL_MODULE_16__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _underscore = __webpack_require__(0);

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mixWithMixinFunc(ClassDefinition, mixin) {
	return mixin(ClassDefinition);
}

function mixWithObject(ClassDefinition, mixin) {
	var MixedClass = function (_ClassDefinition) {
		_inherits(MixedClass, _ClassDefinition);

		function MixedClass() {
			var _ref;

			_classCallCheck(this, MixedClass);

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return _possibleConstructorReturn(this, (_ref = MixedClass.__proto__ || Object.getPrototypeOf(MixedClass)).call.apply(_ref, [this].concat(args)));
		}

		return MixedClass;
	}(ClassDefinition);
	_underscore2.default.extend(MixedClass.prototype, mixin);
	return MixedClass;
}

function mixWithOne(ClassDefinition, mixin) {
	if (typeof mixin === 'function') return mixWithMixinFunc(ClassDefinition, mixin);else if ((typeof mixin === 'undefined' ? 'undefined' : _typeof(mixin)) === 'object') return mixWithObject(ClassDefinition, mixin);else return ClassDefinition;
}

function mixWith() {
	for (var _len2 = arguments.length, mixins = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		mixins[_key2] = arguments[_key2];
	}

	var MixedClass = this;

	if (!mixins || !mixins.length) return this;

	while (mixins.length) {
		var _mixin = mixins.shift();
		MixedClass = mixWithOne(MixedClass, _mixin);
	}

	delete this.with;

	return MixedClass;
}

function mixin(Base) {
	return function (_Base) {
		_inherits(_class, _Base);

		function _class() {
			var _ref2;

			_classCallCheck(this, _class);

			for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
				args[_key3] = arguments[_key3];
			}

			return _possibleConstructorReturn(this, (_ref2 = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref2, [this].concat(args)));
		}

		_createClass(_class, null, [{
			key: 'with',
			value: function _with() {
				for (var _len4 = arguments.length, mixins = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
					mixins[_key4] = arguments[_key4];
				}

				return mixWith.apply(this, mixins);
			}
		}]);

		return _class;
	}(Base);
}

exports.default = mixin;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _backbone = __webpack_require__(1);

var _backbone2 = _interopRequireDefault(_backbone);

var _mixin = __webpack_require__(2);

var _mixin2 = _interopRequireDefault(_mixin);

var _getOptionProperty = __webpack_require__(5);

var _getOptionProperty2 = _interopRequireDefault(_getOptionProperty);

var _radio = __webpack_require__(6);

var _radio2 = _interopRequireDefault(_radio);

var _startable = __webpack_require__(7);

var _startable2 = _interopRequireDefault(_startable);

var _childrenable = __webpack_require__(15);

var _childrenable2 = _interopRequireDefault(_childrenable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_mixin$with) {
	_inherits(_class, _mixin$with);

	function _class() {
		var _ref;

		_classCallCheck(this, _class);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args)));
	}

	_createClass(_class, [{
		key: '_initRegion',
		value: function _initRegion() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { skip: true };

			if (opts.skip) return;
			var region = this.getProperty('region');
			this.region = region;
			_get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), '_initRegion', this).call(this);
		}
	}, {
		key: 'getRegion',
		value: function getRegion() {
			if (!this._region) this._initRegion({ skip: false });
			return this._region;
		}
	}, {
		key: 'addPageManager',
		value: function addPageManager(pageManager) {
			var _this2 = this;

			this._pageManagers || (this._pageManagers = []);
			this._pageManagers.push(pageManager);

			var prefix = pageManager.getName();
			if (!prefix) {
				console.warn('pageManager prefix not defined');
				return;
			}

			this.listenTo(pageManager, 'all', function (eventName) {
				for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
					args[_key2 - 1] = arguments[_key2];
				}

				var prefixedEventName = prefix + ':' + eventName;
				_this2.triggerMethod.apply(_this2, [prefixedEventName].concat(args));
			});
		}
	}, {
		key: 'initRadioOnInitialize',
		get: function get() {
			return true;
		}
	}]);

	return _class;
}((0, _mixin2.default)(_backbone2.default.Application).with(_getOptionProperty2.default, _radio2.default, _childrenable2.default, _startable2.default));

exports.default = _class;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _underscore = __webpack_require__(0);

var _underscore2 = _interopRequireDefault(_underscore);

var _backbone = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_AppRouter) {
	_inherits(_class, _AppRouter);

	function _class(hash) {
		_classCallCheck(this, _class);

		var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

		var routes = {};
		var controller = {};

		(0, _underscore2.default)(hash).each(function (handlerContext, key) {
			routes[key] = key;
			controller[key] = handlerContext.action;
		});
		_this.processAppRoutes(controller, routes);
		return _this;
	}
	// onRoute(...args){
	// 	console.log(...args);
	// }


	return _class;
}(_backbone.AppRouter);

exports.default = _class;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = __webpack_require__(0);

var _underscore2 = _interopRequireDefault(_underscore);

var _isKnownCtor = __webpack_require__(12);

var _isKnownCtor2 = _interopRequireDefault(_isKnownCtor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function normalizeOptions(options) {
	return _underscore2.default.extend({}, { deep: true, force: true, args: [] }, options);
}

function getDeepOptions(options) {
	return _underscore2.default.extend({}, options, { deep: false, force: false });
}

function getValue(deepMethodName, key) {
	var context = deepMethodName === 'getOption' ? this : deepMethodName === 'getProperty' && _underscore2.default.isObject(this.options) ? this.options : null;
	if (context == null) return;

	return context[key];
}

function get(key, options, deepMethodName) {

	if (key == null) return;

	var opts = normalizeOptions(options);
	var deepOpts = getDeepOptions(options);

	var value = getValue.call(this, deepMethodName, key);

	if (value === undefined && opts.deep) value = this[deepMethodName](key, deepOpts);

	if (typeof value !== 'function' || (0, _isKnownCtor2.default)(value) || !opts.force) return value;

	return value.apply(this, opts.args);
}

exports.default = function (Base) {
	return function (_Base) {
		_inherits(_class, _Base);

		function _class() {
			var _ref;

			_classCallCheck(this, _class);

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args)));
		}

		_createClass(_class, [{
			key: 'getProperty',
			value: function getProperty(key) {
				var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { deep: true, force: true, args: [] };


				return get.call(this, key, options, 'getOption');
			}
		}, {
			key: 'getOption',
			value: function getOption(key) {
				var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { deep: true, force: true, args: [] };


				return get.call(this, key, options, 'getProperty');
			}
		}]);

		return _class;
	}(Base);
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Base) {
	var Mixin = function (_Base) {
		_inherits(Mixin, _Base);

		function Mixin() {
			var _ref;

			_classCallCheck(this, Mixin);

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			var _this = _possibleConstructorReturn(this, (_ref = Mixin.__proto__ || Object.getPrototypeOf(Mixin)).call.apply(_ref, [this].concat(args)));

			var initRadioOnInitialize = !(_this.getProperty('initRadioOnInitialize') === true);
			_this._initRadio({ skip: initRadioOnInitialize });
			return _this;
		}

		_createClass(Mixin, [{
			key: 'getChannel',
			value: function getChannel() {
				if (!this._channel) this._initRadio({ skip: false });
				return this._channel;
			}
		}, {
			key: '_initRadio',
			value: function _initRadio() {
				var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { skip: true };

				if (opts.skip == true) return;

				var channelName = this.getProperty('channelName');
				if (!channelName) {
					var channel = this.getProperty('channel');
					if (channel) this.channelName = channel.channelName;
				}

				_get(Mixin.prototype.__proto__ || Object.getPrototypeOf(Mixin.prototype), '_initRadio', this).call(this);
			}
		}, {
			key: 'radioRequest',
			value: function radioRequest() {
				var channel = this.getChannel();
				if (channel) channel.request.apply(channel, arguments);
			}
		}, {
			key: 'radioTrigger',
			value: function radioTrigger() {
				var channel = this.getChannel();
				if (channel) channel.trigger.apply(channel, arguments);
			}
		}]);

		return Mixin;
	}(Base);

	return Mixin;
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = __webpack_require__(0);

var _underscore2 = _interopRequireDefault(_underscore);

var _mixin = __webpack_require__(2);

var _mixin2 = _interopRequireDefault(_mixin);

var _stateable = __webpack_require__(14);

var _stateable2 = _interopRequireDefault(_stateable);

var _YatError = __webpack_require__(8);

var _YatError2 = _interopRequireDefault(_YatError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
	(0, _underscore2.default)(rawPromises).each(function (promiseArg) {
		if (_underscore2.default.isFunction(promiseArg)) promises.push(promiseArg.call(_this));else promises.push(promiseArg);
	});
	return Promise.all(promises);
}

function addPropertyPromise(context, propertyName, promise) {
	context[propertyName] || (context[propertyName] = []);
	var promises = context[propertyName];
	promises.push(promise);
}

exports.default = function (Base) {
	var Mixin = function (_mixin$with) {
		_inherits(Mixin, _mixin$with);

		function Mixin() {
			var _ref;

			_classCallCheck(this, Mixin);

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			var _this2 = _possibleConstructorReturn(this, (_ref = Mixin.__proto__ || Object.getPrototypeOf(Mixin)).call.apply(_ref, [this].concat(args)));

			_this2.initializeStartable();
			return _this2;
		}

		_createClass(Mixin, [{
			key: 'initializeStartable',
			value: function initializeStartable() {
				//console.log('initialize Startable', this.constructor.Startable)
				if (!(this.constructor.Startable && this.constructor.Stateable)) return;

				this._registerStartableLifecycleListeners();
				this._setLifeState(STATES.INITIALIZED);
				//console.log('initialize Startable END')
			}
		}, {
			key: 'start',
			value: function start(options) {
				var _this3 = this;

				var canNotBeStarted = this._ensureStartableCanBeStarted();
				if (canNotBeStarted) {
					this.triggerMethod('start:decline', canNotBeStarted);
					return Promise.reject(canNotBeStarted);
				}
				var declineReason = this.isStartNotAllowed(options);
				if (declineReason) {
					this.triggerMethod('start:decline', declineReason);
					return Promise.reject(declineReason);
				}

				var currentState = this._getLifeState();
				this._tryMergeStartOptions(options);
				this.triggerMethod('before:start', this, options);

				var promise = this._getStartPromise();

				return promise.then(function () {
					_this3.triggerStart(options);
				}, function () {
					_this3._setLifeState(currentState);
				});
			}
		}, {
			key: 'triggerStart',
			value: function triggerStart(options) {
				this.triggerMethod('start', options);
			}
		}, {
			key: 'stop',
			value: function stop(options) {
				var _this4 = this;

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
					_this4.triggerStop(options);
				}, function () {
					_this4._setLifeState(currentState);
				});
			}
		}, {
			key: 'triggerStop',
			value: function triggerStop(options) {
				this.triggerMethod('stop', options);
			}
		}, {
			key: 'isStartNotAllowed',
			value: function isStartNotAllowed() {}
		}, {
			key: 'isStopNotAllowed',
			value: function isStopNotAllowed() {}
		}, {
			key: 'addStartPromise',
			value: function addStartPromise(promise) {
				addPropertyPromise(this, 'startPromises', promise);
			}
		}, {
			key: 'addStopPromise',
			value: function addStopPromise(promise) {
				addPropertyPromise(this, 'stopPromises', promise);
			}

			//lifecycle state helpers

		}, {
			key: '_setLifeState',
			value: function _setLifeState(newstate) {
				this.setState(STATE_KEY, newstate);
			}
		}, {
			key: '_getLifeState',
			value: function _getLifeState() {
				return this.getState(STATE_KEY);
			}
		}, {
			key: '_isLifeState',
			value: function _isLifeState(state) {
				return this._getLifeState() === state;
			}
		}, {
			key: '_isLifeStateIn',
			value: function _isLifeStateIn() {
				var _this5 = this;

				for (var _len2 = arguments.length, states = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
					states[_key2] = arguments[_key2];
				}

				return (0, _underscore2.default)(states).some(function (state) {
					return _this5._isLifeState(state);
				});
			}
		}, {
			key: '_isInProcess',
			value: function _isInProcess() {
				return this._isLifeStateIn(STATES.STARTING, STATES.STOPPING);
			}
		}, {
			key: '_registerStartableLifecycleListeners',
			value: function _registerStartableLifecycleListeners() {
				var _this6 = this;

				this.on('before:start', function () {
					return _this6._setLifeState(STATES.STARTING);
				});
				this.on('start', function () {
					return _this6._setLifeState(STATES.RUNNING);
				});
				this.on('before:stop', function () {
					return _this6._setLifeState(STATES.STOPPING);
				});
				this.on('stop', function () {
					return _this6._setLifeState(STATES.WAITING);
				});
				this.on('destroy', function () {
					return _this6._setLifeState(STATES.DESTROYED);
				});
			}
		}, {
			key: '_tryMergeStartOptions',
			value: function _tryMergeStartOptions(options) {
				if (!this.mergeOptions) return;
				var mergeoptions = this.getProperty('mergeStartOptions') || [];
				this.mergeOptions(options, mergeoptions);
			}
		}, {
			key: '_tryMergeStopOptions',
			value: function _tryMergeStopOptions(options) {
				if (!this.mergeOptions) return;
				var mergeoptions = this.getProperty('mergeStopOptions') || [];
				this.mergeOptions(options, mergeoptions);
			}
		}, {
			key: '_ensureStartableIsIntact',
			value: function _ensureStartableIsIntact() {
				var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };

				var message = 'Startable has already been destroyed and cannot be used.';
				var destroyed = this._isLifeState(STATES.DESTROYED);
				if (opts.throwError && destroyed) {
					throw new _YatError2.default({
						name: 'StartableLifecycleError',
						message: message
					});
				} else if (destroyed) {
					return message;
				}
			}
		}, {
			key: '_ensureStartableIsIdle',
			value: function _ensureStartableIsIdle() {
				var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };

				var message = 'Startable is not idle. current state: ' + this._getLifeState();
				var isNotIntact = this._ensureStartableIsIntact(opts);
				var notIdle = this._isInProcess();
				if (opts.throwError && notIdle) {
					throw new _YatError2.default({
						name: 'StartableLifecycleError',
						message: message
					});
				} else if (isNotIntact) {
					return isNotIntact;
				} else if (notIdle) {
					return message;
				}
			}
		}, {
			key: '_ensureStartableCanBeStarted',
			value: function _ensureStartableCanBeStarted() {
				var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };


				var message = 'Startable has already been started.';
				var notIdle = this._ensureStartableIsIdle(opts);
				var allowStartWithoutStop = this.getProperty('allowStartWithoutStop') === true;
				if (!notIdle && allowStartWithoutStop) return;

				var running = this._isLifeState(STATES.RUNNING);
				if (opts.throwError && running) {
					throw new _YatError2.default({
						name: 'StartableLifecycleError',
						message: message
					});
				} else if (notIdle) {
					return notIdle;
				} else if (running) {
					return message;
				}
			}
		}, {
			key: '_ensureStartableCanBeStopped',
			value: function _ensureStartableCanBeStopped() {
				var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { throwError: false };


				var message = 'Startable should be in `running` state.';
				var notIdle = this._ensureStartableIsIdle(opts);

				var allowStopWithoutStart = this.getProperty('allowStopWithoutStart') === true;
				if (!notIdle && allowStopWithoutStart) return;

				var running = this._isLifeState(STATES.RUNNING);

				if (opts.throwError && !running) {
					throw new _YatError2.default({
						name: 'StartableLifecycleError',
						message: message
					});
				} else if (notIdle) {
					return notIdle;
				} else if (!running) {
					return message;
				}
			}
		}, {
			key: '_getStartPromise',
			value: function _getStartPromise() {
				return Promise.all(this._getStartPromises());
			}
		}, {
			key: '_getStartPromises',
			value: function _getStartPromises() {
				var promises = [];
				promises.push(this._getStartUserPromise());
				promises.push(this._getStartParentPromise());
				return promises;
			}
		}, {
			key: '_getStartUserPromise',
			value: function _getStartUserPromise() {
				return getPropertyPromise(this, 'startPromises');
			}
		}, {
			key: '_getStartParentPromise',
			value: function _getStartParentPromise() {
				var parent = _underscore2.default.result(this, 'getParent');
				if (_underscore2.default.isObject(parent) && _underscore2.default.isFunction(parent._getStartPromise)) return parent._getStartPromise();
			}
		}, {
			key: '_getStopPromise',
			value: function _getStopPromise() {
				return Promise.all(this._getStopPromises());
			}
		}, {
			key: '_getStopPromises',
			value: function _getStopPromises() {
				var promises = [];
				promises.push(this._getStopUserPromise());
				return promises;
			}
		}, {
			key: '_getStopUserPromise',
			value: function _getStopUserPromise() {
				return getPropertyPromise(this, 'stopPromises');
			}
		}, {
			key: '_getStopParentPromise',
			value: function _getStopParentPromise() {
				var parent = _underscore2.default.result(this, 'getParent');
				if (_underscore2.default.isObject(parent) && _underscore2.default.isFunction(parent._getStopPromise)) return parent._getStartPromise();
			}
		}]);

		return Mixin;
	}((0, _mixin2.default)(Base).with(_stateable2.default));

	Mixin.Startable = true;

	return Mixin;
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _backbone = __webpack_require__(1);

var _backbone2 = _interopRequireDefault(_backbone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_Mn$Error) {
	_inherits(_class, _Mn$Error);

	function _class() {
		var _ref;

		_classCallCheck(this, _class);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args)));
	}

	return _class;
}(_backbone2.default.Error);

exports.default = _class;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Base) {
	return function (_Base) {
		_inherits(_class, _Base);

		function _class() {
			_classCallCheck(this, _class);

			return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
		}

		_createClass(_class, [{
			key: 'getName',
			value: function getName() {
				return this.getProperty('name') || this.id || this.cid;
			}
		}, {
			key: 'getLabel',
			value: function getLabel() {
				return this.getProperty('label') || this.getName();
			}
		}]);

		return _class;
	}(Base);
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _backbone = __webpack_require__(1);

var _backbone2 = _interopRequireDefault(_backbone);

var _YatPage = __webpack_require__(11);

var _YatPage2 = _interopRequireDefault(_YatPage);

var _YatApp = __webpack_require__(3);

var _YatApp2 = _interopRequireDefault(_YatApp);

var _YatObject = __webpack_require__(17);

var _YatObject2 = _interopRequireDefault(_YatObject);

var _YatError = __webpack_require__(8);

var _YatError2 = _interopRequireDefault(_YatError);

var _YatRouter = __webpack_require__(4);

var _YatRouter2 = _interopRequireDefault(_YatRouter);

var _YatPageManager = __webpack_require__(18);

var _YatPageManager2 = _interopRequireDefault(_YatPageManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var marionetteYat = {
  //   greet() {
  //     return 'hello';
  //   },
  Error: _YatError2.default,
  Object: _YatObject2.default,
  App: _YatApp2.default,
  Page: _YatPage2.default,
  Router: _YatRouter2.default,
  PageManager: _YatPageManager2.default
};

_backbone2.default.Yat = marionetteYat;

exports.default = marionetteYat;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _YatApp = __webpack_require__(3);

var _YatApp2 = _interopRequireDefault(_YatApp);

var _mixin = __webpack_require__(2);

var _mixin2 = _interopRequireDefault(_mixin);

var _startable = __webpack_require__(7);

var _startable2 = _interopRequireDefault(_startable);

var _getNameLabel = __webpack_require__(9);

var _getNameLabel2 = _interopRequireDefault(_getNameLabel);

var _YatRouter = __webpack_require__(4);

var _YatRouter2 = _interopRequireDefault(_YatRouter);

var _backbone = __webpack_require__(16);

var _backbone2 = _interopRequireDefault(_backbone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_mixin$with) {
	_inherits(_class, _mixin$with);

	function _class() {
		var _ref;

		_classCallCheck(this, _class);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		var _this = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args)));

		_this.allowStopWithoutStart = true;
		_this.allowStartWithoutStop = true;
		_this.initializeYatPage();
		return _this;
	}

	_createClass(_class, [{
		key: 'initializeYatPage',
		value: function initializeYatPage(opts) {
			this._initializeModels(opts);
			this._initializeRoute(opts);
			this._tryCreateRouter();
			this._tryProxyToRadio();
		}
	}, {
		key: 'getLayout',
		value: function getLayout() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			if (!this._layoutView || opts.rebuild || this._layoutView && this._layoutView.isDestroyed && this._layoutView.isDestroyed()) {
				this.buildLayout();
			}
			return this._layoutView;
		}
	}, {
		key: 'buildLayout',
		value: function buildLayout() {
			var Layout = this.getProperty('Layout');
			if (Layout == null) return;
			var opts = _.extend({}, this.getProperty('layoutOptions'));

			if (this.model && !opts.model) _.extend(opts, { model: this.model });

			if (this.collection && !opts.collection) _.extend(opts, { collection: this.collection });

			var options = this.buildLayoutOptions(opts);
			options.page = this;
			this._layoutView = new Layout(options);
			return this._layoutView;
		}
	}, {
		key: 'buildLayoutOptions',
		value: function buildLayoutOptions(rawOptions) {
			return rawOptions;
		}
	}, {
		key: 'addModel',
		value: function addModel(model) {
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
		}
	}, {
		key: 'addCollection',
		value: function addCollection(collection) {
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
		}
	}, {
		key: 'getRouteHash',
		value: function getRouteHash() {
			var _ref2;

			var hashes = [{}, this._routeHandler].concat(this.getChildren().map(function (children) {
				return children.getRouteHash();
			}));
			return (_ref2 = _).extend.apply(_ref2, _toConsumableArray(hashes));
		}
	}, {
		key: 'hasRouteHash',
		value: function hasRouteHash() {
			return _.isObject(this.getRouteHash());
		}
	}, {
		key: '_initializeModels',
		value: function _initializeModels() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			this.addModel(opts.model, opts);
			this.addCollection(opts.collection, opts);
		}
	}, {
		key: '_initializeRoute',
		value: function _initializeRoute() {
			var _this2 = this;

			var route = this.getRoute();
			if (route == null) return;
			this._routeHandler = _defineProperty({}, route, { context: this, action: function action() {
					return _this2.start.apply(_this2, arguments);
				} });
		}
	}, {
		key: 'getRoute',
		value: function getRoute() {
			var relative = this.getProperty('relativeRoute');
			var route = this.getProperty('route');
			var parent = this.getParent();
			if (route == null) return;
			if (!relative || !parent || !parent.getRoute) return route;
			var parentRoute = parent.getRoute();
			if (parentRoute == null) return route;
			return parentRoute + '/' + route;
		}
	}, {
		key: '_tryCreateRouter',
		value: function _tryCreateRouter() {
			var create = this.getProperty('createRouter') === true;
			if (create) {
				this.router = this._createAppRouter();
			}
		}
	}, {
		key: '_createAppRouter',
		value: function _createAppRouter() {
			var hash = this.getRouteHash();
			if (!_.size(hash)) return;
			return new _YatRouter2.default(hash);
		}
	}, {
		key: '_tryProxyToRadio',
		value: function _tryProxyToRadio() {

			var channel = this.getChannel();
			if (!channel) return;

			this.on('all', this._proxyEventToRadio);
		}
	}, {
		key: '_proxyEventToRadio',
		value: function _proxyEventToRadio(eventName) {
			var allowed = this.getProperty('proxyEventsToRadio');

			for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
				args[_key2 - 1] = arguments[_key2];
			}

			if (!allowed || !allowed.length || allowed.indexOf(eventName)) this.radioTrigger.apply(this, ['page:' + eventName].concat(_toConsumableArray([this].concat(args))));
		}
	}]);

	return _class;
}((0, _mixin2.default)(_YatApp2.default).with(_getNameLabel2.default));

exports.default = _class;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _underscore = __webpack_require__(0);

var _underscore2 = _interopRequireDefault(_underscore);

var _backbone = __webpack_require__(13);

var _backbone2 = _interopRequireDefault(_backbone);

var _backbone3 = __webpack_require__(1);

var _backbone4 = _interopRequireDefault(_backbone3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//console.log('backbone', Bb != null);

var ctors = [_backbone2.default.Model, _backbone2.default.Collection, _backbone2.default.View, _backbone2.default.Router, _backbone4.default.Object];

exports.default = function (arg) {
	return _underscore2.default.isFunction(arg) && (0, _underscore2.default)(ctors).some(function (ctor) {
		return arg === ctor || arg.prototype instanceof ctor;
	});
};

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_13__;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = __webpack_require__(0);

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (BaseClass) {
	var Mixin = function (_BaseClass) {
		_inherits(Mixin, _BaseClass);

		function Mixin() {
			var _ref;

			_classCallCheck(this, Mixin);

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			var _this2 = _possibleConstructorReturn(this, (_ref = Mixin.__proto__ || Object.getPrototypeOf(Mixin)).call.apply(_ref, [this].concat(args)));

			_this2.initializeStateable();
			return _this2;
		}

		//static get Stateable() { return true; }

		_createClass(Mixin, [{
			key: 'initializeStateable',
			value: function initializeStateable() {
				this._state = {};
			}
		}, {
			key: 'getState',
			value: function getState(key) {
				var state = this._state;
				if (!key) return state;else return state[key];
			}
		}, {
			key: 'setState',
			value: function setState(key, value, options) {

				if (key == null) return;

				if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
					var _this = this;
					options = value;
					value = key;
					(0, _underscore2.default)(value).each(function (propertyValue, propertyName) {
						return _this.setState(propertyName, propertyValue, options);
					});
					this._triggerStateChange(value, options);
				} else {
					var state = this.getState();
					state[key] = value;
					this._triggerStateChange(key, value, options);
				}
			}
		}, {
			key: '_triggerStateChange',
			value: function _triggerStateChange(key, value, options) {

				if (!_underscore2.default.isFunction(this.triggerMethod)) return;

				if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) !== 'object') {
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
		}]);

		return Mixin;
	}(BaseClass);

	Mixin.Stateable = true;

	return Mixin;
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = __webpack_require__(0);

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CHILDREN_FIELD = '_children';

exports.default = function (Base) {
	var Mixin = function (_Base) {
		_inherits(Mixin, _Base);

		function Mixin() {
			var _ref;

			_classCallCheck(this, Mixin);

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			var _this = _possibleConstructorReturn(this, (_ref = Mixin.__proto__ || Object.getPrototypeOf(Mixin)).call.apply(_ref, [this].concat(args)));

			_this.initializeChildrenable.apply(_this, args);
			return _this;
		}

		_createClass(Mixin, [{
			key: 'initializeChildrenable',
			value: function initializeChildrenable() {
				var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

				this._initializeParrent(options);
				this._initializeChildren(options);
			}
		}, {
			key: 'hasChildren',
			value: function hasChildren() {
				var children = this.getChildren();
				return this[CHILDREN_FIELD].length > 0;
			}
		}, {
			key: 'getChildren',
			value: function getChildren() {
				return this[CHILDREN_FIELD] || [];
			}
		}, {
			key: 'hasParent',
			value: function hasParent() {
				var parent = this.getParent();
				return _underscore2.default.isObject(parent);
			}
		}, {
			key: 'getParent',
			value: function getParent() {
				return this.getProperty('parent', { deep: false });
			}
		}, {
			key: '_initializeChildren',
			value: function _initializeChildren() {
				var _this2 = this;

				var _children = this.getProperty('children');
				this[CHILDREN_FIELD] = (0, _underscore2.default)(_children).map(function (child) {

					var childContext = _this2._normalizeChildContext(child);
					if (childContext == null || !_underscore2.default.isFunction(childContext.Child)) return;

					var opts = _underscore2.default.extend({}, childContext);
					if (_this2.getOption('passToChildren') === true) {
						_underscore2.default.extend(opts, _this2.options);
					}
					opts.parent = _this2;

					delete opts.Child;

					return new childContext.Child(opts);
				}).filter(function (f) {
					return f != null;
				});
			}
		}, {
			key: '_normalizeChildContext',
			value: function _normalizeChildContext(child) {
				var childOptions = this.getChildOptions();
				var childContext = {};

				if (_underscore2.default.isFunction(child) && child.Childrenable) {
					_underscore2.default.extend(childContext, { Child: child }, childOptions);
				} else if (_underscore2.default.isFunction(child)) {
					childContext = this._normalizeChildContext(child.call(this));
				} else if (_underscore2.default.isObject(child)) {
					childContext = child;
				}

				return childContext;
			}
		}, {
			key: 'getChildOptions',
			value: function getChildOptions() {
				var opts = this.getProperty('childOptions');
				return opts;
			}
		}, {
			key: '_initializeParrent',
			value: function _initializeParrent(opts) {
				if (this.parent == null && opts.parent != null) this.parent = opts.parent;
			}
		}]);

		return Mixin;
	}(Base);

	Mixin.Childrenable = true;

	return Mixin;
};

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_16__;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _backbone = __webpack_require__(1);

var _backbone2 = _interopRequireDefault(_backbone);

var _mixin = __webpack_require__(2);

var _mixin2 = _interopRequireDefault(_mixin);

var _getOptionProperty = __webpack_require__(5);

var _getOptionProperty2 = _interopRequireDefault(_getOptionProperty);

var _radio = __webpack_require__(6);

var _radio2 = _interopRequireDefault(_radio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_mixin$with) {
	_inherits(_class, _mixin$with);

	function _class() {
		var _ref;

		_classCallCheck(this, _class);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args)));
	}

	return _class;
}((0, _mixin2.default)(_backbone2.default.Object).with(_getOptionProperty2.default, _radio2.default));

exports.default = _class;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _YatApp = __webpack_require__(3);

var _YatApp2 = _interopRequireDefault(_YatApp);

var _getNameLabel = __webpack_require__(9);

var _getNameLabel2 = _interopRequireDefault(_getNameLabel);

var _YatRouter = __webpack_require__(4);

var _YatRouter2 = _interopRequireDefault(_YatRouter);

var _mixin = __webpack_require__(2);

var _mixin2 = _interopRequireDefault(_mixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var YatPageManager = function (_mixin$with) {
	_inherits(YatPageManager, _mixin$with);

	function YatPageManager() {
		var _ref;

		_classCallCheck(this, YatPageManager);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		var _this = _possibleConstructorReturn(this, (_ref = YatPageManager.__proto__ || Object.getPrototypeOf(YatPageManager)).call.apply(_ref, [this].concat(args)));

		_this._initializeYatPageManager.apply(_this, args);
		return _this;
	}

	_createClass(YatPageManager, [{
		key: 'getChildOptions',
		value: function getChildOptions() {
			var opts = _get(YatPageManager.prototype.__proto__ || Object.getPrototypeOf(YatPageManager.prototype), 'getChildOptions', this).call(this) || {};
			opts.channel = this.getChannel();
			opts.passToChildren = true;
			return opts;
		}
	}, {
		key: 'createRouter',
		value: function createRouter() {
			var children = this.getChildren();
			var hash = {};
			_(children).each(function (page) {
				if (_.isFunction(page.getRouteHash)) {
					_.extend(hash, page.getRouteHash());
				}
			});
			this.setRouter(new _YatRouter2.default(hash));
		}
	}, {
		key: 'setRouter',
		value: function setRouter(router) {
			this.router = router;
		}
	}, {
		key: 'getRouter',
		value: function getRouter() {
			return this.router;
		}
	}, {
		key: '_initializeYatPageManager',
		value: function _initializeYatPageManager() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			this.mergeOptions(opts, ['id', 'name', 'label']);
			this._initPageManagerRadio(opts);
			this.createRouter();
		}
	}, {
		key: 'getChannel',
		value: function getChannel() {
			if (!this._channel) this._initPageManagerRadio(this.options);
			return this._channel;
		}
	}, {
		key: '_initPageManagerRadio',
		value: function _initPageManagerRadio() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			if (this._radioInitialized) return;

			this.mergeOptions(opts, ['channel', 'channelName']);
			//let channel = super.getChannel();
			var name = this.getName();
			if (!this._channel && name) {
				this.channelName = 'pagemanager:' + name;
				_get(YatPageManager.prototype.__proto__ || Object.getPrototypeOf(YatPageManager.prototype), '_initRadio', this).call(this, { skip: false });
			}
			this._registerRadioHandlers();
			this._proxyRadioEvents();
			this._radioInitialized = true;
		}
	}, {
		key: '_registerRadioHandlers',
		value: function _registerRadioHandlers() {
			var channel = this.getChannel();
			if (this._radioHandlersRegistered || !channel) return;

			this.listenTo(channel, 'page:before:start', this._pageBeforeStart);
			this.listenTo(channel, 'page:start', this._pageStart);

			this._radioHandlersRegistered = true;
		}
	}, {
		key: '_proxyRadioEvents',
		value: function _proxyRadioEvents() {
			var _this2 = this;

			var channel = this.getChannel();
			if (this._radioEventsProxied || !channel) return;

			var proxyRadioEvents = this.getProperty('proxyRadioEvents') || [];
			_(['page:before:start', 'page:start'].concat(proxyRadioEvents)).each(function (event) {
				_this2.listenTo(channel, event, function () {
					for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
						args[_key2] = arguments[_key2];
					}

					return _this2.triggerMethod.apply(_this2, [event].concat(args));
				});
			});

			this._radioEventsProxied = true;
		}
	}, {
		key: '_pageBeforeStart',
		value: function _pageBeforeStart(page) {
			var current = this.getState('currentPage');
			if (current && current != page) {
				current.stop();
			}
		}
	}, {
		key: '_pageStart',
		value: function _pageStart(page) {
			this.setState('currentPage', page);
		}
	}, {
		key: 'initRadioOnInitialize',
		get: function get() {
			return false;
		}
	}]);

	return YatPageManager;
}((0, _mixin2.default)(_YatApp2.default).with(_getNameLabel2.default));

exports.default = YatPageManager;

/***/ })
/******/ ]);
});
//# sourceMappingURL=marionette.yat.js.map