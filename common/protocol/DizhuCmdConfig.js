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

  
  [CmdDef.SVR_ENTER_ROOM]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
      {name: "tid", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "level", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "state", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "smallbet", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "dUid", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
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
}

module.exports = DizhuCmdConfig
