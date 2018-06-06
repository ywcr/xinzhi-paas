/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User info - Standard
 *
 * v0.1 - 2016-12-13
 * @author Bai Yu
 */
import React, { Component, PropTypes } from 'react'
import { Button, Tabs, Input, Icon, Modal, Upload, Dropdown, Form, Select } from 'antd'
import { connect } from 'react-redux'
import { sendRegisterPhoneCaptcha, changeUserInfo } from '../../../../../actions/user.js'
import NotificationHandler from '../../../../../common/notification_handler.js'
const createForm = Form.create
const FormItem = Form.Item
import { PHONE_REGEX } from '../../../../../../constants'
let isAction = false

let PhoneRow = React.createClass({
  getInitialState() {
    return {
      captchaLoading: false, //验证码验证中
      countDownTimeText: '发送验证码'//验证码计时文本
    }
  },
  phoneExists(rule, values, callback) {
    if(!Boolean(values)) {
      callback([new Error('请输入手机号码')])
      return
    }
    if (!PHONE_REGEX.test(values)) {
      callback([new Error('请输入正确的号码')])
      return
    }
    callback()
    return
  },
   phonePasswordExists(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    callback()
    return
  },
  testCode(rule, values, callback) {
    if(!Boolean(values)) {
      callback([new Error('请输入验证码')])
      return
    }
    if (values.length < 6) {
      callback([new Error('请输入6位验证码')])
      return
    }
    callback()
    return
  },
  sendCode() {
    if(isAction) return
    isAction = true
    const notifi = new NotificationHandler()
    const { getFieldProps } = this.props.form
    const phone = getFieldProps('phone').value
    if(!phone || !PHONE_REGEX.test(phone)) {
      isAction = false
      return
    }
    this.props.sendRegisterPhoneCaptcha(phone, {
      success: {
        func: () => {
          notifi.success('验证码已发送, 请注意查看')
          isAction = false
          this.setState({
            captchaLoading: true,
            countDownTimeText: '60s 后重新发送'
          })
          let wait = 59
          //重新发送定时器
          let time = setInterval(() => {
            let text = wait + 's 后重新发送'
            wait--
            if (wait >= -1) {
              this.setState({
                countDownTimeText: text
              })
              return
            }
            this.setState({
              captchaLoading: false,
              countDownTimeText: '发送验证码'
            })
            clearInterval(time)
          }, 1000)
        }
      },
      failed: {
        func: (result) => {
          isAction = false
          notifi.error(result.message)
        }
      }
    })
  },
  handPhone(e) {
    e.preventDefault()
    const self = this
    const scope = this.props.scope
    this.props.form.validateFields(['phonePassword', 'phone', 'code'], (errors, values) => {
      if (errors) {
        return
      }
      const noti = new NotificationHandler()
      noti.spin('修改手机中')
      self.props.changeUserInfo({
        captcha: values.code,
        phone: values.phone,
        password: values.phonePassword
      }, {
        success: {
          func: () => {
            noti.close()
            noti.success('修改手机成功')
            scope.setState({ editPhone: false })
          }
        },
        failed: {
          func: (result) => {
            noti.close()
            if(result.message.message == 'not authorized'){
              noti.error('密码输入不正确')
              return
  	        }
            if(result.message.message) {
              noti.error(result.message.message)
              return
            }
            noti.error(result.message)
          }
        }
      })
    })
  },
  render() {
    const {getFieldProps} = this.props.form
    const phonePasswordProps = getFieldProps('phonePassword', {
      rules: [
        { whitespace: true, message: '请输入当前帐户密码', require: true },
        { validator: this.phonePasswordExists }
      ]
    })
    const newPhone = getFieldProps('phone', {
      rules: [
        { whitespace: true, message: '请输入号码', require: true },
        { validator: this.phoneExists }
      ]
    })
    const testingCode = getFieldProps('code', {
      rules: [
        { whitespace: true, message: '请输入6位验证码', require: true },
        { validator: this.testCode }
      ]
    })
    const parentScope = this.props.scope
    return (
      <Form horizontal form={this.props.form}>
        <span className="key" style={{float: 'left'}}>手机</span>
        <div className="editPhoneList">
          <FormItem>
            <Input type="password" size="large" {...phonePasswordProps} placeholder="当前帐户密码" style={{ width: '73%' }} />
          </FormItem>
          <div className="editPhone">
            <FormItem>
                <Select defaultValue="china" style={{ width: 120 }}>
                  <Option value="china">中国 （+86）</Option>
               </Select>
              <Input size="large" {...newPhone} className="phoneNumber" placeholder="新手机号" style={{ width: '50%' }} />
            </FormItem>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <FormItem>
            <Input size="large" {...testingCode} placeholder="6位验证码" style={{ width: '46%' }} />
            <Button size="large" style={{ marginLeft: '10px' }} onClick={()=> this.sendCode()} disabled={this.state.captchaLoading}>{this.state.countDownTimeText}</Button>
            </FormItem>
          </div>
          <Button size="large" onClick={() => parentScope.closeEdit('editPhone')}>取消</Button>
          <Button size="large" type="primary" onClick={(e)=>this.handPhone(e)} style={{ marginLeft: '10px' }} >确定</Button>
        </div>
      </Form>
    )
  }
})

PhoneRow = createForm()(PhoneRow)

function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps, {
  sendRegisterPhoneCaptcha,
  changeUserInfo
})(PhoneRow)
