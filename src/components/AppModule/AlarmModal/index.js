/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Create Alarm component
 *
 * v0.1 - 2017-3-20
 * @author BaiYu
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Radio, Input, InputNumber, Form, Select, Icon, Button, Modal, Spin, Row, Col } from 'antd'
import './style/AlarmModal.less'
import { loadAppList } from '../../../actions/app_manage'
import { loadServiceList } from '../../../actions/services'
import { getAllClusterNodes } from '../../../actions/cluster_node'
import { loadNotifyGroups, addAlertSetting, updateAlertSetting, getAlertSetting, getAlertSettingExistence } from '../../../actions/alert'
import { ADMIN_ROLE } from '../../../../constants'
import NotificationHandler from '../../../common/notification_handler'

const Option = Select.Option
const RadioGroup = Radio.Group
let isUseing = false

let FistStop = React.createClass({
  getInitialState() {
    return {
      checkName: null
    }
  },
  componentWillMount() {
    const { loadAppList, appList, cluster, isFetchingApp, clusterNode, getAllClusterNodes, setParentState, loginUser, funcs } = this.props
    if (!appList || appList.length == 0) {
      loadAppList(cluster.clusterID)
    }
    if ((!clusterNode || clusterNode.length == 0) && loginUser.info.role == ADMIN_ROLE) {
      getAllClusterNodes(cluster.clusterID)
    }
    setParentState({
      firstForm: this.props.form
    })
  },
  componentWillReceiveProps(nextProps) {
    const { isShow, loadAppList, cluster, getAllClusterNodes, loginUser } = nextProps
    if (!this.props.isShow && isShow) {
      loadAppList(cluster.clusterID)
    } else if (!this.props.isShow && isShow && loginUser.info.role == ADMIN_ROLE) {
      loadAppList(cluster.clusterID)
      getAllClusterNodes(cluster.clusterID)
    }
  },
  componentDidMount() {
    const { resetFields } = this.props
    setTimeout(resetFields, 0)
  },
  fistStopName(rule, value, callback) {
    let newValue = value.trim()
    if (!Boolean(newValue)) {
      callback(new Error('请输入名称'));
      return
    }
    if (newValue.length < 3 || newValue.length > 40) {
      callback(new Error('请输入3~40位字符'))
      return
    }
    const { cluster, isEdit, data } = this.props
    if (isEdit && newValue == data.strategyName) {
      return callback()
    }
    this.setState({ checkName: 'validating' })
    this.props.getAlertSettingExistence(cluster.clusterID, newValue, {
      success: {
        func: (res) => {
          if (res.data[newValue]) {
            this.setState({ checkName: 'error' })
            callback('策略名称重复')
            return
          }
          this.setState({ checkName: 'success' })
          callback()
        }
      },
      failed: {
        func: () => {
          this.setState({ checkName: 'warning' })
          callback('服务异常，请稍后重试')
        }
      }
    })
  },
  fistStopType(rule, value, callback) {
    if (!Boolean(value)) {
      callback(new Error('请选择类型'));
      return
    }
    callback()
  },
  fistStopApply(rule, value, callback) {
    if (!Boolean(value)) {
      const { getFieldValue } = this.props.form
      if (getFieldValue('type') == 'node') {
        return callback(new Error('请选择节点'));
      }
      return callback(new Error('请选择应用'))
    }
    callback()
  },
  fistStopServer(rule, value, callback) {
    if (!Boolean(value)) {
      callback(new Error('请选择服务'));
      return
    }
    callback()
  },
  firstForm() {
    const { funcs, form, setParentState } = this.props
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      const { getFieldValue } = form
      setParentState({
        name: getFieldValue('name'),
        type: getFieldValue('type'),
        apply: getFieldValue('apply'),
        server: getFieldValue('server'),
        interval: getFieldValue('interval')
      })
      funcs.nextStep(2) // go step 2
    })
  },
  getAppOrNodeList() {
    const { isFetchingApp, isFetchingClusterNode, clusterNode, appList, form } = this.props
    const { getFieldValue, resetFields } = form
    const isNode = getFieldValue('type') == 'node'
    if (isNode) {
      if (isFetchingClusterNode) {
        return (<div key="loading" className='loadingBox'><Spin size='large'></Spin></div>)
      }
      if (!clusterNode || !clusterNode.nodes || !clusterNode.nodes.clusters || clusterNode.nodes.clusters.nodes.nodes.length == 0) {
        return <div key="null"></div>
      }
      return clusterNode.nodes.clusters.nodes.nodes.map(item => {
        return <Option key={item.objectMeta.name} value={item.objectMeta.name}>{`${item.objectMeta.name} | ${item.address}`}</Option>
      })
    } else {
      if (isFetchingApp) {
        return (<div key="loading" className='loadingBox'><Spin size='large'></Spin></div>)
      }
      return appList.map(item => {
        return <Option value={item.name} key={item.name}>{item.name}</Option>
      })
    }
  },
  getServiceList() {
    const { serviceList, loadServiceList, cluster, form } = this.props
    const { getFieldValue } = form
    if (getFieldValue('type') == 'node') return <div key="null"></div>
    const appName = getFieldValue('apply')
    if (!appName) return (<Option key="null"></Option>)
    if (!serviceList[appName]) {
      setTimeout(() => loadServiceList(cluster.clusterID, appName), 0)
      return (<div key="loading" className='loadingBox'><Spin size='large'></Spin></div>)
    }
    if (serviceList[appName].isFetcing) {
      return (<div key='loading' className='loadingBox'><Spin size='large'></Spin></div>)
    }
    const list = serviceList[appName].serviceList
    if (!list || list.legnth == 0) return [<Option key="null"></Option>]
    return list.map(service => {
      return <Option key={service.metadata.name} value={service.metadata.name}>{service.metadata.name}</Option>
    })
  },
  resetService() {
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      server: undefined
    })
  },
  resetType() {
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      apply: undefined,
      server: undefined
    })
  },
  getTargetType() {
    const { loginUser } = this.props
    if (loginUser.info.role == ADMIN_ROLE) {
      return [<Option value="node" key="node">节点</Option>,
      <Option value="service" key="service">服务</Option>]
    }
    return <Option value="service" key="service">服务</Option>
  },
  render: function () {
    const { getFieldProps, getFieldValue, setFieldsValue } = this.props.form;
    const { funcs, currentApp, currentService, data, isEdit, loginUser, clusterNode } = this.props

    const { clusterName } = this.props.cluster
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    };
    const ItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 20 }
    };
    let nameProps
    let typeProps
    let applyProps
    let serverProps
    let repeatInterval
    let isNode
    if (isEdit) {
      nameProps = getFieldProps('name', {
        rules: [
          { validator: this.fistStopName }
        ],
        initialValue: data.strategyName
      });
      typeProps = getFieldProps('type', {
        rules: [
          { whitespace: true },
          { validator: this.fistStopType }
        ],
        onChange: this.resetType,
        initialValue: data.targetType == 1 && loginUser.info.role == ADMIN_ROLE ? 'node' : 'service'
      });
      isNode = data.targetType
      applyProps = getFieldProps('apply', {
        rules: [
          { whitespace: true },
          { validator: this.fistStopApply }
        ],
        onChange: this.resetService,
        initialValue: isNode ? data.targetName : data.appName
      })
      serverProps = getFieldProps('server', {
        rules: [
          { whitespace: true },
          { validator: isNode ? '' : this.fistStopServer }
        ],
        initialValue: data.targetName
      });
      repeatInterval = getFieldProps('interval', {
        rules: [
          { require: true },
          { whitespace: true },
          { message: '请选择监控周期' }
        ],
        initialValue: data.repeatInterval.toString()
      })
    } else {
      nameProps = getFieldProps('name', {
        rules: [
          { validator: this.fistStopName }
        ],
        initialValue: currentService ? currentService.metadata.name : ''
      });
      let initiaValue = 'node'
      if (currentService || currentApp) {
        initiaValue = 'service'
      }
      typeProps = getFieldProps('type', {
        rules: [
          { whitespace: true },
          { validator: this.fistStopType }
        ],
        onChange: this.resetType,
        initialValue: loginUser.info.role == ADMIN_ROLE ? initiaValue : 'service'
      });
      let initAppName
      let initService
      if (currentApp) {
        initService = currentApp.services[0].metadata.name
        initAppName = currentApp.name
      }
      if (currentService) {
        initService = currentService.metadata.name
        initAppName = currentService.metadata.labels['tenxcloud.com/appName']
      }
      applyProps = getFieldProps('apply', {
        rules: [
          { whitespace: true },
          { validator: this.fistStopApply }
        ],
        onChange: this.resetService,
        // initialValue: initAppName
        initialValue: funcs.scope.props.nodeName ? funcs.scope.props.nodeName : initAppName
      })
      isNode = getFieldValue('type') == 'node'
      serverProps = getFieldProps('server', {
        rules: [
          { whitespace: true },
          { validator: isNode ? '' : this.fistStopServer }
        ],
        initialValue: initService
      });
      repeatInterval = getFieldProps('interval', {
        rules: [
          { require: true },
          { whitespace: true },
          { message: '请选择监控周期' }
        ],
        initialValue: '300'
      })
    }

    return (
      <Form className="paramsSetting">
        <Form.Item label="名称" {...ItemLayout} validateStatus={this.state.checkName} hasFeedback>
          <Input {...nameProps} placeholder="请输入名称" />
        </Form.Item>
        <Row>
          <Col span="12">
            <Form.Item label="类型" {...formItemLayout}>
              <Select placeholder="请选择类型" {...typeProps} disabled={currentApp || currentService}>
                {this.getTargetType()}

              </Select>
            </Form.Item>
          </Col>
          <Col span="12">
            {clusterName == 'huawei' ? 
            <Form.Item label="监控周期" {...formItemLayout} >
              <Select {...repeatInterval}>
                <Option value="300">5分钟</Option>
              </Select>
            </Form.Item> :
              <Form.Item label="监控周期" {...formItemLayout} >
                <Select {...repeatInterval}>
                  <Option value="300">5分钟</Option>
                  <Option value="1800">30分钟</Option>
                  <Option value="3600">一小时</Option>
                </Select>
              </Form.Item>
            }


          </Col>
        </Row>
        <Form.Item label="监控对象" {...ItemLayout}>
          <Select placeholder={isNode ? '请选择节点' : '请选择应用'} {...applyProps} >
            {this.getAppOrNodeList()}
          </Select>
        </Form.Item>

        {!isNode ?
          <Form.Item label="监控服务" {...ItemLayout}>
            <Select placeholder="请选择服务" {...serverProps} >
              {this.getServiceList()}
            </Select>
          </Form.Item>
          : null
        }

        <div className="wrapFooter">
          <Button size="large" onClick={() => funcs.cancelModal()}>取消</Button>
          <Button size="large" onClick={() => this.firstForm()} type="primary">下一步</Button>
        </div>
      </Form>
    )
  }
})

