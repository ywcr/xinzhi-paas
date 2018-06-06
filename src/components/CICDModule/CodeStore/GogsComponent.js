/**
* Licensed Materials - Property of paas.enncloud.cn
* (C) Copyright 2016 TenxCloud. All Rights Reserved.
*
* codeRepo component
*
* v0.1 - 2016-10-31
* @author BaiYu
*/
import React, { Component, PropTypes } from 'react'
import { Alert, Icon, Menu, Button, Card, Input, Tabs, Tooltip, Dropdown, Modal, Spin } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { getGithubList, searchGithubList, addGithubRepo, notGithubProject, registryRepo, syncRepoList,getUserInfo, getRepoList } from '../../../actions/cicd_flow'
import { parseQueryStringToObject } from '../../../common/tools'

import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import NotificationHandler from '../../../common/notification_handler'

const TabPane = Tabs.TabPane

const menusText = defineMessages({
  search: {
    id: 'CICD.TenxStorm.search',
    defaultMessage: '搜索',
  },
  publicKey: {
    id: 'CICD.TenxStorm.publicKey',
    defaultMessage: '公钥授权',
  },
  back: {
    id: 'CICD.TenxStorm.back',
    defaultMessage: '返回',
  },
  creageCodeStore: {
    id: 'CICD.TenxStorm.creageCodeStore',
    defaultMessage: '关联代码仓库',
  },
  logout: {
    id: 'CICD.TenxStorm.logout',
    defaultMessage: '注销',
  },
  clickCopy: {
    id: 'CICD.TenxStorm.clickCopy',
    defaultMessage: '点击复制',
  },
  copyBtn: {
    id: 'CICD.TenxStorm.copyBtn',
    defaultMessage: '复制',
  },
  copySuccess: {
    id: 'CICD.TenxStorm.copySuccess',
    defaultMessage: '复制成功',
  },
  sureCancellationCode: {
    id: 'CICD.TenxStorm.sureCancellationCode',
    defaultMessage: '您是否确认要注销这项代码源',
  },
  notSrc: {
    id: 'CICD.TenxStorm.notSrc',
    defaultMessage: '地址不能为空',
  },
  errorSrc: {
    id: 'CICD.TenxStorm.errorSrc',
    defaultMessage: '地址输入有误',
  },
  syncCode: {
    id: 'CICD.TenxStorm.syncCode',
    defaultMessage: '同步代码',
  },
})


class CodeList extends Component {
  constructor(props) {
    super(props)
  }
  componentWillMount() {
    const loadingList = {}
    const data = this.props.data
    if (data) {
      for (let i = 0; i < data.length; i++) {
        loadingList[i] = false
      }
      this.setState({
        loadingList
      })
    }
  }

  // let CodeList = React.createClass({

