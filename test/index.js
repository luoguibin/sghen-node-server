const request = require('request')

// request.post({
//     url: 'http://localhost:8087/', form: {}},
//     function(error, response, body) {
//         console.log(error, response.statusCode, body)
//     }
// )

request.post({
  url: 'http://localhost:8087/dynamic-api/create',
  form: {
    name: '查询最新的10条API数据',
    comment: '',
    content: 'SELECT * FROM dynamic_api LIMIT 10',
    status: 1,
    userId: 16405,
    suffixPath: 'v3/list'
  }
}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body)
  } else {
    console.log(error)
  }
})
