/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Index app file
 *
 * v0.1 - 2016-09-02
 * @author Zhangpc
 */
'use strict'

// For webpack build backend files runtime
require('babel-polyfill')
// Set root dir to global
global.__root__dirname = __dirname
// Repalce native Promise by bluebird
global.Promise = require('bluebird')
// Disabled reject unauthorized
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const fs = require('fs')
const path = require('path')
const koa = require('koa')// 基于node.js平台的开发框架
const Router = require('koa-router')// koa 路由
const c2k = require('koa-connect')
const co = require('co')// nodejs 模块 co
const config = require('./configs')
const constants = require('./configs/constants')
const globalConstants = require('./constants')
const initGlobalConfig = require('./services/init_global_config')
const oemInfo = require('./services/oem_info')
const middlewares = require('./services/middlewares')
const logger = require('./utils/logger').getLogger('app')
const app = koa()
const terminal = require('./controllers/web_terminal')

//get global config
co(function*(){
  try{
    yield initGlobalConfig.initGlobalConfig()
  } catch(err) {
    logger.error('Unexpected error:', JSON.stringify(err))
    logger.error('Failed to connect to API server ' + config.tenx_api.host + ', fix the issue and restart this server.')
    // process.exit(-1)
  }
})

app.use(function* (next) {
  if (!global.globalConfig.oemInfo) {
    try {
      yield oemInfo.initOEMInfo()
    } catch (error) {
      logger.error('oem-info', error.message)
    }
  }
  yield next
})

/*
 * Koa middlewares
 */
// For koa logs
const koaLogger = require('koa-logger')
app.use(koaLogger())

// Set app config
const packageJSON = require('./package.json')
app.name = packageJSON.name
app.version = packageJSON.version

// For unexpected error handling
app.use(function* (next) {
  try {
    yield next
  } catch (err) {
    if (err && err.statusCode !== 200) {
      // Skip the log if it's success code
      logger.error('catch-error', err.stack)
      logger.error('catch-error', JSON.stringify(err))
    } else {
      logger.warn('Skipping warning message...')
    }
    let status = err.status || err.statusCode || err.code || 500
    let intStatus = parseInt(status)
    if (intStatus < 100 || isNaN(intStatus)) {
      logger.error(`Unexpected status code: ${status}`)
      intStatus = 500
    }
    this.status = intStatus
    this.body = {
      statusCode: intStatus,
      message: err.message || err
    }
    // this.app.emit('error', err, this)
  }
})

// Webpack for debug
global.CONFIG_PROD = true
if (process.env.NODE_ENV !== 'production') {
  global.CONFIG_PROD = false
}
global.indexHtml = global.CONFIG_PROD ? 'index' : 'index.debug'
if (!global.CONFIG_PROD) {
  const webpack = require('webpack')
  const koaWebpackDevMiddleware = require('koa-webpack-dev-middleware')
  const expressWebpackHotMiddleware = require('webpack-hot-middleware')
  const webpackConfig = require('./webpack.config')
  const compiler = webpack(webpackConfig)
  app.use(koaWebpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    watchOptions: {
      aggregateTimeout: 500,
      poll: true
    }
  }))
  app.use(c2k(expressWebpackHotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  })))
}

// Cookie & session
const session = require('koa-generic-session')
const KeyGrip = require('keygrip')
app.keys = config.session_secret
app.keys = new KeyGrip(config.session_secret, 'sha256')
const sessionOpts = {
  key: config.session_key,
  rolling: true,
  cookie: {
    maxAge: 1000 * 60 * (process.env.SESSION_MAX_AGE || 720) // 720 minutes(half a day)
  },
  ttl: 1000 * 60 * (process.env.SESSION_MAX_AGE || 720) // 720 minutes(half a day)
}

let sessionStore;
// Session store
// @important! server will pending here until the session store is connected
const redisConfig = config.redis || {}
const redisHost = redisConfig.host
const redisPort = redisConfig.port
const redisPassword = redisConfig.password
if (config.session_store === 'true' && redisHost) {
  logger.info(`Use redis to store session ...`)
  const redisStore = require('koa-redis')
  sessionStore = new redisStore({
    host: redisHost,
    port: redisPort,
    pass: redisPassword,
    prefix: 'session_'
  })
  sessionOpts.store = sessionStore
}
app.use(session(sessionOpts))

