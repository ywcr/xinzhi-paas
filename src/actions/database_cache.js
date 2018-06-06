/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for database cache
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const GET_DATABASE_CACHE_ALL_NAME_REQUEST = 'GET_DATABASE_CACHE_ALL_NAME_REQUEST'
export const GET_DATABASE_CACHE_ALL_NAME_SUCCESS = 'GET_DATABASE_CACHE_ALL_NAME_SUCCESS'
export const GET_DATABASE_CACHE_ALL_NAME_FAILURE = 'GET_DATABASE_CACHE_ALL_NAME_FAILURE'

function fetchDbCacheAllNames(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_CACHE_ALL_NAME_REQUEST, GET_DATABASE_CACHE_ALL_NAME_SUCCESS, GET_DATABASE_CACHE_ALL_NAME_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/getAllDbNames`,
      schema: {}
    },
    callback
  }
}

export function loadDbCacheAllNames(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchDbCacheAllNames(cluster, callback))
  }
}

export const GET_DATABASE_CACHE_ALL_LIST_REQUEST = 'GET_DATABASE_CACHE_ALL_LIST_REQUEST'
export const GET_DATABASE_CACHE_ALL_LIST_SUCCESS = 'GET_DATABASE_CACHE_ALL_LIST_SUCCESS'
export const GET_DATABASE_CACHE_ALL_LIST_FAILURE = 'GET_DATABASE_CACHE_ALL_LIST_FAILURE'
// MYSQL_DATABASE_CACHE_ALL_LIST_REQUEST
function fetchDbCacheList(cluster, types, callback,type) {
  if (!types) types='mysql'
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_CACHE_ALL_LIST_REQUEST, GET_DATABASE_CACHE_ALL_LIST_SUCCESS, GET_DATABASE_CACHE_ALL_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/dbservices?type=${types}`,
      schema: {}
    },
    types,
    callback
  }
}
export function loadDbCacheList(cluster, types, callback,type) {
    return (dispatch) => {
        return dispatch(fetchDbCacheList(cluster, types, callback,type))
    }
}

export const GET_DATABASE_STATE_ALL_LIST_REQUEST = 'GET_DATABASE_STATE_ALL_LIST_REQUEST'
export const GET_DATABASE_STATE_ALL_LIST_SUCCESS = 'GET_DATABASE_STATE_ALL_LIST_SUCCESS'
export const GET_DATABASE_STATE_ALL_LIST_FAILURE = 'GET_DATABASE_STATE_ALL_LIST_FAILURE'
// MYSQL_DATABASE_CACHE_ALL_LIST_REQUEST
function fetchStateList(cluster, types, callback) {
  if (!types) types='mysql'
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_STATE_ALL_LIST_REQUEST, GET_DATABASE_STATE_ALL_LIST_SUCCESS, GET_DATABASE_STATE_ALL_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/statefulsets?type=${types}`,
      schema: {}
    },
    types,
    callback
  }
}
export function loadStatefulsets(cluster, types, callback) {
    return (dispatch) => {
        return dispatch(fetchStateList(cluster, types, callback))
    }
}


// Get redis list.
export const GET_DATABASE_CACHE_ALL_REDIS_LIST_REQUEST = 'GET_DATABASE_CACHE_ALL_REDIS_LIST_REQUEST'
export const GET_DATABASE_CACHE_ALL_REDIS_LIST_SUCCESS = 'GET_DATABASE_CACHE_ALL_REDIS_LIST_SUCCESS'
export const GET_DATABASE_CACHE_ALL_REDIS_LIST_FAILURE = 'GET_DATABASE_CACHE_ALL_REDIS_LIST_FAILURE'

function fetchDbCacheRedisList(cluster, types,type, callback,sqlId) {
  if (!types) types='mysql'
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_CACHE_ALL_REDIS_LIST_REQUEST, GET_DATABASE_CACHE_ALL_REDIS_LIST_SUCCESS, GET_DATABASE_CACHE_ALL_REDIS_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${type}?page=0&size=100`,
      schema: {}
    },
    types,
    callback
  }
}

export function loadDbCacheRedisList(cluster, types,type, callback,sqlId) {
  return (dispatch) => {
    return dispatch(fetchDbCacheRedisList(cluster, types,type, callback,sqlId))
  }
}


/*获取备份列表*/
export const GET_DATABASE_CACHE_ALL_BACKUP_LIST_REQUEST = 'GET_DATABASE_CACHE_ALL_BACKUP_LIST_REQUEST'
export const GET_DATABASE_CACHE_ALL_BACKUP_LIST_SUCCESS = 'GET_DATABASE_CACHE_ALL_BACKUP_LIST_SUCCESS'
export const GET_DATABASE_CACHE_ALL_BACKUP_LIST_FAILURE = 'GET_DATABASE_CACHE_ALL_BACKUP_LIST_FAILURE'

