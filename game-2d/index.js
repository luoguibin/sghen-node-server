
const { GLOBAL, TIME_HEART } = require('./global')
const { maps } = require('./maps')
const { PLAYER, newOrder, SYSTEM } = require('./orders')
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

/**
 * 转化消息为指令，并处理
 * @param {String} msg
 */
const dealMsg = function (msg = '{}') {
  const msgObj = JSON.parse(msg)
  // id做什么？fromId是谁？sceneId从哪里来？
  const { id, fromId, sceneId } = msgObj
  if (!id || !fromId || sceneId === undefined) {
    console.log('dealMsg() emptry params:', id, fromId)
    return
  }
  const scene = GLOBAL.scenes[sceneId]
  scene && scene.dealOrder(newOrder(id, fromId, msgObj.toId, msgObj.data))
}

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
      // 用户重连，释放旧连接，添加新连接
      oldPlayer.release()
      oldPlayer.ws = ws
      oldPlayer.setHeartTime()
      const scene = GLOBAL.scenes[oldPlayer.sceneId]
      oldPlayer.sendOrder(newOrder(PLAYER.RECONNECT, oldPlayer.id, PLAYER.ALL, oldPlayer.getSelfData()))
      scene.addPlayer(oldPlayer)
    } else {
      // 用户登陆，添加到全局用户图中，默认登陆到场景0
      const player = new Player(userId, clientInfo.userName, ws)
      player.sendOrder(newOrder(PLAYER.LOGIN, SYSTEM.GOD, player.id, player.getSelfData()))
      GLOBAL.userMap[player.id] = player
      GLOBAL.scenes[0].addPlayer(player)
    }
    ws.on('message', msg => {
      dealMsg(msg)
    })
    ws.on('close', () => {
      // 只释放连接，由心跳机制或用户主动发送指令释放其他资源
      console.log('close', userId)
    })
  }
}
