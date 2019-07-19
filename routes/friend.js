var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');
var myUtil = require(myConf.requires.myUtil);
// var friendUtil = require(myConf.paths.model + '/user/FriendUtil');

/* POST friend list. */
router.post('/friendList', function(req, res, next) {
  let friendList = [
    {
      gender: 0,
      iconUrl: '',
      nickname: 'xiao sh anonymous',
    }, 
    {
        gender: 1,
        iconUrl: '',
        nickname: 'jima mama',
    },
  ]
  res.json(myUtil.retObj({friendList: friendList}, 0, "getting simulated friends!")).send();
  // friendUtil.getFriendList(req.body.uid, (friendList) => {
  //   if (friendList) {
  //     let resParams = {};
  //     resParams.friendList = friendList || [];
  //     res.json(myUtil.retObj(resParams, -101, "getting friend list failed!"));
  //   } else {
  //     res.json(myUtil.retObj({}, -101, "getting friend list failed!"));
  //   }
  // });
})

module.exports = router;
