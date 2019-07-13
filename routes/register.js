var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');
var myUtil = require(myConf.requires.myUtil);
var myDev = require(myConf.requires.myDev);
myDev.setModuleName('router/register');

var userGuard = require('../model/user/UserGuard');

/* POST user register. */
router.post('/', function(req, res, next) {
    myDev.info('postRegister', "POST register begin");
    let registerInfo = req.body || {};

    // check if register info valid
    userGuard.isRegisterValid(registerInfo, (isValid) => {
      if (isValid) {
        // if pass, create new user
        userGuard.createNew(registerInfo, (userInfo) => {
          if (userInfo) {
            res.json(myUtil.retObj({
              token: userInfo.token,
            }, 0, 'register success!')).send();
          } else {
            res.json(myUtil.retObj({
              token: userInfo.token,
            }, -1, 'fail when creating user, please try again!')).send();
          }
        });
      } else {
        let errorCode = userGuard.getInvalidCode();
        let errorMsg = userGuard.getInvalidMessage();
        res.json(myUtil.retObj({}, errorCode, errorMsg)).send();
      }
    });
});

router.post('/checkNameExist', function(req, res, next) {
  let name = req.body.name || "";
  if (typeof(name) == 'string' && name.length > 0) {
    let onCheckDone = function(isRegisterd) {
      res.json(myUtil.retObj({available: !isRegisterd}, 0, "")).send();
    }
    userGuard.checkNameExist(name, onCheckDone);
  }
});

module.exports = router;