// Compress static files
const compress = require('koa-compress')
app.use(compress({
  filter: function (content_type) {
    return /text/i.test(content_type)
  },
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))

// Serve files from ./static
/*const serve = require('koa-static')
const staticOpts = {}
// Open cache in production mode
if (global.CONFIG_PROD) {
  staticOpts.maxage = 1000 * 60 * 60 * 24 * 7 // 静态文件一周的缓存
}
app.use(serve(__dirname + '/static', staticOpts))*/

// Parser content-Type applicationnd.docker.distribution.events.v1+json
/*app.use(function* (next) {
  let contentType = this.headers["content-type"]
  if (contentType) {
    if (contentType.indexOf('docker') >= 0) {
      this.headers['content-type'] = 'application/json'
    }
  }
  yield next
})*/

// For body parser
// const koaBody = require('koa-body')({
//   multipart: true,
//   formidable: {
//     keepExtensions: true,
//     maxFieldsSize: 1024 * 1024 * 1024,
//     // uploadDir: TEMP_DIR
//   }
// })

if (config.running_mode === constants.STANDARD_MODE) {
  app.use(function* (next) {
    if (this.request.url.indexOf('/payments/wechat_pay/notify') >= 0) {
      this.request.headers['content-type'] = 'text/plain'
    }
    yield next
  })
}
const koaBody = require('koa-body')({
  formLimit: 　524288000
})
app.use(koaBody)

// For views
const render = require('koa-ejs')
const viewOps = {
  root: __dirname,
  layout: false,
  viewExt: 'html',
  debug: false,
  cache: true
}
if (!global.CONFIG_PROD) {
  viewOps.debug = true
  viewOps.cache = false
}
render(app, viewOps)

// Auth by cookie csrftoken
/*const auth = require('./utils/auth')
app.use(auth.authCookieUser)*/

// Internationalization
const i18n = require('./services/i18n')
app.use(i18n.handle())
app.use(i18n.middleware)

// For test
/*app.use(function* (next) {
  this.session.loginUser = {
    user: "zhangpc",
    id: 104,
    namespace: "zhangpc",
    token: "jgokzgfitsewtmbpxsbhtggabvrnktepuzohnssqjnsirtot"
  }
  yield next
})*/

// For 404
app.use(function* pageNotFound(next) {
  yield next
  if (404 != this.status) return

  // we need to explicitly set 404 here
  // so that koa doesn't assign 200 on body=
  this.status = 404
  switch (this.accepts('json', 'html')) {
    case 'html':
      // this.type = 'html'
      // this.body = '<h3>Page Not Found</h3>'
      this.redirect('/notfound')
      break
    case 'json':
      this.body = {
        statusCode: 404,
        message: 'Page Not Found'
      }
      break
    default:
      this.type = 'text'
      this.body = 'Page Not Found'
  }
})

// Routes middleware
// ~ No authentication required
const noAuthRoutes = require('./routes/no_auth')
app.use(noAuthRoutes(Router))
// For set user current config
app.use(middlewares.setUserCurrentConfig)
const indexRoutes = require('./routes')
app.use(indexRoutes(Router))
const apiRoutes = require('./routes/api')
app.use(apiRoutes(Router))
const proxyRoutes = require('./routes/proxy')
app.use(proxyRoutes(Router))

// Serve static files
app.use(function* (next){
  try {
    const serveStatic = require('koa-serve-static')
    const staticOpts = {}
    // Open cache in production mode
    if (global.CONFIG_PROD) {
      staticOpts.maxAge = 1000 * 60 * 60 * 24 * 7 // 静态文件一周的缓存
    }
    if (this.path === '/favicon.ico') {
      this.path = global.globalConfig.oemInfo.favoriteIcon
      staticOpts.maxAge = 0
    }
    yield serveStatic(__dirname + '/static', staticOpts)
  } catch (error) {
    this.status = 404
    yield next
  }
})

logger.info(`Node env in '${config.node_env}'`)
logger.info(`Server started in '${config.running_mode}' running mode`)
logger.info(`Using proxy ${globalConstants.PROXY_TYPE}`)
// Create server
let server
if (config.protocol !== 'https') {
  // Http server
  const http = require('http')
  server = http.createServer(app.callback()).listen(config.port, config.hostname, function () {
    setTimeout(function () {
      logger.info(`${app.name}@${app.version} is listening on port ${config.port}`)
      logger.info(`Open up http://${config.hostname}:${config.port}/ in your browser`)
    }, 1500)
    // Set server timeout to 5 mins
    const serverTimeOut = 1000 * 60 * 5
    logger.info('Set server timeout to ' + serverTimeOut + ' ms')
    server.setTimeout(serverTimeOut, function (socket) {
      logger.warn('Server timeout occurs')
    })
    terminal(server, sessionStore)
  })
} else {
  // Https server
  const https = require('https')
  const prikeyfile = path.join(__root__dirname, './sslkey/privatekey.pem')
  const certfile = path.join(__root__dirname, './sslkey/certificate.pem')
  const httpsoptions = {
    key: fs.readFileSync(prikeyfile),
    cert: fs.readFileSync(certfile)
  }
  server = https.createServer(httpsoptions, app.callback()).listen(config.port, config.host, function () {
    setTimeout(function () {
      logger.info(`${app.name}@${app.version} is listening on port ${config.port}`)
      logger.info(`Open up https://${config.hostname}:${config.port}/ in your browser`)
    }, 1500)
    // Set server timeout to 5 mins
    const serverTimeOut = 1000 * 60 * 5
    logger.info('Set server timeout to ' + serverTimeOut + ' ms')
    server.setTimeout(serverTimeOut, function (socket) {
      logger.warn('Server timeout occurs')
    })
    terminal(server, sessionStore)
  })
}


// For socket server
/*const io = require('socket.io')(server)
const socketController = require('./controllers/socket')
io.on('connection', function (socket) {
  socketController(socket)
})*/

module.exports = server
