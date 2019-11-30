var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');
var myUtil = require(myConf.requires.myUtil);
var friendUtil = require(myConf.paths.model + '/friend/FriendUtil');

/* POST friend list. */
router.post('/friendList', function(req, res, next) {
  friendUtil.getFriendList(req.body.uid, (friendList) => {
    console.log("friendList", friendList)
    if (friendList) {
      res.json(myUtil.retObj({friendList: friendList}, 0, "getting friend list succ!"));
    } else {
      res.json(myUtil.retObj({}, 0, "getting friend list failed!"));
    }
  });
});

/* POST request add friend list. */
router.post('/reqAddList', function(req, res, next) {
  friendUtil.getReqAddList(req.body.uid, (reqAddList) => {
    if (reqAddList) {
      res.json(myUtil.retObj({reqAddList: reqAddList}, 0, "getting req add friend list!")).send();
    } else {
      res.json(myUtil.retObj({reqAddList: []}, 0, "get no friend add list!")).send();
    }
  });
});

/* POST friend request add a friend. */
router.post('/reqAdd', function(req, res, next) {
  let srcUid = req.body.uid;
  let destUid = req.body.friendUid;
  friendUtil.reqAdd({srcUid: srcUid, destUid: destUid}, (ok) => {
    if (ok) {
      res.json(myUtil.retObj({}, 0, "send add friend request succ!")).send();
    } else {
      res.json(myUtil.retObj({}, friendUtil.getInvalidCode(), friendUtil.getInvalidMessage())).send();
    }
  })
});

/* POST accept friend request. */
router.post('/accpetFriend', function(req, res, next) {
  let uid1 = req.body.uid;
  let uid2 = req.body.requestUid;
  let params = {uid1: uid1, uid2: uid2}
  friendUtil.addFriendPair(params, (ok) => {
    if (ok) {
      // delete friend request row in database permanently.
      friendUtil.deleteReqAddRecord(uid2, uid1);

      res.json(myUtil.retObj({}, 0, "accept friend succ!"));
    } else {
      res.json(myUtil.retObj({}, friendUtil.getInvalidCode(), friendUtil.getInvalidMessage()));
    }
  });
});

/* POST accept friend request. */
router.post('/modifyFriendRemark', function(req, res, next) {
	let pairList = JSON.parse(req.body.pairList)
  let params = {uid: req.body.uid, pairList: pairList}
  friendUtil.batchModifyFriendRemark(params, (ok) => {
	if (ok) {
	  res.json(myUtil.retObj({}, 0, "modify friend remarks succ!"));
	  } else {
	  res.json(myUtil.retObj({}, friendUtil.getInvalidCode(), friendUtil.getInvalidMessage()));
	}
  });
});

/* POST friend message list. */
router.post('/messageList', function(req, res, next) {
	friendUtil.getMessageList(req.body.uid, (msgList) => {
		res.json(myUtil.retObj({msgList: msgList || []}, 0, "get messageList succ!"));
	});
});

router.post('/someFriendMessage', function(req, res, next) {
	console.log("request someFriendMessage interface begin..., uid is: ", req.body.uid);
	friendUtil.getSomeFriendMessage({
		uid: req.body.uid,
		friendUid: req.body.friendUid,
		lastSvrMsgId: req.body.lastSvrMsgId || 0,
	}, (msgs) => {
		res.json(myUtil.retObj({msgs: msgs || [], friendUid: req.body.friendUid}, 0, "get friend message succ!"));
	})
});

router.post('/updateMessageRead', function(req, res, next) {
	console.log("request updateMessageRead interface begin..., uid is: ", req.body.uid);
	friendUtil.uploadMessageRead({
		uid: req.body.uid,
		friendUid: req.body.friendUid,
		lastSvrMsgId: req.body.lastSvrMsgId || 0,
	}, (msgs) => {
		res.json(myUtil.retObj({}, 0, "upload message read succ!"));
	})
});

module.exports = router;
