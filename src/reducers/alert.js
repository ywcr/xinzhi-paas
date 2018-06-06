/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-03-23
 * @author mengyuan
 */
'use strict'

import * as ActionTypes from '../actions/alert'
import reducerFactory from './factory'

const option = {
  overwrite: true
}


function getSettingList(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch(action.type) {
    case ActionTypes.ALERT_SETTING_LIST_QUERY_REQUEST:
      return Object.assign({}, defaultState, state, { isFetching: action.needFetching})
    case ActionTypes.ALERT_SETTING_LIST_QUERY_SUCCESS:
      return Object.assign({}, defaultState, state, { isFetching: false, result: action.response.result})
    case ActionTypes.ALERT_SETTING_LIST_QUERY_FAILED:
      return Object.assign({}, defaultState, state, { isFetching: false})
    default:
      return state
  }
}

function getSettingListfromserviceorapp(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch(action.type) {
    case ActionTypes.GET_SETTINGLLIST_FROM_SERVICE_APP_REQUEST:
      return Object.assign({}, defaultState, state, { isFetching: action.needFetching})
    case ActionTypes.GET_SETTINGLLIST_FROM_SERVICE_APP_SUCCESS:
      return Object.assign({}, defaultState, state, { isFetching: false, result: action.response.result.data})
    case ActionTypes.GET_SETTINGLLIST_FROM_SERVICE_APP_FAILURE:
      return Object.assign({}, defaultState, state, { isFetching: false})
    default:
      return state
  }
}

export default function alert(state = {
  recordFilters: {},
  records: {},
  invitations:{}
}, action) {
  return {
    recordFilters: reducerFactory({
      REQUEST: ActionTypes.ALERT_GET_RECORDS_FILTERS_REQUEST,
      SUCCESS: ActionTypes.ALERT_GET_RECORDS_FILTERS_SUCCESS,
      FAILURE: ActionTypes.ALERT_GET_RECORDS_FILTERS_FAILURE
    }, state.recordFilters, action, option),
    records: reducerFactory({
      REQUEST: ActionTypes.ALERT_GET_RECORDS_REQUEST,
      SUCCESS: ActionTypes.ALERT_GET_RECORDS_SUCCESS,
      FAILURE: ActionTypes.ALERT_GET_RECORDS_FAILURE
    }, state.records, action, option),
    groups: reducerFactory({
      REQUEST: ActionTypes.ALERT_GET_NOTIFY_GROUPS_REQUEST,
      SUCCESS: ActionTypes.ALERT_GET_NOTIFY_GROUPS_SUCCESS,
      FAILURE: ActionTypes.ALERT_GET_NOTIFY_GROUPS_FAILURE
    }, state.groups, action, option),
    getSetting: reducerFactory({
      REQUEST: ActionTypes.ALERT_SETTING_REQUEST,
      SUCCESS: ActionTypes.ALERT_SETTING_SUCCESS,
      FAILURE: ActionTypes.ALERT_SETTING_FAILURE
    }, state.getSetting, action, option),
    addSetting: reducerFactory({
      REQUEST: ActionTypes.ALERT_SETTING_ADD_REQUEST,
      SUCCESS: ActionTypes.ALERT_SETTING_ADD_SUCCESS,
      FAILURE: ActionTypes.ALERT_SETTING_ADD_FAILURE
    }, state.addSetting, action, option),
    settingList: getSettingList(state.settingList, action),
    SettingListfromserviceorapp: getSettingListfromserviceorapp(state.SettingListfromserviceorapp, action),
    deleteSetting: reducerFactory({
      REQUEST: ActionTypes.ALERT_DELETE_SETTING_REQUEST,
      SUCCESS: ActionTypes.ALERT_DELETE_SETTING_SUCCESS,
      FAILURE: ActionTypes.ALERT_DELETE_SETTING_FAILURE
    }, state.deleteSetting, action, option),
    ingoreSetting: reducerFactory({
      REQUEST: ActionTypes.ALERT_INGORE_SETTING_REQUEST,
      SUCCESS: ActionTypes.ALERT_INGORE_SETTING_SUCCESS,
      FAILURE: ActionTypes.ALERT_INGORE_SETTING_FAILURE
    }, state.ignoreSetting, action, option),
    settingInstant: reducerFactory({
      REQUEST: ActionTypes.ALERT_SETTING_INSTANT_REQUEST,
      SUCCESS: ActionTypes.ALERT_SETTING_INSTANT_SUCCESS,
      FAILURE: ActionTypes.ALERT_SETTING_INSTANT_FAILURE
    }, state.settingInstant, action, {
      overwrite: false
    }),
    updateEnable: reducerFactory({
      REQUEST: ActionTypes.ALERT_UPDATE_SETTING_ENABLE_REQUEST,
      SUCCESS: ActionTypes.ALERT_UPDATE_SETTING_ENABLE_SUCCESS,
      FAILURE: ActionTypes.ALERT_UPDATE_SETTING_ENABLE_FAILURE
    }, state.updteEnable, action, option),
    updateSendEmail: reducerFactory({
      REQUEST: ActionTypes.ALERT_UPDATE_SETTING_SENDEMAIL_REQUEST,
      SUCCESS: ActionTypes.ALERT_UPDATE_SETTING_SENDEMAIL_SUCCESS,
      FAILURE: ActionTypes.ALERT_UPDATE_SETTING_SENDEMAIL_FAILURE
    }, state.updateSendEmail, action, option),
    deleteRule: reducerFactory({
      REQUEST: ActionTypes.ALERT_DELETE_RULE_REQUEST,
      SUCCESS: ActionTypes.ALERT_DELETE_RULE_SUCCESS,
      FAILURE: ActionTypes.ALERT_DELETE_RULE_FAILURE
    }, state.deleteRule, action),
    searchSetting: reducerFactory({
      REQUEST: ActionTypes.ALERT_SEARCH_SETTING_REQUEST,
      SUCCESS: ActionTypes.ALERT_SEARCH_SETTING_SUCCESS,
      FAILURE: ActionTypes.ALERT_SEARCH_SETTING_FAILURE
    }, state.deleteRule, action),
    invitations: reducerFactory({
      REQUEST: ActionTypes.SEND_INVITATIONS_REQUEST,
      SUCCESS: ActionTypes.SEND_INVITATIONS_SUCCESS,
      FAILURE: ActionTypes.SEND_INVITATIONS_FAILURE
    }, state.invitations, action, option)
  }
}
