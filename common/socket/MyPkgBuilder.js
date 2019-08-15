const CmdConfig = require("../protocol/CommandConfig");
const T = require("./PkgDataType");
const MyByteMap = require("./MyByteMap");

let MyPkgBuilder = {}
let _buffer = Buffer.alloc(1000, 0);
let _bufferLength = _buffer.length;
let _buildCache = [];
let _isBuilding = false;
let _bufferEndPos = 0;

let HEAD_LEN = 11;

MyPkgBuilder.createHeader = function(buf, cmd) {
  // header length, takes 4 bytes, set to zero temporarily
  buf.writeInt32BE(0, 0);
  // 'LW', in consistant with client
  buf.write('LW', 4, 'ascii');
  // command, in consistant with client
  buf.writeInt32BE(cmd, 6);
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
      let wString = wParams[value.name];
      buf.writeUInt32BE(wString.length);
      buf.write(wString, 'utf8');
      buf.writeInt8(0);
      curPos = curPos + value.length + 1;
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

  self.createHeader(_buffer, params.cmd || 0);
  self.createBody(_buffer, CmdConfig[params.cmd], params);

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
    console.log("MyPkgReader.getPrimitive ERROR: undefined primitive type!");
  }
}

MyPkgBuilder.myByteEncode = function(rawPkg) {
  for (let i = HEAD_LEN; i < rawPkg.length; i++) {
    let toReplace = rawPkg.readUInt8(i);
    let original = MyByteMap.SocketEncode.indexOf(toReplace);
    rawPkg.writeUInt8(original, i);
  }
}

var self = MyPkgBuilder;

module.exports = MyPkgBuilder;