function mapStateToProp(state, prop) {
  const defaultAppList = []
  const defaultServiceList = {}
  const defaultClusterNode = []
  const { cluster } = state.entities.current
  let appList = state.apps.appItems
  let serviceList = state.services.serviceItems
  let clusterNode = state.cluster_nodes.getAllClusterNodes
  let isFetchingClusterNode = false
  let isFetchingApp = false
  if (!appList || !appList[cluster.clusterID]) {
    appList = defaultAppList
  } else {
    isFetchingApp = appList[cluster.clusterID].isFetching
    appList = appList[cluster.clusterID].appList
  }
  if (!serviceList || !serviceList[cluster.clusterID]) {
    serviceList = defaultServiceList
  } else {
    serviceList = serviceList[cluster.clusterID]
  }
  if (!clusterNode || !clusterNode[cluster.clusterID]) {
    clusterNode = defaultClusterNode
  } else {
    isFetchingClusterNode = clusterNode.isFetching
    clusterNode = clusterNode[cluster.clusterID]
  }
  const { loginUser } = state.entities
  return {
    isFetchingApp,
    isFetchingClusterNode,
    appList,
    serviceList,
    clusterNode,
    cluster,
    loginUser
  }
}

FistStop = connect(mapStateToProp, {
  loadServiceList,
  loadAppList,
  getAllClusterNodes,
  getAlertSettingExistence,
})(Form.create()(FistStop))

