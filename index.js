/**
 * 框架核心
 * @authors yutent (yutent@doui.cc)
 * @date    2015-11-25 18:06:14
 *
 */

import 'es.shim' // 加载拓展方法
import http from 'http'
import path from 'path'
import fs from 'iofs'
// import Ioredis from 'ioredis'
import Request from '@gm5/request'
import Response from '@gm5/response'
// import Session from '@gm5/session'

import init from './lib/reg-init.js'
import Log from './lib/log.js' //基础日志记录工具

import routerWare from './middleware/router.js'
import credentialsWare from './middleware/credentials.js'

// import sessionWare from './module/session.js'

var log = console.log

function hideProperty(host, name, value) {
  Object.defineProperty(host, name, {
    value: value,
    writable: true,
    enumerable: false,
    configurable: true
  })
}

export default class Five {
  constructor() {
    hideProperty(this, '__FIVE__', Object.assign({}, init))
    hideProperty(this, '__MODULES__', {})
    hideProperty(this, '__MIDDLEWARE__', [credentialsWare])
  }

  __init__() {
    var { domain, website, session } = this.__FIVE__
    domain = domain || website
    session.domain = session.domain || domain
    this.set({ domain, session })

    // 这里只创建session的存储器, 而初始化操作在中间件中进行
    // if (session.type === 'redis') {
    //   hideProperty(
    //     this,
    //     '__SESSION_STORE__',
    //     new Ioredis({
    //       host: session.db.host || '127.0.0.1',
    //       port: session.db.port || 6379,
    //       db: session.db.db || 0
    //     })
    //   )
    // } else {
    //   hideProperty(this, '__SESSION_STORE__', {})
    // }

    // 将session和cookie的中间件提到最前
    // 以便用户自定义的中间件可以直接操作session和cookie
    // this.__MIDDLEWARE__.unshift(sessionWare)
    // this.__MIDDLEWARE__.unshift(credentialsWare)

    this.use(routerWare)
  }

  /*------------------------------------------------------------------------*/

  // 注册属性到全局Five对象
  set(obj) {
    for (let i in obj) {
      if (typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
        if (!this.__FIVE__[i]) {
          this.__FIVE__[i] = obj[i]
        } else {
          try {
            Object.assign(this.__FIVE__[i], obj[i])
          } catch (err) {
            log(err)
          }
        }
      } else {
        this.__FIVE__[i] = obj[i]
      }
    }
    return this
  }

  // 获取全局配置
  get(key) {
    return this.__FIVE__[key]
  }

  // 加载中间件
  // 与别的中间件用法有些不一样, 回调的传入参数中的req和res,
  // 并非原生的request对象和response对象,
  // 而是框架内部封装过的,可通过origin属性访问原生的对象
  use(fn) {
    if (typeof fn === 'function') {
      this.__MIDDLEWARE__.push(fn)
      return this
    }
    throw TypeError('argument must be a callback')
  }

  // 预加载应用, 缓存以提高性能
  preload(dir) {
    var list = fs.ls(dir)

    if (list) {
      list.forEach(item => {
        var { name } = path.parse(item)
        if (name.startsWith('.')) {
          return
        }
        // 如果是目录,则默认加载index.js, 其他文件不加载
        // 交由index.js自行处理, 用于复杂的应用
        if (fs.isdir(item)) {
          item = path.join(item, './index.js')
        }

        this.__MODULES__[name] = import(item).catch(err => {
          return { default: null }
        })
      })
    }

    return this
  }

  // 注入实例化对象到实例池中
  // 与use方法不同的是, 这个会在server创建之前就已经执行
  install({ name, install }) {
    this['$$' + name] = install.call(this, this.__FIVE__)
    return this
  }

  // 启动http服务
  listen(port) {
    var _this = this
    var server

    this.__init__()

    server = http.createServer(function(req, res) {
      var request = new Request(req, res)
      var response = new Response(req, res)

      var middleware = _this.__MIDDLEWARE__.concat()
      var fn = middleware.shift()

      if (response.rendered) {
        return
      }

      response.set('X-Powered-By', 'Five.js')

      if (fn) {
        ;(async function next() {
          await fn.call(_this, request, response, function() {
            fn = middleware.shift()
            if (fn) {
              next()
            }
          })
        })()
      }
    })

    server.listen(port || this.get('port'))

    return server
  }
}
