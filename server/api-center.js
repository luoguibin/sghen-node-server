const DynamicAPI = require('../core/dynamic-api')
const { GetResponseData, CONST_NUM } = require('./base')

const API_CENTER = {}
const API_CACHE = {}
const API_STATUS = {
  STOP: 0,
  RUNNING: 1,
  CACHED: 2
}

const initAPICenter = function () {
  // 加载数据
  DynamicAPI.queryAPIS(100, 0).then(({ list }) => {
    list.forEach(o => {
      API_CENTER[o.suffixPath] = o
    })
    console.log(`Init API_CENTER success. ${Object.keys(API_CENTER).length} DynamicAPIs are loaded...`)
    // for (const key in API_CENTER) {
    //   console.log(API_CENTER[key].suffixPath)
    // }
  }).catch(err => {
    console.log('Init API_CENTER err', err)
  })
}

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
    DynamicAPI.queryAPIS(100, 0).then(data => {
      res.send(res.send(GetResponseData(data)))
    }).catch(() => {
      res.send(GetResponseData(CONST_NUM.ERROR))
    })
  })
  // API创建
  app.post('/api-center/create', function (req, res) {
    const { name, comment, content, status, userId, suffixPath } = req.body
    if (!suffixPath || !suffixPath.length || !content || !content.length) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR))
      return
    }
    if (API_CENTER[suffixPath]) {
      res.send(GetResponseData(CONST_NUM.API_REPEAT))
      return
    }

    DynamicAPI.createAPI(name, comment, content, status, userId, suffixPath).then(o => {
      API_CENTER[o.suffixPath] = o
      res.send(GetResponseData(o))
    }).catch(() => {
      res.send(GetResponseData(CONST_NUM.ERROR))
    })
  })
  // API更新
  app.post('/api-center/update', function (req, res) {
    const { id, name, comment, content, status, suffixPath } = req.body
    if (!id || !suffixPath || !suffixPath.length || !content || !content.length) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR))
      return
    }

    const api = getAPI(id)
    if (!api) {
      res.send(GetResponseData(CONST_NUM.API_NOT_LOADED))
      return
    }
    // 若存在路由，且路由对象不一致，则是重复定义路由
    if (API_CENTER[suffixPath] && API_CENTER[suffixPath] !== api) {
      res.send(GetResponseData(CONST_NUM.API_REPEAT))
      return
    }

    DynamicAPI.updateAPI(id, name, comment, content, status, suffixPath).then(o => {
      api.name = name
      api.comment = comment
      api.content = content
      api.status = +status
      if (api.suffixPath !== suffixPath) {
        delete API_CENTER[api.suffixPath]
        api.suffixPath = suffixPath
        API_CENTER[suffixPath] = api
      }
      res.send(GetResponseData(o))
    }).catch(err => {
      console.log(err)
      res.send(GetResponseData(CONST_NUM.ERROR))
    })
  })
  // API删除
  app.post('/api-center/delete', function (req, res) {
    const { id, suffixPath } = req.body
    if (!id || !suffixPath) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR))
      return
    }
    if (!API_CENTER[suffixPath]) {
      res.send(GetResponseData(CONST_NUM.API_NOT_LOADED))
      return
    }
    if (API_CENTER[suffixPath].id !== id) {
      res.send(GetResponseData(CONST_NUM.API_PARAMS_ERROR))
      return
    }

    DynamicAPI.deleteAPI(id).then(o => {
      delete API_CENTER[suffixPath]
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

    DynamicAPI.exec(api.content, function (err, results, fields) {
      if (err) {
        res.send(GetResponseData(CONST_NUM.ERROR))
        return
      }
      // 设置缓存
      if (api.status === API_STATUS.CACHED && !API_CACHE[api.id]) {
        API_CACHE[api.id] = results
      }
      res.send(GetResponseData(results))
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
