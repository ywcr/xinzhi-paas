/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/20
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Tabs, Button, Form, Input, Card, Tooltip, message, Alert, Col, Row  } from 'antd'
import { USERNAME_REG_EXP_NEW, EMAIL_REG_EXP, WECHAT_SIGNUP_HASH } from '../../constants'
import { PHONE_REGEX } from '../../../constants'
import { connect } from 'react-redux'
import { registerUser, sendRegisterPhoneCaptcha } from '../../actions/user'
import { login } from '../../actions/entities'
import { browserHistory } from 'react-router'
import NotificationHandler from '../../common/notification_handler'
import QRCodeContent from '../../components/WechatQRCodeTicket/QRCodeContent'

const TabPane = Tabs.TabPane
const createForm = Form.create
const FormItem = Form.Item
const EMAIL_SIGNUP_HASH = "#email"

function noop() {
  return false
}

let Person = React.createClass({
  getInitialState() {
    const { hash } = this.props.location
    let activeTabKey = EMAIL_SIGNUP_HASH
    let visible = false
    if (hash === WECHAT_SIGNUP_HASH) {
      activeTabKey = WECHAT_SIGNUP_HASH
      visible = true
    }
    return {
      submitting: false,//注册中
      loginResult: {},
      submitProps: {},
      intPassFocus: false,//密码焦点
      intCheckFocus: false,//验证码焦点
      passWord: false,//密码显示星号
      intEmailFocus: false,//重复密码焦点
      intTelFocus: false,//手机号焦点
      intUserNameFocus: false,//用户名焦点
      captchaLoading: false,//验证码验证中
      countDownTimeText: '发送验证码',//验证码计时文本
      visible,
      activeTabKey,
    }
  },
  //注册
  handleRegisterUser(body) {
    const { form, registerUser } = this.props
    const { resetFields } = form
    const self = this
    registerUser(body, {
      success: {
        func: (result) => {
          self.setState({
            submitting: false,
            submitProps: {},
          })
          message.success(`注册成功`)
          browserHistory.push(`/signup?email=${result.email}&code=${result.code}`)
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
          notification.error(`注册失败`, msg)
        },
        isAsync: true
      },
    })
  },
  handleEmailSignupSubmit(e) {
    const { form } = this.props
    const { validateFields } = form
    const self = this
    e.preventDefault()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      if (!values.password || !values.captcha ||
        !USERNAME_REG_EXP_NEW.test(values.userName) || !PHONE_REGEX.test(values.tel) ||
        !EMAIL_REG_EXP.test(values.email)) {
        return
      }
      this.setState({
        submitting: true,
        submitProps: {
          disabled: 'disabled'
        }
      })
      const body = {
        password: values.password,
        captcha: values.captcha,
        userName: values.userName,
        phone: values.tel,
        email: values.email,
        certType: 1,
        certUserName: values.userName,
      }
      this.handleRegisterUser(body)
    })
  },
  handleWecahtSignupSubmit(e) {
    const { form } = this.props
    const { validateFields } = form
    const self = this
    e.preventDefault()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      if (!values.captcha ||
        !USERNAME_REG_EXP_NEW.test(values.userName) ||
        !PHONE_REGEX.test(values.tel) ||
        !EMAIL_REG_EXP.test(values.email)) {
        return
      }
      this.setState({
        submitting: true,
        submitProps: {
          disabled: 'disabled'
        }
      })
      const body = {
        accountType: 'wechat',
        password: values.password,
        captcha: values.captcha,
        userName: values.userName,
        phone: values.tel,
        email: values.email,
        certType: 1,
        certUserName: values.userName,
      }
      this.handleRegisterUser(body)
    })
  },
  /*
    start---验证---start
  */
  //用户名验证
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
  //邮箱验证
  checkEmail(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    if (!EMAIL_REG_EXP.test(value)) {
      callback([new Error('邮箱格式错误')])
      return
    }
    callback()
  },
  //密码验证
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
  //验证码
  checkCaptcha(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
  },
  //手机号
  checkTel(rule, value, callback){
    if(!value){
      callback()
      return
    }
    if (!PHONE_REGEX.test(value)){
      callback([new Error('请输入正确的号码')])
      return
    }
    callback()
  },
  /*
    end---验证---end
  */
  //发送验证码
  changeCaptcha() {
    // send captcha
    let passValidate = false
    const { validateFields } = this.props.form
    validateFields((err, values) => {
      if (err) {
        return
      }
      const phone = values.tel
      if (!phone || !PHONE_REGEX.test(phone)) {
        return
      }
      passValidate = true
      this.props.sendRegisterPhoneCaptcha(phone, {
        success: {
          func: () => {
            let notification = new NotificationHandler()
            notification.success(`发送验证码成功`)
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            let notification = new NotificationHandler()
            notification.error(`发送验证码失败`, err.message)
          }
        }
      })
    })

    if (!passValidate) {
      return
    }
    this.setState({
      captchaLoading: true,
      countDownTimeText: '60s 后重新发送',
    })
    let wait = 59
    //重新发送定时器
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
  },
  //获取输入框焦点
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
    if (current === 'email') {
      let email = getFieldProps('email').value
      if (email === '' || !email) {
        this.setState({
          intEmailFocus: false
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
  //失去输入框焦点
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
    if (current === 'email') {
      this.refs.intEmail.refs.input.focus()
      this.setState({
        intEmailFocus: true
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
  /*
    start---组件生命周期---start
  */
  componentWillMount() {
    const { resetFields } = this.props.form
    resetFields()
  },
  /*
    end---组件生命周期---end
  */
  renderForm(options={}) {
    const { password, handleSubmit } = options
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const { random, submitting, loginResult, submitProps } = this.state
    const { email } = this.props
    /*
    ---start---
      验证规则
    ---start---
    */
    //用户名规则
    const userNameProps = getFieldProps('userName', {
      rules: [
        { validator: this.checkUserName },
      ],
    })
    //邮箱规则
    const emailProps = getFieldProps('email', {
      rules: [
        { required: true, message: '请填写邮箱' },
        { validator: this.checkEmail },
      ],
    })
    //密码规则
    let passwdProps = getFieldProps('password', {
      rules: [
        { validator: this.checkPass },
      ],
    })
    if (password === 'hide') {
      passwdProps = getFieldProps('password', {})
    }
    //手机号
    const telProps = getFieldProps('tel', {
      rules: [
        { required: true, message: '请填写手机号' },
        { validator: this.checkTel },
      ],
    })
    //验证码
    const captchaProps = getFieldProps('captcha', {
      /*rules: [
        { required: true, message: '请填写验证码' },
        { validator: this.checkCaptcha },
      ],*/
    })
    /*
    ---end---
      验证规则
    ---end---
    */
    //表单项样式
    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    return (
      <Form onSubmit={this.handleSubmit}>
        <input style={{ display: 'none' }} />
        {/*用户名*/}
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
        {/*邮箱*/}
        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
          >
          <div className={this.state.intEmailFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'email')}>邮箱</div>

          <Input {...emailProps} autoComplete="off" onBlur={this.intOnBlur.bind(this, 'email')}
            onFocus={this.intOnFocus.bind(this, 'email')}
            ref="intEmail"
            style={{ height: 35 }} />
        </FormItem>
        {/*密码*/}
        {
          password !== 'hide' &&
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
        }
        {/*手机号*/}
        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
        >
          <div className={this.state.intTelFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'tel')}>手机号</div>
          <Input {...telProps} autoComplete="off"
                  onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                  onBlur={this.intOnBlur.bind(this, 'tel')}
                  onFocus={this.intOnFocus.bind(this, 'tel')}
                  ref="intTel"
                  style={{ height: 35 }}
          />
        </FormItem>
        {/*验证码*/}
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
          {/*验证码按钮*/}
          <Tooltip placement="top" title="点击重新发送">
            <Button className="captchaBtn"
                    onClick={this.changeCaptcha}
                    type="primary"
                    loading={this.state.captchaLoading}
            >
              {this.state.countDownTimeText}
            </Button>
          </Tooltip>
        </FormItem>

        {/*注册按钮*/}
        <FormItem wrapperCol={{ span: 24, }}>
          <Button
            htmlType="submit"
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            {...submitProps}
            className="subBtn">
            {submitting ? '注册中...' : '注册'}
          </Button>
        </FormItem>
      </Form>
    )
  },
  onScanChange(scan, scanResult) {
    // Try to login
    if (!scanResult.wechatAccountExist) {
      return
    }
    const { login } = this.props
    let notification = new NotificationHandler()
    notification.info(`您的微信已绑定新智云账户，即将登录...`)
    login({accountType: 'wechat'}, {
      success: {
        func: (result) => {
          notification.success(`用户 ${result.user.userName} 登录成功`)
          browserHistory.push('/')
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          const { statusCode } = err
          const errMsg = err.message
          let msg = errMsg.message || errMsg
          notification.error('登录失败', msg)
        },
        isAsync: true
      },
    })
  },
  renderWechatSignup() {
    const { location, accountDetail, wechatAccountExist } = this.props
    const { visible } = this.state
    const { hash } = location
    if (!accountDetail || !accountDetail.nickname) {
      return (
        <QRCodeContent
          onScanChange={this.onScanChange}
          action="signup"
          QRCodeSize={195}
          visible={visible}
          message="微信扫一扫立即注册"
          style={{height: '260px', fontSize: "16px", marginBottom: '20px'}} />
      )
    }
    const { nickname, headimgurl } = accountDetail
    return (
      <div>
        <div className="logHead">
          <div className="logAvatar" title={nickname}>
            <img alt={nickname} src={(headimgurl || '').replace('http:', '')} />
          </div>
        </div>
        {
          this.renderForm({
            //password: 'hide',
            handleSubmit: this.handleWecahtSignupSubmit
          })
        }
      </div>
    )
  },
  onTabChange(key) {
    let visible = false
    if (key === '#wechat') {
      visible = true
    }
    this.setState({
      activeTabKey: key,
      visible,
    })
  },
  render() {
    const { activeTabKey } = this.state
    const bottom = (
      <div className="formTip">*&nbsp;注册表示您同意遵守&nbsp;
        <a href="https://www.paas.enncloud.cn/aboutus.html?serviceList" target="_blank" style={{color:'#4691d2'}}>
          新智云&nbsp;TenxCloud&nbsp;服务条款
        </a>
      </div>
    )
    return (
      <div id='Person'>
        <Tabs activeKey={activeTabKey} onChange={this.onTabChange}>
          <TabPane tab="邮箱注册" key={EMAIL_SIGNUP_HASH}>
            {this.renderForm({handleSubmit: this.handleEmailSignupSubmit})}
            {bottom}
          </TabPane>
          <TabPane tab="微信注册" key={WECHAT_SIGNUP_HASH}>
            {this.renderWechatSignup()}
            {bottom}
          </TabPane>
        </Tabs>
      </div>
    )
  }
})

Person = createForm()(Person)

function mapStateToProps(state, props) {
  const { wechatScanStatus } = state.user3rdAccount
  const result = wechatScanStatus.result || {}
  return {
    wechatAccountExist: result.wechatAccountExist,
    accountDetail: result.accountDetail || {},
  }
}

Person = connect(mapStateToProps,{
  registerUser,
  sendRegisterPhoneCaptcha,
  login,
})(Person)

export default Person
