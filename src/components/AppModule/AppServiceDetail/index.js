/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppService component
 *
 * v0.1 - 2016-09-10
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tabs, Checkbox, Dropdown, Button, Card, Menu, Icon, Popover, Tooltip, Modal, Table, Row, Col } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Link, browserHistory } from 'react-router'
import ContainerList from './AppContainerList'
import AppServiceDetailInfo from './AppServiceDetailInfo'
import AppServiceAssistSetting from './AppServiceAssistSetting'
import ComposeGroup from './ComposeGroup'
import BindDomain from './BindDomain'
import PortDetail from './PortDetail'
import AppUseful from './AppUseful'
import AppServiceLog from './AppServiceLog'
import AppServiceEvent from './AppServiceEvent'
import AppServiceRental from './AppServiceRental'
import AppSettingsHttps from './AppSettingsHttps'
import ServiceMonitor from './ServiceMonitor'
import AppAutoScale from './AppAutoScale'
import VisitType from './VisitType'
import Lifecycle from './lifecycle'
import AlarmStrategy from '../../ManageMonitor/AlarmStrategy'
import { loadServiceDetail, loadServiceContainerList, loadK8sService, deleteServices, getAllClusterLine, getVesselDetail, ClearLine } from '../../../actions/services'
import { addTerminal } from '../../../actions/terminal'
import CommmonStatus from '../../CommonStatus'
import './style/AppServiceDetail.less'
import { parseServiceDomain } from '../../parseDomain'
import ServiceStatus from '../../TenxStatus/ServiceStatus'
import { TENX_MARK, LOAD_STATUS_TIMEOUT, UPDATE_INTERVAL } from '../../../constants'
import { addPodWatch, removePodWatch } from '../../../containers/App/status'
import TipSvcDomain from '../../TipSvcDomain'
import { getServiceStatusByContainers } from '../../../common/status_identify'
import { ANNOTATION_HTTPS } from '../../../../constants'
import { camelize } from 'humps'
import { SERVICE_KUBE_NODE_PORT } from '../../../../constants'
import Title from '../../Title'

const DEFAULT_TAB = '#containers'
const TabPane = Tabs.TabPane;

function terminalSelectedCheck(item, list) {
  //this function for check the container selected or not
  let existFlag = false;
  list.map((container) => {
    if (item.metadata.name == container.metadata.name) {
      existFlag = true;
    }
  });
  return existFlag;
}

class AppServiceDetail extends Component {
  constructor(props) {
    super(props)
    this.closeModal = this.closeModal.bind(this)
    this.onTabClick = this.onTabClick.bind(this)
    this.restartService = this.restartService.bind(this)
    this.stopService = this.stopService.bind(this)
    this.openTerminalModal = this.openTerminalModal.bind(this)
    this.onHttpsComponentSwitchChange = this.onHttpsComponentSwitchChange.bind(this)
    this.showList = this.showList.bind(this)
    this.cancelVesselModal = this.cancelVesselModal.bind(this)
    this.vesselDetail = this.vesselDetail.bind(this)
    this.monitoring = this.monitoring.bind(this)
    this.showLog = this.showLog.bind(this)
    this.state = {
      activeTabKey: props.selectTab || DEFAULT_TAB,
      currentContainer: [],
      httpIcon: 'http',
      deleteModal: false,
      vesselList: [],
      vesselDetailShow: false,
    }
  }

