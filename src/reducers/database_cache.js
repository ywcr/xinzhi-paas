/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for database cache
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */

import * as ActionTypes from '../actions/database_cache'
import merge from 'lodash/merge'
import reducerFactory from './factory'
import cloneDeep from 'lodash/cloneDeep'
import findIndex from 'lodash/findIndex'

function databaseAllNames(state = {}, action) {
  const defaultState = {
    'DbClusters': {
      isFetching: false,
      databaseNames: []
    }
  }
  switch (action.type) {
    case ActionTypes.GET_DATABASE_CACHE_ALL_NAME_REQUEST:
      return merge({}, defaultState, state, {
        'DbClusters': { isFetching: true }
      })
    case ActionTypes.GET_DATABASE_CACHE_ALL_NAME_SUCCESS:
      return Object.assign({}, state, {
        'DbClusters': {
          isFetching: false,
          databaseNames: action.response.result.databaseNames || []
        }
      })
    case ActionTypes.GET_DATABASE_CACHE_ALL_NAME_FAILURE:
      return merge({}, defaultState, state, {
        'DbClusters': { isFetching: false }
      })
    default:
      return state
  }
}

function databaseAllList(state = {}, action) {
  const defaultState = {
    'mysql': {
      isFetching: false,
      database: 'mysql',
      databaseList: []
    }
  }
  const clusterType = action.types || 'mysql'
  switch (action.type) {
    case ActionTypes.GET_DATABASE_CACHE_ALL_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: true }
      })
    case ActionTypes.GET_DATABASE_CACHE_ALL_LIST_SUCCESS: {
      const bak = cloneDeep(action.response.result.databaseList || [])
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false,
          database: clusterType,
          bak,
          databaseList: action.response.result.databaseList || []
        }
      })

    }
    case ActionTypes.GET_DATABASE_CACHE_ALL_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false }
      })
    // delete database cluster 
    case ActionTypes.DELETE_DATABASE_CACHE_SUCCESS: {
      const delState = cloneDeep(state)
      const databaseList = delState[clusterType].databaseList
      let findex = findIndex(databaseList, list => {
        return action.dbName === list.serivceName
      })
      databaseList.splice(findex, 1)
      delState[clusterType].bak.splice(findex, 1)
      return delState
    }
    // search database cluster
    case ActionTypes.SEARCH_DATABASE_CLUSTER_TYPES: {
      const searchState = cloneDeep(state)
      if (action.name == '') {
        searchState[clusterType].databaseList = searchState[clusterType].bak
        return searchState
      }

      const list = searchState[clusterType].bak.filter(item => {
        const search = new RegExp(action.name)
        if (search.test(item.serivceName)) {
          return true
        }
        return false
      })
      searchState[clusterType].databaseList = list

      return searchState
    }
    default:
      return state
  }
}

function statefulsetList(state = {}, action) {
  const defaultState = {
    'mysql': {
      isFetching: false,
      database: 'mysql',
      databaseList: []
    }
  }
  const clusterType = action.types || 'mysql'
  switch (action.type) {
    case ActionTypes.GET_DATABASE_STATE_ALL_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: true }
      })
    case ActionTypes.GET_DATABASE_STATE_ALL_LIST_SUCCESS: {
      const bak = cloneDeep(action.response.result.databaseList || [])
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false,
          database: clusterType,
          bak,
          databaseList: action.response.result.databaseList || []
        }
      })

    }
    case ActionTypes.GET_DATABASE_STATE_ALL_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false }
      })
    // delete database cluster 
    case ActionTypes.DELETE_STATE_SUCCESS: {
      const delState = cloneDeep(state)
      const databaseList = delState[clusterType].databaseList
      let findex = findIndex(databaseList, list => {
        return action.dbName === list.serivceName
      })
      databaseList.splice(findex, 1)
      delState[clusterType].bak.splice(findex, 1)
      return delState
    }
    // search database cluster
    case ActionTypes.SEARCH_STATE_TYPES: {
      const searchState = cloneDeep(state)
      if (action.name == '') {
        searchState[clusterType].databaseList = searchState[clusterType].bak
        return searchState
      }
      const list = searchState[clusterType].bak.filter(item => {
        const search = new RegExp(action.name)
        if (search.test(item.serivceName)) {
          return true
        }
        return false
      })
      searchState[clusterType].databaseList = list

      return searchState
    }
    default:
      return state
  }
}

