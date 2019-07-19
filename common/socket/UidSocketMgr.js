let UidSocketMgr = {}

UidSocketMgr.uSktList = {};
UidSocketMgr.uBufferList = {};

UidSocketMgr.updateSocket = function(uid, socket) {
  self.uSktList.uid = socket;
}

UidSocketMgr.getUserSocket = function(uid) {
  return self.uSktList.uid;
}

var self = UidSocketMgr;

module.exports = UidSocketMgr;
