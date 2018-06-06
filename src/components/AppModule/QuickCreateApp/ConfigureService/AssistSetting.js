/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: assist setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import {
  Form, Collapse, Row, Col, Input, Radio, Checkbox, Icon,
  Tooltip, Button,
} from 'antd'
import './style/AssistSetting.less'

const Panel = Collapse.Panel
const FormItem = Form.Item
const RadioGroup = Radio.Group

const AssistSetting = React.createClass({
  getInitialState() {
    return {
      argsType: 'default',
    }
  },
  setArgsToDefault() {
    const { form, imageConfigs } = this.props
    const { setFieldsValue } = form
    let { cmd } = imageConfigs
    const argsKeys = []
    cmd = cmd || []
    cmd.forEach((args, index) => {
      argsKeys.push(index)
      const key = [`args${index}`]
      setFieldsValue({
        [key]: args,
      })
    })
    setFieldsValue({
      argsKeys
    })
  },
  addArgs() {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    let argsKeys = getFieldValue('argsKeys') || []
    const validateFieldsKeys = []
    argsKeys.forEach(key => {
      if (!key.deleted) {
        validateFieldsKeys.push(`args${key.value}`)
      }
    })
    validateFields(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      const key = argsKeys[argsKeys.length - 1] || { value: 0 }
      let uid = key.value
      uid ++
      argsKeys = argsKeys.concat({ value: uid })
      setFieldsValue({
        argsKeys,
      })
      setTimeout(()=> {
        document.getElementById(`args${uid}`).focus()
      },300)
    })
  },
  removeArgsKey(key) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    const argsKeys = getFieldValue('argsKeys') || []
    setFieldsValue({
      argsKeys: argsKeys.map(_key => {
        if (_key.value === key) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          _key.deleted = true
        }
        return _key
      })
    })
  },
  renderArgs() {
    const { argsType } = this.state
    const { form, formItemLayout } = this.props
    const { getFieldProps, getFieldValue } = form
    const argsKeys = getFieldValue('argsKeys') || []
    return argsKeys.map((key, index) => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      const argsProps = getFieldProps(`args${keyValue}`, {
        rules: [
          { required: true, message: '请填写启动命令' },
        ],
      })
      return (
        <Row key={`args${keyValue}`}>
          <Col span={formItemLayout.labelCol.span}></Col>
          <Col span={6}>
            <FormItem>
              <Input size="default" {...argsProps} disabled={argsType === 'default'}/>
            </FormItem>
          </Col>
          {
            (argsType !== 'default' && index > 0) && (
              <Col span={3} className="deleteArgs">
                <Tooltip title="删除">
                  <Button
                    type="dashed"
                    size="small"
                    onClick={this.removeArgsKey.bind(this, keyValue)}
                  >
                    <Icon type="delete" />
                  </Button>
                </Tooltip>
              </Col>
            )
          }
        </Row>
      )
    })
  },
  onArgsTypeChange(e) {
    const { form } = this.props
    const { setFieldsValue } = form
    const argsType = e.target.value
    this.setState({ argsType })
    setFieldsValue({
      argsType: argsType
    })
  },
  render() {
    const { formItemLayout, form } = this.props
    const { argsType } = this.state
    const { getFieldProps } = form
    const commandProps = getFieldProps('command')
    const imagePullPolicyProps = getFieldProps('imagePullPolicy', {
      rules: [
        { required: true }
      ],
    })
    const timeZoneProps = getFieldProps('timeZone', {
      valuePropName: 'checked'
    })
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">辅助设置</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">一些常用的辅助设置：①容器进入点，②启动执行命令，③重新部署所用镜像，④容器时区设置</div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div id="assistConfigureService">
        <Collapse>
          <Panel header={header}>
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 6 }}
              label="进入点"
              key="command"
            >
              <Input {...commandProps} size="large" placeholder="配置容器启动后执行的命令" />
            </FormItem>
            <div className="args">
              <FormItem
                {...formItemLayout}
                label="启动命令"
                key="args"
              >
                <RadioGroup value={argsType} onChange={this.onArgsTypeChange}>
                  <Radio value="default">镜像默认</Radio>
                  <Radio value="DIY">自定义</Radio>
                </RadioGroup>
              </FormItem>
              <div className="argsList">
                {this.renderArgs()}
                {
                  argsType !== 'default' && (
                    <Row className="addArgs">
                      <Col span={formItemLayout.labelCol.span}></Col>
                      <Col>
                        <span onClick={this.addArgs}>
                          <Icon type="plus-circle-o" />
                          <span>添加一个启动命令</span>
                        </span>
                      </Col>
                    </Row>
                  )
                }
              </div>
            </div>
            <FormItem
              {...formItemLayout}
              label="重新部署"
              key="imagePullPolicy"
            >
              <RadioGroup {...imagePullPolicyProps}>
                <Radio value="IfNotPresent">优先使用本地镜像</Radio>
                <Radio value="Always">始终拉取云端该版本镜像</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="时区设置"
              key="timeZone"
              className="lastFormItem"
            >
              <Checkbox {...timeZoneProps}>使用所在主机节点的时区</Checkbox>
              <div className="tips">选中后，可以保证容器始终与其所在的主机节点保持一致</div>
            </FormItem>
          </Panel>
        </Collapse>
      </div>
    )
  }
})

export default AssistSetting