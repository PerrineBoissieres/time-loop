/**
 * @fileOverview Javascript time-based events handler
 * @author <a href="mailto:perrine.boissieres@gmail.com">Perrine Boissières</a>
 * @version 2.0.0
 */

import Timer from './timer';
import { checkNamespace, orderByPriority } from './tools';

let currentTime;
let fpsCurrentTime;
let ev;
let i;
let prom;

/**
 * @class
 */
export default class TimeLoop {
  /** @type Number */
  get time() { return Date.now(); }

  /**
   * @constructor
   */
  constructor() {
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
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.pause();
        else this.start();
      }, false);
    }
  }

  /**
   * @method step
   * Updates all registered timers
   */
  step() {
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

    this.timers.map((e) => {
      if (!e.paused && !e.ended) e.update(this.elapsedTime);
      return e;
    });

    window.requestAnimationFrame(this.proxyStep);
  }

  /**
   * @method start
   * Starts the loop if not already started
   */
  start() {
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
  pause() {
    this.paused = true;
    return this;
  }

  /**
   * @method resume
   * Alias for start method
   * @return {TimeLoop} chainable
   */
  resume() {
    this.start();
    return this;
  }

  /**
   * @method sort
   * Sorts timers by priority
   * @return {TimeLoop} chainable
   */
  sort() {
    this.timers.sort(orderByPriority);
    return this;
  }

  /**
   * @method createPool
   * Creates a given number of empty timers
   * @param {Number} nb The number of timers to create
   * @return {TimeLoop} chainable
   */
  createPool(nb) {
    if (this.timers.length) {
      throw new Error('Timers have already been created, cannot pre-allocate.');
    }

    this.timers = new Array(nb);

    for (i = 0; i < nb; i++) {
      ev = new Timer();
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
  createTimer(cb, options, ctx) {
    ev = this.getFromPool();

    if (options.namespace) options.namespace = `${this.defaultNamespace}.${options.namespace}`;
    else options.namespace = this.defaultNamespace;

    if (ev) {
      ev.callback = cb;
      ev.context = ctx || window;
      ev.ended = false;
      ev.paused = false;
      return ev.options(options);
    }

    ev = new Timer(cb, options, ctx);
    this.timers.push(ev);

    this.sortable = true;

    return ev;
  }

  /**
   * @method getFromPool
   * Retrieves an ended event from the pool, returns false if none is found
   * @return {Timer|bool}
   */
  getFromPool() {
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
  namespace(namespace, action) {
    const match = [];

    this.timers.map((e) => {
      if (!e.ended && checkNamespace(e, namespace)) {
        if (action && action === 'resume') e.resume();
        else if (action && action === 'pause') e.pause();
        else if (action && action === 'reset') e.reset();
        else if (action && action === 'end') e.end();

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
  wait(time = 0) {
    prom = new Promise((resolve) => {
      this.createTimer(() => resolve(), {
        type: 'timeout',
        time,
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
  repeat(callback, time = 0) {
    return this.createTimer(callback, {
      type: 'interval',
      time,
    }, this);
  }
}
