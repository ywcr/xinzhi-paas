/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Manage Label component
 *
 * v0.1 - 2017-3-3
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Modal, Tag, Tooltip, Form, Button, Input } from 'antd'
import { connect  } from 'react-redux'
import TagDropdown from './TagDropdown'
import { camelize } from 'humps'
import { getClusterLabel, addLabels, editNodeLabels, getNodeLabels,checkLablesToService } from '../../actions/cluster_node'
import { KubernetesValidator } from '../../common/naming_validation'
import cloneDeep from 'lodash/cloneDeep'
import NotificationHandler from '../../common/notification_handler'



class ManageLabelModal extends Component {
  constructor(props){
    super(props)
    this.handleManageLabelOk = this.handleManageLabelOk.bind(this)
    this.handleManageLabelCancel = this.handleManageLabelCancel.bind(this)
    this.checkKey = this.checkKey.bind(this)
    this.state = {
      manageLabelModalVisible : this.props.manageLabelModal,
      userCreateLabel: this.props.userCreateLabel || {},
      isLoad: false,// first data in nodes
      diffLabels:[] // check labels
    }
  }

  diffLabels(before, after) {
    const deleted = []
    for (let i = 0; i < before.length; i++) {
      const aLabel = before[i]
      let remained = false
      for (let j = 0; j < after.length && !remained; j++) {
        const anotherLabel = after[j]
        remained = aLabel.key === anotherLabel.key && aLabel.value === anotherLabel.value
      }
      if (!remained) {
        deleted.push(aLabel)
      }
    }
    return deleted
  }

  componentWillReceiveProps(nextProps){
    if(this.props.manageLabelModal !== nextProps.manageLabelModal){
      this.setState({
        manageLabelModalVisible : nextProps.manageLabelModal,
      })
      const { nodes, nodeName } = nextProps
      if (nextProps.manageLabelModal && !this.state.isLoad) {
        for (let node in nodes) {
          if (node == camelize(nodeName)) {
            this.setState({userCreateLabel: nodes[node]})
            break
          }
        }
      }
      if (nextProps.isNode && nextProps.manageLabelModal) {
        this.props.getClusterLabel(nextProps.clusterID)
        this.setState({userCreateLabel: nextProps.userCreateLabel})
      }
    }
    const { nodeName } = this.props
    if (!nodeName) return
    if (nextProps.nodeName && nextProps.nodeName !== nodeName) {
      this.loadNodeLabels(nextProps)
    }
  }

  loadNodeLabels(props) {
    const { clusterID, nodeName } = props
    const _this = this
    if (!nodeName) return
    this.props.getNodeLabels(clusterID,nodeName,{
      success:{
        func:(ret)=> {
          _this.setState({userCreateLabel: JSON.parse(ret.raw),isLoad: true})
        }
      }
    })
  }

  handleClose(key,value) {
    // *bai delete tag
    const diffLabels= [{
      key,value
    }]
    const { clusterID, nodeName } = this.props

    const diff ={
      node:nodeName,
      cluster:clusterID,
      labels:diffLabels
    }
    const _this = this
    this.props.checkLablesToService(diff,{
      success:{
        func:(ret)=> {
          if (ret.affectedPods.length !== 0 ) {
            Modal.confirm({
              width:460,
              title: <span style={{fontWeight:500}}>下列服务依赖此标签调度，从此主机删除此标签可能导致服务无法启动</span>,
              content: this.formetTable(ret.affectedPods),
              onOk() {
                _this.beforeCloseLabel(key,value)
              },
              onCancel() {
                return
              },
            })
            return
          }
          this.beforeCloseLabel(key,value)
        }
      }
    })
  }
  formetTable(pods) {

    const tbody = pods.map(pod=> {
      return <tr key={pod.appName} className="ant-table-row  ant-table-row-level-0"><td>{pod.namespace}</td><td ><span className="ant-table-row-indent indent-level-0" style={{paddingLeft:0}}></span>{pod.appName}</td><td >{pod.svcName}</td></tr>
    })
    const list = (
      [<div key="1" className="ant-table ant-table-small ant-table-without-column-header ant-table-scroll-position-left">
        <div className="ant-table-content">
          <div class="ant-table-body"><table><thead className="ant-table-thead"><tr><th>用户</th><th ><span>应用</span></th><th><span>服务</span></th></tr></thead>
          <tbody className="ant-table-tbody">
            {tbody}
          </tbody></table>
          </div>
        </div>
      </div>,
      <div key="2" style={{marginTop:15,fontSize:14}}>确定要删除这个标签吗？</div>]
    )
    return list
  }

  beforeCloseLabel(key,value) {
    const diffLabels = cloneDeep(this.state.diffLabels)
    const userCreateLabel = cloneDeep(this.state.userCreateLabel)
    for (let lab in userCreateLabel) {
      if (lab === key && userCreateLabel[key] === value) {
        diffLabels.push({
          'key':lab,
          'value':userCreateLabel[lab]
        })
        delete userCreateLabel[lab]
        this.setState({userCreateLabel,diffLabels})
      }
    }
  }

  handleManageLabelOk(){
    const { callback, labels, editNodeLabels, clusterID, nodeName } = this.props
    const { userCreateLabel } = this.state
    const _this = this
    const body ={
      node:nodeName,
      labels:userCreateLabel,
      cluster:clusterID,
    }
    const notificat = new NotificationHandler()
    editNodeLabels(body,{
      success:{
        func:(ret)=> {
          // _this.setState({userCreateLabel:ret})
          notificat.success('操作成功！')
          _this.loadNodeLabels(_this.props)
          callback(false)
        },
        isAsync:true
      },
      failed: {
        func:(ret)=> {
          notificat.error('操作失败！',ret.message.message || ret.message)
        }
      }
    })
    this.setState({
      manageLabelModalVisible : false
    })
  }

