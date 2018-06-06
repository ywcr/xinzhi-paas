/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppDetail component
 *
 * v0.1 - 2016-09-09
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tabs, Card, Menu, Spin, Form, Input, Button, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppServiceList from './AppServiceList'
import AppGraph from './AppGraph'
import AppLog from './AppLog'
import AppMonitior from './AppMonitior'
import './style/AppDetail.less'
import { formatDate } from '../../common/tools'
import { updateAppDesc, loadAppDetail } from '../../actions/app_manage'
import { browserHistory } from 'react-router'
import AppStatus from '../TenxStatus/AppStatus'
import { parseAppDomain } from '../parseDomain'
import TipSvcDomain from '../TipSvcDomain'
import { getAppStatus } from '../../common/status_identify'
import NotificationHandler from '../../common/notification_handler'
import errorHandler from '../../containers/App/error_handler'
import AppServiceRental from './AppServiceDetail/AppServiceRental'
import AlarmStrategy from '../ManageMonitor/AlarmStrategy'
import Topology from './AppServiceDetail/Topology'
import { loadServiceList } from '../../actions/services'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../constants'
import Title from '../Title'

const DEFAULT_TAB = '#service'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane
const createForm = Form.create;
const FormItem = Form.Item;

class AppDetail extends Component {
  constructor(props) {
    super(props)
    this.onTabClick = this.onTabClick.bind(this)
    this.onServicesChange = this.onServicesChange.bind(this)
    this.state = {
      activeTabKey: props.hash || DEFAULT_TAB,
      serviceList: null,
      availableReplicas: 0
    }
  }

