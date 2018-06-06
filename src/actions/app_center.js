/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for app manage
 *
 * v0.1 - 2016-10-08
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const IMAGE_PRIVATE_LIST_REQUEST = 'IMAGE_PRIVATE_LIST_REQUEST'
export const IMAGE_PRIVATE_LIST_SUCCESS = 'IMAGE_PRIVATE_LIST_SUCCESS'
export const IMAGE_PRIVATE_LIST_FAILURE = 'IMAGE_PRIVATE_LIST_FAILURE'

export function loadPrivateImageList(registry, callback) {
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_PRIVATE_LIST_REQUEST, IMAGE_PRIVATE_LIST_SUCCESS, IMAGE_PRIVATE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/private`,
      schema: Schemas.REGISTRYS
    },
    callback
  }
}

export const IMAGE_PUBLIC_LIST_REQUEST = 'IMAGE_PUBLIC_LIST_REQUEST'
export const IMAGE_PUBLIC_LIST_SUCCESS = 'IMAGE_PUBLIC_LIST_SUCCESS'
export const IMAGE_PUBLIC_LIST_FAILURE = 'IMAGE_PUBLIC_LIST_FAILURE'

// Fetches app list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.

// Fetches apps list from API unless it is cached.
// public image list
export function loadPublicImageList(registry, serverType = null, callback) {
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_PUBLIC_LIST_REQUEST, IMAGE_PUBLIC_LIST_SUCCESS, IMAGE_PUBLIC_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}`,
      schema: Schemas.REGISTRYS
    },
    serverType,
    callback
  }
}

export function searchPublicImages(registry, image) {
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_PUBLIC_LIST_REQUEST, IMAGE_PUBLIC_LIST_SUCCESS, IMAGE_PUBLIC_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}?q=${image}`,
      schema: Schemas.REGISTRYS
    }
  }
}

export const IMAGE_PUBLIC_TYPE = 'IMAGE_PUBLIC_TYPE'

export function publicFilterServer(registry, server) {
  return {
    type: IMAGE_PUBLIC_TYPE,
    registry,
    server
  }
}

export const IMAGE_SEARCH_PRIVATE = "IMAGE_SEARCH_PRIVATE"

export function searchPrivateImages(condition) {
  return {
    type: IMAGE_SEARCH_PRIVATE,
    condition
  }
}

export const IMAGE_SEARCH_FAVORITE = "IMAGE_SEARCH_FAVORITE"
export function searchFavoriteImages(condition) {
  return {
    type: IMAGE_SEARCH_FAVORITE,
    condition
  }
}

export const ADD_OTHER_STORE_REQUEST = 'ADD_OTHER_STORE_REQUEST'
export const ADD_OTHER_STORE_SUCCESS = 'ADD_OTHER_STORE_SUCCESS'
export const ADD_OTHER_STORE_FAILURE = 'ADD_OTHER_STORE_FAILURE'
// add Other image
export function addOtherStore(obj, callback) {
  return {
    [FETCH_API]: {
      types: [ADD_OTHER_STORE_REQUEST, ADD_OTHER_STORE_SUCCESS, ADD_OTHER_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${obj.registryName}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'POST',
        body: obj
      }
    },
    callback
  }
}

export const IMAGE_OTHER_REQUEST = 'IMAGE_OTHER_REQUEST'
export const IMAGE_OTHER_SUCCESS = 'IMAGE_OTHER_SUCCESS'
export const IMAGE_OTHER_FAILURE = 'IMAGE_OTHER_FAILURE'

// Other image  table
export function LoadOtherImage(callback) {
  return {
    [FETCH_API]: {
      types: [IMAGE_OTHER_REQUEST, IMAGE_OTHER_SUCCESS, IMAGE_OTHER_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry`,
      schema: Schemas.REGISTRYS
    },
    callback
  }
}