  handleManageLabelCancel(){
    const { callback, form } = this.props
    this.setState({
      manageLabelModalVisible : false,
    })
    const _this = this
    callback(false)
    form.resetFields()
    // setTimeout(()=> {
    //   _this.setState({userCreateLabel:{}})
    // },500)
  }
  checkKey(rule, value, callback) {
    if (!Boolean(value)){
      callback(new Error('请输入标签键'))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (value.length < 3 || value.length > 64) {
      callback(new Error('标签键长度为3~64位'))
      return
    }
    if (Kubernetes.IsQualifiedName(value).length >0) {
      callback(new Error('以字母或数字开头和结尾中间可使用_或者-'))
      return
    }
    let isExtentd
    for (let item of this.props.labels) {
      if (item.key === value) {
        isExtentd = true
        break
      }
    }
    if (isExtentd) {
      return callback(new Error('标签键已存在'))
    }
    callback()
  }
  checkValue(rule, value, callback) {
    if (!Boolean(value)){
      callback(new Error('请输入标签值'))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (value.length < 3 || value.length > 64) {
      callback(new Error('标签键长度为3~64位'))
      return
    }
    if (Kubernetes.IsValidLabelValue(value).length >0) {
      callback(new Error('以字母或数字开头和结尾中间可使用_或者-'))
      return
    }
    callback()
  }

  handleAddLabel() {
   const { form, addLabels, clusterID, getClusterLabel } = this.props
   const _this = this
   form.validateFields((errors,values)=> {
     if (errors) {
       return
     }
     values.target = 'node'
     values.clusterID = clusterID
     let createLabel = cloneDeep(_this.state.userCreateLabel)
     createLabel[values.key] = values.value
     addLabels([values],clusterID,{
       success:{
         func:(ret)=> {
           getClusterLabel(clusterID)
           _this.setState({userCreateLabel:createLabel})
           form.resetFields()
         },
         isAsync: true
       },
       failed: {
         func:(res)=> {
          new NotificationHandler().error('添加标签失败！')
         }
       }
     })
   })
  }
  render(){
    const { userCreateLabel } = this.state

    const { getFieldProps } = this.props.form
    const createLabel = ()=> {
      const label = []
      const labels = this.props.labels || []
      labels.map((item)=> {
        for (let key in userCreateLabel) {
          if (item.key === key && item.value === userCreateLabel[key] ) {
            if (!item.isUserDefined) {
              label.push(
                <Tag color="blue" className='tag' key={key}>
                    <Tooltip title={key}>
                      <span className='key'>{key}</span>
                    </Tooltip>
                    <span className='point'>：</span>
                    <Tooltip title={userCreateLabel[key]}>
                      <span className='value'>{userCreateLabel[key]}</span>
                    </Tooltip>
                </Tag>
              )

            } else {
              label.push(
                <div data-show="true" key={key} className="ant-tag ant-tag-blue tag">
                  <span className="ant-tag-text">
                  <Tooltip title={key}>
                    <span className="key">{key}</span>
                  </Tooltip>
                  <span className="point">：</span>
                  <Tooltip title={userCreateLabel[key]}>
                    <span className="value">{userCreateLabel[key]}</span>
                  </Tooltip>
                  </span><i className="anticon anticon-cross" onClick={() => this.handleClose(key, userCreateLabel[key])}></i>
                </div>
              )
            }
          }
        }
      })

      return label
    }

    return(
      <div>
        <Modal
          title="管理标签"
          visible={this.state.manageLabelModalVisible}
          onOk={this.handleManageLabelOk}
          onCancel={this.handleManageLabelCancel}
          wrapClassName="manageLabelModal"
          width="600px"
          maskClosable={false}
        >
          <div className='labelcontainer'>
            { createLabel() }
          </div>

          <div className='labelfooter'>
          <span className='labeldropdown' id="cluster__hostlist__manageLabelModal">
            <TagDropdown scope={this} clusterID={this.props.clusterID} labels={this.props.labels} isManage={true} width={'120px'} context={"Modal"}/>
          </span>
            <span className='item'>或</span>
            <Form
              inline
              horizontal={true}
              className='labelform'
            >
              <Form.Item className='itemkey'>
                <Input {...getFieldProps(`key`, {
                  rules: [{
                    whitespace: true,
                  },{
                    validator: this.checkKey
                  }],
                })} placeholder="标签键"  />
              </Form.Item>
              <Form.Item className='itemkey'>
                <Input {...getFieldProps(`value`, {
                  rules: [{
                    whitespace: true,
                  },{
                    validator: this.checkValue
                  }],
                })} placeholder="标签值"/>
              </Form.Item>
            </Form>
            <Button icon='plus' size="large" className='itembutton' type="ghost" onClick={()=> this.handleAddLabel()}>新建标签</Button>
          </div>
        </Modal>
      </div>
    )
  }
}


function mapStateToProps(state,props) {
  const { clusterLabel } = state.cluster_nodes
  const cluster = props.clusterID
  if (!clusterLabel[cluster]) {
    return props
  }

  let { result } = clusterLabel[cluster]
  if (!result) {
    result = {nodes:[]}
  }
  return {
    nodes:result.nodes,
    labels:result.summary
  }
}
ManageLabelModal = Form.create()(ManageLabelModal)

export default connect(mapStateToProps, {
  checkLablesToService,
  getClusterLabel,
  addLabels,
  editNodeLabels,
  getNodeLabels
})(ManageLabelModal)