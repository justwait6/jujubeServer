let ENABLE_LOG = true;

let MyDev = {
  setModuleName: function(devModule) {
    this.name = devModule;
  },

  info: function(funcName, msg) {
    self.myPrint('INFO--[' + this.name + ']@' + funcName + ': ' + msg);
  },

  myPrint: function(string) {
    if (ENABLE_LOG) {
      console.log(string);
    }
  }
}

var self = MyDev;

module.exports = MyDev;
