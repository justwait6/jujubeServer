let RummySvr = {};
var self = RummySvr;

var myConf = require('../../config/MyConf');
var RummyTable = require(myConf.paths.model + '/rummy/RummyTable');

const RummyConst = require(myConf.paths.model + '/rummy/RummyConst');

RummySvr.init = function() {
    self.tableList_ = new Array();
    self.preAllocTable()
}

RummySvr.preAllocTable = function() {
	for (i = 0; i < RummyConst.MAX_PRE_ALLOC_TABLE; i++) {
        self.tableList_.push(new RummyTable.Table(i + 1));
    }
}

// Allocate an optimized table for a new player
RummySvr.fetchOptTableId = function(gameId, level) {
	return 1 // todo, write "1" for trunk
}

RummySvr.getTable = function(tableId) {
    let toFindTable = null;
    self.tableList_.forEach(table => {
        if (table.getTid() == tableId) {
            toFindTable = table;
        }
    });
    return toFindTable;
}

RummySvr.destroyTable = function(params, callback) {

}

module.exports = {
    init: RummySvr.init,
    fetchOptTableId: RummySvr.fetchOptTableId,
    getTable: RummySvr.getTable,
}
