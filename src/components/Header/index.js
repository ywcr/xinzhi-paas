/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Header component
 *
 * v0.1 - 2016-09-06
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Menu, Dropdown, Select, Input, Form, Icon, Badge, Modal, Popover } from 'antd'
import { FormattedMessage, defineMessages } from 'react-intl'
import "./style/header.less"
import PopSelect from '../PopSelect'
import { connect } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import { loadUserTeamspaceList, loadUserList } from '../../actions/user'
import { loadTeamClustersList } from '../../actions/team'
import { setCurrent, loadLoginUserDetail } from '../../actions/entities'
import { checkVersion } from '../../actions/version'
import { getCookie, isEmptyObject, getVersion, getPortalRealMode } from '../../common/tools'
import { USER_CURRENT_CONFIG, ROLE_SYS_ADMIN} from '../../../constants'
import { MY_SPACE, SESSION_STORAGE_TENX_HIDE_DOT_KEY, LITE } from '../../constants'
import { browserHistory, Link } from 'react-router'
import NotificationHandler from '../../common/notification_handler'
import UserPanel from './UserPanel'
import backOldBtn from '../../assets/img/headerBackOldArrow.png'
import Airplane from '../../assets/img/quickentry/quick.png'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
const standardFlag = standard === mode
const team = mode === standard ? '团队' : '空间'
const zone = mode === standard ? '区域' : '集群'
const selectTeam = mode === standard ? '选择团队' : '选择空间'
const selectZone = mode === standard ? '选择区域' : '选择集群'

// The following routes RegExp will show select space or select cluster
const SPACE_CLUSTER_PATHNAME_MAP = {
  space: [
    /^\/$/,
    /\/app_manage/,
    /\/database_cache/,
    /^\/app_center\/?$/,
    /\/app_center\/stack_center/,
    /\/ci_cd/,
    /\/manange_monitor/,
    /\/manange_monitor\/alarm_record/,
    /\/manange_monitor\/alarm_setting/,
    /\/manange_monitor\/alarm_group/,
  ],
  cluster: [
    /^\/$/,
    /\/app_manage/,
    /\/database_cache/,
    /\/manange_monitor\/alarm_record/,
    /\/manange_monitor\/alarm_setting/,
  ],
}

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option
const InputGroup = Input.Group
const menusText = defineMessages({
  doc: {
    id: 'Header.menu.doc',
    defaultMessage: '文档中心',
  },
  user: {
    id: 'Header.menu.user',
    defaultMessage: '用户',
  },
  team: {
    id: 'Header.menu.team',
    defaultMessage: '团队',
  },
  space: {
    id: 'Header.menu.space',
    defaultMessage: '空间',
  },
  logOut: {
    id: 'Header.menu.user.logOut',
    defaultMessage: '注销',
  },
  userMenu2: {
    id: 'Header.menu.user.menu2',
    defaultMessage: '第二个',
  },
  userMenu3: {
    id: 'Header.menu.user.menu3',
    defaultMessage: '第三个',
  }
})

function loadSpaces(props, callback) {
  const { loadUserTeamspaceList } = props
  loadUserTeamspaceList('default', { size: 1000 }, callback)
}

function getHideDot() {
  if (!sessionStorage) {
    return false
  }
  if (!sessionStorage[SESSION_STORAGE_TENX_HIDE_DOT_KEY]) {
    return false
  }
  return true
}

function setHideDot() {
  if (!sessionStorage) {
    return false
  }
  sessionStorage.setItem(SESSION_STORAGE_TENX_HIDE_DOT_KEY, Date.now())
}

