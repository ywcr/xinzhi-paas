/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Pop content
 *
 * v0.1 - 2016-11-15
 * @author Yaowei
 */

import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, Input, Tooltip, Dropdown, Modal, Spin, Icon } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {
  getTenxFlowDetail, getTenxFlowList, deleteTenxFlowSingle, getTenxflowBuildLastLogs,
  CreateTenxflowBuild, getTenxflowBuildDetailLogs, changeTenxFlowStatus,
  changeFlowStatus, getRepoBranchesAndTagsByProjectId, getStageBuildLogList, setCicdWs
} from '../../../actions/cicd_flow'
import { DEFAULT_REGISTRY } from '../../../constants'
import CreateTenxFlow from './CreateTenxFlow.js'
import TenxFlowBuildLog from './TenxFlowBuildLog'
import moment from 'moment'
import './style/TenxFlowList.less'
import cloneDeep from 'lodash/cloneDeep'
import findIndex from 'lodash/findIndex'
import NotificationHandler from '../../../common/notification_handler'
// import Socket from '../../Websocket/socketIo'
import { loadProjectMembers } from '../../../actions/harbor'
import PopTabSelect from '../../PopTabSelect'
import Title from '../../Title'
import { parseQueryStringToObject } from '../../../common/tools'
// import { setTimeout } from 'timers';

const PopTab = PopTabSelect.Tab;
const PopOption = PopTabSelect.Option;
const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
let notification = new NotificationHandler()

const menusText = defineMessages({
  search: {
    id: 'CICD.Tenxflow.TenxFlowList.search',
    defaultMessage: '搜索',
  },
  name: {
    id: 'CICD.Tenxflow.TenxFlowList.name',
    defaultMessage: '名称',
  },
  updateTime: {
    id: 'CICD.Tenxflow.TenxFlowList.updateTime',
    defaultMessage: '上次构建时间',
  },
  status: {
    id: 'CICD.Tenxflow.TenxFlowList.status',
    defaultMessage: '构建状态',
  },
  opera: {
    id: 'CICD.Tenxflow.TenxFlowList.opera',
    defaultMessage: '操作',
  },
  tooltips: {
    id: 'CICD.Tenxflow.TenxFlowList.tooltips',
    defaultMessage: 'EnnFlow：这里完成【代码项目构建、编译、测试】等CI/CD流程的定义与执行，每个EnnFlow可以由若干个（≥1）流程化的子项目组成，每个子项目所执行的任务可以通过卡片的方式进行定义和展示。',
  },
  create: {
    id: 'CICD.Tenxflow.TenxFlowList.create',
    defaultMessage: '创建EnnFlow',
  },
  deloyLog: {
    id: 'CICD.Tenxflow.TenxFlowList.deloyLog',
    defaultMessage: '构建记录',
  },
  deloyStart: {
    id: 'CICD.Tenxflow.TenxFlowList.deloyStart',
    defaultMessage: '立即构建',
  },
  delete: {
    id: 'CICD.Tenxflow.TenxFlowList.delete',
    defaultMessage: '删除EnnFlow',
  },
  edit: {
    id: 'CICD.Tenxflow.TenxFlowList.edit',
    defaultMessage: '修改EnnFlow',
  },
  unUpdate: {
    id: 'CICD.Tenxflow.TenxFlowList.unUpdate',
    defaultMessage: '未更新',
  }
})

function dateFormat(dateString) {
  if (!dateString) {
    return '';
  }
  var timeStr = moment(dateString);
  return timeStr.format("YYYY-MM-DD HH:mm:ss")
}

class MyComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      projectName: [],
      project_delete: [],
      delFlowModal: false,
      visitor: [],
      time: false
    }
  }

  operaMenuClick(item, Item) {
    const { key } = Item;
    const { openCreateTenxFlowModal, scope } = this.props;
    if (key == 'editFlow') {
      openCreateTenxFlowModal(item.flowId, true)
      return
    }
    //this function for user click the dropdown menu
    this.setState({ delFlowModal: true, item })
    return
  }
  delFlowAction() {
    let { flowId } = this.state.item;
    const { item } = this.state
    const { scope } = this.props;
    const { deleteTenxFlowSingle, getTenxFlowList } = scope.props;
    let notification = new NotificationHandler()
    notification.spin(`删除 EnnFlow ${item.name} 中...`);
    deleteTenxFlowSingle(flowId, {
      success: {
        func: () => {
          notification.close()
          notification.success(`删除 EnnFlow ${item.name} 成功`);
          scope.loadData()
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          let statusCode = res.statusCode;
          switch (statusCode) {
            case 500:
              break;
          }
          notification.close()
          notification.error(`删除 TenxFlow ${item.name} 失败1`);
        }
      }
    })
  }

  starFlowBuild(item, index) {
    const { flowId, projectId, defaultBranch } = item
    const { getRepoBranchesAndTagsByProjectId,getTenxFlowDetail } = this.props.scope.props
    const self = this;
    if (this.props.config) {
      for (let i in this.props.config) {
        let stage = this.props.config[i]
        if (stage.flowId === flowId) {
          if (typeof (stage.stagesCount) === 'number' && stage.stagesCount < 1) {
            let notification = new NotificationHandler()
            notification.error('请先添加构建子任务')
            return
          }
        }
      }
    }
    let st = {};
    getTenxFlowDetail(flowId, {
      success: {
        func: (d) => {
          if (projectId) {
            setTimeout(function(){
              getRepoBranchesAndTagsByProjectId(d.data.results.stageInfo[0].spec.project.id,projectId)
            })
          }
        }
      }
    })
  }
  startBuildStage(item, index, key, tabKey) {
    const { flowId, status } = item
    const { scope } = this.props;
    const { onSetup } = scope
    const { loginUser,setCicdWs } = scope.props;
    const _this = this;
    const cicdApi = loginUser.info.cicdApi
    let { protocol, host, statusPath } = cicdApi
    if (!protocol) protocol = 'http'
    if (protocol == 'http') protocol = 'ws'
    else protocol = 'wss'
    const { CreateTenxflowBuild, getTenxflowBuildDetailLogs } = this.props.scope.props
    const options = {}
    if (key && tabKey) {
      options.branch = key
    }
    // this.props.scope.onSetup(flowId,status,() => {
    CreateTenxflowBuild(flowId, { options }, {
      success: {
        func: (res) => {
          getTenxflowBuildDetailLogs(flowId, res.data.results.flowBuildId, {
            success: {
              func: (result) => {
              }
            }
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          if(res.statusCode == 100){
            setTimeout(function(){
              setCicdWs({
                [flowId]: new WebSocket(protocol + '://' + host + statusPath)
              })
              onSetup(flowId,status,'',scope);
            })
            setTimeout(function(){
              _this.startBuildStage(item, index, key, tabKey)
            },1000)
          }else{
            Modal.error({
              title: '构建失败',
              content: (res.message.message)
            });
          }
        }
      }
    })
    // })
  }

  renderBuildBtn(item, index) {
    const { flowId,projectId, defaultBranch, stagesCount, repoType } = item
    const { repoBranchesAndTags } = this.props.scope.props
    const dropdown = (
      <Menu onClick={(Item) => { this.operaMenuClick.call(this, item, Item) }}>
        <Menu.Item key='deleteFlow_'>
          <i className='fa fa-trash' style={{ marginRight: '5px' }} />&nbsp;
          <FormattedMessage {...menusText.delete} style={{ display: 'inlineBlock' }} />
        </Menu.Item>
        <Menu.Item key='editFlow'>
          <i className="anticon anticon-edit" style={{ marginRight: '3px' }} />&nbsp;
          <FormattedMessage {...menusText.edit} style={{ display: 'inlineBlock' }} />
        </Menu.Item>
      </Menu>
    )
    const targetElement = (
      <Dropdown.Button
        overlay={dropdown}
        type='primary'
        size='large'
        onClick={() => {
          const self = this;
          if (repoType === 'svn') {
            self.startBuildStage(item, index)
            return
          }
          self.starFlowBuild(item, index)
        }}>
        <span>
          <i className='fa fa-pencil-square-o' />&nbsp;
          <FormattedMessage {...menusText.deloyStart} />
        </span>
      </Dropdown.Button>
    )
    if (repoType === 'svn') {
      return targetElement
    }
    const tabs = []
    let loading
    const branchesAndTags = repoBranchesAndTags[projectId]
    if (branchesAndTags && branchesAndTags.data && branchesAndTags.data.branches && branchesAndTags.data.tags) {
      const { isFetching, data } = branchesAndTags
      loading = isFetching
      const { branches, tags } = data
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          tabs.push(
            <PopTab key={key} title={key === 'branches' ? '分支' : '标签'}>
              {
                data[key].map((item, index) => {
                  let name = item.branch || item.tag
                  // name=name+'_'+key
                  return <PopOption key={name}>{name}</PopOption>
                })
              }
            </PopTab>
          )
        }
      }
    } else {
      if (stagesCount > 0) {
        tabs.push(<PopOption key="not_found_branches_tags">未找到分支及标签，点击构建</PopOption>)
      }
    }
    return (
      <PopTabSelect
        stageInfo={this.props.stageInfo[index]}
        placeholder="请输入分支或标签"
        style={{ float: 'left' }}
        authority={this.props.authority}
        onChange={this.startBuildStage.bind(this, item, index)}
        targetElement={targetElement}
        getTooltipContainer={() => document.body}
        isShowBuildBtn={true}
        loading={loading}>
        {tabs}
      </PopTabSelect>
    )
  }
  render() {
    const { config, scope, isFetching } = this.props;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const items = config.map((item, index) => {
      let status = ''
      switch (item.status) {
        case 0:
          status = '成功'
          break;
        case 1:
          status = "失败"
          break;
        case 2:
          status = "执行中..."
          break;
        default:
          status = "等待中..."
      }
      return (
        <div className='tenxflowDetail' key={item.name} >
          <div className='name'>
            <Link to={`/ci_cd/enn_flow/enn_flow_build?${item.flowId}&${item.status}`}>
              <span>{item.name}</span>
            </Link>
          </div>
          <div className='time'>
            <span className='timeSpan'>
              <Tooltip placement='topLeft' title={item.lastBuildTime ? dateFormat(item.lastBuildTime) : '-'}>
                <span>{item.lastBuildTime ? dateFormat(item.lastBuildTime) : '-'}</span>
              </Tooltip>
            </span>
          </div>
          <div className={`status status-` + `${item.status}`}>
            <span><i className="fa fa-circle"></i>{status}</span>
          </div>
          <div className='oprea'>
            <Button className='logBtn' size='large' type='ghost' onClick={scope.openTenxFlowDeployLogModal.bind(scope, item.flowId)}>
              <i className='fa fa-wpforms' />&nbsp;
              <FormattedMessage {...menusText.deloyLog} />
            </Button>
            {
              this.renderBuildBtn(item, index)
            }
          </div>
        </div>
      );
    });
    return (
      <div className='tenxflowList'>
        {items}
        <Modal title="删除构建任务" visible={this.state.delFlowModal}
          onOk={() => this.delFlowAction()} onCancel={() => this.setState({ delFlowModal: false })}
        >
          <Alert message="请注意，删除 EnnFlow 将清除相关的历史构建数据，且该操作不能被恢复" type="warning" showIcon />
          <div className="modalColor" style={{ lineHeight: '30px' }}><i className="anticon anticon-question-circle-o" style={{ marginRight: '8px', marginLeft: '16px' }}></i>
            您确定要删除?
          </div>
        </Modal>
      </div>
    );
  }
}

