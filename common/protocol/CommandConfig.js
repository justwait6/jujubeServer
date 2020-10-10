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
}

module.exports = CommandConfig
