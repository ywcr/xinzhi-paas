/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowDetailFlow component
 *
 * v0.1 - 2016-10-25
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Icon, Card, Alert, Modal, Button, } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { getTenxFlowStateList, getProjectList, searchProject, getAvailableImage, setCicdWs, getDockerfileList, CreateTenxflowBuild, StopTenxflowBuild, changeSingleState, getTenxflowBuildLogs } from '../../../../actions/cicd_flow'
import './style/TenxFlowDetailFlow.less'
import CreateTenxFlowModal from './TenxFlowDetailFlow/CreateTenxFlowModal.js'
import TenxFlowDetailFlowCard from './TenxFlowDetailFlow/TenxFlowDetailFlowCard.js'
import Socket from '../../../Websocket/socketIo'
import io from 'socket.io-client'
import NotificationHandler from '../../../../common/notification_handler'
import ContinueIntegration from '../../../SettingModal/GlobalConfig/ContinueIntegration'
import { parseQueryStringToObject } from '../../../../common/tools'


const confirm = Modal.confirm;

const menusText = defineMessages({
  title: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.title',
    defaultMessage: '部署记录',
  },
  tooltip: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.tooltip',
    defaultMessage: 'EnnFlow流程定义：这里可以定义一个EnnFlow项目的执行流程，每个卡片对应一个子任务，分别执行镜像构建、代码编译、单元测试或者集成测试等子任务，大部分流程以生成应用镜像作为结束。',
  },
  buildImageTooltip: {
    id: 'CICD.Tenxflow.BuildImage.tooltip',
    defaultMessage: '构建镜像是EnnFlow中常被创建的子任务，指可将源代码仓库包括代码GitHub、GitLab、Gogs、SVN中的代码通过代码库中的Dockerfile或云端的Dockerfile 构建成镜像，默认将构建后的镜像存放到镜像仓库--私有空间。',
  },
  add: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.add',
    defaultMessage: '添加子任务',
  },
  buildImageAdd: {
    id: 'CICD.Tenxflow.BuildImage.add',
    defaultMessage: '添加构建任务',
  }
})

class TenxFlowDetailFlow extends Component {
  constructor(props) {
    super(props);
    this.createNewFlow = this.createNewFlow.bind(this);
    this.closeCreateNewFlow = this.closeCreateNewFlow.bind(this);
    this.buildFlow = this.buildFlow.bind(this);
    this.refreshStageList = this.refreshStageList.bind(this);
    this.toggleCustomizeBaseImageModal = this.toggleCustomizeBaseImageModal.bind(this);
    const queryObj = parseQueryStringToObject(window.location.search)
    this.state = {
      editTenxFlowModal: false,
      currentModalShowFlow: null,
      currentFlowEdit: null,
      buildingList: [],
      refreshing: false,
      Sockets: '',
      forCacheShow: false,
      customizeBaseImageModalVisible: false,
    }
    if (queryObj.showCard == 'true') {
      this.state.createNewFlow = true
    } else {
      this.state.createNewFlow = false
    }
  }

