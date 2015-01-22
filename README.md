# time-loop.js

This library helps you easily manage time-based events with `requestAnimationFrame`.

# How to use

Creating timeouts and intervals is really simple :

```js
timeLoop.createEvent({
  type: 'timeout',
  time: 1000
}, function() {
  // Code here will be executed after one second
});

timeLoop.createEvent({
  type: 'interval',
  time: 500
}, function() {
  // Code here will be executed every half-second
});

timeLoop.start(); // Starts
```

# API

## Event options
These options can be passed to the `timeLoop.createEvent` method, or changed on the objet directly.

### type {string}
Values `timeout` or `interval`. Defaults to `timeout`.

### time {int}
Time in ms before a timeout is executed, or interval between calls (depends on the type option). If value equals 0, the timeout event is called on the next frame, and the interval event is called every frame.

### priority {int}
Determines the order of calls when multiple callbacks are to be executed at the same frame. Higher numbers are executed prior to lower numbers. Defaults to `1`.

### namespace {string}
Namespaces help theming your events and execute actions on multiple events at once. A dot-separated syntax is recommended, ex: `home.scrolling`, and `home.scrolling.menu`.

*Note : a default namespace `all` is applied by default to all events, the namespace given by this option is appended to this default namespace.*

## Event methods

### .options(options)
Call this method on an instanced TimeEvent to reset to its default parameters and pass it new options (use it to overwrite an event by a new one).

### .pause()
The event won't be called until you un-pause it

### .unpause()
The event is restarted

### .end()
End an event : it won't be called anymore, and is cached to be rewrited by a new one.

## Parameters

### timeLoop.autoSort {bool}
By default, when creating new events, they are automatically sorted by priority. By setting this parameter to `false`, events will not be sorted automatically and if you need to do it, you'll have to call the `timeLoop.sort()` method yourself.

### timeLoop.defaultNamespace {string}
A default namespace prepended to all events' namespaces. Defaults to `all`.

## Methods
*By default, every method returns the `timeLoop` object for chaining*

### timeLoop.start()
Starts the time-loop, events will be fired when the loop is running.

### timeloop.pause()
Pauses the time-loop, when calling `start()` again the timer will resume from where it was (so no "running after time").

*Note : the time-loop automatically pauses and resumes when switching tabs on compatible browsers.*

### timeLoop.createEvent(options, callback, [context])
Creates and returns a new `TimeEvent` with given options (see section above for available options). By default, if no context is passed, the  context will be the `window` object.

### timeLoop.createPool(nb)
Creates a pool of inactive `TimeEvent`. This is useful for performances when you need to create a lot of events during runtime : this will pre-allocate *nb* `TimeEvent` that will get overrided and activated when you call the `createEvent()` method.

### timeLoop.sort()
Sorts the existing events by priority.

*Note : by default, this is automatically called when needed, so you shouldn't bother with it unless you de-activated auto-sort and want to handle the sorting yourself*

### timeLoop.namespace(namespace, [action])
Returns the events that match the given namespace. If a valid action name is passed, following methods will be executed on all matching events :

- "**pause**" : matching events will be paused
- "**start**" : matching events will be un-paused
- "**end**" : matching events will be de-activated

Less precise requested namespace will fetch a larger number of events, ex :

```js
timeLoop.createEvent({
  namespace: 'home.banner'
}, function() { [...] });

timeLoop.createEvent({
  namespace: 'home.scrolling'
}, function() { [...] });

timeLoop.namespace('all.home'); // returns both events
timeLoop.namespace('all.home.scrolling'); // returns only one event
```