export const GET_OTHER_LIST_REQUEST = 'GET_OTHER_LIST_REQUEST'
export const GET_OTHER_LIST_SUCCESS = 'GET_OTHER_LIST_SUCCESS'
export const GET_OTHER_LIST_FAILURE = 'GET_OTHER_LIST_FAILURE'

// Other image list getOtherImageList
export function getOtherImageList(id) {
  return {
    [FETCH_API]: {
      types: [GET_OTHER_LIST_REQUEST, GET_OTHER_LIST_SUCCESS, GET_OTHER_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${id}/images`,
      schema: Schemas.REGISTRYS
    },
    id
  }
}

export const SEARCH_OTHER_LIST_REQUEST = 'SEARCH_OTHER_LIST_REQUEST'
// Search Other image list getOtherImageList
export function SearchOtherImage(image,id) {
  return {
    type: SEARCH_OTHER_LIST_REQUEST,
    image,
    id
  }
}

export const DELETE_OTHER_IMAGE_REQUEST = 'DELETE_OTHER_IMAGE_REQUEST'
export const DELETE_OTHER_IMAGE_SUCCESS = 'DELETE_OTHER_IMAGE_SUCCESS'
export const DELETE_OTHER_IMAGE_FAILURE = 'DELETE_OTHER_IMAGE_FAILURE'
// delete Other image
export function DeleteOtherImage(id, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_OTHER_IMAGE_REQUEST, DELETE_OTHER_IMAGE_SUCCESS, DELETE_OTHER_IMAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${id}`,
      options: {
        method: 'DELETE',
        body: id
      },
      schema: Schemas.REGISTRYS
    },
    callback,
    id
  }
}

export const GET_OTHER_IMAGE_TAGS_REQUEST = 'GET_OTHER_IMAGE_TAGS_REQUEST'
export const GET_OTHER_IMAGE_TAGS_SUCCESS = 'GET_OTHER_IMAGE_TAGS_SUCCESS'
export const GET_OTHER_IMAGE_TAGS_FAILURE = 'GET_OTHER_IMAGE_TAGS_FAILURE'

export function getOtherImageTag(obj, callback) {
  let urlImageName = processImageName(obj.imageName)
  return {
    registry: obj.registry,
    [FETCH_API]: {
      types: [GET_OTHER_IMAGE_TAGS_REQUEST, GET_OTHER_IMAGE_TAGS_SUCCESS, GET_OTHER_IMAGE_TAGS_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${obj.id}/images/${urlImageName}/tags`,
      schema: Schemas.REGISTRYS
    },
    callback
  }
}

//this is get the image detail tag
export const IMAGE_GET_DETAILTAG_REQUEST = 'IMAGE_GET_DETAILTAG_REQUEST'
export const IMAGE_GET_DETAILTAG_SUCCESS = 'IMAGE_GET_DETAILTAG_SUCCESS'
export const IMAGE_GET_DETAILTAG_FAILURE = 'IMAGE_GET_DETAILTAG_FAILURE'

function fetchImageGetDetailTag(registry, fullName, callback) {
  let urlFullName = processImageName(fullName)
  return {
    registry,
    fullName,
    [FETCH_API]: {
      types: [IMAGE_GET_DETAILTAG_REQUEST, IMAGE_GET_DETAILTAG_SUCCESS, IMAGE_GET_DETAILTAG_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/${urlFullName}/tags`,
      schema: Schemas.REGISTRYS
    },
    callback
  }
}

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadImageDetailTag(registry, fullName, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchImageGetDetailTag(registry, fullName, callback))
  }
}

