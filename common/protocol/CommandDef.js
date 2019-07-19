let CommandDef = {
  CLISVR_HEART_BEAT: 0x0200, // 心跳
  CLI_COMMON_BROADCAST: 0x2200, // 客户端广播给其他客户端
  CLI_HALL_LOGIN: 0x0201    // 登录大厅
}

module.exports = CommandDef