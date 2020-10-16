const RoomConst = require("./RoomConst");
const RoomUtil = require("./RoomUtil");

let RoomPlayer = {}
class Player {
    constructor(uid, userinfo) {
        this.uid_ = uid

        let dUserinfo = JSON.parse(userinfo) || {};
        this.setMoney(dUserinfo.money);
        this.setGold(dUserinfo.gold);
        this.userinfo_ = userinfo;

        this.reset();
    }

    getUid() {
        return this.uid_;
    }

    setSeatId(seatId) {
        this.seatId_ = seatId;
    }

    getSeatId() {
        return this.seatId_;
    }

    setMoney(money) {
        this.money_ = money;
    }

    getMoney() {
        return BigInt(this.money_);
    }

    setWinMoney(money) {
        this.winMoney_ = money;
    }

    getWinMoney() {
        return BigInt(this.winMoney_);
    }

    setScore(score) {
        this.score_ = score;
    }

    getScore() {
        return this.score_;
    }

    setGold(gold) {
        this.gold_ = gold;
    }

    getGold() {
        return BigInt(this.gold_);
    }

    setUserinfo(userinfo) {
        this.userinfo_ = userinfo;
    }

    getUserinfo() {
        return this.userinfo_ || "";
    }

    setPlayState(state) {
        this.state_ = state;
    }

    getPlayState() {
        return this.state_;
    }
    
    setCards(cards) {
        this.mCards_ = cards
    }

    getCards() {
        return this.mCards_
    }
    insertCard(card) {
        this.mCards_.push(card);
    }
    insertCards(cards) {
        cards.forEach(card => {
            this.insertCard(card);
        });
    }
    sortCards() {
        this.mCards_.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    }
    deleteCard(card) {
        let idx = this.mCards_.indexOf(card);
        if (idx == -1) {
            return -1;
        }
        this.mCards_.splice(idx, 1);
    }
    deleteCards(cards) {
        cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
        console.log("delete cards", cards)
        console.log("my cards", this.mCards_)
        let moveA = cards.length - 1;
        let moveB = this.mCards_.length - 1;
        let backUpCards = new Array()
        this.mCards_.forEach(card => { backUpCards.push(card) });
        for (let i = moveA; i >= 0; i--) {
            let toDeleteCard = cards[i];
            let isFound = false;
            for (let j = moveB; j >= 0; j--) {
                if (toDeleteCard == this.mCards_[j]) {
                    isFound = true;
                    this.mCards_.splice(j, 1);
                    moveB = j - 1;
                    break;
                }
            }
            if (!isFound) {
                this.mCards_ = backUpCards;
                return -1;
            }
        }
        return 0;
    }
    setDesireGrab(isGrab) {
        this.isGrab_ = isGrab;
    }
    isDesireGrab() {
        return this.isGrab_;
    }
    setRoundPass(isPass) {
        this.isRoundPass_ = isPass;
    }
    isRoundPass() {
        return this.isRoundPass_
    }

    reset() {
        this.setWinMoney(0);
        this.setScore(0);
        this.setGold(0); // todo later
        this.setPlayState(RoomConst.PLAYER_STATE_OFF);
        this.setDesireGrab(true);
        this.setRoundPass(false);
    }
}

RoomPlayer.Player = Player;

module.exports = {
    Player: RoomPlayer.Player,
}