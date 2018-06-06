/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Alert, Button, Icon, Card, Table, Modal, Input, Tooltip, Dropdown, Menu } from 'antd'
import './style/MyTeam.less'
import { Link } from 'react-router'
import SearchInput from '../../../SearchInput'
import { connect } from 'react-redux'
import { loadUserTeamList } from '../../../../actions/user'
import {
  createTeamAndSpace,
  addTeamusers, removeTeamusers, loadTeamUserList,
  checkTeamName, sendInvitation, quitTeam, dissolveTeam, getTeamDissoveable
} from '../../../../actions/team'
import CreateTeamModal from '../../CreateTeamModal'
import DelTeamModal from '../../DelTeamModal'
import NotificationHandler from '../../../../common/notification_handler'
import ExitTeamModal from '../../ExitTeamModal'
import CreateTeamSuccessModal from '../../CreateTeamSuccessModal'
import InviteNewMemberModal from '../../InviteNewMemberModal'
import { parseAmount } from '../../../../common/tools'
import moment from 'moment'
import cloneDeep from 'lodash/cloneDeep'
import { loadUserTeamspaceList } from '../../../../actions/user'
import Title from '../../../Title'

//团队列表组件
let TeamTable = React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,//筛选信息
      sortedInfo: null,//排序信息
      sortTeamName: true,//团队名排序
      sortMember: true,//成员数排序
      sortCreateTime: true,//创建时间排序
      sortBalance: true,//余额排序
      sortRole: true,//我的角色排序
      addMember: false,//邀请新成员
      targetKeys: [],
      sort: "d,role",//默认排序规则
      filter: '',
      nowTeamID: '',//当前团队ID
      showDelModal: false,//解散团队
      showExitModal: false,//退出团队
      showInviteModal: false,//邀请成员
    }
  },
  //Table变化回调
  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
    })
  },
  //排序规则
  getSort(order, column) {
    var query = {}
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  //团队名排序
  handleSortTeamName() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter, page, pageSize } = this.props.scope.state
    const { sortTeamName } = this.state
    let sort = this.getSort(!sortTeamName, 'name')
    loadUserTeamList('default', {
      page,
      size: 10,
      sort,
      filter,
    })
    this.setState({
      sortTeamName: !sortTeamName,
    })
  },
  //团队成员数排序
  handleSortMember() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter, page, pageSize } = this.props.scope.state
    const { sortMember } = this.state
    let sort = this.getSort(!sortMember, 'member')
    loadUserTeamList('default', {
      page,
      size: 10,
      sort,
      filter,
    })
    this.setState({
      sortMember: !sortMember,
      sort,
    })
  },
  //创建时间排序
  handleSortCreateTime() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter, page, pageSize } = this.props.scope.state
    const { sortCreateTime } = this.state
    let sort = this.getSort(!sortCreateTime, 'time')
    loadUserTeamList('default', {
      page,
      size: 10,
      sort,
      filter,
    })
    this.setState({
      sortCreateTime: !sortCreateTime,
      sort,
    })
  },
  //团队余额排序
  handleSortBalance() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter, page, pageSize  } = this.props.scope.state
    const { sortBalance } = this.state
    let sort = this.getSort(!sortBalance, 'balance')
    loadUserTeamList('default', {
      page,
      size: 10,
      sort,
      filter,
    })
    this.setState({
      sortBalance: !sortBalance,
      sort,
    })
  },
  //我的角色排序
  handleSortRole() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter, page, pageSize  } = this.props.scope.state
    const { sortRole } = this.state
    let sort = this.getSort(!sortRole, 'role')
    loadUserTeamList('default', {
      page,
      size: 10,
      sort,
      filter,
    })
    this.setState({
      sortRole: !sortRole,
      sort,
    })
  },
  //操作-下拉单选项
  handleDropMenuClick (e,teamID) {
    switch (e.key) {
      case 'deleteTeam':
        this.setState({
          nowTeamID: teamID,
          showDelModal: true,
        })
        break;
    }
  },
  //添加新成员
  addNewMember(teamID) {
    this.props.loadTeamUserList(teamID, ({ size: 100 }))
    this.setState({
      addMember: true,
      nowTeamID: teamID
    })
  },
  //显示邀请新成员弹窗
  handleShowInviteModal(teamID){
    this.setState({
      showInviteModal: true,
      nowTeamID: teamID
    })
  },
  //关闭邀请成员弹窗
  closeInviteModal(){
    this.setState({
      showInviteModal: false
    })
  },

  handleNewMemberOk() {
    const { addTeamusers, loadUserTeamList, rowKey } = this.props
    const { targetKeys, nowTeamID } = this.state
    const { page, size, sort, filter } = this.props.scope.state
    if (targetKeys.length !== 0) {
      addTeamusers(nowTeamID,
        targetKeys
        , {
          success: {
            func: () => {
              loadUserTeamList('default', {
                page: page,
                size: 10,
                sort: sort,
                filter: filter,
              })
              this.setState({
                addMember: false,
              })

            },
            isAsync: true
          }
        })
    }
  },
  handleNewMemberCancel(e) {
    this.setState({
      addMember: false,
    })
  },
  handleChange(targetKeys) {
    this.setState({ targetKeys })
  },
  //关闭解散团队弹框
  closeDelTeamModal() {
    this.setState({
      showDelModal: false
    })
  },
  //退出团队弹框
  handleShowExitTeamModal(teamID) {
    if (teamID) {
      this.setState({
        showExitModal: true,
        nowTeamID: teamID
      })
    }
  },
  //关闭退出团队弹框
  closeExitTeamModal() {
    this.setState({
      showExitModal: false
    })
  },
  //创建者下拉单
  renderOverLay(teamID) {
    return (
      <Menu style={{ width: '126px' }} onClick={(e) => this.handleDropMenuClick(e,teamID)}>
        <Menu.Item key='deleteTeam'>
          <span>解散团队</span>
        </Menu.Item>
      </Menu>
    )
  },
  render() {
    let { sortedInfo, filteredInfo, targetKeys, showDelModal, sort } = this.state
    const { searchResult, filter } = this.props.scope.state
    const { scope, data, quitTeam, loadUserTeamList, dissolveTeam } = this.props

    filteredInfo = filteredInfo || {}
    //分页器配置
    const pagination = {
      simple: true,
      total: this.props.scope.props.total,
      sort,
      filter,
      showSizeChanger: true,
      defaultPageSize: 10,
      defaultCurrent: 1,
      current: this.props.scope.state.current,
      pageSizeOptions: ['5', '10', '15', '20'],
      onShowSizeChange(current, pageSize) {
        scope.props.loadUserTeamList('default', {
          page: current,
          size: 10,
          sort,
          filter,
        })
        scope.setState({
          page: current,
          pageSize: 10,
          current: 1,
        })
      },
      onChange(current) {
        const {pageSize} = scope.state
        scope.props.loadUserTeamList('default', {
          page: current,
          size: 10,
          sort,
          filter,
        })
        scope.setState({
          page: current,
          pageSize: 10,
          current: current,
        })
      },
    }
    //Table 行配置
    const columns = [
      {
        title: (
          <div onClick={this.handleSortTeamName}>
            团队名
            <div className="ant-table-column-sorter">
              <span className={this.state.sortTeamName ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortTeamName ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        width: '10%',
        className: 'teamName',
        render: (text, record, index) => (
          <Link to={`/account/teams/${record.key}`}>{text}</Link>
        )
      },
      {
        title: (
          <div onClick={this.handleSortMember}>
            成员
            <div className="ant-table-column-sorter">
              <span className={this.state.sortMember ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortMember ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'memberCount',
        key: 'memberCount',
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortCreateTime}>
            创建时间
            <div className="ant-table-column-sorter">
              <span className={this.state.sortCreateTime ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortCreateTime ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'creationTime',
        key: 'creationTime',
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortBalance}>
            团队余额
            <div className="ant-table-column-sorter">
              <span className={this.state.sortBalance ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortBalance ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'balance',
        key: 'balance',
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortRole}>
            我的角色
            <div className="ant-table-column-sorter">
              <span className={this.state.sortRole ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortRole ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'role',
        key: 'role',
        width: '10%',
      },
      {
        title: '操作',
        key: 'operation',
        width: '20%',
        render: (text, record, index) => (
          record.isCreator ?
            <Dropdown.Button
              overlay={this.renderOverLay(record.key)} type='ghost'
              onClick={() => this.handleShowInviteModal(record.key)}
              className="tabDrop"
              >
              <Icon type="plus" />
              <span>邀请新成员</span>
              <InviteNewMemberModal
                visible={this.state.nowTeamID === record.key && this.state.showInviteModal}
                closeInviteModal={this.closeInviteModal}
                teamID={record.id}
                inviteOnSubmit={this.props.inviteOnSubmit}
              />
              <DelTeamModal
                visible={this.state.nowTeamID === record.key && showDelModal}
                closeDelTeamModal={this.closeDelTeamModal}
                teamID={record.id}
                teamName={record.name}
                dissolveTeam={dissolveTeam}
                loadUserTeamList={loadUserTeamList}
              />
            </Dropdown.Button>
            :
            <div>
              <Button icon="delete" className="delBtn" onClick={() => this.handleShowExitTeamModal(record.key)}>退出团队</Button>
              <ExitTeamModal
                visible={this.state.nowTeamID === record.key && this.state.showExitModal}
                closeExitTeamModal={this.closeExitTeamModal}
                teamName={record.name}
                teamID={record.id}
                quitTeam={quitTeam}
                loadUserTeamList={loadUserTeamList}
              />
            </div>
        )
      },
    ]
    return (
      <div>
        <Table columns={columns}
          dataSource={searchResult.length === 0 ? data : searchResult}
          pagination={pagination}
          onChange={this.handleChange}
          />
      </div>
    )
  },
})

class MyTeam extends Component {
  constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.teamOnSubmit = this.teamOnSubmit.bind(this)
    this.closeCreateSucModal = this.closeCreateSucModal.bind(this)
    this.inviteOnSubmit = this.inviteOnSubmit.bind(this)
    this.state = {
      searchResult: [],
      notFound: false,
      visible: false,
      teamName: '',
      pageSize: 10,
      page: 1,
      current: 1,
      filter: '',
      sort: 'a,teamName',
      showCreateSucModal: false,
      newTeamID: '',
    }
  }
  //展示Modal
  showModal() {
    this.setState({
      visible: true,
    })
    setTimeout(function() {
      document.getElementById('teamInput').focus()
    }, 100)
  }
  inviteOnSubmit(teamID, emails) {
    const { sendInvitation } = this.props
    sendInvitation(teamID, emails)
  }
  //创建团队
  teamOnSubmit(team) {
    const { createTeamAndSpace, loadUserTeamList, loadUserTeamspaceList } = this.props
    const { pageSize, sort, filter } = this.state
    let notification = new NotificationHandler()
    notification.spin(`创建团队 ${team.teamName} 中...`)
    createTeamAndSpace(team, {
      success: {
        func: (result) => {
          notification.close()
          this.setState({
            visible: false,
            showCreateSucModal: true,
            newTeamID: result.data.teamID,
            teamName: team.teamName,
          })
          loadUserTeamList('default', {
            page: 1,
            current: 1,
            size: 10,
            sort,
            filter,
          })
          loadUserTeamspaceList('default', { size: 1000 })
        },
        isAsync: true,
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`创建团队 ${team.teamName} 失败`, err.message.message)
        }
      }
    })
  }
  //关闭创建成功弹框
  closeCreateSucModal() {
    this.setState({
      showCreateSucModal: false,
    })
  }
  componentWillMount() {
    this.props.loadUserTeamList('default', {
      page: 1,
      size: 10,
      sort: "a,teamName",
      filter: "",
    })
  }
  render() {
    const scope = this
    const { visible,showCreateSucModal,teamName, newTeamID } = this.state
    const {
      teams, addTeamusers, loadUserTeamList,
      teamUserIDList, loadTeamUserList, checkTeamName, quitTeam, dissolveTeam
    } = this.props
    //搜索组件配置
    const searchIntOption = {
      placeholder: '搜索',
      defaultSearchValue: 'team',
      setStyle: {
        float: 'left',
        marginLeft: '10px',
        width: 200
      }
    }
    const funcs = {
      checkTeamName
    }
    return (
      <div id="TeamManage">
        <Title title="我的团队" />
        <Alert message={`团队，由若干个成员组成的一个集体, 可等效于公司的部门、项目组、或子公司，
          包含『团队空间』这一逻辑隔离层，以实现对应您企业内部各个不同项目，或者不同逻辑组在云平台上操作对象的隔离， 团队管理员 (创建者) 可管理团队、邀请新成员、解散团队、移除成员; 团队成员 (参与者) 可退出团队。`}
          type="info"
        />
        <Row className="teamOption">
          <Button type="primary" size="large" onClick={this.showModal} className="plusBtn">
            <i className='fa fa-plus' /> 创建团队
          </Button>
          <CreateTeamSuccessModal
            visible={showCreateSucModal}
            closeCreateSucModal={this.closeCreateSucModal}
            teamID={newTeamID}
            teamName={teamName}
          />
          <CreateTeamModal
            scope={scope}
            visible={visible}
            onSubmit={this.teamOnSubmit}
            funcs={funcs}
          />
          <SearchInput searchIntOption={searchIntOption} scope={scope} data={teams} />
          <div className="total">共{this.props.total}个</div>
        </Row>
        <Row className="teamList">
          <Card>
            <TeamTable data={teams.items}
              scope={scope}
              addTeamusers={addTeamusers}
              loadUserTeamList={loadUserTeamList}
              loadTeamUserList={loadTeamUserList}
              teamUserIDList={teamUserIDList}
              inviteOnSubmit={this.inviteOnSubmit}
              quitTeam={quitTeam}
              dissolveTeam={dissolveTeam}
            />
          </Card>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  let teamsData = {
    items:[],
  }
  let total = 0
  let teamUserIDList = []
  const teams = state.user.teams

  if (!teams.isFetching && teams.result && teams.result.data && teams.result.data.data) {
    teamsData = cloneDeep(teams.result.data.data)
    teamsData.items.map((item) => {
      item.role = item.isCreator ? '创建者（管理员）' : '普通成员'
      item.key = item.id
      item.creationTime = moment(item.creationTime).fromNow()
      item.balance = parseAmount(item.balance).amount
    })
    total = teamsData.total
  }
  return {
    teams: teamsData,
    total,

  }
}

export default connect(mapStateToProp, {
  loadUserTeamList,
  createTeamAndSpace,
  addTeamusers,
  removeTeamusers,
  loadTeamUserList,
  checkTeamName,
  sendInvitation,
  quitTeam,
  dissolveTeam,
  getTeamDissoveable,
  loadUserTeamspaceList,
})(MyTeam)