/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: select image
 *
 * v0.1 - 2017-05-03
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Card, Row, Col, Steps, Button, Modal, Icon, Tooltip, Spin } from 'antd'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import classNames from 'classnames'
import yaml from 'js-yaml'
import SelectImage from './SelectImage'
import ConfigureService from './ConfigureService'
import ResourceQuotaModal from '../../ResourceQuotaModal'
import NotificationHandler from '../../../common/notification_handler'
import { genRandomString, toQuerystring, getResourceByMemory, parseAmount } from '../../../common/tools'
import { createConfigGroup,createConfigFiles,CreateDbCluster,erroDeleteConfig } from '../../../actions/configs'
import { removeFormFields, removeAllFormFields } from '../../../actions/quick_create_app'
import { searchAppStore,loadAppStore,loadStackDetail } from  '../../../actions/app_center'
import { createApp } from '../../../actions/app_manage'
import { addService } from '../../../actions/services'
import { buildJson, getFieldsValues } from './utils'
import { buildJson2, getFieldsValues2 } from './utils.1'
import './style/index.less'

const Step = Steps.Step
const SERVICE_CONFIG_HASH = '#configure-service'
const SERVICE_EDIT_HASH = '#edit-service'
const SERVICE_APP_HASH = '#app-service'
const standard = require('../../../../configs/constants').STANDARD_MODE
const mode = require('../../../../configs/model').mode
const standardFlag = standard === mode
const notification = new NotificationHandler()
let serviceNameList = []

class QuickCreateApp extends Component {
  constructor(props) {
    super()
    this.getStepsCurrent = this.getStepsCurrent.bind(this)
    this.renderBody = this.renderBody.bind(this)
    this.onSelectImage = this.onSelectImage.bind(this)
    this.renderFooterSteps = this.renderFooterSteps.bind(this)
    this.goSelectCreateAppMode = this.goSelectCreateAppMode.bind(this)
    this.saveService = this.saveService.bind(this)
    this.editService = this.editService.bind(this)
    this.setConfig = this.setConfig.bind(this)
    this.genConfigureServiceKey = this.genConfigureServiceKey.bind(this)
    this.getAppResources = this.getAppResources.bind(this)
    this.createAppOrAddService = this.createAppOrAddService.bind(this)
    this.onCreateAppOrAddServiceClick = this.onCreateAppOrAddServiceClick.bind(this)
    this.goSelectImage = this.goSelectImage.bind(this)
    this.renderServiceList = this.renderServiceList.bind(this)
    this.confirmSave = this.confirmSave.bind(this)
    this.cancelSave = this.cancelSave.bind(this)
    const { location, fields } = props
    const { query } = location
    const { imageName, registryServer, appName, action } = query
    let appNameInit = this.getAppName(fields)
    if (appName && action) {
      appNameInit = appName
      this.action = action
    }
    this.state = {
      imageName,
      registryServer,
      serviceList: [],
      confirmGoBackModalVisible: false,
      confirmSaveModalVisible: false,
      appName: appNameInit,
      isCreatingApp: false,
      resourceQuotaModal: false,
      resourceQuota: null,
      stepStatus: 'process',
      formErrors: null,
      editServiceLoading: false,
      AdvancedSettingKey: null,
      submitBtn:false
    }
    this.serviceSum = 0
    this.configureServiceKey = this.genConfigureServiceKey()
  }

  getAppName(fields) {
    let appName
    // get app name from fields
    if (fields) {
      for (let key in fields) {
        if (fields.hasOwnProperty(key)) {
          const currentFields = fields[key]
          if (currentFields.appName && currentFields.appName.value) {
            appName = currentFields.appName.value
          }
        }
      }
    }
    return appName
  }

  genConfigureServiceKey() {
    this.serviceSum++
    return `${this.serviceSum}-${genRandomString('0123456789')}`
  }

