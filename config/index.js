/**
 * 部分配置
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/22 17:19:39
 */

const ENV_PROD = 'production'
const ENV_DEV = 'development'

export default {
  db: {},
  session: {
    enabled: false,
    ttl: 3600 * 24 * 7,
    domain: '', // NODESSID域, 默认等于domain
    level: 0, // 校验级别, 0: 不校验客户端, 2: ua, 4: ip, 6: ua + ip
    db: {
      host: '127.0.0.1',
      port: 6379,
      db: 0
    }
  },
  jwt: {
    // jwt 开关
    enabled: false,
    ttl: 3600 * 24 * 7,
    level: 0, // 校验级别, 0: 不校验客户端, 2: ua, 4: ip, 6: ua + ip
    secret: 'it_is_secret_key' // jwt密钥, 使用时请修改
  },
  website: 'localhost',
  domain: '', // cookie域, 默认等于website
  port: 3000,
  env: process.env.NODE_ENV === ENV_PROD ? ENV_PROD : ENV_DEV,
  debug: process.env.NODE_ENV === ENV_DEV, // debug模式
  smtp: {
    host: 'smtp.example.com',
    port: 25,
    mail: 'no-reply@example.com',
    name: 'no-reply',
    passwd: ''
  },
  views: {
    enabled: true,
    dir: '',
    ext: '.htm'
  },
  cors: {
    enabled: false,
    credentials: false,
    origin: [], // ['abc.com', 'a.foo.com']
    maxAge: 0
  },
  regexp: {
    // 常用正则
    email: /^[\w\.\-]+@\w+([\.\-]\w+)*\.\w+$/,
    uname: /^[A-Za-z\d_]{4,16}$/,
    passwd: /^\S{6,20}$/,
    phone: /^1[3456789]\d{9}$/,
    idCard: /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X|x)$/,
    cn: /^[\u4e00-\u9fa5]+$/,
    qq: /^\d{5,12}$/
  }
}
