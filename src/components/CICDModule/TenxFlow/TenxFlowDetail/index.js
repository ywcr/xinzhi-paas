/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * EnnFlowDetail component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Card, Button, Tabs, Modal, message, Popover, Tooltip, Icon } from 'antd'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import {
  getTenxFlowDetail, getTenxflowBuildLastLogs, getTenxFlowYAML,
  deploymentLog, getTenxflowBuildLogs, getCdInimage,
  changeBuildStatus, getTenxFlowStatus, getRepoBranchesAndTagsByProjectId,
} from '../../../../actions/cicd_flow'
import { loadRepositoriesTags,loadProjectMembers } from '../../../../actions/harbor'

import { LoadOtherImage } from '../../../../actions/app_center'
import { checkImage } from '../../../../actions/app_center'
import './style/TenxFlowDetail.less'
import TenxFlowDetailAlert from './TenxFlowDetailAlert.js'
import TenxFlowDetailYaml from './TenxFlowDetailYaml.js'
import TenxFlowDetailSetting from './TenxFlowDetailSetting.js'
import TenxFlowDetailLog from './TenxFlowDetailLog.js'
import ImageDeployLogBox from './ImageDeployLogBox.js'
import TenxFlowDetailFlow from './TenxFlowDetailFlow.js'
import TenxFlowBuildLog from '../TenxFlowBuildLog'
import NotificationHandler from '../../../../common/notification_handler'
import flowImg from '../../../../assets/img/flow.png'
import { camelize } from 'humps'

import PopTabSelect from '../../../PopTabSelect'
import Title from '../../../Title'

const TabPane = Tabs.TabPane;
const PopTab = PopTabSelect.Tab;
const PopOption = PopTabSelect.Option;
let notification = new NotificationHandler()

const menusText = defineMessages({
  search: {
    id: 'CICD.Tenxflow.TenxFlowDetail.search',
    defaultMessage: '搜索',
  },
  name: {
    id: 'CICD.Tenxflow.TenxFlowDetail.name',
    defaultMessage: '名称',
  },
  updateTime: {
    id: 'CICD.Tenxflow.TenxFlowDetail.updateTime',
    defaultMessage: '更新时间',
  },
  status: {
    id: 'CICD.Tenxflow.TenxFlowDetail.status',
    defaultMessage: '构建状态',
  },
  opera: {
    id: 'CICD.Tenxflow.TenxFlowDetail.opera',
    defaultMessage: '操作',
  },
  tooltips: {
    id: 'CICD.Tenxflow.TenxFlowDetail.tooltips',
    defaultMessage: 'EnnFlow：这里完成【代码项目构建、测试】等流程的定义与执行，可以实现若干个（≥1）项目组成的一个Flow，由若干个项目流程化完成一个Flow，直至完成整个总项目，其中大部分流程以生成应用镜像为结束标志。',
  },
  create: {
    id: 'CICD.Tenxflow.TenxFlowDetail.create',
    defaultMessage: '创建EnnFlow',
  },
  deloyLog: {
    id: 'CICD.Tenxflow.TenxFlowDetail.deloyLog',
    defaultMessage: '执行记录',
  },
  deloyStart: {
    id: 'CICD.Tenxflow.TenxFlowDetail.deloyStart',
    defaultMessage: '立即构建',
  },
  checkImage: {
    id: 'CICD.Tenxflow.TenxFlowDetail.checkImage',
    defaultMessage: '查看镜像',
  },
  delete: {
    id: 'CICD.Tenxflow.TenxFlowDetail.delete',
    defaultMessage: '删除EnnFlow',
  },
  unUpdate: {
    id: 'CICD.Tenxflow.TenxFlowDetail.unUpdate',
    defaultMessage: '未更新',
  },
  tenxFlowtooltip: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.tooltip',
    defaultMessage: 'EnnFlow流程定义：这里可以定义一个EnnFlow项目的执行流程，每个卡片对应一个子任务，分别执行代码编译、单元测试、集成测试和镜像构建等子任务，大部分流程以生成应用镜像作为结束。',
  },
  buildImageTooltip: {
    id: 'CICD.Tenxflow.BuildImage.tooltip',
    defaultMessage: '构建镜像是EnnFlow中常被创建的子任务，指可将源代码仓库包括代码GitHub、GitLab、Gogs、SVN中的代码通过代码库中的Dockerfile或云端的Dockerfile 构建成镜像，默认将构建后的镜像存放到镜像仓库--私有空间。',
  },
});

