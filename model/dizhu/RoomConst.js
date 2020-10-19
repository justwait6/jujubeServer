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

RoomConst.T_DETAIL_STATE_PLAY = 1;
RoomConst.T_DETAIL_STATE_GRAB = 2;

// player
RoomConst.PLAYER_INIT_CARD_NUM = 17;
RoomConst.LEFT_DIZHU_CARD_NUM = 3;
RoomConst.DIZHU_MAX_CARD_NUM = 20;

RoomConst.PLAYER_STATE_OFF = 1; // not in the play
RoomConst.PLAYER_STATE_READY = 2; // not in the play, but ready
RoomConst.PLAYER_STATE_PLAY = 3; // in the play and not drop

RoomConst.PLAYER_GRAB_NONE = 0;
RoomConst.PLAYER_GRAB_NO_GRAB = 1;
RoomConst.PLAYER_GRAB_NO_CALL = 2;
RoomConst.PLAYER_GRAB_GRAB = 3;
RoomConst.PLAYER_GRAB_CALL_GRAB = 4;
RoomConst.PLAYER_GRAB_OVER = 5;

RoomConst.OUT_CARD_STATE_NONE = 0;
RoomConst.OUT_CARD_STATE_NO_OUT = 1;
RoomConst.OUT_CARD_STATE_OUT = 2;

// time interval
RoomConst.GAME_DEAL_CARDS_SECOND = 3;
RoomConst.PLAYER_OP_GRAB_SECOND = 25;
RoomConst.PLAYER_OP_SECOND = 25;

// op stage
RoomConst.OP_NO_STAGE = 0;
RoomConst.OP_STAGE_GRAB_DIZHU = 1;
RoomConst.OP_STAGE_OUT_CARD = 2;


RoomConst.CARD_T_NONE = 0;
RoomConst.CARD_T_SINGLE = 1;
RoomConst.CARD_T_PAIR = 2;
RoomConst.CARD_T_THREE = 3;
RoomConst.CARD_T_THREE_ONE = 4;
RoomConst.CARD_T_THREE_TWO = 5;
RoomConst.CARD_T_SEQ = 6;
RoomConst.CARD_T_TWIN_SEQ = 7;
RoomConst.CARD_T_THREE_SEQ = 8;
RoomConst.CARD_T_PLANE_ONE = 9;
RoomConst.CARD_T_PLANE_TWO = 10;
RoomConst.CARD_T_FOUR_TWO = 11;
RoomConst.CARD_T_FOUR_BOOM = 12;
RoomConst.CARD_T_JOKER_BOOM = 13;

module.exports = RoomConst;
