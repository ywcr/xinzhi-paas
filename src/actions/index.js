/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'
// Resets the currently visible error message.
export function resetErrorMessage() {
  return {
    type: RESET_ERROR_MESSAGE
  }
}

export const THROW_ERROR = 'THROW_ERROR'
/**
 * Throw an error to state
 *
 * @export
 * @param {Object} error
 * @returns {Object}
 */
export function throwError(error) {
  return {
    type: THROW_ERROR,
    error
  }
}