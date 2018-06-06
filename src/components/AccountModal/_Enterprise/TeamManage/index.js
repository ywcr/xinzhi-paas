/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Alert, Menu, Dropdown, Button, Icon, Card, Table, Modal, Input, Tooltip, } from 'antd'
import './style/TeamManage.less'
import { Link } from 'react-router'
import SearchInput from '../../../SearchInput'
import { connect } from 'react-redux'
import { loadUserTeamList,loadUserList } from '../../../../actions/user'
import UserControl from '../TeamDetail/userControl'
import {
  createTeam, deleteTeam, createTeamspace,
  addTeamusers, removeTeamusers, loadTeamUserList,
  checkTeamName,loadTeamspaceList,loadTeamAllUserList
} from '../../../../actions/team'
import { chargeTeamspace } from '../../../../actions/charge'
import { ROLE_SYS_ADMIN } from '../../../../../constants'

import MemberTransfer from '../../MemberTransfer'
import CreateTeamModal from '../../CreateTeamModal'
import NotificationHandler from '../../../../common/notification_handler'
import SpaceRecharge from '../Recharge/SpaceRecharge'
import Title from '../../../Title'

let TeamTable = React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,
      sortedInfo: null,
      sortMember: true,
      sortSpace: true,
      sortCluster: true,
      sortTeamName: true,
      addMember: false,
      targetKeys: [],
      sort: "a,teamName",
      filter: "",
      nowTeamID: ''
    }
  },
  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
    })
  },
  handleBack() {
    const { scope } = this.props
    scope.setState({
      notFound: false,
    })
  },
  delTeam() {
    const {deleteTeam, loadUserTeamList} = this.props.scope.props
    const {page, pageSize, sort, filter} = this.props.scope.state
    const { teamName, teamID } = this.state
    this.setState({delTeamModal: false})
    let notification = new NotificationHandler()
    notification.spin(`删除 ${teamName} 中...`)
    deleteTeam(teamID, {
      success: {
        func: () => {
          notification.close()
          notification.success(`删除 ${teamName} 成功`)
          loadUserTeamList('default', {
            page: page,
            size: pageSize,
            sort,
            filter,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          notification.close()
          if (err.message.code == 403) {
            notification.error(`删除${teamName}失败：请先删除该团队下的团队空间后, 再删除团队`)
            return
          }
          notification.error(`删除 ${teamName} 失败: ` + err.message.message)
        }
      }
    })

  },
  getSort(order, column) {
    var query = {}
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  handleSortMember() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter } = this.props.scope.state
    const { sortMember } = this.state
    let sort = this.getSort(!sortMember, 'userCount')
    loadUserTeamList('default', {
      page: this.state.page,
      size: this.state.pageSize,
      sort,
      filter,
    })
    this.setState({
      sortMember: !sortMember,
      sort,
    })
  },
  handleSortSpace() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter } = this.props.scope.state
    const { sortSpace } = this.state
    let sort = this.getSort(!sortSpace, 'spaceCount')
    loadUserTeamList('default', {
      page: this.state.page,
      size: this.state.pageSize,
      sort,
      filter,
    })
    this.setState({
      sortSpace: !sortSpace,
      sort,
    })
  },
  handleSortCluster() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter } = this.props.scope.state
    const { sortCluster } = this.state
    let sort = this.getSort(!sortCluster, 'clusterCount')
    loadUserTeamList('default', {
      page: this.state.page,
      size: this.state.pageSize,
      sort,
      filter,
    })
    this.setState({
      sortCluster: !sortCluster,
      sort,
    })
  },
  handleSortTeamName() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter } = this.props.scope.state
    const { sortTeamName } = this.state
    let sort = this.getSort(!sortTeamName, 'teamName')
    loadUserTeamList('default', {
      page: this.state.page,
      size: this.state.pageSize,
      sort,
      filter,
    })
    this.setState({
      sortTeamName: !sortTeamName,
      sort,
    })
  },
  addNewMember(teamID) {
    const _this = this;
    const { scope } = this.props;
    scope.props.loadTeamAllUserList(teamID, { sort: 'a,userName', size: 1000, page: 1 },{
      success:{
        func:(data)=>{
          setTimeout(()=>{
            _this.setState({
              addMember: true,
              nowTeamID:teamID
            })
          })
          
        }
      }
    })
  },
  handleUserChange(targetKeys) {
    this.setState({ targetKeys })
  },
  btnRecharge(teamID) {
    const parentScope = this.props.scope
    parentScope.props.loadTeamspaceList(teamID)
    parentScope.setState({spaceVisible: true})
  },
  render() {
    let { sortedInfo, filteredInfo, targetKeys, sort,addMember } = this.state
    const { searchResult, notFound, filter} = this.props.scope.state
    const { data, scope, teamUserIDList } = this.props
    const { teamAllUserIDList, teamAllUserList,userList } = scope.props
    filteredInfo = filteredInfo || {}
    sortedInfo = sortedInfo || {}
    const pagination = {
      simple: true,
      total: this.props.scope.props.total,
      sort,
      filter,
      showSizeChanger: true,
      defaultPageSize: 10,
      defaultCurrent: 1,
      current: this.props.scope.state.current,
      pageSizeOptions: ['5', '10', '15', '20'],
      onShowSizeChange(current, pageSize) {
        scope.props.loadUserTeamList('default', {
          page: current,
          size: 10,
          sort,
          filter,
          getType:"teamManager"
        })
        scope.setState({
          page: current,
          pageSize: 10,
          current: 1,
        })
      },
      onChange(current) {
        const {pageSize} = scope.state
        scope.props.loadUserTeamList('default', {
          page: current,
          size: 10,
          sort,
          filter,
          getType:"teamManager"
        })
        scope.setState({
          page: current,
          pageSize: 10,
          current: current,
        })
      },
    }

    const columns = [
      {
        title: (
          <div onClick={this.handleSortTeamName}>
            团队名
            <div className="ant-table-column-sorter">
              <span className={this.state.sortTeamName ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortTeamName ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'team',
        key: 'team',
        width: '16%',
        className: 'teamName',
        render: (text, record, index) => (
          <Link to={`/account/team/${record.team}/${record.key}`}>{text}</Link>
        )
      },
      {
        title: (
          <div onClick={this.handleSortMember}>
            成员
            <div className="ant-table-column-sorter">
              <span className={this.state.sortMember ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortMember ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'member',
        key: 'member',
        width: '18%',
      },
      {
        title: (
          <div onClick={this.handleSortCluster}>
            在用集群
            <div className="ant-table-column-sorter">
              <span className={this.state.sortCluster ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortCluster ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'cluster',
        key: 'cluster',
        width: '18%',
      },
      {
        title: (
          <div onClick={this.handleSortSpace}>
            团队空间
            <div className="ant-table-column-sorter">
              <span className={this.state.sortSpace ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortSpace ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'space',
        key: 'space',
        width: '18%',
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) =>{
          return (
            <div className="addusers">
              <div className="Deleterechargea">
                <Button icon="plus" className="addBtn" onClick={() => this.addNewMember(record.key)}>添加成员</Button>
                <Button icon="delete" className="delBtn" onClick={() => this.setState({delTeamModal:true,teamID: record.key, teamName: record.team})}>删除</Button>
                {(this.props.scope.props.userDetail.role == ROLE_SYS_ADMIN) ?
                  <Button icon="pay-circle-o" className="addBtn" style={{marginLeft:'12px'}} onClick={() => this.btnRecharge(record.key)}>充值</Button>
                :null
                }
              </div>
              <div className="Deleterechargeb">
                <Button icon="plus" className="addBtn" onClick={() => this.addNewMember(record.key)}>添加成员</Button>
                {
                  this.props.scope.props.userDetail.role == ROLE_SYS_ADMIN
                  ? (
                    <Dropdown.Button
                      onClick={() => this.setState({delTeamModal:true,teamID: record.key, teamName: record.team})}
                      overlay={
                        <Menu className="Recharge" onClick={() => this.btnRecharge(record.key)}>
                          <Menu.Item key="0"><Icon type="pay-circle-o" /> 充值</Menu.Item>
                        </Menu>
                      }
                      type="ghost"
                    >
                      删除
                    </Dropdown.Button>
                  )
                  : <Button icon="delete" className="delBtn" onClick={() => this.setState({delTeamModal:true,teamID: record.key, teamName: record.team})}>删除</Button>
                }
              </div>
            </div>
          )
        }
      },
    ]
    return (
      <div>
      <Table columns={columns}
        dataSource={searchResult.length === 0 ? data : searchResult}
        pagination={pagination}
        onChange={this.handleChange}
      />
      {addMember?
      <UserControl 
          spaceID='' // 空间ID
          userList={userList} // 成员列表
          teamAllUserList={teamAllUserList} // 团队所有用户列表
          teamAllUserIDList={teamAllUserIDList} // 添加到团队用户ID列表
          teamID={this.state.nowTeamID} // 团队ID
          scope={this} 
          addMember={addMember}/>
        :''}
      <Modal title="删除团队操作" visible={this.state.delTeamModal}
        onOk={()=> this.delTeam()} onCancel={()=> this.setState({delTeamModal: false})}
      >
      <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除团队 {this.state.teamName} ?</div>
     </Modal>
     </div>
    )
  },
})

class TeamManage extends Component {
  constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.teamOnSubmit = this.teamOnSubmit.bind(this)
    this.handleCreateTeamInt = this.handleCreateTeamInt.bind(this)
    this.state = {
      searchResult: [],
      notFound: false,
      visible: false,
      spaceVisible: false, // space recharge
      teamName: '',
      pageSize: 10,
      page: 1,
      current: 1,
      sort: 'a,teamName',
      selected: []
    }
  }
  showModal() {
    this.setState({
      visible: true,
    })
    setTimeout(function() {
      document.getElementById('teamInput').focus()
    }, 100)
  }
  teamOnSubmit(team) {
    const { createTeam, loadUserTeamList } = this.props
    const { pageSize, sort, filter } = this.state
    let notification = new NotificationHandler()
    notification.spin(`创建团队 ${team.teamName}中...`)
    createTeam(team, {
      success: {
        func: () => {
          notification.close()
          notification.success(`创建团队 ${team.teamName} 成功`)
          loadUserTeamList('default', {
            page: 1,
            current: 1,
            size: pageSize,
            sort,
            filter,
          })
          this.setState({
            visible: false,
          })
        },
        isAsync: true,
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`创建团队 ${team.teamName} 失败`, err.message.message)
        }
      }
    })
  }
  handleCreateTeamInt(e) {
    this.setState({
      teamName: e.target.value
    })
  }
  componentWillMount() {
    this.props.loadUserTeamList('default', {
      page: 1,
      size: 10,
      sort: "a,teamName",
      filter: "",
      getType:"teamManager"
    })
    this.props.loadUserList({size: 0})
  }
  render() {
    const scope = this
    const { visible } = this.state
    const {
      teams, addTeamusers, loadUserTeamList,
      teamUserIDList, loadTeamUserList, checkTeamName
    } = this.props
    const searchIntOption = {
      placeholder: '搜索',
      defaultSearchValue: 'team',
    }
    const funcs = {
      checkTeamName
    }
    return (
      <div id="TeamManage">
        <Title title="团队管理" />
        <Alert message={`团队，由若干个成员组成的一个集体，可等效于公司的部门、项目组、或子公司，
          包含『团队空间』这一逻辑隔离层，以实现对应您企业内部各个不同项目，或者不同逻辑组在云平台上操作对象的隔离，团队管理员可见对应团队的所有空间的应用等对象。`}
          type="info" />
        <Row className="teamOption">
          <Button type="primary" size="large" onClick={this.showModal} className="plusBtn">
            <i className='fa fa-plus' /> 创建团队
          </Button>
          <CreateTeamModal
            scope={scope}
            visible={visible}
            onSubmit={this.teamOnSubmit}
            funcs={funcs} />
          <Button className="viewBtn" style={{ display: "none" }}>
            <Icon type="picture" />
            查看成员&团队图例
          </Button>
          <SearchInput searchIntOption={searchIntOption} scope={scope} data={teams} />
          <div className="total">共{this.props.total}个</div>
        </Row>
        <Row className="teamList">
          <Card>
            <TeamTable data={teams}
              scope={scope}
              addTeamusers={addTeamusers}
              loadUserTeamList={loadUserTeamList}
              loadTeamUserList={loadTeamUserList}
              teamUserIDList={teamUserIDList} />
          </Card>
        </Row>
        {/* 团队空间充值  */}
        <Modal title="团队空间充值" visible={this.state.spaceVisible}
          onCancel={()=> this.setState({spaceVisible: false})}
          width={600}
          footer={null}
        >
          <SpaceRecharge parentScope={this} selected={this.state.selected} teamSpacesList={this.props.teamSpacesList}/>
        </Modal>
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  let teamsData = []
  let total = 0
  let data = []
  let teamUserIDList = []
  const team = state.team
  const teams = state.user.teams
  const userDetail = state.entities.loginUser.info
  let teamSpacesList = [],teamAllUserList=[],teamAllUserIDList=[],userList=[]
  const users = state.user.users
  if(users){
    if(users.result){
      users.result.users.map((item,index) => {
        if(item){
          userList.push(
            {
              key: item.userID,
              title: item.userName,
              description: item.email
            }
          )
        }
      })
    }
  }
  if (teams.result) {
    if (teams.result.teams) {
      teamsData = teams.result.teams
      if (teamsData.length !== 0) {
        teamsData.map((item, index) => {
          data.push(
            {
              key: item.teamID,
              team: item.teamName,
              member: item.userCount,
              cluster: item.clusterCount,
              space: item.spaceCount,
            }
          )
        })
      }
    }
    if (teams.result.total) {
      total = teams.result.total
    }
    if (team.teamusers) {
      if (team.teamusers.result) {
        const teamusers = team.teamusers.result.users

        teamusers.map((item, index) => {

          teamUserIDList.push(item.userID)
        })
      }
    }
  }
  if (team.teamspaces.result) {
    teamSpacesList = team.teamspaces.result.data
  }
  if (team.teamAllusers) {
    if (team.teamAllusers.result) {
      const teamAllusers = team.teamAllusers.result.users
      teamAllusers.map((item, index) => {
        if(item.role != ROLE_SYS_ADMIN){
          teamAllUserList.push(
            {
              key: item.userID,
              title: item.userName,
              description: item.email
            }
          )
          teamAllUserIDList.push(item.userID)
        }
      })
    }
  }
  return {
    teams: data,
    total,
    teamUserIDList: teamUserIDList,
    teamSpacesList,
    teamAllUserIDList,
    teamAllUserList,
    userDetail,
    userList
  }
}

export default connect(mapStateToProp, {
  loadUserTeamList,
  createTeam,
  deleteTeam,
  createTeamspace,
  addTeamusers,
  removeTeamusers,
  loadTeamUserList,
  checkTeamName,
  loadUserList,
  loadTeamAllUserList,
  loadTeamspaceList,
  chargeTeamspace
})(TeamManage)