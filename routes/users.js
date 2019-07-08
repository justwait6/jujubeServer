var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');

var user = require('../model/user/User')

/* POST users listing. */
router.post('/', function(req, res, next) {
  // console.log(req)
  user.verifyToken(req.body.token, (isOk, uid) => {
    if (isOk) {
      console.log(uid);
      res.status(200).send("hello users");
    } else {
      res.status(302).send(myConf.urls.front + "/auth.html");
    }
  });
});

module.exports = router;
