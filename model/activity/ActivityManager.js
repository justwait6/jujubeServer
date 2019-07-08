const ActSwitch = require("./ActSwitch");

let ActivityManager = {
  getSwitchs: function() {
    let switches = new Array();
    ActSwitch.forEach((isActOpen, actDefIndex) => {
      if (isActOpen) {
        switches.push(actDefIndex);
      }
    });
    return switches;
  }
}

var self = ActivityManager;

module.exports = ActivityManager;
