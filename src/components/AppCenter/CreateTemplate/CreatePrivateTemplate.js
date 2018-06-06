/*
*Author:Dujingya
*Create time：2017-09-19 10:17
*Description:
*/
import React, { Component, PropTypes } from 'react'
import { Input, Select,Slider, InputNumber,Modal,Upload, Button, Form,Col,Row, Icon ,message, Radio } from 'antd'
import QueueAnim from 'rc-queue-anim'
import ScrollAnim from 'rc-scroll-anim'
import Animate from 'rc-animate'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { getPersonalized,isCopyright,createTemplate,uploadImage,queryImage,restoreDefault } from '../../../actions/personalized'
import { loadAppStore} from '../../../actions/app_center'

import AddPort from './AddPort'
import AddCommand from './AddCommand'
import NotificationHandler from '../../../common/notification_handler'
import { USERNAME_REG_EXP_NEW,DEFAULT_REGISTRY,DATA_STORAGE_PATH,PASSWORD_MONGODB,API_URL_PREFIX} from '../../../constants'

import SelectMirror from './SelectMirror'
import PreviewConfig from './PreviewConfig'
import YamlEditor from '../../Editor/Yaml'
const PATH_REG = /^(\/[a-zA-Z0-9]\w*\.?[a-zA-Z0-9]\w*)+(\/)?$/
import "../style/ImageStore.less"

const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;
const Dragger = Upload.Dragger;
const appStoreclassify=['数据库与缓存','Web 服务器','分布式','博客','工具','应用中间件','日志','桌面','消息','虚拟机','负载均衡','高性能计算','其他']
const notification = new NotificationHandler()
const formItemLayout = {
    labelCol: { span: 2 },
    wrapperCol: { span: 24 },
}
class CreateApp extends Component {
    constructor(props) {
        super(props);
        this.state={
            loading:false,
            mirrorListModal:false,
            mirrorRelease:[],
            logoUrl:'',
            previewConfigModal:false,
            configFile:'',
            imageId:'',
            portsKeys:[],
            commandKeys:[],
            accessType:'PublicNetwork',
            ports:[],
            udp:[],
            http:[],
            argsType:'default'

        }
        this.beforeUpload=this.beforeUpload.bind(this)
        this.handleReset=this.handleReset.bind(this)
        this.mirrorList=this.mirrorList.bind(this)
    }
    handleReset=()=>{
        const {scope}=this.props
        scope.setState({
            createTemplate:false
        })
        let ports=this.state.portsKeys.slice(0,1)
        let commandKeys=this.state.commandKeys.slice(0,1)
        this.setState({
            imageUrl:null,
            portsKeys:ports,
            commandKeys:commandKeys
        })
        this.props.form.resetFields();
    }
    componentWillReceiveProps(nextProps){
        if(!nextProps.scope.state.createTemplate){
            this.props.form.resetFields();
        }
    }
    /*选择镜像*/
    mirrorList=()=>{
        this.setState({
           mirrorListModal:true
        })
    }

    checkName(rule, value, callback) {
        if (!value) {
            return callback()
        }
        if (value.length < 6 || value.length > 16) {
            callback([new Error('长度为6~16个字符')])
            return
        }
        if (!USERNAME_REG_EXP_NEW.test(value)) {
            callback([new Error('以[a~z]开头，允许[0~9]、[-]，长度大于5，且以小写英文和数字结尾')])
            return
        }
        callback()
    }

    checkDescription(rule,value,callback){
        if (!value) {
            return callback()
        }
        if (value.length >200) {
            callback([new Error('长度不超过200个字符之间')])
            return
        }
        callback()
    }
    checkAppClassProps=(rule, value, callback)=>{
        if (!value) {
            return callback()
        }
        if (value.length==0) {
            callback([new Error('请选择应用分类')])
            return
        }
        callback()
    }

    getMirroringProps=(rule, value, callback)=>{
        if (!value) {
            return callback()
        }
        if(value.length==0){
            callback([new Error('请选择镜像')])
        }
        callback()
    }
    getVersionProps=(rule, value, callback)=>{
        if (!value) {
            return callback()
        }
        if (value.length==0) {
            callback([new Error('请选择镜像版本')])
        }
        callback()
    }
    getMountRouteProps=(rule, value, callback)=>{
        if (!value) {
            return callback()
        }
        if (value.length==0) {
            callback([new Error('请输入挂载路径')])
        }
        if(!PATH_REG.test(value)){
            callback([new Error('请输入以[/]开头的路径并符合命名规则')])
            return
        }
        callback()
    }
    getConfigProps(value){
        this.setState({
            configFile:value
        })
    }

