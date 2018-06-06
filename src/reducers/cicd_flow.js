/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  cicd flow
 *
 * v2.0 - 2016/11/07
 * @author  BaiYu
 */


import * as ActionTypes from '../actions/cicd_flow'
import merge from 'lodash/merge'
import reducerFactory from './factory'
import cloneDeep from 'lodash/cloneDeep'
import findIndex from 'lodash/findIndex'
import groupBy from 'lodash/groupBy'

function codeRepo(state = {}, action) {
  const defaultState = {
    isFetching: false,

  }
  let repoType = ''
  if(action.extraData) {
    repoType = action.extraData.type
  }
  switch (action.type) {
  case ActionTypes.GET_REPOS_LIST_REQUEST:
    return merge({}, defaultState, state, { isFetching: true })
  case ActionTypes.GET_REPOS_LIST_SUCCESS:
    return Object.assign({}, state, {
      isFetching: false,
      [repoType]: {
        repoList: action.response.result.data.results,
        bak: action.response.result.data.results
      }
    })
  case ActionTypes.GET_REPOS_LIST_FAILURE:
    return merge({}, state, {
      isFetching: false,
      [repoType]: {
        repoList: null
      }
    })
    // delete
  case ActionTypes.DELETE_GITLAB_REPO_SUCCESS:
    return Object.assign({}, state, {
      isFetching: false,
      [repoType]: {
        repoList: null,
        bak: null
      }
    })
  case ActionTypes.DELETE_GITLAB_REPO_FAILURE:
    return merge({}, state, { isFetching: false })

    // search
  case ActionTypes.SEARCH_CODE_REPO_LIST:
    const newState = cloneDeep(state)
    if (action.codeName == '') {
      newState[repoType].repoList = newState[repoType].bak
      return newState
    }
    const temp = newState[repoType].repoList.filter(list => {
      const search = new RegExp(action.codeName)
      if (search.test(list.name)) {
        return true
      }
      return false
    })
    newState[repoType].repoList = temp
    return {
      ...newState
    }
    // add active
  case ActionTypes.ADD_CODE_STORE_SUCCESS:
    const addState = cloneDeep(state)
    const indexs = findIndex(addState[repoType].repoList, (item) => {
      return item.name == action.names
    })

    if(indexs < 0) return addState
    addState[repoType].repoList[indexs].managedProject = {
      active: 1,
      id: action.response.result.data.projectId
    }
    return addState
    // remove action
  case ActionTypes.NOT_ACTIVE_PROJECT_SUCCESS:
    const reState = cloneDeep(state)
    const Keys = findIndex(reState[repoType].repoList, (item) => {
      if (item.managedProject && item.managedProject.id == action.id) {
        return true
      }
      return false
    })
    if(Keys < 0) return reState
    reState[repoType].repoList[Keys].managedProject = { active: 0 }
    return reState
  default:
    return state
  }
}

