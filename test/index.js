const request = require('request')

const outputFunc = function (error, response, body) {
  if (!error && +response.statusCode === 200) {
    console.log(body)
  } else {
    console.log(error)
  }
}

// request.post({
//   url: 'http://localhost:8087/api-center/create',
//   form: {
//     name: '查询最新的10条API数据',
//     comment: '',
//     content: 'SELECT * FROM dynamic_api LIMIT 10',
//     status: 1,
//     userId: 16405,
//     suffixPath: 'list'
//   }
// }, outputFunc)

request.post({
  url: 'http://localhost:8087/api-center/update',
  form: {
    id: 1589419765292071,
    name: '查询最新的10条用户数据',
    comment: '无条件查询',
    content: `SELECT COUNT(id) AS total FROM user
      $$$
      SELECT id, user_name AS userName, avatar FROM user LIMIT \${limit} OFFSET \${offset}`,
    status: 1,
    userId: 16405,
    suffixPath: 'v1/user/list'
  }
}, outputFunc)
