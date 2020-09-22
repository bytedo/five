/**
 * 路由中间件
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/18 15:16:29
 */

export default function(req, res, next) {
  var debug = this.get('debug')
  if (this.__MODULES__.__error__) {
    var err = this.__MODULES__.__error__
    return res.error(debug ? err.stack || err : err, err.status || 500)
  }

  // 1. 先判断控制器是否存在
  if (!this.__MODULES__[req.app]) {
    return res.error(`Controller [${req.app}] not found`, 404)
  }

  // 2. 默认二级路由为index
  if (req.path.length < 1) {
    req.path.push('index')
  }

  // 3. 实例化控制器
  this.__MODULES__[req.app]
    .then(({ default: Mod }) => {
      var app,
        err = ''
      if (Mod) {
        app = new Mod({ ctx: this, req, res })

        // action模式, 则路由自动调用对应的action方法
        // __main__模式, 则路由全部走__main__方法
        if (this.get('routeMode') === 'action') {
          var route = req.path.shift()
          var act = route + 'Action'

          if (app[act]) {
            return app[act].apply(app, req.path)
          } else {
            err = new Error(`Route [${route}] not found`)
          }
        } else {
          if (app.__main__) {
            return app.__main__.apply(app, req.path)
          } else {
            err = new Error('__main__() not found')
          }
        }
        err.status = 404
      } else {
        err = new Error(`Controller [${req.app}] load error`)
        err.status = 500
      }

      return Promise.reject(err)
    })
    .catch(err => {
      res.error(debug ? err.stack || err : err, err.status || 500)
    })
}
