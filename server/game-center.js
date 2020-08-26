const auth = require('../core/auth')
const game2d = require('../game-2d/index')

/**
 * @param {Express} app
 */
const init = function (app) {
  app.ws('/auth/game2d', function (ws, req) {
    const { token } = req.query || {}
    auth.verify(token, data => {
      if (!data) {
        ws.close()
        return
      }
      game2d.connect(ws, req, data)
    })
  })
}

const gameCneter = {
  init
}

module.exports = gameCneter
