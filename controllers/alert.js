/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-03-23
 * @author mengyuan
 */
'use strict'

const apiFactory = require('../services/api_factory')
const email = require('../utils/email')
const logger = require('../utils/logger.js').getLogger('alert')
const initGlobalConfig = require('../services/init_global_config')
const co = require('co')
const _ = require('lodash')
var http = require('http');
var moment = require('moment')
exports.getRecordFilters = function* () {
  if (!this.query || this.query.cluster == undefined) {
    const err = new Error('invalid parameter')
    err.status = 400
    throw err
  }

  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const query = {
    cluster: this.query.cluster
  }
  const result = yield api.alerts.getBy(["record-filters"], query)
  this.body = result
}

exports.getRecords = function* () {
  let query = {}
  if (this.query) {
    query.cluster = this.query.cluster || ''
    query.strategyName = this.query.strategyName || ''
    query.targetType = this.query.targetType != undefined ? this.query.targetType : ''
    query.targetName = this.query.targetName
    query.status = this.query.status != undefined ? this.query.status : ''
    query.beginTime = this.query.beginTime || ''
    query.endTime = this.query.endTime || ''
    query.from = this.query.from != undefined ? this.query.from : ''
    query.size = this.query.size != undefined ? this.query.size : ''
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.getBy(["records"], query)
  this.body = result
}

exports.deleteRecords = function* () {
  let query = {
    strategyID: '',
  }
  if (this.query && this.query.strategyID) {
    query.strategyID = this.query.strategyID
  }

  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.deleteBy(["records"], query)
  this.body = result
}

exports.listNotifyGroups = function* () {
  let query = {
    name: '',
  }
  if (this.query && this.query.name) {
    query.name = this.query.name
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.getBy(["groups"], query)
  this.body = result
}

exports.createNotifyGroup = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const spi = apiFactory.getSpi(loginUser)
  
  // console.log(list,'----list---')
  // let listValue = this.request.body.listValue
  // let Value = JSON.parse(listValue)
  let listValue= this.request.body.listValue
  console.log(listValue.email.length==0)
  if(listValue.email.length==0){
    const result = yield api.alerts.createBy(["groups"], null, this.request.body.body)
    this.body = {
      result
    }
  }else{
    const list = yield spi.alerts.createBy(['invitations'], null,listValue)
    if(list.statusCode == 200){
      const result = yield api.alerts.createBy(["groups"], null, this.request.body.body)
      this.body = {
        result
      }
    }
  }


}

exports.modifyNotifyGroup = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.updateBy(["groups", this.params.groupid], null, this.request.body)
  this.body = result
}

exports.batchDeleteNotifyGroups = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.createBy(["groups", 'batch-delete'], null, this.request.body)
  this.body = result
}

exports.sendInvitation = function* () {
  const method = 'alert.sendInvitation'
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  console.log(this.request.body)
  const result = yield spi.alerts.createBy(['invitations'], null, this.request.body)
  // get email addr and code, then send out the code
  const initConfig = yield initGlobalConfig.initGlobalConfig()
  const transport = _.cloneDeep(globalConfig.mail_server)
  yield result.data.emails.map(function (item) {
    return email.sendNotifyGroupInvitationEmail(item.addr, loginUser.user, loginUser.email, item.code, transport)
  })
  this.body = {}
}
// sendPhone
exports.sendPhone = function* () {
  const method = 'alert.sendInvitation'
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  let bodyPhone = this.request.body
  const result = yield spi.alerts.createBy(['invitations'], null, this.request.body)

  let phone = result.data.emails.map((item)=>{
    console.log(1111111)
    if (item.addr.toString() == bodyPhone.email.toString() && item.status == 1) {

      // const err = new Error('此号码已将存在请更改手机号码')
      // err.status = 400
      // throw err
      global.valuelist =
      [{
        phone: item.addr, content: value, data: moment().format('YYYY-MM-DD HH:mm:ss'), code: item.code
      }]
      this.body={status:1}
    }else{
      // 发送短信
        const charactors = "aABbCDcd2EFef3GHgh45Kk6MNmn7QPpq8RSTrst9WXYZwxyz";
        var value = '', i;
        for (let j = 1; j <= 4; j++) {
          i = parseInt(48 * Math.random());
          value = value + charactors.charAt(i);
        }
        let url = '/mdwebservice.asmx/SapSendSms?username=SAP_basis&password=E10ADC3949BA59ABBE56E057F20F883E&mobile='
        var options = {
          hostname: '10.36.128.10',
          path: url + `${item.addr}` + '&content=' + `${value}` + '&ext=015',
          method: 'GET'
        };
        const _this = this
        var phonecont = http.request(options, (result) => {
          global.valuelist =
            [{
              phone: item.addr, content: value, data: moment().format('YYYY-MM-DD HH:mm:ss'), code: item.code
            }]
          result.setEncoding('utf8');
        });
  
        phonecont.on('error', function (e) {
          console.log('problem with request: ' + e.message);
        });
        phonecont.end();
        this.body = {status:0}
    }
  })
  // this.body = {}

}
// sendPhoneContent
exports.sendPhoneContent = function* () {
  const method = 'alert.sendInvitation'
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const { phone, value, myDate } = this.request.body
  // valuelist 在发手机验证码的时候存储的全局变量

  let status = yield valuelist.map((item) => {
    global.code = item.code
    console.log(code,'------code-----')
    if (item.phone == phone && item.content == value) {
      this.body = {
        statusCode: 200,
        state: true,
      }
    } else {
      this.body = {
        statusCode: 200,
        state: false,
      }
    }
  })
  if (this.body.state == true) {
    console.log(code)
    const result = yield spi.alerts.createBy(["invitations", 'join'], null, { code: code })
    this.body = {
      statusCode: 200,
      state: true,
      result: result
    }
  }

}

