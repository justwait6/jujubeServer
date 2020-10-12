let DizhuSvs = {};
var self = DizhuSvs;

var myConf = require('../../config/MyConf');
const RoomConst = require('../../model/dizhu/RoomConst');
const SubGameDef = require('../../model/subGame/SubGameDef');
const RummySvs = require('../rummy/RummySvs');
var gameSvr = require(myConf.paths.model + '/dizhu/DizhuSvr');

const CmdDef = require(myConf.paths.common + "/protocol/CommandDef");
const EVENT_NAMES = require(myConf.paths.common + "/event/EventNames");
const eventMgr = require(myConf.paths.common + "/event/EventMgr");

DizhuSvs.start = function() {
    eventMgr.on(EVENT_NAMES.USER_LOGIN, function(data) { self.onUserLogin(data) } );
    eventMgr.on(EVENT_NAMES.RECIEVE_DIZHU_PKG, function(data) { self.onPackageReceived(data) } );
    gameSvr.init();
}

DizhuSvs.onUserLogin = function(uid) {
    let table = gameSvr.queryTableByUid(uid)
    if (table) {
        let player = table.getPlayerByUid(uid);
        if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY || player.getPlayState() == RoomConst.PLAYER_STATE_READY) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: uid, prePkg: {
                cmd: CmdDef.SVR_HALL_LOGIN,
                ret: 1, // needReconnect
            }});
        }
    }
}

DizhuSvs.onPackageReceived = function(parsedPkg) {
    if (parsedPkg.cmd == CmdDef.CLI_GET_TABLE) {
        self.doCliGetTable(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_ENTER_ROOM) {
        self.doCliEnterRoom(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_EXIT_ROOM) {
        self.doCliExitRoom(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_DIZHU_READY) {
        self.doCliReady(parsedPkg);
    }
}

DizhuSvs.doCliGetTable = function(parsedPkg) {
    let tableId = gameSvr.fetchOptTableId(parsedPkg.uid, parsedPkg.gameId, parsedPkg.level);

    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: parsedPkg.uid, prePkg: {
        cmd: CmdDef.SVR_GET_TABLE,
        ret: 0,
        tid: tableId,
        gameId: parsedPkg.gameId,
        level: parsedPkg.level
    }});
}

DizhuSvs.doCliEnterRoom = function(parsedPkg) {
    let table = gameSvr.getTable(parsedPkg.tid);
    let ret = table.doPlayerLogin(parsedPkg.uid, parsedPkg.userinfo);
    if (ret == 0) {
        gameSvr.insertUidTid(parsedPkg.uid, parsedPkg.tid);
    }

    // 登录返回
    self.doSendEnterRoom(parsedPkg.uid, table);
    eventMgr.emit(EVENT_NAMES.USER_ENTER_ROOM, {uid: parsedPkg.uid, gameId: SubGameDef.DIZHU});

    // 广播用户坐下
    self.doCastSitDown(parsedPkg.tid, parsedPkg.uid);
}

DizhuSvs.doCliExitRoom = function(parsedPkg) {
    let table = gameSvr.getTable(parsedPkg.tid);    
    let retParams = table.doPlayerExit(parsedPkg.uid, parsedPkg.userinfo);
    self.doSendUserExit(parsedPkg.uid, retParams);
    if (retParams.ret == 0) {
        self.doCastUserExit(parsedPkg.tid, parsedPkg.uid);
        gameSvr.deleteUidTid(parsedPkg.uid, parsedPkg.tid);
        eventMgr.emit(EVENT_NAMES.USER_EXIT_ROOM, {uid: parsedPkg.uid});
    }
}

DizhuSvs.doCliReady = function(parsedPkg) {
    let table = gameSvr.queryTableByUid(parsedPkg.uid);
    let retParams = table.doPlayerReady(parsedPkg.uid);
    self.doSendReady(parsedPkg.uid, retParams);
    if (retParams.ret == 0) {
        self.doCastReady(table.getTid(), parsedPkg.uid);
    }
    table.triggerCheckStart();
}

DizhuSvs.doSendEnterRoom = function(sendUid, table) {
    let retPrePkg = {cmd: CmdDef.SVR_ENTER_ROOM, gameId: SubGameDef.DIZHU};
    retPrePkg.tid = table.getTid();
    retPrePkg.level = table.getLevel();
    retPrePkg.state = table.getState();
    retPrePkg.smallbet = table.getSmallbet();
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
    if (table.getState() == RoomConst.TABLE_STATE_PLAY) {
        
    }
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

DizhuSvs.doCastSitDown = function(tid, uid) {
    let table = gameSvr.getTable(tid);
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

DizhuSvs.doSendUserExit = function(sendUid, retParams) {
    let retPrePkg = {
        cmd: CmdDef.SVR_EXIT_ROOM,
        ret: retParams.ret,
    }
    if (retParams.ret == 0) {
        retPrePkg.money = retParams.money
        retPrePkg.gold = retParams.gold
    }
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

DizhuSvs.doCastUserExit = function(tid, uid) {
    let table = gameSvr.getTable(tid);
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
    });
}

DizhuSvs.doSendReady = function(sendUid, retParams) {
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: {
        cmd: CmdDef.SVR_DIZHU_READY,
        ret: retParams.ret,
    }});   
}

DizhuSvs.doCastReady = function(tid, uid) {
    let table = gameSvr.getTable(tid);
    let players = table.getPlayers();
    let retPrePkg = {
        cmd: CmdDef.SVR_CAST_DIZHU_READY,
        uid: uid,
    }
    players.forEach((player) => {
        let sendUid = player.getUid();
        if (sendUid != uid) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});   
        }
    });
}

exports.doSendGameStart = function(tid, uid) {
    let table = gameSvr.getTable(tid);
    let retPrePkg = {cmd: CmdDef.SVR_DIZHU_GAME_START};

    let player = table.getPlayerByUid(uid)
    let plyCards = player.getCards();
    retPrePkg.cards = new Array();
    plyCards.forEach((sCard) => {
        retPrePkg.cards.push({card: sCard});
    });

    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
}

module.exports = DizhuSvs;
