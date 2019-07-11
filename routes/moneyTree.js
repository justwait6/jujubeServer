var express = require('express');
var router = express.Router();

var myConf = require('../config/MyConf');
var myUtil = require(myConf.requires.myUtil);
var myDev = require(myConf.requires.myDev);
myDev.setModuleName('router/login');

const ActDef = require(myConf.paths.model + '/activity/ActDef');
var actMgr = require(myConf.paths.model + '/activity/ActivityManager');

router.post('*', function(req, res, next) {
  var isOpen = actMgr.checkSwitch(ActDef.MONEY_TREE);
  if (isOpen) {
    next();
  } else {
    res.json(myUtil.retObj({}, -100, "money tree remote switch not open!")).send();
  }
});

/* POST MoneyTree basic info. */
router.post('/basicInfo', function(req, res, next) {
  
});

/* POST MoenyTree own tree info */
router.post('/ownTreeInfo', function(req, res, next) {
  
});

/* POST MoenyTree own tree info */
router.post('/inviteCodeInfo', function(req, res, next) {
  
});


module.exports = router;
