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
const host = 'http://localhost:8282'
const baseUrl = host
// const host = 'https://www.sghen.cn'
// const baseUrl = host + '/napi'

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
    id: 3,
    name: '查询最新的10条API数据',
    comment: '',
    content: JSON.stringify([{ key: 'data', sql: 'SELECT d.*, u.user_name, u.avatar FROM dynamic_api2 d LEFT JOIN user u ON d.user_id=u.id LIMIT 10' }]),
    method: 'GET',
    status: 1,
    userId: 16405,
    suffixPath: 'list'
  }
}, outputFunc)

// const tempContent = JSON.stringify([
//   { key: 'data', sql: 'INSERT INTO dynamic_api2 (name, comment, content, method, status, user_id, time_create, time_update, suffix_path, count) values (${name}, ${comment}, ${content}, ${method}, ${status}, ${userId}, now(), now(), ${suffixPath}, 0)' }
// ])
// request.post({
//   url: `${baseUrl}/auth/api-center/create`,
//   headers: {
//     Authorization: token
//   },
//   form: {
//     name: '创建API',
//     comment: 'Auth认证',
//     content: tempContent,
//     method: 'POST',
//     status: 1,
//     userId: 16405,
//     suffixPath: 'create'
//   }
// }, outputFunc)

// const tempContent = JSON.stringify([
//   { key: 'data', sql: 'SELECT * FROM dynamic_api2 WHERE name=${name}' }
// ])
// request.post({
//   url: `${baseUrl}/auth/dynamic-api/create`,
//   headers: {
//     Authorization: token
//   },
//   form: {
//     name: '查询API',
//     comment: 'Auth认证',
//     content: tempContent,
//     method: 'POST',
//     status: 1,
//     userId: 16405,
//     suffixPath: 'query-by-name'
//   }
// }, outputFunc)

// request.post({
//   url: `${baseUrl}/auth/dynamic-api/query-by-name`,
//   headers: {
//     Authorization: token
//   },
//   form: {
//     name: '查询---API\' OR 1=1'
//   }
// }, outputFunc)
