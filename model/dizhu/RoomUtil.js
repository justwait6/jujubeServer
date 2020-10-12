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

module.exports = RoomUtil;