  loadData(nextProps) {
    const self = this
    const {
      cluster,
      services,
      serviceName,
      loadServiceDetail,
      loadK8sService,
      loginUser,
      current,
      namespace,
      loadServiceContainerList,
    } = nextProps || this.props
    const query = {}
    loadServiceDetail(cluster, serviceName)
    loadK8sService(cluster, serviceName, {
      success: {
        func: (result) => {
          const camelizedSvcName = camelize(serviceName)
          let httpIcon = 'http'
          var a = result.data
          if (result.data && result.data[camelizedSvcName] && result.data[camelizedSvcName].metadata
            && result.data[camelizedSvcName].metadata.annotations && result.data[camelizedSvcName].metadata.annotations[ANNOTATION_HTTPS] === 'true') {
            httpIcon = 'https'
          }
          this.setState({
            httpIcon,
          })
        },
        isAsync: true
      }
    })
    const camelizedSvcName = camelize(serviceName)
    loadServiceContainerList(cluster, this.props.scope.props.serviceList[0].metadata.namespace, serviceName, null, {
      success: {
        func: (result) => {
          // Add pod status watch, props must include statusWatchWs!!!
          addPodWatch(cluster, self.props, result.data)
          // For fix issue #CRYSTAL-2079(load list again for update status)
          clearTimeout(self.loadStatusTimeout)
          clearInterval(this.upStatusInterval)
          query.customizeOpts = {
            keepChecked: true,
          }
          self.loadStatusTimeout = setTimeout(() => {
            loadServiceContainerList(cluster, this.props.scope.props.serviceList[0].metadata.namespace, serviceName, query)
          }, LOAD_STATUS_TIMEOUT)
          // Reload list each UPDATE_INTERVAL
          self.upStatusInterval = setInterval(() => {
            loadServiceContainerList(cluster, this.props.scope.props.serviceList[0].metadata.namespace, serviceName, query)
          }, UPDATE_INTERVAL)
        },
        isAsync: true
      }
    })
  }

  closeModal() {
    const { scope, ClearLine } = this.props
    ClearLine();
    scope.setState({
      modalShow: false,
      selectTab: null
    });
  }

  openTerminalModal(item) {
    const { cluster, addTerminal } = this.props
    addTerminal(cluster, item)
  }

  componentWillMount() {
    this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow, serviceName, selectTab } = nextProps
    const { scope } = this.props

