let UserPkgBuffer = require("./UserPkgBuffer");

let UserBufferMgr = {}
UserBufferMgr._buffers = [];
UserBufferMgr._bufferLocks = [];
let MAX_BUFFER_AMOUNT = 100;

UserBufferMgr.getInstance = function() {
  if (!self._singleInstance) {
    self.initialize();
    self._singleInstance = self;
  }
  return self._singleInstance;
}

UserBufferMgr.initialize = function() {
  for (let i = 0; i < MAX_BUFFER_AMOUNT; i++) {
    self._bufferLocks[i] = false;
    self._buffers[i] = new UserPkgBuffer();
  }
}

UserBufferMgr.getIdleBuffer = function() {
  for (let i = 0; i < MAX_BUFFER_AMOUNT; i++) {
    if (!self._bufferLocks[i]) {
      self._buffers[i].reset();
      self._bufferLocks[i] = true;
      return self._buffers[i];
    }
  }
}

UserBufferMgr.releaseBuffer = function(_buffer) {
  for (let i = 0; i < MAX_BUFFER_AMOUNT; i++) {
    if (_buffer === self._buffers[i]) {
      self._bufferLocks[i] = false;
    }
  }
}

var self = UserBufferMgr;

module.exports = UserBufferMgr;
