import React, { Component } from 'react'
import { Popover, Button, Menu, Table, Modal, Dropdown } from 'antd'
import { connect } from 'react-redux'
import { parseAmount } from '../../../../common/tools'
import { Link, browserHistory } from 'react-router'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../../constants'
import NotificationHandler from '../../../../common/notification_handler'
import PopContent from '../../../PopSelect/Content'

let TeamList = React.createClass({
  getInitialState() {
    return {
      sortSpaceOrder: true,
      visible: false,
      currentSpace: null,
    }
  },
  getSpaceSort(order, column) {
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  sortSpaceName() {
    const { loadTeamspaceList, teamID, onChange, spacePageSize, spacePage } = this.props
    const { sortSpaceOrder } = this.state
    let sort = this.getSpaceSort(!sortSpaceOrder, 'spaceName')
    loadTeamspaceList(teamID, {
      sort,
      size: spacePageSize,
      page: spacePage,
    })
    onChange({
      sortSpace: sort,
    })
    this.setState({
      sortSpaceOrder: !sortSpaceOrder,
    })
  },
  sortSpaceApp() {
    const { sortSpaceOrder, onChange } = this.props
    this.setState({
      sortSpaceOrder: !sortSpaceOrder,
    })
  },
  onShowSizeChange(current, pageSize) {
    const { loadTeamspaceList, teamID, sortSpace, onChange } = this.props
    loadTeamspaceList(teamID, {
      page: 1,
      size: pageSize,
      sort: sortSpace,
    })
    onChange({
      spacePageSize: pageSize,
      spacePage: 1,
      spaceCurrent: 1,
    })
  },
  onChange(current) {
    const { loadTeamspaceList, teamID, sortSpace, spacePageSize, onChange } = this.props
    loadTeamspaceList(teamID, {
      page: current,
      size: spacePageSize,
      sort: sortSpace,
    })
    onChange({
      spacePageSize: spacePageSize,
      spacePage: current,
      spaceCurrent: current,
    })
  },
  delTeamSpace() {
    const { deleteTeamspace, teamID, loadTeamspaceList, sortSpace, spacePage, spacePageSize, onChange, spaceID } = this.props
    let notify = new NotificationHandler()
    if (spaceID === this.state.spaceID) {
      return notify.info('禁止删除当前所处的空间')
    }
    deleteTeamspace(teamID, this.state.spaceID, {
      success: {
        func: () => {
          loadTeamspaceList(teamID, {
            sort: sortSpace,
            page: 1,
            size: spacePageSize,
          })
          this.setState({ TeamModal: false })
          onChange({
            spaceCurrent: 1
          })
        },
        isAsync: true
      }
    })
  },
  handleVisibleChange(teamspace, visible) {
    if (!visible) {
      return
    }
    const { loadTeamClustersList } = this.props
    loadTeamClustersList(teamspace.teamID)
    this.setState({
      currentSpace: teamspace
    })
  },
  spaceManagement(key, space_ID, space_Name, index) {
    const { scope } = this.props
    let keys = key.key
    if (keys === '1') {
      scope.addNewMember(space_ID)
    } else if (keys === '2') {
      this.setState({ TeamModal: true, spaceID: space_ID, teamName: space_Name })
    } else if (keys === '3') {
      scope.btnRecharge(index)
    } else {

    }
  },
  handleClusterChange(cluster) {
    const { setCurrent } = this.props
    const { currentSpace } = this.state
    let notification = new NotificationHandler()
    setCurrent({
      team: {
        teamID: currentSpace.teamID
      },
      space: currentSpace,
      cluster,
    })
    let msg = `已进入空间 ${currentSpace.spaceName}（集群：${cluster.clusterName}）`
    notification.success(msg)
    browserHistory.push('/')
  },
  render: function () {
    const { teamSpacesList, teamSpacesTotal, current, scope, teamClusters, teamID } = this.props
    let roleAdmin = scope.props.userDetail.role
    const { sortSpaceOrder } = this.state
    const pagination = {
      total: teamSpacesTotal,
      showSizeChanger: true,
      defaultPageSize: 5,
      defaultCurrent: 1,
      current: current,
      pageSizeOptions: ['5', '10', '15', '20'],
      onShowSizeChange: this.onShowSizeChange,
      onChange: this.onChange,
    }
    let Search = false
    let contentClusterList = []
    if (teamID === teamSpacesList.teamID) {
      contentClusterList = teamClusters
    }
    const columns = [
      {
        title: (
          <div onClick={this.sortSpaceName}>
            空间名
              <div className="ant-table-column-sorter">
              <span className={sortSpaceOrder ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!sortSpaceOrder ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'spaceName',
        key: 'spaceName',
        className: 'tablePadding',
      },
      {
        title: '应用',
        dataIndex: 'appCount',
        key: 'appCount',
        // width:'40'
      },
      {
        title: '余额',
        dataIndex: 'balance',
        key: 'balance',
        // width:'65',
        render: (text) => parseAmount(text, 4).fullAmount
      },
      {
        title: '操作',
        dataIndex: 'opt',
        key: 'opt',
        render: (text, record, index) => (
          <div>
            <Popover
              title="请选择集群"
              trigger="click"
              content={
                <PopContent
                  Search={Search}
                  list={teamClusters}
                  onChange={this.handleClusterChange}
                />
              }
              onVisibleChange={this.handleVisibleChange.bind(this, teamSpacesList[index])}>

              {this.props.scope.props.userDetail.role == ROLE_SYS_ADMIN ? <Dropdown.Button type="primary" overlay={
                <Menu onClick={(key) => { this.spaceManagement(key, record.spaceID, record.spaceName, index) }}
                >
                  <Menu.Item key="1">成员管理</Menu.Item>
                  <Menu.Item key="2">删除</Menu.Item>
                  <Menu.Item key="3">充值</Menu.Item>

                </Menu>}>
                进入空间
                </Dropdown.Button> : <Dropdown.Button type="primary" overlay={
                  <Menu onClick={(key) => { this.spaceManagement(key, record.spaceID, record.spaceName, index) }}
                  >
                    <Menu.Item key="1">成员管理</Menu.Item>
                    <Menu.Item key="2">删除</Menu.Item>
                  </Menu>}>
                  进入空间
                </Dropdown.Button>}

            </Popover>
          </div>
        )
      },
    ]
    return (
      <div id='TeamList'>
        <Table columns={columns} dataSource={teamSpacesList} pagination={pagination} />
        <Modal title="删除团队操作" visible={this.state.TeamModal}
          onOk={() => this.delTeamSpace()} onCancel={() => this.setState({ TeamModal: false })}
        >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{ marginRight: '8px' }}></i>您是否确定要删除该团队空间 {this.state.teamName ? this.state.teamName : ''} ?</div>
        </Modal>
      </div>
    )
  }
})


function mapStateToProps(state, props) {
  return {
  }
}

export default connect(mapStateToProps, {

})(TeamList)