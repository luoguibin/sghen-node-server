const Manager = require('./manager')

/**
 * 退出当前进程
 */
const killSelf = function () {
  process.exit()
}

process.on('message', function (o) {
  const { type } = o || {}
  switch (type) {
    case 'kill':
      killSelf()
      break
    case 'create':
      Manager.createSysMsg(o.data)
      break
    default:
      break
  }
})