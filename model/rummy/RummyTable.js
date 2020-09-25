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
        return card;
    }
    cardToOldSlot_(card) {
        this.oldSlotCards_.push(card);
        this.setFirstDropCard(card);
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
    setLastOpSeatId(seatId) {
        this.lastOpSeatId_ = seatId;
    }
    getLastOpSeatId() {
        return this.lastOpSeatId_;
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
    getOpStage(stage) {
        return this.opStage_;
    }
    getPlayers() {
        return this.players_ || [];
    }
    getCurPlayersNum() { // players in current play
        let curPlayerNum = 0;
        this.players_.forEach((player) => {
            if (player.getPlayState() == RummyConst.PLAYER_STATE_PLAY) {
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
        if (usedSeats.length >= RummyConst.MAX_TABLE_PLAYERS) {
            return -1;
        }        
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
        this.setOpStage(RummyConst.OP_NO_STAGE);

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
        this.setState(RummyConst.TABLE_STATE_CHOOSE_DEALER);
        
        let playerSeats = this.getPlayerSeats();
        playerSeats.sort();
        let cards = RummyUtil.getChooseDealerCards(playerSeats.length);
        let maxCard = RummyUtil.getMaxCard(cards);
        let smallbet = this.getSmallbet();
        for (let i = 0; i < playerSeats.length; i++) { // 选庄家顺时针
            let player = this.getPlayerBySeatId(playerSeats[i]);
            let money = player.getMoney() - BigInt(RummyConst.MAX_SCORE * smallbet);
            player.setMoney(money) // minus smallbet
            player.setPlayState(RummyConst.PLAYER_STATE_PLAY)
            player.setChooseDCard(cards[i])
            if (maxCard == cards[i]) {
                let nextSeatId = (i < playerSeats.length - 1) ? playerSeats[i + 1] : playerSeats[0];
                let dealer = this.getPlayerBySeatId(nextSeatId);
                this.setDealerUid(dealer.getUid());
                this.setLastOpSeatId(dealer.getSeatId()); // initialize, suppose last op user being dealer.
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
        this.setOpStage(RummyConst.OP_STAGE_DRAW);

        let playerSeats = this.getPlayerSeats();
        playerSeats.sort();
        // find current user, counterclock
        let opUid = -1;
        let idx = playerSeats.indexOf(this.getLastOpSeatId());
        for (let i = 0; i < playerSeats.length; i++) {
            idx = (idx > 0) ? (idx - 1) : (playerSeats.length - 1);
            let nextPlayer = this.getPlayerBySeatId(playerSeats[idx]);
            if ((nextPlayer) && (nextPlayer.getPlayState() == RummyConst.PLAYER_STATE_PLAY)) {
                opUid = nextPlayer.getUid();
                this.setLastOpSeatId(nextPlayer.getSeatId());
                break;
            }
        }
        
        // broadcast current user turn
        if (this.getCurPlayersNum() < 2) {
            console.log("Only one player ... no turn")
            return;
        } else if (opUid != -1) {
            RummySvs.doCastUserTurn(this.getTid(), opUid, RummyConst.PLAYER_OP_SECOND);
        } else {
            console.log("No player turn ... no turn")
            return;
        }

        // deal cards anim time
        this.doClearUserTurn_();
        this.userTurnDelayId_ = setTimeout(() => {
            this.doClearUserTurn_();
            this.doUserTurnTimeout();
        }, (RummyConst.PLAYER_OP_SECOND) * 1000);
    }

    doClearUserTurn_() {
        clearTimeout(this.userTurnDelayId_);
    }

    doUserTurnTimeout() {
        console.log("todo, user turn timeout...")
        let opPlayer = this.getPlayerBySeatId(this.getLastOpSeatId());
        if (this.getOpStage() == RummyConst.OP_STAGE_DRAW) {
            this.doCheckUserTurn(); // audo pass if user is in draw card stage
        } else if (this.getOpStage() == RummyConst.OP_STAGE_DISCARD) {
            // help discard user's last draw card
            RummySvs.doAutoDiscard(opPlayer.getUid(), this.getLastDrawCard(), -1);
            // DO NOT WRITE doCheckUserTurn, because
            // [RummySvs.doAutoDiscard] logic later trigers [doPlayerDiscard] logic,
            // which already has [doCheckUserTurn]
        } else if (this.getOpStage() == RummyConst.OP_STAGE_FINISH) {

        }
    }

    doPlayerDraw(uid, region) {
        let retParams = {ret: 1};
        let player = this.getPlayerByUid(uid);
        if (this.getLastOpSeatId() != player.getSeatId()) { // not user's turn
            return retParams;
        }
        if (this.getOpStage() != RummyConst.OP_STAGE_DRAW) { // not in draw card stage
            retParams.ret = 2;
            return retParams;
        }
        let drawCard = this.drawSingleCard_(region);
        if (drawCard == -1) {
            retParams.ret = 3;
            return retParams;
        }   
        player.insertCard(drawCard);
        this.setLastDrawCard(drawCard);
        this.setOpStage(RummyConst.OP_STAGE_DISCARD);

        retParams.ret = 0;
        retParams.tid = this.getTid();
        retParams.region = region;
        retParams.dropCard = this.getFirstDropCard();
        retParams.card = drawCard;
        retParams.heapCardNum = this.getNewSlotCardNum();
        return retParams;
    }

    doPlayerDiscard(uid, discardCard) {
        let retParams = {ret: 1};
        let player = this.getPlayerByUid(uid);
        if (this.getLastOpSeatId() != player.getSeatId()) { // not user's turn
            return retParams;
        }
        if (this.getOpStage() != RummyConst.OP_STAGE_DISCARD) { // not in discard card stage
            retParams.ret = 2;
            return retParams;
        }
        let ret = player.deleteCard(discardCard);
        if (ret == -1) { // not find card in player cards
            retParams.ret = 3;
            return retParams;
        }
        this.cardToOldSlot_(discardCard);
        
        this.doCheckUserTurn() // if discard card ok, check next operate user

        retParams.ret = 0;
        retParams.tid = this.getTid();
        return retParams
    }

    doPlayerFinish(uid, finishCard) {
        let retParams = {ret: 1};
        let player = this.getPlayerByUid(uid);
        if (this.getLastOpSeatId() != player.getSeatId()) { // not user's turn
            return retParams;
        }
        // [finish] operation can only be done in discard card stage
        if (this.getOpStage() != RummyConst.OP_STAGE_DISCARD) {
            retParams.ret = 2;
            return retParams;
        }
        let ret = player.deleteCard(finishCard);
        if (ret == -1) { // not find card in player cards
            retParams.ret = 3;
            return retParams;
        }

        this.doClearUserTurn_()
        this.setOpStage(RummyConst.OP_STAGE_FINISH);
        this.userFinishDelayId_ = setTimeout(() => {
            clearTimeout(this.userFinishDelayId_);
            this.doUserTurnTimeout();
        }, (RummyConst.PLAYER_FINISH_SECOND) * 1000);

        retParams.ret = 0;
        retParams.tid = this.getTid();
        retParams.time = RummyConst.PLAYER_FINISH_SECOND;
        return retParams
    }

    doPlayerDrop(uid) {
        let retParams = {ret: 1};
        let player = this.getPlayerByUid(uid);
        if (this.getLastOpSeatId() != player.getSeatId()) { // not user's turn
            return retParams;
        }
        // [drop] operation can only be done in draw card stage
        if (this.getOpStage() != RummyConst.OP_STAGE_DRAW) {
            retParams.ret = 2;
            return retParams;
        }

        player.setPlayState(RummyConst.PLAYER_STATE_DROP);
        this.doCheckUserTurn();

        retParams.ret = 0;
        retParams.tid = this.getTid();
        retParams.money = BigInt(0); // game over checkout, todo...
        retParams.minusMoney = BigInt(0);
        return retParams
    }
}
RummyTable.Table = Table;

module.exports = {
    Table: RummyTable.Table,
}