/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  config group list
 *
 * v2.0 - 2016/9/23
 * @author ZhaoXueYu  BaiYu
 */

import React, { Component, PropTypes } from 'react'
import { Row, Icon, Input, Form, Modal, Timeline, Spin, Button, Tooltip, Upload } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
// import ConfigFile from './ServiceConfigFile'
import { loadConfigName, updateConfigName, configGroupName, deleteConfigName, changeConfigFile } from '../../actions/configs'
import { loadAppList } from '../../actions/app_manage'
import NotificationHandler from '../../common/notification_handler'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import unionWith from 'lodash/unionWith'
import isEqual from 'lodash/isEqual'

const FormItem = Form.Item

function formatLinkContainer(data, groupname, name) {
  let linkContainer = []
  if (data.length == 0) return
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].services.length; j++) {
      if (data[i].services[j].spec.template.spec.volumes) {
        for (let k = 0; k < data[i].services[j].spec.template.spec.volumes.length; k++) {
          if (data[i].services[j].spec.template.spec.volumes[k].configMap && data[i].services[j].spec.template.spec.volumes[k].configMap.name == groupname) {
            if (!data[i].services[j].spec.template.spec.volumes[k].configMap.items) {
              linkContainer.push(data[i].services[j].metadata.name)
              continue
            }
            for (let l = 0; l < data[i].services[j].spec.template.spec.volumes[k].configMap.items.length; l++) {
              if (data[i].services[j].spec.template.spec.volumes[k].configMap.items[l].key == name) {
                linkContainer.push(data[i].services[j].metadata.name)
              }
            }
          }
        }
      }
    }
  }
  return linkContainer
}

function formatVolumeMounts(data, groupname, name) {
  let volumeMounts = []
  if (data.length == 0) return
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].services.length; j++) {
      let volumesMap = {}
      if (data[i].services[j].spec.template.spec.volumes) {
        for (let k = 0; k < data[i].services[j].spec.template.spec.volumes.length; k++) {
          let cm = data[i].services[j].spec.template.spec.volumes[k]
          if (cm.configMap && cm.configMap.name == groupname) {
            if (!data[i].services[j].spec.template.spec.volumes[k].configMap.items) {
              volumesMap[cm.name] = cm
              continue
            }
            for (let l = 0; l < data[i].services[j].spec.template.spec.volumes[k].configMap.items.length; l++) {
              if (data[i].services[j].spec.template.spec.volumes[k].configMap.items[l].key == name) {
                volumesMap[cm.name] = cm
              }
            }
          }
        }
      }
      let containers = data[i].services[j].spec.template.spec.containers
      for (var k in containers) {
        if (containers[k].volumeMounts) {
          for (var l in containers[k].volumeMounts) {
            if (volumesMap[containers[k].volumeMounts[l].name]) {
              const volumeMount = containers[k].volumeMounts[l]
              const configMap = volumesMap[containers[k].volumeMounts[l].name]
              if (configMap.configMap.items) {
                configMap.configMap.items.forEach(item => {
                  // If it's not whole directory mount, match the subPath
                  if (volumeMount.subPath) {
                    if (volumeMount.subPath === name) {
                      volumeMounts = unionWith(volumeMounts, [{
                        imageName: data[i].name,
                        serviceName: data[i].services[j].metadata.name,
                        mountPath: volumeMount.mountPath
                      }], isEqual)
                    }
                  } else {
                    volumeMounts = unionWith(volumeMounts, [{
                      imageName: data[i].name,
                      serviceName: data[i].services[j].metadata.name,
                      mountPath: volumeMount.mountPath
                    }], isEqual)
                  }
                })
              } else {
                volumeMounts = unionWith(volumeMounts, [{
                  imageName: data[i].name,
                  serviceName: data[i].services[j].metadata.name,
                  mountPath: volumeMount.mountPath
                }], isEqual)
              }
            }
          }
        }
      }
    }
  }
  return volumeMounts
}

const createForm = Form.create