  componentWillMount() {
    const { cluster, appName, loadAppDetail } = this.props
    loadAppDetail(cluster, appName)
    if (location.hash.length >1) {
      const _this = this
      const query = {
        page: DEFAULT_PAGE,
        size: DEFAULT_PAGE_SIZE,
      }
      this.props.loadServiceList(cluster,appName,query,{
        success:{
          func:(ret)=> {
            _this.onServicesChange(ret.data, ret.availableReplicas, ret.total)
          }
        }
      })

    }
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

  onTabClick(activeTabKey) {
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    // const { pathname } = this.props
    const pathname = location.pathname
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
    if (activeTabKey == '#topology') {
      setTimeout(()=> window.frames['topology'].postMessage('topology',location.href),500)
    }
  }

  // For change app status when service list change
  onServicesChange(serviceList, availableReplicas, total) {
    this.setState({
      serviceList,
      availableReplicas,
      total
    })
  }

  modifyDesc () {
    const { appName, cluster } = this.props
    this.props.form.validateFields((errors, data) => {
      data.name = appName,
      data.cluster = cluster
      let notification = new NotificationHandler()
      this.props.updateAppDesc(data, {
        success: {
          func: () => {
            notification.success('应用描述修改成功')
            this.setState({
              editDesc: false,
              desc: data.desc
            })
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            notification.error('应用描述修改失败')
          },
          isAsync: true
        }

      })
    })
  }

  cancelEdit() {
    this.setState({editDesc:false})
    this.props.form.resetFields()
  }

  render() {
    const { children, appName, app, isFetching, location, bindingDomains, bindingIPs } = this.props
    const { activeTabKey, serviceList, availableReplicas, total } = this.state
    if (isFetching || !app) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
   // const status = getAppStatus(serviceList || app.services)
    let updateDate = '-'
    if (app && app.services && app.services[0]) {
      updateDate = app.services[0].metadata.creationTimestamp
    }
    const appDomain = parseAppDomain(app, bindingDomains, bindingIPs)
    const descProps = this.props.form.getFieldProps('desc', {initialValue: this.state.desc || app.description})
    const currentApp = app
    currentApp.name = appName
    return (
      <div id='AppDetail'>
        <Title title={`应用 ${appName} 详情`} />
        <QueueAnim className='demo-content'
          key='demo'
          type='right'
          >
          <div className='cover'></div>
          <div key='ca' className='AppInfo' id='AppInfo'>
            <Card className='topCard'>
              <div className='imgBox'>
                <svg>
                  <use xlinkHref='#app' />
                </svg>
              </div>
              <div className='infoBox'>
                <p className='appTitle'>
                  {appName}
                </p>
                <div className='leftInfo'>
                  <div className='status'>
                    状态：
                    <div style={{ display: 'inline-block', position: 'relative', top: '-5px' }}>
                      <AppStatus
                        app={
                          serviceList
                            ? { services: serviceList }
                            : app
                        }
                        smart={true} />
                    </div>
                  </div>
                  <div className='address appDetailDomain'>
                    <span className='title'>地址：</span>
                    <div className='addressRight'>
                      <TipSvcDomain appDomain={appDomain} parentNode='appDetailDomain' />
                    </div>
                  </div>
                  <div className='service'>
                    服务：
                    {`${availableReplicas} / ${total}`}
                  </div>
                </div>
                <div className='middleInfo'>
                  <div className='createDate'>
                    创建：{formatDate(app.createTime || '')}
                  </div>
                  <div className='updateDate'>
                    更新：{updateDate === '-' ? updateDate : formatDate(updateDate || '')}
                  </div>
                </div>
                <div className='rightInfo'>
                  <Form horizontal>
                    <div className='introduction' style={{ height: '115px'}}>
                    <FormItem hasFeedback style={{ marginBottom: '0px'}}>
                      描述：
                      {this.state.editDesc ? null :
                        <Button size="default" type="ghost" style={{ float: 'right', top: '-8px' }} onClick={() => this.setState({editDesc:true})} disabled={this.state.editDesc}>
                          <Icon type="edit" />编辑
                        </Button>}
                      <br/>
                      <Input
                        type="textarea"
                        placeholder="请输入应用描述"
                        {...descProps}
                        disabled={!this.state.editDesc}/>
                      {this.state.editDesc ?
                        <div className="editInfo">
                          <div style={{ lineHeight: '50px' }} className="text-center">
                            <Button type="ghost" style={{ marginRight: '10px' }} onClick={() => this.cancelEdit()}>取消</Button>
                            <Button type="primary" onClick={() => this.modifyDesc()}>确定</Button>
                          </div>
                        </div>: null}
                    </FormItem>
                    </div>
                  </Form>
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              <div style={{ clear: 'both' }}></div>
            </Card>
            <Card className='bottomCard'>
              <Tabs
                tabPosition='top'
                defaultActiveKey={DEFAULT_TAB}
                onTabClick={this.onTabClick}
                activeKey={activeTabKey}
                >
                <TabPane tab='服务实例' key={DEFAULT_TAB} >
                  <AppServiceList
                    location={location}
                    key='AppServiceList'
                    onServicesChange={this.onServicesChange}
                    appName={appName} />
                </TabPane>
                {/*<TabPane tab='应用拓扑' key='#topology' >应用拓扑</TabPane>*/}
                <TabPane tab='编排文件' key='#stack' >
                  <AppGraph key='AppGraph' cluster={this.props.cluster} appName={appName} /></TabPane>
                <TabPane tab='审计日志' key='#logs' >
                  <AppLog key='AppLog'
                    cluster={this.props.cluster}
                    appName={appName} />
                </TabPane>
                <TabPane tab='监控' key='#monitor' >
                  <AppMonitior
                    cluster={this.props.cluster}
                    appName={appName} />
                </TabPane>
                <TabPane tab="租赁信息" key="#rentalInfo">
                  <AppServiceRental serviceName={appName} serviceDetail={app.services} />
                </TabPane>
                <TabPane tab="告警策略" key="#strategy">
                  <AlarmStrategy appName={appName} cluster={this.props.cluster} currentApp={currentApp}/>
                </TabPane>
                <TabPane tab="拓扑图" key="#topology">
                  <Topology appName={appName} cluster={this.props.cluster} teamspace={this.props.teamspace} />
                </TabPane>
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

AppDetail = createForm()(AppDetail);

AppDetail.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  appName: PropTypes.string.isRequired,
  // app: PropTypes.object.isRequired,
  // isFetching: PropTypes.bool.isRequired,
  loadAppDetail: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { app_name } = props.params
  const { hash, pathname } = props.location
  const { cluster,space } = state.entities.current
  const defaultApp = {
    isFetching: false,
    cluster: cluster.clusterID,
    appName: app_name,
    app: {}
  }
  const {
    appDetail
  } = state.apps
  const { app, isFetching } = appDetail || defaultApp
  return {
    cluster: cluster.clusterID,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
    appName: app_name,
    app,
    isFetching,
    hash,
    pathname,
    teamspace: space.namespace,
    location: props.location
  }
}

export default connect(mapStateToProps, {
  loadAppDetail,
  updateAppDesc,
  loadServiceList
})(AppDetail)