//this is get the image detail tag config
export const IMAGE_GET_DETAILTAGCONFIG_REQUEST = 'IMAGE_GET_DETAILTAGCONFIG_REQUEST'
export const IMAGE_GET_DETAILTAGCONFIG_SUCCESS = 'IMAGE_GET_DETAILTAGCONFIG_SUCCESS'
export const IMAGE_GET_DETAILTAGCONFIG_FAILURE = 'IMAGE_GET_DETAILTAGCONFIG_FAILURE'

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
function fetchImageGetDetailTagConfig(registry, fullName, tag, callback) {
  let urlFullName = processImageName(fullName)
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_GET_DETAILTAGCONFIG_REQUEST, IMAGE_GET_DETAILTAGCONFIG_SUCCESS, IMAGE_GET_DETAILTAGCONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/${urlFullName}/tags/${tag}/configs`,
      schema: Schemas.REGISTRYS
    },
    callback,
    tag
  }
}

export function loadImageDetailTagConfig(registry, fullName, tag, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchImageGetDetailTagConfig(registry, fullName, tag, callback))
  }
}

export const GET_OTHER_TAG_CONFIG_REQUEST = 'GET_OTHER_TAG_CONFIG_REQUEST'
export const GET_OTHER_TAG_CONFIG_SUCCESS = 'GET_OTHER_TAG_CONFIG_SUCCESS'
export const GET_OTHER_TAG_CONFIG_FAILURE = 'GET_OTHER_TAG_CONFIG_FAILURE'
export function loadOtherDetailTagConfig(obj, callback) {
  let urlFullName = processImageName(obj.fullname)
  return {
    [FETCH_API]: {
      types: [GET_OTHER_TAG_CONFIG_REQUEST, GET_OTHER_TAG_CONFIG_SUCCESS, GET_OTHER_TAG_CONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${obj.imageId}/images/${urlFullName}/tags/${obj.imageTag}`,
      schema: Schemas.REGISTRYS
    },
    tag: obj.imageTag,
    callback
  }
}

//this is get the image info(docker and attribute)
export const GET_IMAGEINFO_REQUEST = 'GET_IMAGEINFO_REQUEST'
export const GET_IMAGEINFO_SUCCESS = 'GET_IMAGEINFO_SUCCESS'
export const GET_IMAGEINFO_FAILURE = 'GET_IMAGEINFO_FAILURE'

export function getImageDetailInfo(obj, callback) {
  let urlFullName = processImageName(obj.fullName)
  return {
    registry: obj.registry,
    [FETCH_API]: {
      types: [GET_IMAGEINFO_REQUEST, GET_IMAGEINFO_SUCCESS, GET_IMAGEINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${urlFullName}/detailInfo`,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export const GET_CHECK_IMAGE_REQUEST = 'GET_CHECK_IMAGE_REQUEST'
export const GET_CHECK_IMAGE_SUCCESS = 'GET_CHECK_IMAGE_SUCCESS'
export const GET_CHECK_IMAGE_FAILURE = 'GET_CHECK_IMAGE_FAILURE'

function fetchCheckImage(obj, callback) {
  let urlImage = processImageName(obj.image)
  return {
    [FETCH_API]: {
      types: [GET_CHECK_IMAGE_REQUEST, GET_CHECK_IMAGE_SUCCESS, GET_CHECK_IMAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${urlImage}`,
      schema: {}
    },
    registry: obj.registry,
    callback
  }
}

export function checkImage(obj, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCheckImage(obj, callback))
  }
}

export const DELETE_PRIVATE_IMAGE_REQUEST = 'DELETE_PRIVATE_IMAGE_REQUEST'
export const DELETE_PRIVATE_IMAGE_SUCCESS = 'DELETE_PRIVATE_IMAGE_SUCCESS'
export const DELETE_PRIVATE_IMAGE_FAILURE = 'DELETE_PRIVATE_IMAGE_FAILURE'

function fetchDeletePrivateImage(obj, callback) {
  let urlImage = processImageName(obj.image)
  return {
    [FETCH_API]: {
      types: [DELETE_PRIVATE_IMAGE_REQUEST, DELETE_PRIVATE_IMAGE_SUCCESS, DELETE_PRIVATE_IMAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${urlImage}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'DELETE',
      }
    },
    image: obj.image,
    registry: obj.registry,
    callback
  }
}

export function deleteImage(obj, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeletePrivateImage(obj, callback))
  }
}

