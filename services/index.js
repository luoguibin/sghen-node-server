const childProcess = require('child_process')

// 服务全局变量
const serviceMap = {}
const serviceKeys = ['peotry']

/**
 * 启动服务
 * @param {String} key
 */
const startService = function (key) {
  if (!key || (serviceMap[key] && !serviceMap[key].killed)) {
    return
  }
  console.log('startService()', key)
  const child = childProcess.fork(`${__dirname}/${key}/index.js`, [])
  serviceMap[key] = child

  child.on('close', function (code) {
    delete serviceMap[key]
    console.log('子进程已退出，退出码 ' + code)
  })
  // child.on('message', function (o) {
  //   console.log('PARENT got message:', o)
  // })
  // child.send({ data: 'start' })
}

/**
 * 初始化服务中心
 */
const initServiceCenter = function () {
  serviceKeys.forEach(key => {
    startService(key)
  })
}

/**
 * 调用服务
 * @param {String} serviceKey
 * @param {Object} o
 */
const execFuc = function (serviceKey, o) {
  const child = serviceMap[serviceKey]
  if (!child || child.killed) {
    return
  }
  console.log(serviceKey + '-service execFuc()', o)
  child.send(o)
}

module.exports = {
  start: initServiceCenter,
  exec: execFuc
}