    if (serviceDetailmodalShow === this.props.serviceDetailmodalShow) {
      return
    }
    if (serviceDetailmodalShow) {
      scope.setState({
        donotUserCurrentShowInstance: false
      })
      this.loadData(nextProps)
      if (serviceName === this.props.serviceName && (!selectTab)) {
        return
      }
      this.setState({
        activeTabKey: selectTab || DEFAULT_TAB
      })
    } else {
      scope.setState({
        donotUserCurrentShowInstance: true
      })
      clearTimeout(this.loadStatusTimeout)
      clearInterval(this.upStatusInterval)
    }
  }

  componentWillUnmount() {
    const {
      cluster,
      statusWatchWs,
    } = this.props
    removePodWatch(cluster, statusWatchWs)
    clearTimeout(this.loadStatusTimeout)
    clearInterval(this.upStatusInterval)
  }

  onTabClick(activeTabKey) {
    const { loginUser } = this.props
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    if (loginUser.info.proxyType == SERVICE_KUBE_NODE_PORT) {
      if (activeTabKey == '#binddomain' || activeTabKey == '#https') {
        return
      }
    }
    this.setState({
      activeTabKey
    })
  }

  restartService(service) {
    const { funcs, scope } = this.props
    const _self = this
    funcs.batchRestartService()
  }

  stopService(service) {
    const { funcs } = this.props
    const self = this
    funcs.batchStopService()
  }

  delteService() {
    this.setState({
      deleteModal: true
    })
  }
  cancelDeleteModal() {
    this.setState({
      deleteModal: false
    })
  }
  
  okDeleteModal() {
    const { deleteServices, scope, serviceDetail, loadServices } = this.props

    const service = scope.state.currentShowInstance || serviceDetail
    deleteServices(service.cluster, [service.metadata.name], {
      success: {
        func: (res) => {
          setTimeout(function () {
            this.loadServices()
          }, 1000)
          this.setState({
            deleteModal: false
          })
          scope.setState({
            modalShow: false
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {

        },
        isAsync: true
      }
    })
  }
  handleMenuDisabled(key) {
    const { scope } = this.props
    const service = scope.state.currentShowInstance
    //当点击停止的时候，只有status为Running的时候才可以点击
    //当点击重新部署的时候，只有status不为Stopped的时候才可以点击
    //当状态为启动中的时候，只可进行删除操作
    if (service.status) {
      if (key === 'stop' && service.status.phase === 'Stopped') {
        return true
      } else if (key === 'restart' && service.status.phase === 'Stopped') {
        return true
      }
    }
    return false
  }
  onHttpsComponentSwitchChange(status) {
    this.setState({
      httpIcon: status ? 'https' : 'http'
    })
  }
  showList(data) {
    const { lifeCycles } = this.props;
    const { names } = lifeCycles;
    const _this = this;
    // const { getAllClusterLine } = this.props;
    // getAllClusterLine()
    // 此处应该请求接口获取数据
    this.setState({
      vesselList: names[data.dataIndex],
      logTime : data.name
    }, function () {
      _this.setState({
        vesselShow: true
      })
    })
  }
  vesselDetail(name) {
    const { getVesselDetail, cluster } = this.props;
    getVesselDetail(cluster, name)
    this.setState({
      vesselDetailShow: true
    })
  }
  cancelVesselModal() {
    this.setState({
      vesselShow: false,
      vesselList: []
    })
  }
  monitoring() {
    this.setState({
      vesselShow: false,
      vesselList: []
    }, function () {
      this.onTabClick('#monitor')
    })
  }
  showLog(record) {
    const {name} = record
    const { getVesselDetail, cluster } = this.props;
    const _this = this;
    getVesselDetail(cluster, name).then((result) => {
      const data = result.response.result.data.data.detail;
      if (data.podName) {
        _this.setState({
          vesselShow: false,
          vesselList: []
        }, function () {
          browserHistory.push(`/manange_monitor/query_log?serviceName=${data.serviceName}&&podName=${data.podName}&&time=${this.state.logTime}`)
        })
      }
    }).catch(err => {

    })
  }
  render() {
    const parentScope = this
    const { loginUser, lifeCycles } = this.props
    const { count, names } = lifeCycles;
    const {
      scope,
      serviceDetailmodalShow,
      serviceDetail,
      isServiceDetailFetching,
      containers,
      isContainersFetching,
      appName,
      current,
      currentCluster,
      bindingDomains,
      bindingIPs,
      k8sService,
      vessDetail,
    } = this.props
    const { activeTabKey, currentContainer, deleteModal, vesselShow, vesselList, vesselDetailShow } = this.state
    const httpsTabKey = '#https'
    const isKubeNode = (SERVICE_KUBE_NODE_PORT == loginUser.info.proxyType)
    let nocache = currentContainer.map((item) => {
      return item.metadata.name;
    })
    const service = scope.state.currentShowInstance || serviceDetail
    service.status = getServiceStatusByContainers(service, containers)
    const operaMenu = (<Menu>
      <Menu.Item key='restart' disabled={this.handleMenuDisabled('restart')}>
        <span onClick={() => this.restartService(service)}>重新部署</span>
      </Menu.Item>
      <Menu.Item key='stop' disabled={this.handleMenuDisabled('stop')}>
        <span onClick={() => this.stopService(service)}>停止</span>
      </Menu.Item>
      <Menu.Item key='delete'>
        <span onClick={() => this.delteService(service)}>删除</span>
      </Menu.Item>
    </Menu>);
    const svcDomain = parseServiceDomain(service, bindingDomains, bindingIPs)
    const { availableReplicas, replicas } = service.status
    let containerShow = containers.map((item, index) => {
      return (
        <div key={`Popoverkey-` + index} className={terminalSelectedCheck(item, parentScope.state.currentContainer) ? 'containerTerminalDetailSelected containerTerminalDetail' : 'containerTerminalDetail'}
          onClick={this.openTerminalModal.bind(parentScope, item)}>
          <span>{item.metadata.name}</span>
        </div>
      )
    })
    let onTerminal = containers.map((item, index) => {
      return (
        <Button className='loginBtn' type='primary' size='large' key={index}>
          <svg className='terminal'>
            <use xlinkHref='#terminal' />
          </svg>
          <span onClick={this.openTerminalModal.bind('', item)}>登录终端</span>
        </Button>
      )
    })
    const dataSource = []
    let vesselDom = vesselList.map((item, index) => {
      dataSource.push({
        key: index,
        name: item,
      })
    })
    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: text => <a onClick={() => this.vesselDetail(text)}>{text}</a>,
    }, {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: '40%',
      render: (text, record) => (
        <span className="table-operation">
          <Button onClick={() => this.monitoring()} type="primary" style={{ 'marginRight': '10px' }}>监控</Button>
          <Button type="primary" disabled={Boolean(current.space.role)} onClick={() => this.showLog(record)}>日志</Button>
        </span>
      ),
    }];
    let pagination = {
      pageSize: 5
    }
    return (
      <div id='AppServiceDetail'>

        <Modal title="容器列表" visible={vesselShow}
          onCancel={() => this.cancelVesselModal()}
          footer={null}
        >
          <Table dataSource={dataSource} pagination={pagination} columns={columns} />
        </Modal>
        <Modal title="容器信息" width="400" visible={vesselDetailShow}
          onCancel={() => this.setState({ vesselDetailShow: false })}
          footer={null}
        >
          <Row style={{ lineHeight: '30px' }}>
            <Col span={6}>容器名称：</Col>
            <Col span={18}>{vessDetail.podName}</Col>
          </Row>
          <Row style={{ lineHeight: '30px' }}>
            <Col span={6}>所属服务：</Col>
            <Col span={18}>{vessDetail.serviceName}</Col>
          </Row>
          <Row style={{ lineHeight: '30px' }}>
            <Col span={6}>镜像：</Col>
            <Col span={18}>{vessDetail.image}</Col>
          </Row>
          <Row style={{ lineHeight: '30px' }}>
            <Col span={6}>访问地址：</Col>
            <Col span={18}>{vessDetail.url}</Col>
          </Row>
          <Row style={{ lineHeight: '30px' }}>
            <Col span={6}>重启次数：</Col>
            <Col span={18}>{vessDetail.restartNum}</Col>
          </Row>
        </Modal>
        <Modal title="删除操作" visible={deleteModal}
          onCancel={() => this.cancelDeleteModal()}
          onOk={() => this.okDeleteModal()}
        >
          确定要删除服务{service.metadata.name}吗？
        </Modal>
        <div className='titleBox'>
          <Title title={`${service.metadata.name} 服务详情页`} />
          <Icon className='closeBtn' type='cross' onClick={this.closeModal} />
          {/*<i className='closeBtn fa fa-times' onClick={this.closeModal}></i>*/}
          <div className='imgBox'>
            <svg>
              <use xlinkHref='#server' />
            </svg>
          </div>
          <div className='infoBox'>
            <p className='instanceName'>
              {service.metadata.name}
            </p>
            <div className='leftBox appSvcDetailDomain'>
              <div>
                状态：
                <span style={{ position: 'relative', top: '-5px' }}>
                  <ServiceStatus
                    smart={true}
                    service={service} />
                </span>
              </div>
              <div className='address'>
                <span>地址：</span>
                <div className='addressRight'>
                  <TipSvcDomain svcDomain={svcDomain} parentNode='appSvcDetailDomain' icon={this.state.httpIcon} />
                </div>
              </div>
              <div>
                容器实例：
                <span>
                  {availableReplicas}/{replicas}
                </span>
              </div>
            </div>
            <div className='rightBox'>
              {
                containerShow.length > 1 ?
                  <Popover content={containerShow} title='选择实例链接' trigger='click' getTooltipContainer={() => document.getElementById('AppServiceDetail')}>
                    <Button className='loginBtn' type='primary' size='large'>
                      <svg className='terminal'>
                        <use xlinkHref='#terminal' />
                      </svg>
                      <span>登录终端</span>
                    </Button>
                  </Popover>
                  :
                  onTerminal
              }
              <Dropdown overlay={operaMenu} trigger={['click']}>
                <Button type='ghost' size='large' className='ant-dropdown-link' href='#'>
                  服务相关 <i className='fa fa-caret-down'></i>
                </Button>
              </Dropdown>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='bottomBox'>
          <div className='siderBox'>
            <Tabs
              tabPosition='left'
              onTabClick={this.onTabClick}
              activeKey={activeTabKey}
            >
              <TabPane tab='容器实例' key='#containers'>
                <ContainerList
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  containerList={containers}
                  loading={isContainersFetching}
                />
              </TabPane>
              <TabPane tab='基础信息' key='#basic'>
                <AppServiceDetailInfo
                  cluster={service.cluster}
                  serviceDetail={serviceDetail}
                  loading={isServiceDetailFetching} />
              </TabPane>
              <TabPane tab='辅助设置' key='#setting'>
                <AppServiceAssistSetting
                  serviceDetail={serviceDetail}
                  loading={isServiceDetailFetching} />
              </TabPane>
              <TabPane tab='配置组' key='#configgroup'>
                <ComposeGroup
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  serviceName={service.metadata.name}
                  service={serviceDetail}
                  cluster={service.cluster}
                />
              </TabPane>
              <TabPane tab={<Tooltip placement="right" title={isKubeNode ? '当前代理不支持绑定域名' : ''}><span>绑定域名</span></Tooltip>} disabled={isKubeNode} key='#binddomain'>
                <BindDomain
                  cluster={service.cluster}
                  serviceName={service.metadata.name}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  service={serviceDetail}
                  activeKey={activeTabKey}
                  isCurrentTab={activeTabKey === '#binddomain'}
                />
              </TabPane>
              <TabPane tab='访问方式' key='#visitType'>
                <VisitType
                  cluster={service.cluster}
                  serviceName={service.metadata.name}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  service={serviceDetail}
                  activeKey={activeTabKey}
                  isCurrentTab={activeTabKey === '#visitType'}
                />
              </TabPane>
              <TabPane tab='端口' key='#ports'>
                <PortDetail
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  currentCluster={currentCluster}
                  container={containers[0]}
                  loading={isContainersFetching}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  loadData={() => this.loadData()}
                  isCurrentTab={activeTabKey === '#ports'}
                />
              </TabPane>
              <TabPane tab={<Tooltip placement="right" title={isKubeNode ? '当前代理不支持设置 HTTPS' : ''}><span>设置 HTTPS</span></Tooltip>} disabled={isKubeNode} key={httpsTabKey}>
                <AppSettingsHttps
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  container={containers[0]}
                  scope={this}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  isCurrentTab={activeTabKey === httpsTabKey}
                  onSwitchChange={this.onHttpsComponentSwitchChange}
                />
              </TabPane>
              <TabPane tab='高可用' key='#livenessprobe'>
                <AppUseful
                  service={serviceDetail}
                  loading={isServiceDetailFetching}
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                />
              </TabPane>
              <TabPane tab='监控' key='#monitor'>
                <div className='ServiceMonitor'>
                  <ServiceMonitor
                    serviceName={service.metadata.name}
                    cluster={service.cluster} />
                </div>
              </TabPane>
              <TabPane tab='告警策略' key='#strategy'>
                <AlarmStrategy
                  serviceName={service.metadata.name}
                  currentService={service}
                  cluster={service.cluster}
                  isCurrentTab={activeTabKey === '#strategy'}
                />
              </TabPane>
              
              <TabPane tab='生命周期' key='#lifecycle'>
                <Lifecycle isCurrentTab={activeTabKey === '#lifecycle'} cluster={service.cluster} serviceName={service.metadata.name} showList={this.showList} />
              </TabPane>
              <TabPane tab='自动伸缩' key='#autoScale'>
                <AppAutoScale
                  replicas={service.spec.replicas}
                  memory={service.spec.template.spec.containers[0].resources.requests.memory}
                  servicelist={service.metadata}
                  serviceName={service.metadata.name}
                  volumes={service.spec.template.spec.volumes}
                  diskType={service.spec.template.metadata.labels.diskType}
                  cluster={service.cluster} />
              </TabPane>
              <TabPane tab='日志' key='#logs'>
            <AppServiceLog
              activeKey={activeTabKey}
              containers={containers}
              // containerList={containers}
              serviceName={service.metadata.name}
              cluster={service.cluster}
              serviceDetailmodalShow={serviceDetailmodalShow}
              serviceDetail={serviceDetail}
              
              relative />
          </TabPane>
              <TabPane tab='事件' key='#events'>
                <AppServiceEvent serviceName={service.metadata.name} cluster={service.cluster} type={'replicaset'} serviceDetailmodalShow={serviceDetailmodalShow} />
              </TabPane>
              <TabPane tab='租赁信息' key='#rentalInfo'>
                <AppServiceRental serviceName={service.metadata.name} serviceDetail={[serviceDetail]} />
              </TabPane>
            </Tabs>
          </div>
          <div className='contentBox'>
          </div>
        </div>
      </div>
    )
  }
}

