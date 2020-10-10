var myConf = require('../../config/MyConf');
const CardsDef = require(myConf.paths.model + '/cards/CardsDef');
const RoomConst = require("./RoomConst");

let RoomUtil = {};
let self = RoomUtil;
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

RoomUtil.createInitCards = function(deckNum) { // decks of cards
    let cards = new Array();
    const deck = CardsDef.cards;
    for (let j = 0; j < deckNum; j ++) {
        for (let i = 0; i < deck.length; i++) {
            if (deck[i] != CardsDef.SMALL_JOKER) {
                cards.push(deck[i]);
            }
        }
    }
    return cards;
}

RoomUtil.getChooseDealerCards = function(playerNumber) {
    let cards = new Array();
    const deck = CardsDef.cards;
    for (let i = 0; i < deck.length; i++) {
        if (deck[i] != CardsDef.SMALL_JOKER) {
            cards.push(deck[i]);
        }
    }
    cards = RoomUtil.shuffleCards(cards);
    return cards.splice(0, playerNumber);
}

RoomUtil.getMaxCard = function(cards) {
    let maxCard = 0;
    let maxCardValue = 0;
    let maxCardVariety = 0;
    for (let i = 0; i < cards.length; i++) {
        if (maxCardValue < cards[i] % 16) { // 先比大小
            maxCard = cards[i];
            maxCardValue = cards[i] % 16;
            maxCardVariety = cards[i] >> 4;
        } else if (maxCardValue == cards[i] % 16) { // 大小相同比花色
            if (maxCardVariety < cards[i] >> 4) {
                maxCard = cards[i];
                maxCardValue = cards[i] % 16;
                maxCardVariety = cards[i] >> 4;
            }
        }
    }
    return maxCard;
}

RoomUtil.shuffle1ToNum_ = function(num) {
    let idxs = new Array();
    for (i = 0; i < num; i++) {
        idxs.push(i + 1);
    }
    for (i = idxs.length - 1; i >= 1; i--) {
        let randomIdx = getRandomInteger(0, i - 1);

        // swap
        let temp = idxs[i];
        idxs[i] = idxs[randomIdx];
        idxs[randomIdx] = temp;
    }
    return idxs
}

RoomUtil.shuffleCards = function(cards) {
    let newCards = new Array();
    let idxs = RoomUtil.shuffle1ToNum_(cards.length);
    for (let i = 0; i < cards.length; i++) {
        let idx = idxs[i] - 1; // begin-with-1 change to begin-with-0
        newCards[i] = cards[idx];
    }
    return newCards
}

RoomUtil.judgeGroups = function(groups, tableMagic) {
    let retParams = {valid: false, score: 80};

    let confs = new Array();
    groups.forEach((group, idx) => {
        confs[idx] = {point: 0};
        confs[idx].cardType = self.getGroupCardType(group, tableMagic);
        group.forEach(card => {
            confs[idx].point += self.getCardScore(card, tableMagic);
        });
        confs[idx].point = (confs[idx].point > RoomConst.MAX_SCORE) ? RoomConst.MAX_SCORE : confs[idx].point;
    });
    // console.log("confs", confs)

    let isHasPureSequence = false;
    let sequenceCount = 0;
    let isHasTypeOTHER = false;
    confs.forEach(conf => {
        if (conf.cardType == RoomConst.CARD_TYPE_STRAIGHT_FLUSH) {
            isHasPureSequence = true;
        }
        if (conf.cardType == RoomConst.CARD_TYPE_STRAIGHT_FLUSH || conf.cardType == RoomConst.CARD_TYPE_STRAIGHT) {
            sequenceCount++;
        }
        if (conf.cardType == RoomConst.CARD_TYPE_OTHERS) {
            isHasTypeOTHER = true;
        }
    });
    // console.log("isHasPureSequence...", isHasPureSequence, sequenceCount, isHasTypeOTHER)
    let score = 0;
    confs.forEach(conf => { // recalculate score
        if (conf.cardType == RoomConst.CARD_TYPE_STRAIGHT_FLUSH) {conf.point = 0;}
        if (isHasPureSequence && conf.cardType == RoomConst.CARD_TYPE_STRAIGHT) {
            conf.point = 0;
        }
        if (isHasPureSequence && sequenceCount >= 2 && conf.cardType == RoomConst.CARD_TYPE_SANGONG) {
            conf.point = 0; 
        }
        // console.log("conf.point", conf.point)
        score += conf.point;
    });
    score = (score > RoomConst.MAX_SCORE) ? RoomConst.MAX_SCORE : score;
    
    retParams.score = score;
    if (isHasPureSequence && sequenceCount >= 2 && !isHasTypeOTHER && score == 0) {
        retParams.valid = true;
    }
    return retParams;
}

