const { GLOBAL } = require('./global')
const { PLAYER, SYSTEM, ACTION, newOrder, SKILL } = require('./orders')
const timeUtil = require('../utils/time')

class Scene {
  constructor (id, map) {
    this.id = id
    // 用户集合
    this.players = []
    // 地图
    this.map = map
    this.obstacles = []
  }

  /**
   * 添加用户
   * @param {Player} player
   */
  addPlayer (player) {
    const players = this.players
    // 设置当前场景，并将场景内所有用户信息发送到当前用户
    player.setSceneId(this.id)
    player.clearOrders()
    player.sendOrder(newOrder(ACTION.ENTER_MAP, SYSTEM.GOD, player.id, {
      players: players.map(o => {
        return o.getPublicData()
      }),
      obstacles: this.obstacles,
      map: {
        id: this.id,
        ...this.map
      }
    }))

    // 当前场景用户接受新加入用户
    const order = newOrder(ACTION.ENTER_MAP, player.id, PLAYER.ALL, player.getPublicData())
    this.sendOrder(order, player.id)
    if (!players.includes(player)) {
      players.push(player)
    }
  }

  /**
   * 移出用户
   * @param {Player} player
   */
  removePlayer (player) {
    this.sendOrder(newOrder(ACTION.LEAVE_MAP, player.id, PLAYER.ALL))
    player.setSceneId(-1)
    const players = this.players
    const index = players.findIndex(o => o === player)
    players.splice(index, 1)
  }

  /**
   * 对当前场景的用户发送指令
   * @param {Order} order
   * @param {Number} skipId
   */
  sendOrder (order, skipId) {
    if (order.id === SKILL.HIT) {
      const obstacleId = order.data.obstacleId
      this.obstacles.splice(this.obstacles.findIndex(o => o.id === obstacleId), 1)
    }
    this.players.forEach(o => {
      skipId !== o.id && o.sendOrder(order)
    })
  }

  /**
   * 处理指令
   * @param {Order} order
   */
  dealOrder (order) {
    const { id, fromId } = order
    const players = this.players
    const index = players.findIndex(o => o.id === fromId)
    // console.log('dealOrder', this.id, index, id, fromId, typeof fromId)
    if (index === -1) {
      return
    }
    const fromPlayer = players[index]
    switch (id) {
      case PLAYER.HEART:
        // 处理用户心跳指令
        fromPlayer.setHeartTime()
        break
      case PLAYER.LOGOUT:
        fromPlayer.release()
        players.splice(index, 1)
        delete GLOBAL.userMap[fromPlayer.id]
        this.sendOrder(newOrder(PLAYER.LOGOUT, SYSTEM.GOD, PLAYER.ALL, [fromPlayer.id]))
        break
      default:
        this.sendOrder(order)
        break
    }
  }

  /**
   * 心跳机制：跳动一次
   * @param {Number} nowTime
   * @param {Number} stepTime
   */
  beat (nowTime, stepTime) {
    const ids = []
    const players = this.players
    for (let i = players.length - 1; i >= 0; i--) {
      const player = players[i]
      if (nowTime - player.heartTime > stepTime) {
        console.log(player.id + ' ws close')
        // 用户掉线，释放资源
        ids.push(player.id)
        player.release()
        players.splice(i, 1)
        delete GLOBAL.userMap[player.id]
      }
    }

    // 发送集体掉线用户到当前场景
    ids.length && this.sendOrder(newOrder(PLAYER.LOGOUT, SYSTEM.GOD, PLAYER.ALL, ids))

    if (this.obstacles.length < 10) {
      const { width, height } = this.map
      const temps = []
      const count = this.obstacles.length < 5 ? 5 : 1
      const nowTime = timeUtil.now()
      for (let i = 0; i < count; i++) {
        temps.push({
          id: nowTime + i,
          x: Math.random() * width >> 0,
          y: Math.random() * height >> 0,
          type: Math.random() < 0.1 ? 'add' : Math.random() < 0.1 ? 'add-all' : 'show',
          value: (Math.random() * 8 >> 0) + 18
        })
      }
      this.obstacles.push(...temps)
      this.sendOrder(newOrder(SYSTEM.OBSTACLE, SYSTEM.GOD, PLAYER.ALL, temps))
    }
  }
}

module.exports = Scene
