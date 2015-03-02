/*
 * TimeLoop 0.2
 *
 * © 2015 Perrine Boissières
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
(function (factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {

    define(factory);

  } else {

    window.timeLoop = factory();
  }

}(function() {
  'use strict';

  /**
   * cross-browser support for requestAnimationFrame API
   * @type (function)
   */
  var requestAnimFrame = (function() {

    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback) {

              window.setTimeout(callback, 1000 / 60);
            };
  })();

  /**
   * @var (string) hidden           cross-browser property from visibility API
   * @var (string) visibilityChange cross-browser event from visibility API
   */
  var hidden, visibilityChange;

  if(typeof document.hidden !== "undefined") {

    hidden = "hidden";
    visibilityChange = "visibilitychange";

  } else if(typeof document.mozHidden !== "undefined") {

    hidden = "mozHidden";
    visibilityChange = "mozvisibilitychange";

  } else if(typeof document.msHidden !== "undefined") {

    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";

  } else if(typeof document.webkitHidden !== "undefined") {

    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }


  var reg;
  var checkNamespace = function(event, namespace) {

    reg = new RegExp('^'+escapeRegExp(namespace));

    if(reg.test(event.namespace)) return true;

    return false;
  };

  var orderByPriority = function(ev1, ev2) {

    return ev2.priority - ev1.priority;
  };

  var escapeRegExp = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  };



  var i, ev, currentTime, evs;

  /**
   * @class TimeLoop
   * Stores and runs time-based events
   */
  var TimeLoop = function() {

    this.events = [];
    this.elapsedTime = 0;
    this.lastTime = 0;
    this.paused = false;
    this.sortable = false;
    this.autoSort = true;
    this.defaultNamespace = "all";

    this.debug = false;

    this.proxyStep = this.step.bind(this);

    var self = this;

    document.addEventListener(visibilityChange, function() {

      if (document[hidden]) self.pause();
      else self.start();

    }, false);
  };

  /**
   * Executed each frame
   */
  TimeLoop.prototype.step = function() {

    if(this.paused) return;

    if(this.autoSort && this.sortable) {

      this.sort();
      this.sortable = false;
    }

    currentTime = this.getTime();
    this.elapsedTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    evs = 0;

    for(i = 0; i < this.events.length; i++) {

      ev = this.events[i];

      if(!ev.paused && !ev.ended) ev.update(this.elapsedTime);
      if(!ev.ended) evs++;
    }

    // debug
    if(this.debug) {

      this.debug.totalEvents.innerTHML = this.events.length;
      this.debug.currentEvents.innerTHML = evs;
    }

    requestAnimFrame(this.proxyStep);
  };

  /**
   * Starts or restarts the time-loop
   * @return (TimeLoop) Instance for chaining
   */
  TimeLoop.prototype.start = function() {

    if(!this.paused) return; // If already started, we quit

    if(this.debug) console.log('[time-loop.js::start] Starting time loop');

    this.lastTime = this.getTime();
    this.elapsedTime = 0;
    this.paused = false;

    requestAnimFrame(this.proxyStep);

    return this;
  };

  /**
   * Pauses the time-loop
   * @return (TimeLoop) Instance for chaining
   */
  TimeLoop.prototype.pause = function() {

    if(this.debug) console.log('[time-loop.js::pause] Pausing time loop');

    this.paused = true;

    return this;
  };

  /**
   * Sorts events by priority (highest goes first)
   * @return (TimeLoop) Instance for chaining
   */
  TimeLoop.prototype.sort = function() {

    this.events.sort(orderByPriority);

    return this;
  };

  /**
   * Creates a starting pool of time events
   * @param (int) nb The number of time events to create
   * @return (TimeLoop) Instance for chaining
   */
  TimeLoop.prototype.createPool = function(nb) {

    if(this.events.length) throw new Error('Events have already been created, cannot pre-allocate.');

    this.events = new Array(nb);

    for(i = 0; i < nb; i++) {

      ev = new TimeEvent();
      ev.ended = true;

      this.events[i] = ev;
    }

    return this;
  };

  /**
   * Creates a new event, from pool if possible
   * @param (object) options The options for the time event
   * @param (function) cb The callback function
   * @return (TimeEvent) The new event instance
   */
  TimeLoop.prototype.createEvent = function(options, cb, ctx) {

    ev = this.getFromPool();

    if(options.namespace) options.namespace = this.defaultNamespace + '.'+ options.namespace;
    else options.namespace = this.defaultNamespace;

    if(ev) {

      ev.callback = cb;
      ev.context = ctx || window;
      ev.ended = false;
      ev.paused = false;

      return ev.options(options);
    }

    ev = new TimeEvent(options, cb, ctx);
    this.events.push(ev);

    this.sortable = true;

    return ev;
  };

  /**
   * Retrieves an overwritable event from the pool. Returns false if no match.
   * @return (TimeEvent|bool)
   */
  TimeLoop.prototype.getFromPool = function() {

    for(i = 0; i < this.events.length; i++) {

      ev = this.events[i];

      if(ev.ended) return ev;
    }

    return false;
  };

  /**
   * Retrieves all events matching the given namespace. Can execute an action on them.
   * @param (string) namespace
   * @param ('start'|'pause'|'end'|null) action
   * @return (Array)
   */
  TimeLoop.prototype.namespace = function(namespace, action) {

    var match = [];

    for (i = 0; i < this.events.length; i++) {

      ev = this.events[i];

      if(!ev.ended && checkNamespace(ev, namespace)) {

        if(action && action === 'start') ev.paused = false;
        else if(action && action === 'pause') ev.paused = true;
        else if(action && action === 'end') ev.ended = true;

        match.push(ev);
      }
    }

    return match;
  };

  /**
   * Returns the current timestamp
   * @return (Number)
   */
  TimeLoop.prototype.getTime = function() {

    // Defaults to Date.now() since it's faster
    if(Date.now) return Date.now();

    // Fallsback to new Date()
    return +new Date();
  };


  TimeLoop.prototype.debugging = function() {

    this.debug = new Debug();

    return this.debug;
  };



  var defaultOptions = {
    type: 'timeout',
    time: 0,
    priority: 1,
    namespace: "",
    context: window
  };
  /**
   * @class TimeEvent
   * Executes a callback after some time has passed or at regular intervals
   */
  var TimeEvent = function(options, cb, ctx) {

    if(!options) options = defaultOptions;

    this.type = options.type || defaultOptions.type; // timeout|interval
    this.time = options.time || defaultOptions.time;
    this.priority = (options.priority !== undefined) ? options.priority : defaultOptions.priority;
    this.namespace = options.namespace || defaultOptions.namespace;
    this.context = ctx || window;
    this.paused = false;
    this.ended = false;

    this.callback = cb || undefined;
    this.elapsedTime = 0;
  };

  /**
   * Edit the event options
   * @param (object) options
   * @return (TimeEvent) Instance for chaining
   */
  TimeEvent.prototype.options = function(options) {

    if(!options) options = defaultOptions;

    this.type = options.type || defaultOptions.type; // delay|interval
    this.time = options.time || defaultOptions.time;
    this.priority = (options.priority !== undefined) ? options.priority : defaultOptions.priority;
    this.namespace = options.namespace || defaultOptions.namespace;

    return this;
  };

  /**
   * Called when some time has passed
   * @param (int) ms
   */
  TimeEvent.prototype.update = function(ms) {

    if(this.paused || this.ended) return;

    this.elapsedTime += ms;

    if(this.elapsedTime >= this.time) {

      this.callback.call(this.context);

      this.elapsedTime = 0;

      if(this.type === "timeout") this.ended = true;
    }
  };

  /**
   * Pauses the event (it won't be called until unpaused)
   */
  TimeEvent.prototype.pause = function() {

    this.paused = true;
  };

  /**
   * Unpauses the event
   */
  TimeEvent.prototype.unpause = function() {

    this.paused = false;
  };

  /**
   * Ends the event (it won't be called, until it is rewrited by a new one)
   */
  TimeEvent.prototype.end = function() {

    this.ended = true;
  };




  var Debug = function(timeloop) {

    this.debugArea = document.createElement('div');

    var part1 = document.createElement('div'),
        part2 = document.createElement('div'),
        part3 = document.createElement('div'),
        text1 = document.createTextNode('events'),
        text2 = document.createTextNode('/'),
        text3 = document.createTextNode('fps'),
        text4 = document.createTextNode('ms');

    this.currentEvents = document.createElement('span');
    this.totalEvents = document.createElement('span');

    this.debugArea.id = "TimeLoopDebug";

    part1.appendChild(text1);
    part1.appendChild(this.currentEvents);
    part1.appendChild(text2);
    part1.appendChild(this.totalEvents);

    this.debugArea.appendChild(part1);

    document.body.appendChild(this.debugArea);
  };



  // Only one timeloop at a time
  return new TimeLoop();

}));
