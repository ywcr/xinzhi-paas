/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  StatefulCluster module
 *
 * v2.0 - 2016-10-18
 * @author Lizhen
 * update by Bai Yu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Modal, Button, Icon, Input, Spin, Tooltip } from 'antd'
import { injectIntl } from 'react-intl'
import { loadDbCacheList, searchDbservice } from '../../../actions/database_cache'
import { loadMyStack } from '../../../actions/app_center'
import { getProxy } from '../../../actions/cluster'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ModalDetail from './ModalDetail.js'
import CreateDatabase from './CreateDatabase.js'
import NotificationHandler from '../../../common/notification_handler'
import { formatDate } from '../../../common/tools.js'
import '../style/MysqlCluster.less'
import zkImg from '../../../assets/img/database_cache/zookeeper.jpg'
import esImg from '../../../assets/img/database_cache/elasticsearch.jpg'
import etcdImg from '../../../assets/img/database_cache/etcd.jpg'
import noZookeeper from '../../../assets/img/database_cache/no_zookeeper.png'
import noElasticSearch from '../../../assets/img/database_cache/no_elasticsearch.png'
import noEtcd from '../../../assets/img/database_cache/no_etcd.png'

import Title from '../../Title'

const clusterTable = {
  zookeeper: {
    displayName: 'ZooKeeper',
    image: zkImg,
    noDBImage: noZookeeper,
  },
  elasticsearch: {
    displayName: 'ElasticSearch',
    image: esImg,
    noDBImage: noElasticSearch,
  },
  mongodb: {
    displayName: 'MongoDB',
  },
  etcd: {
    displayName: 'Etcd',
    image: etcdImg,
    noDBImage: noEtcd,
  },
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    clusterType: React.PropTypes.string,
  },
  showDetailModal: function (database) {
    const { scope } = this.props;
    scope.setState({
      detailModal: true,
      currentData: database,
      currentDatabase: database.serviceName
    })
  },
  render: function () {
    const { config, isFetching, clusterType } = this.props;
    const canCreate = this.props.canCreate
    const literal = clusterTable[clusterType]
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
    if (!config || config.length == 0) {
      return (
        <div className="text-center">
          <img src={literal.noDBImage} />
          <div>还没有 {literal.displayName} 集群，创建一个！ <Tooltip title={title} placement="right">
            <Button type="primary" size="large"
              onClick={() => this.props.scope.createDatabaseShow()}
              disabled={!canCreate}>创建集群</Button>
          </Tooltip>
          </div>
        </div>
      )
    }
    let items = config.map((item, index) => {
      return (
        <div className='List' key={index}>
          <div className='list-wrap'>
            <div className='detailHead'>
              <img src={literal.image} />
              <div className='detailName'>
                {item.objectMeta.name}
              </div>
              <div className='detailName'>
                <Button type='ghost' size='large' onClick={this.showDetailModal.bind(this, item)}><Icon type='bars' />展开详情</Button>
              </div>
            </div>
            <ul className='detailParse'>
              <li><span className='listKey'>状态</span>
                {item.pods.running > 0 ?
                  <span className='normal'>运行 {item.pods.running} 个 </span>
                  : null
                }
                {item.pods.pending > 0 ?
                  <span>停止 {item.pods.pending} 个 </span>
                  : null
                }
                {item.pods.failed > 0 ?
                  <span>失败 {item.pods.pending} 个 </span>
                  : null
                }
              </li>
              <li><span className='listKey'>副本数</span>{item.pods.pending + item.pods.running}/{item.pods.desired}个
                <div style={{ clear: 'both' }}></div>
              </li>
              <li>
                <span className='listKey'>创建时间</span>
                <span>{formatDate(item.objectMeta.creationTimestamp)}</span>
              </li>
              <li><span className='listKey'>存储大小</span>{item.volumeSize ? item.volumeSize.replace('Mi', 'MB').replace('Gi', 'GB') : '0'}
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
});

class StatefulCluster extends Component {
  constructor() {
    super()
    this.createDatabaseShow = this.createDatabaseShow.bind(this);
    this.clusterRefresh = this.clusterRefresh.bind(this);
    this.state = {
      detailModal: false,
      putVisible: false,
      currentDatabase: null,
      CreateDatabaseModalShow: false
    }
  }
  clusterRefresh() {
    const _this = this
    const { loadDbCacheList, cluster, clusterType, getProxy } = this.props

    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          _this.setState({
            dbservice: res.data.data
          })
        }
      }
    })
    getProxy(cluster)
    loadDbCacheList(cluster, clusterType)
  }
  componentWillMount() {
    const { loadDbCacheList, cluster, clusterType, getProxy } = this.props
    if (cluster == undefined) {
      let notification = new NotificationHandler()
      notification.error('请选择集群', 'invalid cluster ID')
      return
    }
    getProxy(cluster)
    loadDbCacheList(cluster, clusterType)
  }
  componentDidMount() {
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          this.setState({
            dbservice: res.data.data
          })
        }
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    const { form, current } = nextProps
    if (current.space.namespace === this.props.current.space.namespace && current.cluster.clusterID === this.props.current.cluster.clusterID) {
      return
    }
    this.props.loadDbCacheList(current.cluster.clusterID, this.props.clusterType)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextState.detailModal) {
      this.setState({ putVisible: false })
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
    setTimeout(function () {
      document.getElementById('dbName').focus()
    }, 100);
  }

  handSearch(e) {
    const clusterType = this.props.clusterType
    if (e) {
      this.props.searchDbservice(clusterType, e.target.value)
      return
    }
    const names = this.refs.searchInput.refs.input.value
    this.props.searchDbservice(clusterType, names)
  }

  render() {
    const _this = this;
    const { isFetching, databaseList, clusterType, clusterProxy } = this.props;
    const standard = require('../../../../configs/constants').STANDARD_MODE
    const mode = require('../../../../configs/model').mode
    let title = ''
    const currentCluster = this.props.current.cluster
    const storage_type = currentCluster.storageTypes
    const literal = clusterTable[clusterType]
    let canCreate = true
    if (!storage_type || storage_type.indexOf('rbd') < 0) canCreate = false
    if (!canCreate) {
      title = '尚未部署分布式存储，暂不能创建'
    }
    return (
      <div id='mysqlDatabase'>
        <div className='databaseCol' key={literal.displayName}>
          <Title title={literal.displayName} />
          <div className='databaseHead'>
            {mode === standard ?
              <div className='alertRow'>您的 {literal.displayName} 集群创建在新智云平台，如果帐户余额不足时，1 周内您可以进行充值，继续使用。如无充值，1 周后资源会被彻底销毁，不可恢复。</div> :
              <div></div>}
            <Tooltip title={title} placement="right"><Button type='primary' size='large' onClick={this.createDatabaseShow} disabled={!canCreate}>
              <span><i className='fa fa-plus' />&nbsp;{literal.displayName}集群</span>
            </Button></Tooltip>
            <Button style={{ marginLeft: '20px', padding: '5px 15px' }} size='large' onClick={this.clusterRefresh} disabled={!canCreate}>
              <i className='fa fa-refresh' />&nbsp;刷 新
            </Button>
            <span className='rightSearch'>
              <Input size='large' placeholder='搜索' style={{ width: '180px', paddingRight: '28px' }} ref="searchInput"
                onPressEnter={(e) => this.handSearch(e)} />
              <i className="fa fa-search cursor" onClick={() => this.handSearch()} />
            </span>
          </div>
          <MyComponent scope={_this} isFetching={isFetching} config={databaseList} clusterType={clusterType} canCreate={canCreate} />
        </div>
        <Modal visible={this.state.detailModal}
          className='AppServiceDetail' transitionName='move-right'
          onCancel={() => {
            this.setState({ detailModal: false })
          }}
        >
          <ModalDetail scope={_this} putVisible={_this.state.putVisible} database={this.props.database}
            currentData={this.state.currentData} dbName={this.state.currentDatabase} />
        </Modal>
        <Modal visible={this.state.CreateDatabaseModalShow}
          className='CreateDatabaseModal' maskClosable={false}
          title='创建数据库集群' width={600}
          onCancel={() => {
            this.setState({ CreateDatabaseModalShow: false })
          }}
        >
          <CreateDatabase scope={_this} dbservice={this.state.dbservice} database={clusterType} clusterProxy={clusterProxy}/>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const clusterType = /(?:^|\s)\/database_cache\/(.*?)_cluster(?:\s|$)/g.exec(props.location.pathname)[1]
  const { cluster } = state.entities.current
  const defaultList = {
    isFetching: false,
    cluster: cluster.clusterID,
    database: clusterType,
    databaseList: [],
  }
  const { databaseAllList } = state.databaseCache
  const { database, databaseList, isFetching } = databaseAllList[clusterType] || defaultList
  const { current } = state.entities
  let clusterProxy = state.cluster.proxy.result || {}

  return {
    cluster: cluster.clusterID,
    current,
    database,
    databaseList: databaseList,
    isFetching,
    clusterType,
    clusterProxy,
  }
}

StatefulCluster.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadDbCacheList: PropTypes.func.isRequired,
  loadMyStack: PropTypes.func.isRequired
}

StatefulCluster = injectIntl(StatefulCluster, {
  withRef: true,
})

export default connect(mapStateToProps, {
  loadDbCacheList,
  loadMyStack,
  searchDbservice,
  getProxy,
})(StatefulCluster)