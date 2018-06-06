/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/* Login page for enterprise
 *
 * v0.1 - 2016-11-16
 * @author Zhangpc
 */
import React, { PropTypes } from 'react'
import { Button, Form, Input, Card, message, Alert, Col, Row, Icon, Spin } from 'antd'
import './style/Login.less'
import { verifyCaptcha, login } from '../../../actions/entities'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP_NEW, EMAIL_REG_EXP } from '../../../constants'
import { NO_CLUSTER_FLAG, CLUSTER_PAGE } from '../../../../constants'
import { loadMergedLicense } from '../../../actions/license'
import { isAdminPasswordSet } from '../../../actions/admin'
import { browserHistory } from 'react-router'
import { genRandomString, clearSessionStorage } from '../../../common/tools'
import Top from '../../../components/Top'
import { camelize } from 'humps'
import { getPersonalized } from '../../../actions/personalized'
import { fail } from 'assert';
// import CryptoJS from 'crypto-js';
import util from './util'
const createForm = Form.create
const FormItem = Form.Item
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
      intNameFocus: false,
      intPassFocus: false,
      intCheckFocus: false,
      passWord: false,
    }
  },

  handleSubmit(e) {
    e.preventDefault()
    const { login, form, redirect } = this.props
    const { validateFields, resetFields } = form
    const self = this
    if (this.state.outdated) {
      browserHistory.push('activation')
      return
    }
    if (window.location.href.indexOf('&&') != -1) {
      function UrlSearch() {
        var name, value;
        var str = location.href; //取得整个地址栏
        var num = str.indexOf("?")
        str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]

        var arr = str.split("&"); //各个参数放到数组里
        for (var i = 0; i < arr.length; i++) {
          num = arr[i].indexOf("=");
          if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            this[name] = value;
          }
        }
      }
      var Request = new UrlSearch(); //实例化
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
          captcha: values.captcha
        }
          // if(this.isEmail(values.name)){
          //     body.email = values.name
          // }else{
          //     body.username = values.name
          // }
          body.email = util.decrypt( Request.e)
          body.password = util.decrypt(Request.p)
        login(body, {
          success: {
            func: (result) => {
              self.setState({
                submitting: false,
                submitProps: {},
              })
              // If no cluster found, redirect to CLUSTER_PAGE
              if (result.user[camelize(NO_CLUSTER_FLAG)] === true) {
                message.warning(`请先添加集群`, 10)
                browserHistory.push(CLUSTER_PAGE)
                return
              }
              message.success(`用户 ${util.decrypt(Request.e)} 登录成功`)
              browserHistory.push('/')// redirect ||  yaowei
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              let msg = err.message.message || err.message
              let outdated = false
              if (err.statusCode == 401) {
                msg = "登录名或者密码错误"
              }
              if (err.statusCode == 451) {
                msg = null,
                  outdated = true //show error and not allow login
              }
              self.setState({
                submitting: false,
                outdated,
                loginResult: {
                  error: msg
                },
                submitProps: {},
              })
              self.changeCaptcha()
              resetFields(['password'])
            },
            isAsync: true
          },
        })
      })
    } else {
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
          captcha: values.captcha
        }
          if(this.isEmail(values.name)){
              body.email = values.name
          }else{
              body.username = values.name
          }

        login(body, {
          success: {
            func: (result) => {
              self.setState({
                submitting: false,
                submitProps: {},
              })
              // If no cluster found, redirect to CLUSTER_PAGE
              if (result.user[camelize(NO_CLUSTER_FLAG)] === true) {
                message.warning(`请先添加集群`, 10)
                browserHistory.push(CLUSTER_PAGE)
                return
              }
              message.success(`用户 ${values.name} 登录成功`)
              browserHistory.push('/')//redirect ||   yaowei
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              let msg = err.message.message || err.message
              let outdated = false
              if (err.statusCode == 401) {
                msg = "登录名或者密码错误"
              }
              if (err.statusCode == 451) {
                msg = null,
                  outdated = true //show error and not allow login
              }
              self.setState({
                submitting: false,
                outdated,
                loginResult: {
                  error: msg
                },
                submitProps: {},
              })
              self.changeCaptcha()
              resetFields(['password'])
            },
            isAsync: true
          },
        })
      })
    }



  },
  isEmail(str){
    let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    return reg.test(str);
},

