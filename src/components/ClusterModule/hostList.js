/**
 * Created by zhangchengzheng on 2017/5/2.
 */
import React, { Component, propTypes } from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import NotificationHandler from '../../common/notification_handler'
import { Card, Button, Tooltip, Icon, Input, Select, Spin, Menu, Dropdown, Switch, Tag, Modal, Form, Table } from 'antd'
import { formatDate, calcuDate } from '../../common/tools'
import { camelize } from 'humps'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getAllClusterNodes, getClusterNodesMetrics, getKubectlsPods, deleteClusterNode, getClusterLabel, changeClusterNodeSchedule } from '../../actions/cluster_node'
import { addTerminal } from '../../actions/terminal'
import { NOT_AVAILABLE } from '../../constants'
import AddClusterOrNodeModal from './AddClusterOrNodeModal'
import TagDropdown from './TagDropdown'
import ManageLabelModal from './MangeLabelModal'
import './style/hostList.less'
import isEqual from 'lodash/isEqual'

const MASTER = 'Master'
const SLAVE = 'Slave'
const SubMenu = Menu.SubMenu;

function diskFormat(num) {
  if (num < 1024) {
    return num + 'KB'
  }
  num = Math.floor(num / 1024 * 100) / 100;
  if (num < 1024) {
    return num + 'MB'
  }
  num = Math.floor(num / 1024 * 100) / 100;
  if (num < 1024) {
    return num + 'GB'
  }
  num = Math.floor(num / 1024 * 100) / 100;
  return num + 'TB'
}

function getContainerNum(name, podList) {
  //this function for return the container num of node
  let num;
  podList.map((pod) => {
    if (pod.name == name) {
      num = pod.count;
    }
  });
  return num;
}

function cpuUsed(cpuTotal, cpuMetric, name) {
  name = camelize(name)
  if (!cpuMetric || !cpuMetric[name]) {
    return NOT_AVAILABLE
  }
  return `${cpuMetric[name].toFixed(2)}%`
}

function memoryUsed(memoryTotal, memoryMetric, name) {
  name = camelize(name)
  if (!memoryMetric || !memoryMetric[name]) {
    return NOT_AVAILABLE
  }
  let metric = memoryMetric[name]
  metric = metric / 1024 / memoryTotal * 100
  metric = `${metric.toFixed(2)}%`
  return metric
}


