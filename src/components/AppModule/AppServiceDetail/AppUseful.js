/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppUseful component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Popconfirm, Alert, Card, Input, Button, Select, Switch, message, InputNumber } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import merge from 'lodash/merge'
import "./style/AppUseful.less"
import { changeServiceAvailability } from '../../../actions/services'
import NotificationHandler from '../../../common/notification_handler'
import { isStorageUsed } from '../../../common/tools'

const InputGroup = Input.Group;
const Option = Select.Option;

class AppUseful extends Component {
  constructor(props) {
    super(props);
    this.changeCheckType = this.changeCheckType.bind(this);
    this.startEdit = this.startEdit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.cancelSet = this.cancelSet.bind(this);
    this.confirmSet = this.confirmSet.bind(this);
    this.state = {
      currentUseful: false,
      checkType: "null",
      editFlag: true,
      switchDisable: false,
      haveRBDVolume: false,
      submitInfo: {},
      status:'',//控制显示
      item:''
    }
  }
  componentWillMount() {
    const service = this.props.service
    if (!service.spec) return
    this.setState({
        haveRBDVolume: isStorageUsed(service.spec.template.spec.volumes),
    })
    this.setLivenessProbe(service)
  }
  componentDidUpdate() {
    let portInput = document.getElementById('portInput');
    // portInput && portInput.focus()
  }
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow, service } = nextProps
    if (!service.spec) return
    if (!serviceDetailmodalShow) {
      this.setState({
        currentUseful: false,
        checkType: "null",
        editFlag: true,
        switchDisable: false,
        submitInfo: {},
        livenessProbe: {},
        haveRBDVolume: false,
      })
      return
    }
    this.setState({
        haveRBDVolume: isStorageUsed(service.spec.template.spec.volumes),
    })
    this.setLivenessProbe(nextProps.service, serviceDetailmodalShow)
  }
  setLivenessProbe(service, serviceDetailmodalShow) {
    if (this.state.submitInfo && this.state.submitInfo.info) return
    let livenessProbe = service.spec.template.spec.containers[0].livenessProbe
    const currentUseful = !!livenessProbe
    if (!livenessProbe) {
      livenessProbe = { info: {} }
      if (service.metadata.annotations) {
        if (service.metadata.annotations['tenxcloud.com/livenessProbe']) {
          livenessProbe = JSON.parse(service.metadata.annotations['tenxcloud.com/livenessProbe'])
        }
      }
    }
    if (livenessProbe.httpGet) {
      livenessProbe.info = livenessProbe.httpGet
    } else if (livenessProbe.tcpSocket) {
      livenessProbe.info = livenessProbe.tcpSocket
    }

    let protocol = 'null'
    if (livenessProbe.httpGet) {
      protocol = 'http'
    } else if (livenessProbe.tcpSocket) {
      protocol = 'tcp'
    } else {
      this.setState({
        switchDisable: true
      })
    }
    this.setState({
      currentUseful: currentUseful,
      livenessProbe: livenessProbe,
      checkType: protocol,
      status:protocol,
      submitInfo: Object.assign({}, livenessProbe)
    })
  }
  changeCheckType(value) {
    const changeServiceAvailability = this.props.changeServiceAvailability
    const cluster = this.props.cluster
    const serviceName = this.props.serviceName
    changeServiceAvailability(cluster, serviceName, value)
    this.setState({
      currentUseful: value
    });
    if (!value) {
      const livenessProbe = Object.assign({}, this.state.livenessProbe)
      this.setState({
        submitInfo: livenessProbe
      })
    }
  }

  startEdit() {
    this.setState({
      editFlag: false,
      switchDisable: true
    });
    if (this.state.livenessProbe) {
      this.setState({
        submitInfo: Object.assign({}, this.state.livenessProbe)
      })
    }
  }
  onChange(e) {
    this.setState({
      checkType: e,
      item:e
    });
  }

  cancelSet() {
    // console.log(this.state.status)
    this.setState({
      editFlag: true,
      checkType:this.state.status
    })
    if (this.state.livenessProbe.initialDelaySeconds) {
      const livenessProbe = Object.assign({}, this.state.livenessProbe)
      this.setState({
        switchDisable: false,
        submitInfo: livenessProbe
      })
    } else {
      this.setState({
        switchDisable: true,
        checkType: 'null',
      })
    }

  }

  confirmSet() {
    // console.log(this.state.status)
    // debugger
    const submitInfo = this.state.submitInfo
    const checkType = this.state.checkType
    this.setState({
      status:this.state.checkType
    })
    const propertys = Object.getOwnPropertyNames(submitInfo)
    let notification = new NotificationHandler()
    if (checkType == 'null') {
      notification.error('请选择协议类型')
      return
    }
    if (!submitInfo.info.port&&checkType!= 'null') {
      notification.error('请填写端口')
      return
    }
    checkType
    if (submitInfo.info.port < 1 || submitInfo.info.port > 65535) {
      notification.error('端口只允许填写1~65535之间的数字')
      return
    }
    if (submitInfo.initialDelaySeconds && submitInfo.initialDelaySeconds < 0) {
      notification.error('首次检查延时不能为负')
      return
    }
    if (submitInfo.timeoutSeconds && submitInfo.timeoutSeconds < 1) {
      notification.error('检查超时不能小于1')
      return
    }
    if (submitInfo.periodSeconds && submitInfo.periodSeconds < 1) {
      notification.error('检查间隔不能小于1')
      return
    }
    // if(this.state.checkType === 'http') {
    //   if(propertys.length < 4 || !submitInfo.info.path || !submitInfo.info.path) {
    //     notification.error('信息填写不全')
    //     return
    //   }
    // }
    // if(this.state.checkType === 'tcp') {
    //   if (propertys.length < 4) {
    //     notification.error('信息填写不全')
    //     return
    //   }
    // }
    if (this.state.checkType === 'null') {
      const changeServiceAvailability = this.props.changeServiceAvailability
      const cluster = this.props.cluster
      const serviceName = this.props.serviceName
      changeServiceAvailability(cluster, serviceName, false)
      this.setState({
        currentUseful: false,
        switchDisable: true,
        editFlag: true
      })
      return
    }
    const changeServiceAvailability = this.props.changeServiceAvailability
    const cluster = this.props.cluster
    const serviceName = this.props.serviceName
    let options = {}
    const self = this
    if (self.state.checkType === 'http') {
      options.httpGet = {
        port: parseInt(submitInfo.info.port),
        path: '/' + (submitInfo.info.path ? submitInfo.info.path : '')
      }
    } else {
      options.tcpSocket = {
        port: parseInt(submitInfo.info.port)
      }
    }
    options.initialDelaySeconds = submitInfo.initialDelaySeconds ? parseInt(submitInfo.initialDelaySeconds) : 0
    options.timeoutSeconds = submitInfo.timeoutSeconds ? parseInt(submitInfo.timeoutSeconds) : 1
    options.periodSeconds = submitInfo.periodSeconds ? parseInt(submitInfo.periodSeconds) : 10
    changeServiceAvailability(cluster, serviceName, options, {
      success: {
        func() {
          self.setState({
            editFlag: true,
            switchDisable: false,
            livenessProbe: Object.assign({}, submitInfo)
          });
        }
      }
    })
  }
  getInputInfo(property, e) {
    let submitInfo = this.state.submitInfo
    let mergeObj = { [property]: e }
    if (property === 'port') {
      mergeObj = { info: { [property]: e } }
    }
    if (property === 'path') {
      mergeObj = { info: { [property]: e.target.value } }
    }
    submitInfo = merge({}, submitInfo, mergeObj)
    this.setState({
      submitInfo
    })
  }
  checkSubmitInfo() {
    if (this.state.protocol === 'http') {

    }
  }
  render() {
    const { service } = this.props
    if (!service || !service.spec) {
      return (<div id="AppUseful"></div>)
    }
    let livenessProbe = this.state.livenessProbe
    let protocol = this.state.checkType
    const submitInfo = this.state.submitInfo
    return (
      <div id="AppUseful">
        <div className="operaBox">
          <span>设置高可用</span>
          <span style={{marginLeft:'40px'}}>
            <Switch value={this.state.currentUseful} checkedChildren="开" unCheckedChildren="关" className="switch" defaultChecked={this.state.currentUseful} onChange={this.changeCheckType} disabled={this.state.switchDisable} />
            <span className="tips">{this.state.haveRBDVolume ? "（因挂载存储卷，不能进行滚动更新，服务可能会有短暂不可用时间！）" : ""}</span>
          </span>
        </div>
        <div className="settingBox">
          <span className="titleSpan">配置信息</span>
          {this.state.editFlag ? (
            <div className="editBtn" onClick={this.startEdit}>
              <i className="fa fa-pencil-square-o"></i>
              <span className="editTitle">编辑</span>
              <div style={{ clear: "both" }}></div>
            </div>
          ) : null}
          <div style={{ clear: "both" }}></div>
          <Card className="setting" >
            <div className="title">
              <span>容器实例：&nbsp;&nbsp;{this.props.serviceName}</span>
            </div>
            <div className="select">
              <span>重启检查项：&nbsp;&nbsp;</span>
              <Select className="checkType" size="large" defaultValue={protocol} style={{ width: 80 }}
                onChange={this.onChange} disabled={this.state.editFlag} value={this.state.checkType}>
                <Option value="null">无</Option>
                <Option value="http">HTTP</Option>
                <Option value="tcp">TCP</Option>
              </Select>
            </div>
            {this.state.checkType == "http" ? [
              <div className="http">
                <div className="title">
                  <div className="httpcommonTitle">
                    <span>端口</span>
                  </div>
                  <div className="httpcommonTitle">
                    <span>首次检查延时</span>
                  </div>
                  <div className="httpcommonTitle">
                    <span>检查超时</span>
                  </div>
                  <div className="httpcommonTitle">
                    <span>检查间隔</span>
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
                <div className="input">
                  <div className="commonInput">
                    <InputNumber id="portInput" type="text" disabled={this.state.editFlag} value={submitInfo.info.port} onChange={(e) => this.getInputInfo('port', e)} />
                  </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.initialDelaySeconds} onChange={(e) => this.getInputInfo('initialDelaySeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.timeoutSeconds} onChange={(e) => this.getInputInfo('timeoutSeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.periodSeconds} onChange={(e) => this.getInputInfo('periodSeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div style={{ clear: "both" }}></div>
                </div>
                <div className="title">
                  <div className="httpcommonTitle">
                    <span>Path路径</span>
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
                <div className="input">
                  <span style={{ float: "left", marginLeft: "10px" }}>/</span>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag}
                      value={submitInfo.info.path && submitInfo.info.path.length > 0 && submitInfo.info.path[0] === '/' ? submitInfo.info.path.substr(1) : submitInfo.info.path}
                      onChange={(e) => this.getInputInfo('path', e)} />
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
              </div>
            ] : null}
            {this.state.checkType == "tcp" ? [
              <div className="tcp">
                <div className="title">
                  <div className="tcpcommonTitle">
                    <span>端口</span>
                  </div>
                  <div className="tcpcommonTitle">
                    <span>首次检查延时</span>
                  </div>
                  <div className="tcpcommonTitle">
                    <span>检查超时</span>
                  </div>
                  <div className="tcpcommonTitle">
                    <span>检查间隔</span>
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
                <div className="input">
                  <div className="commonInput">
                    <InputNumber id="portInput" type="text" disabled={this.state.editFlag} value={submitInfo.info.port} onChange={(e) => this.getInputInfo('port', e)} />
                  </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.initialDelaySeconds} onChange={(e) => this.getInputInfo('initialDelaySeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.timeoutSeconds} onChange={(e) => this.getInputInfo('timeoutSeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.periodSeconds} onChange={(e) => this.getInputInfo('periodSeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div style={{ clear: "both" }}></div>
                </div>
              </div>
            ] : null}
            {/* {this.state.status=='http'?['11']:null} */}
          </Card>
          {!this.state.editFlag ? [
            <div className="btnBox">
           <Button size="large" type="ghost" onClick={this.cancelSet}>
           取消
        </Button>
            <Button size="large" type="primary" onClick={this.confirmSet}>
            确认
         </Button>
            </div>
          ] : null}
        </div>
      </div>


    )
  }
}

function mapStateToProps(state) {
  return {
    serviceAvailability: state.services.serviceAvailability
  }
}

export default connect(mapStateToProps, {
  changeServiceAvailability
})(AppUseful)