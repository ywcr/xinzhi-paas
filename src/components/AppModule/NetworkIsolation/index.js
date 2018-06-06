/**
 * Licensed Materials - Property of enncloud.com
 * (C) Copyright 2017 ennCloud. All Rights Reserved.
 */

/**
 * Create app: ports configure for Network isolation
 *
 * v0.1 - 2017-12-11
 * @author Zhanghy
 */

import React, { Component } from 'react'
import { Button, Modal, Switch, Form, Table, Menu, Link, Row, Col, Icon } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { browserHistory } from 'react-router'
import './style/index.less'

import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import Title from '../../Title'
// import AddPort from './AddPort'
import { loadAllServices } from '../../../actions/services'
import CreateApp from './CreatePrivateTemplate'
import Createcurrent from './CreatePrivateTemplateCurrent'
import NetworkAllow from '../../../assets/img/app/networkAllow.png'
import NetworkForbid from '../../../assets/img/app/networkForbid.png'
import NotificationHandler from '../../../common/notification_handler'
import { getNetworkIsolationStatus, getActionStatus, postNetworkIsolation, deleteNetworkIsolation, getIngress } from '../../../actions/app_manage'
import { SEND_INVITATIONS_FAILURE } from '../../../actions/alert';
import { serviceBindDomain } from '../../../actions/services';
const notification = new NotificationHandler()
class NetworkIsolation extends Component {
  constructor(props) {
    super(props)
    this.openSetNetwordModal = this.openSetNetwordModal.bind(this)
    this.getNetworkIsolation = this.getNetworkIsolation.bind(this)
    this.showCreate = this.showCreate.bind(this)
    this.getIngressList = this.getIngressList.bind(this)
    this.patchCreate = this.patchCreate.bind(this)
    this.deleteCreate = this.deleteCreate.bind(this)
    this.expandedRowRenders = this.expandedRowRenders.bind(this)
    this.showCurRowMessage = this.showCurRowMessage.bind(this);
    this.onChangelist = this.onChangelist.bind(this)
    // this.loadDataServices= this.loadDataServices.bind(this)
    this.state = {
      setNetworkVisible: false,
      confirmLoading: false,
      allow: false,
      action: 'allow',
      loading: false,
      selectedRows: [],
      selectedRowKeys: [], // Check here to configure the default column
      keys: [],
      list: [],
      datList: [],
      status: 'unset',
      // selectedRowKeys: [], // Check here to configure the default column
      loading: false,
      namespaceList: '',
      nameSpace: '',
      servicesList: [],
      clusterId: ''

    }
  }

