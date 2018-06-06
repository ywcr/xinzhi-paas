/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Member Recharge
 *
 * v0.1 - 2017/2/22
 * @author BaiYu
 */

import React, { Component } from 'react'
import { InputNumber, Form } from 'antd'
import './style/MemberAccount.less'
import { MAX_CHARGE }  from '../../../../constants'

let MemberRecharge = React.createClass({
  componentWillReceiveProps(nextProps) {
    if (!this.props.parentScope.state.visibleMember) {
      // reset form value
      this.props.form.resetFields()
    }
  },
  checkCharge(rule, value, callback) {
    const form = this.props.form
    const _this = this
    const { parentScope } = this.props
    if (typeof value == 'undefined') {
      callback(new Error('请输入数字    '))
      return
    }
    value = parseFloat(value)
    parentScope.setState({number: value})
    let itemBalance =  Number(parentScope.state.record.balance.replace('T',' '))
    if ((itemBalance + value) > MAX_CHARGE ){
      let isvisble = Math.floor((MAX_CHARGE - itemBalance))
      let visible = isvisble > 0 ? isvisble : 0
      callback([new Error(`成员名${parentScope.state.record.namespace}，最大可充值 ${visible}`)])
      return
    }
    callback()
  },
  otherNumber(e) {
    const { parentScope } = this.props
    let number = parseFloat(e.target.value)
    if (!/^\d+$/.test(number)) {
      number = 10
    }
    parentScope.setState({number})
  },
  render () {
    const { parentScope } = this.props
    const { record } = parentScope.state
    const { getFieldProps } = this.props.form
    const autoNumberProps = getFieldProps('autonNumber',{
      rules: [
        { validator: this.checkCharge },
      ],
      trigger: ['onChange'],
      initialValue: parseFloat(parentScope.state.number)
    })
    return(
      <div className="memberItem">
        <div className="list"><span className="itemKey">成员名</span>{record.name}</div>
        <div className="list"><span className="itemKey">成员类型</span>{record.style}</div>
        <div className="list"><span className="itemKey">余额</span>{record.balance}</div>
        <Form>
        <div className="list">
          <span className="itemKey">充值金额</span>
          <div className={parentScope.state.number ==10 ? "pushMoney selected" : 'pushMoney'} onClick={()=> parentScope.activeMenu(10)}><span>10T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <div className={parentScope.state.number ==20 ? "pushMoney selected" : 'pushMoney'} onClick={()=> parentScope.activeMenu(20)}><span>20T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <div className={parentScope.state.number ==50 ? "pushMoney selected" : 'pushMoney'} onClick={()=> parentScope.activeMenu(50)}><span>50T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <div className={parentScope.state.number ==100 ? "pushMoney selected" : 'pushMoney'} onClick={()=> parentScope.activeMenu(100)}><span>100T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <Form.Item style={{float:'left', width:'100px'}}>
            <InputNumber {...autoNumberProps} size="large"  onClick={(e)=> this.otherNumber(e)} min={0} step={50} max={MAX_CHARGE}/> T
          </Form.Item>
        </div>
        </Form>
      </div>
    )
  }
})

MemberRecharge = Form.create()(MemberRecharge)

export default MemberRecharge