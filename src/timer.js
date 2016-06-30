export default class Timer {

  get defaultOptions() {
    return {
      type: 'timeout',
      time: 0,
      priority: 1,
      namespace: '',
    };
  }

  /**
   * @constructor
   * @param {function} cb The callback to be delayed or repeated
   * @param {Object} options A list of options
   * @param {Object} ctx The context of the callback's execution
   */
  constructor(cb, options, ctx) {
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
  options(options, reset = true) {
    if (!reset) this.settings = extendOptions(this.settings, options);
    else this.settings = extendOptions(this.defaultOptions, options);
    return this;
  }

  /**
   * @method update
   * Adds the elapsed time since last call
   * @param {Number} Number of ms passed
   */
  update(ms) {
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
  pause() {
    this.paused = true;
    return this;
  }

  /**
   * @method resume
   * Resumes the event
   * @return {Timer} chainable
   */
  resume() {
    this.paused = false;
    return this;
  }

  /**
   * @method reset
   * Resets internal elapsed time to 0
   * @return {Timer} chainable
   */
  reset() {
    this.elapsedTime = 0;
    return this;
  }

  /**
   * @method end
   * Stops the event
   * @return {Timer} chainable
   */
  end() {
    this.ended = true;
    return this;
  }
}
