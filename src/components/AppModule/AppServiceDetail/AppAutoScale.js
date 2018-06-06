/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/25
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  Button, Card, Slider, Row, Col, InputNumber, Tooltip, Icon, Switch,
  Modal,Select
} from 'antd'
import { loadAutoScale, deleteAutoScale, updateAutoScale } from '../../../actions/services'
import { INSTANCE_AUTO_SCALE_MAX_CPU, INSTANCE_MAX_NUM } from '../../../../constants'
import './style/AppAutoScale.less'
import NotificationHandler from '../../../common/notification_handler'
import { isStorageUsed, isEmptyObject } from '../../../common/tools'
function loadData(props) {
  const { cluster, serviceName, loadAutoScale ,clustername} = props
  loadAutoScale(cluster, serviceName, {
    success: {
      func: (res) => {
        const { replicas, volumes,diskType, activeTabKey ,memory,servicelist} = props
        let appName = servicelist.labels['paas.enncloud.cn/appName']
        let namespace = servicelist.namespace
          let isAutoScaleOpen = false
          let autoScale = {}
          if (res && res.data && res.data.spec) {
            autoScale = res.data.spec
            isAutoScaleOpen = true
          }
          var reg = /[a-zA-Z]/g;
          console.log(!isStorageUsed(volumes,diskType),'-----------diskType')
          let targetAverageValue = autoScale.metrics?autoScale.metrics[0].pods.targetAverageValue : 30
          let memorynamber= memory.replace(reg,"");
          let newState = {
            isAutoScaleOpen: isAutoScaleOpen,
            edit: false,
            isAvailable: !isStorageUsed(volumes,diskType),
            memorynamber:memory.replace(reg,""),
            appName:servicelist.labels['paas.enncloud.cn/appName'],
            namespace:servicelist.namespace,
            dateValue:autoScale.metrics?autoScale.metrics[0].pods.metricName.includes('cpu')?'cpu':'memory':'cpu',
            serviceName:servicelist.labels.name
          }
          // let serviceName = servicelist.labels.name
          
        if(res.data.spec){
          if (!isEmptyObject(autoScale)) {
            Object.assign(newState, {
              minReplicas: autoScale.minReplicas || replicas,
              maxReplicas: autoScale.maxReplicas || replicas,
              targetCPUUtilizationPercentage:parseInt(autoScale.metrics[0].pods.metricName.includes('cpu')?parseInt(targetAverageValue)||30:30),
              targetMemoryUtilizationPercentage:parseInt(autoScale.metrics[0].pods.metricName.includes('cpu')?30:(clustername=='huawei'?parseInt(targetAverageValue):targetAverageValue.includes('k')?(parseInt(targetAverageValue)/1000/memorynamber*100):(parseInt(targetAverageValue)/memorynamber*100))),
              // appName:servicelist.labels['paas.enncloud.cn/appName'],
              // namespace:servicelist.namespace,
            })
          }
        }else{
          Object.assign(newState, {
            minReplicas:1,
            maxReplicas:2,
            targetCPUUtilizationPercentage:30,
            targetMemoryUtilizationPercentage:30
          })
        }
        this.setState(newState)
        
      }
    }
  })
}

class AppAutoScale extends Component {
  constructor(props) {
    super(props)
    this.handleSwitch = this.handleSwitch.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleChangedate = this.handleChangedate.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleMinReplicas = this.handleMinReplicas.bind(this)
    this.handleMaxReplicas = this.handleMaxReplicas.bind(this)
    this.handleTargetCPUUtilizationPercentage = this.handleTargetCPUUtilizationPercentage.bind(this)
    this.handleTargetMemoryUtilizationPercentage = this.handleTargetMemoryUtilizationPercentage.bind(this)
    var reg = /[a-zA-Z]/g;
    this.state = {
      edit: false,
      minReplicas:  1,
      maxReplicas:  2,
      targetCPUUtilizationPercentage: 30,
      targetMemoryUtilizationPercentage:30 ,
      saveText: '保存',
      isAutoScaleOpen: props.isAutoScaleOpen,
      isAvailable: false,
      dateValue:'cpu',
      memorynamber:props.memory.replace(reg,""),
      appName:props.appName,
      namespace:props.namespace,

    }
  }

  componentWillMount() {
    loadData.call(this, this.props)
  }
  componentWillUnmount(){
    this.setState({
      minReplicas:1,
      maxReplicas:2,
      targetCPUUtilizationPercentage:30,
      targetMemoryUtilizationPercentage:30
    })
  }
  componentWillReceiveProps(nextProps) {
    const { serviceName } = nextProps
    if(serviceName == this.props.serviceName) return
    loadData.call(this, nextProps)
  }

  handleMinReplicas(value) {
    const { maxReplicas } = this.state
    if (value >= maxReplicas) {
      value -= 1
    }
    this.setState({
      minReplicas: value,
      maxReplicas: (value >= maxReplicas ? value + 1 : maxReplicas),
    })
  }

