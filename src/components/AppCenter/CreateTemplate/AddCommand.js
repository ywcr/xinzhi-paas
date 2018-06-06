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
        }
    }

    componentWillMount(){
        const {scope}=this.props
        let dataTime=new Date().getTime()
        scope.setState({
            commandKeys:scope.state.commandKeys.concat({"value":dataTime})
        })
    }
    checkContainerPort(key, rule, value, callback){
        if (!value) {
            return callback()
        }
        callback()
    }

    removeCommand=(keyValue)=>{
        const { form ,scope} = this.props
        const { setFieldsValue, getFieldValue } = form

        let commandKeys=scope.state.commandKeys;
        commandKeys.map((item,index)=>{
            if(item.value==keyValue){
                commandKeys.splice(index,1)
            }
        })

        scope.setState({
            'commandKeys':commandKeys
        })
    }

    renderCommand=(key, index)=>{
        // 根据 `deleted` 字段来决定是否渲染
        const {scope} = this.props
        const _this=this;
        let commandKeys=scope.state.commandKeys

        if (key.deleted) {
            return
        }
        const keyValue = key.value
        const { form, currentCluster } = this.props
        const { getFieldProps, getFieldValue,setFieldsValue } = form
        const portKey = `command${keyValue}`
        const portProps = getFieldProps(portKey, {
            rules: [
                { required: true, message: '请输入启动命令' },
                { validator: this.checkContainerPort.bind(this,keyValue) }
            ],
        })

        return (
            <Row className="portItem" key={`portItem${keyValue}`}>
                <Col span={8}>
                    <FormItem>
                        <Input width='300px' size="default"  {...portProps} />
                    </FormItem>
                </Col>

                <Col span={4}>
                    <Tooltip title="删除">
                        <Button
                            className="deleteBtn"
                            type="dashed"
                            size="small"
                            onClick={this.removeCommand.bind(this, keyValue)}
                        >
                            <Icon type="delete" />
                        </Button>
                    </Tooltip>
                </Col>
            </Row>
        )
    }
    addCommand=()=>{
        const { form ,scope} = this.props
        const { setFieldsValue, getFieldValue, validateFields } = form
        const validateFieldsKeys = []
        let commandKeys=scope.state.commandKeys

        const accessMethod = getFieldValue('accessMethod')

        commandKeys.forEach(key => {
            if (key.deleted) {
                return
            }
            const keyValue = key.value
            validateFieldsKeys.push(`command${keyValue}`)
        })
        validateFields(validateFieldsKeys, (errors, values) => {
            if (!!errors) {
                return
            }
            let uid =commandKeys.length>0?(commandKeys[commandKeys.length - 1].value || 0):0
            uid ++
            commandKeys = commandKeys.concat({ value: uid })

            setTimeout(()=>{
                let input = document.getElementById(`port${uid}`);
                input && input.focus()
            },0)

            const portId=new Date().getTime();
            const {scope}=this.props

            scope.setState({
                commandKeys:scope.state.commandKeys.concat({"value":portId})
            })

        })
    }
    render() {
        const { formItemLayout, form,scope } = this.props
        const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } =form;

        let commandKeys=scope.state.commandKeys
        // must set a port

        return (
            <Row className="portsConfigureService">
                <Col span={formItemLayout.wrapperCol.span}>
                    <div className="portList">
                        <div className="commandBody">
                            {commandKeys.map(this.renderCommand)}
                        </div>
                        <span className="addPort" onClick={this.addCommand}>
                          <Icon type="plus-circle-o" />
                          <span>添加一个启动命令</span>
                        </span>
                    </div>
                </Col>
            </Row>
        )
    }
}

export default AddPort
