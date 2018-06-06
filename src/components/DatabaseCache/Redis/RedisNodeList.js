/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Databse Cluster detail
 *
 * v2.0 - 2016-10-11
 * @author Bai Yu
 * @change by Gaojian
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classNames from 'classnames'
import { Table, Button, Icon, Spin, Modal, Collapse, Row, Col, Dropdown, Slider, Timeline, Popover, InputNumber, Tabs, Tooltip, Card, Radio, Select, Form,Input,Menu} from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { MongoDbNodesCluster, MonitorList, MonitorMetricList, ClearNodeList,RdbsAddNodeCluster } from '../../../actions/database_cache'
import { getProxy } from '../../../actions/cluster'
import Monitor from '../MongoDB/NodesMonitor/monitor'
import NotificationHandler from '../../../common/notification_handler'
import mysqlImg from '../../../assets/img/database_cache/mysql.png'
import redisImg from '../../../assets/img/database_cache/redis.jpg'
import zkImg from '../../../assets/img/database_cache/zookeeper.jpg'
import esImg from '../../../assets/img/database_cache/elasticsearch.jpg'
import etcdImg from '../../../assets/img/database_cache/etcd.jpg'
import '../style/ModalDetail.less'
import ReactEcharts from 'echarts-for-react'
const FormItem = Form.Item;
const Option = Select.Option;
const Panel = Collapse.Panel;
const ButtonGroup = Button.Group
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

