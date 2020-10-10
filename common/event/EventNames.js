var EventNames = [];

var INDEX = 1;
function getIndex() {
  return (INDEX++).toString();
}

EventNames.RECIEVE_PKG = getIndex();
EventNames.RECIEVE_RUMMY_PKG = getIndex();
EventNames.RECIEVE_DIZHU_PKG = getIndex();
EventNames.PROCESS_OUT_PKG = getIndex();
EventNames.CLI_CHAT = getIndex();
EventNames.USER_LOGIN = getIndex();
EventNames.USER_ENTER_ROOM = getIndex();
EventNames.USER_EXIT_ROOM = getIndex();

module.exports = EventNames;