  handleMaxReplicas(value) {
    const { minReplicas } = this.state
    if (value <= minReplicas) {
      value += 1
    }
    this.setState({
      minReplicas: (value <= minReplicas ? value -1 : minReplicas),
      maxReplicas: value,
    })
  }

  handleTargetCPUUtilizationPercentage(value) {
    const { minReplicas } = this.state
    this.setState({
      targetCPUUtilizationPercentage: value,
    })
  }
  handleTargetMemoryUtilizationPercentage(value){
    this.setState({
      targetMemoryUtilizationPercentage:value
    })
  }

  handleSwitch() {
    const { isAutoScaleOpen } = this.state
    if (!isAutoScaleOpen) {
      this.setState({
        saveText: '开启并保存',
        edit: true
      })
      return
    }
  this.setState({closeModal: true})

  }
  closeAutoScale() {
    const { cluster, serviceName, deleteAutoScale, loadAutoScale } = this.props
    const self = this
    this.setState({closeModal: false})
    let notification = new NotificationHandler()
    return new Promise((resolve) => {
      resolve()
      notification.spin('正在保存中...')
      deleteAutoScale(cluster, serviceName, {
        success: {
          func: () => {
            loadAutoScale(cluster, serviceName, {
              success: {
                func: () => {
                  self.setState({
                    isAutoScaleOpen: false
                  })
                  notification.close()
                  notification.success('自动伸缩已关闭')
                }
              }
            })
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notification.close()
            notification.error('关闭自动伸缩失败')
          }
        }
      })
    })
  }
  handleEdit() {
    this.setState({
      saveText: '保存',
      edit: true
    })
  }

