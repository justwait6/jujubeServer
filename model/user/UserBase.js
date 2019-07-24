var myConf = require('../../config/MyConf');
let dbTool = require(myConf.requires.dbTool);

const Sequelize = dbTool.Sequelize;
const sequelize = dbTool.sequelize;
const Op = Sequelize.Op;

const userBaseAttrs = ['uid', 'gender', 'money', 'exp', 'vip', 'nickname', 'iconUrl'];
const UserBase = sequelize.define('userBase', {
  // attributes
  uid: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
  },
  gender: {
    type: Sequelize.STRING(1),
    allowNull: false,
  },
  money: {
    type: Sequelize.INTEGER.UNSIGNED,
  },
  exp: {
    type: Sequelize.INTEGER.UNSIGNED,
  },
  vip: {
    type: Sequelize.INTEGER, // int类型,长度为1,TINYINT(4)
  },
  nickname: {
    type: Sequelize.STRING(18),
  },
  iconUrl: {
    type: Sequelize.STRING(100),
  },
}, {
  // options
  timestamps: false,
  freezeTableName: true,
  tableName: 'userBase',
});

UserBase.createNew = function(data, callback) {
  UserBase.create({
    uid: data.uid,
    gender: data.gender || 0,
    money: data.money || 0,
    exp: data.exp || 0,
    vip: data.vip || 0,
    nickname: data.nickname || "anonymous",
    iconUrl: data.iconUrl || "",
  }).then((userBase) => {
    let userBaseInfo = userBase ? userBase.dataValues : null;
    callback && callback(userBaseInfo);
  });
}

UserBase.getInfo = function(data, callback) {
  let toFetchAttrs = [];
  data.fields.forEach((value, index) => {
    if (userBaseAttrs.indexOf(value) != -1) {
      toFetchAttrs.push(value);
    }
  });
  // try fetch info data
  UserBase.findOne({
    where: {uid: data.uid},
    attributes: toFetchAttrs,
  }).then((somUserBase) => {
    let userBaseInfo = somUserBase ? somUserBase.dataValues : null;
    // if exist, return
    if (userBaseInfo) {
      callback && callback(userBaseInfo);
    } else {
      // if not exist, create new(with default)
      UserBase.createNew({uid: data.uid}, (userBaseInfo) => {
        callback && callback(userBaseInfo);
      });
    }
  });
}

UserBase.getFullInfo = function(uid, callback) {
  let data = {};
  data.uid = uid;
  data.fields = userBaseAttrs;
  UserBase.getInfo(data, callback);
}

UserBase.modifyBaseInfo = function(data, callback) {
  let updateAttrs = {};
  Object.keys(data.fields).forEach((key) => {
    if (userBaseAttrs.indexOf(key) != -1) {
      updateAttrs[key] = data.fields[key];
    }
  });

  UserBase.update(updateAttrs, {
    where: {
      uid: data.uid
    }
  }).then(() => {
    callback && callback(true);
  });
}


/**
 * @func batchGetUserinfo
 * @param data: a js object
 * @param data.uidList: a js array, user id list.
 * @param data.fields: a js array, attributes names to fetch.
 */
UserBase.batchGetUserinfo = function(data, callback) {
  let uidList = data.uidList || [];
  let fields = data.fields;
  
  // WARNNING: if length of uidList <= 0, MUST return in time.
  // otherwise, ALL user info in database will be returned !!!
  if (uidList.length <= 0) { callback && callback (null); return; }

  UserBase.findAll({
    where: {
      uid: {
        [Op.or]: uidList
      }
    },
    attributes: fields,
  }).then((batchUserinfo) => {
    if (!batchUserinfo) { callback && callback (null); return }

    let resultUserinfos = [];
    batchUserinfo.forEach(element => {
      if (element && element.dataValues) { resultUserinfos.push(element.dataValues); }
    });
    callback && callback(resultUserinfos);
  });
}

module.exports = UserBase;
