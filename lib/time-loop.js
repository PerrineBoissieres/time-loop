/******/ (function(modules) { // webpackBootstrap
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
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _timer = __webpack_require__(1);
	
	var _timer2 = _interopRequireDefault(_timer);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var reg = void 0;
	var currentTime = void 0;
	var fpsCurrentTime = void 0;
	var ev = void 0;
	var i = void 0;
	var prom = void 0;
	
	function escapeRegExp(str) {
	  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
	}
	function checkNamespace(timer, namespace) {
	  reg = new RegExp('^' + escapeRegExp(namespace));
	
	  if (reg.test(timer.namespace)) return true;
	
	  return false;
	}
	function orderByPriority(ev1, ev2) {
	  return ev2.options.priority - ev1.options.priority;
	}
	
	var TimeLoop = function () {
	  _createClass(TimeLoop, [{
	    key: 'time',
	    get: function get() {
	      return Date.now();
	    }
	  }]);
	
	  function TimeLoop() {
	    var _this = this;
	
	    _classCallCheck(this, TimeLoop);
	
	    this.timers = [];
	    this.elapsedTime = 0;
	    this.lastTime = 0;
	    this.paused = true;
	    this.started = false;
	    this.sortable = false;
	    this.autoSort = true;
	    this.defaultNamespace = 'all';
	
	    this.fps = 0;
	    this.fpsLastTime = 0;
	    this.frameCount = 0;
	
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
	      this.timers.sort(orderByPriority);
	      return this;
	    }
	
	    /**
	     * @method createPool
	     * Creates a given number of empty timers
	     * @param {Number} The number of timers to create
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
	     * @param {function} callback function to execute
	     * @param {Object} parameters
	     * @param {Object} context for callback execution
	     * @return {Timer} newly created timer
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
	     * @param {String} namespace
	     * @param {String} optional action name (start, pause, end)
	     * @return {Array} array of timers
	     */
	
	  }, {
	    key: 'namespace',
	    value: function namespace(_namespace, action) {
	      var match = [];
	
	      this.timers.map(function (e) {
	        if (!e.ended && checkNamespace(e, _namespace)) {
	          if (action && action === 'start') e.paused = false;else if (action && action === 'pause') e.paused = true;else if (action && action === 'end') e.ended = true;
	
	          match.push(e);
	        }
	      });
	
	      return match;
	    }
	
	    /**
	     * @function wait
	     * Creates a timeout and returns a promise
	     * @param {Number} The time to wait before resolving
	     * @return {Promise}
	     */
	
	  }, {
	    key: 'wait',
	    value: function wait(time) {
	      var _this3 = this;
	
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
	     * @param {function} The callback function
	     * @param {Number} The time to wait between calls
	     * @return {Timer}
	     */
	
	  }, {
	    key: 'repeat',
	    value: function repeat(callback) {
	      var time = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	
	      return this.createTimer({
	        type: 'interval',
	        time: time
	      }, callback, this);
	    }
	  }]);
	
	  return TimeLoop;
	}();
	
	exports.default = TimeLoop;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Timer = function () {
	  _createClass(Timer, [{
	    key: 'defaultOptions',
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
	
	    this.settings = extendOptions(this.defaultOptions, options);
	    this.paused = false;
	    this.ended = false;
	    this.callback = cb || undefined;
	    this.context = ctx || window;
	    this.elapsedTime = 0;
	  }
	
	  /**
	   * @method options
	   * Changes the options of an existing Timer
	   * @param {Object} A list of options
	   * @param {bool} false if you don't want to reset all current options
	   * @return {Timer} chainable
	   */
	
	
	  _createClass(Timer, [{
	    key: 'options',
	    value: function options(_options) {
	      var reset = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
	
	      if (!reset) this.settings = extendOptions(this.settings, _options);else this.settings = extendOptions(this.defaultOptions, _options);
	      return this;
	    }
	
	    /**
	     * @method update
	     * Adds the elapsed time since last call
	     * @param {Number} Number of ms passed
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

/***/ }
/******/ ]);
//# sourceMappingURL=time-loop.js.map