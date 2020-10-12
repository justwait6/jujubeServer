let RoomTable = {};
const RoomConst = require("./RoomConst");

var myConf = require('../../config/MyConf');
const RoomUtil = require("./RoomUtil");
const DizhuSvs = require("../../services/dizhu/DizhuSvs");

let RoomPlayer = require("./RoomPlayer");
const GameSvs = require("../../services/dizhu/DizhuSvs");

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

class Table {
    constructor(tableId) {
        this.tableId_ = tableId;
        this.players_ = new Array();

        this.resetTable_();
    }
    setTid(tableId) {
        this.tableId_ = tableId;
    }
    getTid() {
        return this.tableId_;
    }
    setLevel(level) {
        this.level_ = level;
    }
    getLevel() {
        return this.level_;
    }
    setState(tState) {
        this.tState_ = tState;
    }
    getState() {
        return this.tState_;
    }
    setSmallbet(smallbet) {
        this.smallbet_ = smallbet;
    }
    getSmallbet() {
        return this.smallbet_;
    }
    setDizhuUid(uid) {
        this.dUid_ = uid;
    }
    getDizhuUid() {
        return this.dUid_;
    }
    setDizhuCards(cards) {
        this.dizhuCards_ = cards;
    }
    getDizhuCards() {
        return this.dizhuCards_;
    }
    setLastOpSeatId(seatId) {
        this.lastOpSeatId_ = seatId;
    }
    getLastOpSeatId() {
        return this.lastOpSeatId_;
    }
    getLeftOpTime() {
        return this.leftOpTime_ || -1;
    }
    setOpStage(stage) {
        this.opStage_ = stage;
    }
    getOpStage() {
        return this.opStage_;
    }
    setWinnerUid(uid) {
        this.winnerUid_ = uid;
    }
    getWinnerUid() {
        return this.winnerUid_;
    }
    startOpTimeTick(time) {
        this.clearOpTimeTick();
        this.leftOpTime_ = time;
        this.timeTickId_ = setInterval(() => {
            this.leftOpTime_--;
        }, 1000);
    }
    clearOpTimeTick() {
        clearInterval(this.timeTickId_);
    }
    getLastOpUid() {
        let opSeatId = this.getLastOpSeatId();
        if (opSeatId >= 0) {
            let player = this.getPlayerBySeatId(opSeatId);
            if (player && player.getPlayState() == RoomConst.PLAYER_STATE_PLAY && !player.isFinishDeclare()) {
                return player.getUid();
            }
        }
        return -1;
    }
    getPlayers() {
        return this.players_ || [];
    }
    getCurPlayersNum() { // players in current play
        let curPlayerNum = 0;
        this.players_.forEach((player) => {
            if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
                curPlayerNum++;
            }
        })
        return curPlayerNum;
    }
    isPlayerExist(uid) {
        let isExist = false;
        this.players_.forEach((player) => {
            if (player.getUid() == uid) {
                isExist = true;
            }
        })
        return isExist;
    }
    insertPlayer(player) {
        if (!this.isPlayerExist(player.getUid())) {
            this.players_.push(player);
            return true;
        }
        return false;
    }
    deletePlayerByUid(uid) {
        for (let i = 0; i < this.players_.length; i++) {
            if (this.players_[i].getUid() == uid) {
                return this.players_.splice(i, 1)[0];
            }
        }
        return null;
    }
    getPlayerByUid(uid) {
        for (let i = 0; i < this.players_.length; i++) {
            if (this.players_[i].getUid() == uid) {
                return this.players_[i];
            }
        }
        return null;
    }
    getPlayerBySeatId(seatId) {
        for (let i = 0; i < this.players_.length; i++) {
            if (this.players_[i].getSeatId() == seatId) {
                return this.players_[i];
            }
        }
        return null;
    }
    getPlayerSeats() {
        let pSeats = new Array();
        this.getPlayers().forEach(player => {
            pSeats.push(player.getSeatId());
        });
        return pSeats;
    }
    randomGetIdleSeatId(usedSeats) {
        if (usedSeats.length >= RoomConst.MAX_TABLE_PLAYERS) {
            return -1;
        }        
        let idleSeats = new Array();
        for (i = 0; i < RoomConst.MAX_TABLE_PLAYERS; i++) {
            if (!usedSeats.includes(i)) {
                idleSeats.push(i);
            }
        }
        let idx = getRandomInteger(0, idleSeats.length - 1);
        return idleSeats[idx];
    }

    doPlayerLogin(uid, userinfo) {
        let player = new RoomPlayer.Player(uid, userinfo);
        player.setPlayState(RoomConst.PLAYER_STATE_OFF);
        
        let pSeats = this.getPlayerSeats();
        pSeats.sort();
        let seatId = this.randomGetIdleSeatId(pSeats);
        player.setSeatId(seatId);
        this.insertPlayer(player);
        return 0;
    }

    doPlayerExit(uid) {
        let exitParams = {ret: -1};
        let isExist = this.isPlayerExist(uid);
        if (isExist) {
            if (this.getPlayerByUid(uid).getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
                // in playing game and force exit room
                DizhuSvs.doAutoCliDrop(uid, RoomConst.PLAYER_DROP_BAD_BEHAVIOR);
            }

            let player = this.deletePlayerByUid(uid);
            exitParams.ret = 0;
            exitParams.money = player.getMoney();
            exitParams.gold = player.getGold();
        }
        return exitParams;
    }

    doPlayerReady(uid) {
        let readyParams = {ret: -1};
        let player = this.getPlayerByUid(uid);
        if (player.getPlayState() == RoomConst.PLAYER_STATE_OFF) {
            readyParams.ret = 0;
            player.setPlayState(RoomConst.PLAYER_STATE_READY);
        }
        return readyParams;
    }

    triggerCheckStart() {
        let canStart = true;
        this.getPlayers().forEach(player => {
            if (player.getPlayState() != RoomConst.PLAYER_STATE_READY) {
                canStart = false;
            }
        });
        if (this.getPlayers().length != RoomConst.MAX_TABLE_PLAYERS) {
            canStart = false;
        }

        if (canStart) {
            console.log("todo later, game start")
            this.doGameStart_();
        }
    }

    doGameStart_() {
        this.setState(RoomConst.TABLE_STATE_PLAY);
        this.getPlayers().forEach(player => {player.setPlayState(RoomConst.PLAYER_STATE_PLAY)});

        let cards = RoomUtil.createInitCards();
        cards = RoomUtil.shuffleCards(cards);

        this.players_.forEach((player) => {
            if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
                player.setCards(cards.splice(0, RoomConst.PLAYER_INIT_CARD_NUM));
            }
        });

        this.players_.forEach((player) => {
            if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
                GameSvs.doSendGameStart(this.getTid(), player.getUid());
            }
        });

        this.setDizhuCards(cards.splice(0, RoomConst.LEFT_DIZHU_CARD_NUM));

        // deal cards anim time
        this.dealCardsDelayId_ = setTimeout(() => {
            clearTimeout(this.dealCardsDelayId_);
            // this.doCheckGrabTurn();
        }, (RoomConst.GAME_DEAL_CARDS_SECOND) * 1000);
    }

    doCheckGrabTurn() {
        if (this.isGrabTurnChecking_) {
            return;
        }
        this.isGrabTurnChecking_ = true;

        this.setOpStage(RoomConst.OP_STAGE_GRAB_DIZHU);

        let playerSeats = this.getPlayerSeats();
        playerSeats.sort();

        // find current user, counterclock
        let opSeatId = -1;
        let idx = playerSeats.indexOf(this.getLastOpSeatId());
        for (let i = 0; i < playerSeats.length; i++) {
            idx = (idx < playerSeats.length - 1) ? idx + 1 : 0;
            let nextPlayer = this.getPlayerBySeatId(playerSeats[idx]);
            if ((nextPlayer) && (nextPlayer.getPlayState() == RoomConst.PLAYER_STATE_PLAY)) {
                opSeatId = nextPlayer.getSeatId();
                break;
            }
        }

        if (opSeatId != -1) {
            this.setLastOpSeatId(opSeatId);
            // GameSvs.doCastUserTurn(this.getTid(), this.getLastOpUid(), RoomConst.PLAYER_OP_SECOND);
        } else {
            console.log("No player turn ... no turn")
            this.isUserTurnChecking_ = false;
            return;
        }

        // deal cards anim time
        this.doClearGrabTurn_();
        this.startOpTimeTick(RoomConst.PLAYER_OP_GRAB_SECOND);
        this.grabTurnDelayId_ = setTimeout(() => {
            this.doClearGrabTurn_();
            this.doUserTurnTimeout();
        }, (RoomConst.PLAYER_OP_GRAB_SECOND) * 1000);

        this.isGrabTurnChecking_ = false;
    }

    doClearGrabTurn_() {
        clearTimeout(this.grabTurnDelayId_);
    }

    doUserTurnTimeout() {
        this.clearOpTimeTick();
        let opPlayer = this.getPlayerBySeatId(this.getLastOpSeatId());
        if (this.getOpStage() == RoomConst.OP_STAGE_GRAB_DIZHU) {
            // GameSvs.doAutoCliGrab({isGrab: 0});
        }
    }

    resetTable_() {
        this.setLevel(1); // todo later
    }
}
RoomTable.Table = Table;

module.exports = {
    Table: RoomTable.Table,
}