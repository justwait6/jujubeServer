let RummySvs = {};
var self = RummySvs;

const PkgDataType = require('../../common/socket/PkgDataType');
var myConf = require('../../config/MyConf');
const RummyConst = require('../../model/rummy/RummyConst');
const { Player } = require('../../model/rummy/RummyPlayer');
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
        self.doCliGetTable(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_ENTER_ROOM) {
        self.doCliEnterRoom(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_EXIT_ROOM) {
        self.doCliExitRoom(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_RUMMY_DRAW_CARD) {
        self.doCliDraw(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_RUMMY_DISCARD_CARD) {
        self.doCliDiscard(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_RUMMY_UPLOAD_GROUPS) {
        self.doCliUploadGroups(parsedPkg);
    }
}

RummySvs.doCliGetTable = function(parsedPkg) {
    let tableId = rummySvr.fetchOptTableId(parsedPkg.uid, parsedPkg.gameId, parsedPkg.level);

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
    let ret = table.doPlayerLogin(parsedPkg.uid, parsedPkg.userinfo);
    if (ret == 0) {
        rummySvr.insertUidTid(parsedPkg.uid, parsedPkg.tid);
    }

    // 登录返回
    self.doSendEnterRoom(parsedPkg.uid, table);

    // 广播用户坐下
    self.doCastSitDown(parsedPkg.tid, parsedPkg.uid)

    // 桌子状态
    let tState = table.getState();
    if (tState == RummyConst.TABLE_STATE_NOT_PLAY) {
        if (table.doGameReady()) {
            let players = table.getPlayers();
            let time = table.getGameStartCountDown();
            players.forEach((player) => {
                self.doSendGameStartCountDown(player.getUid(), time);
            });
        }
    } else if (tState == RummyConst.TABLE_STATE_COUNTDOWN) {
        self.doSendGameStartCountDown(parsedPkg.uid, table.getGameStartCountDown());
    }
}

RummySvs.doCliExitRoom = function(parsedPkg) {
    let table = rummySvr.getTable(parsedPkg.tid);    
    let retParams = table.doPlayerExit(parsedPkg.uid, parsedPkg.userinfo);
    let tState = table.getState();
    if (tState == RummyConst.TABLE_STATE_COUNTDOWN) {
        table.checkCancelGameReady();
    }
    self.doSendUserExit(parsedPkg.uid, retParams);
    if (retParams.ret == 0) {
        self.doCastUserExit(parsedPkg.tid, parsedPkg.uid);
        rummySvr.deleteUidTid(parsedPkg.uid, parsedPkg.tid);
    }
}

RummySvs.doCliDraw = function(parsedPkg) {
    let table = rummySvr.queryTableByUid(parsedPkg.uid);
    if (!table) {
        console.log("no table found!")
        return;
    }
    let retParams = table.doPlayerDraw(parsedPkg.uid, parsedPkg.region);

    self.doSendDraw(parsedPkg.uid, retParams);
    if (retParams.ret == 0) {
        self.doCastDraw(parsedPkg.uid, retParams);
    }
}

RummySvs.doCliDiscard = function(parsedPkg) {
    let table = rummySvr.queryTableByUid(parsedPkg.uid);
    if (!table) {
        console.log("no table found!")
        return;
    }
    let retParams = table.doPlayerDiscard(parsedPkg.uid, parsedPkg.card);
    retParams.dropCard = parsedPkg.card
    retParams.cliIndex = parsedPkg.index

    self.doSendDiscard(parsedPkg.uid, retParams);
    if (retParams.ret == 0) {
        self.doCastDiscard(parsedPkg.uid, retParams);
    }
}

exports.doAutoDiscard = function(uid, discardCard, cliIdx) {
    self.doCliDiscard({uid: uid, card: discardCard, index: cliIdx});
}

RummySvs.doCliUploadGroups = function(parsedPkg) {
    let table = rummySvr.queryTableByUid(parsedPkg.uid);
    if (!table) {
        console.log("no table found!")
        return;
    }
    let player = table.getPlayerByUid(parsedPkg.uid);
    let isValid = player.checkAndSaveCliGroups(parsedPkg.groups);
    let checkRet = (isValid) ? 0 : 1;
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: parsedPkg.uid, prePkg: {
        cmd: CmdDef.SVR_RUMMY_UPLOAD_GROUPS,
        ret: checkRet,
    }});
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

RummySvs.doSendUserExit = function(sendUid, retParams) {
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

exports.doCastGameStart = function(tid) {
    let table = rummySvr.getTable(tid);
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_GAME_START};
    retPrePkg.state = table.getState();
    retPrePkg.dUid = table.getDealerUid();
    retPrePkg.smallbet = table.getSmallbet();
    retPrePkg.players = new Array();
    let players = table.getPlayers()
    players.forEach((player) => {
        if (player.getPlayState() == RummyConst.PLAYER_STATE_PLAY) {
            let ply = {}
            ply.uid = player.getUid();
            ply.money = player.getMoney();
            ply.card = player.getChooseDCard();
            ply.minusPoint = RummyConst.MAX_SCORE;
            ply.minusMoney = BigInt(RummyConst.MAX_SCORE * table.getSmallbet());
            retPrePkg.players.push(ply);
        }
    })
    players.forEach((player) => {
        if (player.getPlayState() == RummyConst.PLAYER_STATE_PLAY) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}

exports.doSendDealCards = function(tid, uid) {
    let table = rummySvr.getTable(tid);
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_DEAL_CARDS};
    retPrePkg.magicCard = table.getMagicCard();
    retPrePkg.dropCard = table.getFirstDropCard();
    retPrePkg.heapCardNum = table.getNewSlotCardNum();

    let player = table.getPlayerByUid(uid)
    let plyCards = player.getCards();
    retPrePkg.cards = new Array();
    plyCards.forEach((sCard) => {
        retPrePkg.cards.push({card: sCard});
    });

    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
}

exports.doCastUserTurn = function(tid, uid, time) {
    let table = rummySvr.getTable(tid);
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_USER_TURN, uid: uid, time: time}
    let players = table.getPlayers();
    players.forEach((player) => {
        eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
    })
}

RummySvs.doSendDraw = function(sendUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_DRAW_CARD, ret: retParams.ret}
    if (retParams.ret == 0) {
        retPrePkg.region = retParams.region;
        retPrePkg.dropCard = retParams.dropCard;
        retPrePkg.card = retParams.card;
        retPrePkg.heapCardNum = retParams.heapCardNum;
    }    
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

RummySvs.doCastDraw = function(drawCardUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_CAST_RUMMY_DRAW_CARD, uid: drawCardUid}
    retPrePkg.region = retParams.region;
    retPrePkg.dropCard = retParams.dropCard;
    retPrePkg.heapCardNum = retParams.heapCardNum;

    let table = rummySvr.getTable(retParams.tid);
    let players = table.getPlayers();
    players.forEach((player) => {
        if (player.getUid() != drawCardUid) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}

RummySvs.doSendDiscard = function(sendUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_DISCARD_CARD, ret: retParams.ret}
    if (retParams.ret == 0) {
        retPrePkg.dropCard = retParams.dropCard;
        retPrePkg.index = retParams.cliIndex;
    }
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

RummySvs.doCastDiscard = function(discardCardUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_CAST_RUMMY_DISCARD, uid: discardCardUid, dropCard: retParams.dropCard}
    
    let table = rummySvr.getTable(retParams.tid);
    let players = table.getPlayers();
    players.forEach((player) => {
        if (player.getUid() != discardCardUid) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}

module.exports = RummySvs;
