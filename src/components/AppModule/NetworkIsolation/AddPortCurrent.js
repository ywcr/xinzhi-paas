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

import React, { PropTypes, Component } from 'react'
import {
    Form, Row, Col, Input, InputNumber, Select, Button, Icon, Tooltip
} from 'antd'
import { isDomain } from '../../../common/tools'
import '../style/addProt.less'
import { USERNAME_REG_EXP_NEW } from '../../../constants/index'
const FormItem = Form.Item
const Option = Select.Option
const MIN = 1
const SPECIAL_MIN = 10000
const MAX = 65535
const MAPPING_PORT_AUTO = 'auto'
const MAPPING_PORT_SPECIAL = 'special'
const provinceData = ['pod','service','namespace'];
const cityData = {
    pod: [],
    service: [],
    namespace:[],
};
class AddPort extends Component {
    constructor(props) {
        super(props)
        this.state = {
            updOptionsDisabled: false,
            httpOptionDisabled: false,
            httpSelected: false,
            udpSelected: false,
            portValue: ['TCP'],
            valueKey: '',
            initialfrompod: 'service',
            initialfromservice:'service',
            initialfromnamespace:'namespace',
            cities: cityData[provinceData[0]],
            secondCity: cityData[provinceData[0]][0],


        }
        this.handleProvinceChange = this.handleProvinceChange.bind(this)
        this.onSecondCityChange = this.onSecondCityChange.bind(this)

    }
    componentWillMount() {
        const { scope ,datalistCurrent} = this.props
       
        let arrayListFrom = datalistCurrent[0].ingress[0]
        const formValue = arrayListFrom.from;
        let ports = []
        let dataTime = new Date().getTime()

        formValue.map((item) => {
            dataTime += 10
            ports.push({ value: dataTime })
        });
        scope.setState({
            portsKeys: ports
        })
    }

