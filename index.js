/**
 * 框架核心
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/28 10:01:47
 */

import 'es.shim' // 加载拓展方法
import http from 'http'
import path from 'path'
import fs from 'iofs'

import Request from '@gm5/request'
import Response from '@gm5/response'
import Views from '@gm5/views'
import { sessionPackage, sessionConnect } from '@gm5/session'
import { jwtPackage, jwtConnect } from '@gm5/jwt'

import config from './config/index.js'

import Routers from './middleware/router.js'
import Cors from './middleware/cors.js'

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
    hideProperty(this, '__FIVE__', config)
    hideProperty(this, '__MODULES__', {})
    hideProperty(this, '__MIDDLEWARE__', [Cors])
  }

  __main__() {
    var { domain, website, session, jwt } = this.__FIVE__
    domain = domain || website
    session.domain = session.domain || domain
    this.set({ domain, session })

    // 安装模板引擎
    this.install(Views)

    // 将jwt & session中间件提到最前
    // 以便用户自定义的中间件可以直接操作session
    if (session.enabled) {
      this.install(sessionPackage)
      this.__MIDDLEWARE__.unshift(sessionConnect)
    }
    // 开启jwt
    if (jwt) {
      this.install(jwtPackage)
      this.__MIDDLEWARE__.unshift(jwtConnect)
    }

    // 路由中间件要在最后
    this.use(Routers)
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
            console.error(err)
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
    throw TypeError('argument must be a function')
  }

  // 注入实例化对象到实例池中
  // 与use方法不同的是, 这个会在server创建之前就已经执行
  install({ name, install }, args) {
    this['$$' + name] = install.call(this, args)
    return this
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

  // 启动http服务
  listen(port) {
    var _this = this
    var server

    this.__main__()

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