class TenxFlowDetail extends Component {
  constructor(props) {
    super(props);
    this.openCreateTenxFlowModal = this.openCreateTenxFlowModal.bind(this);
    this.closeCreateTenxFlowModal = this.closeCreateTenxFlowModal.bind(this);
    this.openTenxFlowDeployLogModal = this.openTenxFlowDeployLogModal.bind(this);
    this.closeTenxFlowDeployLogModal = this.closeTenxFlowDeployLogModal.bind(this);
    this.refreshStageList = this.refreshStageList.bind(this);
    this.startBuildStage = this.startBuildStage.bind(this);
    this.renderBuildBtn = this.renderBuildBtn.bind(this);
    const pathname = window.location.pathname
    let isBuildImage = false
    if(pathname.indexOf('/build_image') >= 0) {
      isBuildImage = true
    }
    this.state = {
      createTenxFlowModal: false,
      TenxFlowDeployLogModal: false,
      startBuild: false,
      buildInfo: null,
      showImage: [],
      statusName: 0,
      refreshFlag: false,
      showTargeImage:false,
      projectId: null,
      projectBranch: null,
      dataFlow:[],
        projectName:[],
        project_delete:[],
      isBuildImage
    }
  }
  flowState() {
    let { search } = this.props.location;
    let status = ''
    search = search.split('&')[1]
    switch (search) {
      case '0':
        status = '成功'
        break;
      case '1':
        status = "失败"
        break;
      case '2':
        status = "执行中..."
        break;
      default:
        status = "等待中..."
    }
    this.setState({
      status,
      statusName: search
    })
  }
  componentWillMount() {
    const { getTenxFlowDetail, getCdInimage, getRepoBranchesAndTagsByProjectId } = this.props;
    let { search } = this.props.location;
    search = search.split('?')[1].split('&')[0]
    const self = this
    getTenxFlowDetail(search, {
      success: {
        func: (res) => {
          getCdInimage(search)
          const stages = res.data.results.stageInfo || []
            const firstStage = stages[0]
          if (!firstStage) {
            return
          }
          const { id, branch } = firstStage.spec.project || { id: undefined, branch: undefined}
          this.setState({
            projectId: id,
            projectBranch: branch,
          })
          // data.results.stageInfo[0].spec.project.id
          if (id) {
            getRepoBranchesAndTagsByProjectId(id)
          }
        },
        isAsync: true
      }
    })
    this.flowState()
    this.props.LoadOtherImage()
  }

  componentWillReceiveProps(nextProps) {
    const { currentSpace } = nextProps;
    if (nextProps.cdImageList) {
      this.setState({
        showImage:nextProps.cdImageList
      })
    }
    if (currentSpace && this.props.currentSpace && currentSpace != this.props.currentSpace) {
      // browserHistory.push(`/ci_cd/enn_flow`)
      return
    }
  }

  openCreateTenxFlowModal() {
    //this function for user open the modal of create new tenxflow
    this.setState({
      createTenxFlowModal: true
    });
  }

  closeCreateTenxFlowModal() {
    //this function for user close the modal of create new tenxflow
    this.setState({
      createTenxFlowModal: false
    });
  }

  openTenxFlowDeployLogModal() {
    //this function for user open the modal of tenxflow deploy log
    const { flowInfo, getTenxflowBuildLastLogs } = this.props;
    const { flowId } = flowInfo;
    this.setState({
      TenxFlowDeployLogModal: true
    });
    getTenxflowBuildLastLogs(flowId)
  }

  closeTenxFlowDeployLogModal() {
    //this function for user close the modal of tenxflow deploy log
    this.setState({
      TenxFlowDeployLogModal: false
    });
  }

