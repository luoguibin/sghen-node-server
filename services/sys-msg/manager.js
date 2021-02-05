const db = require('../../core/db')
const timeUtil = require('../../utils/time')
const dataUtil = require('../../utils/data')

const columns = ["id", "user_id", "msg_type", "status", "content", "create_time", "update_time"]
const _columns = `(${columns.map(_ => '?').join(',')})`

const MODULE = {
  SYS: 1000,
  SYS_BLESS: 1001,
  USER: 2000,
  USER_CREATE: 2001,
}
const START_MOBILE = 10000000000

const createSysMsg = function(total, msgType, content) {
  if (!total) {
    return
  }
  let offset = 0
  const limit = 100
  let id = timeUtil.now()
  const nowTime = timeUtil.getTime()

  const loopCreateSysMsg = function() {
    if (offset >= total) {
      return
    }
    db.exec(`SELECT id FROM user WHERE mobile > ? LIMIT ?, ?`, [START_MOBILE, offset, limit], function (err, results) {
      if (!!err || !results.length) {
        return
      }
      const list = results
      const _manyColumns = list.map(_ => _columns).join(',')
      const manyValues = []
      list.forEach(o => {
        manyValues.push(id++, o.id, msgType, -1, content, nowTime, nowTime)
      });
      db.exec(`INSERT INTO sys_msg VALUES ${_manyColumns}`, manyValues, function (err) {
        offset += limit
        loopCreateSysMsg()
      })
    })
  }
  loopCreateSysMsg()
}

const startCreateSysMsg = function (data) {
  const { msgTypeKey, content } = data // || { msgTypeKey: 'SYS_BLESS', content: 'test' }
  const msgType = MODULE[msgTypeKey]
  if (!msgType) {
    return
  }

  db.exec(`SELECT COUNT(*) as total FROM user WHERE mobile > ?`, [START_MOBILE], function (err, results) {
    if (!!err || !results.length) {
      return
    }
    createSysMsg(results[0].total, msgType, content)
  })
}

// startCreateSysMsg()

module.exports = {
  createSysMsg: startCreateSysMsg
}
