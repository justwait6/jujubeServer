let ChatSvs = {};
var self = ChatSvs;

var myConf = require('../../config/MyConf');
const CmdDef = require(myConf.paths.common + "/protocol/CommandDef");
var userGuard = require(myConf.paths.model + "/user/UserGuard");
var svrPushMgr = require(myConf.paths.model + '/serverPush/ServerPushMgr');
var msgMgr = require(myConf.paths.model + '/message/MessageMgr');

const EVENT_NAMES = require(myConf.paths.common + "/event/EventNames");
const eventMgr = require(myConf.paths.common + "/event/EventMgr");

ChatSvs.start = function() {
  eventMgr.on(EVENT_NAMES.CLI_CHAT, function(data) { self.onCliChat(data) } );
}

ChatSvs.onCliChat = function(parsedPkg) {
  // store in offline db
  let msgObj = parsedPkg;
  msgMgr.asyncStoreMessage(msgObj, (isOk, msgId) => {
    if (!isOk) {
      // msg storage fail.
      eventMgr.emit(EVENT_NAMES.SEND_PKG, {uid: parsedPkg.srcUid, prePkg: {
        cmd: CmdDef.SVR_SEND_CHAT_RESP, ret: -1, uid: parsedPkg.srcUid
      }});
      return;
    };

    // response to src user(msg recieved)
    eventMgr.emit(EVENT_NAMES.SEND_PKG, {uid: parsedPkg.srcUid, prePkg: {
      cmd: CmdDef.SVR_SEND_CHAT_RESP,
      ret: 0,
      keyId: parsedPkg.keyId,
      msgId: msgId,
      uid: parsedPkg.srcUid
    }});
  });

  // check if dest user is online
  if (userGuard.isUserOnline(parsedPkg.destUid)) {
    // notify user new messages
    svrPushMgr.pushTypeFriend({uid: parsedPkg.destUid});
  } else {
    // mark offline friend red dots
    console.log("store offline red dots, to be continued");
  }
}

module.exports = ChatSvs;
