let MySocket = {};

var EventEmitter = require("events");
var event = new EventEmitter();

var userSocketMgr = require("./UserSocketMgr");
var userBufMgr = require("./UserBufferMgr");
userBufMgr.initialize();
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
          if (parsedPkg.uid) {
            userSocketMgr.bind(parsedPkg.uid, socket);
          }

          if (parsedPkg.cmd == CmdDef.CLI_HEART_BEAT) {
            PkgBuilder.asyncBuild({cmd: CmdDef.SVR_HEART_BEAT, random: [{value: 123456}, {value: 123457}]}, (buf) => {
              buf && socket.write(buf);
            });
          } else if (parsedPkg.cmd == CmdDef.CLI_SEND_CHAT) {
            // user online, forward
            console.log('chat recieved');
            if (userSocketMgr.isUserConnected(parsedPkg.destUid)) {
              let toSendSocket = userSocketMgr.getUserSocket(parsedPkg.destUid);
              // modify package name
              PkgBuilder.modifyCommand(buf, CmdDef.SVR_FORWARD_CHAT);
              toSendSocket.write(buf);
              console.log('chat forwarded');
            } else {
              console.log("store offline message, to be continued")
            }
          }
          // event.emit(EVENT_NAMES.PKG_RECIEVE, parsedData);
        });
      }
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

module.exports = MySocket