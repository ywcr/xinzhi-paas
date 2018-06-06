/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppService rental component
 *
 * v0.1 - 2017-1-19
 * @author Baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Card, Icon, Switch, Button, Tooltip, Form, Modal, Input } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { loadServiceDetail, loadK8sService, loadCertificates, updateCertificates, deleteCertificates, toggleHTTPs } from '../../../actions/services'
import NotificationHandler from '../../../common/notification_handler'
import './style/AppSettingsHttps.less'
import { CERT_REGEX, PRIVATE_KEY_REGEX, ANNOTATION_SVC_SCHEMA_PORTNAME, ANNOTATION_HTTPS } from '../../../../constants'
import { camelize } from 'humps'
import { isStandardMode } from '../../../common/tools.js'

const FormItem = Form.Item
const createForm = Form.create

let UploadSslModal = React.createClass({
  certExists(rule, values, callback) {
    if (!values) {
      callback([new Error('请输入证书内容')])
      return
    }
    // if (!CERT_REGEX.test(values)) {
    //   callback([new Error('证书格式错误')])
    //   return
    // }
    callback()
  },
  privateExists(rule, values, callback) {
    if (!values) {
      callback([new Error('请输入密钥内容')])
      return
    }
    // if (!PRIVATE_KEY_REGEX.test(values)) {
    //   callback([new Error('私钥格式错误')])
    //   return
    // }
    callback()
  },
   handleOpen(){
     const thisUrl = window.location.hostname
     window.open('https://'+thisUrl+':9004/guide/service#https')
  },
  handsubmit() {
    this.props.form.validateFields((error, values)=> {
      if (!!error) {
        return
      }
      const {
        cluster,
        serviceName,
        updateCertificates,
        loadCertificates,
        loadK8sService,
      } = this.props.scope.props
      const body = {
        certificate: values.cert,
        private_key: values.private,
      }
      updateCertificates(cluster, serviceName, body, {
        success: {
          func: () => {
            this.props.scope.setState({
              certificateExists: true,
              createModal: false,
            })
            loadCertificates(cluster, serviceName)
            loadK8sService(cluster, serviceName)
            new NotificationHandler().success('操作成功')
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            let msg = ''
            if (err.statusCode === 400) {
              msg = '内容错误请重试'
            }
            new NotificationHandler().error('操作失败', msg)
          },
          isAsync: true
        }
      })
    })
  },
  restoreForm() {
    this.props.form.resetFields()
    this.props.scope.setState({createModal: false})
  },
  render() {
    const parentScope = this.props.scope
    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const certContent = getFieldProps('cert', {
      rules: [
        { validator: this.certExists },
      ],
    })
    const privateContent = getFieldProps('private', {
      rules: [
        { validator: this.privateExists },
      ],
    })
    return (
      <Modal title={this.props.scope.state.certificateExists ? "更新证书" : "新建证书"} visible={parentScope.state.createModal} className="createSslModal"
        onOk={()=> this.handsubmit()} onCancel={()=> this.restoreForm()}
        okText={this.props.scope.state.certificateExists ? "更新" : "创建"}
        >
        <Form horizontal>
          <FormItem {...formItemLayout} label="证书类型">
            <span>服务器证书</span>
          </FormItem>
          <FormItem {...formItemLayout} label="证书内容">
            <Input type="textarea" {...certContent} placeholder="PEM编码"/>
            <a target="_blank" onClick={this.handleOpen}>查看样例</a>
          </FormItem>
          <FormItem {...formItemLayout} label="密钥内容">
            <Input type="textarea" {...privateContent} placeholder="PEM编码"/>
            <a target="_blank" onClick={this.handleOpen}>查看样例</a>
          </FormItem>

        </Form>
      </Modal>
    )
  }
})

UploadSslModal = createForm()(UploadSslModal)

