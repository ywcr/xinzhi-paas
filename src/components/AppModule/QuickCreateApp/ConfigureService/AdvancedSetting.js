/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: advanced setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */
import React, { PropTypes } from 'react'
import NotificationHandler from '../../../../common/notification_handler.js'
import {
  Form, Collapse, Row, Col, Input, Tooltip, Button, Icon
} from 'antd'
import { appEnvCheck } from '../../../../common/naming_validation'
import './style/AdvancedSetting.less'

const Panel = Collapse.Panel
const FormItem = Form.Item

const AdvancedSetting = React.createClass({
  getInitialState(){
    return {
      activeKey: null,
    }
  },
  componentWillReceiveProps(nextProps){
    let nextKey = nextProps.AdvancedSettingKey
    let currentKey = this.props.AdvancedSettingKey
    if((nextKey == '1' || currentKey == '1') && this.state.activeKey !== '1'){
      this.setState({
        activeKey: '1'
      })
    }
  },
  addEnvKey() {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    let envKeys = getFieldValue('envKeys') || []
    const validateFieldsKeys = []
    envKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      validateFieldsKeys.push(`envName${keyValue}`)
      validateFieldsKeys.push(`envValue${keyValue}`)
    })
    validateFields(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      const key = envKeys[envKeys.length - 1] || { value: 0 }
      let uid = key.value
      uid ++
      envKeys = envKeys.concat({ value: uid })
      setFieldsValue({
        envKeys,
      })
      setTimeout(()=>{
        let input = document.getElementById(`envName${uid}`)
        input && input.focus()
      },0)
    })
  },
  removeEnvKey(keyValue) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    const envKeys = getFieldValue('envKeys') || []
    setFieldsValue({
      envKeys: envKeys.map(_key => {
        if (_key.value === keyValue) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          _key.deleted = true
        }
        return _key
      })
    })
  },
  checkEnv(rule, value, callback) {
    if (!value) {
      return callback()
    }
    let errorMsg = appEnvCheck(value, '环境变量');
    if (errorMsg === 'success') {
      return callback()
    }
    callback(errorMsg)
  },
  checkEnvaaa(rule, value, callback){
    callback()
    if(value == undefined||value == null){
 const notification = new NotificationHandler()
    notification.error('高级设置中环境变量，键和值不能为空')
    }
  },
  renderEnvItem(key) {
    if (key.deleted) {
      return
    }
    
    const { form } = this.props
    const { getFieldProps } = form
    const keyValue = key.value
    const envNameKey = `envName${keyValue}`
    const envValueKey = `envValue${keyValue}`
    const envNameProps = getFieldProps(envNameKey, {
      rules: [
        { required: true, message: '请填写键' },
        { validator: this.checkEnv },
      ],
    })
    const envValueProps = getFieldProps(envValueKey, {
       rules: [
         { required: true, message: '请填写值' },
         { validator: this.checkEnvaaa },
       ],
    })
    return (
      <Row className="configItem" key={`configItem${keyValue}`}>
        <Col span={8}>
          <FormItem>
            <Input size="default" placeholder="请填写键" {...envNameProps} />
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem>
            <Input size="default" placeholder="请填写值" {...envValueProps} />
          </FormItem>
        </Col>
        <Col span={8}>
          <Tooltip title="删除">
            <Button
              className="deleteBtn"
              type="dashed"
              size="small"
              onClick={this.removeEnvKey.bind(this, keyValue)}
            >
              <Icon type="delete" />
            </Button>
          </Tooltip>
        </Col>
      </Row>
    )
  },
  collapseChange(key){
    this.setState({
      activeKey: key
    })
  },
  render() {
    const { formItemLayout, form } = this.props
    const { getFieldValue } = form
    const envKeys = getFieldValue('envKeys') || []
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">高级设置</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">在高级设置里，您可以修改环境变量配置</div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div id="advancedConfigureService">
        <Collapse onChange={this.collapseChange} activeKey={this.state.activeKey}>
          <Panel header={header} key="1">
            <Row>
              <Col span={formItemLayout.labelCol.span} className="formItemLabel">
                环境变量
              </Col>
              <Col span={formItemLayout.wrapperCol.span}>
                <div className="envConfig">
                  <Row className="configHeader">
                    <Col span={8}>
                      键
                    </Col>
                    <Col span={8}>
                      值
                    </Col>
                    <Col span={8}>
                      操作
                    </Col>
                  </Row>
                  <div className="configBody">
                    {envKeys.map(this.renderEnvItem)}
                    <span className="addEnv" onClick={this.addEnvKey}>
                      <Icon type="plus-circle-o" />
                      <span>添加环境变量</span>
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </div>
    )
  }
})

export default AdvancedSetting