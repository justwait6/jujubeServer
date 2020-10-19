const CmdDef = require("./CommandDef");
const T = require("../socket/PkgDataType");

let DizhuCmdConfig = { // Rummy Server, 只有一个协议
  [CmdDef.CLI_ENTER_ROOM]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "gameId", type: T.INT},
      {name: "tid", type: T.INT},
      {name: "userinfo", type: T.STRING},
    ]
  },
  [CmdDef.CLI_EXIT_ROOM]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "tid", type: T.INT},
    ]
  },
  [CmdDef.CLI_DIZHU_READY]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
    ]
  },
  [CmdDef.CLI_DIZHU_GRAB]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "isGrab", type: T.BYTE},
    ]
  },
  [CmdDef.CLI_DIZHU_OUT_CARD]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "isOut", type: T.BYTE},
      {name: "cardType", type: T.BYTE, depends: function(ctx){ return ctx.isOut == 1; } },
      {name: "cards", type: T.ARRAY, lengthType: T.BYTE, depends: function(ctx){ return ctx.isOut == 1; },
        fmt: [
          {name: "card", type: T.BYTE},
        ]
      },
    ]
  },

  
  [CmdDef.SVR_ENTER_ROOM]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
      {name: "tid", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "level", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "state", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "smallbet", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "players", type: T.ARRAY, lengthType: T.BYTE, depends: function(ctx){ return ctx.ret == 0 },
        fmt: [
          {name: "uid", type: T.INT},
          {name: "seatId", type: T.INT},
          {name: "money", type: T.LONG},
          {name: "gold", type: T.LONG},
          {name: "userinfo", type: T.STRING},
          {name: "state",type: T.INT}
        ]
      },
      {name: "dUid", type: T.INT, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1); } },
      {name: "cards", type: T.ARRAY, lengthType: T.BYTE, depends: function(ctx){ return (ctx.ret == 0) && (ctx.state == 1); },
        fmt: [
          {name: "card", type: T.BYTE},
        ]
      },
      {name: "detailState", type: T.BYTE, depends: function(ctx){ return (ctx.ret == 0) && (ctx.state == 1); } },
      {name: "operUid", type: T.INT, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) } },
      {name: "leftOperSec", type: T.INT, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) } },
      {name: "odds", type: T.INT, depends: function(ctx){ return (ctx.ret == 0) && (ctx.state == 1); } },
      {name: "isNewRound", type: T.BYTE, depends: function(ctx){ return (ctx.ret == 0) && (ctx.detailState == 1); } },
      {name: "bottomCards", type: T.ARRAY, lengthType: T.BYTE, depends: function(ctx){ return (ctx.ret == 0) && (ctx.detailState == 1); },
        fmt: [
          {name: "card", type: T.BYTE},
        ]
      },
      {name: "latestOutCards", type: T.ARRAY, lengthType: T.BYTE, depends: function(ctx){ return (ctx.ret == 0) && (ctx.detailState == 1)  && (ctx.isNewRound == 0); },
        fmt: [
          {name: "card", type: T.BYTE},
        ]
      },
      {name: "users", type: T.ARRAY, lengthType: T.BYTE, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) },
        fmt: [
          {name: "uid", type: T.INT},
          {name: "grabState", type: T.BYTE},
          {name: "outCardState", type: T.BYTE},
          {name: "cardsNum", type: T.INT},
          {name: "outCards", type: T.ARRAY, lengthType: T.BYTE, 
            fmt: [
              {name: "card", type: T.BYTE},
            ]
          },
        ]
      },
    ]
  },
  [CmdDef.SVR_EXIT_ROOM]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
      {name: "money", type: T.LONG, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "gold", type: T.LONG, depends: function(ctx){ return ctx.ret == 0; } },
    ]
  },
  [CmdDef.SVR_CAST_EXIT_ROOM]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
    ]
  },
  [CmdDef.SVR_CAST_USER_SIT]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "seatId", type: T.INT},
      {name: "money", type: T.LONG},
      {name: "gold", type: T.LONG},
      {name: "userinfo", type: T.STRING},
      {name: "state",type: T.INT},
    ]
  },
  [CmdDef.SVR_DIZHU_READY]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
    ]
  },
  [CmdDef.SVR_CAST_DIZHU_READY]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
    ]
  },
  [CmdDef.SVR_DIZHU_GAME_START]: {
    ver: 1,
    fmt: [
      {name: "cards", type: T.ARRAY, lengthType: T.BYTE,
        fmt: [
          {name: "card", type: T.BYTE},
        ]
      },
    ]
  },
  [CmdDef.SVR_DIZHU_GRAB_TURN]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "odds", type: T.INT},
      {name: "time", type: T.INT},
    ]
  },
  [CmdDef.SVR_DIZHU_GRAB]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
      {name: "isGrab", type: T.BYTE, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "odds", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
    ]
  },
  [CmdDef.SVR_CAST_DIZHU_GRAB]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "isGrab", type: T.BYTE},
      {name: "odds", type: T.INT},
    ]
  },
  [CmdDef.SVR_DIZHU_GRAB_RESULT]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "odds", type: T.INT},
      {name: "cards", type: T.ARRAY, lengthType: T.BYTE,
        fmt: [
          {name: "card", type: T.BYTE},
        ]
      },
    ]
  },
  [CmdDef.SVR_DIZHU_TURN]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "isNewRound", type: T.BYTE},
      {name: "time", type: T.INT},
    ]
  },
  [CmdDef.SVR_DIZHU_OUT_CARD]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
      {name: "isOut", type: T.BYTE, depends: function(ctx){ return ctx.ret == 0; } },
    ]
  },
  [CmdDef.SVR_CAST_DIZHU_OUT_CARD]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "isOut", type: T.BYTE},
      {name: "cardType", type: T.BYTE, depends: function(ctx){ return ctx.isOut == 1; } },
      {name: "cards", type: T.ARRAY, lengthType: T.BYTE, depends: function(ctx){ return ctx.isOut == 1; },
        fmt: [
          {name: "card", type: T.BYTE},
        ]
      },
    ]
  },
}

module.exports = DizhuCmdConfig
