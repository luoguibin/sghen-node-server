const db = require('../core/db')
const timeUtil = require('../utils/time')
const { GetResponseData, CONST_NUM } = require('./base')
const API_CENTER = {}

/*
dynamic_api:
1     id              bigint(20)
2     name            varchar(200)
3     comment         varchar(200)
4     content         mediumtext
5     status          int(11)
6     time_create     timestamp
7     time_update     timestamp
8     user_id         bigint(20)
9     suffix_path     varchar(100)
10    count           int(11)
*/

// class DynamicAPI {

// }

const queryAPIS = function (limit, offset) {
  return new Promise(function (resolve, reject) {
    db.exec('SELECT COUNT(id) as total FROM dynamic_api', function (err0, results0, fields0) {
      if (err0) {
        reject(err0)
        return
      }
      const sqlStr = `SELECT id, name, comment, content, status, time_create AS timeCreate, time_update AS timeUpdate, user_id AS userId, suffix_path AS suffixPath, count FROM dynamic_api ORDER BY time_create DESC LIMIT ${limit} OFFSET ${offset}`
      db.exec(sqlStr, [limit, offset], function (err1, results1, fields1) {
        if (err1) {
          reject(err1)
          return
        }
        resolve({
          total: results0[0].total,
          list: results1
        })
      })
    })
  })
}

const createAPI = function (name, comment, content, status, userId, suffixPath) {
  return new Promise(function (resolve, reject) {
    const keys = 'name, comment, content, status, user_id, time_create, time_update, suffix_path, count'
    const time = timeUtil.getTime()
    const values = `'${name}', '${comment}', '${content}', '${status}', '${userId}', '${time}', '${time}', '${suffixPath}', 0`
    db.exec(`INSERT INTO dynamic_api (${keys}) values (${values})`, function (err, results, fields) {
      if (err) {
        reject(err)
        return
      }
      resolve(results)
    })
  })
}

/**
 *
 * @param {Express} app
 */
const init = function (app) {
  // app.get('/dynamic-api/list', function (req, res) {
  //     const limit = parseInt(req.query.limit || '10')
  //     const offset = parseInt(req.query.offset || '0')
  //     if (limit < 1 || offset < 0) {
  //         res.send(GetResponseData(CONST_NUM.ERROR));
  //         return
  //     }

  //     queryAPIS(limit, offset).then(list => {
  //         const data = GetResponseData()
  //         data.data = list
  //         res.send(data);
  //     }).catch(err => {
  //         console.log(err)
  //         res.send(GetResponseData(CONST_NUM.ERROR));
  //     })
  // })

  app.post('/dynamic-api/create', function (req, res) {
    const { name, comment, content, status, userId, suffixPath } = req.body
    if (!suffixPath || !suffixPath.length || !content || !content.length) {
      res.send(GetResponseData(CONST_NUM.ERROR))
      return
    }
    if (API_CENTER[suffixPath]) {
      const data = GetResponseData(CONST_NUM.ERROR)
      data.msg = '已存在该动态API路由'
      res.send(data)
      return
    }

    createAPI(name, comment, content, status, userId, suffixPath).then(o => {
      const data = GetResponseData()
      data.data = o
      res.send(data)
    }).catch(() => {
      res.send(GetResponseData(CONST_NUM.ERROR))
    })
  })
  app.get('/api/dynamic-api/get/:suffixPath', function (req, res) {
    const suffixPath = req.params.suffixPath
    const api = API_CENTER[suffixPath]
    if (!api) {
      res.send(GetResponseData(CONST_NUM.ERROR))
      return
    }

    db.exec(api.content, function (err, results, fields) {
      if (err) {
        res.send(GetResponseData(CONST_NUM.ERROR))
        return
      }
      const data = GetResponseData()
      data.data = results
      res.send(data)
    })
  })
  app.post('/api/dynamic-api/post/:suffixPath', function (req, res) {
    res.send(GetResponseData())
  })

  // 加载数据
  queryAPIS(100, 0).then(({ list }) => {
    list.forEach(o => {
      API_CENTER[o.suffixPath] = o
    })
  }).catch(err => {
    console.log('Init API_CENTER err', err)
  })
}

const dynamicAPI = {
  init
}

module.exports = dynamicAPI