class Header extends Component {
  constructor(props) {
    super(props)
    this._checkLiteVersion = this._checkLiteVersion.bind(this)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.handleClusterChange = this.handleClusterChange.bind(this)
    this.showUpgradeVersionModal = this.showUpgradeVersionModal.bind(this)
    this.renderCheckVersionContent = this.renderCheckVersionContent.bind(this)
    this.handleDocVisible = this.handleDocVisible.bind(this)
    this.state = {
      spacesVisible: false,
      clustersVisible: false,
      focus: false,
      version: getVersion(),
      type: getPortalRealMode(),
      checkVersionErr: null,
      hideDot: getHideDot(),
      upgradeVersionModalVisible: false,
      visible: false,
      allUsers: [],
    }
    this.isSysAdmin = props.loginUser.role == ROLE_SYS_ADMIN
  }

  handleDocVisible(){
    const { visible } = this.state
    this.setState({
      visible: !visible
    })
  }

  _checkLiteVersion() {
    const { checkVersion } = this.props
    const { version, type } = this.state
    if (type !== LITE) {
      return
    }
    checkVersion({version, type}, {
      failed: {
        func: (err) => {
          this.setState({
            checkVersionErr: err,
          })
        }
      }
    })
  }

  handleSpaceChange(space) {
    const _this = this
    const { loadTeamClustersList, setCurrent, current, showCluster, pathname } = this.props
    /*if (space.namespace === current.space.namespace) {
      return
    }*/
    // sys admin select the user list
    if (space.userName) {
      space.teamID = 'default'
    }
    let notification = new NotificationHandler()
    loadTeamClustersList(space.teamID, { size: 100 }, {
      success: {
        func: (result) => {
          if (!result.data || result.data.length < 1) {
            notification.warn(`${team} [${space.spaceName}] 的${zone}列表为空，请重新选择${team}`)
            _this.setState({
              spacesVisible: true,
              clustersVisible: false,
            })
            return
          }
          // select first cluster by default
          const firstCluster = result.data[0]
          firstCluster.namespace = space.namespace
          setCurrent({
            team: { teamID: space.teamID },
            space,
            cluster: firstCluster,
          })
          let isShowCluster = !!showCluster
          if (result.data.length === 1) {
            isShowCluster = false
          }
          if (pathname.match(/\//g).length > 2) {
            browserHistory.push('/')
          }
          _this.setState({
            spacesVisible: false,
            clustersVisible: isShowCluster,
          })
        },
        isAsync: true
      },
      failed: {
        func: (error) => {
          notification.error(`加载${team} [${space.spaceName}] 的${zone}列表失败，请重新选择${team}`)
          _this.setState({
            spacesVisible: true,
            clustersVisible: false,
          })
        }
      }
    })
  }

  handleClusterChange(cluster) {
    this.setState({
      clustersVisible: false,
    })
    const { setCurrent, current } = this.props
    if (current.cluster.namespace === current.space.namespace
      && cluster.clusterID === current.cluster.clusterID) {
      return
    }
    cluster.namespace = current.space.namespace
    setCurrent({
      cluster
    })
    const { pathname } = window.location
    let msg = `${zone}已成功切换到 [${cluster.clusterName}]`
    if (current.cluster.namespace !== current.space.namespace) {
      msg = `${team}已成功切换到 [${current.space.spaceName}]，${msg}`
    }
    let notification = new NotificationHandler()
    notification.success(msg)
    if (pathname.match(/\//g).length > 2) {
      browserHistory.push('/')
    }
  }

  componentWillMount() {
    const {
      loadTeamClustersList,
      setCurrent,
      loadLoginUserDetail,
      loginUser,
    } = this.props
    const config = getCookie(USER_CURRENT_CONFIG)
    const [teamID, namespace, clusterID] = config.split(',')
    setCurrent({
      team: { teamID },
      space: { namespace },
      cluster: { clusterID },
    })
    const self = this
    loadSpaces(this.props, {
      success: {
        func: (resultT) => {
          let defaultSpace = resultT.teamspaces[0] || {}
          if (namespace === 'default') {
            defaultSpace = MY_SPACE
          } else {
            resultT.teamspaces.map(space => {
              if (space.namespace === namespace) {
                defaultSpace = space
              }
            })
          }
          setCurrent({
            space: defaultSpace
          })
          loadTeamClustersList(defaultSpace.teamID, { size: 100 }, {
            success: {
              func: (resultC) => {
                if (!resultC.data) {
                  resultC.data = []
                }
                let defaultCluster = resultC.data[0] || {}
                resultC.data.map(cluster => {
                  if (cluster.clusterID === clusterID) {
                    defaultCluster = cluster
                  }
                })
                setCurrent({ cluster: defaultCluster })
              },
              isAsync: true
            }
          })
        },
        isAsync: true
      }
    })
  }

  componentDidMount() {
    this._checkLiteVersion()
    this.isSysAdmin && this.props.loadUserList({ size: 0 }, {
      success: {
        func: res => {
          this.setState({ allUsers: cloneDeep(res.users || []) })
        }
      }
    })
  }

  showUpgradeVersionModal() {
    this.setState(({
      upgradeVersionModalVisible: true,
      hideDot: true,
    }))
    this._checkLiteVersion()
    setHideDot()
  }
  handleOpen(){
    const thisUrl = window.location.hostname
    window.open('https://'+thisUrl+':9004/')
  }
  handleOpenfaq(){
    const thisUrl = window.location.hostname
    window.open('https://'+thisUrl+':9004/faq')
  }
  renderCheckVersionContent() {
    const { checkVersionContent, isCheckVersion } = this.props
    const { checkVersionErr } = this.state
    if (isCheckVersion) {
      return (
        <div>
          <Icon type="loading" /> 努力检查新版本中...
        </div>
      )
    }
    if (!isEmptyObject(checkVersionContent)) {
      const { isLatest, latestVerion, link } = checkVersionContent
      if (isLatest) {
        return <div><Icon type="smile" /> 当前已是最新版本</div>
      }
      return (
        <div>
          <Icon type="meh" /> 发现新版本 {latestVerion}，点击&nbsp;
          <a href={link} target="_blank">{link}</a> 查看详情
        </div>
      )
    }
    if (!checkVersionErr) {
      return
    }
    const { message, statusCode } = checkVersionErr
    if (statusCode >= 500) {
      return (
        <div>
          <Icon type="frown" /> 网络不可用，请稍后重试
        </div>
      )
    }
    return (
      <div>
        <Icon type="frown" /> 获取版本信息失败，请&nbsp;
        <a onClick={this._checkLiteVersion}>点击重试</a>
      </div>
    )
  }

  render() {
    const {
      current,
      loginUser,
      isTeamspacesFetching,
      teamspaces,
      isTeamClustersFetching,
      teamClusters,
      migrated,
      showSpace,
      showCluster,
      checkVersionContent,
    } = this.props
    const {
      spacesVisible,
      clustersVisible,
      upgradeVersionModalVisible,
      type,
      hideDot,
      visible,
      allUsers,
    } = this.state
    const { isLatest } = checkVersionContent
    teamspaces.map((space) => {
      mode === standard
      ? space.name = space.teamName
      : space.name = space.spaceName
    })
    teamClusters.map((cluster) => {
      cluster.name = cluster.clusterName
    })
    var host = window.location.hostname
    var protocol = window.location.protocol
    var docUrl = protocol + '//' + host + ":9004"
    var faqUrl = docUrl + '/faq'
    const rotate = visible ? 'rotate180' : 'rotate0'
    let selectValue = mode === standard ? current.space.teamName : (current.space.spaceName || current.space.userName)
    let Search = true
   const content = (
      <div className='container'>
        {
          type === LITE &&
          <div>
            <div className='item'><a onClick={this.handleOpen}>文档中心</a></div>
            <div className='item'><a onClick={this.handleOpenfaq}>常见问题</a></div>
          </div>
        }
        {
          standardFlag &&
          <div>
            <div className='item'><a onClick={this.handleOpen}>文档中心</a></div>
            <div className='item'><a onClick={this.handleOpenfaq}>常见问题</a></div>

          </div>
        }
        {
          type !== LITE && !standardFlag &&
          <div>
            <div className='item'><a onClick={this.handleOpen}>文档中心</a></div>
            <div className='item'><a onClick={this.handleOpenfaq}>常见问题</a></div>
          </div>
        }
        </div>
    );
    return (
      <div id="header">
        {
          showSpace && (
            <div className="space">
              <div className="spaceTxt">
                <svg className='headerteamspace'>
                  <use xlinkHref='#headerteamspace' />
                </svg>
                <span style={{ marginLeft: 15 }}>{team}</span>
                </div>
                <div className="spaceBtn">
                  <PopSelect
                    allUsers={allUsers}
                    isSysAdmin={this.isSysAdmin}
                    Search={Search}
                    title={selectTeam}
                    btnStyle={false}
                    special={true}
                    visible={spacesVisible}
                    list={teamspaces}
                    loading={isTeamspacesFetching}
                    onChange={this.handleSpaceChange}
                    selectValue={selectValue}
                    popTeamSelect={mode === standard} />
                </div>
            </div>
          )
        }
        {
          showCluster && (
            <div className="cluster">
              <div className="clusterTxt">
                <svg className='headercluster'>
                  <use xlinkHref='#headercluster' />
                </svg>
                <span style={{ marginLeft: 20 }}>{zone}</span>
              </div>
              <div className="envirBox">
                <PopSelect
                  title={selectZone}
                  btnStyle={false}
                  visible={clustersVisible}
                  list={teamClusters}
                  loading={isTeamClustersFetching}
                  onChange={this.handleClusterChange}
                  selectValue={current.cluster.clusterName || '...'} />
              </div>
            </div>
          )
        }
        <div className="rightBox">
          <div className="docBtn quickentry">
            <Link to={`/quickentry`}>
              <svg className='rocket'>
                <use xlinkHref='#rocket' />
              </svg>
              <span className='text'>快速入口</span>
            </Link>
          </div>
          <div className="docBtn border">
            <Popover
              content={content}
              trigger="click"
              overlayClassName="helpdoc"
              placement="bottom"
              onVisibleChange={this.handleDocVisible}
            >
              <div className='doc'><Icon type="file-text" className='docicon'/>帮助文档<Icon type="down" className={rotate} style={{marginLeft:'4px'}}/></div>
            </Popover>
          </div>
        {
          type === LITE &&
          <div className='upgradeVersion' onClick={this.showUpgradeVersionModal}>
            <div className='imgBox'>
              <img src={backOldBtn} />
            </div>
            <span className='backText'>
              <Badge dot={!hideDot && isLatest === false}>升级版本</Badge>
            </span>
          </div>
        }
          <UserPanel loginUser={loginUser}/>
          <Modal
            title='升级版本'
            className='upgradeVersionModal'
            visible={upgradeVersionModalVisible}
            onOk={() => this.setState({upgradeVersionModalVisible: false})}
            onCancel={() => this.setState({upgradeVersionModalVisible: false})}>
            {this.renderCheckVersionContent()}
          </Modal>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { pathname } = props
  const { current, loginUser } = state.entities
  const { teamspaces } = state.user
  const { teamClusters } = state.team
  const { checkVersion } = state.version
  let showSpace = false
  let showCluster = false
  SPACE_CLUSTER_PATHNAME_MAP.space.every(path => {
    if (pathname.search(path) == 0) {
      showSpace = true
      return false
    }
    return true
  })
  SPACE_CLUSTER_PATHNAME_MAP.cluster.every(path => {
    if (pathname.search(path) == 0) {
      showCluster = true
      return false
    }
    return true
  })
  return {
    current,
    loginUser: loginUser.info,
    migrated: loginUser.info.migrated || 0,
    isTeamspacesFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    isTeamClustersFetching: teamClusters.isFetching,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
    showSpace,
    showCluster,
    checkVersionContent: checkVersion.data,
    isCheckVersion: checkVersion.isFetching,
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList,
  loadTeamClustersList,
  setCurrent,
  loadLoginUserDetail,
  checkVersion,
  loadUserList,
})(Header)
