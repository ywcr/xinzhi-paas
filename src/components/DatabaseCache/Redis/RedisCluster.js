/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  RedisDatabase module
 *
 * v2.0 - 2016-10-18
 * @author GaoJian
 * update by Bai Yu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Row, Col, Modal,Menu, Button, Dropdown,Icon, Input, Spin, Tooltip, Tabs,Slider,Switch} from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadDbCacheRedisList ,searchRedisService,searchCacheConfig ,loadDbCacheRedisConfigList,deleteDatabaseRedis,deleteDatabaseConfigRedis,putPutCacheVerb,ClearNodeList} from '../../../actions/database_cache'
import { loadMyStack } from '../../../actions/app_center'
import { getProxy } from '../../../actions/cluster'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ModalDetail from './RedisModalDetail.js'
import ConfigModalDetail from './RedisConfigDetail.js'
import CreateDatabase from './CreateRedis.js'
import CreateConfigGroup from './CreateConfig.js'
import ModifyConfigGroup from './ModifyConfig'
import NotificationHandler from '../../../common/notification_handler'
import { formatDate } from '../../../common/tools.js'
// import './style/RedisCluster.less'
import '../style/MysqlCluster.less'
import memcachedImg from '../../../assets/img/database_cache/memcached.png'
import redisImg from '../../../assets/img/database_cache/redis.jpg'
import noDbImgs from '../../../assets/img/database_cache/no_redis.png'
import MongoBackUp from '../MongoDB/MongoBackUp'

import Title from '../../Title'

