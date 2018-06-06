/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *  ContainerProgress
 *
 * v0.1 - 2017/1/10
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Table, Tooltip } from 'antd'
import './style/ContainerProgress.less'
import { connect } from 'react-redux'
import { getPodProcess } from '../../actions/app_manage'
import { formatDate } from '../../common/tools'
import moment from 'moment'

class ContainerProgress extends Component{
  constructor(props){
    super(props)
    this.getDataSource = this.getDataSource.bind(this)
    this.renderStatus = this.renderStatus.bind(this)
    this.renderCmd = this.renderCmd.bind(this)
    this.state = {

    }
  }
  bytesToSize(bytes) {
    if (bytes === 0) return '0 KB'
    let k = 1024
    let sizes = ['KB', 'MB', 'GB', 'TB']
    let i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
  }
  getDataSource (processList) {
    if (!Array.isArray(processList)) {
      return []
    }
    if(processList.length === 0){
      return []
    }
    let items = JSON.parse(JSON.stringify(processList))
    items.map((item,index) => {
      item.cpuPercent = item.cpuPercent/100 + '%'
      item.memPercent = item.memPercent/100 + '%'
      item.vmSize = this.bytesToSize(item.vmSize)
      item.vmRSS = this.bytesToSize(item.vmRSS)
      item.startTime = formatDate(item.startTime)
      item.cpuTime = this.formatSeconds(item.cpuTime)
    })
    return items
  }
  formatSeconds (time) {
    let h = parseInt(time / 3600)
    if (h < 10) {
      h = "0" + h
    }
    let m = parseInt((time - h*3600) / 60)
    if (m < 10) {
      m = "0" + m
    }
    let s = parseInt((time - h*3600) % 60)
    if (s < 10) {
      s = "0" + s
    }
    let length = h + ":" + m + ":" + s
    if (time >= 0) {
      return length
    } else {
      return "-"
    }
  }
  renderStatus (text) {
    let status = text
    let IconColor = '#999'
    switch (text) {
      case 'R' :
        status = 'R (运行)'
        IconColor = '#2fba66'
        break
      case 'S' :
        status = 'S (休眠)'
        IconColor = '#4cb3f7'
        break
      case 'D' :
        status = 'D (不可中断)'
        IconColor = '#666'
        break
      case 'Z' :
        status = 'Z (僵死)'
        IconColor = '#fcb25c'
        break
      case 'T' :
        status = 'T (停止或追踪停止)'
        IconColor = '#f85a59'
        break
      case 't' :
        status = 't (追踪停止)'
        IconColor = '#f85a59'
        break
      case 'W' :
        status = 'W (进入内存交换)'
        break
      case 'X' :
        status = 'X (退出)'
        IconColor = '#7272fb'
        break
      case 'x' :
        status = 'x (退出)'
        IconColor = '#7272fb'
        break
      default :
        status = '其他'
        IconColor = '#999'
        break
    }
    return (
      <div><i className="statusIcon" style={{backgroundColor:IconColor}}/>{status}</div>
    )
  }
  renderCmd (text) {
    return (
      <Tooltip title={text} placement="topLeft">
        <div className='cmdTab'>
          {text}
        </div>
      </Tooltip>
    )
  }
  componentWillMount() {
    const { cluster, containerName, getPodProcess } = this.props
    getPodProcess(cluster, containerName)
  }

  render(){
    const columns = [
      {
        title: '用户',
        dataIndex: 'userName',
        key: 'userName',
        width:'7%',
      },
      {
        title: 'PID',
        dataIndex: 'pid',
        key: 'pid',
        width:'6%'
      },
      {
        title: 'CPU',
        dataIndex: 'cpuPercent',
        key: 'cpuPercent',
        width:'7%'
      },
      {
        title: '虚拟内存',
        dataIndex: 'vmSize',
        key: 'vmSize',
        width:'13%'
      },
      {
        title: '物理内存',
        dataIndex: 'vmRSS',
        key: 'vmRSS',
        width:'11%'
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text,record,index) => this.renderStatus(text),
        width:'11%'
      },
      {
        title: '启动时间',
        dataIndex: 'startTime',
        key: 'startTime',
        width:'140px'
      },
      {
        title: 'CPU时间',
        dataIndex: 'cpuTime',
        key: 'cpuTime',
        width:'12%',
      },
      {
        title: '命令行',
        dataIndex: 'cmd',
        key: 'cmd',
        width: '18%',
        render: (text,record,index) => this.renderCmd(text),
      },
    ]
    const { processList, isFetching } = this.props
    return (
      <div id='ContainerProgress'>
        <span className="titleSpan">进程信息</span>
        <Table
          columns={columns}
          dataSource={this.getDataSource(processList)}
          pagination={false}
          loading={isFetching}
        />
      </div>
    )
  }
}
function mapStateToProps (state, props) {
  let processList = []
  let isFetching = true
  const result = state.containers.containerProcess
  try {
    processList = result.result.data.data
    isFetching = result.isFetching
  } catch (e) {
    processList = []
    isFetching = true
  }
  return {
    processList,
    isFetching,
  }
}
export default connect(mapStateToProps,{
  getPodProcess,
})(ContainerProgress)