const { GLOBAL } = require('./global')
const timeUtil = require('../utils/time')
const Order = require('./order')

class Scene {
  constructor (id, map) {
    this.id = id
    // 用户集合
    this.players = []
    // 地图
    this.map = map
    this.boxes = []
  }

  /**
   * 添加用户
   * @param {Player} player
   */
  addPlayer (player) {
    const players = this.players
    player.setSceneId(this.id)

    if (!players.includes(player)) {
      players.push(player)
    }

    this.sendOrder(Order.new(Order.ENTER_MAP, null, {
      player: player.getPublicData(),
      map: {
        id: this.id,
        ...this.map
      }
    }))
  }

  /**
   * 移出用户
   * @param {Player} player
   */
  removePlayer (player) {
    this.sendOrder(Order.new(Order.ENTER_MAP))
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
      case Order.HEART_BEAT:
        // 处理用户心跳指令
        fromPlayer.setHeartTime()
        break
      case Order.MAP_PLAYER_DATAS: {
        const newData = {
          players: this.players.map(o => {
            return o.getPublicData()
          })
        }
        const oldData = order.data || {}
        if (oldData.boxes) {
          newData.boxes = this.boxes
        }
        fromPlayer.sendOrder(Order.new(Order.MAP_PLAYER_DATAS, null, newData))
      }
        break
      case Order.PLAYER_LOGOUT:
        fromPlayer.release()
        players.splice(index, 1)
        delete GLOBAL.userMap[fromPlayer.id]
        this.sendOrder(Order.new(Order.PLAYER_LOGOUT, null, [fromPlayer.id]))
        break
      case Order.SKILL_HIT: {
        const boxId = order.data.id
        const index = this.boxes.findIndex(o => o.id === boxId)
        if (index >= 0) {
          const { value } = this.boxes.splice(index, 1)[0]
          fromPlayer.score += value
          order.data.score = value
        }
        this.sendOrder(order)
      }
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
    ids.length && this.sendOrder(Order.new(Order.LOGOUT, null, ids))

    if (this.boxes.length < 10) {
      const { width, height } = this.map
      const temps = []
      const count = this.boxes.length < 5 ? 5 : 1
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
      this.boxes.push(...temps)
      this.sendOrder(Order.new(Order.MAP_BOXES, null, temps))
    }
  }
}

module.exports = Scene
