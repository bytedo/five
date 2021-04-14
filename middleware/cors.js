/**
 * 跨域中间件
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/18 14:55:49
 */

import url from 'url'

export default function(req, res, next) {
  var CORS = this.get('cors')

  if (CORS.enabled) {
    var origin = req.header('origin') || req.header('referer') || ''
    var headers = req.header('access-control-request-headers')
    var { hostname, host, protocol } = url.parse(origin)

    if (CORS.origin.length && hostname) {
      var pass = false
      for (let it of CORS.origin) {
        if (hostname.endsWith(it)) {
          pass = true
          break
        }
      }
      if (pass === false) {
        return res.end('')
      }
    }
    if (CORS.credentials) {
      res.set('Access-Control-Allow-Credentials', 'true')
    }

    res.set('Access-Control-Allow-Origin', `${protocol}//${host}`)
    res.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE,PATCH')

    if (headers) {
      res.set('Access-Control-Allow-Headers', headers)
    }

    if (CORS.maxAge) {
      res.set('Access-Control-Max-Age', CORS.maxAge)
    }

    if (req.method === 'OPTIONS') {
      return res.end('')
    }
  }
  next()
}