// 使用前提, group牌大于2张
RoomUtil.getGroupCardType = function(group, tableMagic) {
    let cardType = RoomConst.CARD_TYPE_OTHERS;
    if (group.length <= 2) {
        cardType = RoomConst.CARD_TYPE_OTHERS;
    } else if (self.isPureSequence(group)) {
        cardType = RoomConst.CARD_TYPE_STRAIGHT_FLUSH;
    } else if (self.isSequence(group, tableMagic)) {
        cardType = RoomConst.CARD_TYPE_STRAIGHT;
    } else if (self.isCardTypeSet(group, tableMagic)) {
        cardType = RoomConst.CARD_TYPE_SANGONG;
    }
    return cardType;
}

// 使用前提, group牌大于2张
RoomUtil.isPureSequence = function(group) {    
    // console.log("isPureSequence 判断有Joker牌")
    // 有Joker牌, 不能组成纯顺子(可以有魔法牌, 魔法牌当普通牌)
    for (let i = 0; i < group.length; i++) {
        if (group[i] == CardsDef.BIG_JOKER) {
            return false;
        }
    }
    // console.log("isPureSequence 判断有Joker牌 END")

    // 判断同花色
    // console.log("isPureSequence, 判断同花色")
    let firstVariety = -1;
    for (let i = 0; i < group.length; i++) {
        let curVariety = group[i] >> 4;
        if (firstVariety == -1) {
            firstVariety = curVariety;
        } else if (firstVariety != curVariety) {
            return false;
        }
    }
    // console.log("isPureSequence, 判断同花色 END")

    // 判断能连成顺子
    let values = new Array();
    let hasAce = false;
    let hasKing = false;
    for (let i = 0; i < group.length; i++) {
        let value = group[i] % 16;
        values.push(value);
        if (value == CardsDef.ACE_VALUE) {
            hasAce = true;
        } else if (value == CardsDef.KING_VALUE) {
            hasKing = true;
        }
    }
    // console.log("isPureSequence, hasAce hasKing: ", hasAce, hasKing)
    values.sort((a, b) => a - b);
    // console.log("isPureSequence, values: ",  values)
    if (hasAce && !hasKing) { // 有Ace牌, 没King牌: Ace牌能连成[A, 2, 3, ...]
        if (values[0] != CardsDef.TWO_VALUE) { // 首张牌不是2, 不能成顺子
            return false;
        }
        for (let i = 0; i < values.length - 2; i++) { // 前 n - 1 张牌不顺序递增, 不能连成顺子
            if (values[i] != values[i + 1] - 1) {
                return false;
            }
        }
    } else { // (情形1)无Ace牌, (情形2)有Ace牌和King牌: 不能连成[A, 2, 3, ...]
        for (let i = 0; i < values.length - 1; i++) {
            if (values[i] != values[i + 1] - 1) { // 前 n 张牌不顺序递增, 不能连成顺子
                return false;
            }
        }
    }

    return true;
}

RoomUtil.isSequence = function(group, tableMagic) {
    if (group.length > 13) { // 大于13张牌, 不能组成顺子
        return false;
    }
    let variableCardNum = 0;
    let commonCards = new Array();
    group.forEach((card) => {
        if (card == CardsDef.BIG_JOKER || self.isMagicCard(card, tableMagic)) {
            variableCardNum++;
        } else {
            commonCards.push(card);
        }
    });
    // console.log("isSeq variableCardNum", variableCardNum)
    // console.log("isSeq commonCards", commonCards)
    if (variableCardNum <= 0) { // 没有Joker牌或魔法牌, 不能组成顺子
        return false;
    }
    if (commonCards.length <= 0) { // 没有普通牌, 能组成顺子
        return true;
    } else if (commonCards <= 1) { // 只有一张普通牌, 函数前提传入3张以上牌, 意味着两张以上可变牌, 能组成顺子
        return true;
    }

    // 下面的逻辑, commonCards.length > 1
    // console.log("isSeq 是否同花色", commonCards)
    // 判断普通牌是否同花色
    let firstVariety = -1
    for (let i = 0; i < commonCards.length; i++) {
        let curVariety = commonCards[i] >> 4;
        if (firstVariety == -1) {
            firstVariety = curVariety;
        } else if (firstVariety != curVariety) {
            return false;
        }
    }

    // 判断是否有相同的牌
    // console.log("isSeq 判断是否有相同的牌", commonCards)
    commonCards.sort((a, b) => a - b);
    for (let i = 0; i < commonCards.length - 1; i++) {
        if (commonCards[i] == commonCards[i + 1]) {
            return false;
        }
    }

    // 获取同花色牌点数集合
    // console.log("isSeq 判断是否有相同的牌 begin...")
    let values = new Array();
    let hasAce = false;
    let hasKing = false;
    for (let i = 0; i < commonCards.length; i++) {
        let value = commonCards[i] % 16;
        values.push(value);
        if (value == CardsDef.ACE_VALUE) {
            hasAce = true;
        } else if (value == CardsDef.KING_VALUE) {
            hasKing = true;
        }
    }
    // console.log("isSeq 判断是否有相同的牌 values", values)
    // 组成顺子需要的可变牌数量
    values.sort((a, b) => a - b);
    // console.log("isSeq dd: ", (values[values.length - 1] - values[0] + 1) - values.length);
    if (hasKing) { // 有King牌, 不能组成含A开头的顺子
        // 首尾两张牌夹着的空缺牌, 小于等于可变牌, 可组成, 否则不可组成
        return (values[values.length - 1] - values[0] + 1) - values.length <= variableCardNum;
    } else if (!hasAce) { // 无King, 无Ace
        return (values[values.length - 1] - values[0] + 1) - values.length <= variableCardNum;
    } else { // 无King牌有Ace牌, [A, 2, ...]和[..., K, A]作比较
        let candidate1 = (values[values.length - 2] - 1 + 1) - values.length; // 减去的1表示减去Ace牌(当作1)牌值
        let candidate2 = (values[values.length - 1] - values[0] + 1) - values.length;
        // console.log("isSeq candidate1, candidate2", candidate1, candidate2);
        // console.log("isSeq Math.min(candidate1, candidate2)", Math.min(candidate1, candidate2));
        return Math.min(candidate1, candidate2) <= variableCardNum;
    }
}

