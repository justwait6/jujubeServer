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

    triggerRound() {
        this.curRound++;
    }

    setRound(round) {
        this.curRound = round;
    }

    isFirstRound() {
        return this.curRound == 1;
    }

    setDropType(dropType) {
        return this.dropType_ = dropType;
    }

    getDropType() {
        this.dropType_;
    }

    setFinishDeclare(finishDeclare) {
        this.finishDeclare_ = finishDeclare;
    }

    isFinishDeclare() {
        return this.finishDeclare_;
    }

    setPlayState(state) {
        this.state_ = state;
    }

    getPlayState() {
        return this.state_;
    }

    setUserinfo(userinfo) {
        this.userinfo_ = userinfo;
    }

    getUserinfo() {
        return this.userinfo_ || "";
    }

    getNickname() {
        return JSON.parse(this.userinfo_).nickName;
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
    setGroups(groups) {
        this.groups_ = groups
    }
    getGroups() {
        return this.groups_;
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
    setDrawCardPos(cliDrawPos) {
        this.clidDrawPos_ = cliDrawPos;
    }
    getDrawCardPos() {
        return this.clidDrawPos_;
    }
    checkAndSaveCliGroups(groups, cliDrawPos) {
        let cliCards = new Array();
        groups.forEach(group => {
            for (let i = 0; i < group.length; i++) {
                cliCards.push(group[i]);
            }
        });
        
        // check cards valid
        let isValid = false;
        if (cliCards.length != this.mCards_.length) { return isValid; }
        cliCards.sort();
        this.mCards_.sort();
        for (let i = 0; i < this.mCards_.length; i++) {
            if (cliCards[i] != this.mCards_[i]) {
                return isValid;
            }
        }
        isValid = true
        this.setGroups(groups); // save if valid
        this.setDrawCardPos(cliDrawPos);
        return isValid;
    }

    reset() {
        this.setWinMoney(0);
        this.setScore(0);
        this.setGold(0); // todo later
        this.setRound(0);
        this.setDropType(RoomConst.PLAYER_NO_DROP);
        this.setFinishDeclare(false);
        this.setPlayState(RoomConst.PLAYER_STATE_OFF);
        this.setChooseDCard(-1);
        this.setCards(new Array());
        this.setGroups(new Array());
        this.setDrawCardPos(-1);
    }
}

RoomPlayer.Player = Player;

module.exports = {
    Player: RoomPlayer.Player,
}