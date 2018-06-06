/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: ports configure for service
 *
 * v0.1 - 2017-05-11
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import {
  Form, Row, Col,
  Input, InputNumber, Select,
  Button, Icon, Tooltip
} from 'antd'
import { connect } from 'react-redux'
import { isDomain } from '../../../../../common/tools'
import { loadFreeVolumePort } from '../../../../../actions/storage'
import NotificationHandler from '../../../../../common/notification_handler.js'
import './style/Ports.less'
import { setTimeout } from 'timers';

const FormItem = Form.Item
const Option = Select.Option
const MIN = 1
const SPECIAL_MIN = 10000
const MAX = 65535
const MAPPING_PORT_AUTO = 'auto'
const MAPPING_PORT_SPECIAL = 'special'
const UDPARR = []
const Ports = React.createClass({
  checkContainerPort(key, rule, value, callback) {
    if (!value) {
      return callback()
    }
    if (value < MIN || value > MAX) {
      return callback(`容器端口范围为${MIN}~${MAX}`)
    }
    const { getFieldValue } = this.props.form
    const portsKeys = getFieldValue('portsKeys') || []
    let error
    portsKeys.every(_key => {
      const port = getFieldValue(`port${_key.value}`)
      if (_key.value !== key && value === port) {
        error = '已填写过该端口'
        return false
      }
      return true
    })
    callback(error)
  },
  checkMappingPort(key, rule, value, callback) {
    const { accessMethodType,currentCluster,loadFreeVolumePorts,loadFreeVolumePort } = this.props
    const cluster=currentCluster.clusterID
    // PublicNetwork
    if (!value) {
      return callback()
    }
    if (value < SPECIAL_MIN || value > MAX) {
      return callback(`容器端口范围为${SPECIAL_MIN}~${MAX}`)
    }
    const { getFieldValue } = this.props.form
    const portsKeys = getFieldValue('portsKeys') || []
    let netWorl = ''
    if(accessMethodType == 'all' || accessMethodType == 'PublicNetwork'){
      netWorl = getFieldValue('publicNetwork')
    }else if(accessMethodType == 'Internaletwork'){
      netWorl = getFieldValue('internaletwork')      
    }else{
      netWorl = ''
    }
    let error
    portsKeys.every(_key => {
      const mappingPort = getFieldValue(`mappingPort${_key.value}`)
      if (_key.value !== key && value === mappingPort) {
        error = '已填写过该端口'
        return false
      }
      loadFreeVolumePort(cluster,netWorl,mappingPort).then(response => {
        if(!response){
          error = '端口重复，请重新输入。'
          return false;
        }
      })
      return true;
    })
    // 127.0.0.1:9001/api/v2/clusters/CID-ca4135da3326/apps/checkport?lbgroup=group-default&ports=10,38168
    setTimeout(function(){
      callback(error)
    },500)
  },
  removePortsKey(keyValue) {
    //要删除映射的端口
    const { form,fields,scope } = this.props
    const { setFieldsValue, getFieldValue } = form
    const portsKeys = getFieldValue('portsKeys') || []
    var fieldsKey = Object(fields);
    var fieldsKeys = Object.keys(fields);
    var deleKey='portProtocol'+keyValue;
    var deleValue=fieldsKey[deleKey];
    if(deleValue.value=='UDP'){
      UDPARR.shift();
    }
    setFieldsValue({
      portsKeys: portsKeys.map(_key => {
        if (_key.value === keyValue) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          _key.deleted = true
        }
        return _key
      })
    });
    var listArr=portsKeys.filter(value => {
      if(!value.deleted){
        return value
      }
    });
    const udpList=listArr.filter(value =>{
      var str='portProtocol'+value.value;
      var fieldsValue=fieldsKey[str];
      if(fieldsValue.value=='UDP'){
        scope.setState({isUDP:true});
        return value;
      }
    });
    if(udpList.length<1){
      scope.setState({isUDP:false});
    }
    //如果udp的端口全部删掉之后，isUdp设成true
  },
  portTypeChange(keyValue, value){
    if(value == MAPPING_PORT_SPECIAL){
      setTimeout(() => {
        let id = `mappingPort${keyValue}`
        document.getElementById(id).focus()
      },500)
    }
  },
  renderPortItem(key, index) {
    // 根据 `deleted` 字段来决定是否渲染
    if (key.deleted) {
      return
    }
    const keyValue = key.value
    const { form, currentCluster,scope,stackDetail,templateid } = this.props
    const { getFieldProps, getFieldValue,setFieldsValue } = form
    const { bindingDomains } = currentCluster
    const accessMethod = getFieldValue('accessMethod')
    const httpOptionDisabled = !isDomain(bindingDomains)
    const portsKeys = getFieldValue('portsKeys') || []
    const portKey = `port${keyValue}`
    const portProtocolKey = `portProtocol${keyValue}`
    const mappingPportTypeKey = `mappingPortType${keyValue}`
    const mappingPortKey = `mappingPort${keyValue}`
    
    const portProps = getFieldProps(portKey, {
      rules: [
        { required: true, message: '请输入容器端口' },
        { validator: this.checkContainerPort.bind(this, keyValue) }
      ],
    })
    const portProtocolProps = getFieldProps(portProtocolKey, {
      rules: [
        { required: true, message: '请选择端口协议' },
      ],
      initialValue:'TCP',
      onChange:(e)=>{
        if(e=='UDP'){
          UDPARR.push(e)
          scope.setState({
            isUDP:true
          })
        }else{
          UDPARR.shift();
          if(UDPARR.length>=1){
            //UDPARR.splice(0, 1)
            scope.setState({
              isUDP:true
            })
          }else{
            scope.setState({
              isUDP:false
            })
          }
        }
      }
    })
    const portProtocolValue = getFieldValue(portProtocolKey)
    let mappingPortTypeProps
    let mappingPortProps
    if (portProtocolValue === 'TCP' && accessMethod !== 'accessMethod') {
      mappingPortTypeProps = getFieldProps(mappingPportTypeKey, {
        rules: [
          { required: true, message: '请选择映射服务端口类型' },
        ],
        initialValue: MAPPING_PORT_AUTO,
        onChange: this.portTypeChange.bind(this, keyValue)
      })
      const mappingPortTypeValue = getFieldValue(mappingPportTypeKey)
      if (mappingPortTypeValue === MAPPING_PORT_SPECIAL) {
        mappingPortProps = getFieldProps(mappingPortKey, {
          rules: [
            { required: true, message: '请输入指定端口' },
            { validator: this.checkMappingPort.bind(this, keyValue) }
          ],
        })
      }
    }
    return (
      <Row className="portItem" key={`portItem${keyValue}`}>
        <Col span={5}>
          <FormItem>
            <InputNumber
              size="default"
              min={MIN}
              disabled={templateid?true:false}
              max={MAX}
              {...portProps} />
          </FormItem>
        </Col>
        <Col span={5}>
          <FormItem>
            <Select disabled={templateid?true:false} size="default" {...portProtocolProps}>
              {
                accessMethod == 'Cluster'
                  ? [<Option value="TCP" key="TCP">TCP</Option>,<Option value="UDP" key="UDP">UDP</Option>]
                    : [<Option value="HTTP" key="HTTP" disabled={httpOptionDisabled}>HTTP</Option>,
                      <Option value="TCP" key="TCP">TCP</Option>]
              }
            </Select>
          </FormItem>
        </Col>
        <Col span={9}>
          {
            accessMethod == 'Cluster'
            ? <div className='clusterPorts'>N/A</div>
            : <Row gutter={16}>
              <Col span={12}>
                {
                  mappingPortTypeProps
                    ? (
                    <FormItem>
                      <Select size="default" {...mappingPortTypeProps}>
                        <Option value={MAPPING_PORT_AUTO}>动态生成</Option>
                        <Option value={MAPPING_PORT_SPECIAL}>指定端口</Option>
                      </Select>
                    </FormItem>
                  )
                    : (
                    <div className="httpMappingPort">80</div>
                  )
                }
              </Col>
              {
                mappingPortProps && (
                  <Col span={12}>
                    <FormItem>
                      <InputNumber
                        size="default"
                        {...mappingPortProps}
                        // min={SPECIAL_MIN}
                        // max={MAX}
                         />
                    </FormItem>
                  </Col>
                )
              }
            </Row>
          }
        </Col>
        <Col span={5} >
          <Tooltip title="删除">
            <Button
              className="deleteBtn"
              type="dashed"
              size="small"
              disabled={templateid?true:(index === 0)}
              onClick={this.removePortsKey.bind(this, keyValue)}
            >
              <Icon type="delete" />
            </Button>
          </Tooltip>
        </Col>
      </Row>
    )
  },
  addPortsKey() {
    const { form,fields,accessMethodType } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    var o = fields;
    var key = Object(o);
    var keys = Object.keys(o);
    var values = Object.values(o);
    const listArr = keys.filter(value => {
      if (value.indexOf('portPro') != -1 && (o[value].value).indexOf('HTTP') != -1) {
        if (value.length != 0) {
          return value
        }
      }
    })
    let mappingPortAutoFlag
    let portsKeys = getFieldValue('portsKeys') || []
    const portsKeysList = portsKeys.filter(value=>{
      if(!value.deleted){
        return value
      }
    });
    var count=0;
    portsKeysList.forEach(key =>{
      for(var i=0;i<listArr.length;i++){
        if(listArr[i].indexOf(key.value)>=0){
          count++;
        }
      }
    });
    if (count > 1) {
       const notification = new NotificationHandler()
       notification.warn('相同服务不能同时暴露两个HTTP协议')
       return false;
    }
    const accessMethod = getFieldValue('accessMethod')
    const validateFieldsKeys = []
    portsKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      validateFieldsKeys.push(`port${keyValue}`)
      validateFieldsKeys.push(`portProtocol${keyValue}`)
      const portProtocolValue = getFieldValue(`portProtocol${keyValue}`)
      if (portProtocolValue === 'TCP' && accessMethod !== 'Cluster') {
        validateFieldsKeys.push(`mappingPortType${keyValue}`)
        const mappingPortTypeValue = getFieldValue(`mappingPortType${keyValue}`)
        if (mappingPortTypeValue === MAPPING_PORT_SPECIAL) {
          validateFieldsKeys.push(`mappingPort${keyValue}`)
        }
      }
    })
    validateFields(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      let uid = portsKeys[portsKeys.length - 1].value || 0
      uid ++
      portsKeys = portsKeys.concat({ value: uid })
      if(accessMethodType == 'Cluster'){
        setFieldsValue({
          portsKeys,
          [`portProtocol${uid}`]: 'TCP',
        })
      }else{
        setFieldsValue({
          portsKeys,
          [`portProtocol${uid}`]: 'HTTP',
        })
      }
      setTimeout(()=>{
        let input = document.getElementById(`port${uid}`);
        input && input.focus()
      },0)
      
    })
  },
  render() {
    const { formItemLayout, form,templateid } = this.props
    const { getFieldValue } = form
    // must set a port
    const portsKeys = getFieldValue('portsKeys') || []
    return (
      <Row className="portsConfigureService">
        <Col span={formItemLayout.labelCol.span} className="formItemLabel">
          映射端口
        </Col>
        <Col span={formItemLayout.wrapperCol.span}>
          <div className="portList">
            <Row className="portsHeader">
              <Col span={5}>
                容器端口
              </Col>
              <Col span={5}>
                协议
              </Col>
              <Col span={9}>
                映射服务端口
              </Col>
              <Col span={5}>
                操作
              </Col>
            </Row>
            <div className="portsBody">
              {portsKeys.map(this.renderPortItem)}
            </div>
            <span style={{display:templateid?'none':''}} className="addPort" onClick={this.addPortsKey}>
              <Icon type="plus-circle-o" />
              <span>添加映射端口</span>
            </span>
          </div>
        </Col>
      </Row>
    )
  }
})
function mapStateToPropsaaa() {
  return {
  }
}

export default connect(mapStateToPropsaaa, {
  loadFreeVolumePort,
})(Ports)