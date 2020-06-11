const API = require('../core/dynamic-api')
const DynamicAPI = require('../entity/dynamic-api')
const { GetResponseData, CONST_NUM } = require('./base')
const timeUtil = require('../utils/time')
const paramUtil = require('../utils/param')

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
  app.get('/open/api-center/config', function (req, res) {
    const keys = Object.keys(paramUtil)
    res.send(GetResponseData(keys))
  })
  // API列表查询
  app.get('/open/api-center/list', function (req, res) {
    const limit = parseInt(req.query.limit || '10')
    const offset = parseInt(req.query.offset || '0')
    if (limit < 1 || offset < 0) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR))
      return
    }
    API.queryAPIS(100, 0).then(data => {
      res.send(GetResponseData(data))
    }).catch(err => {
      res.send(GetResponseData(CONST_NUM.ERROR, '', err))
    })
  })
  // API创建
  app.post('/auth/api-center/create', function (req, res) {
    if (!req.auth || !req.auth.uLevel || +req.auth.uLevel < 9) {
      res.send(GetResponseData(CONST_NUM.API_AUTH_LOW))
      return
    }
    const api = new DynamicAPI()
    api.setValues(req.body)
    api.userId = req.auth.userId

    const errors = api.validateProperties()
    if (errors) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR, '', errors))
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
      api.build()
      API_CENTER[api.suffixPath] = api
      res.send(GetResponseData(api))
    }).catch(err => {
      res.send(GetResponseData(CONST_NUM.ERROR, '', err))
    })
  })
  // API更新
  app.post('/auth/api-center/update', function (req, res) {
    if (!req.auth || !req.auth.uLevel || +req.auth.uLevel < 9) {
      res.send(GetResponseData(CONST_NUM.API_AUTH_LOW))
      return
    }
    const tempApi = new DynamicAPI()
    tempApi.setValues(req.body)
    // tempApi.userId = req.auth.userId

    const errors = tempApi.validateProperties()
    if (errors) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR, '', errors))
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
      api.method = tempApi.method
      api.status = tempApi.status
      if (api.suffixPath !== tempApi.suffixPath) {
        delete API_CENTER[api.suffixPath]
        api.suffixPath = tempApi.suffixPath
        API_CENTER[tempApi.suffixPath] = api
      }
      api.build()
      res.send(GetResponseData(api))
    }).catch(err => {
      res.send(GetResponseData(CONST_NUM.ERROR, '', err))
    })
  })
  // API删除
  app.post('/auth/api-center/delete', function (req, res) {
    if (!req.auth || !req.auth.uLevel || +req.auth.uLevel < 9) {
      res.send(GetResponseData(CONST_NUM.API_AUTH_LOW))
      return
    }
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
    if (api.userId !== req.auth.userId) {
      res.send(GetResponseData(CONST_NUM.DATA_NOT_OWN))
      return
    }

    API.deleteAPI(api.id).then(o => {
      delete API_CENTER[api.suffixPath]
      res.send(GetResponseData(o))
    }).catch(err => {
      res.send(GetResponseData(CONST_NUM.ERROR, '', err))
    })
  })

  // 动态API数据获取
  app.get('/dynamic-api/:suffixPath(*)', function (req, res) {
    const suffixPath = req.params.suffixPath
    const api = API_CENTER[suffixPath]
    if (!api || api.status === API_STATUS.STOP || api.method !== 'GET') {
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

    // 检测参数
    const { errors, queryParams } = api.validateSqlEntities(req.query)
    if (errors) {
      res.send(GetResponseData(CONST_NUM.ERROR, '', errors))
      return
    }

    // console.log(api)
    API.execAPI(api.sqls, queryParams).then(data => {
      // 设置缓存
      if (api.status === API_STATUS.CACHED) {
        API_CACHE[api.id] = data
      }
      api.count += 1
      res.send(GetResponseData(data))
    }).catch(err => {
      res.send(GetResponseData(CONST_NUM.ERROR, '', err))
    })
  }).post('/auth/dynamic-api/:suffixPath(*)', function (req, res) {
    const suffixPath = req.params.suffixPath
    const api = API_CENTER[suffixPath]
    if (!api || api.status === API_STATUS.STOP || api.method !== 'POST') {
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

    // 检测参数
    const { errors, queryParams } = api.validateSqlEntities(req.body)
    if (errors) {
      res.send(GetResponseData(CONST_NUM.ERROR, '', errors))
      return
    }

    // console.log(api)
    API.execAPI(api.sqls, queryParams).then(data => {
      // 设置缓存
      if (api.status === API_STATUS.CACHED) {
        API_CACHE[api.id] = data
      }
      api.count += 1
      res.send(GetResponseData(data))
    }).catch(err => {
      res.send(GetResponseData(CONST_NUM.ERROR, '', err))
    })
  })

  initAPICenter()
}

const updateAPIs = function () {
  for (const key in API_CENTER) {
    API.updateAPI(API_CENTER[key], true)
  }
}

const apiCneter = {
  init,
  updateAPIs
}

module.exports = apiCneter
