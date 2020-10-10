let RoomConst = new Array();

// rummy game
RoomConst.GAME_ID = 1000;

// rummy server
RoomConst.MAX_ALLOC_TABLE = 1;
RoomConst.MAX_PRE_ALLOC_TABLE = 1;

// rummy table
RoomConst.MAX_TABLE_PLAYERS = 5;

RoomConst.TABLE_LEVEL_SMALL = 1;
RoomConst.TABLE_LEVEL_MID = 2;
RoomConst.TABLE_LEVEL_BIG = 3;

RoomConst.TABLE_STATE_NOT_PLAY = 0;
RoomConst.TABLE_STATE_PLAY = 1;
RoomConst.TABLE_STATE_COUNTDOWN = 2;

RoomConst.OP_NO_STAGE = 0;
RoomConst.OP_STAGE_DRAW = 1;
RoomConst.OP_STAGE_DISCARD = 2;
RoomConst.OP_STAGE_FINISH = 3;
RoomConst.OP_STAGE_LEFT_DECLARE = 4;

RoomConst.GAME_START_SECOND = 3;
RoomConst.GAME_CHOOSE_D_SECOND = 4; // choose dealer time
RoomConst.GAME_DEAL_CARDS_SECOND = 2; // choose dealer time
RoomConst.PLAYER_OP_SECOND = 25; // player operate time
RoomConst.PLAYER_FINISH_SECOND = 25; // after player finish card, organize card need time
RoomConst.PLAYER_LEFT_DECLARE_SECOND = 25; // after first valid declaration, left players organize card need time

// rummy player
RoomConst.PLAYER_STATE_OFF = 1; // not in the play
RoomConst.PLAYER_STATE_DROP = 2; // in the play, but dropped
RoomConst.PLAYER_STATE_PLAY = 3; // in the play and not drop

RoomConst.PLAYER_NO_DROP = 0; // no drop
RoomConst.PLAYER_DROP_FIRST = 1; // first round drop
RoomConst.PLAYER_DROP_LATER = 2; // in the play and not drop
RoomConst.PLAYER_DROP_BAD_BEHAVIOR = 3; // force exit room when game
RoomConst.PLAYER_DROP_WRONG_DECLARE = 4; // wrong declare


// rummy game logic
RoomConst.MAX_SCORE = 80;
RoomConst.PLAYER_INIT_CARD_NUM = 13;

RoomConst.CARD_TYPE_OTHERS = 0
RoomConst.CARD_TYPE_STRAIGHT = 1
RoomConst.CARD_TYPE_STRAIGHT_FLUSH = 2
RoomConst.CARD_TYPE_SANGONG = 3

module.exports = RoomConst;