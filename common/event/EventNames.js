var EventNames = [];

var INDEX = 1;
function getIndex() {
  return (INDEX++).toString();
}

EventNames.RECIEVE_PKG = getIndex();
EventNames.SEND_PKG = getIndex();
EventNames.CLI_CHAT = getIndex();

module.exports = EventNames;