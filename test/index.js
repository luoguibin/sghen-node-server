const request = require('request')
const auth = require('../core/auth')

const outputFunc = function (error, response, body) {
  // console.log(error, response, body)
  if (!error && +response.statusCode === 200) {
    console.log(body)
  } else {
    console.log(error)
  }
}
// const host = 'http://localhost:8282'
// const baseUrl = host
const host = 'https://www.sghen.cn'
const baseUrl = host + '/napi'

const token = auth.newToken({ userId: 16405, level: 9 })
auth.verify(token, data => {
  console.log('auth.verify', data)
})

request.post({
  url: `${baseUrl}/auth/api-center/update`,
  headers: {
    Authorization: token
  },
  form: {
    id: 1,
    name: '查询最新的10条API数据',
    comment: '',
    content: JSON.stringify([{ key: 'data', sql: 'SELECT d.*, u.user_name, u.avatar FROM dynamic_api2 d LEFT JOIN user u ON d.user_id=u.id LIMIT 10' }]),
    status: 1,
    userId: 16405,
    suffixPath: 'list'
  }
}, outputFunc)

// const tempContent = JSON.stringify([
//   { key: 'count', sql: 'SELECT COUNT(id) AS total FROM user' },
//   { key: 'list', sql: 'SELECT id, user_name AS userName, avatar FROM user LIMIT ${limit} OFFSET ${offset}' }
// ])
// request.post({
//   url: `${baseUrl}/auth/api-center/update`,
//   form: {
//     id: 1,
//     name: '查询最新的10条用户数据',
//     comment: '无条件查询',
//     content: tempContent,
//     status: 1,
//     userId: 16405,
//     suffixPath: 'v1/user/list'
//   }
// }, outputFunc)
