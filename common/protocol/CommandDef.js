let CommandDef = {
  CLI_HEART_BEAT: 0x0200, // 心跳
  CLI_HALL_LOGIN: 0x0202,    // 登录大厅
  CLI_COMMON_BROADCAST: 0x2200, // 客户端广播给其他客户端
  
  SVR_HEART_BEAT: 0x0201, // 心跳返回
  SVR_HALL_LOGIN: 0x0203,    // 登录大厅返回
  SVR_PUSH: 0x0205    // 服务器自定义推送
}

module.exports = CommandDef