/**
 * Licensed Materials - Property of enncloud.com
 * (C) Copyright 2017 ennCloud. All Rights Reserved.
 */

/**
 * Create app: ports configure for Network isolation
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

class AddFrom extends Component{
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
            FromKeys:scope.state.FromKeys.concat({"value":dataTime})
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
        const FromKeys = getFieldValue('FromKeys') || []
        let error
        FromKeys.every(_key => {
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
        const FromKeys = getFieldValue('FromKeys') || []
        let error
        FromKeys.every(_key => {
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

        let FromKeys=scope.state.FromKeys;
        FromKeys.map((item,index)=>{
            if(item.value==keyValue){
                FromKeys.splice(index,1)
            }
        })

        scope.setState({
            'FromKeys':FromKeys
        })
    }

    renderFromItem=(key, index)=>{
        // 根据 `deleted` 字段来决定是否渲染
        const {scope,datalistCurrent} = this.props
        const _this=this;
        let FromKeys=scope.state.FromKeys
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
        let arrayListPort = datalistCurrent[0].ingress[0]
        const portValue = arrayListPort.port;

        let portProtocol=false,mappingType=false

        let portVal=_this.state.portValue;
            portVal[index]=portProtocoValue
        const portProps = getFieldProps(portKey, {
            rules: [
                { required: true, message: '请输入端口' },
                { validator: this.checkContainerPort.bind(this,keyValue) }
            ],
            initialValue: portValue[index] ? portValue[index].port : ''
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
            initialValue: portValue[index] ? portValue[index].protocol : 'TCP',
            onChange:function(value){
                form.resetFields([portProtocolKey])
                _this.setState({
                    initialfrompod:value?value:'pod',
                    cities: cityData[value],
                    secondCity: cityData[value][0],
                    portValue:portVal
                });
            }
        })

        return (
            <Row className="portItem" key={`portItem${keyValue}`}>
            <Col span={8}>
                    <Row>
                        <Col>
                            <FormItem>
                                <Select size="default" {...mappingPortTypeProps}>
                                    <Option value='TCP'>TCP</Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                </Col>
                <Col span={8}>
                    <FormItem>
                        <InputNumber size="default" min={MIN} max={MAX} {...portProps} />
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
    addFromsKey=()=>{
        const { form ,scope} = this.props
        const { setFieldsValue, getFieldValue, validateFields } = form
        const validateFieldsKeys = []
        //  FromKeys:Froms,
        let FromKeys=scope.state.FromKeys

        const accessMethod = getFieldValue('accessMethod')

        FromKeys.forEach(key => {
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
            let uid = FromKeys[FromKeys.length - 1].value || 0
            uid ++
            FromKeys = FromKeys.concat({ value: uid })
            setFieldsValue({
                FromKeys,
                [`portProtocol${uid}`]: 'TCP',
            })
            setTimeout(()=>{
                let input = document.getElementById(`port${uid}`);
                input && input.focus()
            },0)

            const portId=new Date().getTime();
            const {scope}=this.props

            scope.setState({
                FromKeys:scope.state.FromKeys.concat({"value":portId})
            })

        })
    }
    render() {
        const { formItemLayout, form,scope } = this.props
        const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } =form;

        let FromKeys=scope.state.FromKeys
        // must set a port

        return (
            <Row className="portsConfigureService">
                <Col>
                    <div className="portList">
                        <Row className="portsHeader">
                            <Col span={8}>
                            协议
                            </Col>
                            <Col span={8}>
                            端口
                            </Col>
                            <Col span={8}>
                                操作
                            </Col>
                        </Row>
                        <div className="portsBody">
                               {FromKeys.map(this.renderFromItem)}
                        </div>
                        <span className="addPort" onClick={this.addFromsKey}>
                          <Icon type="plus-circle-o" />
                          <span>添加端口</span>
                        </span>
                    </div>
                </Col>
            </Row>
        )
    }
}

export default AddFrom
