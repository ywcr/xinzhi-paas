/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * UsefulDeployBox component
 *
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Select, Input, InputNumber, Modal, Checkbox, Button, Card, Menu, Switch, Radio } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/UsefulDeployBox.less"
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

let UsefulDeployBox = React.createClass({
  checkLivePort(rule, value, callback) {
    if (!value) {
      return callback('请填写端口')
    }
    if (!/[0-9]{1,5}/.test(value)) {
      return callback('请填写数字')
    }
    value = parseInt(value)
    if (value < 0 || value > 65535) {
      return callback('请填写正确端口')
    }
    return callback()
  },
  checkDelay(rule, value, callback) {
    if (!value) {
      return callback('请填写首次延迟时间')
    }
    if (!/[0-9]{1,5}/.test(value)) {
      return callback('请填写数字')
    }
    value = parseInt(value)
    if (value < 0) {
      return callback('延迟时间需大于1')
    }
    return callback()
  },
  checkTimeout(rule, value, callback) {
    if (!value) {
      return callback('请填超时时间')
    }
    if (!/[0-9]{1,5}/.test(value)) {
      return callback('请填写数字')
    }
    value = parseInt(value)
    if (value < 0) {
      return callback('超时时间需大于1')
    }
    return callback()
  },
  checkPeriod(rule, value, callback) {
    if (!value) {
      return callback('请填写检查间隔')
    }
    if (!/[0-9]{1,5}/.test(value)) {
      return callback('请填写数字')
    }
    value = parseInt(value)
    if (value < 0) {
      return callback('检查间隔事件需大于1')
    }
    return callback()
  },
  checkPath(rule, value, callback) {
    if (!value) {
      return callback('请填写检查路径')
    }
    return callback()
  },
  checkTCPTimeout(rule, value, callback) {
    if (!value) {
      return callback('请填超时时间')
    }
    if (!/[0-9]{1,5}/.test(value)) {
      return callback('请填写数字')
    }
    value = parseInt(value)
    if (value < 0) {
      return callback('超时时间需大于1')
    }
    return callback()
  },
  checkTCPLivePort(rule, value, callback) {
    if (!value) {
      return callback('请填写端口')
    }
    if (!/[0-9]{1,5}/.test(value)) {
      return callback('请填写数字')
    }
    value = parseInt(value)
    if (value < 0 || value > 65535) {
      return callback('请填写正确端口')
    }
    return callback()
  },
  checkTCPDelay(rule, value, callback) {
    if (!value) {
      return callback('请填写首次延迟时间')
    }
    if (!/[0-9]{1,5}/.test(value)) {
      return callback('请填写数字')
    }
    value = parseInt(value)
    if (value < 0) {
      return callback('延迟时间需大于1')
    }
    return callback()
  },
  checkTCPPeriod(rule, value, callback) {
    if (!value) {
      return callback('请填写首次延迟时间')
    }
    if (!/[0-9]{1,5}/.test(value)) {
      return callback('请填写数字')
    }
    value = parseInt(value)
    if (value < 0) {
      return callback('延迟时间需大于1')
    }
    return callback()
  },
  render: function () {
    const { form } = this.props
    const parentScope = this.props.scope;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form
    const runningCodeProps = getFieldProps('imageUrl', {});
    const protocol = getFieldValue('getUsefulType')
    const httpLivePort = getFieldProps('httpLivePort', {
      rules: [{
        validator: protocol == 'http' ? this.checkLivePort : ''
      }]
    });
    const httpLiveInitialDelaySeconds = getFieldProps('httpLiveInitialDelaySeconds', {
      rules: [{
        validator: protocol == 'http' ? this.checkDelay : ''
      }]
    });
    const httpLiveTimeoutSeconds = getFieldProps('httpLiveTimeoutSeconds', {
      rules: [{
        validator: protocol == 'http' ? this.checkTimeout : ''
      }]
    });
    const httpLivePeriodSeconds = getFieldProps('httpLivePeriodSeconds', {
      rules: [{
        validator: protocol == 'http' ? this.checkPeriod : ''
      }]
    });
    const httpLivePath = getFieldProps('httpLivePath', {
      rules: [{
        validator: protocol == 'http' ? this.checkPath : ''
      }]
    });
    const tcpLivePort = getFieldProps('tcpLivePort', {
      rules: [{
        validator: protocol == 'tcp' ? this.checkTCPLivePort : ''
      }]
    });
    const tcpLiveInitialDelaySeconds = getFieldProps('tcpLiveInitialDelaySeconds', {
      rules: [{
        validator: protocol == 'tcp' ? this.checkTCPDelay : ''
      }]
    });
    const tcpLiveTimeoutSeconds = getFieldProps('tcpLiveTimeoutSeconds', {
      rules: [{
        validator: protocol == 'tcp' ? this.checkTCPTimeout : ''
      }]
    });
    const tcpLivePeriodSeconds = getFieldProps('tcpLivePeriodSeconds', {
      rules: [{
        validator: protocol == 'tcp' ? this.checkTCPPeriod : ''
      }]
    });
    return (
      <div id="UsefulDeployBox">
        <div className="usefulBox">
          <FormItem>
            <RadioGroup
              {...getFieldProps('getUsefulType', {
                initialValue: 'null',
              }) }
            >
              <Radio key="a" value={"null"}>无</Radio>
              <Radio key="b" value={"http"}>HTTP</Radio>
              <Radio key="c" value={"tcp"}>TCP</Radio>
            </RadioGroup>
          </FormItem>

          {getFieldValue('getUsefulType') == "http" ? [
            <div className="http" key="http">
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
                  <FormItem>
                    <Input type="text" size="large" {...httpLivePort} />
                  </FormItem>
                </div>
                <div className="commonInput">
                  <FormItem>
                    <Input type="text" size="large" {...httpLiveInitialDelaySeconds} />&nbsp;&nbsp;s
                </FormItem>
                </div>
                <div className="commonInput">
                  <FormItem>
                    <Input type="text" size="large" {...httpLiveTimeoutSeconds} />&nbsp;&nbsp;s
                   </FormItem>
                </div>
                <div className="commonInput">
                  <FormItem>
                    <Input type="text" size="large" {...httpLivePeriodSeconds} />&nbsp;&nbsp;s
                    </FormItem>
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
                  <FormItem>
                    <Input type="text" size="large" {...httpLivePath} />
                  </FormItem>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
            </div>
          ] : null}
          {getFieldValue('getUsefulType') == "tcp" ? [
            <div className="tcp" key="tcp">
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
                  <FormItem>
                    <Input type="text" size="large" {...tcpLivePort} />
                  </FormItem>
                </div>
                <div className="commonInput">
                  <FormItem>
                    <Input type="text" size="large" {...tcpLiveInitialDelaySeconds} />&nbsp;&nbsp;s
                    </FormItem>
                </div>
                <div className="commonInput">
                  <FormItem>
                    <Input type="text" size="large" {...tcpLiveTimeoutSeconds} />&nbsp;&nbsp;s
                     </FormItem>
                </div>
                <div className="commonInput">
                  <FormItem>
                    <Input type="text" size="large" {...tcpLivePeriodSeconds} />&nbsp;&nbsp;s
                    </FormItem>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
            </div>
          ] : null}
        </div>
      </div>
    )
  }
})

export default UsefulDeployBox;