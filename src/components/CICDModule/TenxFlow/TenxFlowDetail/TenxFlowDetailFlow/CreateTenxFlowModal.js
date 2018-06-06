/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateTenxFlowModal component
 *
 * v0.1 - 2016-11-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Switch, Radio, Checkbox, Icon, Select, Modal, Tooltip, Spin, Popover, Menu } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import cloneDeep from 'lodash/cloneDeep'
import { camelize } from 'humps'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { appNameCheck } from '../../../../../common/naming_validation'
import DockerFileEditor from '../../../../Editor/DockerFile'
import ShellEditor from '../../../../Editor/Shell'
import { createTenxFlowState, createDockerfile, getTenxFlowDetail, createScripts } from '../../../../../actions/cicd_flow'
import { loadProjectList } from '../../../../../actions/harbor'
import './style/CreateTenxFlowModal.less'
import EnvComponent from './EnvComponent.js'
import CreateImageEnvComponent from './CreateImageEnvComponent.js'
import CodeStoreListModal from './CodeStoreListModal.js'
import NotificationHandler from '../../../../../common/notification_handler'
import { isStandardMode } from '../../../../../common/tools'
import PopTabSelect from '../../../../PopTabSelect'
import { loadClusterList } from '../../../../../actions/cluster'
import { getAllClusterNodes } from '../../../../../actions/cluster_node'
import DockerfileModal from '../../../DockerfileModal'

const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;
const PopTab = PopTabSelect.Tab;
const PopGroup = PopTabSelect.OptionGroup;
const PopOption = PopTabSelect.Option;
const defaultOptions = {
  readOnly: false
}