  componentWillMount() {
    this.getNetworkIsolation()
    this.getIngressList()
    this.loadData()
  }
  componentWillReceiveProps(nextProps) {
    const { clusterID, namespace } = nextProps
    this.getNetworkIsolation(clusterID, namespace)
    this.getIngressList(clusterID, namespace)
    this.setState({
      nameSpace: namespace,
      clusterId: clusterID
    })
  }
  showCreate() {
    this.setState({
      createTemplate: true,
      // ModalKey:modalKey
    })
    this.loadData()
  }
  loadData() {
    const { clusterID, loadAllServices, namespace } = this.props
    const selt = this
    let cluster = selt.state.clusterId ? selt.state.clusterId : clusterID
    let nameSpace = selt.state.nameSpace ? selt.state.nameSpace : namespace
    let size = 0
    const query = { size, nameSpace }
    loadAllServices(cluster, query, {
      success: {
        func: (result) => {
          let { services } = result.data
          selt.setState({
            servicesList: services
          })
        },
        isAsync: true
      }
    })

  }
  patchCreate() {
    this.setState({
      createTemplatecurrent: true
    })
  }
  start = () => {
    this.setState({ loading: true });
    // ajax request after empty completing
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }, 3000);
  }
  getNetworkIsolation(cluster, nameSpace) {
    const { getNetworkIsolationStatus, clusterID, namespace, deleteNetworkIsolation, Token, UserName } = this.props
    let clusterStatus = cluster ? cluster : clusterID
    let namespaceStatus = nameSpace ? nameSpace : namespace
    let body = {
      clusterStatus,
      namespaceStatus,
      Token,
      UserName
    }
    const _this = this
    getNetworkIsolationStatus(body).then(function (res) {
      if (!res) {
        notification.success('没有网络策略')
      } else if (res) {
        _this.setState({
          action: res.response.result.action,
          allow: true
        })
      }
    })
  }
  getIngressList(cluster, nameSpace) {
    const { getIngress, clusterID, namespace, deleteNetworkIsolation, Token, UserName } = this.props
    let clusterStatus = cluster ? cluster : clusterID
    let namespaceStatus = nameSpace ? nameSpace : namespace
    let body = {
      clusterStatus,
      namespaceStatus,
      Token,
      UserName
    }
    const _this = this
    // return false
    getIngress(body).then(function (res) {
      if (res.response.result.data == null) {
        notification.success('没有网络策略')
        _this.setState({
          datList: ''
        })
        // return false
      } else if (res.response.result) {
        _this.setState({
          allow: true,
          datList: res.response.result.data
        })
      }
    })
  }
  deleteCreate() {
    const { deleteNetworkIsolation, clusterID } = this.props
    let name = this.state.selectedRowList[0].name
    const _this = this
    let body = {
      clusterID,
      name
    }
    deleteNetworkIsolation(body).then(function (res) {
      if (res.response.result.data == 'OK') {
        _this.setState({ loading: true });
        // ajax request after empty completing
        setTimeout(() => {
          _this.setState({
            selectedRowKeys: [],
            loading: false,
          });
        }, 100);
        notification.success('删除网络隔离成功')

        _this.getIngressList()
      }
    })
  }
  openSetNetwordModal() {
    const { networkPolicySupported } = this.props
    this.setState({
      setNetworkVisible: true,
      confirmLoading: false,
    })
  }
  openSetNetwordingress = (e) => {
    let _this = this
    if (e == true) {
      _this.setState({
        status: true,
        action: 'allow'
      })
    } else if (e == false) {
      _this.setState({
        status: false,
        action: 'deny'
      })
    }
    const { postNetworkIsolation, clusterID, namespace, Token, UserName } = this.props
    let postBody = {
      clusterID,
      namespace,
      Token,
      body: {
        action: this.state.status == true ? 'allow' : 'deny'
      }
    }
    // postNetworkIsolation(postBody,clusterID,namespace,Token,UserName).then
    postNetworkIsolation(postBody, clusterID, namespace, Token, UserName).then(function (res) {
      if (res.response.result.data == null) {
        notification.success('没有网络策略')
        return false
      } else if (res) {
        _this.setState({
          action: res.response.result.data.data.metadata.labels.action,
          allow: true,
          setNetworkVisible: false,
        }, function () {
        })
      }
    })
  }
  onExpandedRowsChange(expandedRows) {
    var a = [];
    if (expandedRows.length !== 0) {
      a.push(expandedRows[expandedRows.length - 1]);
    }
    this.setState({ a });
  }
  showCurRowMessage(record) {

    // alert("key:"+record.key + " name:"+record + " age:" + record.age + " address:" + record.address + " description:" + record.description);
    return <a href="#" name="delete" >{record[0].name}</a>
  }
  onChangelist(selectedRowKeys, selectedRows) {
  }

  expandedRowRenders(record) {
    const Listfrom = []
    let key
    for (key in record.ingress[0].from) {
      Listfrom.push(record.ingress[0].from[key])
    }
    const Listport = []
    for (key in record.ingress[0].port) {
      Listport.push(record.ingress[0].port[key])
    }
    Listfrom.map((item) => {
    })
    Listport.map((item) => {
    })
  }
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRowList: selectedRows, });
  }
  render() {
    const scope = this
    const { datList, selectedRowKeys, status, loading, action } = this.state
    let self = this;
    const dateList = []
    let key
    for (key in datList) {
      dateList.push(datList[key])
    }
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type'
      },
      {
        title: '状态',
        dataIndex: 'icon',
        key: 'icon',
        render: (text, row, index) => {
          return (
            <div style={{ color: '#33b867' }}>启用</div>
          )
        }
      },
      // action
      {
        title: '动作',
        dataIndex: 'action',
        key: 'action',
        render: (text, row, index) => {
          return (
            <div style={{ color: '#33b867' }}>allow</div>
          )
        }
      },
      {
        title: '来源',
        dataIndex: 'from',
        key: 'from',
        render: (text, row, index) => {

          return (
            <div style={{ color: '#33b867' }}>{row.ingress[0].from.length}</div>
          )
        }
      },
      {
        title: '端口',
        dataIndex: 'port',
        key: 'port',
        render: (text, row, index) => {
          return (
            <div style={{ color: '#33b867' }}>{row.ingress[0].port.length}</div>
          )
        }
      },
    ];
    const _this = this
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,

    };
    const hasSelected = selectedRowKeys.length == 1;
    return (
      <QueueAnim>

        <Modal visible={this.state.createTemplate}
          className='CreateDatabaseModal' maskClosable={false} width={800}
          title='添加网络隔离'
          key={this.state.modalKey}
          onCancel={() => { this.setState({ createTemplate: false }) }}
        >
          <CreateApp servicesList={this.state.servicesList} key={scope} scope={scope} namespaceList={this.state.namespaceList} createTemplate={this.state.createTemplate} getIngressList={this.getIngressList} />
        </Modal>
        <Modal visible={this.state.createTemplatecurrent}
          className='CreateDatabaseModal' maskClosable={false} width={800}
          title='修改网络隔离'
          key={this.state.modalKey}
          onCancel={() => { this.setState({ createTemplatecurrent: false }) }}
        >
          <Createcurrent scope={scope} selectedRowList={this.state.selectedRowList} createTemplatecurrent={this.state.createTemplatecurrent} getIngressList={this.getIngressList} />
        </Modal>
        <Title title="网络隔离" />
        <div id='network_isolation' key="network_isolation">
          <div>
            <div className='ant-tabs-content'>


              <div className='topCreateButton'>
                {/* <Button type="primary" size="large" onClick={this.openSetNetwordModal}><span>开启默认网络隔离</span></Button> */}
                {/* 默认策略<Switch size="default" checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} checked={this.state.action == 'allow' ? true : false} onChange={this.openSetNetwordingress} /> */}
                默认允许 <Switch size="default" width="100px" checkedChildren="是" unCheckedChildren="否" checked={this.state.action == 'allow' ? true : false} onChange={this.openSetNetwordingress} />
                <Button style={{ margin: '5' }} onClick={this.showCreate} className='createButton' type='primary'>添加网络隔离</Button>
                <Button style={{ margin: '5' }} onClick={this.patchCreate} className='createButton' type='primary' disabled={!hasSelected}  >修改</Button>
                <Button style={{ margin: '5' }} onClick={this.deleteCreate} className='createButton' type='primary' disabled={!hasSelected}  >删除</Button>
              </div>
            </div>

            <div className='ant-card appBox ant-card-bordered'>
              <Table
                //  onChange = {this.onChangelist}
                rowSelection={rowSelection}
                columns={columns}
                dataSource={this.state.datList ? dateList : ''}
                expandedRowRender={
                  (record) => {
                    let recorddate = record.ingress
                    for (var value of recorddate) {
                      var portdata = value.port.map((item) => {

                        return <div >
                          <Row style={{ backgroundColor: '#fff', height: '30px', lineHeight: '30px' }}>
                            <Col style={{ textAlign: 'center', fontSize: "12px" }} span={12}>{item.protocol} </Col>
                            <Col style={{ textAlign: 'center', borderLeft: '1px solid #ccc', fontSize: "12px" }} span={12}>{item.port} </Col>
                          </Row>

                        </div>
                      })
                      var fromdata = value.from.map((item) => {
                        return <div>
                          <Row style={{ backgroundColor: '#EEE', height: '30px', lineHeight: '30px' }}>
                            <Col style={{ textAlign: 'center', fontSize: "12px" }} span={12}>{item.type == "pod" ? '容器' : (item.type == 'service' ? '服务' : '空间')} </Col>
                            <Col style={{ textAlign: 'center', borderLeft: '1px solid #ccc', fontSize: "12px" }} span={12}>{item.value} </Col>
                          </Row>
                        </div>
                      })
                      return <div style={{backgroundColor:"#ccc"}}>
                        <Row type="flex" justify="space-around" align="middle" >

                          <Col span={12} style={{ textAlign: 'center', backgroundColor: '#F5FFFA', borderRight: '1px solid #ccc', height: '30px', lineHeight: '30px', fontSize: '16px' }}><span style={{ color: '#000' }}>访问来源</span></Col>
                          <Col span={12} style={{ textAlign: 'center', backgroundColor: '#E0FFFF', height: '30px', lineHeight: '30px', fontSize: '16px' }}>目标端口</Col>
                        </Row>
                        <Row type="flex" justify="space-around" align="middle">
                          <Col span={6} style={{ textAlign: 'center', backgroundColor: '#eee', fontSize: '14px' }}>类型</Col>
                          <Col span={6} style={{ textAlign: 'center', backgroundColor: '#eee', borderRight: '1px solid #ccc', fontSize: '14px' }}>名称</Col>
                          <Col span={6} style={{ textAlign: 'center', backgroundColor: '#fff', fontSize: '14px' }}>协议</Col>
                          <Col span={6} style={{ textAlign: 'center', backgroundColor: '#fff', fontSize: '14px' }}>端口</Col>
                        </Row>
                        <hr />
                        <Row type="flex" justify="space-around" align="middle" style={{ backgroundColor: '#fff' }}>
                          <Col style={{ borderRight: '1px solid #ccc',backgroundColor:"#ccc" }} span={12}>{fromdata}</Col>
                          <Col span={12}>{portdata}</Col>

                        </Row>
                      </div>

                    }
                  }


                }
              />

            </div>
          </div>

          <div >

          </div>
          <Modal
            title={<span>开启默认网络隔离</span>}
            visible={this.state.setNetworkVisible}
            closable={true}
            onOk={this.openSetNetwordingress.bind(this, true)}
            onCancel={() => this.setState({ setNetworkVisible: false })}
            maskClosable={false}
            confirmLoading={this.state.confirmLoading}
            wrapClassName="set_network_isolation"
          >
            <div className='content'>
              <i className="fa fa-exclamation-triangle warning_icon" aria-hidden="true"></i>
              <div> 确认开启网络隔离？
                  </div>
            </div>
          </Modal>
        </div>
      </QueueAnim>

    )
  }
}

function mapStateToProp(state, props) {
  const { entities } = state
  let networkPolicySupported = false
  let clusterID
  let namespace
  let Token
  let UserName
  if (entities.current && entities.current.cluster) {
    networkPolicySupported = entities.current.cluster.networkPolicySupported
    clusterID = entities.current.cluster.clusterID
  }
  if (entities.current && entities.current.space) {
    namespace = entities.current.space.namespace
  }
  if (entities.current && entities.current.space) {
    Token = entities.loginUser.info.token
  }
  if (entities.current && entities.current.space) {
    UserName = entities.loginUser.info.userName
  }
  return {
    networkPolicySupported,
    clusterID,
    namespace,
    Token,
    UserName
  }
}

export default connect(mapStateToProp, {
  getNetworkIsolationStatus,
  postNetworkIsolation,
  getIngress,
  loadAllServices,
  getActionStatus,
  deleteNetworkIsolation,
})(NetworkIsolation)