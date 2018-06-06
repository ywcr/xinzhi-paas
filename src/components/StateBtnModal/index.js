/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/29
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Alert, Icon, Spin, Table, Checkbox } from 'antd'
import './style/StateBtnModal.less'

export default class StateBtnModal extends Component{
  constructor(props){
    super(props)
    this.handlecallback = this.handlecallback.bind(this)
    this.handleWarningTemplate = this.handleWarningTemplate.bind(this)
    this.state = {
      checkedvalue: true,
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.settingList !== this.props.settingList){
      this.setState({
        checkedvalue: true
      })
    }
  }
  getDeleteMessage() {
    const { state, appList, cdRule, serviceList } = this.props
    if(state != 'Delete') return ''
    let rule = []
    const appRule = {}
    if(appList) {
      rule = cdRule.result.results
      if(rule){
        rule.forEach(item => {
          if(appRule[item.appname]) appRule[item.appname].push(item.service.bindingDeploymentName)
          else {
            appRule[item.appname] = []
            appRule[item.appname].push(item.service.bindingDeploymentName)
          }
        })
      }
      const checkList = appList.filter(item => item.checked)
      const keys = Object.getOwnPropertyNames(appRule)
      if (checkList.length == 0 || keys.length <= 0) return ''
      const dataSource = []
      checkList.forEach((app, index) => {
        if(app.services) {
          app.services.forEach((service, i) => {
            const obj = {
              key: index.toString() + i.toString(),
              appname: app.name,
              servicename: service.metadata.name
            }
            const ruleService = appRule[app.name]
            if(!ruleService) {
              obj.cdrule = 0
              dataSource.push(obj)
              return
            }
            if(ruleService.indexOf(service.metadata.name) >= 0) {
              obj.cdrule = 1
              dataSource.push(obj)
              return
            }
            obj.cdrule = 0
            dataSource.push(obj)
            return
          })
        }
      })

      const columns = [{
        title: '应用名称',
        dataIndex: 'appname',
        key: 'appname',
      }, {
        title: '服务名称',
        dataIndex: 'servicename',
        key: 'servicename',
      }, {
        title: '自动部署',
        dataIndex: 'cdrule',
        key: 'cdrule',
        render: (text, record, index) => {
          if(text == '1') return <Icon style={{color: 'green', fontSize: '15px'}} type="check-circle" />
          return '未设置'
        }
      }];

      return <div className="confirm"><Table pagination={false}  style={{marginBottom: '20px'}} dataSource={dataSource} columns={columns} />
           <span style={{color: 'red' }}>注意：删除已设置自动部署的应用或服务，将自动删除其对应的自动部署规则</span></div>
      const messages = keys.map(key => {
        return <div>{`应用${key}中, 服务${appRule[key].join(',')}已设置自动部署`}</div>
      })
      if(messages.length > 0) {
        messages.push(<div>删除应用后，将自动删除对应对应自动部署规则</div>)
      }
      return messages
    } else {
      const checkList = serviceList.filter(item => item.checked)
      rule = [];
      if(cdRule.result.results){
        rule = cdRule.result.results.map(item => {
          return item.bindingDeploymentName
        })
      }
      if(checkList.length <=0 || rule.length <= 0) return ''
      const dataSource =[]
      checkList.forEach(service => {
        const serviceName = service.metadata.name
        var obj = {
          key: serviceName,
          servicename: serviceName,
          cdrule: 0
        }
        if(rule.indexOf(serviceName) >= 0) {
          obj.cdrule = 1
        }
        dataSource.push(obj)
      })
      const columns = [{
        title: '服务名称',
        dataIndex: 'servicename',
        key: 'servicename',
      }, {
        title: '自动部署',
        dataIndex: 'cdrule',
        key: 'cdrule',
        render: (text, record, index) => {
          if(text == '1') return <Icon style={{color: 'green', fontSize: '15px'}} type="check-circle" />
            return '未设置'
        }
      }];
      return <div className="confirm"><Table pagination={false}  style={{marginBottom: '20px'}} dataSource={dataSource} columns={columns} />
        <span style={{color: 'red' }}>注意：删除已设置自动部署的应用或服务，将自动删除其对应的自动部署规则</span></div>
    }
  }
  handlecallback(){
    const { callback } = this.props
    this.setState({
      checkedvalue: !this.state.checkedvalue
    })
    let body = {
      checkedvalue: !this.state.checkedvalue
    }
    callback(body)
  }
  handleWarningTemplate(){
    const { settingList } = this.props
    if(settingList && settingList.result && settingList.result.length){
      return <div className='checkBox'><Checkbox checked={this.state.checkedvalue} onChange={this.handlecallback}>同时删除关联的告警策略?</Checkbox></div>
    }
    return <span></span>
  }
  render(){
    const { state, appList, serviceList, scope, cdRule } = this.props
    let rule = []
    const appRule = {}
    if(state == 'Delete') {
      if(cdRule.isFetching) {
        return <div className="loadingBox"><Spin size="large"></Spin></div>
      }
    }
    let alertText = ''
    let tip = ''
    let tbInf = ''
    let opt = ''
    let stateText = ''
    switch (state) {
      case 'Running' :
        alertText = '已经是运行中状态, 不需再启动'
        tip = '运行中状态的应用不需再次启动'
        tbInf = '为运行中状态'
        opt = '启动'
        stateText = '已停止'
        break
      case 'Stopped' :
        alertText = '已经是已停止状态, 不需再停止'
        tip = '已停止状态的应用不需再次停止'
        tbInf = '为已停止状态'
        opt = '停止'
        stateText = '运行中'
        break
      case 'Restart' :
        alertText = '是已停止状态, 不能做重新部署'
        tip = '运行状态时应用才可以重新部署'
        tbInf = '为已停止状态'
        opt = '重新部署'
        stateText = '可以重新部署'
        break
      case 'QuickRestar' :
        alertText = '是已停止状态, 不能快速重启'
        tip = '运行状态时服务才可以快速重启'
        tbInf = '为已停止状态'
        opt = '快速重启'
        stateText = '可以快速重启'
        break
      case 'Delete' :
        opt = '删除'
        stateText = '可以删除'
        break
      default :
        alertText = ''
        tip = ''
        tbInf = ''
        opt = ''
        stateText = ''
        break
    }
    let checkedList = appList?appList.filter((app) => app.checked):serviceList.filter((service) => service.checked)
    let disableArr = []
    let checkedState
    switch (state) {
      case 'Running':
        checkedState = state
        break;
      case 'Restart':
        checkedState = 'Stopped'
        break;
      case 'QuickRestar':
        checkedState = 'Stopped'
        break;
      case 'Stopped':
        checkedState = 'Stopped'
        break;
      default:
        checkedState = state
        break;
    }
    if (scope) {
      if (scope.state.currentShowInstance && !scope.state.donotUserCurrentShowInstance) {
        checkedList = [scope.state.currentShowInstance]
      }
    }
    checkedList.map((item, index) => {
      if (item.status.phase === checkedState) {
        disableArr.push(item)
      }
    })
    let disableItem = disableArr.map((item, index) => {
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{appList?item.name:item.metadata.name}</td>
          <td style={{ color: '#f85958' }}>{appList?'应用':'服务'}{ tbInf }</td>
        </tr>
      )
    })
    return (
      <div id="StateBtnModal">
        {
          disableArr.length !== 0 ?
            <div>
              <Alert message={
                <span>你选择的{checkedList.length}个{appList?'应用':'服务'}中, 有
                  <span className="modalDot" style={{ backgroundColor: '#f85958' }}>{disableArr.length}个</span>
                  { alertText }
                </span>
              } type="warning" showIcon />
              <div style={{ height: 26 }}>Tip: { tip }</div>
              <div className="tableWarp">
                <table className="modalList">
                  <tbody>
                  {disableItem}
                  </tbody>
                </table>
              </div>
            </div> :
            <div></div>
        }
      {this.getDeleteMessage()}
        <div className="confirm">
          <Icon type="question-circle-o" style={{ marginRight: '10px' }} />
          您是否确定{opt}这{(checkedList.length - disableArr.length)}个{stateText}的{appList?'应用':'服务'} ?
          <div>{this.handleWarningTemplate()}</div>
        </div>
      </div>
    )
  }
}
