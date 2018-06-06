/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Access Method component
 *
 * v0.1 - 2017-7-3
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Form, Radio, Select, Row, Col } from 'antd'
import { connect } from 'react-redux'
import './style/AccessMethod.less'
import { getProxy } from '../../../../../actions/cluster'
import { getCookie, setCookie } from '../../../../../common/tools'
import { USER_CURRENT_CONFIG } from '../../../../../../constants'
import { camelize } from 'humps'

const Option = Select.Option

class AccessMethod extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
    const { getProxy, currentCluster, form } = this.props
    const clusterID = currentCluster.clusterID
    let clusterId = camelize(currentCluster.clusterID)
    let nameSpace = getCookie(USER_CURRENT_CONFIG).split(',')[1]
    getProxy(clusterID, {
      success: {
        func: (res) => {
          let data = res[clusterId].data
          if(data){
            for (let i = 0; i < data.length; i++) {
              if (data[i].isDefault) {
                if(data[i].type == 'public'){
                  setTimeout(() => {
                    form.setFieldsValue({
                      accessMethod: 'Cluster',
                      publicNetwork: data[i].id
                    }, 200)
                  })
                  return
                }
                if(data[i].type == 'private'){
                  setTimeout(() => {
                    form.setFieldsValue({
                      accessMethod: 'Cluster',
                      internaletwork: data[i].id
                    }, 200)
                  })
                }
                break
              }
            }
          }
        }
      },
      failed: {
        func: () => {
          setTimeout(() => {
            form.setFieldsValue({
              'publicNetwork': undefined
            })
          }, 100)
        }
      }
    },'',nameSpace)
  }

  accessMethodTips = type => {
    if (type == 'PublicNetwork') {
      return <div> <span style={{'color':'red'}}>服务可通过公网访问，公网访问方式可能存在风险! </span><br/><span>请选择一个网络出口；</span></div>
    }
    if (type == 'Internaletwork') {
      return <span>服务可通过内网访问，选择一个网络出口；</span>
    }
    return <span>服务仅提供给集群内其他服务访问；</span>
  }

  selectOption = nodeType => {
    let OptionArray = this.formatGroupArray(nodeType)
    let OptionList = OptionArray.map((item, index) => {
      return <Option value={item.id} key={'node' + index}>{item.name}</Option>
    })
    if (!OptionList.length) {
      OptionList = <Option value="none" key="noAddress" disabled={true}><span>暂无此类网络出口</span></Option>
    }
    return OptionList
  }

  formatGroupArray = type => {
    const { clusterProxy, currentCluster } = this.props
    let clusterID = camelize(currentCluster.clusterID)
    let nodeArray = []
    let OptionArray = []
    if (Object.keys(clusterProxy).length && clusterProxy[clusterID] && clusterProxy[clusterID].data) {
      nodeArray = clusterProxy[clusterID].data
    }
    if(type=='all'){
      if (nodeArray.length) {
        nodeArray.forEach(item => {
            OptionArray.push(item)
        })
      }
      return OptionArray
    }else{
      let accessType = 'public'
      if (type == 'Cluster') {
        return OptionArray
      }
      if (type == 'PublicNetwork') {
        accessType = 'public'
      } else {
        accessType = 'private'
      }
      if (nodeArray.length) {
        nodeArray.forEach(item => {
          if (item.type == accessType) {
            OptionArray.push(item)
          }
        })
      }
      return OptionArray
    }
  }

  getDefaultAccessMethod = () => {
    const { clusterProxy, currentCluster } = this.props
    let clusterID = camelize(currentCluster.clusterID)
    let defaultValue = 'Cluster'
    if(Object.keys(clusterProxy).length && clusterProxy[clusterID] && clusterProxy[clusterID].data){
      let arr = clusterProxy[clusterID].data
      for(let i = 0; i < arr.length; i++){
        if(arr[i].isDefault){
          switch(arr[i].type){
            case "private":
              return defaultValue = "Internaletwork"
            case "public":
              return defaultValue = 'PublicNetwork'
            default:
              return defaultValue = 'Cluster'
          }
        }
      }
    }
    return defaultValue
  }

  render() {
    const { formItemLayout, form,scope,containerPorts,isUDP,templateid,stackDetail,isHTTP,current } = this.props
    const { getFieldProps, getFieldValue,setFieldsValue } = form
    const accessMethodProps = getFieldProps('accessMethod', {
      initialValue: this.getDefaultAccessMethod(),
      onChange: (e) => {

        const { form } = this.props
        let type = e.target.value
        scope.setState({
          accessMethodType :type
        },function(){
        })
        // Yao.wei --- 切换访问方式时 根据 containerPorts 渲染映射端口列表
        const portsKeys = getFieldValue('portsKeys') || []
        if(!templateid){
          
          if(containerPorts.length==0){
            if(type=='Cluster'){
              // setFieldsValue({[`portProtocol0`]:'TCP'})       
              portsKeys: portsKeys.map(_key => {
                const portProtocolKey = `portProtocol${_key.value}`
                setFieldsValue({[portProtocolKey]:'TCP'})
              })     
            }else{
              portsKeys: portsKeys.map(_key => {
                const portProtocolKey = `portProtocol${_key.value}`
                if(_key.value == 0){
                  setFieldsValue({[`portProtocol0`]:'HTTP'})    
                }else{
                  setFieldsValue({[portProtocolKey]:'TCP'})
                }
              })
                      
            }
            
          }
          containerPorts.map((port, index) => {
            const portArray = port.split('/')
            const portProtocolKey = `portProtocol${index}`
            
            setFieldsValue({
              portsKeys: portsKeys.map(_key => {
                if (_key.value > containerPorts.length-1) {
                  // magic code ！
                  // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
                  _key.deleted = true
                }
                return _key  
              })
            })

            if(type=='Cluster'){
              if(portArray[1].toLocaleUpperCase()=='HTTP'){
                setFieldsValue({[portProtocolKey]:'TCP'})
              }else{
                setFieldsValue({[portProtocolKey]:portArray[1].toLocaleUpperCase()})
              }
            }else{
              setFieldsValue({[portProtocolKey]:portArray[1].toLocaleUpperCase()})
              if(index!=0){
                if((getFieldValue['portProtocol0']=='HTTP'&&portArray[1].toLocaleUpperCase()=="HTTP")||portArray[1].toLocaleUpperCase()=="UDP"){
                  setFieldsValue({[portProtocolKey]:'TCP'})
                }
              }
                
            }
          
          })
        }
        let optionArray = this.formatGroupArray(type)
        let defaultGroup = undefined
        optionArray.forEach(item => {
          if (item.isDefault) {
            defaultGroup = item.id
          }
        })
        if (!defaultGroup && optionArray.length > 0) {
          defaultGroup = optionArray[0].id
        }
        if (type == 'all') {
          form.setFieldsValue({
            'publicNetwork': defaultGroup
          })
          return
        }else if(type == 'Cluster'){
          form.setFieldsValue({
            'publicNetwork': ''
          })
          form.setFieldsValue({
            'internaletwork': ''
          })
          return
        }else if (type == 'Internaletwork') {
          form.setFieldsValue({
            'internaletwork': defaultGroup
          })
          return
        }else if (type == 'PublicNetwork') {
          form.setFieldsValue({
            'publicNetwork': defaultGroup
          })
          return
        }
      }
    })
    const PublicNetworkProps = getFieldProps('publicNetwork', {
      initialValue:'',
      rules: [{ required: false, message: '请选择一个网络出口' }]
    })
    const InternaletworkProps = getFieldProps('internaletwork', {
      initialValue:'',
      rules: [{ required: false, message: '请选择一个网络出口' }]
    })
    const formItemLayout2 = {
      labelCol: { span: 4 },
      wrapperCol: { span: 6 }
    }
    const accessMethodValue = getFieldValue('accessMethod')
    return (
      <div id='accessMethod'>
        <Form.Item
          {...formItemLayout}
          label="访问方式"
          className='radioBox'
        >
        {templateid?
          <Radio.Group {...accessMethodProps}>
            <Radio value="all" disabled={isUDP} key="PublicNetwork">可集群外访问</Radio>
            <Radio value="Cluster" disabled={isHTTP} key="Cluster">仅在集群内访问</Radio>
          </Radio.Group>
        :
        <Radio.Group {...accessMethodProps}>
          <Radio value="PublicNetwork" disabled={isUDP} key="PublicNetwork">可公网访问</Radio>      
          {current.cluster.clusterName == 'huawei' ? '' :  <Radio value="Internaletwork" disabled={isUDP} key="Internaletwork">内网访问</Radio> } 
          <Radio value="Cluster" disabled={isHTTP} key="Cluster">仅在集群内访问</Radio>
        </Radio.Group>
        }
        </Form.Item>
        <Row className='tipsRow'>
          <Col span="4" />
          <Col span="20">{this.accessMethodTips(accessMethodValue)}</Col>
        </Row>
        {accessMethodValue =="all"?
          <Form.Item
            label={<span></span>}
            {...formItemLayout2}
          >
            <Select
              {...PublicNetworkProps}
              placeholder='选择网络出口'
            >
              {this.selectOption(accessMethodValue)}
            </Select>
            </Form.Item>
            :''
        }
        {accessMethodValue =="PublicNetwork"?
          <Form.Item
            label={<span></span>}
            {...formItemLayout2}
          >
            <Select
              {...PublicNetworkProps}
              placeholder='选择网络出口'
            >
              {this.selectOption(accessMethodValue)}
            </Select>
            </Form.Item>
            :''
        }
        {accessMethodValue =="Internaletwork"?
          <Form.Item
            label={<span></span>}
            {...formItemLayout2}
          >
            <Select
              {...InternaletworkProps}
              placeholder='选择网络出口'
            >
              {this.selectOption(accessMethodValue)}
            </Select>
            </Form.Item>
            :''
        }
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  let clusterProxy = state.cluster.proxy.result || {}
  const { quickCreateApp, entities, getImageTag, harbor } = state

  return {
    clusterProxy,
    current: entities.current,
  }
}

export default connect(mapStateToProp, {
  getProxy,
})(AccessMethod)