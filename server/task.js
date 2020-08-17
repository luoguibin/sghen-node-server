const schedule = require('node-schedule')
const { updateAPIs } = require('./api-center')
const timeUtil = require('../utils/time')

const initScheduleTask = function () {
  // 每天凌晨3时执行一次:
  console.log('initScheduleTask')
  schedule.scheduleJob('0 0 3 * * *', () => {
    console.log('scheduleJob:' + timeUtil.newDate())
    updateAPIs()
  })
}

const task = {
  initScheduleTask
}

module.exports = task
