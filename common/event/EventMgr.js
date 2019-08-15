let EventMgr = {}

var EventEmitter = require("events");
var event = new EventEmitter();

EventMgr.on = function(eventName, func) {
  event.on(eventName, func);
}

EventMgr.emit = function(eventName, data) {
  event.emit(eventName, data);
}

module.exports = EventMgr;
