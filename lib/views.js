/**
 * 简单的模板渲染, 用于在不需要smarty这种重量级模板引擎的时候
 * 可以兼容smarty的api
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/24 16:41:31
 */

import fs from 'iofs'
import path from 'path'

export default {
  name: 'views',
  install() {
    //
    var updir = this.get('VIEWS')

    return {
      assign() {
        //
      },

      render(file, noParse) {
        var filePath = path.join(updir, file)
        var buf = fs.cat(filePath)
        return Promise.resolve(buf)
      }
    }
  }
}
