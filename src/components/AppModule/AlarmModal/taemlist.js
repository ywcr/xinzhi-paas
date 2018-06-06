/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 EnnCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/9
 * @author zhy
 */
import React, { Component } from 'react'
import { Row, Col, Transfer, } from 'antd'
import './style/MemberTransfer.less'
import { loadUserList } from '../../../actions/user'
import { connect } from 'react-redux'

class MemberTransfer extends Component {
    constructor(props) {
        super(props)
        this.filterOption = this.filterOption.bind(this)
        this.renderItem = this.renderItem.bind(this)
    }
      filterOption(inputValue, option) {
        return option.title.indexOf(inputValue) > -1;
      }
    componentWillMount() {
        this.props.loadUserList({ size: 0 })
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
        //   value: item.email,
        }
      }

    render() {
        const { onChange, userList, UserIDList, spaceID ,targetKeys,teamAllUserIDList} = this.props
        // userList.filter(function (userItem) {
        //     return !teamAllUserIDList.includes(userItem.key)
        //   })
        return (
            <div id='MemberTransfer'>
                <Transfer
                    dataSource={userList}
                    showSearch
                    filterOption={this.filterOption}
                    listStyle={{
                        width: 280,
                        height: 300,
                    }}
                    operations={['添加', '移除']}
                    targetKeys={targetKeys}
                    onChange={onChange}
                    titles={['筛选用户', '已选择用户']}
                    render={this.renderItem}
                />
            </div>
        )
    }
}
function mapStateToProp(state, props) {
    // const UserIDList=props.UserIDList
    // const userlist = props.userList
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
        // UserIDList:UserIDList,
        // userlist:userlist
    }
}
export default connect(mapStateToProp, {
    loadUserList,
})(MemberTransfer)