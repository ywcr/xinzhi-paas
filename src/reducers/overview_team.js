/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-11-18
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/overview_team'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

export default function overviewTeam(state = {
  teamInfo: {},
  teamDetail: {},
  teamOperations: {}
 }, action) {
  return {
    teamInfo: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_TEAMINFO_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_TEAMINFO_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_TEAMINFO_FAILURE
    }, state.teamInfo, action, option),
    teamDetail: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_TEAM_DETAIL_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_TEAM_DETAIL_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_TEAM_DETAIL_FAILURE
    }, state.teamDetail, action, option),
    teamOperations: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_TEAM_DETAIL_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_TEAM_DETAIL_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_TEAM_DETAIL_FAILURE
    }, state.teamOperations, action, option)
  }
}