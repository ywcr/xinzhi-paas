/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/* Login page for standard
 *
 * v0.1 - 2016-11-16
 * @author Zhangpc
 */
import React, { PropTypes } from 'react'
import { Button, Form, Input, Card, Tooltip, message, Alert, Col, Row, Spin, } from 'antd'
import './style/Login.less'
import { login } from '../../../actions/entities'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP_NEW, EMAIL_REG_EXP, WECHAT_SIGNUP_HASH } from '../../../constants'
import { browserHistory } from 'react-router'
import { genRandomString, isEmptyObject } from '../../../common/tools'
import { Link } from 'react-router'
import loginMethodWeixinPNG from '../../../assets/img/loginMethodWeixin.png'
import Top from '../../../components/Top'
import WechatQRCodeTicket from '../../../components/WechatQRCodeTicket'

const createForm = Form.create
const FormItem = Form.Item
const WECHAT_BOUND_HASH = '#wechat-bound'
const WECHAT_BOUND_LOGIN_HASH = '#wechat-bound-login'

function noop() {
  return false
}

let Login = React.createClass({
  getInitialState() {
    return {
      random: genRandomString(),
      submitting: false,
      loginResult: {},
      submitProps: {},
      intNameFocus: true,
      intPassFocus: true,
      loginSucess: false,
      accountDetail: {},
    }
  },

  handleSubmit(e) {
    e.preventDefault()
    const { login, form, redirect, hash } = this.props
    const { accountDetail } = this.state
    const { validateFields, resetFields } = form
    const self = this
    validateFields((errors, values) => {
      if (!!errors) {
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
        // captcha: values.captcha,
        // inviteCode : values.code,
      }
      if (values.name.indexOf('@') > -1) {
        body.email = values.name
      } else {
        body.username = values.name
      }
      if (hash === WECHAT_BOUND_LOGIN_HASH) {
        body.accountType = 'wechat'
        body.action = 'bind'
      }
      login(body, {
        success: {
          func: (result) => {
            self.setState({
              submitting: false,
              loginSucess: true,
              submitProps: {},
            })
            let messageText = `用户 ${values.name} 登录成功`
            if (hash === WECHAT_BOUND_LOGIN_HASH) {
              messageText += `，并已成功绑定微信 ${accountDetail.nickname}`
            }
            message.success(messageText)
            browserHistory.push(redirect || '/')
            resetFields()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            let msg = err.message.message || err.message
            if (err.statusCode === 401 && err.message === 'NOT_ACTIVE' && err.email && err.code) {
              browserHistory.push(`/signup?email=${err.email}&code=${err.code}&msg=${err.message}`)
              resetFields()
              return
            }
            /*if (err.statusCode === 403 && err.message.message === 'NOT_INVITED') {
              msg = "邀请码无效"
            }*/
            if (err.statusCode == 401) {
              msg = "登录名或者密码错误"
            }
            self.setState({
              submitting: false,
              loginResult: {
                error: msg
              },
              submitProps: {},
            })
            // self.changeCaptcha()
            resetFields(['password'])
          },
          isAsync: true
        },
      })
    })
  },

  checkName(rule, value, callback) {
    const { getFieldProps } = this.props.form
    if (value.indexOf('@') > -1) {
      if (!EMAIL_REG_EXP.test(value)) {
        callback([new Error('邮箱地址填写错误')])
        return
      }
    }
    callback()
  },

  checkPass(rule, value, callback) {
    if (!value) {
      return callback()
    }
    if (value.length < 6 || value.length > 16) {
      callback(new Error('长度为6~16个字符'))
      return
    }
    callback()
  },

  intOnBlur(current) {
    const { getFieldProps } = this.props.form
    if (current === 'name') {
      let name = getFieldProps('name').value
      let password = getFieldProps('password').value
      let intPassFocus = true
      let intNameFocus = true
      if (name === '' || !name) {
        intNameFocus = false
      }
      if (password === '' || !password) {
        intPassFocus = false
      }
      this.setState({
        intNameFocus,
        intPassFocus
      })
      return
    }
    if (current === 'pass') {
      let password = getFieldProps('password').value
      if (password === '' || !password) {
        this.setState({
          intPassFocus: false,
        })
      }
      return
    }
    return
  },

  intOnFocus(current) {
    if (current === 'name') {
      this.setState({
        intNameFocus: true,
      })
      return
    }
    if (current === 'pass') {
      this.setState({
        intPassFocus: true,
      })
      return
    }
    return
  },

  componentWillMount() {
    const { form, from } = this.props
    const { resetFields } = form
    if (from === 'active') {
      message.success('帐户已经激活')
    }
    resetFields()
  },

  componentDidMount() {
    // const _this = this
    // const intName = this.refs.intName
    setTimeout(() => {
      document.getElementById('name').focus()
      // if (!intName) return
      // const intName = intName.refs.input
      // intName.focus()
      // if (intName.value) {
      //   _this.setState({
      //     intNameFocus: true,
      //     intPassFocus: true
      //   })
      // }
    }, 1000)
  },

  handleNameInputEnter(e){
    e.preventDefault()
    const { form } = this.props
    const { getFieldValue } = form
    let userName = getFieldValue('name')
    if(!userName){
      document.getElementById('name').focus()
      return
    }
    if(userName){
      document.getElementById('password').focus()
    }
  },

  onScanChange(scan, scanResult) {
    const self = this
    self.setState({
      submitting: true,
    })
    const { login, redirect, form } = this.props
    const { resetFields } = form
    const body = {
      accountType: 'wechat'
    }
    login(body, {
      success: {
        func: (result) => {
          self.setState({
            submitting: false,
            loginSucess: true,
          })
          message.success(`用户 ${result.user.userName} 登录成功`)
          browserHistory.push(redirect || '/')
          resetFields()
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          const { statusCode, email, code } = err
          const errMsg = err.message
          let msg = errMsg.message || errMsg
          if (statusCode == 404) {
            msg = ''
            self.setState({
              accountDetail: scanResult.accountDetail
            })
            browserHistory.push(`/login${WECHAT_BOUND_HASH}`)
          }
          if (statusCode === 401 && err.message === 'NOT_ACTIVE' && email && code) {
            browserHistory.push(`/signup?email=${email}&code=${code}&msg=${err.message}`)
            resetFields()
          }
          self.setState({
            submitting: false,
            loginResult: {
              error: msg
            },
            submitProps: {},
          })
        },
        isAsync: true
      },
    })
  },

  renderForm(btnText) {
    btnText = btnText || '登录'
    const { form } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const { random, submitting, submitProps } = this.state
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, message: '请填写用户名' },
        { validator: this.checkName },
      ]
    })
    const passwdProps = getFieldProps('password', {
      rules: [
        { required: true, message: '请填写密码' },
        { validator: this.checkPass },
      ],
      // getValueProps: () => {}, // Avoid show password in html element
    })
    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          hasFeedback
          help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
          className="formItemName"
        >
          <div className={this.state.intNameFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'name')}>用户名</div>

          <Input {...nameProps}
            autoComplete="on"
            onBlur={this.intOnBlur.bind(this, 'name')}
            onFocus={this.intOnFocus.bind(this, 'name')}
            ref="intName"
            style={{ height: 35 }}
            name='name'
            tabIndex='1'
            onPressEnter={this.handleNameInputEnter}
          />
        </FormItem>

        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
        >
          <div className={this.state.intPassFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'pass')}>密码</div>
          <Input {...passwdProps}
            type='password'
            onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
            onBlur={this.intOnBlur.bind(this, 'pass')}
            onFocus={this.intOnFocus.bind(this, 'pass')}
            ref="intPass"
            autoComplete="on"
            style={{ height: 35 }}
            name='password'
            tabIndex='2'
          />
        </FormItem>

        {/*<FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
          >
          <div className={this.state.intCodeFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'code')}>
            邀请码（若已经输入过，请忽略）
          </div>
          <Input {...codeProps} autoComplete="off"
            onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
            onBlur={this.intOnBlur.bind(this, 'code')}
            onFocus={this.intOnFocus.bind(this, 'code')}
            ref="intCode"
            style={{ height: 35 }}
            />
        </FormItem>*/}

        {/*<FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
          help={isFieldValidating('captcha') ? '校验中...' : (getFieldError('captcha') || []).join(', ')}
          >
          <div className={this.state.intCheckFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'check')}>验证码</div>
          <Input {...captchaProps} autoComplete="off" onBlur={this.intOnBlur.bind(this, 'check')}
            onFocus={this.intOnFocus.bind(this, 'check')}
            ref="intCheck"
            style={{ height: 35 }} />
          <Tooltip placement="top" title="点击更换">
            <img className="captchaImg" src={`/captcha/gen?_=${random}`} onClick={this.changeCaptcha} />
          </Tooltip>
        </FormItem>*/}

        <FormItem wrapperCol={{ span: 24, }}>
          <Button
            htmlType="submit"
            type="primary"
            onClick={this.handleSubmit}
            loading={submitting}
            {...submitProps}
            className="subBtn">
            {submitting ? '登录中...' : btnText}
          </Button>
        </FormItem>
      </Form>
    )
  },

  renderLogin() {
    const { hash } = this.props
    const { loginSucess, accountDetail, loginResult } = this.state
    let { nickname, headimgurl } = accountDetail
    headimgurl = headimgurl || ''
    headimgurl = headimgurl.replace('http:', '')
    if (hash === WECHAT_BOUND_HASH && !isEmptyObject(accountDetail)) {
      return (
        <div className="login">
          <Row style={{ textAlign: 'center' }}>
            <span className='logoLink'>
              <div className='logTitle'>新智云</div>
              <div className='logDesc'>技术领先的容器云技术服务商</div>
            </span>
          </Row>
          <Card className="loginForm" bordered={false}>
            <div className="wechatBoundBtns">
              <Button
                onClick={() => browserHistory.push(`/login${WECHAT_BOUND_LOGIN_HASH}`)}
                className="boundBtn">
                绑定已有帐号
              </Button>
              <Button
                type="primary"
                onClick={() => browserHistory.push(`/signup${WECHAT_SIGNUP_HASH}`)}
                className="subBtn">
                注册新帐号
              </Button>
            </div>
          </Card>
        </div>
      )
    }
    if (hash === WECHAT_BOUND_LOGIN_HASH && !isEmptyObject(accountDetail)) {
      return (
        <div className="login">
          <Row style={{ textAlign: 'center' }}>
            <div className="logAvatar" title={nickname}>
              <img alt={nickname} src={(headimgurl || '').replace('http:', '')} />
            </div>
          </Row>
          <Card className="loginForm" bordered={false}>
            <div>
              {
                loginResult.error && <Alert message={loginResult.error} type="error" showIcon />
              }
            </div>
            {this.renderForm('登录并绑定微信')}
          </Card>
        </div>
      )
    }
    return (
      <div className="login">
        <Row style={{ textAlign: 'center' }}>
          <span className='logoLink'>
            <div className='logTitle'>登&nbsp;&nbsp;录</div>
          </span>
        </Row>
        <Card className="loginForm" bordered={false}>
          <div>
            {
              loginResult.error && <Alert message={loginResult.error} type="error" showIcon />
            }
          </div>
          {this.renderForm()}
          <div className='logInFooter'>
            <div className='footerTip'>
              <div className='toRegister'>
                <span>*&nbsp;还没有新智云帐户?</span>
                <Link to='/signup'>立即注册</Link>
              </div>
              <div className='toReset'>
                <Link to='/rpw'>忘记密码</Link>
              </div>
            </div>
            <div className='moreMethod'>
              <div className='methodTitle'>
                <div className='line'></div>
                <div className='methodText'>更多登录方式</div>
                <div className='line'></div>
              </div>
              <div className="methodIcon">
                <div className='weixin'>
                  <WechatQRCodeTicket
                    message="微信扫一扫立即登录"
                    triggerElement={<img src={loginMethodWeixinPNG} />}
                    getTooltipContainer={() => document.getElementById('LoginBgStd')}
                    onScanChange={this.onScanChange} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  },

  render() {
    const { loginSucess } = this.state
    // 登录成功显示加载动画
    if (loginSucess) {
      return (
        <div className="loading">
          <Spin size="large" />
        </div>
      )
    }

    return (
      <div id="LoginBgStd">
        <Top />
        {this.renderLogin()}
        <div className="footer">
         © 2017  新智云 沪公网安备31011002001592号
        </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { query, hash } = props.location
  const { redirect, from } = query
  return {
    redirect,
    from,
    hash,
  }
}

Login = createForm()(Login)

Login = connect(mapStateToProps, {
  login,
})(Login)

export default Login