  addBuild(item, index, repoUser) {
    const loadingList = {}
    const self = this
    loadingList[index] = true
    this.setState({
      loadingList
    })
    let notification = new NotificationHandler()
    item.repoUser = repoUser
    this.props.scope.props.addGithubRepo(this.props.typeName, item, {
      success: {
        func: () => {
          notification.success('激活成功')
          if(window.location.search && window.location.search.indexOf('redirect=/ci_cd/build_image/enn_flow_build') >= 0) {
            const queryObj = parseQueryStringToObject(window.location.search)
            if(queryObj.redirect) {
              if(queryObj.showCard) {
                browserHistory.push(queryObj.redirect + '&showCard=' + queryObj.showCard)
                return
              }
              browserHistory.push(queryObj.redirect)
            }
            return
          }
          loadingList[index] = false
          self.setState({
            loadingList
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          let message = '激活失败'
          if(res.message.message) {
            message = res.message.message
          }
          notification.error(message)
          loadingList[index] = false
          self.setState({
            loadingList
          })
        }
      }
    })
  }
  notActive(id, index) {
    const parentScope = this.props.scope
    const loadingList = {}
    const users = parentScope.props.users
    loadingList[index] = false
    this.setState({
      loadingList
    })
    let notification = new NotificationHandler()
    parentScope.props.notGithubProject(users, id, this.props.typeName, {
      success: {
        func: () => {
          notification.success('解除激活成功')
        }
      },
      failed: {
        func: (res) => {
          if (res.statusCode == 400) {
            notification.error('该项目正在被EnnFlow引用，请解除引用后重试')
          } else {
            notification.error('解除激活失败')
          }
        }
      }
    })
  }

  render() {
    const { data, isFetching, repoUser } = this.props
    const scope = this
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let items =(<div className="loadingBox"><i className="anticon anticon-frown"></i> 暂无数据</div>)
    if (data && data.length >0) {
      items = data.map((item, index) => {
        return (
          <div className='CodeTable' key={item.name} >
            <div className="name textoverflow">{item.name}</div>
            <div className="type">{item.private ? "private" : 'public'}</div>
            <div className="action">
              {(item.managedProject && item.managedProject.active == 1) ?
                <span><Button type="ghost" disabled>已激活</Button>
                  <a onClick={() => this.notActive(item.managedProject.id, index)} style={{ marginLeft: '15px' }}>解除</a></span>
                :
                <Tooltip placement="right" title="可构建项目">
                  <Button type="ghost" loading={scope.state.loadingList ? scope.state.loadingList[index] : false} onClick={() => this.addBuild(item, index, repoUser)} >{ window.location.search && window.location.search.indexOf('redirect=/ci_cd/build_image/enn_flow_build') >= 0 ? '激活并构建' : '激活'}</Button>
                </Tooltip>
              }
            </div>

          </div>
        );
      });
    }
    return (
      <div className="detail-list">
        {items}
      </div>
    )
  }
}
class GogsComponent extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this)
    this.searchClick = this.searchClick.bind(this)
    this.closeAddGitlabModal = this.closeAddGitlabModal.bind(this)
    this.state = {
      repokey: props.typeName,
      authorizeModal: false,
      currentSearch: '',
      loggedOut: false
    }
  }

  loadData() {
    const { typeName, getUserInfo } = this.props
    this.props.getGithubList(typeName, {
      success: {
        func: (res) => {
          if (res.data.hasOwnProperty('results')) {
            getUserInfo('gogs')
          }
        },
       isAsync: true
      }
    })
  }

  componentWillMount() {
    this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    const { currentSpace } = nextProps;
    if (currentSpace && this.props.currentSpace && currentSpace != this.props.currentSpace) {
      this.loadData()
      return
    }
  }
  closeAddGitlabModal(){
    this.setState({
      authorizeModal: false
    })
  }
  removeRepo() {
    const scope = this.props.scope
    const repoItem = scope.state.repokey
    this.setState({ removeModal: false })
    // this.setState({ loggedOut: true })
    scope.props.deleteRepo(repoItem)
  }
  handSyncCode() {
    const { registryGithub, typeName} = this.props
    const parentScope = this.props.scope
    const typeList = parentScope.state.typeList
    if (!typeList || !typeList.includes(typeName)) {
      parentScope.setState({ typeVisible: true })
      return
    }
    let notification = new NotificationHandler()
    notification.spin(`正在执行中...`)
    this.setState({ loading: true })
    registryGithub(typeName, {
      success: {
        func: (res) => {
          // notification.close()
          window.location.href = res.data.results.url
        }
      },
      failed: {
        func: (res) => {
          notification.close()
          notification.error('授权失败', res.message)
        }
      }
    })
  }
  handleSearch(e) {
    const image = e.target.value
    const { users} = this.props
    this.setState({
      currentSearch: image
    })
    this.props.searchGithubList(users, image, this.props.typeName)
  }
  changeSearch(e) {
    const image = e.target.value
    const { users } = this.props
    this.setState({
      currentSearch: image
    })
    if (image == '') {
      this.props.searchGithubList(users, image, this.props.typeName)
    }
  }
  searchClick() {
    const image = this.state.currentSearch
    const { users } = this.props
    this.props.searchGithubList(users, image, this.props.typeName)
  }
  syncRepoList() {
    const types = this.props.scope.state.repokey
    let notification = new NotificationHandler()
    notification.spin(`正在执行中...`)
    this.props.scope.props.syncRepoList(types, {
      success: {
        func: () => {
          notification.close()
          notification.success(`代码同步成功`)
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          notification.close()
          let message = err.message
          notification.error(message.message)
        }
      }
    })
  }
  registryGogs() {
    let url = this.state.regUrl
    const token = this.state.regToken
    const { formatMessage } = this.props
    let notification = new NotificationHandler()
    if (!url) {
      notification.info(formatMessage(menusText.notSrc))
      return
    }
    if (!token) {
      notification.info('Private Token不能为空')
      return
    }
    if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?(\/{0,1})$/.test(url) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(\/{0,1})$/.test(url)) {
      notification.info(formatMessage(menusText.errorSrc))
      return
    }
    if(url.lastIndexOf('/') == url.length - 1) {
      url = url.substring(0, url.length -1 )
    }
    const config = {
      url,
      token,
      type: this.props.typeName
    }
    this.setState({
      loading: true
    })
    notification.spin(`代码仓库添加中...`)
    this.props.registryRepo(config, {
      success: {
        func: () => {
          notification.close()
          notification.success(`代码仓库添加成功`)
          this.setState({
            authorizeModal: false,
            loggedOut: false,
            loading: false,
            regUrl: '',
            regToken: ''
          })
          this.props.getGithubList(config.type, {
            success: {
              func: (res) => {
                if (res.data.hasOwnProperty('results')) {
                  this.props.getUserInfo('gogs')
                }
              },
              isAsync: true
            }
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          let message = err.message
          if (message && message.message) {
            message = message.message
          }
          notification.close()
          if (err.statusCode === 412) {
            notification.error(`代码仓库添加失败`, '不允许添加此类型的代码仓库！')
          } else {
            notification.error(`代码仓库添加失败`, '仓库地址或者私有Token有误！')
          }
          this.setState({ loading: false })
        }
      }
    })
  }
  showGogsModal() {
    this.setState({ authorizeModal: true })
    setTimeout(function () {
      document.getElementById('codeSrc').focus()
    }, 0)
  }
  changeUrl(e) {
    this.setState({ regUrl: e.target.value })
  }
  changeToken(e) {
    this.setState({ regToken: e.target.value })
  }
  render() {
    const { gogsList, formatMessage, isFetching, typeName} = this.props
    const scope = this
    let codeList = []
    if (!gogsList || this.state.loggedOut) {
      return (
        <div style={{ lineHeight: '100px', paddingLeft: '140px', paddingBottom: '16px' }}>
          <Button type="primary" size="large" onClick={() => this.showGogsModal()}>添加 Gogs 代码仓库</Button>
          <Modal title="添加 Gogs 代码仓库" visible={this.state.authorizeModal} maskClosable={false}
            onCancel={this.closeAddGitlabModal} closable={true}
            footer={[
              <Button key="back" type="ghost" size="large" onClick={() => { this.setState({ authorizeModal: false }) } }>取消</Button>,
              <Button key="submit" type="primary" size="large" loading={this.state.loading} onClick={() => this.registryGogs()}>确定</Button>,
            ]}
            >
            <div>
              <p style={{ lineHeight: '30px' }}>仓库地址：<span>（如 http://gogs.demo.com）</span>
                <Input placeholder="http://*** | https://***" id="codeSrc" onChange={(e) => this.changeUrl(e)} value={this.state.regUrl} size="large" />
              </p>
              <p style={{ lineHeight: '30px' }}>Private Token：<span>（位于 用户设置→管理授权应用→令牌）</span>
                <Input placeholder="Private Token: " size="large" onChange={(e) => this.changeToken(e)} value={this.state.regToken} />
              </p>
            </div>
          </Modal>
        </div>
      )
    }
    if (Object.keys(gogsList).length > 0) {
      for (let i in gogsList) {
        codeList.push(
          <TabPane tab={<span></span>} key={i}>
            <CodeList scope={scope} isFetching={isFetching} repoUser={i} data={gogsList[i]} typeName={this.props.typeName} />
          </TabPane>
        )
      }
    }
    return (
      <div key="github-Component" type="right"  id="gogList" className='codelink'>
        <div className="tableHead">
          <Icon type="user" /> {this.props.users}
          <Tooltip placement="top" title={formatMessage(menusText.logout)}>
            <Icon type="logout" onClick={() => this.setState({ removeModal: true })} style={{ margin: '0 20px' }} />
          </Tooltip>
          <Tooltip placement="top" title={formatMessage(menusText.syncCode)}>
            <Icon type="reload" onClick={() => this.syncRepoList()}  />
          </Tooltip>
          <Tooltip title={this.props.repoUser ? this.props.repoUser.url : ''}>
            <Icon type="link" style={{ margin: '0 20px' }} />
          </Tooltip>
          <div className="right-search">
            <Input className='searchBox' size="large" style={{ width: '180px', paddingRight: '28px' }} onChange={(e) => this.changeSearch(e)} onPressEnter={(e) => this.handleSearch(e)} placeholder={formatMessage(menusText.search)} type='text' />
            <i className='fa fa-search' onClick={this.searchClick}></i>
          </div>
        </div>
        <Tabs>
          {codeList}
        </Tabs>
        <Modal title="注销代码源操作" visible={this.state.removeModal}
          onOk={() => this.removeRepo()} onCancel={() => this.setState({ removeModal: false })}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{ marginRight: '8px' }}></i> {formatMessage(menusText.sureCancellationCode)}?</div>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  const defaultValue = {
    gogsList: []
  }
  const defaultUser = {
    repoUser: {
      username: '',
      depot: '',
      url: ''
    }
  }
  const { githubRepo,userInfo } = state.cicd_flow
  const { isFetching } = githubRepo
  const { gogsList, users} = githubRepo['gogs'] || defaultValue
  const { repoUser } = userInfo.gogs || defaultUser
  return {
    repoUser,
    gogsList,
    isFetching,
    users,
    currentSpace: state.entities.current.space.namespace
  }
}

GogsComponent.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect(mapStateToProps, {
  getUserInfo,
  getGithubList,
  addGithubRepo,
  registryRepo,
  syncRepoList,
  searchGithubList,
  notGithubProject,
  getRepoList
})(injectIntl(GogsComponent, {
  withRef: true
}))
