let RummySvr = {};
var self = RummySvr;

var myConf = require('../../config/MyConf');
var RummyTable = require(myConf.paths.model + '/rummy/RummyTable');

const RummyConst = require(myConf.paths.model + '/rummy/RummyConst');

RummySvr.init = function() {
    self.tableList_ = new Array();
    self.preAllocTable();
    self.uidTidMap_ = {};
}

RummySvr.preAllocTable = function() {
	for (i = 0; i < RummyConst.MAX_PRE_ALLOC_TABLE; i++) {
        self.tableList_.push(new RummyTable.Table(i + 1));
    }
}

// Allocate an optimized table for a new player
RummySvr.fetchOptTableId = function(uid, gameId, level) {
    if (self.uidTidMap_[uid]) { // if already allocated
        return self.uidTidMap_[uid];
    } else {
        return 1 // todo, write "1" for trunk
    }
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

RummySvr.insertUidTid = function(uid, tid) {
    self.uidTidMap_[uid] = tid;
}

RummySvr.deleteUidTid = function(uid) {
    delete self.uidTidMap_[uid];
}

RummySvr.queryTableByUid = function(uid) {
    let tid = self.uidTidMap_[uid + ""];
    if (tid) {
        return self.getTable(tid);
    }
}

RummySvr.destroyTable = function(params, callback) {

}

module.exports = {
    init: RummySvr.init,
    fetchOptTableId: RummySvr.fetchOptTableId,
    getTable: RummySvr.getTable,
    insertUidTid: RummySvr.insertUidTid,
    deleteUidTid: RummySvr.deleteUidTid,
    queryTableByUid: RummySvr.queryTableByUid,
}
