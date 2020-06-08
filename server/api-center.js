const API = require('../core/dynamic-api')
const DynamicAPI = require('../entity/dynamic-api')
const { GetResponseData, CONST_NUM } = require('./base')
const timeUtil = require('../utils/time')

const API_CENTER = {}
const API_CACHE = {}
const API_STATUS = {
  STOP: 0,
  RUNNING: 1,
  CACHED: 2
}

const initAPICenter = function () {
  // 加载数据
  API.queryAPIS(100, 0).then(({ list }) => {
    list.forEach(o => {
      const api = new DynamicAPI()
      api.setValues(o)
      api.build()
      API_CENTER[o.suffixPath] = api
    })
    console.log(`Init API_CENTER success. ${Object.keys(API_CENTER).length} DynamicAPIs are loaded...`)
    // for (const key in API_CENTER) {
    //   console.log(API_CENTER[key].suffixPath)
    // }
  }).catch(err => {
    console.log('Init API_CENTER err', err)
  })
}

/**
 * @param {String|Number} id
 * @returns {DynamicAPI}
 */
const getAPI = function (id) {
  id = parseInt(id)
  const keys = Object.keys(API_CENTER)
  for (let i = 0, len = keys.length; i < len; i++) {
    if (API_CENTER[keys[i]].id === id) {
      return API_CENTER[keys[i]]
    }
  }
  return null
}

/**
 *
 * @param {Express} app
 */
const init = function (app) {
  // API列表查询
  app.get('/api-center/list', function (req, res) {
    const limit = parseInt(req.query.limit || '10')
    const offset = parseInt(req.query.offset || '0')
    if (limit < 1 || offset < 0) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR))
      return
    }
    API.queryAPIS(100, 0).then(data => {
      res.send(res.send(GetResponseData(data)))
    }).catch(() => {
      res.send(GetResponseData(CONST_NUM.ERROR))
    })
  })
  // API创建
  app.post('/api-center/create', function (req, res) {
    const api = new DynamicAPI()
    api.setValues(req.body)
    if (!api.validate()) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR))
      return
    }
    if (API_CENTER[api.suffixPath]) {
      res.send(GetResponseData(CONST_NUM.API_REPEAT))
      return
    }

    api.timeCreate = timeUtil.getTime()
    api.timeUpdate = api.timeCreate
    API.createAPI(api).then(insertId => {
      api.id = insertId
      API_CENTER[api.suffixPath] = api
      res.send(GetResponseData(api))
    }).catch(() => {
      res.send(GetResponseData(CONST_NUM.ERROR))
    })
  })
  // API更新
  app.post('/api-center/update', function (req, res) {
    const tempApi = new DynamicAPI()
    tempApi.setValues(req.body)
    if (!tempApi.validate()) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR))
      return
    }

    const api = getAPI(tempApi.id)
    if (!api) {
      res.send(GetResponseData(CONST_NUM.API_NOT_LOADED))
      return
    }
    // 若存在路由，且路由对象不一致，则是重复定义路由
    if (API_CENTER[tempApi.suffixPath] && API_CENTER[tempApi.suffixPath] !== api) {
      res.send(GetResponseData(CONST_NUM.API_REPEAT))
      return
    }

    tempApi.timeUpdate = timeUtil.getTime()
    API.updateAPI(tempApi).then(o => {
      api.name = tempApi.name
      api.comment = tempApi.comment
      api.content = tempApi.content
      api.status = tempApi.status
      if (api.suffixPath !== tempApi.suffixPath) {
        delete API_CENTER[api.suffixPath]
        api.suffixPath = tempApi.suffixPath
        API_CENTER[tempApi.suffixPath] = api
      }
      api.build()
      res.send(GetResponseData(api))
    }).catch(err => {
      console.log(err)
      res.send(GetResponseData(CONST_NUM.ERROR))
    })
  })
  // API删除
  app.post('/api-center/delete', function (req, res) {
    const id = parseInt(req.body.id || 0)
    if (!id) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR))
      return
    }
    const api = getAPI(id)
    if (!api) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR))
      return
    }

    API.deleteAPI(api.id).then(o => {
      delete API_CENTER[api.suffixPath]
      res.send(GetResponseData(o))
    }).catch(() => {
      res.send(GetResponseData(CONST_NUM.ERROR))
    })
  })

  // 动态API数据获取
  app.get('/dynamic-api/get/:suffixPath(*)', function (req, res) {
    const suffixPath = req.params.suffixPath
    const api = API_CENTER[suffixPath]
    if (!api || api.status === API_STATUS.STOP) {
      res.send(GetResponseData(CONST_NUM.API_NOT_LOADED))
      return
    }

    // 读取缓存
    if (api.status === API_STATUS.CACHED && API_CACHE[api.id]) {
      const data = GetResponseData(API_CACHE[api.id])
      data.isCached = true
      res.send(data)
      return
    }
    // console.log(api)
    API.execGetAPI(api, req.query).then(data => {
      // 设置缓存
      if (api.status === API_STATUS.CACHED && !API_CACHE[api.id]) {
        API_CACHE[api.id] = data
      }
      res.send(GetResponseData(data))
    }).catch(err => {
      const data = GetResponseData(CONST_NUM.ERROR)
      data.error = err
      res.send(data)
    })
  }).post('/dynamic-api/post/:suffixPath(*)', function (req, res) {
    res.send(GetResponseData(CONST_NUM.API_NOT_LOADED))
  })

  initAPICenter()
}

const apiCneter = {
  init
}

module.exports = apiCneter