let CreateConfigFileModal = React.createClass({
  getInitialState() {
    return {
      filePath: '请上传文件或直接输入内容'
    }
  },
  editConfigFile(group) {
    const parentScope = this.props.scope
    const _this = this
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      let notification = new NotificationHandler()
      const groups = {
        group, name: parentScope.state.configName,
        cluster: parentScope.props.cluster,
        desc: values.configDesc
      }
      parentScope.props.updateConfigName(groups, {
        success: {
          func: () => {
            parentScope.setState({
              modalConfigFile: false,
            })
            _this.setState({
              filePath: "请上传文件或直接输入内容"
            })
            setTimeout(() => _this.props.form.resetFields())
            notification.success('修改配置文件成功')
          },
          isAsync: true
        }
      })
    })

  },
  configDescExists(rule, value, callback) {
    const form = this.props.form;
    if (!value) {
      this.setState({
        filePath: '请上传文件或直接输入内容'
      })
      callback([new Error('内容不能为空，请重新输入内容')])
      return
    }
    callback()
  },
  closeModal() {
    const parentScope = this.props.scope
    this.props.form.resetFields()
    parentScope.setState({modalConfigFile:false})
    this.setState({
      filePath: '请上传文件或直接输入内容'
    })
  },
  beforeUpload(file) {
    const fileInput = this.uploadInput.refs.upload.refs.inner.refs.file
    const fileType = fileInput.value.substr(fileInput.value.lastIndexOf('.') + 1)
    const notify = new NotificationHandler()
    if(!/xml|json|conf|config|data|ini|txt/.test(fileType)) {
      notify.error('目前仅支持 xml/json/conf/config/data/ini/txt 格式')
      return false
    }
    const self = this
    const fileName = fileInput.value.substr(fileInput.value.lastIndexOf('\\') + 1)
    self.setState({
      disableUpload: true,
      filePath: '上传文件为 ' + fileName
    })
    notify.spin('读取文件内容中，请稍后')
    const fileReader = new FileReader()
    fileReader.onerror = function(err) {
      self.setState({
        disableUpload: false,
      })
      notify.close()
      notify.error('读取文件内容失败')
    }
    fileReader.onload = function() {
      self.setState({
        disableUpload: false
      })
      notify.close()
      notify.success('文件内容读取完成')
      self.props.form.setFieldsValue({
        configDesc: fileReader.result.replace(/\r\n/g, '\n')
      })
    }
    fileReader.readAsText(file)
    return false
  },
  render() {
    const { getFieldProps } = this.props.form
    const parentScope = this.props.scope
    const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 21 } }
    const descProps = getFieldProps('configDesc', {
      rules: [
        { validator: this.configDescExists },
      ],
      initialValue: parentScope.state.configtextarea
    })
    return(
      <Modal
        title="修改配置文件"
        wrapClassName="configFile-create-modal"
        visible={this.props.modalConfigFile}
        onOk={() => this.editConfigFile(parentScope.props.groupname)}
        onCancel={() => this.closeModal() }
        width="600px"
        >
        <div className="configFile-inf" style={{ padding: '0 10px' }}>
          <div className="configFile-tip" style={{ color: "#16a3ea", height: '35px', textIndent: '10px' }}>
            &nbsp;&nbsp;&nbsp;<Icon type="info-circle-o" style={{ marginRight: "10px" }} />
            即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置
          </div>
          <Form horizontal>
            <FormItem  {...formItemLayout} label="名称">
              <Input type="text" disabled  value={parentScope.state.configName}/>
            </FormItem>
            <FormItem>
              <Upload beforeUpload={(file) => this.beforeUpload(file)} showUploadList={false} style={{marginLeft: '38px'}} ref={(instance) => this.uploadInput = instance}>
                <span style={{width: '325px', display:'inline-block'}}>{this.state.filePath}</span>
                <Button type="ghost" style={{marginLeft: '10px'}} disable={this.state.disableUpload}>
                  <Icon type="upload" /> 读取文件内容
                </Button>
              </Upload>
            </FormItem>
            <FormItem {...formItemLayout} label="内容">
              <Input type="textarea" style={{ minHeight: '300px' }} {...descProps}/>
            </FormItem>
          </Form>
        </div>
      </Modal>
    )
  }
})

CreateConfigFileModal = createForm()(CreateConfigFileModal)

class CollapseContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalConfigFile: false,
      configtextarea: '',
      checkConfigFile: false
      // collapseContainer: this.props.collapseContainer

    }
  }
  componentWillMount() {
    // 暂时不重新加载 group file 父组件已经返回了
    const { loadAppList ,cluster} = this.props
    // this.props.loadConfigName(groupname)
    loadAppList(cluster)

  }

  editConfigModal(group, configName) {
    const groups = { group, Name: configName }

    const self = this
    const { cluster } = this.props
    this.props.loadConfigName(cluster, groups, {
      success: {
        func: (res) => {
          self.setState({
            modalConfigFile: true,
            configName: configName,
            configtextarea: res.data
          })
        },
        isAsync: true
      }
    })

  }

  setInputValue(e) {
    this.setState({ configtextarea: e.target.value })
  }
  deleteConfigModal(group, Name) {
    this.setState({configName: Name, configGroup: group, delModal: true})
  }
  deleteConfigFile() {
    let configs = []
    configs.push(this.state.configName)
    const groups = {
      group: this.state.configGroup,
      cluster: this.props.cluster,
      configs
    }
    const self = this
    const {parentScope} = this.props
    let notification = new NotificationHandler()
    this.setState({delModal: false})
    self.props.deleteConfigName(groups, {
      success: {
        func: (res) => {
          const errorText = []
          if (res.message.length > 0) {
            res.message.forEach(function (list) {
              errorText.push({
                name: list.name,
                text: list.error
              })
            })
            const content = errorText.map(list => {
              return (
                <h3>{list.name} ：{list.text}</h3>
              )
            })
            Modal.error({
              title: '删除配置文件失败!',
              content
            })
          } else {
            notification.success('删除配置文件成功')
            self.props.configGroupName(groups)
          }
        },
        isAsync: true
      }
    })


  }
  render() {
    const { collapseContainer, groupname } = this.props
    const self = this
    const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 21 } }
    let configFileList
    if (collapseContainer.length === 0) {
      return (
        <div className='li' style={{ lineHeight: '60px', height: '10px' }}>未添加配置文件</div>
      )
    }
    if (!collapseContainer) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }

    configFileList = collapseContainer.map((configFileItem) => {
      let mounts = null
      let volume = null
      let imageName = ''
      if (self.props.appList && self.props.appList.length > 0) {
        imageName = formatLinkContainer(self.props.appList, groupname, configFileItem.name)
        if (imageName.length ==0) {
          volume = (<td style={{ textAlign: 'center' }}>
            <div>暂无挂载</div>
          </td>
          )
        } else {
          mounts = formatVolumeMounts(self.props.appList, groupname, configFileItem.name)
          volume = mounts.slice(0, 1).map((list, index) => {
            return (
              <td key={`key@${index}`}>
                <div className="li">应用：<Link to={`/app_manage/detail/${list.imageName}`}>{list.imageName}</Link>，服务：{list.serviceName}</div>
                <div className='lis textoverflow'>{list.mountPath}</div>
              </td>
            )
          })
        }
      } else {
        volume = (
          <td style={{ textAlign: 'center' }}>
            <div>暂无挂载</div>
          </td>
        )
      }
      return (
        <Timeline.Item key={configFileItem.name}>
          <Row className='file-item'>
            <div className='line'></div>
            <table>
              <tbody>
                <tr>
                  <td style={{ padding: '15px' }}>
                    <div style={{ width: '160px' }} className='textoverflow'><Icon type='file-text' style={{ marginRight: '10px',float:'left' }} />
                      <Tooltip title={configFileItem.name} placement="topLeft">
                        <div style={{float:'left',width:'130px'}} className="textoverflow">{configFileItem.name}</div>
                      </Tooltip>
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <Button type='primary' style={{ height: '30px', padding: '0 9px' }}
                      onClick={() => this.editConfigModal(this.props.groupname, configFileItem.name)}>
                      <Icon type='edit' />
                    </Button>
                    <Button type='ghost' onClick={() => this.deleteConfigModal(this.props.groupname, configFileItem.name)} style={{ marginLeft: '10px', height: '30px', padding: '0 9px', backgroundColor: '#fff' }} className='config-cross'>
                      <Icon type='cross' />
                    </Button>
                  </td>
                  <td style={{ width: '130px' }}>
                    <div className='li'>关联服务 <span className='node-number'>{Array.from(new Set(imageName)).length}</span></div>
                    <div className='lis'>挂载路径</div>
                  </td>
                  { volume }

                  {(mounts && mounts.length >1) ?
                    [<td style={{ textAlign: 'center' }}>
                      <div style={{cursor:'pointer'}} onClick={()=> {this.setState({[this.props.groupname + configFileItem.name]: true})}}><a>查看更多</a></div>
                    </td>]
                    :null
                  }
                </tr>
              </tbody>
            </table>
            <Modal
              title={`配置文件 ${configFileItem.name}`}
              wrapClassName="server-check-modal"
              visible={this.state[this.props.groupname + configFileItem.name]}
              onCancel={() => { this.setState({ [this.props.groupname + configFileItem.name]: false }) } }
              >
              <div className="check-config-head">
                <div className="span4">服务名称</div>
                <div className="span6">挂载路径</div>
              </div>
                {/*查看更多-关联容器列表-start*/}
                {mounts && mounts.slice(1).map((list) => {
                  return (
                    <div className="check-config">
                      <div className="span4"><Link to={`/app_manage/detail/${list.imageName}`}>{list.serviceName}</Link></div>
                      <div className="span6">{list.mountPath}</div>
                    </div>
                  )
                })}
                {/*查看更多-关联容器列表*-end*/}
            </Modal>
          </Row>
        </Timeline.Item>
      )

    })
    return (
      <Row className='file-list'>
        <Timeline>
          {configFileList}
        </Timeline>
        {/*                     修改配置文件-弹出层-start     */}
        <CreateConfigFileModal scope={this} modalConfigFile={this.state.modalConfigFile}/>

        {/* <Modal
          title='修改配置文件'
          wrapClassName='configFile-create-modal'
          visible={this.state.modalConfigFile}
          onOk={() => this.editConfigFile(this.props.groupname)}
          onCancel={() => { this.setState({ modalConfigFile: false }) } }
          width = "600px"
          >
          <div className='configFile-inf'>
            <p className='configFile-tip' style={{ color: '#16a3ea', height: '35px', textIndent: '12px' }}>
              &nbsp;&nbsp;&nbsp;<Icon type='info-circle-o' style={{ marginRight: '10px' }} />
              即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置
            </p>
            <Form horizontal>
              <FormItem  {...formItemLayout} label='名称'>
                <Input type='text' className='configName' disabled={true} value={this.state.configName} />
              </FormItem>
              <FormItem {...formItemLayout} label='内容'>
                <Input type='textarea' style={{ minHeight: 300 }} value={this.state.configtextarea} onChange={(e) => this.setInputValue(e)} />
              </FormItem>
            </Form>
          </div>
        </Modal>*/}
        <Modal title="删除配置文件操作" visible={this.state.delModal}
          onOk={()=> this.deleteConfigFile()} onCancel={()=> this.setState({delModal: false})}
        >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除配置文件 {this.state.configName}?</div>
        </Modal>
        {/*              修改配置文件-弹出层-end                */}
      </Row>
    )
  }
}

CollapseContainer.propTypes = {
  // collapseContainer: PropTypes.array.isRequired,
  configGroupName: PropTypes.func.isRequired,
  loadConfigName: PropTypes.func.isRequired,
  deleteConfigName: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  groupname: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired
}
function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultConfigList = {
    isFetching: false,
    cluster: cluster.clusterID,
    configName: '',
  }
  const { configGroupList, loadConfigName} = state.configReducers
  const { configNameList, isFetching} = configGroupList[cluster.clusterID] || defaultConfigList
  const { appItems } = state.apps
  const { appList } = appItems[cluster.clusterID] || []
  return {
    cluster: cluster.clusterID,
    isFetching,
    configNameList,
    appList
  }
}

export default connect(mapStateToProps, {
  loadConfigName,
  updateConfigName,
  deleteConfigName,
  configGroupName,
  loadAppList

})(injectIntl(CollapseContainer, {
  withRef: true,
}))