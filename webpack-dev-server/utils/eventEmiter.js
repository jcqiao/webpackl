class EventEmiter {
  constructor() {
    this.events = {};
  }
  // 订阅
  on(eventName, cb) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(cb);
  }
  emit(eventName, ...rest) {
    if (!this.events[eventName]) {
      return this;
    }
    this.events[eventName].forEach((cb) => {
      cb.call(this, ...rest);
    });
    return this;
  }
}
module.exports = EventEmiter;
