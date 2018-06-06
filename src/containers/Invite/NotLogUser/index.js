/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/14
 * @author ZhaoXueYu
 */
import '../style/Invite.less'
import React, { PropTypes } from 'react'
import { Button, Form, Input, Card, Tooltip, message, Alert, Col, Row } from 'antd'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP_NEW, EMAIL_REG_EXP } from '../../../constants'
import { browserHistory } from 'react-router'
import NotificationHandler from '../../../common/notification_handler'

const createForm = Form.create
const FormItem = Form.Item

function noop() {
  return false
}
let NotLogUser = React.createClass({
  getInitialState() {
    return {
      submitting: false,
      loginResult: {},
      submitProps: {},
      intPassFocus: false,
      intCheckFocus: false,
      passWord: false,
      rePassWord: false,
      intRePassFocus: false,
      intTelFocus: false,
      intUserNameFocus: false,
      captchaLoading: false,
      countDownTimeText: '发送验证码',
      btnState: true,
    }
  },
  
  handleSubmit(e) {
    e.preventDefault()
    const { form, redirect, registerUserAndJoinTeam, code } = this.props
    const { validateFields, resetFields } = form
    const self = this
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        submitting: true,
        btnState: true,
        submitProps: {
          disabled: 'disabled'
        }
      })
      const body = {
        password: values.password,
        captcha: values.captcha,
        userName: values.userName,
        phone: values.tel,
        email: this.props.email,
        code
      }
      //注册req:
      registerUserAndJoinTeam(body, {
        success: {
          func: (result) => {
            self.setState({
              submitting: false,
              submitProps: {},
            })
            message.success(`注册并加入团队成功`)
            browserHistory.push('/login')
            resetFields()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            let dupItems = ''
            if (err.statusCode === 409 && Array.isArray(err.message.data) && err.message.data.length > 0) {
              err.message.data.map((item) => {
                switch(item) {
                case 'username':
                  dupItems += '用户名 '
                  break;
                case 'email':
                  dupItems += '邮箱 '
                  break;
                case 'phone':
                  dupItems += '手机号 '
                  break;
                }
              })
            }
            dupItems = dupItems ? dupItems + '已被占用' : ''
            let msg = dupItems || err.message.message || err.message
            let notification = new NotificationHandler()
            self.setState({
              submitting: false,
              loginResult: {
                error: msg
              },
              submitProps: {},
            })
            notification.error(`注册并加入团队失败`, msg)
          },
          isAsync: true
        },
      })
    })
  },

  checkUserName(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写用户名')])
      return
    }
    if (value.length < 5 || value.length > 40) {
      callback([new Error('长度为5~40个字符')])
      return
    }
    if (!USERNAME_REG_EXP_NEW.test(value)) {
      callback([new Error('以[a~z]开头，允许[0~9]、[-]，长度大于4，且以小写英文和数字结尾')])
      return
    }
    callback()
  },

  checkPass(rule, value, callback) {
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
  },
  checkPass2(rule, value, callback) {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('password')) {
      callback('两次输入密码不一致！');
    } else {
      callback()
    }
  },
  checkTel(rule, value, callback){
    if(!value){
      callback()
      return
    }
    if(value.length !== 11){
      callback([new Error('请输入11位的手机号')])
      return
    }
    callback()
  },
  //发送验证码
  changeCaptcha() {
    this.setState({
      captchaLoading: true,
      countDownTimeText: '60s 后重新发送',
    })
    //重新发送定时器
    let wait = 59
    let time = setInterval(() => {
      let text = wait + 's 后重新发送'
      wait--
      if(wait >= -1){
        this.setState({
          countDownTimeText: text
        })
        return
      }
      this.setState({
        captchaLoading: false,
        countDownTimeText: '发送验证码',
      })
      clearInterval(time)
    },1000)

    // send captcha
    const { validateFields } = this.props.form
    validateFields((err, values) => {
      if (err && values.captcha !== '' && values.captcha) {
        return
      }
      const phone = values.tel
      if (!phone) {
        return
      }
      this.props.sendRegisterPhoneCaptcha(phone, {
        success: {
          func: () => {
            let notification = new NotificationHandler()
            notification.success(`发送验证码成功`)
            this.setState({
              btnState: false
            })
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            let notification = new NotificationHandler()
            notification.error(`发送验证码失败`, err.message)
            this.setState({
              btnState: true
            })
          }
        }
      })
    })
  },
  intOnBlur(current) {
    const { getFieldProps } = this.props.form
    if (current === 'pass') {
      let password = getFieldProps('password').value
      if (password === '' || !password) {
        this.setState({
          intPassFocus: false,
          passWord: true,
        })
      }
      return
    }
    if (current === 'userName') {
      let password = getFieldProps('userName').value
      if (password === '' || !password) {
        this.setState({
          intUserNameFocus: false,
        })
      }
      return
    }
    if (current === 'check') {
      let captcha = getFieldProps('captcha').value
      if (captcha === '' || !captcha) {
        this.setState({
          intCheckFocus: false
        })
      }
      return
    }
    if (current === 'rePasswd') {
      let rePasswd = getFieldProps('rePasswd').value
      if (rePasswd === '' || !rePasswd) {
        this.setState({
          intRePassFocus: false,
          rePassWord: true,
        })
      }
      return
    }
    if (current === 'tel') {
      let tel = getFieldProps('tel').value
      if (tel === '' || !tel) {
        this.setState({
          intTelFocus: false,
        })
      }
    }
  },
  intOnFocus(current) {
    if (current === 'pass') {
      this.refs.intPass.refs.input.focus()
      this.setState({
        intPassFocus: true,
        passWord: true,
      })
      return
    }
    if (current === 'userName') {
      this.refs.intUserName.refs.input.focus()
      this.setState({
        intUserNameFocus: true,
      })
      return
    }
    if (current === 'check') {
      this.refs.intCheck.refs.input.focus()
      this.setState({
        intCheckFocus: true
      })
      return
    }
    if (current === 'rePasswd') {
      this.refs.intRePass.refs.input.focus()
      this.setState({
        intRePassFocus: true,
        rePassWord: true,
      })
      return
    }
    if (current === 'tel') {
      this.refs.intTel.refs.input.focus()
      this.setState({
        intTelFocus: true,
      })
    }
  },
  componentWillMount() {
    const { resetFields } = this.props.form
    resetFields()
  },
  render() {
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const { random, submitting, loginResult, submitProps, btnState } = this.state
    const { email } = this.props
    const userNameProps = getFieldProps('userName', {
      rules: [
        { validator: this.checkUserName },
      ],
    })
    const passwdProps = getFieldProps('password', {
      rules: [
        { validator: this.checkPass },
      ],
    })
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{
        required: true,
        whitespace: true,
        message: '请再次输入密码',
      }, {
        validator: this.checkPass2,
      }],
    })
    const telProps = getFieldProps('tel', {
      rules: [
        { required: true, message: '请填写手机号' },
        { validator: this.checkTel },
      ],
    })
    const captchaProps = getFieldProps('captcha', {
      rules: [
        { required: true, message: '请填写验证码' },
      ],
    })

    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    return (
      <Form onSubmit={this.handleSubmit}>
        <input style={{ display: 'none' }} />
        <FormItem
          {...formItemLayout}
          className="formItemName nameIntPlace"
        >
          <div className={"intName intOnFocus"}>邮箱</div>
          <Input placeholder={email} disabled />
        </FormItem>
        
        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
        >
          <div className={this.state.intUserNameFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'userName')}>用户名</div>
          <Input {...userNameProps} autoComplete="off"
                 onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                 onBlur={this.intOnBlur.bind(this, 'userName')}
                 onFocus={this.intOnFocus.bind(this, 'userName')}
                 ref="intUserName"
                 style={{ height: 35 }}
          />
        </FormItem>

        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
        >
          <div className={this.state.intPassFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'pass')}>密码</div>
          <Input {...passwdProps} autoComplete="off" type={this.state.passWord ? 'password' : 'text'}
                 onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                 onBlur={this.intOnBlur.bind(this, 'pass')}
                 onFocus={this.intOnFocus.bind(this, 'pass')}
                 ref="intPass"
                 style={{ height: 35 }}
          />
        </FormItem>
        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
        >
          <div className={this.state.intRePassFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'pass')}>确认密码</div>
          <Input {...rePasswdProps} autoComplete="off" type={this.state.rePassWord ? 'password' : 'text'}
                 onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                 onBlur={this.intOnBlur.bind(this, 'rePasswd')}
                 onFocus={this.intOnFocus.bind(this, 'rePasswd')}
                 ref="intRePass"
                 style={{ height: 35 }}
          />
        </FormItem>
        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
        >
          <div className={this.state.intTelFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'pass')}>手机号</div>
          <Input {...telProps} autoComplete="off"
                 onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                 onBlur={this.intOnBlur.bind(this, 'tel')}
                 onFocus={this.intOnFocus.bind(this, 'tel')}
                 ref="intTel"
                 style={{ height: 35 }}
          />
        </FormItem>
        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
          style={{width:'60%'}}
          help={isFieldValidating('captcha') ? '校验中...' : (getFieldError('captcha') || []).join(', ')}
        >
          <div className={this.state.intCheckFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'check')}>验证码</div>
          <Input {...captchaProps} autoComplete="off" onBlur={this.intOnBlur.bind(this, 'check')}
                 onFocus={this.intOnFocus.bind(this, 'check')}
                 ref="intCheck"
                 style={{ height: 35 }} />
        </FormItem>
        <Tooltip placement="top" title="点击重新发送">
          <Button className="captchaBtn"
                  onClick={this.changeCaptcha}
                  type="primary"
                  loading={this.state.captchaLoading}
          >
            {this.state.countDownTimeText}
          </Button>
        </Tooltip>
        <FormItem wrapperCol={{ span: 24, }}>
          <Button
            htmlType="submit"
            type="primary"
            onClick={this.handleSubmit}
            loading={submitting}
            disabled={btnState}
            {...submitProps}
            className="subBtn">
            {submitting ? '注册中...' : '注册并加入团队'}
          </Button>
        </FormItem>
      </Form>
    )
  }
})
NotLogUser = createForm()(NotLogUser)
export default NotLogUser