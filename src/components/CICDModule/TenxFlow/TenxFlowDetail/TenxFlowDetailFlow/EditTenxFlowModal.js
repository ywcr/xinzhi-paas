/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * EditTenxFlowModal component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Switch, Radio, Checkbox, Icon, Select, Modal, Tooltip, Spin, Popover, Menu } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { camelize } from 'humps'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import cloneDeep from 'lodash/cloneDeep'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { appNameCheck } from '../../../../../common/naming_validation'
import DockerFileEditor from '../../../../Editor/DockerFile'
import ShellEditor from '../../../../Editor/Shell'
import { updateTenxFlowState, getDockerfiles, setDockerfile, getAvailableImage, updateTenxFlow, getTenxFlowDetail, createScripts, updateScriptsById, getScriptsById } from '../../../../../actions/cicd_flow'
import { loadProjectList,loadRepositoriesTags } from '../../../../../actions/harbor'
import './style/EditTenxFlowModal.less'
import findIndex from 'lodash/findIndex'
import EnvComponent from './CreateEnvComponent.js'
import ImageEnvComponent from './ImageEnvComponent.js'
import CodeStoreListModal from './CodeStoreListModal.js'
import NotificationHandler from '../../../../../common/notification_handler'
import PopTabSelect from '../../../../PopTabSelect'
import { loadClusterList } from '../../../../../actions/cluster'
import { getAllClusterNodes } from '../../../../../actions/cluster_node'
import { isStandardMode } from '../../../../../common/tools'
import DockerfileModal from '../../../DockerfileModal'

const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;
const PopTab = PopTabSelect.Tab;
const PopGroup = PopTabSelect.OptionGroup;
const PopOption = PopTabSelect.Option;
let index = 0
const defaultOptions = {
    readOnly: false
}

const menusText = defineMessages({
    titleEdit: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.titleEdit',
        defaultMessage: '编辑子任务卡片',
    },
    titleAdd: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.titleAdd',
        defaultMessage: '创建子任务卡片',
    },
    unitCheck: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.unitCheck',
        defaultMessage: '单元测试',
    },
    containCheck: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.containCheck',
        defaultMessage: '集成测试',
    },
    runningCode: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.runningCode',
        defaultMessage: '代码编译',
    },
    buildImage: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.buildImage',
        defaultMessage: '镜像构建',
    },
    other: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.other',
        defaultMessage: '自定义',
    },
    flowType: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.flowType',
        defaultMessage: '子任务类型',
    },
    flowCode: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.flowCode',
        defaultMessage: '子任务代码',
    },
    flowName: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.flowName',
        defaultMessage: '子任务名称',
    },

    buildImageCode: {
        id: 'CICD.Tenxflow.CreateTenxFlowModal.buildImageCode',
        defaultMessage: '任务代码',
    },
    buildImageName: {
        id: 'CICD.Tenxflow.CreateTenxFlowModal.buildImageName',
        defaultMessage: '任务名称',
    },

    selectCode: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.selectCode',
        defaultMessage: '更新代码库',
    },
    imageName: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.imageName',
        defaultMessage: '基础镜像',
    },
    defineEnv: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.defineEnv',
        defaultMessage: '自定义环境变量',
    },
    servicesTitle: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.servicesTitle',
        defaultMessage: '依赖服务',
    },
    addServices: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.addServices',
        defaultMessage: '继续添加',
    },
    shellCode: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.shellCode',
        defaultMessage: '脚本命令',
    },
    submit: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.submit',
        defaultMessage: '确定',
    },
    cancel: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.cancel',
        defaultMessage: '取消',
    },
    dockerFileCreate: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.dockerFileCreate',
        defaultMessage: '使用代码仓库中的 Dockerfile',
    },
    selectDockerFile: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.selectDockerFile',
        defaultMessage: '选择已有',
    },
    createNewDockerFile: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.createNewDockerFile',
        defaultMessage: '使用云端 Dockerfile',
    },
    imageRealName: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.imageRealName',
        defaultMessage: '镜像名称',
    },
    imageStore: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.imageStore',
        defaultMessage: '镜像仓库',
    },
    otherImage: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.otherImage',
        defaultMessage: '自定义仓库',
    },
    ImageTag: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.ImageTag',
        defaultMessage: '镜像版本',
    },
    ImageStoreType: {
        id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageStoreType',
        defaultMessage: '仓库类型',
    },
    ImageTagByBranch: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.ImageTagByBranch',
        defaultMessage: '以代码分支名为tag',
    },
    ImageTagByTime: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.ImageTagByTime',
        defaultMessage: '时间戳为tag',
    },
    ImageTagByOther: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.ImageTagByOther',
        defaultMessage: '自定义tag',
    },
    buildCache: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.buildCache',
        defaultMessage: '构建缓存',
    },
    buildCluster: {
        id: 'CICD.Tenxflow.CreateTenxFlowModal.buildCluster',
        defaultMessage: '构建集群',
    },
    buildArea: {
        id: 'CICD.Tenxflow.CreateTenxFlowModal.buildArea',
        defaultMessage: '构建地域',
    },
    envTitle: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.envTitle',
        defaultMessage: '自定义环境变量',
    },
    codeStore: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.codeStore',
        defaultMessage: '代码仓库',
    },
    branch: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.branch',
        defaultMessage: '分支：',
    },
    dockerFileTitle: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.dockerFileTitle',
        defaultMessage: '创建 Dockerfile',
    },
    noDockerFileInput: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.noDockerFileInput',
        defaultMessage: 'Dockerfile 不能为空',
    },
    deleteCode: {
        id: 'CICD.Tenxflow.EditTenxFlowModal.deleteCode',
        defaultMessage: '不使用代码库',
    },
    emptyImageEnv: {
        id: 'CICD.Tenxflow.CreateTenxFlowModal.emptyImageEnv',
        defaultMessage: '环境变量值不能为空',
    }
});

function fetchCodeStoreName(project, codeList) {
    //this function for fetcht code store name
    let codeName = null;
    if (!project) {
        return
    }
    if(codeList){
        codeList.map((item) => {
            if (item.id == project.id) {
                codeName = item.name;
            }
        });
    }
    return codeName;
}

function fetchDockerFilePath(spec) {
    if (!!spec.build) {
        let dPath = spec.build.dockerfilePath
        // Hide 1st / letter
        if (dPath.indexOf('/') == 0) {
            dPath = dPath.substring(1)
        }
        return dPath + spec.build.dockerfileName;
    }
    return null;
}

function fetchDockerFileName(spec) {
    if (!!spec.build) {
        return spec.build.dockerfileName;
    }
    return null;
}


function emptyServiceEnvCheck(errorList, item) {
    //this function for show which env list of services is error
    let errorFlag = false;
    errorList.map((errorDetail) => {
        if (errorDetail == item) {
            errorFlag = true;
        }
    });
    return errorFlag;
}

