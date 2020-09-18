let RummySvs = {};
var self = RummySvs;

var myConf = require('../../config/MyConf');
var rummySvr = require(myConf.paths.model + '/rummy/RummySvr');

const myPkgBuilder = require(myConf.paths.common + "/socket/MyPkgBuilder");

const CmdDef = require(myConf.paths.common + "/protocol/CommandDef");
const EVENT_NAMES = require(myConf.paths.common + "/event/EventNames");
const eventMgr = require(myConf.paths.common + "/event/EventMgr");

RummySvs.start = function() {
    eventMgr.on(EVENT_NAMES.RECIEVE_PKG, function(data) { self.onPackageReceived(data) } );
}

RummySvs.onPackageReceived = function(parsedPkg) {
    if (parsedPkg.cmd == CmdDef.CLI_GET_TABLE) {
        self.doCliGetTable(parsedPkg)
    } else if (parsedPkg.cmd == CmdDef.CLI_ENTER_ROOM) {
        self.doCliEnterRoom(parsedPkg)
    }
}

RummySvs.doCliGetTable = function(parsedPkg) {
    let tableId = rummySvr.fetchOptTableId(parsedPkg.gameId, parsedPkg.level);

    myPkgBuilder.asyncBuild({
        cmd: CmdDef.SVR_GET_TABLE,
        ret: 0,
        tid: tableId,
        gameId: parsedPkg.gameId,
        level: parsedPkg.level
        }, (packet) => {
        packet && eventMgr.emit(EVENT_NAMES.SEND_PKG, {uid: parsedPkg.uid, pkg: packet});
        });
}

RummySvs.doCliEnterRoom = function(parsedPkg) {
    let tableId = rummySvr.fetchOptTableId(parsedPkg.gameId, parsedPkg.level);

    myPkgBuilder.asyncBuild({
        cmd: CmdDef.SVR_ENTER_ROOM,
        ret: 0,
        tid: tableId,
        gameId: parsedPkg.gameId,
        level: parsedPkg.level
        }, (packet) => {
        packet && eventMgr.emit(EVENT_NAMES.SEND_PKG, {uid: parsedPkg.uid, pkg: packet});
        });
}

module.exports = RummySvs;