const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  changeSchedulable(node, e) {
    //this function for change node schedulable
    const { scope } = this.props;
    const { clusterID, changeClusterNodeSchedule } = scope.props;
    let { nodeList } = scope.state;
    let notification = new NotificationHandler()
    changeClusterNodeSchedule(clusterID, node, e, {
      success: {
        func: () => {
          // notification.info(e ? '开启调度中，该操作 1 分钟内生效' : '关闭调度中，该操作 1 分钟内生效');
          notification.success(e ? '开启调度成功' : '关闭调度成功');
          nodeList.map((item) => {
            if (item.objectMeta.name == node) {
              item.schedulable = e;
            }
          });
          scope.setState({
            nodeList: nodeList
          })
        },
        isAsync: true
      }
    })
  },
  ShowDeleteClusterNodeModal(node,item) {
    //this function for delete cluster node
    const { scope } = this.props;
    let handle = item.key.substring(0,6)
    if(handle == 'manage'){
      scope.setState({
        deleteNode: node,
        manageLabelModal : true
      })
      return
    }
    if(handle == 'delete'){
      scope.setState({
        deleteNode: node,
        deleteNodeModal: true
      })
    }
  },
  getDiskStage(node) {
    const conditions = node.conditions || []
    let color = 'green'
    let text = '健康'
    conditions.forEach(condition => {
      const { type, status } = condition
      switch (type) {
        case 'DiskPressure':
          if (status !== 'False') {
            color = 'yellow'
            text = '不足'
          }
          break
        case 'OutOfDisk':
          if (status !== 'False') {
            color = 'red'
            text = '告警'
          }
          break
        default:
          break
      }
    })
    return (
      <Tag color={color}>{text}</Tag>
    )
  },
  render: function () {
    const { isFetching, nodeList, cpuMetric, memoryMetric, clusterID, license, podCount } = this.props
    const root = this
    let dropdown
    let maxNodes
    let column = [
      {
        title: '名称/IP'
      },{
        title: '状态'
      },{
        title: '角色'
      },{
        title: '监控告警'
      },{
        title: '容器数'
      },{
        title: 'CPU使用'
      },{
        title: '内存占用'
      },{
        title: '调度状态'
      },{
        title: '磁盘情况'
      },{
        title: '加入集群时间'
      }, {
        title: '操作'
      }
    ]
    if(nodeList && nodeList.length !== 0){
      maxNodes = license[camelize('max_nodes')]
      dropdown = nodeList.map((item, index) => {
        return (
          <Menu disabled={item.isMaster ? true : false}
            onClick={this.ShowDeleteClusterNodeModal.bind(this, item)}
            style={{ width: '100px' }}
          >
            <Menu.Item key={'manage'+item.address}>
              <span>管理标签</span>
            </Menu.Item>
            <Menu.Item key={'delete'+item.address}>
              <span>删除节点</span>
            </Menu.Item>
          </Menu>
        )
      })
      column = [
        {
          title: '名称/IP',
          dataIndex: 'objectMeta.name',
          render: (text, item, index) => <div onClick={() => { browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}`) }} className='nameIP '>
            <div className="hostname">
              {item.objectMeta.name}
            </div>
            <div className="address">{item.address}</div>
          </div>,
          sorter: (a, b) => (a.objectMeta.name).localeCompare(b.objectMeta.name)
        },{
          title: '状态',
          dataIndex: 'ready',
          render: (text) => <div>
          <span className={text == 'True' ? 'runningSpan': 'errorSpan'}><i
            className='fa fa-circle'/>&nbsp;&nbsp;{text == 'True' ? '运行中': '异常'}</span>
          </div>,
          sorter: (a, b) => readySorter(a.ready) - readySorter(b.ready)
        },{
          title: '角色',
          dataIndex: 'isMaster',
          render: (isMaster) => <div>
            <Tooltip title={isMaster ? MASTER : SLAVE}>
              <span>{isMaster ? MASTER : SLAVE}</span>
            </Tooltip>
          </div>,
          sorter: (a, b) => isMasterSorter(a.isMaster) - isMasterSorter(b.isMaster)
        },{
          title: '监控告警',
          dataIndex: 'objectMete',
          render: (objectMeta, item, index) => <div className='alarm'>
            <Tooltip title="查看监控">
              <svg className="managemoniter" onClick={()=> browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}?tab=monitoring`)}><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#managemoniter"/></svg>
            </Tooltip>
            <Tooltip title="告警设置" onClick={()=> browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}?tab=alarm&open=true`)} >
              <Icon type="notification" />
            </Tooltip>
          </div>
        },{
          title: '容器数',
          dataIndex: 'objectMeta',
          render: (objectMeta) => <div>
            <span>{getContainerNum(objectMeta.name, podCount)}</span>
          </div>,
          sorter: (a, b) => getContainerNum(a.objectMeta.name, podCount) - getContainerNum(b.objectMeta.name, podCount)
        },{
          title: 'CPU使用',
          render: (text, record, index) => <div>
            <div className='topSpan'>{record[camelize('cpu_total')] / 1000}核</div>
            <div className='bottomSpan'>{cpuUsed(record[camelize('cpu_total')], cpuMetric, record.objectMeta.name)}</div>
          </div>
        },{
          title: '内存占用',
          render: (text, item, index) => <div>
            <div className='topSpan'>{diskFormat(item[camelize('memory_total_kb')])}</div>
            <div className='bottomSpan'>{memoryUsed(item[camelize('memory_total_kb')], memoryMetric, item.objectMeta.name)}</div>
          </div>
        },{
          title: '调度状态',
          dataIndex: 'schedulable',
          render: (text, item, index) => <div>
            <Switch
              className='switchBox'
              checked={item.schedulable || false}
              checkedChildren='开'
              unCheckedChildren='关'
              disabled={index >= maxNodes}
              onChange={this.changeSchedulable.bind(root, item.objectMeta.name)} /><br/>
            <span className='scheduleSpan'>
              {
                item.schedulable
                  ? (

                  <span>
                      正常调度&nbsp;
                    <Tooltip title={`允许分配新容器`}>
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                )
                  : (
                  <span>
                      暂停调度&nbsp;
                    <Tooltip title={`不允许分配新容器，正常运行的不受影响`}>
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                )
              }
            </span>
          </div>,
          sorter: (a, b) => isMasterSorter(a.schedulable) - isMasterSorter(b.schedulable)
        },{
          title: '磁盘情况',
          dataIndex: 'conditions',
          render: (text, item, index) => <div>{this.getDiskStage(item)}</div>,
          sorter: (a, b) => diskSorter(a.conditions) - diskSorter(b.conditions)
        },{
          title: '加入集群时间',
          dataIndex: 'objectMeta.creationTimestamp',
          render: (text, item, index) => <div>
            <Tooltip title={formatDate(item.objectMeta.creationTimestamp)}>
              <span className="timeSpan">{calcuDate(item.objectMeta.creationTimestamp)}</span>
            </Tooltip>
          </div>,
          sorter: (a, b) => soterCreateTime(a.objectMeta.creationTimestamp, b.objectMeta.creationTimestamp)
        },{
          title: '操作',
          render: (text, item, index) => <div>
            <Dropdown.Button type="ghost" overlay={dropdown[index]} onClick={() => browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}`)}>
              主机详情
            </Dropdown.Button>
          </div>
        }
      ]
    }
    function readySorter(ready){
      if(ready == 'True'){
        return 1
      }
      return -1
    }

    function isMasterSorter(a){
      if(a){
        return 1
      }
      return -1
    }

    function diskSorter(conditions){
      let conditionsArray = conditions || []
      let sorterNumber = 1
      conditionsArray.forEach(condition => {
        const { type, status } = condition
        switch (type) {
          case 'DiskPressure':
            if (status !== 'False') {
              sorterNumber = 0
            }
            break
          case 'OutOfDisk':
            if (status !== 'False') {
              sorterNumber = -1
            }
            break
          default:
            break
        }
      })
      return sorterNumber
    }

    function soterCreateTime(a, b){
      let oDate1 = new Date(a);
      let oDate2 = new Date(b);
      if(oDate1.getTime() > oDate2.getTime()){
        return 1
      } else {
        return -1
      }
    }

    return (
      <div className='imageList'>
        <Table
          columns={column}
          dataSource={nodeList}
          pagination={{simple: true}}
          loading={isFetching}
        />
      </div>
    );
  }
});


