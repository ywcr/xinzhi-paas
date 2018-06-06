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
import { parseQueryStringToObject } from '../../../common/tools'
import { getGithubList, searchGithubList, addGithubRepo, notGithubProject, registryGithub, syncRepoList } from '../../../actions/cicd_flow'
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
    defaultMessage: '同步代码源项目结构',
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
    this.props.scope.props.addGithubRepo('github',item, {
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
          notification.error('激活失败', res.message)
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
    const users = parentScope.state.users
    loadingList[index] = false
    this.setState({
      loadingList
    })
    let notification = new NotificationHandler()
    parentScope.props.notGithubProject(users, id,'github', {
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
    let items = []
    if (data) {
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
    if (data.length ==0) {
      items = (<div className="ant-table-placeholder"><i className="anticon anticon-frown"></i>暂无数据</div>)
    }
    return (
      <div className="githubList">
        {items}
      </div>
    )
  }
}

class GithubComponent extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this)
    this.searchClick = this.searchClick.bind(this)
    this.state = {
      repokey: props.typeName,
      authorizeModal: false,
      currentSearch: ''
    }
  }

  loadData() {
    const self = this
    const { typeName } = this.props
    this.props.getGithubList(typeName, {
      success: {
        func: (res) => {
          if (res.data.hasOwnProperty('results')) {
            const users = res.data.results[Object.keys(res.data.results)[0]].user
            self.setState({ users })
          }
        }
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

  removeRepo() {
    const scope = this.props.scope
    const repoItem = scope.state.repokey
    this.setState({removeModal: false})
    scope.props.deleteRepo(repoItem)
  }
  handSyncCode() {
    const { registryGithub, typeName} = this.props
    const parentScope = this.props.scope
    const typeList = parentScope.state.typeList
    if (!typeList || !typeList.includes(typeName)) {
      parentScope.setState({typeVisible: true})
      return
    }
    let notification = new NotificationHandler()
    notification.spin(`正在执行中...`)
    this.setState({loading: true})
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
    const users = this.state.users
    this.setState({
      currentSearch: image
    })
    this.props.searchGithubList(users, image)
  }
  changeSearch(e) {
    const image = e.target.value
    const users = this.state.users
    this.setState({
      currentSearch: image
    })
    if (image == '') {
      this.props.searchGithubList(users, image)
    }
  }
  searchClick() {
    const image = this.state.currentSearch
    const users = this.state.users
    this.props.searchGithubList(users, image)
  }
  syncRepoList() {
    const { syncRepoList } = this.props
    const types = this.props.scope.state.repokey
    let notification = new NotificationHandler()
    notification.spin(`正在执行中...`)
    syncRepoList(types, {
      success: {
        func: () => {
          notification.close()
          notification.success(`代码同步成功`)
        },
        isAsync: true
      }
    })
  }
  changeList(e) {
    this.setState({
      users: e
    })
  }
  registryRepo() {
    const url = this.state.regUrl
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
    if (!(/^http:|^https:/).test(url)) {
      notification.info(formatMessage(menusText.errorSrc))
      return
    }
    const config = {
      url,
      token,
      type: this.props.scope.state.repokey
    }
    this.setState({
      loading: true
    })
    const self = this
    notification.spin(`代码仓库添加中...`)
    this.props.scope.props.registryRepo(config, {
      success: {
        func: () => {
          notification.close()
          notification.success(`代码仓库添加成功`)
          self.setState({
            authorizeModal: false,
            regUrl: '',
            regToken: ''
          })
          self.props.scope.props.getRepoList(config.type)
          self.props.scope.props.getUserInfo(config.type)
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
          self.setState({ loading: false })
        }
      }
    })
  }
  showGogsModal() {
    this.setState({ authorizeModal: true })
    setTimeout(function(){
      document.getElementById('github').focus()
    },0)
  }
  changeUrl(e) {
    this.setState({ regUrl: e.target.value })
  }
  changeToken(e) {
    this.setState({ regToken: e.target.value })
  }
  render() {
    const { githubList, formatMessage, isFetching, typeName} = this.props
    const scope = this
    let typeNames = typeName == 'github' ? 'GitHub': 'Gogs'
    let codeList = []

    if (!githubList) {
      if (typeName == 'github') {
        return (
          <div style={{ lineHeight: '100px', paddingLeft: '130px', paddingBottom: '16px' }}>
          {this.state.loading ?
            <Button type="primary" size="large" loading={true}>授权、同步 GitHub 代码源</Button>
          :
            <Button type="primary" size="large" onClick={() => this.handSyncCode()}>授权、同步 GitHub 代码源</Button>
          }
          </div>
        )
      }
      return (
        <div style={{ lineHeight: '100px', paddingLeft: '140px', paddingBottom: '16px' }}>
          <Button type="primary" size="large" onClick={() => this.showGogsModal() }>添加 Gogs 代码仓库</Button>
          <Modal title="添加 Gogs 代码仓库" visible={this.state.authorizeModal} maskClosable={false}
            onCancel={this.closeAddGitlabModal}
            footer={[
              <Button key="back" type="ghost" size="large" onClick={() => { this.setState({ authorizeModal: false }) } }>取消</Button>,
              <Button key="submit" type="primary" size="large" loading={this.state.loading} onClick={() => this.registryRepo()}>确定</Button>,
            ]}
            >
            <div>
              <p style={{ lineHeight: '30px' }}>仓库地址：
                <Input placeholder="http://*** | https://***" id="github" onChange={(e)=> this.changeUrl(e)} value={this.state.regUrl} size="large" />
              </p>
              <p style={{ lineHeight: '30px' }}>Private Token：
                <Input placeholder="Private Token: " size="large" onChange={(e)=> this.changeToken(e)} value={this.state.regToken} />
              </p>
            </div>
          </Modal>
        </div>
      )
    }
    if (Object.keys(githubList).length > 0) {
      for (let i in githubList) {
        codeList.push(
          <TabPane tab={<span><Icon type="user" />{i}</span>} key={i}>
            <CodeList scope={scope} isFetching={isFetching} repoUser={i} data={githubList[i]} />
          </TabPane>
        )
      }

    }
    return (
      <div key="github-Component" type="right" className='codelink'>
        <div className="tableHead">
          <Tooltip placement="top" title={formatMessage(menusText.logout)}>
            <Icon type="logout" onClick={() => this.setState({removeModal: true})} style={{ margin: '0 20px' }} />
          </Tooltip>
          <Tooltip placement="top" title={formatMessage(menusText.syncCode)}>
            <Icon type="reload" onClick={() => this.syncRepoList()}  />
          </Tooltip>
          <div className="right-search">
            <Input className='searchBox' size="large" style={{ width: '180px', paddingRight:'28px'}} onChange={(e) => this.changeSearch(e)} onPressEnter={(e) => this.handleSearch(e)} placeholder={formatMessage(menusText.search)} type='text' />
            <i className='fa fa-search' onClick={this.searchClick}></i>
          </div>
        </div>

        <Tabs onChange={(e) => this.changeList(e)}>
          {codeList}
        </Tabs>
        <Modal title="注销代码源操作" visible={this.state.removeModal}
          onOk={()=> this.removeRepo()} onCancel={()=> this.setState({removeModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i> {formatMessage(menusText.sureCancellationCode)}?</div>
        </Modal>
      </div>
    );
  }
}


function mapStateToProps(state, props) {
  const defaultValue = {
    githubList: [],
    isFetching: false
  }
  const { githubRepo} = state.cicd_flow
  const { githubList, isFetching, users} = githubRepo['github'] || defaultValue
  return {
    githubList,
    isFetching,
    users,
    currentSpace: state.entities.current.space.namespace
  }
}

GithubComponent.propTypes = {
  intl: PropTypes.object.isRequired,
  registryGithub: PropTypes.func.isRequired,
  getGithubList: PropTypes.func.isRequired,
  searchGithubList: PropTypes.func.isRequired,
  addGithubRepo: PropTypes.func.isRequired
}

export default connect(mapStateToProps, {
  registryGithub,
  getGithubList,
  searchGithubList,
  addGithubRepo,
  notGithubProject,
  syncRepoList
})(injectIntl(GithubComponent, {
  withRef: true,
}))