const CONST_NUM = {
  SUCCESS: 1000,
  ERROR: 1001
}

const CONST_MSG = {
  1000: '请求成功',
  1001: '参数不合法'
}

const GetResponseData = function (code) {
  const data = {
    code: code || CONST_NUM.SUCCESS
  }
  data.msg = CONST_MSG[data.code]
  return data
}

module.exports = {
  CONST_NUM,
  CONST_MSG,
  GetResponseData
}
