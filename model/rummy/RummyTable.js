let RummyTable = {};
const RummyConst = require("./RummyConst");

var myConf = require('../../config/MyConf');
const RummyUtil = require("./RummyUtil");
const RummySvs = require("../../services/rummy/RummySvs");

let RummyPlayer = require("./RummyPlayer");

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
            if (player && player.getPlayState() == RummyConst.PLAYER_STATE_PLAY && !player.isFinishDeclare()) {
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
            if (this.getPlayerByUid(uid).getPlayState() == RummyConst.PLAYER_STATE_PLAY) {
                // in playing game and force exit room
                RummySvs.doAutoCliDrop(uid, RummyConst.PLAYER_DROP_BAD_BEHAVIOR);
            }

            let player = this.deletePlayerByUid(uid);
            exitParams.ret = 0;
            exitParams.money = player.getMoney();
            exitParams.gold = player.getGold();
        }
        return exitParams;
    }

    setGameStartCountDown_(time) {
        this.leftGameStartTime_ = time;
    }

    getGameStartCountDown_(time) {
        return this.leftGameStartTime_;
    }

    triggerDoGameReady() {
        let tState = this.getState();
        let playerNum = this.getPlayers().length;
        let isOk = (tState == RummyConst.TABLE_STATE_NOT_PLAY && playerNum >= 2);
        if (!isOk) {
            return false;
        }
        this.setGameStartCountDown_(RummyConst.GAME_START_SECOND);
        this.countDownLoopId_ = setInterval(() => {
            let leftTime = this.getGameStartCountDown_();
            if (this.leftTime > 0) {
                this.setGameStartCountDown_(--leftTime);
            }
        }, 1000);
        this.countDownDelayId_ = setTimeout(() => {
            clearTimeout(this.countDownDelayId_);
            clearInterval(this.countDownLoopId_);
            this.doGameStart();
        }, (RummyConst.GAME_START_SECOND) * 1000);

        this.setState(RummyConst.TABLE_STATE_COUNTDOWN);

        this.getPlayers().forEach((player) => {
            RummySvs.doSendGameStartCountDown(player.getUid(), this.getGameStartCountDown_());
        });
    }

    reissueStartCountDown(uid) {
        RummySvs.doSendGameStartCountDown(uid, this.getGameStartCountDown_());
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
        this.resetTable_();
    }

    doGameStart() {
        // 选庄家
        this.setState(RummyConst.TABLE_STATE_PLAY);
        this.getPlayers().forEach(player => {player.setPlayState(RummyConst.PLAYER_STATE_PLAY)});
        
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
        let cardDeckNum = (this.getPlayerSeats().length <= 2) ? 1 : 2;
        let cards = RummyUtil.createInitCards(cardDeckNum);
        cards = RummyUtil.shuffleCards(cards);

        this.setMagicCard(cards.splice(0, 1)[0]);
        this.players_.forEach((player) => {
            if (player.getPlayState() == RummyConst.PLAYER_STATE_PLAY) {
                player.setCards(cards.splice(0, RummyConst.PLAYER_INIT_CARD_NUM));
                let groups = new Array();
                groups.push(player.getCards())
                player.setGroups(groups)
            }
        });

        this.setNewSlotCards(cards);
        this.setOldSlotCards(new Array());
        this.cardToOldSlot_(cards.splice(0, 1)[0]);

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
        if (this.isUserTurnChecking_) {
            return;
        }
        this.isUserTurnChecking_ = true;

        this.setOpStage(RummyConst.OP_STAGE_DRAW);

        let playerSeats = this.getPlayerSeats();
        playerSeats.sort();
        // find current user, counterclock
        let opSeatId = -1;
        let idx = playerSeats.indexOf(this.getLastOpSeatId());
        for (let i = 0; i < playerSeats.length; i++) {
            idx = (idx > 0) ? (idx - 1) : (playerSeats.length - 1);
            let nextPlayer = this.getPlayerBySeatId(playerSeats[idx]);
            if ((nextPlayer) && (nextPlayer.getPlayState() == RummyConst.PLAYER_STATE_PLAY)) {
                opSeatId = nextPlayer.getSeatId();
                break;
            }
        }
        
        // broadcast current user turn
        if (this.getCurPlayersNum() < 2) {
            console.log("Only one player ... no turn")
            this.checkDropGameEnd_();
            this.isUserTurnChecking_ = false;
            return;
        } else if (opSeatId != -1) {
            this.setLastOpSeatId(opSeatId);
            this.getPlayerBySeatId(opSeatId).triggerRound();
            RummySvs.doCastUserTurn(this.getTid(), this.getLastOpUid(), RummyConst.PLAYER_OP_SECOND);
        } else {
            console.log("No player turn ... no turn")
            this.isUserTurnChecking_ = false;
            return;
        }

        // deal cards anim time
        this.doClearUserTurn_();
        this.startOpTimeTick(RummyConst.PLAYER_OP_SECOND);
        this.userTurnDelayId_ = setTimeout(() => {
            this.doClearUserTurn_();
            this.doUserTurnTimeout();
        }, (RummyConst.PLAYER_OP_SECOND) * 1000);

        this.isUserTurnChecking_ = false;
    }

    doClearUserTurn_() {
        clearTimeout(this.userTurnDelayId_);
    }

    doUserTurnTimeout() {
        this.clearOpTimeTick();
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
            RummySvs.doAutoDeclare(opPlayer.getUid(), opPlayer.getGroups());
        } else if (this.getOpStage() == RummyConst.OP_STAGE_LEFT_DECLARE) {
            this.getPlayers().forEach(player => {
                if (player.getPlayState() == RummyConst.PLAYER_STATE_PLAY && !player.isFinishDeclare()) {
                    RummySvs.doAutoDeclare(player.getUid(), player.getGroups());
                }
            });
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

        this.doClearUserTurn_();
        this.setOpStage(RummyConst.OP_STAGE_FINISH);
        this.startOpTimeTick(RummyConst.PLAYER_FINISH_SECOND);
        this.setFinishCard(finishCard);
        this.userFinishDelayId_ = setTimeout(() => {
            clearTimeout(this.userFinishDelayId_);
            this.doUserTurnTimeout();
        }, (RummyConst.PLAYER_FINISH_SECOND) * 1000);

        retParams.ret = 0;
        retParams.tid = this.getTid();
        retParams.time = RummyConst.PLAYER_FINISH_SECOND;
        return retParams
    }

    doPlayerDeclare(uid, groups) {
        let retParams = {ret: 1, tid: this.getTid()};
        let player = this.getPlayerByUid(uid);
        if (!this.hasValidDeclare()) { // not has valid declaration
            if (this.getLastOpSeatId() != player.getSeatId()) { // not user's turn
                return retParams;
            }
            if (this.getOpStage() != RummyConst.OP_STAGE_FINISH) { // not in finish stage
                retParams.ret = 2;
                return retParams;
            }  
        } else { // already has valid declaration
            if (this.getOpStage() != RummyConst.OP_STAGE_LEFT_DECLARE) { // not in left declare stage
                retParams.ret = 3;
                return retParams;
            }
        }
        let judgeInfo = RummyUtil.judgeGroups(groups, this.getMagicCard());
        
        if (!this.hasValidDeclare() && judgeInfo.valid) { // the first valid declare player
            this.doFirstValidDeclare_(uid);
            
            retParams.ret = 0;
            retParams.time = RummyConst.PLAYER_LEFT_DECLARE_SECOND;
            retParams.isFirstValidDeclare = true;
            return retParams;
        }
        
        if (this.hasValidDeclare()) {
            this.doLeftDeclare_(uid);
            retParams.ret = 11;
            retParams.isLeftDeclare = true; // left player declare(already has valid declaration)
        } else {
            this.doTryFailDeclare_(uid);
            retParams.ret = 10;
            retParams.tryFirstFailDeclare = true;
        }
        retParams.score = judgeInfo.score;
        return retParams;
    }

    doFirstValidDeclare_(uid) {
        clearTimeout(this.userFinishDelayId_);

        this.setHasValidDeclare(true);
        this.setWinnerUid(uid);
        let winPlayer = this.getPlayerByUid(uid);
        winPlayer.setFinishDeclare(true);
        this.doScoreAndMoneyCalc_();
        this.setOpStage(RummyConst.OP_STAGE_LEFT_DECLARE);

        this.startOpTimeTick(RummyConst.PLAYER_LEFT_DECLARE_SECOND);
        this.userLeftDeclareDelayId_ = setTimeout(() => {
            clearTimeout(this.userLeftDeclareDelayId_);
            this.doUserTurnTimeout();
        }, (RummyConst.PLAYER_LEFT_DECLARE_SECOND) * 1000);
    }

    doTryFailDeclare_(uid) {
        clearTimeout(this.userFinishDelayId_);
        let losePlayer = this.getPlayerByUid(uid);
        losePlayer.setFinishDeclare(true);
        this.cardToOldSlot_(this.getFinishCard());
        this.setFinishCard(-1);
        RummySvs.doAutoCliDrop(uid, RummyConst.PLAYER_DROP_WRONG_DECLARE);
    }

    doLeftDeclare_(uid) {
        let player = this.getPlayerByUid(uid);
        player.setFinishDeclare(true);
        this.doScoreAndMoneyCalc_();
        RummySvs.doCastGameOverResult(this.getTid());
        this.delayCheckNewGame_(this.hasValidDeclare());
    }

    onCastDeclareFinish() {
        RummySvs.doCastGameOverResult(this.getTid());
    }

    doPlayerDrop(uid, dropType) {
        let retParams = {ret: 1};
        let player = this.getPlayerByUid(uid);
        
        if (dropType != RummyConst.PLAYER_DROP_BAD_BEHAVIOR) {
            if (this.getLastOpSeatId() != player.getSeatId()) { // not user's turn
            return retParams;
            }

            // [drop] operation can only be done in draw card stage or finish stage(wrong declare in later situation)
            if (!(this.getOpStage() == RummyConst.OP_STAGE_DRAW || this.getOpStage() == RummyConst.OP_STAGE_FINISH)) {
                retParams.ret = 2;
                return retParams;
            }
        }
        if (!dropType) {
            dropType = (player.isFirstRound()) ? RummyConst.PLAYER_DROP_FIRST : RummyConst.PLAYER_DROP_LATER;
        }
        this.calcAndMarkDrop_(player.getUid(), dropType);
        retParams.ret = 0;
        retParams.tid = this.getTid();
        retParams.money = BigInt(0); // game over checkout, todo...
        retParams.minusMoney = BigInt(0);
        return retParams
    }

    checkDropGameEnd_() {
        if (this.getCurPlayersNum() == 1 && !this.hasValidDeclare()) { // drop game end
            let leftOnePlayer = null;
            this.getPlayers().forEach(player => {
                if (player.getPlayState() == RummyConst.PLAYER_STATE_PLAY) {
                    leftOnePlayer = player;
                }
            });
            this.setWinnerUid(leftOnePlayer.getUid());
            this.setHasValidDeclare(false);
            this.doScoreAndMoneyCalc_();
            RummySvs.doCastGameOverResult(this.getTid());
            this.delayCheckNewGame_(this.hasValidDeclare());
        }
    }

    calcAndMarkDrop_(dropUid, dropType) {
        let dropPlayer = this.getPlayerByUid(dropUid);
        if (dropPlayer.getPlayState() == RummyConst.PLAYER_STATE_PLAY) {
            dropPlayer.setPlayState(RummyConst.PLAYER_STATE_DROP);
            dropPlayer.setDropType(dropType);

            dropPlayer.setScore(RummyUtil.getDropScore(dropType));
            dropPlayer.setWinMoney(-dropPlayer.getScore() * this.getSmallbet());
            dropPlayer.setMoney(dropPlayer.getMoney() + dropPlayer.getWinMoney());
        }
    }

    doScoreAndMoneyCalc_() {
        let winPlayer = this.getPlayerByUid(this.getWinnerUid());
        let winnerWinMoney = 0;
        this.getPlayers().forEach(player => {
            let isWinner = (player.getUid() == winPlayer.getUid());
            let pState = player.getPlayState();
            if (pState != RummyConst.PLAYER_STATE_DROP && player.isFinishDeclare()) {
                // only player who not drop, and finish declaration
                // drop player calculates instantly when drop
                let score = RummyUtil.getNoDropScore(isWinner, player.getGroups(), this.getMagicCard());
                player.setScore(score);
                if (!isWinner) {
                    player.setWinMoney(-score * this.getSmallbet());
                    player.setMoney(player.getMoney() + player.getWinMoney());
                }
            }
            if (pState == RummyConst.PLAYER_STATE_DROP || (pState == RummyConst.PLAYER_STATE_PLAY && player.isFinishDeclare())) {
                if (!isWinner) {
                    winnerWinMoney += player.getScore() * this.getSmallbet();
                }
            }
        });
        winPlayer.setWinMoney(winnerWinMoney);
        winPlayer.setMoney(winPlayer.getMoney() + BigInt(winnerWinMoney));
    }

    delayCheckNewGame_(hasValidDeclare) {
        let canNewGame = true;
        if (hasValidDeclare) {
            this.getPlayers().forEach(player => {
                if (player.getPlayState() == RummyConst.PLAYER_STATE_PLAY && !player.isFinishDeclare()) {
                    canNewGame = false;
                }
            });
        }

        if (canNewGame) {
            this.newGameDelayId_ = setTimeout(() => {
                clearTimeout(this.newGameDelayId_);
                this.getPlayers().forEach(player => {
                    player.reset();
                })
                this.resetTable_();
                this.triggerDoGameReady();
            }, 100);
        }
    }

    resetTable_() {
        this.setLevel(1); // todo later
        this.setState(RummyConst.TABLE_STATE_NOT_PLAY);
        this.setSmallbet(0); // todo later
        this.setMagicCard(-1);
        this.setFinishCard(-1);
        this.setFirstDropCard(-1);
        this.setNewSlotCards(new Array());
        this.setOldSlotCards(new Array());
        this.setDealerUid(-1);
        this.setLastOpSeatId(-1);
        this.clearOpTimeTick();
        this.setLastDrawCard(-1);
        this.setOpStage(RummyConst.OP_NO_STAGE);
        this.setWinnerUid(-1);
        this.setHasValidDeclare(false);
    }
}
RummyTable.Table = Table;

module.exports = {
    Table: RummyTable.Table,
}