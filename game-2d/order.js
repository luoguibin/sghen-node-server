const timeUtil = require('../utils/time')

module.exports = {
  /**
   * 心跳
   */
  HEART_BEAT: -66,

  /**
   * 玩家游戏数据
   */
  PLAYER_LOGIN: -1000,
  /**
   * 玩家退出
   */
  PLAYER_LOGOUT: -1001,

  /**
   * 进入地图
   */
  ENTER_MAP: -2000,
  /**
   * 地图玩家信息
   */
  MAP_PLAYER_DATAS: -2001,
  /**
   * 地图箱子
   */
  MAP_BOXES: -2002,
  /**
   * 运动
   */
  MOTION: -2101,
  /**
   * 炮塔运动
   */
  MOTION_BARREL: -2102,
  /**
   * 技能开始
   */
  SKILL_START: -2201,
  /**
   * 技能命中
   */
  SKILL_HIT: -2202,

  /**
   * 聊天
   */
  MSG: -3000,

  /**
   * 系统
   */
  SYS: -4000,

  /**
   * 创建指令
   */
  new: function (id, toId, data) {
    return {
      id,
      time: timeUtil.now(),
      toId,
      data
    }
  }
}
