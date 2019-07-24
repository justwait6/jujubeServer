const User = require("./User");
var myConf = require("../../config/MyConf");
let UserSocketMgr = require(myConf.paths.common + '/socket/UserSocketMgr');

let ERR_CODE = {
  USER_FORMAT: -100,
  USER_EXISTS: -101,
  EMAIL_FORMAT: -200,
  PWD_FORMAT: -300,
  PARAM_TYPE: -400,
  PARAM_EMPTY: -401,
  USER_PWD_NOT_MATCH: -500,
}

let UserGuard = {
  _isNameFormatValid: function(name) {
    if (typeof(name) != 'string') {
      self.setInvalidCode(ERR_CODE.PARAM_TYPE);
      self.setInvalidMessage("name type should be string!");
      return false;
    }

    if (name.length == 0) {
      self.setInvalidCode(ERR_CODE.PARAM_EMPTY);
      self.setInvalidMessage("name should not be empty!");
      return false;
    }

    // digits or alphabets are permitted, length range from 3 to 16.
    let isNameValid = /^[a-zA-Z0-9_]{3,16}$/.test(name);
    if (!isNameValid) {
      self.setInvalidCode(ERR_CODE.USER_FORMAT);
      self.setInvalidMessage("name format invalid!");
    }
    return isNameValid;
  },

  _isNameExist: function(name, callback) {
    User.isNameExist(name, function(isNameExist) {
      callback && callback(isNameExist);
    });
  },

  _isEmailValid: function(email) {
    if (typeof(email) != 'string') {
      self.setInvalidCode(ERR_CODE.PARAM_TYPE);
      self.setInvalidMessage("email type should be string!");
      return false;
    }

    if (email.length == 0) {
      self.setInvalidCode(ERR_CODE.PARAM_EMPTY);
      self.setInvalidMessage("email should not be empty!");
      return false;
    }

    let isFormatValid = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email);;
    if (!isFormatValid) {
      self.setInvalidCode(ERR_CODE.EMAIL_FORMAT);
      self.setInvalidMessage("email format invalid!");
    }
    return isFormatValid;
  },

  _isPasswordValid: function(password) {
    if (typeof(password) != 'string') {
      self.setInvalidCode(ERR_CODE.PARAM_TYPE);
      self.setInvalidMessage("password type should be string!");
      return false;
    }

    if (password.length == 0) {
      self.setInvalidCode(ERR_CODE.PARAM_EMPTY);
      self.setInvalidMessage("password should not be empty!");
      return false;
    }

    let isFormatValid = /^[0-9A-Za-z]{6,16}$/.test(password);
    if (!isFormatValid) {
      self.setInvalidCode(ERR_CODE.PWD_FORMAT);
      self.setInvalidMessage("password format invalid!");
    }
    return isFormatValid;
  },

  _getUserInfoByToken: function(token, callback) {
    self.verifyToken(token, (isOk, uid) => {
      if (isOk) {
        self._getFullUserInfo(uid, callback);
      } else {
        callback && callback(null)
      }
    });
  },

  _getFullUserInfo: function(uid, callback) {
    User.getFullUserInfo(uid, callback);
  }
};

var self = UserGuard;

/**
 * @function isRegisterValid check if register parameters valid
 * @param {*} registerInfo 
 */
UserGuard.isRegisterValid = function(registerInfo, callback) {
  if (!self._isNameFormatValid(registerInfo.name)) {
    return callback && callback(false);
  }

  // async check if name already exists in database
  self._isNameExist(registerInfo.name, (isNameExist) => {
    if (isNameExist) {
      self.setInvalidCode(ERR_CODE.USER_EXISTS);
      self.setInvalidMessage("name already exist!");
      return callback && callback(false);
    }

    if (!self._isEmailValid(registerInfo.email)) {
      return callback && callback(false);
    }
  
    if (!self._isPasswordValid(registerInfo.password)) {
      return callback && callback(false);
    }
  
    self.setInvalidCode(0);
    self.setInvalidMessage("");
    return callback && callback(true);
  });
}

UserGuard.checkNameExist = function(name, callback) {
  return self._isNameExist(name, callback);
}

UserGuard.createNew = function(registerInfo, callback) {
  return User.createNew(registerInfo, callback);
}

UserGuard.isLoginValid = function(loginInfo, callback) {
  if (!self._isNameFormatValid(loginInfo.name)) {
    return callback && callback(false);
  }
  
  if (!self._isPasswordValid(loginInfo.password)) {
    return callback && callback(false);
  }
  
  // async check user
  User.canLogin(loginInfo.name, loginInfo.password, (isValid, token) => {
    if (isValid) {
      self.setInvalidCode(0);
      self.setInvalidMessage("");
      return callback && callback(true, token);
    } else {
      self.setInvalidCode(ERR_CODE.USER_PWD_NOT_MATCH);
      self.setInvalidMessage("name and password not match");
      return callback && callback(false);
    }
  });
}

UserGuard.getToken = function(data, callback) {
  User.getToken(data, callback);
}

UserGuard.verifyToken = function(token, callback) {
  User.verifyToken(token, callback);
}

UserGuard.getUserInfoByName = function(queryData, callback) {
  User.getUserBaseInfoByName(queryData, callback);
}

UserGuard.getUserInfoByUid = function(queryData, callback) {
  User.getUserBaseInfoByUid(queryData, callback);
}

UserGuard.fetchLoginParams = function(token, callback) {
  self._getUserInfoByToken(token, (userInfo) => {
    callback && callback({user: userInfo});
  });
}

UserGuard.modifyUserBaseInfo = function(data, callback) {
  User.modifyUserBaseInfo(data, callback);
}

UserGuard.batchGetUserinfo = function(data, callback) {
  User.batchGetUserinfo(data, callback);
}

UserGuard.isUserOnline = function(uid) {
  return UserSocketMgr.isUserConnected(uid);
}

UserGuard.setInvalidCode = function(code) {
  self.invalidCode = code;
}

UserGuard.getInvalidCode = function(name) {
  return self.invalidCode;
}

UserGuard.setInvalidMessage = function(errorMessage) {
  self.invalidMessage = errorMessage;
}

UserGuard.getInvalidMessage = function(name) {
  return self.invalidMessage;
}

module.exports = {
  isRegisterValid: UserGuard.isRegisterValid,
  getInvalidCode: UserGuard.getInvalidCode,
  getInvalidMessage: UserGuard.getInvalidMessage,
  checkNameExist: UserGuard.checkNameExist,
  createNew: UserGuard.createNew,
  isLoginValid: UserGuard.isLoginValid,
  login: UserGuard.login,
  getToken: UserGuard.getToken,
  verifyToken: UserGuard.verifyToken,
  getUserInfoByName: UserGuard.getUserInfoByName,
  getUserInfoByUid: UserGuard.getUserInfoByUid,  
  fetchLoginParams: UserGuard.fetchLoginParams,
  modifyUserBaseInfo: UserGuard.modifyUserBaseInfo,
  batchGetUserinfo: UserGuard.batchGetUserinfo,
  isUserOnline: UserGuard.isUserOnline,
}
