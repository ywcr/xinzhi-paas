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

import React, { PropTypes,Component } from 'react'
import {Form, Row, Col,Input, InputNumber, Select, Button, Icon, Tooltip
} from 'antd'
import { isDomain } from '../../../common/tools'
import '../style/addProt.less'

const FormItem = Form.Item
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
            portValue:['TCP']
        }
    }
    componentWillMount(){
        const {scope}=this.props
        let dataTime=new Date().getTime()
        scope.setState({
            portsKeys:scope.state.portsKeys.concat({"value":dataTime})
        })
    }
    checkContainerPort(key, rule, value, callback){
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
        // 根据 `deleted` 字段来决定是否渲染
        const {scope} = this.props
        const _this=this;
        let portsKeys=scope.state.portsKeys

        if (key.deleted) {
            return
        }
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
        const portProps = getFieldProps(portKey, {
            rules: [
                { required: true, message: '请输入容器端口' },
                { validator: this.checkContainerPort.bind(this,keyValue) }
            ],
        })
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
        const mappingPortTypeProps=getFieldProps(mappingPportTypeKey,{
            rules: [
                { required: true, message: '请选择端口类型' },
            ],
            initialValue:'0',
            onChange:function(value){
                form.resetFields([portProtocolKey])
                portVal[index]='TCP'
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
            },
            initialValue:'0'
        })

        return (
            <Row className="portItem" key={`portItem${keyValue}`}>
                <Col span={6}>
                    <FormItem>
                        <InputNumber size="default" min={MIN} max={MAX} {...portProps} />
                    </FormItem>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col>
                            <FormItem>
                                <Select size="default" {...mappingPortTypeProps}>
                                    <Option value='0'>内部端口</Option>
                                    <Option value='1'>外部端口</Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <FormItem>
                        <Select size="default"   {...portProtocolProps}>
                            <Option value="TCP" key="TCP">TCP</Option>
                            {
                                mappingPortTypeValue=='0'?
                                    <Option value="UDP" key="UDP" disabled={_this.state.udpSelected}>  {_this.state.udpSelected}
                                        {_this.state.httpSelected}UDP</Option>:
                                    <Option value="HTTP" key="HTTP" style={{'display':'none'}} disabled={_this.state.httpSelected}>HTTP</Option>
                            }
                        </Select>
                    </FormItem>
                </Col>

                <Col span={6}>
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
        const validateFieldsKeys = []
        let portsKeys=scope.state.portsKeys

        const accessMethod = getFieldValue('accessMethod')

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
                {/*<Col span={formItemLayout.labelCol.span} className="formItemLabel">*/}
                    {/*映射端口*/}
                {/*</Col>*/}
                <Col span={formItemLayout.wrapperCol.span}>
                    <div className="portList">
                        <Row className="portsHeader">
                            <Col span={6}>
                                容器端口
                            </Col>
                            <Col span={6}>
                                端口类型
                            </Col>
                            <Col span={6}>
                                协议
                            </Col>
                            <Col span={6}>
                                操作
                            </Col>
                        </Row>
                        <div className="portsBody">
                               {portsKeys.map(this.renderPortItem)}
                        </div>
                        <span className="addPort" onClick={this.addPortsKey}>
                          <Icon type="plus-circle-o" />
                          <span>添加映射端口</span>
                        </span>
                    </div>
                </Col>
            </Row>
        )
    }
}

export default AddPort