// global.phonecontent = 'phonecontents'
exports.acceptInvitation = function* () {
  if (!this.query || !this.query.code) {
    const err = new Error('invalid parameter')
    err.status = 400
    throw err
  }

  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const body = {
    code: this.query.code
  }
  const result = yield spi.alerts.createBy(["invitations", 'join'], null, body)
  this.body = result
}

exports.checkEmailAcceptInvitation = function* () {
  if (!this.query || !this.query.emails) {
    const err = new Error('invalid parameter')
    err.status = 400
    throw err
  }

  const query = {
    emails: this.query.emails,
  }

  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.alerts.getBy(["invitations", 'status'], query)

  this.body = result
}
// checkPhoneAcceptInvitation
exports.checkPhoneAcceptInvitation = function* () {
  if (!this.query || !this.query.phones) {
    const err = new Error('invalid parameter')
    err.status = 400
    throw err
  }

  const query = {
    emails: this.query.phones,
  }

  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.alerts.getBy(["invitations", 'status'], query)
  this.body = result
}


/*--------------alert setting--------------------*/

exports.checkExist = function* () {
  const cluster = this.params.cluster
  const strategyName = this.params.strategyName
  const query = {
    "clusterID": cluster
  }
  const user = this.session.loginUser
  const spi = apiFactory.getSpi(user)
  const result = yield spi.alerts.getBy(['strategy', strategyName, "existence"], query)
  this.body = result
}

exports.getAlertSetting = function* () {
  const cluster = this.params.cluster
  const user = this.session.loginUser
  let owner = user.user
  const body = this.query
  body.clusterID = cluster
  const teamspace = user.teamspace
  const api = apiFactory.getApi(user)
  const spi = apiFactory.getSpi(user)
  body.namespace = user.namespace
  if (teamspace) {
    body.namespace = teamspace
  }
  // if(teamspace){
  //   const teamID = this.query.teamID
  //   if(!teamID) {
  //     const err = new Error("teamID is require")
  //     err.status = 400
  //     throw err
  //   }

  //   const teamCreator = yield api.teams.getBy([teamID, 'creator'])
  //   owner = teamCreator.data.userName
  // }
  const response = yield spi.alerts.getBy(['strategy'], body)
  const setting = response.data
  const keyArr = Object.getOwnPropertyNames(setting)
  if (keyArr.length == 0) {
    this.body = {
      data: {}
    }
    return
  }
  // const rules = setting[keyArr[0]]
  const specs = []
  let strategyID
  let result = []
  if (!keyArr) {
    this.body = {
      data: {}
    }
    return
  }
  setting.map(rule => {
    let condition = rule.Annotations.condition
    let operation = '', type_condition = ''
    if (condition.indexOf(">") > 0) {
      type_condition = condition.split('>')
      operation = '>'
    } else {
      type_condition = condition.split('<')
      operation = '<'
    }
    let item = {
      type: type_condition[0].replace(/\s/ig, ''),
      operation: operation,
      threshold: type_condition[1].replace(/\s/ig, ''),
      createTime: rule.Annotations.createTime,
      recordCount: 0,
      name: rule.Alert,
      key: rule.Alert
    }
    switchType(item)
    result.push(item)
    strategyID = rule.Labels.tenxStrategyID
    specs.push({
      triggerRule: rule.Annotations.condition,
      ruleName: rule.Alert
    })
  })
  let recordCount = yield api.alerts.createBy(['record', 'count'], null, {
    strategyID: strategyID,
    specs
  })
  recordCount = recordCount.data
  result.forEach(item => {
    item.recordCount = recordCount[item.name] || 0
  })
  this.body = {
    data: result
  }
}