let uuid = 0;
let shellUid = 0;
let EditTenxFlowModal = React.createClass({
    getInitialState: function () {
        const { config } = this.props
        const { currentCodeStore, currentCodeStoreName, currentCodeStoreBranch } = this.getUniformRepo()
        const scriptsId = config.spec.container.scriptsId
        return {
            otherFlowType: 3,
            useDockerfile: false,
            otherTag: false,
            envModalShow: null,
            ImageStoreType: false,
            currentCodeStore:null,
            currentCodeStoreName:null,
            dockerFileModalShow: false,
            currentCodeStoreBranch:null,
            dockerFileTextarea: '',
            noDockerfileInput: false,
            ImageEnvModal: false,
            emptyImageEnv: false,
            emptyServiceEnv: [],
            baseImage: [],
            updateDfBtnLoading: false,
            disabledBranchTag: false,
            isFirstChangeTag: true,
            isFirstChangeDockerfileType: true,
            shellCodeType: (scriptsId ? 'scripts' : 'cmd'),
            shellModalShow: false,
            scriptsId,
            valuename:'',
            scriptsTextarea: '',
            saveShellCodeBtnLoading: false,
            dockerfileEditMode: '',
            isDockerfile: false,
            validateStatus: true,
        }
    },
    getUniformRepo() {
        const { uniformRepo, stageList, codeList } = this.props
        let currentCodeStore
        let currentCodeStoreName
        let currentCodeStoreBranch
        if (stageList.length > 0 && uniformRepo === 0) {
          const firstStage = stageList[0]
          const { branch, id } = firstStage.spec.project
          currentCodeStore = id
          currentCodeStoreBranch = branch
          if(codeList){
            codeList.every(code => {
                if (code.id === id) {
                currentCodeStoreName = code.name
                return false
                }
                return true
            })
          }
        }
        return { currentCodeStore, currentCodeStoreName, currentCodeStoreBranch }
      },
    componentWillMount() {
        // const {getAvailableImage} = this.props
        // getAvailableImage()
        const { config, form } = this.props
        const { setFieldsValue, getFieldProps, getFieldValue } = form
        if (config) {
            const envs = config.spec.container.env
            const imageEnvInputs = []
            envs.forEach((env, index) => {
                imageEnvInputs.push(index)
                getFieldProps(`imageEnvName${index}`, {
                    initialValue: env.name
                })
                getFieldProps(`imageEnvValue${index}`, {
                    initialValue: env.value
                })
            })
            getFieldProps('imageEnvInputs', {
                initialValue: imageEnvInputs
            })
        }
        const { loadClusterList, loadProjectList,loadRepositoriesTags } = this.props
        loadClusterList()
        loadProjectList(DEFAULT_REGISTRY, { page_size: 100 })
    },
    componentDidMount() {
        uuid = 0;
        shellUid = 0;
        const _this = this;
        const { config, form, getDockerfiles, codeList, flowId, stageId, getScriptsById } = this.props;
        if (!config.spec.project) {
            config.spec.project = {
                id: null,
                branch: ''
            }
        }
        let otherFlowType = config.metadata.type + '';
        let codeStoreName = fetchCodeStoreName(config.spec.project, codeList)
        // get dockerfile not only dockerfileFrom = 2 for keep old dockerfile
        if (config.spec.build) {
            let tempBody = {
                flowId: flowId,
                stageId: stageId
            }
            getDockerfiles(tempBody, {
                success: {
                    func: (res) => {
                        const result = res.data.message || {}
                        _this.setState({
                            isDockerfile: true,
                            dockerfileEditMode: result.type === 1
                                ? 'visualEditing'
                                : 'textEditing',
                            dockerFileTextarea: result.content
                        })
                        _this.oldDockerfile = result.content
                    },
                    isAsync: true
                },
                failed: {
                    func: (res) => {
                        // maybe can't get dockerfile, do not show error in page
                    }
                }
            })
        }
        // 获取脚本
        const scriptsId = config.spec.container.scriptsId
        if (scriptsId) {
            getScriptsById(scriptsId, {
                success: {
                    func: res => {
                        this.setState({
                            scriptsId: res.data.script.id,
                            scriptsTextarea: res.data.script.content
                        })
                        this.oldScripts = res.data.script.content
                    }
                }
            })
        }
        if (otherFlowType != 3) {
            this.setState({
                otherFlowType: otherFlowType,
                useDockerfile: false,
                ImageStoreType: false,
                otherTag: false,
                currentCodeStore: config.spec.project.id,
                currentCodeStoreName: codeStoreName,
                currentCodeStoreBranch: config.spec.project.branch
            });
        } else {
            let useDockerfile = (config.spec.build && config.spec.build.dockerfileFrom == 1) ? true : false;
            let ImageStoreType = (config.spec.build && config.spec.build.registryType == 3) ? true : false;
            let otherTag = (config.spec.build && config.spec.build.imageTagType == 3) ? true : false;
            this.setState({
                otherFlowType: otherFlowType,
                useDockerfile: useDockerfile,
                ImageStoreType: ImageStoreType,
                otherTag: otherTag,
                currentCodeStore: config.spec.project.id,
                currentCodeStoreName: codeStoreName,
                currentCodeStoreBranch: config.spec.project.branch
            });
        }
        let shellList = Boolean(config.spec.container.args) ? config.spec.container.args : [];
        if (shellList && Array.isArray(shellList)) {
            shellList.map((item, index) => {
                shellUid++;
                let keys = form.getFieldValue('shellCodes');
                if (keys) {
                    keys = keys.concat(shellUid);
                    form.setFieldsValue({
                        'shellCodes': keys
                    });
                }
            });
        }

        let serviceList = Boolean(config.spec.container.dependencies) ? config.spec.container.dependencies : [];
        if (serviceList) {
            serviceList.map((item, index) => {
                let keys = form.getFieldValue('services');
                if (keys.indexOf(index) >= 0) {
                    return
                }
                keys = keys.concat(index);
                form.setFieldsValue({
                    'services': keys
                });
            })
            const { getFieldProps, getFieldValue } = form
            getFieldValue('services').forEach(k => {
                const dependency = serviceList[k]
                if(!dependency) return
                form.getFieldProps('service' + index + 'inputs', {
                    initialValue: []
                })
                const inputs = []
                if(dependency.env) {
                    dependency.env.forEach((env, index) => {
                        inputs.push(index)
                        getFieldProps(`service${k}inputName${index}`, {
                            initialValue: env.name
                        })
                        getFieldProps(`service${k}inputValue${index}`, {
                            initialValue: env.value
                        })
                    })
                }
                getFieldProps('service' + k + 'inputs', {
                    initialValue: inputs
                })
            })
        }
    },
    componentWillReceiveProps(nextProps){
        if(this.state.isOnece) {
            return
        }
        index++
        if(index >=2) {
            index = 0
            return
        }
        this.setState({
            isOnece: true
        })
        const config = nextProps.config
        if(nextProps.otherImage.length <= 0 && config.spec.build && config.spec.build.customRegistry) {
            this.setState({
                addOtherImage: true,
                showOtherImage: false
            })
        }
        if(config && config.spec.build) {
            let otherImageValue = config.spec.build.customRegistry
            if(otherImageValue) {
                this.setState({
                    showOtherImage: true
                })
            } else {
                this.setState({
                    showOtherImage: false
                })
            }

        }
    },
    flowNameExists(rule, value, callback) {
        //this function for check the new tenxflow name is exist or not
        const { stageList } = this.props.rootScope.props;
        if (!value || !value.trim()) {
            return callback()
        }
        if (value.length < 3 || value.length > 63) {
            return callback('子任务名称为 3~63 位字符')
        }
        let flag = false;
        if (stageList.length > 0) {
            stageList.map((item) => {
                if (item.metadata.name == value && this.props.stageId !== item.metadata.id) {
                    flag = true;
                }
            });
        }
        if (flag) {
            return callback('子任务名称已存在');
        }
        callback();
    },
    otherStoreUrlInput(rule, value, callback) {
        //this function for user selected other store and should be input the image store url
        if (this.state.ImageStoreType && !!!value) {
            callback([new Error('请输入自定义仓库地址')]);
        } else {
            callback();
        }
    },
    otherTagInput(rule, value, callback) {

        //this function for user selected customer the image tag and should be input the image tag
        if (this.state.otherTag && !!!value) {
            callback([new Error('请输入自定义镜像版本')]);
        } else {
            callback();
        }
    },
    flowTypeChange(ins, notResetShell) {
        // const ins = e.split('@')[1]
        this.props.form.resetFields(['otherFlowType', 'imageNameProps']);
        if (ins != 3) {
            this.props.form.resetFields(['imageRealName', 'dockerFileUrl', 'otherStoreUrl', 'otherTag', 'imageType', 'imageTag', 'buildCache']);
            this.setState({
                useDockerfile: false,
                otherTag: false,
                ImageStoreType: false
            });
        } else if(this.state.otherFlowType != ins) {
            this.setState({
                useDockerfile: true,
                otherTag: false,
                ImageStoreType: false
            });
        }
        if(notResetShell == true) {
            this.setState({
                otherFlowType: ins
            })
            return
        }
        // Clean the command entries
        this.props.form.setFieldsValue({ 'shellCodes': [0] });
        this.props.form.setFieldsValue({ 'shellCode0': '' });
        this.props.config.spec.container.args = {}
        this.setState({
            otherFlowType: ins
        })
    },
    removeService(k) {
        //the function for user remove the service select box
        const { form } = this.props;
        // can use data-binding to get
        let keys = form.getFieldValue('services');
        keys = keys.filter((key) => {
            return key !== k;
        });
        // can use data-binding to set
        form.setFieldsValue({
            'services': keys
        });
        if (keys.length == 0) {
            this.addService()
        }
    },
    addService() {
        //this function for user add an new box of service select
        uuid++;
        const { form } = this.props;
        // can use data-binding to get
        let keys = form.getFieldValue('services');
        keys = keys.concat(uuid);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            'services': keys
        });
    },
    openEnvSettingModal(index) {
        //this function for user open the modal of setting the service env
        const imageName = this.props.form.getFieldValue(`serviceSelect${index}`)
        if(!imageName) return
        this.setState({
            envModalShow: index
        });
    },
    closeEnvSetting(){
        this.setState({
            envModalShow: null
        });
    },
    closeEnvSettingModal() {
        if (!this.state.validateStatus) {
            new NotificationHandler().error("请检查环境变量名称")
            return
        }
        const { form } = this.props
        form.validateFields((errors, values) => {
                if (!!errors) {
                    return;
                }else{
                    this.setState({
                        envModalShow: null
                    });
                }
            }
        )

    },
    removeShellCode(k) {
        //the function for user remove the shell code box
        const { form } = this.props;
        // can use data-binding to get
        let keys = form.getFieldValue('shellCodes');
        if (keys.length == 1) {
            return;
        }
        keys = keys.filter((key) => {
            return key !== k;
        });
        // can use data-binding to set
        form.setFieldsValue({
            'shellCodes': keys
        });
    },
    addShellCode(index) {
        //this function for user add an new box of shell code
        //there are no button for user click
        //when user input words, after user key up would triger the function
        const { form } = this.props;
        let inputValue = form.getFieldValue('shellCode' + index);
        let changed = false
        let keys = form.getFieldValue('shellCodes');
        let max = keys[keys.length - 1]
        if (index == max && !!inputValue) {
            // shellUid++;
            changed = true
            // can use data-binding to get
            keys = keys.concat(max + 1);
            // can use data-binding to set
            // important! notify form to detect changes
        }
        if (index == max - 1 && !inputValue) {
            let nextInputValue = form.getFieldValue('shellCode' + index + 1);
            if (!nextInputValue) {
                // shellUid--;
                changed = true
                keys.pop()
            }
        }
        if (changed) {
            form.setFieldsValue({
                'shellCodes': keys
            });
        }
    },
    realImageInput(rule, value, callback) {
        //this function for user selected build image type
        //and when user submit the form, the function will check the real image input or not
        if (this.state.otherFlowType == 3) {
            let errorMsg = appNameCheck(value, '镜像名称')
            if(errorMsg == 'success') {
                callback()
            } else {
                callback([new Error(errorMsg)]);
            }
        } else {
            callback()
        }
    },
    changeUseDockerFile(e) {
        //this function for user change using the Dockerfile or not
        if (e.target.value) {
            this.setState({
                useDockerfile: true,
                disabledBranchTag: false,
            });
        } else {
            // 当用户选择“使用云端创建 Dockerfile”时，disable “镜像版本”的“以代码分支名为tag”选项，否则构建出的镜像 tag 为null
            const { form } = this.props
            const imageTag = form.getFieldValue('imageTag')
            if (imageTag === '1') {
                form.setFieldsValue({
                    imageTag: '2'
                })
            }
            this.setState({
                useDockerfile: false,
                disabledBranchTag: true,
            });
        }
    },
    changeImageStoreType(e) {
        //this function for user change image store type
        if (e.target.value == 3) {
            if(this.props.otherImage.length <= 0) {
                this.setState({
                    addOtherImage: true
                })
                return
            }
            this.setState({
                ImageStoreType: true,
                showOtherImage: true
            });
        } else {
            const { form } = this.props
            const { resetFields } = form
            resetFields(['otherImage'])
            this.setState({
                ImageStoreType: false,
                showOtherImage: false
            });
        }
    },
    changeImageTagType(e) {
        //this function for user change image tag type
        if (e.target.value == 3) {
            this.setState({
                otherTag: true
            }, () => {
                const _input = document.getElementById('otherTag')
                _input && _input.focus()
            });
        } else {
            this.setState({
                otherTag: false
            });
        }
        this.setState({
            isFirstChangeTag: false
        })
    },
    openCodeStoreModal() {
        //this function for user select code store and user must be select code modal
        this.setState({
            codeStoreModalShow: true
        });
    },
    closeCodeStoreModal() {
        //this function for user select code store and user must be select code modal
        this.setState({
            codeStoreModalShow: false
        });
    },
    okCodeStoreModal() {
        this.setState({
            codeStoreModalShow: false
        })
    },
    deleteCodeStore() {
        //this function for user delete the code store
        this.setState({
            currentCodeStore: null,
            currentCodeStoreBranch: '',
            currentCodeStoreName: '',
            useDockerfile: false
        })
        const { form } = this.props
        if (form.getFieldValue('imageTag') == '1') {
            form.setFieldsValue({
                imageTag: '2'
            })
            this.changeImageTagType({
                target: {
                    value: 2
                }
            })
        }
    },
    openDockerFileModal() {
        this.setState({
            dockerFileModalShow: true
        });
    },
    closeDockerFileModal() {
        this.setState({
            dockerFileModalShow: false,
            dockerFileTextarea: this.oldDockerfile,
        });
        if (this.state.dockerFileTextarea) {
            this.setState({
                noDockerfileInput: false
            })
        } else {
            this.setState({
                noDockerfileInput: true
            })
        }
    },
    onChangeDockerFileTextarea(e) {
        this.setState({
            dockerFileTextarea: e
        });
    },
    saveShellCode() {
        const notification = new NotificationHandler()
        const { scriptsTextarea, scriptsId } = this.state
        const firstLine = scriptsTextarea.split('\n')[0]
        if (firstLine.indexOf('#!') !== 0) {
            notification.error('格式错误', '请在首行填写 Shebang（声明解释器，例如 bash 环境填写 #!/bin/bash）')
            return
        }
        const { createScripts, updateScriptsById } = this.props
        this.setState({
            saveShellCodeBtnLoading: true,
        })
        const body = {
            content: scriptsTextarea,
        }
        // 编辑脚本
        if (scriptsId) {
            updateScriptsById(scriptsId, body, {
                success: {
                    func: res => {
                        this.setState({
                            shellModalShow: false,
                        })
                        notification.success(`保存脚本成功`)
                    },
                },
                finally: {
                    func: () => {
                        this.setState({
                            saveShellCodeBtnLoading: false,
                        })
                    }
                }
            })
            return
        }
        // 创建脚本
        createScripts(body, {
            success: {
                func: res => {
                    this.setState({
                        shellModalShow: false,
                        scriptsId: res.data.id,
                    })
                    notification.success(`创建脚本成功`)
                },
            },
            failed: {
                func: (res) => {
                    const notification = new NotificationHandler()
                    if (res && res.statusCode === 400) {
                        notification.error("使用脚本文件，内容不能为空")
                    } else {
                        let message = '保存脚本文件失败'
                        if (res.message) {
                            message = res.message
                        }
                        if(res.message && res.message.message) {
                            message = res.message.message
                        }
                        notification.error(message)
                    }
                }
            },
            finally: {
                func: () => {
                    this.setState({
                        saveShellCodeBtnLoading: false,
                    })
                }
            }
        })
    },
    openImageEnvModal() {
        this.setState({
            ImageEnvModal: true
        });
    },
    closeEnv(){
        // this.props.form.resetFields()
        this.setState({
            ImageEnvModal: false
        });

    },
    closeImageEnvModal() {
        if (!this.state.validateStatus) {
            new NotificationHandler().error("请检查环境变量名称")
            return
        }
        const { form } = this.props

        form.validateFields((errors, values) => {
                if (!!errors) {
                    return;
                }else{
                    this.setState({
                        ImageEnvModal: false
                    });
                }
            }
        )

    },
    cancelChange(e) {
        //this function for reset the form and close the edit card
        e.preventDefault();
        this.props.form.resetFields();
        const { scope } = this.props;
        this.setState({
            currentType: 'view',
            emailAlert: false,
            otherEmail: false,
            isOnece: false
        });
        scope.cancelEditCard();
    },
    handleSubmit(e) {
        //this function for user submit the form
        const { scope, config, updateTenxFlowState, updateTenxFlow, flowId, stageId, rootScope, setDockerfile, getTenxFlowDetail } = this.props;
        const enabled = config.spec.ci.enabled || 0
        const { getTenxFlowStateList } = rootScope.props;
        const _this = this;
        let notification = new NotificationHandler()
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                e.preventDefault();
                if (this.state.otherFlowType == 3 && !_this.state.currentCodeStore && !_this.state.dockerFileTextarea) {
                    this.setState({
                        noDockerfileInput: true
                    })
                    return
                }
                if (_this.state.currentCodeStore) {
                    this.setState({
                        noDockerfileInput: false
                    })
                }
                let invalidDockerfile = Boolean(!_this.state.dockerFileTextarea && !_this.state.useDockerfile && this.state.otherFlowType == 3);
                _this.setState({
                    noDockerfileInput: invalidDockerfile
                });
                if (invalidDockerfile) {
                    errorFlag = true;
                }
                //check image env list
                let imageEnvLength = values.imageEnvInputs || [];
                imageEnvLength.map((item, index) => {
                    if (values['imageEnvName' + item] != '') {
                        if (values['imageEnvValue' + item] == '') {
                            _this.setState({
                                emptyImageEnv: true
                            });
                        }
                    }
                });
                //check service code
                let serviceLength = values.services;
                let emptyServiceEnv = _this.state.emptyServiceEnv;
                serviceLength.map((item) => {
                    let temp = {
                        'service': values['serviceSelect' + item]
                    }
                    if (!!values['serviceSelect' + item]) {
                        let tempLength = values['service' + item + 'inputs'] || [];
                        let tempList = [];
                        //this flag for service detail env list check the value input or not
                        let emptyFlag = false;
                        tempLength.map((littleItem) => {
                            if (values['service' + item + 'inputName' + littleItem] != '') {
                                if (values['service' + item + 'inputValue' + littleItem] == '') {
                                    //if user didn't input value but input the key name
                                    //the error list will be add the services num
                                    if (emptyServiceEnv.indexOf(item) == -1) {
                                        emptyServiceEnv.push(item);
                                    }
                                }
                            }
                        });
                    }
                });
                _this.setState({
                    emptyServiceEnv: emptyServiceEnv
                })
                return;
            }


            if (values.uniformRepo && !_this.state.currentCodeStore) {
                notification.error('请选择代码库')
                return
            }
            if (this.state.otherFlowType == 3 && !_this.state.currentCodeStore && !_this.state.dockerFileTextarea) {
                this.setState({
                    noDockerfileInput: true
                })
                return
            }
            //this flag for all form error flag
            let errorFlag = false;
            let invalidDockerfile = Boolean(!_this.state.dockerFileTextarea && !_this.state.useDockerfile && this.state.otherFlowType == 3);
            _this.setState({
                noDockerfileInput: invalidDockerfile
            });
            if (invalidDockerfile) {
                errorFlag = true;
            }
            //get service code
            let serviceLength = values.services;
            let serviceList = [];
            //due to the setState is not async
            //so in the function we get it for cache and do all change in this cache
            //and when the service check end, we setState change the state
            let emptyServiceEnv = _this.state.emptyServiceEnv;
            serviceLength.map((item) => {
                let temp = {
                    'service': values['serviceSelect' + item]
                }
                if (!!values['serviceSelect' + item]) {
                    let tempLength = values['service' + item + 'inputs'] || [];
                    let tempList = [];
                    //this flag for service detail env list check the value input or not
                    let emptyFlag = false;
                    tempLength.map((littleItem) => {
                        if (values['service' + item + 'inputName' + littleItem] != '') {
                            if (values['service' + item + 'inputValue' + littleItem] == '') {
                                //if user didn't input value but input the key name
                                //the error list will be add the services num
                                if (emptyServiceEnv.indexOf(item) == -1) {
                                    emptyServiceEnv.push(item);
                                }
                                errorFlag = true;
                                emptyFlag = true;
                            } else {
                                let Names = values['service' + item + 'inputName' + littleItem] ? values['service' + item + 'inputName' + littleItem].trim() : '';
                                let Value = values['service' + item + 'inputValue' + littleItem] ? values['service' + item + 'inputValue' + littleItem].trim() : '';
                                let tempBody = {
                                    name: Names,
                                    value: Value
                                }
                                tempList.push(tempBody);
                            }
                        }
                    });
                    if (!emptyFlag) {
                        emptyServiceEnv = emptyServiceEnv.filter((key) => {
                            return key !== item;
                        });
                    }
                    temp.env = tempList;
                    serviceList.push(temp);
                }
            });
            _this.setState({
                emptyServiceEnv: emptyServiceEnv
            })
            //check image env list
            let imageEnvLength = values.imageEnvInputs || [];
            let imageEnvList = [];
            let imageEnvFlag = false;
            imageEnvLength.map((item, index) => {
                if (!!values['imageEnvName' + item]) {
                    if (values['imageEnvValue' + item] == '') {
                        _this.setState({
                            emptyImageEnv: true
                        });
                        errorFlag = true;
                    } else {
                        let Names = values['imageEnvName' + item] ? values['imageEnvName' + item].trim(): ''
                        let Value = values['imageEnvValue' + item] ? values['imageEnvValue' + item].trim(): ''
                        let tempBody = {
                            name: Names,
                            value: Value
                        }
                        imageEnvList.push(tempBody)
                    }
                }
            });
            if (!imageEnvFlag) {
                _this.setState({
                    emptyImageEnv: false
                });
            }
            if (errorFlag) {
                new NotificationHandler().error('环境变量值输入有误')
                return;
            }
            //get shell code
            let shellLength = values.shellCodes;
            let shellList = [];
            if (_this.state.shellCodeType === 'cmd' ) {
                shellLength.map((item, index) => {
                    if (!!values['shellCode' + item]) {
                        shellList.push(values['shellCode' + item].trim());
                    }
                });
            } else {
                if (!_this.state.scriptsId || _this.state.scriptsId === '') {
                    new NotificationHandler().error('使用脚本文件，内容不能为空，请先编辑脚本文件')
                    return;
                }
            }
            let cloneCofig = cloneDeep(config)
            if(!cloneCofig.spec.ci) {
                cloneCofig.spec.ci = {}
            }
            if(!cloneCofig.spec.ci.config) {
                cloneCofig.spec.ci.config = {}
            }

            cloneCofig.spec.ci.config.buildCluster = isStandardMode() ? values['buildArea'] : values['buildCluster']


            let body = {
                'metadata': {
                    'name': values.flowName,
                    'type': parseInt(this.state.otherFlowType)
                },
                'spec': {
                    'container': {
                        'image': values.imageName,
                        'args': shellList,
                        'env': imageEnvList,
                        'dependencies': serviceList
                    },
                    'project': {
                        'id': _this.state.currentCodeStore,
                        'branch': _this.state.currentCodeStoreBranch
                    },
                    ci: cloneCofig.spec.ci,
                    uniformRepo: (values.uniformRepo ? 0 : 1),
                }
            }

            if (this.props.index !== 0) {
                body.spec.uniformRepo = this.props.uniformRepo
            }
            // 增加 scripts id
            if (_this.state.shellCodeType === 'scripts') {
                body.spec.container.scripts_id = _this.state.scriptsId
            }
            //if user select the customer type (5), ths customType must be input
            if (this.state.otherFlowType == 5) {
                body.metadata.customType = values.otherFlowType;
            }
            //if user select the image build type (3),the body will be add new body
            if (this.state.otherFlowType == 3) {
                let dockerFileFrom
                if (_this.state.currentCodeStore) {
                    dockerFileFrom = _this.state.useDockerfile ? 1 : 2
                } else {
                    dockerFileFrom = 2
                }
                // Get the projectId of harbor project
                let harborProjects = this.props.harborProjects.list || []
                let projectId = 0

                for (let i in harborProjects) {

                    if ((values.harborProjectName).replace(/\s/g,"") == (harborProjects[i].name).replace(/\s/g,"")) {
                        projectId = harborProjects[i].projectId
                        break
                    }
                }
                let imageBuildBody = {
                    'DockerfileFrom': dockerFileFrom,
                    'registryType': parseInt(values.imageType),
                    'imageTagType': parseInt(values.imageTag),
                    'noCache': !values.buildCache,
                    'image': values.imageRealName,
                    'project': values.harborProjectName,
                    'projectId': projectId
                }
                if (this.state.otherTag) {
                    imageBuildBody.customTag = values.otherTag;
                }
                if(imageBuildBody.registryType == 3) {
                    imageBuildBody.customRegistry = values.otherImage
                }
                // if (this.state.ImageStoreType) {
                //   imageBuildBody.customRegistry = values.otherStoreUrl;
                // }
                let tmpDockerFileUrl = null;
                if (!values.dockerFileUrl || !this.state.currentCodeStore) {
                    tmpDockerFileUrl = '';
                } else {
                    tmpDockerFileUrl = values.dockerFileUrl;
                }
                if (tmpDockerFileUrl.indexOf('/') != 0) {
                    tmpDockerFileUrl = '/' + tmpDockerFileUrl
                }
                // It's a directory
                if (tmpDockerFileUrl.endsWith('/')) {
                    imageBuildBody.DockerfilePath = tmpDockerFileUrl
                    imageBuildBody.DockerfileName = ''
                } else {
                    imageBuildBody.DockerfilePath = tmpDockerFileUrl.substring(0, tmpDockerFileUrl.lastIndexOf('/') + 1)
                    imageBuildBody.DockerfileName = tmpDockerFileUrl.substring(tmpDockerFileUrl.lastIndexOf('/') + 1)
                }
                body.spec.build = imageBuildBody;
            }
            this.setState({
                isOnece: false
            })
            updateTenxFlowState(flowId, stageId, body, {
                success: {
                    func: () => {
                        /*if (!_this.state.useDockerfile && this.state.otherFlowType == 3) {
                          let dockerfilebody = {
                            content: _this.state.dockerFileTextarea,
                            flowId: flowId,
                            stageId: stageId
                          }
                          setDockerfile(dockerfilebody, {
                            success: {
                              func: () => {
                                getTenxFlowStateList(flowId)
                              },
                              isAsync: true
                            }
                          })
                        } else {
                          getTenxFlowStateList(flowId)
                        }*/
                        if (typeof values.uniformRepo !== undefined) {
                            getTenxFlowDetail(flowId)
                        }
                        getTenxFlowStateList(flowId)
                        rootScope.setState({
                            currentFlowEdit: null
                        });
                        notification.success('持续集成', '编辑成功');
                    },
                    isAsync: true
                }
            })
        });
    },
    handleUpdateDockerfile() {
        const notification = new NotificationHandler()
        const { flowId, stageId, setDockerfile } = this.props
        const dockerfilebody = {
            content: this.state.dockerFileTextarea,
            flowId,
            stageId,
            type: this.state.dockerfileEditMode === 'textEditing'
                ? 0
                : 1
        }
        this.setState({
            updateDfBtnLoading: true,
        })
        setDockerfile(dockerfilebody, {
            success: {
                func: () => {
                    notification.success('云端 Dockerfile 保存成功')
                    this.setState({
                        dockerFileModalShow: false,
                    })
                },
            },
            failed: {
                func: () => {
                    notification.error('云端 Dockerfile 保存失败')
                },
            },
            finally: {
                func: () => {
                    this.setState({
                        updateDfBtnLoading: false,
                    })
                },
            },
        })
    },
    getOtherImage() {
        const { otherImage } = this.props
        if(!otherImage || !Array.isArray(otherImage)){
            return []
        }
        return otherImage.map(item => {
            return <Option key={item.id} value={item.id}>{item.title}</Option>
        })
    },
    addOtherImage(){
        this.setState({
            addOtherImage: false
        })
        browserHistory.push('/app_center/projects?addUserDefined=true')
    },
    cancelModal() {
        const { form } = this.props
        const { setFieldsValue } = form
        setFieldsValue({
            imageType: '1'
        })
        this.setState({
            addOtherImage: false,
            showOtherImage: false
        })
    },
    validOtherImage(rule, value, callback){
        if(!this.state.showOtherImage) return callback()
        if(!value) {
            return callback(new Error('请选择镜像仓库'))
        }
        return callback()
    },
    baseImageChange(key, tabKey, groupKey) {
        const { setFieldsValue, getFieldValue } = this.props.form
        const oldImageName = getFieldValue('imageName')
        const oldOtherFlowType = this.state.otherFlowType
        if (oldOtherFlowType == groupKey && oldImageName == key) return
        this.setState({
            baseImageUrl: key,
            otherFlowType: groupKey,
        })
        setFieldsValue({
            imageName: key
        })
        if(!oldImageName) {
            this.flowTypeChange(groupKey, false)
            return
        }
        let notResetShell = false
        if(oldOtherFlowType == groupKey) {
            notResetShell = true
        }
        this.flowTypeChange(groupKey, notResetShell)
    },
    setUniformRepo() {
        this.setState(this.getUniformRepo())
        // const {
        //     config, codeList,
        // } = this.props
        // let codeStoreName = fetchCodeStoreName(config.spec.project, codeList)
        // this.setState({
        //     currentCodeStore: config.spec.project.id,
        //     currentCodeStoreName: codeStoreName,
        //     currentCodeStoreBranch: config.spec.project.branch
        // })
    },
    renderSelectRepo() {
        const {
            config, index, uniformRepo,
        } = this.props
        const { currentCodeStore } = this.state
        if (index === 0 || uniformRepo !== 0) {
            return (
                <Button className='selectCodeBtn' size='large' type='ghost' onClick={this.openCodeStoreModal}>
                  <svg className='codeSvg'>
                    <use xlinkHref='#cicdreflash' />
                  </svg>
                    {currentCodeStore ? [<FormattedMessage {...menusText.selectCode} />] : [<span>选择代码库</span>]}
                </Button>
            )
        }
        if (currentCodeStore) {
            return
        }
        return (
            <Button className='selectCodeBtn' size='large' type='ghost' onClick={this.setUniformRepo}>
              <svg className='codeSvg'>
                <use xlinkHref='#cicdreflash' />
              </svg>
              使用首个子任务的代码库
            </Button>
        )
    },
    getBuildCluster() {
        const { clusters } = this.props
        if(clusters.isFetching || !clusters.clusterList || clusters.clusterList.length == 0) {
            return <Option key="nocluster" value={clusters}>not found </Option>
        }
        const buildClusters = []
        clusters.clusterList.forEach(cluster => {
            if(cluster.isBuilder) {
                buildClusters.push(<Option key={cluster.name} value={cluster.clusterID}>{cluster.clusterName}</Option>)
            }
        })
        return buildClusters
    },
    render() {
        const { formatMessage } = this.props.intl;
        const {
            config, form, codeList, index,
            supportedDependencies, imageList,
            toggleCustomizeBaseImageModal,
            baseImages, uniformRepo,
        } = this.props;
        const shellList = config.spec.container.args ? config.spec.container.args : [];
        const servicesList = config.spec.container.dependencies ? config.spec.container.dependencies : [];
        const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
        const scopeThis = this;
        const currenImageUrl = config.spec.container.image
        if (imageList === undefined || imageList.length === 0) {
            return (<div></div>)
        }
        const { clusters } = this.props
        if(clusters.isFetching) {
            return <div className="loadingBox"><Spin size="large"></Spin></div>
        }
        const buildClusters = []
        clusters.clusterList.forEach(cluster => {
            if(cluster.isBuilder) {
                buildClusters.push(cluster.clusterID)
            }
        })
        let intFlowTypeIndex = this.state.otherFlowType - 1
        let buildImages = []
        let dependenciesImages = []
        imageList.forEach(function (image) {
            if (image.imageList[0].categoryId > 100) {
                dependenciesImages.push(image)
            } else {
                buildImages.push(image)
            }
        })
        let serviceSelectList = dependenciesImages[0].imageList.map((item, index) => {
            return (
                <Option value={item.imageName} key={index}>{item.imageName}</Option>
            )
        });
        const selectImage = buildImages.map((list, index) => {
            return (
                <Option key={list.title} value={list.title + `@` + (index + 1)}>{list.title}</Option>
            )
        })
        if (intFlowTypeIndex > buildImages.length - 1) {
            intFlowTypeIndex = buildImages.length - 1
        }
        /*this.state.baseImage = buildImages[intFlowTypeIndex].imageList
        const baseImage = this.state.baseImage.map(list => {
          return (
            <Option key={list.imageName}>{list.imageName}</Option>
          )
        })*/
        let baseImagesNodes = []
        function getBaseImageType(key) {
            switch (key) {
                case '0':
                    return '自定义镜像'
                default:
                    return '预置镜像'
            }
        }
        let currenImageName
        function renderPopGroups(groups) {
            const groupsNodes = []
            for (let key in groups) {
                if (groups.hasOwnProperty(key)) {
                    const images = groups[key] || []
                    const { categoryName, categoryId, imageName } = images[0] || {}
                    if (typeof categoryId !== undefined && categoryId != 101) {
                        groupsNodes.push(
                            <PopGroup label={categoryName} value={categoryId} key={categoryId}>
                                {
                                    images.map(image => {
                                        const { imageName, imageUrl } = image
                                        if (currenImageUrl == imageUrl) {
                                            currenImageName = imageName
                                        }
                                        return (
                                            <PopOption value={image.imageUrl}>
                                                {image.imageName}
                                            </PopOption>
                                        )
                                    })
                                }
                            </PopGroup>
                        )
                    }
                }
            }
            return groupsNodes
        }
        for(let key in baseImages) {
            if (baseImages.hasOwnProperty(key)) {
                const imageGroups = baseImages[key]
                baseImagesNodes.push(
                    <PopTab key={key} title={getBaseImageType(key)}>
                        {
                            renderPopGroups(imageGroups)
                        }
                    </PopTab>
                )
            }
        }
        baseImagesNodes = baseImagesNodes.reverse()

        let validOtherImage
        let otherImageValue = ''
        if(config && config.spec.build) {
            otherImageValue = config.spec.build.customRegistry
            const index = findIndex(this.props.otherImage, item => {
                return item.id == otherImageValue
            })
            if(index < 0) otherImageValue = ''
        }
        if (this.state.showOtherImage) {
            validOtherImage = getFieldProps('otherImage', {
                rules: [
                    { message: '请选择镜像仓库' },
                    { validator: this.validOtherImage },
                ],
                initialValue: otherImageValue
            });
        } else {
            validOtherImage = getFieldProps('otherImage', { rules: [], initialValue: otherImageValue})
        }
        getFieldProps('services', {
            initialValue: [0],
        });
        getFieldProps('shellCodes', {
            initialValue: [0],
        });
        const serviceItems = getFieldValue('services').map((k) => {
            let serviceDefault = !!servicesList[k] ? servicesList[k].service : null;
            let envDefault = !!servicesList[k] ? servicesList[k].env : [];
            const serviceSelect = getFieldProps(`serviceSelect${k}`, {
                rules: [
                    { message: '请选择' },
                ],
                initialValue: serviceDefault,
            });
            return (
                <QueueAnim key={'serviceName' + k + 'Animate'}>
                  <div className='serviceDetail' key={'serviceName' + k}>
                    <Form.Item className='commonItem'>
                      <Select {...serviceSelect} style={{"display":"inlineBlock","width": '220px' }} allowClear dropdownMatchSelectWidth={false}>
                          {serviceSelectList}
                      </Select>
                      <span className={emptyServiceEnvCheck(scopeThis.state.emptyServiceEnv, k) ? 'emptyImageEnv defineEnvBtn' : 'defineEnvBtn'}
                            onClick={() => this.openEnvSettingModal(k)}>
                            <FormattedMessage {...menusText.defineEnv} />
                      </span>
                        {emptyServiceEnvCheck(scopeThis.state.emptyServiceEnv, k) ? [<span className='emptyImageEnvError'><FormattedMessage {...menusText.emptyImageEnv} /></span>] : null}
                      <Icon type='delete' onClick={() => this.removeService(k)} />
                    </Form.Item>
                    <Modal className='tenxFlowServiceEnvModal'
                           title={<FormattedMessage {...menusText.envTitle} />}
                           visible={this.state.envModalShow == k ? true : false}
                           onOk={this.closeEnvSettingModal}
                           onCancel={this.closeEnvSetting}
                    >
                      <EnvComponent validateCallback ={result => this.setState({ validateStatus: result })}
                          scope={scopeThis} config={envDefault} index={k} form={form} visible={this.state.envModalShow == k ? true : false}/>
                    </Modal>
                  </div>
                </QueueAnim>
            )
        });
        const scodes = getFieldValue('shellCodes')
        const shellCodeItems = scodes.map((i) => {
            let shellDefault = !!shellList[i] ? shellList[i] : ''
            const shellCodeProps = getFieldProps(`shellCode${i}`, {
                rules: [
                    { message: '请输入脚本命令' },
                ],
                initialValue: shellDefault,
            });
            return (
                <QueueAnim key={'shellCode' + i + 'Animate'}>
                  <div className='serviceDetail' key={'shellCode' + i}>
                    <FormItem className='serviceForm'>
                      <Input
                          style={{ width: '220px' }}
                          disabled={scopeThis.state.otherFlowType == 3 ? true : false}
                          onKeyUp={() => this.addShellCode(i)}
                          {...shellCodeProps}
                          size='large'
                          type='textarea'
                          autosize
                      />
                        {scopeThis.state.otherFlowType == 3 || scodes.length == 1 ? null : [
                          <Icon className="removeShellCodeIcon" type='delete' onClick={() => this.removeShellCode(i)} />
                        ]}
                    </FormItem>
                    <div style={{ clera: 'both' }}></div>
                  </div>
                </QueueAnim>
            )
        });
        if (this.state.otherFlowType == 3 && shellCodeItems.length > 1) {
            shellCodeItems.pop()
        }
        /*const flowTypeProps = getFieldProps('flowType', {
          rules: [
            { required: true, message: '请选择子任务类型' },
          ],
          onChange: this.flowTypeChange,
          initialValue: imageList[config.metadata.type - 1].title,
        });*/
        const otherFlowTypeProps = getFieldProps('otherFlowType', {
            rules: [
                { message: '输入自定义子任务类型' },
            ],
            initialValue: config.metadata.customType,
        });
        let uniformRepoProps
        if (index === 0) {
            uniformRepoProps = getFieldProps('uniformRepo', {
                valuePropName: 'checked',
                initialValue: (uniformRepo == 0),
            })
        }
        const imageRealNameProps = getFieldProps('imageRealName', {
            rules: [
                { message: '请输入镜像名称' },
                { validator: this.realImageInput },
            ],
            initialValue: (!!config.spec.build ? config.spec.build.image : null)
        });
        const harborProjectProps = getFieldProps('harborProjectName', {
            rules: [
                { message: '请选择仓库组', required: this.state.otherFlowType == 3 },
            ],
            initialValue: (!!config.spec.build ? config.spec.build.project : null)
        });
        const configBaseConfig = config.spec.container.image
        const imageNameProps = getFieldProps('imageName', {
            rules: [
                { required: true, message: '请选择基础镜像' }
            ],
            initialValue: configBaseConfig || buildImages[intFlowTypeIndex].imageList[0].imageName
        });
        const flowNameProps = getFieldProps('flowName', {
            rules: [
                { required: true, message: '请输入子任务名称' },
                { validator: this.flowNameExists },
            ],
            initialValue: config.metadata.name,
        });
        const dockerFileUrlProps = getFieldProps('dockerFileUrl', {
            rules: [
                { message: '请输入 Dockerfile 地址' },
            ],
            initialValue: fetchDockerFilePath(config.spec)?fetchDockerFilePath(config.spec):'Dockerfile'
        });
        const dockerFileNameProps = getFieldProps('dockerFileName', {
            rules: [
                { message: '请输入 Dockerfile 名称' },
            ],
            initialValue: fetchDockerFileName(config.spec),
        });
        const otherImageTagProps = getFieldProps('otherTag', {
            rules: [
                { message: '请输入镜像版本' },
                { validator: this.otherTagInput },
            ],
            initialValue: (!!config.spec.build ? config.spec.build.customTag : null)
        });
        let currentBuildCluster = buildClusters[0]
        if(config.spec.ci.config){
            if(config.spec.ci.config.buildCluster) {
                currentBuildCluster = config.spec.ci.config.buildCluster
            }
        }
        const buildCluster = getFieldProps('buildCluster', {
            rules: [
                { message: '请选择构建集群', required: isStandardMode() ? true : true}
            ],
            initialValue: currentBuildCluster
        })
        const buildArea = getFieldProps('buildArea', {
            rules: [
                { message: '请选择构建区域', required: isStandardMode() ? true : false}
            ],
            initialValue: buildClusters[0]
        })
        const dockerfileEditModeList = (
            <Menu className="dockerfileEditModeList"
                  onClick={
                      ({ key }) => this.setState({ dockerfileEditMode: key, dockerFileModalShow: true, isDockerfile: true })
                  }
            >
              <Menu.Item key="visualEditing">简单可视化编辑</Menu.Item>
              <Menu.Item key="textEditing">完整编辑</Menu.Item>
            </Menu>
        )
        const isDockerfile = this.state.dockerFileTextarea && this.state.dockerFileTextarea.length > 0
        const dockerfileEditBtnProps= {}
        if (isDockerfile) {
            dockerfileEditBtnProps.onClick = this.openDockerFileModal
        }
        const dockerfileEditBtn = (
            <Button
                className={this.state.noDockerfileInput ? 'noCodeStoreButton' : null}
                type={isDockerfile ? 'primary' : 'ghost'}
                size='large'
                {...dockerfileEditBtnProps}
            >
                {
                    isDockerfile
                        ? [<span>编辑云端 Dockerfile</span>]
                        : [<FormattedMessage {...menusText.createNewDockerFile} />]
                }
            </Button>
        )
        return (
            <div id='EditTenxFlowModal' key='EditTenxFlowModal'>
              <div className='titleBox'>
                <span><FormattedMessage {...menusText.titleEdit} /></span>
                <Icon type='cross' onClick={this.cancelChange} />
              </div>
              <Form horizontal>
                <div className='commonBox'>
                  <div className='title'>
                    <span>{this.props.isBuildImage ? <FormattedMessage {...menusText.buildImageName} /> : <FormattedMessage {...menusText.flowName} />}</span>
                  </div>
                  <div className='input'>
                    <FormItem
                        hasFeedback
                        help={isFieldValidating('flowName') ? '校验中...' : (getFieldError('flowName') || []).join(', ')}
                        style={{ width: '220px' }}
                    >
                      <Input {...flowNameProps} />
                    </FormItem>
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
                <div className='commonBox'>
                  <div className='title'>
                    <span>{this.props.isBuildImage ? <FormattedMessage {...menusText.buildImageCode} /> : <FormattedMessage {...menusText.flowCode} />}</span>
                  </div>
                  <div className="codeRepo">
                      {this.state.currentCodeStore ? [
                        <span style={{ marginRight: '15px' }}>{this.state.currentCodeStoreName + '  ' + (this.state.currentCodeStoreBranch ? formatMessage(menusText.branch) + this.state.currentCodeStoreBranch : '')}</span>
                      ] : null}
                      {this.renderSelectRepo()}
                      {this.state.currentCodeStore ? [
                        <Button key='deleteCodeBtn' type='ghost' size='large' style={{ marginLeft: '15px' }} onClick={this.deleteCodeStore}>
                          <Icon type='delete' />
                          <FormattedMessage {...menusText.deleteCode} />
                        </Button>
                      ] : null}
                      {
                          this.props.isBuildImage ? '' : index === 0 && (
                              <FormItem style={{height: "30px"}}>
                                <Checkbox {...uniformRepoProps}>当前流水线所有任务（包括新建任务），统一使用该代码库</Checkbox>
                              </FormItem>
                          )
                      }
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
                  {this.props.isBuildImage ? '' : <div className='line'></div>}
                  {this.props.isBuildImage ? '' : <div className='commonBox'>
                    <div className='title'>
                      <span><FormattedMessage {...menusText.imageName} /></span>
                    </div>
                    <div className='imageName input'>
                      <FormItem style={{ width: '220px', float: 'left' }}>
                        <PopTabSelect
                            placement="right"
                            placeholder="输入基础镜像"
                            value={currenImageName || this.state.baseImageUrl}
                            onChange={this.baseImageChange}
                            getTooltipContainer={() => document.getElementById('TenxFlowDetailFlow')}
                        >
                            {baseImagesNodes}
                        </PopTabSelect>
                      </FormItem>
                      <span className={this.state.emptyImageEnv ? 'emptyImageEnv defineEnvBtn' : 'defineEnvBtn'} onClick={this.openImageEnvModal}><FormattedMessage {...menusText.defineEnv} /></span>
                        {this.state.emptyImageEnv ? [<span className='emptyImageEnvError'><FormattedMessage {...menusText.emptyImageEnv} /></span>] : null}
                      <div className="customizeBaseImage">
                        基础镜像是用来提供执行当前任务的环境的，有默认的预置镜像（联系管理员），您也可以
                        <span className="link" onClick={() => toggleCustomizeBaseImageModal(true)}>自定义上传</span>
                      </div>
                      <div style={{ clear: 'both' }} />
                    </div>
                    <div style={{ clear: 'both' }} />
                  </div>}
                  {this.props.isBuildImage ? '' : <div className='commonBox'>
                    <div className='title'>
                      <span><FormattedMessage {...menusText.servicesTitle} /></span>
                    </div>
                    <div className='input services'>
                        {serviceItems}
                      <div className="relyOnService">
                        依赖服务是用来提供执行当前任务时所依赖的服务，因为是容器化，您可以自定义服务的环境变量
                      </div>
                    </div>
                    <div style={{ clear: 'both' }} />
                  </div>}
                  {this.props.isBuildImage ? '' :<div className='commonBox'>
                    <div className='title'>
                      <span><FormattedMessage {...menusText.shellCode} /></span>
                    </div>
                    <div className='input shellCode'>
                      <RadioGroup
                          value={this.state.shellCodeType}
                          disabled={this.state.otherFlowType == 3}
                          onChange={e => this.setState({ shellCodeType: e.target.value })}
                      >
                        <Radio value="scripts" key="scripts">使用脚本文件</Radio>
                        <Radio value="cmd" key="cmd">使用命令</Radio>
                      </RadioGroup>
                    </div>
                    <div style={{ clear: 'both' }} />
                    <div className='title'>
                    </div>
                    <div className='input shellCode'>
                        {
                            this.state.shellCodeType === 'scripts'
                                ? (
                                    <Button
                                        size="large"
                                        disabled={this.state.otherFlowType == 3}
                                        type={(this.state.scriptsId) ? 'primary' : 'ghost'}
                                        onClick={() => {
                                            this.setState({
                                                shellModalShow: true,
                                                scriptsTextarea: this.state.scriptsTextarea || '#!/bin/sh\n\n',
                                            })
                                        }}
                                    >
                                        {
                                            !this.state.scriptsId
                                                ? '使用脚本文件'
                                                : '编辑脚本文件'
                                        }
                                    </Button>
                                )
                                : <div>{shellCodeItems}</div>
                        }
                    </div>
                    <div style={{ clear: 'both' }} />
                  </div>}
                  {
                      this.state.otherFlowType == 3 ? [
                        <QueueAnim className='buildImageForm' key='buildImageForm'>
                          <div className='line'></div>
                          <div className='commonBox' key='buildImageFormAnimate'>
                            <div className='title'>
                              <span>Dockerfile</span>
                            </div>
                            <div className='input' style={{ height: '100px' }}>
                              <div className='operaBox' style={{ float: 'left', width: '500px' }}>
                                <RadioGroup onChange={this.changeUseDockerFile} value={this.state.currentCodeStore ? this.state.useDockerfile : false}>
                                  <Radio key='codeStore' value={true} disabled={!this.state.currentCodeStore}>
                                    <span>使用代码仓库中的 Dockerfile</span>
                                    <Tooltip title='请输入Dockerfile在代码仓库内的路径，其中 / 代表代码仓库的当前路径'>
                                      <Icon className='dockerIcon' type='question-circle-o' style={{ marginLeft: '10px', cursor: 'pointer' }} />
                                    </Tooltip>
                                  </Radio>
                                  <Radio key='create' value={false}>使用云端创建 Dockerfile</Radio>
                                </RadioGroup>
                              </div>
                                {
                                    (this.state.currentCodeStore ? !this.state.useDockerfile : true) ? [
                                      <QueueAnim key='useDockerFileAnimate' style={{ float: 'left' }}>
                                        <div key='useDockerFileAnimateSecond'>
                                            {
                                                isDockerfile && this.state.isDockerfile
                                                    ? dockerfileEditBtn
                                                    : [
                                                      <Popover
                                                          content={dockerfileEditModeList}
                                                          title="请选择编辑模式"
                                                          trigger="click"
                                                          getTooltipContainer={() => document.getElementById('TenxFlowDetail')}
                                                      >
                                                          {dockerfileEditBtn}
                                                      </Popover>
                                                    ]
                                            }
                                          <span className={this.state.noDockerfileInput ? 'noCodeStoreSpan CodeStoreSpan' : 'CodeStoreSpan'}><FormattedMessage {...menusText.noDockerFileInput} /></span>
                                        </div>
                                      </QueueAnim>
                                    ] : [<QueueAnim className='dockerFileInputAnimate' key='dockerFileInputAnimate'>
                                      <div key='useDockerFileAnimateSecond'>
                                        <Input className='dockerFileInput' {...dockerFileUrlProps} addonBefore='/' size='large' />
                                      </div>
                                    </QueueAnim>]
                                }
                            </div>
                            <div style={{ clear: 'both' }} />
                          </div>
                          <div className='commonBox'>
                            <div className='title'>
                              <span><FormattedMessage {...menusText.imageRealName} /></span>
                            </div>
                            <div className='input imageType'>
                              <FormItem hasFeedback style={{ width: '220px', float: 'left', marginRight: '20px' }}>
                                <Input {...imageRealNameProps} type='text' size='large' />
                              </FormItem>
                              <div style={{ clear: 'both' }} />
                            </div>
                            <div style={{ clear: 'both' }} />
                          </div>
                          <div className='commonBox'>
                            <div className='title'>
                              <span><FormattedMessage {...menusText.ImageStoreType} /></span>
                            </div>
                            <div className='input imageType'>
                              <FormItem style={{ float: 'left' }}>
                                <RadioGroup {...getFieldProps('imageType', { initialValue: (!!config.spec.build ? (config.spec.build.registryType + '') : '1'), onChange: this.changeImageStoreType }) }>
                                  <Radio key='imageStore' value={'1'}><FormattedMessage {...menusText.imageStore} /></Radio>
                                  <Radio key='DockerHub' value={'2'} disabled>Docker Hub</Radio>
                                  <Radio key='otherImage' value={'3'}><FormattedMessage {...menusText.otherImage} /></Radio>
                                </RadioGroup>
                              </FormItem>
                              <FormItem style={{ width:'220px' }}>
                                <Select {...validOtherImage} style={{display: getFieldProps('imageType').value == '3' ? 'inline-block' : 'none'}}>
                                    {this.getOtherImage()}
                                </Select>
                              </FormItem>
                              <FormItem style={{ width: '220px'}}>
                                <Select {...harborProjectProps} size='large' style={{display: !this.state.showOtherImage ? 'inline-block' : 'none'}}>
                                    {
                                        (this.props.harborProjects.list || []).map(project => {
                                            const currentRoleId = project[camelize('current_user_role_id')]
                                            return (
                                                <Option key={project.name} disabled={currentRoleId === 3}>
                                                    {project.name} {currentRoleId == 3 && '（访客）'}
                                                </Option>
                                            )}
                                        )
                                    }
                                </Select>
                              </FormItem>
                              <div className="customizeBaseImage">
                                为方便管理，构建后的镜像可发布到镜像仓库（所选仓库组）或第三方镜像仓库中
                              </div>
                              <div style={{ clear: 'both' }} />
                            </div>
                            <div style={{ clear: 'both' }} />
                          </div>
                          <div className='commonBox'>
                            <div className='title'>
                              <span><FormattedMessage {...menusText.ImageTag} /></span>
                            </div>
                            <div className='input'>
                              <FormItem style={{ float: 'left' }}>
                                <RadioGroup {...getFieldProps('imageTag', { initialValue: (!!config.spec.build ? (config.spec.build.imageTagType + '') : '1'), onChange: this.changeImageTagType }) }>
                                  <Radio key='branch' value={'1'} disabled={this.state.disabledBranchTag || !this.state.currentCodeStore}><FormattedMessage {...menusText.ImageTagByBranch} /></Radio>
                                  <Radio key='time' value={'2'}><FormattedMessage {...menusText.ImageTagByTime} /></Radio>
                                  <Radio key='other' value={'3'}><FormattedMessage {...menusText.ImageTagByOther} /></Radio>
                                </RadioGroup>
                                <div className="customizeBaseImage">
                                  选择构建生成的Docker镜像的tag命名规范，支持以上三种命名规则
                                </div>
                              </FormItem>
                                {
                                    this.state.otherTag ? [
                                      <div key='otherTagAnimate'>
                                        <FormItem style={{ width: '200px', float: 'left' }}>
                                          <Input {...otherImageTagProps} type='text' size='large' />
                                        </FormItem>
                                      </div>
                                    ] : null
                                }
                              <div style={{ clear: 'both' }} />
                            </div>
                            <div style={{ clear: 'both' }} />
                          </div>
                          <div className='commonBox'>
                            <div className='title'>
                              <span><FormattedMessage {...menusText.buildCache} /></span>
                            </div>
                            <div className='input imageType'>
                              <FormItem>
                                <Switch {...getFieldProps('buildCache' , { initialValue: !!config.spec.build ? !config.spec.build.noCache : true}) } defaultChecked={!!config.spec.build ? !config.spec.build.noCache : true} />
                              </FormItem>
                            </div>
                            <div style={{ clear: 'both' }} />
                          </div>
                        </QueueAnim>
                      ] : null
                  }
                  { isStandardMode() ?
                      ( <div className='commonBox'>
                        <div className='title'>
                          <span><FormattedMessage {...menusText.buildArea} /></span>
                        </div>
                        <div className='input imageType'>
                          <FormItem>
                            <Select {...buildArea} style={{width: "150px"}}>
                                {this.getBuildArea}
                            </Select>
                          </FormItem>
                        </div>
                        <div style={{ clear: 'both' }} />
                      </div>)  :
                      (<div className='commonBox'>
                        <div className='title'>
                          <span><FormattedMessage {...menusText.buildCluster} /></span>
                        </div>
                        <div className='input imageType'>
                          <FormItem>
                            <Select style={{width: "150px"}} {...buildCluster}>
                                {this.getBuildCluster()}
                            </Select>
                          </FormItem>
                        </div>
                        <div style={{ clear: 'both' }} />
                      </div>)}
                <Modal className='dockerFileEditModal'
                       title={<FormattedMessage {...menusText.dockerFileTitle} />}
                       visible={
                           this.state.dockerfileEditMode === 'textEditing' &&
                           this.state.dockerFileModalShow
                       }
                       maskClosable={false}
                       footer={null}
                >
                  <DockerFileEditor value={this.state.dockerFileTextarea} callback={this.onChangeDockerFileTextarea} options={defaultOptions} />
                  <div className='btnBox'>
                    <Button
                        size='large'
                        type='primary'
                        loading={this.state.updateDfBtnLoading}
                        onClick={this.handleUpdateDockerfile}
                    >
                      <span>保存并使用</span>
                    </Button>
                    <Button size='large' onClick={this.closeDockerFileModal}>
                      <span>取消</span>
                    </Button>
                  </div>
                </Modal>
                <DockerfileModal
                    visible={
                        this.state.dockerfileEditMode === 'visualEditing' &&
                        this.state.dockerFileModalShow
                    }
                    onCancel={this.closeDockerFileModal}
                    onChange={
                        (value, submit) => this.setState({dockerFileTextarea: value}, () => {
                            submit && this.handleUpdateDockerfile()
                        })
                    }
                    defaultValue={this.state.dockerFileTextarea}
                />
                <Modal className='dockerFileEditModal'
                       title="创建脚本文件"
                       visible={this.state.shellModalShow}
                       maskClosable={false}
                       footer={null}
                >
                  <ShellEditor
                      title="创建脚本文件"
                      value={this.state.scriptsTextarea}
                      callback={value => this.setState({ scriptsTextarea: value })}
                      options={defaultOptions}
                  />
                  <div className='btnBox'>
                    <Button size='large' type='primary' onClick={this.saveShellCode} loading={this.state.saveShellCodeBtnLoading}>
                      <span>保存并使用</span>
                    </Button>
                    <Button size='large' onClick={() => this.setState({ shellModalShow: false, scriptsTextarea: this.oldScripts })}>
                      <span>取消</span>
                    </Button>
                  </div>
                </Modal>
                <Modal className='tenxFlowImageEnvModal'
                       title={<FormattedMessage {...menusText.envTitle} />}
                       visible={this.state.ImageEnvModal}
                       onOk={this.closeImageEnvModal}
                       onCancel={this.closeEnv}
                       footer={[
                         <Button key="submit" type="primary" size="large" onClick={this.closeImageEnvModal}>
                           确 定
                         </Button>,
                       ]}
                >
                  <ImageEnvComponent
                      validateCallback ={result => this.setState({ validateStatus: result })}
                      scope={scopeThis} form={form} config={config.spec.container.env} defaultConfig={configBaseConfig} visible={this.state.ImageEnvModal}/>
                </Modal>
              </Form>
              <div className='modalBtnBox'>
                <Button size='large' onClick={this.cancelChange}>
                  <FormattedMessage {...menusText.cancel} />
                </Button>
                <Button size='large' type='primary' onClick={this.handleSubmit}>
                  <FormattedMessage {...menusText.submit} />
                </Button>
              </div>
              <Modal className='tenxFlowCodeStoreModal' title={ <FormattedMessage {...menusText.codeStore} /> }
                     visible={this.state.codeStoreModalShow}
                     onOk={() => this.okCodeStoreModal()}
                     onCancel={this.closeCodeStoreModal}
              >
                <CodeStoreListModal scope={scopeThis} config={codeList} hadSelected={this.state.currentCodeStore} okCallback={() => this.okCodeStoreModal()}/>
              </Modal>
              <Modal title="添加第三方仓库" visible={this.state.addOtherImage}
                     onOk={()=> this.addOtherImage()} onCancel={()=> this.cancelModal()}
              >
                <div className="modalColor" style={{lineHeight:'30px'}}><i className="anticon anticon-question-circle-o" style={{marginRight: '8px',marginLeft:'16px'}}></i>
                  是否跳转添加第三方仓库
                </div>
              </Modal>
            </div>
        )
    }
});

