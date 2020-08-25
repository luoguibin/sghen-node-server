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
      if (oldClient) {
        oldClient.ws.close()
        oldClient.heartTime = timeUtil.newDate().getTime()
        oldClient.ws = ws
        ws.send(JSON.stringify({ id: -1, msg: '你断线重连成功了' }))
      } else {
        wsList.push({
          userId: userId,
          heartTime: timeUtil.newDate().getTime(),
          ws: ws
        })
        ws.send(JSON.stringify({ id: -1, msg: '你连接成功了' }))
      }
      ws.on('message', msg => {
        dealMsg(msg)
      })
    })
  })

  setInterval(() => {
    const nowTime = timeUtil.newDate().getTime()
    for (let i = wsList.length - 1; i >= 0; i--) {
      if (nowTime - wsList[i].heartTime > 10000) {
        console.log(wsList[i].userId + ' ws close')
        wsList[i].ws.close()
        wsList.splice(i, 1)
      }
    }
  }, 10000)
}

const dealMsg = function (msg) {
  if (!msg) {
    return
  }
  const msgObj = JSON.parse(msg)
  const { id, userId } = msgObj
  if (!id || !userId) {
    return
  }
  if (id === -1) {
    const userWs = wsList.find(o => o.userId === userId)
    if (!userWs) {
      return
    }
    userWs.heartTime = timeUtil.newDate().getTime()
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