class hostList extends Component {
  constructor(props) {
    super(props)
    this.openTerminalModal = this.openTerminalModal.bind(this)
    this.handleDropdownTag = this.handleDropdownTag.bind(this)
    this.formTagContainer = this.formTagContainer.bind(this)
    this.deleteClusterNode = this.deleteClusterNode.bind(this);
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.callbackManageLabelModal = this.callbackManageLabelModal.bind(this)
    this.state = {
      addClusterOrNodeModalVisible:false,
      nodeList: [],
      podCount: null,
      currentContainer:[],
      manageLabelContainer:[],
      manageLabelModal : false,
      deleteNodeModal : false,
      deleteNode : null,
      summary: props.summary || []
    }
  }

  loadData() {
    const { clusterID, getClusterNodesMetrics, getAllClusterNodes, getKubectlsPods } = this.props
    const notification = new NotificationHandler()
    getAllClusterNodes(clusterID, {
      success: {
        func: (result) => {
          let nodeList = result.data.clusters.nodes.nodes;
          let podCount = result.data.clusters.podCount;
          this.setState({
            nodeList: nodeList,
            podCount: podCount,
            summary: [],
          })
          let slaveAvailable = false
          nodeList.map((item) => {
            if (item.isMaster === false) {
              slaveAvailable = true
              return
            }
          });
          if (slaveAvailable) {
            getClusterNodesMetrics(clusterID, { pods: nodeList.map(node => node.objectMeta.name) }, {
              failed: {
                func: err => {
                  notification.error('获取节点监控数据失败')
                }
              }
            })
          }
        },
        isAsync: true
      }
    })
    getKubectlsPods(clusterID)
  }
  componentWillMount() {
    this.loadData()
    const { clusterID } = this.props
    this.props.getClusterLabel(clusterID)
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.summary || nextProps.summary.length ==0) {
      return
    }
    if (!isEqual(nextProps.summary,this.props.summary)) {
      let nodeList =[]
      nextProps.nodes.nodes.map((item)=> {
        if (item.objectMeta.labels[nextProps.summary[0].key] && item.objectMeta.labels[nextProps.summary[0].key] == nextProps.summary[0].value) {
          nodeList.push(item)
        }
      })

      this.setState({
        summary: nextProps.summary,
        nodeList
      })
    }
  }
  searchNodes() {
    //this function for search nodes
    let search = document.getElementsByClassName('searchInput')[0].value
    const { nodes } = this.props;
    if (search.length == 0) {
      this.setState({
        nodeList: nodes.nodes
      })
      return;
    }
    let nodeList = [];
    nodes.nodes.map((node) => {
      if (node.objectMeta.name.indexOf(search) > -1) {
        nodeList.push(node);
      }
    });
    this.setState({
      nodeList: nodeList
    });
  }
  openTerminalModal(item, e) {
    const { kubectlsPods, addTerminal, clusterID } = this.props
    let { currentContainer } = this.state;
    let notification = new NotificationHandler()
    if (currentContainer.length > 0) {
      addTerminal(clusterID, currentContainer[0])
      return
    }
    const { namespace, pods } = kubectlsPods.result
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

  handleDropdownTag(obj) {
    const {callbackActiveKey} = this.props
    if(obj.key == 'manageTag'){
      callbackActiveKey('labels')
    }
  }
  handleClose(item) {
    const summary = this.state.summary.filter(tag => {
      if (tag.key !== item.key && tag.value !== item.value) {
        return true
      }
      return false
    });
    let nodeList = [];
    const { nodes } = this.props;
    if (summary.length ==0) {
      this.setState({
        summary,
        nodeList:nodes.nodes
      });
      return
    }
    nodes.nodes.map((node) => {
      let labels = node.objectMeta.labels
      let isEqual = true
      summary.every(item => {
        if (!labels[item.key]) {
          isEqual = false
          return false
        }
        return true
      })
      if (isEqual) {
        nodeList.push(node)
      }

    });
    // nodeList = Array.from(new Set(nodeList))
    this.setState({
      summary,
      nodeList
    });
  }
  formTagContainer(){
    let { summary } = this.state
    const arr = summary.map((item, index)=> {
      return (
        <Tag closable color="blue" key={item.key + index} afterClose={() => this.handleClose(item)} style={{width:'100%'}}>
          <span>{item.key}</span>
          <span className='point'>:</span>
          <span>{item.value}</span>
        </Tag>
      )
    })

    return arr
  }

  deleteClusterNode(){
    //this function for delete cluster node
    let notification = new NotificationHandler()
    const { clusterID, deleteClusterNode, getAllClusterNodes, getClusterNodesMetrics } = this.props;
    const {deleteNode} = this.state;
    const _this = this;
    if(deleteNode.isMaster){
      notification.warn(`不能删除${MASTER}`)
      return
    }
    deleteClusterNode(clusterID, deleteNode.objectMeta.name, {
      success: {
        func: () =>{
          getAllClusterNodes(clusterID, {
            success: {
              func: (result) => {
                let nodeList = result.data.clusters.nodes.nodes;
                notification.success('主机节点删除成功');
                _this.setState({
                  nodeList: nodeList,
                  deleteNodeModal: false
                })
                let slaveAvailable = false
                nodeList.map((item) => {
                  if (item.isMaster === false) {
                    slaveAvailable = true
                    return
                  }
                });
                if (slaveAvailable) {
                  getClusterNodesMetrics(clusterID, { pods: nodeList.map(node => node.objectMeta.name) }, {
                    failed: {
                      func: err => {
                        notification.error('获取节点监控数据失败')
                      }
                    }
                  })
                }
              },
              isAsync: true
            }
          })
        },
        isAsync: true
      }
    })
  }

  closeDeleteModal() {
    //this function for close delete node modal
    this.setState({
      deleteNodeModal: false
    })
  }

  callbackManageLabelModal(obj){
    this.setState({
      manageLabelModal: false
    })
  }

  render() {
    const { addNodeCMD, labels } = this.props
    const { deleteNode, podCount } = this.state
    const scope = this;
    return <div id="cluster__hostlist">
      <Card className='ClusterListCard'>
        <div className='operaBox'>
          <Button
            className='addPodBtn'
            size='large'
            type='primary'
            onClick={()=> this.handleAddClusterNode()}
          >
            <i className="fa fa-plus" style={{marginRight:'5px'}}/>
            <span>添加主机节点</span>
          </Button>
          <Button className='terminalBtn' size='large' type='ghost' onClick={this.openTerminalModal}>
            <svg>
              <use xlinkHref='#terminal' />
            </svg>
            <span>终端 | 集群管理</span>
          </Button>
          <Button type='ghost' size='large' className="refreshBtn" onClick={() => this.loadData()}>
            <i className='fa fa-refresh' /> 刷 新
          </Button>
          <span className='searchBox'>
            <Input className='searchInput' size='large' placeholder='搜索' type='text' onPressEnter={() => this.searchNodes()} />
            <Icon type="search" className="fa" onClick={() => this.searchNodes()} />
          </span>
          <span className='selectlabel' id="cluster__hostlist__selectlabel">
            <TagDropdown
              clusterID={this.props.clusterID}
              callbackHostList={this.handleDropdownTag}
              labels={labels}
              scope={scope}
              footer={true}
              getClusterLabel={this.props.getClusterLabel}
            />
          </span>
          {
            this.state.nodeList.length
            ? <div className='totle_num'>共 <span>{this.state.nodeList.length}</span> 条</div>
            : null
          }

          {
            this.state.summary.length > 0
            ? <div className='selectedroom'>
              {this.formTagContainer()}
            </div>
            : null
          }
        </div>
        <div className='dataBox'>
          <div className='datalist'>
            <MyComponent {...this.props} nodeList={this.state.nodeList} scope={scope} podCount={podCount} />
          </div>
        </div>
      </Card>

      <AddClusterOrNodeModal
        title="添加主机节点"
        visible={this.state.addClusterOrNodeModalVisible}
        closeModal={() => this.setState({addClusterOrNodeModalVisible: false})}
        CMD={addNodeCMD && addNodeCMD[camelize('default_command')]}
        bottomContent={<p>注意：新添加的主机需要与 Master 节点同一内网，可互通</p>} />

      <ManageLabelModal
        manageLabelModal={this.state.manageLabelModal}
        clusterID={this.props.clusterID}
        nodeName={this.state.deleteNode ? this.state.deleteNode.objectMeta.name:''}
        callback={this.callbackManageLabelModal}
        footer={true}
      />

      <Modal
        title='删除主机节点'
        className='deleteClusterNodeModal'
        visible={this.state.deleteNodeModal}
        onOk={this.deleteClusterNode}
        onCancel={this.closeDeleteModal}
      >
        <div style={{ color: '#00a0ea', height: "50px" }}>
          <Icon type='exclamation-circle-o' />
          &nbsp;&nbsp;&nbsp;确定要删除&nbsp;{deleteNode ? deleteNode.objectMeta.name : ''}&nbsp;主机节点？
        </div>
        <div className="note">注意：请保证其他开启调度状态的主机节点，剩余的配置足够运行所有应用的容器</div>
      </Modal>
    </div>
  }
}

