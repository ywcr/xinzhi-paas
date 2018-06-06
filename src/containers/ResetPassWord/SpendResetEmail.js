/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  
 *
 * v0.1 - 2016/12/23
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Button, Form, Input, message, notification} from 'antd'
import { connect } from 'react-redux'
import { EMAIL_REG_EXP, EMAIL_HASH } from '../../constants'
import {sendResetPasswordLink} from '../../actions/user.js'

const createForm = Form.create
const FormItem = Form.Item

function noop() {
  return false
}

let SpendResetEmail = React.createClass({
  getInitialState(){
    return {
      submitting: false,//注册中
      intEmailFocus: false,//邮箱焦点
      spendEmail: false,//发送邮件
      toEmail: '',//邮件地址
    }
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
  //失去输入框焦点
  intOnBlur(current) {
    const { getFieldProps } = this.props.form
    if (current === 'email') {
      let email = getFieldProps('email').value
      if (email === '' || !email) {
        this.setState({
          intEmailFocus: false
        })
      }
      return
    }
  },
  //获取输入框焦点
  intOnFocus(current) {
    if (current === 'email') {
      this.refs.intEmail.refs.input.focus()
      this.setState({
        intEmailFocus: true
      })
      return
    }
  },
  //发送邮箱
  handleSpendEmail(e){
    const { form, registerUser, sendResetPasswordLink } = this.props
    const { validateFields, resetFields } = form
    const self = this

    e.preventDefault()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.getEmail(values.email)
      this.setState({
        submitting: true,
      })
      //发送邀请邮件
      sendResetPasswordLink(values.email,{
        success: {
          func: (result) => {
            self.setState({
              submitting: false,
              spendEmail: true,
            })
            message.success('发送成功')
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            self.setState({
              submitting: false,
              spendEmail: false,
            })
            let msg = '发送失败，请重试'
            if (err.statusCode === 404 && err.message && err.message.details && err.message.details.kind === 'email') {
              msg = '此邮箱不存在，请修改后再试'
            }
            message.error(msg)
          },
          isAsync: true
        }
      })
    })
  },
  //邮箱识别
  getEmail (url) {
    if (url.match('@')) {
      let addr = url.split('@')[1]
      for (let j in EMAIL_HASH) {
        this.setState({
          toEmail: EMAIL_HASH[addr]
        })
      }
    }
    return
  },
  //
  renderGetEmail () {
    const { toEmail } = this.state
    if (toEmail === '' || !toEmail) {
      return (
        <span>
          登录你的邮箱，确认验证邮件
        </span>
      )
    }
    return (
      <Button className='passBtn'>
        <a href={toEmail} target='_blank'>
          登录邮箱
        </a>
      </Button>
    )
  },
  componentWillMount() {
    const { resetFields } = this.props.form
    resetFields()
  },
  render(){
  	const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form
    const { submitting, spendEmail } = this.state
    let email = this.props.email || getFieldValue('email')
    //邮箱验证规则
    const emailProps = getFieldProps('email', {
      rules: [
        { required: true, message: '请填写邮箱' },
        { validator: this.checkEmail },
      ],
    })
    return (
  	  <div>
  	    <div className='resetTitle'>
            重置密码
        </div>
        {
  	      spendEmail ?
  	      <div>
	          <ul className='successInf' style={{marginBottom: 24}}>
	            <li>
	              已发送到 { getFieldValue('email') } ,请
                {
                  this.renderGetEmail()
                }
	              
	            </li>
	            <li>重置密码 , 该邮件的有效期为24小时</li>
	            <li className='rePass'>
	              没有收到邮件 ? 点此 
	              <Button className='passBtn' onClick={this.handleSpendEmail}>
	                重新发送
	              </Button>
	            </li>
	          </ul>
  	      </div> :
  	      <div className='resetForm' style={{marginTop:20, minWidth: 300}}>
  	          <Form>
  	            <FormItem
  	              {...formItemLayout}
  	              hasFeedback
  	              className="formItemName"
  	            >
  	              <div className={this.state.intEmailFocus ? "intName intOnFocus" : "intName"}
  	                  onClick={this.intOnFocus.bind(this, 'email')}
  	              >
  	                邮箱
  	              </div>
  	              
  	              <Input {...emailProps} autoComplete="off"
                         onBlur={this.intOnBlur.bind(this, 'email')}
  	                     onFocus={this.intOnFocus.bind(this, 'email')}
  	                     ref="intEmail"
  	                     style={{ height: 35 }} />
  	            </FormItem>
  	            <FormItem wrapperCol={{ span: 24, }}>
  	              <Button
  	                type="primary"
  	                onClick={this.handleSpendEmail}
  	                loading={submitting}
  	                className="subBtn"
  	                style={{marginBottom: 20}}
  	              >
  	                {submitting ? '发送中...' : '发送邮件'}
  	              </Button>
  	            </FormItem>
  	          </Form>
  	      </div>
        }
  	  </div>
	  )
  }
})

SpendResetEmail = createForm()(SpendResetEmail)

function mapStateToProps (state,props) {
  return {

  }
}

SpendResetEmail = connect(mapStateToProps,{
  sendResetPasswordLink
})(SpendResetEmail)

export default SpendResetEmail