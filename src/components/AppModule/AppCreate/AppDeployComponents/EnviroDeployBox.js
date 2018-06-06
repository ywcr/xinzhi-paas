/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * EnviroDeployBox component
 *
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Select, Input, InputNumber, Modal, Checkbox, Button, Card, Menu, Switch, Radio, Icon, notification } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import $ from 'jquery'
import "./style/EnviroDeployBox.less"
import { appEnvCheck } from '../../../../common/naming_validation'
import { isDomain } from '../../../../common/tools'
import { SERVICE_KUBE_NODE_PORT } from '../../../../../constants'

const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const OptGroup = Select.OptGroup;
let uuidPort = 1;
let uuidEnviro = 1;

function currentShowInputType(form, type, index) {
  //this function for check different type
  const {getFieldValue, getFieldProps} = form;
  let value = getFieldProps(`portType${index}`).value;
  if(value == type) {
    return true;
  } else {
    return false;
  }
}

function currentShowTcpInputType(form, index) {
  //this function for check tcp different type
  const {getFieldValue, getFieldProps} = form;
  let value = getFieldProps(`portTcpType${index}`).value;
  if(value == 'special') {
    return true;
  } else {
    return false;
  }
}

function validatePortNumber(proxyType, portNumber) {
  let minimumPort = 10000
  let maximumPort = 65535
  if (proxyType == SERVICE_KUBE_NODE_PORT) {
    // TODO: Make it configurealbe
    minimumPort = 30000
    maximumPort = 32766
  }
  if( portNumber < minimumPort || portNumber > maximumPort ) {
    return '指定端口号范围' +  minimumPort + ' ~ ' + maximumPort
  } else {
    return
  }
}

let MyComponentEnviro = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  remove(k) {
    const { getFieldProps, getFieldValue, getFieldsValue } = this.props.parentScope.props.form;
    const { form } = this.props.parentScope.props;
    let envKey = form.getFieldValue('envKey');
    envKey = envKey.filter((key) => {
      return key !== k;
    })
    form.setFieldsValue({
      envKey,
    })

  },
  add() {
    const { form } = this.props.parentScope.props;
    let envKey = form.getFieldValue('envKey');
    let nanFlag = isNaN(envKey[envKey.length - 1]);
    let newEnv = 0;
    if(!nanFlag) {
      newEnv = envKey[envKey.length - 1];
    } else {
      newEnv = -1;
    }
    uuidEnviro = newEnv + 1;
    envKey = envKey.concat(uuidEnviro);
    form.setFieldsValue({
      envKey,
    });
  },
  envCheck(rule, value, callback) {
    //this function for check env name is right or not
    let errorMsg = appEnvCheck(value, '环境变量');
    if(errorMsg == 'success') {
      callback()
    } else {
      callback(new Error([errorMsg]));
    }
  },
  render: function () {
    const { form } = this.props
    const { getFieldProps, getFieldValue, getFieldsValue } = form;
    getFieldProps('envKey', {
      initialValue: [],
    });

    const formItems = getFieldValue('envKey').map((k) => {
      return (
        <FormItem key={`env${k}`}>
          <li className="enviroDetail">
            <div className="input">
              <FormItem>
                <Input {...getFieldProps(`envName${k}`, {
                  rules: [{ validator: this.envCheck },],
                }) } className="composeUrl" type="text" />
              </FormItem>
            </div>
            <div className="input">
              <Input {...getFieldProps(`envValue${k}`, {}) } size="large" className="composeUrl" type="text" />
            </div>
            <div className="opera">
              <i className="fa fa-trash-o" onClick={() => this.remove(k)}/>
            </div>
            <div style={{ clear: "both" }}></div>
          </li>
        </FormItem>
      )
    });
    return (
      <div>
        <ul>
          {formItems}
        </ul>
        <div className="addBtn">
          <Button type="primary" onClick={this.add}>
            <Icon type="plus-circle-o" />
            <span>添加环境变量</span>
          </Button>
        </div>
      </div>
    );
  }
});

