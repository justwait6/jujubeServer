var myConf = require('../../config/MyConf');
let dbTool = require(myConf.requires.dbTool);

const Sequelize = dbTool.Sequelize;
const sequelize = dbTool.sequelize;
const Op = Sequelize.Op;

const MSG_UNREAD = 0;
const MSG_READ = 1;

const MessageType = require("./MessageType");

const Message = sequelize.define('message', {
  msgId: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: Sequelize.TINYINT,
    allowNull: false,
  },
  status: {
    type: Sequelize.BOOLEAN, // false(or zero), unread; true(or one), read;
    allowNull: false,
  },
  srcUid: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  },
  destUid: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  },
  sentTime: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  },
  msg: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
}, {
  // options
  timestamps: false,
  freezeTableName: true,
  tableName: 'message',
});

/**
 * @function store
 * @returns msgId: the unique id of a message
 */
Message.store = function(msgObj, callback) {
  Message.create({
    type: msgObj.type || MessageType.TEXT,
    status: MSG_UNREAD,
    srcUid: msgObj.srcUid,
    destUid: msgObj.destUid,
    sentTime: msgObj.sentTime,
    msg: msgObj.msg,
  }).then((someMessage) => {
    console.log(someMessage);
    let isSucc = someMessage ? true : false;
    let msgId = null;
    if (isSucc) {
      msgId = someMessage.dataValues.msgId;
    }
    callback && callback(isSucc, msgId);
  });
}

Message.markRead = function(msgId, callback) {
  Message.update({ status: MSG_READ }, {
    where: {
      msgId: msgId,
    }
  }).then(() => {
  });
}

Message.fetchUnreadMessage = function(destUid, lastMsgId, callback) {
  Message.findAll({
    where: {
      msgId: {
        [Op.gt]: lastMsgId
      },
      destUid: destUid,
      status: MSG_UNREAD,
    }
  }).then(msgs => {
    if (!msgs) { callback && callback(null); }

    let resultMsgs = [];
    msgs.forEach(element => {
      if (element && element.dataValues) { resultMsgs.push(element.dataValues); }
    });
    callback && callback(resultMsgs);
  });
}

module.exports = Message;
