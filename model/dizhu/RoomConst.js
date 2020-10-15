let RoomConst = new Array();

// game
RoomConst.GAME_ID = 2000;

// server
RoomConst.MAX_ALLOC_TABLE = 1;
RoomConst.MAX_PRE_ALLOC_TABLE = 1;

// table

RoomConst.MAX_TABLE_PLAYERS = 3;
RoomConst.MAX_BASE_ODDS = 3;

RoomConst.TABLE_STATE_NOT_PLAY = 0;
RoomConst.TABLE_STATE_PLAY = 1;
RoomConst.TABLE_STATE_READY = 2;

// player
RoomConst.PLAYER_INIT_CARD_NUM = 17;
RoomConst.LEFT_DIZHU_CARD_NUM = 3;
RoomConst.DIZHU_MAX_CARD_NUM = 20;

RoomConst.PLAYER_STATE_OFF = 1; // not in the play
RoomConst.PLAYER_STATE_READY = 2; // not in the play, but ready
RoomConst.PLAYER_STATE_PLAY = 3; // in the play and not drop

// time interval
RoomConst.GAME_DEAL_CARDS_SECOND = 3;
RoomConst.PLAYER_OP_GRAB_SECOND = 25;
RoomConst.PLAYER_OP_SECOND = 25;

// op stage
RoomConst.OP_NO_STAGE = 0;
RoomConst.OP_STAGE_GRAB_DIZHU = 1;
RoomConst.OP_STAGE_OUT_CARD = 2;

module.exports = RoomConst;
