/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/31
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Button, } from 'antd'
import './style/UserInfo.less'
import Information from './Information'
import Space from './Space'
import Team from './Team'
import { connect } from 'react-redux'
import { ROLE_USER, ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../constants'
import { loadUserDetail, loadUserList, updateUser, loadUserAppInfo, loadUserTeamspaceDetailList, loadUserTeamList } from '../../../actions/user'
import Title from '../../Title'

class UserInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  componentWillMount() {
    const { userID, loadUserDetail, loadUserAppInfo, loadUserTeamspaceDetailList, loadUserTeamList } = this.props
    loadUserDetail(userID ? userID : 'default')
    loadUserAppInfo(userID ? userID : 'default')
    loadUserTeamspaceDetailList(userID ? userID : 'default', null)
    loadUserTeamList(userID ? userID : 'default', null)
  }
  componentWillReceiveProps(nextProps) {
    const { userID, loadUserDetail, loadUserAppInfo, loadUserTeamspaceDetailList, loadUserTeamList } = nextProps
    if (this.props.userID != userID) {
      loadUserDetail(userID ? userID : 'default')
      loadUserAppInfo(userID ? userID : 'default')
      loadUserTeamspaceDetailList(userID ? userID : 'default', null)
      loadUserTeamList(userID ? userID : 'default', null)
    }
  }
  render() {
    const { userID, userDetail, appCount, serviceCount, containerCount, teamspaces, teams, editPass } = this.props
    const href = window.location.href;
    let memberFlag = false;
    if(href.indexOf('account/user') > -1) {
      memberFlag = true;
    }
    return (
      <div id="UserInfo">
        <Title title={userID ? '成员管理' : '我的帐户'} />
        <Row className="title">
          <Col>{ memberFlag ? '成员信息' : '我的信息'}</Col>
        </Row>
        <Row className="content">
          <Card>
            <Information userID={userID} userDetail={userDetail} editPass={editPass} location={this.props.location}/>
          </Card>
        </Row>
        <Row className="title">
          <Col>空间</Col>
        </Row>
        <Row className="content">
          <Card>
            <Space userDetail={userDetail}
              appCount={appCount}
              serviceCount={serviceCount}
              containerCount={containerCount}
              teamspaces={teamspaces} />
          </Card>
        </Row>
        { (userDetail.role == ROLE_TEAM_ADMIN || userDetail.role == ROLE_SYS_ADMIN) ?
        <Row className="title">
          <Col>团队</Col>
        </Row>
        : null
        }
        { (userDetail.role == ROLE_TEAM_ADMIN || userDetail.role == ROLE_SYS_ADMIN) ?
        <Row className="content">
          <Card>
            <Team userDetail={userDetail}
              teams={teams} />
          </Card>
        </Row>
        : null
        }
      </div>
    )
  }
}
function mapStateToProp(state, props) {
  let { user_id } = props.params
  let editPass = false
  if (user_id === 'editPass') {
    editPass = true
    user_id = ''
  }
  let teamspacesData = []
  let spaceTotal = 0
  let spaceSize = 0
  let teamsData = 0
  let teamsTotal = 0
  let teamsSize = 0
  let appCount = 0
  let serviceCount = 0
  let containerCount = 0
  let userDetailData = {
    displayName: '',
    role: 0,
    phone: '',
    email: '',
    balance: 0,
    userID: '',
    userName: '',
  }
  const {userDetail, teamspaceDetails, userAppInfo, teams} = state.user
  if (userDetail.result && userDetail.result.data) {
    userDetailData = userDetail.result.data
  }
  if (teamspaceDetails.result) {
    if (teamspaceDetails.result.teamspaces) {
      teamspacesData = teamspaceDetails.result.teamspaces
    }
    if (teamspaceDetails.result.total) {
      spaceTotal = teamspaceDetails.result.total
    }
    if (teamspaceDetails.result.count) {
      spaceSize = teamspaceDetails.result.size
    }
  }
  if (userAppInfo.result && userAppInfo.result.data) {
    appCount = userAppInfo.result.data.appCount
    serviceCount = userAppInfo.result.data.serviceCount
    containerCount = userAppInfo.result.data.containerCount
  }
  if (teams.result) {
    if (teams.result.teams) {
      teamsData = teams.result.teams
    }
    if (teams.result.total) {
      teamsTotal = teams.result.total
    }
    if (teams.result.count) {
      teamsSize = teams.result.size
    }
  }
  return {
    userDetail: userDetailData,
    userID: user_id,
    teamspaces: teamspacesData,
    spaceTotal,
    spaceSize,
    teams: teamsData,
    teamsSize,
    teamsTotal,
    appCount,
    serviceCount,
    containerCount,
    editPass,
  }
}

export default connect(mapStateToProp, {
  loadUserDetail,
  updateUser,
  loadUserTeamspaceDetailList,
  loadUserAppInfo,
  loadUserList,
  loadUserTeamList,
})(UserInfo)