let MyComponentPort = React.createClass({
  getInitialState: function () {
    return {
      addDis: false,
      intDis: false,
    }
  },
  propTypes: {
    config: React.PropTypes.array
  },
  remove(k) {
    const { form } = this.props
    let portKey = form.getFieldValue('portKey');
    if(portKey.length == 1) {
      notification['warning']({
        message: '创建服务：高级设置',
        description: '映射端口数量最少为一个！',
      });
      return;
    }
    portKey = portKey.filter((key) => {
      return key !== k;
    });
    if (form.getFieldValue('portKey').length === 0) {
      this.props.parentScope.setState({
        disable: true,
      })
    } else {
      form.getFieldValue('portKey').map((k) => {
        const value = form.getFieldProps(`targetPortUrl${k}`).value
        form.setFieldsValue({
          [`targetPortUrl${k}`]: value
        })
      })
    }
    form.setFieldsValue({
      portKey,
    })
  },
  add() {
    const { form } = this.props.parentScope.props;
    let portKey = form.getFieldValue('portKey');
    let nanFlag = isNaN(portKey[portKey.length - 1]);
    let newPort = 0;
    if(!nanFlag) {
      newPort = portKey[portKey.length - 1];
    } else {
      newPort = -1;
    }
    uuidPort = newPort + 1;
    portKey = portKey.concat(uuidPort);
    form.setFieldsValue({
      portKey,
    });
  },
  portsExists(index, rule, value, callback) {
    const {getFieldValue, getFieldProps} = this.props.form
    this.setState({
      addDis: false
    })
    if (!value) {
      callback([new Error('抱歉，必须填端口.')])
      this.setState({
        addDis: true,
      })
      return
    } else {
      if (isNaN(Number(value))) {
        callback([new Error('抱歉，该端口不合法.')])
        this.setState({
          addDis: true,
        })
        return
      } else {
        // Container port
        if (value < 1 || value > 65535) {
          callback([new Error('指定端口号范围0 ~ 65535')])
          return;
        }
        let i = 0
        this.setState({
          addDis: false,
        })
        getFieldValue('portKey').map((k) => {
          if(value === getFieldProps(`targetPortUrl${k}`).value && k != index){
            i++
          }
        })
        if(i > 0){
          callback([new Error('抱歉，端口名称重复.')])
          this.setState({
            addDis: true,
          })
          return
        } else {
          callback();
          return;
        }
      }
    }
  },
  podPortExist(index, rule, value, callback) {
    const {getFieldValue, getFieldProps} = this.props.form;
    let errorFlag = false;
    getFieldValue('portKey').map((k) => {
      if(value === getFieldProps(`portUrl${k}`).value && k != index ) {
        errorFlag = true;
      }
    })
    if(errorFlag) {
      callback([new Error('服务端口已被占用.')])
      return;
    } else {
      let tempPort  = parseInt(value);
      let msg = validatePortNumber(this.props.loginUser.proxyType, tempPort)
      if (msg) {
        callback([new Error(msg)])
        return;
      } else {
        callback();
        return;
      }
    }

  },
  changePortType(index, e) {
    //this function for change tcp port type and auto focus input
    if(e == 'special') {
      setTimeout(() => {      
        $('#portUrl'+index).focus();
      })
    }
  },
  render: function () {
    const scopeThis = this;
    const { form, parentScope, loginUser } = this.props
    const { intDis ,addDis} = this.state
    const { getFieldProps, getFieldValue, isFieldValidating, getFieldError } = form
    const { bindingDomains } = parentScope.props.cluster
    getFieldProps('portKey', {
      initialValue: [],
    })
    const formItems = getFieldValue('portKey').map((k) => {
      return (
        <div key={`port${k}`}>
          <li className="portDetail">
            <div className="input">
              <FormItem hasFeedback
                help={isFieldValidating(`targetPortUrl${k}`) ? '校验中...' : (getFieldError(`targetPortUrl${k}`) || []).join(', ')}>
                <Input key={`targetPortUrl${k}`} {...getFieldProps(`targetPortUrl${k}`, {
                  rules: [{ validator: this.portsExists.bind(scopeThis, k) },],
                }) } className="composeUrl" type="text" size="large"/>
              </FormItem>
            </div>
            <div className="protocol select">
              <FormItem className="portGroupForm">
                <Select {...getFieldProps(`portType${k}`,{
                  rules: [{
                    required: true,
                    message: '请选择端口类型',
                  }],
                  initialValue: 'HTTP'
                })}
                  showSearch
                  optionFilterProp="children"
                  notFoundContent="无法找到"
                  className="portGroup" size="large">
                  <Option value="HTTP" disabled={!isDomain(bindingDomains)}>HTTP</Option>
                  <Option value="TCP">TCP</Option>
                  {/*<Option value="udp">Udp</Option>*/}
                </Select>
              </FormItem>
            </div>
            <div className="mapping">
              <div className='podPort'>
              {currentShowInputType(form, 'HTTP', k) ? [<span className='httpSpan'>80</span>] : null}
              {currentShowInputType(form, 'TCP', k) ? [
                <div className='tcpDiv'>
                  <Select {...getFieldProps(`portTcpType${k}`,{
                      rules: [{
                        message: '请选择端口类型',
                      },],
                      initialValue: 'auto',
                      onChange: this.changePortType.bind(scopeThis, k)
                    })} 
                    className='tcpSelect'
                    size="large">
                    <Option value="auto">动态生成</Option>
                    <Option value="special">指定端口</Option>
                  </Select>
                  { currentShowTcpInputType(form, k) ? [<FormItem className={`tcpInputForm tcpInputForm${k}`} key={`portUrl${k}`}><Input {...getFieldProps(`portUrl${k}`, {rules: [{validator: this.podPortExist.bind(scopeThis, k)}]}) } style={{ width: '100px' }} type="text" size="large" /></FormItem>] : null}
                </div>
                ] : null }
              </div>
            </div>
            <div className="opera">
              <i className="fa fa-trash-o" onClick={() => this.remove(k)} />
            </div>
            <div style={{ clear: "both" }}></div>
          </li>
        </div>
      )
    });
    return (
      <div>
        <ul>
          {formItems}
        </ul>
        <div className="addBtn">
          <Button type="primary" onClick={this.add} disabled={addDis}>
            <Icon type="plus-circle-o" />
            <span>添加映射端口</span>
          </Button>
        </div>
      </div>
    );
  }
});

let EnviroDeployBox = React.createClass({
  render: function () {
    const { form,disAdd, loginUser } = this.props
    const parentScope = this.props.scope;
    return (
      <div id="advanceBox">
        <div className="advanceBox">
          <div className="enviroBox">
            <span className="title">环境变量</span>
            <div className="enviroList">
              <div className="enviroTitle">
                <div className="enviroCommonTitle">
                  <span>键</span>
                </div>
                <div className="enviroCommonTitle">
                  <span>值</span>
                </div>
                <div className="enviroCommonTitle">
                  <span>操作</span>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <MyComponentEnviro parentScope={parentScope} form={form}/>
            </div>
          </div>
          <div className="portBox">
            <span className="title">映射端口</span>
            <div className="portList">
              <div className="portTitle">
                <div className="portCommonTitle">
                  <span>容器端口</span>
                </div>
                <div className="protocol portCommonTitle">
                  <span>协议</span>
                </div>
                <div className="mapping portCommonTitle">
                  <span>映射服务端口</span>
                </div>
                <div className="opera portCommonTitle">
                  <span>操作</span>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <MyComponentPort parentScope={parentScope} loginUser={loginUser} form={form}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

export default EnviroDeployBox;