class AppSettingsHttps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabsActive: 1,
      statusText: '关闭',
      createModal: false,
      canOpenHttps: false,
      hasBindingDomainForHttp: false,
      detailModal: false,
      hasHTTPPort: false,
      certificateExists: false,
      httpsOpened: this.getHttpsSwitchState(props.k8sService),
      httpsStatusInited: false,
    }
    this.setHttpsSwitchState = this.setHttpsSwitchState.bind(this)
    this.getHttpsSwitchState = this.getHttpsSwitchState.bind(this)
  }
  componentWillMount() {
    const { serviceName, cluster, loadK8sService, loadServiceDetail, loadCertificates } = this.props
    const { httpsOpened } = this.state
    loadK8sService(cluster, serviceName)
    loadServiceDetail(cluster, serviceName)
    const _this = this
    httpsOpened && loadCertificates(cluster, serviceName, {
      success: {
        func: () => {
          _this.setState({certificateExists: true})
        }
      },
      failed: {
        func: (err) => {
          if (err.statusCode !== 404) {
            new NotificationHandler().error('获取证书失败')
          }
        },
        isAsync: true
      }
    })
  }
  componentWillReceiveProps(nextProps) {
    const { deployment, k8sService, isCurrentTab, certificateExists, getInitHttpsStatus } = nextProps
    const k8sServiceOld = this.props.k8sService
    // get http port and binding domain info if reentry this tab
    if (this.props.isCurrentTab === false && nextProps.isCurrentTab === true) {
      const { serviceName, cluster, loadK8sService, loadServiceDetail } = this.props
      loadK8sService(cluster, serviceName)
      loadServiceDetail(cluster, serviceName)
    }
    const hasHTTPPort = this.hasHTTPPort(k8sService)
    const hasBindingDomainForHttp = this.hasBindingDomainForHttp(k8sService, deployment)
    this.setState({
      hasBindingDomainForHttp: hasBindingDomainForHttp,
      hasHTTPPort: hasHTTPPort,
      certificateExists: certificateExists,
      canOpenHttps: hasBindingDomainForHttp && hasHTTPPort && certificateExists,
    })
    this.setHttpsSwitchState(k8sService)
  }
  hasBindingDomainForHttp(k8sService, deployment) {
    if (!this.hasHTTPPort(k8sService)) {
      return false
    }
    const httpPorts = this.getHTTPPorts(k8sService)
    if (deployment.bindingPort) {
      let bindingPorts = deployment.bindingPort.split(',')
      // check if binding port is a http port
      for (let bindingPort of bindingPorts) {
        const found = httpPorts.some((port) => {
          return (parseInt(port) === parseInt(bindingPort))
        })
        if (found) {
          return true
        }
      }
    }
    return false
  }
  getHTTPPorts(k8sService) {
    let httpPorts = []
    if (k8sService && k8sService.metadata && k8sService.metadata.annotations && k8sService.metadata.annotations[ANNOTATION_SVC_SCHEMA_PORTNAME]) {
      let userPort = k8sService.metadata.annotations[ANNOTATION_SVC_SCHEMA_PORTNAME]

      userPort = userPort.split(',')
      let httpPortNames = []
      for (let item of userPort) {
        const parts = item.split('/')
        if (parts[1].toUpperCase() === "HTTP") {
          httpPortNames.push(parts[0])
        }
      }

      for (let portName of httpPortNames) {
        for (let portInfo of k8sService.spec.ports) {
          if (portName === portInfo.name) {
            httpPorts.push(portInfo.port)
          }
        }
      }
    }
    return httpPorts
  }
  hasHTTPPort(k8sService) {
    const httpPorts = this.getHTTPPorts(k8sService)
    return httpPorts.length !== 0
  }
  toggleHttps(typ) {
    const opText = typ ? '开启' : '关闭'
    const status = typ ? 'on' : 'off'
    const {
      cluster,
      serviceName,
    } = this.props
    this.props.toggleHTTPs(cluster, serviceName, status, {
      success: {
        func: () => {
          this.setState({
            httpsOpened: typ,
          })
          this.props.onSwitchChange(typ)
          new NotificationHandler().success(`HTTPS${opText}成功`)
          this.setState({ statusText: opText })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          new NotificationHandler().error(`HTTPS${opText}失败`)
        },
        isAsync: true
      }
    })
  }
  targetTabs(e) {
    this.setState({
      tabsActive: e
    })
  }
  goLinks(key) {
    // setting ports || binddomain
    this.props.scope.setState({ activeTabKey: key })
  }
  setHttpsSwitchState(k8sService) {
    this.setState({
      httpsOpened: this.getHttpsSwitchState(k8sService),
    })
  }
  getHttpsSwitchState(k8sService) {
    let isOpen = false
    if (k8sService && k8sService.metadata && k8sService.metadata.annotations && k8sService.metadata.annotations[ANNOTATION_HTTPS] === 'true') {
      isOpen = true
    }
    return isOpen
  }
  deleteCertificates() {
    const {
      deleteCertificates,
      cluster,
      serviceName,
      loadCertificates,
    } = this.props
    const _this = this
    deleteCertificates(cluster, serviceName, {
      success: {
        func: () => {
          _this.setState({deleteModal: false, certificateExists: false})
          loadCertificates(cluster, serviceName, {
            failed: {
              func: (err) => {/* do nothing, just catch the error */},
              isAsync: true
            }
          })
          new NotificationHandler().success('删除证书成功')
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          new NotificationHandler().error('删除证书失败，请重试')
        },
        isAsync: true
      }
    })
  }
   copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("httpsInput");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  }
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  }
  render() {
    const {
      hasHTTPPort,
      hasBindingDomainForHttp,
    } = this.state
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    return (
      <div id="settingsHttps">
        <div className="topHead">
          设置HTTPS
          <Tooltip title={this.state.canOpenHttps ? `HTTPS已${this.state.statusText}` : '请先满足设置条件并添加证书'}>
            <Switch disabled={!this.state.canOpenHttps} checkedChildren="开" unCheckedChildren="关" onChange={(e) => this.toggleHttps(e)} checked={this.state.httpsOpened} style={{ marginLeft: '40px' }} />
          </Tooltip>
        </div>
        <Card className="content">
          <div className="info commonBox">
            <div className="titleSpan">设置条件</div>
            <div className="setting">
              <div className="commonTitle">是否已有 HTTP 端口&nbsp;&nbsp;
                <Tooltip title="请在端口中添加"><Icon type="question-circle-o" /></Tooltip>
              </div>
              <div className="commonTitle">
                {this.state.hasHTTPPort ?
                <span className="linked"><Icon type="check-circle-o" style={{marginRight:'6px'}}/>已添加</span> :
                <span className="links" onClick={() => this.goLinks('#ports')}><Icon type="plus-circle-o" style={{ marginRight: '6px' }} />去添加</span>}
              </div>
              <div className="commonTitle">是否在 HTTP 端口绑定域名&nbsp;&nbsp;
                <Tooltip title="请在绑定域名中添加"><Icon type="question-circle-o" /></Tooltip>
              </div>
              <div className="commonTitle">
                {this.state.hasBindingDomainForHttp ?
                <span className="linked"><Icon type="check-circle-o" style={{marginRight:'6px'}}/>已绑定</span> :
                <span className="links" onClick={() => this.goLinks('#binddomain')}><Icon type="link" style={{ marginRight: '6px' }} />去绑定</span>}
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className="hrs"></div>
            <div className="titleSpan">证书</div>
            <div className="certificate">
              <div className="headTab">
                <span className={this.state.tabsActive == 1 ? "tabKey tabs-active" : 'tabKey'} onClick={() => this.targetTabs(1)}>使用自有证书</span>
                {isStandardMode() ? <span className={this.state.tabsActive == 2 ? "tabKey tabs-active" : 'tabKey'} onClick={() => this.targetTabs(2)}>使用Tenxcloud提供的信任证书</span> : null}
              </div>
              <div className="tabsBody">
                <div className={this.state.tabsActive == 1 ? "tabs tabs-active" : 'tabs'}>
                  <Tooltip title={ (!hasHTTPPort || !hasBindingDomainForHttp) ? '请先满足上边的设置条件' : '' }><Button size="large" disabled={!hasHTTPPort || !hasBindingDomainForHttp} onClick={()=> this.setState({createModal: true})}><Icon type="plus" />{this.state.certificateExists ? '更新' : '新建'}</Button></Tooltip>
                  {this.state.certificateExists ?
                    [<div className="ant-table">
                      <table className="certificateTable">
                        <thead>
                          <tr>
                            <th>名称</th>
                            <th>类型</th>
                            <th>开启时间</th>
                            <th>过期时间</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><a onClick={()=> this.setState({detailModal: true})}>{this.props.serviceName}</a></td>
                            <td>服务器证书</td>
                            <td>{this.props.certificate.startTime}</td>
                            <td>{this.props.certificate.expireTime}</td>
                            <td> <Tooltip title={this.state.httpsOpened ? '请先关闭HTTPS再删除证书' : ''}><span className="cursor"><Icon onClick={()=> {this.state.httpsOpened || this.setState({deleteModal: true})}} type="delete" /></span></Tooltip></td>
                          </tr>
                        </tbody>
                      </table>
                      <br/>
                    </div>]
                  :
                    <div className="alertTips">Tips：使用自有的 ssl 证书则需要上传您的证书至该服务</div>
                  }
                </div>

                <div className={this.state.tabsActive == 2 ? "tabs tabs-active" : 'tabs'}>
                  <Button size="large" disabled>敬请期待</Button>
                </div>

              </div>

            </div>
          </div>
        </Card>
        {/* 新建证书 */}
        <UploadSslModal scope={this} />
        {/* 证书详情 */}
        <Modal title="证书详情" visible={this.state.detailModal} className="createSslModal"
        onCancel={()=> this.setState({detailModal: false})}
        footer={<Button type="primary" onClick={()=> this.setState({detailModal: false})} >知道了</Button>}
        >
        <Form horizontal>
          <FormItem {...formItemLayout} label="名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;称">
            <span>{this.props.serviceName}</span>
          </FormItem>
          <FormItem {...formItemLayout} label="证书类型">
            <span>服务器证书</span>
          </FormItem>
          <FormItem {...formItemLayout} label="证书内容" style={{margin:0}}>
            <div className="ant-input" style={{height:'200px', overflow:'auto',wordBreak:'break-word'}}>{this.props.certificate.pem}</div>
            <Tooltip title={this.state.copySuccess ? '复制成功' : '点击复制'}><a  onClick={()=> this.copyDownloadCode()} onMouseLeave={()=> this.returnDefaultTooltip()}><Icon type="copy" /> 复制</a></Tooltip>
            <input className="httpsInput" style={{ position: "absolute", opacity: "0" }} defaultValue= {this.props.certificate.pem}/>
          </FormItem>
          <FormItem {...formItemLayout} label="启用时间">
            {this.props.certificate.startTime}
          </FormItem>
          <FormItem {...formItemLayout} label="过期时间">
            {this.props.certificate.expireTime}
          </FormItem>
        </Form>
      </Modal>
      <Modal title="删除操作" visible={this.state.deleteModal}
        onCancel={()=> this.setState({deleteModal: false})}
        onOk={()=> this.deleteCertificates()}
        >
        <div id="StateBtnModal">
          <div className="confirm"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>您是否确定删除证书：{this.props.serviceName}</div>
        </div>
      </Modal>
        <div className="notice">Tips：HTTPS开启后，原有HTTP服务会自动跳转到HTTPS</div>
      </div>
    )
  }
}

