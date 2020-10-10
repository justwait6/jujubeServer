let DizhuSvr = {};
var self = DizhuSvr;

var myConf = require('../../config/MyConf');
var RoomTable = require(myConf.paths.model + '/dizhu/RoomTable');

const RoomConst = require(myConf.paths.model + '/dizhu/RoomConst');

DizhuSvr.init = function() {
    self.tableList_ = new Array();
    self.preAllocTable();
    self.uidTidMap_ = {};
}

DizhuSvr.preAllocTable = function() {
	for (i = 0; i < RoomConst.MAX_PRE_ALLOC_TABLE; i++) {
        self.tableList_.push(new RoomTable.Table(i + 1));
    }
}

// Allocate an optimized table for a new player
DizhuSvr.fetchOptTableId = function(uid, gameId, level) {
    if (self.uidTidMap_[uid]) { // if already allocated
        return self.uidTidMap_[uid];
    } else {
        return 1 // todo, write "1" for trunk
    }
}

DizhuSvr.getTable = function(tableId) {
    let toFindTable = null;
    self.tableList_.forEach(table => {
        if (table.getTid() == tableId) {
            toFindTable = table;
        }
    });
    return toFindTable;
}

DizhuSvr.insertUidTid = function(uid, tid) {
    self.uidTidMap_[uid] = tid;
}

DizhuSvr.deleteUidTid = function(uid) {
    delete self.uidTidMap_[uid];
}

DizhuSvr.queryTableByUid = function(uid) {
    let tid = self.uidTidMap_[uid + ""];
    if (tid) {
        return self.getTable(tid);
    }
    return null;
}

DizhuSvr.destroyTable = function(params, callback) {

}

module.exports = {
    init: DizhuSvr.init,
    fetchOptTableId: DizhuSvr.fetchOptTableId,
    getTable: DizhuSvr.getTable,
    insertUidTid: DizhuSvr.insertUidTid,
    deleteUidTid: DizhuSvr.deleteUidTid,
    queryTableByUid: DizhuSvr.queryTableByUid,
}
