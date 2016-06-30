import Timer from './timer';

let reg;
let currentTime;
let fpsCurrentTime;
let ev;
let i;
let prom;

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

export default class TimeLoop {
  get time() { return Date.now(); }

  constructor() {
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
   * @param {Number} The number of timers to create
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
   * @param {function} callback function to execute
   * @param {Object} parameters
   * @param {Object} context for callback execution
   * @return {Timer} newly created timer
   */
  createTimer(cb, options, ctx) {
    ev = this.getFromPool();

    if (options.namespace) options.namespace = this.defaultNamespace + '.' + options.namespace;
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
   * @param {String} namespace
   * @param {String} optional action name (start, pause, end)
   * @return {Array} array of timers
   */
  namespace(namespace, action) {
    const match = [];

    this.timers.map((e) => {
      if (!e.ended && checkNamespace(e, namespace)) {
        if (action && action === 'start') e.paused = false;
        else if (action && action === 'pause') e.paused = true;
        else if (action && action === 'end') e.ended = true;

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
  wait(time) {
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
   * @param {function} The callback function
   * @param {Number} The time to wait between calls
   * @return {Timer}
   */
  repeat(callback, time = 0) {
    return this.createTimer({
      type: 'interval',
      time,
    }, callback, this);
  }
}
