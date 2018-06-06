/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/9
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Transfer, } from 'antd'
import './style/MemberTransfer.less'
import { addTeamusers, removeTeamusers} from '../../../actions/team'
import { loadUserList } from '../../../actions/user'
import { connect } from 'react-redux'

class MemberTransfer extends Component{
  constructor(props){
    super(props)
    this.filterOption = this.filterOption.bind(this)
    this.renderItem = this.renderItem.bind(this)
  }
  filterOption(inputValue, option) {
    return option.title.indexOf(inputValue) > -1;
  }
  componentWillMount(){
    this.props.loadUserList({size: 0})
  }
  renderItem(item){
    let customLabel = (
      <Row style={{display:'inline-block',width:'100%'}}>
        <Col span={9} style={{overflow:'hidden',whiteSpace: "nowrap",textOverflow: 'ellipsis'}}>{item.title}</Col>
        <Col span={12} style={{overflow:'hidden',whiteSpace: "nowrap",textOverflow: 'ellipsis'}}>{item.description}</Col>
      </Row>
    )
    return {
      label: customLabel,
      value: item.description,
    }
  }

  render(){
    const { onChange,userList,UserIDList,teamAllUserIDList,spaceID,teamAllUserList } = this.props

    let filterUserList = teamAllUserIDList.length !== 0 ?
        userList.filter(function (userItem) {
          return !teamAllUserIDList.includes(userItem.key)
        }):
        userList
    return (
      <div id='MemberTransfer'>
        <Row className="listTitle">
          <Col span={14}>成员名</Col>
          <Col span={10}>邮箱</Col>
        </Row>
        <Row className="listTitle" style={{left:375}}>
          <Col span={14}>成员名</Col>
          <Col span={10}>邮箱</Col>
        </Row>
        <Transfer
          dataSource={spaceID?teamAllUserList:filterUserList}
          showSearch
          filterOption={this.filterOption}
          listStyle={{
            width: 250,
            height: 300,
          }}
          operations={['添加', '移除']}
          targetKeys={UserIDList}
          onChange={onChange}
          titles={['筛选用户','已选择用户']}
          render={this.renderItem}
        />
      </div>
    )
  }
}
function mapStateToProp(state,props) {
  // let userList = []
  // const users = state.user.users
  // if(users){
  //   if(users.result){
  //     users.result.users.map((item,index) => {
  //       userList.push(
  //         {
  //           key: item.userID,
  //           title: item.userName,
  //           description: item.email
  //         }
  //       )
  //     })
  //   }
  // }
  return {
  //   userList: userList,
  }
}
export default connect(mapStateToProp, {
  addTeamusers,
  loadUserList,
  removeTeamusers,
})(MemberTransfer)