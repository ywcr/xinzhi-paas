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
import { Table, Button, Icon, Spin, Menu,Modal, Collapse, Row, Col, Dropdown, Slider, Timeline, Popover, InputNumber, Tabs, Tooltip, Card, Radio, Select, Form} from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { deleteDatabaseRedis,fetch_backup_list,deleteBackupList, putDbClusterDetail, loadDbCacheRedisList,MongoDbNodesCluster,MonitorList,MonitorMetricList,ClearNodeList,deleteNodeBackupList } from '../../../actions/database_cache'
import { getProxy } from '../../../actions/cluster'
import { calcuDate,formatDate} from '../../../common/tools.js'
import Monitor from '../MongoDB/NodesMonitor/monitor'
import NotificationHandler from '../../../common/notification_handler'
import RedisNodeList from './RedisNodeList.js'
import '../style/ModalDetail.less'
import moment from 'moment'

import mysqlImg from '../../../assets/img/database_cache/mysql.png'
import redisImg from '../../../assets/img/database_cache/redis.jpg'
import zkImg from '../../../assets/img/database_cache/zookeeper.jpg'
import esImg from '../../../assets/img/database_cache/elasticsearch.jpg'
import etcdImg from '../../../assets/img/database_cache/etcd.jpg'
import ReactEcharts from 'echarts-for-react'
import memcachedImg from '../../../assets/img/database_cache/memcached.png'

const Option = Select.Option;
const Panel = Collapse.Panel;
const ButtonGroup = Button.Group
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

class BaseInfo extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
  }
  render() {
    var AutomaticArray = {
      '-1':'关闭'
    }
    const Automatic = function(){
      for (let i = 0; i < 24; i++) {
        AutomaticArray[i] = i+':00-'+(i+1)+':00'
      }
    }
    Automatic()
    const {currentData} = this.props;
    return <div className='modalDetailBox' id="dbClusterDetailInfo">
        <div className='configContent'>
          <div>
            <ul className='parse-list'>
              <li><span className='key'>ID：</span> <span className='value' style={{color: '#2db7f5'}}>{currentData.cacheId}</span></li>
              <li><span className='key'>名称：</span> <span className='value'>{currentData.cacheName}</span></li>
              <li><span className='key'>标签：</span> <span className='value'>{currentData.tags[0].tagName}</span></li>
              <li><span className='key'>描述：</span> <span className='value'>{currentData.description?currentData.description:'暂无描述'}</span></li>
              <li><span className='key'>版本：</span> <span className='value'>{currentData.cacheType}</span></li>
              <li><span className='key'>节点(组)数量：</span> <span className='value'>{currentData.nodeCount}</span></li>
              <li><span className='key'>内存：</span> <span className='value'>{currentData.cacheSize}GB</span></li>
              <li><span className='key'>类型：</span> <span className='value'>{currentData.cacheClass == 0?'性能型':'高性能型'}</span></li>
              <li><span className='key'>配置组：</span> <span className='value' style={{color: '#2db7f5'}}>{currentData.cacheParameterGroupId}</span></li>
              <li><span className='key'>自动备份：</span> <span className='value'>{AutomaticArray[currentData.autoBackupTime]}</span></li>
              <li><span className='key'>创建时间：</span> <span className='value'>{formatDate(currentData.createTime)}</span></li>
              <li><span className='key'>创建于</span> <span className='value'>{calcuDate(currentData.createTime)}</span></li>
              
            </ul>
          </div>
        </div>
      </div>
  }
}


class ModalDetail extends Component {
  constructor(props) {
    super(props)
    const {activeKey}=this.props;
    this.state = {
      delModal:false,
      deleteBtn:false,
      detailModal:false,
      activeKey
    }
  }
  componentWillMount() {
  }