function databaseAllRedisList(state = {}, action) {
  const defaultState = {
    [action.types]: {
      isFetching: false,
      database: action.types,
      databaseList: []
    }
  }
  let clusterType = action.types || 'mongos'
  let databaseUpdate = ''
  switch (action.dataType) {
    case 'caches':
      databaseUpdate = 'cache'
      clusterType = "redis"
      break;
    case 'mongos':
      databaseUpdate = 'mongo'
      clusterType = "mongos"
      break;
    case 'rdbs':
      databaseUpdate = 'rdb'
      clusterType = "mysql"
      break;
  }
  switch (action.type) {
    case ActionTypes.GET_DATABASE_CACHE_ALL_REDIS_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false }
      })
    case ActionTypes.GET_DATABASE_CACHE_ALL_REDIS_LIST_SUCCESS: {
      const bak = cloneDeep(action.response.result.databaseList || [])
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false,
          database: clusterType,
          bak,
          databaseList: action.response.result.databaseList || []
        }
      })

    }
    case ActionTypes.GET_DATABASE_CACHE_ALL_REDIS_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false }
      })
    // delete database cluster 
    case ActionTypes.DELETE_DATABASE_CACHE_REDIS_SUCCESS: {
      const delState = cloneDeep(state)
      const databaseList = delState[clusterType].databaseList

      let findex = findIndex(databaseList, list => {
        return action.deleteId === list[databaseUpdate + 'Id']
      })

      delState[clusterType].bak[findex].transitionStatus = 'deleting'
      databaseList[findex].transitionStatus = 'deleting'

      // databaseList.splice(findex, 1)
      // delState[clusterType].bak.splice(findex, 1)
      return delState
    }
    case ActionTypes.SEARCH_DATABASE_CLUSTER_REDIS_TYPES: {
      const searchState = cloneDeep(state)
      if (action.name == '') {
        searchState[clusterType].databaseList = searchState[clusterType].bak
        return searchState
      }

      const list = searchState[clusterType].bak.filter(item => {
        const search = new RegExp(action.name)
        if (search.test(item[databaseUpdate + 'Name'])) {
          return true
        }
        return false
      })
      searchState[clusterType].databaseList = list

      return searchState
    }
    case ActionTypes.UPDATA_DATABASE_VERB_INFO_SUCCESS: {
      const updateState = cloneDeep(state)
      const databaseList = updateState[clusterType].databaseList
      let findex = findIndex(databaseList, list => {
        return action.cacheId === list[databaseUpdate + 'Id']
      })
      updateState[clusterType].bak[findex].transitionStatus = action.verb
      databaseList[findex].transitionStatus = action.verb
      // switch (action.verb) {
        // case 'resize':
        //   // databaseList[findex][databaseUpdate + 'Size'] = action.data.cache_size
        //   // updateState[clusterType].bak[findex][databaseUpdate + 'Size'] = action.data.cache_size
        //   updateState[clusterType].bak[findex].transition_status ="resizing"
        //   databaseList[findex].transition_status ="resizing"
        //   break;
      //   default:
      //     updateState[clusterType].bak[findex].transition_status = action.verb
      //     databaseList[findex].transition_status = action.verb
      // }
      return updateState
    }
    default:
      return state
  }
}



// function databaseSingleList(state = {}, action) {
//     const defaultState = {
//         [action.types] : {
//             isFetching: false,
//             database: action.types,
//             singleList: []
//         }
//     }
//     let clusterType = action.types || 'mongos'
//     let databaseUpdate = ''
//     switch (action.dataType) {
//         case 'caches':
//             databaseUpdate = 'cache'
//             clusterType = "redis"
//             break;
//         case 'mongos':
//             databaseUpdate = 'mongo'
//             clusterType = "mongos"
//             break;
//         case 'rdbs':
//             databaseUpdate = 'rdb'
//             clusterType = "mysql"
//             break;
//     }
//     switch (action.type) {
//         case ActionTypes.GET_DATABASE_SINGLE_LIST_REQUEST:
//             return merge({}, defaultState, state, {
//                 [clusterType]: { isFetching: true }
//             })
//         case ActionTypes.GET_DATABASE_SINGLE_LIST_SUCCESS:{
//             const bak = cloneDeep(action.response.result.singleList || [])
//             return Object.assign({}, state, {
//                 [clusterType]: {
//                     isFetching: false,
//                     database: clusterType,
//                     bak,
//                     singleList: action.response.result.singleList || []
//                 }
//             })
//
//         }
//         case ActionTypes.GET_DATABASE_SINGLE_LIST_FAILURE:
//             return merge({}, defaultState, state, {
//                 [clusterType]: { isFetching: false }
//             })
//     }
// }