class TenxFlowList extends Component {
  constructor(props) {
    super(props);
    this.openCreateTenxFlowModal = this.openCreateTenxFlowModal.bind(this);
    this.closeCreateTenxFlowModal = this.closeCreateTenxFlowModal.bind(this);
    this.openTenxFlowDeployLogModal = this.openTenxFlowDeployLogModal.bind(this);
    this.closeTenxFlowDeployLogModal = this.closeTenxFlowDeployLogModal.bind(this);
    this.onSearchFlow = this.onSearchFlow.bind(this);
    this.loadData = this.loadData.bind(this);
    this.state = {
      createTenxFlowModal: false,
      TenxFlowDeployLogModal: false,
      currentTenxFlow: null,
      currentFlowId: null,
      flowList: [],
      searchingFlag: false,
      searchValue: '',
      forEdit: false,
      stageInfo: [],
      projectName: [],
      Sockets: {},
      lockReconnect:false
    }
    const queryObj = parseQueryStringToObject(window.location.search)
    if (queryObj.showCard == 'true') {
      this.state.createTenxFlowModal = true
    }
  }
  loadData(callback) {
    const { getTenxFlowList, getTenxFlowDetail, wsSocket } = this.props;
    const { loginUser, setCicdWs } = this.props
    const cicdApi = loginUser.info.cicdApi
    let { protocol, host, statusPath } = cicdApi
    const self = this
    if (!protocol) protocol = 'http'
    if (protocol == 'http') protocol = 'ws'
    else protocol = 'wss'
    self.setState({
      stageInfo: []
    },function(){
      const _this = this;
      const cicdWs = {};
      getTenxFlowList({
        success: {
          func: (res) => { 
            const flowListState = []
            const data = res.data?res.data.results:null;
            if (data) {
              data.forEach((list, index) => {
                flowListState.push({ status: list.status })
                if (!wsSocket[list.flowId]) {
                  self.setWs(list.flowId, list.status);
                }else{
                  self.onSetup(list.flowId, list.status)
                }
              })
              let st = {}
            } else {
              self.setState({
                flowList: []
              })
            }
            self.setState({
              flowListState
            }, () => {
  
            })
            if (callback) {
              callback()
            }
          },
          isAsync: true
        }
      });
    })
    
  }