export const UPDATA_IMAGE_INFO_REQUEST = 'UPDATA_IMAGE_INFO_REQUEST'
export const UPDATA_IMAGE_INFO_SUCCESS = 'UPDATA_IMAGE_INFO_SUCCESS'
export const UPDATA_IMAGE_INFO_FAILURE = 'UPDATA_IMAGE_INFO_FAILURE'

function fetchUpdateImageInfo(obj, callback) {
  let urlImage = processImageName(obj.image)
  return {
    [FETCH_API]: {
      types: [UPDATA_IMAGE_INFO_REQUEST, UPDATA_IMAGE_INFO_SUCCESS, UPDATA_IMAGE_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${urlImage}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'PUT',
        body: obj.body
      }
    },
    image: obj.image,
    registry: obj.registry,
    callback
  }
}

export function updateImageinfo(obj, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateImageInfo(obj, callback))
  }
}

export const SET_IMAGE_STORE_REQUEST = 'SET_IMAGE_STORE_REQUEST'
export const SET_IMAGE_STORE_SUCCESS = 'SET_IMAGE_STORE_SUCCESS'
export const SET_IMAGE_STORE_FAILURE = 'SET_IMAGE_STORE_FAILURE'
// set image store 收藏镜像
export function imageStore(obj, callback) {
  let urlImage = processImageName(obj.image)
  return {
    [FETCH_API]: {
      types: [SET_IMAGE_STORE_REQUEST, SET_IMAGE_STORE_SUCCESS, SET_IMAGE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${urlImage}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'PUT',
        body: {
          myfavourite: obj.isFavourite,
        }
      }
    },
    registry: obj.registry,
    isFavourite: obj.isFavourite,
    callback
  }
}
// set image store 设置镜像 公开 or 私有
export function imageSwitch(obj, callback) {
  let urlImage = processImageName(obj.image)
  return {
    [FETCH_API]: {
      types: [SET_IMAGE_STORE_REQUEST, SET_IMAGE_STORE_SUCCESS, SET_IMAGE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${urlImage}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'PUT',
        body: {
          isPrivate: obj.isPrivate
        }
      }
    },
    registry: obj.registry,
    isPrivate: obj.isPrivate,
    callback
  }
}

export const GET_IMAGE_FOCK_REQUEST = "GET_IMAGE_FOCK_REQUEST"
export const GET_IMAGE_FOCK_SUCCESS = "GET_IMAGE_FOCK_SUCCESS"
export const GET_IMAGE_FOCK_FAILURE = "GET_IMAGE_FOCK_FAILURE"

