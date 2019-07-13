var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');
var myUtil = require(myConf.requires.myUtil);
var myDev = require(myConf.requires.myDev);
myDev.setModuleName('router/login');

var userGuard = require(myConf.paths.model + '/user/UserGuard');
var actMgr = require(myConf.paths.model + '/activity/ActivityManager');

/* POST user login. */
router.post('/', function(req, res, next) {
  myDev.info('postLogin', "POST login begin");
  let loginInfo = req.body || {};

  // check if login info valid
  userGuard.isLoginValid(loginInfo, (isValid, someToken) => {
    if (isValid) {
      // if pass, get login params
      let someSwitches = actMgr.getSwitchs();
      userGuard.fetchLoginParams(someToken, (resLoginParams) => {
        resLoginParams.user = resLoginParams.user;
        resLoginParams.token = someToken;
        resLoginParams.switches = someSwitches;
        res.json(myUtil.retObj(resLoginParams, 0, 'login success!')).send();
      })
    } else {
      let errorCode = userGuard.getInvalidCode();
      let errorMsg = userGuard.getInvalidMessage();
      res.json(myUtil.retObj({}, errorCode, errorMsg)).send();
    }
  });
});

module.exports = router;