  clearTime(){
      clearInterval(this.nodeListInterval)
      clearInterval(this.loadStatusTimeout)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.activeKey  !=  nextProps.activeKey) {
      this.clearTime()
    }
  }

    componentWillUnmount(){
        this.clearTime()
    }
  deleteRedis(){
    const {currentData, cluster,database,deleteDatabaseRedis,scope} = this.props;
    const { loadDbCacheRedisList } = scope.props;

    const _this = this;
    let notification = new NotificationHandler()
    _this.setState({ deleteBtn: true })
    deleteDatabaseRedis(cluster , currentData.cacheId ,'caches',{
      success: {
        func: () => {
          // notification.success('删除成功')
          scope.setState({
            detailModal: false,
          });
          _this.setState({deleteBtn: false,delModal:false})
        }
      },
      failed: {
        func: (res) => {
          scope.setState({
            detailModal: false,
          });
          _this.setState({deleteBtn: false,delModal:false})
          notification.errorr('删除失败', res.message)
        }
      }
    });
  }
  changeTab(activeKey) {
      this.clearTime()
      const { scope } = this.props;
      scope.setState({ activeKey });
      scope.props.ClearNodeList('caches');
  }

  render() {
    const {scope,currentData, cluster,databaseList,activeKey,detailModal} = this.props;
    return (
      <div id='AppServiceDetail' className="dbServiceDetail">
        <div className='topBox'>
          <Icon className='closeBtn' type='cross' onClick={() => { scope.setState({ detailModal: false });scope.props.ClearNodeList('caches'); this.changeTab('#BaseInfo') } }/>
          <div className='imgBox'>
          {currentData.cacheType =='memcached1.4.13'?<img src={memcachedImg} />:<img src={redisImg} />}
          </div>
          <div className='infoBox'>
            <p className='instanceName'>
                {currentData.cacheName}
            </p>
            <div className='leftBox TenxStatus'>
              <div className="desc">ID / {currentData.cacheId}</div>
              <div> 状态：
                {currentData.transitionStatus == ''?
                  (currentData.status == 'active' ?
                  <span className='normal'><i className="fa fa-circle"></i> 活跃 </span>:
                  (currentData.status == 'stopped' ?
                  <span className='error'><i className="fa fa-circle"></i> 已关闭 </span>:
                  (currentData.status == 'suspended' ?
                  <span className='errorr'><i className="fa fa-circle"></i> 已暂停 </span>
                  :null)))
                  :
                  (currentData.transitionStatus == 'starting' ?<span className=' warning'><i className="fa fa-circle"></i> 启动中...</span>:
                    (currentData.transitionStatus == 'stopping' ?<span className=' warning'><i className="fa fa-circle"></i> 关闭中...</span>:
                      (currentData.transitionStatus == 'restarting' ?<span className=' warning'><i className="fa fa-circle"></i> 重启中...</span>:
                        (currentData.transitionStatus == 'resizing' ?<span className=' warning'><i className="fa fa-circle"></i> 扩容中...</span>:
                          (currentData.transitionStatus == 'creating' ?<span className=' warning'><i className="fa fa-circle"></i> 创建中...</span>:
                            (currentData.transitionStatus == 'deleting' ?<span className='warning'><i className="fa fa-circle"></i> 删除中...</span>:
                                    (currentData.transitionStatus == 'snapshot-creating' ?<span className='normal transition'><i className="fa fa-circle"></i> 备份创建中...</span>:
                                            (currentData.transitionStatus == 'updating' ?<span className='normal transition'><i className="fa fa-circle"></i> 更新中...</span>:null)
                                    )
                            )
                          )
                        )
                      )
                    )
                  )
                  }
              </div>

            </div>
            <div className='rightBox'>
              <div className='li'>
                {this.state.deleteBtn? 
                  <Button size='large' className='btn-danger' type='ghost' loading={true}>
                    删除集群
                  </Button>:
                  <Button   disabled={currentData.transitionStatus == ''?false:true}  size='large' className='btn-danger' type='ghost' onClick={()=> this.setState({delModal: true}) }>
                      <Icon type='delete' />删除集群
                  </Button>
                }
              </div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <Modal title="删除集群操作" visible={this.state.delModal}
          onOk={()=> this.deleteRedis()} onCancel={()=> this.setState({delModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除数据库 { currentData.cacheId }?</div>
        </Modal>
        <div className='bottomBox'>
          <div className='siderBox'>
            <Tabs
              tabPosition='left' onChange={this.changeTab.bind(this)} activeKey={activeKey}
              >
              <TabPane tab='基础信息' key='#BaseInfo'>
                <BaseInfo currentData={currentData}/>
              </TabPane>
              <TabPane tab='节点列表' disabled={currentData.transitionStatus == '' ?false:true} key='#NodeList'>
                <RedisNodeList cluster={cluster} detailModal={detailModal} isCurrentTab={activeKey==='#NodeList'} currentData={currentData} scope= {this} />
              </TabPane>
              <TabPane tab="备份" key='#watching'>
                <CreateBackup currentData={currentData} isCurrentTab={activeKey==='#watching'} scope= {this}/>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }
}



/*==================备份=====================*/
class CreateBackup extends Component{
    constructor(props){
        super(props)
        this.state={
            monitoring:'',
            selectedRowKeys:[],
        }
        this.handleMenuClick=this.handleMenuClick.bind(this)
    }
    getBackUpListStatus() {
      const { scope } = this.props;
      const { currentData, cluster,fetch_backup_list } = scope.props;
      fetch_backup_list(cluster, currentData.cacheId,{
        success: {
          func: (result) => {
            clearInterval(scope.loadStatusTimeout)
            scope.loadStatusTimeout=setInterval(function(){
              fetch_backup_list(cluster, currentData.cacheId)
            },5000)
          }
        }
      })
    }
    componentWillMount() {
        this.getBackUpListStatus()
    }
    refreshBackUpList = () => {
        clearInterval(this.props.scope.loadStatusTimeout)
        this.getBackUpListStatus()
    }
    componentWillReceiveProps(nextProps) {
        if (!(this.props.isCurrentTab === false && nextProps.isCurrentTab === true)) {
            return
        }
        this.setState({
            selectedRowKeys:[],
            selectedRows:[]
        })
        this.getBackUpListStatus()
    }


    componentWillUnmount(){
        this.props.scope.clearTime()
    }

    CreateBackup=()=>{
        const {scope}=this.props.scope.props
        scope.setState({
            backupModalShow:true
        })
    }

    handleMenuClick(e){
        const {deleteBackupList,cluster,currentData,fetch_backup_list}=this.props.scope.props
        let notification = new NotificationHandler()
        let _this = this;
        switch(e.key){
            case 'delete':
                this.state.selectedRows.map((item,index)=>{
                    deleteBackupList(cluster,item.snapshotId,{
                        success: {
                            func: (res)=> {
                                notification.success('删除成功')
                                this.setState({
                                    selectedRowKeys:[],
                                    selectedRows:[]
                                })
                                _this.getBackUpListStatus()
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

    render(){
        const {getBackUpList}=this.props.scope.props
        const {currentData}=this.props
        const _this=this;
        let backupList=[]
        if(getBackUpList&&getBackUpList.snapshotSet&&getBackUpList.snapshotSet.length>0){
            backupList=getBackUpList.snapshotSet
        }
        const columns = [
            {
                title: '备份链ID',
                dataIndex: 'snapshotId',
                key:'snapshotId',
            },
            {
                title:'名称',
                dataIndex: 'snapshotName',
                key:'snapshotName',
            },
            {
                title: '状态',
                dataIndex: 'status',
                key:'status',
                render: (text, record, index) => {
                    return <span>
                        {record.status == 'available' ?
                            <span className='normal'><i className="fa fa-circle"></i> 活跃 </span> :
                            (record.status == 'deleted' ?
                                    <span className='transition'><i className="fa fa-circle"></i> 删除中。。。 </span> :
                                    (record.status == 'suspended' ?
                                            <span className='normal'><i className="fa fa-circle"></i> 已暂停 </span> :
                                            (record.status == 'pending' ?
                                                    <span className='normal'><i
                                                        className="fa fa-circle"></i> 更新中...</span>
                                                    : null
                                            )
                                    )
                            )
                        }
                       </span>
                }
            },
            {
                title: '总数大小(GB)',
                dataIndex: 'size',
                key:'size',
                render:(text,record,index)=>{
                    let size=parseInt(text/1024)
                    return <span>{size}</span>
                }
            },
            {
                title: '备份点',
                dataIndex: 'isHead',
                key:'isHead',
            },
            {
                title: '备份于',
                dataIndex: 'snapshotTime',
                key: 'snapshotTime',
                render:(text,record,index)=>{
                    return <span>{formatDate(record.snapshotTime)}</span>

                }
            }
        ]

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
            <Menu  onClick={this.handleMenuClick}>
              <Menu.Item disabled={_this.state.selectedRowKeys.length==0 ? true:false} key="delete">删除</Menu.Item>
            </Menu>
        );



        if(!backupList||backupList.length==0){
            return (
                <div className='modalDetailBox' >
                  <div className='configContent'>
                    <Button style={{marginTop:"20px"}} type="primary" size="large" onClick={this.CreateBackup}><Icon type="camera-o" />创建备份</Button>
                    <p style={{marginTop:'5px',color:'#777',fontStyle:'italic'}}>您还有没有备份哦，点击创建</p>
                  </div>
                </div>
            )
        }else{
            return (
                <div className='modalDetailBox'>
                  <div className='configContent' style={{padding:'0px'}}>
                    <div className='detailName'>
                      <Button style={{margin:'15px',padding:'8px 8px 8px 15px'}} type="primary" size="large" onClick={this.CreateBackup}><Icon type="camera-o" />创建备份</Button>
                      <Button type='primary'  onClick={this.refreshBackUpList} style={{margin:'15px 15px 15px 0',fontSize:"14px",padding:'8px 15px'}}>刷新<Icon type='reload'></Icon></Button>
                      <Dropdown  overlay={menu} trigger={['click']}>
                        <Button type="primary"style={{ margin:'15px 0px',fontSize:'14px',padding:'8px 10px'}}>
                          更多操作 <Icon type="down" />
                        </Button>
                      </Dropdown>
                    </div>
                    <Table rowSelection={rowSelection}  pagination={false}  columns={columns} dataSource={backupList} />
                  </div>
                </div>
            )
        }
    }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current;
  
  const defaultRedisList = {
    cluster: cluster.clusterID,
    database: 'redis',
    databaseList: [],
    databaseConfigList: [],
    datamonitorList:[]
  }
  const { databaseAllNodesList,databaseBackUpList,databaseMonitorMetricList,databaseMonitorList } = state.databaseCache;
  const { databaseList } = databaseAllNodesList.caches||defaultRedisList;
  const {nodesMonitorList } = databaseMonitorList.caches||defaultRedisList;
  const {monitorMetricList}=databaseMonitorMetricList.caches||defaultRedisList
  const {getBackUpList}=databaseBackUpList.mysql || defaultRedisList


  return {
    cluster: cluster.clusterID,
    database,
    databaseList,
    nodesMonitorList:nodesMonitorList,
    monitorMetricList,
    getBackUpList

  }
}

ModalDetail.PropTypes = {
  intl: PropTypes.object.isRequired,
  deleteDatabaseRedis: PropTypes.func.isRequired,
  MongoDbNodesCluster:PropTypes.func.isRequired,
  MonitorList:PropTypes.func.isRequired,
  MonitorMetricList:PropTypes.func.isRequired,
  fetch_backup_list:PropTypes.func.isRequired,
  deleteBackupList:PropTypes.func.isRequired,
  deleteNodeBackupList:PropTypes.func.isRequired
}

ModalDetail = injectIntl(ModalDetail, {
  withRef: true,
})

export default connect(mapStateToProps, {
  deleteDatabaseRedis,
    fetch_backup_list,
    deleteDatabaseRedis,
    deleteBackupList,
  putDbClusterDetail,
  MongoDbNodesCluster,
  MonitorList,
  MonitorMetricList,
  ClearNodeList,
  deleteNodeBackupList
})(ModalDetail)