AppServiceDetail.propTypes = {
  loadServiceDetail: PropTypes.func.isRequired,
  loadServiceContainerList: PropTypes.func.isRequired,
  isServiceDetailFetching: PropTypes.bool.isRequired,
  // containers: PropTypes.array.isRequired,
  isContainersFetching: PropTypes.bool.isRequired,
}

function mapStateToProps(state, props) {
  const { scope } = props
  const { loginUser } = state.entities
  const { statusWatchWs } = state.entities.sockets
  const currentShowInstance = scope.state.currentShowInstance
  const cluster = currentShowInstance && currentShowInstance.cluster
  const metadata = currentShowInstance && currentShowInstance.metadata
  const { lifeCycle, vessDetail } = state.services
  const serviceName = metadata ? metadata.name : ''
  const defaultService = {
    isFetching: false,
    cluster,
    serviceName,
    service: {}
  }
  const defaultServices = {
    isFetching: false,
    cluster,
    serviceName,
    containerList: []
  }
  const {
    serviceDetail,
    serviceContainers,
    k8sService,
  } = state.services

  let targetService
  if (serviceDetail[cluster] && serviceDetail[cluster][serviceName]) {
    targetService = serviceDetail[cluster][serviceName]
  }
  targetService = targetService || defaultService

  let targetContainers
  if (serviceContainers[cluster] && serviceContainers[cluster][serviceName]) {
    targetContainers = serviceContainers[cluster][serviceName]
  }
  targetContainers = targetContainers || defaultServices

  let k8sServiceData = {}
  const camelizedSvcName = camelize(serviceName)
  if (k8sService && k8sService.isFetching === false && k8sService.data && k8sService.data[camelizedSvcName]) {
    k8sServiceData = k8sService.data[camelizedSvcName]
  }

  return {
    loginUser: loginUser,
    cluster,
    statusWatchWs,
    current: state.entities.current,
    currentCluster: state.entities.current.cluster,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
    serviceName,
    serviceDetail: targetService.service,
    isServiceDetailFetching: targetService.isFetching,
    containers: targetContainers.containerList,
    isContainersFetching: targetContainers.isFetching,
    k8sService: k8sServiceData,
    lifeCycles: lifeCycle.result || { count: [], names: [] },
    vessDetail: vessDetail.result || {}
  }
}

export default connect(mapStateToProps, {
  loadServiceDetail,
  loadServiceContainerList,
  loadK8sService,
  addTerminal,
  getVesselDetail,
  deleteServices, ClearLine,
  getAllClusterLine
})(AppServiceDetail)
