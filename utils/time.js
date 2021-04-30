const numFormat = function (num, len) {
  if (String(num).length > len) return num
  return (Array(len).join(0) + num).slice(-len)
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

const newDate = function (offset = 8) {
  const d = new Date()
  d.setHours(d.getHours() + offset)
  return d
}

const getTime = function (date) {
  const d = getDateValueMap(date || newDate())
  return `${d.year}-${d.month}-${d.date} ${d.hour}:${d.minute}:${d.second}`
}

const now = function () {
  return newDate().getTime()
}

const timeUtil = {
  getTime,
  now,
  newDate
}

module.exports = timeUtil
