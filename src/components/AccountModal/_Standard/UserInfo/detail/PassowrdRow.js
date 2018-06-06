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
import { Form, Input, Button, Row, Col } from 'antd'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { changeUserInfo } from '../../../../../actions/user.js'
import NotificationHandler from '../../../../../common/notification_handler'

const createForm = Form.create
const FormItem = Form.Item

let PasswordRow = React.createClass({
  getInitialState() {
    return {
      passBarShow: false, // 是否显示密码强度提示条
      rePassBarShow: false,
      passStrength: 'L', // 密码强度
      rePassStrength: 'L',
      oldPassword: ''
    }
  },
  renderPassStrengthBar(type) {
    const strength = type === 'pass' ? this.state.passStrength : this.state.rePassStrength
    const classSet = classNames({
      'ant-pwd-strength': true,
      'ant-pwd-strength-low': strength === 'L',
      'ant-pwd-strength-medium': strength === 'M',
      'ant-pwd-strength-high': strength === 'H'
    })
    const level = {
      L: '低',
      M: '中',
      H: '高'
    }

    return (
      <div>
        <ul className={classSet}>
          <li className="ant-pwd-strength-item ant-pwd-strength-item-1"></li>
          <li className="ant-pwd-strength-item ant-pwd-strength-item-2"></li>
          <li className="ant-pwd-strength-item ant-pwd-strength-item-3"></li>
          <span className="ant-form-text">
            {level[strength]}
          </span>
        </ul>
      </div>
    )
  },
  getPassStrenth(value, type) {
    if (value) {
      let strength
      // 密码强度的校验规则自定义，这里只是做个简单的示例
      if (value.length < 6) {
        strength = 'L'
      } else if (value.length <= 9) {
        strength = 'M'
      } else {
        strength = 'H'
      }
      if (type === 'pass') {
        this.setState({ passBarShow: true, passStrength: strength })
      } else {
        this.setState({ rePassBarShow: true, rePassStrength: strength })
      }
    } else {
      if (type === 'pass') {
        this.setState({ passBarShow: false })
      } else {
        this.setState({ rePassBarShow: false })
      }
    }
  },
  passwordExists(rule, value, callback) {
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
    this.setState({
      oldPassword: value
    })
    callback()
    return
  },
  newPassword(rule, value, callback) {
    this.getPassStrenth(value, 'pass')
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
    if(value === this.state.oldPassword) {
      callback([new Error('新密码不能和旧密码相同')])
      return
    }
    callback()
    return
  },
  againPasswordExists(rule, values, callback) {
    const form = this.props.form
    this.getPassStrenth(values, 'newPass')
    if (!Boolean(values)) {
      callback([new Error('请再次输入新密码')])
      return
    }
    if (values && values !== form.getFieldValue('newpassword')) {
      callback('两次输入密码不一致！')
      return
    } else {
      callback()
      return
    }
  },
  handPsd(e) {
    e.preventDefault()
    const {form, changeUserInfo } = this.props
		const scope = this.props.scope
    form.validateFields(['password', 'newpassword', 'againpassword'], (errors, values) => {
      if (errors) {
        return errors
      }
      const notification = new NotificationHandler()
      notification.spin('修改密码中')
      changeUserInfo({
        password: values.password,
        newPassword: values.newpassword
      }, {
        success: {
          func: () => {
            notification.close()
            notification.success('修改密码成功')
            scope.setState({
              editPsd: false,
              isPasswordSet: true
            })
          }
        },
        failed: {
          func: (result) => {
            notification.close()
            if(result.message.message == 'not authorized'){
              notification.error('请输入正确密码')
              return
            }
            notification.error(result.message.message)
          }
        }
      })
    })
  },
  render() {
    const { form, isPasswordSet } = this.props
    const { getFieldProps } = form
    let passwdPlaceholder = '新密码'
    let passwordProps = getFieldProps('password', {
      rules: [
        { whitespace: true },
        { validator: this.passwordExists }
      ]
    })
    if (!isPasswordSet) {
      passwordProps = getFieldProps('password',{})
      passwdPlaceholder = '密码'
    }
    const newPasswordProps = getFieldProps('newpassword', {
      rules: [
        { whitespace: true },
        { validator: this.newPassword }
      ]
    })
    const againPassword = getFieldProps('againpassword', {
      rules: [
        { whitespace: true },
        { validator: this.againPasswordExists }
      ]
    })
    const parentScope = this.props.scope
    return (
      <Form horizontal form={this.props.form}>
        <span className="key" style={{float: 'left'}}>密码</span>
        <div className="editList" style={{ width: '400px' }}>
          {
            isPasswordSet && (
              <Row>
                <Col span="12">
                  <FormItem>
                    <Input size="large" type="password" {...passwordProps} placeholder="当前密码" style={{ marginTop: '10px' }} autoComplete="off" />
                  </FormItem>
                </Col>
              </Row>
            )
          }
          <Row>
            <Col span="12">
              <FormItem>
                <Input size="large" type="password" {...newPasswordProps} placeholder={`输入${passwdPlaceholder}`} autoComplete="off" />
              </FormItem>
            </Col>
            <Col span="12">
              {this.state.passBarShow ? this.renderPassStrengthBar('pass') : null}
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem>
                <Input size="large" type="password" {...againPassword} placeholder={`再输一次${passwdPlaceholder}`} />
              </FormItem>
            </Col>
            <Col span="12">
              {this.state.rePassBarShow ? this.renderPassStrengthBar('newPass') : null}
            </Col>
          </Row>
          <Button size="large" onClick={() => parentScope.closeEdit('editPsd')}>取消</Button>
          <Button size="large" type="primary" onClick={(e) => this.handPsd(e)} style={{ marginLeft: '10px' }}>确定</Button>
        </div>
      </Form>
    )
  }
})

PasswordRow = createForm()(PasswordRow)
function mapStateToProps(state, props) {
	return props
}

export default connect(mapStateToProps, {
  changeUserInfo
})(PasswordRow)
