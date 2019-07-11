var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');
var userGuard = require(myConf.paths.model + '/user/UserGuard');

/* POST users listing. */
router.post('/', function(req, res, next) {
  // console.log(req)
});

router.post('/userinfo', function(req, res, next) {
  // console.log(req)
  let name = req.body.name || "";
  if (typeof(name) == 'string' && name.length > 0) {
    let onCheckDone = function(isRegisterd) {
      if (isRegisterd) {
        userGuard.getUserBase()
      }
    }
    userGuard.checkNameExist(name, onCheckDone);
  }
});

module.exports = router;
