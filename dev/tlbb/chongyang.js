const http = require('http')
const fs = require('fs')
const phantom = require('phantom')
const API = require('../../core/http')
const cheerio = require('cheerio')

const getLoginToken = function () {
  const url = 'https://auth.changyou.com/interfaceLogin?project=activity&s=https%3A%2F%2Ftlsp.changyou.com%2Fchangyou%2Fcore%2Flogin%2Fxtl%2Fchongyangsign%2F20200910%2Fcallback%3Fcallback%3Dhttp%253A%252F%252Ftlsp.changyou.com%252Fxtl%252Fchongyang%252Fpublic%252F20200915%252Fpc%252Findex.shtml'
  return API.get(url, undefined, true).then(resp => {
    const $ = cheerio.load(resp)
    return $('form[name=loginForm] input[name=loginToken]').val()
  })
}

getLoginToken().then(token => {
  // console.log('token=' + token)
}).catch(err => {
  console.log('err', err instanceof Object)
})

const loginHost = 'auth.changyou.com'
const loginHeaders = {
  'Remote-Address': `${loginHost}:80`,
  'Referrer-Policy': 'no-referrer-when-downgrade',
  'Content-Type': 'application/x-www-form-urlencoded',
  Host: `${loginHost}`,
  HostName: `${loginHost}`,
  Origin: `https://${loginHost}`,
  Referer: 'http://tlsp.changyou.com/changyou/core/login/xtl/chongyangsign/20200910?callback=http://tlsp.changyou.com/xtl/chongyang/public/20200915/pc/index.shtml',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest'
}
const userLogin = async function (cn, password) {
  const loginToken = await getLoginToken()
  const respHTML = await API.post('https://auth.changyou.com/login', {
    cn,
    password,
    loginToken,
    s:
      'https://tlsp.changyou.com/changyou/core/login/xtl/chongyangsign/20200910/callback?callback=http://tlsp.changyou.com/xtl/chongyang/public/20200915/pc/index.shtml',
    inputCnTime: '',
    theme: null,
    isMiddleLogin: ''
  }, loginHeaders, undefined, true)

  const startKey = 'parent.location.href="'
  const start = respHTML.indexOf(startKey)
  if (start === -1) {
    return
  }
  const endKey = '";'
  const end = respHTML.indexOf(endKey, start)
  const loginedUrl = respHTML.substring(start + startKey.length, end)
  autoSign(loginedUrl, cn)
}

const autoSign = async function (loginedUrl, userId) {
  const instance = await phantom.create()
  const page = await instance.createPage()
  await page.on('onResourceRequested', function (requestData) {
    console.info('Requesting', requestData.url)
  })

  const status = await page.open(loginedUrl)

  console.log('\n')
  console.log('\n')
  console.log('\n')
  console.log('\n*********************************************************')
  console.log(userId, status)
  if (status === 'fail') {
    instance.exit()
    return
  }

  setTimeout(async () => {
    const content = await page.property('content')
    fs.writeFile('./' + userId + '.txt', content, function (err) {
      console.log('write txt error', err)
    })
    page.evaluate(function () {
      document.getElementById('signBtn').click()
    })
  }, 20000)

  setTimeout(() => {
    console.log(userId + ' page exit\n**********************************************************************')
    console.log('\n')
    console.log('\n')
    console.log('\n')

    instance.exit()
  }, 25000)
}

const accounts = []
accounts.forEach((o, i) => {
  setTimeout(() => {
    userLogin(o.account, o.pass)
  }, 1000 * i)
})

// const server = http.createServer()
// server.on('request', function (request, response) {
//   /** @type {String} */
//   const url = request.url
//   if (url.startsWith('/sign')) {
//     console.log('收到客户端的请求了，请求路径是：' + url)
//     const queryStr = url.split('?')[1]
//     if (queryStr) {
//       const kvStrs = queryStr.split('&')
//       const query = {}
//       kvStrs.forEach(v => {
//         const kv = v.split('=')
//         query[kv[0]] = kv[1]
//       })

//       if (query.data) {
//         const url = decodeURIComponent(query.data)
//         const id = decodeURIComponent(query.id) || Date.now()
//         autoSign(url, id)
//       }
//     }
//   }
//   response.write('success')
//   response.end()
// })
// server.listen(7999, function () {
//   console.log('服务器启动成功了，可以通过 http://127.0.0.1:7999/ 来进行访问')
// })
