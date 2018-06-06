/**
 *
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Config Group
 *
 * v0.1 - 2016/9/23
 * @author ZhaoXueYu BaiYu
 */

import React, { Component, PropTypes } from 'react'
import { Row, Col, Modal, Button, Form, Icon, Checkbox, Menu, Dropdown, Input, Upload } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { createConfigFiles, deleteConfigGroup, deleteConfigFiles, addConfigFile } from '../../actions/configs'
import { connect } from 'react-redux'
import { calcuDate } from '../../common/tools.js'
import NotificationHandler from '../../common/notification_handler'
import { validateServiceConfigFile } from '../../common/naming_validation'
import { USERNAME_REG_EXP_NEW } from '../../constants'
import { validateK8sResource } from '../../common/naming_validation'
const ButtonGroup = Button.Group
const FormItem = Form.Item
const createForm = Form.create

let CreateConfigFileModal = React.createClass({
  getInitialState() {
    return {
      filePath: '请上传文件或直接输入内容'
    }
  },
  configNameExists(rule, value, callback) {
    const form = this.props.form;
    if (!value) {
      callback([new Error('请输入配置文件名称')])
      return
    }
    if(value.length < 3 || value.length > 63) {
      callback([new Error('配置文件名称长度为 3-63 个字符')])
      return
    }
    if(/^[\u4e00-\u9fa5]+$/i.test(value)){
      callback([new Error('名称由英文、数字、点、下\中划线组成, 且名称和后缀以英文或数字开头和结尾')])
      return
    }
    if (!validateServiceConfigFile(value)) {
      callback([new Error('名称由英文、数字、点、下\中划线组成, 且名称和后缀以英文或数字开头和结尾')])
      return
    }
    callback()
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

  createConfigFile(group) {
    const parentScope = this.props.scope
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }

      let configfile = {
        group,
        cluster: parentScope.props.cluster.clusterID,
        name: values.configName,
        desc: values.configDesc
      }
      let self = this
      // const {parentScope} = this.props
      let notification = new NotificationHandler()
      parentScope.props.createConfigFiles(configfile, {
        success: {
          func: () => {
            notification.success('创建配置文件成功')
            setTimeout(() => self.props.form.resetFields(), 0)
            parentScope.props.addConfigFile(configfile)
            self.setState({
              filePath: '请上传文件或直接输入内容'
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            let errorText
            switch (res.message.code) {
              case 403: errorText = '添加配置文件过多'; break
              case 409: errorText = '配置已存在'; break
              case 500: errorText = '网络异常'; break
              default: errorText = '缺少参数或格式错误'
            }
            self.setState({
              filePath: '请上传文件或直接输入内容'
            })
            notification.error('添加配置文件失败', errorText)
          }
        }
      })
      parentScope.setState({
        modalConfigFile: false,
      })
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
        disableUpload: false,
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
  cancelModal(e) {
    const parentScope = this.props.scope
    this.setState({
      filePath: '请上传文件或直接输入内容'
    })
    this.props.form.resetFields()
    parentScope.createConfigModal(e, false)
  },
  render() {
    const { getFieldProps } = this.props.form
    const parentScope = this.props.scope
    const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 21 } }
    const nameProps = getFieldProps('configName', {
      rules: [
        { validator: this.configNameExists },
      ],
    });
    const descProps = getFieldProps('configDesc', {
      rules: [
        { validator: this.configDescExists },
      ]
    });
    return(
      <Modal
        title="添加配置文件"
        wrapClassName="configFile-create-modal"
        visible={parentScope.state.modalConfigFile}
        onOk={() => this.createConfigFile(this.props.groupName)}
        onCancel={(e) => this.cancelModal(e)}
        width="600px"
        >
        <div className="configFile-inf" style={{ padding: '0 10px' }}>
          <div className="configFile-tip" style={{ color: "#16a3ea", height: '35px', textIndent: '10px' }}>
            &nbsp;&nbsp;&nbsp;<Icon type="info-circle-o" style={{ marginRight: "10px" }} />
            即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置
          </div>
          <Form horizontal>
            <FormItem  {...formItemLayout} label="名称">
              <Input type="text" {...nameProps} className="nameInput" />
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


class CollapseHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalConfigFile: false,
      sizeNumber: this.props.sizeNumber,
      configNameList: this.props.configNameList
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      configNameList: nextProps.configNameList,
      sizeNumber: nextProps.sizeNumber
    })
  }
  // click config modal show
  createConfigModal(e, modal) {
    e.stopPropagation()
    this.setState({ modalConfigFile: modal })
    if (modal) {
      setTimeout(function(){
        document.getElementsByClassName('nameInput')[0].focus()
      },500)
    }
  }

  handleDropdown(e) {
    e.stopPropagation()
  }
  handChage(e, Id) {
    this.props.handChageProp(e,Id)
  }
  btnDeleteGroup() {
    const self = this
    let configArray = []
    configArray.push(this.state.groupName)
    let configData = {
      cluster: this.props.cluster.clusterID,
      "groups": configArray
    }
    let notification = new NotificationHandler()
    self.props.deleteConfigGroup(configData, {
      success: {
        func: (res) => {
          // self.props.loadConfigGroup()
          const errorText =[]
          if (res.message.length > 0) {
            res.message.forEach(function(list){
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
              title:'删除配置组失败!',
              content
            })
          } else {
            notification.success('删除成功')
          }
        },
        isAsync: true
      }
    })
    this.setState({delModal: false})

  }
  render() {
    const {collapseHeader } = this.props
    const {sizeNumber} = this.state
    const menu = (
      <Menu onClick={() => this.setState({delModal: true, groupName: collapseHeader.name})} mode="vertical">
        <Menu.Item key="1"><Icon type="delete" /> 删除配置组</Menu.Item>
      </Menu>
    );
    return (
      <Row>
        <Col className="group-name textoverflow" span="6">
          <Checkbox checked={(this.props.configArray.indexOf(collapseHeader.name) >-1)} onChange={(e) => this.handChage(e, collapseHeader.name)} onClick={(e) => this.handleDropdown(e)}></Checkbox>
          <Icon type="folder-open" />
          <Icon type="folder" />
          <span>{collapseHeader.name}</span>
        </Col>
        <Col span="6">
          配置文件 &nbsp;
          {sizeNumber}个
        </Col>
        <Col span="6">
          创建时间&nbsp;&nbsp;{calcuDate(collapseHeader.creationTimestamp)}
        </Col>
        <Col span="6">
          <ButtonGroup onClick={(e)=>this.handleDropdown(e)}>
            <Dropdown.Button size='large' onClick={(e) => this.createConfigModal(e, true)} overlay={menu} type="ghost">
              <span style={{ fontSize:'14px !important' }}><Icon type="plus" />&nbsp;配置文件</span>
            </Dropdown.Button>
          </ButtonGroup>
          {/*添加配置文件-弹出层-start*/}
          <CreateConfigFileModal scope={this} groupName={collapseHeader.name}/>
          {/*添加配置文件-弹出层-end*/}

          {/*删除配置文件-弹出层 */}

          <Modal title="删除配置操作" visible={this.state.delModal}
          onOk={()=> this.btnDeleteGroup()} onCancel={()=> this.setState({delModal: false})}
          >
            <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除配置组 {collapseHeader.name} ?</div>
          </Modal>
        </Col>
      </Row>
    )
  }
}

CollapseHeader.propTypes = {
  collapseHeader: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  createConfigFiles: PropTypes.func.isRequired,
  deleteConfigGroup: PropTypes.func.isRequired
}
function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultConfigFiles = {
    isFetching: false,
    cluster: cluster.clusterID,
    configFiles: [],
    configNameList: []
  }

  const { configGroupList  } = state.configReducers

  const {configFiles, isFetching, configNameList} = configGroupList[cluster.clusterID] || defaultConfigFiles
  return {
    configFiles,
    cluster,
    isFetching,
    configNameList
  }
}

function mapDispatchToProps(dispatch) {
  return {
    createConfigFiles: (obj, callback) => { dispatch(createConfigFiles(obj, callback)) },
    deleteConfigGroup: (obj, callback) => { dispatch(deleteConfigGroup(obj, callback)) },
    addConfigFile: (configFile) => dispatch(addConfigFile(configFile))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CollapseHeader, {
  withRef: true,
}))


