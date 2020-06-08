const fs = require('fs')
const JWT = require('jsonwebtoken')
const { auth: authConfig } = require('../config')

const SECRET_KEY = fs.readFileSync('./config/private.key')

const newToken = function (data = {}) {
  const time = Math.floor(Date.now() / 1000)
  return JWT.sign({
    exp: time + authConfig.expDuration,
    iat: time,
    data: {
      userId: '',
      userName: '',
      uLevel: 0
    }
  }, SECRET_KEY)
}

const verify = function (token, call) {
  JWT.verify(token, SECRET_KEY, function (err, decoded) {
    call && call(err || decoded.data)
  })
}

const auth = {
  newToken,
  verify
}

module.exports = auth
