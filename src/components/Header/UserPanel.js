/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * User panel component
 *
 * v0.1 - 2016-12-22
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Icon, Popover, Button } from 'antd'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import "./style/UserPanel.less"
import { AVATAR_HOST } from '../../constants'
import { parseAmount } from '../../common/tools'
import proIcon from '../../assets/img/version/proIcon.png'
import proIconGray from '../../assets/img/version/proIcon-gray.png'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
import { ROLE_USER, ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../constants'

/**
 * User panel in the upper right corner
 *
 * @class UserPanel
 * @extends {Component}
 */
class UserPanel extends Component {
  constructor(props) {
    super(props)
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.renderMenuItems = this.renderMenuItems.bind(this)
    this.getEdition = this.getEdition.bind(this)
    this.getTitle = this.getTitle.bind(this)
    this.getContent = this.getContent.bind(this)
    this.state = {
      visible: false,
    }
  }

  handleVisibleChange() {
    const { visible } = this.state
    this.setState({
      visible: !visible
    })
  }

  getEdition() {
    const { loginUser } = this.props
    const { envEdition } = loginUser
    if(mode !== standard) {
      return ''
    }
    if (envEdition == 0) {
      return (
        <Link to="/account/version">
          <img className="edition" alt="升级专业版" title="升级专业版" src={proIconGray}/>
        </Link>
      )
    }
    if (envEdition == 1) {
      return (
        <Link to="/account/version">
          <img className="edition" alt="专业版" title="专业版" src={proIcon}/>
        </Link>
      )
    }
    return
  }

  getTitle() {
    const { loginUser } = this.props
    const { userName, email, avatar, certInfos } = loginUser
    let certName = '个人'
    let certStatus = false
    if (mode === standard) {
      if (certInfos && certInfos.length >= 0) {
        let length = certInfos.length
        for (let i = 0; i < length; i++) {
          if (certInfos[i].type == 2 && certInfos[i].status == 4) {
            certName = "企业"
            break
          }
          if (certInfos[i].type == 3 && certInfos[i].status == 4) {
            certName = "组织"
            break
          }
        }
      }
    }
    let userNameInitials = ''
    if (userName) {
      userNameInitials = userName.substr(0, 1).toUpperCase()
    }
    return (
      <div className='logTitle'>
        <div className='logAvatar'>
          {
            mode === standard
            ? (<img alt={userName} src={`${AVATAR_HOST}${avatar}`} />)
            : userNameInitials
          }
        </div>
        <div className="loginText">
          <div className="text">
            <p className="userName">
              {userName}
              {this.getEdition()}
            </p>
            <p className="email">{email || '...'}</p>
          </div>
        </div>
         {
            mode === standard
            ? <div className='loginTag'>{certName}</div>
            : ''
         }
      </div>
    )
  }

  renderMenuItems(menu, index) {
    return (
      <td key={`menu${index}`}>
        <Link to={menu.to} onClick={this.handleVisibleChange}>
          <svg className='logMenuSvg'>
            <use xlinkHref={menu.svgHref} />
          </svg>
          <div>{menu.text}</div>
        </Link>
      </td>
    )
  }

  getContent() {
    const { loginUser, role, balance } = this.props
    /*let { balance } = loginUser
    if (balance !== undefined) {
      balance = parseAmount(balance).amount
    }*/
    let menuItems = [
      {
        to: '/account',
        svgHref: '#logaccountinf',
        text: '帐户信息',
      },
      {
        to: '/account/costCenter#consumptions',
        svgHref: '#logcostrecord',
        text: '消费记录',
      },
      {
        to: '/account#edit_pass',
        svgHref: '#logchangepass',
        text: '修改密码',
      },
    ]
    if (role === ROLE_TEAM_ADMIN || role === ROLE_SYS_ADMIN) {
      menuItems.push({
        to: '/account/team',
        svgHref: '#logteam',
        text: '我的团队',
      })
    } else {
      menuItems.push({
        to: '/account/costCenter#payments',
        // TODO: replace it
        svgHref: '#logpayment',
        text: '充值记录',
      })
    }
    if (mode === standard) {
      menuItems = [
        {
          to: '/account',
          svgHref: '#logaccountinf',
          text: '我的帐户',
        },
        {
          to: '/account/costCenter#consumptions',
          svgHref: '#logcostrecord',
          text: '消费记录',
        },
        {
          to: '/account#edit_pass',
          svgHref: '#logchangepass',
          text: '修改密码',
        },
        {
          to: '/account/teams',
          svgHref: '#logteam',
          text: '我的团队',
        },
      ]
    }
    return (
      <div className='logMenu'>
        <div className='rechangeInf'>
          <div className='balance'>
            <p>帐户余额 &nbsp;:</p>
            <p>
              {
                mode === standard?
                [<span className="unit" key="standard">¥ </span>,<span className="number" key="s-number">{balance}</span>]:
                [<span className="number" key="enterprise">{balance}</span>,<span className="unit" key="e-number"> T</span>]
              }
            </p>
          </div>
          {
            mode === standard &&
            <Button className="payButton" onClick={() => browserHistory.push('/account/balance/payment')}>
              立即充值
            </Button>
          }
        </div>
        <table className='navTab'>
          <tbody>
            <tr>
              {menuItems.slice(0, 2).map(this.renderMenuItems)}
            </tr>
            <tr>
              {menuItems.slice(2).map(this.renderMenuItems)}
            </tr>
          </tbody>
        </table>
        <div className='logCancle'>
          <a href='/logout'>
            <Icon type="poweroff" className='logCancleIcon' />
            注销登录
          </a>
        </div>
      </div>
    )
  }

  render() {
    const { loginUser } = this.props
    const { visible } = this.state
    const rotate = visible ? 'rotate180' : 'rotate0'
    return (
      <Popover
        title={this.getTitle()}
        content={this.getContent()}
        overlayClassName='UserPanel'
        placement="bottomRight"
        arrowPointAtCenter={true}
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
        >
        <div className='userBtn'>
          {loginUser.userName}
          <Icon type="down" className={rotate} />
        </div>
      </Popover>
    )
  }
}

UserPanel.propTypes = {
  loginUser: PropTypes.object.isRequired,
}

function mapStateToProp(state, props) {
  let role = ROLE_USER
  const { entities } = state
  const { loginUser } = props
  const { clusterInfo } = state.overviewCluster
  let { balance } = loginUser
  if (clusterInfo && clusterInfo.result) {
    if (clusterInfo.result.spaceconsumption) {
      balance = clusterInfo.result.spaceconsumption.balance
    }
  }
  if (entities && entities.loginUser && entities.loginUser.info && entities.loginUser.info) {
    role = entities.loginUser.info.role
  }
  return {
    role,
    balance: parseAmount(balance).amount
  }
}

export default connect(mapStateToProp, {
})(UserPanel)