  toggleCustomizeBaseImageModal(visible) {
    this.setState({
      customizeBaseImageModalVisible: visible,
    })
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
  componentWillMount() {
    const { getTenxFlowStateList, flowId, getProjectList, getDockerfileList, getAvailableImage, wsSocket, setCicdWs } = this.props;
    const _this = this;
    let buildingList = [];
    //when different tenxflow should be show
    //sometimes the last message still in the html
    //when the new message recevice, the old message will be refrash

    this.setState({
      forCacheShow: true
    });

    getAvailableImage()
    getTenxFlowStateList(flowId, {
      success: {
        func: (res) => {
          res.data.results.map((item) => {
            let buildId = null;
            if (!Boolean(item.lastBuildStatus)) {
              buildId = null;
            } else {
              buildId = item.lastBuildStatus.buildId;
            }
            let buildItem = {
              buildId: buildId,
              stageId: item.metadata.id
            }
            if (item.lastBuildStatus) {
              buildItem.status = item.lastBuildStatus.status
            }
            buildingList.push(buildItem)
          })
          _this.setState({
            buildingList: buildingList,
          });
          if (!wsSocket[flowId]) { // 设置 websocket --- yaowei
            _this.setWs(flowId,res.data.results.status,_this,buildingList)
          } else {
            _this.onSetup(flowId, buildingList, res.data.results.status)
          }
          getProjectList({
            success: {
              func: () => {
                _this.setState({
                  forCacheShow: false
                })
              },
              isAsync: true
            }
          });
        },
        isAsync: true
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    //this function for user click the top box and build all stages
    const {startBuild, buildInfo, getTenxFlowStateList, flowId, CreateTenxflowBuild, scope, refreshFlag, getTenxflowBuildLogs } = nextProps;
    let oldFlowId = this.props.flowId;
    let notification = new NotificationHandler()
    const _this = this;
    if (startBuild) {
      scope.setState({
        startBuild: false,
        buildInfo: null,
        statusName: 2,
        status: '执行中...'
      })
      const options = {}
      if (buildInfo) {
        options.branch = buildInfo.name
      }
      _this.buildFlow(this.props.stageInfo[0].metadata.id,options)
      // CreateTenxflowBuild(flowId, { options }, { // 调用构建方法  yaowei
      //   success: {
      //     func: (res) => {
      //       getTenxFlowStateList(flowId) //获取log yaowei 
      //       getTenxflowBuildLogs(flowId) //获取log yaowei 
      //     },
      //     isAsync: true
      //   }
      // })
    }
    if (refreshFlag) {
      scope.setState({
        refreshFlag: false
      });
      getTenxFlowStateList(flowId, {
        success: {
          func: () => {
            notification.success("构建流程已刷新")
          },
          isAsync: true
        }
      });
    }
  }

  createNewFlow() {
    //this function only for user create an new flow show the edit modal
    this.setState({
      currentFlowEdit: null,
      createNewFlow: true,
    });
  }

  closeCreateNewFlow() {
    //this function only for user close the modal of  create an new flow
    this.setState({
      currentFlowEdit: null,
      createNewFlow: false
    });
  }

  buildFlow(stageId, options) {
    //this function for user build stage
    //and user can build single one
    const { CreateTenxflowBuild, getTenxFlowStateList, flowId, status, getTenxflowBuildLogs } = this.props;
    let buildFlag = true;
    const _this = this;
    let notification = new NotificationHandler()
    let buildingList = _this.state.buildingList;
    CreateTenxflowBuild(flowId, { stageId, options }, {
      success: {
        func: (res) => {
          getTenxflowBuildLogs(flowId)
          _this.props.setStatus(_this.props.scope, 2)
          notification.success('流程正在构建中');
          getTenxFlowStateList(flowId, {
            success: {
              func: (ress) => {
                let search = location.search
                if (search.indexOf('?') != -1) {
                  search = search.split('?')[1].split('&')[0]
                  _this.props.scope.props.getCdInimage(search)
                }
                buildingList.map((item, index) => {
                  if (item.stageId == stageId) {
                    buildFlag = false;
                    item.buildId = res.data.results.stageBuildId;
                    item.status = 2
                  }
                });
              },
              isAsync: true
            }
          });
        },
        isAsync: true
      }
    })
  }

  stopBuildFlow(stageId, stageName) {
    const { StopTenxflowBuild, getTenxFlowStateList, flowId,scope } = this.props;
    const { buildingList } = this.state;
    let notification = new NotificationHandler()
    buildingList.map((item) => {
      if (item.stageId == stageId) {
        StopTenxflowBuild(flowId, item.stageId, item.buildId, {
          success: {
            func: (res) => {
              notification.success('构建停止成功');
              getTenxFlowStateList(flowId);
              scope.setState({
                statusName: 1,
                status: '失败'
              })
            },
            isAsync: true
          }
        });
      }
    });
  }

  refreshStageList() {
    const { getTenxFlowStateList, flowId } = this.props;
    let notification = new NotificationHandler()
    this.setState({
      refreshing: true
    })
    getTenxFlowStateList(flowId, {
      success: {
        func: () => {
          notification.success('流程构建已刷新');
          this.setState({
            refreshing: false
          })
        },
        isAsync: true
      }
    });
  }

  setWs(flowId, status,scope,buildList){
    const { wsSocket,cicdApi } = this.props
    const { loginUser, setCicdWs } = this.props
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
      this.onSetup(flowId,buildList,status)
    } catch (e) {
      if(Socket){
        Socket.reconnect(flowId, status,scope,buildList);
      }
    } 
  }

  onSetup(flowId, buildList, status, success) {
    const { loginUser, scope, cicdApi, wsSocket, setCicdWs } = this.props
    let Socket = wsSocket[flowId]
    const self = this
    let buildStatus = null;
    //----------------yao----------------//
    const buildingList = buildList || this.state.buildingList

    const { getTenxFlowStateList } = this.props

    //---------------心跳----------------//
    if(!Socket.reconnect&&!Socket.heartCheck){
      Socket.reconnect = (flowId, status,scope,buildList)=>{ // websocket 重连
        // console.log('---------重连----------')
        if(Socket.lockReconnect) return;
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
                  _this.reset();
                  Socket.send(JSON.stringify({ 'flowId': flowId, webSocketIfClose: 1, 'buildStatus':buildStatus?buildStatus:( status == null ? 3 : status )}));
                  Socket.close();//如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                  Socket.reconnect(flowId,status,self,buildList)
                }, _this.timeout)
            }, _this.timeout)
          },
      }
    }
    //---------------心跳----------------//  
    if (Socket) {
      Socket.onopen = function (data) {
        // Web Socket 已连接上，使用 send() 方法发送数据
        if (success) {
          success();
        }
        if (Socket.readyState === 1) { // 为1表示连接处于open状态
          Socket.heartCheck.reset().start();
          Socket.send(JSON.stringify({ flowId: flowId,'buildStatus':buildStatus?buildStatus:( status == null ? 3 : status )}));
        }
      };
      Socket.onclose = function () {
        // Socket.reconnect(flowId,status,self,buildList)
      };
      Socket.onerror = function () {
        // Socket.reconnect(flowId,status,self,buildList)
      };
      Socket.onmessage = function (evt) {
        var data = JSON.parse(evt.data);
        Socket.heartCheck.reset().start();
        buildStatus = data.buildStatus;
        if (data.status !== 200) { return }
        if (data.message != 'ok' && data.webSocketIfClose !=2) {
          if (data.buildStatus == 2) {
            scope.setState({
              startBuild: false,
              buildInfo: null,
              statusName: 2,
              status: '执行中...'
            })
          } else {
            let buildingList = []
            getTenxFlowStateList(flowId, {
              success: {
                func: (res) => {
                  res.data.results.map((item) => {
                    let buildItem = {
                      buildId: item.lastBuildStatus.buildId?item.lastBuildStatus.buildId:null,
                      stageId: item.metadata.id
                    }
                    if (item.lastBuildStatus) {
                      buildItem.status = item.lastBuildStatus.status
                    }
                    buildingList.push(buildItem)
                  })
                  self.setState({
                    buildingList
                  })
                },
                isAsync: false
              }
            })

            let lastBuilds = self.state.buildingList
            let notified = self.state.notified || {}
            let notification = new NotificationHandler()
            if (notified && notified[data.stageId] !== data.stageBuildId) {
              //未提示过
              if (data.buildStatus == 0 &&
                lastBuilds[lastBuilds.length - 1].stageId === data.stageId &&
                lastBuilds[lastBuilds.length - 1].buildId === data.stageBuildId) {
                //最后一个stage构建完成时
                notified[data.stageId] = data.stageBuildId
                self.setState({
                  notified: notified
                })
                self.props.setStatus(self.props.scope, 0)
                notification.close()
                notification.success(`构建完成`)
                scope.setState({
                  statusName: 0,
                  status: '成功'
                })
              } else if (data.buildStatus == 1) {
                //构建未成功时
                notification.close()
                notification.error(`构建失败`)
                scope.setState({
                  statusName: 1,
                  status: '失败'
                })
                for (var i in lastBuilds) {
                  if (lastBuilds[i].buildId === data.stageBuildId) {
                    self.props.setStatus(self.props.scope, 1)
                    notified[data.stageId] = data.stageBuildId
                    self.setState({
                      notified: notified
                    })
                    break
                  }
                }
              }
            }

          }
          const { changeSingleState } = self.props
          changeSingleState(data)
        }
      }
    }
  }
  addWatch(buildId, stageBuildId) {
    const { socket, watchCondition } = this.state
    watchCondition.watchedBuilds.push({
      stageBuildId: stageBuildId,
      stageId: item.stageId
    })
    socket.emit('stageBuildStage', watchCondition)
  }
  render() {
    const {
      flowId, stageInfo, namespace, stageList,
      isFetching, projectList, buildFetching,
      logs, supportedDependencies, cicdApi,
      imageList, baseImages, uniformRepo,
    } = this.props;
    const { forCacheShow } = this.state;
    let scope = this;
    let { currentFlowEdit } = scope.state;
    let cards = null;
    if (!Boolean(stageList) || forCacheShow) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    } else {
      let preStage = {}
      cards = stageList.map((item, index) => {
        let content = (
          <TenxFlowDetailFlowCard key={'TenxFlowDetailFlowCard' + index} preStage={preStage} config={item} uniformRepo={uniformRepo}
            scope={scope} stageInfo={stageInfo} namespace={namespace} index={index} flowId={flowId} currentFlowEdit={currentFlowEdit} totalLength={stageList.length}
            codeList={projectList} supportedDependencies={supportedDependencies} imageList={imageList} baseImages={baseImages}
            otherImage={this.props.otherImage} toggleCustomizeBaseImageModal={this.toggleCustomizeBaseImageModal}
            firstState={stageList[0]} isBuildImage={this.props.isBuildImage}
          />
        )
        preStage = item
        return content
      });
    }
    return (
      <div id='TenxFlowDetailFlow'>
        <div className='paddingBox'>
          {/*<Alert message={ this.props.isBuildImage ? <FormattedMessage {...menusText.buildImageTooltip} /> : <FormattedMessage {...menusText.tooltip} /> } type='info' />*/}
          {cards}
          {cards.length != 0 && this.props.isBuildImage ? '' :
            <div className={this.state.createNewFlow ? 'TenxFlowDetailFlowCardBigDiv commonCardBox createCardBox' : 'commonCardBox createCardBox'}>
              <Card className='commonCard createCard' onClick={this.createNewFlow}>
                {!this.state.createNewFlow ? [
                  <QueueAnim key='createCardAnimate'>
                    <div className='createInfo' key='createCard'>
                      <svg className='addIcon'>
                        <use xlinkHref='#cicdcreate' />
                      </svg>
                      <p>
                        {this.props.isBuildImage ? <FormattedMessage {...menusText.buildImageAdd} /> : <FormattedMessage {...menusText.add} />}
                      </p>
                    </div>
                  </QueueAnim>
                ] : null}
                {
                  this.state.createNewFlow ? [
                    <QueueAnim key='creattingCardAnimate'>
                      <CreateTenxFlowModal key='CreateTenxFlowModal' stageList={stageList} scope={scope}
                        flowId={flowId} stageInfo={stageInfo} codeList={projectList} uniformRepo={uniformRepo}
                        supportedDependencies={supportedDependencies} imageList={imageList}
                        otherImage={this.props.otherImage} toggleCustomizeBaseImageModal={this.toggleCustomizeBaseImageModal}
                        baseImages={baseImages} isBuildImage={this.props.isBuildImage} />
                    </QueueAnim>
                  ] : null
                }
              </Card>
            </div>}

          <div style={{ clear: 'both' }}></div>
        </div>
        {/* {this.state.websocket} */}
        <Modal
          onCancel={() => this.setState({ customizeBaseImageModalVisible: false })}
          title="自定义基础镜像"
          className='TenxFlowDetailFlowContinueIntegrationModal'
          visible={this.state.customizeBaseImageModalVisible}
          footer={null}
        >
          <ContinueIntegration />
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultStageList = {
    isFetching: false,
    stageList: [],
    ws: {}
  }
  const defaultStatus = {
    projectList: []
  }
  const { getTenxflowStageList, availableImage, cicdWs } = state.cicd_flow;
  const { isFetching, stageList } = getTenxflowStageList || defaultStageList;
  const { ws } = cicdWs || defaultStageList;
  const { managed } = state.cicd_flow;
  const { projectList } = managed || defaultStatus;
  const cicdApi = state.entities.loginUser.info.cicdApi
  return {
    isFetching,
    stageList,
    projectList,
    wsSocket: ws,
    cicdApi,
    imageList: availableImage.imageList || [],
    baseImages: availableImage.baseImages || [],
  }
}

TenxFlowDetailFlow.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxFlowStateList,
  getProjectList,
  searchProject,
  getDockerfileList,
  CreateTenxflowBuild,
  StopTenxflowBuild,
  setCicdWs,
  getAvailableImage,
  changeSingleState,
  getTenxflowBuildLogs
})(injectIntl(TenxFlowDetailFlow, {
  withRef: true,
}));