    defineConfigPro=(rule, value, callback)=>{
        if (!value) {
            return callback()
        }
        if (value.length==0) {
            callback([new Error('请输入定义配置文件')])
        }
        callback()
    }
    isTeamspaces=(rule, value, callback)=>{
        if (!value) {
            return callback()
        }
        if (value.length==0) {
            callback([new Error('请需要关联的选择空间')])
        }
        callback()
    }


    getConfigNameProps=(rule, value, callback)=>{
        const isconfigName = /[^<>/\\\|:""\*\?]+\.\w+$/
        if (!value) {
            return callback()
        }
        if(value.length==0){
            callback([new Error('请输入配置文件名称')])
        }
        if(!isconfigName.test(value)){
            callback([new Error('文件名匹配有误,请输入正确的格式。')])
        }
        callback()
    }


    getConfigMountProps=(rule, value, callback)=>{
        if (!value) {
            return callback()
        }
        if(value.length==0){
            callback([new Error('请输入数据存储路径')])
        }
        if(!DATA_STORAGE_PATH.test(value)){
            callback([new Error('请输入以[/]开头的路径')])
            return
        }
        callback()
    }
    getConfigTypeProps=(rule, value, callback)=>{
        if (!value) {
            return callback()
        }
        if(value.length==0){
            callback([new Error('请选择数据存储路径格式')])
        }
        callback()
    }


    /*======图片上传======*/