function githubRepo(state = {}, action) {
  const defaultState = {
    isFetching: false,
  }
  let repoType = ''
  if (action.extraData) {
    repoType = action.extraData.type
  }
  switch (action.type) {
    case ActionTypes.GET_GITHUB_LIST_REQUEST:
      return merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.GET_GITHUB_LIST_SUCCESS: {
      if (!action.response.result.data.hasOwnProperty('results')) {
        return Object.assign({}, state, {
          isFetching: false,
          [repoType]: {
            [`${repoType}List`]: false,
          }
        })
      }
      const username = Object.keys(action.response.result.data.results)[0]
      const users = action.response.result.data.results[username].user
      let repos = {}
      for (var k in action.response.result.data.results) {
        repos[action.response.result.data.results[k].user] = action.response.result.data.results[k].repos
      }
      action.response.result.data.results = repos
      const lists = cloneDeep(action.response.result.data.results)

      return Object.assign({}, state, {
        isFetching: false,
        [repoType]: {
          [`${repoType}List`]: action.response.result.data.results,
          [`${repoType}bak`]: lists,
          users
        }
      })
    }
    case ActionTypes.GET_GITHUB_LIST_FAILURE: {
      return Object.assign({}, state, {
        isFetching: false,
        [repoType]: {
          [`${repoType}List`]: false,
        }
      })
    }
    case ActionTypes.DELETE_GITHUB_REPO_SUCCESS: {
      return Object.assign({}, state, {
        isFetching: false,
        [repoType]: {
          [`${repoType}List`]: false,
        }
      })
    }
    case ActionTypes.SEARCH_GITHUB_LIST: {
      const newState = cloneDeep(state)
      if (action.image == '') {
        newState[repoType][`${repoType}List`][action.users] = newState[repoType][`${repoType}bak`][action.users]
      }
      const temp = newState[repoType][`${repoType}List`][action.users].filter(list => {
        const search = new RegExp(action.image)
        if (search.test(list.name)) {
          return true
        }
        return false
      })
      newState[repoType][`${repoType}List`][action.users] = temp
      return newState
    }
    // add github active
    case ActionTypes.ADD_GITHUB_PROJECT_SUCCESS: {
      const addState = cloneDeep(state)
      const user = action.repoUser ? action.repoUser : action.users
      const indexs = findIndex(addState[repoType][`${repoType}List`][user], (item) => {
        if (item.name === action.names) {
          return true
        }
        return false
      })
      addState[repoType][`${repoType}List`][user][indexs].managedProject = {
        active: 1,
        id: action.response.result.data.projectId
      }
      return addState
    }
    // remove github active
    case ActionTypes.NOT_Github_ACTIVE_PROJECT_SUCCESS: {
      const rmState = cloneDeep(state)
      const rindex = findIndex(rmState[repoType][`${repoType}List`][action.users], (item) => {
        if (item.managedProject && item.managedProject.id === action.id) {
          return true
        }
        return false
      })
      rmState[repoType][`${repoType}List`][action.users][rindex].managedProject = { active: 0 }
      return rmState
    }
    default:
      return state
  }
}

function getProject(state = {}, action) {
  const defaultState = {
    isFetching: false,
    projectList: [],
  }
  switch (action.type) {
    case ActionTypes.GET_CODE_STORE_REQUEST:
      return merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.GET_CODE_STORE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        projectList: action.response.result.data.results,
        bak: action.response.result.data.results
      })
    case ActionTypes.GET_CODE_STORE_FAILURE:
      return merge({}, state, { isFetching: false })
    // delete
    case ActionTypes.DELETE_CODE_STORE_SUCCESS:
      const oldState = cloneDeep(state)
      const indexs = findIndex(oldState.projectList, (item) => {
        return item.id == action.id
      })
      oldState.projectList.splice(indexs, 1)
      oldState.bak = oldState.projectList
      return {
        ...oldState
      }
    case ActionTypes.DELETE_CODE_STORE_FAILURE:
      return merge({}, state, { isFetching: false })
    // search
    case ActionTypes.SEARCH_CODE_STORE_LIST:
      const newState = cloneDeep(state)
      if (action.codeName == '') {
        newState.projectList = newState.bak
      }
      const temp = newState.projectList.filter(list => {
        const search = new RegExp(action.codeName)
        if (search.test(list.name)) {
          return true
        }
        return false
      })
      newState.projectList = temp
      return {
        ...newState
      }
    // filter
    case ActionTypes.FILTER_CODE_STORE_LIST:
      const filterState = cloneDeep(state)
      if (action.types == 'all') {
        filterState.projectList = filterState.bak
        return { ...filterState }
      }
      const lists = filterState.bak.filter(list => {
        if (list.isPrivate == action.types) {
          return true
        }
        return false
      })
      filterState.projectList = lists
      return {
        ...filterState
      }
    default:
      return state
  }
}
function getUserInfo(state = {}, action) {
  const defaultState = {
    isFetching: false,
  }
  let repoType = ''
  if(action.extraData) {
    repoType = action.extraData.type
  }
  switch (action.type) {
    case ActionTypes.GET_REPO_USER_INFO_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_REPO_USER_INFO_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        [repoType]: {
          repoUser: action.response.result.data.results
        }
      }
      )
    case ActionTypes.GET_REPO_USER_INFO_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }

}

