/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Storage action
 *
 * v0.1 - 2016-09-21
 * @author YangYuBiao
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
// import encoding from 'text-encoding'

export const STORAGE_LIST_REQUEST = 'STORAGE_LIST_REQUEST'
export const STORAGE_LIST_SUCCESS = 'STORAGE_LIST_SUCCESS'
export const STORAGE_LIST_FAILURE = 'STORAGE_LIST_FAILURE'

export function fetchStorageList(pool, cluster, query, callback) {
  return {
    pool,
    [FETCH_API]: {
      types: [STORAGE_LIST_REQUEST, STORAGE_LIST_SUCCESS, STORAGE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes?storagename=${query || 0}`,
      schema: {}//Schemas.STORAGE
    },
    callback: callback
  }
}

export function loadStorageList(pool, cluster, query, callback) {
  return (dispath, getState) => {
    const state = getState().storage.storageList
    dispath(fetchStorageList(pool, cluster, query, callback))
  }
}

export const STORAGE_CREATE_REQUEST = 'STORAGE_CREATE_REQUEST'
export const STORAGE_CREATE_SUCCESS = 'STORAGE_CREATE_SUCCESS'
export const STORAGE_CREATE_FAILURE = 'STORAGE_CREATE_FAILURE'

export function createStorage(obj, callback) {
  return {
    pool: obj.pool,
    [FETCH_API]: {
      types: [STORAGE_CREATE_REQUEST, STORAGE_CREATE_SUCCESS, STORAGE_CREATE_FAILURE],
      // endpoint: `${API_URL_PREFIX}/storage-pools/${obj.cluster}/volumes`,
      endpoint: `${API_URL_PREFIX}/clusters/${obj.clusterID}/pvcs`,
      options: {
        method: 'POST',
        body: obj
      },
      schema: {}//Schemas.STORAGE
    },
    callback: callback
  }
}



export const STORAGE_DETAIL_REQUEST = 'STORAGE_DETAIL_REQUEST'
export const STORAGE_DETAIL_SUCCESS = 'STORAGE_DETAIL_SUCCESS'
export const STORAGE_DETAIL_FAILURE = 'STORAGE_DETAIL_FAILURE'
export const STORAGE_DETAIL_CHANGE = 'STORAGE_DETAIL_CHANGE'
export function loadStorageInfo(pool, cluster, name,diskType,isOld) {
  return {
    pool,
    [FETCH_API]: {
      types: [STORAGE_DETAIL_REQUEST, STORAGE_DETAIL_SUCCESS, STORAGE_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${name}?storageType=${diskType}&isOld=${isOld}`,
      options: {
        method: 'GET'
      },
      schema: {}//Schemas.STORAGE
    }
  }
}

export function changeStorageDetail(storageInfo) {
  return {
    type: STORAGE_DETAIL_CHANGE,
    storageInfo
  }
}

export const STORAGE_DELETE_REQUEST = 'STORAGE_DELETE_REQUEST'
export const STORAGE_DELETE_SUCCESS = 'STORAGE_DELETE_SUCCESS'
export const STORAGE_DELETE_FAILURE = 'STORAGE_DELETE_FAILURE'

export function deleteStorage(pool, cluster, storageIdArray, callback) {
  return {
    [FETCH_API]: {
      pool,
      types: [STORAGE_DELETE_REQUEST, STORAGE_DELETE_SUCCESS, STORAGE_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/batch-delete`,
      options: {
        method: 'POST',
        body: storageIdArray
      },
      schema: {}//Schemas.STORAGE
    },
    callback
  }
}

export const STORAGE_FORMATE_REQUEST = 'STORAGE_FORMATE_REQUEST'
export const STORAGE_FORMATE_SUCCESS = 'STORAGE_FROMATE_SUCCESS'
export const STORAGE_FORMATE_FAILURE = 'STORAGE_FROMATE_FAILURE'

export function formateStorage(pool, cluster, storage, callback) {
  return {
    [FETCH_API]: {
      pool,
      types: [STORAGE_FORMATE_REQUEST, STORAGE_FORMATE_SUCCESS, STORAGE_FORMATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/format`,
      options: {
        method: 'PUT',
        body: storage
      },
      schema: {}//Schemas.STORAGE
    },
    callback
  }
}

export const STORAGE_RESIZE_REQUEST = 'STORAGE_RESIZE_REQUEST'
export const STORAGE_RESIZE_SUCCESS = 'STORAGE_RESIZE_SUCCESS'
export const STORAGE_RESIZE_FAILURE = 'STORAGE_RESIZE_FAILURE'

export function resizeStorage(pool, cluster, storage, callback) {
  return {
    [FETCH_API]: {
      pool,
      types: [STORAGE_RESIZE_REQUEST, STORAGE_RESIZE_SUCCESS, STORAGE_RESIZE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/size`,
      options: {
        method: 'PUT',
        body: storage
      },
      schema: {}//Schemas.STORAGE
    },
    callback
  }
}

export const STORAGE_UPLOAD_REQUEST = 'STORAGE_UPLOAD_REQUEST'
export const STORAGE_UPLOAD_SUCCESS = 'STORAGE_UPLOAD_SUCCESS'
export const STORAGE_UPLOAD_FAILURE = 'STORAGE_UPLOAD_FAILURE'
export const STORAGE_UPLOADING = 'STORAGE_UPLOADING'
export const STORAGE_MERGE_UPLOADINGFILE = 'STORAGE_MERGE_UPLOADINGFILE'

export function uploadFile(pool, cluster, storage, callback) {
  return {
    [FETCH_API]: {
      pool,
      types: [STORAGE_UPLOAD_REQUEST, STORAGE_UPLOAD_SUCCESS, STORAGE_UPLOAD_FAILURE],
      options: {
        method: 'POST',
        body: storage,
      },
      schema: {}
    },
    callback
  }
}


export const STORAGE_FILEHISTORY_REQUEST = 'STORAGE_FILEHISTORY_REQUEST'
export const STORAGE_FILEHISTORY_SUCCESS = 'STORAGE_FILEHISTORY_SUCCESS'
export const STORAGE_FILEHISTORY_FAILURE = 'STORAGE_FILEHISTORY_FAILURE'

export function getStorageFileHistory(pool, cluster, volume, callback) {
  return {
    [FETCH_API]: {
      pool,
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volume}/filehistory`,
      types: [STORAGE_FILEHISTORY_REQUEST, STORAGE_FILEHISTORY_SUCCESS, STORAGE_FILEHISTORY_FAILURE],
      schema: {}
    },
    callback
  }
}



export function getUploadFileUlr(pool, cluster, volume) {
  return `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volume}/import`
}

export function uploadFileRequest(file) {
  return {
    type: STORAGE_UPLOAD_REQUEST,
  }
}

export function uploadFileSuccess() {
  return {
    type: STORAGE_UPLOAD_SUCCESS
  }
}

export function uploadFileFailure(err) {
  return {
    type: STORAGE_UPLOAD_FAILURE,
    error: err
  }
}

export function uploading(percent) {
  return {
    type: STORAGE_UPLOADING,
    percent
  }
}

export function mergeUploadingIntoList(uploadingFile) {
  return {
    type: STORAGE_MERGE_UPLOADINGFILE,
    file: uploadingFile
  }
}


export const STORAGE_BEFORE_UPLOADFILE_REQUEST = 'STORAGE_BEFORE_UPLOADFILE_REQUEST'
export const STORAGE_BEFORE_UPLOADFILE_SUCCESS = 'STORAGE_BEFORE_UPLOADFILE_SUCCESS'
export const STORAGE_BEFORE_UPLOADFILE_FAILURE = 'STORAGE_BEFORE_UPLOADFILE_FAILURE'

export function beforeUploadFile(pool, cluster, volume, file, callback) {
  return {
    [FETCH_API]: {
      types: [STORAGE_BEFORE_UPLOADFILE_REQUEST, STORAGE_BEFORE_UPLOADFILE_SUCCESS, STORAGE_BEFORE_UPLOADFILE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volume}/beforeimport`,
      schema: {},
      options: {
        method: 'POST',
        body: {
          fileName: file.name,
          size: file.size,
          isUnzip: file.isUnzip
        }
      }
    },
    callback
  }
}

export const STORAGE_GETVOLUMEBIND_REQUEST = 'STORAGE_GETVOLUMEBIND_REQUEST'
export const STORAGE_GETVOLUMEBIND_SUCCESS = 'STORAGE_GETVOLUMEBIND_SUCCESS'
export const STORAGE_GETVOLUMEBIND_FAILURE = 'STORAGE_GETVOLUMEBIND_FAILURE'

export function getVolumeBindInfo(pool, cluster, volumeName, callback) {
  return {
    [FETCH_API]: {
      types: [STORAGE_GETVOLUMEBIND_REQUEST, STORAGE_GETVOLUMEBIND_SUCCESS, STORAGE_GETVOLUMEBIND_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volumeName}/bindinfo`,
      schema: {}
    },
    callback
  }
}

export const STORAGE_CHANGE_UPLOADOPTIONS = 'STORAGE_CHANGE_UPLOADOPTIONS'
export function uploadFileOptions(options) {
  return {
    type: STORAGE_CHANGE_UPLOADOPTIONS,
    options
  }
}

/*export const STORAGE_EXPORT_FILE_REQUEST = 'STORAGE_EXPORT_FILE_REQUEST'
export const STORAGE_EXPORT_FILE_SUCCESS = 'STORAGE_EXPORT_FILE_SUCCESS'
export const STORAGE_EXPORT_FILE_FAILURE = 'STORAGE_EXPORT_FILE_FAILURE'
export const STORAGE_EXPORT_FILE_DONE    = 'STORAGE_EXPORT_FILE_DONE'

export function exportFile(pool, cluster, volumeName, callback) {
  return (dispath, getState) => {
    dispath({
      type: STORAGE_EXPORT_FILE_REQUEST
    })
    fetch(`${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volumeName}/exportfile`).then(res=> {
      const reader = res.body.getReader()
      _consume(dispath, reader)
    }, res => {
      dispath({
        type: STORAGE_EXPORT_FILE_DONE
      })
    })
  }
  // return {
  //   [FETCH_API]: {
  //     types: [STORAGE_EXPORT_FILE_REQUEST, STORAGE_EXPORT_FILE_SUCCESS, STORAGE_EXPORT_FILE_FAILURE],
  //     endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volumeName}/exportfile`
  //   },
  //   callback
  // }
}*/


export const STORAGE_BEFORE_EXPORT_FILE_REQUEST = 'STORAGE_BEFORE_EXPORT_FILE_REQUEST'
export const STORAGE_BEFORE_EXPORT_FILE_SUCCESS = 'STORAGE_BEFORE_EXPORT_FILE_SUCCESS'
export const STORAGE_BEFORE_EXPORT_FILE_FAILURE = 'STORAGE_BEFORE_EXPORT_FILE_SUCCESS'

export function beforeExportFile(pool, cluster, volumeName, callback) {
  return {
    [FETCH_API]: {
      types: [STORAGE_BEFORE_EXPORT_FILE_REQUEST, STORAGE_BEFORE_EXPORT_FILE_SUCCESS, STORAGE_EXPORT_FILE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volumeName}/exportfile`
    },
    callback
  }
}


/*function _consume(dispath, reader) {
  const decoder = new encoding.TextDecoder("utf-8")
  return _pump()
  function _pump() {
    reader.read().then((done, value) => {
      if(done) {
        dispath({
          type: STORAGE_EXPORT_FILE_DONE,
        })
      }
      dispath({
        type: STORAGE_EXPORT_FILE_SUCCESS,
        percent: decoder(value)
      })
      return _pump()
    })
  }
}*/



export const STORAGE_GET_FREE_VOLUME_REQUEST = 'IMAGE_GET_FREE_VOLUME_REQUEST'
export const STORAGE_GET_FREE_VOLUME_SUCCESS = 'IMAGE_GET_FREE_VOLUME_SUCCESS'
export const STORAGE_GET_FREE_VOLUME_FAIULRE = 'IMAGE_GET_FREE_VOLUME_FAIULRE'

export function fetchFreeVolume(cluster) {
  return {
    cluster,
    [FETCH_API]: {
      types: [STORAGE_GET_FREE_VOLUME_REQUEST, STORAGE_GET_FREE_VOLUME_SUCCESS, STORAGE_GET_FREE_VOLUME_FAIULRE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${cluster}/volumes/available`,
      schema: {}
    }
  }
}


export function loadFreeVolume(cluster) {
  return (dispatch, getState) => {
    return dispatch(fetchFreeVolume(cluster))
  }
}
// loadFreeVolumePort
export const STORAGE_GET_FREE_PORT_REQUEST = 'STORAGE_GET_FREE_PORT_REQUEST'
export const STORAGE_GET_FREE_PORT_SUCCESS = 'STORAGE_GET_FREE_PORT_SUCCESS'
export const STORAGE_GET_FREE_PORT_FAIULRE = 'STORAGE_GET_FREE_PORT_FAIULRE'

export function loadFreeVolumePorts(cluster,netWorl,mappingPort) {
  return {
    cluster,
    [FETCH_API]: {
      types: [STORAGE_GET_FREE_PORT_REQUEST, STORAGE_GET_FREE_PORT_SUCCESS, STORAGE_GET_FREE_VOLUME_FAIULRE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/checkport?lbgroup=${netWorl}&ports=${mappingPort}`,
      // /clusters/CID-ca4135da3326/apps/checkport?lbgroup=group-default&ports=10,38168
      schema: {}
    }
  }
}


export function loadFreeVolumePort(cluster,netWorl,mappingPort) {
  return (dispatch, getState) => {
    return dispatch(loadFreeVolumePorts(cluster,netWorl,mappingPort))
  }
}
export const SNAPSHOT_CREATE_REQUEST = 'SNAPSHOT_CREATE_REQUEST'
export const SNAPSHOT_CREATE_SUCCESS = 'SNAPSHOT_CREATE_SUCCESS'
export const SNAPSHOT_CREATE_FAILURE = 'SNAPSHOT_CREATE_FAILURE'

// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSnapshotCreate(body, callback) {
	let endpoint = `${API_URL_PREFIX}/storage-pools/${body.clusterID}/volumes/${body.volumeName}/snapshot`
	return {
		[FETCH_API]: {
			types: [SNAPSHOT_CREATE_REQUEST,SNAPSHOT_CREATE_SUCCESS, SNAPSHOT_CREATE_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'POST',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function SnapshotCreate(body, callback) {
	return (dispatch) => {
		return dispatch(fetchSnapshotCreate(body, callback))
	}
}

export const SNAPSHOT_DELETE_REQUEST = 'SNAPSHOT_DELETE_REQUEST'
export const SNAPSHOT_DELETE_SUCCESS = 'SNAPSHOT_DELETE_SUCCESS'
export const SNAPSHOT_DELETE_FAILURE = 'SNAPSHOT_DELETE_FAILURE'

// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSnapshotDelete(body, callback) {
	let endpoint = `${API_URL_PREFIX}/storage-pools/${body.clusterID}/volumes/snapshot/delete`
	return {
		[FETCH_API]: {
			types: [SNAPSHOT_DELETE_REQUEST,SNAPSHOT_DELETE_SUCCESS, SNAPSHOT_DELETE_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'POST',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function SnapshotDelete(body, callback) {
	return (dispatch) => {
		return dispatch(fetchSnapshotDelete(body, callback))
	}
}



export const SNAPSHOT_ROLLBACK_REQUEST = 'SNAPSHOT_ROLLBACK_REQUEST'
export const SNAPSHOT_ROLLBACK_SUCCESS = 'SNAPSHOT_ROLLBACK_SUCCESS'
export const SNAPSHOT_ROLLBACK_FAILURE = 'SNAPSHOT_ROLLBACK_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSnapshotRollback(body, callback) {
	let endpoint = `${API_URL_PREFIX}/storage-pools/${body.clusterID}/volumes/${body.volumeName}/snapshot/rollback`
	return {
		[FETCH_API]: {
			types: [SNAPSHOT_ROLLBACK_REQUEST,SNAPSHOT_ROLLBACK_SUCCESS, SNAPSHOT_ROLLBACK_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'POST',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function SnapshotRollback(body, callback) {
	return (dispatch) => {
		return dispatch(fetchSnapshotRollback(body, callback))
	}
}

export const SNAPSHOT_LIST_REQUEST = 'SNAPSHOT_LIST_REQUEST'
export const SNAPSHOT_LIST_SUCCESS = 'SNAPSHOT_LIST_SUCCESS'
export const SNAPSHOT_LIST_FAILURE = 'SNAPSHOT_LIST_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSnapshotList(body, callback) {
	let endpoint = `${API_URL_PREFIX}/storage-pools/${body.clusterID}/volumes/snapshot/list`
	return {
		[FETCH_API]: {
			types: [SNAPSHOT_LIST_REQUEST,SNAPSHOT_LIST_SUCCESS, SNAPSHOT_LIST_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'GET'
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function SnapshotList(body, callback) {
	return (dispatch) => {
		return dispatch(fetchSnapshotList(body, callback))
	}
}


export const CALAMARI_URL_REQUEST = 'CALAMARI_URL_REQUEST'
export const CALAMARI_URL_SUCCESS = 'CALAMARI_URL_SUCCESS'
export const CALAMARI_URL_FAILURE = 'CALAMARI_URL_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCalamariUrl(body, callback) {
	let endpoint = `${API_URL_PREFIX}/storage-pools/${body.clusterID}/volumes/calamari-url`
	return {
		[FETCH_API]: {
			types: [CALAMARI_URL_REQUEST,CALAMARI_URL_SUCCESS, CALAMARI_URL_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'GET'
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function GetCalamariUrl(body, callback) {
	return (dispatch) => {
		return dispatch(fetchCalamariUrl(body, callback))
	}
}

export const CALAMARI_SET_REQUEST = 'CALAMARI_SET_REQUEST'
export const CALAMARI_SET_SUCCESS = 'CALAMARI_SET_SUCCESS'
export const CALAMARI_SET_FAILURE = 'CALAMARI_SET_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCalamariSet(body, callback) {
	let endpoint = `${API_URL_PREFIX}/storage-pools/${body.clusterID}/volumes/calamari-url`
	return {
		[FETCH_API]: {
			types: [CALAMARI_SET_REQUEST,CALAMARI_SET_SUCCESS, CALAMARI_SET_FAILURE],
			endpoint,
			schema: {},
			options: {
				body: body,
				method: 'POST'
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function SetCalamariUrl(body, callback) {
	return (dispatch) => {
		return dispatch(fetchCalamariSet(body, callback))
	}
}

export const SNAPSHOT_CLONE_REQUEST = 'SNAPSHOT_CLONE_REQUEST'
export const SNAPSHOT_CLONE_SUCCESS = 'SNAPSHOT_CLONE_SUCCESS'
export const SNAPSHOT_CLONE_FAILURE = 'SNAPSHOT_CLONE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSnapshotClone(body, callback) {
	let endpoint = `${API_URL_PREFIX}/storage-pools/${body.clusterID}/volumes/${body.volumeName}/snapshot/clone`
	return {
		[FETCH_API]: {
			types: [SNAPSHOT_CLONE_REQUEST,SNAPSHOT_CLONE_SUCCESS, SNAPSHOT_CLONE_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'POST',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function SnapshotClone(body, callback) {
	return (dispatch) => {
		return dispatch(fetchSnapshotClone(body, callback))
	}
}