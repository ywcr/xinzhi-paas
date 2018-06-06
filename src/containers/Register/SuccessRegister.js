/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  SuccessRegister
 *
 * v0.1 - 2016/12/22
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Card, Button, message } from 'antd'
import { connect } from 'react-redux'
import { EMAIL_HASH } from '../../constants'
import './style/SuccessRegister.less'
import Top from '../../components/Top'


let SuccessRegister = React.createClass({
  getInitialState(){
    return {
      toEmail: '',//邮箱识别
    }
  },
  //邮箱识别
  getEmail (url) {
    if (url.match('@')) {
      let addr = url.split('@')[1]
      for (let j in EMAIL_HASH) {
        this.setState({
          toEmail: EMAIL_HASH[addr]
        })
        return
      }
    }
    return
  },
  sendAcvivationEmail () {
    const {email, code, sendActivationEmail} = this.props
    if (!email || !code) {
      return
    }
    sendActivationEmail(email, code, {
        success: {
          func: (result) => {
            message.success(`邮件发送成功`)
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            let msg = '邮件发送失败'
            if (err.statusCode === 500) {
              msg = '邮件发送失败，请重试'
            }
            message.error(`${msg}`)
          },
          isAsync: true
        },
      })
  },
  renderGetEmail () {
    const { toEmail } = this.state
    if (toEmail === '' || !toEmail) {
      return (
        <span></span>
      )
    }
    return (
      <Button className='successBtn'>
        <a href={toEmail} target='_blank'>
          登录邮箱查收验证邮件
        </a>
      </Button>
    )
  },
  componentWillMount () {
    const {email} = this.props
    if (email && email !== '') {
      this.getEmail(email)
    }
  },
  render(){
    const { email, msg } = this.props

    return (
      <div id='RegisterPage'>
        <div className='register' id='SuccessRegister'>
          <Card style={{width: 440}}>
            <Top />
            <div className='successTitle'>
            {
              msg === 'NOT_ACTIVE'
              ? '邮箱未激活'
              : '注册成功'
            }
            </div>
            <ul className='successInf'>
              <li>您注册的邮箱是&nbsp;:&nbsp;{email}</li>
              <li>我们已经给您的邮箱发送了一封验证邮件 ,
              请登录您的邮箱完成用户验证</li>
            </ul>
            {
              this.renderGetEmail()
            }
            <div className='successTip'>
              <span>没有收到邮件?</span>
              <span style={{color:'#2db7f5',cursor:'pointer'}} onClick={() => this.sendAcvivationEmail()}>请点击重新发送</span>
            </div>
          </Card>
        </div>
      </div>
    )
  }
})
export default SuccessRegister