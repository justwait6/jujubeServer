let ServiceMgr = {}

var chatSvs = require('./chat/ChatSvs');
var rummySvs = require('./rummy/RummySvs');

ServiceMgr.initilize = function() {
    chatSvs.start();
    rummySvs.start();
}

module.exports = ServiceMgr;
