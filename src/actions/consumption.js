/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for users
 *
 * v0.1 - 2016-12-07
 * @author mengyuan
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const CONSUMPTION_DETAIL_REQUEST = 'CONSUMPTION_DETAIL_REQUEST'
export const CONSUMPTION_DETAIL_SUCCESS = 'CONSUMPTION_DETAIL_SUCCESS'
export const CONSUMPTION_DETAIL_FAILURE = 'CONSUMPTION_DETAIL_FAILURE'

function fetchDetail(teamspace, from, size, timeBegin, timeEnd, type) {
  let query = {}
  if (from) {
    query.from = from
  }
  if (size) {
    query.size = size
  }
  if (timeBegin) {
    query.timeBegin = timeBegin
  }
  if (timeEnd) {
    query.timeEnd = timeEnd
  }
  if (type && type != 'all') {
    query.type = type
  }
  if (!teamspace) {
    teamspace = 'default'
  }
  const queryStr = toQuerystring(query)
  const endpoint = `${API_URL_PREFIX}/consumptions/detail` + (queryStr != '' ? `?${queryStr}` : '')
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_DETAIL_REQUEST, CONSUMPTION_DETAIL_SUCCESS, CONSUMPTION_DETAIL_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        headers:{teamspace}
      },
    }
  }
}

export function loadConsumptionDetail(teamspace, from, size, timeBegin, timeEnd, type) {
  return (dispatch, getState) => {
    return dispatch(fetchDetail(teamspace, from, size, timeBegin, timeEnd, type))
  }
}


export const CONSUMPTION_TREND_REQUEST = 'CONSUMPTION_TREND_REQUEST'
export const CONSUMPTION_TREND_SUCCESS = 'CONSUMPTION_TREND_SUCCESS'
export const CONSUMPTION_TREND_FAILURE = 'CONSUMPTION_TREND_FAILURE'

function fetchTrend(teamspace) {
  if (!teamspace) {
    teamspace = 'default'
  }
  const endpoint = `${API_URL_PREFIX}/consumptions/trend`
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_TREND_REQUEST, CONSUMPTION_TREND_SUCCESS, CONSUMPTION_TREND_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        headers:{teamspace}
      },
    }
  }
}

export function loadConsumptionTrend(teamspace) {
  return (dispatch, getState) => {
    return dispatch(fetchTrend(teamspace))
  }
}

export const CONSUMPTION_SPACE_SUMMARY_DAY_REQUEST = 'CONSUMPTION_SPACE_SUMMARY_DAY_REQUEST'
export const CONSUMPTION_SPACE_SUMMARY_DAY_SUCCESS = 'CONSUMPTION_SPACE_SUMMARY_DAY_SUCCESS'
export const CONSUMPTION_SPACE_SUMMARY_DAY_FAILURE = 'CONSUMPTION_SPACE_SUMMARY_DAY_FAILURE'

function fetchSpaceSummaryInDay(teamspace, month) {
  if (!teamspace) {
    teamspace = 'default'
  }
  let endpoint = `${API_URL_PREFIX}/consumptions/summary`
  if (month) {
    endpoint += `?month=${month}`
  }
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_SPACE_SUMMARY_DAY_REQUEST, CONSUMPTION_SPACE_SUMMARY_DAY_SUCCESS, CONSUMPTION_SPACE_SUMMARY_DAY_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        headers:{teamspace}
      },
    }
  }
}

export function loadSpaceSummaryInDay(teamspace, month) {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceSummaryInDay(teamspace, month))
  }
}

export const CONSUMPTION_SPACE_SUMMARY_REQUEST = 'CONSUMPTION_SPACE_SUMMARY_REQUEST'
export const CONSUMPTION_SPACE_SUMMARY_SUCCESS = 'CONSUMPTION_SPACE_SUMMARY_SUCCESS'
export const CONSUMPTION_SPACE_SUMMARY_FAILURE = 'CONSUMPTION_SPACE_SUMMARY_FAILURE'

function fetchSpaceSummary(teamspace, month) {
  if (!teamspace) {
    teamspace = 'default'
  }
  let endpoint = `${API_URL_PREFIX}/consumptions/summary`
  if (month) {
    endpoint += `?month=${month}`
  }
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_SPACE_SUMMARY_REQUEST, CONSUMPTION_SPACE_SUMMARY_SUCCESS, CONSUMPTION_SPACE_SUMMARY_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        headers:{teamspace}
      },
    }
  }
}

