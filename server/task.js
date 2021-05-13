const schedule = require('node-schedule')
const { updateAPIs } = require('./api-center')
const { checkPeotryPraise } = require('../task/peotry-praise')
const praiseCensus = require('../services/peotry/praise-census')

const timeUtil = require('../utils/time')

const initScheduleTask = function () {
  // 每天凌晨3时执行一次:
  console.log('initScheduleTask')
  schedule.scheduleJob('0 0 3 * * *', () => {
    console.log('scheduleJob:' + timeUtil.newDate())
    updateAPIs()
    checkPeotryPraise()
    // praiseCensus.startAnalysis()
  })
}

const task = {
  initScheduleTask
}

module.exports = task
