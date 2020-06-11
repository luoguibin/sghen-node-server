const JWT = require('jsonwebtoken')
const { auth: authConfig } = require('../config')

const newToken = function (data = {}) {
  const { userId, userName, uLevel } = data
  if (!userId) {
    return ''
  }
  const time = Math.floor(Date.now() / 1000)
  return JWT.sign({
    exp: time + authConfig.expDuration,
    iat: time,
    userId,
    userName,
    uLevel
  }, authConfig.SECRET_KEY)
}

const verify = function (token, call) {
  JWT.verify(token, authConfig.SECRET_KEY, function (err, decoded) {
    call && call(err ? null : decoded)
  })
}

const auth = {
  newToken,
  verify
}

module.exports = auth
