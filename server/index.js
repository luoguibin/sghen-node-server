const express = require('express')
const bodyParser = require('body-parser')
const apiCneter = require('./api-center')
const { server: configServer } = require('../config')
const auth = require('../core/auth')
const { GetResponseData, CONST_NUM } = require('./base')
const task = require('./task')

const app = express()
app.use('/public', express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

  // 接口鉴权
  if (req.method === 'POST' && req.path.includes('auth')) {
    const token = req.header.Authorization
    if (!token) {
      res.send(GetResponseData(CONST_NUM.ERROR_TOKEN))
      return
    }
    auth.verify(token, data => {
      if (!data) {
        res.send(GetResponseData(CONST_NUM.ERROR_TOKEN))
        return
      }
      next()
    })
  } else {
    next()
  }
})

// 基础测试路由
app.get('/', function (req, res) {
  res.send(GetResponseData())
}).post('/', function (req, res) {
  res.send(GetResponseData())
})

// 自定义路由
apiCneter.init(app)

// 最后定义通配路由404
app.get('*', function (req, res) {
  res.send(GetResponseData(CONST_NUM.ERROR404))
}).post('*', function (req, res) {
  res.send(GetResponseData(CONST_NUM.ERROR404))
})

app.set('host', '127.0.0.1')
const server = app.listen(configServer.port, function () {
  const object = server.address()
  const { address, port } = object
  console.log('Sghen-Server is running: https://%s:%s', address, port)
})

task.initScheduleTask()
