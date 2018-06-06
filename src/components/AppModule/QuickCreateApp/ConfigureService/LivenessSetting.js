/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: liveness setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import {
  Form, Collapse, Row, Col, Radio, Input, InputNumber,
} from 'antd'
import './style/LivenessSetting.less'

const Panel = Collapse.Panel
const FormItem = Form.Item
const RadioGroup = Radio.Group

const LivenessSetting = React.createClass({
  changeType(e) {
    if(e.target.value !== 'none') {
      setTimeout(()=> {
        document.getElementById('livenessPort').focus()
      },300)
    }
  },
  render() {
    const { formItemLayout, form } = this.props
    const { getFieldProps, getFieldValue } = form
    const livenessProtocolProps = getFieldProps('livenessProtocol', {
      rules: [
        { required: true }
      ],
      onChange: this.changeType
    })
    const livenessProtocol = getFieldValue('livenessProtocol')
    let livenessPortProps
    let livenessPathProps
    let livenessInitialDelaySecondsProps
    let livenessTimeoutSecondsProps
    let livenessPeriodSecondsProps
    if (livenessProtocol === 'HTTP' || livenessProtocol === 'TCP') {
      livenessPortProps = getFieldProps('livenessPort', {
        rules: [
          { required: true, message: '请填写端口' }
        ],
      })
      livenessInitialDelaySecondsProps = getFieldProps('livenessInitialDelaySeconds', {
        rules: [
          { required: true, message: '请填写首次检查延时' }
        ],
      })
      livenessTimeoutSecondsProps = getFieldProps('livenessTimeoutSeconds', {
        rules: [
          { required: true, message: '请填写检查超时' }
        ],
      })
      livenessPeriodSecondsProps = getFieldProps('livenessPeriodSeconds', {
        rules: [{ required: true, message: '请填写检查间隔' }],
      })
      if (livenessProtocol === 'HTTP') {
        livenessPathProps = getFieldProps('livenessPath', {
          rules: [
            { required: true, message: '请填写 Path 路径' }
          ],
        })
      }
    }
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">高可用</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">设置重启检查项目，如遇到检查项不满足，为自动保证服务高可用，将自动重启该服务</div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div id="livenessConfigureService">
        <Collapse>
          <Panel header={header}>
            <FormItem
              {...formItemLayout}
              className="lastFormItem"
              label="类型"
              key="type"
            >
              <RadioGroup {...livenessProtocolProps}>
                <Radio value="none">无</Radio>
                <Radio value="HTTP">HTTP</Radio>
                <Radio value="TCP">TCP</Radio>
              </RadioGroup>
            </FormItem>
            {
              (livenessProtocol === 'HTTP' || livenessProtocol === 'TCP') && (
                <Row>
                  <Col span={formItemLayout.labelCol.span} className='configCol'>配置</Col>
                  <Col span={formItemLayout.wrapperCol.span}>
                    <div className="livenessConfig">
                      <Row className="configHeader">
                        <Col span={6}>
                          端口
                        </Col>
                        <Col span={6}>
                          首次检查延时
                        </Col>
                        <Col span={6}>
                          检查超时
                        </Col>
                        <Col span={6}>
                          检查间隔
                        </Col>
                      </Row>
                      <Row className="configBody">
                        <Col span={6}>
                          <FormItem key="livenessPort">
                            <InputNumber
                              size="default"
                              {...livenessPortProps}
                              min={0}
                              max={65535}
                            />
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem key="livenessInitialDelaySeconds">
                            <InputNumber
                              size="default"
                              {...livenessInitialDelaySecondsProps}
                              min={0}
                            />
                            <span className="livenessUnit">
                              s
                            </span>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem key="livenessTimeoutSeconds">
                            <InputNumber
                              size="default"
                              {...livenessTimeoutSecondsProps}
                              min={0}
                            />
                            <span className="livenessUnit">
                              s
                            </span>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem key="livenessPeriodSeconds">
                            <InputNumber
                              size="default"
                              {...livenessPeriodSecondsProps}
                              min={0}
                            />
                            <span className="livenessUnit">
                              s
                            </span>
                          </FormItem>
                        </Col>
                      </Row>
                      {
                        livenessPathProps && [
                          <Row className="configHeader">
                            <Col span={6}>
                              Path 路径
                            </Col>
                          </Row>,
                          <Row className="configBody">
                            <Col span={6}>
                              <FormItem>
                                <Input
                                  size="default"
                                  {...livenessPathProps}
                                />
                              </FormItem>
                            </Col>
                          </Row>
                        ]
                      }
                    </div>
                  </Col>
                </Row>
              )
            }
          </Panel>
        </Collapse>
      </div>
    )
  }
})

export default LivenessSetting