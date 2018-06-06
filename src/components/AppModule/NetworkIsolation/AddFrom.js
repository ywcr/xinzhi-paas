/**
 * Licensed Materials - Property of enncloud.com
 * (C) Copyright 2017 ennCloud. All Rights Reserved.
 */

/**
 * Create app: ports configure for Network isolation
 *
 * v0.1 - 2017-12-11
 * @author Zhanghy
 */

import React, { PropTypes,Component } from 'react'
import {Form, Row, Col,Input, InputNumber, Select, Button, Icon, Tooltip
} from 'antd'
import { isDomain } from '../../../common/tools'
import '../style/addProt.less'
import {USERNAME_REG_EXP_NEW} from '../../../constants/index'
const FormItem = Form.Item
const createForm = Form.create;
const Option = Select.Option
const MIN = 1
const SPECIAL_MIN = 10000
const MAX = 65535
const MAPPING_PORT_AUTO = 'auto'
const MAPPING_PORT_SPECIAL = 'special'
class AddPort extends Component{
    constructor(props){
        super(props)
        this.state={
            updOptionsDisabled:false,
            httpOptionDisabled:false,
            httpSelected:false,
            udpSelected:false,
            portValue:['TCP'],
            valueKey:'',
            initialfrom:'pod',
            // portKey:'',
            portKeyPod:'',
            initialfrompod:'service' ,
            portKeyService:'pod',
            portKeyNamespace:'',
        }
       this.handleProvinceChange = this.handleProvinceChange.bind(this)
       this.onSecondCityChange = this.onSecondCityChange.bind(this)

        // this.selectOptionAddPort = this.selectOptionAddPort.bind(this)
        
    }
    componentWillMount(){
        const {scope}=this.props
        let dataTime=new Date().getTime()
        scope.setState({
            portsKeys:scope.state.portsKeys.concat({"value":dataTime+100})
        })
    }
    handleProvinceChange(value,index){
      }
      onSecondCityChange(value,index){
         
        this.setState({
          secondCity: value,
        });
      }
    checkContainerPort(key, rule, value, callback){
        if (!value) {
            return callback()
        }
        const { getFieldValue } = this.props.form
        const portsKeys = getFieldValue('portsKeys') || []
        let error

        this.setState({
            valueKey:value
        })
        portsKeys.every(_key => {
            const port = getFieldValue(`port${_key.value}`)
            if (_key.value !== key && value === port) {
                error = '已填写过该名称'
                return false
            }
            return true
        })
        callback(error)
    }
    checkMappingPort=(key, rule, value, callback)=>{
        if (!value) {
            return callback()
        }
        if (value < SPECIAL_MIN || value > MAX) {
            return callback(`容器端口范围为${SPECIAL_MIN}~${MAX}`)
        }
        const { getFieldValue } = this.props.form
        const portsKeys = getFieldValue('portsKeys') || []
        let error
        portsKeys.every(_key => {
            const mappingPort = getFieldValue(`mappingPort${_key}`)
            if (_key !== key && value === mappingPort) {
                error = '已填写过该端口'
                return false
            }
            return true
        })
        callback(error)
    }
    removePortsKey=(keyValue)=>{
        const { form ,scope} = this.props
        const { setFieldsValue, getFieldValue } = form

        let portsKeys=scope.state.portsKeys;
        portsKeys.map((item,index)=>{
            if(item.value==keyValue){
                 portsKeys.splice(index,1)
            }
        })

        scope.setState({
            'portsKeys':portsKeys
        })
    }

