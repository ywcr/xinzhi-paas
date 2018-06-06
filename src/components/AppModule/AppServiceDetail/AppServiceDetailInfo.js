/* Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppServiceDetailInfo component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Form, Input, Select, Button, Dropdown, Menu, Tooltip, Modal } from 'antd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import QueueAnim from 'rc-queue-anim'
import './style/AppServiceDetailInfo.less'
import { formatDate, cpuFormat, memoryFormat } from '../../../common/tools'
import { ENTERPRISE_MODE } from '../../../../configs/constants'
import { mode } from '../../../../configs/model'
import { appEnvCheck } from '../../../common/naming_validation'
import { editServiceEnv } from '../../../actions/services'
import NotificationHandler from '../../../common/notification_handler.js'
import { Link } from 'react-router'

const enterpriseFlag = ENTERPRISE_MODE == mode
const FormItem = Form.Item
const scheduleBySystem = 'ScheduleBySystem'
const scheduleByHostNameOrIP = 'ScheduleByHostNameOrIP'
const scheduleByLabels = 'ScheduleByLabels'
const unknownSchedulePolicy = 'Error'

class MyComponent extends Component {
  constructor(props){
    super(props)
    this.templateTable = this.templateTable.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleCancleEdit = this.handleCancleEdit.bind(this)
    this.handleSaveEdit = this.handleSaveEdit.bind(this)
    this.addNewEnv = this.addNewEnv.bind(this)
    this.ModalDeleteOk = this.ModalDeleteOk.bind(this)
    this.ModalDeleteCancel = this.ModalDeleteCancel.bind(this)
    this.envNameCheck = this.envNameCheck.bind(this)
    this.editServiceConfirm = this.editServiceConfirm.bind(this)
    this.state = {
      rowDisableArray : [],
      dataArray : [],
      saveBtnLoadingArray : [],
      ModalDeleteVisible : false,
      DeletingEnvName : '',
      DeletingEnvIndex : '',
      buttonLoading : false,
      appEditBtn: false,
      appEditLoading: false
    }
  }

  componentWillMount(){
    const { serviceDetail } = this.props
    const containers = serviceDetail.spec.template.spec.containers[0].env
    let rowDisableArray = []
    let dataArray = []
    let saveBtnLoadingArray = []
    if(containers){
      for(let i=0; i<containers.length; i++){
        rowDisableArray.push({disable : false})
        dataArray.push(containers[i])
        saveBtnLoadingArray.push({loading : false})
      }
    }
    this.setState({
      rowDisableArray,
      dataArray,
      saveBtnLoadingArray,
    })
  }
  handleEdit(index){
    const { rowDisableArray, dataArray } = this.state
    rowDisableArray[index].disable = true
    dataArray[index].edit = true
    this.setState({
      rowDisableArray,
      dataArray,
    })
  }

  handleCancleEdit(index){
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    const { form } = this.props
    const { getFieldValue } = form
    let name = getFieldValue(`envName${index}`)
    let value = getFieldValue(`envValue${index}`)
    if(name == undefined || value == undefined || name == '' || value == ''){
      dataArray.splice(index,1)
      rowDisableArray.splice(index,1)
      saveBtnLoadingArray.splice(index,1)
      this.setState({
        dataArray,
        rowDisableArray,
        saveBtnLoadingArray,
      })
      return
    }
    if(dataArray[index].flag == true){
      dataArray.splice(index,1)
      rowDisableArray.splice(index,1)
      saveBtnLoadingArray.splice(index,1)
      this.setState({
        dataArray,
        rowDisableArray,
        saveBtnLoadingArray,
      })
      return
    }
    rowDisableArray[index].disable = false
    this.setState({
      rowDisableArray
    })
  }
  editServiceConfirm(){
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    const { serviceDetail, cluster, editServiceEnv } = this.props
    const Notification = new NotificationHandler()
    this.setState({appEditLoading: true})
    if(dataArray.length > 1 && (dataArray[dataArray.length-1].name == '' || dataArray[dataArray.length-1].value == '' )){
      
      new NotificationHandler().error("请先保存新增的环境变量")
      return
    }
    let body = {
      clusterId : cluster,
      service : serviceDetail.metadata.name,
      arr : dataArray
    }
    editServiceEnv(body,{
      success : {
        func : () => {
          Notification.success('环境变量修改成功！')
          this.setState({
            rowDisableArray,
            dataArray,
            saveBtnLoadingArray,
            appEditBtn: false,
            appEditLoading: false
          })
        },
        isAsync : true
      },
      failed : {
        func : () => {
          Notification.error('环境变量修改失败！')
          this.setState({
            rowDisableArray,
            saveBtnLoadingArray,
            appEditLoading: false
          })
        },
        isAsync : true
      }
    })
  }
  handleSaveEdit(index){
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    const { form } = this.props
    const { getFieldValue } = form
    const Notification = new NotificationHandler()
    let name = getFieldValue(`envName${index}`)
    let value = getFieldValue(`envValue${index}`)
    if(name == '' || value == '' || name == undefined || value == undefined){
      Notification.error('变量名和变量值均不能为空')
      return
    }
    for(let i=0; i<dataArray.length; i++ ){
      if(dataArray[i].name == name){
        if(dataArray[index].edit == true){
          break
        }
        Notification.error('变量名已经存在，请修改！')
        return
      }
    }
    saveBtnLoadingArray[index].loading = true
    dataArray[index].name = name
    dataArray[index].value = value
    this.setState({
      saveBtnLoadingArray,
      appEditBtn: true
    },()=>{
      setTimeout(()=>{
        saveBtnLoadingArray[index].loading = false
        rowDisableArray[index].disable = false
        delete dataArray[index].flag
        delete dataArray[index].edit
        this.setState({
          rowDisableArray,
          dataArray,
          saveBtnLoadingArray,
        })
      },300)
    })
  }

  addNewEnv(){
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    if(dataArray.length > 1 && (dataArray[dataArray.length-1].name == '' || dataArray[dataArray.length-1].value == '' )){
      new NotificationHandler().error("请先保存新增的环境变量")
      return
    }
    rowDisableArray.push({disable : true})
    saveBtnLoadingArray.push({loading : false})
    dataArray.push({name:'',value:'',flag:true})
    this.setState({
      rowDisableArray,
      dataArray,
      saveBtnLoadingArray
    },()=>{
      document.getElementById(`envName${dataArray.length-1}`).focus()
    })
  }

  handleDelete(index,name){
    this.setState({
      DeletingEnvName : name,
      DeletingEnvIndex : index,
      ModalDeleteVisible : true
    })
  }

  ModalDeleteOk(){
    const { rowDisableArray, dataArray, DeletingEnvIndex, saveBtnLoadingArray } = this.state

    rowDisableArray.splice(DeletingEnvIndex,1)
    dataArray.splice(DeletingEnvIndex,1)
    saveBtnLoadingArray.splice(DeletingEnvIndex,1)
    this.setState({
      buttonLoading : true,
      ModalDeleteVisible : false,
      appEditBtn: true
    },()=>{
      setTimeout(()=>{
        this.setState({
          rowDisableArray,
          dataArray,
          saveBtnLoadingArray,
          buttonLoading : false,
        })
      })
    },300)
  }

  ModalDeleteCancel(){
    this.setState({
      ModalDeleteVisible : false
    })
  }

  envNameCheck(rule, value, callback) {
    const { dataArray } = this.state
    let flag = false
    let errorMsg = appEnvCheck(value, '环境变量');
    if(value == ''){
      callback(new Error('变量名不能为空！'))
    }
    for(let i=0; i<dataArray.length; i++ ){
      if(dataArray[i].name == value){
        callback(new Error('变量名已存在！'))
      }
    }
    if(errorMsg == 'success') {
      callback()
    } else {
      callback(new Error([errorMsg]));
    }
  }

  templateTable(dataArray,rowDisableArray) {
    if(dataArray.length == 0) {
      return <div className='noData'>暂无环境变量</div>
    }
    const { form } = this.props
    const { getFieldProps } = form
    const ele = []
    dataArray.forEach((env,index) => {
      if(env.name != 'CPU_LIMIT' && env.name != 'MEM_LIMIT'){
      const editMenu = (<Menu style={{width:'100px'}} onClick={() => this.handleEdit(index)}>
        <Menu.Item key="1"><Icon type="edit" />&nbsp;编辑</Menu.Item>
      </Menu>)

      ele.push(
        <div className="dataBox" key={index}>
          <div className="commonTitleName">
            {
              rowDisableArray[index].disable
              ?<FormItem>
                <Input id={`envName${index}`} {...getFieldProps(`envName${index}`, {
                  initialValue:env.name,
                  rules: [{ validator: this.envNameCheck },],
                })} placeholder={env.name} size="default"/>
              </FormItem>
              :<Tooltip title={env.name} placement="topLeft">
                <span>{env.name}</span>
              </Tooltip>
            }
          </div>
          <div className="commonTitleValue ">
            {
              rowDisableArray[index].disable
              ?<FormItem>
                <Input {...getFieldProps(`envValue${index}`,{
                  initialValue:env.value
                })
                } placeholder={env.value} size="default"/>
              </FormItem>
              :<Tooltip title={env.value} placement="topLeft">
                <span style={{width:'33%'}}>{env.value}</span>
              </Tooltip>
            }
          </div>
          <div>
            {
              rowDisableArray[index].disable
              ? <div>
                <Button type='primary' className='saveBtn' onClick={() => this.handleSaveEdit(index)} loading={this.state.saveBtnLoadingArray[index].loading}>保存</Button>
                <Button onClick={() => this.handleCancleEdit(index)}>取消</Button>
              </div>
              : <Dropdown.Button type="ghost" overlay={editMenu} className='editButton' onClick={() => this.handleDelete(index,env.name)}>
                  <Icon type="delete" />删除
                </Dropdown.Button>
            }
          </div>
          <div className='checkbox'></div>
        </div>
      )
      }
    })
  return ele
  }
  render(){
    const { DeletingEnvName } = this.state
    return (
      <div className='DetailInfo__MyComponent'>
        <div className="environment commonBox">
          <span className="titleSpan">环境变量</span>
          <div className={classNames("editTip",{'hide' : !this.state.appEditBtn})}>修改尚未更新，请点击"应用修改"使之生效</div>
          <Button size="large" type="primary" disabled={this.state.appEditBtn ? false : true} loading={this.state.appEditLoading} onClick={this.editServiceConfirm}>应用修改</Button>
          <div className="titleBox">
            <div className="commonTitle">
              变量名
            </div>
            <div className="commonTitle">
              变量值
            </div>
            <div className="commonTitle">
              操作
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>

        </div>
        <div>
          <Form>
            {this.templateTable(this.state.dataArray,this.state.rowDisableArray)}
          </Form>
        </div>
        <div className="pushRow">
          <a onClick={this.addNewEnv}><Icon type="plus" />添加环境变量</a>
        </div>
        <Modal
          title="删除环境变量操作"
          wrapClassName="ModalDeleteInfo"
          visible={this.state.ModalDeleteVisible}
          onOk={this.ModalDeleteOk}
          onCancel={this.ModalDeleteCancel}
          footer={[
            <Button
              key="back"
              type="ghost"
              size="large"
              onClick={this.ModalDeleteCancel}>
              取 消
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              loading={this.state.buttonLoading}
              onClick={this.ModalDeleteOk}>
              确 定
            </Button>,
          ]}
        >
          <div className='ModalColor'><i className="anticon anticon-question-circle-o modali"></i>你是否确定删除 [<span>{DeletingEnvName}</span>] 环境变量</div>
        </Modal>
      </div>
    )
  }
}
MyComponent = Form.create()(MyComponent)

function mapStateToProp(state, props){

  return {

  }
}

MyComponent = connect(mapStateToProp, {
  editServiceEnv,
})(MyComponent)

class BindNodes extends Component {
  constructor(props) {
    super(props)
    this.getSchedulingPolicy = this.getSchedulingPolicy.bind(this)
    this.getNodeAffinityLabels = this.getNodeAffinityLabels.bind(this)
    this.getNodeSelectorTarget = this.getNodeSelectorTarget.bind(this)
    this.template = this.template.bind(this)
    this.labelsTemplate = this.labelsTemplate.bind(this)
    this.state = {
      bindNodesData: {}
    }
  }

  getSchedulingPolicy(data) {
    const template = data.spec.template
    const metadata = template.metadata
    const spec = template.spec
    const labels = this.getNodeAffinityLabels(metadata)
    const node = this.getNodeSelectorTarget(spec)
    const policy = {
      type: scheduleBySystem,
    }
    // if (labels && node) {
    //   policy.type = unknownSchedulePolicy
    // } else 
    if (node) {
      policy.type = scheduleByHostNameOrIP
      policy.node = node
    }else if (labels) {
      policy.type = scheduleByLabels
      policy.labels = labels
    }
    return policy
  }

  getNodeSelectorTarget(spec) {
    const hostNameKey = 'kubernetes.io/hostname'
    if (!spec.hasOwnProperty('nodeSelector') || !spec.nodeSelector.hasOwnProperty(hostNameKey)) {
      return null
    }
    return spec.nodeSelector[hostNameKey]
  }

  getNodeAffinityLabels(metadata) {
    const affinityKey = 'scheduler.alpha.kubernetes.io/affinity'
    if (!metadata.hasOwnProperty('annotations') || !metadata.annotations.hasOwnProperty(affinityKey)) {
      return null
    }
    const affinity = JSON.parse(metadata.annotations[affinityKey])
    const labels = affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.reduce(
      (expressions, term) => expressions.concat(term.matchExpressions), []).reduce(
      (labels, expression) => labels.concat(expression.values.map(
        value => ({
          key: expression.key,
          value
        }))), [])
    return labels.length > 0 ? labels : null
  }

  labelsTemplate(labels) {
    let arr = labels.map((item, index) => {
      return <div key={index} className='label'>
        <span>{item.key}</span>
        <span> : </span>
        <span>{item.value}</span>
      </div>
    })
    return arr
  }

  template() {
    const { serviceDetail} = this.props
    let bindNodesData = this.getSchedulingPolicy(serviceDetail)
    switch (bindNodesData.type) {
      case "ScheduleBySystem":
        return <span>
          <div className="commonTitle">--</div>
          <div>系统默认调度</div>
        </span>
      case "ScheduleByHostNameOrIP":
        return <span>
          <div className="commonTitle">主机名及IP</div>
          <div>{bindNodesData.node}</div>
        </span>
      case "ScheduleByLabels":
        return <span>
          <div className="commonTitle bindnodeTitle">主机标签</div>
          <div>{this.labelsTemplate(bindNodesData.labels)}</div>
        </span>
      case "Error":
      default:
        return <span>
          <div className="commonTitle">--</div>
          <div>--</div>
        </span>
    }
  }

  render() {
    return <div className='commonBox bindNodes'>
      <span className="titleSpan">绑定节点</span>
      <div className="titleBox">
        <div className="commonTitle">
          绑定方式
        </div>
        <div className="commonTitle">
          绑定对象
        </div>
        <div style={{ clear: 'both' }}></div>
      </div>
      <div className='dataBox'>
        {this.template()}
      </div>
    </div>
  }
}

export default class AppServiceDetailInfo extends Component {
  constructor(props) {
    super(props)
    this.state={

    }
  }
  getMount(container) {
     let ele = []
    const volumes = container.spec.template.spec.volumes
    if (container.spec.template.spec.containers[0].volumeMounts) {
      container.spec.template.spec.containers[0].volumeMounts.forEach((volume, index) => {
        let name = ''
        let mountPath = ''
        let volumeType = '分布式存储'
        if (volume.mountPath === '/var/run/secrets/kubernetes.io/serviceaccount') { return }
        let isShow = volumes.some(item => {
          if (item.name === volume.name) {
            if (item.configMap) {
              return false
            }
            if(item.persistentVolumeClaim){
              name = item.persistentVolumeClaim.claimName
              mountPath = volume.mountPath  
              ele.push(
                <div key={name}>
                  <div className="commonTitle">{name}</div>
                  <div className="commonTitle" >{volumeType}</div>
                  <div className="commonTitle" >{mountPath}</div>
                  <div style={{ clear: "both" }}></div>
                </div>
              )            
            }else if(item.rbd){
              name = item.rbd.image.split('.')[2]
              mountPath = volume.mountPath
              ele.push(
                <div key={name}>
                  <div className="commonTitle">{name}</div>
                  <div className="commonTitle" >{volumeType}</div>
                  <div className="commonTitle" >{mountPath}</div>
                  <div style={{ clear: "both" }}></div>
                </div>
              )
            } else if(item.hostPath) {
              name = item.name
              volumeType = '本地存储'
              mountPath = item.hostPath.path
              ele.push(
                <div key={name}>
                  <div className="commonTitle">{name}</div>
                  <div className="commonTitle" >{volumeType}</div>
                  <div className="commonTitle" >{mountPath}</div>
                  <div style={{ clear: "both" }}></div>
                </div>
              )
            }
            return true
          }
          return false
        })
        if (!isShow) return
        // ele.push(
        //   <div key={name}>
        //     <div className="commonTitle">{name}</div>
        //     <div className="commonTitle" >{volumeType}</div>
        //     <div className="commonTitle" >{mountPath}</div>
        //     <div style={{ clear: "both" }}></div>
        //   </div>
        // )
      })
    }
    return ele
  }
  getConfigMap(container) {
    let ele = []
    let volumes = container.spec.template.spec.volumes
    let configMaps = []
    if (container.spec.template.spec.containers[0].volumeMounts) {
     container.spec.template.spec.containers[0].volumeMounts.forEach((volume) => {
        if (volume.mountPath === '/var/run/secrets/kubernetes.io/serviceaccount') { return }
        volumes.forEach(item => {
          if(!item) return false
          if (item.name === volume.name) {
            if (item.configMap) {
              if (item.configMap.items) {
                item.configMap.items.forEach(configMap => {
                  let arr = volume.mountPath.split('/')
                  if(arr[arr.length - 1] == configMap.path) {
                    configMap.mountPath = volume.mountPath
                    configMap.configMapName = item.configMap.name
                    configMaps.push(configMap)
                  }
                })
              } else {
                configMaps.push({
                  mountPath: volume.mountPath,
                  key: '已挂载整个配置组',
                  configMapName: item.configMap.name,
                })
              }
            }
          }
        })
      })
      configMaps.forEach((item, index) => {
        ele.push(
          <div key={item.name + item.key + '-' + index}>
            <div className="commonTitle"><Link to="/app_manage/configs">{item.configMapName}</Link></div>
            <div className="commonTitle">{item.key}</div>
            <div className="commonTitle">{item.mountPath}</div>
            <div style={{ clear: "both" }}></div>
          </div>
        )
      })
      return ele
    }
  }

  render() {
    const { isFetching, serviceDetail, cluster } = this.props
    if (isFetching || !serviceDetail.metadata) {
      return ( <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    let cpuFormatResult
    if(serviceDetail.spec.template.spec && serviceDetail.spec.template.spec.containers[0] && serviceDetail.spec.template.spec.containers[0].resources && serviceDetail.spec.template.spec.containers[0].resources.limits){
      cpuFormatResult = cpuFormat(serviceDetail.spec.template.spec.containers[0].resources.limits.memory, serviceDetail.spec.template.spec.containers[0].resources)
    } else {
      cpuFormatResult = '-'
    }

    return (
      <Card id="AppServiceDetailInfo">
        <div className="info commonBox">
          <span className="titleSpan">基本信息</span>
          <div className="titleBox">
            <div className="commonTitle">
              名称
          </div>
            <div className="commonTitle">
              镜像名称
          </div>
            <div className="commonTitle">
              创建时间
          </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="dataBox">
            <div className="commonTitle">
              {serviceDetail.metadata.name}
            </div>
            <div className="commonTitle">
              {serviceDetail.images.join(', ') || '-'}
            </div>
            <div className="commonTitle">
              {formatDate(serviceDetail.metadata.creationTimestamp || '')}
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
        <div className="compose commonBox">
          <span className="titleSpan">资源配置</span>
          <div className="titleBox">
            <div className="commonTitle">
              CPU
          </div>
            <div className="commonTitle">
              内存
          </div>
            <div className="commonTitle">
              系统盘
          </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="dataBox">
            <div className="commonTitle">
              { cpuFormatResult }
            </div>
            <div className="commonTitle">
              { memoryFormat(serviceDetail.spec.template.spec.containers[0].resources)}
            </div>
            <div className="commonTitle">
              10G
          </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
        <BindNodes serviceDetail={serviceDetail}/>
        <MyComponent
          ref="envComponent"
          serviceDetail={serviceDetail}
          cluster={cluster}
        />
        <div className="storage commonBox">
          <span className="titleSpan">存储卷</span>
          <div className="titleBox">
            <div className="commonTitle">
              名称
              </div>
            <div className="commonTitle">
              存储类型
            </div>
            <div className="commonTitle">
              挂载点
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            {this.getMount(serviceDetail)}
          </div>
        </div>
        <div className="storage commonBox">
          <span className="titleSpan">服务配置</span>
          <div className="titleBox">
            <div className="commonTitle">
              配置组
            </div>
            <div className="commonTitle">
              配置文件
            </div>
            <div className="commonTitle">
              挂载点
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            {this.getConfigMap(serviceDetail)}
          </div>
        </div>
      </Card>
    )
  }
}

AppServiceDetailInfo.propTypes = {
  //
}
