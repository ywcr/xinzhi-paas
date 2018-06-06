/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerDetail component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Dropdown, Tabs, Card, Menu, Button, Spin, Modal } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import ContainerDetailInfo from "./ContainerDetailInfo.js"
import ContainerLogs from "./ContainerLogs"
import ContainerEvents from "./ContainerEvents"
import ContainerProgress from './ContainerProgress'
import "./style/ContainerDetail.less"
import { loadContainerDetail, deleteContainers } from '../../actions/app_manage'
import { addTerminal } from '../../actions/terminal'
import ContainerMonitior from './ContainerMonitior'
import { browserHistory } from 'react-router'
import ContainerStatus from '../TenxStatus/ContainerStatus'
import { formatDate } from '../../common/tools'
import NotificationHandler from '../../common/notification_handler'
import serverSVG from '../../assets/img/app.png'
import Title from '../Title'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane
const ButtonGroup = Button.Group
const confirm = Modal.confirm
const DEFAULT_TAB = '#configs'

function loadData(props) {
  const { cluster, containerName } = props
  props.loadContainerDetail(cluster, containerName)
}

class ContainerDetail extends Component {
  constructor(props) {
    super(props)
    this.openTerminalModal = this.openTerminalModal.bind(this)
    this.deleteContainer = this.deleteContainer.bind(this)
    this.onTabClick = this.onTabClick.bind(this)
    this.state = {
      activeTabKey: props.hash || DEFAULT_TAB,
      currentContainer: null,
    }
  }

  componentWillMount() {
    loadData(this.props)
  }

  // For tab select
  componentWillReceiveProps(nextProps) {
    let { hash } = nextProps
    if (hash === this.props.hash) {
      return
    }
    if (!hash) {
      hash = DEFAULT_TAB
    }
    this.setState({
      activeTabKey: hash
    })
  }

  openTerminalModal(item, e) {
    e.stopPropagation();
    const { cluster, addTerminal } = this.props
    addTerminal(cluster, item)
  }

  deleteContainer() {
    const { containerName, cluster, deleteContainers } = this.props
    confirm({
      title: `您是否确认要重新分配 ${containerName} 这个容器`,
      onOk() {
        return new Promise((resolve) => {
          let notification = new NotificationHandler()
          notification.spin(`容器 ${containerName} 重新分配中...`)
          deleteContainers(cluster, [containerName], {
            success: {
              func: () => {
                notification.close()
                notification.success(`容器 ${containerName} 已成功重新分配`)
                browserHistory.push('/app_manage/container')
              },
              isAsync: true
            },
            failed: {
              func: () => {
                notification.close()
                notification.error(`容器 ${containerName} 重新分配失败`)
              }
            }
          })
          resolve()
        });
      },
      onCancel() { },
    })
  }

  onTabClick(activeTabKey) {
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    const { pathname } = this.props
    this.setState({
      activeTabKey
    })
    if (activeTabKey === DEFAULT_TAB) {
      activeTabKey = ''
    }
    browserHistory.push({
      pathname,
      hash: activeTabKey
    })
  }

  render() {
    const parentScope = this
    const { containerName, isFetching, container, cluster } = this.props
    const { children } = this.props
    const { activeTabKey } = this.state
    if (isFetching || !!!container || !!!container.metadata) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!container.status) {
      container.status = {}
    }
    const operaMenu = (
      <Menu>
        <Menu.Item key="0" disabled={true}>
          <i className="fa fa-stop" style={{ marginRight: "10px" }}></i>停止
        </Menu.Item>
      </Menu>
    );
    return (
      <div id="ContainerDetail">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          <Title title={`容器 ${containerName}`} />
          <div className="cover"></div>
          <div key="ca" className="containerInfo" id='containerInfo'>
            <Card className="topCard">
              <div className="imgBox">
                <svg>
                  <use xlinkHref='#server' />
                </svg>
              </div>
              <div className="infoBox">
                <p className="appTitle">
                  {containerName}
                </p>
                <div className="leftInfo">
                  <div className="status">
                    状态：
                    <span style={{ position: 'relative', top: '-5px' }}>
                      <ContainerStatus container={container} smart={true} />
                    </span>
                  </div>
                  <div className="address">
                    地址： {container.status.podIP}
                  </div>
                </div>
                <div className="middleInfo">
                  <div className="createDate">
                    创建： {formatDate(container.metadata.creationTimestamp || '')}
                  </div>
                  {/*<div className="updateDate">
                      更新：{container.metadata.creationTimestamp}
                    </div>*/}
                </div>
                <div className="rightInfo">
                  <div className="actionBox commonData">
                    <Button type="primary" className="viewBtn" size='large'
                      onClick={(e) => this.openTerminalModal(container, e)}>
                      <svg className="terminal">
                        <use xlinkHref="#terminal" />
                      </svg>
                      登录终端
                    </Button>
                    <Button
                      onClick={this.deleteContainer} size='large' type="ghost">
                      <i className='fa fa-undo' />&nbsp;重新分配
                    </Button>
                  </div>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <div style={{ clear: "both" }}></div>
            </Card>
            <Card className="bottomCard">
              <Tabs
                tabPosition="top"
                defaultActiveKey={DEFAULT_TAB}
                activeKey={activeTabKey}
                onTabClick={this.onTabClick}
                >
                <TabPane tab="配置" key="#configs" >
                  <ContainerDetailInfo key="#configs" container={container} />
                </TabPane>
                <TabPane tab="监控" key="#monitor" >
                  <ContainerMonitior key="#monitor" containerName={containerName} cluster={cluster} />
                </TabPane>
                <TabPane tab="日志" key="#logs" >
                  <ContainerLogs
                    key="#logs"
                    containerName={containerName}
                    serviceName={container.metadata.labels.name}
                    cluster={cluster}
                    tabKey="#logs"
                    activeTabKey={activeTabKey} />
                </TabPane>
                <TabPane tab="事件" key="#events" >
                  <ContainerEvents key="#events" containerName={containerName} cluster={cluster} />
                </TabPane>
                <TabPane tab="进程" key="#progress" >
                  <ContainerProgress key="#progress" containerName={containerName} cluster={cluster} />
                </TabPane>
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

ContainerDetail.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  containerName: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  container: PropTypes.object.isRequired,
  loadContainerDetail: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { params, location } = props
  const { container_name } = params
  const { pathname, hash } = location
  const { cluster } = state.entities.current
  const defaultContainer = {
    isFetching: false,
    cluster: cluster.clusterID,
    containerName: container_name,
    container: {}
  }
  const {
    containerDetail
  } = state.containers
  const { container, isFetching } = containerDetail[cluster.clusterID] || defaultContainer

  return {
    pathname,
    hash,
    containerName: container_name,
    cluster: cluster.clusterID,
    isFetching,
    container
  }
}

export default connect(mapStateToProps, {
  loadContainerDetail,
  deleteContainers,
  addTerminal,
})(ContainerDetail)
