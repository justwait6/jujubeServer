
/**
RULE:
Client始终发[偶数协议号], Server单播返回发[Client协议号 + 1]
单播协议[0x0XXX]格式, 广播协议[0x1XXX]格式
0x02XX, 单播, 大厅(房间外逻辑)
0x03XX, 单播, 房间, 功能逻辑(聊天, 表情, 打赏)
0x04XX, 单播, 房间, 玩法逻辑
  
0x04XX, 广播, 房间, 玩法逻辑 
*/
let CommandDef = {
  // Client
  CLI_HEART_BEAT: 0x0200, // 心跳
  CLI_HALL_LOGIN: 0x0202, // 登录大厅
	CLI_SEND_CHAT: 0x0300, // 发送聊天
  CLI_FORWARD_CHAT: 0x0302, // 转发聊天(占位, 未使用)
  CLI_GET_TABLE: 0x0400, // 获取桌子信息
  CLI_ENTER_ROOM: 0x0402, // 登录房间
  CLI_EXIT_ROOM: 0x0404, // 主动请求退出房间
  CLI_REQ_SIT: 0x0406, // 主动请求坐下
  CLI_REQ_SWITCH_TABLE: 0x0408, // 主动请求换桌
  CLI_REQ_STAND: 0x040A, // 主动请求站起
  
  // Server
  SVR_HEART_BEAT: 0x0201, // 心跳返回
  SVR_HALL_LOGIN: 0x0203, // 登录大厅返回
  SVR_PUSH: 0x0205, // 服务器自定义推送
  SVR_SEND_CHAT_RESP: 0x0301, // 发送聊天返回
  SVR_FORWARD_CHAT: 0x0303, // 转发聊天
  SVR_GET_TABLE: 0x0401, // 返回桌子信息
  SVR_ENTER_ROOM: 0x0403, // 返回登录房间信息
  SVR_EXIT_ROOM: 0x0405, // 返回退出房间信息
  SVR_CAST_EXIT_ROOM: 0x1405, // 广播用户退出
  SVR_REQ_SIT: 0x0407, // 返回请求坐下信息
  SVR_CAST_USER_SIT: 0x1407, // 广播用户坐下
  SVR_REQ_SWITCH_TABLE: 0x0409, // 请求换桌返回
  SVR_REQ_STAND: 0x040B, // 请求站起返回

  // Rummy Client Protocol Begin
  CLI_RUMMY_DRAW_CARD: 0x040C, // Rummy请求摸牌
  CLI_RUMMY_DISCARD_CARD: 0x040E, // Rummy请求出牌
  CLI_RUMMY_FINISH: 0x0410, // Rummy请求Finish
  CLI_RUMMY_DECLARE: 0x0412, // Rummy请求Declare
  CLI_RUMMY_DROP: 0x0414, // Rummy请求弃整副牌
  CLI_RUMMY_UPLOAD_GROUPS: 0x0416, // Rummy请求上报牌
  CLI_RUMMY_GET_DROP_CARDS: 0x0418, // Rummy获取drop牌列表
  CLI_RUMMY_USER_BACK: 0x041A, // Rummy玩家通报"I am back" 
  // Rummy Client Protocol End
  
  // Rummy Server Protocol Begin
  SVR_RUMMY_COUNTDOWN: 0x14A1, // 广播游戏开始倒计时
  SVR_RUMMY_GAME_START: 0x14A2, // 广播游戏开始
  SVR_RUMMY_USER_TURN: 0x14A3, // 广播轮到玩家
  SVR_CAST_RUMMY_RESUFFLE: 0x14A4, // 广播重新洗牌
  SVR_RUMMY_BONUS_TIME: 0x14A5, // 广播玩家bonus time
  SVR_RUMMY_USER_MISS_TURNS: 0x14A6, // 广播玩家超时次数
  SVR_RUMMY_GAME_END_SCORE: 0x14A7, // 广播游戏结算(会多次广播)
  SVR_RUMMY_DEAL_CARDS: 0x0434, // 游戏发牌
  SVR_RUMMY_DRAW_CARD: 0x040D, // 请求摸牌返回
  SVR_CAST_RUMMY_DRAW_CARD: 0x140D, // 广播玩家摸牌
  SVR_RUMMY_DISCARD_CARD: 0x040F, // 请求出牌返回
  SVR_CAST_RUMMY_DISCARD: 0x140F, // 广播玩家出牌
  SVR_RUMMY_FINISH: 0x0411, // 请求Finish返回
  SVR_CAST_RUMMY_FINISH: 0x1411, // 广播玩家Finish
  SVR_RUMMY_DECLARE: 0x0413, // 请求Declare返回
  SVR_CAST_RUMMY_DECLARE: 0x1413, // Rummy广播玩家Declare
  SVR_RUMMY_DROP: 0x0415, // 请求弃整副牌返回
  SVR_CAST_RUMMY_DROP: 0x1415, // 广播玩家弃整副牌
  SVR_RUMMY_UPLOAD_GROUPS: 0x0417, // 请求上报牌返回
  SVR_RUMMY_GET_DROP_CARDS: 0x0419, // 获取drop牌列表返回
  SVR_RUMMY_USER_BACK: 0x041B, // 通报"I am back"返回
  // Rummy Server Protocol End


  // Dizhu Client Protocol Begin
  CLI_DIZHU_READY: 0x040C, // Dizhu请求准备
  CLI_DIZHU_GRAB: 0x040E, // Dizhu请求Grab
  // Dizhu Client Protocol End
  
  // Dizhu Server Protocol Begin
  SVR_DIZHU_GAME_START: 0x14A1, // Dizhu广播游戏开始
  SVR_DIZHU_GRAB_TURN: 0x14A2, // Dizhu广播轮到抢庄
  SVR_DIZHU_GRAB_RESULT: 0x14A3, // Dizhu广播抢庄结果
  SVR_DIZHU_TURN: 0x14A4, // Dizhu广播轮到玩家
  SVR_DIZHU_READY: 0x040D, // Dizhu返回用户准备
  SVR_CAST_DIZHU_READY: 0x140D, // Dizhu广播用户准备
  SVR_DIZHU_GRAB: 0x040F, // Dizhu返回请求Grab
  SVR_CAST_DIZHU_GRAB: 0x140F, // Dizhu广播Grab
  // Dizhu Server Protocol End
}

module.exports = CommandDef