/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Reducer of quick create app
 *
 * v0.1 - 2017-05-05
 * @author Zhangpc
 */
import * as ActionTypes from '../actions/quick_create_app'

export default function quickCreateApp(state = { fields: {} }, action) {
  const { type, key, reg, fields } = action
  const newFields = {}
  switch (type) {
    case ActionTypes.QUICK_CREATE_APP_SET_FORM_FIELDS:
      return Object.assign({}, state, {
        fields: Object.assign({}, state.fields, {
          [key]: Object.assign({}, state.fields[key], fields),
        }),
      })
    case ActionTypes.QUICK_CREATE_APP_REMOVE_FORM_FIELDS:
      for (let fieldKey in state.fields) {
        if (state.fields.hasOwnProperty(fieldKey) && fieldKey !== key ) {
          newFields[fieldKey] = state.fields[fieldKey]
        }
      }
      return Object.assign({}, state, {
        fields: newFields,
      })
    case ActionTypes.QUICK_CREATE_APP_REMOVE_OLD_FORM_FIELDS_BY_REG_EXP:
      const currentFields = state.fields[key] || {}
      for (let fieldKey in currentFields) {
        if (currentFields.hasOwnProperty(fieldKey) && !reg.test(fieldKey)) {
          newFields[fieldKey] = currentFields[fieldKey]
        }
      }
      return Object.assign({}, state, {
        fields: {
          [key]: newFields
        },
      })
    case ActionTypes.QUICK_CREATE_APP_REMOVE_ALL_FORM_FIELDS:
      return Object.assign({}, state, {
        fields: {},
      })
    default:
      return state
  }
}
