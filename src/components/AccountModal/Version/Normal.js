/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * noraml index component
 *
 * v0.1 - 2016-12-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { browserHistory } from 'react-router'
import { Menu, Button, Card, Input ,Modal} from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/Normal.less"
import arrow from '../../../assets/img/version/arrow.png'
import proIcon from '../../../assets/img/version/proIcon.png'
import Title from '../../Title'

class VersionNoraml extends Component {
  constructor(props) {
    super(props)
    this.changePage = this.changePage.bind(this)
    this.handleUpgrade = this.handleUpgrade.bind(this)
    const { hash } = props
    let currentPage = 'first'
    if (hash === '#pro') {
      currentPage = 'second'
    }
    this.state = {
      currentPage,
      upgradeModalShow: false,
    }
  }

  changePage() {
    //this function for change page
    const { pathname } = this.props
    const { currentPage } = this.state
    if (currentPage == 'first') {
      this.setState({
        currentPage: 'second'
      })
    } else {
      this.setState({
        currentPage: 'first'
      })
    }
  }

  handleUpgrade() {
    browserHistory.push('/account/balance/payment#upgrade')
  }

  render() {
    const { upgradeModalShow } = this.state
    return (
      <div id = 'VersionNoraml'>
        <Title title="版本" />
        {
          this.state.currentPage == 'first' ? [
          <QueueAnim key='firstPageAnim'>
            <div className='firstPage' key='firstPage'>
              <div className='bigTitle'>标准版<span>￥0/月</span></div>
              <Card className='infoCard'>
                <div className='topTitle'>
                  <span>标准版功能</span>
                  <Button type='ghost' size='large' onClick={this.changePage}>
                    <span>了解专业版功能</span>
                  </Button>
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
                      <span className='commonSpan'>镜像仓库（2个镜像）</span>
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
                      <span className='commonSpan'>代码仓库（Github）</span>
                      <span className='commonSpan'>EnnFlow（2个EnnFlow，8个子项目）</span>
                      <span className='commonSpan'>Dockerfile</span>
                    </div>
                  </div>
                  <div className='commonBox'>
                    <div className='commonTitleBox'>
                      <span className='commonIcon'></span>
                      <span className='commonTitle'>数据库集群与缓存</span>
                    </div>
                    <div className='commonInfo'>
                      <span className='commonSpan'>关系型数据库&nbsp;&&nbsp;缓存（共2个）</span>
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
                      <span className='commonSpan'>历史日志（支持1天以内日志查询）</span>
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
                  </div>
                </div>
              </Card>
            </div>
          </QueueAnim>
          ] : [
          <QueueAnim key='secondPageAnim'>
            <div className='secondPage' key='secondPage'>
              <div className='backBtn' onClick={this.changePage}>
                <span>返回</span>
              </div>
              <div className='leftBox'>
                <div className='commonBigTitle'>
                  <span className='versionTitle'>标准版功能</span>
                  <span className='priceTitle'>￥0/月</span>
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
                      <span className='commonSpan'>镜像仓库（2个镜像）</span>
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
                      <span className='commonSpan'>代码仓库（Github）</span>
                      <span className='commonSpan'>EnnFlow（2个EnnFlow，8个子项目）</span>
                      <span className='commonSpan'>Dockerfile</span>
                    </div>
                  </div>
                  <div className='commonBox'>
                    <div className='commonTitleBox'>
                      <span className='commonIcon'></span>
                      <span className='commonTitle'>数据库集群与缓存</span>
                    </div>
                    <div className='commonInfo'>
                      <span className='commonSpan'>关系型数据库&nbsp;&&nbsp;缓存（共2个）</span>
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
                      <span className='commonSpan'>历史日志（支持1天以内日志查询）</span>
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
                  </div>
                  <div className='commonBox' style={{ borderBottom: '0px' }}></div>
                </div>
              </div>
              <div className='middleBox'>
                <div className='aniBox'>
                  <img className='aniImg' src={arrow} />
                  <div className='colorLine' />
                </div>
                <Button size='large' type='primary' onClick={this.handleUpgrade}>
                  <span>升级专业版</span>
                </Button>
              </div>
              <div className='rightBox'>
                <div className='commonBigTitle'>
                  <span className='versionTitle'>专业版功能</span>
                  <span className='priceTitle'>￥99/月</span>
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
                    <img className='commonImg' src={proIcon} />
                    <div className='commonTitleBox'>
                      <span className='commonIcon'></span>
                      <span className='commonTitle'>交付中心</span>
                    </div>
                    <div className='commonInfo'>
                      <span className='commonSpan'>镜像仓库（20个镜像、安全扫描）</span>
                      <span className='commonSpan'>应用商店</span>
                      <span className='commonSpan'>编排文件</span>
                    </div>
                  </div>
                  <div className='commonBox'>
                    <img className='commonImg' src={proIcon} />
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
                    <img className='commonImg' src={proIcon} />
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
                    <img className='commonImg' src={proIcon} />
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
                  </div>
                  <div className='commonBox'>
                    <img className='commonImg' src={proIcon} />
                    <div className='commonTitleBox'>
                      <span className='commonIcon'></span>
                      <span className='commonTitle'>团队管理</span>
                    </div>
                    <div className='commonInfo'>
                      <span className='commonSpan'>我的团队（1个团队*10个成员）</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </QueueAnim>
          ]
        }
      </div>
    )
  }
}

VersionNoraml.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const { location } = props
  const { pathname, hash } = location
  return {
    pathname,
    hash,
  }
}

export default connect(mapStateToProps, {
})(injectIntl(VersionNoraml, {
  withRef: true,
}))