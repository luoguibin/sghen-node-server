const schedule = require('node-schedule')
const { updateAPIs } = require('./api-center')
const timeUtil = require('../utils/time')

const initScheduleTask = function () {
  // 每分钟的第30秒定时执行一次:
  console.log('initScheduleTask')
  schedule.scheduleJob('30 * * * * *', () => {
    console.log('scheduleJob:' + timeUtil.newDate())
    updateAPIs()
  })
}

const task = {
  initScheduleTask
}

module.exports = task
