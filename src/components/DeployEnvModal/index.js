/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Deployment environment modal
 *
 * v0.1 - 2017-05-03
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Modal, Form, Select } from 'antd'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../actions/user'
import { loadTeamClustersList } from '../../actions/team'
import { setCurrent } from '../../actions/entities'
import { MY_SPACE } from '../../constants'
import './style/index.less'

const FormItem = Form.Item
const createForm = Form.create
const Option = Select.Option

let DeployEnvModal = React.createClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
  },

  defaultProps: {
    title: '选择部署环境',
    visible: false,
  },

  spaceNameCheck(rule, value, callback) {
    if (!value) {
      this.setState({
        disabled: true
      })
      callback([new Error('请选择空间')])
      return
    }
    this.setState({
      disabled: false
    })
    callback()
  },

  clusterNameCheck(rule, value, callback) {
    if (!value) {
      this.setState({
        disabled: true
      })
      callback([new Error('请选择集群')])
      return
    }
    this.setState({
      disabled: false
    })
    callback()
  },

  handleSpaceChange(value) {
    const { teamspaces, loadTeamClustersList, setCurrent, form, current } = this.props
    let newTeamspaces = ([MY_SPACE]).concat(teamspaces)
    newTeamspaces.map(space => {
      if (space.namespace === value) {
        setCurrent({
          space,
          team: {
            teamID: space.teamID
          }
        })
        loadTeamClustersList(space.teamID, { size: 100 }, {
          success: {
            func: (result) => {
              if (!result.data || result.data.length === 0) {
                form.resetFields(['clusterFormCheck'])
                return
              }
              form.setFieldsValue({
                'clusterFormCheck': result.data[0].clusterID,
              })
            },
            isAsync: true
          }
        })
      }
    })
  },

  handleClusterChange(value) {
    const { teamClusters, setCurrent } = this.props
    teamClusters.map((cluster) => {
      if (cluster.clusterID === value) {
        setCurrent({
          cluster
        })
      }
    })
  },

  render() {
    const {
      title, visible, onCancel,
      onOk, form, teamspaces,
      teamClusters, current,
    } = this.props
    const { getFieldProps } = form
    const spaceFormCheck = getFieldProps('spaceFormCheck', {
      rules: [
        { validator: this.spaceNameCheck }
      ],
      onChange: this.handleSpaceChange,
      initialValue: current.space.namespace,
    })
    const clusterFormCheck = getFieldProps('clusterFormCheck', {
      rules: [
        { validator: this.clusterNameCheck }
      ],
      onChange: this.handleClusterChange,
      initialValue: current.cluster.clusterID,
    })
    return (
      <Modal
        title={title}
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        className="deployEnvModal"
      >
        <div className="tips">
          请为创建的应用选择部署环境
        </div>
        <Form inline>
          <FormItem
            key="space"
            className="firstFormItem"
            style={{ minWidth: '220px', marginRight: "21px" }}
          >
            <span style={{marginRight: "30px"}}>部署环境</span>
            <Select size="large"
              placeholder="请选择空间"
              style={{ width: 180 }}
              {...spaceFormCheck}>
              <Option value="default">我的空间</Option>
              {
                teamspaces.map(space => {
                  return (
                    <Option key={space.namespace} value={space.namespace}>
                      {space.spaceName}
                    </Option>
                  )
                })
              }
            </Select>
          </FormItem>
          <FormItem key="cluster">
            <Select size="large"
              placeholder="请选择集群"
              style={{ width: 180 }}
              {...clusterFormCheck}>
              {
                teamClusters.map(cluster => {
                  return (
                    <Option key={cluster.clusterID} value={cluster.clusterID}>
                      {cluster.clusterName}
                    </Option>
                  )
                })
              }
            </Select>
          </FormItem>
        </Form>
      </Modal>
    )
  }
})

DeployEnvModal = createForm()(DeployEnvModal)

function mapStateToProps(state, props) {
  const { current } = state.entities
  const { teamspaces } = state.user
  const { teamClusters } = state.team
  return {
    current,
    isTeamspacesFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    isTeamClustersFetching: teamClusters.isFetching,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList,
  loadTeamClustersList,
  setCurrent,
})(DeployEnvModal)