function getDockerfileList(state = {}, action) {
  const defaultState = {
    isFetching: false,
    dockerfileList: []
  }
  switch (action.type) {
    case ActionTypes.GET_DOCKER_FILES_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_DOCKER_FILES_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        dockerfileList: action.response.result.data.results,
        bak: action.response.result.data.results,
      })
    case ActionTypes.GET_DOCKER_FILES_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    // search
    case ActionTypes.SEARCH_DOCKER_FILES_LIST:
      const seState = cloneDeep(state)
      const lists = seState.bak.filter(list => {
        const search = new RegExp(action.names)
        if (search.test(list.name && list.stageName)) {
          return true
        }
        return false
      })
      seState.dockerfileList = lists
      return seState
    default:
      return state
  }
}

function deployLog(state = {}, action) {
  const defaultStatus = {
    isFetching: false,
    deployList: []
  }
  switch (action.type) {
    case ActionTypes.GET_DEPLOY_LOG_REQUEST:
      return merge({}, defaultStatus, state, {
        isFetching: true
      })
    case ActionTypes.GET_DEPLOY_LOG_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        deployList: action.response.result.data.results
      })
    case ActionTypes.GET_DEPLOY_LOG_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        deployList: []
      })
    default:
      return state
  }
}

function getCdRules(state = {}, action) {
  const defaultStatus = {
    isFetching: false,
    cdRulesList: []
  }
  switch (action.type) {
    case ActionTypes.GET_CD_RULES_LIST_REQUEST:
      return merge({}, defaultStatus, state, {
        isFetching: true
      })
    case ActionTypes.GET_CD_RULES_LIST_SUCCESS:
      for (let i = 0; i < action.response.result.data.results.length; i++) {
        action.response.result.data.results[i].editing = false
      }
      return Object.assign({}, state, {
        isFetching: false,
        cdRulesList: action.response.result.data.results
      })
    case ActionTypes.GET_CD_RULES_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        cdRulesList: []
      })
    case ActionTypes.DELETE_CD_RULES_LIST_SUCCESS:
      const cdState = cloneDeep(state)
      let cin = findIndex(cdState.cdRulesList, item => {
        return item.ruleId == action.ruleId
      })
      cdState.cdRulesList.splice(cin, 1)
      return { ...cdState }

    default:
      return state
  }
}

function getCdImage(state = {}, action) {
  const defaultState = {
    isFetching: false,
    cdImageList: []
  }
  switch (action.type) {
    case ActionTypes.GET_CD_RULES_IMAGE_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_CD_RULES_IMAGE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        cdImageList: action.response.result.data.images
      })
    case ActionTypes.GET_CD_RULES_IMAGE_FAILURE:
      return defaultState
    default:
      return state
  }
}

function getTenxflowList(state = {}, action) {
  const defaultState = {
    isFetching: false,
    total: 0,
    flowList: []
  }
  switch (action.type) {
    case ActionTypes.GET_ENN_FLOW_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_ENN_FLOW_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        flowList: action.response.result.data.results,
        total: action.response.result.data.total
      }
      )
    case ActionTypes.GET_ENN_FLOW_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    case ActionTypes.CHANGE_FLOW_STATUS_SUCCESS: {
      const flowId = action.flowId
      const status = action.status
      const cloneState = cloneDeep(state)
      const index = findIndex(cloneState.flowList, (item) => {
        return item.flowId == flowId
      })
      if (index < 0) {
        return cloneState
      }
      cloneState.flowList[index].status = status
      return cloneState
    }
    default:
      return state
  }
}

function getTenxflowDetail(state = {}, action) {
  const defaultState = {
    isFetching: false,
    flowInfo: {}
  }
  switch (action.type) {
    case ActionTypes.GET_SINGLE_ENN_FLOW_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_SINGLE_ENN_FLOW_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        flowInfo: action.response.result.data.results
      }
      )
    case ActionTypes.GET_SINGLE_ENN_FLOW_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getTenxflowStatus(state = {}, action) {
  const defaultState = {
    isFetching: false,
    flowInfo: {}
  }
  switch (action.type) {
    case ActionTypes.GET_SINGLE_ENN_FLOW_STATUS_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_SINGLE_ENN_FLOW_STATUS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        flowInfo: action.response.result.data.results
      }
      )
    case ActionTypes.GET_SINGLE_ENN_FLOW_STATUS_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getTenxflowYAML(state = {}, action) {
  const defaultState = {
    isFetching: false,
    flowInfo: {}
  }
  switch (action.type) {
    case ActionTypes.GET_ENN_FLOW_YAML_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_ENN_FLOW_YAML_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        flowYAML: action.response.result.data.results
      }
      )
    case ActionTypes.GET_ENN_FLOW_YAML_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getTenxflowStageList(state = {}, action) {
  const defaultState = {
    isFetching: false,
    stageList: []
  }
  switch (action.type) {
    case ActionTypes.GET_ENN_FLOW_STATE_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_ENN_FLOW_STATE_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        stageList: action.response.result.data.results,
      }
      )
    case ActionTypes.GET_ENN_FLOW_STATE_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    case ActionTypes.CHANGE_SINGLE_ENN_FLOW_STATE:
      const body = action.body
      const cloneState = cloneDeep(state)
      cloneState.stageList.forEach(item => {
        if (!item.lastBuildStatus) {
          return
        }
        if (item.metadata.id == body.stageId && item.lastBuildStatus.buildId == body.stageBuildId) {
          item.lastBuildStatus.status = body.buildStatus
        }
      })
      return cloneState

    default:
      return state
  }
}