    handleProvinceChange = (value) => {

        this.setState({
            initialfrompod:value,
          cities: cityData[value],
          secondCity: cityData[value][0],
        });
      }
      onSecondCityChange = (value) => {
        this.setState({
          secondCity: value,
        });
      }
    checkContainerPort(key, rule, value, callback) {
        if (!value) {
            // return callback()
        }
        const { getFieldValue } = this.props.form
        const portsKeys = getFieldValue('portsKeys') || []
        let error
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
    checkMappingPort = (key, rule, value, callback) => {
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
                error = '已填写过该名称'
                return false
            }
            return true
        })
        callback(error)
    }
    removePortsKey = (keyValue) => {
        const { form, scope } = this.props
        const { setFieldsValue, getFieldValue } = form

        let portsKeys = scope.state.portsKeys;
        portsKeys.map((item, index) => {
            if (item.value == keyValue) {
                portsKeys.splice(index, 1)
            }
        })

        scope.setState({
            'portsKeys': portsKeys
        })
    }

    renderPortItem = (key, index) => {
        // 根据 `deleted` 字段来决定是否渲染
        const { scope, teamspaces,datalistCurrent } = this.props
      
        const _this = this;
        let portsKeys = scope.state.portsKeys
        if (key.deleted) {
            return
        }
        const keyValue = key.value
        cityData.service=scope.state.servicesList         
        cityData.pod=scope.state.containerList
   
        let teamspace= teamspaces.map((item)=>{
            return item.spaceName
           })
           cityData.namespace = teamspace
        const { form, currentCluster } = this.props
        const { getFieldProps, getFieldValue, setFieldsValue } = form
        const { bindingDomains } = currentCluster
        const accessMethod = getFieldValue('accessMethod')
        const httpOptionDisabled = !isDomain(bindingDomains)
        const portKey = `port${keyValue}`
        const portProtocolKey = `portProtocol${keyValue}`
        const mappingPportTypeKey = `mappingPortType${keyValue}`
        const mappingPortKey = `mappingPort${keyValue}`


        let mappingPortTypeValue = getFieldValue(mappingPportTypeKey)
        let portProtocoValue = getFieldValue(portProtocolKey)


        if (!mappingPortTypeValue) {
            mappingPortTypeValue = '0'
        }
        if (!portProtocoValue) {
            portProtocoValue = 'TCP'
        }
      
        let arrayListFrom = datalistCurrent[0].ingress[0]
       
        const formValue = arrayListFrom.from;
        let portProtocol = false, mappingType = false

        let portVal = _this.state.portValue;
        portVal[index] = portProtocoValue
        const portProps = getFieldProps(portKey, {
            rules: [
                { required: true, message: '请输入名称' },
                { validator: this.checkContainerPort.bind(this, keyValue) }
            ],

            initialValue: formValue[index] ? formValue[index].value : ''
        })
        const portProtocolProps = getFieldProps(portProtocolKey, {
            rules: [
                { required: true, message: '请选择端口协议' },
            ],
            initialValue: 'TCP',
            onChange: function (value) {
                portVal[index] = value
                _this.setState({
                    portValue: portVal
                })

                if (_this.state.portValue.indexOf('HTTP') != -1) {
                    _this.setState({
                        udpSelected: true
                    })
                } else if (_this.state.portValue.indexOf('UDP') != -1) {
                    _this.setState({
                        httpSelected: true
                    })
                } else if (_this.state.portValue.indexOf('HTTP') == -1 && _this.state.portValue.indexOf('UDP') == -1) {
                    _this.setState({
                        udpSelected: false,
                        httpSelected: false
                    })
                }
            }
        })
        const mappingPortTypeProps = getFieldProps(mappingPportTypeKey, {
            rules: [
                { required: true, message: '请选择端口类型' },
            ],
            
            onChange: function (value) {
                form.resetFields([portProtocolKey])
                portVal[index] = 'TCP'
                _this.setState({
                    portValuepod: portVal,
                    initialfromservice:value,
                    initialfrompod:value,
                    cities: cityData[value],
                    secondCity: cityData[value][0],
                    portValue:portVal
                })
            },
            initialValue: formValue[index] ? formValue[index].type :(this.state.initialfrompod=='service'?'service':'namespace'),
        })
        return (
            <Row className="portItem" key={`portItem${keyValue}`}>
                <Col span={8}>
                    <Row>
                        <Col>
                            <FormItem>
                            <Select size="default" {...mappingPortTypeProps}>
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
                {...portProps}
                    // style={{ width: 150 }}
                    placeholder="请选择名称"
                    optionFilterProp="children"
                    notFoundContent="无法找到"
                   //  value={this.state.portKeyPod}
                   //  onChange={ this.handleChangePod}
                >
                {scope.state.containerList.map((item)=>{
                                    return <Option value={item}>{item}</Option>
                })}
                </Select>:(this.state.initialfrompod == 'service'?<Select showSearch
                {...portProps}
                    // style={{ width: 150 }}
                    placeholder="请选择名称"
                    optionFilterProp="children"
                    notFoundContent="无法找到"
                   //   value={this.state.portKeyService}
                   //  onChange={ this.handleChangeService}
                >
                {scope.state.servicesList? scope.state.servicesList.map((item,index)=>{
                                    return <Option value={item}>{item}</Option>
                }):''}
                </Select>:(this.state.initialfrompod == 'namespace'?<Select showSearch
                {...portProps}
                    // style={{ width: 150 }}
                    placeholder="请选择名称"
                    optionFilterProp="children"
                    notFoundContent="无法找到"
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
    addPortsKey = () => {
        const { form, scope } = this.props
        const { setFieldsValue, getFieldValue, validateFields } = form
        const validateFieldsKeys = []
        let portsKeys = scope.state.portsKeys

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
            uid++
            portsKeys = portsKeys.concat({ value: uid })
            setFieldsValue({
                portsKeys,
                [`portProtocol${uid}`]: 'TCP',
            })
            setTimeout(() => {
                let input = document.getElementById(`port${uid}`);
                input && input.focus()
            }, 0)

            const portId = new Date().getTime();
            const { scope } = this.props

            scope.setState({
                portsKeys: scope.state.portsKeys.concat({ "value": portId })
            })

        })
    }
    render() {
        const { formItemLayout, form, scope } = this.props
        const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form;
        let portsKeys = scope.state.portsKeys
        // must set a port

        return (
            <Row className="portsConfigureService">
                {/*<Col span={formItemLayout.labelCol.span} className="formItemLabel">*/}
                {/*映射端口*/}
                {/*</Col>*/}
                {/* <Col span={formItemLayout.wrapperCol.span}> */}
                <Col>
                    <div className="portList">
                        <Row className="portsHeader">
                            <Col span={8}>
                                类型
                            </Col>
                            <Col span={8}>
                                值
                            </Col>
                            {/* <Col span={6}>
                                协议
                            </Col> */}
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
