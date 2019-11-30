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

Message.isHasOfflineMessage = function(uid, callback) {
	Message.findOne({
		where: {
			destUid: uid,
			status: 0 // unread
		},
		limit: 1 // limit to one record
	}).then((someMessage) => {
		if (someMessage && someMessage.dataValues) {
			callback && callback(true);
		} else {
			callback &&callback(false);
		}
	})
}

Message.getMessageList = function(uid, callback) {
	Message.findAll({
		attributes: ['destUid', 'srcUid', [sequelize.fn('COUNT', sequelize.col('srcUid')), 'total']],
		where: {
			destUid: uid,
			status: 0, // unread
		},
		group: ['srcUid'],
	}).then((someMessageList) => {
		if (someMessageList) {
			let retMsgList = new Array();
			someMessageList.forEach((value, idx) => {
				retMsgList.push(value.dataValues);
			});
			callback && callback(retMsgList);
		} else {
			callback &&callback(null);
		}
	});
}

Message.getSomeFriendMessage = function(data, callback) {
	Message.findAll({
		where: {
			srcUid: data.friendUid,
			destUid: data.uid,
			status: 0, // unread
			msgId: {
				[Op.gt]: data.lastSvrMsgId
			},
		},
	}).then((someMessages) => {
		if (someMessages) {
			let retMessages = new Array();
			someMessages.forEach((value, idx) => {
				retMessages.push(value.dataValues);
			});
			callback && callback(retMessages);
		} else {
			callback &&callback(null);
		}
	});
}

Message.setMessageRead = function(data, callback) {
	// set all messages whose id is less than or equal to lastReadMsgId to status "already read"
	Message.update({ status: 1 }, {
		where: {
			srcUid: data.srcUid || 0,
			destUid: data.destUid || 0,
			msgId: {
				[Op.lte]: data.lastReadMsgId
			},
		}
	}).then(() => {
	});
}

module.exports = Message;
