const JWT = require('jsonwebtoken')
const { auth: authConfig } = require('../config')
const timeUtil = require('../utils/time')

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

/**
 * 创建分享的token
 * @param {Object} data
 */
const newShareToken = function (fromId, shareId, shareModule, shareDuration) {
  if (!fromId || !shareId || !shareModule || !shareDuration) {
    return ''
  }
  const time = Math.floor(Date.now() / 1000)
  return JWT.sign({
    exp: time + (shareDuration || 3600),
    iat: time,
    fromId,
    shareId,
    shareModule,
    shareTime: timeUtil.now(),
    shareDuration
  }, authConfig.SECRET_KEY)
}

const verify = function (token, call) {
  JWT.verify(token, authConfig.SECRET_KEY, function (err, decoded) {
    call && call(err ? null : decoded)
  })
}

const auth = {
  newToken,
  newShareToken,
  verify
}

module.exports = auth
