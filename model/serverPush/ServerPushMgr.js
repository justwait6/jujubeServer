let ServerPushMgr = {}

var myConf = require("../../config/MyConf");
const PushType = require("./PushTypeDef");
const CmdDef = require(myConf.paths.common + "/protocol/CommandDef");

const EVENT_NAMES = require(myConf.paths.common + "/event/EventNames");
const eventMgr = require(myConf.paths.common + "/event/EventMgr");

ServerPushMgr.pushTypeFriend = function(params) {
  let uid = params.uid;
  eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: uid, prePkg: {
    cmd: CmdDef.SVR_PUSH,
    pushType: PushType.FRIEND,
    uid: uid
  }});
}

module.exports = {
  pushTypeFriend: ServerPushMgr.pushTypeFriend
}
