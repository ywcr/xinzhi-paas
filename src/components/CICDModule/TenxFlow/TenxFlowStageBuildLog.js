/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowStageBuildLog component
 *
 * v0.1 - 2016-10-25
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Icon, Collapse, Alert } from 'antd'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/TenxFlowStageBuildLog.less'
// import WebSocket from '../../Websocket/socketIo'
import { genRandomString } from '../../../common/tools'
import { changeCiFlowStatus } from '../../../actions/cicd_flow'
import NotificationHandler from '../../../common/notification_handler'
import $ from 'jquery'
const ciLogs = []
const moment = require('moment')

function formatLog(log) {
  let newLog = log.split('\\n')
  let showLogs = newLog.map((item, index) => {
    const logDate = item.substring(item.indexOf('[')+1,item.indexOf(']'))
    if(moment(logDate).format('YYYY/MM/DD HH:mm:ss')!="Invalid date"){
      item = item.replace(logDate,moment(logDate).format('YYYY/MM/DD HH:mm:ss'));
    }
    return (
      <div className='stageBuildLogDetail' key={ 'stageBuildLogDetail' + index }>
        <span><span dangerouslySetInnerHTML={{__html:item}}></span></span>
      </div>
    )
  });
  return showLogs;
}


class TenxFlowStageBuildLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: [],
      modalSize: 'normal',
      logs: '',
      needReconnect: false,
      TenxFlowStageBuildLog: `TenxFlowStageBuildLog${genRandomString('qwertyuioplkjhgfdsazxcvbnmABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)}`,
      tenxFlowLog: `tenxFlowLog${genRandomString('qwertyuioplkjhgfdsazxcvbnmABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)}`
    }
  }
  componentWillMount() {
    const { status, buildId, stageId } = this.props.logInfo
    const _this = this;
    const { flowId, loginUser } = this.props
    const cicdApi = loginUser.info.cicdApi
    let { protocol,host,logPath } = cicdApi
    if(!protocol) protocol = 'http'
    if(protocol == 'http') protocol = 'ws'
    else protocol = 'wss'
    if(status == 2) {
      this.setState({
        websocket: new WebSocket(protocol + '://' + host + logPath),
      },function(){
        _this.onSetup(this.state.websocket);
      })
    }
    this.setState({
      status: status
    })
  }
  componentWillReceiveProps(nextProps){
    let { isFetching } = this.props;
    if (!nextProps.isFetching && isFetching != nextProps.isFetching ) {
      if (nextProps.logs) {
        const { TenxFlowStageBuildLog } = this.state
        let id = TenxFlowStageBuildLog.toString()
        setTimeout(() => {
          if (document.getElementById(id)) {
            $(`#${id}`).scrollTop($(`#${id}`).height())
          }
        }, 300)
      }
    }
    // if (!nextProps.visible && nextProps.visible != this.props.visible) {
    //   if (this.state.socket) {
    //     // this.state.socket.emit("stop_recevie_log")
    //   }
    // }
    // if(nextProps.updateWebSocket) {
    //   this.props.setUpdateWebSocket()
    //   // this.reconnectSocket() // 姚伟 注释
    // }
  }
  reconnectSocket(){
    if (this.state.socket) {
      const socket = this.state.socket
      socket.disconnect()
      socket.connect()
      $(`#${this.state.tenxFlowLog}`).html('')
      const logInfo = this.props.logInfo
      socket.emit("ciLogs", { flowId: this.props.flowId, stageId: logInfo.stageId, stageBuildId: logInfo.buildId })
      this.setState({
        needReconnect: false
      })
    }
  }
  onSetup(socket) {
    const { scope } = this.props
    const logInfo = this.props.logInfo
    const callback = this.props.callback
    const self = this
    const tenxFlowStageBuildLog = this.state.TenxFlowStageBuildLog
    const tenxFlowLog = this.state.tenxFlowLog
    let notification = new NotificationHandler()
    
    this.setState({
      socket: socket
    })
    socket.onopen = function(){
      socket.send(JSON.stringify({flowId: self.props.flowId, stageId: logInfo.stageId, stageBuildId: logInfo.buildId}));
    }
    socket.onmessage = function (data) {
      data = data.data
      if(data.indexOf('获取日志失败')!=-1){
        scope.setState({
          TenxFlowDeployLogModal: false
        })
        notification.warn('获取日志失败，请稍后重试！！！')
        return false;
      }
      const logDate = data.substring(data.indexOf('[')+1,data.indexOf(']'))
      if(moment(logDate).format('YYYY/MM/DD HH:mm:ss')!="Invalid date"){
        data = data.replace(logDate,moment(logDate).format('YYYY/MM/DD HH:mm:ss'));
      }
      
      if(!data) return
      console.log(data.indexOf('&amp;gt;&amp;gt;'),'---------logssss')
      
      if(data.indexOf('&amp;gt;&amp;gt;')!=-1){
        data = data.replace('&amp;gt;&amp;gt;','>>')
      }else if(data.indexOf('&amp;gt;')!=-1){
        data = data.replace('&amp;gt;','>')
      }
      // let newLog = data.split('\n')
      // newLog.forEach((item) => {
        $(`#${tenxFlowLog}`).append("<div class='stageBuildLogDetail'>\
        <span><span>"+data+"</span></span>\
        </div>")
      // })
      let height = $(`#${tenxFlowStageBuildLog} .infoBox`).css('height')
      $(`#${tenxFlowStageBuildLog}`).animate({
        scrollTop: height + 'px'
      }, 0)
    }
    socket.onclose = function(data) {
      if(self.props.index != 0 && !self.props.index) return
      self.props.changeCiFlowStatus(self.props.index, data.state, self.state.logs)
      if(callback) {
      //  setTimeout(function(){
        callback(data)
      //  },5000) 
      }
    }
  } 
  render() {
    const scope = this;
    let { logs, isFetching } = this.props;
    if(this.props.visible === false) {
      return <div></div>
    }
    if(isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if(this.state.status === 3) {
      return (
        <div className='loadingBox'>
          <span>等待执行中</span>
        </div>
      )
    }
    if(!Boolean(logs) && !this.state.websocket) {
      return (
        <div className='loadingBox'>
          <span>暂无日志</span>
        </div>
      )
    }
    return (
      <div id={this.state.TenxFlowStageBuildLog} className="TenxFlowStageBuildLog">
        <div className='infoBox' id={this.state.tenxFlowLog}>
          {logs ? formatLog(logs) : ''}
          {/* {this.state.websocket} */}
          <div style={{ clear: 'both' }}></div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return {
    loginUser: state.entities.loginUser
  }
}

TenxFlowStageBuildLog.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  changeCiFlowStatus
})(injectIntl(TenxFlowStageBuildLog, {
  withRef: true,
}));

