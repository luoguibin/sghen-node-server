
const { GLOBAL, TIME_HEART } = require('./global')
const { maps } = require('./maps')
const Order = require('./order')
const Scene = require('./scene')
const Player = require('./player')
const timeUtil = require('../utils/time')

// 初始化地图
maps.forEach((o, i) => {
  GLOBAL.scenes.push(new Scene(i, o))
})

// 全局心跳机制
setInterval(() => {
  const nowTime = timeUtil.now()
  GLOBAL.scenes.forEach(o => {
    o.beat(nowTime, TIME_HEART)
  })
}, TIME_HEART)

module.exports = {
  connect: function (ws, req, clientInfo) {
    const playerTotal = Object.keys(GLOBAL.userMap).length
    if (playerTotal > 10) {
      ws.close()
      return
    }
    const userId = +clientInfo.userId
    const oldPlayer = GLOBAL.userMap[userId]
    console.log('connect', userId, !!oldPlayer)
    if (oldPlayer) {
      oldPlayer.release()
      oldPlayer.ws = ws
      oldPlayer.sendOrder(Order.new(Order.PLAYER_LOGIN, null, oldPlayer.getSelfData()))
    } else {
      // 用户登陆，添加到全局用户图中，默认登陆到场景0
      const player = new Player(userId, clientInfo.userName, ws)
      player.sendOrder(Order.new(Order.PLAYER_LOGIN, null, player.getSelfData()))
      GLOBAL.userMap[player.id] = player
    }

    ws.on('message', msg => {
      const msgObj = JSON.parse(msg)
      const { id, fromId } = msgObj
      if (!id || !fromId) {
        console.log('dealMsg() emptry params:', id, fromId)
        return
      }

      switch (id) {
        case Order.ENTER_MAP:
          GLOBAL.scenes[0].addPlayer(GLOBAL.userMap[userId])
          break
        default: {
          const scene = GLOBAL.scenes[msgObj.sceneId || 0]
          const order = Order.new(id, msgObj.toId, msgObj.data)
          order.fromId = fromId
          scene && scene.dealOrder(order)
        }
          break
      }
    })
    ws.on('close', () => {
      // 只释放连接，由心跳机制或用户主动发送指令释放其他资源
      console.log('close', userId)
      const oldPlayer = GLOBAL.userMap[userId]
      oldPlayer && oldPlayer.release() // 暂释放连接
    })
  }
}
