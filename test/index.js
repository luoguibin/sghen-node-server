const request = require('request')
const auth = require('../core/auth')
const timeUtil = require('../utils/time')

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
const token = auth.newToken({ userId: 16405, userName: 'yimo', uLevel: 9 })

// const host = 'https://www.sghen.cn'
// const baseUrl = host + '/napi'
// const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTIyMDM1NjAsImlhdCI6MTU5MTU5ODc2MCwidUxldmVsIjoiOSIsInVzZXJJZCI6IjE2NDA1IiwidXNlck5hbWUiOiLkuYLmnKsifQ.bu16V6WU4ufWWP1jfIOyy8wwcIkgpUtfJzCu5v80Vrg'

// auth.verify(token, data => {
//   console.log('auth.verify', data)
// })

console.log(timeUtil.newDate())

// request.get({
//   url: `${baseUrl}/`
// }, outputFunc)

// request.post({
//   url: `${baseUrl}/auth/api-center/update`,
//   headers: {
//     Authorization: token
//   },
//   form: {
//     id: 27,
//     name: '查询最新的10条评论数据',
//     comment: '',
//     content: JSON.stringify([
//       {
//         key: 'list',
//         sql: 'SELECT * FROM comment LIMIT 10'
//       },
//       {
//         key: 'users',
//         sql: 'SELECT * FROM user WHERE id IN (${from_id})'
//       }
//     ]),
//     params: '{"from_id":{"type":"TEMP"}}',
//     method: 'GET',
//     status: 1,
//     suffixPath: 'v2/comment/list'
//   }
// }, outputFunc)

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
//     suffixPath: 'create'
//   }
// }, outputFunc)

// request.post({
//   url: `${baseUrl}/auth/api-center/update`,
//   headers: {
//     Authorization: token
//   },
//   form: {
//     id: 15,
//     name: '查询API',
//     comment: 'Auth认证',
//     content: JSON.stringify([{ key: 'data', sql: 'SELECT * FROM dynamic_api2 WHERE id=${id}' }]),
//     params: JSON.stringify({ id: { type: 'NUMBER' } }),
//     method: 'GET',
//     status: 1,
//     suffixPath: 'query-by-id'
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

request.post({
  url: `${baseUrl}/services`,
  headers: {
    Authorization: token
  },
  form: {
    serviceName: 'peotry',
    type: 'auto-create-peotry',
    keyWords: '白日梦'
  }
}, outputFunc)