// 使用前提, group牌大于2张
RoomUtil.isCardTypeSet = function(group, tableMagic) {
    if (group.length > 4) { // 大于4张牌, 不能组成条
        return false;
    }
    let variableCardNum = 0;
    let commonCards = new Array();
    group.forEach((card) => {
        if (card == CardsDef.BIG_JOKER || self.isMagicCard(card, tableMagic)) {
            variableCardNum++;
        } else {
            commonCards.push(card);
        }
    });
    if (commonCards.length <= 0) { // 没有普通牌, 不能组成条
        return false;
    } else if (commonCards.length == 1) { // 只有一张普通牌, 函数前提传入3张以上牌, 意味着两张以上可变牌, 能组成条
        return true;
    }

    // 下面的逻辑, commonCards.length > 1, 也即values.length > 1
    // 判断是否有相同的普通牌, 含有相同的普通牌不能组成条(条定义: 值相同, 且里不能含有相同花色的牌)
    commonCards.sort((a, b) => a - b);
    for(let i = 0; i < commonCards.length - 1; i++) {
        if (commonCards[i] == commonCards[i + 1]) {
            return false;
        }
    }
    let values = new Array();
    commonCards.forEach(card => {
        values.push(card % 16);
    });
    // 判断普通牌value值是否相同
    for (let i = 0; i < values.length - 1; i++) {
        if (values[i] != values[i + 1]) {
            return false;
        }
    }

    return true;
}

RoomUtil.isMagicCard = function(cardUint, tableMagic) {
    if (tableMagic == CardsDef.BIG_JOKER) { // Joker是魔法牌, Ace作魔法牌
        return cardUint == CardsDef.BIG_JOKER || cardUint % 16 == 0x0e
    } else {
        return cardUint != CardsDef.BIG_JOKER && cardUint % 16 == tableMagic % 16
    }
}

RoomUtil.getCardScore = function(cardUint, tableMagic) {
    let cardScore = 0

    let cardValue = cardUint % 16
    if (cardUint == CardsDef.BIG_JOKER || self.isMagicCard(cardUint, tableMagic) ) { // Joker牌 或 万能牌
        cardScore = 0;
    } else if (cardValue >= 11) { // J, Q, K, A
        cardScore = 10;
    } else if (2 <= cardValue && cardValue <= 10) { // 2-10分数为本身
        cardScore = cardValue;
    }
    return cardScore;
}

RoomUtil.getNoDropScore = function(isWinner, groups, magicCard) {
    let score = RoomConst.MAX_SCORE;
    if (isWinner) {
        score = 0;
    } else {
        let judgeParams = RoomUtil.judgeGroups(groups, magicCard);
        score = judgeParams.score;
        if (judgeParams.valid && !isWinner) {
            score = 2;
        }
    }
    return score;
}

RoomUtil.getDropScore = function(dropType) {
    let score = RoomConst.MAX_SCORE;
    if (dropType == RoomConst.PLAYER_DROP_FIRST) {
        score = 20;
    } else if (dropType == RoomConst.PLAYER_DROP_LATER) {
        score = 40;
    } else if (dropType == RoomConst.PLAYER_DROP_BAD_BEHAVIOR || dropType == RoomConst.PLAYER_DROP_WRONG_DECLARE) {
        score = RoomConst.MAX_SCORE;
    }
    return score;
}

module.exports = RoomUtil;