  handleSave() {
    const self = this
    const { cluster, serviceName, updateAutoScale, loadAutoScale,clustername } = this.props
    const { minReplicas, maxReplicas, targetCPUUtilizationPercentage, saveText,targetMemoryUtilizationPercentage,dateValue,memorynamber,appName,namespace } = this.state
    console.log(targetCPUUtilizationPercentage,'---------targetCPUUtilizationPercentage')
    const body = {
      namespace:namespace,
      minReplicas: minReplicas,
      maxReplicas: maxReplicas,
      targetAverageValue:dateValue =='cpu'?targetCPUUtilizationPercentage+'m':clustername=='huawei'?targetMemoryUtilizationPercentage+'m':memorynamber*(targetMemoryUtilizationPercentage/100)+'M',
      metricName:dateValue =='cpu'?'cpu_usage':'memory_usage_bytes',
      type:dateValue
    }
    let notification = new NotificationHandler()
    notification.spin('正在保存中...')
    updateAutoScale(cluster, serviceName, body, {
      success: {
        func: () => {
          loadAutoScale(cluster, serviceName, {
            success: {
              func: () => {
                self.setState({
                  edit: false,
                  isAutoScaleOpen: true
                })
                notification.close()
                notification.success(`${saveText}成功`)
              }
            }
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.close()
          notification.error(`${saveText}失败`)
        }
      }
    })
  }

  handleCancel() {
    const { autoScale } = this.props
    var reg = /[a-zA-Z]/g;
    this.setState({
      edit: false,
      minReplicas: autoScale.minReplicas || 1,
      maxReplicas: autoScale.maxReplicas || 1,
      targetCPUUtilizationPercentage: autoScale.targetCPUUtilizationPercentage || 30,
      targetMemoryUtilizationPercentage: this.props.memory.replace(reg,"")||30 ,

    })
  }
   handleChangedate(value) {
     const _this = this
     _this.setState({
      dateValue:value
     })
  }
  render() {
    const {
      edit,
      minReplicas,
      maxReplicas,
      targetCPUUtilizationPercentage,
      saveText,
      isAutoScaleOpen,
      targetMemoryUtilizationPercentage,
    } = this.state
    return (
      <div id="AppAutoScale">
        <div className="title">
          自动弹性伸缩
            {!edit
              ? (
                <span style={{marginLeft:'50px'}}>
                  <Tooltip
                    arrowPointAtCenter
                    title={this.state.isAvailable ? (isAutoScaleOpen ? '弹性伸缩已开启' : '弹性伸缩已关闭') : '不允许弹性伸缩'} >
                    <Switch
                      disabled={!this.state.isAvailable}
                      onChange={this.handleSwitch}
                      checkedChildren="开" unCheckedChildren="关"
                      checked={isAutoScaleOpen}
                      className="switch" />
                  </Tooltip>
                  {isAutoScaleOpen && (
                    <Tooltip arrowPointAtCenter title="设置">
                      <Button
                        type="primary" shape="circle"
                        size="small" icon="setting"
                        onClick={this.handleEdit} />
                    </Tooltip>
                  )}
                </span>)
              : (
                <span>
                  <Button type="primary" size="large" onClick={this.handleSave}>{saveText}</Button>
                  <Button size="large" onClick={this.handleCancel}>取消</Button>
                </span>)
            }
        </div>
        {this.state.isAvailable ?
          <div className="alertRow">Tips: 系统将根据设定的CPU、内存阈值来自动的『扩展,或减少』该服务所『缺少,或冗余』的实例数量</div>
          :
          <div className="alertRow">Tips: 已挂载存储卷的服务为有状态服务，有状态服务不允许设置弹性伸缩</div>
        }
        <Card>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>服务名称</Col>
            <Col className="itemBody" span={20}>{this.props.serviceName}</Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>最小实例数量</Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12} style={{ marginTop: '24px' }}>
                  <Slider defaultValue={30}
                    value={minReplicas}
                    onChange={this.handleMinReplicas}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_MAX_NUM}
                    />
                </Col>
                <Col span={12}>
                  <InputNumber style={{ marginLeft: '16px' }}
                    value={minReplicas}
                    onChange={this.handleMinReplicas}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_MAX_NUM}
                    /> 个
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>最大实例数量</Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12} style={{ marginTop: '24px' }}>
                  <Slider defaultValue={30}
                    onChange={this.handleMaxReplicas}
                    value={maxReplicas}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_MAX_NUM} />
                </Col>
                <Col span={12}>
                  <InputNumber style={{ marginLeft: '16px' }}
                    value={maxReplicas}
                    onChange={this.handleMaxReplicas}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_MAX_NUM}
                    /> 个
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>阈值控制项</Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12} style={{ marginTop: '24px' }}>
                <Select 
                disabled={!edit}
                showSearch
                style={{ width: 200 }}
                placeholder="请选择阈值控制项"
                optionFilterProp="children"
                onChange={this.handleChangedate}
                value={this.state.dateValue}
                defaultValue="cpu"
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                <Option value="cpu">CPU</Option>
                <Option value="memory">内存</Option>
                <Option disabled value="amountAccess">访问量</Option>
              </Select>
                </Col>
              </Row>
            </Col>
          </Row>
          {this.state.dateValue =='cpu'? <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>CPU阈值</Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12} style={{ marginTop: '24px' }}>
                  <Slider defaultValue={30}
                    onChange={this.handleTargetCPUUtilizationPercentage}
                    value={targetCPUUtilizationPercentage}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_AUTO_SCALE_MAX_CPU} />
                </Col>
                <Col span={12} id="tip">
                  <InputNumber style={{ marginLeft: '16px' }}
                    value={targetCPUUtilizationPercentage}
                    onChange={this.handleTargetCPUUtilizationPercentage}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_AUTO_SCALE_MAX_CPU}
                    /> %
                  <Tooltip title="容器实例实际占用CPU与实例CPU限制比例" >
                    <i className="anticon anticon-question-circle-o" style={{ marginLeft: '40px' }} />
                  </Tooltip>
                </Col>
              </Row>
            </Col>
          </Row>:
          
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>内存</Col>
            <Col className="itemBody" span={20}>
              <Row>
              <Col span={12} style={{ marginTop: '24px' }}>
                  <Slider defaultValue={30}
                    onChange={this.handleTargetMemoryUtilizationPercentage}
                    value={targetMemoryUtilizationPercentage}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_AUTO_SCALE_MAX_CPU} />
                </Col>
                <Col span={12}>
                  <InputNumber
                  defaultValue={30}
                  style={{ marginLeft: '16px' }}
                    value={targetMemoryUtilizationPercentage}
                    onChange={this.handleTargetMemoryUtilizationPercentage}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_AUTO_SCALE_MAX_CPU}
                    /> %
                  <Tooltip title="容器实例实际占用内存与实例内存限制比例">
                    <i className="anticon anticon-question-circle-o" style={{ marginLeft: '40px' }} />
                  </Tooltip>
                </Col>
              </Row>
            </Col>
          </Row>}
          
          <Row className="cardItem" />
        </Card>
        <Modal title="关闭弹性伸缩操作" visible={this.state.closeModal}
          onOk={()=> this.closeAutoScale()} onCancel={()=> this.setState({closeModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要关闭此项弹性伸缩?</div>
        </Modal>
      </div>
    )
  }
}
AppAutoScale.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,
  replicas: PropTypes.number.isRequired,
  loadAutoScale: PropTypes.func.isRequired,
  deleteAutoScale: PropTypes.func.isRequired,
  updateAutoScale: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {
  const {
    autoScale,
  } = state.services
  const { entities } = state
  let autoScaleData = {}
  let isAutoScaleOpen = false
  let clustername = ''
  if (entities && entities.current && entities.current.cluster && entities.current.cluster && entities.current.cluster.clusterName) {
    clustername = entities.current.cluster.clusterName
  }
  if (autoScale && autoScale.result && autoScale.result.data.spec) {
    autoScaleData = autoScale.result.data.spec
    isAutoScaleOpen = true
  }
  return {
    autoScale: autoScaleData,
    isAutoScaleOpen,
    clustername
  }
}

export default connect(mapStateToProps, {
  loadAutoScale,
  deleteAutoScale,
  updateAutoScale,
})(AppAutoScale)