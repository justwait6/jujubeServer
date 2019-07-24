let HEAD_LEN = 11;
function UserPkgBuffer() {
  // Loop buffer
  this._buffer = Buffer.alloc(1000, 0);
  this._bufferLength = this._buffer.length;
  this._writePointer = 0;
  this._readPointer = 0;
  this._dataLen = 0;

  this.reset = function() {
    this._bufferLength = this._buffer.length;
    this._writePointer = 0;
    this._readPointer = 0;
    this._dataLen = 0;
  }

  this.writeBuffer = function(buf, callback) {

    let dataReadStart = 0;
    let dataLength = buf.length;
    let availableLen = this._bufferLength - this._dataLen;

    if (availableLen < dataLength) {
      // buffer not enough, need larger buffer.      
      let newLength = Math.ceil((this._dataLen + dataLength) / this._bufferLength) * this._bufferLength;
      let _tmpBuffer = Buffer.alloc(newLength);

      if (this._writePointer < this._readPointer) {
        let dataTailLen = this._bufferLength - this._readPointer;
        this._buffer.copy()
        this._buffer.copy(_tmpBuffer, 0, this._readPointer, this._readPointer + dataTailLen);
        this._buffer.copy(_tmpBuffer, dataTailLen, 0, this._writePointer);
      } else {
        this._buffer.copy(_tmpBuffer, 0, _readPointer, _writePointer);
      }

      this._bufferLength = newLength;
      this._buffer = _tmpBuffer;
      _tmpBuffer = null;
      this._readPointer = 0;
      this._writePointer = this._dataLen;

      buf.copy(this._buffer, this._writePointer, dataReadStart, dataReadStart + dataLength);
      this._dataLen += dataLength;
      this._writePointer += dataLength;
    } else if (this._writePointer + dataLength > this._bufferLength) {
      // buffer enough, but touch buffer end.
      let bufferTailLength = this._bufferLength - this._writePointer;

      let dataEndPosition = dataReadStart + bufferTailLength;
      buf.copy(this._buffer, this._writePointer, dataReadStart, dataEndPosition);

      let restDataLen = dataLength - bufferTailLength;
      buf.copy(this._buffer, 0, dataEndPosition, dataLength);

      this._dataLen += dataLength;
      this._writePointer = restDataLen;
    } else {
      buf.copy(this._buffer, this._writePointer, dataReadStart, dataReadStart + dataLength);
      this._dataLen += dataLength;
      this._writePointer += dataLength;
    }
  }

  this.checkIsFullPkg = function(callback) {
    if (this._dataLen < HEAD_LEN) {
      console.log('data length < head length waiting data...');
      callback && callback();
    }

    let restDataLen = this._bufferLength - this._readPointer;
    let dataLen = 0;
    let headBuffer = Buffer.alloc(HEAD_LEN);

    if (restDataLen < HEAD_LEN) {
      this._buffer.copy(headBuffer, 0, this._readPointer, this._bufferLength);
      let unReadHeadLen = HEAD_LEN - restDataLen;
      this._buffer.copy(headBuffer, restDataLen, 0, unReadHeadLen);
    } else {
      this._buffer.copy(headBuffer, 0, this._readPointer, this._readPointer + HEAD_LEN);
    }

    dataLen = headBuffer.readInt32BE(0);

    if (this._dataLen < dataLen) {
      console.log("body length < defined body length, waiting data...")
      callback && callback();
    } else {
      let pkgBuffer = Buffer.alloc(dataLen);
      if (this._bufferLength - this._readPointer < dataLen) {
        let firstPartLen = this._bufferLength - this._readPointer;
        this._buffer.copy(pkgBuffer, firstPartLen, this._readPointer, this._bufferLength);
        let secondPartLen = dataLen - firstPartLen;
        this._buffer.copy(pkgBuffer, firstPartLen, 0, secondPartLen);
        this._readPointer = secondPartLen;
      } else {
        this._buffer.copy(pkgBuffer, 0, this._readPointer, this._readPointer + dataLen);
        this._readPointer += dataLen;
      }
      
      this._dataLen -= dataLen;
      callback && callback(pkgBuffer);
    }
  }
}

module.exports = UserPkgBuffer;
