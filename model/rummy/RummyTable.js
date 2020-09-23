let RummyTable = {};
const RummyConst = require("./RummyConst");

var myConf = require('../../config/MyConf');
const RummyUtil = require("./RumyUtil");
const RummySvs = require("../../services/rummy/RummySvs");

let RummyPlayer = require("./RummyPlayer");

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
    setMagicCard(cardUint) {
        this.magicCard_ = cardUint;
    }
    getMagicCard() {
        return this.magicCard_;
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
    setGameStartCountDown(time) {
        this.gameStartCountDown_ = time;
    }
    getGameStartCountDown() {
        return this.gameStartCountDown_
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

    doGameReady() {
        let tState = this.getState();
        let playerNum = this.getPlayers().length;
        let isOk = (tState == RummyConst.TABLE_STATE_NOT_PLAY && playerNum >= 2);
        if (!isOk) {
            return false;
        }
        let leftTime = RummyConst.GAME_START_SECOND;
        this.setGameStartCountDown(leftTime);
        this.countDownLoopId_ = setInterval(() => {
            leftTime = leftTime - 1;
            if (leftTime >= 0) {
                this.setGameStartCountDown(leftTime);
            }
        }, 1000);
        this.countDownDelayId_ = setTimeout(() => {
            clearTimeout(this.countDownDelayId_);
            clearInterval(this.countDownLoopId_);
            this.doGameStart();
        }, (RummyConst.GAME_START_SECOND) * 1000);

        this.setState(RummyConst.TABLE_STATE_COUNTDOWN);

        return true;
    }

    checkCancelGameReady() {
        let tState = this.getState();
        let playerNum = this.getPlayers().length;
        if (tState == RummyConst.TABLE_STATE_COUNTDOWN && playerNum <= 1) {
            this.cancelGameReady_()
            return true;
        }
        return false;
    }

    cancelGameReady_() {
        clearTimeout(this.countDownDelayId_);
        clearInterval(this.countDownLoopId_);
        this.setState(RummyConst.TABLE_STATE_NOT_PLAY);
    }

    doGameStart() {
        // 选庄家
        this.setState(RummyConst.TABLE_STATE_CHOOSE_DEALER)
        
        let playerNum = this.getPlayers().length;
        let cards = RummyUtil.getChooseDealerCards(playerNum);
        let maxCard = RummyUtil.getMaxCard(cards);
        let smallbet = this.getSmallbet();
        for (let i = 0; i < playerNum; i++) {
            let money = this.players_[i].getMoney() - BigInt(RummyConst.MAX_SCORE * smallbet);
            this.players_[i].setMoney(money) // minus smallbet
            this.players_[i].setPlayState(RummyConst.PLAYER_STATE_PLAY) // set player play state
            this.players_[i].setChooseDCard(cards[i]) // set player play state
            if (maxCard == cards[i]) {
                if (i < playerNum - 1) {
                    this.setDealerUid(this.players_[i + 1].getUid());
                } else {
                    this.setDealerUid(this.players_[0].getUid());
                }
                
            }
        }
        RummySvs.doCastGameStart(this.getTid());

        // choose dealer anim time
        this.chooseDealerDelayId_ = setTimeout(() => {
            clearTimeout(this.chooseDealerDelayId_);
            this.doDealCards();
        }, (RummyConst.GAME_CHOOSE_D_SECOND) * 1000);
        
    }

    doDealCards() {
        console.log("todo...")
        let cards = RummyUtil.createInitCards();
        cards = RummyUtil.shuffleCards(cards);

        this.setMagicCard(cards.splice(0, 1)[0]);
        this.setFirstDropCard(cards.splice(0, 1)[0]);
        this.players_.forEach((player) => {
            if (player.getPlayState() == RummyConst.PLAYER_STATE_PLAY) {
                player.setCards(cards.splice(0, RummyConst.PLAYER_INIT_CARD_NUM));
            }
        });

        this.setNewSlotCards(cards);
        console.log(cards)
        console.log(cards)
        console.log(this.getNewSlotCardNum())
        let oldCards = new Array();
        oldCards.push(this.getFirstDropCard());
        this.setOldSlotCards(oldCards);

        this.players_.forEach((player) => {
            if (player.getPlayState() == RummyConst.PLAYER_STATE_PLAY) {
                RummySvs.doSendDealCards(this.getTid(), player.getUid());
            }
        });

        // deal cards anim time
        this.dealCardsDelayId_ = setTimeout(() => {
            clearTimeout(this.dealCardsDelayId_);
            this.doCheckUserTurn();
        }, (RummyConst.GAME_DEAL_CARDS_SECOND) * 1000);
    }

    doCheckUserTurn() {

    }
}
RummyTable.Table = Table;

module.exports = {
    Table: RummyTable.Table,
}