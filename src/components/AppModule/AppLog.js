/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppLog component
 *
 * v0.1 - 2016-09-11
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Checkbox, Dropdown, Button, Card, Menu, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppLog.less"
import { appLogs } from '../../actions/app_manage'

function formatOperation(opera) {
  //this function for format opera
  switch(opera) {
    case 'create app':
      return (<span>创建应用</span>)
      break;
    case 'modify app':
      return (<span>修改应用</span>)
      break;
    case 'add service':
      return (<span>创建服务</span>)
      break;
    case 'delete service':
      return (<span>删除服务</span>)
      break;
    case 'stop app':
      return (<span>停止应用</span>)
      break;
    case 'start app':
      return (<span>启动应用</span>)
      break;
    case 'restart app':
      return (<span>重启应用</span>)
      break;
    case 'delete app':
      return (<span>删除应用</span>)
      break;
    case 'redeploy service':
      return (<span>重新部署服务</span>)
    case 'stop service':
      return (<span>停止服务</span>)
    case 'start service':
      return (<span>启动服务</span>)
  }
}

function formatResult(result) {
  //this function for format result
  switch(result) {
    case 'success':
      return (<span>成功</span>);
      break;
    case 'fail':
      return (<span>失败</span>)
  }
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    this.props.getAppLogs(this.props.cluster, this.props.appName)
  },
  onchange: function () {

  },
  getDetailMsg: function (item) {
    let msg = ''
    // 2: create service, 3: delete service, 8: stop service, 9: start service, 10: restart service
    if (item.operationCode === 2 || item.operationCode === 3
      || item.operationCode === 8 || item.operationCode === 9 || item.operationCode === 10) {
      msg = ` - ${item.detail}`
    }
    return msg
  },
  render: function () {
    if(!this.props.appLogs || !this.props.appLogs.result || this.props.appLogs.result.data <= 0 ) {
      return  <div className="logDetail"></div>
    }
    const logs = this.props.appLogs.result.data
    const items = logs.map((item, index) => {
      return (
        <div className="logDetail" key={index}>
          <div className="iconBox">
            <div className="line"></div>
            <div className={item.result === 'success' ? "icon fa fa-check-circle success" : "icon fa fa-times-circle fail"}>
            </div>
          </div>
          <div className="infoBox">
            <div className={item.result === 'success' ? "status success" : "status fail"}>
              {formatOperation(item.operation)}{formatResult(item.result)}
            </div>
            <div className="message">
              &nbsp;{ this.getDetailMsg(item)}
            </div>
            <div className="createTime">
              {item.time}
            </div>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <div className="logBox">
        {items}
      </div>
    );
  }
});
function mapStateToProp(state) {
  return {
    appLogs: state.apps.appLogs
  }
}
MyComponent = connect(mapStateToProp, {
  getAppLogs: appLogs
})(MyComponent)

export default class AppLog extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="AppLog">
        <MyComponent  cluster={this.props.cluster} appName={this.props.appName} />
      </div>
    )
  }
}

AppLog.propTypes = {
  //
}
