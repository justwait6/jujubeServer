let RoomConst = new Array();

// game
RoomConst.GAME_ID = 2000;

// server
RoomConst.MAX_ALLOC_TABLE = 1;
RoomConst.MAX_PRE_ALLOC_TABLE = 1;

// table

RoomConst.MAX_TABLE_PLAYERS = 3;

RoomConst.TABLE_STATE_NOT_PLAY = 0;
RoomConst.TABLE_STATE_PLAY = 1;
RoomConst.TABLE_STATE_READY = 2;

// player
RoomConst.PLAYER_STATE_OFF = 1; // not in the play
RoomConst.PLAYER_STATE_READY = 2; // not in the play, but ready
RoomConst.PLAYER_STATE_PLAY = 3; // in the play and not drop

module.exports = RoomConst;