AppSettingsHttps.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const { serviceName } = props
  const camelizeSvcName = camelize(props.serviceName)
  const {
    serviceDetail,
    k8sService,
    certificates,
  } = state.services
  let deployment = {}
  if (serviceDetail && serviceDetail[cluster.clusterID] && serviceDetail[cluster.clusterID][serviceName] && serviceDetail[cluster.clusterID][serviceName].isFetching === false) {
    deployment = serviceDetail[cluster.clusterID][serviceName].service
  }

  let k8sServiceData = {}
  let getInitHttpsStatus = false
  if (k8sService && k8sService.isFetching === false) {
    getInitHttpsStatus = true
  }
  if (k8sService && k8sService.isFetching === false && k8sService.data && k8sService.data[camelizeSvcName]) {
    k8sServiceData = k8sService.data[camelizeSvcName]
  }
  let certificateExists = false
  let certificate = {}
  if (certificates && certificates.isFetching === false && certificates.result && certificates.result.data && certificates.result.statusCode === 200) {
    certificateExists = true
    certificate.startTime = certificates.result.data.certificate.starttime || ''
    certificate.expireTime = certificates.result.data.certificate.endtime || ''
    certificate.pem = certificates.result.data.pem || ''
  }
  return {
    resourcePrice: cluster.resourcePrice,
    k8sService: k8sServiceData,
    deployment,
    certificateExists,
    certificate,
    getInitHttpsStatus,
  }
}

export default connect(mapStateToProps, {
  loadServiceDetail,
  loadK8sService,
  loadCertificates,
  updateCertificates,
  deleteCertificates,
  toggleHTTPs,
})(AppSettingsHttps)