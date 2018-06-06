'use strict'

const https = require('https')
const os = require('os')
const urllib = require('urllib')
const config = require('../configs')
config.tenx_api = global.globalConfig.tenx_api
const queryString = require('querystring')

//var wsUrl = "wss://kubelet:kubelet@" + data['host'] + ":" + data['port'] + "/api/v1/namespaces/" + data['namespace'] + "/pods/" + data['pod'] + "/exec?stdout=1&stdin=1&stderr=1&tty=1&command=%2Fbin%2Fsh&command=-i";
module.exports = function (server, redis) {
  server.on('upgrade', (req, client, head) => {
    if (!/\/api\/v1\/cluster\/.+\/namespaces\/.+\/pods\/.+\/exec/.test(req.url)) return
    //const redisClient = redis.client
    const path = req.url.split('/')
    const cluster = path[4]
    const namespace = path[6]
    const podName = path[8]
    const containers = path[10]
    const headers = _getProxyHeader(req.headers)
    headers.rejectUnauthorized = false
    const apiPath = `/spi/v2/clusters/${cluster}/access`
    urllib.request(config.tenx_api.protocol + '://' + config.tenx_api.host + apiPath, {
      headers: {
        [config.tenxSysSign.key]: config.tenxSysSign.value
      }
    }).then(result => {
      let clusterInfo = JSON.parse(result.data.toString())
      if(!clusterInfo.data) {
        client.write('conect error')
        return
      }
      clusterInfo = clusterInfo.data
      headers.headers.Authorization = `bearer ${clusterInfo.apiToken}`
      let host = clusterInfo.apiHost.split(':')
      let port = host[1]
      host = host[0]
      headers.hostname = host
      headers.port = port
      headers.cert = clusterInfo.cert?clusterInfo.cert:''
      headers.key = clusterInfo.key?clusterInfo.key:''
      const apiVersion = clusterInfo.apiVersion
      headers.path = `/api/${apiVersion}/namespaces/${namespace}/pods/${podName}/exec?container=${containers}&stdout=1&stdin=1&stderr=1&tty=1&command=%2Fbin%2Fsh&command=-c&command=${queryString.escape('if [ -x "/bin/bash" ]; then /bin/bash;else /bin/sh;fi')}`
      const proxy = https.request(headers, res => {
        let data = ''
        res.on('data', d=> {
          data += d.toString() 
        })
        res.on('end', (edn)=> {
        })
      })
      proxy.on('upgrade', (res, socket, head) => {
        client.write(_formatProxyResponse(res))
        client.pipe(socket)
        socket.pipe(client)
      })
      proxy.on('error', (error) => {
        client.write("Sorry, cant't connect to this container ")
        return
      })
      proxy.end()
    }).catch(err => {
      client.write('conect error')
    })
    function _getProxyHeader(headers) {
      const keys = Object.getOwnPropertyNames(headers)
      const proxyHeader = { headers: {} }
      keys.forEach(key => {
        if (key.indexOf('sec') >= 0 || key === 'upgrade' || key === 'connection') {
          proxyHeader.headers[key] = headers[key]
          return
        }
        proxyHeader[key] = headers[key]
      })
      return proxyHeader
    }
    function _formatProxyResponse(res) {
      const headers = res.headers
      const keys = Object.getOwnPropertyNames(headers)
      const sys = os.type()
      let switchLine = '\n'
      // if (sys.toLowerCase().indexOf('windows') >= 0) {
      //   switchLine = '\r\n';
      // }
      let response = [`HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}${switchLine}`]
      keys.forEach(key => {
        response.push(`${key}: ${headers[key]}${switchLine}`)
      })
      response.push(switchLine)
      return response.join('')
    }
  })
}