// -------------------------- 我的收藏  ------------------------------------------
export function loadFavouriteList(registry, callback) {
  return {
    registry,
    [FETCH_API]: {
      types: [GET_IMAGE_FOCK_REQUEST, GET_IMAGE_FOCK_SUCCESS, GET_IMAGE_FOCK_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/favourite`,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

// --------------------------  编排中心   ---------------------------------- ------
export const CREATE_STACK_REQUEST = 'CREATE_STACK_REQUEST'
export const CREATE_STACK_SUCCESS = 'CREATE_STACK_SUCCESS'
export const CREATE_STACK_FAILURE = 'CREATE_STACK_FAILURE'
export function createStack(obj, callback) {
  return {
    registry: obj.registry,
    [FETCH_API]: {
      types: [CREATE_STACK_REQUEST, CREATE_STACK_SUCCESS, CREATE_STACK_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'POST',
        body: {
          'is_public': obj.is_public,
          'content': obj.content,
          'name': obj.name,
          'description': obj.description
        }
      }
    },
    callback
  }
}

export const GET_PRIVATE_STACK_REQUEST = 'GET_PRIVATE_STACK_REQUEST'
export const GET_PRIVATE_STACK_SUCCESS = 'GET_PRIVATE_STACK_SUCCESS'
export const GET_PRIVATE_STACK_FAILURE = 'GET_PRIVATE_STACK_FAILURE'
//filter=owned private templates  filter=dbservice is database cluster
function fetchLoadTemplates(registry, query, callback) {
  let filter = 'owned'
  if (query) filter = query
  return {
    registry,
    [FETCH_API]: {
      types: [GET_PRIVATE_STACK_REQUEST, GET_PRIVATE_STACK_SUCCESS, GET_PRIVATE_STACK_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates?filter=${filter}`,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export function loadMyStack(registry, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchLoadTemplates(registry, query, callback))
  }
}

export const GET_PUBLIC_STACK_REQUEST = 'GET_PUBLIC_STACK_REQUEST'
export const GET_PUBLIC_STACK_SUCCESS = 'GET_PUBLIC_STACK_SUCCESS'
export const GET_PUBLIC_STACK_FAILURE = 'GET_PUBLIC_STACK_FAILURE'

function fetchLoadStack(registry) {
  return {
    registry,
    [FETCH_API]: {
      types: [GET_PUBLIC_STACK_REQUEST, GET_PUBLIC_STACK_SUCCESS, GET_PUBLIC_STACK_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates`,
      schema: Schemas.REGISTRYS,
    }
  }
}

export function loadStack(registry) {
  return (dispatch, getState) => {
    return dispatch(fetchLoadStack(registry))
  }
}

export const SEARCH_PRIVATE_STACK_LIST = 'SEARCH_PRIVATE_STACK_LIST'
export const SEARCH_PUBLIC_STACK_LIST = 'SEARCH_PUBLIC_STACK_LIST'
function fetchSearchStack(obj) {
  let type = SEARCH_PRIVATE_STACK_LIST
  if (obj.stackType === 'public-stack') {
    type = SEARCH_PUBLIC_STACK_LIST
  }
  return {
    type,
    registry: obj.registry,
    imageName: obj.imageName
  }
}

export function searchStack(obj) {
  return (dispatch, getState) => {
    return dispatch(fetchSearchStack(obj))
  }
}

export const DELETE_PRIVATE_STACK_REQUEST = 'DELETE_PRIVATE_STACK_REQUEST'
export const DELETE_PRIVATE_STACK_SUCCESS = 'DELETE_PRIVATE_STACK_SUCCESS'
export const DELETE_PRIVATE_STACK_FAILURE = 'DELETE_PRIVATE_STACK_FAILURE'

export function deleteMyStack(obj, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_PRIVATE_STACK_REQUEST, DELETE_PRIVATE_STACK_SUCCESS, DELETE_PRIVATE_STACK_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates/${obj.id}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'DELETE',
      }
    },
    callback,
    registry: obj.registry,
    id: obj.id
  }
}

export const UPDATE_PRIVATE_STACK_REQUEST = 'UPDATE_PRIVATE_STACK_REQUEST'
export const UPDATE_PRIVATE_STACK_SUCCESS = 'UPDATE_PRIVATE_STACK_SUCCESS'
export const UPDATE_PRIVATE_STACK_FAILURE = 'UPDATE_PRIVATE_STACK_FAILURE'

export function updateStack(obj, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_PRIVATE_STACK_REQUEST, UPDATE_PRIVATE_STACK_SUCCESS, UPDATE_PRIVATE_STACK_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates/${obj.id}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'PUT',
        body: {
          'is_public': obj.is_public,
          'content': obj.content,
          'name': obj.name,
          'description': obj.description
        }
      }
    },
    obj,
    callback,
    registry: obj.registry,
    id: obj.id
  }
}

export const GET_PRIVATE_STACK_INFO_REQUEST = 'GET_PRIVATE_STACK_INFO_REQUEST'
export const GET_PRIVATE_STACK_INFO_SUCCESS = 'GET_PRIVATE_STACK_INFO_SUCCESS'
export const GET_PRIVATE_STACK_INFO_FAILURE = 'GET_PRIVATE_STACK_INFO_FAILURE'

function fetchStackDetail(id, callback) {
  return {
    [FETCH_API]: {
      types: [GET_PRIVATE_STACK_INFO_REQUEST, GET_PRIVATE_STACK_INFO_SUCCESS, GET_PRIVATE_STACK_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates/${id}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'GET',
      }
    },
    callback
  }
}

export function loadStackDetail(id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchStackDetail(id, callback))
  }
}


/*删除私有应用模板*/
export const DELETE_APP_INFO_REQUEST = 'DELETE_APP_INFO_REQUEST'
export const DELETE_APP_INFO_SUCCESS = 'DELETE_APP_INFO_SUCCESS'
export const DELETE_APP_INFO_FAILURE = 'DELETE_APP_INFO_FAILURE'

function fetchDeleteApp(id,role, callback) {
    return {
        [FETCH_API]: {
            types: [DELETE_APP_INFO_REQUEST, DELETE_APP_INFO_SUCCESS, DELETE_APP_INFO_FAILURE],
            endpoint: `${API_URL_PREFIX}/templates/${id}?role=${role}`,
            options: {
                method: 'DELETE',
            },
            schema: Schemas.REGISTRYS,

        },
        callback
    }
}

export function deleteAppTemplate(id,role, callback) {
    return (dispatch, getState) => {
        return dispatch(fetchDeleteApp(id,role, callback))
    }
}




export const GET_APP_STORE_LIST_REQUEST = 'GET_APP_STORE_LIST_REQUEST'
export const GET_APP_STORE_LIST_SUCCESS = 'GET_APP_STORE_LIST_SUCCESS'
export const GET_APP_STORE_LIST_FAILURE = 'GET_APP_STORE_LIST_FAILURE'

function fetchAppStore(registry, callback) {
  return {
    [FETCH_API]: {
      types: [GET_APP_STORE_LIST_REQUEST, GET_APP_STORE_LIST_SUCCESS, GET_APP_STORE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates?filter=appstore`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'GET',
      }
    },
    registry,
    callback
  }
}

export function loadAppStore(registry, callback) {
    return (dispatch, getState) => {
        return dispatch(fetchAppStore(registry, callback))
    }
}


export const SEARCH_APP_STORE = 'SEARCH_APP_STORE'
export function searchAppStore(id,callback) {
  return {
    type: SEARCH_APP_STORE,
    id
  }
}



export const GET_ENTERPRISE_APP_CENTER_BIND_REQUEST = 'GET_ENTERPRISE_APP_CENTER_BIND_REQUEST'
export const GET_ENTERPRISE_APP_CENTER_BIND_SUCCESS = 'GET_ENTERPRISE_APP_CENTER_BIND_SUCCESS'
export const GET_ENTERPRISE_APP_CENTER_BIND_FAILURE = 'GET_ENTERPRISE_APP_CENTER_BIND_FAILURE'

function fetchAppCenterBindUser(callback) {
  return {
    [FETCH_API]: {
      types: [GET_ENTERPRISE_APP_CENTER_BIND_REQUEST, GET_ENTERPRISE_APP_CENTER_BIND_SUCCESS, GET_ENTERPRISE_APP_CENTER_BIND_FAILURE],
      endpoint: `${API_URL_PREFIX}/tenx-hubs`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'GET',
      }
    },
    callback
  }
}

export function getAppCenterBindUser(callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAppCenterBindUser(callback))
  }
}

