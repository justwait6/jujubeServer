let RoomTable = {};
const RoomConst = require("./RoomConst");

var myConf = require('../../config/MyConf');
const RoomUtil = require("./RoomUtil");
const DizhuSvs = require("../../services/dizhu/DizhuSvs");

let RoomPlayer = require("./RoomPlayer");
const GameSvs = require("../../services/dizhu/DizhuSvs");
const RummySvs = require("../../services/rummy/RummySvs");

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
    setBaseOdds(odds) {
        this.baseOdds_ = odds;
    }
    getBaseOdds() {
        return this.baseOdds_;
    }
    setLastCallDizhuUid(uid) {
        this.lastCallDizhuUid_ = uid;
    }
    getLastCallDizhuUid(uid) {
        return this.lastCallDizhuUid_;
    }
    setDizhuUid(uid) {
        this.dUid_ = uid;
    }
    getDizhuUid() {
        return this.dUid_;
    }
    setBottomCards(cards) {
        this.dizhuCards_ = cards;
    }
    getBottomCards() {
        return this.dizhuCards_;
    }
    setLastestOutCards(cards) {
        this.lastestOutCards_ = cards
    }
    getLastestOutCards() {
        return this.lastestOutCards_
    }
    setlastOutCardUid(uid) {
        this.lastOutCardUid_ = uid;
    }
    getlastOutCardUid(uid) {
        return this.lastOutCardUid_;
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
            if (player && player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
                return player.getUid();
            }
        }
        return -1;
    }
    setNewRound(isNew) {
        this.isNewRound_ = isNew;
    }
    isNewRound() {
        return this.isNewRound_;
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
                player.sortCards()
            }
        });

        this.players_.forEach((player) => {
            if (player.getPlayState() == RoomConst.PLAYER_STATE_PLAY) {
                GameSvs.doSendGameStart(this.getTid(), player.getUid());
            }
        });

        this.setBottomCards(cards.splice(0, RoomConst.LEFT_DIZHU_CARD_NUM));

        // deal cards anim time
        this.dealCardsDelayId_ = setTimeout(() => {
            clearTimeout(this.dealCardsDelayId_);
            this.doCheckGrabTurn();
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
            if ((nextPlayer) && (nextPlayer.getPlayState() == RoomConst.PLAYER_STATE_PLAY)
                && nextPlayer.isDesireGrab()) {
                opSeatId = nextPlayer.getSeatId();
                console.log("124", opSeatId);
                break;
            }
        }

        if (opSeatId != -1) {
            console.log("125", opSeatId);
            this.setLastOpSeatId(opSeatId);
            let svrGrabParams = {tid: this.getTid(), uid: this.getLastOpUid(), time: RoomConst.PLAYER_OP_GRAB_SECOND}
            GameSvs.doCastGrabTurn(svrGrabParams);
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

    doPlayerGrab(uid, isGrab) {
        let retParams = {ret: -1}
        let player = this.getPlayerByUid(uid);
        if (this.getLastOpSeatId() != player.getSeatId()) { // not user's turn
            return retParams;
        }
        if (this.getOpStage() != RoomConst.OP_STAGE_GRAB_DIZHU) { // not in grab stage
            retParams.ret = 2;
            return retParams;
        }
        if (!player.isDesireGrab()) { // user not desire to grab already
            retParams.ret = 3;
            return retParams;
        }
        player.setDesireGrab(isGrab);
        retParams.ret = 0;
        if (isGrab) {
            let oldOdds = this.getBaseOdds();
            if (oldOdds < RoomConst.MAX_BASE_ODDS) {
                this.setBaseOdds(++oldOdds);
                this.setLastCallDizhuUid(uid);
            }
        }
        retParams.isGrab = isGrab;
        retParams.odds = this.getBaseOdds();
        return retParams;
    }

    triggerCheckGrabResult() {
        let isGrabOver = false;
        if (this.getBaseOdds() >= RoomConst.MAX_BASE_ODDS) {
            isGrabOver = true;
            console.log("todo, grab over")
        }

        let desireGrabNum = 0;
        this.getPlayers().forEach(player => {
            if (player.isDesireGrab()) {
                desireGrabNum++;
            }
        });
        if (desireGrabNum <= 1 && this.getBaseOdds() >= 1) {
            isGrabOver = true;
        } else if (desireGrabNum == 0 && this.getBaseOdds() == 0) {
            console.log("is this game over??")
        }
        if (isGrabOver) {
            console.log("todo, grab over...")
            this.setDizhuUid(this.getLastCallDizhuUid());
            let dizhuPlayer = this.getPlayerByUid(this.getDizhuUid())
            dizhuPlayer.insertCards(this.getBottomCards())
            dizhuPlayer.sortCards();
            GameSvs.castDizhuGrabResult(this.getTid());
            this.doCheckUserTurn(true);
        } else {
            this.doCheckGrabTurn();
        }
    }

    doUserTurnTimeout() {
        this.clearOpTimeTick();
        let opPlayer = this.getPlayerBySeatId(this.getLastOpSeatId());
        if (this.getOpStage() == RoomConst.OP_STAGE_GRAB_DIZHU) {
            GameSvs.doAutoCliGrab({uid: opPlayer.getUid(), isGrab: 0});
        }
    }

    doCheckUserTurn(isFirstTurn) {
        if (this.isTurnChecking_) {
            return;
        }
        this.isTurnChecking_ = true;

        let playerSeats = this.getPlayerSeats();
        playerSeats.sort();
        let opSeatId = -1;
        this.setOpStage(RoomConst.OP_STAGE_OUT_CARD);
        if (this.isNeedNewRound_(isFirstTurn)) {
            this.setNewRound(true);
            this.getPlayers().forEach(player => {
                player.setRoundPass(false);
            });
            if (isFirstTurn) {
                opSeatId = this.getPlayerByUid(this.getDizhuUid()).getSeatId();
            } else {
                opSeatId = this.getPlayerByUid(this.getlastOutCardUid()).getSeatId();
            }
        } else {
            this.setNewRound(false);
            let idx = playerSeats.indexOf(this.getLastOpSeatId());
            idx = (idx < playerSeats.length - 1) ? idx + 1 : 0;
            let nextPlayer = this.getPlayerBySeatId(playerSeats[idx]);
            opSeatId = nextPlayer.getSeatId();
        }

        if (opSeatId != -1) {
            this.setLastOpSeatId(opSeatId);
            let svrTurnParams = {tid: this.getTid(), uid: this.getLastOpUid(), isNewRound: this.isNewRound(), time: RoomConst.PLAYER_OP_SECOND}
            GameSvs.doCastTurn(svrTurnParams);
        } else {
            console.log("No player turn ... no turn")
            this.isTurnChecking_ = false;
            return;
        }

        // deal cards anim time
        this.doClearTurn_();
        this.startOpTimeTick(RoomConst.PLAYER_OP_SECOND);
        this.turnDelayId_ = setTimeout(() => {
            this.doClearTurn_();
            this.doUserTurnTimeout();
        }, (RoomConst.PLAYER_OP_SECOND) * 1000);
        this.isTurnChecking_ = false;
    }

    isNeedNewRound_(isFirstTurn) {
        if (isFirstTurn) { return true; }
        let roundPassNum = 0;
        this.getPlayers().forEach(player => {
            if (player.isRoundPass()) {
                roundPassNum++;
            }
        });
        return roundPassNum >= RoomConst.MAX_TABLE_PLAYERS - 1;
    };

    doClearTurn_() {
        clearTimeout(this.turnDelayId_);
    }

    doPlayerOutCard(cliParams) {
        let retParams = {ret: 1};
        let player = this.getPlayerByUid(cliParams.uid);
        if (this.getLastOpSeatId() != player.getSeatId()) { // not user's turn
            return retParams;
        }
        if (this.getOpStage() != RoomConst.OP_STAGE_OUT_CARD) { // not in out card stage
            retParams.ret = 2;
            return retParams;
        }
        if (cliParams.isOut == 0) { // not out card
            player.setRoundPass(true);
        } else {
            player.setRoundPass(false);
            console.log("out card: ", cliParams.cardType, RoomUtil.getCardType(cliParams.cards))
            if (cliParams.cardType != RoomUtil.getCardType(cliParams.cards)) {
                retParams.ret = 3;
                return retParams;
            }
            console.log("cli cards: ", cliParams.cards)
            console.log("getLastestOutCards: ", this.getLastestOutCards() )
            if (!this.isNewRound()) {
                console.log("vsCards: ", RoomUtil.vsCards(cliParams.cards, this.getLastestOutCards()) )
            }
            let isOk = this.isNewRound() || (RoomUtil.vsCards(cliParams.cards, this.getLastestOutCards()) == 1 );
            if (!isOk) {
                retParams.ret = 4;
                return retParams;
            }
            let ret = player.deleteCards(cliParams.cards);
            if (ret != 0) {
                retParams.ret = 5;
                return retParams;
            } else {
                this.setLastestOutCards(cliParams.cards);
                this.setlastOutCardUid(cliParams.uid);
                retParams.cardType = cliParams.cardType
                retParams.cards = cliParams.cards
            }
        }
        retParams.ret = 0;
        retParams.isOut = cliParams.isOut;
        return retParams;
    }

    triggerCheckGameOver() {
        let isGameOver = false
        this.getPlayers().forEach(player => {
            if (player.getCards().length == 0) {
                isGameOver = true;
            }
        });
        if (isGameOver) {
            console.log("todo, game over");
        }
    }

    resetTable_() {
        this.setLevel(1); // todo later
        this.setBaseOdds(0);
    }
}
RoomTable.Table = Table;

module.exports = {
    Table: RoomTable.Table,
}