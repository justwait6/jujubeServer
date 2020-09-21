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
    insertPlayer(player) {
        this.players_.push(player);
    }
    deletePlayerByUid(uid) {
        for (let i = 0; i < this.players_.length; i++) {
            if (this.players_[i].getUid() == uid) {
                this.players_.splice(i, 1);
            }
        }
    }
    getSeatIdByUid(uid) {
        let seatId = -1;
        this.players_.forEach(player => {
            if (uid == player.getUid()) {
                return player.getSeatId();
            }
        });
        return seatId;
    }
    randomGetIdleSeatId() {
        if (this.players_.length >= RummyConst.MAX_TABLE_PLAYERS) {
            return -1;
        }
        let usedSeats = new Array();
        this.players_.forEach(player => {
            usedSeats.push(player.getSeatId());
        });
        usedSeats.sort((a, b) => a - b);
        let idleSeats = new Array();
        for (i = 1; i <= RummyConst.MAX_TABLE_PLAYERS; i++) {
            if (!usedSeats.includes(i)) {
                idleSeats.push(i);
            }
        }
        let idx = getRandomInteger(1, idleSeats.length);
        return idleSeats[idx];
    }

    doPlayerLogin(uid, userinfo) {
        let player = new RummyPlayer.Player(uid, userinfo);
        player.setPlayState(RummyConst.PLAYER_STATE_OFF);
        let seatId = this.randomGetIdleSeatId();
        player.setSeatId(seatId);
        this.insertPlayer(player);
    }
}
RummyTable.Table = Table;

module.exports = {
    Table: RummyTable.Table,
}