const mysql = require('mysql')
// const myConnection = require('express-myconsnection')
const { db: configDB } = require('../config')

const pool = mysql.createPool(configDB)

const exec = function (sql, params, callback) {
  pool.getConnection(function (err, con) {
    if (err) {
      callback(err, null, null)
      return
    }

    if (params === null || params.length === 0) {
      con.query(sql, function (err, results, fields) {
        callback(err, results, fields)
      })
    } else {
      con.query(sql, params, function (err, results, fields) {
        callback(err, results, fields)
      })
    }
    pool.releaseConnection(con)
  })
}

const db = {}
db.exec = exec

module.exports = db