// two step in cpu add rule
let uuid = 0;

let TwoStop = React.createClass({
  getInitialState() {
    return {
      // newselectCpu: 1,
      typeProps_0: ['%'],
      haveRepeat: false
    }
  },
  componentWillMount() {
    const { setParentState, data } = this.props
    setParentState({
      secondForm: this.props.form
    })
    data.forEach((item, index) => {
      this.setState({ [`typeProps_${index}`]: this.switchSymbol(item.type) })
    })
    this.setState({
      firstMount: true
    })
  },
  componentDidMount() {
    const { resetFields } = this.props
    setTimeout(resetFields, 0)

  },
  componentWillReceiveProps(nextProps) {
    if (this.state.firstMount || (nextProps.isShow && nextProps.isShow != this.props.isShow)) {
      const { data } = nextProps
      if (data && data.length > 0) {
        this.setState({
          firstMount: false
        })
      }
      const { isEdit } = nextProps
      if (isEdit) {
        data.forEach((item, index) => {
          this.setState({ [`typeProps_${index}`]: this.switchSymbol(item.type) })
        })
      }
    }
  },
  removeRule(k) {
    const { form } = this.props;
    let cpu = form.getFieldValue('cpu');
    if (cpu.length == 1) {
      new NotificationHandler().info('至少得有一项规则')
      return
    }
    // can use data-binding to get
    cpu = cpu.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      cpu,
    });
    let keyArr = []
    cpu.forEach(item => {
      if (item == k) return
      keyArr = keyArr.concat([`used_data@${item}`, `used_rule@${item}`, `used_name@${item}`])
    })
    form.validateFields(keyArr, { force: true, first: false, firstFields: false }, (err) => {
      if (!err) {
        this.setState({
          needClearError: false
        })
      }
    })
    // this.setState({
    //   newselectCpu: 0
    // })
  },
  addRule() {
    const _this = this
    const { form } = this.props;
    isUseing = true
    //if(this.state.haveRepeat) return
    form.validateFields((error, values) => {
      isUseing = false
      if (!!error) {
        return
      }
      uuid++;

      // can use data-binding to get
      let cpu = form.getFieldValue('cpu');
      let typeProps = `typeProps_${uuid}`
      _this.setState({ [typeProps]: '%' })
      cpu = cpu.concat(uuid);
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        cpu,
      });
    })
    //
    // if (this.state.newselectCpu) return
    // this.setState({
    //   newselectCpu: 1
    // })
  },
  hnadRule() {
    // nextStep
    const { form, funcs, setParentState } = this.props;
    if (this.state.haveRepeat) return
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      const { getFieldValue } = form
      const cpu = form.getFieldValue('cpu');
      const stateObj = {}
      function tool(key) {
        stateObj[key] = getFieldValue(key)
      }
      cpu.forEach(index => {
        let key = `used_data@${index}`
        tool(key)
        key = `used_name@${index}`
        tool(key)
        key = `used_symbol@${index}`
        tool(key)
        key = `used_rule@${index}`
        tool(key)
        setParentState({
          [`typeProps_${index}`]: this.state[`typeProps_${index}`]
        })
      })
      setParentState(stateObj)
      setParentState({
        keyCount: cpu
      })
      funcs.nextStep(3)
    })
  },
  changeType(key, type) {
    let typeProps = `typeProps_${key}`
    if (type == 'network/rx_rate' || type == 'network/tx_rate') {
      this.setState({ [typeProps]: 'KB/s' })
      return
    }
    if (type == 'memory/usage') {
      this.setState({ [typeProps]: 'MB' })
      return
    }
    this.setState({ [typeProps]: '%' })
  },
  usedRule(rule, value, callback, key) {
    if (!value) return callback('请选择运算符')
    this.valieAllField(key, 'used_rule')
    if (this.validateIsRepeat(key, value, `used_rule@${key}`)) {
      return callback('告警设置填写重复')
    } else {
      setTimeout(() => this.clearError(key), 0)
      return callback()
    }
  },
  usedName(rule, value, callback, key) {
    if (!value) return callback('请选择类型')
    this.valieAllField(key, 'used_name')
    if (this.validateIsRepeat(key, value, `used_name@${key}`)) {
      return callback('告警设置填写重复')
    } else {
      setTimeout(() => this.clearError(key), 0)
      return callback()
    }
  },
  usedData(rule, value, callback, key) {
    if (!value) return callback('请填写数值')
    if (parseInt(value) <= 0) return callback('此数值需大于1')
    this.valieAllField(key, 'used_data')
    return callback()
    // if (this.validateIsRepeat(key, value, `used_data@${key}`)) {
    //   return callback('告警设置填写重复')
    // } else {
    //   setTimeout(() => this.clearError(key), 0)
    //   return callback()
    // }
  },
  clearError(key) {
    const { form } = this.props
    if (!this.state.needClearError) return
    const { setFields, getFieldValue } = form
    setFields({
      [`used_data@${key}`]: {
        errors: null,
        value: getFieldValue(`used_data@${key}`)
      },
      [`used_rule@${key}`]: {
        errors: null,
        value: getFieldValue(`used_rule@${key}`)
      },
      [`used_name@${key}`]: {
        errors: null,
        value: getFieldValue(`used_name@${key}`)
      }
    })
  },
  valieAllField(key, name) {
    if (isUseing) return
    isUseing = true
    const { form } = this.props;
    const { getFieldValue } = form
    const keyCount = getFieldValue('cpu')
    let keyArr = []
    let obj = {}
    keyCount.forEach(item => {
      if (item == key) return
      keyArr = keyArr.concat([`used_data@${item}`, `used_rule@${item}`, `used_name@${item}`])
    })
    if (name) {
      keyArr = keyArr.concat([`used_rule@${key}`, `used_data@${key}`, `used_name@${key}`].filter(item => {
        return item !== `${name}@${key}`
      }))
    }
    form.validateFields(keyArr, { force: true, first: false, firstFields: false }, function (err, value) {
      isUseing = false
    })
  },
  validateIsRepeat(key, value, field) {
    const { form } = this.props
    const { getFieldsValue, getFieldValue } = form
    const keyCount = getFieldValue('cpu')
    let newValue = getFieldsValue([`used_rule@${key}`, `used_name@${key}`])
    newValue = this.getObjValueArr(newValue)
    newValue.push(value)
    if (keyCount && keyCount.length > 0) {
      const result = keyCount.some(item => {
        if (item == key) return false
        let existValue = getFieldsValue([`used_rule@${item}`, `used_name@${item}`])
        existValue = this.getObjValueArr(existValue)
        return existValue.every(v => {
          return newValue.indexOf(v) >= 0
        })
      })
      if (result == this.state.haveRepeat) {
        this.setState({
          needClearError: false
        })
      } else {
        this.setState({
          needClearError: true
        })
      }
      this.setState({
        haveRepeat: result
      })
      return result
    }
  },
  getObjValueArr(obj) {
    const keyArr = Object.getOwnPropertyNames(obj)
    return keyArr.map(key => {
      return obj[key]
    })
  },
  switchType(type) {
    type = type.trim()
    switch (type) {
      case 'CPU利用率':
        return 'cpu/usage_rate'
      case '内存使用率':
        return 'memory/usage'
      case '上传流量':
        return 'network/tx_rate'
      case '下载流量':
        return 'network/rx_rate'
      default:
        return 'cpu/usage_rate'
    }
  },
  switchSymbol(type) {
    type = type.trim()
    switch (type) {
      case 'CPU利用率':
        return '%'
      case '内存使用率':
        return 'MB'
      case '上传流量':
        return 'kb/s'
      case '下载流量':
        return 'kb/s'
      default:
        return '%'
    }
  },
  calculateValue(type, threshold) {
    threshold = threshold.toLowerCase()
    type = type.trim()
    switch (type) {
      case 'CPU利用率':
        return parseInt(threshold)
      case '内存使用率':
        if (threshold.indexOf('gb') > 0) {
          return (parseFloat(threshold) * 1024).toFixed(0)
        }
        if (threshold.indexOf('kb') > 0) {
          return (parseFloat(threshold) / 1024).toFixed(0)
        }
        if (threshold.indexOf('mb') > 0) {
          return (parseFloat(threshold)).toFixed(0)
        }
        return threshold
      case '上传流量': case '下载流量':
        if (threshold.indexOf('gb') > 0) {
          return (parseFloat(threshold) * 1024 * 1024).toFixed(0)
        }
        if (threshold.indexOf('mb') > 0) {
          return (parseFloat(threshold) * 1024).toFixed(0)
        }
        return parseInt(threshold)
      default:
        return 0
    }
  },
  render() {
    const { getFieldProps, getFieldValue } = this.props.form;
    const { funcs, data, isEdit } = this.props
    let cpuItems
    if (isEdit) {
      getFieldProps('cpu', {
        initialValue: data.map((item, index) => index),
      })
      cpuItems = getFieldValue('cpu').map((key) => {
        let value = data[key] || { type: '', threshold: '' }

        return (
          <div className="ruleItem" key={key}>
            <Form.Item>
              <Select {...getFieldProps(`used_name@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => this.usedName(rule, value, callback, key)
                }],
                initialValue: this.switchType(value.type),
                onChange: (type) => this.changeType(key, type)
              })} style={{ width: 135 }} >
                <Option value="cpu/usage_rate">CPU利用率</Option>
                <Option value="memory/usage">内存使用</Option>
                <Option value="network/tx_rate">上传流量</Option>
                <Option value="network/rx_rate">下载流量</Option>
              </Select>
            </Form.Item>
            <Form.Item >
              <Select {...getFieldProps(`used_rule@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => this.usedRule(rule, value, callback, key)
                }],
                initialValue: value.operation,
              })} style={{ width: 80 }}>
                <Option value=">"><i className="fa fa-angle-right" style={{ fontSize: 16, marginLeft: 5 }} /></Option>
                <Option value="<"><i className="fa fa-angle-left" style={{ fontSize: 16, marginLeft: 5 }} /></Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <InputNumber step={10} {...getFieldProps(`used_data@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => this.usedData(rule, value, callback, key)
                }],
                initialValue: this.calculateValue(value.type, value.threshold)
              })} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item>
              {/*<Select {...getFieldProps(`used_symbol@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择单位',
              }],
              initialValue: '%'
            }) } style={{ width: 80 }} >
              <Option value="%">%</Option>
              <Option value="KB/s">KB/s</Option>
            </Select>*/}
              <Input style={{ width: 80 }} disabled={true} value={this.state[`typeProps_${key}`]} />
            </Form.Item>
            <span className="rightBtns">
              <Button type="primary" onClick={this.addRule} size="large" icon="plus"></Button>
              <Button type="ghost" onClick={() => this.removeRule(key)} size="large" icon="cross"></Button>
            </span>
          </div>
        );
      });
    }
    else {
      getFieldProps('cpu', {
        initialValue: [0],
      });
      cpuItems = getFieldValue('cpu').map((key) => {
        return (
          <div className="ruleItem" key={key}>
            <Form.Item>
              <Select {...getFieldProps(`used_name@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => this.usedName(rule, value, callback, key)
                }],
                initialValue: 'cpu/usage_rate',
                onChange: (type) => this.changeType(key, type)
              })} style={{ width: 135 }} >
                <Option value="cpu/usage_rate">CPU利用率</Option>
                <Option value="memory/usage">内存使用</Option>
                <Option value="network/tx_rate">上传流量</Option>
                <Option value="network/rx_rate">下载流量</Option>
              </Select>
            </Form.Item>
            <span className='secondItem'>
              <Form.Item>
                <Select {...getFieldProps(`used_rule@${key}`, {
                  rules: [{
                    whitespace: true,
                    validator: (rule, value, callback) => this.usedRule(rule, value, callback, key)
                  }],
                  initialValue: '>'
                })} style={{ width: 80 }} >
                  <Option value=">"><i className="fa fa-angle-right" style={{ fontSize: 16, marginLeft: 5 }} /></Option>
                  <Option value="<"><i className="fa fa-angle-left" style={{ fontSize: 16, marginLeft: 5 }} /></Option>
                </Select>
              </Form.Item>
            </span>
            <Form.Item>
              <InputNumber step={10} {...getFieldProps(`used_data@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => this.usedData(rule, value, callback, key)
                }],
                initialValue: '80'
              })} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item>
              {/*<Select {...getFieldProps(`used_symbol@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择单位',
              }],
              initialValue: '%'
            }) } style={{ width: 80 }} >
              <Option value="%">%</Option>
              <Option value="KB/s">KB/s</Option>
            </Select>*/}
              <Input style={{ width: 80 }} disabled={true} value={this.state[`typeProps_${key}`]} />
            </Form.Item>
            <span className="rightBtns">
              <Button type="primary" onClick={this.addRule} size="large" icon="plus"></Button>
              <Button type="ghost" onClick={() => this.removeRule(key)} size="large" icon="cross"></Button>
            </span>
          </div>
        );
      });
    }


    return (
      <Form className="alarmRule" inline={true} form={this.props.form}>
        {/* ------------- cpu Item --------------*/}

        {cpuItems}

        <div className="alertRule">
          <Icon type="exclamation-circle-o" /><a> CPU利用率</a>= 所有容器实例占用CPU总和/CPU资源总量
          <div><a style={{ marginLeft: 16 }}>内存使用</a>= 所有容器实例占用内存总和/容器实例数量</div>
        </div>
        {/*  footer btn */}
        <div className="wrapFooter">
          <Button size="large" onClick={() => funcs.nextStep(1)} type="primary">上一步</Button>
          <Button size="large" onClick={() => this.hnadRule()} type="primary">下一步</Button>
        </div>
      </Form>
    )
  }
})

