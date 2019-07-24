var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');
var myUtil = require(myConf.requires.myUtil);
var userGuard = require(myConf.paths.model + '/user/UserGuard');
const ErrorCode = require(myConf.paths.common + '/protocol/ErrorCode');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST home page. */
router.post('*', function(req, res, next) {
  if (req.body._interface == "/login" || req.body._interface == "/register") {
    next();
  } else {
    // check token if not @route /login
    if (typeof(req.body.token) == "string") {
      userGuard.verifyToken(req.body.token, (isOk, uid) => {
        if (isOk) {
          // attach parsed uid
          req.body.uid = uid;
          next();
        } else {
          res.json(myUtil.retObj({}, ErrorCode.TOKEN_EXPIRED, "token verify fail or expired"));
        }
      });
    } else {
      res.json(myUtil.retObj({}, ErrorCode.PARAM_INVALID, "no token or token format error! (format should be string)"));
    }
  }
})

module.exports = router;
