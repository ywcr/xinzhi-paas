/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  space Recharge
 *
 * v0.1 - 2017/2/22
 * @author BaiYu
 */

import React, { Component } from 'react'
import { InputNumber, Table, Icon, Button, Form } from 'antd'
import { parseAmount } from '../../../../common/tools'
import { connect } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import { chargeTeamspace } from '../../../../actions/charge'
import { loadTeamspaceList } from '../../../../actions/team'
import { loadUserTeamspaceDetailList } from '../../../../actions/user'
import './style/MemberAccount.less'
import NotificationHandler from '../../../../common/notification_handler'
import { MAX_CHARGE }  from '../../../../constants'

let SpaceRecharge = React.createClass({
  getInitialState() {
    return {
      number: 10,
    }
  },
  // componentWillReceiveProps(nextProps) {
  //   if(nextProps.visible !== this.props.visible && nextProps.visible) {
  //     this.setState({
  //       spaceID: nextProps.parentScope.state.selected || []
  //     })
  //   }
  // },
  activeMenu(number) {
    // set selected recharge memory (unit T)
    this.setState({number})
  },
  otherNumber(e) {
    let number = parseFloat(e.target.value)
    if (!/^\d+$/.test(number)) {
      number = 10
    }
    this.setState({number})
  },
  btnCancel() {
    this.setState({number:10})
    this.props.parentScope.setState({selected:[],spaceVisible: false})
    this.props.form.resetFields()
  },
  handCharges() {
    // space charge
    let data = []
    const _this = this
    let notification = new NotificationHandler()
    this.props.selected.map((list, index)=> {
      data.push(_this.props.teamSpacesList[list].namespace)
    })
    const { chargeTeamspace, parentScope, loadTeamspaceList, teamID, teamSpaces,  loadUserTeamspaceDetailList , teamList} =  this.props
    // has teamID ,loadTeamspaceList, or not loadTeamspaceList
    //  has teamList props load loadUserTeamspaceDetailList
    const body = {
      namespaces: data,
      amount: parseFloat(_this.state.number)
    }
    if (data.length ==0) {
      notification.info('请选择要充值的空间名')
      return
    }
    this.props.form.validateFields((error, valus)=> {
      if (!!error){
        return
      }
      parentScope.setState({spaceVisible: false})
      chargeTeamspace(body, {
        success:{
          func: () => {
            notification.success('空间充值成功')
            if (teamID) {
              loadTeamspaceList(teamID)
              _this.setState({number: 10})
              _this.props.form.resetFields()
              return
            }
            if (teamList) {
              _this.setState({number: 10})
              _this.props.form.resetFields()
              loadUserTeamspaceDetailList(teamList)
            }
          },
          isAsync: true
        },
        failed: {
          func: ()=> {
            _this.setState({number: 10})
          }
        }
      })

    })

  },
  onSelectChange(selectedRowKeys) {
    this.props.parentScope.setState({ selected: selectedRowKeys });
    this.setState({ spaceID: selectedRowKeys});
    this.props.form.resetFields()
  },
  checkCharge(rule, value, callback) {
    const form = this.props.form
    const _this = this
    if (typeof value == 'undefined') {
      callback(new Error('请输入数字    '))
      return
    }
    value = parseFloat(value)
    const { selected } = this.props
    if (selected.length > 0 ) {
      selected.map((list)=> {
        let itemBalance =  parseAmount(_this.props.teamSpacesList[list].balance, 4).amount
        if ((itemBalance + value) > MAX_CHARGE ){
          let visible = (MAX_CHARGE - itemBalance) > 0 ? parseInt(MAX_CHARGE - itemBalance) : 0
          callback(new Error(`团队空间${_this.props.teamSpacesList[list].namespace}，最大可充值 ${visible}`))
          return
        }
      })
    }
    this.setState({number: value})
    callback()
  },
  handClickRow(recode,index) {
    const { selected } = this.props.parentScope.state;
    let keys = cloneDeep(selected)
    let result = keys.findIndex((n)=> n === index)
    if (result > -1) {
      keys.splice(result,1)
    }else {
      keys.push(index)
    }
    this.props.parentScope.setState({selected: keys})
  },
  render () {
    const selected  = this.props.selected || []
    let disabled = true
    if (selected.length > 0 && this.state.number > 0) {
      disabled = false
    }
    const columns = [{
      title: '空间名',
      dataIndex: 'spaceName',
      render: text => <a href="#">{text}</a>,
      width:'33%'
    }, {
      title: '所属团队',
      dataIndex: 'teamName',
      width:'33%'
    }, {
      title: '余额',
      dataIndex: 'balance',
      render: (text, record, index) => {
        if (selected && selected.includes(index)) {
          return (<div><span>{parseAmount(text,4).fullAmount}</span><a> <span className="push">+</span> {this.state.number}T</a></div>)
        }
        return (<div>{parseAmount(text,4).fullAmount}</div>)
      }

    }];
    // teamSpaceList
    const { teamSpacesList } = this.props
    const _this = this
    const rowSelection = {
      selectedRowKeys: selected,
      onChange: (selectedRows)=> this.onSelectChange(selectedRows),

    };
    const { getFieldProps } = this.props.form
    const autoNumberProps = getFieldProps('autonNumber',{
      rules: [
        { validator: this.checkCharge },
      ],
      trigger: ['onChange'],
      initialValue: parseFloat(this.state.number)
    })
    return(
      <div className="spaceItem">
        <div className="alertRow" style={{margin: 0}}>Tips：可为团队中的各团队空间充值，全选可批量充值</div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={teamSpacesList}
          pagination={false}
          className="wrapTable"
          onRowClick={(recode,index)=>this.handClickRow(recode,index)}
        />
        <Form>
        <div className="list">
          <span className="itemKey">充值金额</span>
          <div className={this.state.number ==10 ? "pushMoney selected" : 'pushMoney'} onClick={()=> this.activeMenu(10)}><span>10T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <div className={this.state.number ==20 ? "pushMoney selected" : 'pushMoney'} onClick={()=> this.activeMenu(20)}><span>20T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <div className={this.state.number ==50 ? "pushMoney selected" : 'pushMoney'} onClick={()=> this.activeMenu(50)}><span>50T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <div className={this.state.number ==100 ? "pushMoney selected" : 'pushMoney'} onClick={()=> this.activeMenu(100)}><span>100T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <Form.Item style={{float:'left', width:'100px'}}>
            <InputNumber size="large" {...autoNumberProps} min={0} step={50} max={MAX_CHARGE} onClick={(e)=> this.otherNumber(e) }/> T
          </Form.Item>
        </div>
        </Form>
        <div className="ant-modal-footer">
          {
            (selected.length > 0)
            ? <span className="parameter">已选中<span> {selected.length} 个</span></span>
            : null
          }
          <Button size="large" onClick={()=> this.btnCancel()}>取消</Button>
          <Button type="primary" disabled={ disabled } size="large" onClick={()=> this.handCharges()}>确定</Button>
        </div>
      </div>
    )
  }
})

SpaceRecharge = Form.create()(SpaceRecharge)

function mapStateToProp(state, props) {

  return {
    props
  }
}



export default connect(mapStateToProp,{
  chargeTeamspace,
  loadTeamspaceList,
  loadUserTeamspaceDetailList
})(SpaceRecharge)