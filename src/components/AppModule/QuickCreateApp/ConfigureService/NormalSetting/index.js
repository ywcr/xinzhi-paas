/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: normal configure for service
 *
 * v0.1 - 2017-05-04
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Form, InputNumber, Tooltip, Icon, Switch, Select, Radio, Tag } from 'antd'
import ResourceSelect from '../../../../ResourceSelect'
import Storage from './Storage'
import Ports from './Ports'
import AccessMethod from './AccessMethod'
import { getNodes, getClusterLabel } from '../../../../../actions/cluster_node'
import {
  SYSTEM_DEFAULT_SCHEDULE,
 } from '../../../../../constants'
import './style/index.less'
import TagDropDown from '../../../../ClusterModule/TagDropdown'
import cloneDeep from 'lodash/cloneDeep'

const FormItem = Form.Item

const Normal = React.createClass({
  getInitialState() {
    return {
      replicasInputDisabled: false,
      summary: [],
      createApp: true,
      isUDP:false,
      isHTTP:false,
      accessMethodType:'Cluster'
    }
  },
  componentWillMount() {
    const { fields, getNodes, currentCluster, getClusterLabel,templateid,stackDetail } = this.props
    if(templateid){
      const appPorts = JSON.parse(stackDetail.appDetail.ports)
      const appArr = []
      let isUDP = false
      let isHTTP = false
      appPorts.forEach(function(item,index){
        if(item.split('/')[2]==1){
          appArr.push(item)
          if(item.split('/')[1]=='UDP'){
            isUDP = true
          }else if(item.split('/')[1]=='HTTP'){
            isHTTP = true
          }
        }
      })
      this.setState({
        isUDP,isHTTP
      })
    }
    if (!fields || !fields.replicas) {
      this.setReplicasToDefault()
    }
    if (!fields || !fields.bindNode) {
      this.setBindNodeToDefault()
    }
    const { listNodes, clusterID } = currentCluster
    // get cluster nodes for bind
    if (listNodes === 2 || listNodes === 4) {
      getNodes(clusterID, {
        failed: {
          func: () => {
            //
          },
        }
      })
    }
    if (listNodes === 3 || listNodes === 4) {
      getClusterLabel(clusterID)
    }
  },
  componentDidMount(){
    const { fields } = this.props
    if(fields && fields.bindLabel){
      this.setState({
        summary: fields.bindLabel.value
      })
    }
    const { currentCluster, form } = this.props
    const { listNodes } = currentCluster
    switch(listNodes){
      case 1:
        return
      case 2:
      case 4:
        return form.setFieldsValue({'bindNodeType': 'hostname'})
      case 3:
        return form.setFieldsValue({'bindNodeType': 'hostlabel'})
    }
  },
  setReplicasToDefault(disabled) {
    this.props.form.setFieldsValue({
      replicas: 1,
    })
    this.setState({
      replicasInputDisabled: disabled,
    })
  },
  setBindNodeToDefault() {
    this.props.form.setFieldsValue({
      bindNode: SYSTEM_DEFAULT_SCHEDULE,
    })
  },
  onResourceChange({ resourceType, DIYMemory, DIYCPU }) {
    const { setFormFields, form, id } = this.props
    const { setFieldsValue } = form
    const values = { resourceType }
    if (DIYMemory) {
      values.DIYMemory = DIYMemory
    }
    if (DIYCPU) {
      values.DIYCPU = DIYCPU
    }
    setFieldsValue(values)
  },
  checkReplicas(rule, value, callback) {
    if (!value) {
      callback()
    }
    if (value < 1 || value > 10) {
      return callback('实例数量为 1~10 之间')
    }
    callback()
  },
  formTagContainer(){
    const { summary } = this.state
    const arr = summary.map((item, index) => {
      return (
        <div color="blue" key={item.key + index} className='tagStyle'>
          <span>{item.key}</span>
          <span className='point'>:</span>
          <span>{item.value}</span>
          <Icon type="cross" onClick={() => this.handleClose(item)} className='cross'/>
        </div>
      )
    })
    return arr
  },
  handleClose(item){
    const { summary } = this.state
    const tag = cloneDeep(summary)
    for(let i=0;i<tag.length;i++){
      if(tag[i].key == item.key && tag[i].value == item.value){
        tag.splice(i, 1)
      }
    }
    this.setState({
      summary: tag
    })
    const { form } = this.props
    form.setFieldsValue({'bindLabel': tag})
  },
  handledDropDownSetvalues(arr){
    const { form } = this.props
    form.setFieldsValue({'bindLabel': arr})
  },
  handleLabelTemplate(){
    const { labels, form, nodes } = this.props
    const { getFieldProps } = form
    const { summary } = this.state
    const scope = this
    const bindLabelProps = getFieldProps('bindLabel')
    let nodesArray = this.matchedNodes(summary, nodes)
    let nodesNameList = nodesArray.map((item, index) => {
      return <span key={item.nodeName} style={{paddingRight:'5px'}}>{item.nodeName}</span>
    })
    return <div className='hostlabel'>
      <TagDropDown
        labels={labels}
        footer={false}
        scope={scope}
      />
      <div className='tips'>
        满足条件的节点：
        {
          summary.length
          ? <span>
            <Tooltip title={nodesNameList.length ? nodesNameList : '无'}>
              <span className='num'>{nodesArray.length}</span>
            </Tooltip>
            个
          </span>
          : <span>未选标签，使用系统调度</span>
        }
      </div>
      {
        this.state.summary.length > 0
        ? <div className='labelcontainer'>
          <Form.Item >
            <div>{ this.formTagContainer() }</div>
          </Form.Item>
        </div>
        : <span></span>
      }
    </div>
  },
  handelhostnameTemplate(){
    const { form, clusterNodes } = this.props
    const { getFieldProps } = form
    const bindNodeProps = getFieldProps('bindNode',{
      rules: [
        { required: true },
      ],
    })
    return <div>
      <FormItem className='hostname'>
        <Select
          size="large"
          placeholder="请选择绑定节点"
          showSearch
          optionFilterProp="children"
          {...bindNodeProps}
          style={{minWidth:'290px'}}
        >
          <Select.Option value={SYSTEM_DEFAULT_SCHEDULE}>使用系统默认调度</Select.Option>
          {
            clusterNodes.map(node => {
              const { name,ip,podCount,schedulable,isMaster } = node
              return (
                <Select.Option key={name} disabled={isMaster || !schedulable}>
                  {name} | {ip} (容器：{podCount}个)
                </Select.Option>
              )
            })
          }
        </Select>
      </FormItem>
    </div>
  },
  handleBindnodeTypeTemlate(listNodes){
    const { form } = this.props
    const { getFieldProps } = form
    const bindNodeTypeProps = getFieldProps('bindNodeType',{
      rules: [
        { required: true },
      ],
    })
    switch(listNodes){
      case 2:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname">主机名及IP</Radio>
        </Radio.Group>
      case 3:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostlabel">主机标签</Radio>
        </Radio.Group>
      case 4:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname" key="hostname">主机名及IP</Radio>
          <Radio value="hostlabel" key="hostlabel">主机标签</Radio>
        </Radio.Group>
      default:
        return <span></span>
    }
  },
  handelBindnodeDetailTemplate(listNodes){
    const { form } = this.props
    const { getFieldValue } = form
    const values = getFieldValue('bindNodeType')
    switch(listNodes){
      case 2:
        return <div>{this.handelhostnameTemplate()}</div>
      case 3:
        return <div>{this.handleLabelTemplate()}</div>
      case 4:
        return <div>{
          values == 'hostname'
          ? <div>{this.handelhostnameTemplate()}</div>
          : <div>{this.handleLabelTemplate()}</div>
        }</div>
    }
  },
  handleBindNodeTempalte(){
    const { currentCluster,formItemLayout,templateid } = this.props
    const { listNodes } = currentCluster
    switch(listNodes){
      case 1:
      default:
        return <span></span>
      case 2:
      case 3:
      case 4:
        return <div style={{display:templateid?'none':""}} >
          <Row>
            <Col span={formItemLayout.labelCol.span} className="title">
              <span>绑定节点</span>
            </Col>
            <Col span={formItemLayout.wrapperCol.span}>
              <Form.Item>
                { this.handleBindnodeTypeTemlate(listNodes) }
              </Form.Item>
            </Col>
          </Row>
          <Row className='content'>
            <Col span={formItemLayout.labelCol.span}></Col>
            <Col span={formItemLayout.wrapperCol.span}>
              {this.handelBindnodeDetailTemplate(listNodes)}
            </Col>
          </Row>
        </div>
    }
  },
  matchedNodes(labels, nodes) {
    const matched = []
    const multiMap = this.labelsToMultiMap(labels)
    const nodeNames = Object.getOwnPropertyNames(nodes)
    for (let i = 0; i < nodeNames.length; i++) {
      const name = nodeNames[i]
      const node = nodes[name]
      if (this.isNodeMatchLabels(node, multiMap)) {
        matched.push({
          nodeName: name,
          labels: node,
        })
      }
    }
    return matched
  },
  isNodeMatchLabels(node, multiMap) {
    const labelKeys = Object.getOwnPropertyNames(multiMap)
    for (let i = 0; i < labelKeys.length; i++) {
      const labelKey = labelKeys[i]
      if (!node.hasOwnProperty(labelKey)) {
        return false
      }
      const nodeValue = node[labelKey]
      const labelValues = multiMap[labelKey]
      if (labelValues.indexOf(nodeValue) === -1) {
        return false
      }
    }
    return true
  },
  labelsToMultiMap(labels) {
    const multiMap = {}
    labels.forEach(label => {
      const key = label.key
      const value = label.value
      if (multiMap.hasOwnProperty(key)) {
        multiMap[key].push(value)
      } else {
        multiMap[key] = [value]
      }
    })
    return multiMap
  },
  render() {
    const {
      formItemLayout, form, standardFlag,
      fields, currentCluster, clusterNodes,
      isCanCreateVolume, imageConfigs,stackDetail,templateid
    } = this.props
    
    const { replicasInputDisabled } = this.state
    const { getFieldProps,getFieldValue } = form
    const { mountPath, containerPorts } = imageConfigs
    const { resourceType, DIYMemory, DIYCPU } = fields || {}
    const replicasProps = getFieldProps('replicas', {
      rules: [
        { required: true, message: '实例数量为 1~10 之间' },
        { validator: this.checkReplicas }
      ],
    })
    const dataSize  = getFieldProps('storageSize', {
      rules: [
        { required: true, message: '请选择数据存储大小' }
      ],
      initialValue:512
    })
    const resourceTypeProps = getFieldProps('resourceType', {
      rules: [
        { required: true },
      ],
    })
    const DIYMemoryProps = getFieldProps('DIYMemory')
    const DIYCPUProps = getFieldProps('DIYCPU')
    const wocao = getFieldValue('volume0')
    return (
      <div id="normalConfigureService">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">基本配置</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">服务的计算资源、服务类型、以及实例个数等设置</div>
          </Col>
        </Row>
        <div className="body" key="body">
          <Row>
            <Col span={formItemLayout.labelCol.span} className="formItemLabel label">
              容器配置&nbsp;
              {
                standardFlag && (
                  <Tooltip title="专业版及企业认证用户可申请扩大容器配置">
                    <a>
                      <Icon type="question-circle-o" />
                    </a>
                  </Tooltip>
                )
              }
            </Col>
            <Col span={formItemLayout.wrapperCol.span}>
              <ResourceSelect
                form={form}
                {...{DIYMemoryProps, DIYCPUProps}}
                standardFlag={standardFlag}
                onChange={this.onResourceChange}
                resourceType={resourceType && resourceType.value}
                DIYMemory={DIYMemory && DIYMemory.value}
                DIYCPU={DIYCPU && DIYCPU.value}
              />
            </Col>
          </Row>
          {
            // listNode
            // 1 不可以
            // 2 通过IP
            // 3 通过labels
            // 4 通过IP或labels
          }
          <div className='bindNodes'>
            { this.handleBindNodeTempalte() }
          </div>
          {templateid?'':(
          <Storage
            formItemLayout={formItemLayout}
            form={form}
            scope = {this}
            fields={fields}
            setReplicasToDefault={this.setReplicasToDefault}
            mountPath={mountPath}
            key="storage"
          />)
          }
          {templateid?(
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 3 }}
            label="数据存储大小"
            className="storageSize"
            key="size"
          >
            <InputNumber
              size="large"
              min={512}
              max={20480}
              step={512}
              {...dataSize}
            />
            <div style={{'float':'right'}} className="unit">M</div>
          </FormItem>)
          :''}
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 3 }}
            label="实例数量"
            className="replicasFormItem"
            key="replicas"
          >
            <InputNumber
              size="large"
              min={1}
              max={10}
              {...replicasProps}
              disabled={replicasInputDisabled}
            />
            <div className="unit">个</div>
          </FormItem>
          <AccessMethod
            type={this.state.accessMethodType}
            formItemLayout={formItemLayout}
            fields={fields}
            form={form}
            scope={this}
            isUDP={this.state.isUDP}
            isHTTP={this.state.isHTTP}
            templateid={templateid}
            stackDetail={stackDetail}
            currentCluster={currentCluster}
            containerPorts={containerPorts}
            key="accessmethod"
          />
          <Ports
            formItemLayout={formItemLayout}
            form={form}
            fields={fields}
            scope={this}
            templateid={templateid}
            stackDetail={stackDetail}
            accessMethodType={this.state.accessMethodType}
            accessMethod={this.state.accessMethod}
            containerPorts={containerPorts}
            currentCluster={currentCluster}
            key="ports"
          />
        </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { entities, cluster_nodes } = state
  const { current } = entities
  const { cluster } = current
  const { clusterNodes } = cluster_nodes
  const { clusterLabel } = cluster_nodes
  let labels = []
  let nodes = {}
  if(clusterLabel[cluster.clusterID] && clusterLabel[cluster.clusterID].result && clusterLabel[cluster.clusterID].result.summary){
    nodes = clusterLabel[cluster.clusterID].result.nodes
    let summary = clusterLabel[cluster.clusterID].result.summary
    labels = summary.filter(label => label.targets && label.targets.length && label.targets.length > 0)
  }
  return {
    currentCluster: cluster,
    clusterNodes: clusterNodes[cluster.clusterID] || [],
    labels,
    nodes,
  }
}

export default connect(mapStateToProps, {
  getNodes,
  getClusterLabel,
})(Normal)