export const POST_ENTERPRISE_APP_CENTER_BIND_REQUEST = 'POST_ENTERPRISE_APP_CENTER_BIND_REQUEST'
export const POST_ENTERPRISE_APP_CENTER_BIND_SUCCESS = 'POST_ENTERPRISE_APP_CENTER_BIND_SUCCESS'
export const POST_ENTERPRISE_APP_CENTER_BIND_FAILURE = 'POST_ENTERPRISE_APP_CENTER_BIND_FAILURE'

function postAppCenterBindUser(body, callback) {
  return {
    [FETCH_API]: {
      types: [POST_ENTERPRISE_APP_CENTER_BIND_REQUEST, POST_ENTERPRISE_APP_CENTER_BIND_SUCCESS, POST_ENTERPRISE_APP_CENTER_BIND_FAILURE],
      endpoint: `${API_URL_PREFIX}/tenx-hubs`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'POST',
        body: body
      }
    },
    callback
  }
}

export function AppCenterBindUser(body, callback) {
  return (dispatch, getState) => {
    return dispatch(postAppCenterBindUser(body, callback))
  }
}

export const DEL_ENTERPRISE_APP_CENTER_BIND_REQUEST = 'DEL_ENTERPRISE_APP_CENTER_BIND_REQUEST'
export const DEL_ENTERPRISE_APP_CENTER_BIND_SUCCESS = 'DEL_ENTERPRISE_APP_CENTER_BIND_SUCCESS'
export const DEL_ENTERPRISE_APP_CENTER_BIND_FAILURE = 'DEL_ENTERPRISE_APP_CENTER_BIND_FAILURE'

