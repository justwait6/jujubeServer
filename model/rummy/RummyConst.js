let RummyConst = new Array();

// rummy game
RummyConst.GAME_ID = 1000;

// rummy server
RummyConst.MAX_ALLOC_TABLE = 1;
RummyConst.MAX_PRE_ALLOC_TABLE = 1;

// rummy table
RummyConst.MAX_TABLE_PLAYERS = 5;

RummyConst.TABLE_LEVEL_SMALL = 1;
RummyConst.TABLE_LEVEL_MID = 2;
RummyConst.TABLE_LEVEL_BIG = 3;

RummyConst.TABLE_STATE_NOT_PLAY = 0;
RummyConst.TABLE_STATE_PLAY = 1;
RummyConst.TABLE_STATE_COUNTDOWN = 2;
RummyConst.TABLE_STATE_CHOOSE_DEALER = 3;

RummyConst.OP_NO_STAGE = 0;
RummyConst.OP_STAGE_DRAW = 1;
RummyConst.OP_STAGE_DISCARD = 2;
RummyConst.OP_STAGE_FINISH = 3;
RummyConst.OP_STAGE_MONO_DECLARE = 4;
RummyConst.OP_STAGE_LEFT_DECLARE = 5;

RummyConst.GAME_START_SECOND = 3;
RummyConst.GAME_CHOOSE_D_SECOND = 4; // choose dealer time
RummyConst.GAME_DEAL_CARDS_SECOND = 2; // choose dealer time
RummyConst.PLAYER_OP_SECOND = 15; // player operate time
RummyConst.PLAYER_FINISH_SECOND = 15; // after player finish card, organize card need time

// rummy player
RummyConst.PLAYER_STATE_OFF = 1; // not in the play
RummyConst.PLAYER_STATE_DROP = 2; // in the play, but dropped
RummyConst.PLAYER_STATE_PLAY = 3; // in the play and not drop

// rummy game logic
RummyConst.MAX_SCORE = 80;
RummyConst.PLAYER_INIT_CARD_NUM = 13;

module.exports = RummyConst;