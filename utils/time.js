const numFormat = function (num, n) {
  return Array(n > num ? (n - ('' + num).length + 1) : 0).join(0) + num
}

const getDateValueMap = function (d) {
  return {
    year: d.getFullYear(),
    month: numFormat(d.getMonth() + 1, 2),
    date: numFormat(d.getDate(), 2),
    hour: numFormat(d.getHours(), 2),
    minute: numFormat(d.getMinutes(), 2),
    second: numFormat(d.getSeconds(), 2)
  }
}

const getTime = function () {
  const d = getDateValueMap(new Date())
  return `${d.year}-${d.month}-${d.date} ${d.hour}:${d.minute}:${d.second}`
}

const timeUtil = {
  getTime
}

module.exports = timeUtil