export function fetch_backup_list(cluster,id,callback) {
    // if (!types) types='mysql'
    return {
        cluster,
        [FETCH_API]: {
            types: [GET_DATABASE_CACHE_ALL_BACKUP_LIST_REQUEST, GET_DATABASE_CACHE_ALL_BACKUP_LIST_SUCCESS, GET_DATABASE_CACHE_ALL_BACKUP_LIST_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}/snapshots/${id}?type=1&page=0&size=100`,
            schema: {}
        },
        callback
    }
}
// export function getDatabaseBackUpList(cluster,id,callback) {
//
//     return (dispatch) => {
//         return dispatch(fetch_backup_list(cluster,id,callback))
//     }
// }


export const GET_DATABASE_SINGLE_LIST_REQUEST = 'GET_DATABASE_SINGLE_LIST_REQUEST'
export const GET_DATABASE_SINGLE_LIST_SUCCESS = 'GET_DATABASE_SINGLE_LIST_SUCCESS'
export const GET_DATABASE_SINGLE_LIST_FAILURE = 'GET_DATABASE_SINGLE_LIST_FAILURE'

function fetchDbSingleList(cluster, types,type,id,callback) {
    if (!types) types='mysql'
    return {
        cluster,
        [FETCH_API]: {
            types: [GET_DATABASE_SINGLE_LIST_REQUEST, GET_DATABASE_SINGLE_LIST_SUCCESS, GET_DATABASE_SINGLE_LIST_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${type}/list?id=${id}&page=0&size=100`,
            schema: {}
        },
        types,
        callback
    }
}

export function getSingleList(cluster, types,type, callback,sqlId) {
    return (dispatch) => {
        return dispatch(fetchDbSingleList(cluster, types,type, callback,sqlId))
    }
}




export const GET_DATABASE_CACHE_MONITOR_REQUEST = "GET_DATABASE_CACHE_MONITOR_REQUEST"
export const GET_DATABASE_CACHE_MONITOR_SUCCESS = "GET_DATABASE_CACHE_MONITOR_SUCCESS"
export const GET_DATABASE_CACHE_MONITOR_FAILURE = "GET_DATABASE_CACHE_MONITOR_FAILURE"

function getMonitorList(cluster,types,nodeId,step,engine,role,interval,callback,type){
  //step,engine,role,interval  role mongo 不用传 engine mysql 需要传 其他的不需要
  // cluster 集群id
  // node rdb的节点的id
  // step 数据间隔时间，有效值为：5m, 15m, 2h, 1d (m 表示分钟，h 表示小时，d 表示天) 注解 若请求最近15天以内的数据，数据间隔最小可以到5m；若请求15天以上的数据，数据间隔可选2h 或 1d
  // role 角色 master topslave proxy三种类型之一
  // interval 监控周期时长 6h 6小时 1d 1天 2w 两周 1m 1月 6m 6月 10s 10秒（实时）
  if (!types) types = 'caches'
  return {
    cluster,
    [FETCH_API]:{
      types: [GET_DATABASE_CACHE_MONITOR_REQUEST,GET_DATABASE_CACHE_MONITOR_SUCCESS,GET_DATABASE_CACHE_MONITOR_FAILURE],
      endpoint:`${API_URL_PREFIX}/clusters/${cluster}/${types}/${nodeId}/monitor?type=${type}&page=0&size=100&step=${step?step:'15m'}&engine=${engine?engine:''}&role=${role?role:''}&interval=${interval?interval:'6h'}`,
      schema:{}
    },
    types,callback
  }
}
export function MonitorList(cluster,types,nodeId,step,engine,role,interval,callback,type){
    return (dispatch) => {
        return dispatch(getMonitorList(cluster,types,nodeId,step,engine,role,interval,callback,type))
    }
}


export const GET_DATABASE_CACHE_METRIC_MONITOR_REQUEST = "GET_DATABASE_CACHE_MONITOR_METRIC_REQUEST"
export const GET_DATABASE_CACHE_METRIC_MONITOR_SUCCESS = "GET_DATABASE_CACHE_MONITOR_METRIC_SUCCESS"
export const GET_DATABASE_CACHE_METRIC_MONITOR_FAILURE = "GET_DATABASE_CACHE_MONITOR_METRIC_FAILURE"

function getMonitorMetricList(cluster,types,nodeId,metric,step,engine,role,interval,callback,type){
    //step,engine,role,interval  role mongo 不用传 engine mysql 需要传 其他的不需要
    // cluster 集群id
    // node rdb的节点的id
    // step 数据间隔时间，有效值为：5m, 15m, 2h, 1d (m 表示分钟，h 表示小时，d 表示天) 注解 若请求最近15天以内的数据，数据间隔最小可以到5m；若请求15天以上的数据，数据间隔可选2h 或 1d
    // role 角色 master topslave proxy三种类型之一
    // interval 监控周期时长 6h 6小时 1d 1天 2w 两周 1m 1月 6m 6月 10s 10秒（实时）
    if (!types) types = 'caches'
    return {
        cluster,
        [FETCH_API]:{
            types: [GET_DATABASE_CACHE_METRIC_MONITOR_REQUEST,GET_DATABASE_CACHE_METRIC_MONITOR_SUCCESS,GET_DATABASE_CACHE_METRIC_MONITOR_FAILURE],
            endpoint:`${API_URL_PREFIX}/clusters/${cluster}/${types}/${nodeId}/monitor/list?type=${type}&metric=${metric}&page=0&size=100&step=${step?step:'15m'}&engine=${engine?engine:''}&role=${role?role:''}&interval=${interval?interval:'6h'}`,
            schema:{}
        },
        types,callback
    }
}
export function MonitorMetricList(cluster,types,nodeId,metric,step,engine,role,interval,callback,type){
  return (dispatch) => {
    return dispatch(getMonitorMetricList(cluster,types,nodeId,metric,step,engine,role,interval,callback,type))
  }
}