function databaseAllRedisConfigList(state = {}, action) {
  const clusterType = action.types || 'mysql'

  const defaultState = {
    [clusterType]: {
      isFetching: false, isConfig: false,
      database: 'mysql',
      databaseConfigList: []
    }
  }

  switch (action.type) {
    case ActionTypes.GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: true, isConfig: true }
      })
    case ActionTypes.GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_SUCCESS: {
      const bak = cloneDeep(action.response.result.databaseList || [])
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false, isConfig: false,
          database: clusterType,
          bak,
          databaseConfigList: action.response.result.databaseList || []
        }
      })

    }
    case ActionTypes.SEARCH_DATABASE_CONFIG_TYPES: {
      const searchState = cloneDeep(state)
      if (action.name == '') {
        searchState[clusterType].databaseConfigList = searchState[clusterType].bak
        return searchState
      }

      const list = searchState[clusterType].bak.filter(item => {
        const search = new RegExp(action.name)
        if (search.test(item['cacheParameterGroupName'])) {
          return true
        }
        return false
      })
      searchState[clusterType].databaseConfigList = list

      return searchState
    }
    case ActionTypes.DELETE_DATABASE_CACHE_REDISCONFIG_SUCCESS: {//shan chu 
      const delState = cloneDeep(state)
      const databaseList = delState[clusterType].databaseConfigList

      let findex = findIndex(databaseList, list => {
        return action.deleteId === list['cacheParameterGroupId']
      })
      databaseList.splice(findex, 1)
      delState[clusterType].bak.splice(findex, 1)
      return delState
    }
    case ActionTypes.GET_DATABASE_CACHE_ALL_REDIS_CONFIG_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false, isConfig: false }
      })

    default:
      return state
  }
}
// 获取监控 数据
function databaseMonitorList(state = {}, action) {
  const clusterType = action.types || 'mysql'

  const defaultState = {
    [clusterType]: {
      isFetching: false, isConfig: false,
      database: 'mysql',
      nodesMonitorList: []
    }
  }
  switch (action.type) {
    case ActionTypes.GET_DATABASE_CACHE_MONITOR_REQUEST:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: true, isConfig: true }
      })
    case ActionTypes.GET_DATABASE_CACHE_MONITOR_SUCCESS: {
      const bak = cloneDeep(action.response.result.nodesMonitorList || [])
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false, isConfig: false,
          database: clusterType,
          bak,
          nodesMonitorList: action.response.result.nodesMonitorList || []
        }
      })
    }
    case ActionTypes.GET_DATABASE_CACHE_MONITOR_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false, isConfig: false }
      })

    default:
      return state
  }
}


/*备份列表*/

function databaseBackUpList(state = {}, action) {
    const clusterType = action.types || 'mysql'

    const defaultState = {
        [clusterType]: {
            isFetching: false, isConfig: false,
            database: 'mysql',
            getBackUpList: []
        }
    }
    switch (action.type) {
        case ActionTypes.GET_DATABASE_CACHE_ALL_BACKUP_LIST_REQUEST:
            return merge({}, defaultState, state, {
                [clusterType]: { isFetching: true, isConfig: true }
            })
        case ActionTypes.GET_DATABASE_CACHE_ALL_BACKUP_LIST_SUCCESS: {
            const bak = cloneDeep(action.response.result.getBackUpList || [])
            return Object.assign({}, state, {
                [clusterType]: {
                    isFetching: false, isConfig: false,
                    database: clusterType,
                    bak,
                    getBackUpList: action.response.result.getBackUpList || []
                }
            })
        }
        case ActionTypes.GET_DATABASE_CACHE_ALL_BACKUP_LIST_FAILURE:
            return merge({}, defaultState, state, {
                [clusterType]: { isFetching: false, isConfig: false }
            })

        default:
            return state
    }
}




function databaseMonitorMetricList(state = {}, action) {
  const clusterType = action.types || 'mysql'
  const defaultState = {
    [clusterType]: {
      isFetching: false, isConfig: false,
      database: 'mysql',
      monitorMetricList: []
    }
  }
  switch (action.type) {
    case ActionTypes.GET_DATABASE_CACHE_METRIC_MONITOR_REQUEST:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: true, isConfig: true }
      })
    case ActionTypes.GET_DATABASE_CACHE_METRIC_MONITOR_SUCCESS: {
      const bak = cloneDeep(action.response.result.monitorMetricList || [])
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false, isConfig: false,
          database: clusterType,
          bak,
          monitorMetricList: action.response.result.monitorMetricList || []
        }
      })
    }
    case ActionTypes.GET_DATABASE_CACHE_METRIC_MONITOR_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false, isConfig: false }
      })

    case ActionTypes.GET_REVIEWTYPE_SUCCESS:
      return

    default:
      return state
  }
}

