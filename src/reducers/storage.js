/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-09-21
 * @author YangYuBiao
 */
import * as ActionTypes from '../actions/storage'
import merge from 'lodash/merge'
import union from 'lodash/union'

function storageList(state = {}, action) {
  const pool = action.pool
  const defaultState = {
    [pool]: {
      isFetching: false,
      pool,
      login: null,
      number: 0,
      storageList: []
    }
  }
  switch (action.type) {
    case ActionTypes.STORAGE_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [pool]: { isFetching: true }
      })
    case ActionTypes.STORAGE_LIST_SUCCESS:
      return Object.assign({}, defaultState, {
        [pool]: {
          isFetching: false,
          storageList: action.response.result.data,
          pool: pool
        }
      })
    case ActionTypes.STORAGE_LIST_FAILURE:
      return Object.assign({}, state, defaultState, {
        [pool]: { isFetching: false }
      })
    default:
      return state
  }
}

function deleteStorage(state = {}, action) {
  switch (action.type) {
    case ActionTypes.STORAGE_DELETE_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.STORAGE_DELETE_SUCCESS:
      return merge({}, state, {
        isFetching: false
      })
    case ActionTypes.STORAGE_DELETE_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}



function createStorage(state = {}, action) {
  switch (action.type) {
    case ActionTypes.STORAGE_CREATE_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.STORAGE_CREATE_SUCCESS:
      return merge({}, state, {
        isFetching: false
      })
    case ActionTypes.STORAGE_CREATE_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}
function formateStorage(state = {}, action) {
  switch (action.type) {
    case ActionTypes.STORAGE_FORMATE_REQUEST:
      return merge({}, state, { isFetching: true })
    case ActionTypes.STORAGE_FORMATE_SUCCESS:
      return merge({}, state, { isFetching: false })
    case ActionTypes.STORAGE_FORMATE_SUCCESS:
      return merge({}, state, { isFetching: false })
    default:
      return state
  }
}

function resizeStorage(state = {}, action) {
  switch (action.type) {
    case ActionTypes.STORAGE_RESIZE_REQUEST:
      return merge({}, state, { isFetching: true })
    case ActionTypes.STORAGE_RESIZE_SUCCESS:
      return merge({}, state, { isFetching: false })
    case ActionTypes.STORAGE_RESIZE_FAILURE:
      return merge({}, state, { isFetching: false })
    default:
      return state
  }
}

function storageDetail(state = {}, action) {
  switch (action.type) {
    case ActionTypes.STORAGE_DETAIL_REQUEST:
      return merge({}, {
        isFetching: true
      })
    case ActionTypes.STORAGE_DETAIL_SUCCESS:
      return merge({}, {
        isFetching: false,
        StorageInfo: action.response.result.body
      })
    case ActionTypes.STORAGE_DETAIL_FAILURE:
      return merge({}, {
        isFetching: false
      })
    case ActionTypes.STORAGE_DETAIL_CHANGE:
      return merge({}, state, { StorageInfo: action.storageInfo })
    default:
      return state
  }
}

function uploadFile(state = {}, action) {
  const defaultState = {
    isFetching: false,
    percent: 0
  }
  switch (action.type) {
    case ActionTypes.STORAGE_UPLOAD_REQUEST: {
      return merge({}, defaultState, state, {
        isFetching: true
      })
    }
    case ActionTypes.STORAGE_UPLOAD_SUCCESS: {
      return merge({}, defaultState, state, {
        isFetching: false
      })
    }
    case ActionTypes.STORAGE_UPLOAD_FAILURE: {
      return merge({}, defaultState, state, {
        isFetching: false
      })
    }
    case ActionTypes.STORAGE_UPLOADING: {
      return merge({}, defaultState, state, {
        percent: action.percent
      })
    }
    default:
      return state
  }
}

function getStorageFileHistory(state = {}, action) {
  const defaultState = {
    isFetching: false,
    history: []
  }
  switch (action.type) {
    case ActionTypes.STORAGE_FILEHISTORY_REQUEST:
      return merge({}, defaultState, { isFetching: true })
    case ActionTypes.STORAGE_FILEHISTORY_SUCCESS:
      return Object.assign({}, { history: action.response.result.data }, { isFetching: false })
    case ActionTypes.STORAGE_FILEHISTORY_FAILURE:
      return merge({}, defaultState, { isFetching: false })
    case ActionTypes.STORAGE_MERGE_UPLOADINGFILE:
      const customState = _.cloneDeep(state)
      var index = -1
      if (!customState.history) {
        customState.history = [action.file]
        customState.isFetching = false
        return customState
      } else {
        index = _.findIndex(customState.history, ['backupId', action.file.backupId])
      }
      if (index >= 0) {
        customState.history[index] = action.file
      } else {
        customState.history.unshift(action.file)
      }
      customState.isFetching = false
      return customState
    default:
      return state
  }
}

function beforeUploadFile(state = {}, action) {
  switch (action.type) {
    case ActionTypes.STORAGE_BEFORE_UPLOADFILE_REQUEST:
      return merge({}, state, { isFetching: true })
    case ActionTypes.STORAGE_BEFORE_UPLOADFILE_SUCCESS:
      return Object.assign({}, state, action.response.result.data, { isFetching: false })
    case ActionTypes.STORAGE_BEFORE_UPLOADFILE_FAILURE:
      return Object.assign({}, state, { isFetching: false })
    default:
      return state
  }
}

function volumeBindInfo(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch (action.type) {
    case ActionTypes.STORAGE_GETVOLUMEBIND_REQUEST:
      return merge({}, defaultState, { isFetching: true })
    case ActionTypes.STORAGE_GETVOLUMEBIND_SUCCESS:
      return merge({}, defaultState, { volumeBindInfo: action.response.result.data }, { isFetching: false })
    case ActionTypes.STORAGE_GETVOLUMEBIND_FAILURE:
      return merge({}, defaultState, { isFetching: false })
    default:
      return state
  }
}

function changeUploadFileOptions(state = {}, action) {
  const defaultState = {
    visible: false,
    uploadFile: true
  }
  switch (action.type) {
    case ActionTypes.STORAGE_CHANGE_UPLOADOPTIONS: {
      return action.options
    }
    default: {
      return Object.assign({}, defaultState, state)
    }
  }
}

function beforeExportFile(state = {}, action) {
  const defaultState = {
    exportFile: true
  }
  switch(action.type) {
    case ActionTypes.STORAGE_BEFORE_EXPORT_FILE_REQUEST:
      return
  }
}

function exportFile(state = {}, action) {
  const defaultState = {
    isFetching: false,
    percent: 0,
    visible: false,
    exportFile: true
  }
  switch (action.type) {
    case ActionTypes.STORAGE_EXPORT_FILE_REQUEST:
      return merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.STORAGE_EXPORT_FILE_SUCCESS:
      return merge({}, defaultState, state, { visible: true, percent: 100, isFetching: false }, action.response.result.data)
    case ActionTypes.STORAGE_EXPORT_FILE_DONE:
      return merge({}, defaultState, state, { visible: false, percent: 100, isFetching: false})
    case ActionTypes.STORAGE_EXPORT_FILE_FAILURE:
      return merge({}, defaultState, state, { visible: false, percent: 100, isFetching: false })
    default:
      return merge({}, defaultState, state)
  }
}

function avaliableVolume(state = {}, action) {
  switch(action.type) {
    case ActionTypes.STORAGE_GET_FREE_VOLUME_REQUEST:
      return merge({}, {isFetching: true})
    case ActionTypes.STORAGE_GET_FREE_VOLUME_SUCCESS:
      return merge({}, action.response.result, { isFetching: false})
    case ActionTypes.STORAGE_GET_FREE_VOLUME_FAIULRE:
      return merge({}, state, {isFetching: false})
    default:
      return state
  }
}

function snapshotList(state = {}, action) {
  switch(action.type) {
    case ActionTypes.SNAPSHOT_LIST_REQUEST:
      return merge({}, state, {
        isFetching: true,
      })
    case ActionTypes.SNAPSHOT_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result.data,
      })
    case ActionTypes.SNAPSHOT_LIST_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}


export default function storageReducer(state = {}, action) {
  return {
    storageList: storageList(state.storageList, action),
    deleteStorage: deleteStorage(state.deleteStorage, action),
    createStorage: createStorage(state.createStorage, action),
    formateStorage: formateStorage(state.formateStorage, action),
    resizeStorage: resizeStorage(state.deleteStorage, action),
    storageDetail: storageDetail(state.storageDetail, action),
    uploadFile: uploadFile(state.uploadFile, action),
    storageFileHistory: getStorageFileHistory(state.storageFileHistory, action),
    beforeUploadFile: beforeUploadFile(state.beforeUploadFile, action),
    volumeBindInfo: volumeBindInfo(state.volumeBindInfo, action),
    uploadFileOptions: changeUploadFileOptions(state.uploadFileOptions, action),
    exportFile: exportFile(state.exportFile, action),
    avaliableVolume: avaliableVolume(state.avaliableVolume, action),
    snapshotList:snapshotList(state.snapshotList,action)
  }
}