//GET NODE LIST 
export const GET_DATABASE_CACHE_ALL_RDBS_LIST_REQUEST = 'GET_DATABASE_CACHE_ALL_RDBS_LIST_REQUEST'
export const GET_DATABASE_CACHE_ALL_RDBS_LIST_SUCCESS = 'GET_DATABASE_CACHE_ALL_RDBS_LIST_SUCCESS'
export const GET_DATABASE_CACHE_ALL_RDBS_LIST_FAILURE = 'GET_DATABASE_CACHE_ALL_RDBS_LIST_FAILURE'

function fetchDbNodeList(cluster, types,type, callback) {
  if (!types) types='mysql'
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_CACHE_ALL_RDBS_LIST_REQUEST, GET_DATABASE_CACHE_ALL_RDBS_LIST_SUCCESS, GET_DATABASE_CACHE_ALL_RDBS_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${type}?page=0&size=100`,
      schema: {}
    },
    types,
    callback
  }
}

export function gitNode(cluster, types,type, callback) {
  return (dispatch) => {
    return dispatch(fetchDbNodeList(cluster, types,type, callback))
  }
}

// Get redis config list.
export const GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_REQUEST = 'GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_REQUEST'
export const GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_SUCCESS = 'GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_SUCCESS'
export const GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_FAILURE = 'GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_FAILURE'
// MYSQL_DATABASE_CACHE_ALL_LIST_REQUEST
function fetchDbCacheRedisConfigList(cluster, types, callback) {
  if (!types) types='mysql'
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_REQUEST, GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_SUCCESS, GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/cacheParameterGroups/list?page=0&size=100`,
      schema: {}
    },
    types,
    callback
  }
}

export function loadDbCacheRedisConfigList(cluster, types, callback) {
  return (dispatch) => {
    return dispatch(fetchDbCacheRedisConfigList(cluster, types, callback))
  }
}

export const UPDATE_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_REQUEST = 'UPDATE_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_REQUEST'
export const UPDATE_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_SUCCESS = 'UPDATE_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_SUCCESS'
export const UPDATE_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_FAILURE = 'UPDATE_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_FAILURE'
// MYSQL_DATABASE_CACHE_ALL_LIST_REQUEST
function fetchDbCacheRedisUpdateConfig(body, types,id , callback) {
  if (!types) types='mysql'
  return {
    cluster:body.cluster,
    [FETCH_API]: {
      types: [UPDATE_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_REQUEST, UPDATE_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_SUCCESS, UPDATE_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${body.cluster}/updateConfig/${id}`,
      options: {
        method: 'PUT',
        body: body
      },
      schema: {}
    },
    callback
  }
}

export function updateDbCacheRedisConfigList(cluster, types,id, callback) {
  return (dispatch) => {
    return dispatch(fetchDbCacheRedisUpdateConfig(cluster, types,id, callback))
  }
}

export const REDIS_DATABASE_CACHE_ALL_LIST_REQUEST = 'REDIS_DATABASE_CACHE_ALL_LIST_REQUEST'
export const REDIS_DATABASE_CACHE_ALL_LIST_SUCCESS = 'REDIS_DATABASE_CACHE_ALL_LIST_SUCCESS'
export const REDIS_DATABASE_CACHE_ALL_LIST_FAILURE = 'REDIS_DATABASE_CACHE_ALL_LIST_FAILURE'

function fetchRedisDbCacheAllList(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [REDIS_DATABASE_CACHE_ALL_LIST_REQUEST, REDIS_DATABASE_CACHE_ALL_LIST_SUCCESS, REDIS_DATABASE_CACHE_ALL_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/getRedis`,
      schema: {}
    },
    callback
  }
}

export function loadRedisDbCacheAllList(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchRedisDbCacheAllList(cluster, callback))
  }
}

export const CREATE_DATABASE_CACHE_REDIS_REQUEST = 'CREATE_DATABASE_CACHE_REDIS_REQUEST'
export const CREATE_DATABASE_CACHE_REDIS_SUCCESS = 'CREATE_DATABASE_CACHE_REDIS_SUCCESS'
export const CREATE_DATABASE_CACHE_REDIS_FAILURE = 'CREATE_DATABASE_CACHE_REDIS_FAILURE'

