/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster Tab List component
 *
 * v0.1 - 2017-1-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input, Dropdown, Spin, Modal, message, Icon, Checkbox, Tooltip,  Row, Col, Tabs } from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import ClusterResourcesOverview from './clsuterResourcesOverview'
import HostList from './hostList'
import ClusterLabelManage from './clusterLabelManage'
import ClusterPlugin from './clusterPlugin'
import NetworkSolutions from './NetworkSolutions'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {
  changeClusterNodeSchedule,
  deleteClusterNode,
  getKubectlsPods,
  getAddNodeCMD,
  getClusterLabel,
  getAllClusterNodes,
} from '../../actions/cluster_node'
import { getClusterSummary } from '../../actions/cluster'

import { addTerminal } from '../../actions/terminal'
import { NOT_AVAILABLE } from '../../constants'
import './style/clusterTabList.less'
import NotificationHandler from '../../common/notification_handler'
import { formatDate, calcuDate } from '../../common/tools'
import { camelize } from 'humps'
import AddClusterOrNodeModal from './AddClusterOrNodeModal'
import CreateAlarm from '../AppModule/AlarmModal'
import CreateGroup from '../AppModule/AlarmModal/CreateGroup'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group
const TabPane = Tabs.TabPane;

class ClusterTabList extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.openTerminalModal = this.openTerminalModal.bind(this);
    this.handleAddClusterNode = this.handleAddClusterNode.bind(this)
    this.copyAddNodeCMD = this.copyAddNodeCMD.bind(this)
    this.cancelModal = this.cancelModal.bind(this)
    this.nextStep = this.nextStep.bind(this)
    this.handleTabsSwitch = this.handleTabsSwitch.bind(this)
    this.handleCallbackActiveKey = this.handleCallbackActiveKey.bind(this)
    this.state = {
      currentContainer: [],
      addClusterOrNodeModalVisible: false,
      deleteNode: null,
      copyAddNodeSuccess: false,
      step: 1,// create alarm modal step
      TabsactiveKey: 1,
    }
  }

  loadData(props) {
    const { clusterID, getKubectlsPods } = props || this.props
    getKubectlsPods(clusterID)
  }

  componentWillMount() {
    const { getAllClusterNodes, clusterID } = this.props
    getAllClusterNodes(clusterID)
    this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    const { clusterID } = nextProps
    if (clusterID === this.props.clusterID) {
      return
    }
    this.loadData(nextProps)
  }

  componentDidMount() {
    const { clusterID, getAddNodeCMD, getClusterSummary, location } = this.props
    getAddNodeCMD(clusterID)
    getClusterSummary(clusterID)
    if(location &&　location.query.from == "clusterDetail"){
      this.setState({
        TabsactiveKey: "host"
      })
    }
  }

  copyAddNodeCMD() {
    //this function for user click the copy btn and copy the download code
    const code = document.getElementById('addClusterOrNodeCMDInput')
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyAddNodeSuccess: true
    })
  }


  cancelModal() {
    // cancel create Alarm modal
    this.setState({
      alarmModal: false,
      step:1
    })
  }
  nextStep(step) {
    this.setState({
      step: step
    })
  }

  openTerminalModal() {
    const { kubectlsPods, addTerminal, clusterID } = this.props
    let { currentContainer } = this.state;
    let notification = new NotificationHandler()
    if (currentContainer.length > 0) {
      addTerminal(clusterID, currentContainer[0])
      return
    }
    const { namespace, pods } = kubectlsPods
    if (!pods || pods.length === 0) {
      notification.warn('没有可用终端节点，请联系管理员')
      return
    }
    let randomPodNum = Math.ceil(Math.random() * pods.length)
    if (randomPodNum === 0) randomPodNum = 1
    currentContainer = [{
      metadata: {
        namespace,
        name: pods[randomPodNum - 1]
      }
    }]
    addTerminal(clusterID, currentContainer[0])
    this.setState({
      currentContainer,
    })
  }

  handleAddClusterNode() {
    this.setState({
      addClusterOrNodeModalVisible: true,
    })
  }

  handleTabsSwitch(key) {
    this.setState({
      TabsactiveKey: key
    })
    if (key === 'labels') {
      this.props.getClusterLabel(this.props.clusterID)
    }
  }

  handleCallbackActiveKey(type,labels) {
    let summary = labels || []
    this.setState({
      TabsactiveKey: type,
      summary
    })
  }

  render() {
    const {
      intl, isFetching, nodes,
      clusterID, memoryMetric, cpuMetric,
      license, kubectlsPods, addNodeCMD,
      cluster, clusterSummary,
    } = this.props
    const { formatMessage } = intl;
    const { podCount, deleteNode, copyAddNodeSuccess, TabsactiveKey } = this.state;
    const rootscope = this.props.scope;
    const scope = this;
    let oncache = this.state.currentContainer.map((item) => {
      return item.metadata.name;
    })
    const maxNodes = license && license[camelize('max_nodes')]
    const modalFunc=  {
      scope : this,
      cancelModal: this.cancelModal,
      nextStep: this.nextStep
    }
    return (
      <QueueAnim className='clusterTabListBox'
        type='right'
        >
        <div id='clusterTabList' key='clusterTabList'>
          <Tabs activeKey={TabsactiveKey} onChange={this.handleTabsSwitch}>

            <TabPane tab={<div className='tablepanediv'><svg className='size select'><use xlinkHref="#resourceoverview"></use></svg><span className='tablepanespan'>资源总览</span></div>} key="1">
            <ClusterResourcesOverview
              cluster={cluster}
              clusterSummary={clusterSummary}
            />

            </TabPane>
            <TabPane tab={<div className='tablepanediv'><svg className='size select'><use xlinkHref="#hostlists"></use></svg><span className='tablepanespan'>主机列表</span></div>} key="host">
              <HostList
                cluster={cluster}
                clusterID={clusterID}
                summary={this.state.summary}
                callbackActiveKey={this.handleCallbackActiveKey}
              />
            </TabPane>
            <TabPane tab={<div className='tablepanediv'><svg className='size select'><use xlinkHref="#managelabels"></use></svg><span className='tablepanespan'>标签管理</span></div>} key="labels">
              <ClusterLabelManage callbackActiveKey={this.handleCallbackActiveKey}  clusterID={clusterID} />
            </TabPane>

            <TabPane tab={<div className='tablepanediv'><svg className='size pluginSize select'><use xlinkHref="#plugin"></use></svg><span className='tablepanespan'>插件管理</span></div>} key="4">
              <ClusterPlugin cluster={cluster}
              />
            </TabPane>
            <TabPane tab={<div className='tablepanediv'><svg className='size select'><use xlinkHref="#networksolutions"></use></svg><span className='tablepanespan'>网络方案</span></div>} key="5">
              <NetworkSolutions
                clusterID={clusterID}
              />
            </TabPane>
          </Tabs>

          <AddClusterOrNodeModal
            title="添加主机节点"
            visible={this.state.addClusterOrNodeModalVisible}
            closeModal={() => this.setState({addClusterOrNodeModalVisible: false})}
            CMD={addNodeCMD && addNodeCMD[camelize('default_command')]}
            bottomContent={<p>注意：新添加的主机需要与 Master 节点同一内网，可互通</p>} />

          <Modal title="创建告警策略" visible={this.state.alarmModal} width={580}
            className="alarmModal"
            onCancel={()=> this.setState({alarmModal:false})}
            maskClosable={false}
            footer={null}
          >
            <CreateAlarm funcs={modalFunc}/>
          </Modal>
          {/* 通知组 */}
          <Modal title="创建新通知组" visible={this.state.createGroup}
            width={800}
            onCancel={()=> this.setState({createGroup:false,alarmModal:true})}
            maskClosable={false}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
          >
            <CreateGroup funcs={modalFunc}/>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

ClusterTabList.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  // const pods = {
  //   nodes: {},
  //   isFetching: false
  // }
  const clusterID = props.cluster.clusterID
  // const { getAllClusterNodes, kubectlsPods, addNodeCMD } = state.cluster_nodes
  const { clusterSummary } = state.cluster
  // const targetAllClusterNodes = getAllClusterNodes[clusterID]
  // const { isFetching } = targetAllClusterNodes || pods
  // const data = (targetAllClusterNodes && targetAllClusterNodes.nodes) || pods
  // const { cpuMetric, memoryMetric, license } = data
  // const nodes = data.clusters ? data.clusters.nodes : []
  return {
  //   nodes,
  //   cpuMetric,
  //   memoryMetric,
  //   license,
  //   isFetching,
    clusterID,
  //   kubectlsPods: (kubectlsPods ? kubectlsPods.result : {}) || {},
  //   addNodeCMD: addNodeCMD[clusterID] || {},
    clusterSummary: (clusterSummary && clusterSummary[clusterID] ? clusterSummary[clusterID].summary : {}) || {},
  }
}

export default connect(mapStateToProps, {
  changeClusterNodeSchedule,
  deleteClusterNode,
  getKubectlsPods,
  getAddNodeCMD,
  getClusterSummary,
  addTerminal,
  getClusterLabel,
  getAllClusterNodes,
})(injectIntl(ClusterTabList, {
  withRef: true,
}))