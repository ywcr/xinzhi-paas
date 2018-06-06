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
import { Modal, Button, Icon, Input, Spin, Tooltip } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadDbCacheList , searchDbservice } from '../../actions/database_cache'
import { loadMyStack } from '../../actions/app_center'
import { getProxy } from '../../actions/cluster'
import { DEFAULT_REGISTRY } from '../../../constants'
import ModalDetail from './ModalDetail.js'
import CreateDatabase from './CreateDatabase.js'
import NotificationHandler from '../../common/notification_handler'
import { formatDate } from '../../common/tools.js'
import './style/MysqlCluster.less'
import mysqlImg from '../../assets/img/database_cache/mysql.png'
import noDbImgs from '../../assets/img/database_cache/no_mysql.png'
import Title from '../Title'

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  showDetailModal: function (database) {
    const { scope } = this.props;
    scope.setState({
      detailModal: true,
      currentData: database,
      currentDatabase: database.serivceName
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
          <div>还没有 MySQL 集群，创建一个！ <Tooltip title={title} placement="right"><Button type="primary" size="large" onClick={()=> this.props.scope.createDatabaseShow()} disabled={!canCreate}>创建集群</Button></Tooltip></div>
        </div>
      )
    }
    let items = config.map((item, index) => {
      return (
        <div className='List' key={index}>
          <div className='list-wrap'>
            <div className='detailHead'>
              <img src={mysqlImg} />
              <div className='detailName'>
                {item.serivceName}
              </div>
              <div className='detailName'>
                <Button type='ghost' size='large' onClick={this.showDetailModal.bind(this, item)}><Icon type='bars' />展开详情</Button>
              </div>
            </div>
            <ul className='detailParse'>
              <li><span className='listKey'>状态</span>
                {item.pods.running >0 ?
                  <span className='normal'>运行 {item.pods.running} 个 </span>
                  :null
                }
                {item.pods.pending >0 ?
                  <span>停止 {item.pods.pending} 个 </span>
                  :null
                }
                {item.pods.failed >0 ?
                  <span>失败 {item.pods.pending} 个 </span>
                  :null
                }
                {item.pods.desired <= 0 ?
                  <span> 已停止 </span>
                  :null
                }
              </li>
              <li><span className='listKey'>副本数</span>{item.pods.pending + item.pods.running}/{item.pods.desired}个</li>
              <li>
                <span className='listKey'>创建时间</span>
                <span>{formatDate(item.objectMeta.creationTimestamp)}</span>
              </li>
              <li><span className='listKey'>存储大小</span>{item.volumeSize ? item.volumeSize.replace('Mi','MB').replace('Gi','GB'): '0'}</li>
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

class MysqlCluster extends Component {
  constructor(props) {
    super(props)
    this.createDatabaseShow = this.createDatabaseShow.bind(this);
    this.refreshDatabase = this.refreshDatabase.bind(this);
    this.state = {
      detailModal: false,
      putVisible: false,
      currentDatabase: null,
      CreateDatabaseModalShow: false,
      dbservice: []
    }
  }
  refreshDatabase() {
    const _this = this
    const { loadDbCacheList, cluster } = this.props
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          _this.setState({
            dbservice: res.data.data
          })
        }
      }
    })
    loadDbCacheList(cluster, 'mysql')
    const { teamCluster } = this.props
    if(teamCluster && teamCluster.result && teamCluster.result.data && location.search == '?createDatabase'){
      _this.setState({
        CreateDatabaseModalShow: true,
      })
    }
  }
  componentWillMount() {
    const { loadDbCacheList, cluster, getProxy } = this.props
    if (cluster == undefined) {
      let notification = new NotificationHandler()
      notification.error('请选择集群','invalid cluster ID')
      return
    }
    getProxy(cluster)
    loadDbCacheList(cluster, 'mysql')
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
    this.props.loadDbCacheList(current.cluster.clusterID, 'mysql')
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
      this.props.searchDbservice('mysql', e.target.value)
      return
    }
    const names = this.refs.mysqlRef.refs.input.value
    this.props.searchDbservice('mysql', names)
  }

  render() {
    const _this = this;
    const { isFetching, databaseList, clusterProxy } = this.props;
    const standard = require('../../../configs/constants').STANDARD_MODE
    const mode = require('../../../configs/model').mode
    let title = ''
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
            { mode === standard ? <div className='alertRow'>您的 MySql 集群 创建在新智云平台，如果帐户余额不足时，1 周内您可以进行充值，继续使用。如无充值，1 周后资源会被彻底销毁，不可恢复。</div> : <div></div>}
            <Tooltip title={title} placement="right"><Button type='primary' size='large' onClick={this.createDatabaseShow} disabled={!canCreate}>
              <i className='fa fa-plus' />&nbsp;MySQL集群
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
        <Modal visible={this.state.detailModal}
          className='AppServiceDetail' transitionName='move-right'
          onCancel={() => { this.setState({ detailModal: false }) } }
          >
          <ModalDetail detailModal={this.state.detailModal} scope={_this}  putVisible={ _this.state.putVisible } database={this.props.database} currentData={this.state.currentData} dbName={this.state.currentDatabase} />
        </Modal>
        <Modal visible={this.state.CreateDatabaseModalShow}
          className='CreateDatabaseModal' maskClosable={false} width={600}
          title='创建数据库集群'
          onCancel={() => { this.setState({ CreateDatabaseModalShow: false }) } }
          >
          <CreateDatabase scope={_this} dbservice={this.state.dbservice} database='mysql' clusterProxy={clusterProxy}/>
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultMysqlList = {
    isFetching: false,
    cluster: cluster.clusterID,
    database: 'mysql',
    databaseList: []
  }
  const defaultConfig = {
    isFetching: false,
  }
  const { current } = state.entities
  const { databaseAllList } = state.databaseCache
  const { database, databaseList, isFetching } = databaseAllList.mysql || defaultMysqlList
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

MysqlCluster.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadDbCacheList: PropTypes.func.isRequired,
  loadMyStack: PropTypes.func.isRequired
}

MysqlCluster = injectIntl(MysqlCluster, {
  withRef: true,
})

export default connect(mapStateToProps, {
  loadDbCacheList,
  loadMyStack,
  searchDbservice,
  getProxy,
})(MysqlCluster)