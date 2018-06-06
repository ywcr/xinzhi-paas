/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v2.0 - 2016-10-11
 * @author Bai Yu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Row, Col, Modal,Menu,InputNumber, Button, Dropdown,Icon, Input, Spin, Tooltip, Tabs,Slider, } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadDbCacheRedisList,searchRedisService,loadDbCacheRedisConfigList,ClearNodeList,deleteDatabaseRedis,putPutCacheVerb} from '../../../actions/database_cache'
import { loadMyStack } from '../../../actions/app_center'
import { getProxy } from '../../../actions/cluster'
import { DEFAULT_REGISTRY } from '../../../../constants/index'
import MongoDBDetail from './MongoDBDetail.js'
import CreateMongoDB from './CreateMongoDB.js'
import MongoBackUp from './MongoBackUp'
// import apiFactory from '../../../../services/api_factory'
import NotificationHandler from '../../../common/notification_handler'
import { formatDate } from '../../../common/tools.js'
import '../style/MysqlCluster.less'
import mongoDB from '../../../assets/img/database_cache/mongoDB.jpeg'
import noDbImgs from '../../../assets/img/database_cache/no_mysql.png'
import Title from '../../Title'

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  showDetailModal: function (database) {
    const { scope } = this.props
    scope.setState({
      detailModal: true,
      currentData: database,
      currentDatabase:'',
      start:false,
      stope:false,
      reStart:false,
      delete:false
    })
  },
  render: function () {
    const canCreate = this.props.canCreate
    const { config, isFetching } = this.props;
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
    if (config.length == 0) {
      return (
        <div className="text-center">
          <img src={noDbImgs} />
          <div>还没有 MongoDB 集群，创建一个！ <Tooltip title={title} placement="right"><Button type="primary" size="large" onClick={()=> this.props.scope.createDatabaseShow()} disabled={!canCreate}>创建集群</Button></Tooltip></div>
        </div>
      )
    }
    let items = config.map((item, index) => {
        const { scope } = this.props
        const verbArr = {
          'starting':'启动',
          'stopping':'停止',
          'restarting':'重启',
          'resizing':'扩容'
        }
        const handleMenuClick = (e) => {
            switch(e.key){
                case 'delete':
                    scope.setState({mongoId:item.mongoId,delModal:true})
                    break;
                default:
                    scope.setState({mongoId:item.mongoId,mongoName:item.mongoName,updateModal:true,verb:e.key,verbText:verbArr[e.key]})
            }
        }
        const menu = (
            <Menu onClick={handleMenuClick}>
              <Menu.Item disabled={item.transitionStatus!='' || item.status == 'active' || item.status == 'pending' ?true:false} key="starting">启动</Menu.Item>
              <Menu.Item disabled={item.transitionStatus!='' || item.status != 'active' ?true:false} key="stopping">关闭</Menu.Item>
              <Menu.Item disabled={item.transitionStatus!='' || (item.status != 'active' || item.cacheType == 'redis3.0.5') ?true:false} key="restarting">重启</Menu.Item>
              <Menu.Item disabled={item.transitionStatus!='' || item.status == 'pending' ?true:false} key="delete">删除</Menu.Item>
            </Menu>
        );
      return (
        <div className='List' key={index}>
          <div className='list-wrap'>
            <div className='detailHead'>
              <img src={mongoDB} />
              <div className='detailName'>
                {item.mongoName}
              </div>
              <div className='detailName'>
                <Dropdown.Button size='small'  onClick={item.transitionStatus != 'deleting'?this.showDetailModal.bind(this, item):''} trigger={['click']} overlay={menu} type="ghost">
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
              {/*<li><span className='listKey'>节点数</span>{item.masterCount}个<div style={{ clear: 'both' }}></div></li>*/}
              <li>
                <span className='listKey'>创建时间</span>
                <span>{formatDate(item.createTime)}</span>
              </li>
              <li><span className='listKey'>存储大小</span>{item.storageSize}&nbsp;GB</li>
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

class MongoDBCluster extends Component {
  constructor(props) {
    super(props)

      this.createDatabaseShow = this.createDatabaseShow.bind(this);
    this.refreshDatabase = this.refreshDatabase.bind(this);
    this.state = {
        detailModal: false,
        delModal: false,
        mongoId:'',
        mongoName:'',
        storageSize:'',
        putVisible: false,
        currentDatabase: null,
        CreateDatabaseModalShow: false,
        CreateConfigModalShow: false,
        verb:'',
        updateModal:false,
        verbText:'',
        inputValue:'',
        activeKey:'#BaseInfo',
        backupModalShow:false
    }

  }
  getDbCacheRedisList(){
		const { loadDbCacheRedisList, cluster } = this.props
		const self = this;
		loadDbCacheRedisList(cluster, 'mongos','mongos', {
		success: {
			func: (result) => {
			clearTimeout(self.loadStatusTimeout)
			self.loadStatusTimeout = setTimeout(() => {
				this.getDbCacheRedisList();
			}, '10000')
			}
		}
		})
	}
  refreshDatabase() {
    const _this = this
    const { loadDbCacheRedisList, cluster } = this.props
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          _this.setState({
            dbservice: res.data.data
          })
        }
      }
    })

      this.getDbCacheRedisList();

      const { teamCluster } = this.props
    if(teamCluster && teamCluster.result && teamCluster.result.data && location.search == '?createDatabase'){
      _this.setState({
        CreateDatabaseModalShow: true,
      })
    }
  }

  componentWillMount() {
    const { loadDbCacheRedisList,loadDbCacheRedisConfigList,cluster, getProxy } = this.props
    if (cluster == undefined) {
      let notification = new NotificationHandler()
      notification.error('请选择集群','invalid cluster ID')
      return
    }
    getProxy(cluster)
    this.getDbCacheRedisList();
  }
  componentWillUnmount(){
    clearTimeout(this.loadStatusTimeout)
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

    const { teamCluster } = this.props
    if(teamCluster && teamCluster.result && teamCluster.result.data && location.search == '?createDatabase'){
      _this.setState({
        CreateDatabaseModalShow: true,
      })
      setTimeout(() => {
        document.getElementById('dbName').focus()
      },100)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { form, current} = nextProps

      if (current.space.namespace === this.props.current.space.namespace && current.cluster.clusterID === this.props.current.cluster.clusterID) {
      return
    }
    this.props.loadDbCacheRedisList(current.cluster.clusterID, 'mongos','mongos')
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
  handSearch(e) {
    if (e) {
      this.props.searchRedisService('mongos', e.target.value,'mongos')
      return
    }
    const names = this.refs.mysqlRef.refs.input.value
    this.props.searchRedisService('mongos', names,'mongos')
  }
  /*删除数据库集群*/
  deleteMongos=()=>{
      const {cluster,deleteDatabaseRedis} = this.props;
      let notification = new NotificationHandler()
      let _this = this;
      deleteDatabaseRedis(cluster,_this.state.mongoId,'mongos',{
          success: {
              func: () => {
                  notification.success('删除成功')
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

    updateRedis(){
        const {cluster,putPutCacheVerb} = this.props;
        let notification = new NotificationHandler()
        let _this = this;
        const data = {}

        putPutCacheVerb(cluster , _this.state.mongoId , _this.state.verb, data,'mongos',{
            success: {
                func: () => {
                    // notification.success('更改成功')
                    _this.setState({updateModal:false})
                }
            },
            failed: {
                func: (res) => {
                    _this.setState({updateModal:false})
                    notification.error('更改失败', res.message)
                }
            }
        });
    }


  render(){
    const _this = this;
    const { isFetching, databaseList, clusterProxy } = this.props;
    const standard = require('../../../../configs/constants').STANDARD_MODE
    const mode = require('../../../../configs/model').mode
    let title = ''

     const onChangeCache =(value)=>{
          this.setState({
              inputValue: value,
          });
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
        <div className='databaseCol' key='mysqlDatabase'>
          <Title  title="关系型数据库" />
          <div className='databaseHead'>
            { mode === standard ? <div className='alertRow'>您的 mongoDB 集群 创建在新智云平台，如果帐户余额不足时，1 周内您可以进行充值，继续使用。如无充值，1 周后资源会被彻底销毁，不可恢复。</div> : <div></div>}
            <Tooltip title={title} placement="right"><Button type='primary' size='large' onClick={this.createDatabaseShow} disabled={!canCreate}>
              <i className='fa fa-plus' />&nbsp;MongoDB集群
          </Button>
          </Tooltip>
            <Button style={{marginLeft:'20px',padding:'5px 15px'}} size='large' onClick={this.refreshDatabase} disabled={!canCreate}>
              <i className='fa fa-refresh' />&nbsp;刷 新
            </Button>
            <span className='rightSearch'>
              <Input size='large' placeholder='搜索' style={{ width: '180px', paddingRight:'28px'}} ref="mysqlRef" onPressEnter={(e)=> this.handSearch(e)} />
              <i className="fa fa-search cursor" onClick={()=> this.handSearch()}/>
            </span>
          </div>
          <MyComponent scope={_this} isFetching={isFetching} config={databaseList} canCreate={canCreate}/>
        </div>
        {/*=====提示框=====*/}
        <Modal title="删除集群操作" visible={this.state.delModal} onOk={()=> this.deleteMongos()} onCancel={()=> this.setState({delModal: false})}>
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除数据库 { this.state.mongoId }?</div>
        </Modal>
        <Modal title="提示" visible={this.state.updateModal} onOk={()=> this.updateRedis()} onCancel={()=> this.setState({updateModal: false})}>
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要{this.state.verbText}缓存 { this.state.cacheName }?</div>
        </Modal>

        <Modal visible={this.state.detailModal}
          className='AppServiceDetail' transitionName='move-right'
          onCancel={() => { this.setState({detailModal: false,activeKey:'#BaseInfo'  });this.props.ClearNodeList('mongos')  } }
          >
          <MongoDBDetail activeKey={this.state.activeKey} detailModal={this.state.detailModal}   scope={_this} putVisible={ _this.state.putVisible } database={this.props.database} currentData={this.state.currentData} dbName={this.state.currentDatabase} />
        </Modal>
        <Modal visible={this.state.CreateDatabaseModalShow}
          className='CreateDatabaseModal' maskClosable={false} width={600}
          title='创建数据库集群'
          onCancel={() => { this.setState({ CreateDatabaseModalShow: false }) } }
          >
          <CreateMongoDB scope={_this} dbservice={this.state.dbservice} database='MongoDB-3.0' clusterProxy={clusterProxy}/>
        </Modal>
          <Modal visible={this.state.backupModalShow}
                 className='CreateDatabaseModal' maskClosable={false} width={600}
                 title='创建数据库集群备份'
                 onCancel={() => { this.setState({ backupModalShow: false ,activeKey:'#BaseInfo' }) } }
          >
              <MongoBackUp type='mongos'  activeKey={this.state.activeKey}  currentData={this.state.currentData} backupModalShow={this.state.backupModalShow} scope={_this}  clusterProxy={clusterProxy}/>
          </Modal>
      </QueueAnim>
    )
  }
}
function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultMongoDBlList = {
    isFetching: false,
    cluster: cluster.clusterID,
    database: 'mongos',
    databaseList: []
  }
  const defaultConfig = {
    isFetching: false,
  }
  const { current } = state.entities
  const { databaseAllRedisList,databaseSingleList } = state.databaseCache
  const { database, databaseList, isFetching } = databaseAllRedisList.mongos || defaultMongoDBlList

  const teamCluster = state.team.teamClusters
  let clusterProxy = state.cluster.proxy.result || {}

  return {
    cluster: cluster.clusterID,
    // cluster: 'e0e6f297f1b3285fb81d27742255cfcf11',
    current,
    database,
    databaseList: databaseList,
    isFetching,
    teamCluster,
    clusterProxy,
  }
}
MongoDBCluster.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadDbCacheRedisList: PropTypes.func.isRequired,
  loadDbCacheRedisConfigList: PropTypes.func.isRequired,
  loadMyStack: PropTypes.func.isRequired
}

MongoDBCluster = injectIntl(MongoDBCluster, {
  withRef: true,
})

export default connect(mapStateToProps, {
    loadDbCacheRedisList,
    loadMyStack,
    loadDbCacheRedisConfigList,
    deleteDatabaseRedis,
    putPutCacheVerb,
    searchRedisService,
    ClearNodeList,
    getProxy,
})(MongoDBCluster)