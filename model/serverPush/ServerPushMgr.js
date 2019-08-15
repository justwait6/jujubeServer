let ServerPushMgr = {}

var myConf = require("../../config/MyConf");
const PushType = require("./PushTypeDef");
const CmdDef = require(myConf.paths.common + "/protocol/CommandDef");
const MyPkgBuilder = require(myConf.paths.common + "/socket/MyPkgBuilder");
let UserSocketMgr = require(myConf.paths.common + '/socket/UserSocketMgr');

var self = ServerPushMgr;

ServerPushMgr.pushTypeFriend = function(params) {
  let uid = params.uid;
  MyPkgBuilder.asyncBuild({
    cmd: CmdDef.SVR_PUSH,
    pushType: PushType.FRIEND,
    uid: uid
  }, (packet) => {
    packet && UserSocketMgr.sendPack({uid: uid, pkg: packet});
  });
}

module.exports = {
  pushTypeFriend: ServerPushMgr.pushTypeFriend
}
