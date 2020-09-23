var myConf = require('../../config/MyConf');
const { doCliEnterRoom } = require('../../services/rummy/RummySvs');
const CardsDef = require(myConf.paths.model + '/cards/CardsDef');

let RummyUtil = {};
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

RummyUtil.createInitCards = function() {
    let cards = new Array();
    const deck = CardsDef.cards;
    const deckNum = 2; // 2 decks of cards
    for (let j = 0; j < deckNum; j ++) {
        for (let i = 0; i < deck.length; i++) {
            if (deck[i] != CardsDef.SMALL_JOKER) {
                cards.push(deck[i]);
            }
        }
    }
    return cards;
}

RummyUtil.getChooseDealerCards = function(playerNumber) {
    let cards = new Array();
    const deck = CardsDef.cards;
    for (let i = 0; i < deck.length; i++) {
        if (deck[i] != CardsDef.SMALL_JOKER) {
            cards.push(deck[i]);
        }
    }
    cards = RummyUtil.shuffleCards(cards);
    return cards.splice(0, playerNumber);
}

RummyUtil.getMaxCard = function(cards) {
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

RummyUtil.shuffle1ToNum_ = function(num) {
    let idxs = new Array();
    for (i = 0; i < num; i++) {
        idxs.push(i + 1);
    }
    for (i = idxs.length - 1; i >= 0; i--) {
        let randomIdx = getRandomInteger(0, i);

        // swap
        let temp = idxs[i];
        idxs[i] = idxs[randomIdx];
        idxs[randomIdx] = temp;
    }
    return idxs
}

RummyUtil.shuffleCards = function(cards) {
    let newCards = new Array();
    let idxs = RummyUtil.shuffle1ToNum_(cards.length);
    for (let i = 0; i < cards.length; i++) {
        let idx = idxs[i] - 1; // begin-with-1 change to begin-with-0
        newCards[i] = cards[idx];
    }
    return newCards
}

module.exports = RummyUtil;
