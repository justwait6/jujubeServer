var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');
var myUtil = require(myConf.requires.myUtil);
var userGuard = require(myConf.paths.model + '/user/UserGuard');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST home page. */
router.post('*', function(req, res, next) {
  if (req.body._interface == "/login") {
    next();
  } else {
    // check token if not @route /login
    if (typeof(req.body.token) == "string") {
      userGuard.verifyToken(req.body.token, (isOk, uid) => {
        if (isOk) {
          next();
        } else {
          console.log("token verify fail");
          res.json(myUtil.retObj({}, -101, "token verify fail (maybe expired)"));
        }
      });
    } else {
      res.json(myUtil.retObj({}, -100, "no token or token format error! (format should be string)"));
    }
  }
})

module.exports = router;
