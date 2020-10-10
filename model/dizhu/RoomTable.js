let RoomTable = {};
const RoomConst = require("./RoomConst");

var myConf = require('../../config/MyConf');
const RoomUtil = require("./RoomUtil");
const DizhuSvs = require("../../services/dizhu/DizhuSvs");

let RoomPlayer = require("./RoomPlayer");

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
    setMagicCard(cardUint) {
        this.magicCard_ = cardUint;
    }
    getMagicCard() {
        return this.magicCard_;
    }
    setFinishCard(cardUint) {
        this.finishCard_ = cardUint;
    }
    getFinishCard() {
        return this.finishCard_;
    }
    setFirstDropCard(cardUint) {
        this.firstDropCard_ = cardUint;
    }
    getFirstDropCard() {
        return this.firstDropCard_;
    }
    setNewSlotCards(cards) {
        this.newSlotCards_ = cards;
    }
    getNewSlotCards() {
        return this.newSlotCards_;
    }
    getNewSlotCardNum() {
        return this.newSlotCards_.length;
    }
    setOldSlotCards(cards) {
        this.oldSlotCards_ = cards;
    }
    getOldSlotCards() {
        return this.oldSlotCards_;
    }
    setDealerUid(uid) {
        this.dUid_ = uid;
    }
    getDealerUid() {
        return this.dUid_;
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
    setLastDrawCard(card) {
        this.lastDrawCard_ = card;
    }
    getLastDrawCard() {
        return this.lastDrawCard_;
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
    setHasValidDeclare(valid) {
        this.hasValidDeclare_ = valid;
    }
    hasValidDeclare() {
        return this.hasValidDeclare_;
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
    drawSingleCard_(region) {
        let card = -1;
        if (region == 0) { // draw from new card area
            let cardNum = this.getNewSlotCards().length;
            card = (cardNum <= 0) ? -1 : this.newSlotCards_.splice(0, 1)[0];
        } else if (region == 1) { // draw from old area
            let cardNum = this.getOldSlotCards().length;
            card = (cardNum <= 0) ? -1 : this.oldSlotCards_.splice(this.oldSlotCards_.length - 1, 1)[0];
        }

        if (region == 1 && card != -1) { // update first drop card if fetch from old region.
            let fCard = (this.oldSlotCards_.length <= 0) ? -1 : this.oldSlotCards_[this.oldSlotCards_.length - 1];
            this.setFirstDropCard(fCard);
        }

        if (this.getNewSlotCardNum() == 0 && this.oldSlotCards_.length > 1) { // triger reshuffle
            this.triggerReshuffleOldCards_();
        }
        return card;
    }
    cardToOldSlot_(card) {
        this.oldSlotCards_.push(card);
        this.setFirstDropCard(card);
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
        let exitParams = {};
        exitParams.ret = -1;
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

    resetTable_() {
        this.setLevel(1); // todo later
    }
}
RoomTable.Table = Table;

module.exports = {
    Table: RoomTable.Table,
}