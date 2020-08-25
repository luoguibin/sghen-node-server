const timeUtil = require('../utils/time')
const auth = require('../core/auth')

const wsList = []

/**
 * @param {Express} app
 */
const init = function (app) {
  app.ws('/auth/game2d', function (ws, req) {
    // console.log('wsList.length=' + wsList.length)
    if (wsList.length > 10) {
      ws.close()
      return
    }
    const { token } = req.query || {}
    auth.verify(token, data => {
      if (!data) {
        ws.close()
        return
      }
      const { userId } = data
      const oldClient = wsList.find(o => o.userId === userId)
      console.log('connect', userId, !!oldClient)
      if (oldClient) {
        if (oldClient.ws !== ws) {
          oldClient.ws.close()
          oldClient.ws = ws
        }

        oldClient.heartTime = timeUtil.now()
        ws.send(JSON.stringify({ id: -1, msg: '断线重连成功' }))
      } else {
        wsList.push({
          userId: +userId,
          heartTime: timeUtil.now(),
          ws: ws
        })
        ws.send(JSON.stringify({ id: -1, msg: '连接成功' }))
      }
      ws.on('message', msg => {
        dealMsg(msg)
      })
    })
  })

  setInterval(() => {
    const nowTime = timeUtil.now()
    for (let i = wsList.length - 1; i >= 0; i--) {
      if (nowTime - wsList[i].heartTime > 10000) {
        console.log(wsList[i].userId + ' ws close')
        wsList[i].ws.close()
        wsList.splice(i, 1)
      }
    }
  }, 10000)
}

const dealMsg = function (msg = '{}') {
  const msgObj = JSON.parse(msg)
  const { id, userId } = msgObj
  if (!id || !userId) {
    console.log('dealMsg() emptry params:', id, userId)
    return
  }
  if (id === -1) {
    const userWs = wsList.find(o => o.userId === userId)
    if (!userWs) {
      return
    }
    userWs.heartTime = timeUtil.now()
    msgObj.userCount = wsList.length
    userWs.ws.send(JSON.stringify(msgObj))
  } else {
    wsList.forEach(o => {
      o.ws.send(msg)
    })
  }
}

const gameCneter = {
  init
}

module.exports = gameCneter
