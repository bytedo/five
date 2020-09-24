/**
 * 路由中间件
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/18 15:16:29
 */

export default function(req, res, next) {
  var debug = this.get('debug')

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
    .then(async ({ default: Mod }) => {
      var app
      var err = ''

      if (Mod) {
        app = new Mod()
        app.__f_i_v_e__(this, req, res)

        // 4. 优先执行__main__方法
        if (app.__main__) {
          try {
            await app.__main__()
          } catch (err) {
            return Promise.reject(err)
          }
        }

        var route = req.path.shift()
        var act = route + 'Action'

        if (app[act]) {
          return app[act].apply(app, req.path)
        } else {
          err = new Error(`Route [${route}] not found`)
          err.status = 404
        }
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
