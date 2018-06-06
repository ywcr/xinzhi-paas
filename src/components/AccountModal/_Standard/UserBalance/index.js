/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
 * User balance - Standard
 *
 * v0.1 - 2016-12-13
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Icon, Button, Popover, Modal, Spin } from 'antd'
import PopContent from '../../../PopSelect/Content'
import { loadLoginUserDetail } from '../../../../actions/entities'
import { loadUserTeamspaceList } from '../../../../actions/user'
import { getEdition } from '../../../../actions/user_preference'
import { parseAmount, formatDate } from '../../../../common/tools'
import './style/balance.less'
import proIcon from '../../../../assets/img/version/proIcon.png'
import proIconGray from '../../../../assets/img/version/proIcon-gray.png'
import Title from '../../../Title'

class UserBalance extends Component {
  constructor(props) {
    super(props)
    this.handleTeamChange = this.handleTeamChange.bind(this)
    this.handleTeamListVisibleChange = this.handleTeamListVisibleChange.bind(this)
    this.state = {
      currentTeam: {
        name: '团队帐户'
      },
      teamListVisible: false,
    }
  }

  componentWillMount() {
    const { currentTeamName, loadLoginUserDetail, loadUserTeamspaceList } = this.props
    loadLoginUserDetail()
    loadUserTeamspaceList('default', { size: 1000 }).then(({response}) => {
      const { teamspaces } = response.result
      let currentTeam
      if (teamspaces) {
        teamspaces.map(teamspace => {
          if (teamspace.teamName == currentTeamName) {
            currentTeam = teamspace
          }
        })
        if (!currentTeam) {
          currentTeam = teamspaces[0]
        }
        if (!currentTeam) {
          return
        }
        this.setState({
          currentTeam,
        })
      }
    })
  }

  componentDidMount() {
    const { getEdition } = this.props
    getEdition()
  }

  handleTeamChange(team) {
    this.setState({
      teamListVisible: false,
      currentTeam: team
    })
  }

  handleTeamListVisibleChange(visible) {
    this.setState({
      teamListVisible: visible
    })
  }

  renderProEdtionEndTime(editionsList, isEditionsFetching) {
    const edition = editionsList[0]
    if (!edition) {
      return
    }
    return (
      <div className='time'>
        到期时间：
        <span className='timeEnd'>
          {
            isEditionsFetching
            ? <Spin />
            : formatDate(edition.endTime, 'YYYY-MM-DD')
          }
          </span>
      </div>
    )
  }

  render() {
    let { loginUser, isTeamsFetching, teamspaces, editionsList, isEditionsFetching, } = this.props
    const { currentTeam, teamListVisible } = this.state
    let { balance, envEdition } = loginUser
    let spaceBalance = currentTeam.balance
    if (balance !== undefined) {
      balance = parseAmount(balance).amount
    }
    if (spaceBalance !== undefined) {
      spaceBalance = parseAmount(spaceBalance).amount
    }
    // show team name instand of space name in standard mode
    teamspaces.map(space => {
      space.name = space.teamName
    })
    return (
      <div id="UserBalance">
        <Title title="充值/续费" />
        <div className="myAccount">
          <div className="topRow"><Icon type="user" className="typeIcon" />我的帐户</div>
          <div className="moneyRow">
            <div>余额：
              <span className="unit">￥</span>
              <span className="money">{balance}</span>
            </div>
          </div>
          <div className="rechargeRow">
            <Button type="primary" size="large" onClick={() => browserHistory.push('/account/balance/payment')}>立即充值</Button>
          </div>
        </div>

        <div className="myTeam">
          <div className="topRow">
            <Icon type="team" className="typeIcon" />
            <span style={{ marginRight: '8px' }}>我的团队</span>
            <Popover
              placement="bottomLeft"
              title="选择团队帐户"
              content={
                <PopContent
                  list={teamspaces}
                  onChange={this.handleTeamChange}
                  loading={isTeamsFetching} />
              }
              trigger="click"
              getTooltipContainer={() => document.getElementById('UserBalance')}
              visible={teamListVisible}
              onVisibleChange={this.handleTeamListVisibleChange}
              >
              <span>{currentTeam.name} <Icon type="down" style={{ fontSize: '8px' }} /></span>
            </Popover>
          </div>
          {teamspaces.length > 0 ?
            <div className="moneyRow">
              <div>余额：
                <span className="unit">￥</span>
                <span className="money">{spaceBalance}</span>
              </div>
            </div>
            :
            <div className="moneyRow text-center">
              <i className="fa fa-users" />
              <div className="notText">您还没有团队帐户，可以尝试创建团队</div>
              <Button type="primary" onClick={() => browserHistory.push('/account/teams')}>去创建</Button>
            </div>
          }
          {teamspaces.length > 0 ?
            <div className="rechargeRow">
              <Button type="primary" size="large" onClick={
                () => browserHistory.push({
                  pathname: '/account/balance/payment',
                  query: { team: currentTeam.teamName }
                })
              }>
                立即充值
              </Button>
            </div>
            : null
          }
        </div>
        {
          envEdition == 0
          ? (
            <div className="version">
              <div className="topRow">
                <img className="edition" alt="升级专业版" title="升级专业版" src={proIconGray} />
                &nbsp;标准版
              </div>
              <div className="moneyRow">
                <span className="unit">￥</span>
                <span className="money">0/月</span>
              </div>
              <div className="rechargeRow">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => browserHistory.push('/account/balance/payment#upgrade')}>
                  升级专业版
                </Button>
              </div>
            </div>
          )
          : (
            <div className="version">
              <div className="topRow">
                <img className="edition" alt="专业版" title="专业版" src={proIcon} />
                &nbsp;专业版
              </div>
              <div className="moneyRow">
                <span className="unit">￥</span>
                <span className="money">99</span>/月
                {this.renderProEdtionEndTime(editionsList, isEditionsFetching)}
              </div>
              <div className="rechargeRow">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => browserHistory.push('/account/balance/payment#renewals')}>
                  续费专业版
                </Button>
              </div>
            </div>
          )
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  let currentTeamName = ""
  if (props.location && props.location.query) {
     currentTeamName = props.location.query.team
  }
  const { entities, user, userPreference } = state
  const { current, loginUser } = entities
  const { teamspaces } = user
  const { editions } = userPreference
  return {
    current,
    currentTeamName,
    loginUser: loginUser.info,
    isTeamsFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    editionsList: editions.list,
    isEditionsFetching: editions.isFetching,
  }
}

export default connect(mapStateToProps, {
  loadLoginUserDetail,
  loadUserTeamspaceList,
  getEdition,
})(UserBalance)
