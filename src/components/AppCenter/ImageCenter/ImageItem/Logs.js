/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Logs component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, Tabs, Menu, Dropdown, Table, Icon, Button, Input, Select } from 'antd'
import '../style/Logs.less'
import { loadProjectLogs } from '../../../../actions/harbor'
import { DEFAULT_REGISTRY,  } from '../../../../constants'
import { formatDate } from '../../../../common/tools'
import SearchInput from '../../../SearchInput'
const Option = Select.Option

class Logs extends Component {
  constructor(props) {
    super()
    this.state = {
      currentPage: 1,
      pageSize: 10,
      searchType: 'username'
    }
  }
  loadData(query, data) {
    const { loadProjectLogs, params } = this.props
    loadProjectLogs(DEFAULT_REGISTRY, params.id, query, data)
  }
  componentWillMount() {
    this.loadData({
      page: this.state.currentPage,
      page_size: this.state.pageSize
    })
    this.select = <Select style={{width: '90px'}} defaultValue="username" onChange={(e) => this.searchType(e)}>
      <Option key="username">成员名</Option>
      <Option key="repo_name">镜像名称</Option>
    </Select>
  }
  componentDidUpdate() {
    let searchInput = document.getElementById('logSearch')
    searchInput && searchInput.focus()
  }
  searchType(e) {
    this.setState({
      searchType: e
    })
  }
  pageChange(page) {
    this.setState({
      currentPage: page
    })
    const postBody = {
    }
    if(this.state.keyword) {
      postBody[this.state.searchType] = this.state.keyword
    }
    if(this.state.filterOp) {
      postBody.keywords = this.state.filterOp
    }
    this.loadData({
      page: page,
      page_size: this.state.pageSize
    }, postBody)
  }
  searchLogs(e) {
    const keyword = e.target.value
    this.setState({
      keyword,
      currentPage: 1
    })
    const postBody = {
      [this.state.searchType]: keyword
    }
    if(this.state.filterOp) {
      postBody.keywords = this.state.filterOp
    }
    this.loadData({
      page: 1,
      page_size: this.state.pageSize
    }, postBody)
  }
  filter(pagination, filter, sort) {
    let page = pagination.current
    if(page == this.state.page) {
      page = 1
    }
    let filterOp = ''
    if(filter.operation && filter.operation.length > 0) {
      filterOp = filter.operation.join('/')
    }
    this.setState({
      currentPage: page,
      filterOp: filterOp,
    })
    const postBody = {
    }
    if(filterOp) {
      postBody.keywords = filterOp
    }
    if(this.state.keyword) {
      postBody[this.state.searchType] = this.state.keyword
    }
    this.loadData({
      page: page,
      page_size: this.state.pageSize
    }, postBody)
  }
  render() {
    const { projectLogs } = this.props
    const { isFetching, list, total } = projectLogs
    let filterKey = [
      { text: 'Pull', value: 'pull' },
      { text: 'Push', value: 'push' },
      { text: 'Create', value: 'create' },
      { text: 'Delete', value: 'Delete' },
      { text: '其他', value: 'other' },
    ]
    const columns = [
      {
        title: '成员名',
        dataIndex: 'username',
        key: 'username',
        width: '20%',
      }, {
        title: '镜像名称',
        dataIndex: 'repoName',
        key: 'repoName',
        width: '30%',
      }, {
        title: '标签',
        dataIndex: 'repoTag',
        key: 'repoTag',
        width: '10%',
        render(value) {
          if(value === 'N/A') {
            return '-'
          }
          return value
        }
      },{
        title: '操作',
        dataIndex: 'operation',
        filters: filterKey,
        key: 'operation',
        width: '10%',
      }, {
        title: '时间戳',
        dataIndex: 'opTime',
        key: 'opTime',
        width: '30%',
        render(value, row, index) {
          if(row.opTime) {
            return formatDate(row.opTime)
          }
          return ''
        }
      }
    ]

    const pagination = {
      size: "small",
      defaultPageSize:
      this.state.pageSize,
      total: total ? total : 0,
      current: this.state.currentPage,
      showTotal: total => `共计： ${total} 条`,
    }

    return (
      <div id="logs">
        <div className='littleLeft'>
          <i className='fa fa-search' onClick={this.handleSearch} />
        </div>
        <div className="topRow">
          <Input addonBefore={this.select} placeholder="搜索" className="search" id="logSearch" size='large' onPressEnter={(e) => this.searchLogs(e)} />
          {/*{total >0 ?
            <span className="totalPage">共计：{total} 条</span>
          :null
          }*/}
        </div>
        <Table style={{ marginTop: '20px' }} className="myImage"
          dataSource={list}
          columns={columns}
          pagination={pagination}
          onChange={(pagination, filter, sort) => this.filter(pagination, filter, sort)}
          loading={isFetching} />
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultProjectLogs = {
    isFetching: false,
    list: []
  }
  let projectLogs = state.harbor.projectLogs
  if(projectLogs[DEFAULT_REGISTRY]) {
    projectLogs = projectLogs[DEFAULT_REGISTRY]
  } else {
    projectLogs = defaultProjectLogs
  }
  return {
    projectLogs
  }
}

export default connect(mapStateToProps, {
  loadProjectLogs
})(Logs)
