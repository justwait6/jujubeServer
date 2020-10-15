const RoomConst = require("./RoomConst");

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
    deleteCard(card) {
        let idx = this.mCards_.indexOf(card);
        if (idx == -1) {
            return -1;
        }
        this.mCards_.splice(idx, 1);
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