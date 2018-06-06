/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Management component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import { Modal, Form, Table, Button, Popover, Card, Input, Radio, Icon, Select, Spin } from 'antd'
import classNames from 'classnames'
import { loadProjectMembers, addProjectMember, deleteProjectMember, updateProjectMember } from '../../../../actions/harbor'
import { loadUserList } from '../../../../actions/user'
import { formatDate } from '../../../../common/tools'
import NotificationHandler from '../../../../common/notification_handler'

const notification = new NotificationHandler()
const RadioGroup = Radio.Group
const Option = Select.Option

class AddUserModal extends Component {
  constructor(props) {
    super()
    this.cancel = this.cancel.bind(this)
    this.handModalOk = this.handModalOk.bind(this)
    this.state = {
      searchInput: '',
    }
  }

  componentWillMount() {
    //
  }

  cancel() {
    const { func, form } = this.props
    func.handCancel()
    form.resetFields()
  }

  handModalOk() {
    const { form, func, registry, id } =this.props
    form.validateFields((error,values)=> {
      if (!!error) {
        return
      }
      const body = {
        username: values.username,
        roles: [ values.role ]
      }
      func.addProjectMember(registry, id, body, {
        success: {
          func: () => {
            func.loadData()
            this.cancel()
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            const { statusCode } = err
            if (statusCode === 404) {
              notification.error(`用户 ${values.username} 不存在`)
              return
            }
            if (statusCode === 409) {
              notification.warn(`用户 ${values.username} 已在项目组中`)
              return
            }
            notification.error(`添加用户 ${values.username} 失败`)
          },
        }
      })
    })
  }

  searchUser = username => {
    const { loadUserList } = this.props
    if (this.searchUserTimeout) {
      clearTimeout(this.searchUserTimeout)
      this.searchUserTimeout = null
    }
    const query = {
      pageSize: 100,
      sort: 'a,userName',
      filter: `userName,${username}`,
    }
    this.searchUserTimeout = setTimeout(() => {
      loadUserList(query)
    }, 300)
  }

  handleChange = value => {
    this.setState({
      searchInput: value,
    })
    this.searchUser(value)
  }

  renderUserOptions = () => {
    const { searchUserLoading, users } = this.props
    if (searchUserLoading) {
      return (
        <Option disabled value="disabled">
          <div style={{textAlign: 'center'}}>
            <Spin size="small" />
          </div>
        </Option>
      )
    }
    return users.map(user => (
      <Option key={user.userName}>
        {user.userName}
      </Option>
    ))
  }