  componentWillMount() {
    this.setConfig(this.props)
    const { location, fields } = this.props
    const { hash, query } = location
    const { imageName, registryServer, key } = query
    if ((hash === SERVICE_CONFIG_HASH && !imageName) || hash === SERVICE_EDIT_HASH) {
      browserHistory.replace('/app_manage/app_create/quick_create')
    } else if (hash !== SERVICE_CONFIG_HASH && imageName && registryServer) {      
      browserHistory.replace(`/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_CONFIG_HASH}`)
    }
  }

  componentWillUnmount() {
    this.removeAllFormFieldsAsync(this.props)
  }

  removeAllFormFieldsAsync(props) {
    // 异步清除 fields，即等 QuickCreateApp 组件卸载后再清除，否者会出错
    const { removeAllFormFields } = props
    setTimeout(removeAllFormFields)
  }

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps
    const { hash, query } = location
    if (hash !== this.props.location.hash || query.key !== this.props.location.query.key) {
      this.setConfig(nextProps)
    }
  }
  setConfig(props) {
    const { location } = props
    const { hash, query } = location
    const { key,templateid } = query
    const { loadStackDetail,stackDetail } = this.props;
    const configureMode = hash === SERVICE_EDIT_HASH ? 'edit' : 'create'
    // loadStackDetail(templateid)
    this.configureMode = configureMode
    if(stackDetail.appDetail.name==''&&templateid){
      browserHistory.push('/app_manage/app_create/app_store')
    }
    if (configureMode === 'edit') {
      this.editServiceKey = key
    }else{
      
    }
  }

  getStepsCurrent() {
    const { hash,query } = this.props.location
    
    if (hash === SERVICE_CONFIG_HASH || hash === SERVICE_EDIT_HASH || query.templateid) {
      return 2
    }
    return 1
  }

  onSelectImage(imageName, registryServer, appName, fromDetail) {
    this.setState({
      imageName,
      registryServer,
    })
    if (fromDetail) {
      browserHistory.push(`/app_manage/app_create/quick_create${SERVICE_CONFIG_HASH}?appName=${appName}&fromDetail=${fromDetail}`)
      return;
    }
    browserHistory.push(`/app_manage/app_create/quick_create${SERVICE_CONFIG_HASH}`)
  }

  goSelectCreateAppMode() {
    const { query } = this.props.location;
    if (serviceNameList.length < 1) {
      if (query.fromDetail) {
        browserHistory.push(`/app_manage/detail/${query.appName}`)
        return
      }
      browserHistory.push('/app_manage/app_create')
      return
    }
    this.setState({
      confirmGoBackModalVisible: true
    })
  }

  confirmGoBack() {
    this.removeAllFormFieldsAsync(this.props)
    browserHistory.push('/app_manage/app_create')
  }

  confirmSave() {
    if (this.state.formErrors) {
      notification.warn('请修改错误表单后，点击 [保存此服务并继续添加] 保存服务')
    }
    this.setState({
      confirmSaveModalVisible: false,
      formErrors: null,
    })
    this.saveService()
  }

  cancelSave() {
    this.setState({
      confirmSaveModalVisible: false,
    })
    const { removeFormFields } = this.props
    setTimeout(() => {
      removeFormFields(this.configureServiceKey)
    })
    browserHistory.push('/app_manage/app_create/quick_create')
  }

  goSelectImage() {
    if (this.configureMode === 'edit') {
      return
    }
    this.setState({
      stepStatus: 'process',
    })
    const { removeFormFields,location } = this.props
    const { validateFieldsAndScroll } = this.form
    const { hash, query } = location
    const { templateid } = query
    if(templateid){
      browserHistory.push('/app_manage/app_create/app_store')
    }else{
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        // 如果未填写服务名称，直接移除 store 中的表单记录
        if (errors.serviceName) {
          setTimeout(() => {
            removeFormFields(this.configureServiceKey)
          })
          
          browserHistory.push('/app_manage/app_create/quick_create')
          
          return
        }
        // 如果已填写服务名称，保存 errors 到 state 中
        this.setState({
          formErrors: errors,
        })
      }
      // 提示用户是否保留该服务
      this.setState({
        confirmSaveModalVisible: true,
      })
    })
  }
  }

  saveService(options) {
    const { fields } = this.props
    const { validateFieldsAndScroll } = this.form
    const { noJumpPage } = options || {}
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        return
      }
      const fieldsKeys = Object.keys(fields) || []
      if (fieldsKeys.length === 1) {
        this.setState({
          appName: values.appName
        })
      }
      // if create service, update the configure service key
      if (this.configureMode === 'create') {
        this.configureServiceKey = this.genConfigureServiceKey()
      }
      if (!noJumpPage) {
        browserHistory.push('/app_manage/app_create/quick_create')
      }
    })
  }

  createAppOrAddService() {
    // this.props.fields.volume0["isOld"] = "true"
    const { location,detail,stackDetail } = this.props
    const { hash, query } = location
    const { templateid } = query
    const {name,configName,image,imageVersion,mountPath,content} = stackDetail.appDetail
    const {
      fields, current, loginUser,
      createApp, addService,createConfigGroup,createConfigFiles,CreateDbCluster,erroDeleteConfig
    } = this.props;
    this.setState({
      submitBtn:true
    })
    const sliceContent = content?content.split('\n'):'';
    const { clusterID } = current.cluster
    const template = []
    for (let key in fields) {
      for(let vall in fields[key]){
        if(vall.indexOf('$config')!=-1){
          sliceContent.map((val,index)=>{
            const keys = vall.split('$')[0]
            if(val.indexOf('@')!=-1&&val.indexOf(keys)!=-1){
              sliceContent[index] = keys+' '+fields[key][vall].value +' #'+val
            }
          })
        } 
      }

      if (fields.hasOwnProperty(key)) {
        if(templateid){
          const json = buildJson2(fields[key], current.cluster, loginUser, this.imageConfigs,current,stackDetail)
          template.push(yaml.dump(json.service))
          template.push(yaml.dump(json.service1))
          template.push(yaml.dump(json.deployment))
        }else{
          const json = buildJson(fields[key], current.cluster, loginUser, this.imageConfigs)
          template.push(yaml.dump(json.deployment))
          template.push(yaml.dump(json.service))
        }
      }
      
    }
    const callback = {
      success: {
        func: res => {
          this.setState({
            stepStatus: 'finish',
            submitBtn:false
          })
          let redirectUrl
          if (this.action === 'addService') {
            redirectUrl = `/app_manage/detail/${this.state.appName}`
          } else {
            redirectUrl = '/app_manage'
          }
          browserHistory.push(redirectUrl)
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          this.setState({
            stepStatus: 'error',
            submitBtn:false
          })
          let msgObj
          if (this.action === 'addService') {
            msgObj = '添加服务'
          } else {
            msgObj = '创建应用'
          }
          if(templateid){
            // 删除配置组
            const { getFieldValue } = this.form
            const serviceName = getFieldValue('serviceName')
            const objbody = {
              cluster: clusterID,
              'groups':[]
            }
            objbody.groups.push(serviceName)
            setTimeout(function(){
              erroDeleteConfig(objbody,{})
            },1000)
          }
          if (err.statusCode == 403) {
            const { data } = err.message
            const { require, capacity, used } = data
            let resourceQuota = {
              selectResource: {
                cpu: formatCpuFromMToC(require.cpu),
                memory: formatMemoryFromKbToG(require.memory),
              },
              usedResource: {
                cpu: formatCpuFromMToC(used.cpu),
                memory: formatMemoryFromKbToG(used.memory),
              },
              totalResource: {
                cpu: formatCpuFromMToC(capacity.cpu),
                memory: formatMemoryFromKbToG(capacity.memory),
              },
            }
            this.setState({
              resourceQuotaModal: true,
              resourceQuota,
            })
            function formatCpuFromMToC(cpu) {
              return Math.ceil(cpu / 1000 * 10) / 10
            }
            function formatMemoryFromKbToG(memory) {
              return Math.ceil(memory / 1024 / 1024 * 10) / 10
            }
            notification.error(`${msgObj}失败`, '集群资源不足')
            return
          }
          if (err.statusCode == 409) {
            if (err.message.message.indexOf('ip_port') > 0) {
              notification.error(`${msgObj}失败`, '端口冲突，请检查服务端口')
              return
            }
          }
          if (err.statusCode == 402) {
            return
          }
          const { message } = err
          notification.error(`${msgObj}失败`, message.message)
        }
      },
      finally: {
        func: () => {
          this.setState({
            isCreatingApp: false,
          })
        }
      },
    }
    if (this.action === 'addService') {
      const body = {
        template: template.join('---\n'),
      }
      addService(clusterID, this.state.appName, body, callback)
      return
    }
    const appConfig = {
      cluster: clusterID,
      template: template.join('---\n'),
      appName: this.getAppName(fields),
    }
    // return false;
    // 创建配置组
    if(templateid){
      const { getFieldValue } = this.form
      const serviceName = getFieldValue('serviceName')
      const groupData = {
        'cluster': clusterID,
        'groupName':serviceName,
      }
    // return false;
      const configData = {
        cluster: clusterID,
        group:serviceName,//serviceName  +'-'+(configName.indexOf('.')=='-1'?configName:configName.split('.')[0])
        name:configName,//configName
        desc:sliceContent.join('\n'),
        serviceName:serviceName
      }
      for (let key in fields) {
        if(fields[key].replicas){
          configData['replicas'] = String(fields[key].replicas.value)
        }
      }
      createConfigGroup(groupData,{
        success: {
          func: res => {
            setTimeout(function(){
              createConfigFiles(configData,{
                success: {
                  func: res => {
                    setTimeout(function(){
                      CreateDbCluster(appConfig, callback)
                    })
                  }
                },
                failed: {
                  func: err => {
                    if(templateid){
                      // 删除配置组
                      const { getFieldValue } = this.form
                      const serviceName = getFieldValue('serviceName')
                      const objbody = {
                        cluster: clusterID,
                        'groups':[]
                      }
                      objbody.groups.push(serviceName)
                      this.setState({
                        submitBtn:false
                      })
                      setTimeout(function(){
                        erroDeleteConfig(objbody,{})
                      },1000)
                    }
                  }
                }
              })
            })
          }
        },failed: {
          func: err => {
            if(templateid){
              // 删除配置组
              const { getFieldValue } = this.form
              const serviceName = getFieldValue('serviceName')
              const objbody = {
                cluster: clusterID,
                'groups':[]
              }
              objbody.groups.push(serviceName)
              this.setState({
                submitBtn:false
              })
              setTimeout(function(){
                erroDeleteConfig(objbody,{})
              },1000)
            }
          }
        }
      });
   }else{
    createApp(appConfig, callback)
  }
  }

  onCreateAppOrAddServiceClick(isValidateFields) {
    if (!isValidateFields) {
      return this.createAppOrAddService()
    }
    
    const { validateFieldsAndScroll } = this.form
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        return
      }
      var o = values;
      var key = Object(o);
      var keys = Object.keys(o)
      var values = Object.values(o);
      const listArr = keys.filter(value => {
        if (value.indexOf('portPro') != -1 && o[value].indexOf('HTTP') != -1) {
          if (value.length != 0) {
            return value
          }
        }
      })
      if (listArr.length > 1) {
          notification.warn('相同服务不能同时暴露两个HTTP协议')
          this.setState({
            submitBtn:false
          })
        return false;
      } 
      // var a = values ;
      // var ports = [];
      // for(var key in a ){
      //   if(/^prot\d/ig.test(key))ports.push(a[key])
      // }
      // var arr = [];
      // for(var i = 0;i<=ports.length-1;i++){
      //   arr.push({
      //     ports:ports[i]
      //   })
      // }
      this.createAppOrAddService()
    })
  }

  renderBody() {
    const { location,detail,stackDetail } = this.props
    const { hash, query } = location
    const { key, addWrap,templateid} = query
    const {imageName,registryServer,appName,editServiceLoading, AdvancedSettingKey } = this.state

    // AdvancedSettingKey 环境变量  imageName 镜像名称
    if(templateid){
        const {name,image,imageVersion,mountPath,content} = stackDetail.appDetail
        const imageName = image?image.slice(image.indexOf('/')+1):''
        const registryServer = image?image.slice(0,image.indexOf('/')):''
        const id = this.configureMode === 'create' ? this.configureServiceKey : this.editServiceKey
        if (editServiceLoading) {
          return <div className="loadingBox"><Spin size="large" /></div>
        }
        return ( // 第一部分输入框
          <ConfigureService
            mode={this.configureMode}
            id={id}
            stackDetail={stackDetail}
            templateid={templateid?templateid:''}
            action={this.action}
            callback={(form, configs) => {
              this.form = form
              this.imageConfigs = configs
            }}
            {...{ imageName, registryServer, appName,'tag':imageVersion,'mountPaths':mountPath,content }}
            {...this.props}
            AdvancedSettingKey={AdvancedSettingKey}
          />
        )
    }else{
      if ((hash === SERVICE_CONFIG_HASH && imageName) || (hash === SERVICE_EDIT_HASH && key)) {
        const id = this.configureMode === 'create' ? this.configureServiceKey : this.editServiceKey
        if (editServiceLoading) {
          return <div className="loadingBox"><Spin size="large" /></div>
        }
        return ( // 第一部分输入框
          <ConfigureService
            mode={this.configureMode}
            id={id}
            templateid={templateid?templateid:''}
            action={this.action}
            callback={(form, configs) => {
              this.form = form
              this.imageConfigs = configs
            }
            }
            {...{ imageName, registryServer, appName }}
            {...this.props}
            AdvancedSettingKey={AdvancedSettingKey}
          />
        )
      }
      return <SelectImage location={location} onChange={this.onSelectImage} /> // 选择镜像
    }
  }

  renderCreateBtnText() {
    if (this.action === 'addService') {
      return '完成添加服务'
    }
    return <span>&nbsp;创建&nbsp;</span>
  }

  renderFooterSteps() {
    const { location } = this.props
    const { hash,query } = location
    if (hash === SERVICE_CONFIG_HASH || hash === SERVICE_EDIT_HASH || query.templateid) {
      return (
        <div className="footerSteps">
          <div className="configureSteps">
            {query.templateid?'':
            <div className="left">
              <Button type="primary" size="large" onClick={this.saveService}>
                保存此服务并继续添加
              </Button>
            </div>
            }
            <div className="right">
              <Button
                size="large"
                onClick={this.goSelectImage}
                disabled={this.configureMode === 'edit'}
              >
                上一步
              </Button>
              
              {!this.state.submitBtn ?
                  <Button size="large" type="primary" onClick={this.onCreateAppOrAddServiceClick}>
                    {this.renderCreateBtnText()}
                  </Button>
                  :
                  <Button size="large" type="primary" loading={true}>
                    {this.renderCreateBtnText()}
                  </Button>
                }
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="footerSteps">
        <Button
          size="large"
          onClick={this.goSelectCreateAppMode}
        >
          上一步
        </Button>
      </div>
    )
  }

  editService(key) {
    const { location } = this.props
    const { hash } = location
    const query = { key }
    const url = `/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_EDIT_HASH}`
    const currentStep = this.getStepsCurrent()
    // 在选择镜像界面
    if (currentStep === 1) {
      browserHistory.push(url)
      return
    }
    // 在配置服务界面
    if (currentStep === 2) {
      const { validateFieldsAndScroll } = this.form
      validateFieldsAndScroll((errors, values) => {
        if (!!errors) {
          let message = '请先修改错误的表单'
          // 如果未填写服务名称，提示填写服务名称
          if (errors.serviceName) {
            message = '请先填写服务名称'
          }
          notification.warn(message)
          return
        }
        this.setState({ editServiceLoading: true }, () => {
          this.saveService({ noJumpPage: true })
          browserHistory.push(url)
          this.setState({
            editServiceLoading: false,
          })
        })
      })
      // const { removeFormFields } = this.props
      // setTimeout(() => {
      //   removeFormFields(this.configureServiceKey)
      // })
    }
  }

  deleteService(key) {
    const { removeFormFields } = this.props
    if (this.configureMode === 'edit' && this.editServiceKey === key) {
      notification.warn('删除失败，请您先取消编辑')
      return
    }
    removeFormFields(key, {
      success: {
        func: () => {
          //
        }
      }
    })
  }

  renderServiceList() {
    const { fields, location } = this.props
    const { hash, query } = location
    const { templateid } = query
    const serviceList = []
    const currentStep = this.getStepsCurrent()
    const _serviceNameList = []
    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        const service = fields[key]
        const { serviceName } = service
        if (serviceName && serviceName.value) {
          let isRowActive = false
          // 排除“选择镜像”页面
          if (location.hash) {
            if (this.configureMode === 'create') {
              isRowActive = this.configureServiceKey === key
            } else if (this.configureMode === 'edit') {
              isRowActive = this.editServiceKey === key
            }
          }
          const rowClass = classNames({
            'serviceItem': true,
            'active': templateid?true:isRowActive,
          })
          _serviceNameList.push(serviceName.value)
          serviceList.push(
            <Row className={rowClass} key={serviceName.value}>
              <Col span={12} className="textoverflow">
                {serviceName.value}
              </Col>
              <Col span={12} className="btns">
                {templateid?'':
                  (currentStep === 1 || !isRowActive) && (
                    <div>
                      <Tooltip title="修改">
                        <Button
                          type="dashed"
                          size="small"
                          onClick={this.editService.bind(this, key)}
                        >
                          <Icon type="edit" />
                        </Button>
                      </Tooltip>
                      <Tooltip title="删除">
                        <Button
                          type="dashed"
                          size="small"
                          onClick={this.deleteService.bind(this, key)}
                        >
                          <Icon type="delete" />
                        </Button>
                      </Tooltip>
                    </div>
                  )
                }
              </Col>
            </Row>
          )
        }
      }
    }
    serviceNameList = _serviceNameList
    if (serviceList.length < 1) {
      return (
        <div className="noService">本应用中暂无任何服务</div>
      )
    }
    return serviceList
  }

  getAppResources() {
    const { current } = this.props
    const fields = this.props.fields || {}
    let cpuTotal = 0 // unit: C
    let memoryTotal = 0 // unit: G
    let priceHour = 0 // unit: T/￥
    for (let key in fields) {
      if (fields.hasOwnProperty(key) && fields[key].serviceName) {
        const { resourceType, DIYMemory, DIYCPU, replicas } = getFieldsValues(fields[key])
        const { memoryShow, cpuShow, config } = getResourceByMemory(resourceType, DIYMemory, DIYCPU)
        cpuTotal += cpuShow
        memoryTotal += memoryShow
        let price = current.cluster.resourcePrice[config]
        if (price) {
          priceHour += price * replicas
        } else {
          // @Todo: need diy resource price
        }
      }
    }
    cpuTotal = Math.ceil(cpuTotal * 100) / 100
    memoryTotal = Math.ceil(memoryTotal * 100) / 100
    const priceMonth = parseAmount(priceHour * 24 * 30, 4).amount
    priceHour = parseAmount(priceHour, 4).amount
    return {
      resource: `${cpuTotal}C ${memoryTotal}G`,
      priceHour,
      priceMonth,
    }
  }

  render() {
    const { current, location } = this.props
    const { hash, query } = location
    const { templateid } = query
    const {
      confirmGoBackModalVisible, confirmSaveModalVisible, isCreatingApp,
      stepStatus,
    } = this.state
    const steps = (
      <Steps size="small" className="steps" status={stepStatus} current={this.getStepsCurrent()}>
        <Step title="部署方式" />
        {templateid?<Step title="选择应用" />:<Step title="选择镜像" />}
        <Step title="配置服务" />
      </Steps>
    )
    const { resource, priceHour, priceMonth } = this.getAppResources()
    const quickCreateAppClass = classNames({
      'ant-spin-nested-loading': isCreatingApp,
    })
    const quickCreateAppContentClass = classNames({
      'ant-spin-container': isCreatingApp,
    })
    const serviceList = this.renderServiceList()
    const currentStep = this.getStepsCurrent()
    return (
      <div id="quickCreateApp" className={quickCreateAppClass}>
        {
          isCreatingApp && <Spin />
        }
        <div className={quickCreateAppContentClass}>
          <Row gutter={16}>
            <Col span={18}>
              <Card className="leftCard" title={steps}>
                {this.renderBody()}
                {this.renderFooterSteps()}
              </Card>
            </Col>
            <Col span={6}>
              <Card
                className="rightCard"
                title={
                  <Row className="title">
                    <Col span={16}>已添加服务</Col>
                    <Col span={8} className="textAlignRight">操作</Col>
                  </Row>
                }
              >
                <div className="serviceList">
                  {serviceList}
                </div>
                <div className="resourcePrice">
                  <div className="resource">
                    计算资源：
                    <span>{resource}</span>
                  </div>
                  {
                    current.unit === '¥'
                      ? (
                        <div className="price">
                          合计：
                        <span className="hourPrice"><font>¥</font> {priceHour}/小时</span>
                          <span className="monthPrice">（合 <font>¥</font> {priceMonth}/月）</span>
                        </div>
                      )
                      : (
                        <div className="price">
                          合计：
                        <span className="hourPrice">{priceHour} {current.unit}/小时</span>
                          <span className="monthPrice">（合 {priceMonth} {current.unit}/月）</span>
                        </div>
                      )
                  }
                </div>
                {
                  (serviceList.length > 0 && currentStep === 1) && (
                    <div className="createApp">
                      <Button type="primary" size="large" onClick={this.onCreateAppOrAddServiceClick.bind(this, false)}>
                        {this.renderCreateBtnText()}
                      </Button>
                    </div>
                  )
                }
              </Card>
            </Col>
          </Row>
          <Modal
            title="返回上一步"
            visible={confirmGoBackModalVisible}
            onCancel={() => this.setState({ confirmGoBackModalVisible: false })}
            onOk={this.confirmGoBack.bind(this)}
          >
            是否确定返回“上一步”？确定后已添加的服务 {serviceNameList.join(', ')} 将不被保留
          </Modal>
          <Modal
            title="返回上一步"
            visible={confirmSaveModalVisible}
            onCancel={() => this.setState({ confirmSaveModalVisible: false })}
            onOk={this.confirmSave}
            footer={[
              <Button key="back" type="ghost" size="large" onClick={this.cancelSave}>取 消</Button>,
              <Button key="submit" type="primary" size="large" onClick={this.confirmSave}>
                确 定
              </Button>,
            ]}
          >
            是否确定保存该服务？
          </Modal>

          <ResourceQuotaModal
            visible={this.state.resourceQuotaModal}
            closeModal={() => this.setState({ resourceQuotaModal: false })}
            {...this.state.resourceQuota}
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { quickCreateApp, entities } = state
  const { location } = props
  const defaultDetail = {
    stackDetail:{
      appDetail:{'name':'','configName':'','image':'','imageVersion':'','mountPath':'','content':''}
    }
  }
  const { stackDetail } = state.images || defaultDetail
  return {
    fields: quickCreateApp.fields,
    standardFlag,
    current: entities.current,
    'stackDetail':stackDetail&&stackDetail.appDetail?stackDetail:defaultDetail.stackDetail,
    loginUser: entities.loginUser.info,
  }
}
export default connect((mapStateToProps), {
  removeFormFields,
  removeAllFormFields,
  createConfigGroup,createConfigFiles,
  createApp,
  erroDeleteConfig,
  CreateDbCluster,
  loadStackDetail,
  addService,
  searchAppStore,
  loadAppStore
})(QuickCreateApp)
