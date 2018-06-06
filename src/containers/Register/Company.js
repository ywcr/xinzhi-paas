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
import { Tabs, Button, Form, Input, Card, Tooltip, message, Alert, Col, Row, Radio } from 'antd'
import { connect } from 'react-redux'
import { registerUser, sendRegisterPhoneCaptcha } from '../../actions/user'
import { browserHistory } from 'react-router'
import { USERNAME_REG_EXP_NEW, EMAIL_REG_EXP } from '../../constants'
import { PHONE_REGEX } from '../../../constants'
import NotificationHandler from '../../common/notification_handler'

const createForm = Form.create
const FormItem = Form.Item
const RadioGroup = Radio.Group

function noop() {
  return false
}

let Company = React.createClass({
  getInitialState() {
    return {
      submitting: false,//注册中
      loginResult: {},
      submitProps: {},
      intPassFocus: false,//密码焦点
      intCheckFocus: false,//验证码焦点
      passWord: false,//密码显示星号
      intEmailFocus: false,//邮箱焦点
      intTelFocus: false,//手机号焦点
      intUserNameFocus: false,//用户名焦点
      intCertNameFocus: false,//单位名焦点
      intCertCodeFocus: false,//单位代码焦点
      captchaLoading: false,//验证码验证中
      countDownTimeText: '发送验证码',//验证码计时文本
      certTypeCompany: true
    }
  },
  //注册
  handleSubmit (e) {
    const { form, registerUser } = this.props
    const { validateFields, resetFields } = form
    const self = this
    e.preventDefault()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      if (!values.password || !values.captcha ||
        !USERNAME_REG_EXP_NEW.test(values.userName) || !PHONE_REGEX.test(values.tel) ||
        !EMAIL_REG_EXP.test(values.email) || !values.certCode) {
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
        certType: values.certType,
        certUserName: values.userName,
        enterpriseName: values.certName,
        enterpriseCertID: values.certCode,
      }
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
                  dupItems += '手机号码 '
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
      callback([new Error('请填写验证码')])
      return
    }
  },
  //手机号
  checkTel(rule, value, callback){
    if(!value){
      callback()
      return
    }
    if(!PHONE_REGEX.test(value)){
      callback([new Error('请输入正确的手机号码')])
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
    // let passValidate = false
    const { validateFields } = this.props.form
    validateFields((err, values) => {
      if (err) {
        return
      }
      const phone = values.tel
      if (!phone || !PHONE_REGEX.test(phone)) {
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
  },
  //失去输入框焦点
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
    if (current === 'certName') {
      let certName = getFieldProps('certName').value
      if (certName === '' || !certName) {
        this.setState({
          intCertNameFocus: false,
        })
      }
    }
    if (current === 'certCode') {
      let certCode = getFieldProps('certCode').value
      if (certCode === '' || !certCode) {
        this.setState({
          intCertCodeFocus: false,
        })
      }
    }
  },
  //获取输入框焦点
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
    if (current === 'certCode') {
      this.refs.intCertCode.refs.input.focus()
      this.setState({
        intCertCodeFocus: true,
      })
    }
    if (current === 'certName') {
      this.refs.intCertName.refs.input.focus()
      this.setState({
        intCertNameFocus: true,
      })
    }
  },
  handleCertTypeChange (e) {
    if (e.target.value === 2) {
      this.setState({
        certTypeCompany: true
      })
      return
    }
    this.setState({
      certTypeCompany: false
    })
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
  render() {
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
    const passwdProps = getFieldProps('password', {
      rules: [
        { validator: this.checkPass },
      ],
    })
    //手机号
    const telProps = getFieldProps('tel', {
      rules: [
        { required: true, message: '请填写手机号码' },
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
      <div id='Company'>
        {/*
         表单---start
         */}
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
          {/*手机号*/}
          <FormItem
            {...formItemLayout}
            hasFeedback
            className="formItemName"
          >
            <div className={this.state.intTelFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'tel')}>手机号码</div>
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

          {/*单位选择*/}
          <FormItem
            {...formItemLayout}
            className="formItemName"
            style={{borderTop:'1px dashed #d5d5d5',paddingTop:'10px',height:25}}
          >
            <RadioGroup {...getFieldProps('certType', { initialValue: 2 ,onChange: this.handleCertTypeChange})}>
              <Radio value={2} style={{cursor:'pointer'}}>企业单位</Radio>
              <Radio value={3} style={{cursor:'pointer'}}>组织机构</Radio>
            </RadioGroup>
          </FormItem>
          {/*单位名称*/}
          <FormItem
            {...formItemLayout}
            className="formItemName"
          >
            <div className={this.state.intCertNameFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'certName')}>
              {
                this.state.certTypeCompany ?
                <span>企业名称</span>:
                <span>组织名称</span>
              }
            </div>
            <Input {...getFieldProps('certName')} autoComplete="off" onBlur={this.intOnBlur.bind(this, 'certName')}
                   onFocus={this.intOnFocus.bind(this, 'certName')}
                   ref="intCertName"
                   style={{ height: 35 }} />
          </FormItem>
          {/*单位代码*/}
          <FormItem
            {...formItemLayout}
            className="formItemName"
          >
            <div className={this.state.intCertCodeFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'certCode')}>
              {
                this.state.certTypeCompany ?
                <span>
                  营业执照号
                </span>:
                <span>
                  组织机构代码
                </span>
              }
            </div>
            <Input {...getFieldProps('certCode')} autoComplete="off" onBlur={this.intOnBlur.bind(this, 'certCode')}
                   onFocus={this.intOnFocus.bind(this, 'certCode')}
                   ref="intCertCode"
                   style={{ height: 35 }} />
          </FormItem>
          {/*注册按钮*/}
          <FormItem wrapperCol={{ span: 24, }}>
            <Button
              htmlType="submit"
              type="primary"
              onClick={this.handleSubmit}
              loading={submitting}
              {...submitProps}
              className="subBtn">
              {submitting ? '注册中...' : '注册'}
            </Button>
          </FormItem>
        </Form>
        {/*
         表单---end
         */}
        <div className="formTip">*&nbsp;注册表示您同意遵守&nbsp;
          <a href="https://www.paas.enncloud.cn/aboutus.html?serviceList" target="_blank" style={{color:'#4691d2'}}>
            新智云&nbsp;TenxCloud&nbsp;服务条款
          </a>
        </div>
      </div>
    )
  }
})

Company = createForm()(Company)

function mapStateToProps(state,props) {
  return {

  }
}
Company = connect(mapStateToProps,{
  registerUser,
  sendRegisterPhoneCaptcha,
})(Company)

export default Company