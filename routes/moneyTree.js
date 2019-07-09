var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');
var myUtil = require(myConf.requires.myUtil);
var myDev = require(myConf.requires.myDev);
myDev.setModuleName('router/login');

var userGuard = require(myConf.paths.model + '/user/UserGuard');
var actMgr = require(myConf.paths.model + '/activity/ActivityManager');

/* POST MoneyTree basic info. */
router.post('/basicInfo', function(req, res, next) {
  // check if login info valid
  userGuard.verifyToken(req.body.token, (isOk, uid) => {
    if (isOk) {
      console.log("uid: " + uid);
    } else {
      console.log("token verify fail");
    }
  });
});

/* POST MoenyTree own tree info */
router.post('/ownTreeInfo', function(req, res, next) {
  userGuard.verifyToken(req.body.token, (isOk, uid) => {
    if (isOk) {
      console.log("uid: " + uid);
    } else {
      console.log("token verify fail");
    }
  });
});


module.exports = router;
