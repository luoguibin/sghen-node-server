const JWT = require('jsonwebtoken')
const timeUtil = require('../utils/time')
const { auth: authConfig } = require('../config')

const newToken = function (data = {}) {
  const { userId, userName, uLevel } = data
  if (!userId) {
    return ''
  }
  const time = Math.floor(timeUtil.now() / 1000)
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
  const time = Math.floor(timeUtil.now() / 1000)
  return JWT.sign({
    exp: time + (parseInt(shareDuration) || 3600),
    shareTime: time,
    iat: time,
    fromId,
    shareId,
    shareModule
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
