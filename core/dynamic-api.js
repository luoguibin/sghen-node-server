const db = require('../core/db')

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

/**
 * @param {DynamicAPI} api
 */
const createAPI = function (api) {
  return new Promise(function (resolve, reject) {
    const keys = 'name, comment, content, status, user_id, time_create, time_update, suffix_path, count'
    const values = `'${api.name}', '${api.comment}', '${api.content}', '${api.status}', '${api.userId}', '${api.timeCreate}', '${api.timeUpdate}', '${api.suffixPath}', ${api.count}`
    db.exec(`INSERT INTO dynamic_api (${keys}) values (${values})`, function (err, results, fields) {
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
const updateAPI = function (api) {
  return new Promise(function (resolve, reject) {
    const keys = 'name=?, comment=?, content=?, status=?, time_update=?, suffix_path=?'
    const values = [api.name, api.comment, api.content, api.status, api.time, api.suffixPath]
    db.exec(`UPDATE dynamic_api SET ${keys} WHERE id=?`, [...values, api.id], function (err, results, fields) {
      if (err) {
        reject(err)
        return
      }
      resolve(results)
    })
  })
}

const deleteAPI = function (id) {
  return new Promise(function (resolve, reject) {
    db.exec('DELETE FROM dynamic_api WHERE id=?', [id], function (err, results, fields) {
      if (err) {
        reject(err)
        return
      }
      resolve(results)
    })
  })
}

const validatorMap = {
  id: function (v) {
    if (!v) {
      return false
    }
    return /^[0-9A-Za-z]+$/.test(v)
  },
  offset: function (v) {
    if (!v) {
      return false
    }
    return /^[0-9]+$/.test(v)
  },
  limit: function (v) {
    if (!v) {
      return false
    }
    return /^[0-9]+$/.test(v)
  }
}

const formatQuery = function (query) {
  if (!query) {
    return
  }
  if (query.offset) {
    query.offset = parseInt(query.offset)
  }
  if (query.limit) {
    query.limit = parseInt(query.limit)
  }
}

/**
 * @param {DynamicAPI} api
 */
const execGetAPI = function (api, query) {
  // console.log('execGetAPI() start')
  return new Promise(function (resolve, reject) {
    // 判断参数是否合法
    const queryErrors = []
    const sqlEntities = api.sqlEntities
    sqlEntities.forEach(o => {
      o.orderKeys.forEach(key => {
        if (!validatorMap[key] || !validatorMap[key](query[key])) {
          queryErrors.push({ key, value: query[key] })
        }
      })
    })
    if (queryErrors.length) {
      reject(queryErrors)
      return
    }

    // 构建参数列表
    formatQuery(query)
    const queryParams = []
    sqlEntities.forEach(o => {
      const params = []
      o.orderKeys.forEach(key => {
        params.push(query[key])
      })
      queryParams.push(params)
    })

    // console.log('execGetAPI() 3')
    if (sqlEntities.length === 1) {
      db.exec(sqlEntities[0].originSql, queryParams[0], function (err, results, fields) {
        if (err) {
          reject(err)
          return
        }
        resolve(results)
      })
    } else {
      const errors = []
      const datas = []
      // 顺序执行多条sql
      const orderExec = function (index = 0) {
        // console.log('execGetAPI() orderExec', index)
        db.exec(sqlEntities[index].originSql, queryParams[index], function (err, results, fields) {
          if (err) {
            errors.push(err)
            reject(errors)
          } else {
            datas.push(results)
            if (index === sqlEntities.length - 1) {
              resolve(datas)
            } else {
              orderExec(index + 1)
            }
          }
        })
      }
      orderExec()
    }
  })
}

const API = {
  queryAPIS,
  createAPI,
  updateAPI,
  deleteAPI,
  execGetAPI,
  exec: db.exec
}

module.exports = API
