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

MessageMgr.checkHasOfflineMessage = function(uid, callback) {
	Message.isHasOfflineMessage(uid, callback);
}

MessageMgr.getMessageList = function(uid, callback) {
	Message.getMessageList(uid, callback);
}

MessageMgr.getSomeFriendMessage = function(params, callback) {
	Message.getSomeFriendMessage(params, callback);
}

MessageMgr.uploadMessageRead = function(params, callback) {
	params = params || {}
	Message.setMessageRead({srcUid: params.friendUid || 0, destUid: params.uid || 0, lastReadMsgId: params.lastSvrMsgId || 0}, callback);
}

module.exports = {
  asyncStoreMessage: MessageMgr.asyncStoreMessage,
	checkHasOfflineMessage: MessageMgr.checkHasOfflineMessage,
	getMessageList: MessageMgr.getMessageList,
	getSomeFriendMessage: MessageMgr.getSomeFriendMessage,
	uploadMessageRead: MessageMgr.uploadMessageRead,
}
