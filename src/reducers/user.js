/**
 * licensed materials - property of paas.enncloud.cn
 * (c) copyright 2016 tenxcloud. all rights reserved.
 *
 * redux reducers for app manage
 *
 * v0.1 - 2016-11-01
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/user'
import reducerFactory from './factory'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

const option = {
  overwrite: true
}

function standardUserDetail(state = {}, action) {
  const defaultState = {
    ifFetching: false
  }
  switch(action.type) {
    case ActionTypes.STANDARD_USER_INFO_REQUEST: {
      return Object.assign({}, {
        isFetching: true
      })
    }
    case ActionTypes.STANDARD_USER_INFO_SUCCESS: {
      return Object.assign({}, action.response.result, {
        isFetching: false
      })
    }
    case ActionTypes.STANDARD_USER_INFO_FAILURE: {
      return Object.assign({}, {
        isFetching: false
      })
    }
    case ActionTypes.USER_CHANGE_USERINFO_REQUEST: {
      return Object.assign({}, state, {
        isFetching: false
      })
    }
    case ActionTypes.USER_CHANGE_USERINFO_SUCCESS: {
      const resultState = cloneDeep(state)
      if(action.body.newEmail) {
        resultState.userInfo.email = action.body.newEmail
      }
      if(action.body.avatar) {
        resultState.userInfo.avatar = action.body.avatar
      }
      if(action.body.phone) {
        resultState.userInfo.phone = action.body.phone
      }
      return resultState
    }
    case ActionTypes.USER_CHANGE_USERINFO_FAILURE: {
       return Object.assign({}, state, {
        isFetching: false
      })
    }
    default: {
      return state
    }
  }
}

function userCertificate (state ={}, action) {
  const defaultInfo = {
    isFetching: false,
    certificate: {}
  }
  switch (action.type) {
    case ActionTypes.GET_USER_CERTIFICATE_REQUEST: {
       return Object.assign({}, {
        isFetching: true
      })
    }
    case ActionTypes.GET_USER_CERTIFICATE_SUCCESS: {
      const certificate={}
      action.response.result.data.data.forEach(list => {
        if (list.certType == '1') {
         certificate.individual = list
        }
        if (list.certType == '2') {
         certificate.enterprise = list
        }
        if (list.certType == '3') {
          certificate.other = list
        }
      })
      return Object.assign({}, state, {
        isFetching: false,
        certificate: certificate
      })
    }
    case ActionTypes.GET_USER_CERTIFICATE_FAILURE: {
      return Object.assign({}, defaultInfo, {
        isFetching: false,
        certificate: ''
      })
    }
    default: {
      return state
    }
  }
}

function userDetail(state, action) {
  const defaultState = {
    isFetching: false
  }
  switch (action.type) {
    case ActionTypes.USER_DETAIL_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.USER_DETAIL_SUCCESS:
      return merge({}, state, {
        isFetching: false,
        result: action.response.result
      })
    case ActionTypes.USER_DETAIL_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    case ActionTypes.CHANGE_USER_ROLE: {
      const userDetail = cloneDeep(state)
      if(userDetail.result && userDetail.result.data) {
        userDetail.result.data.role = action.role
      }
      return userDetail
    }
    default:
      return state
  }
}

export default function user(state = {
  userDetail: {},
  users: [],
  teams: {},
  teamspaces: [],
  teamspaceDetails: [],
  userAppInfo: {}
 }, action) {
  return {
    userDetail: userDetail(state.userDetail, action),
    userCertificate: userCertificate(state.userCertificate, action),
    standardUserDetail: standardUserDetail(state.standardUserDetail, action),
    createCertInfo: reducerFactory({
      REQUEST: ActionTypes.CREATE_CERT_INFO_REQUEST,
      SUCCESS: ActionTypes.CREATE_CERT_INFO_SUCCESS,
      FAILURE: ActionTypes.CREATE_CERT_INFO_FAILUER
    }, state.createCertInfo, action, option),
    updateCertInfo: reducerFactory({
      REQUEST: ActionTypes.UPDATE_CERT_INFO_REQUEST,
      SUCCESS: ActionTypes.UPDATE_CERT_INFO_SUCCESS,
      FAILURE: ActionTypes.UPDATE_CERT_INFO_FAILUER
    }, state.updateCertInfo, action, option),
    userAppInfo: reducerFactory({
      REQUEST: ActionTypes.USER_APPINFO_REQUEST,
      SUCCESS: ActionTypes.USER_APPINFO_SUCCESS,
      FAILURE: ActionTypes.USER_APPINFO_FAILURE
    }, state.userAppInfo, action, option),
    users: reducerFactory({
      REQUEST: ActionTypes.USER_LIST_REQUEST,
      SUCCESS: ActionTypes.USER_LIST_SUCCESS,
      FAILURE: ActionTypes.USER_LIST_FAILURE
    }, state.users, action, option),
    createUser: reducerFactory({
      REQUEST: ActionTypes.USER_CREATE_REQUEST,
      SUCCESS: ActionTypes.USER_CREATE_SUCCESS,
      FAILURE: ActionTypes.USER_CREATE_FAILURE
    }, state.createUser, action, option),
    teams: reducerFactory({
      REQUEST: ActionTypes.USER_TEAM_LIST_REQUEST,
      SUCCESS: ActionTypes.USER_TEAM_LIST_SUCCESS,
      FAILURE: ActionTypes.USER_TEAM_LIST_FAILURE
    }, state.teams, action, option),
    teamspaces: reducerFactory({
      REQUEST: ActionTypes.USER_TEAMSPACE_LIST_REQUEST,
      SUCCESS: ActionTypes.USER_TEAMSPACE_LIST_SUCCESS,
      FAILURE: ActionTypes.USER_TEAMSPACE_LIST_FAILURE
    }, state.teamspaces, action, option),
    teamspaceDetails: reducerFactory({
      REQUEST: ActionTypes.USER_TEAMSPACE_DETAIL_LIST_REQUEST,
      SUCCESS: ActionTypes.USER_TEAMSPACE_DETAIL_LIST_SUCCESS,
      RESET:ActionTypes.USER_TEAMSPACE_DETAIL_LIST_RESET,
      FAILURE: ActionTypes.USER_TEAMSPACE_DETAIL_LIST_FAILURE
    }, state.teamspaceDetails, action, option),
    updateUserRole: reducerFactory({
      REQUEST: ActionTypes.UPDATE_USER_ROLE_REQUEST,
      SUCCESS: ActionTypes.UPDATE_USER_ROLE_SUCCESS,
      FAILURE: ActionTypes.UPDATE_USER_ROLE_FAILURE
    }, state.updateUserRole, action, option)
  }
}