const TabPane = Tabs.TabPane;

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  showDetailModal: function (database) {
    const { scope } = this.props;
    scope.setState({
      detailModal: true,
      currentData: database,
      currentDatabase:'',
    })
  },

  render: function () {
    const { config, isFetching, scope } = this.props;
    const canCreate = this.props.canCreate;
    let title = ''
    if (!canCreate) {
      title = '尚未部署分布式存储，暂不能创建'
    }
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!config ||config.length == 0) {
      return (
        <div className="text-center">
          <img src={noDbImgs} />
          <div>还没有 Redis 集群，创建一个！ <Tooltip title={title} placement="right"><Button type="primary" size="large" onClick={()=> this.props.scope.createDatabaseShow()} disabled={!canCreate}>创建集群</Button></Tooltip></div>
        </div>
      )
    }
    let items = config.map((item, index) => {
      const verbArr = {
        'starting':'启动',
        'stopping':'停止',
        'restarting':'重启',
        'resizing':'扩容'
      }
      const handleMenuClick = (e) => {
        switch(e.key){
          case 'delete':
          scope.setState({cacheId:item.cacheId,delModal:true})
          break;
          case 'resizing':
          scope.setState({cacheId:item.cacheId,resizeModal:true,verb:e.key,cacheSize:item.cacheSize})
          break;
          default:
          scope.setState({cacheId:item.cacheId,cacheName:item.cacheName,updateModal:true,verb:e.key,verbText:verbArr[e.key]})
        }
      }
      const menu = (
        <Menu onClick={handleMenuClick}>
          <Menu.Item disabled={item.transitionStatus!='' || item.status == 'active' || item.status == 'pending' ?true:false} key="starting">启动</Menu.Item>
          <Menu.Item disabled={item.transitionStatus!='' || item.status != 'active' ?true:false} key="stopping">关闭</Menu.Item>
          <Menu.Item disabled={item.transitionStatus!='' || (item.status != 'active' || item.cacheType == 'redis3.0.5') ?true:false} key="restarting">重启</Menu.Item>
          <Menu.Item disabled={item.transitionStatus!='' || item.status == 'pending' ?true:false}  key="resizing">扩容</Menu.Item>
          <Menu.Item disabled={item.transitionStatus!='' || item.status == 'pending' ?true:false} key="delete">删除</Menu.Item>
        </Menu>
      );
      return (
        <div className='List' key={index}>
          <div className='list-wrap'>
            <div className='detailHead'>
              {item.cacheType == 'memcached1.4.13'? <img src={memcachedImg} />:<img src={redisImg} />}
             
              <div className='detailName listName'>
                {item.cacheName}
              </div>
              <div className='detailName'>
              <Dropdown.Button size='small' onClick={item.transitionStatus != 'deleting'?this.showDetailModal.bind(this, item):''} trigger={['click']} overlay={menu} type="ghost">
                <Icon type='bars' />展开详情
              </Dropdown.Button>
              </div>
            </div>
            <ul className='detailParse'>
              <li><span className='listKey'>状态</span>
                  {item.transitionStatus == ''?
                  (item.status == 'active' ?
                  <span className='normal active'><i className="fa fa-circle"></i> 活跃 </span>:
                  (item.status == 'stopped' ?
                  <span className='normal transition'><i className="fa fa-circle"></i> 已关闭 </span>:
                  (item.status == 'suspended' ?
                  <span className='normal'><i className="fa fa-circle"></i> 已暂停 </span>
                  :null)))
                  :
                  (item.transitionStatus == 'starting' ?<span className='normal transition'><i className="fa fa-circle"></i> 启动中...</span>:
                    (item.transitionStatus == 'stopping' ?<span className='normal transition'><i className="fa fa-circle"></i> 关闭中...</span>:
                      (item.transitionStatus == 'restarting' ?<span className='normal transition'><i className="fa fa-circle"></i> 重启中...</span>:
                        (item.transitionStatus == 'resizing' ?<span className='normal transition'><i className="fa fa-circle"></i> 扩容中...</span>:
                          (item.transitionStatus == 'creating' ?<span className='normal transition'><i className="fa fa-circle"></i> 创建中...</span>:
                            (item.transitionStatus == 'deleting' ?<span className='normal transition'><i className="fa fa-circle"></i> 删除中...</span>:
                                    (item.transitionStatus == 'snapshot-creating' ?<span className='normal transition'><i className="fa fa-circle"></i> 备份创建中...</span>:
                                            (item.transitionStatus == 'updating' ?<span className='normal transition'><i className="fa fa-circle"></i> 更新中...</span>:null)
                                    )
                            )
                          )
                        )
                      )
                    )
                  )
                  }
              </li>
              <li><span className='listKey'>版本</span>{item.cacheType}<div style={{ clear: 'both' }}></div></li>
              <li>
                <span className='listKey'>创建时间</span>
                <span>{formatDate(item.createTime)}</span>
              </li>
              <li><span className='listKey'>存储大小</span>{item.cacheSize}GB<div style={{ clear: 'both' }}></div></li>
            </ul>
          </div>
        </div>
      );
    });
    return (
      <div className='layoutBox'>
        {items}
      </div>
    );
  }
});
let CacheConfigGroup = React.createClass({
    propTypes: {
      config: React.PropTypes.array
    },
    showConfigDetailModal: function (database) {
      const { scope } = this.props;
      scope.setState({
        detailModal: true,
        currentData: database,
        currentDatabase:'',
      })
    },
    render() {
        const { config, isConfig, scope,currentData } = this.props;
        const canCreate = this.props.canCreate;
        let title = ''
        
        if (!canCreate) {
            title = '尚未部署分布式存储，暂不能创建'
        }
        if (isConfig) {
            return (
                <div className='loadingBox'>
                  <Spin size='large' />
                </div>
            )
        }
        if (!config ||config.length == 0) {
            return (
                <div className="text-center" style={{'paddingBottom':'10%'}}>
                  <img src={noDbImgs} />
                  <div>还没有 Redis 缓存配置，创建一个！ <Tooltip title={title} placement="right"><Button type="primary" size="large" onClick={()=> this.props.scope.createConfigShow()} disabled={!canCreate}>创建配置组</Button></Tooltip></div>
                </div>
            )
        }
        let items = config.map((item, index) => {
            const verbArr = {
                'modify':'修改',
                'delete':'删除',
            }
            const handleMenuClick = (e) => {
                switch(e.key){
                    case 'delete':
                        scope.setState({cacheId:item.cacheParameterGroupId,cacheName:item.cacheParameterGroupName,delCofigModal:true})
                        break;
                    default:
                        scope.setState({cacheId:item.cacheParameterGroupId,cacheName:item.cacheParameterGroupName,configs:item,modifyModal:true,verb:e.key,verbText:verbArr[e.key]})
                }
            }
            const menu = (
                <Menu onClick={handleMenuClick}>
                  <Menu.Item  key="modify">修改</Menu.Item>
                  <Menu.Item disabled={item.isDefault ==1? true:false} key="delete">删除</Menu.Item>
                </Menu>
            );
            return (
                <div className='List' key={index}>
                  <div className='list-wrap'>
                    <div className='detailHead'>
                    {item.cacheType == 'memcached1.4.13'? <img src={memcachedImg} />:<img src={redisImg} />}
                      <div className='detailName listName'>
                          {item.cacheParameterGroupName}
                      </div>
                      <div className='detailName'>
                        <Dropdown.Button size='small' onClick={this.showConfigDetailModal.bind(this, item)} trigger={['click']} overlay={menu} type="ghost">
                          <Icon type='bars' />展开详情
                        </Dropdown.Button>
                      </div>
                    </div>
                    <ul className='detailParse'>
                      <li>
                          <span className='listKey'>ID</span>
                          <sapn>{item.cacheParameterGroupId}</sapn>
                          <div style={{ clear: 'both' }}></div>
                      </li>
                      <li>
                        <span className='listKey'>类型</span>
                        <span>{item.cacheType}</span>
                        <div style={{ clear: 'both' }}></div>
                      </li>
                      <li>
                        <span className='listKey'>创建时间</span>
                        <span>{formatDate(item.createTime)}</span>
                        <div style={{ clear: 'both' }}></div>
                      </li>
                    </ul>
                  </div>
                </div>
            );
        });
        return (
            <div className='layoutBox'>
                {items}
            </div>
        );
    }
})