export function loadSpaceSummary(teamspace, month) {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceSummary(teamspace, month))
  }
}


export const CONSUMPTION_TEAM_SUMMARY_REQUEST = 'CONSUMPTION_TEAM_SUMMARY_REQUEST'
export const CONSUMPTION_TEAM_SUMMARY_SUCCESS = 'CONSUMPTION_TEAM_SUMMARY_SUCCESS'
export const CONSUMPTION_TEAM_SUMMARY_FAILURE = 'CONSUMPTION_TEAM_SUMMARY_FAILURE'

function fetchTeamSummary(teamspace, month) {
  if (!teamspace) {
    teamspace = 'default'
  }
  let endpoint = `${API_URL_PREFIX}/consumptions/summary?source=team`
  if (month) {
    endpoint += `&month=${month}`
  }
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_TEAM_SUMMARY_REQUEST, CONSUMPTION_TEAM_SUMMARY_SUCCESS, CONSUMPTION_TEAM_SUMMARY_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        headers: {teamspace}
      },
    }
  }
}

export function loadTeamSummary(teamspace, month) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamSummary(teamspace, month))
  }
}
export const CONSUMPTION_GET_CHARGE_RECORD_REQUEST = 'CONSUMPTION_GET_CHARGE_RECORD_REQUEST'
export const CONSUMPTION_GET_CHARGE_RECORD_SUCCESS = 'CONSUMPTION_GET_CHARGE_RECORD_SUCCESS'
export const CONSUMPTION_GET_CHARGE_RECORD_FAILURE = 'CONSUMPTION_GET_CHARGE_RECORD_FAILURE'

function fetchChargeRecord(teamspace) {
  if (!teamspace) {
    teamspace = 'default'
  }
  const endpoint = `${API_URL_PREFIX}/consumptions/charge-history?size=30`
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_GET_CHARGE_RECORD_REQUEST, CONSUMPTION_GET_CHARGE_RECORD_SUCCESS, CONSUMPTION_GET_CHARGE_RECORD_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        headers:{teamspace}
      },
    }
  }
}

export function loadChargeRecord(teamspace) {
  return (dispatch, getState) => {
    return dispatch(fetchChargeRecord(teamspace))
  }
}

export const CONSUMPTION_GET_NOTIFY_RULE_REQUEST = 'CONSUMPTION_GET_NOTIFY_RULE_REQUEST'
export const CONSUMPTION_GET_NOTIFY_RULE_SUCCESS = 'CONSUMPTION_GET_NOTIFY_RULE_SUCCESS'
export const CONSUMPTION_GET_NOTIFY_RULE_FAILURE = 'CONSUMPTION_GET_NOTIFY_RULE_FAILURE'

function fetchNotifyRule(teamspace) {
  if (!teamspace) {
    teamspace = 'default'
  }
  const endpoint = `${API_URL_PREFIX}/consumptions/notify-rule`
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_GET_NOTIFY_RULE_REQUEST, CONSUMPTION_GET_NOTIFY_RULE_SUCCESS, CONSUMPTION_GET_NOTIFY_RULE_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        headers:{teamspace}
      },
    }
  }
}

export function loadNotifyRule(teamspace) {
  return (dispatch, getState) => {
    return dispatch(fetchNotifyRule(teamspace))
  }
}


export const CONSUMPTION_SET_NOTIFY_RULE_REQUEST = 'CONSUMPTION_SET_NOTIFY_RULE_REQUEST'
export const CONSUMPTION_SET_NOTIFY_RULE_SUCCESS = 'CONSUMPTION_SET_NOTIFY_RULE_SUCCESS'
export const CONSUMPTION_SET_NOTIFY_RULE_FAILURE = 'CONSUMPTION_SET_NOTIFY_RULE_FAILURE'

function setNotifyRule1(teamspace, threshold, notifyWay) {
  if (!teamspace) {
    teamspace = 'default'
  }
  const endpoint = `${API_URL_PREFIX}/consumptions/notify-rule`
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_SET_NOTIFY_RULE_REQUEST, CONSUMPTION_SET_NOTIFY_RULE_SUCCESS, CONSUMPTION_SET_NOTIFY_RULE_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        method: 'PUT',
        headers:{teamspace},
        body:{
          threshold,
          notifyWay,
        }
      },
    }
  }
}

export function setNotifyRule(teamspace, threshold, notifyWay) {
  return (dispatch, getState) => {
    return dispatch(setNotifyRule1(teamspace, threshold, notifyWay))
  }
}