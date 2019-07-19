let MySocket = {};

var EventEmitter = require("events");
var event = new EventEmitter();

var uidSocketMgr = require("./UidSocketMgr");
var userBufMgr = require("./UserBufferMgr").getInstance();
const PkgReader = require("./MyPkgReader");
const PkgBuilder = require("./MyPkgBuilder");
const EVENT_NAMES = require("../event/EventNames");
const CmdDef = require("../protocol/CommandDef");

const net = require('net');
const server = net.createServer();
server.on("connection", (socket) => {
  socket.on("data", function(buf) {
    let userBuffer = userBufMgr.getIdleBuffer();
    userBuffer.writeBuffer(buf);
    userBuffer.checkIsFullPkg((pkg) => {
      if (pkg) {
        // release resources
        userBufMgr.releaseBuffer(userBuffer);

        PkgReader.asyncParse(pkg, (parsedPkg) => {
          console.log(parsedPkg);
          if (parsedPkg.uid) {
            uidSocketMgr.updateSocket(parsedPkg.uid, socket);
          }

          if (parsedPkg.cmd == CmdDef.CLISVR_HEART_BEAT) {
            PkgBuilder.asyncBuild({cmd: CmdDef.CLISVR_HEART_BEAT, random: [{value: 123456}, {value: 123457}]}, (buf) => {
              if (buf) {
                socket.write(buf)
              }
              // console.log('build binary packet', buf)
            });
          }
          // event.emit(EVENT_NAMES.PKG_RECIEVE, parsedData);
        });
      }
      // console.log(pkg);
    });
    
  });

  socket.on('close', function() {
    console.log('client close')
  });

  socket.on('error', function(err) {

  });
});

server.listen(9001, () => {
  console.log('server is on ', JSON.stringify(server.address()));

  /*
  const uid = 3
  let sendObj = {
    random: [{value: 123}]
  }
  PkgBuilder.asyncBuild(0x0200, sendObj, (packBuf) => {
    console.log('packBuf', packBuf);
    PkgReader.asyncParse(packBuf, (data) => {
      console.log('__ ', data);
    })
  });
  let socket = uidSocketMgr.getUserSocket(uid);
  if (socket) {
    socket.write(pack);
  }
  */
});


MySocket.initilize = function() {

}

module.exports = MySocket