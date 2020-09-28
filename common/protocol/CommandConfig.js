const CmdDef = require("./CommandDef");
const T = require("../socket/PkgDataType");

let CommandConfig = { // Rummy Server, 只有一个协议
  [CmdDef.CLI_HEART_BEAT]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "random", type: T.ARRAY, lengthType: T.BYTE,
         fmt: [
          {name: "value", type: T.INT},
         ],
      }
    ]
  },
  [CmdDef.CLI_HALL_LOGIN]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "token", type: T.STRING},
      {name: "version", type: T.STRING},
      {name: "channel", type: T.STRING},
      {name: "deviceId", type: T.SHORT}
    ]
  },
  [CmdDef.CLI_SEND_CHAT]: {
    ver: 1,
    fmt: [
      {name: "keyId", type: T.INT},
      {name: "type", type: T.BYTE},
      {name: "srcUid", type: T.INT},
      {name: "destUid", type: T.INT},
      {name: "sentTime", type: T.INT},
      {name: "msg", type: T.STRING},
    ]
  },
  [CmdDef.CLI_GET_TABLE]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "gameId", type: T.INT},
      {name: "level", type: T.INT},
    ]
  },
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
  [CmdDef.CLI_RUMMY_DRAW_CARD]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "region", type: T.BYTE},
    ]
  },
  [CmdDef.CLI_RUMMY_DISCARD_CARD]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "card", type: T.BYTE},
      {name: "index", type: T.INT},
    ]
  },
  [CmdDef.CLI_RUMMY_FINISH]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "card", type: T.BYTE},
    ]
  },
  [CmdDef.CLI_RUMMY_DECLARE]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "groups", type: T.ARRAY, lengthType: T.BYTE,
        fmt: [
          {name: "cards", type: T.ARRAY, lengthType: T.BYTE, 
            fmt: [
              {name: "card", type: T.BYTE},
            ]
          },
        ]
      },
    ]
  },
  [CmdDef.CLI_RUMMY_DROP]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
    ]
  },
  [CmdDef.CLI_RUMMY_UPLOAD_GROUPS]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "groups", type: T.ARRAY, lengthType: T.BYTE,
        fmt: [
          {name: "cards", type: T.ARRAY, lengthType: T.BYTE, 
            fmt: [
              {name: "card", type: T.BYTE},
            ]
          },
        ]
      },
    ]
  },
  [CmdDef.CLI_RUMMY_GET_DROP_CARDS]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
    ]
  },
  

  [CmdDef.SVR_HEART_BEAT]: {
    ver: 1,
    fmt: [
      {name: "random", type: T.ARRAY, lengthType: T.BYTE,
         fmt: [
          {name: "value", type: T.INT},
         ],
      }
    ]
  },
  [CmdDef.SVR_HALL_LOGIN]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
    ]
  },
  [CmdDef.SVR_PUSH]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "pushType", type: T.INT},
    ]
  },
  [CmdDef.SVR_SEND_CHAT_RESP]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
      {name: "keyId", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "msgId", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "uid", type: T.INT},
    ]
  },
  [CmdDef.SVR_FORWARD_CHAT]: {
    ver: 1,
    fmt: [
      {name: "srcUid", type: T.INT},
      {name: "destUid", type: T.INT},
      {name: "time", type: T.INT},
      {name: "text", type: T.STRING},
    ]
  },
  [CmdDef.SVR_GET_TABLE]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.INT},
      {name: "tid", type: T.INT},
      {name: "gameId", type: T.INT},
      {name: "level", type: T.INT},
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
      {name: "groups", type: T.ARRAY, lengthType: T.BYTE, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) },
        fmt: [
          {name: "cards", type: T.ARRAY, lengthType: T.BYTE, 
            fmt: [
              {name: "card", type: T.BYTE},
            ]
          },
        ]
      },
      {name: "drawCardPos", type: T.INT, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) } },
      {name: "dropCard", type: T.BYTE, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) } },
      {name: "magicCard", type: T.BYTE, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) } },
      {name: "finishCard", type: T.BYTE, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) } },
      {name: "heapCardNum", type: T.INT, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) } },
      {name: "operUid", type: T.INT, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) } },
      {name: "leftOperSec", type: T.INT, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) } },
      {name: "users", type: T.ARRAY, lengthType: T.BYTE, depends: function(ctx){ return ctx.ret == 0 && (ctx.state == 1) },
        fmt: [
          {name: "uid", type: T.INT},
          {name: "operStatus", type: T.BYTE},
          {name: "isDrop", type: T.BYTE},
          {name: "isNeedDeclare", type: T.BYTE},
          {name: "isFinishDeclare", type: T.BYTE},
          {name: "groups", type: T.ARRAY, lengthType: T.BYTE,
            fmt: [
              {name: "cards", type: T.ARRAY, lengthType: T.BYTE, 
                fmt: [
                  {name: "card", type: T.BYTE},
                ]
              },
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
  [CmdDef.SVR_RUMMY_COUNTDOWN]: {
    ver: 1,
    fmt: [
      {name: "leftSec", type: T.BYTE},
    ]
  },
  [CmdDef.SVR_RUMMY_GAME_START]: {
    ver: 1,
    fmt: [
      {name: "state", type: T.INT},
      {name: "dUid", type: T.INT},
      {name: "smallbet", type: T.INT},
      {name: "players", type: T.ARRAY, lengthType: T.BYTE,
        fmt: [
          {name: "uid", type: T.INT},
          {name: "money", type: T.LONG},
          {name: "card", type: T.BYTE},
          {name: "minusPoint", type: T.INT},
          {name: "minusMoney", type: T.LONG},
        ]
      },
    ]
  },
  [CmdDef.SVR_RUMMY_DEAL_CARDS]: {
    ver: 1,
    fmt: [
      {name: "magicCard", type: T.BYTE},
      {name: "dropCard", type: T.BYTE},
      {name: "heapCardNum", type: T.INT},
      {name: "cards", type: T.ARRAY, lengthType: T.BYTE,
        fmt: [
          {name: "card", type: T.BYTE},
        ]
      },
    ]
  },
  [CmdDef.SVR_RUMMY_USER_TURN]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "time", type: T.INT},
    ]
  },
  [CmdDef.SVR_RUMMY_DRAW_CARD]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
      {name: "region", type: T.BYTE, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "dropCard", type: T.BYTE, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "card", type: T.BYTE, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "heapCardNum", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
    ]
  },
  [CmdDef.SVR_CAST_RUMMY_DRAW_CARD]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "region", type: T.BYTE},
      {name: "dropCard", type: T.BYTE},
      {name: "heapCardNum", type: T.INT},
    ]
  },
  [CmdDef.SVR_RUMMY_DISCARD_CARD]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
      {name: "dropCard", type: T.BYTE, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "index", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
    ]
  },
  [CmdDef.SVR_CAST_RUMMY_DISCARD]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "dropCard", type: T.BYTE},
    ]
  },
  [CmdDef.SVR_RUMMY_FINISH]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
      {name: "time", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
    ]
  },
  [CmdDef.SVR_CAST_RUMMY_FINISH]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "time", type: T.INT},
      {name: "card", type: T.BYTE},
    ]
  },
  [CmdDef.SVR_RUMMY_DECLARE]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
    ]
  },
  [CmdDef.SVR_CAST_RUMMY_DECLARE]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "ret", type: T.BYTE},
      {name: "time", type: T.INT, depends: function(ctx){ return ctx.ret == 0; } },
    ]
  },
  [CmdDef.SVR_RUMMY_DROP]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
      {name: "money", type: T.LONG, depends: function(ctx){ return ctx.ret == 0; } },
      {name: "minusMoney", type: T.LONG, depends: function(ctx){ return ctx.ret == 0; } },
    ]
  },
  [CmdDef.SVR_CAST_RUMMY_DROP]: {
    ver: 1,
    fmt: [
      {name: "uid", type: T.INT},
      {name: "money", type: T.LONG},
      {name: "minusMoney", type: T.LONG},
    ]
  },  
  [CmdDef.SVR_RUMMY_UPLOAD_GROUPS]: {
    ver: 1,
    fmt: [
      {name: "ret", type: T.BYTE},
    ]
  },
  [CmdDef.SVR_RUMMY_GET_DROP_CARDS]: {
    ver: 1,
    fmt: [
      {name: "cards", type: T.ARRAY, lengthType: T.BYTE,
        fmt: [
          {name: "card", type: T.BYTE},
        ]
      },
    ]
  },

  [CmdDef.SVR_RUMMY_GAME_END_SCORE]: {
    ver: 1,
    fmt: [
      {name:"winUid", type: T.INT},
      {name: "users", type: T.ARRAY, lengthType: T.BYTE,
        fmt: [
          {name:"uid", type: T.INT},
          {name:"score", type: T.INT},
          {name:"money", type: T.LONG},
          {name:"winMoney", type: T.LONG},
          {name:"isDrop", type: T.BYTE},
          {name: "groups", type: T.ARRAY, lengthType: T.BYTE,
            fmt: [
              {name: "cards", type: T.ARRAY, lengthType: T.BYTE,
                  fmt: [
                    {name:"card", type: T.BYTE},
                  ]
              }
            ]
          },
          {name: "name", type: T.STRING},
          {name: "isFinishDeclare", type: T.BYTE},
        ]
      },
      {name: "endtype", type: T.BYTE},
    ]
  },
}

module.exports = CommandConfig
