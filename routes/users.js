var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');
var myUtil = require(myConf.requires.myUtil);
var userGuard = require(myConf.paths.model + '/user/UserGuard');
const ErrorCode = require(myConf.paths.common + '/protocol/ErrorCode');

/* POST users listing. */
router.post('/', function(req, res, next) {
});

router.post('/userinfo', function(req, res, next) {
  let name = req.body.name || "";
  let decodeFields = JSON.parse(req.body.fields);
  if (typeof(name) == 'string' && name.length > 0) {
    let queryData = {}
    queryData.name = name;
    queryData.fields = decodeFields || [];

    userGuard.getUserInfoByName(queryData, (userInfo) => {
      if (userInfo) {
        res.json(myUtil.retObj(userInfo,  0, '')).send();
      } else {
        res.json(myUtil.retObj({}, -1, 'user not found!')).send();
      }
    });
  } else {
    res.json(myUtil.retObj({}, ErrorCode.PARAM_INVALID, '@param name error, need be string and not empty!')).send();
  }
});

router.post('/modifyBaseInfo', function(req, res, next) {
  let decodeFields = JSON.parse(req.body.fields);

  let updateData = {}
  updateData.uid = req.body.uid;
  updateData.fields = decodeFields || {};
  userGuard.modifyUserBaseInfo(updateData, (updateOk) => {
    if (updateOk) {
      // update ok, get update properties.
      let queryData = {}
      queryData.uid = req.body.uid;
      queryData.fields = Object.keys(decodeFields) || [];
      userGuard.getUserInfoByUid(queryData, (userInfo) => {
        if (userInfo) {
          res.json(myUtil.retObj(userInfo,  0, '')).send();
        } else {
          res.json(myUtil.retObj({}, -2, 'fetch user info fail!')).send();
        }
      })
    } else {
      res.json(myUtil.retObj({}, -1, 'user modify fail!')).send();
    }
  });
});

module.exports = router;
