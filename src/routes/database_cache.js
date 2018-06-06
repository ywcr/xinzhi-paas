/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Database cache routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/

const databaseCacheRoutes = [{
  path: 'mysql_cluster',
  component: require('../components/DatabaseCache/MysqlCluster').default,
},
{
  path: 'mongoDB_cluster',
  component: require('../components/DatabaseCache/MongoDB/MongoDBCluster').default,
},
{
  path: 'rdbs_cluster',
  component: require('../components/DatabaseCache/Rdbs/RdbsCluster').default,
},
{
  path: 'redis_cluster',
  component: require('../components/DatabaseCache/Redis/RedisCluster').default,
},
{
  path: 'zookeeper_cluster',
  component: require('../components/DatabaseCache/Stateful/StatefulCluster').default,
},
{
  path: 'elasticsearch_cluster',
  component: require('../components/DatabaseCache/Stateful/StatefulCluster').default,
},
{
  path: 'etcd_cluster',
  component: require('../components/DatabaseCache/Stateful/StatefulCluster').default,
}]

export default databaseCacheRoutes