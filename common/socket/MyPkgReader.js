const CmdConfig = require("../protocol/CommandConfig");
const T = require("./PkgDataType");
const MyByteMap = require("./MyByteMap");
var myConf = require("../../config/MyConf");
const SubGameDef = require(myConf.paths.model + "/subGame/SubGameDef");
const RummyCmdConfig = require("../protocol/RummyCmdConfig");
const DizhuCmdConfig = require("../protocol/DizhuCmdConfig");

let MyPkgReader = {}

let HEAD_LEN = 15;
let _pkgCache = [];
let _isParsing = false;

MyPkgReader.asyncParse = function(rawPkg, callback) {
  _pkgCache.unshift({rawPkg: rawPkg, callback: callback});

  if (!_isParsing) {
    self.consume();
  }
}

MyPkgReader.consume = function() {
  if (_pkgCache.length <= 0) {
    _isParsing = false;
    return;
  }
  _isParsing = true;
  let pkgConf = _pkgCache.pop();
  let rawPkg = pkgConf.rawPkg;
  let callback = pkgConf.callback;

  // decode body bytes;
  self.myByteDecode(rawPkg);

  let parsePkg = {}
  parsePkg.gameId = rawPkg.readInt32BE(6);
  parsePkg.cmd = rawPkg.readInt32BE(10);

  let curCmdConf = CmdConfig[parsePkg.cmd];
  if (!curCmdConf) {
    curCmdConf = MyPkgReader.getSubConf(parsePkg.gameId, parsePkg.cmd);
  }
  if (curCmdConf && curCmdConf.fmt) {
    let curPos = HEAD_LEN;
    self.parseFmt(rawPkg, curPos, curCmdConf.fmt, parsePkg);
  }

  callback && callback(parsePkg);

  _isParsing = false;
  self.consume();
}

MyPkgReader.parseFmt = function(rawPkg, curPos, fmt, resultObj) {
  fmt.forEach((value, idx) => {
    value = value || {};
    if (value.depends) {
      let needValue = value.depends(resultObj);
      if (!needValue) { return; }
    }

    if (value.type === T.ARRAY) {
      let arrayLength = 1; // default
      if (value.fixedLength) {
        arrayLength = value.fixedLength;
      } else if (value.lengthType) {
        let takeBytes = self.getPrimitiveBytes(value.lengthType);
        arrayLength = self.getPrimitive(rawPkg, value.lengthType, curPos);
        curPos += takeBytes;
      }

      if (arrayLength) {
        resultObj[value.name] = new Array();
        for (let i = 0; i < arrayLength; i++) {
          resultObj[value.name][i] = {}
          curPos = self.parseFmt(rawPkg, curPos, value.fmt, resultObj[value.name][i]);
        }
      }
    } else if (value.type === T.STRING) {
      let len = rawPkg.readUInt32BE(curPos);
      curPos += 4;
      if (len > 0) {
        // avoid last '\0'('\u0000' in utf8)
        if (rawPkg.readUInt8(curPos + len - 1) == 0) {
          resultObj[value.name] = rawPkg.toString('utf8', curPos, curPos + len - 1);
        } else {
          resultObj[value.name] = rawPkg.toString('utf8', curPos, curPos + len);
        }
      }
      curPos += len;
    } else {
      let takeBytes = self.getPrimitiveBytes(value.type);
      resultObj[value.name] = self.getPrimitive(rawPkg, value.type, curPos)
      curPos += takeBytes;
    }
  });
  return curPos;
}

MyPkgReader.getPrimitiveBytes = function(primeType) {
  let takeBytes = null;
  if (primeType === T.BYTE) { takeBytes = 1; }
  else if(primeType === T.UBYTE) { takeBytes = 1; }
  else if (primeType === T.SHORT) { takeBytes = 2; }
  else if (primeType === T.USHORT) { takeBytes = 2; }
  else if (primeType === T.INT) { takeBytes = 4; }
  else if (primeType === T.UINT) { takeBytes = 4; }
  else if (primeType === T.LONG) { takeBytes = 8; }
  else if (primeType === T.ULONG) { takeBytes = 8; }
  else {
    console.log("MyPkgReader.getPrimitiveBytes ERROR: undefined primitive type!");
  }

  return takeBytes;
}

MyPkgReader.getPrimitive = function(rawPkg, primeType, curPos) {
  if (primeType === T.BYTE) {
    return rawPkg.readInt8(curPos);
  } else if(primeType === T.UBYTE) {
    return rawPkg.readUInt8(curPos);
  } else if (primeType === T.SHORT) {
    return rawPkg.readInt16BE(curPos);
  } else if (primeType === T.USHORT) {
    return rawPkg.readUInt16BE(curPos);
  } else if (primeType === T.INT) {
    return rawPkg.readInt32BE(curPos);
  } else if (primeType === T.UINT) {
    return rawPkg.readUInt32BE(curPos);
  } else if (primeType === T.LONG) {
    return rawPkg.readBigInt64LE(curPos);
  } else if (primeType === T.ULONG) {
    return rawPkg.readBigUInt64LE(curPos);
  } else {
    console.log("MyPkgReader.getPrimitive ERROR: undefined primitive type!");
  }
}

MyPkgReader.myByteDecode = function(rawPkg) {
  for (let i = HEAD_LEN; i < rawPkg.length; i++) {
    let toReplace = rawPkg.readUInt8(i);
    let original = MyByteMap.SocketDecode.indexOf(toReplace);
    rawPkg.writeUInt8(original, i);
  }
}

MyPkgReader.getSubConf = function(gameId, cmd) {
  let subConf = null;
  if (gameId == SubGameDef.RUMMY) {
    subConf = RummyCmdConfig[cmd];
  } else if (gameId == SubGameDef.DIZHU) {
    subConf = DizhuCmdConfig[cmd];
  }
  return subConf;
}

var self = MyPkgReader;

module.exports = MyPkgReader;
