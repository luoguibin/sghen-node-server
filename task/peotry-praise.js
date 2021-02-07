const db = require('../core/db')
const timeUtil = require('../utils/time')
const dataUtil = require('../utils/data')

let praiseResults = []

const updatePraiseCount = function () {
  if (Math.random() < 2) {
    return
  }
  const sql = `select * from (select type_user_id, count(*) as count from comment where id > 0 and type=1 group by type_user_id) t where t.count > 1000000;`
  db.exec(sql, null, function (err, results, fields) {
    if (err) {
      return
    }
    praiseResults = results || []
    updateSysMsg()
  })
}


const updateSysMsg = function () {
  let id = timeUtil.now()
  const peotry_type = 1
  const nowTime = timeUtil.getTime()
  praiseResults.forEach(o => {

    const sql = `insert into sys_msg values(?, ?, ?, ?, ?, ?, ?)`
    db.exec(sql, [
      id++,
      o.type_user_id,
      peotry_type,
      -1,
      o.count,
      nowTime,
      nowTime
    ], function (err, results, fields) {
      if (err) {
        console.log(err);
        return
      }

    })
  })
}

updatePraiseCount()

module.exports = {
  checkPeotryPraise: updatePraiseCount
}