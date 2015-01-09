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

## Parameters

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
