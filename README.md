# time-loop.js

This library helps you easily manage time-based timers with `requestAnimationFrame`.

# How to use

Creating timeouts and intervals is really simple :

```js
var timeLoop = new require('time-loop')();

timeLoop.createTimer(function() {
  // Code here will be executed after one second
}, {
  type: 'timeout',
  time: 1000
});

timeLoop.createTimer(function() {
  // Code here will be executed every half-second
}, {
  type: 'interval',
  time: 500
});

timeLoop.start(); // Starts
```

# API

## Timer options
These options can be passed to the `timeLoop.createTimer` method, or changed on the objet directly.

### type {string}
Values `timeout` or `interval`. Defaults to `timeout`.

### time {int}
Time in ms before a timeout is executed, or interval between calls (depends on the type option). If value equals 0, the timeout timer is called on the next frame, and the interval timer is called every frame.

### priority {int}
Determines the order of calls when multiple callbacks are to be executed at the same frame. Higher numbers are executed prior to lower numbers. Defaults to `1`.

### namespace {string}
Namespaces help theming your timers and execute actions on multiple timers at once. A dot-separated syntax is recommended, ex: `home.scrolling`, and `home.scrolling.menu`.

*Note : a default namespace `all` is applied by default to all timers, the namespace given by this option is appended to this default namespace.*

## Timer methods

### .options(options)
Call this method on an instanced Timer to reset to its default parameters and pass it new options (use it to overwrite an timer by a new one).

### .pause()
The timer won't be called until you resume it

### .resume()
The timer is resumed

### .reset()
Resets the internal elapsed time to 0

### .end()
End an timer : it won't be called anymore, and is cached to be rewritten by a new one.

## TimeLoop Parameters

### autoSort {bool}
By default, when creating new timers, they are automatically sorted by priority. By setting this parameter to `false`, timers will not be sorted automatically and if you need to do it, you'll have to call the `.sort()` method yourself.

### defaultNamespace {string}
A default namespace prepended to all timers' namespaces. Defaults to `all`.

## TimeLoop Methods
*By default, every method returns the instance of `TimeLoop` for chaining*

### .start()
Starts the time-loop, timers will be fired when the loop is running.

### .pause()
Pauses the time-loop, when calling `start()` again the timer will resume from where it was (so no "running after time").

*Note : the time-loop automatically pauses and resumes when switching tabs on compatible browsers.*

### .resume()
Alias of `start()`

### .createTimer(callback, [options], [context])
Creates and returns a new `Timer` with given options (see section above for available options). By default, if no context is passed, the  context will be the `window` object.

### .wait(time=0)
Shortcut for creating timeouts, returns a A+ Promise.

### .repeat(callback, time=0)
Shortcut for creating intervals, returns the created `Timer`.

### .createPool(nb)
Creates a pool of inactive `Timer`. This is useful for performances when you need to create a lot of timers during runtime : this will pre-allocate *nb* `Timer` that will get overriden and activated when you call the `createTimer()` method.

### .sort()
Sorts the existing timers by priority.

*Note : by default, this is automatically called when needed, so you shouldn't bother with it unless you de-activated auto-sort and want to handle the sorting yourself*

### .namespace(namespace, [action])
Returns the timers that match the given namespace. If a valid action name is passed, following methods will be executed on all matching timers :

- "**pause**" : matching timers will be paused
- "**resume**" : matching timers will be resumed
- "**reset**" : matching timers will be reset
- "**end**" : matching timers will be de-activated

Less precise requested namespace will fetch a larger number of timers, ex :

```js
timeLoop.createTimer(function() { [...] }, { namespace: 'home.banner' });

timeLoop.createTimer(function() { [...] }, { namespace: 'home.scrolling' });

timeLoop.namespace('all.home', 'pause'); // returns both timers and pauses them
timeLoop.namespace('all.home.scrolling', 'resume'); // returns only one timer and resume it
```