function fetchCreateDbRedisCluster(newDb,type,callback) {// 缓存创建

  return {
    cluster: newDb.cluster,
    [FETCH_API]: {
      types: [CREATE_DATABASE_CACHE_REDIS_REQUEST, CREATE_DATABASE_CACHE_REDIS_SUCCESS, CREATE_DATABASE_CACHE_REDIS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${newDb.cluster}/${type}`,
      options: {
        method: 'POST',
        body: newDb
      },
      schema: {}
    },
    callback
  }
}
export function CreateDbRedisCluster(newDb,type,callback) {
  return (dispatch) => {
    return dispatch(fetchCreateDbRedisCluster(newDb,type,callback))
  }
}
// Yaowei ----------清除节点列表数据----------- 
export const NODES_CLEAR_DATABASE_LIST = "NODES_CLEAR_DATABASE_LIST"
export function ClearNodeList(types) {
  return {
    type: NODES_CLEAR_DATABASE_LIST,
    types
  }
}
/*========获取DATABASE节点=========&dujingya*/
export const MONGODB_DATABASE_NODE_REQUEST = 'MONGODB_DATABASE_NODE_REQUEST'
export const MONGODB_DATABASE_NODE_SUCCESS = 'MONGODB_DATABASE_NODE_SUCCESS'
export const MONGODB_DATABASE_NODE_FAILURE = 'MONGODB_DATABASE_NODE_FAILURE'

function foadMongoDbNodesCluster(cluster,types,mongoId,callback) {// 缓存创建

    return {
        cluster: cluster,
        [FETCH_API]: {
            types: [MONGODB_DATABASE_NODE_REQUEST, MONGODB_DATABASE_NODE_SUCCESS, MONGODB_DATABASE_NODE_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${types}/${mongoId}/nodes?page=0&size=100`,
            schema: {}
        },
        types,
        callback
    }
}
export function MongoDbNodesCluster(cluster,types,mongoId,callback) {
    return (dispatch) => {
        return dispatch(foadMongoDbNodesCluster(cluster,types,mongoId,callback))
    }
}


/*===========获取节点监控========== &dujingya*/

export const MONGODB_DATABASE_NODE_MONITOR_REQUEST = 'MONGODB_DATABASE_NODE_MONITOR_REQUEST'
export const MONGODB_DATABASE_NODE_MONITOR_SUCCESS = 'MONGODB_DATABASE_NODE_MONITOR_SUCCESS'
export const MONGODB_DATABASE_NODE_MONITOR_FAILURE = 'MONGODB_DATABASE_NODE_MONITOR_FAILURE'

function DatabaseNodesMonitorCluster(cluster,types,ID,callback) {// 缓存创建
    const step='',engine='',role='',interval=''

    return {
        cluster: cluster,
        [FETCH_API]: {
            types: [MONGODB_DATABASE_NODE_MONITOR_REQUEST, MONGODB_DATABASE_NODE_MONITOR_SUCCESS, MONGODB_DATABASE_NODE_MONITOR_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${types}/${ID}/monitor?page=0&size=100&step=${step}&engine=${types}&role=${role}&interval=${interval}`,
            schema: {}
        },
        types,
        callback
    }
}
export function NodesMonitorCluster(cluster,types,ID,callback) {
    return (dispatch) => {
        return dispatch(DatabaseNodesMonitorCluster(cluster,types,ID,callback))
    }
}



export const RDBS_DATABASE_NODE_REQUEST = 'RDBS_DATABASE_NODE_REQUEST'
export const RDBS_DATABASE_NODE_SUCCESS = 'RDBS_DATABASE_NODE_SUCCESS'
export const RDBS_DATABASE_NODE_FAILURE = 'RDBS_DATABASE_NODE_FAILURE'

function foadRdbsDbNodesCluster(cluster,types,rdbId,callback) {// 缓存创建

    return {
        cluster: cluster,
        [FETCH_API]: {
            types: [RDBS_DATABASE_NODE_REQUEST, RDBS_DATABASE_NODE_SUCCESS, RDBS_DATABASE_NODE_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${types}/${rdbId}/nodes?page=0&size=100`,
            schema: {}
        },
        types,
        callback
    }
}
export function RdbsNodesCluster(cluster,types,rdbId,callback) {
    return (dispatch) => {
        return dispatch(foadRdbsDbNodesCluster(cluster,types,rdbId,callback))
    }
}

//parameters 
export const RDBS_DATABASE_PARAMETERS_REQUEST = 'RDBS_DATABASE_PARAMETERS_REQUEST'
export const RDBS_DATABASE_PARAMETERS_SUCCESS = 'RDBS_DATABASE_PARAMETERS_SUCCESS'
export const RDBS_DATABASE_PARAMETERS_FAILURE = 'RDBS_DATABASE_PARAMETERS_FAILURE'

function foadRdbsParametersCluster(cluster,types,id,callback) {// 缓存创建

    return {
        cluster: cluster,
        [FETCH_API]: {
            types: [RDBS_DATABASE_PARAMETERS_REQUEST, RDBS_DATABASE_PARAMETERS_SUCCESS, RDBS_DATABASE_PARAMETERS_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${types}/${id}/parameters`,
            schema: {}
        },
        types,
        callback
    }
}

export function RdbsParametersCluster(cluster,types,id,callback) {
    return (dispatch) => {
        return dispatch(foadRdbsParametersCluster(cluster,types,id,callback))
    }
}

//addnode 
export const RDBS_ADD_NODE_PARAMETERS_REQUEST = 'RDBS_ADD_NODE_PARAMETERS_REQUEST'
export const RDBS_ADD_NODE_PARAMETERS_SUCCESS = 'RDBS_ADD_NODE_PARAMETERS_SUCCESS'
export const RDBS_ADD_NODE_PARAMETERS_FAILURE = 'RDBS_ADD_NODE_PARAMETERS_FAILURE'

function foadRdbsAddNodeCluster(cluster,types,mongoId,nodecount ,callback) {// 缓存创建
    return {
        cluster: cluster,
        [FETCH_API]: {
            types: [RDBS_ADD_NODE_PARAMETERS_REQUEST, RDBS_ADD_NODE_PARAMETERS_SUCCESS, RDBS_ADD_NODE_PARAMETERS_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${types}/${mongoId}/nodes?role=${nodecount}`,
            options: {
              // headers: { teamspace: newDb.teamspace },
              method: 'POST',
              // body: newDb
            },
            schema: {}
        },
        
        callback
    }
}

export function RdbsAddNodeCluster(cluster,types,mongoId,nodecount,callback) {
    return (dispatch) => {
        return dispatch(foadRdbsAddNodeCluster(cluster,types,mongoId,nodecount,callback))
    }
}

export const RDBS_DATABASE_MODIFY_PARAMETERS_REQUEST = 'RDBS_DATABASE_MODIFY_PARAMETERS_REQUEST'
export const RDBS_DATABASE_MODIFY_PARAMETERS_SUCCESS = 'RDBS_DATABASE_MODIFY_PARAMETERS_SUCCESS'
export const RDBS_DATABASE_MODIFY_PARAMETERS_FAILURE = 'RDBS_DATABASE_MODIFY_PARAMETERS_FAILURE'

function foadRdbsModifyParametersCluster(parameters,cluster,types,mongoId,callback) {// 缓存创建
    return {
        cluster: cluster,
        [FETCH_API]: {
            types: [RDBS_DATABASE_MODIFY_PARAMETERS_REQUEST, RDBS_DATABASE_MODIFY_PARAMETERS_SUCCESS, RDBS_DATABASE_MODIFY_PARAMETERS_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${types}/${mongoId}/parameters`,
            options: {
                method: 'PUT',
                body: parameters
            },
            schema: {}
        },
        types,
        callback
    }
}
export function RdbsModifyParametersCluster(parameters,cluster,types,mongoId,callback) {
    return (dispatch) => {
        return dispatch(foadRdbsModifyParametersCluster(parameters,cluster,types,mongoId,callback))
    }
}


export const CREATE_DATABASE_CACHE_REQUEST = 'CREATE_DATABASE_CACHE_REQUEST'
export const CREATE_DATABASE_CACHE_SUCCESS = 'CREATE_DATABASE_CACHE_SUCCESS'
export const CREATE_DATABASE_CACHE_FAILURE = 'CREATE_DATABASE_CACHE_FAILURE'

function fetchCreateDbCluster(newDb, callback,type) {
  return {
    cluster: newDb.cluster,
    [FETCH_API]: {
      types: [CREATE_DATABASE_CACHE_REQUEST, CREATE_DATABASE_CACHE_SUCCESS, CREATE_DATABASE_CACHE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${newDb.cluster}/dbservices?type=${type}`,
      options: {
        headers: { teamspace: newDb.teamspace },
        method: 'POST',
        body: newDb
      },
      schema: {}
    },
    callback
  }
}

export function CreateDbCluster(newDb, callback,type) {
  return (dispatch) => {
    return dispatch(fetchCreateDbCluster(newDb, callback,type))
  }
}

export const CREATE_REDIS_DATABASE_CACHE_REQUEST = 'CREATE_REDIS_DATABASE_CACHE_REQUEST'
export const CREATE_REDIS_DATABASE_CACHE_SUCCESS = 'CREATE_REDIS_DATABASE_CACHE_SUCCESS'
export const CREATE_REDIS_DATABASE_CACHE_FAILURE = 'CREATE_REDIS_DATABASE_CACHE_FAILURE'

function createRedisDbCluster(newDb, callback) {
  return {
    cluster: newDb.cluster,
    [FETCH_API]: {
      types: [CREATE_REDIS_DATABASE_CACHE_REQUEST, CREATE_REDIS_DATABASE_CACHE_SUCCESS, CREATE_REDIS_DATABASE_CACHE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${newDb.cluster}/createRedisCluster`,
      options: {
        method: 'POST',
        body: {
          name: newDb.name,
          servicesNum: newDb.servicesNum
        }
      },
      schema: {}
    },
    callback
  }
}

export function postCreateRedisDbCluster(newDb, callback) {
  return (dispatch) => {
    return dispatch(createRedisDbCluster(newDb, callback))
  }
}


/*数据库集群备份*/

export const CREATE_REDIS_DATABASE_BACKUP_REQUEST = 'CREATE_REDIS_DATABASE_BACKUP_REQUEST'
export const CREATE_REDIS_DATABASE_BACKUP_SUCCESS = 'CREATE_REDIS_DATABASE_BACKUP_SUCCESS'
export const CREATE_REDIS_DATABASE_BACKUP_FAILURE = 'CREATE_REDIS_DATABASE_BACKUP_FAILURE'

export function backUpCluster(body, callback) {
    return {
        cluster: body.cluster,
        [FETCH_API]: {
            types: [CREATE_REDIS_DATABASE_BACKUP_REQUEST,CREATE_REDIS_DATABASE_BACKUP_SUCCESS,CREATE_REDIS_DATABASE_BACKUP_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${body.cluster}/snapshots`,
            options: {
                method: 'POST',
                body: {
                    is_full:body.is_full,
                    resources:body.resources,
                    snapshot_name:body.snapshot_name
                }
            },
            schema: {}
        },
        callback
    }
}

// export function dataBaseBackUp(body, callback) {
//     return (dispatch) => {
//         return dispatch(backUpCluster(body, callback))
//     }
// }



export const GET_STATE_DETAIL_INFO_REQUEST = 'GET_STATE_DETAIL_INFO_REQUEST'
export const GET_STATE_DETAIL_INFO_SUCCESS = 'GET_STATE_DETAIL_INFO_SUCCESS'
export const GET_STATE_DETAIL_INFO_FAILURE = 'GET_STATE_DETAIL_INFO_FAILURE'

function getStateDetail(cluster, dbName, needLoading, callback,type) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_STATE_DETAIL_INFO_REQUEST, GET_STATE_DETAIL_INFO_SUCCESS, GET_STATE_DETAIL_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/stateDetail/${dbName}?type=${type}`,
      schema: {}
    },
    callback,
    needLoading
  }
}

export function loadStateDetail(cluster, dbName, needLoading, callback,type) {
  if(typeof needLoading != 'boolean') {
    callback = needLoading
    needLoading = true
  }
  return (dispatch) => {
    return dispatch(getStateDetail(cluster, dbName, needLoading, callback,type))
  }
}

export const GET_DATABASE_DETAIL_INFO_REQUEST = 'GET_DATABASE_DETAIL_INFO_REQUEST'
export const GET_DATABASE_DETAIL_INFO_SUCCESS = 'GET_DATABASE_DETAIL_INFO_SUCCESS'
export const GET_DATABASE_DETAIL_INFO_FAILURE = 'GET_DATABASE_DETAIL_INFO_FAILURE'

function getDbClusterDetail(cluster, dbName, needLoading, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_DETAIL_INFO_REQUEST, GET_DATABASE_DETAIL_INFO_SUCCESS, GET_DATABASE_DETAIL_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/dbservices/${dbName}`,
      schema: {}
    },
    callback,
    needLoading
  }
}

export function loadDbClusterDetail(cluster, dbName, needLoading, callback) {
  if(typeof needLoading != 'boolean') {
    callback = needLoading
    needLoading = true
  }
  return (dispatch) => {
    return dispatch(getDbClusterDetail(cluster, dbName, needLoading, callback))
  }
}

export const UPDATA_DATABASE_DETAIL_INFO_REQUEST = 'UPDATA_DATABASE_DETAIL_INFO_REQUEST'
export const UPDATA_DATABASE_DETAIL_INFO_SUCCESS = 'UPDATA_DATABASE_DETAIL_INFO_SUCCESS'
export const UPDATA_DATABASE_DETAIL_INFO_FAILURE = 'UPDATA_DATABASE_DETAIL_INFO_FAILURE'

function fetchPutDbClusterDetail(cluster, dbName, replicas, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATA_DATABASE_DETAIL_INFO_REQUEST, UPDATA_DATABASE_DETAIL_INFO_SUCCESS, UPDATA_DATABASE_DETAIL_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/dbservices/${dbName}`,
      options: {
        method: 'PATCH',
        body: {'replicas': replicas}
      },
      schema: {}
    },
    dbName,
    callback
  }
}

export function putDbClusterDetail(cluster, dbName, replicas, callback) {
  return (dispatch) => {
    return dispatch(fetchPutDbClusterDetail(cluster, dbName, replicas, callback))
  }
}


export const UPDATA_STATE_DETAIL_INFO_REQUEST = 'UPDATA_STATE_DETAIL_INFO_REQUEST'
export const UPDATA_STATE_DETAIL_INFO_SUCCESS = 'UPDATA_STATE_DETAIL_INFO_SUCCESS'
export const UPDATA_STATE_DETAIL_INFO_FAILURE = 'UPDATA_STATE_DETAIL_INFO_FAILURE'

function fetchPutStateDetail(cluster, dbName, replicas, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATA_STATE_DETAIL_INFO_REQUEST, UPDATA_STATE_DETAIL_INFO_SUCCESS, UPDATA_STATE_DETAIL_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/statefulsets/${dbName}?replicas=${replicas}`,
      options: {
        method: 'PUT',
        body: {'replicas': replicas}
      },
      schema: {}
    },
    dbName,
    callback
  }
}

