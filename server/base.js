const CONST_NUM = {
  SUCCESS: 1000,
  ERROR: 1001,
  ERROR404: 1004,
  API_NOT_LOADED: 2000,
  API_REPEAT: 2001,
  API_PARAMS_ERROR: 2002
}

const CONST_MSG = {
  1000: '请求成功',
  1001: '参数不合法',
  1004: '接口路径不合法',
  2000: '接口未加载或未定义',
  2001: '接口重复定义',
  2002: '接口参数错误'
}

const GetResponseData = function (e, msg) {
  const data = {}
  if (typeof e === 'object') {
    data.code = CONST_NUM.SUCCESS
    data.data = e
  } else {
    data.code = e || CONST_NUM.SUCCESS
  }
  data.msg = msg || CONST_MSG[data.code]
  return data
}

module.exports = {
  CONST_NUM,
  CONST_MSG,
  GetResponseData
}
