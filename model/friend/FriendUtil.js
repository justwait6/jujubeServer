let FriendUtil = {}

var self = FriendUtil;

var myConf = require('../../config/MyConf');
var userGuard = require(myConf.paths.model + '/user/UserGuard');
var SvrPushMgr = require(myConf.paths.model + '/serverPush/ServerPushMgr');
const ErrorCode = require(myConf.paths.common + '/protocol/ErrorCode');
const Friend = require('./Friend');
const FriendRequest = require('./FriendRequest');

let ERR_CODE = {
  FRIEND_IS_SELF: -100,
  FRIEND_PAIR_INVALID: -200,
}

FriendUtil.reqAdd = function(params, callback) {
  // if src uid equals dest uid, return fall
  if (params.srcUid == params.destUid) {
    self.setInvalidCode(ERR_CODE.FRIEND_IS_SELF);
    self.setInvalidMessage("do not add self!");
    callback && callback(false);
    return;
  }

  // insert into database if dest uid offline
  FriendRequest.upsertRecord(params, callback);

  // notify immdietely if dest uid online
  if (userGuard.isUserOnline(params.destUid)) {
    console.log('user is online!!! uid: ', params.destUid);
    SvrPushMgr.pushTypeFriend({uid: params.destUid});
  }
}

FriendUtil.deleteReqAddRecord = function(srcUid, destUid, callback) {
  FriendRequest.removeRecord({srcUid: srcUid, destUid: destUid}, callback);
}

FriendUtil.getFriendList = function(uid, callback) {
  Friend.getFriendList(uid, (friendTblList) => {
	if (!friendTblList) { callback && callback(null); return; }
	
	let resTbl = {};
    friendTblList.forEach(element => {
	  if (element && element.uid) { 
		resTbl[element.uid] = element;
	  }
	});

	let params = {};
	params.uidList = Object.keys(resTbl);
    params.fields = ['uid', 'nickname', 'gender', 'iconUrl'];
    userGuard.batchGetUserinfo(params, (userInfoList) => {
	  if (!userInfoList) { callback && callback(null); return;}
	  
	  userInfoList.forEach(element => {
		if (element && element.uid) {
			Object.keys(element).forEach((key) => {
				resTbl[element.uid][key] = element[key];
			});
		}
	  });
	  let resValues = Object.keys(resTbl).map((key) => { return resTbl[key]; });
      callback && callback(resValues);
	});
  });
}

FriendUtil.batchModifyFriendRemark = function(params, callback) {
	params = params || {};
	if (typeof(params.pairList) != "object") {
		self.setInvalidCode(ErrorCode.PARAM_INVALID);
    self.setInvalidMessage("pairlist should be type object(in cli, be table)!");
		callback && callback(false);
		return;
	}

	Friend.batchModifyFriendRemark(params, (someData) => {
		console.log(someData);
		callback && callback(someData);
	});
}

FriendUtil.getReqAddList = function(uid, callback) {
  // find uid list first
  FriendRequest.getReqAddList(uid, (reqAddList) => {
    if (!reqAddList) { callback && callback(null); return; }

    // query userbase for userinfo(nickname, icon, gender, etc).
    let params = {}
    params.uidList = [];
    reqAddList.forEach(element => {
      if (element && element.srcUid) { params.uidList.push(element.srcUid); }
    });

    params.fields = ['uid', 'nickname', 'gender', 'iconUrl'];
    userGuard.batchGetUserinfo(params, (userInfoList) => {
      if (!userInfoList) { callback && callback(null); return;}
      
      // add @attribute timestamp (in reqAddList) to userInfoList
      userInfoList.forEach((value, i) => {
        if (reqAddList[i] && value) { value.timestamp = reqAddList[i].timestamp; }
      });

      callback && callback(userInfoList);
    });
  });
}

FriendUtil.addFriendPair = function(params, callback) {
  let uid1 = params.uid1;
  let uid2 = params.uid2;
  if (!uid1 || !uid2) {
    self.setInvalidCode(ERR_CODE.FRIEND_PAIR_NEED);
    self.setInvalidMessage("friend pair needed, ensure request_uid and accept_uid not empty!");
    callback && callback(false);
    return;
  }

  if (uid1 == uid2) {
    self.setInvalidCode(ERR_CODE.FRIEND_PAIR_INVALID);
    self.setInvalidMessage("friend pair is the same!");
    callback && callback(false);
    return;
  }

  Friend.addFriendPair(uid1, uid2, callback);
}

FriendUtil.setInvalidCode = function(code) {
  self.invalidCode = code;
}

FriendUtil.getInvalidCode = function(name) {
  return self.invalidCode;
}

FriendUtil.setInvalidMessage = function(errorMessage) {
  self.invalidMessage = errorMessage;
}

FriendUtil.getInvalidMessage = function(name) {
  return self.invalidMessage;
}

module.exports = {
  getInvalidCode: FriendUtil.getInvalidCode,
  getInvalidMessage: FriendUtil.getInvalidMessage,
  reqAdd: FriendUtil.reqAdd,
  addFriendPair: FriendUtil.addFriendPair,
  getReqAddList: FriendUtil.getReqAddList,
  deleteReqAddRecord: FriendUtil.deleteReqAddRecord,
  getFriendList: FriendUtil.getFriendList,
  batchModifyFriendRemark: FriendUtil.batchModifyFriendRemark,
}