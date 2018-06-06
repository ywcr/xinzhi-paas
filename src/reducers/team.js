/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-11-01
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/team'
import reducerFactory from './factory'
import merge from 'lodash/merge'

const options = { overwrite: true }

function getSpaceUserList(state,action){
  switch(action.type){
    case ActionTypes.GET_SPACE_USERS_REQUEST:
      return merge({},state,{isFetching:true})
    case ActionTypes.GET_SPACE_USERS_SUCCESS:
      return merge({},state,{
        isFetching:false,
        list:action.response.result.data
      })
    case ActionTypes.GET_SPACE_USERS_FAILURE:
      return merge({},state,{isFetching:false})
  }
}

export default function team(state = {
  teams: [],
  teamspaces: [],
  teamClusters: [],
  allClusters: [],
  teamusers: [],
  teamusersStd: [],
  invitationInfo: {},
  teamDissoveable: {},
  teamDetail: {},
}, action) {
  return {
    spaceUserList : getSpaceUserList(state.getSpaceUserList,action),
    teams: reducerFactory({
      REQUEST: ActionTypes.TEAM_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAM_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAM_LIST_FAILURE
    }, state.teams, action, options),
    teamspaces: reducerFactory({
      REQUEST: ActionTypes.TEAMSPACE_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAMSPACE_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAMSPACE_LIST_FAILURE
    }, state.teamspaces, action, options),
    teamusers: reducerFactory({
      REQUEST: ActionTypes.TEAMUSER_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAMUSER_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAMUSER_LIST_FAILURE
    }, state.teamusers, action, options),
    teamAllusers: reducerFactory({
      REQUEST: ActionTypes.TEAMUSER_ALL_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAMUSER_ALL_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAMUSER_ALL_LIST_FAILURE
    }, state.teamAllusers, action, options),
    teamusersStd: reducerFactory({
      REQUEST: ActionTypes.TEAMUSER_LIST_STD_REQUEST,
      SUCCESS: ActionTypes.TEAMUSER_LIST_STD_SUCCESS,
      FAILURE: ActionTypes.TEAMUSER_LIST_STD_FAILURE
    }, state.teamusersStd, action, options),
    teamClusters: reducerFactory({
      REQUEST: ActionTypes.TEAM_CLUSTERS_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAM_CLUSTERS_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAM_CLUSTERS_LIST_FAILURE
    }, state.teamClusters, action, options),
    allClusters: reducerFactory({
      REQUEST: ActionTypes.ALL_CLUSTERS_LIST_REQUEST,
      SUCCESS: ActionTypes.ALL_CLUSTERS_LIST_SUCCESS,
      FAILURE: ActionTypes.ALL_CLUSTERS_LIST_FAILURE
    }, state.allClusters, action, options),
    invitationInfo: reducerFactory({
      REQUEST: ActionTypes.GET_INVITATION_INFO_REQUEST,
      SUCCESS: ActionTypes.GET_INVITATION_INFO_SUCCESS,
      FAILURE: ActionTypes.GET_INVITATION_INFO_FAILURE
    }, state.invitationInfo, action, options),
    teamDissoveable: reducerFactory({
      REQUEST: ActionTypes.GET_TEAM_DISSOLVABLE_REQUEST,
      SUCCESS: ActionTypes.GET_TEAM_DISSOLVABLE_SUCCESS,
      FAILURE: ActionTypes.GET_TEAM_DISSOLVABLE_FAILURE
    }, state.teamDissoveable, action, options),
    teamDetail: reducerFactory({
      REQUEST: ActionTypes.GET_TEAM_DETAIL_REQUEST,
      SUCCESS: ActionTypes.GET_TEAM_DETAIL_SUCCESS,
      FAILURE: ActionTypes.GET_TEAM_DETAIL_FAILURE
    }, state.teamDetail, action, options),
    requestTeamCluster: reducerFactory({
      REQUEST: ActionTypes.TEAM_REQUEST_CLUSTER_REQUEST,
      SUCCESS: ActionTypes.TEAM_REQUEST_CLUSTER_SUCCESS,
      FAILURE: ActionTypes.TEAM_REQUEST_CLUSTER_FAILURE
    }, state.requestTeamCluster, action, options),
  }
}