export function putStateDetail(cluster, dbName, replicas, callback) {
  return (dispatch) => {
    return dispatch(fetchPutStateDetail(cluster, dbName, replicas, callback))
  }
}


export const UPDATA_DATABASE_VERB_INFO_REQUEST = 'UPDATA_DATABASE_VERB_INFO_REQUEST'
export const UPDATA_DATABASE_VERB_INFO_SUCCESS = 'UPDATA_DATABASE_VERB_INFO_SUCCESS'
export const UPDATA_DATABASE_VERB_INFO_FAILURE = 'UPDATA_DATABASE_VERB_INFO_FAILURE'

function fetchPutCacheVerb(cluster, cacheId,verb, data, type,callback) {
  return {
    [FETCH_API]: {
      types: [UPDATA_DATABASE_VERB_INFO_REQUEST, UPDATA_DATABASE_VERB_INFO_SUCCESS, UPDATA_DATABASE_VERB_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${type}/${cacheId}/${verb}`,
      options: {
        method: 'PUT',
        body: data
      },
      schema: {}
    },
    cacheId,
    verb,
    data,
    callback,
    dataType:type
  }
}

export function putPutCacheVerb(cluster, cacheId,verb, data,type, callback) {
  return (dispatch) => {
    return dispatch(fetchPutCacheVerb(cluster, cacheId,verb, data,type, callback))
  }
}

export const DELETE_DATABASE_CACHE_REQUEST = 'DELETE_DATABASE_CACHE_REQUEST'
export const DELETE_DATABASE_CACHE_SUCCESS = 'DELETE_DATABASE_CACHE_SUCCESS'
export const DELETE_DATABASE_CACHE_FAILURE = 'DELETE_DATABASE_CACHE_FAILURE'

function deleteDbCluster(cluster, dbName, clusterTypes ,callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [DELETE_DATABASE_CACHE_REQUEST, DELETE_DATABASE_CACHE_SUCCESS, DELETE_DATABASE_CACHE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/dbservices/${dbName}`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    types: clusterTypes,
    dbName,
    callback
  }
}

export function deleteDatabaseCluster(cluster, dbName, clusterTypes ,callback) {
  return (dispatch) => {
    return dispatch(deleteDbCluster(cluster, dbName, clusterTypes , callback))
  }
}

export const DELETE_STATE_REQUEST = 'DELETE_STATE_REQUEST'
export const DELETE_STATE_SUCCESS = 'DELETE_STATE_SUCCESS'
export const DELETE_STATE_FAILURE = 'DELETE_STATE_FAILURE'

function deleteStateList(cluster, dbName, clusterTypes ,callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [DELETE_STATE_REQUEST, DELETE_STATE_SUCCESS, DELETE_STATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/statefulsets/${dbName}`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    types: clusterTypes,
    dbName,
    callback
  }
}

export function deleteStateData(cluster, dbName, clusterTypes ,callback) {
  return (dispatch) => {
    return dispatch(deleteStateList(cluster, dbName, clusterTypes , callback))
  }
}


export const DELETE_DATABASE_CACHE_REDISCONFIG_REQUEST = 'DELETE_DATABASE_CACHE_REDISCONFIG_REQUEST'
export const DELETE_DATABASE_CACHE_REDISCONFIG_SUCCESS = 'DELETE_DATABASE_CACHE_REDISCONFIG_SUCCESS'
export const DELETE_DATABASE_CACHE_REDISCONFIG_FAILURE = 'DELETE_DATABASE_CACHE_REDISCONFIG_FAILURE'

function deleteRedisConfigCluster(cluster, deleteId,types,callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [DELETE_DATABASE_CACHE_REDISCONFIG_REQUEST, DELETE_DATABASE_CACHE_REDISCONFIG_SUCCESS, DELETE_DATABASE_CACHE_REDISCONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/cacheParameterGroups/${deleteId}`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    deleteId,
    types,
    callback
  }
}


export function deleteDatabaseConfigRedis(cluster, deleteId,types ,callback) {
  return (dispatch) => {
    return dispatch(deleteRedisConfigCluster(cluster, deleteId,types ,callback))
  }
}

export const DELETE_DATABASE_CACHE_REDIS_REQUEST = 'DELETE_DATABASE_CACHE_REDIS_REQUEST'
export const DELETE_DATABASE_CACHE_REDIS_SUCCESS = 'DELETE_DATABASE_CACHE_REDIS_SUCCESS'
export const DELETE_DATABASE_CACHE_REDIS_FAILURE = 'DELETE_DATABASE_CACHE_REDIS_FAILURE'

function deleteRedisCluster(cluster, deleteId,type,callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [DELETE_DATABASE_CACHE_REDIS_REQUEST, DELETE_DATABASE_CACHE_REDIS_SUCCESS, DELETE_DATABASE_CACHE_REDIS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${type}/${deleteId}`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    deleteId,
    callback,
      dataType:type
  }
}


export function deleteDatabaseRedis(cluster, deleteId, type ,callback) {
  return (dispatch) => {
    return dispatch(deleteRedisCluster(cluster, deleteId, type ,callback))
  }
}


export const DELETE_DATABASE_BACKUP_REQUEST = 'DELETE_DATABASE_BACKUP_REQUEST'
export const DELETE_DATABASE_BACKUP_SUCCESS = 'DELETE_DATABASE_BACKUP_SUCCESS'
export const DELETE_DATABASE_BACKUP_FAILURE = 'DELETE_DATABASE_BACKUP_FAILURE'

function deleteBackupCluster(cluster, deleteId,callback) {
    return {
        cluster,
        [FETCH_API]: {
            types: [DELETE_DATABASE_BACKUP_REQUEST, DELETE_DATABASE_BACKUP_SUCCESS, DELETE_DATABASE_BACKUP_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}/snapshots/${deleteId}`,
            options: {
                method: 'DELETE'
            },
            schema: {}
        },
        deleteId,
        callback
    }
}


export function deleteBackupList(cluster, deleteId ,callback) {
    return (dispatch) => {
        return dispatch(deleteBackupCluster(cluster, deleteId ,callback))
    }
}

// deleteNodeBackupList
export const Node_DELETE_DATABASE_BACKUP_REQUEST = 'Node_DELETE_DATABASE_BACKUP_REQUEST'
export const Node_DELETE_DATABASE_BACKUP_SUCCESS = 'Node_DELETE_DATABASE_BACKUP_SUCCESS'
export const Node_DELETE_DATABASE_BACKUP_FAILURE = 'Node_DELETE_DATABASE_BACKUP_FAILURE'
 

function deleteNodeBackupCluster(cluster,type,deleteId, rdbInstanceId ,callback) {
    return {
        cluster,
        [FETCH_API]: {
           types: [Node_DELETE_DATABASE_BACKUP_REQUEST, Node_DELETE_DATABASE_BACKUP_SUCCESS, Node_DELETE_DATABASE_BACKUP_FAILURE],
           endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${type}/${deleteId}/nodes/${rdbInstanceId}`,
           // I/api/v2/clusters/:cluster/rdbs/:rdb/nodes/:node
            options: {
                method: 'DELETE'
            },
            schema: {}
        },
        deleteId,
        callback
    }
}
export function deleteNodeBackupList(cluster,type, deleteId ,rdbInstanceId,callback) {
  // cluster,item.rdbId, item.rdbInstanceId
    return (dispatch) => {
        return dispatch(deleteNodeBackupCluster(cluster,type,deleteId, rdbInstanceId ,callback))
    }
}





export const SEARCH_DATABASE_CLUSTER_REDIS_TYPES = 'SEARCH_DATABASE_CLUSTER_REDIS_TYPES'
export function searchRedisService(types, name ,dataType) {
  return {
    type: SEARCH_DATABASE_CLUSTER_REDIS_TYPES,
    types,
    name,
      dataType
  }
}



export const SEARCH_DATABASE_CLUSTER_TYPES = 'SEARCH_DATABASE_CLUSTER_TYPES'
export function searchDbservice(types, name) {
  return {
    type: SEARCH_DATABASE_CLUSTER_TYPES,
    types,
    name
  }
}

export const SEARCH_STATE_TYPES = 'SEARCH_STATE_TYPES'
export function searchState(types, name) {
  return {
    type: SEARCH_STATE_TYPES,
    types,
    name
  }
}




export const SEARCH_DATABASE_CONFIG_TYPES = 'SEARCH_DATABASE_CONFIG_TYPES'
export function searchCacheConfig(types, name) {
  return {
    type: SEARCH_DATABASE_CONFIG_TYPES,
    types,
    name
  }
}

export const GET_DATABASE_STORAGE_ALL_LIST_REQUEST = 'GET_DATABASE_STORAGE_ALL_LIST_REQUEST'
export const GET_DATABASE_STORAGE_ALL_LIST_SUCCESS = 'GET_DATABASE_STORAGE_ALL_LIST_SUCCESS'
export const GET_DATABASE_STORAGE_ALL_LIST_FAILURE = 'GET_DATABASE_STORAGE_ALL_LIST_FAILURE'

function fetchDBStorageAllList(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_STORAGE_ALL_LIST_REQUEST, GET_DATABASE_STORAGE_ALL_LIST_SUCCESS, GET_DATABASE_STORAGE_ALL_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/persistentvolumeclaims`,
      schema: {}
    },
    callback
  }
}

export function loadDBStorageAllList(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchDBStorageAllList(cluster, callback))
  }
}
