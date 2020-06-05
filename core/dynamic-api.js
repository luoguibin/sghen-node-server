const db = require('../core/db')
const timeUtil = require('../utils/time')
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
      resolve({ id: results.insertId, name, comment, content, status, userId, suffixPath, count: 0, timeCreate: time, timeUpdate: time })
    })
  })
}

const updateAPI = function (id, name, comment, content, status, suffixPath) {
  return new Promise(function (resolve, reject) {
    const time = timeUtil.getTime()
    const keys = 'name=?, comment=?, content=?, status=?, time_update=?, suffix_path=?'
    const values = [name, comment, content, status, time, suffixPath]
    db.exec(`UPDATE dynamic_api SET ${keys} WHERE id=?`, [...values, id], function (err, results, fields) {
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

const DynamicAPI = {
  queryAPIS,
  createAPI,
  updateAPI,
  deleteAPI,
  exec: db.exec
}

module.exports = DynamicAPI