  componentWillMount() {
    const { getTenxFlowDetail, getTenxFlowList,setCicdWs,wsSocket } = this.props;
    let { search } = this.props.location;
    const self = this
    this.loadData()
  }
  componentDidMount() {
    const { status, buildId, stageId } = this.props.loginUser
    const { flowId, loginUser } = this.props
    const cicdApi = loginUser.info.cicdApi

    if (location.search == '?build_image=true') {
      this.setState({
        createTenxFlowModal: true
      })
    }
  }
  componentWillUnmount() {
    const { setCicdWs, wsSocket } = this.props;
    const _this = this;
    if (wsSocket && wsSocket.length != 0) {
      for (let i in wsSocket) {
        wsSocket[i].heartCheck.reset();
        wsSocket[i].send(JSON.stringify({ flowId: i, webSocketIfClose: 1 }));
        wsSocket[i].close();
      }
      setCicdWs(null)
    }
  }
  componentWillReceiveProps(nextProps) {
    const { isFetching, flowList, currentSpace } = nextProps;
    if (currentSpace && this.props.currentSpace && currentSpace != this.props.currentSpace) {
      this.loadData()
      return
    }
    if (!isFetching && !!flowList) {
      this.setState({
        flowList: flowList
      });
    }
  }

  openCreateTenxFlowModal(flowId, forEdit) {
    //this function for user open the modal of create new tenxflow
    this.setState({
      currentFlowId: flowId ? flowId : null,
      forEdit: forEdit ? forEdit : false
    }, () => {
      this.setState({
        createTenxFlowModal: true,
      }, () => {
        document.getElementById('flowName').focus()
      })
    });
  }

  closeCreateTenxFlowModal() {
    //this function for user close the modal of create new tenxflow
    this.setState({
      createTenxFlowModal: false,
      forEdit: false,
      currentFlowId: null
    });
  }

  openTenxFlowDeployLogModal(flowId) {
    //this function for user open the modal of tenxflow deploy log
    const { getTenxflowBuildLastLogs } = this.props;
    getTenxflowBuildLastLogs(flowId)
    this.setState({
      TenxFlowDeployLogModal: true,
      currentFlowId: flowId
    });
  }

  closeTenxFlowDeployLogModal() {
    //this function for user close the modal of tenxflow deploy log
    this.setState({
      TenxFlowDeployLogModal: false
    });
  }

