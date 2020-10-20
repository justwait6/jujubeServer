var myConf = require('../../config/MyConf');
const CardsDef = require(myConf.paths.model + '/cards/CardsDef');
const RoomConst = require("./RoomConst");

let RoomUtil = {};
let self = RoomUtil;
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

RoomUtil.createInitCards = function() { // decks of cards
    let cards = new Array();
    const deck = CardsDef.cards;
    for (let i = 0; i < deck.length; i++) {
        cards.push(deck[i]);
    }
    return cards;
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


let isCardEqual = function(a, b) {
    return a % 16 == b % 16;
}


let isHas2OrJoker = function(cards, startIdx, endIndx) {
    let begin__ = 1;
    if (typeof(startIdx) == 'number') { begin__ = startIdx }
    let end__ =  cards.length;
    if (typeof(endIndx) == 'number') { begin__ = endIndx }
    for (let i = begin__; i < end__; i++) {
        if (cards[i] % 16 == 2 || cards[i] >> 4 == CardsDef.VARIETY_JOKER) {
            return true;
        }
    }
    return false;
}

// Compare single card, a < b returns -1, a = b returns 0, a > b returns 1
RoomUtil.compareCard = function(a, b) {
    // if has joker card
    if (a == CardsDef.SMALL_JOKER || a == CardsDef.BIG_JOKER || b == CardsDef.SMALL_JOKER || b == CardsDef.BIG_JOKER) {
        return a < b ? -1 : 1;
    }
    // if card value equal
    if (a % 16 == b % 16) { return 0; }
    // if not has joker card and has 2 card
    if (a % 16 == 2) { return 1; }
    if (b % 16 == 2)  { return -1; }
    if (a % 16 < b % 16) { return -1; }
    if (a % 16 > b % 16)  { return 1; }
}


// Sort single card, a < b returns -1, a == b returns 0, a > b returns 1
RoomUtil.sortCard = function(a, b) {
    // if has joker card
    if (a == CardsDef.SMALL_JOKER || a == CardsDef.BIG_JOKER || b == CardsDef.SMALL_JOKER || b == CardsDef.BIG_JOKER) {
        return a - b;
    }
    // if card value equal
    if (a % 16 == b % 16) {
        return (a >> 4) - (b >> 4);
    }
    // if not has joker card and has 2 card
    if (a % 16 == 2) { return 1 };
    if (b % 16 == 2) { return -1 };
    return a % 16 - b % 16;
}

RoomUtil.getCardType = function(cards) {
    let cardType = RoomConst.CARD_T_NONE;
    if (cards.length == 1) {
        cardType = RoomConst.CARD_T_SINGLE;
    }
    else if (RoomUtil.isPair(cards)) {
        cardType = RoomConst.CARD_T_PAIR;
    } else if (RoomUtil.isThree(cards)) {
        cardType = RoomConst.CARD_T_THREE;
    } else if (RoomUtil.isThreeOne(cards)) {
        cardType = RoomConst.CARD_T_THREE_ONE;
    } else if (RoomUtil.isThreeTwo(cards)) {
        cardType = RoomConst.CARD_T_THREE_TWO;
    } else if (RoomUtil.isSeq(cards)) {
        cardType = RoomConst.CARD_T_SEQ;
    } else if (RoomUtil.isTwinSeq(cards)) {
        cardType = RoomConst.CARD_T_TWIN_SEQ;
    } else if (RoomUtil.isThreeSeq(cards)) {
        cardType = RoomConst.CARD_T_THREE_SEQ;
    } else if (RoomUtil.isPlaneOne(cards)) {
        cardType = RoomConst.CARD_T_PLANE_ONE;
    } else if (RoomUtil.isPlaneTwo(cards)) {
        cardType = RoomConst.CARD_T_PLANE_TWO;
    } else if (RoomUtil.isFourTwo(cards)) {
        cardType = RoomConst.CARD_T_FOUR_TWO;
    } else if (RoomUtil.isFourBoom(cards)) {
        cardType = RoomConst.CARD_T_FOUR_BOOM;
    } else if (RoomUtil.isJokerBoom(cards)) {
        cardType = RoomConst.CARD_T_JOKER_BOOM;
    }
    return cardType;
}


RoomUtil.isPair = function(cards) {
    if (cards.length != 2) { return false; }
    return isCardEqual(cards[0], cards[1]) && cards[0] >> 4 != CardsDef.VARIETY_JOKER;
}

RoomUtil.isThree = function(cards) {
    if (cards.length != 3) { return false; }
    return isCardEqual(cards[0], cards[1]) && isCardEqual(cards[1], cards[2]);
}

RoomUtil.isThreeOne = function(cards) {
    if (cards.length != 4) { return false; }
    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    return ( RoomUtil.isThree([cards[0], cards[1], cards[2]]) && !isCardEqual(cards[2], cards[3]) )
        || ( !isCardEqual(cards[0], cards[1]) && RoomUtil.isThree([cards[1], cards[2], cards[3]]) );
}

RoomUtil.isThreeTwo = function(cards) {
    if (cards.length != 5) { return false; }
    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    return ( RoomUtil.isThree([cards[0], cards[1], cards[2]]) && isCardEqual(cards[3], cards[4]) )
        || ( isCardEqual(cards[0], cards[1]) && RoomUtil.isThree([cards[2], cards[3], cards[4]]) );
}

RoomUtil.isSeq = function(cards) {
    if (cards.length < 5 || 12 < cards.length) { return false; }

    // 不能含有2和王
    if (isHas2OrJoker(cards)) { return false; }

    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    // 检查是否顺序递增
    let values = new Array();
    cards.forEach(card => { values.push(card % 16) });

    for (let i = 0; i < values.length - 1; i++) {
        if (values[i] != values[i + 1] - 1) { // 不顺序递增, 不能连成顺子
            return false;
        }
    }
    return true;
}

RoomUtil.isTwinSeq = function(cards) {
    if (cards.length < 6) { return false; }
    if (cards.length % 2 != 0) { return false; } // 偶数张牌

    // 不能含有2和王
    if (isHas2OrJoker(cards)) { return false; }

    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    // 检查是否顺序对子递增
    let values = new Array();
    cards.forEach(card => { values.push(card % 16) });
    for (let i = 0; i < values.length - 2; i = i + 2) { // (注意不要越界)
        if (values[i] != values[i + 1]) { // 与其后第一张牌不等值, 不能组成连对
            return false;
        }
        if (values[i] != values[i + 2] - 1) { // 与其后第二张牌不递增, 不能组成连对
            return false;
        }
    }
    return true;
}

RoomUtil.isThreeSeq = function(cards) {
    if (cards.length < 6) { return false; }
    if (cards.length % 3 != 0) { return false; } // 3的倍数

    // 不能含有2和王
    if (isHas2OrJoker(cards)) { return false; }

    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    // 检查是否3顺
    let values = new Array();
    cards.forEach(card => { values.push(card % 16) });
    for (let i = 0; i < values.length; i = i + 3) { // (注意不要越界)
        if (values[i] != values[i + 1] || values[i + 1] != values[i + 2]) { // 与其后两张牌不等值, 不能组成3顺
            return false;
        }
        if (i < values.length - 3 && values[i] != values[i + 3] - 1) { // 与其后第三张牌不递增, 不能组成连对
            return false;
        }
    }
    return true;
}

let canMapPlaneSeq = function(tags, startIdx, endIdx) {
    if (isHas2OrJoker(tags, startIdx, endIdx)) { return false; }
    for (let i = startIdx; i < endIdx - 1; i++) {
        if (tags[i] % 16 != tags[i + 1] % 16 - 1) {
            return false;
        }
    }
    return true;
}

RoomUtil.isPlaneOne = function(cards) {
    if (cards.length < 8) { return false; }
    if (cards.length % 4 != 0) { return false; } // 4的倍数

    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    let threeCardTags = new Array();

    let i = 0;
    while (i <= cards.length - 1) {
        if (i < cards.length - 2 && RoomUtil.isThree([cards[i], cards[i + 1], cards[i + 2]])) {
            threeCardTags.push(cards[i]);
            i = i + 2;
        }
        i++;
    }

    if (threeCardTags.length == cards.length / 4) {
        return canMapPlaneSeq(threeCardTags, 0, threeCardTags.length - 1);
    } else if (threeCardTags.length > cards.length / 4) {
        return canMapPlaneSeq(threeCardTags, 0, threeCardTags.length - 2) || canMapPlaneSeq(threeCardTags, 1, threeCardTags.length - 1);
    } else {
        return false;
    }
}

RoomUtil.isPlaneTwo = function(cards) {
    if (cards.length < 10) { return false; }
    if (cards.length % 5 != 0) { return false; } // 5的倍数

    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    let threeCardTags = new Array();

    let i = 0;
    while (i < cards.length - 1) {
        if (i < cards.length - 2 && RoomUtil.isThree([cards[i], cards[i + 1], cards[i + 2]])) { // 注意不要越界
            threeCardTags.push(cards[i]);
            i = i + 3;
        } else if (RoomUtil.isPair([cards[i], cards[i + 1]])) {
            i = i + 2;
        } else { // 既不是三顺, 又不是对子, 直接返回false
            return false;
        }
    }

    if (threeCardTags.length == cards.length / 5) {
        return canMapPlaneSeq(threeCardTags, 0, threeCardTags.length - 1);
    } else if (threeCardTags.length > cards.length / 5) {
        return canMapPlaneSeq(threeCardTags, 0, threeCardTags.length - 2) || canMapPlaneSeq(threeCardTags, 1, threeCardTags.length - 1);
    } else {
        return false;
    }
}

RoomUtil.isFourTwo = function(cards) {
    if (cards.length != 6) { return false; }
    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    for (let i = 0; i < 3; i++) {
        if (RoomUtil.isFourBoom([cards[i], cards[i + 1], cards[i + 2], cards[i + 3]])) {
            return true;
        }
    }
    return false;
}

RoomUtil.isFourBoom = function(cards) {
    if (cards.length != 4) { return false; }
    return isCardEqual(cards[0], cards[1]) && isCardEqual(cards[1], cards[2]) && isCardEqual(cards[2], cards[3]);
}

RoomUtil.isJokerBoom = function(cards) {
    if (cards.length != 2) { return false; }
    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    return cards[0] == CardsDef.SMALL_JOKER && cards[1] == CardsDef.BIG_JOKER;
}


/**
 * 比较牌型以及牌大小
 * 返回值: 1, 能比较, 且cards1大; 0, 能比较, 且大小相等; -1, 能比较, 且且cards2大;
 *      2, 不能比较, 含有非法牌型 3, 不能比较(牌型不一样且无炸弹), 4, 不能比较, 牌型一样但牌不一样数量
 */ 
RoomUtil.vsCards = function(cards1, cards2) {
    let type1 = RoomUtil.getCardType(cards1);
    let type2 = RoomUtil.getCardType(cards2);
    if ( (type1 == RoomConst.CARD_T_NONE) || (type2 == RoomConst.CARD_T_NONE) ) { // 含有非法牌型
        return 2;
    }
    if (type1 != type2) { // 牌型不一样
        if (type1 == RoomConst.CARD_T_JOKER_BOOM) { return 1; }
        if (type2 == RoomConst.CARD_T_JOKER_BOOM) { return -1; }
        if (type1 == RoomConst.CARD_T_FOUR_BOOM) { return 1; }
        if (type2 == RoomConst.CARD_T_FOUR_BOOM) { return 1; }
        return 3 // 牌型不一样, 且没有炸弹, 非法   
    }
    if (cards1.length != cards2.length) { return 4; }
    // 牌型相等, 且数量相同, 取关键牌比较即可
    let keyCard1 = RoomUtil.getKeyCard(type1, cards1)
    let keyCard2 = RoomUtil.getKeyCard(type2, cards2)
    return RoomUtil.compareCard(keyCard1, keyCard2)
}

// 使用前提: 两组牌牌型相等, 且数量相同 
RoomUtil.getKeyCard = function(cardType, cards) {
    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });

    if ( cardType == RoomConst.CARD_T_SINGLE || cardType == RoomConst.CARD_T_PAIR
        || cardType == RoomConst.CARD_T_THREE || cardType == RoomConst.CARD_T_FOUR_BOOM
        || cardType == RoomConst.CARD_T_SEQ || cardType == RoomConst.CARD_T_TWIN_SEQ
        || cardType == RoomConst.CARD_T_THREE_SEQ ) {
            return cards[0];
    } else if (cardType == RoomConst.CARD_T_THREE_ONE || cardType == RoomConst.CARD_T_THREE_TWO) {
        return RoomUtil.isThree([cards[0], cards[1], cards[2]]) ? cards[0] : cards[cards.length - 1];
    } else if (RoomUtil.isFourTwo(cards)) {
        for (let i = 0; i < 3; i++) { // 注意不要越界
            if (RoomUtil.isFourBoom([cards[i], cards[i + 1], cards[i + 2], cards[i + 3]])) {
                return cards[i];
            }
        }
    } else if (cardType == RoomConst.CARD_T_PLANE_ONE) {
        return RoomUtil.getPlaneOneKeyCard(cards);
    } else if (cardType == RoomConst.CARD_T_PLANE_TWO) {
        return RoomUtil.getPlaneTwoKeyCard(cards);   
    }
}

