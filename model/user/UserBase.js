var myConf = require('../../config/MyConf');
let dbTool = require(myConf.requires.dbTool);

const Sequelize = dbTool.Sequelize;
const sequelize = dbTool.sequelize;

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
  console.log('toFetchAttrs', toFetchAttrs);
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
    console.log(key,data.fields[key]);
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

module.exports = UserBase;
