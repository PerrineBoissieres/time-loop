/**
 * @function escapeRegExp
 * Escapes all RegExp special characters from a string
 * @param {String} str The string to escape
 * @return {String}
 */
export function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

/**
 * @function checkNamespace
 * Returns true if the timer object is in given namespace
 * @param {Timer} timer
 * @param {String} namespace
 * @return {boolean}
 */
export function checkNamespace(timer, namespace) {
  const reg = new RegExp(`^${escapeRegExp(namespace)}`);

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
export function orderByPriority(ev1, ev2) {
  return ev2.settings.priority - ev1.settings.priority;
}

/**
 * @function extendOptions
 * Extends en object with another object
 * @param {Object} defaults Basic object to override
 * @param {Object} options Object that overrides the default one
 * @return {Object} The new extended object
 */
export function extendOptions(defaults, options) {
  if (!options) return defaults;

  const extended = {};

  // eslint-disable-next-line
  for (const i in defaults) {
    if ({}.hasOwnProperty.call(defaults, i)) {
      extended[i] = defaults[i];
    }
  }
  // eslint-disable-next-line
  for (const j in options) {
    if ({}.hasOwnProperty.call(options, j)) {
      extended[j] = options[j];
    }
  }

  return extended;
}
