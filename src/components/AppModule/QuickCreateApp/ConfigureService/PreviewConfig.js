/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Input, Select,Tabs,Slider, InputNumber,Modal,Upload, Button, Form, Icon ,message, Radio,Row,Col } from 'antd'
// import "../style/ImageStore.less"

const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane
const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;

const PreviewConfig = React.createClass({

    setTemplateContent(content){
        const contents = content.split('\n');
        const template = []
        contents.map((item,index)=>{
            if(item.indexOf('@input')!=-1||item.indexOf('@select')!=-1||item.indexOf('@checkbox')!=-1){
                const cont = item.split(' =');
                const val = cont[1].indexOf('{')!=-1?cont[1].split('{'):[cont[1]]
                const data = {
                    'content':val[1]?val[1].replace(/\}$/gi,""):'',
                    'key':cont[0].replace(/\s+/g,"").slice(cont[0].replace(/\s+/g,"").indexOf(':')+1),
                    'name':cont[0].replace(/\s+/g,"").split(':')[0],
                    'label':val[0].replace(/\s+/g,"")
                }
                template.push(data)
            }
        })
        this.setState({
            'templateData':template
        })
    },
    componentWillMount(){
        const {scope,config} = this.props;
        // this.props.form.resetFields();
        this.setTemplateContent(config)
    },
    componentWillReceiveProps(nextProps) {
        // const {scope,config} = this.props;
        // this.props.form.resetFields();
        // this.setTemplateContent(config)
    },
    handleSubmit(e) {
        // e.preventDefault();
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
            return;
            }
        });
    },
    render() {
        const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 },
        };
        const rules = [
            { required: true,message:'请输入'}
        ]
        return(
            <div id="previewConfig">
                <Row className="configBoxHeader" style={{margin:'40px 0 20px 0'}} key="header">
                <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
                    <div className="line"></div>
                    <span className="title">配置文件</span>
                </Col>
                <Col span={formItemLayout.wrapperCol.span} key="right">
                    <div className="desc">在配置文件里，您可以修创建配置文件</div>
                </Col>
                </Row>
                {
                    this.state.templateData.map((item,index)=>{
                        switch(item.label){
                            case '@input' :
                            case '@input;' :
                            case '@input,' :
                                return (<FormItem {...formItemLayout} label={item.name} >
                                    <Input {...getFieldProps(item.key+'$config', {
                                        rules : [
                                            { required: true,message:'请输入'+item.name}
                                        ]
                                    })} placeholder={"请输入"+item.name}
                                    />
                                </FormItem>)
                            break;
                            case "@select":
                            case "@select;":
                            case "@select,":
                                const selectOption = item.content.split(',').map((item)=>{
                                    return (<Option key={item}>{item}</Option>)
                                })
                                return (<FormItem {...formItemLayout} label={item.name} >
                                    <Select {...getFieldProps(item.key+'$config', {
                                        rules : [
                                            { required: true,message:'请选择'+item.name}
                                        ]
                                    })} defaultValue={item.content.split(',')[0]} placeholder={"请选择"+item.name} style={{ width: '100%' }}>
                                        {selectOption}
                                    </Select>
                                </FormItem>)
                            break;
                            case "@checkbox":
                            case "@checkbox;":
                            case "@checkbox,":
                                const checkboxOption = item.content.split(',').map((item)=>{
                                    return (<Option key={item}>{item}</Option>)
                                })
                                return (<FormItem {...formItemLayout} label={item.name} >
                                    <Select {...getFieldProps(item.key+'$config', {
                                        rules : [
                                            { required: true,message:'请选择'+item.name}
                                        ]
                                    })} multiple placeholder={"请选择"+item.name} >
                                            {checkboxOption}
                                    </Select>
                                </FormItem>)
                            break;
                        }
                    })
                }
            </div>
        )
    }
})

export default PreviewConfig
