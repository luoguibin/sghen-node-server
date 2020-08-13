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
    case 'start-auto-comment':
      Manager.startAutoComment()
      break
    case 'stop-auto-comment':
      Manager.stopAutoComment()
      break
    case 'auto-create-peotry':
      Manager.autoCreatePeotry(o.keyWords)
      break
    default:
      break
  }
})

Manager.startAutoComment()