class NodeList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      monitoring: '',
      meterSet: '',
      monitorMetricList: '',
      plainOptions :false,
      selectedRowKeys:[],
      isDisabled:'1',
    }
    this.monitoringChange = this.monitoringChange.bind(this),
    this.handleMenuClickNode = this.handleMenuClickNode.bind(this)

  }
  getNodeList(){
    const { scope, isCurrentTab, MongoDbNodesCluster } = this.props;
    const { currentData, cluster } = scope.props;
    MongoDbNodesCluster(cluster, 'caches', currentData.cacheId,{
      success: {
        func: (result) => {
          clearInterval(scope.nodeListInterval)
          scope.nodeListInterval = setInterval(function(){
            MongoDbNodesCluster(cluster, 'caches', currentData.cacheId)
          },5000)
        }
      }
    })
  }
  componentWillMount() {
    this.getNodeList();
  }

    componentWillUnmount(){
        this.props.scope.clearTime()
    }
  componentWillReceiveProps(nextProps) {
    const { scope, MongoDbNodesCluster, ClearNodeList, detailModal } = this.props;
    if (!detailModal) {
      this.setState({
        monitoring: ''
      })
    }
    if (!(this.props.isCurrentTab === false && nextProps.isCurrentTab === true)) {
      return
    }
    const { currentData, cluster } = scope.props;
    this.setState({
      selectedRowKeys:[],
      selectedRows:[]
    })
    this.getNodeList();
  }
  monitoringChange(value, record, index) {
    const _this = this
    const { scope, databaseList, MonitorMetricList, MonitorList, currentData } = this.props;
    const { cluster } = scope.props;
    if (databaseList && databaseList.data) {
      MonitorList(cluster, 'caches', databaseList.data.cacheNodeSet[index].cacheNodeId, this.state.step, '', '', this.state.interval, '', currentData.cacheType)
      MonitorMetricList(cluster, 'caches', databaseList.data.cacheNodeSet[index].cacheNodeId, 'stats',  this.state.step, '', '', this.state.interval, '', currentData.cacheType)
      this.setState({
        monitoring: value,
      })
    }
  }
  nodedMonitorRender(nodesMonitorList) {
    if (!nodesMonitorList || nodesMonitorList == [] || !nodesMonitorList.meterSet) {
      return null
    }
    return nodesMonitorList.meterSet.map((item, index) => {
      if (item.dataSet == null) {
        return false
      } else {
        return <Monitor meterId={item.meterId} key={index} data={item} />
      }
    })
  }

  nodeMetricRender(monitorMetricList) {
    if (!monitorMetricList || monitorMetricList == [] || !monitorMetricList.meterSet || monitorMetricList.meterSet[0] == undefined) {
      return null
    }
    return monitorMetricList.meterSet[0].dataSet.map((item, index) => {
      if (item.data == null) {
        return false
      } else {
        return <Monitor meterId={item.meterId} key={index} data={item} />
      }
    })
  }

  showModal = (e) => { 
    let _this = this;
    _this.setState({
      visible: true,
    });
  }
  onClickvalue = (step,interval,isDisabled)=>{
    const styleu = {}
    this.state.step = step
    this.state.isDisabled = isDisabled
    this.state.interval = interval
    const _this= this;
    this.setState({
      monitoring: ''
  })
}
  handleOk() {
    const _this = this;
    // 接收 父模块传输的值
    const { RdbsAddNodeCluster} = this.props;
    const {scope,cluster}= this.props
    const { MongoDbNodesCluster } = this.props;
    this.props.form.validateFields((errors, values) => {
        if (!!errors) {
            return;
        }
        let notification = new NotificationHandler()
      let parameters = [];
      let _this = this;
      for (let key in values) {
        let object = {};

        object[key] = values[key];
        parameters.push(object)
      }
        const body = {
          nodecount: values.addnode,
          cluster:cluster,
        }

        // ApiURI/api/v2/clusters/:cluster/caches/:cache/nodes?nodecount=1 Method: POST
        // clusters/CID-ca4135da3326/redis/c-5wh7ak01/nodes?page=0&size=100&_=hKscwB
        RdbsAddNodeCluster(body.cluster,'caches',this.props.currentData.cacheId,body.nodecount ,{
            success: {
                func: ()=> {
                    notification.success('创建成功')
                    _this.getNodeList();
                    this.setState({
                      visible: false,
                    }); 
                },
                isAsync: true
            },
            failed: {
                func: (res)=> {
                    notification.error(res.message)
                }
            },
            finally: {
                func:()=> {
                    this.setState({loading: false})
                }
            }
        });
    })
  }
  handleCancel(e) {
    this.setState({
      visible: false,
    });
  }
  handleMenuClickNode(e) {
    const { cluster, currentData, MongoDbNodesCluster,scope } = this.props
    const { deleteNodeBackupList } = scope.props
    let notification = new NotificationHandler()
    let _this = this;
    switch (e.key) {
      case 'delete':
        this.state.selectedRows.map((item, index) => {
          deleteNodeBackupList(cluster, 'caches', item.cacheId, item.cacheNodeId, {
            success: {
              func: (res) => {
                notification.success('删除成功')
                this.setState({
                  selectedRowKeys:[],
                  selectedRows:[]
                })
                _this.getNodeList();
              },
              isAsync: true
            }
          })
       })
       break;
     default:
       return
   }
 }
  render() {
    const _this =this
    const { scope, databaseList } = this.props;
    const dataSource = databaseList && databaseList.data ? databaseList.data.cacheNodeSet : [];
    const { nodesMonitorList, monitorMetricList } = scope.props;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
    const columns = [{
      title: '节点ID',
      dataIndex: 'cacheNodeId',
      key: 'cacheNodeId',
      render: (text, record, index) => {
        return <span>{record.cacheRole == "master" ? <span style={{ 'color': "#2db7f5" }}>{text} (主节点)</span> : text}</span>
      }
    }, {
      title: '名称',
      dataIndex: 'cacheNodeName',
      key: 'cacheNodeName',
    }, {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text, record, index) => {
        return <span>{record.transitionStatus == ''?
                (record.status == 'active' ?
                <span className='normal'><i className="fa fa-circle"></i> 活跃 </span>:
                (record.status == 'stopped' ?
                <span className='transition'><i className="fa fa-circle"></i> 已关闭 </span>:
                (record.status == 'suspended' ?
                <span className='normal'><i className="fa fa-circle"></i> 已暂停 </span>
                :null)))
                :
                (record.transitionStatus == 'starting' ?<span className='transition'><i className="fa fa-circle"></i> 启动中...</span>:
                  (record.transitionStatus == 'stopping' ?<span className='transition'><i className="fa fa-circle"></i> 关闭中...</span>:
                    (record.transitionStatus == 'restarting' ?<span className='transition'><i className="fa fa-circle"></i> 重启中...</span>:
                      (record.transitionStatus == 'resizing' ?<span className='transition'><i className="fa fa-circle"></i> 扩容中...</span>:
                        (record.transitionStatus == 'creating' ?<span className='transition'><i className="fa fa-circle"></i> 创建中...</span>:
                          (record.transitionStatus == 'deleting' ?<span className='transition'><i className="fa fa-circle"></i> 删除中...</span>:
                                  (record.transitionStatus == 'snapshot-creating' ?<span className='transition'><i className="fa fa-circle"></i> 备份创建中...</span>:
                                          (record.transitionStatus == 'updating' ?<span className='transition'><i className="fa fa-circle"></i> 更新中...</span>:null)
                                  )
                          )
                        )
                      )
                    )
                  )
                )
                }
              </span>
      }
    }, {
      title: 'IP',
      dataIndex: 'privateIp',
      key: 'privateIp',
    }, {
      title: '告警状态',
      dataIndex: 'alarmStatus',
      key: 'alarmStatus',
      render: (text, record, index) => <span>{text ? text : <i style={{ 'color': '#bbb' }}>无监控</i>}</span>
    }, {
      title: '监控',
      dataIndex: 'cacheNodeId',
      key: 'monitoring',
      render: (text, record, index) => {
        return <span>
          {this.state.monitoring == text ?
            <span style={{ 'color': "#5cb85c" }}>监控中...</span>
            :
            <Button onClick={() => this.monitoringChange(text, record, index)}>查看</Button >}
        </span>
      }
    }];
    const  addNodalPoint = getFieldProps('node_count', { 
      initialValue: 0
    })
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange(selectedRowKeys,selectedRows) {
        _this.setState({
          selectedRowKeys,
          selectedRows
        })
      }
    };

    const menu = (
      <Menu onClick={this.handleMenuClickNode}>
        <Menu.Item disabled={_this.state.selectedRowKeys.length == 0 ? true : false} key="delete">删除</Menu.Item>
      </Menu>
    );

    return <div className='modalDetailBox' id="dbClusterDetailInfo">
      
        <div className='configContent' style={{ padding: 0,textAlign:'right' }}>
        <div style ={{float:'left'}}>
        <Button type="primary" onClick={this.showModal.bind(this)} style={{ marginBottom:'5px',margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>添加节点</Button>
        <Dropdown overlay={menu} trigger={['click']}>
            <Button type="primary" style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>
              更多操作 <Icon type="down" />
          </Button>
        </Dropdown>
        </div>
        监控周期：
        <Button type="primary" disabled={this.state.isDisabled == 1 ? true :false} onClick= {this.onClickvalue.bind(this,'5m','10s','1')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>实时</Button>
        <Button type="primary"disabled={this.state.isDisabled == 2 ? true :false} onClick= {this.onClickvalue.bind(this,'5m','6h','2')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>6小时</Button>
        <Button type="primary" disabled={this.state.isDisabled == 3 ? true :false} onClick= {this.onClickvalue.bind(this,'15m','1d','3')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>1天</Button>
        <Button type="primary" disabled={this.state.isDisabled == 5 ? true :false} onClick= {this.onClickvalue.bind(this,'1d','1m','5')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>1月</Button>
        <Button type="primary" disabled={this.state.isDisabled == 6 ? true :false} onClick= {this.onClickvalue.bind(this,'1d','6m','6')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>6月</Button>
        </div>
      <Modal title="新增节点" visible={this.state.visible}
        onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}
      >
        <div className='commonBox'>
          <div className='title'>
            <span>节点数量</span>
          </div>
          <div className='radioBox'>
            <Col span={4}>
              {/* <Input /> */}
              <InputNumber disabled {...getFieldProps('addnode', {
              rules: [
                  {required: true, message: '请输入有效数字'}
              ],
              initialValue: 1} )} size='large'   style={{ width: '180px', paddingRight:'28px'}}  />
            </Col>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      </Modal>
      <div className='configContent' style={{ padding: '0px' }}>
        <Table style={{ padding: '0px' }} rowSelection={rowSelection} pagination={false} indentSize={10} dataSource={dataSource} columns={columns} />
        {
          this.state.monitoring ?
            <div>
              <div>
                {this.nodedMonitorRender(nodesMonitorList)}
              </div>
              <div>
                {this.nodeMetricRender(monitorMetricList)}
              </div>
            </div>
            : ''
        }
      </div>
    </div>
  }
}


function mapStateToProps(state, props) {
  const { cluster } = state.entities.current;

  const defaultRedisList = {
    cluster: cluster.clusterID,
    database: 'redis',
    databaseList: [],
    databaseConfigList: [],
    datamonitorList: []
  }
  const { databaseAllNodesList, databaseMonitorMetricList, databaseMonitorList } = state.databaseCache;
  const { databaseList } = databaseAllNodesList.caches || defaultRedisList;
  const { nodesMonitorList } = databaseMonitorList.caches || defaultRedisList;
  const { monitorMetricList } = databaseMonitorMetricList.caches || defaultRedisList


  return {
    cluster: cluster.clusterID,
    database,
    databaseList,
    nodesMonitorList: nodesMonitorList,
    monitorMetricList
  }
}

NodeList.PropTypes = {
  intl: PropTypes.object.isRequired,
  MongoDbNodesCluster: PropTypes.func.isRequired,
  MonitorList: PropTypes.func.isRequired,
  MonitorMetricList: PropTypes.func.isRequired,
  RdbsAddNodeCluster:PropTypes.func.isRequired,
}

NodeList = Form.create()(NodeList, {
  withRef: true,
})

export default connect(mapStateToProps, {
  MongoDbNodesCluster,
  MonitorList,
  MonitorMetricList,
  ClearNodeList,
  RdbsAddNodeCluster,
})(NodeList)