class RedisDatabase extends Component {
  constructor() {
    super()
    this.createDatabaseShow = this.createDatabaseShow.bind(this);
    this.clusterRefresh = this.clusterRefresh.bind(this);
    this.clusterConfigRefresh=this.clusterConfigRefresh.bind(this);
    this.createConfigShow=this.createConfigShow.bind(this)
    this.state = {
      detailModal: false,
      delModal: false,
      cacheId:'',
      cacheName:'',
      cacheSize:'',
      tabsKey:'1',
      putVisible: false,
      currentDatabase: null,
      CreateDatabaseModalShow: false,
      CreateConfigModalShow:false,
      verb:'',
      updateModal:false,
      verbText:'',
      resizeModal:false,
      inputValue:'',
      delCofigModal:false,
      modifyModal:false,
      activeKey:'#BaseInfo',
      backupModalShow:false
    }
  }
  getDbCacheRedisList(){
    const { loadDbCacheRedisList, cluster } = this.props
    const self = this;
    loadDbCacheRedisList(cluster, 'redis','caches', {
      success: {
        func: (result) => {
          clearTimeout(self.loadStatusTimeout)
          self.loadStatusTimeout = setTimeout(() => {
            // loadDbCacheRedisList(cluster, 'redis','caches')
            this.getDbCacheRedisList();
          }, '10000')
        }
      }
    })
  }
  clusterRefresh() {
    this.getDbCacheRedisList();
  }
  clusterConfigRefresh() {
      const {loadDbCacheRedisConfigList, cluster } = this.props
      loadDbCacheRedisConfigList(cluster,'redis')
  }