const menusText = defineMessages({
  titleEdit: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.titleEdit',
    defaultMessage: '编辑子任务卡片',
  },
  titleAdd: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.titleAdd',
    defaultMessage: '创建子任务卡片',
  },
  unitCheck: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.unitCheck',
    defaultMessage: '单元测试',
  },
  containCheck: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.containCheck',
    defaultMessage: '集成测试',
  },
  podToPodCheck: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.podToPodCheck',
    defaultMessage: '端对端测试',
  },
  runningCode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.runningCode',
    defaultMessage: '代码编译',
  },
  buildImage: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.buildImage',
    defaultMessage: '镜像构建',
  },
  other: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.other',
    defaultMessage: '自定义',
  },
  flowType: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.flowType',
    defaultMessage: '子任务类型',
  },
  flowCode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.flowCode',
    defaultMessage: '子任务代码',
  },
  buildImageCode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.buildImageCode',
    defaultMessage: '任务代码',
  },
  flowName: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.flowName',
    defaultMessage: '子任务名称',
  },
  buildImageName: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.buildImageName',
    defaultMessage: '任务名称',
  },
  selectCode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.selectCode',
    defaultMessage: '选择代码库',
  },
  imageName: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.imageName',
    defaultMessage: '基础镜像',
  },
  defineEnv: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.defineEnv',
    defaultMessage: '自定义环境变量',
  },
  servicesTitle: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.servicesTitle',
    defaultMessage: '依赖服务',
  },
  addServices: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.addServices',
    defaultMessage: '继续添加',
  },
  shellCode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.shellCode',
    defaultMessage: '脚本命令',
  },
  submit: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.submit',
    defaultMessage: '确定',
  },
  cancel: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.cancel',
    defaultMessage: '取消',
  },
  dockerFileCreate: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.dockerFileCreate',
    defaultMessage: '',
  },
  selectDockerFile: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.selectDockerFile',
    defaultMessage: '选择已有',
  },
  createNewDockerFile: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.createNewDockerFile',
    defaultMessage: '使用云端 Dockerfile',
  },
  imageRealName: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.imageRealName',
    defaultMessage: '镜像名称',
  },
  imageStore: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.imageStore',
    defaultMessage: '镜像仓库',
  },
  otherImage: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.otherImage',
    defaultMessage: '自定义仓库',
  },
  ImageTag: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageTag',
    defaultMessage: '镜像版本',
  },
  ImageStoreType: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageStoreType',
    defaultMessage: '仓库类型',
  },
  ImageTagByBranch: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageTagByBranch',
    defaultMessage: '以代码分支名为tag',
  },
  ImageTagByTime: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageTagByTime',
    defaultMessage: '时间戳为tag',
  },
  ImageTagByOther: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageTagByOther',
    defaultMessage: '自定义tag',
  },
  buildCache: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.buildCache',
    defaultMessage: '构建缓存',
  },
  buildCluster: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.buildCluster',
    defaultMessage: '构建环境',
  },
  buildNode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.buildNode',
    defaultMessage: '构建节点',
  },
  buildArea: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.buildArea',
    defaultMessage: '构建地域',
  },
  envTitle: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.envTitle',
    defaultMessage: '自定义环境变量',
  },
  codeStore: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.codeStore',
    defaultMessage: '代码仓库',
  },
  noCodeStore: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.noCodeStore',
    defaultMessage: '请选择代码仓库',
  },
  branch: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.branch',
    defaultMessage: '分支：',
  },
  dockerFileTitle: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.dockerFileTitle',
    defaultMessage: '创建 Dockerfile',
  },
  noDockerFileInput: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.noDockerFileInput',
    defaultMessage: 'Dockerfile 不能为空',
  },
  deleteCode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.deleteCode',
    defaultMessage: '不使用代码库',
  },
  emptyImageEnv: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.emptyImageEnv',
    defaultMessage: '环境变量值不能为空',
  }
});

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
let CreateTenxFlowModal = React.createClass({
  getInitialState: function () {
    const { currentCodeStore, currentCodeStoreName, currentCodeStoreBranch } = this.getUniformRepo()
    return {
      otherFlowType: 3,
      useDockerfile: false,
      otherTag: false,
      envModalShow: null,
      makeSure:false,
      ImageStoreType: false,
      codeStoreModalShow: false,
      currentCodeStore,
      currentCodeStoreName,
      noSelectedCodeStore: false,
      currentCodeStoreBranch,
      dockerFileModalShow: false,
      dockerFileTextarea: '',
      noDockerfileInput: false,
      ImageEnvModal: false,
      emptyImageEnv: false,
      emptyServiceEnv: [],
      baseImage: [],
      showOtherImage: false,
      clusterNodes: [],
      disabledBranchTag: false,
      groupKey: '3',
      isFirstChangeTag: true,
      isFirstChangeDockerfileType: true,
      isCreateScripts: true,
      shellCodeType: 'scripts',
      shellModalShow: false,
      scriptsTextarea: '',
      saveShellCodeBtnLoading: false,
      dockerfileEditMode: 'textEditing',
      validateStatus: true,
      imageEnvList:[],
      tempList:[]
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
    const { loadClusterList, loadProjectList } = this.props
    loadClusterList()
    loadProjectList(DEFAULT_REGISTRY, { page_size: 100 })
  },
  flowNameExists(rule, value, callback) {
    const { stageList } = this.props;
    if (!value || !value.trim()) {
      return callback()
    }
    if (value.length < 3 || value.length > 63) {
      return callback('子任务名称为 3~63 位字符')
    }
    let flag = false;
    if (stageList.length > 0) {
      stageList.map((item) => {
        if (item.metadata.name == value) {
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
    if (notResetShell) {
      this.setState({
        otherFlowType: ins
      })
      return
    }
    // Clean the command entries
    this.props.form.setFieldsValue({ 'shellCodes': [0] });
    this.props.form.setFieldsValue({ 'shellCode0': '' });
    if (this.props.config && this.props.config.spec && this.props.config.spec.container) {
      this.props.config.spec.container.args = {}
    }
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
    this.refs.haha.handReset()

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
    const { form } = this.props;
    let inputValue = form.getFieldValue('shellCode' + index);
    let changed = false
    let keys = form.getFieldValue('shellCodes');
    let max = keys[keys.length - 1]
    if (index == max && !!inputValue) {
      changed = true
      keys = keys.concat(max + 1);
    }
    if (index == max - 1 && !inputValue) {
      let nextInputValue = form.getFieldValue('shellCode' + index + 1);
      if (!nextInputValue) {
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
      },() => {
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
    const { form } = this.props
    if (this.state.isFirstChangeTag) {
      form.setFieldsValue({
        imageTag: '1'
      })
      this.changeImageTagType({
        target: {
          value: 1
        }
      })
      this.setState({
        isFirstChangeTag: false
      })
    }
    if(this.state.isFirstChangeDockerfileType) {
      this.setState({
        isFirstChangeDockerfileType: false,
        useDockerfile: true
      })
    }
    if(this.state.useDockerfile) {
      this.setState({
        noDockerfileInput: false
      })
    }
  },
  deleteCodeStore() {
    //this function for user delete the code store
    this.setState({
      currentCodeStore: null,
      currentCodeStoreBranch: '',
      currentCodeStoreName: '',
      useDockerfile:false
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
      dockerFileModalShow: false
    });
    if(this.state.dockerFileTextarea) {
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
    const { scriptsTextarea } = this.state
    const firstLine = scriptsTextarea.split('\n')[0]
    if (firstLine.indexOf('#!') !== 0) {
      notification.error('格式错误', '请在首行填写 Shebang（声明解释器，例如 bash 环境填写 #!/bin/bash）')
      return
    }
    this.setState({
      shellModalShow: false,
    })
  },
  openImageEnvModal() {
    this.setState({
      ImageEnvModal: true
    });
  },
  closeImageEnv(){
      this.setState({
          ImageEnvModal: false
      });
  },
  cancelChange(e) {
    //this function for reset the form and close the edit card
    e.preventDefault();
    e.stopPropagation();
    this.props.form.resetFields();
    const { scope } = this.props;
    this.setState({
      useDockerfile: false,
      otherTag: false,
      ImageStoreType: false
    });
    scope.closeCreateNewFlow();
  },
  handleSubmit(e) {
    //this function for user submit the form
    const { scope, createTenxFlowState, flowId, stageInfo, createDockerfile, getTenxFlowDetail, stageList } = this.props;
    const { getTenxFlowStateList } = scope.props;
    const _this = this;
    let notification = new NotificationHandler()
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        e.preventDefault();
        if(this.state.otherFlowType == 3 && !_this.state.currentCodeStore && !_this.state.dockerFileTextarea) {
          this.setState({
            noDockerfileInput: true
          })
          return
        }
        if(_this.state.currentCodeStore) {
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
      if(this.state.otherFlowType == 3 && !_this.state.currentCodeStore && !_this.state.dockerFileTextarea) {
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
                let tempBody = {
                  name: (values['service' + item + 'inputName' + littleItem]).trim(),
                  value: (values['service' + item + 'inputValue' + littleItem]).trim()
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
          temp.env = this.state.tempList.length!=0?this.state.tempList:tempList;
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
        if (values['imageEnvName' + item] != '') {
          if (values['imageEnvValue' + item] == '') {
            _this.setState({
              emptyImageEnv: true
            });
            errorFlag = true;
            imageEnvFlag = true;
          } else {
            let tempBody = {
              name: (values['imageEnvName' + item]).trim(),
              value: (values['imageEnvValue' + item]).trim()
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
        notification.error('环境变量值输入有误')
        return;
      }
      //get shell code
      let shellLength = values.shellCodes;
      let shellList = [];
      if (_this.state.shellCodeType == 'cmd') {
        shellLength.map((item, index) => {
          if (!!values['shellCode' + item]) {
            shellList.push(values['shellCode' + item].trim());
          }
        });
      }
      let body = {
        'metadata': {
          'name': values.flowName,
          'type': parseInt(this.state.otherFlowType),
        },
        'spec': {
          'container': {
            'image': values.imageName,
            'args': shellList,
            'env': this.state.imageEnvList,
            'dependencies': serviceList
          },
          'project': {
            'id': this.state.currentCodeStore,
            'branch': this.state.currentCodeStoreBranch
          },
          ci: {
            config: {
              buildCluster: isStandardMode() ? values['buildArea'] : values['buildCluster']
            }
          },
          uniformRepo: (values.uniformRepo ? 0 : 1),
        }
      }
      if (stageList.length !==0) {
        body.spec.uniformRepo = this.props.uniformRepo
      }
      //if user select the customer type (6), ths customType must be input
      if (this.state.otherFlowType == 5) {
        body.metadata.customType = values.otherFlowType;
      }
      //if user select the image build type (3),the body will add more data
      if (this.state.otherFlowType == 3) {
        let dockerFileFrom
        if(_this.state.currentCodeStore) {
          dockerFileFrom = _this.state.useDockerfile ? 1 : 2
        } else {
          dockerFileFrom = 2
        }
        // Get the projectId of harbor project
        let harborProjects = this.props.harborProjects.list || []
        let projectId = 0
        for (let i in harborProjects) {
          if (values.harborProjectName == harborProjects[i].name) {
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
        if(imageBuildBody.registryType == 3) {
          imageBuildBody.customRegistry = values.otherImage
        }
        if (this.state.otherTag) {
          imageBuildBody.customTag = values.otherTag
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
        let tempDockerFileList = tmpDockerFileUrl.split('/');
        tmpDockerFileUrl = tempDockerFileList.slice(0, tempDockerFileList.length -1).join('/');
        imageBuildBody.DockerfileName = tempDockerFileList[tempDockerFileList.length -1].length > 0 ? tempDockerFileList[tempDockerFileList.length -1] : 'Dockerfile';
        if (tmpDockerFileUrl.indexOf('/') != 0) {
          imageBuildBody.DockerfilePath = '/' + tmpDockerFileUrl;
        } else {
          imageBuildBody.DockerfilePath = tmpDockerFileUrl;
        }
        body.spec.build = imageBuildBody;
      }
      // 创建 stage
      const _createTenxFlowState = function() {
        createTenxFlowState(flowId, body, {
          success: {
            func: (res) => {
              if (typeof values.uniformRepo !== undefined) {
                getTenxFlowDetail(flowId)
              }
              if (!_this.state.useDockerfile && _this.state.otherFlowType == 3) {
                let dockerfilebody = {
                  content: _this.state.dockerFileTextarea,
                  flowId: flowId,
                  stageId: res.data.results.stageId,
                  type: _this.state.dockerfileEditMode === 'textEditing'
                        ? 0
                        : 1
                }
                createDockerfile(dockerfilebody, {
                  success: {
                    func: () => {
                      scope.closeCreateNewFlow();
                      getTenxFlowStateList(flowId, {
                        success: {
                          func: (results) => {
                            _this.handWebSocket(scope, results)
                          }
                        }
                      })
                    },
                    isAsync: true
                  }
                })
              } else {
                scope.closeCreateNewFlow();
                getTenxFlowStateList(flowId, {
                  success: {
                    func: (results) => {
                      _this.handWebSocket(scope, results)
                    }
                  }
                })
              }
              notification.success('创建成功');
            },
            isAsync: true
          }
        });
      }
      // 使用命令或构建镜像时直接创建 stage 跳过创建脚本
      if (_this.state.shellCodeType === 'cmd' || body.metadata.type === 3) {
        return _createTenxFlowState()
      }
      const { createScripts } = _this.props
      const scripts = {
        content: _this.state.scriptsTextarea,
      }
      // 创建 scripts
      createScripts(scripts, {
        success: {
          func: res => {
            body.spec.container.scripts_id = res.data.id
            _createTenxFlowState()
          },
          isAsync: true,
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
        }
      })
    });
  },
  handWebSocket(scope, res){
    let buildingList = []
    res.data.results.map((item) => {
      let buildId = null;
      if (!Boolean(item.lastBuildStatus)) {
        buildId = null;
      } else {
        buildId = item.lastBuildStatus.buildId;
      }
      let buildItem = {
        buildId: buildId,
        stageId: item.metadata.id
      }
      if (item.lastBuildStatus) {
        buildItem.status = item.lastBuildStatus.status
      }
      buildingList.push(buildItem)
    })
    scope.onSetup(scope.state.socket, buildingList)
  },
  getOtherImage() {
    const { otherImage } = this.props
    if(!otherImage || !Array.isArray(otherImage)){
      return []
    }
    return otherImage.map(item => {
      return <Option value={item.id}>{item.title}</Option>
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
      addOtherImage: false
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
      groupKey,
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
    // if(oldImageName.indexOf(':') > 0 && oldOtherFlowType == groupKey) {
    //   if(key.indexOf(':') > 0) {
    //     let old = oldImageName.split(':')
    //     let newKey = key.split(':')
    //     if(old[0] == newKey[0] && old[1] != newKey[1]) {
    //       notResetShell = true
    //     }
    //   }
    // }
    if(oldOtherFlowType == groupKey) {
      notResetShell = true
    }
    this.flowTypeChange(groupKey, notResetShell)
  },
  setUniformRepo() {
    this.setState(this.getUniformRepo())
  },
  renderSelectRepo() {
    const {
      config, stageList, uniformRepo,
    } = this.props
    const { currentCodeStore } = this.state
    if (stageList.length === 0 || uniformRepo !== 0) {
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
      form, codeList, stageList,
      supportedDependencies, imageList,
      toggleCustomizeBaseImageModal,
      baseImages, uniformRepo,
    } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
    const scopeThis = this;
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
    let customeImageList  = cloneDeep(imageList)
    if (imageList === undefined || imageList.length === 0) {
      customeImageList = []
    }
    let intFlowTypeIndex = this.state.otherFlowType - 1
    let buildImages = []
    let dependenciesImages = []
    if(customeImageList.length >0 ) {
      customeImageList.forEach(function (image) {
        if (image.imageList[0].categoryId > 100) {
          dependenciesImages.push(image)
        } else {
          buildImages.push(image)
        }
      })
    }
    let serviceSelectList = []
    if (dependenciesImages.length != 0) {
      serviceSelectList = dependenciesImages[0].imageList.map((item, index) => {
        return (
          <Option value={item.imageName} key={index}>{item.imageName}</Option>
        )
      })
    }
    let selectImage = []
    if (buildImages.length > 0) {
      selectImage = buildImages.map((list, index) => {
        return (
          <Option key={list.title} value={list.title + `@` + (index + 1)}>{list.title}</Option>
        )
      })
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
    let defaultBaseImage
    function renderPopGroups(groups) {
      const groupsNodes = []
      for (let key in groups) {
        if (groups.hasOwnProperty(key)) {
          const images = groups[key] || []
          const { categoryName, categoryId, imageName } = images[0] || {}
          if (typeof categoryId !== undefined && categoryId != 101) {
            if (categoryId == 3) {
              defaultBaseImage = imageName
            }
            groupsNodes.push(
              <PopGroup label={categoryName} value={categoryId} key={categoryId}>
                {
                  images.map(image => (
                    <PopOption value={image.imageUrl}>
                      {image.imageName}
                    </PopOption>
                  ))
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

    getFieldProps('services', {
      initialValue: [0],
    });
    getFieldProps('shellCodes', {
      initialValue: [0],
    });
    const serviceItems = getFieldValue('services').map((k) => {
      const serviceSelect = getFieldProps(`serviceSelect${k}`, {
        rules: [
          { message: '请选择' },
        ],
      });
      return (
        <QueueAnim key={'serviceName' + k + 'Animate'}>
          <div className='serviceDetail' key={'serviceName' + k}>
            <Form.Item className='commonItem'>
              <Select {...serviceSelect} style={{ width: '220px' }} allowClear dropdownMatchSelectWidth={false}>
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
              // onOk={this.closeEnvSettingModal}
                footer={null}
              onCancel={this.closeEnvSetting}
              >
              <EnvComponent ref='haha'  validateCallback ={result => this.setState({ validateStatus: result })}
                scope={scopeThis}  imageName={this.props.form.getFieldValue(`serviceSelect${k}`)} index={k} visible={this.state.envModalShow == k ? true : false}/>
            </Modal>
          </div>
        </QueueAnim>
      )
    });
    const scodes = getFieldValue('shellCodes')
    const shellCodeItems = scodes.map((i) => {
      const shellCodeProps = getFieldProps(`shellCode${i}`, {
        rules: [
          { message: '请输入脚本命令' },
        ],
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

    /*const flowTypeProps = getFieldProps('flowType', {
      rules: [
        { required: true, message: '请选择子任务类型' },
      ],
      onChange: this.flowTypeChange,
      initialValue: buildImages[intFlowTypeIndex].title,
    });*/

    const imageRealNameProps = getFieldProps('imageRealName', {
      rules: [
        { message: '请输入镜像名称' },
        { validator: this.realImageInput },
      ],
    });
    const harborProjectProps = getFieldProps('harborProjectName', {
      rules: [
        { message: '请选择仓库组', required: this.state.groupKey == 3 },
      ],
    });
    let initialBuildImage = buildImages[intFlowTypeIndex] ? buildImages[intFlowTypeIndex].imageList[0].imageName : ''
    if (intFlowTypeIndex === 2) { // It's to build image step, use default one
	  initialBuildImage ='enncloud/image-builder:v2.2';
// 		initialBuildImage =defaultBaseImage  
    }
    const imageNameProps = getFieldProps('imageName', {
      rules: [
        { required: true, message: '请选择基础镜像' }
      ],
      initialValue: initialBuildImage
    });
    const flowNameProps = getFieldProps('flowName', {
      rules: [
        { message: '请输入子任务名称', required: true },
        { validator: this.flowNameExists },
      ],
    });
    const dockerFileUrlProps = getFieldProps('dockerFileUrl', {
      rules: [
        { message: '请输入 Dockerfile 地址' },
      ],
      initialValue: 'Dockerfile',
    });
    const dockerFileNameProps = getFieldProps('dockerFileName', {
      rules: [
        { message: '请输入 Dockerfile 名称' },
      ],
      initialValue: '',
    });
    let validOtherImage
    if (this.state.showOtherImage) {
      validOtherImage = getFieldProps('otherImage', {
        rules: [
          { message: '请选择镜像仓库' },
          { validator: this.validOtherImage },
        ],
      });
    } else {
      validOtherImage = getFieldProps('otherImage', { rules: []})
    }
    // const otherImageStoreTypeProps = getFieldProps('otherStoreUrl', {
    //   rules: [
    //     { message: '请输入自定义仓库地址' },
    //     { validator: this.otherStoreUrlInput },
    //   ],
    // });
    const otherImageTagProps = getFieldProps('otherTag', {
      rules: [
        { message: '请输入镜像版本' },
        { validator: this.otherTagInput },
      ],
    });
    let uniformRepoProps
    if (stageList.length === 0) {
      uniformRepoProps = getFieldProps('uniformRepo', {
        valuePropName: 'checked',
        initialValue: true,
      })
    }
    const buildCluster = getFieldProps('buildCluster', {
      rules: [
        { message: '请选择构建集群', required: isStandardMode() ? false : true}
      ],
      initialValue: buildClusters[0]
    })
    const buildArea = getFieldProps('buildArea', {
      rules: [
        { message: '请选择构建区域', required: isStandardMode() ? true : false}
      ],
      initialValue: buildClusters[0]
    })
    const dockerfileEditModeList = (
      <Menu className="dockerfileEditModeList"
        onClick={({ key }) => this.setState({ dockerfileEditMode: key, dockerFileModalShow: true })}
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
      <div id='CreateTenxFlowModal' key='CreateTenxFlowModal'>
        <div className='titleBox'>
          <span><FormattedMessage {...menusText.titleAdd} /></span>
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
                <Input {...flowNameProps} type='text' size='large' />
              </FormItem>
            </div>
            <div style={{ clear: 'both' }} />
          </div>
          {/*<div className='commonBox' key='bigForm'>
            <div className='title'>
              <span><FormattedMessage {...menusText.flowType} /></span>
            </div>
            <div className='input flowType'>
              <FormItem className='flowTypeForm'>
                <Select {...flowTypeProps} style={{ width: 120 }}>
                  {selectImage}
                </Select>
              </FormItem>
            </div>
            <div style={{ clear: 'both' }} />
          </div>*/}
          <div className='commonBox'>
            <div className='title'>
              <span>{this.props.isBuildImage ? <FormattedMessage {...menusText.buildImageCode} /> : <FormattedMessage {...menusText.flowCode} />}</span>
            </div>
            <div className='codeRepo'>
              {!!this.state.currentCodeStoreName ? [
                <span style={{ marginRight: '15px' }}>{this.state.currentCodeStoreName + '  ' + (this.state.currentCodeStoreBranch ? formatMessage(menusText.branch) + this.state.currentCodeStoreBranch : '')}</span>
              ] : null}
              {this.renderSelectRepo()}
              {!!this.state.currentCodeStoreName ? [
                <Button key='deleteCodeBtn' type='ghost' size='large' style={{ marginLeft: '15px' }} onClick={this.deleteCodeStore}>
                  <Icon type='delete' />
                  <FormattedMessage {...menusText.deleteCode} />
                </Button>
                ] : null}
              {
                this.props.isBuildImage ? '' : stageList.length === 0 && (
                  <FormItem style={{height: "30px"}}>
                      <Checkbox {...uniformRepoProps}>当前流水线所有任务（包括新建任务），统一使用该代码库</Checkbox>
                  </FormItem>
                )
              }
              {/*<span className={this.state.noSelectedCodeStore ? 'noCodeStoreSpan CodeStoreSpan' : 'CodeStoreSpan'}><FormattedMessage {...menusText.noCodeStore} /></span>*/}
            </div>
            <div style={{ clear: 'both' }} />
          </div>

          {this.props.isBuildImage ? '' : <div className='line'></div>}
          {this.props.isBuildImage ? '' :<div className='commonBox'>
            <div className='title'>
              <span><FormattedMessage {...menusText.imageName} /></span>
            </div>
            <div className='imageName input'>
              <FormItem style={{ width: '220px', float: 'left' }}>
                {/*<Select {...imageNameProps}>
                 {baseImage}
                 </Select>*/}
                <PopTabSelect
                  placeholder="请输入镜像名称"
                  placement="right"
                  value={initialBuildImage || defaultBaseImage || this.state.baseImageUrl}
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
          </div> }
          {this.props.isBuildImage ? '' : <div className='commonBox'>
            <div className='title'>
              <span><FormattedMessage {...menusText.servicesTitle} /></span>
            </div>
            <div className='input services'>
              {serviceItems}
              {/*<div className='addServicesBtn' onClick={this.addService}>
               <Icon type='plus-circle-o' />
               <FormattedMessage {...menusText.addServices} />
               </div>*/}
              <div className="relyOnService">
                依赖服务是用来提供执行当前任务时所依赖的服务，因为是容器化，您可以自定义服务的环境变量
              </div>
            </div>
            <div style={{ clear: 'both' }} />
          </div>}
          {this.props.isBuildImage ? '' : <div className='commonBox'>
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
                  type={(!this.state.isCreateScripts) ? 'primary' : 'ghost'}
                  onClick={() => {
                    this.setState({
                      shellModalShow: true,
                      scriptsTextarea: this.state.scriptsTextarea || '#!/bin/sh\n\n',
                    })
                  }}
                >
                  {
                    this.state.isCreateScripts
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
                              isDockerfile
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
                      ] : [
                      <QueueAnim className='dockerFileInputAnimate' key='dockerFileInputAnimate'>
                        <div key='useDockerFileAnimateFirst'>
                          <Input className='dockerFileInput' {...dockerFileUrlProps} addonBefore='/' size='large' />
                        </div>
                      </QueueAnim>
                      ]
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
                      <RadioGroup {...getFieldProps('imageType', { initialValue: '1', onChange: this.changeImageStoreType }) }>
                        <Radio key='imageStore' value={'1'}><FormattedMessage {...menusText.imageStore} /></Radio>
                        <Radio key='DockerHub' value={'2'} disabled>Docker Hub</Radio>
                        <Radio key='otherImage' value={'3'}><FormattedMessage {...menusText.otherImage} /></Radio>
                      </RadioGroup>
                    <div style={{ clear: 'both' }} />
                    </FormItem>
                    <FormItem style={{ width:'220px' }}>
                      <Select showSearch placeholder='请选择自定义仓库' {...validOtherImage} style={{display: this.state.showOtherImage ? 'inline-block' : 'none'}} dropdownMatchSelectWidth={false}>
                        {this.getOtherImage()}
                      </Select>
                    </FormItem>
                    <FormItem style={{ width: '220px'}}>
                      <Select showSearch placeholder='请选择仓库组' {...harborProjectProps} size='large' style={{display: !this.state.showOtherImage ? 'inline-block' : 'none'}} dropdownMatchSelectWidth={false}>
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
                    {/*
                      this.state.ImageStoreType ? [
                        <QueueAnim key='otherImageStoreTypeAnimate'>
                          <div key='otherImageStoreType'>
                            <FormItem style={{ width: '220px', float: 'left' }}>
                              <Input {...otherImageStoreTypeProps} type='text' size='large' />
                            </FormItem>
                          </div>
                        </QueueAnim>
                      ] : null
                    */}
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
                      <RadioGroup {...getFieldProps('imageTag', { initialValue: '2', onChange: this.changeImageTagType }) }>
                        <Radio key='branch' value={'1'} disabled={this.state.disabledBranchTag || !this.state.currentCodeStore}><FormattedMessage {...menusText.ImageTagByBranch} /></Radio>
                        <Radio key='time' value={'2'}><FormattedMessage {...menusText.ImageTagByTime} /></Radio>
                        <Radio key='other' value={'3'}><FormattedMessage {...menusText.ImageTagByOther} /></Radio>
                      </RadioGroup>
                     <div className="customizeBaseImage">
                      选择构建生成的Docker镜像的tag命名规范，支持以上三种命名规则
                     </div>
                    <div style={{ clear: 'both' }} />
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
                      <Switch {...getFieldProps('buildCache', { initialValue: true }) } defaultChecked={true} />
                    </FormItem>
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
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
              </QueueAnim>
            ] : null
          }
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
              <Button size='large' type='primary' onClick={this.closeDockerFileModal}>
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
                submit && this.closeDockerFileModal()
              })
            }
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
              <Button size='large' onClick={() => this.setState({ shellModalShow: false })}>
                <span>取消</span>
              </Button>
            </div>
          </Modal>
          <Modal className='tenxFlowImageEnvModal'
            title={<FormattedMessage {...menusText.envTitle} />}
            visible={this.state.ImageEnvModal}
            // onOk={this.closeImageEnvModal}
            onCancel={this.closeImageEnv}
            footer={null}
            >
              <CreateImageEnvComponent
                validateCallback ={result => this.setState({ validateStatus: result })}
                scope={scopeThis}  imageName={this.props.form.getFieldValue('imageName')}  visible={this.state.ImageEnvModal}/>
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
        <Modal className='tenxFlowCodeStoreModal' title={ <FormattedMessage {...menusText.codeStore} />}
          visible={this.state.codeStoreModalShow}
          onOk={() => this.okCodeStoreModal()}
          onCancel={this.closeCodeStoreModal}
          >
          <CodeStoreListModal scope={scopeThis} config={codeList} hadSelected={this.state.currentCodeStore} isBuildImage={this.props.isBuildImage} okCallback={() => this.okCodeStoreModal()}/>
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

CreateTenxFlowModal = createForm()(CreateTenxFlowModal);

CreateTenxFlowModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  createTenxFlowState,
  createDockerfile,
  getTenxFlowDetail,
  loadClusterList,
  getAllClusterNodes,
  loadProjectList,
  createScripts,
})(injectIntl(CreateTenxFlowModal, {
  withRef: true,
}));

