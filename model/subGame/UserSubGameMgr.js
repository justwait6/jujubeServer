let UserSubGameMgr = {};

const SubGameDef = require("./SubGameDef");

var self = UserSubGameMgr;

UserSubGameMgr.uSgmList = {};

var myConf = require('../../config/MyConf');
const eventMgr = require(myConf.paths.common + "/event/EventMgr");
const EVENT_NAMES = require(myConf.paths.common + "/event/EventNames");
eventMgr.on(EVENT_NAMES.USER_ENTER_ROOM, function(data) {self.checkBind(data)} );
eventMgr.on(EVENT_NAMES.USER_EXIT_ROOM, function(data) {self.checkUnbind(data)} );

UserSubGameMgr.init = function() {
}

UserSubGameMgr.bind = function(uid, subGameId) {
  self.uSgmList[uid] = subGameId;
}

UserSubGameMgr.getSubGameId = function(uid) {
  return self.uSgmList[uid];
}

UserSubGameMgr.unbindByUid = function(uid) {
  self.bind(uid, null);
}

UserSubGameMgr.checkBind = function(data) {
  self.bind(data.uid, data.gameId);
}


UserSubGameMgr.checkUnbind = function(data) {
  self.bind(data.uid, null);
}

module.exports = UserSubGameMgr;
