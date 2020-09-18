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
        self.tableList_.push(new RummyTable(i));
    }
}

// Allocate an optimized table for a new player
RummySvr.fetchOptTableId = function(gameId, level) {
	return 1 // todo, write "1" for trunk
}

RummySvr.destroyTable = function(params, callback) {

}

module.exports = {
    allocTable: RummySvr.allocTable,
    fetchOptTableId: RummySvr.fetchOptTableId,
}
