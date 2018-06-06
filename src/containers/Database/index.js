/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Database component
 *
 * v0.1 - 2016-10-11
 * @author Bai Yu
 */


import React, { Component, PropTypes } from 'react'
import SecondSider from '../../components/SecondSider'
import QueueAnim from 'rc-queue-anim'
import './style/database.less'

const menuList = [
  {
    url: '/database_cache/rdbs_cluster',
    name: '关系型数据库'
  },
  {
    url: '/database_cache/mongoDB_cluster',
    name: 'MongoDB'
  },
  {
    url: '/database_cache/redis_cluster',
    name: '缓存'
  },

  // {
  //   url: '/database_cache/zookeeper_cluster',
  //   name: 'ZooKeeper'
  // },

  // {
  //   url: '/database_cache/elasticsearch_cluster',
  //   name: 'ElasticSearch'
  // },

  // {
  //   url: '/database_cache/etcd_cluster',
  //   name: 'Etcd'
  // }
 
]

export default class Database extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }
  
  render() {
    const { children } = this.props
    const scope = this
    return (
      <div id="Database">
        <QueueAnim 
          className="DatabaseSider" 
          key="DatabaseSider" 
          type="left"
          >
          <div className={ this.state.containerSiderStyle == 'normal' ? 'DatabaseMenu CommonSecondMenu' : 'hiddenMenu DatabaseMenu CommonSecondMenu'} key='databaseSider'>
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={ this.state.containerSiderStyle == 'normal' ? 'DatabaseContent CommonSecondContent' : 'hiddenContent DatabaseContent CommonSecondContent' } >
          { children }
        </div>
      </div>
    )
  }
}

Database.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}