    renderPortItem=(key, index)=>{
        const _this = this
        // 根据 `deleted` 字段来决定是否渲染
        const {scope,teamspaces,servicesList} = this.props
        let portsKeys=scope.state.portsKeys
        let ServiceList = servicesList
        let Services =[]
        if(ServiceList.length!=0){
            Services  = ServiceList.map((item)=>{
                let Service = item.service
                let ServicelistObj = []
                ServicelistObj.push(Service)
                return ServicelistObj.map((item)=>{
                
                    return item.metadata
                
                    //  return item.metadata
                })
            }) 
        }
            let containerLists = scope.state.containerList
      let containerObj = containerLists.map((item)=>{
           let containers = item.metadata
           let container = []
          container.push(containers)
           return container[0].name
        })
        if (key.deleted) {
            return
        }
      let teamspace= teamspaces.map((item)=>{
          return item.spaceName
         })
        const keyValue = key.value


        const { form, currentCluster } = this.props
        const { getFieldProps, getFieldValue,setFieldsValue } = form
        const { bindingDomains } = currentCluster
        const accessMethod = getFieldValue('accessMethod')
        const httpOptionDisabled = !isDomain(bindingDomains)
        const portKey = `port${keyValue}`
        const portProtocolKey = `portProtocol${keyValue}`
        const mappingPportTypeKey = `mappingPortType${keyValue}`
        const mappingPortKey = `mappingPort${keyValue}`


        let mappingPortTypeValue = getFieldValue(mappingPportTypeKey)
        let portProtocoValue=getFieldValue(portProtocolKey)


        if(!mappingPortTypeValue){
            mappingPortTypeValue='0'
        }
        if(!portProtocoValue){
            portProtocoValue='TCP'
        }


        let portProtocol=false,mappingType=false

        let portVal=_this.state.portValue;
            portVal[index]=portProtocoValue
        const portProtocolProps = getFieldProps(portProtocolKey, {
            rules: [
                { required: true, message: '请选择端口协议' },
            ],
            initialValue:'TCP',
            onChange:function (value) {
                portVal[index]=value
                _this.setState({
                    portValue:portVal
                })

                if(_this.state.portValue.indexOf('HTTP')!=-1){
                    _this.setState({
                        udpSelected:true
                    })
                }else if(_this.state.portValue.indexOf('UDP')!=-1){
                    _this.setState({
                        httpSelected:true
                    })
                }else if(_this.state.portValue.indexOf('HTTP')==-1&&_this.state.portValue.indexOf('UDP')==-1){
                    _this.setState({
                        udpSelected:false,
                        httpSelected:false
                    })
                }
            }
        })
        const mappingFromTypeProps=getFieldProps(mappingPportTypeKey,{
            rules: [
                { required: true, message: '请选择端口类型' },
            ],
            onChange:function(value){
                form.resetFields([portProtocolKey])
                _this.setState({
                    initialfrompod:value,
                    fromValue:portVal
                });
            },
            initialValue: this.state.initialfrompod=='service'?'service':'namespace',
        })
        const fromProps = getFieldProps(portKey, {
            rules: [
                { required: true, message: '请输入名称' },
            ],
            onChange:function(value){
                form.resetFields([portProtocolKey])
                portVal[index]='TCP'
                _this.setState({
                    valueKey:value
                })
            },
        })
        // const provinceOptions = provinceData.map((province,index) => <Option  key={province}>{province}</Option>);

        return (
            <Row className="portItem" key={`portItem${keyValue}`}>
            <Col span={8}>
                    <Row>
                        <Col>
                            <FormItem>
                                 {/* <Select id={index+1} style={{ width: 150 }} {...mappingPortTypeProps}>
                        {provinceOptions}
                        </Select> */}
                          <Select size="default" {...mappingFromTypeProps}>
                                    <Option disabled value='pod'>容器(暂不支持)</Option>
                                    <Option value='service'>服务</Option>
                                    <Option value='namespace'>空间</Option>

                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                </Col>
                <Col span={8}>
                    <FormItem>
                        {this.state.initialfrompod == 'pod'?
                         <Select showSearch
                         {...fromProps}
                             // style={{ width: 150 }}
                             placeholder="请选择名称"
                             optionFilterProp="children"
                             notFoundContent="无法找到"
                             dorpdownStyle={{position:'absolute',top:0,left:0,width:"100%"}}
                            //  value={this.state.portKeyPod}
                            //  onChange={ this.handleChangePod}
                         >
                         {containerObj.map((item)=>{
                                             return <Option value={item}>{item}</Option>
                         })}
                         </Select>:(this.state.initialfrompod == 'service'?<Select showSearch
                         {...fromProps}
                             // style={{ width: 150 }}
                             placeholder="请选择名称"
                             optionFilterProp="children"
                             notFoundContent="无法找到"
                             dorpdownStyle={{position:'absolute',top:0,left:0,width:"100%"}}
                            //   value={this.state.portKeyService}
                            //  onChange={ this.handleChangeService}
                         >
                         {Services.map((item,index)=>{
                                             return <Option value={item[0].name}>{item[0].name}</Option>
                         })}
                         </Select>:(this.state.initialfrompod == 'namespace'?<Select showSearch
                         {...fromProps}
                             // style={{ width: 150 }}
                             placeholder="请选择名称"
                             optionFilterProp="children"
                             notFoundContent="无法找到"
                             dorpdownStyle={{position:'absolute',top:0,left:0,width:"100%"}}
                            //   value={this.state.portKeyNamespace}
                            //  onChange={ this.handleChangeNamespace}
                         >
                         {teamspaces.map((item)=>{
                                             return <Option value={item.spaceName}>{item.spaceName}</Option>
                         })}
                         </Select>:'')) 
                        
                    }
                    </FormItem>
                </Col>
                <Col span={8}>
                    <Tooltip title="删除">
                        <Button
                            className="deleteBtn"
                            type="dashed"
                            size="small"
                            disabled={index == 0}
                            onClick={this.removePortsKey.bind(this, keyValue)}
                        >
                            <Icon type="delete" />
                        </Button>
                    </Tooltip>
                </Col>
            </Row>
        )
    }
    addPortsKey=()=>{
        const { form ,scope} = this.props
        const { setFieldsValue, getFieldValue, validateFields } = form
        const validateFieldsKeysPort = []
        let portsKeys=scope.state.portsKeys

        const accessMethod = getFieldValue('accessMethod')

        portsKeys.forEach(key => {
            if (key.deleted) {
                return
            }
            const keyValue = key.value

            validateFieldsKeysPort.push(`port${keyValue}`)
            validateFieldsKeysPort.push(`portProtocol${keyValue}`)
            const portProtocolValue = getFieldValue(`portProtocol${keyValue}`)

            if (portProtocolValue === 'TCP' && accessMethod !== 'Cluster') {
                validateFieldsKeysPort.push(`mappingPortType${keyValue}`)
                const mappingPortTypeValue = getFieldValue(`mappingPortType${keyValue}`)
                if (mappingPortTypeValue === MAPPING_PORT_SPECIAL) {
                    validateFieldsKeysPort.push(`mappingPort${keyValue}`)
                }
            }
        })
        validateFields(validateFieldsKeysPort, (errors, values) => {
            if (!!errors) {
                return
            }
            let uid = portsKeys[portsKeys.length - 1].value || 0
            uid ++
            portsKeys = portsKeys.concat({ value: uid })
            setFieldsValue({
                portsKeys,
                [`portProtocol${uid}`]: 'TCP',
            })
            setTimeout(()=>{
                let input = document.getElementById(`port${uid}`);
                input && input.focus()
            },0)

            const portId=new Date().getTime();
            const {scope}=this.props

            scope.setState({
                portsKeys:scope.state.portsKeys.concat({"value":portId})
            })

        })
    }
    
    render() {
        const { formItemLayout, form,scope } = this.props
        const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } =form;
        let portsKeys=scope.state.portsKeys
        // must set a port

        return (
            <Row className="portsConfigureService">
                <Col>
                    <div className="portList">
                        <Row className="portsHeader">
                            <Col span={8}>
                            类型
                            </Col>
                            <Col span={8}>
                            值
                            </Col>
                            <Col span={8}>
                                操作
                            </Col>
                        </Row>
                        <div className="portsBody">
                               {portsKeys.map(this.renderPortItem)}
                        </div>
                        <span className="addPort" onClick={this.addPortsKey}>
                          <Icon type="plus-circle-o" />
                          <span>添加来源</span>
                        </span>
                    </div>
                </Col>
            </Row>
        )


        
    }
}

export default AddPort