  startBuildStage(key, tabKey) {  // 点击构建 --- yaowei
    //this function for user build all stages
    //and the state changed will be trigger the children's recivice props
    //and start build flow functon will be trigger in children
    if (this.props.flowInfo && this.props.flowInfo.stageInfo && this.props.flowInfo.stageInfo.length < 1) {
      notification.error('请先添加构建子任务')
      return
    }
    notification.success('流程正在构建中')
    const newState = {
      startBuild: true
    }
    if (key && tabKey) {
      newState.buildInfo = {
        type: tabKey,
        name: key,
      }
    }
    this.setState(newState)
  }
  handleChange(e) {
    const {flowInfo, getTenxFlowYAML, deploymentLog, getTenxflowBuildLogs} = this.props
    const _this = this
    if ('5' == e) {
      getTenxFlowYAML(flowInfo.flowId, {
        success: {
          func: (resp) => {
            _this.setState({
              yamlContent: resp.data.results
            })
          },
          isAsync: true
        }
      })
    } else if ('3' == e) {
      deploymentLog(flowInfo.flowId)
    } else if ('2' == e) {
      getTenxflowBuildLogs(flowInfo.flowId)
    }
  }
  goCheckImage(item) {
    const { imageName, projectId } = item
    let notification = new NotificationHandler()
    const {namespace, owner} = this.props.flowInfo
    this.setState({showTargeImage: false})
    this.props.loadRepositoriesTags(DEFAULT_REGISTRY, imageName, {
      success: {
        func: (res) => {
          if(!res.data || res.data.length == 0) {
            notification.error('镜像不存在，请先执行构建')
            return
          }
          browserHistory.push(`/app_center/projects/detail/${projectId}?imageName=${imageName}`)
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          if(res.statusCode == 404) {
            notification.error('镜像不存在，请先执行构建')
            return
          }
          if(res.statusCode == 403 || res.statusCode == 401) {
            notification.error('没有权限访问该镜像')
            return
          }
          notification.error('内部错误，请稍后再试')
        }
      }
    })
  }
  handleVisibleChange(visible) {
    this.setState({ showTargeImage: visible });
  }