function getTenxflowStageDetail(state = {}, action) {
  const defaultState = {
    isFetching: false,
    stageInfo: {}
  }
  switch (action.type) {
    case ActionTypes.GET_ENN_FLOW_STATE_DETAIL_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_ENN_FLOW_STATE_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        stageInfo: action.response.result.results,
      }
      )
    case ActionTypes.GET_ENN_FLOW_STATE_DETAIL_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getCodeStoreBranchList(state = {}, action) {
  const defaultState = {
    isFetching: false,
    branchList: {}
  }
  switch (action.type) {
    case ActionTypes.GET_REPOS_BRANCH_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_REPOS_BRANCH_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        branchList: action.response.result.data,
      }
      )
    case ActionTypes.GET_REPOS_BRANCH_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function repoBranchesAndTags(state = {}, action) {
  const id = action.reponame || action.projectId || action.project_id
  const defaultState = {
    [id]: {
      isFetching: false,
      data: {}
    }
  }
  switch (action.type) {
    case ActionTypes.GET_REPO_BRANCH_AND_TAG_REQUEST:
    case ActionTypes.GET_REPO_BRANCH_AND_TAG_BY_PROJECT_ID_REQUEST:
      return merge({}, defaultState, state, {
        [id]: {
          isFetching: true
        }
      })
    case ActionTypes.GET_REPO_BRANCH_AND_TAG_SUCCESS:
    case ActionTypes.GET_REPO_BRANCH_AND_TAG_BY_PROJECT_ID_SUCCESS:
      return Object.assign({}, state, {
        [id]: {
          isFetching: false,
          data: action.response.result.data,
        }
      })
    case ActionTypes.GET_REPO_BRANCH_AND_TAG_FAILURE:
    case ActionTypes.GET_REPO_BRANCH_AND_TAG_BY_PROJECT_ID_FAILURE:
      return merge({}, defaultState, state, {
        [id]: {
          isFetching: false
        }
      })
    default:
      return state
  }
}

function getTenxflowCIRules(state = {}, action) {
  const defaultState = {
    isFetching: false,
    ciRules: {}
  }
  switch (action.type) {
    case ActionTypes.GET_FLOW_CI_RULES_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_FLOW_CI_RULES_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        ciRules: action.response.result.data,
      }
      )
    case ActionTypes.GET_FLOW_CI_RULES_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getTenxflowBuildLogs(state = {}, action) {
  const defaultState = {
    isFetching: false,
    logs: []
  }
  switch (action.type) {
    case ActionTypes.GET_FLOW_BUILD_LOG_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_FLOW_BUILD_LOG_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        logs: action.response.result.data.results.results || []
      }
      )
    case ActionTypes.GET_FLOW_BUILD_LOG_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    case ActionTypes.CHANGE_BUILD_STATUS:
      if(!state.logs || state.logs.length <=0 ) return state
      const cloneState = cloneDeep(state)
      const index = findIndex(cloneState.logs, log => {
        return log.buildId == action.buildId
      })
      if(index < 0){
        return cloneState
      }
      cloneState.logs[index].status = action.status
      return cloneState
      return
      return cloneState
    default:
      return state
  }
}

