/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: select image
 *
 * v0.1 - 2017-05-03
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Input, Select,Tabs,Slider, InputNumber,Modal,Upload, Button, Form, Icon ,message, Radio } from 'antd'
import {searchPublicImages, searchFavoriteImages, searchPrivateImages, publicFilterServer} from '../../../actions/app_center'
import { loadAllProject,loadRepositoriesTags, searchHarborPublicImages, searchHarborPrivateImages } from '../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../constants'
const standard = require('../../../../configs/constants').STANDARD_MODE
const mode = require('../../../../configs/model').mode
import "../style/ImageStore.less"
const standardFlag = mode === standard
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane
const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;
class PreviewConfig extends Component {

    constructor(props) {
        super(props)
        this.state={}
    }
    handleReset=()=>{
        const {scope}=this.props
        scope.setState({
            previewConfigModal:false
        })
    }
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
    }
    componentWillMount(){
        const {scope} = this.props;
        const {getFieldValue} = scope.props.form
        this.setTemplateContent(getFieldValue('defineConfig'))
    }
    componentWillReceiveProps(nextProps) {
        const {scope} = this.props;
        const {getFieldValue} = scope.props.form
        this.setTemplateContent(getFieldValue('defineConfig'))
    }
    handleSubmit(e) {
        // e.preventDefault();
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
            return;
            }
        });
    }
    render() {
        const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
        
        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 16 },
        };
        const rules = [
            { required: true,message:'请输入'}
        ]
        return(
            <div id="previewConfig">
                <Form horizontal >
                    <div className='infoBox'>
                        {
                            this.state.templateData.map((item)=>{
                                switch(item.label){
                                    case '@input' :
                                    case '@input;' :
                                    case '@input,' :
                                        return (<FormItem {...formItemLayout} label={item.name} >
                                            <Input {...getFieldProps(item.key, {
                                                rules : [
                                                    { required: true,message:'请输入'+item.name}
                                                ]
                                            })} placeholder={"请输入"+item.name}
                                            />
                                        </FormItem>)
                                    break;
                                    case "@select":
                                    case "@select,":
                                    case "@select;":
                                        const selectOption = item.content.split(',').map((item)=>{
                                            return (<Option key={item}>{item}</Option>)
                                        })
                                        return (<FormItem {...formItemLayout} label={item.name} >
                                            <Select {...getFieldProps(item.key, {
                                                initialValue:item.content.split(',')[0]
                                            })} placeholder={"请选择"+item.name} style={{ width: '100%' }}>
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
                                            <Select {...getFieldProps(item.key, {
                                                initialValue:item.content.split(',')[0],
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
                    <div className='btnBox'>
                        <Button type='primary' size='large' onClick={()=>this.handleReset()}>
                            确定
                        </Button>
                    </div>
                </Form>
            </div>
        )
    }
}
function mapStateToProps(state, props) {
    const { cluster, unit } =  state.entities.current
    const oemInfo = state.entities.loginUser.info.oemInfo || {}
    const { productName } = oemInfo.company || {}
    return {
        images: state.harbor.allProject,
        cluster: cluster.clusterID,
        unit,
        productName
    }
}

PreviewConfig=createForm()(PreviewConfig)

export default connect(mapStateToProps, {
    searchPublicImages,
    searchFavoriteImages,
    searchPrivateImages,
    publicFilterServer,
    loadAllProject,
    loadRepositoriesTags
})(PreviewConfig)