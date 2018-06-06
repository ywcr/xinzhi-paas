/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  config group
 *
 * v2.0 - 2016/9/26
 * @author ZhaoXueYu, BaiYu
 */

import * as ActionTypes from '../actions/configs'
import merge from 'lodash/merge'
import union from 'lodash/union'
import findIndex from 'lodash/findIndex'
import cloneDeep from 'lodash/cloneDeep'

function configGroupList(state = {}, action) {
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false,
      cluster,
      configGroup: {}
    }
  }
  switch (action.type) {
    case ActionTypes.CONFIG_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: { isFetching: true }
      })
    case ActionTypes.CONFIG_LIST_SUCCESS:
      const groupList = Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          cluster: action.response.result.cluster,
          configGroup: action.response.result.data
        }
      })
      return groupList
    case ActionTypes.CONFIG_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: { isFetching: false }
      })
    case ActionTypes.ADD_CONFIG_FILES:
      const addState = cloneDeep(state)
      const configFile = action.configFile
      const cluster1 = configFile.cluster
      const configGroup = addState[cluster1]
      const index1 = findIndex(configGroup.configGroup, item => {
        return item.name === configFile.group
      })
      configGroup.configGroup[index1].configs.push({
        name: configFile.name,
        rawName: configFile.name
      })
      configGroup.configGroup[index1].size = configGroup.configGroup[index1].configs.length
      return addState
    case ActionTypes.GET_CONFIG_FILES_REQUEST:
      return merge({}, state, {
        [cluster]: { isFetching: true }
      })
    case ActionTypes.GET_CONFIG_FILES_SUCCESS:
      const getState = cloneDeep(state)
      const configFile1 = action.configName
      const cluster2 = action.cluster
      const configGroup1 = getState[cluster2]
      const index2 = findIndex(configGroup1.configGroup, item => {
        return item.name === configFile1
      })
      configGroup1.configGroup[index2].configs = action.response.result.data.configs
      configGroup1.configGroup[index2].size = action.response.result.data.configs.length
      return getState
    case ActionTypes.GET_CONFIG_FILES_FAILURE:
      return merge({}, state, {
        [cluster]: { isFetching: false }
      })
    case ActionTypes.DELETE_CONFIG_GROUP_SUCCESS:
      const delState = cloneDeep(state)
      const configFile3 = action.groupName
      const cluster3 = action.cluster
      const configGroup3 = delState[cluster3]
      let index3
      let index4
      const resData = action.response.result.message
      if (resData.length == 0) {
        for (let i = 0; i < configFile3.length; i++) {
          index3 = findIndex(configGroup3.configGroup, item => {
            return item.name === configFile3[i]
          })
          configGroup3.configGroup.splice(index3, 1)
        }
      } else {
        // has delete err group name
        // for (let i = 0; i < configFile3.length; i++) {
        //   index3 = findIndex(configFile3, item => {
        //     return item == resData[i].name
        //   })
        //   configFile3.splice(index3, 1)
        // }
        // for (let i = 0; i < configFile3.length; i++) {
        //   index4 = findIndex(configGroup3.configGroup, item => {
        //     return item.name === configFile3[i]
        //   })
        //   configGroup3.configGroup.splice(index4, 1)
        // }
      }
      return delState
    // return union({}, state, { isFetching: false })
    case ActionTypes.DELETE_CONFIG_GROUP_FAILURE:
      return merge({}, state, { isFetching: false })
    default:
      return state
  }
}

// load config group name  => data
function loadConfigName(state = {}, action) {
  const cluster = action.cluster
  switch (action.type) {
    case ActionTypes.CONFIG_listName_REQUEST:
      return merge({}, state, {
        [cluster]: { isFetching: true }
      })
    case ActionTypes.CONFIG_LISTName_SUCCESS:
      return merge({}, state, {
        [cluster]: {
          isFetching: false,
          cluster: action.response.result.cluster,
          configDesc: action.response.result.data
        }
      })
    case ActionTypes.CONFIG_LISTName_FAILURE:
      return merge({}, state, {
        [cluster]: { isFetching: false }
      })
    default:
      return state
  }
}

function createConfigGroup(state = {}, action) {
  switch (action.type) {
    case ActionTypes.CREATE_CONFIG_GROUP_REQUEST:
      return merge({}, state, { isFetching: true })
    case ActionTypes.CREATE_CONFIG_GROUP_SUCCESS:
      return merge({}, state, { isFetching: false })
    case ActionTypes.CREATE_CONFIG_GROUP_FAILURE:
      return merge({}, state, { isFetching: false })
    default:
      return state
  }
}

function createConfigFiles(state = {}, action) {
  switch (action.type) {
    case ActionTypes.CREATE_CONFIG_FILES_REQUEST:
      return merge({}, state, { isFetching: true })
    case ActionTypes.CREATE_CONFIG_FILES_SUCCESS:
      return merge({}, state, { isFetching: false })
    case ActionTypes.CREATE_CONFIG_FILES_FAILURE:
      return merge({}, state, { isFetching: false })
    default:
      return state
  }
}


function deleteConfigName(state = {}, action) {
  switch (action.type) {
    case ActionTypes.DELETE_CONFIG_FILES_REQUEST:
      return union({}, state, { isFetching: true })
    case ActionTypes.DELETE_CONFIG_FILES_SUCCESS:
      return union({}, state, { isFetching: false })
    case ActionTypes.DELETE_CONFIG_FILES_FAILURE:
      return union({}, state, { isFetching: false })
    default:
      return state
  }
}

export default function configReducers(state = { configGroupList: {} }, action) {
  return {
    configGroupList: configGroupList(state.configGroupList, action),
    createConfigGroup: createConfigGroup(state.createConfigGroup, action),
    // deleteConfigGroup: deleteConfigGroup(state.deleteConfigGroup, action),
    loadConfigName: loadConfigName(state.loadConfigName, action),
    deleteConfigName: deleteConfigName(state.deleteConfigName, action),
    createConfigFiles: createConfigFiles(state.createConfigFiles, action)
  }
}