exports.addAlertSetting = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  const user = this.session.loginUser
  body.user = user.user
  if (body.namespace == 'default') {
    body.namespace = user.namespace
  }
  body.clusterID = cluster
  const spi = apiFactory.getSpi(user)
  const response = yield spi.alerts.createBy(['strategy'], null, body)
  this.body = response
}

exports.getSettingList = function* () {
  const cluster = this.params.cluster
  const queryBody = this.query || {}
  queryBody.clusterID = cluster
  const user = this.session.loginUser
  queryBody.namespace = user.namespace
  if (user.teamspace) {
    queryBody.namespace = user.teamspace
  }
  const spi = apiFactory.getSpi(this.session.loginUser)
  if (queryBody.search) {
    const cluster = this.params.cluster
    if (!queryBody.strategyName) {
      const err = new Error('strategyName is require')
      err.status = 400
      throw err
    }
    const response = yield spi.alerts.getBy(['strategy', 'search'], queryBody)
    this.body = response
    return
  }
  const response = yield spi.alerts.getBy(['strategy', 'list'], queryBody)
  this.body = response
}

exports.getSettingListfromserviceorapp = function* () {
  const spi = apiFactory.getSpi(this.session.loginUser)
  const queryBody = this.query
  const body = yield spi.alerts.getBy(['group-strategies'], queryBody)
  this.body = body
}