function delAppCenterBindUser(callback) {
  return {
    [FETCH_API]: {
      types: [DEL_ENTERPRISE_APP_CENTER_BIND_REQUEST, DEL_ENTERPRISE_APP_CENTER_BIND_SUCCESS, DEL_ENTERPRISE_APP_CENTER_BIND_FAILURE],
      endpoint: `${API_URL_PREFIX}/tenx-hubs`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'DELETE',
      }
    },
    callback
  }
}

export function deleteAppCenterBindUser(callback) {
  return (dispatch, getState) => {
    return dispatch(delAppCenterBindUser(callback))
  }
}

export const GET_IMAGE_MIRRORSAFETY_SCANSTATUS_REQUEST = 'GET_IMAGE_MIRRORSAFETY_SCANSTATUS_REQUEST'
export const GET_IMAGE_MIRRORSAFETY_SCANSTATUS_SUCCESS = 'GET_IMAGE_MIRRORSAFETY_SCANSTATUS_SUCCESS'
export const GET_IMAGE_MIRRORSAFETY_SCANSTATUS_FAILURE = 'GET_IMAGE_MIRRORSAFETY_SCANSTATUS_FAILURE'

function fetchMirrorSafetyScanStatus(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_IMAGE_MIRRORSAFETY_SCANSTATUS_REQUEST, GET_IMAGE_MIRRORSAFETY_SCANSTATUS_SUCCESS, GET_IMAGE_MIRRORSAFETY_SCANSTATUS_FAILURE],
      endpoint: `${API_URL_PREFIX}/images/scan-status?imageName=${body.imageName}&tag=${body.tag}`,
      schema: Schemas.REGISTRYS,
    },
    imageName:body.imageName,
    tag:body.tag,
    callback
  }
}

export function loadMirrorSafetyScanStatus(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchMirrorSafetyScanStatus(body, callback))
  }
}

export const GET_IMAGE_MIRRORSAFETY_SCAN_REQUEST = 'GET_IMAGE_MIRRORSAFETY_SCAN_REQUEST'
export const GET_IMAGE_MIRRORSAFETY_SCAN_SUCCESS = 'GET_IMAGE_MIRRORSAFETY_SCAN_SUCCESS'
export const GET_IMAGE_MIRRORSAFETY_SCAN_FAILURE = 'GET_IMAGE_MIRRORSAFETY_SCAN_FAILURE'

function fetchMirrorSafetyScan(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_IMAGE_MIRRORSAFETY_SCAN_REQUEST, GET_IMAGE_MIRRORSAFETY_SCAN_SUCCESS, GET_IMAGE_MIRRORSAFETY_SCAN_FAILURE],
      endpoint: `${API_URL_PREFIX}/images/scan`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'POST',
        body
      }
    },
    imageName:body.imageName,
    tag:body.tag,
    callback
  }
}