    beforeUpload(file){
        const _this = this
        if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/gif' && file.type !== 'image/x-icon' ) {
            notification.info('只能上传 jpg、png、gif 文件哦！')
            return false
        }
        if (file.size > 2 * 1024 * 1024) {
            notification.error('图片大小应小于2M！')
            return false
        }
        // this.props.uploadImage(data,{
        //     success:{
        //         func:(res)=>{
        //             // if(res){
        //             //     const id=res.imageId.id
        //             //     _this.setState({
        //             //         imageId:id
        //             //     })
        //             // }
        //             notification.success('上传成功！')
        //         },
        //         isAsync: true
        //     }
        // })
        return false
    }


    /*预览配置文件*/
    previewConfig=()=>{
        const notification = new NotificationHandler()
        const config=this.state.configFile;
        if(config&&config.indexOf('@')!=-1){
            this.setState({
                previewConfigModal:true,
            })
        }else{
            notification.info('请根据模板定义配置文件。')
        }
    }

    createSubmit=()=>{
        const _this=this
        const {createTemplate,currentCluster}=this.props

        _this.props.form.validateFieldsAndScroll((errors, values) => {
            if (!!errors) {
                return;
            }
             let ports=[],commands=[]
            _this.state.portsKeys.map((item,index)=>{
                   let port='',proto='',portType='';
                   if(values['port'+item.value]){
                        port=values['port'+item.value]
                   }
                   if(values['portProtocol'+item.value]){
                        proto=values['portProtocol'+item.value]
                   }
                   if(values['mappingPortType'+item.value]){
                       portType=values['mappingPortType'+item.value]
                   }

                  ports.push(port+'/'+proto+'/'+portType)
            })

            _this.state.commandKeys.map((item,index)=>{
                let command=''
                if(values['command'+item.value]){
                    command=values['command'+item.value]
                }
                commands.push(command)
            })


            let portMap=[]
            ports.map((p)=>{
                if(p.indexOf('/1')>0){
                    portMap.push(p)

                }
            })

            if(portMap.length==0){
                notification.error('请至少选择一个外部端口')
                return
            }
            if(_this.state.imageUrl==''){
                notification.error('请上传应用图片LOGO')
                return
            }

            const body={
                "cluster":currentCluster.clusterID,
                "name":values.name,
                "type": 3,
                "command":JSON.stringify(commands),
                "volume_path":values.configMount+'='+values.configType,
                "ports":JSON.stringify(ports),
                "category":values.appNameClass,
                "content": this.state.configFile,
                "image":values.mirroring,
                "config_name":values.configName,
                "image_version":values.mirrorVsersion,
                "mount_path":values.mountRoute,
                "log_id":_this.state.imageUrl,
                "description":values.description,
                "space" :values.teamspaces
            }

            createTemplate(body,{
                success:{
                    func:(response)=>{
                        notification.success('创建成功')
                        _this.props.scope.setState({
                            createTemplate:false
                        })
                        let ports=this.state.portsKeys.slice(0,1)
                        let commandKeys=this.state.commandKeys.slice(0,1)
                        _this.setState({
                            imageUrl:null,
                            portsKeys:ports,
                            commandKeys:commandKeys
                        })
                        _this.props.form.resetFields();

                        const { loadAppStore } = _this.props.scope.props

                        setTimeout(function () {
                            loadAppStore(DEFAULT_REGISTRY)
                        },500)
                    }
                }
            })
        })
    }

    render() {
        const _this=this;
        const {form,teams,current,loginUser}=this.props
        const { getFieldProps, getFieldError, isFieldValidating,validateFields, getFieldValue } =form;
        const {createTemplate,currentCluster}=this.props
        this.state.loginUser = loginUser

        const nameProps = getFieldProps('name', {
            rules: [
                { required: true, whitespace: true ,message:'请输入应用名称'},
                { validator: this.checkName },
            ],
        });
        const getAppName=getFieldProps('appNameClass',{
            rules: [
                { required: true, whitespace: true ,message:'请选择应用分类'},
                { validator: this.checkAppClassProps},
            ]
        })

        const getMirroring=getFieldProps('mirroring',{
            rules: [
                { required: true, whitespace: true ,message:'请选择镜像'},
                { validator: this.getMirroringProps},
            ]
        })
        const getMirroringVersion=getFieldProps('mirrorVsersion',{
            rules: [
                { required: true, whitespace: true ,message:'请选择镜像版本'},
                { validator: this.getVersionProps},
            ]
        })

        const getMountRoute=getFieldProps('mountRoute',{
            rules: [
                { required: true, whitespace: true ,message:'请输入挂载路径'},
                { validator: this.getMountRouteProps},
            ]
        })
        const defineConfig=getFieldProps('defineConfig',{
            rules:[
                { required: true, whitespace: true ,message:'请输入定义配置文件'},
                { validator: this.defineConfigPro},

            ],
            onChange: (e) => {
                this.getConfigProps(e.target.value)
            },
        })
        const descriptionProps=getFieldProps('description',{
            rules: [
                { validator: this.checkDescription },
            ],
        })
        const teamspacesProps = getFieldProps('teamspaces',{
            rules: [
                { required: true, message:'请选择空间'},
                { validator: this.isTeamspaces},
            ]
        })

        const configProps=getFieldProps('configName',{
            rules:[
                { required: true, whitespace: true ,message:'请输入配置文件名称'},
                { validator: this.getConfigNameProps},
            ]
        })
        const propsss = {
            name: 'file',
            showUploadList: false,
            action: window.location.origin+':9001/api/v2/oem/files',
            headers:{
                Authorization:`token ${loginUser.info.token}`,
                username:loginUser.info.userName,
                // teamspace : current.space.teamID
            },
            beforeUpload(file) {
                const isJPG = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/gif' || file.type === 'image/x-icon';
                if (!isJPG) {
                    message.error('只能上传 PNG JPG GIF 文件哦！');
                }
                return isJPG;
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} 上传成功。`);
                    _this.setState({
                        imageUrl:info.file.response.data
                    })
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 上传失败。`);
                }
            }
        };
        const getConfigMount=getFieldProps('configMount',{
            rules:[
                { required: true, whitespace: true ,message:'请输入数据存储路径'},
                { validator: this.getConfigMountProps},
            ]
        })
        const getConfigType=getFieldProps('configType',{
            rules:[
                { required: true, whitespace: true ,message:'请选择数据存储路径格式'},
                { validator: this.getConfigTypeProps},
            ],
            initialValue:'ext4'
        })
        function handleChange(value) {
        }
        

        return (
            <QueueAnim className="createPrivateApp"
                       type="right"
            >
                <Form horizontal >
                    <div className='infoBox'>
                        <div className='commonBox'>
                            <div className='title'>
                                <span>模板应用名称</span>
                            </div>
                            <div className='inputBox' style={{width:"200px"}}>
                                <FormItem
                                    hasFeedback
                                    help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(',')}
                                >
                                    <Input {...nameProps} size='large' id="name" placeholder="请输入应用名称"   />
                                </FormItem>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>

                        <div className='commonBox'>
                            <div className='title'>
                                <span>选择应用分类</span>
                            </div>
                            <div className='inputBox' style={{width:"200px"}}>
                                <FormItem
                                    hasFeedback
                                    help={isFieldValidating('appNameClass') ? '校验中...' : (getFieldError('appNameClass') || []).join(',')}
                                >
                                    <Select  {...getAppName} placeholder='选择应用商店中所在分类'>
                                        {appStoreclassify.map((item,key)=>{
                                            return <Option key={item+'_'+key} value={item}>{item}</Option>
                                        })}
                                    </Select>
                                </FormItem>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                        <div className='commonBox'>
                            <div className='title'>
                                <span>镜像</span>
                            </div>
                            <div className='inputBox' style={{width:"200px"}}>
                                <FormItem
                                    hasFeedback
                                    help={isFieldValidating('mirroring') ? '校验中...' : (getFieldError('mirroring') || []).join(',')}
                                >
                                    <Input  disabled {...getMirroring} size='large'   placeholder="选择镜像"   />
                                </FormItem>
                            </div>
                            <Button className='selectHost' style={{"marginBottom":"10px"}}  onClick={this.mirrorList}  type='primary'>选择镜像</Button>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                        <div className='commonBox'>
                            <div className='title'></div>
                            <div className='inputBox' style={{width:"200px"}}>
                                <FormItem
                                    hasFeedback
                                    help={isFieldValidating('mirrorVsersion') ? '校验中...' : (getFieldError('mirrorVsersion') || []).join(',')}
                                >
                                    <Select {...getMirroringVersion} placeholder='选择镜像版本'>
                                        {this.state.mirrorRelease==''?null:this.state.mirrorRelease.map((item,key)=>{
                                            return <Option key={item+'-'+key} value={item}>{item}</Option>
                                        })}
                                    </Select>
                                </FormItem>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>

                        <div className='commonBox'>
                            <div className='title'>
                                <span>配置文件名</span>
                            </div>
                            <div className='inputBox' style={{width:"200px"}}>
                                <FormItem
                                    hasFeedback
                                    help={isFieldValidating('configName') ? '校验中...' : (getFieldError('configName') || []).join(',')}
                                >
                                    <Input {...configProps} size='large'  placeholder="请输入配置文件名称"   />
                                </FormItem>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>

                        <div className='commonBox define'>
                            <div className='title'>
                                <span>定义配置文件</span>
                            </div>
                            <div className='inputBox ' style={{width:"500px","height":"200px"}}>
                                <FormItem >
                                    <Input className="profileOption" {...defineConfig} type="textarea" size="large"/>
                                </FormItem>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                        <div className='commonBox' style={{"marginTop":"20px"}}>
                            <div className='title'></div>
                            <div className='inputBox configFile'>
                                <Button onClick={this.previewConfig} type='primary'>预览配置文件</Button>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                        <div className='commonBox'>
                            <div className='title'>
                                <span>配置文件挂载路径</span>
                            </div>
                            <div className='inputBox' style={{width:"200px"}}>
                                <FormItem
                                    hasFeedback
                                    help={isFieldValidating('mountRoute') ? '校验中...' : (getFieldError('mountRoute') || []).join(',')}
                                >
                                    <Input {...getMountRoute} size='large' id="mountRoute" placeholder="请输入配置文件挂载路径"   />
                                </FormItem>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>

                        <div className="portBox ">
                            <span className="title">映射端口</span>
                            <div className="portList inputBox" style={{width:'500px'}}>
                                <AddPort
                                    formItemLayout={formItemLayout}
                                    accessType={this.state.accessType}
                                    form={form}
                                    ref="haha"
                                    currentCluster={currentCluster}
                                    key="ports"
                                   scope={this}
                                />
                            </div>
                        </div>

                        <div className="portBox ">
                            <span className="title">启动命令</span>
                            <div className="portList inputBox" style={{width:'500px'}}>
                                <AddCommand
                                    formItemLayout={formItemLayout}
                                    accessType={this.state.accessType}
                                    form={form}
                                    currentCluster={currentCluster}
                                    key="ports"
                                    scope={this}
                                />
                            </div>
                        </div>

                        <div className='commonBox'>
                            <div className='title'>
                                <span>数据存储路径</span>
                            </div>
                            <div className='inputBox' style={{width:"200px"}}>
                                <FormItem
                                    hasFeedback
                                    help={isFieldValidating('configMount') ? '校验中...' : (getFieldError('configMount') || []).join(',')}
                                >
                                    <Input  {...getConfigMount} size='large'  placeholder="输入数据存储路径"   />
                                </FormItem>
                            </div>
                            <div className='selectHost'  style={{width:'100px',display:'inline-block'}}  type='primary'>
                                <FormItem
                                    hasFeedback
                                    help={isFieldValidating('configType') ? '校验中...' : (getFieldError('configType') || []).join(',')}
                                    >
                                    <Select {...getConfigType} >
                                        <Option value="ext4" key="ext4" >ext4</Option>
                                        <Option value="xfs" key="xfs">xfs</Option>
                                    </Select>
                                </FormItem>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                        
                        <div className='commonBox' style={{height:'150px'}}>
                            <div className='title'>
                                <span>应用Logo</span>
                            </div>
                            <div className='inputBox ' style={{width:'300px',height:'150px'}}>
                            <div style={{ width: 246, height: 140 }}>
                                <Dragger {...propsss}>
                                    {!_this.state.imageUrl?<Icon type="plus" />:
                                    <div className='previewImage' style={{'margin':' 0 auto'}}><img src={_this.state.imageUrl}/></div>}
                                </Dragger>
                                
                            </div>
                                {/* <Upload {...propsss} beforeUpload={(file)=> this.beforeUpload(file)}>
                                      <span className="wrap-image">
                                          <Button type='primary'><Icon type="plus" className="push-icon" style={{"marginLeft":'0px'}}/>选择图片</Button>
                                        <img className="logo" src={this.props.logoUrl} />
                                      </span>
                                </Upload>
                                <div className='previewImage'><img src={_this.state.imageUrl}/></div> */}
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                        <div className="commonBox" style={{ marginTop: '12px' }}>
                            <div className="title"><span>描述信息</span></div>
                            <div className="inputBox" style={{width:'500px'}}>
                                <FormItem className="description" style={{'height':'60px'}}>
                                    <Input  {...descriptionProps} style={{'resize':'none'}} type="textarea" size="large" placeholder="请输入描述信息" autosize={{ minRows:2, maxRows: 2 }}/>
                                </FormItem>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                        <div className="commonBox" style={{ marginTop: '12px' }}>
                            <div className="title"><span>关联空间</span></div>
                            <div className="inputBox" style={{width:'500px'}}>
                            <FormItem
                                    hasFeedback
                                    help={isFieldValidating('teamspaces') ? '校验中...' : (getFieldError('teamspaces') || []).join(',')}
                                    >
                                <Select
                                    multiple
                                    style={{ width: '100%' }}
                                    {...teamspacesProps}
                                    placeholder="请选择需要关联的空间"
                                >
                                {teams.map((item,key)=>{
                                    return <Option key={item.name}>{item.name}</Option>
                                })}
                                </Select>
                            </FormItem>
                            </div>
                        </div>                        
                    </div>
                    <div className='btnBox'>
                        <Button size='large' onClick={this.handleReset}>
                            取消
                        </Button>
                        {this.state.loading ?
                            <Button size='large' type='primary' loading={this.state.loading}>
                                确定
                            </Button>
                            :
                            <Button size='large' type='primary' onClick={this.createSubmit}>
                                创建模板
                            </Button>
                        }
                    </div>
                </Form>
                <Modal visible={this.state.mirrorListModal}
                       className='CreateDatabaseModal' width={800}
                       title='选择镜像'
                       onCancel={() => { this.setState({ mirrorListModal: false }) } }
                >
                    <SelectMirror scope={this} form={form}  />
                </Modal>
                <Modal visible={this.state.previewConfigModal}
                       className='CreateDatabaseModal'  width={600}
                       title='配置文件预览'
                       onCancel={() => { this.setState({ previewConfigModal: false }) } }
                >
                    <PreviewConfig showModal={this.state.previewConfigModal} config={this.state.configFile} scope={this}  />
                </Modal>
            </QueueAnim>
        )
    }
}

function mapStateToProps(state, props) {
    const { entities, cluster_nodes } = state
    const { current,loginUser } = entities
    const { cluster } = current
    const { info } = state.personalized
    return {
        currentCluster: cluster,
        current,loginUser,
        oemInfo: info.result || { company: {} }
    }
}

CreateApp=createForm()(CreateApp)


export default connect(mapStateToProps, {
    uploadImage,
    queryImage,
    loadAppStore,
    createTemplate
})(injectIntl(CreateApp, {
    withRef: true,
}))