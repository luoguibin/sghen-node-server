const db = require('../core/db')

/**
 * @param {Number} limit
 * @param {Number} offset
 */
const queryAPIS = function (limit, offset) {
  return new Promise(function (resolve, reject) {
    db.exec('SELECT COUNT(id) as total FROM dynamic_api2', null, function (err0, results0, fields0) {
      if (err0) {
        reject(err0)
        return
      }
      const sqlStr = `SELECT id, name, comment, content, params, method, status, time_create AS timeCreate, time_update AS timeUpdate, user_id AS userId, suffix_path AS suffixPath, count FROM dynamic_api2 ORDER BY time_create DESC LIMIT ${limit} OFFSET ${offset}`
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

/**
 * @param {DynamicAPI} api
 */
const createAPI = function (api) {
  return new Promise(function (resolve, reject) {
    const keys = 'name, comment, content, params, method, status, user_id, time_create, time_update, suffix_path, count'
    const places = keys.replace(/[a-z_]+/g, '?')
    const values = [api.name, api.comment, api.content, api.params, api.method, api.status, api.userId, api.timeCreate, api.timeUpdate, api.suffixPath, api.count]
    db.exec(`INSERT INTO dynamic_api2 (${keys}) values (${places})`, values, function (err, results, fields) {
      if (err) {
        reject(err)
        return
      }
      resolve(results.insertId)
    })
  })
}

/**
 * @param {DynamicAPI} api
 */
const updateAPI = function (api, isCountUpdate) {
  return new Promise(function (resolve, reject) {
    const keys = isCountUpdate ? 'count = ?' : 'name=?, comment=?, content=?, params=?, method=?, status=?, time_update=?, suffix_path=?'
    const values = isCountUpdate ? [api.count] : [api.name, api.comment, api.content, api.params, api.method, api.status, api.timeUpdate, api.suffixPath]
    db.exec(`UPDATE dynamic_api2 SET ${keys} WHERE id=?`, [...values, api.id], function (err, results, fields) {
      if (err) {
        reject(err)
        return
      }
      resolve(results)
    })
  })
}

/**
 * @param {DynamicAPI} api
 */
const deleteAPI = function (id) {
  return new Promise(function (resolve, reject) {
    db.exec('DELETE FROM dynamic_api2 WHERE id=?', [id], function (err, results, fields) {
      if (err) {
        reject(err)
        return
      }
      resolve(results)
    })
  })
}

/**
 * @param {DynamicAPI} api
 */
const execAPI = function (sqls, queryParams) {
  // console.log('execAPI() start')
  return new Promise(function (resolve, reject) {
    if (sqls.length === 1) {
      // console.log(sqls[0].execSql, queryParams[0])
      db.exec(sqls[0].execSql, queryParams[0], function (err, results, fields) {
        if (err) {
          reject(err)
          return
        }
        resolve(results)
      })
      return
    }

    const datas = {}
    // 顺序执行多条sql
    const orderExec = function (index = 0) {
      // console.log('execAPI() orderExec', index)
      const { execSql, key: dataKey, hasTemp: tempKey, tempListKey } = sqls[index]
      if (tempKey) {
        const list = datas[tempListKey || 'list']
        if (!list || !(list instanceof Array)) {
          const err = {
            code: 500,
            msg: 'Running exception: API get temp query params error'
          }
          reject(err)
          return
        }
        // 筛选出对应tempKey的基本数据构成的数组
        const temp = list.map(o => o[tempKey])
        const tempMap = {}
        const tempData = []
        // 重复值过滤
        temp.forEach(v => {
          if (!tempMap[v]) {
            tempMap[v] = true
            tempData.push(v)
          }
        })
        if (tempData.length === 0) {
          datas[dataKey] = []
          if (index === sqls.length - 1) {
            resolve(datas)
          } else {
            orderExec(index + 1)
          }
        }
        queryParams[index] = [tempData]
      }
      db.exec(execSql, queryParams[index], function (err, results, fields) {
        if (err) {
          reject(err)
          return
        }

        if (dataKey === 'count') {
          const keys = Object.keys(results[0])
          datas[dataKey] = results[0][keys[0]]
        } else {
          datas[dataKey] = results
        }
        // console.log(execSql, queryParams[index], results)

        if (index === sqls.length - 1) {
          resolve(datas)
        } else {
          orderExec(index + 1)
        }
      })
    }
    orderExec()
  })
}

const API = {
  queryAPIS,
  createAPI,
  updateAPI,
  deleteAPI,
  execAPI,
  exec: db.exec
}

module.exports = API
