const db = require('../../core/db')
const timeUtil = require('../../utils/time')

const TABLE_PRAISE_CENSUS = 'praise_census'
const INSERT_MAX_COUNT = 20

const getPraiseAnalysisList = function (startTime, endTime) {
  if (analysisState < 1 || analysisState === 2) {
    return
  }
  analysisState = 2
  let sql = 'select type_id, type_user_id, count(type_id) as total from sghen_db.comment where type=? and to_id=?'
  const vals = [1, -1]

  if (startTime) {
    sql += ' and create_time>=?'
    vals.push(startTime)
  }
  if (endTime) {
    sql += ' and create_time<?'
    vals.push(endTime)
  }
  sql += ' group by type_id, type_user_id'

  console.log('load start')
  db.exec(sql, vals, function (err, results, fields) {
    console.log('load finish')
    if (err) {
      console.log(err)
      analysisState = -1
      return
    }
    updatePraiseStatistics(results)
  })
}

const PPS_COLUMNS = ['id', 'user_id', 'total', 'create_time', 'update_time']
const virValsStr = PPS_COLUMNS.map(() => '?').join(', ')

const updatePraiseStatistics = function (list = [], index = 0) {
  const list0 = list.slice(index, index + INSERT_MAX_COUNT)
  if (!list0.length) {
    console.log('updatePraiseStatistics finished')
    return
  }
  index += INSERT_MAX_COUNT

  const createTime = timeUtil.getTime()

  let sql = `INSERT INTO sghen_db.${TABLE_PRAISE_CENSUS} (${PPS_COLUMNS.join(',')}) VALUES`
  const vals = []
  const valsStr = list0.map(o => {
    vals.push(o.type_id, o.type_user_id, o.total, createTime, createTime)
    return `(${virValsStr})`
  }).join(',')
  sql += ` ${valsStr}`
  sql += ' ON DUPLICATE KEY UPDATE total = VALUES(total) + total, update_time = VALUES(create_time)'

  console.log(`update start: ${index}/${list.length}`)
  db.exec(sql, vals, function (err, results, fields) {
    console.log(`update end: ${index}/${list.length}`)
    if (err) {
      console.log(err)
      return
    }
    updatePraiseStatistics(list, index)
  })
}

const getPraiseCensusLatestRow = function () {
  return new Promise(function (resolve, reject) {
    db.exec(`select * from ${TABLE_PRAISE_CENSUS} limit 1`, null, function (err, results, fields) {
      if (err) {
        console.log('getPraiseCensusLatestRow', err)
        reject(err)
        return
      }
      console.log(results[0])
      resolve(results[0])
    })
  })
}

let analysisState = 0
let LATEST_ANALYSIS_TIME = ''
let YESTERDAY_TIME = ''
const initAnalysisTime = function () {
  getPraiseCensusLatestRow().then(latestRow => {
    analysisState = 1

    const yesterday = new Date(timeUtil.now() - 24 * 60 * 60 * 1000)
    if (!latestRow) {
      LATEST_ANALYSIS_TIME = timeUtil.getTime(yesterday)
      YESTERDAY_TIME = ''
      console.log(`init the ${TABLE_PRAISE_CENSUS}`)
      getPraiseAnalysisList('', LATEST_ANALYSIS_TIME)
    } else {
      console.log(`continue to analysize the ${TABLE_PRAISE_CENSUS}`)
      LATEST_ANALYSIS_TIME = latestRow.update_time
      YESTERDAY_TIME = timeUtil.getTime(yesterday)
      getPraiseAnalysisList(LATEST_ANALYSIS_TIME, YESTERDAY_TIME)
    }
  }).catch(() => {
    analysisState = -1
  })
}

// initAnalysisTime()

module.exports = {
  startAnalysis: initAnalysisTime
}
