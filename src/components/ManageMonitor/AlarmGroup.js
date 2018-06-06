/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *  server and app some port in card
 *
 * v0.1 - 2017/03/24
 * @author Zhangchengzheng
 */

'use strict'
import React, { Component } from 'react'
import { Button, Input, Table, Spin, Dropdown, Menu, Icon, Popover, Modal, Form, Card, Tooltip } from 'antd'
import './style/AlarmGroup.less'
import QueueAnim from 'rc-queue-anim'
// import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../constants'
import CreateAlarm from '../AppModule/AlarmModal/CreateGroup'
const InputGroup = Input.Group
import { loadNotifyGroups, deleteNotifyGroups } from '../../actions/alert'
import { setCurrent } from '../../actions/entities'
import NotificationHandler from '../../common/notification_handler'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { formatDate } from '../../common/tools'
import cloneDeep from 'lodash/cloneDeep'
import Title from '../Title'

class AlarmGroup extends Component {
  constructor(props) {
    super(props)
     this.state = {
        createGroup: false,
        deleteModal: false,
        deletingGroupIDs: [],
        createModalTitle: '创建新通知组',
        selectedRowKeys: [],
        selectedRows: [],
        modifyGroup: false,
        modifyingGroupInfo: {},
     }
  }
  componentWillMount() {
    const { loadNotifyGroups } = this.props
    const clusterID = this.props.cluster.clusterID
    loadNotifyGroups()
  }
  dropdowns (record, group){
    // Dropdown delete btn
    return(
      <Menu onClick={(record)=> this.handleDropdownClick(record, group)}
        style={{ width: '80px'}}
      >
      <Menu.Item key="edit">
        修改
      </Menu.Item>
    </Menu>
    )
  }
  componentWillReceiveProps(nextProps){
    let pre = this.props.space.spaceID
    let next = nextProps.space.spaceID;
    const { loadNotifyGroups } = this.props
    if(pre !== next) {
      loadNotifyGroups()
    }
  }
  // group must be an array. e.g. ['ID1'] or ['ID1', 'ID2']
  deleteGroup(rowSelection) {
    const clusterID = this.props.cluster.clusterID
    let notification = new NotificationHandler()
    if (!this.state.deletingGroupIDs) {
      notification.error('请选择要删除的通知组')
    }
    const {
      deleteNotifyGroups,
      loadNotifyGroups,
    } = this.props

    // unselect all rows
    this.setState({
      selectedRowKeys: [],
    })
    deleteNotifyGroups(this.state.deletingGroupIDs, {
      success: {
        func: (result) => {
          this.closeDeleteModal()
          notification.success(`删除成功`)
          loadNotifyGroups()
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          this.closeDeleteModal()
          notification.error('删除失败','请先取消策略对该通知组的引用，方可删除告警通知组')
        },
        isAsync: true
      }
    })
  }
  handleDropdownClick(record, group) {
    if (record.key == 'edit') {
      this.openModifyModal(group)
    }
  }
  openDeleteModal(e, groupIDs) {
    e.stopPropagation()
    if (!groupIDs) {
      new NotificationHandler().info('请先取消策略对该通知组的引用，方可删除告警通知组')
      return
    }
    this.setState({
      deleteModal: true,
      deletingGroupIDs: groupIDs,
    })
  }
  closeDeleteModal() {
    this.setState({
      deleteModal: false,
      deletingGroupIDs: [],
    })
  }
  openModifyModal(group) {
    this.setState({
      createGroup: false,
      modifyGroup: true,
      createModalTitle: '修改通知组',
      modifyingGroupInfo: group,
    })
  }
  getGroupEmails(emails){
    if (!emails) {
      return '-'
    }
    let content = '-'
    if (emails.length > 0) {
      content = emails.map(function(item) {
        let status = emails[0].status
        return <div className='alarmGroupItem'>
          <span className='alarmGroupspan'>{item.addr}{!!item.desc ? ` (备注:${item.desc})` : ''}</span>
          <span className='alarmGroupspan'>{item.status !=1?<span style={{color:'#f23e3f'}}> 【未验证】</span> : null }</span><br/>
          {/* {item.status} */}
        </div>
      })

    }

    return (
      <div>
        { content }
      </div>
    )
  }
  getGroupPhone(phone){
    if (!phone) {
      return '-'
    }
    let content = '-'
    if (phone.length > 0) {
      content = phone.map(function(item) {
        let status = phone[0].status
        return <div className='alarmGroupItem'>
          <span className='alarmGroupspan'>{item.num}</span>
          <span className='alarmGroupspan'>{item.status !=1?<span style={{color:'#f23e3f'}}>【未验证】</span> : null }</span><br/>
        </div>
      })

    }

    return (
      <div>
        { content }
      </div>
    )
  }
  toAlarmDetail(item,e) {
    const { data, cluster, setCurrent } = this.props;
    let currentCluster = data.find((record,index)=> record.clusterID === item.clusterID)
    if (cluster.clusterID !== currentCluster.clusterID) {
      setCurrent({
        cluster:currentCluster
      },{
        success:{
          func: ()=>{
            browserHistory.push(`/manange_monitor/alarm_setting/${encodeURIComponent(item.id)}?name=${item.name}`)
          },
          isAsync: true
        }
      })
    } else {
      browserHistory.push(`/manange_monitor/alarm_setting/${encodeURIComponent(item.id)}?name=${item.name}`)
    }
    e.stopPropagation()
  }
  getStragegies(strategies) {
    const _this = this;
    if (!strategies) {
      return '-'
    }
    let popover = '-'
    if (strategies.length > 0) {
      popover = strategies.map(function(item) {
        return <div className='alarmGroupItem'><span onClick={(e)=> _this.toAlarmDetail(item,e)}>{item.name}</span></div>
      })
    }
    return (
      <div>
        {popover}
      </div>
    )
  }
  handSearch() {
    let search = document.getElementById('AlarmGroupInput').value.trim()
    const { loadNotifyGroups } = this.props
    const clusterID = this.props.cluster.clusterID
    loadNotifyGroups(search)
  }
  getSelectedGroups() {
    let groupIDs = []
    this.state.selectedRows.map(function(item) {
      groupIDs.push(item.groupID)
    })
    return groupIDs
  }
  getModifyingGroup() {
    if (this.state.selectedRows.length !== 1) {
      const notification = new NotificationHandler()
      notification.error('请先选择一个组')
      return
    }
    return this.state.selectedRows[0]
  }
  handClickRow(e) {
    // this func is click table row then checkbox checked or false
    const { groups } = this.props
    const { selectedRowKeys, deletingGroupIDs, selectedRows } = this.state
    let keys = cloneDeep(selectedRowKeys)
    let selectGrops= cloneDeep(deletingGroupIDs)
    groups.map((list, index) => {
      if (list.groupID == e.groupID) {
        if (selectedRowKeys.indexOf(index) > -1) {
          keys.splice(selectedRowKeys.indexOf(index))
          selectGrops.splice(selectedRows[index])
          return
        }
        selectGrops.push(e)
        return keys.push(index)
      }
    })
    this.setState({selectedRowKeys: keys,selectedRows: selectGrops})
  }
  showAlramGroup() {
    this.setState({
      createGroup: true,
      createModalTitle: '创建新通知组'
    })
    setTimeout(()=> {
      document.getElementById('groupName').focus()
    },500)
  }

