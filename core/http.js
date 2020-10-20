const request = require('request')

exports.get = function (url, params, isOriginResponse) {
  return new Promise(function (resolve, reject) {
    request.get({
      url,
      qs: { ...params }
    }, function (error, response, body) {
      if (error) {
        reject(error)
        return
      }
      if (response.statusCode !== 200) {
        reject(body)
        return
      }
      if (isOriginResponse) {
        resolve(body)
        return
      }
      try {
        const data = JSON.parse(body)
        resolve(data)
      } catch {
        reject(body)
      }
    })
  })
}

exports.post = function (url, data, headers, params, isOriginResponse) {
  return new Promise(function (resolve, reject) {
    request.post({
      url,
      headers: {
        ...headers
      },
      form: {
        ...data
      },
      qs: { ...params }
    }, function (error, response, body) {
      if (error) {
        reject(error)
        return
      }
      if (response.statusCode !== 200) {
        reject(body)
        return
      }
      if (isOriginResponse) {
        resolve(body)
        return
      }
      try {
        const data = JSON.parse(body)
        resolve(data)
      } catch {
        reject(body)
      }
    })
  })
}