  onSearchFlow() {
    //this function for user search special flow
    let searchingFlag = false;
    const { searchValue } = this.state
    const { flowList } = this.props;
    let newList = [];
    if (searchValue.length > 0) {
      searchingFlag = true;
    }
    flowList.map((item) => {
      if (item.name.indexOf(searchValue) > -1) {
        newList.push(item);
      }
    });
    this.setState({
      flowList: newList,
      searchingFlag: searchingFlag
    })
  }
  setWs(flowId, status,scope,buildList){
    const { wsSocket } = this.props
    const { loginUser, setCicdWs } = this.props
    const cicdApi = loginUser.info.cicdApi
    let Socket = wsSocket[flowId]
    let { protocol, host, statusPath } = cicdApi
    let state = '';
    if (!protocol) protocol = 'http'
    if (protocol == 'http') protocol = 'ws'
    else protocol = 'wss'
    // --------- //
    try {
      const ws = new WebSocket(protocol + '://' + host + statusPath)
      setCicdWs({
        [flowId]: ws
      })
      this.onSetup(flowId, status)
    } catch (e) {
      if(Socket){
        Socket.reconnect(flowId, status,scope,buildList);
      }
    } 
  }
  onSetup(flowId, status, success,scope) {
    const self = scope?scope:this;
    const { flowList, changeFlowStatus, wsSocket } = self.props
    const { loginUser, setCicdWs } = this.props
    const cicdApi = loginUser.info.cicdApi
    let buildStatus = null;
    let Socket = wsSocket[flowId]
    let state = state;
    //---------------心跳----------------//
    if(!Socket.reconnect&&!Socket.heartCheck){
      Socket.reconnect = (flowId, status,scope,buildList)=>{ // websocket 重连
        const _this = scope?scope:self;
        _this.setWs(flowId, status,scope,buildList);
      }

      Socket.heartCheck = { // websocket 接收数据超时处理
          timeout: 60000,//60ms
          timeoutObj: null,
          serverTimeoutObj: null,
          reset: function(){
            clearTimeout(this.timeoutObj);
            clearTimeout(this.serverTimeoutObj);
            return this;
          },
          start: function(){
            const _this = this;
            _this.timeoutObj = setTimeout(()=>{
              // console.log('vvvvvvvvv----send 数据-----vvvvvvvvvvv',new Date())
              Socket.send(JSON.stringify({ 'flowId': flowId, webSocketIfClose: 2, 'buildStatus':buildStatus?buildStatus:( status == null ? 3 : status )}));
              _this.serverTimeoutObj = setTimeout(function(){
                  // console.log('ooooooooooo关闭websocketooooooooooooo',new Date())
                  Socket.send(JSON.stringify({ 'flowId': flowId, webSocketIfClose: 1, 'buildStatus':buildStatus?buildStatus:( status == null ? 3 : status )}));
                  Socket.close();//如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                  Socket.reconnect(flowId, status,scope);
                }, _this.timeout)
            }, _this.timeout)
          },
      }
    }
    //---------------心跳----------------//    
    if (Socket) {
      Socket.onopen = function (data) {
        if (success) {
          success();
        }
        if (Socket.readyState === 1) { // 为1表示连接处于open状态
          Socket.send(JSON.stringify({ flowId: flowId, 'buildStatus':buildStatus?buildStatus:( status == null ? 3 : status )}));
          // console.log('~~~~~~~~~~~~~websocket链接成功，启动定时器。~~~~~~~~~~~~~',new Date())
          Socket.heartCheck.reset().start();
        }
      };
      Socket.onmessage = function (evt) {
        var data = JSON.parse(evt.data);
        Socket.heartCheck.reset().start();
        // console.log('-----------收到信息，重置定时器并启动。------------',new Date())   
        buildStatus = data.buildStatus;
        if (data.webSocketIfClose == 2) {
          
        } else {
          const result = data
          const stateIndex = findIndex(self.props.flowList, flow => {
            return flow.flowId == result.flowId
          })
          let flowListState = cloneDeep(self.state.flowListState)
          flowListState[stateIndex] = { status: result.buildStatus }
          self.setState({
            flowListState
          })
          state = data.state
          changeFlowStatus(result.flowId, result.buildStatus)
        }
      };
      Socket.onclose = function () {
        // console.log('-------结束了-------')
        // Socket.reconnect(flowId, status,scope);
      };
      Socket.onerror = function () {
        // Socket.reconnect(flowId, status,scope);
      }
    }
  }
  callback(flowId) {
    const count = this.props.config ? this.props.config.length : 0
    const self = this
    const flowList = self.props.flowList
    return (data) => {
      const { getTenxflowBuildLastLogs, getTenxFlowDetail, changeFlowStatus } = this.props;
      getTenxflowBuildLastLogs(flowId, {
        success: {
          func: (result) => {
            const flowListState = cloneDeep(this.state.flowListState)
            const index = findIndex(flowList, flow => {
              return flow.flowId == flowId
            })
            if (index < 0) return
            const status = result.data.results.results.status
            flowListState[index].status = status
            self.setState({
              flowListState
            })
            changeFlowStatus(flowId, status)
          },
          isAsync: true
        },
        failed: {
          func: () => {
            const flowListState = cloneDeep(this.state.flowListState)
            const index = findIndex(flowListState, flow => {
              return flow.flowId == flowId
            })
            if (index < 0) return
            flowListState[index].status == 1
            self.setState({
              flowListState
            })
            changeFlowStatus(flowId, 1)
          }
        }
      })
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    const { isFetching, buildFetching, logs, cicdApi, loadProjectMembers, repoBranchesAndTags } = this.props;
    const { searchingFlag } = this.state;
    const { flowList } = this.state
    let message = '';
    if (isFetching || !flowList) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }

    if (flowList.length < 1 && !searchingFlag) {
      message = " * 目前还没有添加任何 EnnFlow"
    } else if (flowList.length < 1 && searchingFlag) {
      message = " * 没有匹配到相关EnnFlow"
    }
    return (
      <QueueAnim className='TenxFlowList'
        type='right'
      >
        <Title title="EnnFlow" />
        <div id='TenxFlowList' key='TenxFlowList'>
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type='info' />
          <div className='operaBox'>
            <Button className='createBtn' size='large' type='primary' onClick={() => this.openCreateTenxFlowModal(null, false)}>
              <i className='fa fa-plus' />&nbsp;
              <FormattedMessage {...menusText.create} />
            </Button>
            <Input className='searchBox' placeholder={formatMessage(menusText.search)} type='text' value={this.state.searchValue}
              onChange={(e) => this.setState({ searchValue: e.target.value })} onPressEnter={() => this.onSearchFlow()}
            />
            <i className='fa fa-search' onClick={() => this.onSearchFlow()} />
            <div style={{ clear: 'both' }} />
          </div>
          <Card className='tenxflowBox'>
            <div className='titleBox' >
              <div className='name'>
                <FormattedMessage {...menusText.name} />
              </div>
              <div className='time'>
                <FormattedMessage {...menusText.updateTime} />
              </div>
              <div className='status'>
                <FormattedMessage {...menusText.status} />
              </div>
              <div className='oprea'>
                <FormattedMessage {...menusText.opera} />
              </div>
            </div>
            <MyComponent
              scope={scope}
              config={flowList}
              flowList={flowList}
              stageInfo={this.state.stageInfo}
              isFetching={isFetching}
              projectName={this.state.projectName}
              loadProjectMembers={loadProjectMembers}
              openCreateTenxFlowModal={this.openCreateTenxFlowModal.bind(this)}
            />
            {flowList.length < 1 && !searchingFlag ?
              <div className='loadingBox'>暂无数据</div> :
              (flowList.length < 1 && searchingFlag ?
                <div className='loadingBox'>没有找到匹配的 EnnFlow</div> : null)}
          </Card>
        </div>
        <Modal
          visible={this.state.createTenxFlowModal}
          className='AppServiceDetail'
          transitionName='move-right'
          onCancel={this.closeCreateTenxFlowModal}
        >
          <CreateTenxFlow scope={scope} flowList={flowList} currentFlowId={this.state.currentFlowId} modalShow={this.state.createTenxFlowModal} loadData={this.loadData.bind(this)} />
        </Modal>
        <Modal
          visible={this.state.TenxFlowDeployLogModal}
          className='TenxFlowBuildLogModal'
          onCancel={this.closeTenxFlowDeployLogModal}
        >
          <TenxFlowBuildLog scope={scope} isFetching={buildFetching} logs={logs} flowId={this.state.currentFlowId} callback={this.callback(this.state.currentFlowId)} visible={this.state.TenxFlowDeployLogModal} />
        </Modal>
        {/* {this.state.websocket} */}
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultFlowList = {
    isFetching: false,
    flowList: [],
    ws: {}
  }
  const defaultBuildLog = {
    buildFetching: false,
    logs: [],
  }
  const { loginUser } = state.entities

  const { getTenxflowList, repoBranchesAndTags, cicdWs } = state.cicd_flow
  const { isFetching, flowList } = getTenxflowList || defaultFlowList
  const { ws } = cicdWs || defaultFlowList
  const { getTenxflowBuildLastLogs } = state.cicd_flow
  const { logs } = getTenxflowBuildLastLogs || defaultBuildLog
  let buildFetching = getTenxflowBuildLastLogs.isFetching || defaultBuildLog.buildFetching
  return {
    username: loginUser.info.userName,
    isFetching,
    flowList,
    buildFetching,
    wsSocket: ws,
    logs,
    currentSpace: state.entities.current.space.namespace,
    loginUser: state.entities.loginUser,
    repoBranchesAndTags,
  }
}

TenxFlowList.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxFlowList,
  deleteTenxFlowSingle,
  getTenxFlowDetail,
  getTenxflowBuildLastLogs,
  CreateTenxflowBuild,
  getTenxflowBuildDetailLogs,
  changeFlowStatus,
  loadProjectMembers,
  getRepoBranchesAndTagsByProjectId,
  getStageBuildLogList, setCicdWs
})(injectIntl(TenxFlowList, {
  withRef: true,
}));

