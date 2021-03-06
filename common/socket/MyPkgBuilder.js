const CmdConfig = require("../protocol/CommandConfig");
const T = require("./PkgDataType");
const MyByteMap = require("./MyByteMap");

var myConf = require("../../config/MyConf");
const SubGameDef = require(myConf.paths.model + "/subGame/SubGameDef");
const RummyCmdConfig = require("../protocol/RummyCmdConfig");
const DizhuCmdConfig = require("../protocol/DizhuCmdConfig");

let MyPkgBuilder = {}
let _buffer = Buffer.alloc(1000, 0);
let _bufferLength = _buffer.length;
let _buildCache = [];
let _isBuilding = false;
let _bufferEndPos = 0;

let HEAD_LEN = 15;

MyPkgBuilder.createHeader = function(buf, gameId, cmd) {
  // header length, takes 4 bytes, set to zero temporarily
  buf.writeInt32BE(0, 0);
  // 'LW', in consistant with client
  buf.write('LW', 4, 'ascii');
  // command, in consistant with client
  buf.writeInt32BE(gameId, 6);
  buf.writeInt32BE(cmd, 10);
  // check code, default 0
  buf.writeInt8(0, 10);
}

MyPkgBuilder.modifyCommand = function(buf, cmd) {
  // command, in consistant with client
  buf.writeInt32BE(cmd, 6);
}

MyPkgBuilder.createBody = function(buf, cmdConfig, params) {
  if (cmdConfig && cmdConfig.fmt) {
    let curPos = HEAD_LEN;
    _bufferEndPos = curPos // default;
    _bufferEndPos = self.buildFmt(buf, curPos, cmdConfig.fmt, params);
  } else {
    console.log("MyPkgBuilder.createBody ERROR: no cmd config or cmd config.fmt!")
  }
}

function getUtf8Length(inputStr) {
  let totalLength = 0;
  for (let i = 0; i < inputStr.length; i++) {
    if (inputStr.charCodeAt(i) <= parseInt("0x7f")) {
      totalLength += 1;
    } else if (inputStr.charCodeAt(i) <= parseInt("0x7FF")) {
      totalLength += 2;
    } else if (inputStr.charCodeAt(i) <= parseInt("0xFFFF")) {
      totalLength += 3;
    } else if (inputStr.charCodeAt(i) <= parseInt("0x1FFFFF")) {
      totalLength += 4;
    } else if (inputStr.charCodeAt(i) <= parseInt("0x3FFFFFF")) {
      totalLength += 5;
    } else {
      totalLength += 6;
    }
  }
 return totalLength ;
}

MyPkgBuilder.buildFmt = function(buf, curPos, fmt, wParams) {
  fmt.forEach((value, idx) => {
    value = value || {};
    if (value.depends) {
      let needValue = value.depends(wParams);
      if (!needValue) { return; }
    }
    
    if (value.type === T.ARRAY) {
      // write array length
      let arrayLength = wParams[value.name].length; // default
      if (value.lengthType) {
        let takeBytes = self.getPrimitiveBytes(value.lengthType);
        self.writePrimitive(buf, arrayLength, value.lengthType, curPos);
        curPos += takeBytes;
      } else {
        self.writePrimitive(buf, arrayLength, T.BYTE, curPos);
        curPos += 1;
      }

      if (arrayLength) {
        // loop write array
        for (let i = 0; i < arrayLength; i++) {
          curPos = self.buildFmt(buf, curPos, value.fmt, wParams[value.name][i]);
        }
      }
    } else if (value.type === T.STRING) {
      // console.log("write string curPos: " + curPos)
      let wString = wParams[value.name];
      // block begin
      let strLen = getUtf8Length(wString);
      buf.writeUInt32BE(strLen + 1, curPos); // 1 represents the "\0" padding at the end
      buf.write(wString, curPos + 4, strLen, 'utf8') // 4 bytes the string length size(unsigned int)
      buf.writeInt8(0, curPos + 4 + strLen); // 1 byte the "\0" length size.
      curPos = curPos + 4 + strLen + 1 
      // block end
      // console.log("write " + "value: " + wString + ", Type: string" + ", writePos: " + curPos);
    } else {
      let takeBytes = self.getPrimitiveBytes(value.type);
      self.writePrimitive(buf, wParams[value.name], value.type, curPos);
      curPos += takeBytes;
    }
  });
  return curPos;
}

MyPkgBuilder.asyncBuild = function(params, callback) {
  _buildCache.unshift({params: params, callback: callback});
  if (!_isBuilding) {
    self.consume();
  }
}

MyPkgBuilder.consume = function() {
  if (_buildCache.length <= 0) {
    _isBuilding = false;
    return;
  }
  _isBuilding = true;
  let buildConf = _buildCache.pop();
  let params = buildConf.params;
  let callback = buildConf.callback;
  self.createHeader(_buffer, params.gameId || SubGameDef.NONE, params.cmd || 0);
  let curCmdConf = CmdConfig[params.cmd];
  if (!curCmdConf) {
    curCmdConf = MyPkgBuilder.getSubCurConf(params.gameId, params.cmd);
  }
  self.createBody(_buffer, curCmdConf, params);

  // attach calc package lengh
  let buildLen = _bufferEndPos - 0;
  _buffer.writeInt32BE(buildLen, 0);
  let buildBuf = Buffer.alloc(buildLen);
  _buffer.copy(buildBuf, 0, 0, _bufferEndPos);  

  // encode body bytes
  self.myByteEncode(buildBuf)
  callback && callback(buildBuf);
  _isBuilding = false;
  self.consume();
}

MyPkgBuilder.getPrimitiveBytes = function(primeType) {
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
    console.log("MyPkgBuilder.getPrimitiveBytes ERROR: undefined primitive type!");
  }

  return takeBytes;
}


MyPkgBuilder.writePrimitive = function(buf, value, primeType, writePos) {
  // console.log("write " + "value: " + value + ", primeType: ", primeType + ", writePos: " + writePos);
  if (primeType === T.BYTE) {
    return buf.writeInt8(value, writePos);
  } else if(primeType === T.UBYTE) {
    return buf.writeUInt8(value, writePos);
  } else if (primeType === T.SHORT) {
    return buf.writeInt16BE(value, writePos);
  } else if (primeType === T.USHORT) {
    return buf.writeUInt16BE(value, writePos);
  } else if (primeType === T.INT) {
    return buf.writeInt32BE(value, writePos);
  } else if (primeType === T.UINT) {
    return buf.writeUInt32BE(value, writePos);
  } else if (primeType === T.LONG) {
    return buf.writeBigInt64LE(value, writePos);
  } else if (primeType === T.ULONG) {
    return buf.writeBigUInt64LE(value, writePos);
  } else {
    console.log("MyPkgBuilder.getPrimitive ERROR: undefined primitive type!");
  }
}

MyPkgBuilder.myByteEncode = function(rawPkg) {
  for (let i = HEAD_LEN; i < rawPkg.length; i++) {
    let toReplace = rawPkg.readUInt8(i);
    let original = MyByteMap.SocketEncode.indexOf(toReplace);
    rawPkg.writeUInt8(original, i);
  }
}

MyPkgBuilder.getSubCurConf = function(gameId, cmd) {
  let subConf = null;
  if (gameId == SubGameDef.RUMMY) {
    subConf = RummyCmdConfig[cmd];
  } else if (gameId == SubGameDef.DIZHU) {
    subConf = DizhuCmdConfig[cmd];
  }
  return subConf;
}

var self = MyPkgBuilder;

module.exports = MyPkgBuilder;
