/**
 * 简单的日志封装
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/18 16:07:26
 */

import fs from 'iofs'
import path from 'path'

export default class Log {
  constructor(file = 'run_time.log', dir = './') {
    if (!dir) {
      throw new Error(`agument dir must be a string, but ${typeof dir} given.`)
    }

    if (!fs.exists(dir)) {
      fs.mkdir(dir)
    }

    this.file = path.resolve(dir, file)
  }

  error(str) {
    this.save(str, 'error')
  }

  info(str) {
    this.save(str, 'info')
  }

  warn(str) {
    this.save(str, 'warning')
  }

  debug(str) {
    this.save(str, 'debug')
  }

  //写入日志文件
  save(str, type) {
    type = type || 'debug'
    fs.echo(
      `[${type}] ${new Date().format('Y-m-d_H:i:s')} ${str} \n`,
      this.file,
      true
    )
  }
}