exports.deleteSetting = function* () {
  const cluster = this.params.cluster
  const strategyID = this.query.strategyID
  if (!strategyID) {
    const err = new Error('strategyID is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  const spi = apiFactory.getSpi(user)
  const response = yield spi.alerts.deleteBy(['strategy'], {
    clusterID: cluster,
    strategyIDs: strategyID,
    namespace: user.teamspace || user.namespace
  })
  this.body = response
}


exports.updateEnable = function* () {
  const body = this.request.body
  if (!body.strategies) {
    const err = new Error('strategies is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  body.user = user.namespace
  // if (user.teamspace) {
  //   body.user = user.teamspace
  // }
  const spi = apiFactory.getSpi(user)
  const response = yield spi.alerts.createBy(['strategy', 'toggle_enable'], null, body)
  this.body = response
}

exports.updateSendEmail = function* () {
  const body = this.request.body
  if (!body.strategies) {
    const err = new Error('strategies is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  body.user = user.namespace
  if (user.teamspace) {
    body.user = user.teamspace
  }
  const spi = apiFactory.getSpi(user)
  const response = yield spi.alerts.createBy(['strategy', 'toggle_send_email'], null, body)
  this.body = response
}

exports.setIgnore = function* () {
  const body = this.request.body
  if (!body.strategies) {
    const err = new Error('strategies is require')
    err.status = 200
    throw err
  }
  const user = this.session.loginUser
  body.user = user.namespace
  if (user.teamspace) {
    body.user = user.teamspace
  }
  const spi = apiFactory.getSpi(user)
  const response = yield spi.alerts.createBy(['strategy', 'ingore'], null, body)
  this.body = response
}


// host cpu and memory used
exports.getTargetInstant = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  //node or pod
  const type = this.params.type
  const name = this.query.name
  const strategyName = this.params.name
  if (!name) {
    const err = new Error('name is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi(loginUser)
  const reqArray = []
  let cpu = {
    targetType: type,
    type: 'cpu/usage_rate',
    source: 'prometheus'
  }
  let mem = {
    targetType: type,
    type: 'memory/usage',
    source: 'prometheus'
  }
  let tx_rage = {
    targetType: type,
    type: 'network/tx_rate',
    source: 'prometheus'
  }
  let rx_rate = {
    targetType: type,
    type: 'network/rx_rate',
    source: 'prometheus'
  }

  reqArray.push(api.getBy([cluster, name, 'metric/instant'], cpu))
  reqArray.push(api.getBy([cluster, name, 'metric/instant'], mem))
  reqArray.push(api.getBy([cluster, name, 'metric/instant'], tx_rage))
  reqArray.push(api.getBy([cluster, name, 'metric/instant'], rx_rate))
  const results = yield reqArray
  let totalMemoryByte = 0
  console.log(type,'-----type-----')
  console.log('cpu',results[0],'mem',results[1],'tx_rage',results[2],'rx_rate',results[3])
  if (type == 'node') {
    console.log(1111111111)
    const clusterSummary = yield api.getBy([cluster, 'nodes', name])
    if (clusterSummary.data.objectMeta) {
      totalMemoryByte = clusterSummary.data.memory_total_kb * 1024
    } else {
      const err = new Error('the node is not exist')
      err.status = 400
      throw err
    }
  }
  if (type == 'service') {
    console.log(22222222222)
    const podSummary = yield api.getBy([cluster, 'services', name])
    if (podSummary.data[name]) {
      const deployment = podSummary.data[name].deployment
      const replicas = deployment.spec.replicas
      console.log(replicas,'----replicas----',deployment.spec)
      const containers = deployment.spec.template.spec.containers

      containers.forEach(container => {
        let memory = container.resources.requests.memory

        memory = memory.toLowerCase()
        if (memory.indexOf('gi') > 0) {
          memory = parseInt(memory) * 1024 * 1024 * 1024
        } else if (memory.indexOf('mi') > 0) {
          memory = parseInt(memory) * 1024 * 1024
        } else if (memory.indexOf('ki') > 0) {
          memory = parseInt(memory) * 1024
        }
        console.log(memory)
        totalMemoryByte += memory
      })
      totalMemoryByte = replicas * totalMemoryByte
    } else {
      const err = new Error('the pod is not exist')
      err.status = 400
      throw err
    }
  }
  // console.log(results[0],'results[0]',results[1],'results[1]',results[2],'results[2]',results[3],'results[3]')
  const memory = [
    results[1].data[name],
    totalMemoryByte,
    parseFloat(results[1].data[name] / totalMemoryByte).toFixed(4)
  ]

  this.body = {
    [strategyName]: {
      cpus: results[0].data[name],
      memory: memory,
      tx_rate: results[2].data[name],
      rx_rate: results[3].data[name]
    }
  }
}

exports.deleteRule = function* () {
  const cluster = this.params.cluster
  const queryBody = this.query
  if (!queryBody.ruleNames || !queryBody.strategyID) {
    const err = new Error('ruleNames, strategyID is require')
    err.status = 400
    throw err
  }
  queryBody.clusterID = cluster
  const user = this.session.loginUser
  queryBody.namespace = user.namespace
  if (user.teamspace) {
    queryBody.namespace = user.teamspace
  }
  queryBody.updater = user.user
  const spi = apiFactory.getSpi(user)
  const response = yield spi.alerts.deleteBy(['rule'], queryBody)
  this.body = response
}

exports.searchSetting = function* () {
  const cluster = this.params.cluster
  const queryBody = this.query
  if (!queryBody.strategyName) {
    const err = new Error('strategyName is require')
    err.status = 400
    throw err
  }
  queryBody.clusterID = cluster
  const user = this.session.loginUser
  queryBody.namespace = user.namespace
  if (user.teamspace) {
    queryBody.namespace = user.teamspace
  }
  const spi = apiFactory.getSpi(user)
  const response = yield spi.alerts.deleteBy(['strategy', 'search'], queryBody)
  this.body = response
}


function switchType(item) {
  switch (item.type) {
    case 'cpu/usage_rate':
      item.type = 'CPU'
      return
    case 'memory/usage':
      item.type = '内存'
      return
    case 'network/tx_rate':
      item.type = '上传流量'
      return
    case 'network/rx_rate':
      item.type = '下载流量'
      return
    default:
      return
  }
}