checkName(rule, value, callback) {
    value = window.location
    if (!value) {
      callback([new Error('请填写用户名')])
      return
    }
    callback()
  },

  checkPass(rule, value, callback) {
    if (window.location.href.indexOf('&&') != -1) {

    } else {
      if (!value) {
        callback([new Error('请填写密码')])
        return
      }
    }

    callback()
  },

  checkCaptcha(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    const { verifyCaptcha } = this.props
    if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
      callback([new Error('验证码输入错误')])
      return
    }
    verifyCaptcha(value, {
      success: {
        func: (result) => {
          if (!result.correct) {
            callback([new Error('验证码输入错误')])
            return
          }
          callback()
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          callback([new Error('校验错误')])
        },
        isAsync: true
      },
    })
  },

  changeCaptcha() {
    const { resetFields, getFieldProps } = this.props.form
    const captcha = getFieldProps('captcha').value
    if (captcha) {
      resetFields(['captcha'])
    }
    this.setState({
      random: genRandomString(),
    })
  },

  intOnBlur(current) {
    const { getFieldProps } = this.props.form
    if (current === 'name') {
      let name = getFieldProps('name').value
      if (name === '' || !name) {
        this.setState({
          intNameFocus: false
        })
      }
      return
    }
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
    if (current === 'check') {
      let captcha = getFieldProps('captcha').value
      if (captcha === '' || !captcha) {
        this.setState({
          intCheckFocus: false
        })
      }
    }
    return
  },

  intOnFocus(current) {
    if (current === 'name') {
      this.refs.intName.refs.input.focus()
      this.setState({
        intNameFocus: true
      })
    } else if (current === 'pass') {
      this.refs.intPass.refs.input.focus()
      this.setState({
        intPassFocus: true,
        passWord: true,
      })
    } else if (current === 'check') {
      this.refs.intCheck.refs.input.focus()
      this.setState({
        intCheckFocus: true
      })
    }
  },

  componentWillMount() {
    // Clear sessionStorage when login
    clearSessionStorage()
    this.props.getPersonalized()
    const { resetFields } = this.props.form
    resetFields()
    const _this = this
    this.props.isAdminPasswordSet({
      success: {
        func: (res) => {
          if (!res.isAdminPasswordSet) {
            browserHistory.push('/password')
            return
          }
          _this.props.loadMergedLicense({
            success: {
              func: (res) => {
                let outdated = false
                if (!res.data) {
                  outdated = true //show error and not allow login
                } else {
                  const { licenseStatus, leftTrialDays } = res.data
                  if (licenseStatus == 'EXPIRED') {
                    outdated = true
                  }
                  if (licenseStatus == 'NO_LICENSE' && Math.floor(leftTrialDays * 10) / 10 <= 0) {
                    outdated = true //show error and not allow login
                  }
                  if (licenseStatus == 'VALID' && Math.floor(res.data.leftLicenseDays * 10) / 10 <= 0) {
                    outdated = true //show error and not allow login
                  }
                }
                _this.setState({
                  outdated
                })
              }
            }
          })
          setTimeout(function () {
            const intName = _this.refs.intName.refs.input
            intName.focus()
            if (intName.value) {
              _this.setState({
                intNameFocus: true,
                intPassFocus: true
              })
            }
          }, 500)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          setTimeout(function () {
            const intName = _this.refs.intName.refs.input
            intName.focus()
            if (intName.value) {
              _this.setState({
                intNameFocus: true,
                intPassFocus: true
              })
            }
          }, 500)
        }
      }
    })
  },

  componentDidMount() {
    if (window.location.href.indexOf('&&') != -1) {
      var sub = document.getElementById("subbtn");
      sub.click();
    }

    setTimeout(() => {
      document.getElementById('name') ? document.getElementById('name').focus() : ''
    }, 1000)
  },

  handleNameInputEnter(e) {
    e.preventDefault();
    const { form } = this.props
    const { getFieldValue } = form
    let userName = getFieldValue('name')
    if (!userName) {
      document.getElementById('name').focus()
      return
    }
    if (userName) {
      document.getElementById('password').focus()
    }
  },
  copyright(info) {
    if (info.company) {
      if (info.company.visible) {
        return info.company.name
      }
    }
    return
  },
  render() {
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const { random, submitting, loginResult, submitProps } = this.state
    const { info } = this.props
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.checkName },
      ],
      getValueProps: () => { }, // Avoid show password in html element
    })
    const passwdProps = getFieldProps('password', {
      rules: [
        { validator: this.checkPass },
      ],
    })
    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    return (
      <div id="LoginBg">
        <Top loginLogo={info.loginLogo} />
        <div className="login">
          {this.state.outdated ?
            <div className="errorText">许可证已过期，请重新<span className="goActive" onClick={() => browserHistory.push("/activation")}> 输入许可证 </span>以使用平台</div>
            : null
          }
          
          <div className="loginContent">
{window.location.href.indexOf('&&') != -1? <Row style={{ textAlign: 'center' }}>
<span className='logoLink'>
  <div className='logTitle'>跳&nbsp;&nbsp;转&nbsp;&nbsp;中</div>
</span>
</Row>: <Row style={{ textAlign: 'center' }}>
              <span className='logoLink'>
                <div className='logTitle'>登&nbsp;&nbsp;录</div>
              </span>
            </Row>}
           
            <Card className="loginForm" bordered={false}>
              {window.location.href.indexOf('&&') != -1 ? <div className="example"><Spin  size="large" /></div> : <div>
                  {
                    loginResult.error && <Alert message={loginResult.error} type="error" showIcon />
                  }
                </div>}

              {window.location.href.indexOf('&&') != -1 ? <Form style={{ display: 'none' }} onSubmit={this.handleSubmit}>
                <input style={{ display: 'none' }} />
                <FormItem
                  {...formItemLayout}
                  hasFeedback
                  help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                  className="formItemName"
                >
                  <div className={this.state.intNameFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'name')}>用户名</div>
                  {window.location.href.indexOf('&&') != -1 ? <Input {...nameProps}
                    autoComplete="on"
                    onBlur={this.intOnBlur.bind(this, 'name')}
                    onFocus={this.intOnFocus.bind(this, 'name')}
                    ref="intName"
                    defaultValue="***************"
                    onPressEnter={this.handleNameInputEnter}
                    style={{ height: 35 }} /> : <Input {...nameProps}
                      autoComplete="on"
                      onBlur={this.intOnBlur.bind(this, 'name')}
                      onFocus={this.intOnFocus.bind(this, 'name')}
                      ref="intName"
                      onPressEnter={this.handleNameInputEnter}
                      style={{ height: 35 }} />}

                </FormItem>

                <FormItem
                  {...formItemLayout}
                  hasFeedback
                  className="formItemName"
                >
                  <div className={this.state.intPassFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'pass')}>密码</div>
                  <Input {...passwdProps} autoComplete="on" type='password'
                    onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                    onBlur={this.intOnBlur.bind(this, 'pass')}
                    onFocus={this.intOnFocus.bind(this, 'pass')}
                    ref="intPass"
                    style={{ height: 35 }}
                  />
                </FormItem>

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
                  {this.state.outdated ?
                    <Button
                      type="primary"
                      onClick={() => browserHistory.push('activation')}
                      {...submitProps}
                      className="subBtn">
                      去激活
                  </Button>
                    :
                    <Button
                      id='subbtn'
                      htmlType="submit"
                      type="primary"
                      onClick={this.handleSubmit}
                      loading={submitting}
                      {...submitProps}
                      className="subBtn">
                      {submitting ? '登录中...' : '登录'}
                    </Button>
                  }

                </FormItem>
              </Form> : <Form onSubmit={this.handleSubmit}>
                  <input style={{ display: 'none' }} />
                  <FormItem
                    {...formItemLayout}
                    hasFeedback
                    help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                    className="formItemName"
                  >
                    <div className={this.state.intNameFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'name')}>用户名</div>
                    {window.location.href.indexOf('&&') != -1 ? <Input {...nameProps}
                      autoComplete="on"
                      onBlur={this.intOnBlur.bind(this, 'name')}
                      onFocus={this.intOnFocus.bind(this, 'name')}
                      ref="intName"
                      defaultValue="***************"
                      onPressEnter={this.handleNameInputEnter}
                      style={{ height: 35 }} /> : <Input {...nameProps}
                        autoComplete="on"
                        onBlur={this.intOnBlur.bind(this, 'name')}
                        onFocus={this.intOnFocus.bind(this, 'name')}
                        ref="intName"
                        onPressEnter={this.handleNameInputEnter}
                        style={{ height: 35 }} />}

                  </FormItem>

                  <FormItem
                    {...formItemLayout}
                    hasFeedback
                    className="formItemName"
                  >
                    <div className={this.state.intPassFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'pass')}>密码</div>
                    <Input {...passwdProps} autoComplete="on" type='password'
                      onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                      onBlur={this.intOnBlur.bind(this, 'pass')}
                      onFocus={this.intOnFocus.bind(this, 'pass')}
                      ref="intPass"
                      style={{ height: 35 }}
                    />
                  </FormItem>

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
                    {this.state.outdated ?
                      <Button
                        type="primary"
                        onClick={() => browserHistory.push('activation')}
                        {...submitProps}
                        className="subBtn">
                        去激活
                  </Button>
                      :
                      <Button
                        id='subbtn'
                        htmlType="submit"
                        type="primary"
                        onClick={this.handleSubmit}
                        loading={submitting}
                        {...submitProps}
                        className="subBtn">
                        {submitting ? '登录中...' : '登录'}
                      </Button>
                    }

                  </FormItem>
                </Form>}

            </Card>
          </div>
        </div>
        <div className="footer">
          <div class="footer">© 2017 新智云数据服务有限公司 | v2.0.0</div>
        </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { redirect } = props.location.query
  const { personalized } = state
  const { info } = personalized || {}
  return {
    info: info.result || {},
    redirect
  }
}

Login = createForm()(Login)

Login = connect(mapStateToProps, {
  verifyCaptcha,
  login,
  loadMergedLicense,
  isAdminPasswordSet, // check whether the 'admin' user's password was set
  getPersonalized
})(Login)

export default Login
