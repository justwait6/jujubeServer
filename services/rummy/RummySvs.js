let RummySvs = {};
var self = RummySvs;

var myConf = require('../../config/MyConf');
const RummyConst = require('../../model/rummy/RummyConst');
var rummySvr = require(myConf.paths.model + '/rummy/RummySvr');

const CmdDef = require(myConf.paths.common + "/protocol/CommandDef");
const EVENT_NAMES = require(myConf.paths.common + "/event/EventNames");
const eventMgr = require(myConf.paths.common + "/event/EventMgr");

RummySvs.start = function() {
    eventMgr.on(EVENT_NAMES.RECIEVE_PKG, function(data) { self.onPackageReceived(data) } );
    rummySvr.init();
}

RummySvs.onPackageReceived = function(parsedPkg) {
    if (parsedPkg.cmd == CmdDef.CLI_GET_TABLE) {
        self.doCliGetTable(parsedPkg)
    } else if (parsedPkg.cmd == CmdDef.CLI_ENTER_ROOM) {
        self.doCliEnterRoom(parsedPkg)
    } else if (parsedPkg.cmd == CmdDef.CLI_EXIT_ROOM) {
        self.doCliExitRoom(parsedPkg)
    }
}

RummySvs.doCliGetTable = function(parsedPkg) {
    let tableId = rummySvr.fetchOptTableId(parsedPkg.gameId, parsedPkg.level);

    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: parsedPkg.uid, prePkg: {
        cmd: CmdDef.SVR_GET_TABLE,
        ret: 0,
        tid: tableId,
        gameId: parsedPkg.gameId,
        level: parsedPkg.level
    }});
}

RummySvs.doCliEnterRoom = function(parsedPkg) {
    let table = rummySvr.getTable(parsedPkg.tid);
    table.doPlayerLogin(parsedPkg.uid, parsedPkg.userinfo);

    // 登录返回
    RummySvs.doSendEnterRoom(parsedPkg.uid, table);

    // 广播用户坐下
    RummySvs.doCastSitDown(parsedPkg.tid, parsedPkg.uid)

    // 桌子状态
    let tState = table.getState();
    if (tState == RummyConst.TABLE_STATE_NOT_PLAY) {
        if (table.doGameReady()) {
            let players = table.getPlayers();
            let time = table.getGameStartCountDown();
            players.forEach((player) => {
                RummySvs.doSendGameStartCountDown(player.getUid(), time);
            });
        }
    } else if (tState == RummyConst.TABLE_STATE_COUNTDOWN) {
        RummySvs.doSendGameStartCountDown(uid, table.getGameStartCountDown());
    }
}

RummySvs.doCliExitRoom = function(parsedPkg) {
    let table = rummySvr.getTable(parsedPkg.tid);
    let tState = table.getState();
    if (tState == RummyConst.TABLE_STATE_COUNTDOWN) {
        table.checkCancelGameReady();
    }
    
    let exitParams = table.doPlayerExit(parsedPkg.uid, parsedPkg.userinfo);
    RummySvs.doSendUserExit(parsedPkg.uid, exitParams);
    if (exitParams.ret == 0) {
        RummySvs.doCastUserExit(parsedPkg.tid, parsedPkg.uid);
    }
}

RummySvs.doSendEnterRoom = function(sendUid, table) {
    let retPrePkg = {cmd: CmdDef.SVR_ENTER_ROOM};
    retPrePkg.tid = table.getTid();
    retPrePkg.level = table.getLevel();
    retPrePkg.state = table.getState();
    retPrePkg.smallbet = table.getSmallbet();
    retPrePkg.dUid = table.getDealerUid();
    retPrePkg.players = new Array();
    let tPlayers = table.getPlayers()
    for (let i = 0; i < tPlayers.length; i++) {
        let player = {}
        player.uid = tPlayers[i].getUid();
        player.seatId = tPlayers[i].getSeatId();
        player.money = tPlayers[i].getMoney();
        player.gold = tPlayers[i].getGold();
        player.userinfo = tPlayers[i].getUserinfo();
        player.state = tPlayers[i].getPlayState();
        retPrePkg.players.push(player);
    }
    retPrePkg.ret = 0;
    console.log(retPrePkg)
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

RummySvs.doCastSitDown = function(tid, uid) {
    let table = rummySvr.getTable(tid);
    let player = table.getPlayerByUid(uid);
    let retPrePkg = {
        cmd: CmdDef.SVR_CAST_USER_SIT,
        uid: player.getUid(),
        seatId: player.getSeatId(),
        money: player.getMoney(),
        gold: player.getGold(),
        userinfo: player.getUserinfo(),
        state: player.getPlayState(),
    }
    let players = table.getPlayers();
    players.forEach((player) => {
        let sendUid = player.getUid();
        if (sendUid != uid) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});   
        }
    })
}

RummySvs.doSendUserExit = function(sendUid, exitParams) {
    let retPrePkg = {
        cmd: CmdDef.SVR_EXIT_ROOM,
        ret: exitParams.ret,
    }
    if (exitParams.ret == 0) {
        retPrePkg.money = exitParams.money
        retPrePkg.gold = exitParams.gold
    }
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

RummySvs.doCastUserExit = function(tid, uid) {
    let table = rummySvr.getTable(tid);
    let players = table.getPlayers();
    let retPrePkg = {
        cmd: CmdDef.SVR_CAST_EXIT_ROOM,
        uid: uid,
    }
    players.forEach((player) => {
        let sendUid = player.getUid();
        if (sendUid != uid) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});   
        }
    })
}

RummySvs.doSendGameStartCountDown = function(uid, time) {
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: uid, prePkg: {
        cmd: CmdDef.SVR_RUMMY_COUNTDOWN,
        leftSec: time,
    }})
}

module.exports = RummySvs;