  setStatus(scope, status) {
    let statusName = status
    switch (statusName) {
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
    scope.setState({
      status,
      statusName
    })
  }

  refreshStageList() {
    //this function for refrash
    const { getTenxFlowStatus } = this.props;
    let { search } = this.props.location;
    search = search.split('?')[1].split('&')[0]
    const self = this
    getTenxFlowStatus(search, {
      success: {
        func: (result) => {
          let statusName = result.data.results.status;
          let status
          switch (statusName) {
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
          self.setState({
            status,
            statusName
          })
        },
        isAsync: true
      }
    })
    this.setState({
      refreshFlag: true
    });
  }

  callback(flowId) {
    const {getTenxflowBuildLastLogs, changeBuildStatus} = this.props
    return ()=> {
      getTenxflowBuildLastLogs(flowId, {
        success: {
          func: (result) => {
            const info = result.data.results.results
            changeBuildStatus(info.buildId, info.status)
          },
          isAsync: true
        }
      })
    }
  }

  renderBuildBtn() {
    const self=this;
    const { projectId, projectBranch } = this.state
    const { repoBranchesAndTags, flowInfo } = this.props
    const stageInfo = flowInfo.stageInfo || []
    const namespace=flowInfo.namespace||''
    const isNoPop = stageInfo.length < 1 || !stageInfo[0].spec.project || stageInfo[0].spec.project.repoType === 'svn'
    const targetElement = (
      <Button
        size='large'
        type='primary'
        onClick={() => {
            if (isNoPop) {
                self.startBuildStage()
            }
        }}
      >
        <i className='fa fa-pencil-square-o' />&nbsp;
        <FormattedMessage {...menusText.deloyStart} />
      </Button>
    )
    if (isNoPop) {
      return targetElement
    }
    const tabs = []
    let loading
    const branchesAndTags = repoBranchesAndTags[projectId]
    if (branchesAndTags&&branchesAndTags.data&&branchesAndTags.data.branches&&branchesAndTags.data.tags) {
             const { isFetching, data } = branchesAndTags
             loading = isFetching
             const { branches, tags } = data
             for(let key in data) {
                 if (data.hasOwnProperty(key)) {
                     tabs.push(
                         <PopTab key={key} title={key === 'branches' ? '分支' : '标签'}>
                             {
                                 data[key].map(item => {
                                     let name = item.branch || item.tag
                                     return <PopOption key={name}>{name}</PopOption>
                                 })
                             }
                         </PopTab>
                     )
                 }
       }
    } else {
        tabs.push(<PopOption key="not_found_branches_tags">未找到分支及标签，点击构建</PopOption>)
    }

    return (
      <PopTabSelect
        data={this.state.dataFlow}
        stageInfo={stageInfo}
        placeholder="输入分支或标签"
        onChange={this.startBuildStage}
        targetElement={targetElement}
        loading={loading}
        isShowBuildBtn={true}
        getTooltipContainer={() => document.getElementById('TenxFlowDetail')}>
        {tabs}
      </PopTabSelect>
    )
  }

  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    const { flowInfo, isFetching, buildFetching, logs } = this.props;
    let stageInfo=[]
    if(flowInfo&&flowInfo.stageInfo){
          stageInfo=flowInfo.stageInfo
    }
    if (isFetching || flowInfo == {} || !Boolean(flowInfo)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const checkImage = this.state.showImage.length > 0 && this.state.showImage.map(list => {
      return (
        <div className="cursor" onClick={() => this.goCheckImage(list)} key={list.imageName} style={{ lineHeight: '25px' }}><a>{list.imageName}</a></div>
      )
    })

    return (
      <QueueAnim className='TenxFlowDetail'
        type='right'
        >
        <Title title="EnnFlow" />
        <div id='TenxFlowDetail' key='TenxFlowDetail'>
          <Card className='infoBox'>
            <div className='imgBox' >
              <img src={flowImg} />
            </div>
            <p className='title'>{flowInfo.name}</p>
            <div className='msgBox'>{/* 根据 TenxFlow 组件scope设置statusname 与 status -- yaowei */}
              状态：<span className={'status-' + this.state.statusName}><i className="fa fa-circle" style={{ marginRight: '5px' }}></i>{this.state.status}</span>
              <span className='updateTime'>{flowInfo.update_time ? flowInfo.update_time : flowInfo.create_time}</span>
            </div>
            <div className='btnBox'>
              {this.renderBuildBtn()/* 立即构建 --- yaowei */}

              {this.state.showImage.length > 0 ?
                <Popover placement="topLeft" title="查看镜像" content={checkImage} visible={this.state.showTargeImage} onVisibleChange={(visible)=>this.handleVisibleChange(visible)}>
                  <Button size='large' type='ghost'>
                    <i className='fa fa-eye' />&nbsp;
                    <FormattedMessage {...menusText.checkImage} />
                  </Button>
                </Popover>
                :
                null
              }
              <Button size='large' type='ghost' onClick={this.openTenxFlowDeployLogModal} className='titleLogBtn'>
                <svg className='cicdlog'>
                  <use xlinkHref='#cicdlog' />
                </svg>
                <FormattedMessage {...menusText.deloyLog} /> {/*查看执行记录 --- yaowei*/}
              </Button>
              <Button size='large' type='ghost' onClick={this.refreshStageList}>
                <span><i className='fa fa-refresh'></i>&nbsp;刷新</span>
              </Button>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div style={{ clear: 'both' }}></div>
          </Card>
          <Tabs defaultActiveKey='1' size="small" onChange={(e) => this.handleChange(e)}>
            <TabPane tab={this.state.isBuildImage ? <span>构建镜像任务<Tooltip title={<FormattedMessage {...menusText.buildImageTooltip} />}><Icon style={{marginLeft: '3px'}} type="question-circle-o" /></Tooltip></span> : <span>EnnFlow流程定义<Tooltip title={<FormattedMessage {...menusText.tenxFlowtooltip} />}><Icon style={{marginLeft: '5px'}} type="question-circle-o" /></Tooltip></span>} key='1'>
              <TenxFlowDetailFlow // 子任务 --- yaowei
                scope={scope}
                setStatus={this.setStatus}
                otherImage={this.props.otherImage}
                flowId={flowInfo.flowId}
                status={flowInfo.flowId}
                uniformRepo={flowInfo[camelize('uniform_repo')]}
                stageInfo={stageInfo}
                namespace={flowInfo.namespace}
                supportedDependencies={flowInfo.supportedDependencies}
                startBuild={this.state.startBuild}
                buildInfo={this.state.buildInfo}
                refreshFlag={this.state.refreshFlag}
                isBuildImage={this.state.isBuildImage}
              />
            </TabPane>
            {this.state.isBuildImage ? [ <TabPane tab='执行记录' key='2'><TenxFlowDetailLog scope={scope} flowId={flowInfo.flowId} flowName={flowInfo.name} /></TabPane>,
              <TabPane tab='自动部署' key='3'><ImageDeployLogBox scope={scope} flowId={flowInfo.flowId} /></TabPane>,
              <TabPane tab='构建通知' key='4'><TenxFlowDetailAlert scope={scope} notify={flowInfo.notificationConfig} flowId={flowInfo.flowId} /></TabPane>,
              <TabPane tab='设置' key='6'><TenxFlowDetailSetting scope={scope} flowId={flowInfo.flowId} /></TabPane>]
              :
              [ <TabPane tab='EnnFlow执行记录' key='2'><TenxFlowDetailLog scope={scope} flowId={flowInfo.flowId} flowName={flowInfo.name} /></TabPane>,
                <TabPane tab='自动部署' key='3'><ImageDeployLogBox scope={scope} flowId={flowInfo.flowId} /></TabPane>,
                <TabPane tab='构建通知' key='4'><TenxFlowDetailAlert scope={scope} notify={flowInfo.notificationConfig} flowId={flowInfo.flowId} /></TabPane>,
                <TabPane tab='EnnFlow同步' key='5'><TenxFlowDetailYaml flowId={flowInfo.flowId} detail={flowInfo} /></TabPane>,
                <TabPane tab='设置' key='6'><TenxFlowDetailSetting scope={scope} flowId={flowInfo.flowId} /></TabPane>]}
          </Tabs>
        </div>
        <Modal
          visible={this.state.TenxFlowDeployLogModal}
          className='TenxFlowBuildLogModal'
          onCancel={this.closeTenxFlowDeployLogModal}
          >
          <TenxFlowBuildLog scope={scope} isFetching={buildFetching} logs={logs} flowId={flowInfo.flowId} callback={this.callback(flowInfo.flowId)} visible={this.state.TenxFlowDeployLogModal}/>
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultFlowInfo = {
    isFetching: false,
    flowInfo: {}
  }
  const deafaultFlowLog = {
    isFetching: false,
    logs: []
  }
  const defaultFlowStatus = {
    initType: 0
  }
    const {loginUser}=state.entities

    const { getTenxflowDetail, getTenxflowBuildLastLogs, getCdImage, repoBranchesAndTags } = state.cicd_flow;
  const { cdImageList } = getCdImage || []
  const { isFetching, flowInfo } = getTenxflowDetail || defaultFlowInfo;
  const { initType } = getTenxFlowStatus || defaultFlowStatus;
  const buildFetching = getTenxflowBuildLastLogs ? getTenxflowBuildLastLogs.isFetching : deafaultFlowLog.isFetching
  const logs = getTenxflowBuildLastLogs ? getTenxflowBuildLastLogs.logs : deafaultFlowLog.logs;
  let otherImage = state.images.otherImages
  if(otherImage){
    otherImage = otherImage.imageRow
  } else {
    otherImage = []
  }
  return {
      username:loginUser.info.userName,
      isFetching,
    flowInfo,
    buildFetching,
    cdImageList,
    logs,
    currentSpace: state.entities.current.space.namespace,
    otherImage,
    repoBranchesAndTags,
  }
}

TenxFlowDetail.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxFlowYAML,
  getTenxFlowDetail,
  getTenxflowBuildLastLogs,
  checkImage,
  deploymentLog,
  getCdInimage,
  loadProjectMembers,
  getTenxflowBuildLogs,
  changeBuildStatus,
  getTenxFlowStatus,
  LoadOtherImage,
  getRepoBranchesAndTagsByProjectId,
  loadRepositoriesTags
})(injectIntl(TenxFlowDetail, {
  withRef: true,
}));
