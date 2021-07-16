const { createProxyMiddleware, responseInterceptor, fixRequestBody } = require('http-proxy-middleware');

const PUBLIC_AUTH_CODE = 'lgb'

const checkAuthCode = function (req) {
  const { authCode = '' } = req.params
  if (!authCode.startsWith(PUBLIC_AUTH_CODE)) {
    return false
  }
  return true
}

// 代理服务器IP+PORT
const PROXY_DP = '192.168.1.99:8282'
const PROXY_PDP = `http://${PROXY_DP}`

// 被代理资源的服务器授权码、IP映射
const IP_MAP = {
  '192_168_1_110': 'http://192.168.1.110',
}

const matchProxyRouter = function (req) {
  const { authCode } = req.params
  const ipKey = authCode.replace(PUBLIC_AUTH_CODE, '')
  console.log('matchProxyRouter', IP_MAP[ipKey]);
  return IP_MAP[ipKey] || PROXY_PDP
}


const initArcgisProxy = function (app) {
  app.use('/proxy/:authCode/*', createProxyMiddleware(function (pathname, req) {
    return checkAuthCode(req)
  }, {
    target: PROXY_PDP,
    router: function (req) {
      const pdp = matchProxyRouter(req)
      req.params._dp = pdp.replace(/http(s)?:\/\//, '')
      return pdp
    },
    changeOrigin: true,
    prependPath: true,
    toProxy: true,
    pathRewrite: function (path, req) {
      console.log(path);
      const kvsStr = "proxy_server=sg_arcgis"
      path += `${path.includes('?') ? '&' : '?'}${kvsStr}`

      const temp = path.replace(/^\/proxy\/[a-zA-Z0-9_-]+\//, "/")
      console.log('pathRewrite', temp);
      return temp;
    },
    onProxyReq: function (proxyReq, req, res) {
      fixRequestBody(proxyReq, req)
      console.log("proxyReq", proxyReq.path);
    },
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(async function (responseBuffer, proxyRes, req, res) {
      const contentType = proxyRes.headers["content-type"] || ""

      if (contentType.includes("text/")) {
        console.log("deal the mapserver html data");
        const response = responseBuffer.toString('utf8');
        const { authCode, _dp } = req.params;
        const dpReg = new RegExp(_dp + '/arcgis', 'g')
        return response.replace(dpReg, `${PROXY_DP}/proxy/${authCode}/arcgis`)
          .replace(/"\/arcgis\//g, `"/proxy/${authCode}/arcgis/`);
      }

      return responseBuffer;
    })
  }))
}

module.exports = function (app) {
  initArcgisProxy(app)
}