/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal, Tabs, Table, Icon, Button, Card, Input, Checkbox, Tooltip } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/Project.less'
import { Link, browserHistory } from 'react-router'
import Logs from './ImageItem/Logs'
import Management from './ImageItem/Management'
import CodeRepo from './ImageItem/CodeRepo'
import ImageUpdate from './ImageItem/ImageUpdate'
import { loadProjectDetail, loadProjectMembers, iamgeGetRules, getTargetStore, iamgeUpdateAddNewRules, imageUpdateSwitch, deleteImageUpdateRules } from '../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../constants'
import { camelize } from 'humps'
import NotificationHandler from '../../../common/notification_handler'

const notification = new NotificationHandler()
const TabPane = Tabs.TabPane

class ItemDetail extends Component {
  constructor(props) {
    super()
    this.state = {
      isProject: true, // top project type
      sortedInfo: null,
      filteredInfo: null,
      checked: false,
      rulesData: '',
      enabledStatus: '',
      stateVal:''
    }
    this.currentUser = {}
  }

  componentWillMount() {
    const _this = this;
    const { loadProjectDetail, loadProjectMembers, params, iamgeGetRules } = this.props
    loadProjectDetail(DEFAULT_REGISTRY, params.id)
    this.getRules()
    loadProjectMembers(DEFAULT_REGISTRY, params.id, null, {
      failed: {
        func: err => {
          const { statusCode } = err
          this.currentUser = {}
          if (statusCode === 403) {
            return
          }
          notification.error(`获取成员失败`)
        }
      }
    })
  }
  getRules() {
    const _this = this
    const { loadProjectDetail, loadProjectMembers, params, iamgeGetRules } = this.props
    iamgeGetRules(DEFAULT_REGISTRY, { project_id: params.id }, {
      success: {
        func: function (data) {
          if (data.data) {
            if (data.data[0].enabled == 1) {
              _this.setState({
                checked: true,
                rulesData: data.data,
                enabledStatus: data.data[0].enabled
              })
            } else {
              _this.setState({
                checked: false,
                rulesData: data.data,
                enabledStatus: data.data[0].enabled
              })
            }
          } else if(data.data == null) {
            _this.setState({
              checked: false,
              rulesData: '',
              enabledStatus: '',
              stateVal:false
            })
          }else{
            _this.setState({
              checked: false,
              rulesData: '',
              enabledStatus: ''
            })
          }
        }
      }
    })
  }

  renderPublic(key) {
    switch (key) {
      case 0:
        return '私有仓库组'
      case 1:
        return '公开仓库组'
      default:
        break;
    }
  }

  renderRole(role) {
    switch (role) {
      case 0:
        return '未知'
      case 1:
        return '管理员'
      case 2:
        return '开发人员'
      case 3:
        return '访客'
      default:
        break;
    }
  }
  // 
  onChange(e) {
    const { getTargetStore, iamgeUpdateAddNewRules, params, iamgeGetRules, projectDetail, imageUpdateSwitch, deleteImageUpdateRules } = this.props;
    const _this = this;
    if (!_this.state.rulesData) {
      getTargetStore(DEFAULT_REGISTRY, {
        success: {
          func: (data) => {
            if (data.data) {
              const targetId = data.data.filter(function (item) {
                if (item.type == 1) {
                  return item.id
                }
              })
              const body = {}
              body['project_id'] = Number(params.id)
              body['target_id'] = targetId[0].id
              body['name'] = projectDetail.name
              body['enabled'] = 1
              setTimeout(function () {
                iamgeUpdateAddNewRules(DEFAULT_REGISTRY, body, {
                  success: {
                    func: (data) => {
                      notification.success(`同步至公有云成功！`)
                      _this.getRules()
                    }, isAsync: true,
                  }
                })
              })
            }
          }, isAsync: true,
        }
      })
    } else {
      if (this.state.enabledStatus == 0) {
        imageUpdateSwitch(DEFAULT_REGISTRY, this.state.rulesData[0].id, { enabled: 1 }, {
          success: {
            func: function (data) {
              setTimeout(function () {
                _this.getRules()
                _this.setState({
                  checked: false,
                })
              })
            }
          }
        })
      } else {
        imageUpdateSwitch(DEFAULT_REGISTRY, this.state.rulesData[0].id, { enabled: 0 }, {
          success: {
            func: function (data) {
              setTimeout(function () {
                _this.getRules()
                _this.setState({
                  checked: false,
                })
              })
            }
          }
        })
      }
    }
  }
  render() {
    const { projectDetail, params, projectMembers, loginUser, registry } = this.props
    const { name } = projectDetail
    const members = projectMembers.list || []
    const isAdmin = loginUser.harbor[camelize('has_admin_role')] == 1
    if (isAdmin) {
      this.currentUser = loginUser.harbor
    } else {
      members.every(member => {
        if (member.username === loginUser.userName) {
          this.currentUser = member
          return false
        }
        return true
      })
    }
    const currentUserRole = this.currentUser[camelize('role_id')]
    const tabPanels = [
      <TabPane tab="镜像仓库" key="repo">
        <CodeRepo registry={DEFAULT_REGISTRY} {...this.props} />
      </TabPane>,
    ]
    if (currentUserRole > 0 || isAdmin) {
      tabPanels.push(<TabPane tab="审计日志" key="log"><Logs params={this.props.params} /></TabPane>)
      tabPanels.push(
        <TabPane tab="权限管理" key="role">
          <Management
            {...params}
            registry={DEFAULT_REGISTRY}
            members={projectMembers}
            currentUser={this.currentUser}
          />
        </TabPane>
      )
    }
    if (isAdmin) {
      tabPanels.push(<TabPane tab="镜像同步" key="sync"><ImageUpdate registry={registry} /></TabPane>)
    }
    let role_team = currentUserRole
    return (
      <div className="imageProject">
        <br />
        <QueueAnim>
          <div key="Item">
            <Card>
              <div className="topNav">
                <span className="back" onClick={() => browserHistory.goBack()}>
                  <span className="backjia"></span>
                  <span className="btn-back">返回</span>
                </span>
                {role_team == 1 ? <span style={{ display: 'inline-block' }} >
                  <span style={{ float: 'left', fontSize: '16px', margin: '0 10px', color: '#00A0E9' }}>是否同步到公有云</span>
                  <Checkbox style={{ float: 'left', fontSize: '24px', margin: '-10px 0 0 0', display: 'block' }} checked={this.state.checked} onChange={this.onChange.bind(this)}> {name || ''}</Checkbox>
                  <Tooltip placement="top" title="同步到公有云">
                    <span style={{ display: 'inline-block', marginRight: '10px', marginTop: '-8px' }}>

                    </span>
                  </Tooltip>
                </span> : ""}
                <span>{this.renderPublic(projectDetail.public)} </span>
                {
                  currentUserRole > 0 && [
                    <span className="margin">|</span>,
                    <span className="role">
                      <span className="role-key">
                        我的角色&nbsp;
                      </span>
                      {this.renderRole(currentUserRole)}
                    </span>
                  ]
                }
              </div>
              <br />
              <Tabs defaultActiveKey="repo">
                {tabPanels}
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { harbor, entities } = state
  return {
    projectDetail: harbor.detail.data || {},
    projectMembers: harbor.members || {},
    loginUser: entities.loginUser.info,
    registry: DEFAULT_REGISTRY
  }
}

export default connect(mapStateToProps, {
  loadProjectDetail,
  loadProjectMembers,
  iamgeGetRules,
  getTargetStore,
  iamgeUpdateAddNewRules,
  imageUpdateSwitch,
  deleteImageUpdateRules
})(ItemDetail)
