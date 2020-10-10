let DizhuSvs = {};
var self = DizhuSvs;

var myConf = require('../../config/MyConf');
const RoomConst = require('../../model/dizhu/RoomConst');
const { Player } = require('../../model/dizhu/RoomPlayer');
const RoomUtil = require('../../model/dizhu/RoomUtil');
var dizhuSvr = require(myConf.paths.model + '/dizhu/DizhuSvr');

const CmdDef = require(myConf.paths.common + "/protocol/CommandDef");
const EVENT_NAMES = require(myConf.paths.common + "/event/EventNames");
const eventMgr = require(myConf.paths.common + "/event/EventMgr");

DizhuSvs.start = function() {
    eventMgr.on(EVENT_NAMES.USER_LOGIN, function(data) { self.onUserLogin(data) } );
    eventMgr.on(EVENT_NAMES.RECIEVE_PKG, function(data) { self.onPackageReceived(data) } );
    dizhuSvr.init();
}

DizhuSvs.onUserLogin = function(uid) {
    let table = dizhuSvr.queryTableByUid(uid)
    if (table) {
        let player = table.getPlayerByUid(uid);
        if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
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
    } else if (parsedPkg.cmd == CmdDef.CLI_RUMMY_DRAW_CARD) {
        self.doCliDraw(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_RUMMY_DISCARD_CARD) {
        self.doCliDiscard(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_RUMMY_FINISH) {
        self.doCliFinish(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_RUMMY_DECLARE) {
        self.doCliDeclare(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_RUMMY_DROP) {
        self.doCliDrop(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_RUMMY_UPLOAD_GROUPS) {
        self.doCliUploadGroups(parsedPkg);
    } else if (parsedPkg.cmd == CmdDef.CLI_RUMMY_GET_DROP_CARDS) {
        self.doCliGetDropCards(parsedPkg);
    }
}

DizhuSvs.doCliGetTable = function(parsedPkg) {
    let tableId = dizhuSvr.fetchOptTableId(parsedPkg.uid, parsedPkg.gameId, parsedPkg.level);

    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: parsedPkg.uid, prePkg: {
        cmd: CmdDef.SVR_GET_TABLE,
        ret: 0,
        tid: tableId,
        gameId: parsedPkg.gameId,
        level: parsedPkg.level
    }});
}

DizhuSvs.doCliEnterRoom = function(parsedPkg) {
    let table = dizhuSvr.getTable(parsedPkg.tid);
    let ret = table.doPlayerLogin(parsedPkg.uid, parsedPkg.userinfo);
    if (ret == 0) {
        dizhuSvr.insertUidTid(parsedPkg.uid, parsedPkg.tid);
    }

    // 登录返回
    self.doSendEnterRoom(parsedPkg.uid, table);

    // 广播用户坐下
    self.doCastSitDown(parsedPkg.tid, parsedPkg.uid);

    table.triggerDoGameReady();
    if (table.getState() == RoomConst.TABLE_STATE_COUNTDOWN) {
        table.reissueStartCountDown(parsedPkg.uid);
    }
}

DizhuSvs.doCliExitRoom = function(parsedPkg) {
    let table = dizhuSvr.getTable(parsedPkg.tid);    
    let retParams = table.doPlayerExit(parsedPkg.uid, parsedPkg.userinfo);
    let tState = table.getState();
    if (tState == RoomConst.TABLE_STATE_COUNTDOWN) {
        table.checkCancelGameReady();
    }
    self.doSendUserExit(parsedPkg.uid, retParams);
    if (retParams.ret == 0) {
        self.doCastUserExit(parsedPkg.tid, parsedPkg.uid);
        dizhuSvr.deleteUidTid(parsedPkg.uid, parsedPkg.tid);
    }
}

DizhuSvs.doCliDraw = function(parsedPkg) {
    let table = dizhuSvr.queryTableByUid(parsedPkg.uid);
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

DizhuSvs.doCliDiscard = function(parsedPkg) {
    let table = dizhuSvr.queryTableByUid(parsedPkg.uid);
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

    table.doCheckUserTurn() // if discard card ok, check next operate user
}

exports.doAutoDiscard = function(uid, discardCard, cliIdx) {
    self.doCliDiscard({uid: uid, card: discardCard, index: cliIdx});
}

DizhuSvs.doCliFinish = function(parsedPkg) {
    let table = dizhuSvr.queryTableByUid(parsedPkg.uid);
    if (!table) {
        console.log("no table found!")
        return;
    }
    let retParams = table.doPlayerFinish(parsedPkg.uid, parsedPkg.card);
    retParams.card = parsedPkg.card;
    self.doSendFinish(parsedPkg.uid, retParams);
    if (retParams.ret == 0) {
        self.doCastFinish(parsedPkg.uid, retParams);
    }
}

DizhuSvs.doCliDeclare = function(parsedPkg) {
    let table = dizhuSvr.queryTableByUid(parsedPkg.uid);
    if (!table) {
        console.log("no table found!")
        return;
    }
    let refinedGroups = refineGroups_(parsedPkg.groups);
    let retParams = table.doPlayerDeclare(parsedPkg.uid, refinedGroups);
    self.doSendDeclare(parsedPkg.uid, retParams);
    if (retParams.isFirstValidDeclare || retParams.tryFirstFailDeclare) { // only when first declare player, send declare cast.
        self.doCastDeclare(parsedPkg.uid, retParams);
    }
    if (retParams.isFirstValidDeclare) {
        table.onCastDeclareFinish();
    }
}

exports.doAutoDeclare = function(finishUid, groups) {
    let derfGroups = derefineGroups_(groups);
    DizhuSvs.doCliDeclare({uid: finishUid, groups: derfGroups});
}

function refineGroups_(groups) {
    let rfGroups = new Array();
    groups.forEach((group) => {
        let cards = new Array();
        for (let i = 0; i < group.cards.length; i++) {
            cards.push(group.cards[i].card);
        }
        rfGroups.push(cards);
    });
    return rfGroups;
}

function derefineGroups_(rfgroups) {
    let derfgroups = new Array();
    rfgroups.forEach((group) => {
        let derfgroup = {};
        derfgroup.cards = new Array();
        for (let i = 0; i < group.length; i++) {
            derfgroup.cards.push({card: group[i]});
        }
        derfgroups.push(derfgroup);
    });
    return derfgroups;
}

DizhuSvs.doCliDrop = function(parsedPkg) {
    let table = dizhuSvr.queryTableByUid(parsedPkg.uid);
    if (!table) {
        console.log("no table found!")
        return;
    }
    let retParams = table.doPlayerDrop(parsedPkg.uid, parsedPkg.dropType);
    console.log("doCliDrop retParams", retParams)
    self.doSendDrop(parsedPkg.uid, retParams);
    if (retParams.ret == 0) {
        self.doCastDrop(parsedPkg.uid, retParams);
    }
    table.doCheckUserTurn();
}

exports.doAutoCliDrop = function(uid, dropType) {
    self.doCliDrop({uid: uid, dropType: dropType});
}

DizhuSvs.doCliUploadGroups = function(parsedPkg) {
    let table = dizhuSvr.queryTableByUid(parsedPkg.uid);
    if (!table) {
        console.log("no table found!")
        return;
    }
    let player = table.getPlayerByUid(parsedPkg.uid);
    let refinedGroups = refineGroups_(parsedPkg.groups);
    let isValid = player.checkAndSaveCliGroups(refinedGroups, parsedPkg.drawCardPos);
    // test begin
    RoomUtil.judgeGroups(refinedGroups, table.getMagicCard());
    // test end
    let checkRet = (isValid) ? 0 : 1;
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: parsedPkg.uid, prePkg: {
        cmd: CmdDef.SVR_RUMMY_UPLOAD_GROUPS,
        ret: checkRet,
    }});
}

DizhuSvs.doCliGetDropCards = function(parsedPkg) {
    let table = dizhuSvr.queryTableByUid(parsedPkg.uid);
    let midCards = new Array();
    table.getOldSlotCards().forEach(card => {
        midCards.push({card: card});
    });
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: parsedPkg.uid, prePkg: {
        cmd: CmdDef.SVR_RUMMY_GET_DROP_CARDS,
        cards: midCards,
    }});
}

