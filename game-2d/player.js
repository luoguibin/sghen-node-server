const timeUtil = require('../utils/time')

class Player {
  constructor (id, name, ws) {
    // websocket
    this.id = id
    this.userName = name
    this.ws = ws

    this.heartTime = 0
    this.score = 0
    this.sceneId = -1

    this.setHeartTime()
  }

  /**
   * 场景id
   * @param {Number} id
   */
  setSceneId (id) {
    this.sceneId = id
  }

  /**
   * 更新心跳时间
   * @param {Number} time
   */
  setHeartTime (time) {
    this.heartTime = time || timeUtil.now()
  }

  /**
   * 发送指令
   * @param {Order} order
   */
  sendOrder (order) {
    if (!this.ws) {
      return
    }
    this.ws.send(JSON.stringify(order))
  }

  getSelfData () {
    return this.getPublicData()
  }

  getPublicData () {
    return {
      id: this.id,
      username: this.userName,
      sceneId: this.sceneId,
      score: this.score
    }
  }

  /**
   * 释放资源
   */
  release () {
    this.ws && this.ws.close()
    this.ws = null
  }
}

module.exports = Player
