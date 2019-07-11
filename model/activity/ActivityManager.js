const ActSwitch = require("./ActSwitch");

let ActivityManager = {
  getSwitchs: function() {
    let switches = new Array();
    ActSwitch.forEach((isActOpen, actId) => {
      if (isActOpen) {
        switches.push(actId);
      }
    });
    return switches;
  },

  checkSwitch: function(targetActId) {
    return ActSwitch.some((isActOpen, actId) => {
      if (actId == targetActId) {
        return isActOpen;
      }
    });
  }
}

var self = ActivityManager;

module.exports = ActivityManager;
