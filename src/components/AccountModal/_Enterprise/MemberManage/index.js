/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Member Manage
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import './style/MemberManage.less'
import { Row, Col, Button, Input, Select, Card, Icon, Table, Modal, Checkbox, Tooltip, Dropdown, Menu, Spin } from 'antd'
import SearchInput from '../../../SearchInput'
import { connect } from 'react-redux'
import { loadUserList, createUser, deleteUser, checkUserName } from '../../../../actions/user'
import { chargeUser } from '../../../../actions/charge'
import { loadTeamClustersList } from '../../../../actions/team'
import { setCurrent } from '../../../../actions/entities'
import { browserHistory, Link } from 'react-router'
import { parseAmount } from '../../../../common/tools'
import CreateUserModal from '../../CreateUserModal'
import NotificationHandler from '../../../../common/notification_handler'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../../constants'
import MemberRecharge from '../Recharge'
import { MAX_CHARGE }  from '../../../../constants'
import Title from '../../../Title'

const confirm = Modal.confirm

let MemberTable = React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,
      pagination: {},
      loading: false,
      sortName: true,
      sortTeam: true,
      sortBalance: true,
      sort: "a,userName",
      filter: ""
    }
  },

  getSort(order, column) {
    var query = {}
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  handleSortName() {
    const { loadUserList } = this.props.scope.props
    const { sortName } = this.state
    const { page, pageSize, filter } = this.props.scope.state
    let sort = this.getSort(!sortName, 'userName')
    loadUserList({
      page: page,
      size: pageSize,
      sort,
      filter: filter,
    })
    this.setState({
      sortName: !sortName,
      sort,
    })
  },
  handleSortTeam() {
    const { loadUserList } = this.props.scope.props
    const { sortTeam } = this.state
    const {page, pageSize, filter} = this.props.scope.state
    let sort = this.getSort(!sortTeam, 'teamCount')
    loadUserList({
      sort,
      page: page,
      size: pageSize,
      filter: filter,
    })
    this.setState({
      sortTeam: !sortTeam,
      sort,
    })
  },
  handleSortBalance() {
    const { loadUserList } = this.props.scope.props
    const { sortBalance } = this.state
    const {page, pageSize, filter} = this.props.scope.state
    let sort = this.getSort(!sortBalance, 'balance')
    loadUserList({
      sort,
      page: page,
      size: pageSize,
      filter: filter
    })
    this.setState({
      sortBalance: !sortBalance,
      sort,
    })
  },
  handleBack() {
    const { scope } = this.props
    scope.setState({
      notFound: false,
    })
  },
  delMember() {
    const { scope } = this.props
    const record = this.state.userManage
    if (record.style === "系统管理员") {
      confirm({
        title: '不能删除系统管理员',
      });
      return
    }
    this.setState({delModal: false})
    let notification = new NotificationHandler()
    const { page, pageSize,filter,sort } = scope.state
    scope.props.deleteUser(record.key, {
      success: {
        func: () => {
          notification.success('删除成功！')
          scope.props.loadUserList({
            page: page,
            size: pageSize,
            sort: sort,
            filter: filter,
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.error('删除失败！')
        }
      }
    })

  },
  filtertypes(filters) {
    // member select filter type (0=>普通成员，1=>团队管理员，3=> 系统管理员)
    // return number
    let filter =''
    let isSetFilter = false
    let protoDate = ['0','1','2']
    let typeData = ['1', '2']
    if(filters.style) {
      if (filters.style.length === 1) {
        isSetFilter = true
         filter = `role__eq,${filters.style[0]}`
      }
      if (filters.style.length == 2) {
        for (let i=0;i < protoDate.length; i++) {
          let item = protoDate[i]
          if(filters.style.indexOf(item) < 0){
            isSetFilter = true
            filter = `role__neq,${item}`
            break
          }
        }
      }
    }
    if(filters.type) {
      if(filters.type.length == 1) {
        if(filter) {
          filter +=`,type__eq,${filters.type[0]}`
        } else {
          filter =`type__eq,${filters.type[0]}`
        }

        isSetFilter = true
      }
    }
    if(isSetFilter) {
      return filter
    }
    return protoDate.concat(typeData)
  },
  onTableChange(pagination, filters, sorter) {
    // 点击分页、筛选、排序时触发
    if (!filters.style && !filters.type) {
      return
    }
    let styleFilterStr = filters.style ? filters.style.toString() : ''
    let typeFilterStr = filters.type ?  filters.type.toString() : ''
    if (styleFilterStr === this.styleFilter && typeFilterStr == this.typeFilterStr) {
      return
    }
    const { scope } = this.props
    const { loadUserList } = scope.props
    let { page, pageSize, sort } = scope.state
    const query = {
      page,
      size: pageSize,
      sort,
    }

    let filter = this.filtertypes(filters)
    query.filter = filter
    scope.setState({
      filter
    })
    loadUserList(query)
    this.styleFilter = styleFilterStr
    this.typeFilterStr = typeFilterStr
  },
  handleMenuClick(record, { key }) {
    if (key === 'delete') {
      this.setState({ delModal: true, userManage: record })
      return
    }
    this.props.scope.memberRecharge(record)
  },
  gotoSpace(space) {
    const { loadTeamClustersList, setCurrent } = this.props.scope.props
    let notification = new NotificationHandler()
    this.setState({
      gotoSpaceModal: true,
    })
    loadTeamClustersList('default', { size: 100 }, {
      success: {
        func: result => {
          // select first cluster by default
          const firstCluster = result.data[0]
          firstCluster.namespace = space.namespace
          space.userName = space.name
          setCurrent({
            team: { teamID: 'default' },
            space,
            cluster: firstCluster,
          })
          setTimeout(() => {
            browserHistory.push('/app_manage')
          }, 50);
        },
        isAsync: true
      },
      failed: {
        func: (error) => {
          notification.error('加载集群失败，请重试')
          this.setState({
            gotoSpaceModal: false,
          })
        }
      }
    })
  },
  render() {
    let { sortedInfo, filteredInfo, sort } = this.state
    const { searchResult, notFound } = this.props.scope.state
    const { data, scope } = this.props
    filteredInfo = filteredInfo || {}
    const pagination = {
      simple: true,
      total: this.props.scope.props.total,
      showSizeChanger: true,
      defaultPageSize: 10,
      defaultCurrent: 1,
      current: this.props.scope.state.current,
      pageSizeOptions: ['5', '10', '15', '20'],
      onShowSizeChange(current, pageSize) {
        scope.props.loadUserList({
          page: current,
          size: 10,
          sort,
          filter: scope.state.filter,
        })
        scope.setState({
          pageSize: 10,
          page: current,
          current: 1,
        })
      },
      onChange(current) {
        const { pageSize, page } = scope.state
        if (current === page) {
          return
        }
        scope.props.loadUserList({
          page: current,
          size: 10,
          sort,
          filter: scope.state.filter
        })
        scope.setState({
          pageSize: 10,
          page: current,
          current: current,
        })
      },
    }
    const { userDetail } = this.props.scope.props
    let filterKey = [ { text: '普通成员', value: 0 },{ text: '团队管理员', value: 1 }]
    if ( userDetail.role === ROLE_SYS_ADMIN ) {
      filterKey = [
        { text: '普通成员', value: 0 },
        { text: '团队管理员', value: 1 },
        { text: '系统管理员', value: 2 }
      ]
    }

    let ldapFileter = [ { text: '是', value: 2 },{ text: '否', value: 1 }]


    const columns = [
      {
        title: (
          <div onClick={this.handleSortName}>
            成员名
            <div className="ant-table-column-sorter">
              <span className={this.state.sortName ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortName ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        className: 'memberName',
        width: '15%',
        render: (text, record, index) => {
          if (userDetail.role === ROLE_SYS_ADMIN) {
            return (
              <Link to={`/account/user/${record.key}`}>
                {text}
              </Link>
            )
          }
          return text
        },
      },
      {
        title: '手机',
        dataIndex: 'tel',
        key: 'tel',
        width: '15%',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: '15%',
      },
      {
        title: '类型',
        /* (
         <span>
           <div className="ant-dropdown ant-dropdown-placement-bottomLeft"
                style={{left: '816.208px', top: '196.438px'}}>
             <div className="ant-table-filter-dropdown">
               <ul className="ant-dropdown-menu ant-dropdown-menu-vertical  ant-dropdown-menu-root" role="menu" aria-activedescendant="" tabindex="0">
                 <li className="ant-dropdown-menu-item" role="menuitem" aria-selected="false">
                   <label className="ant-checkbox-wrapper">
                     <span className="ant-checkbox">
                     <span className="ant-checkbox-inner"></span>
                     <input type="checkbox" className="ant-checkbox-input" value="on"/>
                   </span>
                   </label>
                   <span>团队管理员</span>
                 </li>
                 <li className="ant-dropdown-menu-item" role="menuitem" aria-selected="false">
                   <label className="ant-checkbox-wrapper">
                     <span className="ant-checkbox">
                       <span className="ant-checkbox-inner"></span>
                       <input type="checkbox" className="ant-checkbox-input" value="on"/>
                     </span>
                   </label>
                   <span>普通成员</span>
                 </li>
               </ul>
               <div className="ant-table-filter-dropdown-btns">
                 <a className="ant-table-filter-dropdown-link confirm">确定</a>
                 <a className="ant-table-filter-dropdown-link clear">重置</a>
               </div>
             </div>
           </div>
           <i className="anticon anticon-filter" title="筛选"/>
         </span>
       ),*/
        dataIndex: 'style',
        key: 'style',
        filters: filterKey,
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortTeam}>
            团队
            <div className="ant-table-column-sorter">
              <span className={this.state.sortTeam ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortTeam ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'team',
        key: 'team',
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortBalance}>
            余额
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
        title: 'LDAP',
        dataIndex: 'type',
        key: 'type',
        filters: ldapFileter,
        width: '10%',
        render: (text) => {
          if(text == 2) return '是'
          return '否'
        }
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record, index) => (
          <div className="action">
            {/* <Button icon="delete" className="delBtn setBtn" onClick={() => this.setState({delModal: true,userManage: record})}>
              删除
            </Button>
            { record.role == ROLE_SYS_ADMIN ?
              <Button className="setBtn" onClick={()=> scope.memberRecharge(record)}>充值</Button>
              :null
            }
            <Button className="setBtn" onClick={() => this.setState({delModal: true,userManage: record})}>
              进入空间
            </Button> */}
            <Dropdown.Button
              onClick={this.gotoSpace.bind(this, record)}
              overlay={
                <Menu
                  onClick={this.handleMenuClick.bind(this, record)}
                  style={{ width: '80px' }}
                >
                  <Menu.Item key="delete">删除</Menu.Item>
                  { record.role == ROLE_SYS_ADMIN ?
                    <Menu.Item>充值</Menu.Item>
                    : <Menu.Item key="none-footer" style={{ display: 'none' }}></Menu.Item>
                  }
                </Menu>
              }
              type="ghost"
            >
              进入空间
            </Dropdown.Button>
          </div>
        ),
      },
    ]
    if(userDetail.role !== ROLE_SYS_ADMIN){
      columns.pop()
    }
    if (notFound) {
      return (
        <div id="notFound">
          <div className="notFoundTip">没有查询到符合条件的记录，尝试其他关键字。</div>
          <a onClick={this.handleBack}>[返回成员管理列表]</a>
        </div>
      )
    } else {
      return (
        <div>
        <Table columns={columns}
          dataSource={searchResult.length === 0 ? data : searchResult}
          pagination={pagination}
          onChange={this.onTableChange}
        />
        <Modal title="删除成员操作" visible={this.state.delModal}
          onOk={()=> this.delMember()} onCancel={()=> this.setState({delModal: false})}
        >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除成员 {this.state.userManage ? this.state.userManage.name : ''} ?</div>
        </Modal>
        <Modal title="进入用户空间中" visible={this.state.gotoSpaceModal} footer={null}>
          <div className="loadingBox">
            <Spin size="large" />
          </div>
        </Modal>
        </div>
      )
    }
  },
})

class MemberManage extends Component {
  constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.userOnSubmit = this.userOnSubmit.bind(this)
    this.state = {
      searchResult: [],
      notFound: false,
      visible: false,
      visibleMember: false,// member account modal
      memberList: [],
      pageSize: 10,
      page: 1,
      sort: "a,userName",
      filter: "",
      current: 1,
      number: 10
    }
  }
  showModal() {
    this.setState({
      visible: true,
    })
    setTimeout(function() {
      document.getElementById('newUser').focus()
    }, 500);
  }
  componentWillMount() {
    this.props.loadUserList({
      page: 1,
      size: 10,
      sort: "a,userName",
      filter: "",
    })
  }
  userOnSubmit(user) {
    const { createUser, loadUserList } = this.props
    const { page, pageSize, sort, filter } = this.state
    let notification = new NotificationHandler()
    notification.spin(`创建用户 ${user.userName} 中...`)
    createUser(user, {
      success: {
        func: (response) => {
          loadUserList({
            page,
            size: pageSize,
            sort,
            filter,
          })
          notification.close()
          if (response.data && response.data == "SEND_MAIL_ERROR") {
            notification.error(`创建用户 ${user.userName} 成功，但发送邮件失败`)
          } else {
            notification.success(`创建用户 ${user.userName} 成功`)
          }
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`创建用户 ${user.userName} 失败`, err.message.message)
        }
      }
    })
  }
  memberRecharge(record) {
    this.setState({
      visibleMember: true,
      record
    })
  }
  activeMenu(number) {
    this.setState({number})
  }
  btnCharge() {
    // user charge
    const body = {
      namespaces: [this.state.record.namespace],
      amount: parseInt(this.state.number)
    }
    let notification = new NotificationHandler()
    if (!body.amount || body.amount <= 0) {
      notification.info('请选择充值金额，且不能为负数')
      return
    }
    const _this = this
    const { page, pageSize, sort, filter } = this.state

    const { loadUserList, chargeUser} = this.props
    const oldBalance = parseFloat(this.state.record.balance)

    if (oldBalance + body.amount > MAX_CHARGE ) {
      // balance (T) + charge memory not 200000
      let isnewBalance = Math.floor(MAX_CHARGE - oldBalance)
      let newBalance = isnewBalance > 0 ? isnewBalance : 0
      notification.info(`充值金额大于可充值金额，最多还可充值 ${newBalance}`)
      return
    }

    chargeUser(body, {
      success: {
        func: (ret)=> {
          notification.success('成员充值成功')
          _this.setState({visibleMember: false,number:10})
          loadUserList({
            page,
            size: pageSize,
            sort,
            filter,
          })
        },
        isAsync: true
      }
    })
  }
  render() {
    const { users, checkUserName } = this.props
    const scope = this
    const { visible, memberList } = this.state
    const searchIntOption = {
      addBefore: [
        { key: 'name', value: '成员名' },
        { key: 'tel', value: '手机号' },
        { key: 'email', value: '邮箱' },
      ],
      defaultSearchValue: 'name',
      placeholder: '请输入关键词搜索',
    }
    const funcs = {
      checkUserName
    }
    return (
      <div id="MemberManage">
        <Title title="成员管理" />
        <Row>
          <Button type="primary" size="large" onClick={this.showModal} className="addBtn">
            <i className='fa fa-plus' /> 添加新成员
          </Button>
          <SearchInput scope={scope} searchIntOption={searchIntOption} />
          <CreateUserModal
            visible={visible}
            scope={scope}
            onSubmit={this.userOnSubmit}
            funcs={funcs}
          />
          <div className="total">共{this.props.total}个</div>
        </Row>
        <Row className="memberList">
          <Card>
            <MemberTable scope={scope} data={users} />
          </Card>
        </Row>
        {/* 充值modal */}
        <Modal title="成员充值" visible={this.state.visibleMember}
         onCancel={()=> this.setState({visibleMember: false, number: 10})}
         onOk={()=> this.btnCharge()}
         width={600}
        >
          <MemberRecharge parentScope={this} />
        </Modal>
      </div>
    )
  }
}

function mapStateToProp(state) {
  let usersData = []
  let total = 0
  let data = []
  const users = state.user.users
  const userDetail = state.entities.loginUser.info
  if (users.result) {
    if (users.result.users) {
      usersData = users.result.users
      usersData.map((item, index) => {
        let role = ""
        if (item.role === ROLE_TEAM_ADMIN){
          role = "团队管理员"
        }else if (item.role === ROLE_SYS_ADMIN) {
          role = "系统管理员"
        }else{
          role = "普通成员"
        }
        data.push(
          {
            key: item.userID,
            name: item.displayName,
            namespace: item.namespace,
            tel: item.phone,
            email: item.email,
            style: role,
            role: userDetail.role,// user info into team list
            team: item.teamCount,
            balance: parseAmount(item.balance).fullAmount,
            type: item.type
          }
        )
      })
    }
    if (users.result.total) {
      total = users.result.total
    }
  }
  return {
    users: data,
    total,
    userDetail
  }
}

export default connect(mapStateToProp, {
  loadUserList,
  createUser,
  deleteUser,
  checkUserName,
  chargeUser,
  loadTeamClustersList,
  setCurrent,
})(MemberManage)