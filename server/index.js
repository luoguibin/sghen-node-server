const express = require('express')
const bodyParser = require('body-parser')
const dynamicAPI = require('./dynamic-api')
const { server: configServer } = require('../config')
const { GetResponseData } = require('./base')

const app = express()
app.use('/public', express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  console.log('gate way: next')
  next()
})

app.get('/', function (req, res) {
  res.send(GetResponseData())
})
app.post('/', function (req, res) {
  res.send('12312')
})
dynamicAPI.init(app)

const server = app.listen(configServer.port, function () {
  const object = server.address()
  const { address, port } = object
  console.log('Sghen-Server is running: https://%s:%s', address, port)
})