DizhuSvs.doSendEnterRoom = function(sendUid, table) {
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
    if (table.getState() == RoomConst.TABLE_STATE_PLAY) {
        let sendPlayer = table.getPlayerByUid(sendUid);
        retPrePkg.groups = derefineGroups_(sendPlayer.getGroups());
        retPrePkg.drawCardPos = sendPlayer.getDrawCardPos();
        retPrePkg.dropCard = table.getFirstDropCard();
        retPrePkg.magicCard = table.getMagicCard();
        retPrePkg.finishCard = table.getFinishCard();
        retPrePkg.heapCardNum = table.getNewSlotCardNum();
        retPrePkg.operUid = table.getLastOpUid();
        retPrePkg.leftOperSec = table.getLeftOpTime() - 1; // minus 1 second for better approxiamation
        retPrePkg.users = new Array();
        table.getPlayers().forEach(player => {
            if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY || player.getPlayState() == RoomConst.PLAYER_STATE_DROP) {
                let pp = {};
            
                pp.uid = player.getUid();
                pp.operStatus = (pp.uid == table.getLastOpUid()) ? table.getOpStage() : 0;
                pp.isDrop = (player.getPlayState() == RoomConst.PLAYER_STATE_DROP) ? 1 : 0;
                let need1 = (pp.uid == table.getLastOpUid() && table.getOpStage() == RoomConst.OP_STAGE_FINISH && table.getLeftOpTime() > 0);
                let need2 = (table.getOpStage() == RoomConst.OP_STAGE_LEFT_DECLARE && player.getPlayState() == RoomConst.PLAYER_STATE_PLAY && !player.isFinishDeclare());
                pp.isNeedDeclare = (need1 || need2) ? 1 : 0;
                pp.isFinishDeclare = player.isFinishDeclare() ? 1 : 0;
                pp.groups = player.isFinishDeclare() ? derefineGroups_(player.getGroups()) : new Array();
                retPrePkg.users.push(pp);
            }
        });
    }
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

