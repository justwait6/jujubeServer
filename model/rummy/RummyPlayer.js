let RummyPlayer = {}
class Player {
    constructor(uid, userinfo) {
        this.uid_ = uid

        let dUserinfo = JSON.parse(userinfo) || {};
        this.setMoney(dUserinfo.money);
        this.setGold(dUserinfo.gold);
        this.userinfo_ = userinfo;
    }

    getUid() {
        return this.uid_ || -1;
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
        return BigInt(this.money_ || 0);
    }

    setGold(gold) {
        this.gold_ = gold;
    }

    getGold() {
        return BigInt(this.gold_ || 0);
    }

    setPlayState(state) {
        this.state_ = state;
    }

    getPlayState() {
        return this.state_ || 0;
    }

    setUserinfo(userinfo) {
        this.userinfo_ = userinfo;
    }

    getUserinfo() {
        return this.userinfo_ || "";
    }

    setChooseDCard(cardUinit) {
        this.chooseDCard_ = cardUinit;
    }

    getChooseDCard() {
        return this.chooseDCard_;
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
}

RummyPlayer.Player = Player;

module.exports = {
    Player: RummyPlayer.Player,
}