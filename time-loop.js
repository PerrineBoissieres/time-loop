/*
 * TimeLoop 0.1
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

    reg = new RegExp('^'+namespace);

    if(reg.test(event.namespace)) return true;

    return false;
  };

  var orderByPriority = function(ev1, ev2) {

    return ev1.priority - ev2.priority;
  };



  var i, ev, currentTime;

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

    this.proxyStep = this.step.bind(this);

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

    currentTime = Date.now();
    this.elapsedTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    for(i = 0; i < this.events.length; i++) {

      ev = this.events[i];

      if(!ev.paused && !ev.ended) ev.update(this.elapsedTime);
    }

    requestAnimFrame(this.proxyStep);
  };

  /**
   * Starts or restarts the time-loop
   * @return (TimeLoop) Instance for chaining
   */
  TimeLoop.prototype.start = function() {

    this.lastTime = Date.now();
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
  * @class TimeEvent
  * Executes a callback after some time has passed or at regular intervals
  */
  var TimeEvent = function(options, cb, ctx) {

    this.type = options.type || "interval"; // delay|interval
    this.time = options.time || 0;
    this.priority = (options.priority !== undefined) ? options.priority : 1;
    this.namespace = options.namespace || "";
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

    this.type = options.type || this.type; // delay|interval
    this.time = options.time || this.time;
    this.priority = (options.priority !== undefined) ? options.priority : this.priority;
    this.namespace = options.namespace || this.namespace;

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

      this.context.call(this.callback);

      if(this.type === "delay") this.ended = true;
    }
  };



  // Only one timeloop at a time
  return new TimeLoop();

}));
