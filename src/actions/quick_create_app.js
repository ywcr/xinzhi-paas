/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for quick create app
 *
 * v0.1 - 2017-05-05
 * @author Zhangpc
 */

export const QUICK_CREATE_APP_SET_FORM_FIELDS = 'QUICK_CREATE_APP_SET_FORM_FIELDS'

export function setFormFields(key, fields, callback) {
  return {
    key,
    fields,
    type: QUICK_CREATE_APP_SET_FORM_FIELDS,
    callback
  }
}

export const QUICK_CREATE_APP_REMOVE_FORM_FIELDS = 'QUICK_CREATE_APP_REMOVE_FORM_FIELDS'

export function removeFormFields(key, callback) {
  return {
    key,
    type: QUICK_CREATE_APP_REMOVE_FORM_FIELDS,
    callback
  }
}

export const QUICK_CREATE_APP_REMOVE_ALL_FORM_FIELDS = 'QUICK_CREATE_APP_REMOVE_ALL_FORM_FIELDS'

export function removeAllFormFields(callback) {
  return {
    type: QUICK_CREATE_APP_REMOVE_ALL_FORM_FIELDS,
    callback
  }
}

export const QUICK_CREATE_APP_REMOVE_OLD_FORM_FIELDS_BY_REG_EXP = 'QUICK_CREATE_APP_REMOVE_OLD_FORM_FIELDS_BY_REG_EXP'

export function removeOldFormFieldsByRegExp(key, reg, callback) {
  return {
    key,
    reg,
    type: QUICK_CREATE_APP_REMOVE_OLD_FORM_FIELDS_BY_REG_EXP,
    callback
  }
}
