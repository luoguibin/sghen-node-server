const paramUtil = {
  NUMBER: function (str) {
    if (/^[0-9]+$/.test(str)) {
      return parseInt(str)
    }
    return null
  },
  NUMBERS: function (str) {
    if (/^[0-9,]+$/.test(str)) {
      return str
    }
    return null
  },
  STRING: function (str) {
    return str
  },
  BOOLEAN: function (str) {
    return Boolean(str)
  },
  JSON: function (str) {
    try {
      return JSON.parse(str)
    } catch (error) {
      return null
    }
  },
  DATE: function (str) {
    if (/^[0-9\-:\s]+$/.test(str)) {
      return str
    }
    return null
  }
}

module.exports = paramUtil