// 使用前提: 牌型已经为飞机带单牌组
RoomUtil.getPlaneOneKeyCard = function(cards) {
    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    let threeCardTags = new Array();
    let i = 0;
    while (i <= cards.length - 1) {
        if ( i < cards.length - 2 && RoomUtil.isThree([cards[i], cards[i + 1], cards[i + 2]]) ) {
            threeCardTags.push(cards[i]);
            i = i + 3;
        } else {
            i = i + 1;
        }
    }
    if (threeCardTags.length == cards / 4) {
        return threeCardTags[0];
    } else if (threeCardTags.length > cards / 4) {
        if (canMapPlaneSeq(threeCardTags, 0, threeCardTags.length - 2)) {
            return threeCardTags[0];
        }
        if (canMapPlaneSeq(threeCardTags, 1, threeCardTags.length - 1)) {
            return threeCardTags[1];
        }
    }
}

// 使用前提: 牌型已经为飞机带对牌组
RoomUtil.getPlaneTwoKeyCard = function(cards) {
    cards.sort(function(a, b) { return RoomUtil.sortCard(a, b); });
    let threeCardTags = new Array();
    let i = 0;
    while (i <= cards.length - 1) {
        if ( i < cards.length - 2 && RoomUtil.isThree([cards[i], cards[i + 1], cards[i + 2]]) ) { // 注意不要越界
            threeCardTags.push(cards[i]);
            i = i + 3;
        } else if (RoomUtil.isPair([cards[i], cards[i + 1]])) {
            i = i + 2;
        }
    }
    if (threeCardTags.length == cards / 5) {
        return threeCardTags[0];
    } else if (threeCardTags.length > cards / 5) {
        if (canMapPlaneSeq(threeCardTags, 0, threeCardTags.length - 2)) {
            return threeCardTags[0];
        }
        if (canMapPlaneSeq(threeCardTags, 1, threeCardTags.length - 1)) {
            return threeCardTags[1];
        }
    }
}

module.exports = RoomUtil;