function getTenxflowBuildDetailLogs(state = {}, action) {
  const defaultState = {
    isFetching: false,
    logs: []
  }
  switch (action.type) {
    case ActionTypes.GET_FLOW_BUILD_DETAIL_LOG_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_FLOW_BUILD_DETAIL_LOG_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        logs: action.response.result.data.results.results || []
      }
      )
    case ActionTypes.GET_FLOW_BUILD_DETAIL_LOG_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}


function getTenxflowBuildLastLogs(state = {}, action) {
  const defaultState = {
    isFetching: false,
    logs: []
  }
  switch (action.type) {
    case ActionTypes.GET_FLOW_BUILD_LAST_LOG_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_FLOW_BUILD_LAST_LOG_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        logs: action.response.result.data.results.results.stageBuilds || []
      }
      )
    case ActionTypes.GET_FLOW_BUILD_LAST_LOG_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    case ActionTypes.CHANGE_CI_FLOW_STATUS:
      const clonestate = cloneDeep(state)
      const {index, status, log} = action.body
      if (clonestate) {
        if (!clonestate.logs || !clonestate.logs[index]) return
        clonestate.logs[index].status = status
        clonestate.logs[index].logInfo = log
      }

      return clonestate
    default:
      return state
  }
}

function getFlowBuildStageLogs(state = {}, action) {
  const defaultState = {
    isFetching: false,
    logs: []
  }
  switch (action.type) {
    case ActionTypes.GET_FLOW_BUILD_STAGE_LOG_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_FLOW_BUILD_STAGE_LOG_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        logs: action.response.result || []
      }
      )
    case ActionTypes.GET_FLOW_BUILD_STAGE_LOG_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getStageBuildLogList(state = {}, action) {
  const defaultState = {
    isFetching: false,
    logs: []
  }
  switch (action.type) {
    case ActionTypes.GET_STAGE_BUILD_LOG_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_STAGE_BUILD_LOG_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        logs: action.response.result.data.results.results || []
      }
      )
    case ActionTypes.GET_STAGE_BUILD_LOG_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    case ActionTypes.CHANGE_CI_FLOW_STATUS: {
      const cloneState = cloneDeep(state)
      const {index, status, log} = action.body
      if (cloneState) {
        if (!cloneState.logs) return
        cloneState.logs[index].status = status
        cloneState.logs[index].logInfo = log
      }
      return cloneState
    }
    default:
      return state
  }
}

function availableImage(state = {}, action) {
  const defaultState = {
    isFetching: false,
    imageList: [],
    baseImages: [],
  }
  switch (action.type) {
    case ActionTypes.GET_AVAILABLE_IMAGE_REQUEST: {
      return merge({}, defaultState, { isFetching: action.needFetching })
    }
    case ActionTypes.GET_AVAILABLE_IMAGE_SUCCESS: {
      const result = action.response.result.data.results || []
      const imageList = []
      const temp = {}
      for (let a in result) {
        let key = result[a].categoryName
        let id = result[a].categoryId
        let isSystem = result[a].isSystem
        if (!temp[key]) {
          temp[key] = {
            imageList: [],
            title: key,
            id,
            isSystem,
          }
          temp[key].imageList.push(result[a])
        } else {
          temp[key].imageList.push(result[a])
        }
      }
      const resultArray = Object.getOwnPropertyNames(temp).map(item => {
        return temp[item]
      })
      let baseImages = groupBy(result, n => n.isSystem)
      for (let key in baseImages) {
        if (baseImages.hasOwnProperty(key)) {
          baseImages[key] = groupBy(baseImages[key], n => n.categoryId)
        }
      }
      return Object.assign({}, state, {
        isFetching: false,
        imageList: resultArray,
        baseImages,
        server: action.response.result.data.registry
      })
    }
    case ActionTypes.GET_AVAILABLE_IMAGE_FAILURE: {
      return {
        isFetching: false,
        imageList: false
      }
    }
    default:
      return state
  }
}

function cicdWs(state,action){
  switch (action.type) {
    case ActionTypes.SET_CICD_WS:{
      if(action.ws){
        return{
          ws:Object.assign({}, state?state.ws:{} ,action.ws)
        } 
      }else{
        return{
          ws:{}
        } 
      }
    }
    default:{
      return state;
    }
  }
}

