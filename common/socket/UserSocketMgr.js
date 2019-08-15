let UserSocketMgr = {};
var self = UserSocketMgr;

UserSocketMgr.uSktList = {};
UserSocketMgr.uBufferList = {};

var myConf = require('../../config/MyConf');
const eventMgr = require(myConf.paths.common + "/event/EventMgr");
const EVENT_NAMES = require("../event/EventNames");
eventMgr.on(EVENT_NAMES.SEND_PKG, function(data) {self.sendPack(data)} );

UserSocketMgr.bind = function(uid, socket) {
  self.uSktList[uid] = socket;
}

UserSocketMgr.isUserConnected = function(uid) {
  let isConnected = self.getUserSocket(uid) ? true : false;
  return isConnected;
}

UserSocketMgr.getUserSocket = function(uid) {
  return self.uSktList[uid];
}

UserSocketMgr.unbindBySocket = function(socket) {
  let uid = self.findUserBySocket(socket);
  self.unbindByUid(uid);
}

UserSocketMgr.unbindByUid = function(uid) {
  self.bind(uid, null);
}

UserSocketMgr.findUserBySocket = function(socket) {
  for (let k in self.uSktList){
    if (self.uSktList.hasOwnProperty(k)) {
      if (self.uSktList[k] === socket) {
        return k
      }    
    }
  }
}

UserSocketMgr.sendPack = function(data) {
  console.log(data.uid)
  self._send(data.uid, data.pkg);
}

UserSocketMgr._send = function(uid, buf) {
  let socket = self.getUserSocket(uid);
  if (socket) {
    socket.write(buf);
  } else {
    console.log("UserSocketMgr.send ERROR: send fail, user socket is null");
  }
}

module.exports = UserSocketMgr;
