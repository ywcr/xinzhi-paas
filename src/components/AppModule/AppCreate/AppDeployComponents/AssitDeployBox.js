/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AssitDeployBox component
 *
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Select, Input, InputNumber, Modal, Checkbox, Button, Card, Menu, Switch, Radio, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AssitDeployBox.less"

const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
let AssitDeployBox = React.createClass({
  getInitialState() {
    return {
      notV: true
    }
  },
  componentWillReceiveProps(nextProps) {
    const parentScope = nextProps.scope
    if(parentScope.state.runningCode == '2') {
      this.setState({
        notV: false
      })
    } else {
      this.setState({
        notV: true
      })
    }
    if(!nextProps.serviceOpen){
      const { form } = nextProps
      const { resetFields, getFieldValue } = form
      const keys = getFieldValue('cmdKey')
      const userCMDKey = getFieldValue('userCMDKey')
      keys.forEach(key => {
        resetFields([`cmd${key}`])
      })
      userCMDKey.forEach(key => {
        resetFields([`userCMD${key}`])
      })
      resetFields(['cmdKey', 'userCMDKey'])
    }
  },
  changeRunningCode(e) {
    //the function for change user select image default code or set it by himself
    const parentScope = this.props.scope;
    parentScope.setState({
      runningCode: e.target.value
    });
    if(e.target.value == '1') {
      this.setState({
        notV: true 
      })
      const form = this.props.form
      const { getFieldValue, resetFields, setFields } = form
      const key = getFieldValue('userCMDKey')
      key.forEach(k => {
        const v = getFieldValue(`userCMD${k}`)
        setFields({
          [`userCMD${k}`]: {
            name: `userCMD${k}`, value: v, errors: null, validating: true
          }
        })
      })
      return
    }
    this.setState({
      notV: false
    })
  },

  changeGetImageType(e) {
    //the function for change user get image type select local image or get image from the cloud
    const parentScope = this.props.scope;
    parentScope.setState({
      getImageType: e.target.value
    });
  },
  validCMD(rule, value, callback) {
    if(!value) {
      callback(new Error('请填写启动命令'))
      return
    }
    return callback()
  }, 
  changeCurrentDate(e) {
    //the function for user select get datetime from the local host or use it's own time
    const parentScope = this.props.scope;
    parentScope.setState({
      currentDate: e.target.checked
    });
  },
  getCMD() {
    const { form } = this.props
    const parentScope = this.props.scope
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const cmdKey = form.getFieldProps('cmdKey', {
      initialValue: [1]
    }).value
    const self = this
    const runningCode = parentScope.state.runningCode
    const ele = cmdKey.map(cmd => {
      return (
        <FormItem className="runningCodeForm" style={{paddingLeft:'120px'}} key={cmd} sdfsad="sadfasdf">
          <Input style={{display: runningCode == "1"? 'block' : 'none'}}
          {...getFieldProps("cmd" + cmd, {
          })}
          className="entryInput " size="large"
          disabled={true} />
        </FormItem>)
    })
    return ele
  },
  getUserCMD() {
    const { form } = this.props
    const parentScope = this.props.scope
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form
    const cmdKey = form.getFieldProps('userCMDKey', {
      initialValue: [1]
    }).value
    const self = this
    let rule = {
      rules: [
        { whitespace: true, require: true },
        { validator: self.validCMD}
      ]
    }
    if(this.state.notV) {
      rule = {}
    }
    const runningCode = parentScope.state.runningCode;
    let defalutKeyCount = form.getFieldValue('cmdKey').length;
    const ele = cmdKey.map((cmd, index) => {
      let f = 'left' 
      if(index == 0) {
        f = 'none'
      }
      let d = 'none'
      if(runningCode == '2' && index >= defalutKeyCount) {
        d = 'inline-block'
      }
      return (
        <FormItem className="runningCodeForm" style={{paddingLeft:'120px'}}  key={"userCMD"+cmd}>
          <Input style={{display: runningCode == "2"? 'block' : 'none', width:'220px', float: f, marginTop: '5px'}}
          {...getFieldProps("userCMD" + cmd, {
             ...rule
          })}
          size="large"/>
          <Icon type="delete" onClick={() => self.remove(cmd)} style={{display: d, marginLeft: '10px', paddingTop: '16px', cursor: 'pointer'}}/>
        </FormItem>)
    })
    return ele
  },
  add() {
    const { form } = this.props
    const parentScope = this.props.scope
    const { getFieldProps, getFieldError, isFieldValidating } = form
    let cmdKey = form.getFieldProps('userCMDKey', {
      initialValue: [1]
    }).value
    cmdKey.push(cmdKey.length + 1)
    form.setFieldsValue({
      userCMDKey: cmdKey,
      [`userCMD${cmdKey.length + 1}`]: ''
    })
  },
  remove(index) {
    const { form } = this.props
    const parentScope = this.props.scope
    const { getFieldProps, getFieldError, isFieldValidating } = form
    let cmdKey = form.getFieldProps('userCMDKey', {
      initialValue: [1]
    }).value
    const i = cmdKey.indexOf(index)
    cmdKey.splice(i, 1)
    form.setFieldsValue({
      [`userCMD${index}`]: '',
      userCMDKey: cmdKey
    })
  },
  render:function () {
    const { form } = this.props
    const parentScope = this.props.scope;
    const { getFieldProps, getFieldError, isFieldValidating } = form
    return (
      <div id="AssitDeployBox">
        <div className="assitBox">
          <div>
            <div className="inputBox">
              <span className="commonSpan">进入点</span>
              <Input className="entryInput"
                size="large"
                placeholder="配置容器启动后执行的命令"
                {...getFieldProps('entryInput') }
                />
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="inputBox">
              <span className="commonSpan">启动命令</span>
              <div className="selectBox" style={{height: 'auto'}}>
                <FormItem>
                  <RadioGroup
                    {...getFieldProps('runningCode', {
                      initialValue: '1',
                      onChange: this.changeRunningCode
                    }) }
                    >
                    <Radio key="a" value={"1"}>镜像默认</Radio>
                    <Radio key="b" value={"2"}>自定义</Radio>
                  </RadioGroup>
                </FormItem>       
                 {this.getCMD()}     
                 {this.getUserCMD()}
                 {parentScope.state.runningCode == '1' ? '' : [
                      <div onClick={this.add} style={{paddingLeft: '120px', cursor: 'pointer'}}>
                        <Icon type="plus-circle-o" style={{paddingRight: '5px'}}/>
                        <span>添加一个启动命令</span>
                      </div>
                    ]
                 } 
              </div>
    
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="inputBox">
              <span className="commonSpan">重新部署</span>
              <div className="selectBox">
                <RadioGroup onChange={this.changeGetImageType} value={parentScope.state.getImageType}>
                  <Radio key="a" value={"1"}>优先使用本地镜像</Radio>
                  <Radio key="b" value={"0"}>始终拉取云端该版本镜像</Radio>
                </RadioGroup>
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="inputBox">
              <span className="commonSpan">时区设置</span>
              <div className="checkBox">
                <Checkbox value={parentScope.state.currentDate} onChange={this.changeCurrentDate} /><span className="checkTitle">使用所在主机节点的时区</span><br />
                <span className="tooltip">选中后，可以保证容器始终与其所在的主机节点保持一致</span>
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

export default AssitDeployBox
