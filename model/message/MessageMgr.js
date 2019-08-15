let MessageMgr = {};
var self = MessageMgr;

const Message = require("./Message");

let _msgCache = [];
let _isStoringMsg = false;

MessageMgr.asyncStoreMessage = function(msgObj, callback) {
  _msgCache.unshift({msgObj: msgObj, callback: callback});

  if (!_isStoringMsg) {
    self.consume();
  }
}

MessageMgr.consume = function() {
  if (_msgCache.length <= 0) {
    _isStoringMsg = false;
    return;
  }
  _isStoringMsg = true;
  let msgConf = _msgCache.pop();
  let msgObj = msgConf.msgObj;
  let callback = msgConf.callback;

  Message.store(msgObj, (isOk, msgId) => {
    if (!isOk) {
      callback && callback(null);
    } else {
      callback && callback(isOk, msgId);
    }
    _isStoringMsg = false;
    self.consume();
  });
}

module.exports = {
  asyncStoreMessage: MessageMgr.asyncStoreMessage,
}