/*获取数据库节点数据*/
function databaseAllNodesList(state = {}, action) {
  const clusterType = action.types || 'mysql'
  const defaultState = {
    [clusterType]: {
      isFetching: false,
      database: 'mysql',
      databaseList: []
    }
  }
  switch (action.type) {
    case ActionTypes.MONGODB_DATABASE_NODE_REQUEST:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: true }
      })
    case ActionTypes.MONGODB_DATABASE_NODE_SUCCESS: {
      const bak = cloneDeep(action.response.result.databaseList || [])
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false,
          database: clusterType,
          bak,
          databaseList: action.response.result.databaseList || []
        }
      })

    }
    case ActionTypes.MONGODB_DATABASE_NODE_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false }
      })

    default:
      return state
  }
}



/*获取数据库节点数据*/
function databaseAllConfigList(state = {}, action) {
  const clusterType = action.types || 'mysql'
  const defaultState = {
    [clusterType]: {
      isFetching: false,
      database: 'mysql',
      paramtersList: []
    }
  }
  switch (action.type) {
    case ActionTypes.RDBS_DATABASE_PARAMETERS_REQUEST:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: true }
      })
    case ActionTypes.RDBS_DATABASE_PARAMETERS_SUCCESS: {
      const bak = cloneDeep(action.response.result.paramtersList || [])
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false,
          database: clusterType,
          bak,
          paramtersList: action.response.result.paramtersList || []
        }
      })

    }
    case ActionTypes.RDBS_DATABASE_PARAMETERS_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false }
      })

    default:
      return state
  }
}


/*修改mongo参数配置*/
function databaseModifyAllConfigList(state = {}, action) {
  const clusterType = action.types || 'mysql'
  const defaultState = {
    [clusterType]: {
      isFetching: false,
      database: 'mysql',
      parameters: []
    }
  }
  switch (action.type) {
    case ActionTypes.RDBS_DATABASE_MODIFY_PARAMETERS_REQUEST:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: true }
      })
    case ActionTypes.RDBS_DATABASE_MODIFY_PARAMETERS_SUCCESS: {
      const bak = cloneDeep(action.response.result.parameters || [])
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false,
          database: clusterType,
          bak,
          parameters: action.response.result.parameters || []
        }
      })

    }
    case ActionTypes.RDBS_DATABASE_MODIFY_PARAMETERS_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false }
      })

    default:
      return state
  }
}


/*获取数据库节点配置数据 parameters*/
function databaseParameters(state = {}, action) {
  const clusterType = action.types || 'mysql'
  const defaultState = {
    [clusterType]: {
      isFetching: false,
      database: 'mysql',
      parametersList: []
    }
  }
  switch (action) {
    case ActionTypes.RDBS_DATABASE_PARAMETERS_REQUEST:

      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: true }
      })
    case ActionTypes.RDBS_DATABASE_PARAMETERS_SUCCESS: {
      const bak = cloneDeep(action.response.result.nodeMonitorList || [])
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false,
          database: clusterType,
          bak,
          parametersList: action.response.result.nodeMonitorList || []
        }
      })
    }
    case ActionTypes.RDBS_DATABASE_PARAMETERS_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false }
      })

    default:
      return state
  }
}
/*获取数据库节点配置数据 addnode*/
function databaseAddNode(state = {}, action) {
  const clusterType = action.types || 'mysql'
  const defaultState = {
    [clusterType]: {
      isFetching: false,
      database: 'mysql',
      parametersList: []
    }
  }
  switch (action) {
    case ActionTypes.RDBS_ADD_NODE_PARAMETERS_REQUEST:

      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: true }
      })
    case ActionTypes.RDBS_ADD_NODE_PARAMETERS_SUCCESS: {
      const bak = cloneDeep(action.response.result.nodeMonitorList || [])
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false,
          database: clusterType,
          bak,
          parametersList: action.response.result.nodeMonitorList || []
        }
      })
    }
    case ActionTypes.RDBS_ADD_NODE_PARAMETERS_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false }
      })

    default:
      return state
  }
}
function redisDatabaseAllList(state = {}, action) {
  const defaultState = {
    'Redis': {
      isFetching: false,
      database: 'Redis',
      databaseList: []
    }
  }
  switch (action.type) {
    case ActionTypes.REDIS_DATABASE_CACHE_ALL_LIST_REQUEST:
      return merge({}, defaultState, state, {
        'Redis': { isFetching: true }
      })
    case ActionTypes.REDIS_DATABASE_CACHE_ALL_LIST_SUCCESS:
      return Object.assign({}, state, {
        'Redis': {
          isFetching: false,
          database: 'Redis',
          databaseList: action.response.result.databaseList || []
        }
      })
    case ActionTypes.REDIS_DATABASE_CACHE_ALL_LIST_FAILURE:
      return merge({}, defaultState, state, {
        'Redis': { isFetching: false }
      })
    default:
      return state
  }
}