export function loadMirrorSafetyScan(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchMirrorSafetyScan(body, callback))
  }
}

export const GET_IMAGE_MIRRORSAFETY_LAYERINFO_REQUEST = 'GET_IMAGE_MIRRORSAFETY_LAYERINFO_REQUEST'
export const GET_IMAGE_MIRRORSAFETY_LAYERINFO_SUCCESS = 'GET_IMAGE_MIRRORSAFETY_LAYERINFO_SUCCESS'
export const GET_IMAGE_MIRRORSAFETY_LAYERINFO_FAILURE = 'GET_IMAGE_MIRRORSAFETY_LAYERINFO_FAILURE'

function fetchMirrorSafetyLayerinfo(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_IMAGE_MIRRORSAFETY_LAYERINFO_REQUEST, GET_IMAGE_MIRRORSAFETY_LAYERINFO_SUCCESS, GET_IMAGE_MIRRORSAFETY_LAYERINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/images/layer-info?imageName=${body.imageName}&tag=${body.tag}`,
      schema: Schemas.REGISTRYS,
    },
    imageName:body.imageName,
    tag:body.tag,
    callback
  }
}

export function loadMirrorSafetyLayerinfo(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchMirrorSafetyLayerinfo(body, callback))
  }
}

export const GET_IMAGE_MIRRORSAFETY_LYINSINFO_REQUEST = 'GET_IMAGE_MIRRORSAFETY_LYINSINFO_REQUEST'
export const GET_IMAGE_MIRRORSAFETY_LYINSINFO_SUCCESS = 'GET_IMAGE_MIRRORSAFETY_LYINSINFO_SUCCESS'
export const GET_IMAGE_MIRRORSAFETY_LYINSINFO_FAILURE = 'GET_IMAGE_MIRRORSAFETY_LYINSINFO_FAILURE'

function fetchMirrorSafetyLyinsinfo(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_IMAGE_MIRRORSAFETY_LYINSINFO_REQUEST, GET_IMAGE_MIRRORSAFETY_LYINSINFO_SUCCESS, GET_IMAGE_MIRRORSAFETY_LYINSINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/images/lyins-info?uploadImage_sum=${body.blob_sum}&full_name=${body.full_name}`,
      schema: Schemas.REGISTRYS,
    },
    imageName:body.imageName,
    tag:body.tag,
    callback
  }
}

export function loadMirrorSafetyLyinsinfo(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchMirrorSafetyLyinsinfo(body, callback))
  }
}

export const GET_IMAGE_MIRRORSAFETY_CLAIRINFO_REQUEST = 'GET_IMAGE_MIRRORSAFETY_CLAIRINFO_REQUEST'
export const GET_IMAGE_MIRRORSAFETY_CLAIRINFO_SUCCESS = 'GET_IMAGE_MIRRORSAFETY_CLAIRINFO_SUCCESS'
export const GET_IMAGE_MIRRORSAFETY_CLAIRINFO_FAILURE = 'GET_IMAGE_MIRRORSAFETY_CLAIRINFO_FAILURE'

function fetchMirrorSafetyChairinfo(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_IMAGE_MIRRORSAFETY_CLAIRINFO_REQUEST, GET_IMAGE_MIRRORSAFETY_CLAIRINFO_SUCCESS, GET_IMAGE_MIRRORSAFETY_CLAIRINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/images/clair-info?blob_sum=${body.blob_sum}&full_name=${body.full_name}`,
      schema: Schemas.REGISTRYS,
    },
    imageName:body.imageName,
    tag:body.tag,
    callback
  }
}

export function loadMirrorSafetyChairinfo(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchMirrorSafetyChairinfo(body, callback))
  }
}

function processImageName(name) {
  let arr = name.split('/')
  if (arr.length > 2) {
    name = arr[0] + '/' + arr[1]
    for (let i = 2; i < arr.length; i++) {
      name += "%2F"
      name += arr[i]
    }   
  }
  return name
}