  componentWillMount() {
    const { cluster, getProxy,loadDbCacheRedisConfigList } = this.props
    if (cluster == undefined) {
      let notification = new NotificationHandler()
      notification.error('请选择集群','invalid cluster ID')
      return
    }
    getProxy(cluster);
    this.getDbCacheRedisList();
    loadDbCacheRedisConfigList(cluster,'redis')
  }
  componentDidMount() {
    const _this = this
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          _this.setState({
            dbservice: res.data.data
          })
        }
      }
    })
  }
  componentWillUnmount(){
    clearTimeout(this.loadStatusTimeout)
  }
  componentWillReceiveProps(nextProps) {
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!nextState.detailModal) {
      this.setState({putVisible: false})
    }
    return nextState
  }
  putModal() {
    this.setState({
      putVisible: !this.state.putVisible
    })
  }
  createDatabaseShow() {
    //this function for user show the modal of create database
    this.setState({
      CreateDatabaseModalShow: true
    });
    setTimeout(function() {
      document.getElementById('dbName').focus()
    }, 100);
  }
  createConfigShow(){
    this.setState({
        CreateConfigModalShow:true,
    })
  }
  handSearch(e) {
    if (e) {
      this.props.searchRedisService('redis', e.target.value,'caches')
      return
    }
    const names = this.refs.redisRef.refs.input.value
    this.props.searchRedisService('redis', names,'caches')
  }
  configSearch(e) {
    if (e) {
      this.props.searchCacheConfig('redis', e.target.value)
      return
    }
    const names = this.refs.redisRef2.refs.input.value
    this.props.searchCacheConfig('redis', names)
  }
  updateRedis(type){
    const {cluster,putPutCacheVerb} = this.props;
    let notification = new NotificationHandler()
    let _this = this;
    const data = {}
    if(type == 'cacheSize'){
      if(this.state.cacheSize<this.state.inputValue){
          this.state.inputValue!='' ? data.cache_size = this.state.inputValue:null;
      }else{
        notification.error('存储容量只能扩容，不支持减少存储容量。')
        return false;
      }
    }

    putPutCacheVerb(cluster , _this.state.cacheId , _this.state.verb, data,'caches',{
      success: {
        func: () => {
          // notification.success('更改成功')
          _this.setState({updateModal:false,cacheSize:'',resizeModal:false})
        }
      },
      failed: {
        func: (res) => {
          _this.setState({updateModal:false,cacheSize:'',resizeModal:false})
          notification.error('更改失败', res.message)
        }
      }
    });
  }
  deleteRedis(type){
    const {cluster,deleteDatabaseRedis} = this.props;
    let notification = new NotificationHandler()
    let _this = this;
    deleteDatabaseRedis(cluster , _this.state.cacheId ,'caches',{
      success: {
        func: () => {
          // notification.success('删除成功')
          _this.setState({delModal:false})
        }
      },
      failed: {
        func: (res) => {
          _this.setState({delModal:false})
          notification.error('删除失败', res.message)
        }
      }
    });
  }
  deleteRedisConfig(){
    const {cluster,deleteDatabaseRedis,deleteDatabaseConfigRedis} = this.props;
    let notification = new NotificationHandler()
    let _this = this;
    deleteDatabaseConfigRedis(cluster , _this.state.cacheId ,'redis',{
      success: {
        func: () => {
          notification.success('删除成功')
          _this.setState({delCofigModal:false})
        }
      },
      failed: {
        func: (res) => {
          _this.setState({delCofigModal:false})
          notification.error('删除失败', res.message)
        }
      }
    });
  }
  
  render() {
    const _this = this;
    const { isFetching,isConfig, databaseList, clusterProxy, databaseConfigList,ClearNodeList } = this.props;
    const standard = require('../../../../configs/constants').STANDARD_MODE
    const mode = require('../../../../configs/model').mode
    let title = ''
    const marks = {
      1: '1',
      2: '2',
      4: '4',
      6: '6',
      8: '8',
      12: '12',
      16: '16',
      20: '20',
      24: '24',
      28: '28',
      32: '32',
    };
    const onChangeCache2 = (value)=> {
      this.setState({
        inputValue: value,
      });
    }
    const setTabs = (key)=>{
      if(key == '1'){
        this.clusterRefresh();
      }else{
        clearTimeout(_this.loadStatusTimeout)
        this.clusterConfigRefresh();
      }
      this.setState({
        tabsKey:key
      })
    }
    const  onChange = (checked) => {
    }
    const currentCluster = this.props.current.cluster
    const storage_type = currentCluster.storageTypes
    let canCreate = true
    if (!storage_type || storage_type.indexOf('rbd') < 0) canCreate = false
    if(!canCreate) {
      title = '尚未部署分布式存储，暂不能创建'
    }
    return (
      <QueueAnim id='mysqlDatabase' type='right'>
        <div className='databaseCol' key='RedisDatabase'>

          <Title title="缓存" />
            <div className='databaseHead'>
            <div className="card-container">
              <Tabs type="card" onChange={setTabs}>
                <TabPane tab="缓存" key="1">
                  <div style={{'paddingBottom':'15px'}}>
                    { mode === standard ? <div className='alertRow'>您的 Redis 集群创建在新智云平台，如果帐户余额不足时，1 周内您可以进行充值，继续使用。如无充值，1 周后资源会被彻底销毁，不可恢复。</div> : <div></div>}
                      <Tooltip title={title} placement="right">
                        <Button type='primary' size='large' onClick={this.createDatabaseShow} disabled={!canCreate}>
                          <i className='fa fa-plus' />&nbsp;创建缓存
                        </Button>
                      </Tooltip>
                      <Button style={{marginLeft:'20px',padding:'5px 15px'}} size='large' onClick={this.clusterRefresh} disabled={!canCreate}>
                        <i className='fa fa-refresh' />&nbsp;刷 新
                      </Button>
                      <span className='rightSearch'>
                        <Input size='large' placeholder='搜索' style={{ width: '180px', paddingRight:'28px' }} ref="redisRef" onPressEnter={(e)=> this.handSearch(e)}/>
                        <i className="fa fa-search cursor" onClick={()=> this.handSearch()} />
                      </span>
                  </div>
                  <MyComponent scope={_this} isFetching={isFetching} config={databaseList} canCreate={canCreate}/>
                   
                </TabPane>
                <TabPane tab="缓存配置组" key="2">
                  <div style={{'paddingBottom':'15px'}}>
                    { mode === standard ? <div className='alertRow'>您的 Redis 集群创建在新智云平台，如果帐户余额不足时，1 周内您可以进行充值，继续使用。如无充值，1 周后资源会被彻底销毁，不可恢复。</div> : <div></div>}
                      <Tooltip title={title} placement="right">
                        <Button type='primary' size='large' onClick={this.createConfigShow} disabled={!canCreate}>
                          <i className='fa fa-plus' />&nbsp;添加配置组
                        </Button>
                      </Tooltip>
                      <Button style={{marginLeft:'20px',padding:'5px 15px'}} size='large' onClick={this.clusterConfigRefresh} disabled={!canCreate}>
                        <i className='fa fa-refresh' />&nbsp;刷 新
                      </Button>
                      <span className='rightSearch'>
                        <Input size='large' placeholder='搜索' style={{ width: '180px', paddingRight:'28px' }} ref="redisRef2" onPressEnter={(e)=> this.configSearch(e)}/>
                        <i className="fa fa-search cursor" onClick={()=> this.configSearch()} />
                      </span>
                  </div>
                    <CacheConfigGroup scope={_this} isConfig={isConfig} config={databaseConfigList}  cacheId={this.state.cacheId} canCreate={canCreate}/>
                    </TabPane>
              </Tabs>
            </div>
            </div>
            {this.state.tabsKey == '1'?
            <Modal visible={this.state.detailModal}//缓存详情
              className='AppServiceDetail' transitionName='move-right'
              onCancel={() => { this.setState({ detailModal: false,activeKey:'#BaseInfo' }); ClearNodeList('caches'); } }
              >
              <ModalDetail scope={_this} activeKey={this.state.activeKey} detailModal={this.state.detailModal} putVisible={ _this.state.putVisible } database={this.props.database} currentData={this.state.currentData} dbName={this.state.currentDatabase} />
            </Modal>:
            <Modal visible={this.state.detailModal}//缓存详情
              className='AppServiceDetail' transitionName='move-right'
              onCancel={() => { this.setState({ detailModal: false,activeKey:'#BaseInfo' }) } }
              >
              <ConfigModalDetail scope={_this} activeKey={this.state.activeKey} putVisible={ _this.state.putVisible } database={this.props.database} currentData={this.state.currentData} />
            </Modal>

            }
            

           
            <Modal title="删除缓存" visible={this.state.delModal}
              onOk={()=> this.deleteRedis()} onCancel={()=> this.setState({delModal: false})}
              >
              <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除数据库 { this.state.cacheId }?</div>
            </Modal>
            <Modal title="提示" visible={this.state.updateModal}
              onOk={()=> this.updateRedis()} onCancel={()=> this.setState({updateModal: false})}
              >
              <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要{this.state.verbText}缓存 { this.state.cacheName }?</div>
            </Modal>

            <Modal title="删除配置组" visible={this.state.delCofigModal}
                   onOk={()=> this.deleteRedisConfig()} onCancel={()=> this.setState({delCofigModal: false})}
            >
              <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除配置组 { this.state.cacheName }?</div>
            </Modal>
            {this.state.resizeModal?
              <Modal title="扩容" visible={this.state.resizeModal}
                onOk={()=> this.updateRedis('cacheSize')} onCancel={()=> this.setState({resizeModal: false,cacheSize:1})}
                >
                <Row>
                  <Col span={3} style={{'lineHeight':'52px','marginLeft':'7px'}}>
                    缓存大小 :
                  </Col>
                  <Col span={19} style={{'marginTop':'9px'}}>
                    <Slider min={1} max={32} marks={marks} onChange={onChangeCache2} step={null}  defaultValue={this.state.cacheSize}/>
                  </Col>
                  <Col span={1} style={{'lineHeight':'52px','marginLeft':'7px'}}>
                    GB
                  </Col>
                </Row>
              </Modal>:null
            }
        </div>
       
        <Modal visible={this.state.CreateDatabaseModalShow}//创建缓存
          className='CreateDatabaseModal' maskClosable={false}
          title='创建缓存' width={600}
          onCancel={() => { this.setState({ CreateDatabaseModalShow: false }) } }
          >
          <CreateDatabase scope={_this} dbservice={this.state.dbservice} databaseConfigList={databaseConfigList} database={'redis3.0.5(集群)'} clusterProxy={clusterProxy}/>
        </Modal>

        <Modal visible={this.state.backupModalShow}
               className='CreateDatabaseModal' maskClosable={false} width={600}
               title='创建数据库集群备份'
               onCancel={() => { this.setState({ backupModalShow: false,activeKey:'#BaseInfo' }) } }
        >
          <MongoBackUp type='cache' activeKey={this.state.activeKey}   currentData={this.state.currentData} backupModalShow={this.state.backupModalShow} scope={_this}  clusterProxy={clusterProxy}/>
        </Modal>

        <Modal visible={this.state.CreateConfigModalShow}//创建缓存
               className='CreateDatabaseModal' maskClosable={false}
               title='创建缓存配置组' width={600}
               onCancel={() => { this.setState({ CreateConfigModalShow: false }) } }
        >
          <CreateConfigGroup scope={_this} dbservice={this.state.dbservice} databaseConfigList={databaseConfigList} database={'redis3.0.5(集群)'} clusterProxy={clusterProxy}/>
        </Modal>
        <Modal visible={this.state.modifyModal}//创建缓存
               className='CreateDatabaseModal' maskClosable={false}
               title='修改缓存配置组' width={600}
               onCancel={() => { this.setState({ modifyModal: false }) } }
        >
          <ModifyConfigGroup scope={_this} configs = {this.state.configs} cacheId = {this.state.cacheId}/>
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultRedisList = {
    isFetching: false,
    isConfig:false,
    cluster: cluster.clusterID,
    database: 'redis',
    databaseList: [],
    databaseConfigList: []
  }

  const { databaseAllRedisList,databaseAllRedisConfigList } = state.databaseCache
  const { database, databaseList, isFetching } = databaseAllRedisList.redis || defaultRedisList
  const { databaseConfigList, isConfig } = databaseAllRedisConfigList.redis || defaultRedisList
  const { current } = state.entities
  let clusterProxy = state.cluster.proxy.result || {}
  return {
    cluster: cluster.clusterID,
    // cluster: 'e0e6f297f1b3285fb81d27742255cfcf11',// @todo default
    current,
    database,
    databaseList: databaseList,
    databaseConfigList: databaseConfigList,
    isFetching,isConfig,
    clusterProxy,
  }
}

RedisDatabase.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadDbCacheRedisList: PropTypes.func.isRequired,
  putPutCacheVerb: PropTypes.func.isRequired,
  loadDbCacheRedisConfigList: PropTypes.func.isRequired,
  loadMyStack: PropTypes.func.isRequired
}

RedisDatabase = injectIntl(RedisDatabase, {
  withRef: true,
})

export default connect(mapStateToProps, {
  loadDbCacheRedisList,
  loadMyStack,
  loadDbCacheRedisConfigList,
  deleteDatabaseRedis,
  deleteDatabaseConfigRedis,
  putPutCacheVerb,
  searchRedisService,
  searchCacheConfig,
  getProxy,
  ClearNodeList
})(RedisDatabase)
