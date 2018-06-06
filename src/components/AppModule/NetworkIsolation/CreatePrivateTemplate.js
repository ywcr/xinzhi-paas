
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


import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import QueueAnim from 'rc-queue-anim'
import "./style/ImageStore.less"
// import NotificationHandler from '../../common/notification_handler'
import { createTemplateingress, getIngress, loadContainerList } from '../../../actions/app_manage'
import { loadAllServices } from '../../../actions/services'
import NotificationHandler from '../../../common/notification_handler'
import { camelize } from 'humps'
import AddFrom from './AddFrom'
import AddPort from './AddPort'
import { Input, Select, Slider, InputNumber, Modal, Upload, Button, Form, Col, Row, Icon, message, Radio } from 'antd'
import { USERNAME_REG_EXP_NEW, DEFAULT_REGISTRY, DATA_STORAGE_PATH, PASSWORD_MONGODB, API_URL_PREFIX } from '../../../constants'
import { error } from 'util';
// import { series } from '_async@2.6.0@async';
const Option = Select.Option;
const appStoreclassify = ['allow']
const createForm = Form.create;
const FormItem = Form.Item;
const Dragger = Upload.Dragger;
const RadioGroup = Radio.Group;
const notification = new NotificationHandler()
class CreateApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            mirrorListModal: false,
            mirrorRelease: [],
            logoUrl: '',
            previewConfigModal: false,
            configFile: '',
            imageId: '',
            portsKeys: [],
            FromKeys: [],
            commandKeys: [],
            accessType: 'PublicNetwork',
            ports: [],
            Froms: [],
            udp: [],
            http: [],
            argsType: 'default',
            selectType: 'service',
            containerList: [],
            statusType: 'service',
            options: [],
            name: '',
            nameSpace: ''

        }
        this.handleReset = this.handleReset.bind(this)
        this.mirrorList = this.mirrorList.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }
    handleReset = () => {
        const { scope, form } = this.props
        scope.setState({
            createTemplate: false
        })
        let ports = this.state.portsKeys.slice(0, 1)
        let Froms = this.state.FromKeys.slice(0, 1)

        let commandKeys = this.state.commandKeys.slice(0, 1)
        this.setState({
            imageUrl: null,
            portsKeys: ports,
            FromKeys: Froms,
            commandKeys: commandKeys
        })
        form.resetFields();
    }

    /*选择镜像*/
    mirrorList = () => {
        this.setState({
            mirrorListModal: true
        })
    }

    checkName(rule, value, callback) {
        if (!value) {
            return callback()
        }
        // if (value.length < 6 || value.length > 16) {
        //     callback([new Error('长度为6~16个字符')])
        //     return
        // }
        // if (!USERNAME_REG_EXP_NEW.test(value)) {
        //     callback([new Error('以[a~z]开头，允许[0~9]、[-]，长度大于5，且以小写英文和数字结尾')])
        //     return
        // }
        callback()
    }

    checkDescription(rule, value, callback) {
        if (!value) {
            return callback()
        }
        if (value.length > 200) {
            callback([new Error('长度不超过200个字符之间')])
            return
        }
        callback()
    }
    checkAppClassProps = (rule, value, callback) => {
        if (!value) {
            return callback()
        }
        if (value.length == 0) {
            callback([new Error('请选择应用分类')])
            return
        }
        callback()
    }

    getMirroringProps = (rule, value, callback) => {
        if (!value) {
            return callback()
        }
        if (value.length == 0) {
            callback([new Error('请选择镜像')])
        }
        callback()
    }
    getVersionProps = (rule, value, callback) => {
        if (!value) {
            return callback()
        }
        if (value.length == 0) {
            callback([new Error('请选择镜像版本')])
        }
        callback()
    }
    getMountRouteProps = (rule, value, callback) => {
        if (!value) {
            return callback()
        }
        if (value.length == 0) {
            callback([new Error('请输入挂载路径')])
        }
        if (!PATH_REG.test(value)) {
            callback([new Error('请输入以[/]开头的路径并符合命名规则')])
            return
        }
        callback()
    }
    getConfigProps(value) {
        this.setState({
            configFile: value
        })
    }

    defineConfigPro = (rule, value, callback) => {
        if (!value) {
            return callback()
        }
        if (value.length == 0) {
            callback([new Error('请输入定义配置文件')])
        }
        callback()
    }
    isTeamspaces = (rule, value, callback) => {
        if (!value) {
            return callback()
        }
        if (value.length == 0) {
            callback([new Error('请需要关联的选择空间')])
        }
        callback()
    }


    getConfigNameProps = (rule, value, callback) => {
        const isconfigName = /[^<>/\\\|:""\*\?]+\.\w+$/
        if (!value) {
            return callback()
        }
        if (value.length == 0) {
            callback([new Error('请输入配置文件名称')])
        }
        if (!isconfigName.test(value)) {
            callback([new Error('文件名匹配有误,请输入正确的格式。')])
        }
        callback()
    }


    getConfigMountProps = (rule, value, callback) => {
        if (!value) {
            return callback()
        }
        if (value.length == 0) {
            callback([new Error('请输入数据存储路径')])
        }
        if (!DATA_STORAGE_PATH.test(value)) {
            callback([new Error('请输入以[/]开头的路径')])
            return
        }
        callback()
    }
    getConfigTypeProps = (rule, value, callback) => {
        if (!value) {
            return callback()
        }
        if (value.length == 0) {
            callback([new Error('请选择数据存储路径格式')])
        }
        callback()
    }

    createSubmit = () => {
        const _this = this
        const { createTemplateingress, currentCluster, namespace, Token, UserName } = this.props
        _this.props.form.validateFieldsAndScroll((errors, values) => {
            if (!!errors) {
                return
            }
            let ports = [], commands = [], Froms = []
            _this.state.portsKeys.map((item, index) => {
                let port = '', portType = '';
                if (values['port' + item.value]) {
                    port = values['port' + item.value]
                }
                if (values['mappingPortType' + item.value]) {
                    portType = values['mappingPortType' + item.value]
                }
                ports.push({ 'value': port, 'type': portType })
            })
            _this.state.FromKeys.map((item, index) => {
                let from = '', portType = '';
                if (values['port' + item.value]) {
                    from = values['port' + item.value]
                }
                if (values['mappingPortType' + item.value]) {
                    portType = values['mappingPortType' + item.value]
                }

                Froms.push({ 'port': from, 'protocol': portType })
            })
            _this.state.commandKeys.map((item, index) => {
                let command = ''
                if (values['command' + item.value]) {
                    command = values['command' + item.value]
                }
                commands.push(command)
            })

            let portMap = []
            const body = {
                "ingress": [
                    {
                        "action": values.appNameClass,
                        "from": ports,
                        'port': Froms

                    }
                ],
                "name": values.name,
                //   <-- 服务的名称或者pod的名称
                "type": this.state.selectType
                //  <-- 支持的类型：service，pod
            }
            createTemplateingress(body, currentCluster.clusterID).then(function (res) {
                if (res.response.result) {

                    const notification = new NotificationHandler()
                    notification.success('添加成功')
                    _this.setState({
                        allow: true,
                        name: ''
                    })
                    _this.props.getIngressList()
                    _this.props.scope.setState({
                        createTemplate: false,
                    })
                    _this.props.form.resetFields();

                }
                // _this.props.form.resetFields();
            })
            //   _this.props.form.resetFields();
        })
        _this.setState({
            FromKeys: _this.state.FromKeys.slice(0, 1),
            portsKeys: _this.state.portsKeys.slice(0, 1),
        })

    }
    handleChange(value) {
        const self = this
        self.setState({
            name: value
        })
    }
    render() {
        const _this = this;
        const { form, teams, current, loginUser } = this.props
        const { getFieldProps, getFieldError, isFieldValidating, validateFields, getFieldValue, formItemLayout } = form;
        const { createTemplateingress, currentCluster, TeamSpaces, servicesList } = this.props
        let Services = []
        Services = servicesList.map((item) => {
            let service = item.service
            let ServicelistObj = []
            ServicelistObj.push(service)
            return ServicelistObj.map((item) => {
                return item.metadata
            })
        })
        this.state.loginUser = loginUser
        getFieldProps('keys', {
            initialValue: [0],
        });
        const nameProps = getFieldProps('name', {
            rules: [
                { required: true, whitespace: true, message: '请输入名称' },
                { validator: this.checkName },
            ],
        });

        return (
            <QueueAnim className="createPrivateApp"
                type="right"
            >
                <Form horizontal form={this.props.form}>
                    <div className='infoBox'>
                        <div className='commonBox'>
                            <div className='title'>
                                <span>目标类型</span>
                            </div>
                            <div className='inputBox' style={{ width: "200px" }}>
                                <FormItem
                                >
                                    <RadioGroup onChange={(e) => { this.setState({ selectType: e.target.value, name: '' }) }} value={this.state.selectType}>
                                        <Radio value="service">服务</Radio>
                                        <Radio disabled value="pod">容器(暂不支持)</Radio>
                                    </RadioGroup>
                                </FormItem>

                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                        <div className='commonBox'>
                            <div className='title'>
                                <span>目标名称</span>
                            </div>
                            <div className='inputBox' style={{ width: "200px" }}>
                                <FormItem
                                    hasFeedback
                                >
                                    <Select showSearch
                                        {...nameProps}
                                        // style={{ width: 150 }}
                                        placeholder="请选择名称"
                                        optionFilterProp="children"
                                        notFoundContent="无法找到"
                                        filterOption={false}
                                    // value={this.state.name}
                                    // onChange={ this.handleChange}
                                    >
                                        {Services.map((services, index) => {

                                            return <Option value={services[0].name}>{services[0].name}</Option>
                                        })}
                                        {/* {this.selectOption(this.state.selectType)} */}
                                    </Select>

                                </FormItem>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>

                        <div className='commonBox'>
                            <div className='title'>
                                <span>目标动作</span>
                            </div>
                            <div className='inputBox' style={{ width: "200px" }}>
                                <FormItem
                                // hasFeedback
                                // help={isFieldValidating('appNameClass') ? '校验中...' : (getFieldError('appNameClass') || []).join(',')}
                                >
                                    <Select defaultValue="允许" style={{ width: 120 }} allowClear disabled>
                                        <Option value="允许">允许</Option>
                                    </Select>
                                </FormItem>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>

                        <div className="portBox ">
                            <span className="title">目标端口</span>
                            <div className="portList inputBox" style={{ width: '500px' }}>
                                <AddPort
                                    formItemLayout={formItemLayout}
                                    // accessType={this.state.accessType}
                                    form={form}
                                    ref="AddFrom"
                                    currentCluster={currentCluster}
                                    key="AddFrom"
                                    scope={this}
                                    key={this}
                                />
                            </div>
                        </div>
                        <div className="portBox ">
                            <span className="title">访问来源</span>
                            <div className="portList inputBox" style={{ width: '500px' }}>
                                <AddFrom
                                    key={this}
                                    formItemLayout={formItemLayout}
                                    // accessType={this.state.accessType}
                                    form={form}
                                    servicesList={servicesList}
                                    ref="haha"
                                    teamspaces={TeamSpaces}
                                    currentCluster={currentCluster}
                                    key="Ports"
                                    scope={this}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='btnBox'>
                        <Button size='large' onClick={this.handleReset}>
                            取消
                        </Button>
                        <Button size='large' type='primary' onClick={this.createSubmit}>
                            确定
                            </Button>
                    </div>
                </Form>
                <Modal visible={this.state.mirrorListModal}
                    className='CreateDatabaseModal' width={800}
                    title='选择镜像'
                    onCancel={() => { this.setState({ mirrorListModal: false }) }}
                >
                    {/* <SelectMirror scope={this} form={form}  /> */}
                </Modal>
                <Modal visible={this.state.previewConfigModal}
                    className='CreateDatabaseModal' width={600}
                    title='配置文件预览'
                    onCancel={() => { this.setState({ previewConfigModal: false }) }}
                >
                    {/* <PreviewConfig showModal={this.state.previewConfigModal} config={this.state.configFile} scope={this}  /> */}
                </Modal>
            </QueueAnim>
        )
    }
}

function mapStateToProps(state, props) {
    const { entities, cluster_nodes, user } = state
    const { current, loginUser } = entities
    const { cluster } = current
    const { info } = state.personalized
    // const {namespace} =state
    let namespace
    let Token
    let UserName
    let TeamSpaces
    if (entities.current && entities.current.space) {
        namespace = entities.current.space.namespace
    }
    if (entities.current && entities.current.space) {
        Token = entities.loginUser.info.token
    }
    if (entities.current && entities.current.space) {
        UserName = entities.loginUser.info.userName
    }
    if (entities.current && entities.current.space) {
        TeamSpaces = user.teamspaces.result.teamspaces
    }
    return {
        currentCluster: cluster,
        current, loginUser,
        oemInfo: info.result || { company: {} },
        // clusterID,
        namespace,
        Token,
        UserName,
        TeamSpaces
    }
}

CreateApp = createForm()(CreateApp)


export default connect(mapStateToProps, {
    // uploadImage,
    // queryImage,
    // loadAppStore,
    // createTemplate,
    loadAllServices,
    getIngress,
    createTemplateingress
})(injectIntl(CreateApp, {
    withRef: true,
}))