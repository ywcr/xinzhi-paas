/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/4
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import {Select, Row, Col, Alert, Card, Icon, Popover, Button, Table, Menu, Dropdown, Modal, Input, Transfer, Form, Checkbox, Radio, Tooltip } from 'antd'
const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import './style/TeamDetail.less'
import { Link, browserHistory } from 'react-router'
import { setCurrent } from '../../../../actions/entities'
import {
  deleteTeam, createTeamspace, addTeamusers, removeTeamusers, permissionChange,
  loadTeamspaceList, loadTeamUserList, loadAllClustersList,loadTeamAllUserList,
  deleteTeamspace, requestTeamCluster, checkTeamSpaceName,
  loadTeamClustersList,
} from '../../../../actions/team'
import { connect } from 'react-redux'
import MemberTransfer from '../../MemberTransfer'
import TeamList from './teamlist'
import UserControl from './userControl'
import CreateSpaceModal from '../../CreateSpaceModal'
import { loadUserList } from '../../../../actions/user'
import NotificationHandler from '../../../../common/notification_handler'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../../constants'
import { parseAmount } from '../../../../common/tools'
import SpaceRecharge from '../Recharge/SpaceRecharge'
import PopContent from '../../../PopSelect/Content'

let MemberList = React.createClass({
  getInitialState() {
    return {
      loading: false,
      sortUserOrder: true,
      sortUser: "a,userName",
      current: 1,
      userPageSize: 5,
      userPage: 1,
      filter: '',
      valueStatus: 0,
      name_user: '',
      itemRole: '',
      teamCreator: ''
    }
    this.permissionAuthority = this.permissionAuthority.bind(this)
    this.limitsAuthority = this.limitsAuthority.bind(this)
    this.handleChangeeTeam = this.handleChangeeTeam.bind(this)
    this.memberManagement = this.memberManagement.bind(this)
    this.handleButtonClick = this.handleButtonClick.bind(this)

  },
  memberManagement(e,list) {
    this.setState({
      userId: list.key,
      userName: list.name
    })
    let key = e.key
    
    switch(key)
    {
      case "0":

      this.setState({
        UserModal: true
      })
      break;
      case "1":
      this.setState({
        UserUpModal: true
      })
      break;
      case "2":
      this.setState({
        limitsModal: true
      })
      default:
      return
    }
    // this.setState({
    //   addMember: true,
    //   spaceID2:id?id:''
    // })
  },
  handleButtonClick(value,list){
    this.setState({
      userId: list.key,
      userName: list.name
    })
    this.setState({
      UserModal: true
    })
  },
  getUserSort(order, column) {
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  handleChangeeTeam(value,itemList){
    this.setState({
      userId: itemList.key,
      userName: itemList.name
    })
    switch(value)
    {
      case "0":

      this.setState({
        UserModal: true
      })
      break;
      case "1":
      this.setState({
        UserUpModal: true
      })
      break;
      case "2":
      this.setState({
        limitsModal: true
      })
      default:
      return
    }
  },
  selectValue(){

  },
  sortMemberName() {
    const { sortUserOrder, userPageSize, userPage, filter } = this.state
    const { loadTeamUserList, teamID } = this.props
    let sort = this.getUserSort(!sortUserOrder, 'userName')
    loadTeamUserList(teamID, {
      sort,
      page: userPage,
      size: userPageSize,
      filter,
    })
    this.setState({
      sortUserOrder: !sortUserOrder,
      sortUser: sort,
    })
  },

  delTeamMember() {
    const { removeTeamusers, teamID, teamName, loadTeamUserList, userDetail,loadTeamAllUserList } = this.props
    const { sortUser, userPageSize, userPage, filter, userName } = this.state
    let self = this
    const isOwnOneself = userName === userDetail.userName
    this.setState({ UserModal: false })
    let notification = new NotificationHandler()
    removeTeamusers(teamID, this.state.userId, {
      success: {
        func: () => {
          notification.success("移除用户成功")
          if (isOwnOneself) {
            browserHistory.push('/account/team')
            return
          }
          loadTeamAllUserList(teamID, { sort: 'a,userName', size: 1000, page: 1 })
          loadTeamUserList(teamID, {
            sort: sortUser,
            page: 1,
            size: userPageSize,
            filter,
          })
          self.setState({
            current: 1,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          if (err.statusCode == 401) {
            notification.error("没有权限从团队中移除创建者")
          } else {
            notification.error(err.message.message)
          }
        }
      }
    })

  },
  permissionAuthority() {
    const { removeTeamusers, teamID, teamName, loadTeamUserList, userDetail, permissionChange, teamUserList } = this.props
    const { sortUser, userPageSize, userPage, filter, userName } = this.state
    let self = this
    const isOwnOneself = userName === userDetail.userName
    this.setState({ UserUpModal: false, valueStatus: 0 })
    let type = 0
    let notification = new NotificationHandler()
    permissionChange(teamID, this.state.userId, this.state.valueStatus, type, {
      success: {
        func: (data) => {
          let teamStatuslist
          notification.success("所属团队角色更改成功")
          loadTeamUserList(teamID, {
            sort: sortUser,
            page: 1,
            size: userPageSize,
            filter,
          })
          self.setState({
            current: 1,
          })
        },
        isAsync: true
      }
    })
  },
  limitsAuthority() {

    // return false
    const { removeTeamusers, teamID, teamName, loadTeamUserList, userDetail, permissionChange } = this.props
    const { sortUser, userPageSize, userPage, filter, userName } = this.state
    let self = this
    const isOwnOneself = userName === userDetail.userName
    this.setState({ limitsModal: false })
    let type = 1
    let notification = new NotificationHandler()
    permissionChange(teamID, this.state.userId, 1, type, {
      success: {
        func: (data) => {
          notification.success("角色更改成功")
          if (data.data.data == '1') {
            browserHistory.push('/account/team')
            return
          } else {
            browserHistory.push('/')
            history.go(0)
            return
          }
          loadTeamUserList(teamID, {
            sort: sortUser,
            page: 1,
            size: userPageSize,
            filter,
          })
          self.setState({
            current: 1,
          })
        },
        isAsync: true
      },
    })
  },
  onShowSizeChange(current, pageSize) {
    let { sortUser, filter } = this.state
    const { loadTeamUserList, teamID } = this.props
    loadTeamUserList(teamID, {
      page: 1,
      size: pageSize,
      sort: sortUser,
      filter,
    })
    this.setState({
      userPageSize: pageSize,
      userPage: 1,
      current: 1,
    })
  },
  onChange(current) {
    if (current === this.state.current) {
      return
    }
    let { sortUser, userPageSize, filter } = this.state
    const { loadTeamUserList, teamID } = this.props
    loadTeamUserList(teamID, {
      page: current,
      size: userPageSize,
      sort: sortUser,
      filter,
    })
    this.setState({
      userPageSize: userPageSize,
      userPage: current,
      current: current,
    })
  },
  onTableChange(pagination, filters, sorter) {
    // 点击分页、筛选、排序时触发
    if (!filters.style) {
      return
    }
    let styleFilterStr = filters.style.toString()
    if (styleFilterStr === this.styleFilter) {
      return
    }
    const { loadTeamUserList, teamID } = this.props
    let { sortUser, userPageSize, userPage } = this.state
    const query = {
      page: userPage,
      size: userPageSize,
      sort: sortUser,
    }
    let filter
    if (filters.style.length === 1) {
      filter = `role,${filters.style[0]}`
      query.filter = filter
    }
    this.setState({
      filter
    })
    loadTeamUserList(teamID, query)
    this.styleFilter = styleFilterStr
  },
  onChange_role(e) {
    this.setState({
      valueStatus: e.target.value,
    });
  },
  render: function () {
    let { filteredInfo, current } = this.state
    const { teamUserList, teamUsersTotal, userDetail, permissionChange } = this.props
    filteredInfo = filteredInfo || {}
    const pagination = {
      total: teamUsersTotal,
      showSizeChanger: true,
      defaultPageSize: 5,
      defaultCurrent: 1,
      current: current,
      pageSizeOptions: ['5', '10', '15', '20'],
      onShowSizeChange: this.onShowSizeChange,
      onChange: this.onChange,
    }

    // const item_Role = teamRole[0].teamCreator
    // console.log(item_Role,'--------item_Role------')
    // console.log(item_Role[0].teamCreator)
    // {teamRole&&teamRole[0].teamCreator==true?this.setState({}):''}
    const columns = [
      {
        title: (
          <div onClick={this.sortMemberName}>
            成员名
            <div className="ant-table-column-sorter">
              <span className={this.state.sortUserOrder ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortUserOrder ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        width: '90',
        className: 'tablePadding',
        render: (text, record) => {
          if (text !== userDetail.userName) {
            return text
          } else {
            return (
              <div> {text}<span className="themeColor">(自己)</span>
              </div>
            )
          }

        }
      },
      {
        title: '手机/邮箱',
        dataIndex: 'tel',
        key: 'tel',
        width: '160',
        render: (text, record) => (
          <Row>
            <Col>{record.tel}</Col>
            <Col>{record.email}</Col>
          </Row>
        )
      },
      {
        title: '类型',
        dataIndex: 'style',
        key: 'style',
        width: '70',
        filters: [
          { text: '普通成员', value: 0 },
          { text: '团队管理员', value: 1 },
        ],
      },
      {
        title: '操作',
        dataIndex: 'edit',
        key: 'edit',
        width: '130',
        render: (text, record, index) => {
          // console.log(item_Role,'==============')
        
            return (
              <div className="cardBtns">
              <Row>
                <Col span={24}>
                <Dropdown.Button  onClick={()=>{this.handleButtonClick(0,record)}} type="primary" overlay={<Menu onClick={(key)=>{this.memberManagement(key,record)}}>
                <Menu.Item value = '1' key="1">角色更改</Menu.Item>
                <Menu.Item value = '2' key="2">权限移交</Menu.Item>
                </Menu>}>
                 移除成员
                </Dropdown.Button>
                  </Col>
              </Row>
  
            </div>
            )
        }

          
        
      },
    ]
    return (
      <div id='MemberList'>
        <Table columns={columns}
          dataSource={teamUserList}
          pagination={pagination}
          loading={this.state.loading}
          rowKey={record => record.key}
          onChange={this.onTableChange}
          permissionChange={this.permissionChange}
        />
        <Modal title="移除成员操作" visible={this.state.UserModal}
          onOk={() => this.delTeamMember()} onCancel={() => this.setState({ UserModal: false })}
        >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{ marginRight: '8px' }}></i>您是否确定要移除成员 {this.state.userName ? this.state.userName : ''} ?</div>
        </Modal>
        {/* UserUpModal */}
        <Modal title="角色更改" visible={this.state.UserUpModal}
          onOk={() => this.permissionAuthority()} onCancel={() => this.setState({ UserUpModal: false })}
        >
          <RadioGroup onChange={this.onChange_role} value={this.state.valueStatus}>
            <Radio key="a" value={0}>普通成员</Radio>
            <Radio key="b" value={1}>团队管理员</Radio>
            <div> 即将为{this.state.userName ? this.state.userName : ''}将权限更改为{this.state.valueStatus == 0 ? '普通成员' : '团队管理员'}</div>
          </RadioGroup>
        </Modal>
        <Modal title="权限移交" visible={this.state.limitsModal}
          onOk={() => this.limitsAuthority()} onCancel={() => this.setState({ limitsModal: false })}
        >
          <div> 即将移交权限给{this.state.userName ? this.state.userName : ''} !</div>
        </Modal>
      </div>
    )
  }
})

let ClusterState = React.createClass({
  getInitialState() {
    return {

    }
  },
  applyClusterState() {
    const { requestTeamCluster, clusterID, teamID, loadAllClustersList } = this.props
    requestTeamCluster(teamID, clusterID, {
      success: {
        func: () => {
          loadAllClustersList(teamID)
        },
        isAsync: true
      }
    })
  },
  // componentWillMount() {
  //   const {requestTeamCluster, clusterID, teamID, loadAllClustersList} = this.props
  //   loadAllClustersList(teamID)
  // },
  render: function () {
    const { state } = this.props
    if (state === 'authorized') {
      return (
        <div id='ClusterState'>
          <span style={{ color: '#5fb55e' }}>已授权</span>
        </div>
      )
    } else if (state === 'notAuthorized') {
      return (
        <div id='ClusterState'>
          <span style={{ color: '#f85050' }}>未授权</span>
          <Button type="primary" onClick={this.applyClusterState} style={{ backgroundColor: '#00a1e9' }} className="applyBtn">立即申请</Button>
        </div>
      )
    } else if (state === 'pending') {
      return (
        <div id='ClusterState'>
          <span style={{ color: '#82c4f4' }}>授权中...</span>
          {/*<Button type="primary" onClick={this.applyClusterState} style={{backgroundColor:'#5db75d',borderColor:'#5db75d'}} className="applyBtn">重复申请</Button>*/}
        </div>
      )
    }
  }
})
class TeamDetail extends Component {
  constructor(props) {
    super(props)
    this.addNewMember = this.addNewMember.bind(this)
    this.addNewSpace = this.addNewSpace.bind(this)
    this.spaceOnSubmit = this.spaceOnSubmit.bind(this)
    this.handleNewSpaceCancel = this.handleNewSpaceCancel.bind(this)
    this.handleNewSpaceName = this.handleNewSpaceName.bind(this)
    this.handleNewSpaceDes = this.handleNewSpaceDes.bind(this)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.state = {
      addMember: false,
      createSpaceModalVisible: false,
      targetKeys: [],
      newSpaceName: '',
      newSpaceDes: '',
      sortUser: "a,userName",
      sortSpace: 'a,spaceName',
      spaceCurrent: 1,
      spacePageSize: 5,
      spacePage: 1,
      deleteKeys:[],
      addKeys:[],
      spaceID2:'',
      spaceVisible: false, // space Recharge modal
    }
  }
  addNewMember(id) {
    this.setState({
      addMember: true,
      spaceID2:id?id:''
    })
  }
  addNewSpace() {
    setTimeout(function () {
      document.getElementById('spacename').focus()
    }, 500)
    this.setState({
      createSpaceModalVisible: true,
    })
  }
  spaceOnSubmit(space) {
    const { createTeamspace, teamID, loadTeamspaceList } = this.props
    const { newSpaceName, newSpaceDes, sortSpace, spacePageSize } = this.state
    let notification = new NotificationHandler()
    notification.spin("空间创建中...")
    createTeamspace(teamID, space, {
      success: {
        func: () => {
          notification.close()
          notification.success(`创建空间 ${space.spaceName} 成功`)
          loadTeamspaceList(teamID, {
            sort: sortSpace,
            size: spacePageSize,
            page: 1,
          })
          this.setState({
            createSpaceModalVisible: false,
            spaceCurrent: 1
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`创建空间 ${space.spaceName} 失败`, err.message.message)
        }
      }
    })
  }
  handleNewSpaceCancel(e) {
    this.setState({
      createSpaceModalVisible: false,
    })
  }
  handleNewSpaceName(e) {
    this.setState({
      newSpaceName: e.target.value
    })
  }
  handleNewSpaceDes(e) {
    this.setState({
      newSpaceDes: e.target.value
    })
  }
  handleSpaceChange(query) {
    const { sortSpace, spacePageSize, spaceCurrent, spacePage } = this.state
    this.setState({
      sortSpace: query.sortSpace ? query.sortSpace : sortSpace,
      spaceCurrent: query.spaceCurrent ? query.spaceCurrent : spaceCurrent,
      spacePageSize: query.spacePageSize ? query.spacePageSize : spacePageSize,
      spacePage: query.spacePage ? query.spacePage : spacePage,
    })
  }
  componentWillMount() {
    const { loadAllClustersList, loadTeamUserList,loadTeamAllUserList, loadTeamspaceList, teamID,loadUserList} = this.props
    loadUserList({size: 0})
    loadAllClustersList(teamID)
    loadTeamUserList(teamID, { sort: 'a,userName', size: 5, page: 1 })
    loadTeamAllUserList(teamID, { sort: 'a,userName', size: 1000, page: 1 })
    loadTeamspaceList(teamID, { sort: 'a,spaceName', size: 5, page: 1 })
  }
  componentDidMount(){
  }

  btnRecharge(index) {
    // button rechange
    this.setState({ spaceVisible: true, selected: [index] })
  }
  render() {
    const scope = this
    const {
      clusterList, teamUserList, teamUserIDList,
      teamSpacesList, teamName, teamID, spaceID,
      teamUsersTotal, teamSpacesTotal, removeTeamusers, loadTeamClustersList, permissionChange,
      loadTeamUserList, loadTeamspaceList, deleteTeamspace,
      requestTeamCluster, loadAllClustersList, checkTeamSpaceName, teamClusters,
      userDetail, setCurrent,userList,teamAllUserList,teamAllUserIDList,loadTeamAllUserList
    } = this.props
    const { targetKeys, sortSpace,addMember, spaceCurrent, spacePageSize, spacePage, sortSpaceOrder, spaceID2 } = this.state
    const funcs = {
      checkTeamSpaceName
    }
    return (
      <div id='TeamDetail'>
        <Row style={{ marginBottom: 20, height: 50, paddingTop: '20px' }}>
          <Link className="back" to="/account/team">
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </Link>
          <span className="title">{teamName}</span>
        </Row>
        {addMember?
        <UserControl 
          spaceID={spaceID2} // 空间ID
          userList={userList} // 成员列表
          teamAllUserList={teamAllUserList} // 团队所有用户列表
          teamAllUserIDList={teamAllUserIDList} // 添加到团队用户ID列表
          teamID={teamID} // 团队ID
          scope={this} 
          addMember={addMember}/>
        :''}
        {/* <Modal title="成员管理"
          visible={this.state.addMember}
          onOk={this.handleNewMemberOk}
          onCancel={this.handleNewMemberCancel}
          width="660px"
          wrapClassName="newMemberModal"
        >
          <MemberTransfer onChange={this.handleChange}
            userList={userList} />
        </Modal> */}
        <Row className="content">
          <Alert message="这里展示了该团队在用的集群列表，集群包含了平台管理员分配到该团队所用的节点计算资源，且对该团队的所有团队空间有效。" />
          <Row className="clusterList" gutter={30}>
            {clusterList.map((item, index) => {
              return (
                <Col span="8" className="clusterItem">
                  <Card title={(
                    <Row>
                      <Col span={8}>集群名</Col>
                      <Col span={16}>{item.clusterName}</Col>
                    </Row>
                  )}>
                    <Row className="cardItem" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>
                      <Col span={8}>集群ID:</Col>
                      <Col span={16} className='clusterIDCol' title={item.clusterID}>{item.clusterID}</Col>
                    </Row>
                    <Row className="cardItem">
                      <Col span={8}>访问地址</Col>
                      <Col span={16}>{item.apiHost}</Col>
                    </Row>
                    <Row className="cardItem">
                      <Col span={8}>授权状态</Col>
                      <Col span={16}>
                        <ClusterState state={item.clusterStatus} requestTeamCluster={requestTeamCluster} loadAllClustersList={loadAllClustersList} clusterID={item.clusterID} teamID={teamID} />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </Row>
        <Row className="content">
          <Col span={11}>
            <Row style={{ marginBottom: 20 }}>
              <Col span={6} style={{ height: 36, lineHeight: '36px' }}>
                <Icon type="user" />
                成员数({teamUsersTotal})
              </Col>
              <Col span={6}>
                <Button type="primary" size="large" icon="plus"
                  onClick={()=>this.addNewMember()}>
                  添加新成员
                </Button>
              </Col>
            </Row>
            <Row span={12}>
              <MemberList teamUserList={teamUserList}
                userDetail={userDetail}
                // teamRole={teamRole}
                teamID={teamID}
                loadTeamAllUserList={loadTeamAllUserList}
                removeTeamusers={removeTeamusers}
                permissionChange={permissionChange}
                loadTeamUserList={loadTeamUserList}
                loadTeamClustersList={loadTeamClustersList}
                teamUsersTotal={teamUsersTotal} />
            </Row>
          </Col>
          <Col span={12} offset={1}>
            <Row style={{ marginBottom: 20 }}>
              <Col span={6} style={{ height: 36, lineHeight: '36px' }}>
                <Icon type="user" />
                团队空间 ({teamSpacesTotal})
              </Col>
              <Col span={6}>
                <Button type="primary" size="large" icon="plus"
                  onClick={this.addNewSpace}>
                  创建新空间
                </Button>
                <CreateSpaceModal
                  scope={scope}
                  visible={this.state.createSpaceModalVisible}
                  onSubmit={this.spaceOnSubmit}
                  teamID={teamID}
                  funcs={funcs} />
              </Col>
            </Row>
            <Row span={12}>
              <TeamList teamSpacesList={teamSpacesList} // 团队空间列表
                loadTeamspaceList={loadTeamspaceList}
                loadTeamClustersList={loadTeamClustersList}
                teamClusters={teamClusters}
                teamID={teamID}
                spaceID={spaceID}
                sortSpace={sortSpace}
                current={spaceCurrent}
                setCurrent={setCurrent}
                spacePageSize={spacePageSize}
                spacePage={spacePage}
                teamSpacesTotal={teamSpacesTotal}
                deleteTeamspace={deleteTeamspace}
                clusterList={clusterList}
                scope={this}
                onChange={this.handleSpaceChange} />
            </Row>
          </Col>
        </Row>
        {/* 团队空间充值  */}
        <Modal title="团队空间充值" visible={this.state.spaceVisible}
          onCancel={() => this.setState({ spaceVisible: false })}
          width={600}
          footer={null}
        >
          <SpaceRecharge parentScope={this} selected={this.state.selected} teamID={teamID} teamSpacesList={teamSpacesList} />
        </Modal>
      </div>
    )
  }
}
function mapStateToProp(state, props) {
  const { teamClusters } = state.team
  let clusterData = []
  let clusterList = []
  let teamUserList = []
  let teamSpacesList = []
  let teamUserIDList = []
  let teamUsersTotal = 0
  let teamSpacesTotal = 0
  const { team_id, team_name } = props.params
  const team = state.team
  const space = state.entities.current.space
  const { spaceID } = space || { spaceID: '' }
  let userList = [],teamAllUserIDList=[],teamAllUserList=[]
  const users = state.user.users
  if(users){
    if(users.result){
      users.result.users.map((item,index) => {
        if(item){
          userList.push(
            {
              key: item.userID,
              title: item.userName,
              description: item.email
            }
          )
        }
      })
    }
  }
  if (team.teamusers) {
    if (team.teamusers.result) {
      const teamusers = team.teamusers.result.users
      teamUsersTotal = team.teamusers.result.total
      teamusers.map((item, index) => {
        teamUserList.push(
          {
            key: item.userID,
            name: item.userName,
            tel: item.phone,
            email: item.email,
            style: item.role === ROLE_SYS_ADMIN ? '系统管理员' : (item.teamRole === ROLE_TEAM_ADMIN ? '团队管理员' : '普通成员'),
            teamCreator: item.teamCreator,
            itemRole: item.teamRole
          }
        )
        if(item.role != ROLE_SYS_ADMIN){
          teamUserIDList.push(item.userID)
        }
      })
    }
  }
  if (team.allClusters) {
    const cluster = team.allClusters
    if (cluster.result) {
      if (cluster.result.data) {
        clusterData = cluster.result.data
        if (clusterData.length !== 0) {
          clusterData.map((item, index) => {
            clusterList.push(
              {
                key: index,
                apiHost: item.apiHost,
                clusterID: item.clusterID,
                clusterName: item.clusterName,
                clusterStatus: item.status,
              }
            )
          })
        }
      }
    }
  }
  if (team.teamspaces) {
    const teamSpaces = team.teamspaces
    if (teamSpaces.result) {
      teamSpacesTotal = teamSpaces.result.total
      if (teamSpaces.result) {
        teamSpacesList = teamSpaces.result.data
      }
    }
  }
  if (team.teamAllusers) {
    if (team.teamAllusers.result) {
      const teamAllusers = team.teamAllusers.result.users
      teamAllusers.map((item, index) => {
        if(item.role != ROLE_SYS_ADMIN){
          teamAllUserList.push(
            {
              key: item.userID,
              title: item.userName,
              description: item.email
            }
          )
          teamAllUserIDList.push(item.userID)
        }
      })
    }
  }
  const userDetail = state.entities.loginUser.info
  return {
    teamID: team_id,
    teamName: team_name,
    clusterList: clusterList,
    teamUserList: teamUserList,
    teamSpacesList: teamSpacesList,
    teamUserIDList: teamUserIDList,
    teamUsersTotal: teamUsersTotal,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
    teamSpacesTotal: teamSpacesTotal,
    teamAllUserIDList:teamAllUserIDList,
    teamAllUserList:teamAllUserList,
    userDetail,
    userList,
    spaceID
  }
}

export default connect(mapStateToProp, {
  deleteTeam,
  createTeamspace,
  addTeamusers,
  removeTeamusers,
  permissionChange,
  loadTeamspaceList,
  loadTeamUserList,
  loadTeamAllUserList,
  loadAllClustersList,
  deleteTeamspace,
  requestTeamCluster,
  checkTeamSpaceName,
  loadTeamClustersList,loadUserList,
  setCurrent,
})(TeamDetail)