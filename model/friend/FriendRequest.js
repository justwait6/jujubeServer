var myConf = require('../../config/MyConf');
let dbTool = require(myConf.requires.dbTool);

const Sequelize = dbTool.Sequelize;
const sequelize = dbTool.sequelize;

const FriendRequest = sequelize.define('FriendRequest', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
  },
  srcUid: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  },
  destUid: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  },
  timestamp: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  },
}, {
  // options
  timestamps: false,
  freezeTableName: true,
  tableName: 'friendRequest',
});

FriendRequest.addRecord = function(params, callback) {
  FriendRequest.create({
    srcUid: params.srcUid,
    destUid: params.destUid,
    timestamp: Date.parse(new Date()) / 1000,
  }).then((someRecord) => {
    let isSucc = someRecord ? true : false;
    callback && callback(isSucc);
  });
}

FriendRequest.removeRecord = function(params, callback) {
  FriendRequest.destroy({
    where: {srcUid: params.srcUid, destUid: params.destUid},
  }).then((isOk) => {
    callback && callback(isOk);
  });
}

FriendRequest.findRecord = function(params, callback) {
  FriendRequest.findOne({
    where: {srcUid: params.srcUid, destUid: params.destUid},
    attributes: ['id', 'srcUid', 'destUid', 'timestamp'],
  }).then((someRecord) => {
    if (someRecord) {
      callback && callback(someRecord.dataValues);
    } else {
      callback && callback(null);
    }
  });
}

// If Record exists, update; if not exists, insert
FriendRequest.upsertRecord = function(params, callback) {
  // find if a record exists
  FriendRequest.findRecord({srcUid: params.srcUid, destUid: params.destUid}, (someRecord) => {
    if (someRecord) {
      // if already exists, update
      FriendRequest.update({ timestamp: Date.parse(new Date()) / 1000 }, {
        where: {
          srcUid: params.srcUid,
          destUid: params.destUid
        }
      }).then((someRecord) => {
        let isSucc = someRecord ? true : false;
        callback && callback(isSucc);
      });
    } else {
      // if not exists, add new
      FriendRequest.addRecord({srcUid: params.srcUid, destUid: params.destUid}, (isSucc) => {
        callback && callback(isSucc);
      })
    }
  });
};

FriendRequest.getReqAddList = function(uid, callback) {
  FriendRequest.findAll({
    where: {
      destUid: uid
    },
    attributes: ['srcUid', 'timestamp']
  }).then((queryResultList) => {
    if (!queryResultList) { callback && callback(null); return; }

    let reqAddList = [];
    queryResultList.forEach(element => {
      if (element && element.dataValues) { reqAddList.push(element.dataValues); }
    });
    callback && callback(reqAddList);
  });
}

FriendRequest.isHasRequest = function(uid, callback) {
	FriendRequest.findOne({
    where: {destUid: uid},
    attributes: ['id', 'srcUid', 'destUid', 'timestamp'],
  }).then((someRecord) => {
    if (someRecord) {
      callback && callback(someRecord.dataValues);
    } else {
      callback && callback(null);
    }
  });
}

module.exports = FriendRequest;