function mapStateToProps(state, props) {
  const pods = {
    nodes: {},
    isFetching: false
  }
  const clusterID = props.cluster.clusterID
  const { getAllClusterNodes, kubectlsPods, addNodeCMD, clusterLabel } = state.cluster_nodes
  const { clusterSummary } = state.cluster
  const targetAllClusterNodes = getAllClusterNodes[clusterID]
  const { isFetching } = targetAllClusterNodes || pods
  const data = (targetAllClusterNodes && targetAllClusterNodes.nodes) || pods
  const { cpuMetric, memoryMetric, license } = data
  const nodes = data.clusters ? data.clusters.nodes : []

  const cluster = props.clusterID
  if (!clusterLabel[cluster]) {
    return props
  }
  let { result } = clusterLabel[cluster]

  if (!result) {
    result = {summary:[]}
  }
  return {
    labels:result.summary,
    nodes,
    cpuMetric,
    memoryMetric,
    license,
    isFetching,
    kubectlsPods,
    addNodeCMD: addNodeCMD[clusterID] || {},
  }
}
export default connect(mapStateToProps, {
  getAllClusterNodes,
  getClusterNodesMetrics,
  addTerminal,
  getKubectlsPods,
  deleteClusterNode,
  getClusterLabel,
  changeClusterNodeSchedule
})(injectIntl(hostList, {
  withRef: true,
}))