DizhuSvs.doCastSitDown = function(tid, uid) {
    let table = dizhuSvr.getTable(tid);
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
    let table = dizhuSvr.getTable(tid);
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

exports.doSendGameStartCountDown = function(uid, time) {
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: uid, prePkg: {
        cmd: CmdDef.SVR_RUMMY_COUNTDOWN,
        leftSec: time,
    }})
}

exports.doCastGameStart = function(tid) {
    let table = dizhuSvr.getTable(tid);
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_GAME_START};
    retPrePkg.state = table.getState();
    retPrePkg.dUid = table.getDealerUid();
    retPrePkg.smallbet = table.getSmallbet();
    retPrePkg.players = new Array();
    let players = table.getPlayers()
    players.forEach((player) => {
        if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
            let ply = {}
            ply.uid = player.getUid();
            ply.money = player.getMoney();
            ply.card = player.getChooseDCard();
            ply.minusPoint = RoomConst.MAX_SCORE;
            ply.minusMoney = BigInt(RoomConst.MAX_SCORE * table.getSmallbet());
            retPrePkg.players.push(ply);
        }
    })
    players.forEach((player) => {
        if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}

exports.doSendDealCards = function(tid, uid) {
    let table = dizhuSvr.getTable(tid);
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
    let table = dizhuSvr.getTable(tid);
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_USER_TURN, uid: uid, time: time}
    let players = table.getPlayers();
    players.forEach((player) => {
        eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
    })
}

DizhuSvs.doSendDraw = function(sendUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_DRAW_CARD, ret: retParams.ret}
    if (retParams.ret == 0) {
        retPrePkg.region = retParams.region;
        retPrePkg.dropCard = retParams.dropCard;
        retPrePkg.card = retParams.card;
        retPrePkg.heapCardNum = retParams.heapCardNum;
    }    
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