TwoStop = Form.create()(TwoStop)

class AlarmModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSendEmail: 1,
      createGroup: false, // create alarm group modal
      showAlramGroup: true,
    }
  }

  componentDidMount() {
    const { notifyGroup, loadNotifyGroups, isEdit, strategy, getAlertSetting, cluster } = this.props
    const clusterID = this.props.cluster.clusterID
    if (!notifyGroup.result) {
      loadNotifyGroups("", clusterID)
    }
    if (isEdit) {
      getAlertSetting(cluster.clusterID, {
        strategy: strategy.strategyID
      }, {
          success: {
            func: (res) => {
              uuid = res.data.length
            }
          }
        })
      this.setState({
        isSendEmail: strategy.sendEmail
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    const { form, loadNotifyGroups } = this.props
    if (!nextProps.isShow) {
      form.resetFields()
      this.state.firstForm.resetFields()
      this.state.secondForm.resetFields()
    }
    if (nextProps.current && nextProps.current.team.teamID != this.props.current.team.teamID) {
      loadNotifyGroups('', nextProps.cluster.clusterID)
    }
    if (nextProps.isShow && nextProps.isShow != this.props.isShow) {
      const { isEdit, strategy, getAlertSetting, cluster } = nextProps
      if (isEdit) {
        getAlertSetting(cluster.clusterID, {
          strategy: strategy.strategyID
        }, {
            success: {
              func: (res) => {
                uuid = res.data.length
              }
            }
          })
        this.setState({
          isSendEmail: strategy.sendEmail
        })
      }
    }
  }

  submitRule() {
    const { form, getSettingList, current } = this.props;
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      const specs = []
      const keyCount = this.state.keyCount
      Array.isArray(keyCount) && keyCount.forEach(item => {
        const obj = {
          metricType: this.state[`used_name@${item}`],
          value: parseInt(this.state[`used_data@${item}`]),
          operator: this.state[`used_rule@${item}`]
        }
        if (obj.metricType == 'network/rx_rate' || obj.metricType == 'network/tx_rate') {
          obj.value = obj.value * 1024
        } else if (obj.metricType == 'memory/usage') {
          obj.value = obj.value * 1024 * 1024
        } else {
          obj.value = obj.value * 100
        }
        obj.value = obj.value.toString()
        specs.push(obj)
      })
      let targetType = this.state.type
      let targetName = this.state.server
      let appName = this.state.apply
      if (targetType == 'service') {
        targetType = 0
      } else {
        targetType = 1
        appName = ''
        targetName = this.state.apply
      }
      const receiversGroup = form.getFieldValue('notify')
      const strategyName = this.state.name
      const repeatInterval = parseInt(this.state.interval)
      const cluster = this.props.cluster
      const notification = new NotificationHandler()
      const { isEdit, strategy } = this.props
      const requestBody = {
        targetType,
        targetName,
        specs,
        receiversGroup,
        strategyName,
        repeatInterval,
        appName,
        sendEmail: this.state.isSendEmail,
        enable: 1,
        disableNotifyEndTime: '0s',
        namespace: current.space.namespace
      }
      if (isEdit) {
        // Update action
        requestBody.strategyID = strategy.strategyID
        requestBody.enable = strategy.enable
        if (!this.state.isSendEmail) {
          delete requestBody.receiversGroup
        }
        notification.spin('告警策略更新中')
        this.props.updateAlertSetting(cluster.clusterID, requestBody, {
          success: {
            func: () => {
              notification.close()
              notification.success('告警策略更新成功')
              const { funcs } = this.props
              funcs.cancelModal()
              form.resetFields()
              this.state.firstForm.resetFields()
              this.state.secondForm.resetFields()
              if (funcs.callback) {
                funcs.callback()
                return
              }
              funcs.nextStep(1)
              if (getSettingList) {
                getSettingList()
              }
            },
            isAsync: true
          },
          failed: {
            func: (result) => {
              notification.close()
              let message = '告警策略更新失败'
              if (result.message.message) {
                message = result.message.message
              } else if (result.message) {
                message = result.message
              }
              notification.error(message)
            }
          }
        })
      } else {
        // Create action
        notification.spin('告警策略创建中')
        this.props.addAlertSetting(cluster.clusterID, requestBody, {
          success: {
            func: () => {
              notification.close()
              if (isEdit) {
                notification.success('告警策略更新成功')
              } else {
                notification.success('告警策略创建成功')
              }
              const { funcs } = this.props
              funcs.cancelModal()
              form.resetFields()
              this.state.firstForm.resetFields()
              this.state.secondForm.resetFields()
              funcs.nextStep(1)
              if (getSettingList) {
                getSettingList()
              }
            },
            isAsync: true
          },
          failed: {
            func: (result) => {
              notification.close()
              let message = '告警策略创建失败'
              if (isEdit) {
                message = '告警策略更新失败'
              }
              if (result.message.message) {
                message = result.message.message
              } else if (result.message) {
                message = result.message
              }
              notification.error(message)
            }
          }
        })
      }
    })
  }

  setParentState() {
    return (value) => {
      this.setState(value)
    }
  }
  getNotifyGroup() {
    const { notifyGroup } = this.props
    if (notifyGroup.isFetching) {
      return (<div className="loadingBox" key="loadingBox"><Spin size="large"></Spin></div>)
    }
    if (!notifyGroup.result || notifyGroup.result.data.length == 0) {
      return null
    }
    return notifyGroup.result.data.map(item => {
      console.log(item,'------item-----')
      return <Option key={item.groupID} value={item.groupID}>{item.name}</Option>
    })
  }
  loadNotifyGroups() {
    const { loadNotifyGroups } = this.props
    const clusterID = this.props.cluster.clusterID
    loadNotifyGroups("", clusterID)
  }
  notifyGroup(rule, value, callback) {
    if (!value) {
      return callback('请选择告警通知组')
    }
    return callback()
  }
  sendMail(e) {
    this.setState({
      isSendEmail: e.target.value,
    })
  }
  resetFields() {
    const { funcs, form } = this.props
    const { firstForm, secondForm } = this.state
    funcs.scope.setState({
      resetFields: () => {
        form.resetFields()
        secondForm.resetFields()
        firstForm.resetFields()
      }
    })
  }
  showAlramGroup() {
    const { funcs } = this.props

    funcs.scope.setState({ alarmModal: false, createGroup: true })
    // setTimeout(()=> {
    //   document.getElementById('groupName').focus()
    // },500)
  }
  render() {
    if (this.props.isFetching) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    }
    const { getFieldProps } = this.props.form
    const { strategy, isEdit } = this.props
    let initreceiver = ''
    if (strategy && isEdit) {
      // initreceiver = strategy.receiversGroup
    }
    let notify = getFieldProps('notify', {
      rules: [
        { whitespace: true },
        { validator: this.notifyGroup }
      ],
      // initialValue: initreceiver
    })
    if (this.state.isSendEmail) {
      notify = getFieldProps('notify', {
        rules: [
          { whitespace: true },
          { validator: this.notifyGroup }
        ],
        // initialValue: initreceiver
      })
    } else {
      notify = getFieldProps('notify', {
        // initialValue: initreceiver
      })
    }
    const { funcs } = this.props
    return (
      <div className="AlarmModal">
        <div className="topStep">
          <span className={funcs.scope.state.step >= 1 ? 'step active' : 'step'}><span className="number">1</span> 参数设置</span>
          <span className={funcs.scope.state.step > 1 ? 'step active' : 'step'}><span className="number">2</span> 告警规则</span>
          <span className={funcs.scope.state.step == 3 ? 'step active' : 'step'}><span className="number">3</span> 告警行为</span>
        </div>
        <div className="alarmContent">
          <div className={funcs.scope.state.step == 1 ? 'steps' : 'hidden'}>
            <FistStop isShow={this.props.isShow} funcs={funcs} setParentState={this.setParentState()} currentApp={this.props.currentApp} currentService={this.props.currentService} isEdit={isEdit} data={this.props.strategy} resetFields={() => this.resetFields()} />
          </div>
          <div className={funcs.scope.state.step == 2 ? 'steps' : 'hidden'}>
            <TwoStop funcs={funcs} setParentState={this.setParentState()} isEdit={isEdit} data={this.props.setting} isShow={this.props.isShow} resetFields={() => this.resetFields()} />
          </div>
          <div className={funcs.scope.state.step == 3 ? 'steps' : 'hidden'}>
            <Form className="alarmAction">
              <Form.Item label="发送通知" {...formItemLayout} style={{ margin: 0 }}>
                <RadioGroup defaultValue={this.state.isSendEmail} value={this.state.isSendEmail} onChange={(e) => this.sendMail(e)}>
                  <Radio key="a" value={1}>是</Radio>
                  <Radio key="b" value={0}>否</Radio>
                </RadioGroup>
              </Form.Item>
              <div className="tips" style={{ marginBottom: 20 }}><Icon type="exclamation-circle-o" /> 选择“是”，我们会向您发送监控信息和告警信息，选择“否”，我们将不会向你发送告警信息</div>
              <Form.Item label="告警通知组" {...formItemLayout} style={{ display: this.state.isSendEmail ? 'block' : 'none' }}>
                <Select placeholder="请选择告警通知组" style={{ width: 170 }} {...notify}>
                  {this.getNotifyGroup()}
                </Select>
                <div style={{ marginTop: 10 }}>
                  <Button icon="plus" onClick={() => this.showAlramGroup()} size="large" type="primary">新建组</Button>
                </div>
              </Form.Item>
            </Form>
            <div className="wrapFooter">
              <Button size="large" onClick={() => funcs.nextStep(2)} type="primary">上一步</Button>
              <Button size="large" onClick={() => this.submitRule()} type="primary">提交</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function alarmModalMapStateToProp(state, porp) {
  const { clusterName } = state.entities.current.cluster
  const defaultGroup = {}
  let { groups } = state.alert
  const { cluster } = state.entities.current
  const { current } = state.entities
  if (!groups) {
    groups = defaultGroup
  }

  const defaultSettingDetail = {
    isFetching: false,
    result: {
      data: []
    }
  }
  let isFetching = false
  let { getSetting, settingList } = state.alert
  if (!getSetting || !getSetting.result) {
    getSetting = defaultSettingDetail
  }
  isFetching = getSetting.isFetching
  let setting = getSetting.result.data
  if (!Array.isArray(setting)) setting = []
  return {
    notifyGroup: groups,
    current: current,
    cluster,
    setting,
    isFetching,
    clusterName,
  }
}
AlarmModal = connect(alarmModalMapStateToProp, {
  loadNotifyGroups,
  addAlertSetting,
  updateAlertSetting,
  getAlertSetting
})(Form.create()(AlarmModal))


export default AlarmModal
