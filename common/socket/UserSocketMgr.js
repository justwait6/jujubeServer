let UserSocketMgr = {};
var self = UserSocketMgr;

UserSocketMgr.uSktList = {};

var myConf = require('../../config/MyConf');
const CmdDef = require("../protocol/CommandDef");
const myPkgBuilder = require(myConf.paths.common + "/socket/MyPkgBuilder");
const eventMgr = require(myConf.paths.common + "/event/EventMgr");
const EVENT_NAMES = require("../event/EventNames");
var userSubGameMgr = require(myConf.paths.model + "/subGame/UserSubGameMgr");
eventMgr.on(EVENT_NAMES.PROCESS_OUT_PKG, function(data) {self.asyncSendPack(data)} );

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
  self.uSktList[uid] = null;
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

UserSocketMgr.asyncSendPack = function(data) {
  if (!data.prePkg.gameId) {
    data.prePkg.gameId = userSubGameMgr.getSubGameId(data.uid);
  }
  myPkgBuilder.asyncBuild(data.prePkg, (packet) => {
    packet && self._send(data.uid, packet);
  });
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