DizhuSvs.doCastDraw = function(drawCardUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_CAST_RUMMY_DRAW_CARD, uid: drawCardUid}
    retPrePkg.region = retParams.region;
    retPrePkg.dropCard = retParams.dropCard;
    retPrePkg.heapCardNum = retParams.heapCardNum;

    let table = dizhuSvr.getTable(retParams.tid);
    let players = table.getPlayers();
    players.forEach((player) => {
        if (player.getUid() != drawCardUid) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}

DizhuSvs.doSendDiscard = function(sendUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_DISCARD_CARD, ret: retParams.ret}
    if (retParams.ret == 0) {
        retPrePkg.dropCard = retParams.dropCard;
        retPrePkg.index = retParams.cliIndex;
    }
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

DizhuSvs.doCastDiscard = function(discardCardUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_CAST_RUMMY_DISCARD, uid: discardCardUid, dropCard: retParams.dropCard}
    
    let table = dizhuSvr.getTable(retParams.tid);
    let players = table.getPlayers();
    players.forEach((player) => {
        if (player.getUid() != discardCardUid) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}

DizhuSvs.doSendFinish = function(sendUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_FINISH, ret: retParams.ret}
    if (retParams.ret == 0) {
        retPrePkg.time = retParams.time;
    }
        
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

DizhuSvs.doCastFinish = function(finishCardUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_CAST_RUMMY_FINISH, uid: finishCardUid, time: retParams.time, card: retParams.card}
    
    let table = dizhuSvr.getTable(retParams.tid);
    let players = table.getPlayers();
    
    players.forEach((player) => {
        if (player.getUid() != finishCardUid) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}


DizhuSvs.doSendDeclare = function(sendUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_DECLARE, ret: retParams.ret}        
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

DizhuSvs.doCastDeclare = function(declareUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_CAST_RUMMY_DECLARE, uid: declareUid, ret: retParams.ret}
    if (retParams.ret == 0) {
        retPrePkg.time = retParams.time;
    }
    
    let table = dizhuSvr.getTable(retParams.tid);
    let players = table.getPlayers();
    
    players.forEach((player) => {
        eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
    })
}

DizhuSvs.doSendDrop = function(sendUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_DROP, ret: retParams.ret}
    if (retParams.ret == 0) {
        retPrePkg.money = retParams.money;
        retPrePkg.minusMoney = retParams.minusMoney;
    }
        
    eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: sendUid, prePkg: retPrePkg});
}

DizhuSvs.doCastDrop = function(dropUid, retParams) {
    let retPrePkg = {cmd: CmdDef.SVR_CAST_RUMMY_DROP, uid: dropUid, money: retParams.money, minusMoney: retParams.minusMoney}
    
    let table = dizhuSvr.getTable(retParams.tid);
    let players = table.getPlayers();
    
    players.forEach((player) => {
        if (player.getUid() != dropUid) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    })
}

exports.doCastGameOverResult = function(tid) {
    let table = dizhuSvr.getTable(tid);

    let retPrePkg = {cmd: CmdDef.SVR_RUMMY_GAME_END_SCORE}
    retPrePkg.winUid = table.getWinnerUid();
    retPrePkg.users = new Array();
    table.getPlayers().forEach(player => {
        if (player.getPlayState() == RoomConst.PLAYER_STATE_DROP || player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
            let pp = {};
            pp.uid = player.getUid();
            pp.score = player.getScore();
            pp.money = player.getMoney();
            pp.winMoney = player.getWinMoney();
            pp.isDrop = (player.getPlayState() == RoomConst.PLAYER_STATE_DROP) ? 1 : 0;
            pp.groups = derefineGroups_(player.getGroups());
            pp.name = player.getNickname();
            pp.isFinishDeclare = player.isFinishDeclare() ? 1 : 0;
            retPrePkg.users.push(pp);
        }
    });
    retPrePkg.endtype = (table.hasValidDeclare()) ? 1 : 0;

    let players = table.getPlayers();
    players.forEach(player => {
        if (player.getPlayState() == RoomConst.PLAYER_STATE_DROP || player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
            eventMgr.emit(EVENT_NAMES.PROCESS_OUT_PKG, {uid: player.getUid(), prePkg: retPrePkg});
        }
    });
}

module.exports = DizhuSvs;