  render() {
    const formItemLayout= {
      labelCol: { span: 3 },
      wrapperCol: { span: 18 },
    }
    const { form, func} = this.props
    const nameProps= form.getFieldProps('username', {
      rules: [
        { required: true, message: '请输入姓名' },
      ],
      onChange: this.handleChange,
    })
    const roleProps= form.getFieldProps('role',{
      initialValue: 1
    })
    return (
      <Modal title="添加成员" visible={this.props.visible}
        onCancel={this.cancel}
        onOk={this.handModalOk}
      >
        <br/>
        <Form className="itemCreateFrom">
          <Form.Item  {...formItemLayout} wrapperCol={{span: 11}} label="姓名" className="createForm">
            {/*<Input placeholder="请输入姓名" {...nameProps} />*/}
            <Select
              {...nameProps}
              combobox
              showArrow={false}
              style={{ width: '100%' }}
              placeholder="搜索并添加用户"
              optionFilterProp="children"
              notFoundContent="无法找到"
              defaultActiveFirstOption={false}
            >
              {this.renderUserOptions()}
              
            </Select>
            <i style={{float: "right",position: 'relative',top: '-22px',right: '10px'}} className="fa fa-search selectIcon" onClick={() => this.searchUser(this.state.searchInput)}></i>
          </Form.Item>
          
          <Form.Item  {...formItemLayout} label="角色" className="createForm">
            <RadioGroup {...roleProps}>
              <Radio value={1}>管理员</Radio>
              <Radio value={2}>开发人员</Radio>
              <Radio value={3}>访客</Radio>
            </RadioGroup>
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

AddUserModal = Form.create()(AddUserModal)

class Management extends Component {
  constructor(props) {
    super()
    this.handCancel = this.handCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.loadData = this.loadData.bind(this)
    this.isProjectAdmin = this.isProjectAdmin.bind(this)
    this.state = {
      filteredInfo: null,
      sortedInfo: null,
      deleteUser: false,
      addUser: false,
      userList: [],// deleete user list
      popVisible: {},
    }
  }

  handSelected(user, role, e) {
    if (user[camelize('role_id')] == role) {
      e.stopPropagation()
      return
    }
    const { id, registry, updateProjectMember } = this.props
    const body = {
      roles: [ role ]
    }
    updateProjectMember(registry, id, user[camelize('user_id')], body, {
      success: {
        func: () => {
          notification.success('切换用户角色成功')
          this.loadData()
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          notification.error('切换用户角色失败')
        },
      }
    })
  }

  loadData() {
    const { loadProjectMembers, id, registry } = this.props
    loadProjectMembers(registry, id)
  }

  handCancel() {
    this.setState({addUser:false})
  }

  goAddUser() {
    this.setState({addUser: true})
    setTimeout(() => {
      const input = document.getElementsByClassName('ant-select-search__field')[0]
      input && input.focus()
      this.props.loadUserList()
    }, 300)
  }

  handDeleteUser() {
    const { deleteProjectMember, id, registry } = this.props
    const user = this.state.userList[0]
    const doSuccess = () => {
      this.loadData()
      this.setState({deleteUser:false})
      notification.success(`移除用户 ${user.username} 成功`)
    }
    deleteProjectMember(registry, id, user[camelize('user_id')], {
      success: {
        func: () => {
          doSuccess()
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode === 404) {
            doSuccess()
            return
          }
          notification.error(`移除用户 ${user.username} 失败`)
        },
      }
    })
  }

  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  }

  isProjectAdmin() {
    const { currentUser } = this.props
    return currentUser[camelize('role_id')] == 1 || currentUser[camelize('has_admin_role')] == 1
  }

  render() {
    const { members, currentUser, addProjectMember } = this.props
    const { list, isFetching } = members || {}
    let { filteredInfo } = this.state
    filteredInfo = filteredInfo || {}
    const columns = [
      {
        title: '成员名',
        dataIndex: 'username',
        key: 'username',
      }, {
        title: '仓库组角色',
        dataIndex: camelize('role_id'),
        key: camelize('role_id'),
        filters: [
          { text: '管理员', value: 1 },
          { text: '开发人员', value: 2 },
          { text: '访客', value: 3 },
        ],
        filteredValue: filteredInfo[camelize('role_id')],
        onFilter: (value, record) => record[camelize('role_id')] == value,
        render: (text, row) => {
          if (text == 1) {
            return '管理员'
          }
          if (text == 2) {
            return '开发人员'
          }
          if (text == 3) {
            return '访客'
          }
          return '未知'
        }
      }, {
        title: '添加时间',
        dataIndex: camelize('creation_time'),
        key: camelize('creation_time'),
        render: text => formatDate(text),
      }
    ]
    if (this.isProjectAdmin()) {
      columns.push({
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, row) => {
          // this role == row.role
          if (row.username == currentUser.username) {
            return '无需切换'
          }
          const content= (
            <div className="menu" onClick={() => this.state.popVisible[row.username] = false}>
              <div className={row[camelize('role_id')] == 1 ? 'menu-item menu-disabled':'menu-item'} onClick={(e)=> this.handSelected(row, 1, e)}>
                管理员 <span className="icon">{row[camelize('role_id')] ==1?<Icon type="check-circle-o" />:null}</span>
              </div>
              <div className={row[camelize('role_id')] == 2 ? 'menu-item menu-disabled':'menu-item'}  onClick={(e)=> this.handSelected(row, 2, e)}>
                开发人员 <span className="icon">{row[camelize('role_id')] ==2?<Icon type="check-circle-o" />:null}</span>
              </div>
              <div className={row[camelize('role_id')] == 3 ? 'menu-item menu-disabled':'menu-item'}  onClick={(e)=> this.handSelected(row, 3, e)}>
                访客 <span className="icon">{row[camelize('role_id')] ==3?<Icon type="check-circle-o" />:null}</span>
              </div>
            </div>
          )
          return (
            <div className="action">
              <Popover content={content} placement="left" title="切换角色" trigger="click"
                getTooltipContainer={()=>document.getElementsByClassName('imageProject')[0]}
                onVisibleChange={visible => {
                    this.setState({
                      popVisible: { [row.username]: visible }
                    })
                  }
                }
                visible={this.state.popVisible[row.username]}
              >
                <Button onClick={() => this.setState({popVisible: {[row.username]: true}})} type="primary">切换角色</Button>
              </Popover>
              <Button onClick={()=> this.setState({deleteUser:true,userList:[row]})}>删除</Button>
            </div>
          )
        }
      })
    }
    const func = {
      handCancel: this.handCancel,
      addProjectMember,
      loadData: this.loadData,
    }
    const _this = this
    /*const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        _this.setState({userList:selectedRows})
      }
    }*/
    return (
      <div className="management">
        <div className="topRow">
          {
            this.isProjectAdmin() && (
              <Button
                type="primary"
                size="large"
                onClick={()=> this.goAddUser()}>
                <i className='fa fa-plus'/>&nbsp;
                添加成员
              </Button>
            )
          }
          {/*<Button type="ghost" size="large" icon="delete" disabled={this.state.userList.length ==0} onClick={()=> this.setState({deleteUser:true})}>删除</Button>

          <Input placeholder="搜索" className="search" size="large" />
          <i className="fa fa-search"></i>
          <span className="totalPage">共计：{dataSource.length} 条</span>*/}
        </div>
        <Table className="myImage"
          dataSource={list}
          columns={columns}
          pagination={false}
          loading={isFetching}
          onChange={this.handleChange}
        />
        <Modal title="删除成员" visible={this.state.deleteUser}
          onCancel={()=> this.setState({deleteUser:false})}
          onOk={()=> this.handDeleteUser()}
        >
          <div className="confirmText">您确认删除成员 {this.state.userList.map(list=>list.username).join(',')}？</div>
        </Modal>
        {/* add user modal */}
        <AddUserModal visible={this.state.addUser} func={func} {...this.props}/>

      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { harbor, user } = state
  const users = user.users || {}
  let harborProjects = harbor.projects && harbor.projects[props.registry] || {}
  return {
    harborProjects,
    searchUserLoading: users.isFetching || false,
    users: users.result && users.result.users || []
  }
}

export default connect(mapStateToProps, {
  loadProjectMembers,
  addProjectMember,
  deleteProjectMember,
  updateProjectMember,
  loadUserList,
})(Management)