  handleCancel() {
    this.setState({
      createGroup: false,
      modifyGroup: false,
    });
  }

  render() {
    if (!this.props.groups) {
      return (
        <div className="loadingBox">
            <Spin size="large" />
        </div>
      )
    }
    const tableData = this.props.groups
    const modalFunc=  {
      scope : this,
    }
    const tableColumns = [{
      title:'名称',
      dataIndex:'name',
      width:'10%',
    },{
      title:'描述',
      dataIndex:'desc',
      render: (text, record, index) => (
        <div className='Overflow'>
          {record.desc}
        </div>
      ),
    },{
      title:'联系方式',
      width:'25%',
      dataIndex:'receivers',
      render:(receivers) => (<div>{this.getGroupEmails(receivers.email)}{this.getGroupPhone(receivers.phone)}</div>)
    },{
      title:'创建时间',
      dataIndex:'createTime',
      width:'19%',
      render: text => formatDate(text),
    },{
      title:'关联策略',
      dataIndex:'strategies',
      width:'15%',
      render:strategies => this.getStragegies(strategies)
    },{
      title:'操作',
      dataIndex:'handle',
      width:'15%',
      render:(text, group) => {
        if (group.strategies.length >0) {
          return (
          <Dropdown.Button type="ghost" overlay={ this.dropdowns(text, group) } onClick={(e)=> this.openDeleteModal(e,false) } className='disableBtn'>
              删除
            {/*<Tooltip title="请先取消策略对该通知组的引用，方可删除告警通知组">
            </Tooltip>*/}
          </Dropdown.Button>
          )
        }
        return (
          <Dropdown.Button type="ghost" overlay={ this.dropdowns(text, group) } onClick={(e)=> this.openDeleteModal(e,[group.groupID])} className="normalBtn">删除</Dropdown.Button>
        )
      }
    }]

    // this.props.groups.map(function(item, i) {
    //   tableData.push({
    //     key: i,
    //     name: item.name,
    //     desc: item.desc,
    //     email: item.receivers.email,
    //     createTime: formatDate(item.createTime),
    //     strategies: item.strategies,
    //     groupID: item.groupID,
    //   })
    // })

    const _this = this
    const clusterID = this.props.cluster.clusterID
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        _this.setState({
          selectedRows,
          selectedRowKeys,
        })
      },
      selectedRowKeys: this.state.selectedRowKeys,
    }
    return (
      <QueueAnim className="alarmGroup">
        <div id="AlarmGroup" key="demo">
          <Title title="告警通知组" />
          <div className='alarmGroupHeader'>
            <Button size="large" type="primary" onClick={()=> this.showAlramGroup()}>
              <i className="fa fa-plus" style={{marginRight:'5px'}}/>
              创建
            </Button>
            <Button size="large" type="ghost" onClick={() => this.props.loadNotifyGroups()}><i className="fa fa-refresh" /> 刷新</Button>
            <Button size="large" disabled={this.state.selectedRowKeys.length === 0} icon="delete" onClick={(e)=> this.openDeleteModal(e,this.getSelectedGroups())} type="ghost">删除</Button>
            <Button size="large" disabled={this.state.selectedRowKeys.length !== 1} icon="edit" onClick={() => this.openModifyModal(this.getModifyingGroup())} type="ghost">修改</Button>
            <div className="Search">
              <Input size="large" placeholder="搜索" id="AlarmGroupInput" onPressEnter={()=> this.handSearch()} />
              <i className="fa fa-search" onClick={()=> this.handSearch()} />
            </div>
          </div>
          <Card className='alarmGroupContent'>
            <Table
              className="strategyTable"
              columns={tableColumns}
              dataSource={tableData}
              pagination={{simple: true}}
              rowSelection={rowSelection}
              onRowClick={(e)=> this.handClickRow(e)}
            >
            </Table>
            <span className="pageCount">共计 {tableData.length} 条</span>
            { tableData.length ==0 ?
            <ul className="ant-pagination ant-pagination-simple ant-table-pagination" style={{top:-70,right:-10,width: 152}}><li title="上一页" className="ant-pagination-disabled ant-pagination-prev"><a></a></li><div  title="1/0" className="ant-pagination-simple-pager"><input type="text" value="1" style={{width: 30,textAlign:'center',borderRadius:6,height:24,border: '1px solid #d9d9d9'}}/><span className="ant-pagination-slash">／</span>0</div><li title="下一页" className="ant-pagination-disabled ant-pagination-next"><a></a></li></ul>
            :null
            }
          </Card>
          <Modal title={this.state.createModalTitle} onCancel={()=> this.handleCancel()} visible={this.state.createGroup || this.state.modifyGroup}
            width={800}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
          >
            <CreateAlarm funcs={modalFunc}
            afterCreateFunc={() => this.props.loadNotifyGroups()}
            afterModifyFunc={() => this.props.loadNotifyGroups()}
            isModify={!!this.state.modifyGroup}
            data={this.state.modifyingGroupInfo}
            createGroup={this.state.createGroup}
            />
          </Modal>
          <Modal title="删除通知组" visible={this.state.deleteModal}
            onCancel={()=> this.closeDeleteModal()}
            onOk={()=> this.deleteGroup(rowSelection)}
          >
            <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>告警通知组删除后，与之关联的策略将无法发送邮件告警，是否确定删除？</div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { groups } = state.alert
  const { cluster } = state.entities.current
  const { space } = state.entities.current
  const { teamClusters } = state.team
  if (!groups && !cluster && !teamClusters) {
   return props
 }

  let defaultData = {
      isFetching: false,
      result:{data:[]}
  }
  let defaultDatas = {
    result: {data:[]}
  }
  const { isFetching } = groups || defaultData
  const { result } = groups || defaultData
  let groupsData = result ? result.data : []
  let clusterResult = teamClusters.result || defaultDatas.result
  let clusterData = clusterResult ? clusterResult.data : []
  return {
    space,
    isFetching,
    cluster,
    groups: groupsData,
    data :clusterData
  }
}

export default connect(mapStateToProps, {
  loadNotifyGroups,
  deleteNotifyGroups,
  setCurrent
})(AlarmGroup)