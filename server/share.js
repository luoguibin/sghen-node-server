const auth = require('../core/auth')
const db = require('../core/db')
const { GetResponseData, CONST_NUM } = require('./base')
const timeUtil = require('../utils/time')

const SHARE_MODULE_MAP = {
  resume: true,
}

const queryData = function (tableName, id, userId) {
  return new Promise(function (resolve, reject) {
    const sql = `SELECT * FROM ${tableName} WHERE id=? AND user_id=?`
    db.exec(sql, [id, userId], function (err, results, fields) {
      if (err) {
        reject(err)
        return
      }
      resolve(results[0])
    })
  })
}

/**
 * @param {Express} app
 */
const init = function (app) {
  app.get('/share/detail', function (req, res) {
    const code = req.query.shareCode || ''
    if (!code) {
      res.send(GetResponseData(CONST_NUM.ERROR))
      return
    }

    auth.verify(code, data => {
      if (!data) {
        res.send(GetResponseData(CONST_NUM.ERROR, '分享链接无效'))
        return
      }
      const { fromId, shareId, shareModule, shareTime, shareDuration } = data
      const limitTime = shareDuration - (timeUtil.now() - shareTime) / 1000
      if (limitTime < 0) {
        res.send(GetResponseData(CONST_NUM.ERROR, '分享链接已失效'))
        return
      }
      switch (shareModule) {
        case 'resume':
          queryData(shareModule, shareId, fromId).then(data => {
            const resp = GetResponseData(data)
            resp.limitTime = limitTime
            resp.shareDuration = shareDuration
            resp.shareTime = shareTime
            resp.currentTime = timeUtil.now()
            res.send(resp)
          }).catch(error => {
            res.send(GetResponseData(CONST_NUM.ERROR, '', error))
          })
          break
        default:
          res.send(GetResponseData(CONST_NUM.ERROR, '分享链接无效'))
          break
      }
    })
  })
  app.post('/auth/share/create', function (req, res) {
    const { shareId, shareModule, shareDuration } = req.body || {}
    if (!SHARE_MODULE_MAP[shareModule]) {
      res.send(GetResponseData(CONST_NUM.ERROR, '禁止分享当前模块'))
      return
    }
    const code = auth.newShareToken(req.auth.userId, shareId, shareModule, +shareDuration)
    res.send(GetResponseData({ code, currentTime: timeUtil.getTime(), shareDuration }))
  })
}

const share = {
  init
}

module.exports = share
