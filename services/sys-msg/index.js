const Manager = require('./manager')

/**
 * 退出当前进程
 */
const killSelf = function () {
  process.exit()
}

const checkAuth = function(level = 0, type = '') {
  switch (type) {
    case 'create':
      return level > 8
    default:
      return true
  }
}

process.on('message', function (o) {
  const { type, auth = {} } = o || {}
  switch (type) {
    case 'kill':
      killSelf()
      break
    case 'create':
      Manager.createSysMsg(o)
      break
    default:
      break
  }
})