function mapStateToProps(state, props) {
    const defaultClusterList = {
        isFetching: false,
        clusterList: []
    }
    const defaultClustersNodes = {
        isEmptyObject: true,
        isFetching: false,
        nodes: []
    }
    let clustersNodes = state.cluster_nodes.getAllClusterNodes
    if(!clustersNodes || Object.getOwnPropertyNames(clustersNodes).length == 0) {
        clustersNodes = defaultClustersNodes
    }

    let { clusters } = state.cluster
    if(!clusters || Object.getOwnPropertyNames(clusters).length == 0) {
        clusters = defaultClusterList
    }
    let harborProjects = state.harbor.projects && state.harbor.projects[DEFAULT_REGISTRY] || {}
    const list = harborProjects.list || []
    const newList = []
    const visitorList = []
    list.forEach(project => {
        const currentRoleId = project[camelize('current_user_role_id')]
        if (currentRoleId === 3) {
            visitorList.push(project)
            return
        }
        newList.push(project)
    })
    harborProjects.list = newList.concat(visitorList)
    return {
        clusters,
        clustersNodes,
        harborProjects,
    }
}

EditTenxFlowModal = createForm()(EditTenxFlowModal);

EditTenxFlowModal.propTypes = {
    intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
    updateTenxFlowState,
    getDockerfiles,
    setDockerfile,
    getAvailableImage,
    updateTenxFlow,
    getTenxFlowDetail,
    loadClusterList,
    getAllClusterNodes,
    loadProjectList,
    loadRepositoriesTags,
    createScripts,
    updateScriptsById,
    getScriptsById,
})(injectIntl(EditTenxFlowModal, {
    withRef: true,
}));

