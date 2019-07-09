var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');
var userGuard = require(myConf.paths.model + '/user/UserGuard');

/* POST users listing. */
router.post('/', function(req, res, next) {
  // console.log(req)
  userGuard.verifyToken(req.body.token, (isOk, uid) => {
    if (isOk) {
      console.log(uid);
      res.status(200).send("hello users");
    } else {
      res.status(302).send(myConf.urls.front + "/auth.html");
    }
  });
});

module.exports = router;
