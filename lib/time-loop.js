(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("TimeLoop", [], factory);
	else if(typeof exports === 'object')
		exports["TimeLoop"] = factory();
	else
		root["TimeLoop"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileOverview Javascript time-based events handler
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author <a href="mailto:perrine.boissieres@gmail.com">Perrine Boissières</a>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @version 2.0.0
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
	
	var _timer = __webpack_require__(1);
	
	var _timer2 = _interopRequireDefault(_timer);
	
	var _tools = __webpack_require__(2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var currentTime = void 0;
	var fpsCurrentTime = void 0;
	var ev = void 0;
	var i = void 0;
	var prom = void 0;
	
	/**
	 * @class
	 */
	
	var TimeLoop = function () {
	  _createClass(TimeLoop, [{
	    key: 'time',
	
	    /** @type Number */
	    get: function get() {
	      return Date.now();
	    }
	
	    /**
	     * @constructor
	     */
	
	  }]);
	
	  function TimeLoop() {
	    var _this = this;
	
	    _classCallCheck(this, TimeLoop);
	
	    /** @type Array */
	    this.timers = [];
	
	    /** @type Number */
	    this.elapsedTime = 0;
	
	    /** @type Number */
	    this.lastTime = 0;
	
	    /** @type boolean */
	    this.paused = true;
	
	    /** @type boolean */
	    this.started = false;
	
	    /** @type boolean */
	    this.sortable = false;
	
	    /** @type boolean */
	    this.autoSort = true;
	
	    /** @type String */
	    this.defaultNamespace = 'all';
	
	    /** @type Number */
	    this.fps = 0;
	
	    /** @type Number */
	    this.fpsLastTime = 0;
	
	    /** @type Number */
	    this.frameCount = 0;
	
	    /** @type function */
	    this.proxyStep = this.step.bind(this);
	
	    // If the browser supports the visibilityChange API, we bind the event
	    // to stop and re-start the loop automatically
	    if (typeof document.hidden !== 'undefined') {
	      document.addEventListener('visibilitychange', function () {
	        if (document.hidden) _this.pause();else _this.start();
	      }, false);
	    }
	  }
	
	  /**
	   * @method step
	   * Updates all registered timers
	   */
	
	
	  _createClass(TimeLoop, [{
	    key: 'step',
	    value: function step() {
	      var _this2 = this;
	
	      if (this.paused) return;
	
	      if (this.autoSort && this.sortable) {
	        this.sort();
	        this.sortable = false;
	      }
	
	      currentTime = fpsCurrentTime = this.time;
	      this.elapsedTime = currentTime - this.lastTime;
	      this.lastTime = currentTime;
	      this.frameCount++;
	
	      if (fpsCurrentTime - 1000 > this.fpsLastTime) {
	        this.fps = this.frameCount;
	        this.frameCount = 0;
	        this.fpsLastTime = fpsCurrentTime;
	      }
	
	      this.timers.map(function (e) {
	        if (!e.paused && !e.ended) e.update(_this2.elapsedTime);
	        return e;
	      });
	
	      window.requestAnimationFrame(this.proxyStep);
	    }
	
	    /**
	     * @method start
	     * Starts the loop if not already started
	     */
	
	  }, {
	    key: 'start',
	    value: function start() {
	      if (!this.paused) return; // If already started, we quit
	
	      this.lastTime = this.time;
	      this.fpsLastTime = this.time;
	      this.elapsedTime = 0;
	      this.paused = false;
	      this.frameCount = 0;
	
	      if (!this.started) {
	        this.started = true;
	        window.requestAnimationFrame(this.proxyStep);
	      }
	    }
	
	    /**
	     * @method pause
	     * Pauses the loop
	     * @return {TimeLoop} chainable
	     */
	
	  }, {
	    key: 'pause',
	    value: function pause() {
	      this.paused = true;
	      return this;
	    }
	
	    /**
	     * @method resume
	     * Alias for start method
	     * @return {TimeLoop} chainable
	     */
	
	  }, {
	    key: 'resume',
	    value: function resume() {
	      this.start();
	      return this;
	    }
	
	    /**
	     * @method sort
	     * Sorts timers by priority
	     * @return {TimeLoop} chainable
	     */
	
	  }, {
	    key: 'sort',
	    value: function sort() {
	      this.timers.sort(_tools.orderByPriority);
	      return this;
	    }
	
	    /**
	     * @method createPool
	     * Creates a given number of empty timers
	     * @param {Number} nb The number of timers to create
	     * @return {TimeLoop} chainable
	     */
	
	  }, {
	    key: 'createPool',
	    value: function createPool(nb) {
	      if (this.timers.length) {
	        throw new Error('Timers have already been created, cannot pre-allocate.');
	      }
	
	      this.timers = new Array(nb);
	
	      for (i = 0; i < nb; i++) {
	        ev = new _timer2.default();
	        ev.ended = true;
	        this.timers[i] = ev;
	      }
	
	      return this;
	    }
	
	    /**
	     * @method createTimer
	     * Creates a new timer, from pool if available
	     * @param {function} cb Callback function to execute
	     * @param {Object} options Parameters
	     * @param {Object} ctx Context for callback execution
	     * @return {Timer} Newly created timer
	     */
	
	  }, {
	    key: 'createTimer',
	    value: function createTimer(cb, options, ctx) {
	      ev = this.getFromPool();
	
	      if (options.namespace) options.namespace = this.defaultNamespace + '.' + options.namespace;else options.namespace = this.defaultNamespace;
	
	      if (ev) {
	        ev.callback = cb;
	        ev.context = ctx || window;
	        ev.ended = false;
	        ev.paused = false;
	        return ev.options(options);
	      }
	
	      ev = new _timer2.default(cb, options, ctx);
	      this.timers.push(ev);
	
	      this.sortable = true;
	
	      return ev;
	    }
	
	    /**
	     * @method getFromPool
	     * Retrieves an ended event from the pool, returns false if none is found
	     * @return {Timer|bool}
	     */
	
	  }, {
	    key: 'getFromPool',
	    value: function getFromPool() {
	      for (i = 0; i < this.timers.length; i++) {
	        ev = this.timers[i];
	        if (ev.ended) return ev;
	      }
	
	      return false;
	    }
	
	    /**
	     * @method namespace
	     * Retrieves timers under given namespace, can execute an action on all of them
	     * @param {String} namespace Namespace
	     * @param {String} action Optional action name (start, pause, end)
	     * @return {Array} Array of timers
	     */
	
	  }, {
	    key: 'namespace',
	    value: function namespace(_namespace, action) {
	      var match = [];
	
	      this.timers.map(function (e) {
	        if (!e.ended && (0, _tools.checkNamespace)(e, _namespace)) {
	          if (action && action === 'resume') e.resume();else if (action && action === 'pause') e.pause();else if (action && action === 'reset') e.reset();else if (action && action === 'end') e.end();
	
	          match.push(e);
	        }
	        return e;
	      });
	
	      return match;
	    }
	
	    /**
	     * @function wait
	     * Creates a timeout and returns a promise
	     * @param {Number} time=0 The time to wait before resolving
	     * @return {Promise}
	     */
	
	  }, {
	    key: 'wait',
	    value: function wait() {
	      var _this3 = this;
	
	      var time = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      prom = new Promise(function (resolve) {
	        _this3.createTimer(function () {
	          return resolve();
	        }, {
	          type: 'timeout',
	          time: time
	        });
	      });
	
	      return prom;
	    }
	
	    /**
	     * @function repeat
	     * Creates an interval
	     * @param {function} callback The callback function
	     * @param {Number} time=0 The time to wait between calls
	     * @return {Timer}
	     */
	
	  }, {
	    key: 'repeat',
	    value: function repeat(callback) {
	      var time = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	
	      return this.createTimer(callback, {
	        type: 'interval',
	        time: time
	      }, this);
	    }
	  }]);
	
	  return TimeLoop;
	}();
	
	exports.default = TimeLoop;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _tools = __webpack_require__(2);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * @class
	 */
	
	var Timer = function () {
	  _createClass(Timer, [{
	    key: 'defaultOptions',
	
	
	    /** @type Object */
	    get: function get() {
	      return {
	        type: 'timeout',
	        time: 0,
	        priority: 1,
	        namespace: ''
	      };
	    }
	
	    /**
	     * @constructor
	     * @param {function} cb The callback to be delayed or repeated
	     * @param {Object} options A list of options
	     * @param {Object} ctx The context of the callback's execution
	     */
	
	  }]);
	
	  function Timer(cb, options, ctx) {
	    _classCallCheck(this, Timer);
	
	    /** @type Object */
	    this.settings = (0, _tools.extendOptions)(this.defaultOptions, options);
	
	    /** @type boolean */
	    this.paused = false;
	
	    /** @type boolean */
	    this.ended = false;
	
	    /** @type function */
	    this.callback = cb || undefined;
	
	    /** @type Object */
	    this.context = ctx || window;
	
	    /** @type Number */
	    this.elapsedTime = 0;
	  }
	
	  /**
	   * @method options
	   * Changes the options of an existing Timer
	   * @param {Object} options A list of options
	   * @param {bool} reset=true false if you don't want to reset all current options
	   * @return {Timer} chainable
	   */
	
	
	  _createClass(Timer, [{
	    key: 'options',
	    value: function options(_options) {
	      var reset = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
	
	      if (!reset) this.settings = (0, _tools.extendOptions)(this.settings, _options);else this.settings = (0, _tools.extendOptions)(this.defaultOptions, _options);
	      return this;
	    }
	
	    /**
	     * @method update
	     * Adds the elapsed time since last call
	     * @param {Number} ms Number of ms passed
	     */
	
	  }, {
	    key: 'update',
	    value: function update(ms) {
	      if (this.paused || this.ended) return;
	
	      this.elapsedTime += ms;
	      if (this.elapsedTime >= this.settings.time) {
	        this.callback.call(this.context);
	        this.elapsedTime = 0;
	        if (this.settings.type === 'timeout') this.ended = true;
	      }
	    }
	
	    /**
	     * @method pause
	     * Pauses the event
	     * @return {Timer} chainable
	     */
	
	  }, {
	    key: 'pause',
	    value: function pause() {
	      this.paused = true;
	      return this;
	    }
	
	    /**
	     * @method resume
	     * Resumes the event
	     * @return {Timer} chainable
	     */
	
	  }, {
	    key: 'resume',
	    value: function resume() {
	      this.paused = false;
	      return this;
	    }
	
	    /**
	     * @method reset
	     * Resets internal elapsed time to 0
	     * @return {Timer} chainable
	     */
	
	  }, {
	    key: 'reset',
	    value: function reset() {
	      this.elapsedTime = 0;
	      return this;
	    }
	
	    /**
	     * @method end
	     * Stops the event
	     * @return {Timer} chainable
	     */
	
	  }, {
	    key: 'end',
	    value: function end() {
	      this.ended = true;
	      return this;
	    }
	  }]);
	
	  return Timer;
	}();
	
	exports.default = Timer;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.escapeRegExp = escapeRegExp;
	exports.checkNamespace = checkNamespace;
	exports.orderByPriority = orderByPriority;
	exports.extendOptions = extendOptions;
	/**
	 * @function escapeRegExp
	 * Escapes all RegExp special characters from a string
	 * @param {String} str The string to escape
	 * @return {String}
	 */
	function escapeRegExp(str) {
	  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
	}
	
	/**
	 * @function checkNamespace
	 * Returns true if the timer object is in given namespace
	 * @param {Timer} timer
	 * @param {String} namespace
	 * @return {boolean}
	 */
	function checkNamespace(timer, namespace) {
	  var reg = new RegExp('^' + escapeRegExp(namespace));
	
	  if (reg.test(timer.settings.namespace)) return true;
	
	  return false;
	}
	
	/**
	 * @function orderByPriority
	 * To pass to a sort method to order a list of timers by priority
	 * @param {Timer} ev1
	 * @param {Timer} ev2
	 * @return {Number}
	 */
	function orderByPriority(ev1, ev2) {
	  return ev2.settings.priority - ev1.settings.priority;
	}
	
	/**
	 * @function extendOptions
	 * Extends en object with another object
	 * @param {Object} defaults Basic object to override
	 * @param {Object} options Object that overrides the default one
	 * @return {Object} The new extended object
	 */
	function extendOptions(defaults, options) {
	  if (!options) return defaults;
	
	  var extended = {};
	
	  // eslint-disable-next-line
	  for (var i in defaults) {
	    if ({}.hasOwnProperty.call(defaults, i)) {
	      extended[i] = defaults[i];
	    }
	  }
	  // eslint-disable-next-line
	  for (var j in options) {
	    if ({}.hasOwnProperty.call(options, j)) {
	      extended[j] = options[j];
	    }
	  }
	
	  return extended;
	}

/***/ }
/******/ ])
});
;
//# sourceMappingURL=time-loop.js.map