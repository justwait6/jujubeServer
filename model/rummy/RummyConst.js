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

// rummy player
RummyConst.PLAYER_STATE_OFF = 1; // not in the play
RummyConst.PLAYER_STATE_DROP = 2; // in the play, but dropped
RummyConst.PLAYER_STATE_PLAY = 3; // in the play and not drop

module.exports = RummyConst;