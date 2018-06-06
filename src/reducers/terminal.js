/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Redux reducers for web terminal
 *
 * v0.1 - 2017-03-27
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/terminal'
import merge from 'lodash/merge'
import union from 'lodash/union'
import cloneDeep from 'lodash/cloneDeep'

function list(state, action) {
  const { cluster, item } = action
  const oldList = cloneDeep(state[cluster]) || []
  let existFlag = false
  switch (action.type) {
    case ActionTypes.ADD_TERMINAL_ITEM:
    case ActionTypes.UPDATE_TERMINAL_ITEM:
      oldList.every(oldItem => {
        if (oldItem.metadata.name === item.metadata.name) {
          merge(oldItem, item)
          existFlag = true
          return false
        }
        return true
      })
      if (!existFlag) {
        return Object.assign({}, state, {
          [cluster]: union([], oldList, [item])
        })
      }
      return Object.assign({}, state, {
        [cluster]: oldList
      })
    case ActionTypes.REMOVE_ALL_TERMINAL_ITEM:
      return Object.assign({}, state, {
        [cluster]: []
      })
    case ActionTypes.REMOVE_TERMINAL_ITEM:
      if(typeof(item) === 'string'){
        return Object.assign({}, state,{
          [cluster]: oldList.filter(oldItem => {
            let nameArray = oldItem.metadata.name.split('-')
            if(nameArray[0] !== item){
              return oldItem
            }
          })
        })
      }
      return Object.assign({}, state, {
        [cluster]: oldList.filter(oldItem => {
          if (oldItem.metadata.name !== item.metadata.name) {
            return oldItem
          }
        })
      })
    default:
      return state
  }
}

function active(state, action) {
  const { cluster, item, key } = action
  const activeState = state.active
  switch (action.type) {
    case ActionTypes.ADD_TERMINAL_ITEM:
      return Object.assign({}, activeState, {
        [cluster]: item.metadata.name,
      })
    case ActionTypes.CHANGE_ACTIVE_CLUSTER:
      return merge({}, activeState, {
        cluster,
      })
    case ActionTypes.CHANGE_ACTIVE_TERMINAL_ITEM:
      return Object.assign({}, activeState, {
        [cluster]: key,
      })
    case ActionTypes.REMOVE_TERMINAL_ITEM:
      if(typeof(item) === 'string'){
        if(activeState && activeState[cluster]){
          let activeArray = activeState[cluster].split('-')
          if(item !== activeArray[0]){
            return activeState
          }
        }
      }
      if (item.metadata && item.metadata.name !== activeState[cluster]) {
        return activeState
      }
      let _active = null
      state.list[cluster].every(oldItem => {
        let { name } = oldItem.metadata
        if (name !== activeState[cluster]) {
          _active = name
          return false
        }
        return true
      })
      return Object.assign({}, activeState, {
        [cluster]: _active,
      })
    case ActionTypes.REMOVE_ALL_TERMINAL_ITEM:
      return Object.assign({}, activeState, {
        [cluster]: null,
      })
    default:
      return activeState
  }
}

export default function terminal(state = {
  list: {},
  active: {},
}, action) {
  return {
    list: list(state.list, action),
    active: active(state, action),
  }
}