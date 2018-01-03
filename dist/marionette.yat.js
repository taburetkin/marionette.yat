(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("underscore"), require("backbone.marionette"));
	else if(typeof define === 'function' && define.amd)
		define(["underscore", "backbone.marionette"], factory);
	else if(typeof exports === 'object')
		exports["marionetteYat"] = factory(require("underscore"), require("backbone.marionette"));
	else
		root["marionetteYat"] = factory(root["underscore"], root["backbone.marionette"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_4__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _underscore = __webpack_require__(1);

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

var _Module = __webpack_require__(3);

var _Module2 = _interopRequireDefault(_Module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var marionetteYat = {
  greet: function greet() {
    return 'hello';
  },

  Module: _Module2.default
};

exports.default = marionetteYat;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _backbone = __webpack_require__(4);

var _backbone2 = _interopRequireDefault(_backbone);

var _mixin = __webpack_require__(0);

var _mixin2 = _interopRequireDefault(_mixin);

var _startable = __webpack_require__(5);

var _startable2 = _interopRequireDefault(_startable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_mixin$with) {
	_inherits(_class, _mixin$with);

	function _class() {
		_classCallCheck(this, _class);

		var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

		_this.initializeModule();
		return _this;
	}

	_createClass(_class, [{
		key: 'initializeModule',
		value: function initializeModule() {}
	}]);

	return _class;
}((0, _mixin2.default)(_backbone2.default.Application).with(_startable2.default));

exports.default = _class;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _mixin = __webpack_require__(0);

var _mixin2 = _interopRequireDefault(_mixin);

var _stateable = __webpack_require__(6);

var _stateable2 = _interopRequireDefault(_stateable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Base) {
	return function (_mixin$with) {
		_inherits(_class, _mixin$with);

		function _class() {
			var _ref;

			_classCallCheck(this, _class);

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			var _this = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args)));

			_this.initializeStartable();
			return _this;
		}

		_createClass(_class, [{
			key: 'initializeStartable',
			value: function initializeStartable() {
				if (!this.constructor.Startable) return;

				this.setState('state', 'initialized');

				this.on('before:start', this._onBeforeModuleStart);
				this.on('start', this._onModuleStart);
				this.on('before:stop', this._onBeforeModuleStop);
				this.on('stop', this._onModuleStop);
			}
		}, {
			key: '_onBeforeModuleStart',
			value: function _onBeforeModuleStart() {
				this.setState('state', 'starting');
			}
		}, {
			key: '_onModuleStart',
			value: function _onModuleStart() {
				this.setState('state', 'runing');
			}
		}, {
			key: '_onBeforeModuleStop',
			value: function _onBeforeModuleStop() {
				this.setState('state', 'stoping');
			}
		}, {
			key: '_onModuleStop',
			value: function _onModuleStop() {
				this.setState('state', 'waiting');
			}
		}, {
			key: 'start',
			value: function start(options) {
				var state = this.getState('state');
				if (['starting', 'runing'].indexOf(state) >= 0) return;

				return _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'start', this) ? _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'start', this).call(this, options) : this;
			}
		}, {
			key: 'stop',
			value: function stop(options) {
				var state = this.getState('state');
				if (['starting', 'runing'].indexOf(state) >= 0) return;

				this.triggerMethod('before:stop', this, options);
				this.triggerMethod('stop', this, options);
				return this;
			}
		}], [{
			key: 'Startable',
			get: function get() {
				return this.constructor.Stateable && _.isFunction(this.on);
			}
		}]);

		return _class;
	}((0, _mixin2.default)(Base).with(_stateable2.default));
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = __webpack_require__(1);

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (BaseClass) {
	return function (_BaseClass) {
		_inherits(_class, _BaseClass);

		function _class() {
			var _ref;

			_classCallCheck(this, _class);

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			var _this2 = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args)));

			_this2.initializeStateable();
			return _this2;
		}

		_createClass(_class, [{
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
		}], [{
			key: 'Stateable',
			get: function get() {
				return true;
			}
		}]);

		return _class;
	}(BaseClass);
};

/***/ })
/******/ ]);
});
//# sourceMappingURL=marionette.yat.js.map