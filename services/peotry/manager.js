const API = require('../../core/http')
const JiuGe = require('./jiuge')
const dataUtil = require('../../utils/data')
const Mock = require('mockjs')

const host = 'www.sghen.cn'
const baseUrl = `https://${host}/sapi/v1/`

let LoginUserMap = {}
let UserPraiseMap = {}
let peotries = []

const RobotStartID = 200100001
const RobotCount = 10000
const RobotEndID = RobotStartID + RobotCount

// 九歌僵尸作者ID范围
const JiugetRobotStartID = RobotStartID
const JiugetRobotEndID = JiugetRobotStartID + 100

const SGHEN = {
  apiRespFunc: function (resp) {
    if (!resp || resp.code !== 1000) {
      return Promise.reject(resp)
    }
    return resp
  },
  get: function (url, params) {
    return API.get(url, params).then(this.apiRespFunc)
  },
  post: function (url, data, headers, params) {
    return API.post(url, data, headers, params).then(this.apiRespFunc)
  }
}

function createRobotUser (id) {
  return SGHEN.post(`${baseUrl}/user/create`, {
    id,
    name: Mock.mock('@cname'),
    pw: '123456',
    code: 'test'
  }, {
    token: 'test'
  }, {
    id: 123456
  })
}

function getPeotryComments (typeId, fromId) {
  return SGHEN.get(`${baseUrl}/api/get/peotry/comments`, {
    id: typeId,
    datas: fromId
  })
}

function getPoetriesInfos () {
  return SGHEN.get(`${baseUrl}/api/get/peotry/list-id`)
}

function loginUser (id) {
  // console.log(id, 'loginUser() start')
  return SGHEN.post('https://www.sghen.cn/sapi/v1/user/login', {
    account: id,
    pw: dataUtil.md5('123456'),
    type: 1
  }).then(resp => {
    const info = resp.data
    LoginUserMap[info.id] = info
    // console.log(id, 'loginUser() success')
    return resp
  }).catch(err => {
    console.log(`loginUser() err::${err}`)
  })
}

function commentPeotry (peotry, user, toId, content) {
  // console.log(user.account, 'commentPeotry() start')
  return SGHEN.post(`${baseUrl}/comment/create`, {
    type: 1,
    typeId: peotry.id,
    typeUserId: peotry.userId,
    content: content,
    fromId: user.id,
    toId: toId
  }, {
    Authorization: user.token
  }).then(resp => {
    if (toId === -1) {
      UserPraiseMap[peotry.id] = true
    }
    // console.log(user.account, 'commentPeotry() success')
  }).catch(err => {
    console.log(`commentPeotry() err::${err}`)
  })
}

function createPeotry (userInfo, setId, title, content) {
  return SGHEN.post(`${baseUrl}/peotry/create`, {
    userId: userInfo.id,
    setId: setId || 10005,
    title: title,
    content: content,
    end: ''
  }, {
    Authorization: userInfo.token
  })
}

const autoCreatePeotry = function (keyWords) {
  if (!keyWords) {
    return
  }
  const userId = Math.floor(Math.random() * (JiugetRobotEndID - JiugetRobotStartID)) + JiugetRobotEndID
  loginUser(userId).then(resp => {
    JiuGe.createPeotry(keyWords, userId).then(content => {
      // console.log(userId, `JiuGe.createPeotry() content=${content}`)
      if (content.includes('重新选择')) {
        // console.log(userId)
        return
      }

      createPeotry(resp.data, '', keyWords, content).then(() => {
        // console.log(userId, 'createPoetry() success')
      }).catch(err => {
        console.log(`createPeotry() err::${err}`)
      })
    }).catch(err => {
      console.log(userId, err)
    })
  }).catch(err => {
    console.log(userId, err)
  })
}

function checkBeforeCommentPeotry (peotry, user, toId = -1, content = 'praise') {
  // console.log(user.account, `checkBeforeCommentPeotry() user.id=${user.id}`)
  if (toId === -1) {
    if (Math.random() < 0.2 && UserPraiseMap[peotry.id]) {
      return
    }
    if (Math.random() < 0) {
      toId = user.id
      content = Math.random() < 0.15 ? Mock.mock('@csentence(1,100)') : Mock.mock('@csentence(1,10)')
    } else {
      // console.log(user.account, `getPeotryComments() peotry.id=${peotry.id} user.id=${user.id}`)
      getPeotryComments(peotry.id, user.id).then(resp => {
        const list = resp.data || []
        const index = list.findIndex(o => o.toId === -1 && o.content === 'praise')
        if (index >= 0) {
          UserPraiseMap[peotry.id] = true
          return
        }
        commentPeotry(peotry, user, toId, content)
      }).catch(err => {
        console.log(user.account, err)
      })
      return
    }
  } else {
    return
  }
  commentPeotry(peotry, user, toId, content)
}

/**
 * 循环自动评论
 */
let commentTimer
function autoComments () {
  // console.log(0, 'autoComments()')
  for (let i = 0; i < 3; i++) {
    const peotryIndex = Math.floor(peotries.length * Math.random())
    const peotry = peotries[peotryIndex]
    const userId = RobotStartID + Math.floor(RobotCount * Math.random())
    if (LoginUserMap[userId]) {
      // console.log(userId, 'loginUser() aleady login')
      checkBeforeCommentPeotry(peotry, LoginUserMap[userId])
    } else {
      loginUser(userId).then(resp => {
        checkBeforeCommentPeotry(peotry, resp.data)
      }).catch(err => {
        console.log(`loginUser() err::${err}`)
      })
    }
  }

  commentTimer = setTimeout(() => {
    if (Object.keys(LoginUserMap).length > 30) {
      stopAutoComment()
      setTimeout(() => {
        startAutoComment()
      }, 1000)
    } else {
      autoComments()
    }
  }, 5 * 60 * 1000)
}

/**
 * 开始自动评论
 */
const startAutoComment = function () {
  // console.log('startAutoComment')
  // 标记正在启动自动评论
  if (commentTimer === null) {
    return
  }
  if (commentTimer) {
    clearTimeout(commentTimer)
    commentTimer = null
  }
  peotries.splice(0, peotries.length)
  getPoetriesInfos().then(resp => {
    // const len = resp.data.length
    // console.log(0, 'getPoetriesInfos() success count=' + len)
    peotries = resp.data
    autoComments()
  }).catch(err => {
    console.log(`getPoetriesInfos() err: ${err}`)
  })
}

/**
 * 结束自动评论
 */
const stopAutoComment = function () {
  if (commentTimer) {
    clearTimeout(commentTimer)
    commentTimer = undefined
  }
  LoginUserMap = {}
  UserPraiseMap = {}
  peotries = []
}

module.exports = {
  startAutoComment,
  stopAutoComment,
  autoCreatePeotry
}
