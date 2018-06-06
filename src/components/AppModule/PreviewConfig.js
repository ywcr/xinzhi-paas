/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Input, Select,Tabs,Slider, InputNumber,Modal,Upload, Button, Form, Icon ,message, Radio,Row,Col } from 'antd'
// import "../style/ImageStore.less"
import { updateConfigName } from '../../actions/configs'
import NotificationHandler from '../../common/notification_handler'
import {quickRestartServices} from '../../actions/services'


const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane
const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;

let PreviewConfig = React.createClass({

    setTemplateContent(content){
        const contents = content.split('\n');
        const template = []
        contents.map((item,index)=>{
            
            if(item.indexOf(' #')!=-1){
                const itemArr = item.split(' #')
                if(itemArr[1].indexOf('@input')!=-1||itemArr[1].indexOf('@select')!=-1||itemArr[1].indexOf('@checkbox')!=-1){
                    const cont = itemArr[1].split(' =');
                    const val = cont[1].indexOf('{')!=-1?cont[1].split('{'):[cont[1]]
                    const data = {
                        'content':val[1]?val[1].replace(/\}$/gi,""):'',
                        'key':cont[0].replace(/\s+/g,"").slice(cont[0].replace(/\s+/g,"").indexOf(':')+1),
                        'name':cont[0].replace(/\s+/g,"").split(':')[0],
                        'label':val[0].replace(/\s+/g,""),
                        'val':itemArr[0].split(' ')[1]
                    }
                    template.push(data)
                }
                
            }
        })
        this.setState({
            'templateData':template
        })
    },
    componentWillMount(){
        const {scope,config} = this.props;
        for(var configs in config.data){
            this.setTemplateContent(config.data[configs])
        }
        // this.props.form.resetFields();
    },
    componentWillReceiveProps(nextProps) {
        // const {scope,config} = this.props;
        // this.props.form.resetFields();
        // this.setTemplateContent(config)
    },
    handleSubmit(e) {
        e.preventDefault();
        const { config,cluster,scope,updateConfigName,quickRestartServices,database } = this.props;
        const { getFieldsValue } = this.props.form;
        const notification = new NotificationHandler()
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
            return;
            }
            const fields = this.props.form.getFieldsValue()
            for (var configs in config.data){
                const content = config.data[configs]
                const sliceContent = content?content.split('\n'):'';
                for(let vall in fields){
                    if(vall.indexOf('$config')!=-1){
                        sliceContent.map((val,index)=>{
                            const keys = vall.split('$')[0]
                            if(val.indexOf('@')!=-1&&val.indexOf(keys)!=-1){
                                sliceContent[index] = keys+' '+fields[vall] +' #'+val.split(' #')[1]
                            }
                        })
                    } 
                }
                const groups = {
                    group: config.objectMeta.name, name:configs,
                    cluster,
                    desc: sliceContent.join('\n')
                  }
                updateConfigName(groups, {
                    success: {
                      func: () => {
                        notification.success('修改配置文件成功')
                        quickRestartServices(cluster,[database.objectMeta.name],{},'appstore')
                        scope.refurbishDetail();
                      },
                      isAsync: true
                    }
                  }); 
              }
        });
    },
    chongzhi(){
        this.props.form.resetFields();
    },
    submit(){
        
        
        
                       
        
    },
    render() {
        const { getFieldProps, getFieldError, isFieldValidating, getFieldValue,resetFields } = this.props.form;
        
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 },
        };
        const rules = [
            { required: true,message:'请输入'}
        ]
        return(
            <div className='modalDetailBox' id="dbClusterDetailInfo">
            <div className='configContent'>
            <div id="previewConfig" style={{'marginTop':'40px'}}>
                <Form horizontal onSubmit={this.handleSubmit} >
                { this.state.templateData.length!=0?(
                    this.state.templateData.map((item,index)=>{
                        switch(item.label){
                            case '@input' :
                            case '@input;' :
                            case '@input,' :
                                return (<FormItem {...formItemLayout} label={item.name} >
                                    <Input {...getFieldProps(item.key+'$config', {
                                        rules : [
                                            { required: true,message:'请输入'+item.name}
                                        ],
                                        initialValue:item.val
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
                                        ],
                                        initialValue:item.val
                                    })} defaultValue={item.content.split(',')[0]} placeholder={"请选择"+item.name} style={{ width: '100%' }}>
                                        {selectOption}
                                    </Select>
                                </FormItem>)
                            break;
                            case "@checkbox":
                            case "@checkbox;":
                            case "@checkbox,":
                                const initVal = item.val.replace(/(^\s*)|(\s*$)/g, "").split(',')
                                const checkboxOption = item.content.split(',').map((item)=>{
                                    return (<Option key={item}>{item}</Option>)
                                })
                                return (<FormItem {...formItemLayout} label={item.name} >
                                    <Select {...getFieldProps(item.key+'$config', {
                                        rules : [
                                            { required: true,message:'请选择'+item.name}
                                        ],
                                        initialValue:initVal
                                    })} multiple placeholder={"请选择"+item.name} >
                                            {checkboxOption}
                                    </Select>
                                </FormItem>)
                            break;
                        }
                    })
                    ):<div style={{'textAlign':'center'}}>暂无可修改参数！</div>
                }
                {
                this.state.templateData.length!=0?<div style={{'marginLeft':'105px'}}><Button style={{'marginRight':'10px'}} onClick={this.chongzhi}>重置</Button><Button type="primary" htmlType="submit">确定</Button></div>:''
                
                }
                </Form>
            </div>
            </div>
            </div>
        )
    }
})

// export default PreviewConfig

PreviewConfig = Form.create()(PreviewConfig);

PreviewConfig.PropTypes = {
    updateConfigName: PropTypes.func.isRequired,
    quickRestartServices: PropTypes.func.isRequired,
}

export default connect('', {
    updateConfigName,quickRestartServices
  })(PreviewConfig)