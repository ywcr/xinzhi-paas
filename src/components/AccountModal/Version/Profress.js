/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * profress index component
 *
 * v0.1 - 2016-12-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input, Modal, Spin } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/Profress.less"
import { browserHistory } from 'react-router'
import { getEdition } from '../../../actions/user_preference'
import { formatDate, calcuDate } from '../../../common/tools'
import Title from '../../Title'

class VersionProfress extends Component {
  constructor(props) {
    super(props)
    this.renderEditionEndTime = this.renderEditionEndTime.bind(this)
    this.state = {
    }
  }

  componentWillMount() {
    const { getEdition } = this.props
    getEdition()
  }

  renderEditionEndTime() {
    const { editionsList, isEditionsFetching } = this.props
    if (isEditionsFetching) {
      return (
        <div className='timeBox'>
          <span className='timeEnd'>到期时间：<Spin /></span>
        </div>
      )
    }
    const edition = editionsList[0]
    if (!edition) {
      return
    }
    return (
      <div className='timeBox'>
        <span className='timeEnd'>到期时间：{formatDate(edition.endTime)}</span>
        <span className='lastTime'>（{calcuDate(edition.endTime)}到期）</span>
      </div>
    )

  }

  render() {
    return (
      <QueueAnim key='VersionProfressAnim'>
        <div id = 'VersionProfress' key='VersionProfress'>
          <Title title="版本" />
          <div className='bigTitle'>专业版<span>￥99/月</span></div>
          <Card className='topCard'>
            {/*<div className='timeBox'>
              <span className='timeEnd'>到期时间：2017-12-14</span>
              <span className='lastTime'>（仅剩&nbsp;3&nbsp;天到期，请尽快续费）</span>
            </div>*/}
            {this.renderEditionEndTime()}
            <div className='btnBox'>
              <Button type='primary' size='large' onClick={() => browserHistory.push('/account/balance/payment#renewals')}>
                续费
              </Button>
            </div>
          </Card>
          <Card className='bottomCard'>
            <div className='topTitle'>
              <span>专业版功能</span>
            </div>
            <div className='box'>
              <div className='commonBox'>
                <div className='commonTitleBox'>
                  <span className='commonIcon'></span>
                  <span className='commonTitle'>应用管理</span>
                </div>
                <div className='commonInfo'>
                  <span className='commonSpan'>应用</span>
                  <span className='commonSpan'>服务</span>
                  <span className='commonSpan'>容器</span>
                  <span className='commonSpan'>服务配置</span>
                </div>
              </div>
              <div className='commonBox'>
                <div className='commonTitleBox'>
                  <span className='commonIcon'></span>
                  <span className='commonTitle'>存储管理</span>
                </div>
                <div className='commonInfo'>
                  <span className='commonSpan'>创建块存储</span>
                  <span className='commonSpan'>有状态服务挂载</span>
                </div>
              </div>
              <div className='commonBox'>
                <div className='commonTitleBox'>
                  <span className='commonIcon'></span>
                  <span className='commonTitle'>交付中心</span>
                </div>
                <div className='commonInfo'>
                  <span className='commonSpan'>镜像仓库（20个镜像）</span>
                  <span className='commonSpan'>应用商店</span>
                  <span className='commonSpan'>编排文件</span>
                </div>
              </div>
              <div className='commonBox'>
                <div className='commonTitleBox'>
                  <span className='commonIcon'></span>
                  <span className='commonTitle'>CI/CD</span>
                </div>
                <div className='commonInfo'>
                  <span className='commonSpan'>代码仓库（Github、GitLab、SVN）</span>
                  <span className='commonSpan'>EnnFlow（不限）</span>
                  <span className='commonSpan'>Dockerfile</span>
                </div>
              </div>
              <div className='commonBox'>
                <div className='commonTitleBox'>
                  <span className='commonIcon'></span>
                  <span className='commonTitle'>数据库集群与缓存</span>
                </div>
                <div className='commonInfo'>
                  <span className='commonSpan'>关系型数据库&nbsp;&&nbsp;缓存（共8个）</span>
                </div>
              </div>
              <div className='commonBox'>
                <div className='commonTitleBox'>
                  <span className='commonIcon'></span>
                  <span className='commonTitle'>集成中心</span>
                </div>
                <div className='commonInfo'>
                  <span className='commonSpan'>集成应用</span>
                </div>
              </div>
              <div className='commonBox'>
                <div className='commonTitleBox'>
                  <span className='commonIcon'></span>
                  <span className='commonTitle'>管理与监控</span>
                </div>
                <div className='commonInfo'>
                  <span className='commonSpan'>审计日志</span>
                  <span className='commonSpan'>历史日志（支持一年以内日志查询）</span>
                </div>
              </div>
              <div className='commonBox'>
                <div className='commonTitleBox'>
                  <span className='commonIcon'></span>
                  <span className='commonTitle'>帐户中心</span>
                </div>
                <div className='commonInfo'>
                  <span className='commonSpan'>我的帐户</span>
                  <span className='commonSpan'>费用中心</span>
                </div>
              </div><div className='commonBox'>
                <div className='commonTitleBox'>
                  <span className='commonIcon'></span>
                  <span className='commonTitle'>团队管理</span>
                </div>
                <div className='commonInfo'>
                  <span className='commonSpan'>我的团队（1个团队*10个成员）</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

VersionProfress.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const { userPreference } = state
  const { editions } = userPreference

  return {
    editionsList: editions.list,
    isEditionsFetching: editions.isFetching,
  }
}

export default connect(mapStateToProps, {
  getEdition,
})(injectIntl(VersionProfress, {
  withRef: true,
}))