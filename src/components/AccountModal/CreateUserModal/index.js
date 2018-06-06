/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Create user modal
 *
 * v0.1 - 2016-12-01
 * @author Zhangpc
 */

import React from 'react'
import { connect } from 'react-redux'
import { Input, Modal, Form, Checkbox, Tooltip, Icon, Button, Select } from 'antd'
import { USERNAME_REG_EXP_NEW, ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import { ROLE_SYS_ADMIN } from '../../../../constants'
const Option = Select.Option
const createForm = Form.create
const FormItem = Form.Item

let CreateUserModal = React.createClass({
  getInitialState() {
    return {
      disabled: false
    }
  },
  userExists(rule, value, callback) {
    const _this = this
    if (!value) {
      callback([new Error('请输入用户名')])
      return
    }
    const { checkUserName } = this.props.funcs
    if (value.length < 5 || value.length > 40) {
      callback([new Error('长度为5~40个字符')])
      return
    }
    if (!USERNAME_REG_EXP_NEW.test(value)) {
      callback([new Error('以小写字母开头，允许[0~9]、[-]，且以小写英文和数字结尾')])
      return
    }
    // Disabled submit button when checkUserName
    this.setState({
      disabled: true
    })
    clearTimeout(this.userExistsTimeout)
    this.userExistsTimeout = setTimeout(() => {
      checkUserName(value, {
        success: {
          func: (result) => {
            _this.setState({
              disabled: false
            })
            if (result.data) {
              callback([new Error('用户名已经存在')])
              return
            }
            callback()
          }
        },
        failed: {
          func: (err) => {
            _this.setState({
              disabled: false
            })
            callback([new Error('用户名校验失败')])
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT);
  },
  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form
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
    if (value) {
      validateFields(['rePasswd'], { force: true });
    }
    callback()
  },
  checkPass2(rule, value, callback) {
    const { getFieldValue, getFieldError } = this.props.form;
    const pwdError = getFieldError('passwd');
    if (!Boolean(value)) {
      callback('请再次输入密码！')
      return
    }
    if(Boolean(pwdError)) {
      callback([new Error(pwdError[0])]);
      return
    }
    if (value && value !== getFieldValue('passwd')) {
      callback('两次输入密码不一致！')
      return
    }
    callback()
  },
  telExists(rule, value, callback) {
    //^1[34578]\d{9}$ ^[0-9][-0-9()]{5,12}[0-9]$
    if (!(/^1[3|4|5|7|8][0-9]\d{8}$/.test(value))) {
      callback([new Error('请输入正确的手机号')])
      return
    }
    callback()
  },
  handleOk() {
    const { form, onSubmit, scope } = this.props
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { name, passwd, email, tel, check, role } = values
      let newUser = {
        userName: name,
        password: passwd,
        email: email,
        phone: tel,
        sendEmail: check,
        role: parseInt(role)
      }
      onSubmit(newUser)
      form.resetFields()
      scope.setState({
        visible: false,
      })
    })
  },
  handleCancel(e) {
    const { scope, form } = this.props
    e.preventDefault()
    form.resetFields()
    scope.setState({
      visible: false,
    })
  },
  render() {
    const { form, visible, loginUser } = this.props
    const { disabled } = this.state
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.userExists },
      ],
    })
    const telProps = getFieldProps('tel', {
      validate: [{
        rules: [
          { whitespace: true },
        ],
        trigger: 'onBlur',
      },{
        rules: [
          { validator: this.telExists },
        ],
        trigger: ['onBlur', 'onChange'],
      }],
    })
    const emailProps = getFieldProps('email', {
      validate: [{
        rules: [
          { required: true, message: '请输入邮箱地址' },
        ],
        trigger: 'onBlur',
      }, {
        rules: [
          { type: 'email', message: '请输入正确的邮箱地址' },
        ],
        trigger: ['onBlur', 'onChange'],
      }],
    })
    const passwdProps = getFieldProps('passwd', {
      rules: [
        { validator: this.checkPass },
      ],
    })
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{ whitespace: true },
      {
        validator: this.checkPass2,
      }],
    })
    const checkProps = getFieldProps('check', {})
    const roleProps = getFieldProps('role', {
      initialValue:'0'
    })
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    }
    return (
      <Modal title="添加新成员" visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
        wrapClassName="NewMemberForm"
        width="500px"
        footer={[
          <Button
            key="back"
            type="ghost"
            size="large"
            onClick={this.handleCancel}>
            返 回
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            disabled={disabled}
            onClick={this.handleOk}>
            提 交
          </Button>,
        ]}>
        <Form horizontal>
          <FormItem
            {...formItemLayout}
            label="名称"
            hasFeedback
            help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
            >
            {/*   not browser autoComplete    */}
            <Input type="text" id="autoname" style={{visibility: 'hidden', opacity:0,position:'absolute'}} />
            <Input type="password" id="autopassword" style={{visibility: 'hidden', opacity:0,position:'absolute'}} />

            <Input {...nameProps} placeholder="新成员名称" id="newUser"/>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="类型"
            >
            { ROLE_SYS_ADMIN == loginUser.role ?
            <Select defaultValue="0" {...roleProps} style={{ width: 120 }}>
              <Option value="0">普通成员</Option>
              <Option value="1">团队管理员</Option>
              <Option value="2">系统管理员</Option>
            </Select>
            :<div> 普通成员</div>
            }
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="密码"
            hasFeedback
            >
            <Input {...passwdProps} type="password" autoComplete="off"
              placeholder="新成员名称登录密码"
              />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="确认密码"
            hasFeedback
            >
            <Input {...rePasswdProps} type="password" autoComplete="off" placeholder="请再次输入密码确认" />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="手机"
            hasFeedback
            >
            <Input {...telProps} type="text" placeholder="新成员手机" />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="邮箱"
            hasFeedback
            >
            <Input {...emailProps} type="email" placeholder="新成员邮箱帐号" />
          </FormItem>

          {
            loginUser.emailConfiged && (
              <FormItem
                {...formItemLayout}
                label=""
                >
                <Checkbox className="ant-checkbox-vertical" {...checkProps}>
                  创建完成后, 密码帐户名发送至该邮箱
                </Checkbox>
              </FormItem>
            )
          }
        </Form>
      </Modal>
    )
  }
})

CreateUserModal = createForm()(CreateUserModal)

function mapStateToProps(state, props) {
  return {
    loginUser: state.entities.loginUser.info,
  }
}
export default connect(mapStateToProps, {
  //
})(CreateUserModal)