export default function cicd_flow(state = {}, action) {
  return {
    cicdWs:cicdWs(state.cicdWs,action),
    codeRepo: codeRepo(state.codeRepo, action),
    githubRepo: githubRepo(state.githubRepo, action),
    managed: getProject(state.managed, action),
    getTenxflowList: getTenxflowList(state.getTenxflowList, action),
    getTenxflowDetail: getTenxflowDetail(state.getTenxflowDetail, action),
    getTenxflowStatus: getTenxflowStatus(state.getTenxflowStatus, action),
    getTenxflowYAML: getTenxflowYAML(state.getTenxflowYAML, action),
    userInfo: getUserInfo(state.userInfo, action),
    dockerfileLists: getDockerfileList(state.dockerfileLists, action),
    deployLog: deployLog(state.deployLog, action),
    getCdRules: getCdRules(state.getCdRules, action),
    getCdImage: getCdImage(state.getCdImage, action),
    repoBranchesAndTags: repoBranchesAndTags(state.repoBranchesAndTags, action),
    getTenxflowCIRules: getTenxflowCIRules(state.getTenxflowCIRules, action),
    getTenxflowBuildLogs: getTenxflowBuildLogs(state.getTenxflowBuildLogs, action),
    getTenxflowBuildDetailLogs: getTenxflowBuildDetailLogs(state.getTenxflowBuildDetailLogs, action),
    getTenxflowBuildLastLogs: getTenxflowBuildLastLogs(state.getTenxflowBuildLastLogs, action),
    getFlowBuildStageLogs: getFlowBuildStageLogs(state.getFlowBuildStageLogs, action),
    getStageBuildLogList: getStageBuildLogList(state.getStageBuildLogList, action),
    availableImage: availableImage(state.availableImage, action),
    UpdateTenxflowCIRules: reducerFactory({
      REQUEST: ActionTypes.UPDATE_FLOW_CI_RULES_REQUEST,
      SUCCESS: ActionTypes.UPDATE_FLOW_CI_RULES_SUCCESS,
      FAILURE: ActionTypes.UPDATE_FLOW_CI_RULES_FAILURE
    }, state.UpdateTenxflowCIRules, action),
    setStageLink: reducerFactory({
      REQUEST: ActionTypes.PUT_STAGE_LINK_REQUEST,
      SUCCESS: ActionTypes.PUT_STAGE_LINK_SUCCESS,
      FAILURE: ActionTypes.PUT_STAGE_LINK_FAILURE
    }, state.setStageLink, action),
    createTenxFlowSingle: reducerFactory({
      REQUEST: ActionTypes.CREATE_SINGLE_ENN_FLOW_REQUEST,
      SUCCESS: ActionTypes.CREATE_SINGLE_ENN_FLOW_SUCCESS,
      FAILURE: ActionTypes.CREATE_SINGLE_ENN_FLOW_FAILURE
    }, state.createTenxFlowSingle, action),
    updateTenxFlowAlert: reducerFactory({
      REQUEST: ActionTypes.UPDATE_ENN_FLOW_ALERT_REQUEST,
      SUCCESS: ActionTypes.UPDATE_ENN_FLOW_ALERT_SUCCESS,
      FAILURE: ActionTypes.UPDATE_ENN_FLOW_ALERT_FAILURE
    }, state.updateTenxFlowAlert, action),
    deleteTenxFlowSingle: reducerFactory({
      REQUEST: ActionTypes.DELETE_SINGLE_ENN_FLOW_REQUEST,
      SUCCESS: ActionTypes.DELETE_SINGLE_ENN_FLOW_SUCCESS,
      FAILURE: ActionTypes.DELETE_SINGLE_ENN_FLOW_FAILURE
    }, state.deleteTenxFlowSingle, action),
    deleteTenxFlow: reducerFactory({
      REQUEST: ActionTypes.DELETE_ENN_FLOW_REQUEST,
      SUCCESS: ActionTypes.DELETE_ENN_FLOW_SUCCESS,
      FAILURE: ActionTypes.DELETE_ENN_FLOW_FAILURE
    }, state.deleteTenxFlowSingle, action),
    getTenxflowStageList: getTenxflowStageList(state.getTenxflowStageList, action),
    getTenxflowStageDetail: getTenxflowStageDetail(state.getTenxflowStageDetail, action),
    createTenxFlowState: reducerFactory({
      REQUEST: ActionTypes.CREATE_ENN_FLOW_STATE_REQUEST,
      SUCCESS: ActionTypes.CREATE_ENN_FLOW_STATE_SUCCESS,
      FAILURE: ActionTypes.CREATE_ENN_FLOW_STATE_FAILURE
    }, state.createTenxFlowState, action),
    updateTenxFlowState: reducerFactory({
      REQUEST: ActionTypes.UPDATE_ENN_FLOW_STATE_REQUEST,
      SUCCESS: ActionTypes.UPDATE_ENN_FLOW_STATE_SUCCESS,
      FAILURE: ActionTypes.UPDATE_ENN_FLOW_STATE_FAILURE
    }, state.updateTenxFlowState, action),
    deleteTenxFlowStateDetail: reducerFactory({
      REQUEST: ActionTypes.DELETE_ENN_FLOW_STATE_REQUEST,
      SUCCESS: ActionTypes.DELETE_ENN_FLOW_STATE_SUCCESS,
      FAILURE: ActionTypes.DELETE_ENN_FLOW_STATE_FAILURE
    }, state.deleteTenxFlowStateDetail, action),
    createDockerfile: reducerFactory({
      REQUEST: ActionTypes.CREATE_DOCKER_FILES_REQUEST,
      SUCCESS: ActionTypes.CREATE_DOCKER_FILES_SUCCESS,
      FAILURE: ActionTypes.CREATE_DOCKER_FILES_FAILURE
    }, state.createDockerfile, action),
    CreateTenxflowBuild: reducerFactory({
      REQUEST: ActionTypes.BUILD_ENN_FLOW_REQUEST,
      SUCCESS: ActionTypes.BUILD_ENN_FLOW_SUCCESS,
      FAILURE: ActionTypes.BUILD_ENN_FLOW_FAILURE
    }, state.CreateTenxflowBuild, action),
    StopTenxflowBuild: reducerFactory({
      REQUEST: ActionTypes.STOP_BUILD_ENN_FLOW_REQUEST,
      SUCCESS: ActionTypes.STOP_BUILD_ENN_FLOW_SUCCESS,
      FAILURE: ActionTypes.STOP_BUILD_ENN_FLOW_FAILURE
    }, state.StopTenxflowBuild, action),
    addBaseImage: reducerFactory({
      REQUEST: ActionTypes.ADD_BASE_IMAGE_REQUEST,
      SUCCESS: ActionTypes.ADD_BASE_IMAGE_SUCCESS,
      FAILURE: ActionTypes.ADD_BASE_IMAGE_FAILURE
    }, state.addBaseImage, action),
    updateBaseImage: reducerFactory({
      REQUEST: ActionTypes.UPDATE_BASE_IMAGE_REQUEST,
      SUCCESS: ActionTypes.UPDATE_BASE_IMAGE_SUCCESS,
      FAILURE: ActionTypes.UPDATE_BASE_IMAGE_FAILURE
    }, state.updateBaseImage, action),
    deleteBaseImage: reducerFactory({
      REQUEST: ActionTypes.DELETE_BASE_IMAGE_REQUEST,
      SUCCESS: ActionTypes.DELETE_BASE_IMAGE_SUCCESS,
      FAILURE: ActionTypes.DELETE_BASE_IMAGE_FAILURE
    }, state.deleteBaseImage, action),
    getDeploymentOrAppCDRule: reducerFactory({
      REQUEST: ActionTypes.GET_DEPLOYMENT_CDRULE_REQUEST,
      SUCCESS: ActionTypes.GET_DEPLOYMENT_CDRULE_SUCCESS,
      FAILURE: ActionTypes.GET_DEPLOYMENT_CDRULE_FAILURE
    }, state.getDeploymentOrAppCDRule, action, {
      overwrite: true
    }),
    deleteDeploymentOrAppCDRule: reducerFactory({
      REQUEST: ActionTypes.DELETE_DEPLOYMENT_CDRULE_REQUEST,
      SUCCESS: ActionTypes.DELETE_DEPLOYMENT_CDRULE_SUCCESS,
      FAILURE: ActionTypes.DELETE_DEPLOYMENT_CDRULE_FAILURE
    }, state.deleteDeploymentOrAppCDRule, action)
  }
}

