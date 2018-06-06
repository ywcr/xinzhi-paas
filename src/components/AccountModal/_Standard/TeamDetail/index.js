/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/10
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Alert, Card, Icon, Button, Table, Menu, Dropdown, Modal, Input, Transfer, } from 'antd'
import './style/TeamDetail.less'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import InviteNewMemberModal from '../../InviteNewMemberModal'
import { loadUserTeamList } from '../../../../actions/user'
import NotificationHandler from '../../../../common/notification_handler'
import { loadTeamUserListStd, removeTeamusersStd, cancelInvitation, dissolveTeam, sendInvitation, getTeamDetail, quitTeam } from '../../../../actions/team'
import DelTeamModal from '../../DelTeamModal'
import ExitTeamModal from '../../ExitTeamModal'

class TeamDetail extends Component {
  constructor(props) {
    super(props)
    this.handleTableChange = this.handleTableChange.bind(this)
    this.getSort = this.getSort.bind(this)
    this.handleSortMemberName = this.handleSortMemberName.bind(this)
    this.getColumns = this.getColumns.bind(this)
    this.handleQuiteTeam = this.handleQuiteTeam.bind(this)
    this.handleDelTeam = this.handleDelTeam.bind(this)
    this.handleAddNewMember = this.handleAddNewMember.bind(this)
    this.closeInviteModal = this.closeInviteModal.bind(this)
    this.closeDelTeamModal = this.closeDelTeamModal.bind(this)
    this.inviteOnSubmit = this.inviteOnSubmit.bind(this)
    this.closeExitTeamModal = this.closeExitTeamModal.bind(this)

    this.state = {
      filteredInfo: null,
      sortedInfo: null,
      sortMemberName: false,
      sort: 'a,teamName',
      filter: '',
      pageSize: 5,
      page: 1,
      current: 1,
      showInviteModal: false,
      showDelModal: false,
      showExitModal: false,
    }
  }
  //表单变化(排序,删选)
  handleTableChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  }
  //排序规则
  getSort(order, column) {
    var query = {}
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  }
  //团队成员名排序
  handleSortMemberName() {
    const { sortMemberName } = this.state
    let sort = this.getSort(!sortMemberName, 'memberName')
    //loadTeamUserListStd(teamID, { sort })
    this.setState({
      sortMemberName: !sortMemberName,
      sort,
    })
  }
  //移除成员
  handleRemoveMember () {
    const { removeTeamusersStd ,teamID, loadTeamUserListStd } = this.props
    let notification = new NotificationHandler()
    notification.spin(`移除成员中...`)
    removeTeamusersStd(teamID, this.state.userName,{
      success: {
        func: (result) => {
          notification.close()
          loadTeamUserListStd(teamID, { sort: 'a,userName', size: 100, page: 1 })
          this.setState({removeModal: false})
        },
        isAsync: true,
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`移除成员失败`, err.message.message)
          this.setState({removeModal: false})
        }
      }
    })
  }
  //发送邀请
  inviteOnSubmit(teamID, emails) {
    const { sendInvitation, loadTeamUserListStd } = this.props
    let notification = new NotificationHandler()
    notification.spin(`发送邀请中...`)
    sendInvitation(teamID, emails, {
      success: {
        func: (result) => {
          notification.close()
          loadTeamUserListStd(teamID, { sort: 'a,userName', size: 100, page: 1 })
        },
        isAsync: true,
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`邀请成员失败`, err.message.message)
        }
      }
    })
  }

  //取消邀请
  handleCancelInvite () {
    const { cancelInvitation ,teamID, loadTeamUserListStd } = this.props
    this.setState({activeModal: false})
    let notification = new NotificationHandler()
    notification.spin(`取消邀请中...`)
    cancelInvitation(teamID, this.state.userEmail, {
      success: {
        func: (result) => {
          notification.close()
          loadTeamUserListStd(teamID, { sort: 'a,userName', size: 100, page: 1 })
        },
        isAsync: true,
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`取消邀请失败`, err.message.message)
        }
      }
    })

  }
  //去充值
  //退出团队
  handleQuiteTeam () {
    this.setState({
      showExitModal: true
    })
  }
  //关闭退出团队弹框
  closeExitTeamModal() {
    this.setState({
      showExitModal: false
    })
  }
  //解散团队
  handleDelTeam (teamID) {
    this.setState({
      showDelModal: true,
    })
  }

  //添加新成员
  handleAddNewMember (teamID) {
    this.setState({
      showInviteModal: true,
    })
  }
  //关闭邀请新成员弹窗
  closeInviteModal() {
    this.setState({
      showInviteModal: false,
    })
  }
  //关闭解散团队弹框
  closeDelTeamModal() {
    this.setState({
      showDelModal: false
    })
  }
  //table列配置
  getColumns (role) {
    let { sortedInfo, filteredInfo, sortMemberName, sort, filter } = this.state
    //普通成员
    if(role === false){
      return [
        {
          title: (
            <div onClick={this.handleSortMemberName}>
              成员名
              <div className="ant-table-column-sorter">
              <span className={sortMemberName ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
                <span className={!sortMemberName ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
              </div>
            </div>
          ),
          dataIndex: 'name',
          key: 'name',
          className: 'memberName',
          width: '33%',
          render: (text, record, index) => (
            index === 0 ?
            <div>{text}(我)</div>:
            <div>{text}</div>
          )
        },
        {
          title: '邮箱',
          dataIndex: 'email',
          key: 'email',
          width: '33%'
        },
        {
          title: '角色',
          dataIndex: 'role',
          key: 'role',
          width: '33%'
        },
      ]
    }
    //创建者
    return [
      {
        title: (
          <div onClick={this.handleSortMemberName}>
            成员名
            <div className="ant-table-column-sorter">
              <span className={sortMemberName ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!sortMemberName ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        className: 'memberName',
        width: '20%',
        render: (text, record, index) => (
          index === 0 ?
          <div>{text}(我)</div>:
          <div>{text}</div>
        )
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: '20%'
      },
      {
        title: '角色',
        dataIndex: 'role',
        key: 'role',
        width: '20%'
      },
      {
        title: '操作',
        dataIndex: 'opt',
        key: 'opt',
        width: '20%',
        className: 'tabOpt',
        render: (text, record, index) => (
        index === 0 ?
          <Link to='/account'>
            <Button className="tabOptBtn" icon="setting">帐号设置</Button>
          </Link>
          :
          record.role == "-" ?
            <Button className="tabOptBtn hoverRed" icon="cross" onClick={() => this.setState({userEmail:record.key, activeModal: true})}>取消邀请</Button>:
            <Button className="tabOptBtn hoverRed" icon="delete" onClick={() => this.setState({userName:record.name, removeModal: true})}>移除</Button>
        )
      },
    ]
  }
  componentWillMount() {
    const { loadTeamUserListStd, teamID, getTeamDetail} = this.props
    getTeamDetail(teamID)
    loadTeamUserListStd(teamID, { sort: 'a,userName', size: 100, page: 1 })
  }

  render() {
    const scope = this
    let { sortedInfo, filteredInfo, sortMemberName, sort,filter, showInviteModal, showDelModal, showExitModal} = this.state
    const { teamName, teamID, currentRole, teamUserList, dissolveTeam, loadUserTeamList, sendInvitation, quitTeam } = this.props
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}

    return (
      <div id='TeamDetail'>
        <Row style={{ marginBottom: 20,height:50,paddingTop:'20px'}}>
          <Link className="back" to="/account/teams">
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </Link>
          <span className="title">
            { teamName }
          </span>
        </Row>
        {
          currentRole === false ?
            <div>
              <Alert message="这里展示了该团队的团队成员信息，作为普通成员您可退出团队。" />
              <Row className="memberOption">
                <Button icon='logout' className='quitTeamBtn' onClick={() => this.handleQuiteTeam()}>
                  退出团队
                </Button>
                <ExitTeamModal
                  visible={showExitModal}
                  closeExitTeamModal={this.closeExitTeamModal}
                  teamName={teamName}
                  teamID={teamID}
                  quitTeam={quitTeam}
                  loadUserTeamList={loadUserTeamList}
                  detailPage = {true}
                />
              </Row>
              <Card className="content">
                <Table columns={this.getColumns(currentRole)} dataSource={teamUserList} onChange={this.handleTableChange} pagination={false}/>
              </Card>
            </div>:
            <div>
              <Alert message="这里展示了该团队的团队成员信息，作为创建者您可管理团队、邀请新成员、解散团队、移除团队成员和跳转到“我的帐户”。" />
              <Row className="memberOption">
                <Button icon='plus' className='quitTeamBtn' onClick={() => this.handleAddNewMember(teamID)}>
                  邀请新成员
                </Button>
                <InviteNewMemberModal
                  visible={ showInviteModal }
                  closeInviteModal={this.closeInviteModal}
                  teamID={teamID}
                  inviteOnSubmit={this.inviteOnSubmit}
                />
                <Button icon='logout' className='delTeamBtn' onClick={() => this.handleDelTeam(teamID)}>
                  解散团队
                </Button>
                <DelTeamModal
                  visible={showDelModal}
                  closeDelTeamModal={this.closeDelTeamModal}
                  teamID={teamID}
                  teamName={teamName}
                  dissolveTeam={dissolveTeam}
                  loadUserTeamList={loadUserTeamList}
                />
                <Link to={`/account/balance/payment?team=${teamName}`}>
                  <Button icon='pay-circle-o' className='rechargeBtn'>
                    去充值
                  </Button>
                </Link>
              </Row>
              <Card className="content">
                <Table columns={this.getColumns(currentRole)} dataSource={teamUserList} onChange={this.handleTableChange} pagination={false}/>
              </Card>
            </div>
        }
        <Modal title="取消邀请操作" visible={this.state.activeModal}
          onOk={()=> this.handleCancelInvite()} onCancel={()=> this.setState({activeModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要取消邀请这个成员?</div>
        </Modal>
        <Modal title="移除成员操作" visible={this.state.removeModal}
          onOk={()=> this.handleRemoveMember()} onCancel={()=> this.setState({removeModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要移除成员 {this.state.userName ? this.state.userName: ''} ?</div>
        </Modal>
      </div>
    )
  }
}
function mapStateToProp(state, props) {
  const { team_id } = props.params
  let currentRole = false
  const { loginUser } = state.entities
  const { user, team } = state
  let teamName = ''
  if (team.teamDetail) {
     if (team.teamDetail.result && team.teamDetail.result.result && team.teamDetail.result.result.teams) {
       if (team.teamDetail.result.result.teams.length > 0) {
        teamName = team.teamDetail.result.result.teams[0].teamName
        currentRole = team.teamDetail.result.result.teams[0].isCreator
       }
     }
  }

  let teamUserList = []
  const { teamusersStd } = state.team
  if (teamusersStd) {
    if (teamusersStd.result) {
      const teamusers = teamusersStd.result.users
      teamusers.map((item, index) => {
        if (item.userName == loginUser.info.userName) {
          teamUserList.splice(0, 0,
            {
              key: item.email,
              name: item.userName,
              email: item.email,
              role: item.isCreator ? "创建者" : "普通成员",
            }
          )
        } else {
          teamUserList.push(
            {
              key: item.email,
              name: item.userName,
              email: item.email,
              role: item.isCreator ? "创建者" : "普通成员",
            }
          )
        }
      })

      const invitedUsers = teamusersStd.result.invitedUsers
      invitedUsers.map((item, index) => {
        teamUserList.push(
          {
            key: item,
            name: "等待接受邀请中...",
            email: item,
            role: "-",
          }
        )
      })
    }
  }
  return {
    teamName,
    teamID: team_id,
    currentRole,
    teamUserList,
  }
}
export default connect(mapStateToProp, {
  loadTeamUserListStd,
  removeTeamusersStd,
  cancelInvitation,
  loadUserTeamList,
  dissolveTeam,
  sendInvitation,
  getTeamDetail,
  quitTeam,
})(TeamDetail)