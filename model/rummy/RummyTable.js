let RummyTable = {};
const RummyConst = require("./RummyConst");

let RummyPlayer = require("./RummyPlayer")

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

class Table {
    constructor(tableId) {
        this.tableId_ = tableId;
        this.players_ = new Array();
    }
    setTid(tableId) {
        this.tableId_ = tableId;
    }
    getTid() {
        return this.tableId_ || -1;
    }
    setLevel(level) {
        this.level_ = level;
    }
    getLevel() {
        return this.level_ || -1;
    }
    setState(tState) {
        this.tState_ = tState;
    }
    getState() {
        return this.tState_ || RummyConst.TABLE_STATE_NOT_PLAY;
    }
    setSmallbet(smallbet) {
        this.smallbet_ = smallbet;
    }
    getSmallbet() {
        return this.smallbet_ || 0;
    }
    setDealerUid(uid) {
        this.dUid_ = uid;
    }
    getDealerUid() {
        return this.dUid_ || -1;
    }
    getPlayers() {
        return this.players_ || [];
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
        }
    }
    deletePlayerByUid(uid) {
        let player = null;
        for (let i = 0; i < this.players_.length; i++) {
            if (this.players_[i].getUid() == uid) {
                player = this.players_.splice(i, 1)[0];
            }
        }
        return player;
    }
    getPlayerByUid(uid) {
        for (let i = 0; i < this.players_.length; i++) {
            if (this.players_[i].getUid() == uid) {
                return this.players_[i];
            }
        }
    }
    randomGetIdleSeatId() {
        console.log("hhhhh", this.players_.length)
        if (this.players_.length >= RummyConst.MAX_TABLE_PLAYERS) {
            return -1;
        }
        let usedSeats = new Array();
        this.players_.forEach(player => {
            usedSeats.push(player.getSeatId());
        });
        usedSeats.sort((a, b) => a - b);
        let idleSeats = new Array();
        for (i = 0; i < RummyConst.MAX_TABLE_PLAYERS; i++) {
            if (!usedSeats.includes(i)) {
                idleSeats.push(i);
            }
        }
        let idx = getRandomInteger(0, idleSeats.length - 1);
        return idleSeats[idx];
    }

    doPlayerLogin(uid, userinfo) {
        let player = new RummyPlayer.Player(uid, userinfo);
        player.setPlayState(RummyConst.PLAYER_STATE_OFF);
        let seatId = this.randomGetIdleSeatId();
        console.log("allocated seatid: ", seatId)
        player.setSeatId(seatId);
        this.insertPlayer(player);
    }

    doPlayerExit(uid) {
        let exitParams = {};
        exitParams.ret = -1;
        let isExist = this.isPlayerExist(uid);
        if (isExist) {
            let player = this.deletePlayerByUid(uid);
            exitParams.ret = 0;
            exitParams.money = player.getMoney();
            exitParams.gold = player.getGold();
        }
        return exitParams;
    }
}
RummyTable.Table = Table;

module.exports = {
    Table: RummyTable.Table,
}