function databaseClusterDetail(state = {}, action) {
  const defaultState = {
    databaseInfo: {
      isFetching: false,
      databaseInfo: null
    }
  }
  switch (action.type) {
    case ActionTypes.GET_DATABASE_DETAIL_INFO_REQUEST:
      return merge({}, defaultState, state, {
        databaseInfo: { isFetching: action.needLoading }
      })
    case ActionTypes.GET_DATABASE_DETAIL_INFO_SUCCESS:
      return Object.assign({}, state, {
        databaseInfo: {
          isFetching: false,
          databaseInfo: action.response.result.database || null
        }
      })
    case ActionTypes.GET_DATABASE_DETAIL_INFO_FAILURE:
      return merge({}, defaultState, state, {
        databaseInfo: { isFetching: false }
      })
    default:
      return state
  }
}

function databaseStateDetail(state = {}, action) {
  const defaultState = {
    databaseInfo: {
      isFetching: false,
      databaseInfo: null
    }
  }
  switch (action.type) {
    case ActionTypes.GET_STATE_DETAIL_INFO_REQUEST:
      return merge({}, defaultState, state, {
        databaseInfo: { isFetching: action.needLoading }
      })
    case ActionTypes.GET_STATE_DETAIL_INFO_SUCCESS:
      return Object.assign({}, state, {
        databaseInfo: {
          isFetching: false,
          databaseInfo: action.response.result.database || null
        }
      })
    case ActionTypes.GET_STATE_DETAIL_INFO_FAILURE:
      return merge({}, defaultState, state, {
        databaseInfo: { isFetching: false }
      })
    default:
      return state
  }
}

function loadDBStorageAllList(state = {}, action) {
  const defaultState = {
    isFetching: false,
    storageList: []
  }
  switch (action.type) {
    case ActionTypes.GET_DATABASE_STORAGE_ALL_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_DATABASE_STORAGE_ALL_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        storageList: action.response.result.result.data.items || []
      })
    case ActionTypes.GET_DATABASE_STORAGE_ALL_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}
export function databaseCache(state = { databaseCache: {} }, action) {
  return {
    databaseAllNames: databaseAllNames(state.databaseAllNames, action),
    databaseAllList: databaseAllList(state.databaseAllList, action),
    databaseAllRedisList: databaseAllRedisList(state.databaseAllRedisList, action),
    databaseAllNodesList: databaseAllNodesList(state.databaseAllNodesList, action),
    databaseAllConfigList: databaseAllConfigList(state.databaseAllConfigList, action),
    databaseModifyAllConfigList: databaseModifyAllConfigList(state.databaseModifyAllConfigList, action),
    databaseAllRedisConfigList: databaseAllRedisConfigList(state.databaseAllRedisConfigList, action),
    redisDatabaseAllList: redisDatabaseAllList(state.redisDatabaseAllList, action),
    loadDBStorageAllList: loadDBStorageAllList(state.loadDBStorageAllList, action),
    databaseClusterDetail: databaseClusterDetail(state.databaseClusterDetail, action),
    databaseParameters:databaseParameters(state.databaseParameters, action),
    databaseMonitorList:databaseMonitorList(state.databaseMonitorList, action),
    databaseMonitorMetricList:databaseMonitorMetricList(state.databaseMonitorMetricList,action),
    databaseBackUpList:databaseBackUpList(state.databaseBackUpList,action),
    statefulsetList:statefulsetList(state.statefulsetList,action),
    databaseStateDetail:databaseStateDetail(state.databaseStateDetail,action)
    // databaseSingleList:databaseSingleList(state.databaseSingleList,action)
  }
}
