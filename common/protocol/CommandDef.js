let CommandDef = {
  CLI_HEART_BEAT: 0x0200, // 心跳
  CLI_HALL_LOGIN: 0x0202, // 登录大厅
  CLI_SEND_CHAT: 0x0300, // 发送聊天
  
  SVR_HEART_BEAT: 0x0201, // 心跳返回
  SVR_HALL_LOGIN: 0x0203, // 登录大厅返回
  SVR_PUSH: 0x0205, // 服务器自定义推送
  SVR_FORWARD_CHAT: 0x0301, // 转发聊天
}

module.exports = CommandDef