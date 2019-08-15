var myConf = require('../../config/MyConf');
let dbTool = require(myConf.requires.dbTool);

const Sequelize = dbTool.Sequelize;
const sequelize = dbTool.sequelize;

const Friend = sequelize.define('Friend', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
  },
  uid1: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  },
  uid2: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
	},
	// remark1 is the remark of uid1, which is named by user whose uid is uid2
  remark1: {
    type: Sequelize.STRING(30),
    allowNull: true,
	},
	// remark2 is the remark of uid2, which is named by user whose uid is uid1
  remark2: {
    type: Sequelize.STRING(30),
    allowNull: true,
  },
  timestamp: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  },
}, {
  // options
  timestamps: false,
  freezeTableName: true,
  tableName: 'friend',
});

/**
 * @func addFriendPair function
 * @precondition uid1/uid2 not null, uid1 ~= uid2
 * @param data.XXX: attributes names XXX to fetch.
 */
Friend.addFriendPair = function(uid1, uid2, callback) {
  if (uid1 && uid2) {
    // ensure constraint: uid1 < uid2
    if (uid2 < uid1) {
      // swap
      let tmp = uid2;
      uid2 = uid1;
      uid1 = tmp;
    }

    // check if pair already exist.
    Friend.isFriend(uid1, uid2, (isFriend) => {
      if (isFriend) {
        // if already friend relationship, return add friend success.
        callback && callback(true);
      } else {
        // if not friend relationship, create one.
        Friend.create({
          uid1: uid1,
          uid2: uid2,
          timestamp: Date.parse(new Date()) / 1000,
        }).then((someRecord) => {
          let isSucc = someRecord ? true : false;
          callback && callback(isSucc);
        });
      }
    });
  }
}

Friend.isFriend = function(uid1, uid2, callback) {
  if (uid1 && uid2) {
    // ensure constraint: uid1 < uid2
    if (uid2 < uid1) {
      // swap
      let tmp = uid2;
      uid2 = uid1;
      uid1 = tmp;
    }

    Friend.findOne({
      where: {uid1: uid1, uid2: uid2},
      attributes: ['id', 'uid1', 'uid2'],
    }).then((somePair) => {
      let isFriend = somePair ? true : false;
      callback && callback(isFriend);
    });
  }
}

Friend.getFriendList = function(uid, callback) {
  // look for uid1 field first
  Friend.findAll({
    where: {
      uid1: uid
    },
    attributes: [['uid2', 'uid'], ['remark2', 'remark']]
  }).then((halfLists) => {
    halfLists = halfLists || [];
    
    // look for uid2 field second
    Friend.findAll({
      where: {
        uid2: uid
      },
      attributes: [['uid1', 'uid'], ['remark1', 'remark']]
    }).then((otherHalfLists) => {
      otherHalfLists = otherHalfLists || [];

      let resultLists = [];
      halfLists.forEach(element => {
        if (element && element.dataValues) { resultLists.push(element.dataValues) }
      });
      otherHalfLists.forEach(element => {
        if (element && element.dataValues) { resultLists.push(element.dataValues) }
      });

      callback && callback(resultLists);
    })
  });
}

/**
 * @func batchModifyFriendRemark function
 * @precondition data.pairList be type object.
 * @param data.uid: the uid of user who modify friends remarks.
 * @param data.pairList: a list of objects which has one key(friend uid) and one value(new remark)
 */
Friend.batchModifyFriendRemark = function(data, callback) {
	let pairList = data.pairList || {};
	let pairArray = []
	Object.keys(pairList).forEach((key) => {
		pairArray.push({uid: Number(data.uid), friendUid: Number(key), remark: pairList[key]});
	});
	
	sequelize.transaction((t) => {
		let promises = [];
		pairArray.forEach((pair) => {
			promises.push(Friend._modifyFriendRemark(pair), {transaction: t});
		});
		return Promise.all(promises).then((vaules) => {
			// console.log("promiss values: ", vaules);
		})
	}).then((result) => {
		// commit success
		callback && callback(true);
	}).catch((err) => {
		console.log(err)
		callback && callback(false);
	});
}

/**
 * @func _modifyFriendRemark private function
 * @param data.uid: not null
 * @param data.friendUid: not null
 * @param data.remark: remark to be modified
 */
Friend._modifyFriendRemark = function(data, transactionOptions) {
	let uid = data.uid;
	let friendUid = data.friendUid;
	return new Promise((resolve, reject) => {
		if (uid > friendUid) {
			// update field remark1, for remark1 maps to uid1, remark1 is named by user whose uid = uid2
			Friend.update({ remark1: data.remark }, {
				where: {
					uid1: friendUid,
					uid2: uid,
				}
			}, transactionOptions).then((someRecord) => {
				resolve(someRecord ? true : false);
			});
		} else {
			// remark2 is named by user whose uid = uid1
			Friend.update({ remark2: data.remark }, {
				where: {
					uid1: uid,
					uid2: friendUid,
				}
			}, transactionOptions).then((someRecord) => {
				resolve(someRecord ? true : false);
			});
		}
	});
}

module.exports = Friend;
