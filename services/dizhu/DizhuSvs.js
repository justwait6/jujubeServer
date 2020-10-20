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
    } else if (parsedPkg.cmd == CmdDef.CLI_DIZHU_GRAB) {
        self.doCliGrab(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_DIZHU_OUT_CARD) {
        self.doCliOutCard(parsedPkg);
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

DizhuSvs.doCliGrab = function(parsedPkg) {
    let table = gameSvr.queryTableByUid(parsedPkg.uid);
    let retParams = table.doPlayerGrab(parsedPkg.uid, parsedPkg.isGrab);
    self.doSendGrab(parsedPkg.uid, retParams);
    if (retParams.ret == 0) {
        self.doCastGrab(table.getTid(), parsedPkg.uid, retParams);
    }
    table.triggerCheckGrabResult();
}

exports.doAutoCliGrab = function(parsedPkg) {
    DizhuSvs.doCliGrab(parsedPkg);
}

function refineCliCards_(cards) {
    let rfCards = new Array();
    cards.forEach((cardTbl) => {
        rfCards.push(cardTbl.card);
    });
    return rfCards;
}

function derefineCliCards_(cards) {
    let derfCards = new Array();
    cards.forEach((sCard) => {
        derfCards.push({card: sCard})
    });
    return derfCards;
}

DizhuSvs.doCliOutCard = function(parsedPkg) {
    let table = gameSvr.queryTableByUid(parsedPkg.uid);
    if (parsedPkg.isOut == 1) {
        parsedPkg.cards = refineCliCards_(parsedPkg.cards);
    }
    let retParams = table.doPlayerOutCard(parsedPkg);
    self.doSendOutCards(parsedPkg.uid, retParams);
    if (retParams.ret == 0) {
        self.doCastOutCards(table.getTid(), parsedPkg.uid, retParams);
    }
    let isGameOVer = table.checkGameOver();
    if (!isGameOVer) {
        table.doCheckUserTurn(); // if discard card ok, check next operate user
    }
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
        let sendPlayer = table.getPlayerByUid(sendUid);
        retPrePkg.dUid = table.getDizhuUid();
        retPrePkg.cards = derefineCliCards_(sendPlayer.getCards());
        retPrePkg.detailState = (table.getOpStage() == RoomConst.OP_STAGE_GRAB_DIZHU) ? RoomConst.T_DETAIL_STATE_GRAB : RoomConst.T_DETAIL_STATE_PLAY;
        retPrePkg.operUid = table.getLastOpUid();
        retPrePkg.leftOperSec = table.getLeftOpTime() - 1; // minus 1 second for better approxiamation
        retPrePkg.odds = table.getBaseOdds();
        if (retPrePkg.detailState == RoomConst.T_DETAIL_STATE_PLAY) {
            retPrePkg.isNewRound = table.isNewRound() ? 1 : 0;
            retPrePkg.bottomCards = derefineCliCards_(table.getBottomCards());
        }
        if (retPrePkg.detailState == RoomConst.T_DETAIL_STATE_PLAY && retPrePkg.isNewRound == 0) {
            retPrePkg.latestOutCards = derefineCliCards_(table.getLastestOutCards());
        }
        retPrePkg.users = new Array();
        table.getPlayers().forEach(player => {
            if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
                let pp = {};
                pp.uid = player.getUid();
                pp.grabState = player.getGrabState();
                pp.outCardState = player.getOutCardState();
                pp.cardsNum = player.getCards().length;
                pp.outCards = new Array();
                if (pp.outCardState == RoomConst.OUT_CARD_STATE_OUT) {
                    pp.outCards = derefineCliCards_(player.getLastOutCards());
                }
                retPrePkg.users.push(pp);
            }
        });
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

exports.doCastGrabTurn = function(svrGrabParams) {
    let table = gameSvr.getTable(svrGrabParams.tid);
    let retPrePkg = {
        cmd: CmdDef.SVR_DIZHU_GRAB_TURN,
        uid: svrGrabParams.uid,
        odds: table.getBaseOdds(),
        time: svrGrabParams.time
    }
    table.getPlayers().forEach(player => {
        if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}

DizhuSvs.doSendGrab = function(sendUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_DIZHU_GRAB, ret: retParams.ret};
    if (retParams.ret == 0) {
        retPrePkg.isGrab = retParams.isGrab;
        retPrePkg.odds = retParams.odds;
    }
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});  
}


DizhuSvs.doCastGrab = function(tid, grabUid, retParams) {
    let table = gameSvr.getTable(tid);
    let retPrePkg = {
        cmd: CmdDef.SVR_CAST_DIZHU_GRAB,
        uid: grabUid,
        isGrab: retParams.isGrab,
        odds: retParams.odds
    }
    table.getPlayers().forEach(player => {
        if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY && player.getUid() != grabUid) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}

exports.castDizhuGrabResult = function(tid) {
    let table = gameSvr.getTable(tid);
    let retPrePkg = {
        cmd: CmdDef.SVR_DIZHU_GRAB_RESULT,
        uid: table.getDizhuUid(),
        odds: table.getBaseOdds(),
    }
    retPrePkg.cards = derefineCliCards_(table.getBottomCards());
    table.getPlayers().forEach(player => {
        if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}

exports.doCastTurn = function(svrTurnParams) {
    let table = gameSvr.getTable(svrTurnParams.tid);
    let retPrePkg = {
        cmd: CmdDef.SVR_DIZHU_TURN,
        uid: svrTurnParams.uid,
        isNewRound: table.isNewRound() ? 1 : 0,
        time: svrTurnParams.time
    }
    table.getPlayers().forEach(player => {
        if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    });
}

DizhuSvs.doSendOutCards = function(sendUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_DIZHU_OUT_CARD, ret: retParams.ret};
    if (retParams.ret == 0) {
        retPrePkg.isOut = retParams.isOut;
    }
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg}); 
}

DizhuSvs.doCastOutCards = function(tid, outCardUid, retParams) {
    let table = gameSvr.getTable(tid);
    let retPrePkg = {
        cmd: CmdDef.SVR_CAST_DIZHU_OUT_CARD,
        uid: outCardUid,
        isOut: retParams.isOut,
    }
    if (retParams.isOut == 1) {
        retPrePkg.cardType = retParams.cardType;
        retPrePkg.cards = derefineCliCards_(retParams.cards);
    }
    table.getPlayers().forEach(player => {
        if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY && player.getUid() != outCardUid) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}

module.exports = DizhuSvs;
