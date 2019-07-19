const CmdDef = require("./CommandDef");
const T = require("../socket/PkgDataType");

let CommandConfig = {
  [CmdDef.CLISVR_HEART_BEAT]: {
    ver: 1,
    fmt: [
      {name: "random", type: T.ARRAY, lengthType: T.BYTE,
         fmt: [
          {name: "value",type: T.INT},
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
}

module.exports = CommandConfig
