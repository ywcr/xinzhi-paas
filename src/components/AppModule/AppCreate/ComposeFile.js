/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ComposeFile component
 *
 * v0.1 - 2016-09-20
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Dropdown, Modal, Checkbox, Button, Card, Menu, Input, Select, Popconfirm, Form, Icon } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ComposeFile.less"
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { createApp, checkAppName } from '../../../actions/app_manage'
import { loadStackDetail } from '../../../actions/app_center'
import YamlEditor from '../../Editor/Yaml'
import * as yaml from 'js-yaml'
import { browserHistory } from 'react-router'
import AppAddStackModal from './AppAddStackModal'
import { appNameCheck } from '../../../common/naming_validation'
import NotificationHandler from '../../../common/notification_handler'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import { SERVICE_KUBE_NODE_PORT } from '../../../../constants'
import ResourceQuotaModal from '../../ResourceQuotaModal'

const FormItem = Form.Item;
const createForm = Form.create;

const defaultEditOpts = {
  readOnly: false,
}

class ComposeFile extends Component {
  constructor(props) {
    super(props);
    this.subApp = this.subApp.bind(this)
    this.handleYaml = this.handleYaml.bind(this)
    this.confirm = this.confirm.bind(this)
    this.cancel = this.cancel.bind(this)
    this.handleForm = this.handleForm.bind(this)
    this.appNameCheck = this.appNameCheck.bind(this)
    this.remarkCheck = this.remarkCheck.bind(this)
    this.editYamlSetState = this.editYamlSetState.bind(this)
    this.handleVisibleChange = this.handleVisibleChange.bind(this)

    let serviceList = JSON.parse(sessionStorage.getItem('servicesList'))
    let selectedList = JSON.parse(sessionStorage.getItem('selectedList'))
    let serviceDesc = {}
    let deploymentDesc = {}
    let desc = []
    if (serviceList) {
      let newServiceList = serviceList.filter(function (service) {
        return selectedList.includes(service.id)
      })
      newServiceList.map(function (item) {
        serviceDesc = item.inf.Service
        deploymentDesc = item.inf.Deployment
        desc.push(yaml.dump(serviceDesc), yaml.dump(deploymentDesc))
      })
    }
    this.state = {
      appName: sessionStorage.getItem("transientAppName"),
      appDescYaml: desc.join('---\n'),
      remark: '',
      visible: false,
      condition: true,
      modalShow: false,
      stackType: true,
      createDisabled: false,
      resourceQuotaModal: false,
      resourceQuota: null,
    }
  }
  componentWillMount() {
    const { templateid } = this.props.location.query
    const { externalIPs, loginUser } = this.props
    const self = this
    if (templateid) {
      this.props.loadStackDetail(templateid, {
        success: {
          func: (res) => {
            let yamlContent = res.data.data.content
            let convertedContent = ''
            // Parse yaml and set the external ip for service template
            if(yamlContent.indexOf('---') > -1) {
              let yamlList = yamlContent.split('---');
              yamlList.map((item, index) => {
                try {
                  let yamlObj = yaml.safeLoad(item)
                  if (yamlObj.kind === "Service") {
                    // Update external IP to current cluster one
                    if ((!yamlObj.spec.externalIPs ||  yamlObj.spec.externalIPs == "") && externalIPs) {
                      yamlObj.spec.externalIPs = eval(externalIPs)
                    }
                    // Update proxy type to NodePort if proxy is kube-nodeport
                    if (loginUser.info.proxyType == SERVICE_KUBE_NODE_PORT) {
                      yamlObj.spec.type = 'NodePort'
                    }
                  }
                  convertedContent += yaml.dump(yamlObj)
                  if (index != yamlList.length - 1) {
                    convertedContent += '---\n'
                  }
                } catch(error) {
                  let notification = new NotificationHandler()
                  notification.error("加载编排文件失败，请检查后重试.")
                  return
                }
              })
            }
            self.setState({
              appDescYaml: convertedContent,
              stackType: false
            })
          }
        }
      })
    }
    if (this.props.location.query.hasOwnProperty('query')) {
      self.setState({
        stackType: false
      })
    }
    setTimeout(() => {
      this.appNameInput.refs.input.focus()
    })
  }
  subApp() {
    const { appName, appDescYaml, remark } = this.state
    const { cluster } = this.props
    let notification = new NotificationHandler()
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      let appConfig = {
        cluster,
        template: appDescYaml,
        appName: appName,
        desc: remark,
      }
      let self = this
      if (appConfig.template == '') {
        notification.error('请选择编排文件')
        return
      }
      this.setState({
        createDisabled: true,
      })
      this.props.createApp(appConfig, {
        success: {
          func: () => {
            self.setState({
              appName: '',
              remark: '',
            })
            sessionStorage.removeItem('servicesList')
            sessionStorage.removeItem('selectedList')
            sessionStorage.removeItem('transientAppName')
            browserHistory.push('/app_manage')
          },
          isAsync: true
        },
        failed: {
          func: err => {
            this.setState({
              createDisabled: false,
            })
            if(err.statusCode == 403) {
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
              notification.error('创建应用失败', '集群资源不足')
              return
            }
            const { message } = err
            notification.error('创建应用失败', message)
          },
          isAsync: true
        },
      })

    });
  }
  handleYaml(e) {
    this.setState({
      appDescYaml: e.target.value,
      condition: false,
    })
  }
  confirm() {
    this.setState({ visible: false });
    browserHistory.push('/app_manage/app_create/quick_create')
  }
  cancel() {
    this.setState({ visible: false })
  }
  handleVisibleChange(visible) {
    if (!visible) {
      this.setState({ visible })
      return
    }
    if (this.state.condition) {
      this.confirm()
    } else {
      this.setState({ visible })
    }
  }
  appNameCheck(rule, value, callback) {
    // const { needAppName} = this.state
    const { cluster, checkAppName } = this.props
    const self = this
    /*if (!value || needAppName) {
      callback([new Error('请输入应用名称')])
      // validateAppName
      return
    }*/
    let errorMsg = appNameCheck(value, '应用名称')
    if (errorMsg != 'success') {
      return callback([new Error(errorMsg)])
    }
    clearTimeout(this.appNameCheckTimeout)
    this.setState({
      createDisabled: true,
    })
    this.appNameCheckTimeout = setTimeout(() => {
      checkAppName(cluster, value, {
        success: {
          func: (result) => {
            self.setState({
              createDisabled: false,
            })
            if (result.data) {
              errorMsg = appNameCheck(value, '应用名称', true)
              callback([new Error(errorMsg)])
              return
            }
            this.setState({
              appName: value,
            })
            callback()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            self.setState({
              createDisabled: false,
            })
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  remarkCheck(rule, value, callback) {
    this.setState({
      remark: value
    })
    if (this.state.appName === '') {
      const { validateFields } = this.props.form
      validateFields(['appNameFormCheck'], { force: true })
    }
    callback()
  }
  handleForm() {
    this.props.form.validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        this.setState({
          disable: true,
        })
        return
      }
    })
  }
  editYamlSetState(e) {
    //this function for yaml edit callback function
    this.setState({
      appDescYaml: e
    })
  }
  selectStack() {
    this.setState({
      modalShow: true
    })
    setTimeout(function() {
      document.getElementById('stackName').focus()
    },100)
  }
  cacheAppName() {
    sessionStorage.setItem("transientAppName", this.state.appName || '')
    sessionStorage.setItem("forCacheServiceList", true);
    browserHistory.goBack()
  }
  closeModal() {
    this.setState({
      modalShow: false
    })
  }
  render() {
    const { appDescYaml, remark, createDisabled } = this.state
    const { getFieldProps, getFieldValue, getFieldError, isFieldValidating } = this.props.form
    const appNameFormCheck = getFieldProps('appNameFormCheck', {
      rules: [
        { validator: this.appNameCheck }
      ]
    })

    const remarkFormCheck = getFieldProps('remarkFormCheck', {
      rules: [
        { validator: this.remarkCheck },
      ]
    })
    const parentScope = this.props.scope;
    const createModel = parentScope.state.createModel;
    return (
      <QueueAnim id="ComposeFile"
        type="right"
        >
        <Form horizontal>
          <div className="ComposeFile" key="ComposeFile">
            <div className="nameBox">
              <span>应用名称</span>
              <FormItem
                hasFeedback
                help={isFieldValidating('appNameFormCheck') ? '校验中...' : (getFieldError('appNameFormCheck') || []).join(', ')}
                >
                <Input size="large"
                  placeholder="请输入应用名称"
                  autoComplete="off"
                  {...appNameFormCheck}
                  ref={(ref) => { this.appNameInput = ref; }}/>
              </FormItem>
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="introBox">
              <span>应用描述</span>
              <FormItem hasFeedback>
                <Input size="large"
                  placeholder="请输入应用描述"
                  {...remarkFormCheck}
                  value={remark} />
              </FormItem>
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="composeBox">
              {this.state.stackType ?

                <div className="topBox">
                  <span>编排文件</span>
                  <span>{this.state.templateName}</span>
                  <Button size="large" type="primary" onClick={() => this.selectStack()}>
                    选择编排
                </Button>

                </div>
                : null
              }
              <div className="bottomBox">
                <span className='titleSpan'>编排内容</span>
                <div className="textareaBox">
                  <YamlEditor value={appDescYaml} options={defaultEditOpts} parentId={'AppCreate'} callback={this.editYamlSetState} />
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
            </div>
            <div className="btnBox">
              <Popconfirm title="返回上一步,改动将丢失"
                okText="确认"
                cancelText="取消"
                onVisibleChange={this.handleVisibleChange}
                onConfirm={this.confirm}
                onCancel={this.cancel}
                visible={this.state.visible}>
                <Button size="large" type="primary" className="lastBtn" onClick={() => this.cacheAppName()}>
                  上一步
                  </Button>
              </Popconfirm>
              <Button disabled={createDisabled} size="large" type="primary" className="createBtn" onClick={this.subApp}>
                创建
              </Button>
            </div>
          </div>
        </Form>
        <Modal title="选择编排文件"
          visible={this.state.modalShow}
          className="AddStackModal"
          width="650px"
          onCancel={() => this.closeModal()}
          footer={
            <Button size="large" onClick={()=> this.closeModal()}>关闭</Button>
          }
          >
          <AppAddStackModal scope={this} />
        </Modal>
        <ResourceQuotaModal
          visible={this.state.resourceQuotaModal}
          closeModal={() => this.setState({resourceQuotaModal: false})}
          {...this.state.resourceQuota} />
      </QueueAnim>
    )
  }
}

ComposeFile.propTypes = {
  intl: PropTypes.object.isRequired,
}
function mapStateToProps(state) {
  const { loginUser } = state.entities
  const { cluster } = state.entities.current
  return {
    loginUser: loginUser,
    cluster: cluster.clusterID,
    externalIPs: cluster.publicIPs,
    createApp: state.apps.createApp,
    checkAppName: state.apps.checkAppName
  }
}

ComposeFile = connect(mapStateToProps, {
  createApp,
  checkAppName,
  loadStackDetail
})(injectIntl(ComposeFile, {
  withRef: true,
}))

ComposeFile = createForm()(ComposeFile)

export default ComposeFile

