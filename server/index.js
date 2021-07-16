const express = require('express')
const expressWs = require('express-ws')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require("fs")
const apiCenter = require('./api-center')
const gameCenter = require('./game-center')
const shareCenter = require('./share')
const { server: configServer } = require('../config')
const auth = require('../core/auth')
const { GetResponseData, CONST_NUM } = require('./base')
const task = require('./task')
const arcgisProxy = require("./arcgis-proxy")
const serviceCenter = require('../services/index')
const timeUtil = require('../utils/time')

const app = express()
app.use(cors({
  origin: ['*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  alloweHeaders: ['Origin', 'Authorization', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Content-Type']
}))
expressWs(app)
app.use('/public', express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(function (req, res, next) {
  // console.log(req.body)
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

  // 接口鉴权
  if (req.method === 'POST' && req.path.includes('auth')) {
    // req.headers.authorization // 不同协议对头部的大小写有区别...
    const token = req.get('Authorization')
    if (!token) {
      res.send(GetResponseData(CONST_NUM.ERROR_TOKEN))
      return
    }
    auth.verify(token, data => {
      if (!data) {
        res.send(GetResponseData(CONST_NUM.ERROR_TOKEN))
        return
      }
      req.auth = {
        userId: +data.userId,
        userName: data.userName,
        uLevel: +data.uLevel
      }
      next()
    })
  } else {
    next()
  }
})

// 基础测试路由
app.get('/', function (req, res) {
  res.send(GetResponseData({ currentTime: timeUtil.getTime() }))
}).post('/', function (req, res) {
  res.send(GetResponseData({ currentTime: timeUtil.getTime() }))
})

// arcgis代理初始化
// arcgisProxy(app)

// 自定义路由
apiCenter.init(app)
shareCenter.init(app)
gameCenter.init(app)

// 微服务路由
app.post('/services', function (req, res) {
  const { auth = {}, body = {} } = req
  if (!serviceCenter.checkAuth(auth, body)) {
    res.send(GetResponseData(CONST_NUM.ERROR, '', '权限不够'))
    return
  }

  serviceCenter.exec(body.serviceName, body)
  res.send(GetResponseData({ currentTime: timeUtil.getTime() }, '暂支持直接调用，不支持业务数据返回'))
})

// 最后定义通配路由404
app.get('*', function (req, res) {
  res.send(GetResponseData(CONST_NUM.ERROR404))
}).post('*', function (req, res) {
  res.send(GetResponseData(CONST_NUM.ERROR404))
})

// app.set('host', '0.0.0.0')
const server = app.listen(configServer.port, function () {
  const object = server.address()
  const { address, port } = object
  console.log('Sghen-Server is running: https://%s:%s', address, port)
})

task.initScheduleTask()

// 启动微服务中心
serviceCenter.start()
