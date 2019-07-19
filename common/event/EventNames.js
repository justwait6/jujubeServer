var EventNames = [];

var INDEX = 1;
function getIndex() {
  return INDEX++;
}

EventNames.PKG_RECIEVE = getIndex();

module.exports = EventNames;