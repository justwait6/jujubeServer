let ServiceMgr = {}

var chatSvs = require('./chat/ChatSvs');
var rummySvs = require('./rummy/RummySvs');
var dizhuSvs = require('./dizhu/DizhuSvs');

ServiceMgr.initilize = function() {
    chatSvs.start();
    rummySvs.start();
    dizhuSvs.start();
}

module.exports = ServiceMgr;
