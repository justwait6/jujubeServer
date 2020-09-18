let CommandDef = {
  CLI_HEART_BEAT: 0x0200, // 心跳
  CLI_HALL_LOGIN: 0x0202, // 登录大厅
	CLI_SEND_CHAT: 0x0300, // 发送聊天
  CLI_FORWARD_CHAT: 0x0302, // 转发聊天(占位, 未使用)
  CLI_GET_TABLE: 0x0400, // 获取桌子信息
  CLI_ENTER_ROOM: 0x0402, // 登录房间
  
  SVR_HEART_BEAT: 0x0201, // 心跳返回
  SVR_HALL_LOGIN: 0x0203, // 登录大厅返回
  SVR_PUSH: 0x0205, // 服务器自定义推送
  SVR_SEND_CHAT_RESP: 0x0301, // 发送聊天返回
  SVR_FORWARD_CHAT: 0x0303, // 转发聊天
  SVR_GET_TABLE: 0x0401, // 返回桌子信息
  SVR_ENTER_ROOM: 0x0403, // 返回登录房间信息
}

module.exports = CommandDef