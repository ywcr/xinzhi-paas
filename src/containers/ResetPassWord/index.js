/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  
 *
 * v0.1 - 2016/12/22
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Button, Form, Input } from 'antd'
import { connect } from 'react-redux'
import CommitReset from './CommitReset'
import SpendResetEmail from './SpendResetEmail'
import './style/ResetPassWord.less'
import Top from '../../components/Top'

class ResetPassWord extends Component {
  constructor (props) {
    super(props)
    this.renderResetForm = this.renderResetForm.bind(this)
    this.state = {
    }
  }
  renderResetForm () {
    let { email, code } = this.props
    if (code) {
      return (
        <CommitReset email={email} code={code}/>
      )
    }
    return (
      <SpendResetEmail email={email} />
    )
  }
  render(){
    return (
      <div id='ResetPassWord'>
        <Top />
        <div className='reset'>
          <div className='resetContant'>
          {
            this.renderResetForm()
          }
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state,props) {
  let { email, code } = props.location.query
  return {
    email,
    code,
  }
}
ResetPassWord = connect(mapStateToProps, {

})(ResetPassWord)

export default ResetPassWord