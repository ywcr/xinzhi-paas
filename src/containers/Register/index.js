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
import { Card, QueueAnim, Button } from 'antd'
import './style/Register.less'
import { connect } from 'react-redux'
import Person from './Person'
import Company from './Company'
import AccountType from './AccountType'
import SuccessRegister from './SuccessRegister'
import { sendActivationEmail } from '../../actions/user'
import Top from '../../components/Top'
import { WECHAT_SIGNUP_HASH } from '../../constants'

class Register extends Component{
  constructor(props){
    super(props)
    this.handlePageChange = this.handlePageChange.bind(this)
    this.renderRegisterPage = this.renderRegisterPage.bind(this)
    let registerPageShow = true
    let registerShow = false
    const { hash } = props
    if (hash === WECHAT_SIGNUP_HASH) {
      registerPageShow = false
      registerShow = true
    }
    this.state = {
      registerPageShow,
      registerShow,
      person: true,
    }
  }
  handlePageChange(person) {
    this.setState({
      registerPageShow: !this.state.registerPageShow,
      registerShow: !this.state.registerShow,
    })
    if (person !== undefined) {
      this.setState({
        person,
      })
    }
  }
  renderRegisterPage(register,registerPage){
    const { registerPageShow, registerShow } = this.state
    const {email, code, msg, sendActivationEmail} = this.props
    if (email) {
      return (
        <SuccessRegister email={email} code={code} msg={msg} sendActivationEmail={sendActivationEmail} />
      )
    }

    return (
      <div>
        {registerPageShow ? registerPage : null}
        {registerShow ? register : null}
      </div>
    )
  }
  componentWillMount(){
  }
  render(){
    let register = (
      <div key='b' id='RegisterPage'>
        <Top/>
        <div className='register registerFlex'>
          <Card className="registerForm" bordered={false} style={{width: 440,padding: '0 50px 24px',overflow: 'hidden'}}>
            <div className='backToPage' onClick={this.handlePageChange}>&lt;&lt;&nbsp;&nbsp;&nbsp;重选注册帐户类型</div>
            {
              this.state.person ?
              <Person location={this.props.location} />:
              <Company />
            }
          </Card>
        </div>
      </div>
    )
    let registerPage = (
      <div key='a' id='RegisterPage'>
        <Top/>
        <div className='register'>
            <Card className="registerForm" bordered={false} style={{width: 680}}>
              <AccountType onChange={this.handlePageChange} />
              <div className="accountFooter">
                *&nbsp;个人帐户可以升级到企业帐户，但是企业帐户不可降级为个人帐户<br/>
                *&nbsp;注册并完成认证后方可享受以上测试金及支持服务
              </div>
            </Card>
        </div>
      </div>
    )

    return (
      this.renderRegisterPage(register,registerPage)
    )
  }
}
function mapStateToProps (state, props) {
  const { query, hash } = props.location
  let { email, code, msg } = query
  return {
    code,
    email,
    msg,
    hash,
  }
}
Register = connect(mapStateToProps, {
  sendActivationEmail,
})(Register)

export default Register