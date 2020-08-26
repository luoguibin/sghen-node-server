const timeUtil = require('../utils/time')

module.exports = {
  ACTION: {
    MOVING: -1000,
    IDEL: -1001,
    ENTER_MAP: -1002,
    LEAVE_MAP: -1003
  },
  SKILL: {
    START: -2000,
    HIT: -2001
  },
  PLAYER: {
    LOGIN: -3000,
    LOGOUT: -3001,
    ALL: -3002,
    HEART: -3003
  },
  SYSTEM: {
    GOD: -4000,
    OBSTACLE: -4001
  },
  newOrder: function (id, fromId, toId, data) {
    return {
      id,
      fromId,
      toId,
      time: timeUtil.now(),
      data
    }
  }
}
