let MySocket = {};
var self = MySocket;

var userSocketMgr = require("./UserSocketMgr");
var userBufMgr = require("./UserBufferMgr");
userBufMgr.initialize();
const PkgReader = require("./MyPkgReader");
const PkgBuilder = require("./MyPkgBuilder");
const CmdDef = require("../protocol/CommandDef");

const EVENT_NAMES = require("../event/EventNames");
const eventMgr = require("../event/EventMgr");

const net = require('net');
const server = net.createServer();
server.on("connection", (socket) => {
  socket.on("data", function(buf) {
    let userBuffer = userBufMgr.getIdleBuffer();
    userBuffer.writeBuffer(buf);
    userBuffer.checkIsFullPkg((pkg) => {
      if (!pkg) { return; }

      // release resources
      userBufMgr.releaseBuffer(userBuffer);
        
      PkgReader.asyncParse(pkg, (parsedPkg) => {
        console.log(parsedPkg)
        if (parsedPkg.uid) {
          userSocketMgr.bind(parsedPkg.uid, socket);
        }

        if (parsedPkg.cmd == CmdDef.CLI_HEART_BEAT) {
					self.onCliHeartBeat(parsedPkg.random, socket);
        } else if (parsedPkg.cmd == CmdDef.CLI_HALL_LOGIN) {
					eventMgr.emit(EVENT_NAMES.USER_LOGIN, parsedPkg.uid);
				} else if (parsedPkg.cmd == CmdDef.CLI_SEND_CHAT) {
          eventMgr.emit(EVENT_NAMES.CLI_CHAT, parsedPkg);
        }
        // event.emit(EVENT_NAMES.RECIEVE_PKG, parsedPkg);
      });
    });
  });

  socket.on('close', function() {
    // unbind user-socket pair
    userSocketMgr.unbindBySocket(socket);
  });

  socket.on('error', function(err) {

  });
});

server.listen(9001, () => {
});


MySocket.initilize = function() {

}

MySocket.onCliHeartBeat = function(randoms, socket) {
  randoms = randoms || [];
  let sentRandoms = new Array(randoms.length);
  for (let i = 0; i < randoms.length; i++) {
    sentRandoms[i] = {};
    sentRandoms[i].value = randoms[i].value + 1;
  }
  PkgBuilder.asyncBuild({cmd: CmdDef.SVR_HEART_BEAT, random: sentRandoms}, (buf) => {
    buf && socket.write(buf);
  });
}

module.exports = MySocket;
