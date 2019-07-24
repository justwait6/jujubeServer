let SecurityCenter = require("../security/SecurityCenter");

var myConf = require('../../config/MyConf');
let dbTool = require(myConf.requires.dbTool);

const Sequelize = dbTool.Sequelize;
const sequelize = dbTool.sequelize;

const User = sequelize.define('user', {
  // attributes
  uid: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
  },
  uname: {
    type: Sequelize.STRING(20),
    unique: true,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING(60),
    allowNull: false
  },
  email: {
    type: Sequelize.STRING(30),
    allowNull: false,
  },
}, {
  // options
  timestamps: false,
  freezeTableName: true,
  tableName: 'user',
});

const UserBase = require('./UserBase');

// Query
/*
User.findAll().then(users => {
});

User.findOne({
  where: {uname: toFindName},
  attributes: ['uid', ['uname', 'uname']],
}).then((someUser) => {
});
*/

// Insert
/*
User.create().then(newUser => {
});
*/

// Delete
/*
User.destroy({
  where: {
    uname: "Jane"
  }
}).then(() => {
});
*/

// Update
/*
User.update({ uname: "Doe" }, {
  where: {
    uname: "Jane"
  }
}).then(() => {
});
*/

User.isNameExist = function(toFindName, callback) {
  // Find a user by name
  User.findOne({
    where: {uname: toFindName},
    attributes: ['uid', ['uname', 'uname']],
  }).then((someUser) => {
    let isRegistered = someUser ? true : false;
    callback && callback(isRegistered);
  });
}

User.getUidByName = function(toFindName, callback) {
  // Find a user uid by name
  User.findOne({
    where: {uname: toFindName},
    attributes: ['uid'],
  }).then((someUser) => {
    let uid = someUser ? someUser.uid : null;
    callback && callback(uid);
  });
}

User.createNew = function(registerInfo, callback) {
  try {
    SecurityCenter.getPasswordHash(registerInfo.password, (hash) => {
      // Store hash in your password DB.
      User.create({
        uname: registerInfo.name,
        password: hash,
        email: registerInfo.email,
      }).then((user) => {
        let userInfo = user ? user.dataValues : null;
        callback && callback(userInfo);
      });
    });
  } catch (error) {
  }
};

User.canLogin = function(testName, testPassword, callback) {
  try {
    User.findOne({
      where: {uname: testName},
      attributes: ['uid', 'uname', 'password'],
    }).then((someUser) => {
      if (someUser && someUser.dataValues && someUser.dataValues.password) {
        SecurityCenter.passwordCompare(testPassword, someUser.dataValues.password, (isEqual) => {
          if (isEqual) {
            User.getToken(someUser.dataValues.uid, (someToken) => {
              callback && callback(true, someToken);
            });
          } else {
            callback && callback(false);
          }
        });
      } else {
        callback && callback(false);
      }
    });
  } catch (error) {
  }
}

User.getToken = function(data, callback) {
  let token = SecurityCenter.generateToken(data);
  callback && callback(token);
}

User.verifyToken = function(token, callback) {
  SecurityCenter.verifyToken(token, (isOk, result) => {
    let uid = isOk ? result.data : null;
    callback && callback(isOk, uid);
  });
}

/**
 * @func getUserBaseInfoByName
 * @param data: a js object
 * @param data.name: user name to be found.
 * @param data.XXX: attributes names XXX to fetch.
 */
User.getUserBaseInfoByName = function(data, callback) {
  User.getUidByName(data.name, (uid) => {
    if (uid) {
      data.uid = uid
      User.getUserBaseInfoByUid(data, callback);
    } else {
      callback && callback(null);
    }
  });
}

/**
 * @func getUserBaseInfoByUid
 * @param data: a js object
 * @param data.uid: user id to be found.
 * @param data.XXX: attributes names XXX to fetch.
 */
User.getUserBaseInfoByUid = function(data, callback) {
  UserBase.getInfo(data, callback);
}

User.batchGetUserinfo = function(data, callback) {
  UserBase.batchGetUserinfo(data, callback);
}

User.getFullUserInfo = function(uid, callback) {
  UserBase.getFullInfo(uid, callback);
}


User.modifyUserBaseInfo = function(data, callback) {
  UserBase.modifyBaseInfo(data, callback);
}

module.exports = User;
