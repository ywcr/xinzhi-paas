/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * NormalDeployBox component
 *
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Select, Input, InputNumber, Modal, Tooltip, Checkbox, Button, Card, Menu, Switch, Icon, Spin, Radio } from 'antd'
import { connect } from 'react-redux'
import filter from 'lodash/filter'
import {
  DEFAULT_REGISTRY,
  ASYNC_VALIDATOR_TIMEOUT,
  RESOURCES_MEMORY_MAX,
  RESOURCES_MEMORY_MIN,
  RESOURCES_MEMORY_STEP,
  RESOURCES_CPU_MAX,
  RESOURCES_CPU_STEP,
  RESOURCES_CPU_MIN,
  RESOURCES_DIY,
  SYSTEM_DEFAULT_SCHEDULE,
} from '../../../../constants'
import { appNameCheck, validateK8sResourceForServiceName } from '../../../../common/naming_validation'
import { loadImageDetailTag, loadImageDetailTagConfig, getOtherImageTag, loadOtherDetailTagConfig } from '../../../../actions/app_center'
import { checkServiceName } from '../../../../actions/app_manage'
import { loadFreeVolume, createStorage } from '../../../../actions/storage'
import { getNodes } from '../../../../actions/cluster_node'
import "./style/NormalDeployBox.less"
import NotificationHandler from '../../../../common/notification_handler'
import { volNameCheck } from '../../../../common/naming_validation'
import { ENTERPRISE_MODE } from '../../../../../configs/constants'
import { mode } from '../../../../../configs/model'

const enterpriseFlag = ENTERPRISE_MODE == mode
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const FormItem = Form.Item;
const RadioGroup = Radio.Group
let defaultCheckedValue = ''
let shouldUpdate = true
let uuid = 1;
let MyComponent = React.createClass({
  getInitialState() {
    return {
      name: '',
      size: 512,
      format: 'ext4',
    }
  },
  componentWillMount() {
    this.props.loadFreeVolume(this.props.cluster)
  },
  componentWillReceiveProps(nextProps) {
    const { form } = nextProps
    const { resetFields, setFieldsValue } = form
    if (!nextProps.serviceOpen) {
      resetFields(['volumeKey', 'volumePath', 'volumeMounts', 'volumeChecked', 'volumeChecked', 'volumeName', 'inputVolumeName'])
    }
  },
  shouldComponentUpdate(nextProps) {
    if (shouldUpdate) {
      return true
    }
    shouldUpdate = true
    return false
  },
  handleOpen(){
    const thisUrl = window.location.hostname
    window.open('https://'+thisUrl+':9004/faq#you-zhuang-tai-fu-wu-yu-wu-zhuang-tai-fu-wu-de-qu-bie')
  },
  getFormValue() {
    const { form } = this.props
    const { getFieldValue, setFieldsValue, getFieldProps } = form
    const volumes = getFieldValue('volumes')
    const volumeMounts = getFieldValue('volumeMounts')
    if (!volumes || volumes.length <= 0) return
    let volumeKey = []
    let index = 0
    volumes.forEach((volume) => {
      if (volume.configMap) return
      const mount = filter(volumeMounts, ['name', volume.name])
      getFieldProps(`volumePath${index + 1}`, { initialValue: mount[0].mountPath })
      if (volume.rbd) {
        getFieldProps(`volumeName${index + 1}`, { initialValue: `${volume.rbd.image}/${volume.rbd.fsType}` })
      } else {
        getFieldProps(`inputVolumeName${index + 1}`, { initialValue: volume.hostPath.path })
      }
      getFieldProps(`volumeChecked${index + 1}`, { initialValue: mount[0].readOnly })
      index++
      volumeKey.push(index)
    })
    if (volumes[0].rbd) {
      this.props.changeStorageType('rbd')
    } else {
      this.props.changeStorageType('hostPath')
    }
    shouldUpdate = false
    setFieldsValue({
      volumeKey
    })
  },
  remove(k) {
    const { form } = this.props
    let volumeKey = form.getFieldValue('volumeKey')
    volumeKey = volumeKey.filter((key) => {
      return key !== k;
    });
    if (volumeKey.length <= 0) {
      const registry = this.props.registry
      const { imageVersion } = this.props
      const mountPath = this.props.tagConfig[registry].configList[imageVersion].mountPath
      if (!mountPath) return
      volumeKey = mountPath.map((i, index) => { return index + 1 })
      form.setFieldsValue({
        volumeSwitch: false,
        volumeKey
      })
      return
    }
    form.getFieldValue('volumeKey').map((item) => {
      const value = form.getFieldProps(`volumePath${item}`).value
      form.setFieldsValue({
        [`volumePath${item}`]: value
      })
    })
    form.setFieldsValue({
      volumeKey,
    });
  },
  add() {
    const { form } = this.props
    let volumeKey = form.getFieldValue('volumeKey')
    uuid = volumeKey.length
    uuid++
    volumeKey = volumeKey.concat(uuid);
    form.setFieldsValue({
      volumeKey,
    });
  },
  volumeList() {
    const registry = this.props.registry
    const volume = this.props.avaliableVolume
    const ele = []
    const usedVolume = []
    const { getFieldProps, getFieldValue, } = this.props.form
    getFieldValue('volumeKey').forEach((k) => {
      const name = getFieldProps(`volumeName${k}`).value
      if (!name) return
      usedVolume.push(name.split('/')[0])
    })
    const servicesList = this.props.parentScope.props.scope.state.servicesList || sessionStorage.getItem('servicesList')
    servicesList.forEach(service => {
      if (service.inf.Deployment.spec.template.spec.volumes) {
        service.inf.Deployment.spec.template.spec.volumes.forEach(volume => {
          if (!volume.rbd) return
          usedVolume.push(volume.rbd.image)
        })
      }
    })
    if (volume.data.volumes) {
      volume.data.volumes.forEach(item => {
        if (usedVolume.indexOf(item.name) >= 0) return
        ele.push(<Option value={`${item.name}/${item.fsType}`}>{item.name} {item.fsType} {item.size}</Option>)
      })
    }
    return ele
  },
  getVolumeName(e) {
    this.setState({
      name: e.target.value
    })
  },
  getVolumeSize(value) {
    this.setState({
      size: value
    })
  },
  getVolumeFormat(format) {
    this.setState({
      format: format
    })
  },
  refresh() {
    this.props.loadFreeVolume(this.props.cluster)
  },
  createVolume() {
    const self = this
    const { cluster } = this.props
    let notification = new NotificationHandler()
    if (!this.state.name) {
      notification.error('请填写存储名称')
      return
    }
    const message = volNameCheck(this.state.name)
    if (message !== 'success') {
      notification.error(message)
      return
    }
    notification.spin('存储卷创建中...')
    let storageConfig = {
      driver: 'rbd',
      name: this.state.name,
      driverConfig: {
        size: this.state.size,
        fsType: this.state.format,
      },
      cluster
    }
    this.props.createStorage(storageConfig, {
      success: {
        func: () => {
          notification.close()
          notification.success('存储卷创建成功')
          self.setState({
            name: '',
            size: 0,
            format: ''
          })
          self.props.loadFreeVolume(cluster)
        },
        isAsync: true
      },
      failed: {
        func: (result) => {
          notification.close()
          if (result.statusCode == 409) {
            notification.error('存储名称已被占用')
            return
          }
          notification.error('存储卷创建失败')
        }
      }
    })
  },
  dirExists(index, rule, value, callback) {
    if (!value) {
      callback([new Error('抱歉，必须填写路径.')])
      return
    }
    if (!/^[a-zA-Z0-9\/].?/.test(value)) {
      return callback('请填写正确的路径')
    }
    const { getFieldProps, getFieldValue, } = this.props.form
    const dir = []
    getFieldValue('volumeKey').forEach((k) => {
      dir.push(getFieldProps(`volumePath${k}`).value)
    })
    let isExist = 0
    dir.forEach(item => {
      if (item === value) {
        ++isExist
      }
    })
    if (isExist > 1) {
      callback([new Error('已填写过该路径.')])
      return
    }
    callback()
  },
  checkHostPath(rule, value, callback) {
    if (this.props.storageType !== 'hostPath') {
      return callback()
    }
    if (!value || !value.trim()) {
      callback([new Error('请输入本地目录')])
      return
    }
    return callback()
  },
  render: function () {
    const { getFieldProps, getFieldValue } = this.props.form
    const registry = this.props.registry
    const { imageVersion } = this.props
    const self = this
    if (!this.props.tagConfig[registry]) return <div></div>
    if (!this.props.tagConfig[registry].configList) return <div></div>
    let mountPath = this.props.tagConfig[registry].configList[imageVersion].mountPath
    if (!mountPath) mountPath = []
    if (!this.props.avaliableVolume.data && !getFieldValue('volumeName1')) {
      return <div></div>
    }
    let { isFetching } = this.props.avaliableVolume
    if (isFetching) {
      return <div className='loadingBox'>
        <Spin size='large' />
      </div>
    }
    isFetching = this.props.createState.isFetching
    if (isFetching) {
      return <div className='loadingBox'>
        <Spin size='large' />
      </div>
    }
    const volume = this.props.avaliableVolume.data.volumes
    let formItems = ''
    if (volume.length <= 0 && this.props.storageType == 'rbd') {
      getFieldProps('volumeKey', {
        initialValue: [1],
      });
      return (
        <div>
          <ul>
            <li className="volumeDetail">
              <div className="input">
                <Input className="volumeInt" type="text" placeholder="存储卷名称" onChange={(e) => { this.getVolumeName(e) }} />
              </div>
              <div className="input">
                <InputNumber className="volumeInt" type="text" placeholder="存储卷大小" defaultValue="512" min={512} max={20480} step={512} onChange={(value) => this.getVolumeSize(value)} />
                <Select className='imageTag' placeholder="请选择格式" defaultValue="ext4" onChange={(value) => {
                  this.getVolumeFormat(value)
                }}>
                  <Option value='ext4'>ext4</Option>
                  <Option value='xfs'>xfs</Option>
                </Select>
                <Button onClick={() => this.createVolume()}>创建存储卷</Button>
              </div>
              <div style={{ clear: "both" }}></div>
            </li>
          </ul>
        </div>
      )
    } else {
      if (!getFieldProps('volumeKey').value) {
        getFieldProps('volumeKey', {
          initialValue: mountPath.map((i, index) => { return index + 1 }),
        });
      }
      this.getFormValue()
      formItems = getFieldValue('volumeKey').map((k) => {
        return (
          <FormItem key={`volume${k}`}>
            {
              (mountPath && mountPath[k - 1]) ?
                <span type='text' className="url" style={{ verticalAlign: 'top' }}>
                  <Input className="hide" value={(function () {
                    if (!getFieldProps(`volumePath${k}`).value) {
                      getFieldProps(`volumePath${k}`, { initialValue: mountPath[k - 1] })
                    }
                    return mountPath
                  })()} />
                  {mountPath[k - 1]}
                </span> :
                <Input {...getFieldProps(`volumePath${k}`, {
                  rules: [{ validator: self.dirExists.bind(self, k) }]
                }) } className="urlInt" placeholder="输入容器目录" />
            }
            <Select style={{ width: '200px', display: self.props.storageType == 'rbd' ? 'inline-block' : 'none' }} className="imageTag" size="large" placeholder="请选择一个存储卷"
              {...getFieldProps(`volumeName${k}`) } >
              {this.volumeList()}
            </Select>
            <FormItem style={{ display: 'inline-block', marginLeft: '10px' }}>
              <Input placeholder="请填入本地目录" style={{ width: '200px', display: self.props.storageType == 'rbd' ? 'none' : 'inline-block' }} {...getFieldProps(`inputVolumeName${k}`, {
                rules: [{
                  validator: self.checkHostPath
                }],
              }) } />
            </FormItem>
            {self.props.storageType == 'rbd' ? <span><Checkbox className="readOnlyBtn" { ...getFieldProps(`volumeChecked${k}`, {
            }) } checked={getFieldValue(`volumeChecked${k}`)}>
              只读
          </Checkbox>
              <i className="fa fa-refresh" onClick={() => this.refresh()} />
              <i className="fa fa-trash" onClick={() => this.remove(k)} /> </span> : ''}

          </FormItem>
        )
      });
    }
    return (
      <div className="serviceOpen" key="had">
        <ul>
          <li>{formItems}</li>
          <li> <div>
            <span className="volumeAddBtn" onClick={this.add}>
              <Icon type="plus-circle-o" />
              <span>添加一个容器目录</span>
            </span>
          </div></li>
        </ul>
      </div>
    )
  }
})

function mapStateToMyComponentProp(state, props) {
  if (props.other) {
    return {
      avaliableVolume: state.storage.avaliableVolume,
      tagConfig: state.getImageTagConfig.otherTagConfig,
      createState: state.storage.createStorage
    }
  }
  return {
    avaliableVolume: state.storage.avaliableVolume,
    tagConfig: state.getImageTagConfig.imageTagConfig,
    createState: state.storage.createStorage
  }
}

MyComponent = connect(mapStateToMyComponentProp, {
  loadFreeVolume,
  createStorage
})(MyComponent)

function loadImageTags(props) {
  const self = this
  const { registry, currentSelectedImage, loadImageDetailTag, getOtherImageTag, other } = props
  const local = location.search.split('&other=')[1] || ''
  if (local !== '') {
    getOtherImageTag({ id: other, imageName: currentSelectedImage }, {
      success: {
        func: (result) => {
          const LATEST = 'latest'
          let tag = result.tags[0]
          if (result.tags.indexOf(LATEST) > -1) {
            tag = LATEST
          }
          const config = {
            imageId: other,
            fullname: currentSelectedImage,
            imageTag: tag
          }
          loadImageTagConfigs(config, props)
          const { setFieldsValue } = props.form
          setFieldsValue({
            imageVersion: tag
          })
        },
        isAsync: true
      }
    })
    return
  }
  loadImageDetailTag(registry, currentSelectedImage, {
    success: {
      func: (result) => {
        const LATEST = 'latest'
        let tag = result.data[0]
        if (result.data.indexOf(LATEST) > -1) {
          tag = LATEST
        }
        loadImageTagConfigs(tag, props)
        const { setFieldsValue } = props.form
        /*setFieldsValue({
          imageVersion: tag
        })*/
      },
      isAsync: true
    }
  })
}

function loadClusterNodes(props) {
  const { cluster, getNodes } = props
  getNodes(cluster, {
    failed: {
      func: {
        //
      },
      isAsync: true
    }
  })
}

function setPorts(containerPorts, form) {
  const portsArr = []
  if (containerPorts) {
    containerPorts.map(function (item, index) {
      portsArr.push((index + 1));
      form.setFieldsValue({
        portKey: portsArr,
        ['targetPortUrl' + (index + 1)]: item.split('/')[0],
        ['portType' + (index + 1)]: item.split('/')[1].toUpperCase(),
      })
    })
  }
}

function setCMD(container, form) {
  const key = []
  const key1 = []
  let cmds = container.cmd
  let entrypoint = container.entrypoint
  if (!entrypoint) entrypoint = []
  if (!cmds) cmds = []
  let index = 1
  entrypoint.forEach((item, i) => {
    if (i == 0) return
    key.push(index)
    key1.push(index)
    form.setFieldsValue({
      cmdKey: key,
      userCMDKey: key1,
      [`cmd${index}`]: item,
      [`userCMD${index}`]: item
    })
    index++
  })
  cmds.forEach((cmd, i) => {
    key.push(index)
    key1.push(index)
    form.setFieldsValue({
      cmdKey: key,
      userCMDKey: key1,
      [`cmd${index}`]: cmd,
      [`userCMD${index}`]: cmd
    })
    index++
  })

  form.setFieldsValue({
    entryInput: entrypoint[0]
  })
}


function setEnv(defaultEnv, form) {
  const envArr = []
  if (defaultEnv) {
    defaultEnv.map(function (item, index) {
      envArr.push((index + 1));
      form.setFieldsValue({
        envKey: envArr,
        ['envName' + (index + 1)]: item.split('=')[0],
        ['envValue' + (index + 1)]: item.split('=')[1],
      })
    })
  }
}
function loadImageTagConfigs(tag, props) {
  const { currentSelectedImage, loadImageDetailTagConfig, scope, isCreate, loadOtherDetailTagConfig, setArg } = props
  if (typeof tag === 'object') {
    loadOtherDetailTagConfig(tag, {
      success: {
        func: (result) => {
          setArg()
          if (!isCreate) {
            return
          }
          const { form } = props
          const { containerPorts, defaultEnv, cmd, entrypoint } = result.configInfo
          setPorts(containerPorts, form)
          setEnv(defaultEnv, form)
          setCMD({ cmd, entrypoint }, form)
        },
        isAsync: true
      }
    })
  } else {
    loadImageDetailTagConfig(DEFAULT_REGISTRY, currentSelectedImage, tag, {
      success: {
        func: (result) => {
          setArg()
          if (!isCreate) {
            return
          }
          const { form } = props
          const { containerPorts, defaultEnv, cmd, entrypoint } = result.data
          setPorts(containerPorts, form)
          setEnv(defaultEnv, form)
          setCMD({ cmd, entrypoint }, form)
        },
        isAsync: true
      }
    })
  }
}

let NormalDeployBox = React.createClass({
  propTypes: {
    currentSelectedImage: PropTypes.string.isRequired,
    imageTags: PropTypes.array.isRequired,
    imageTagsIsFetching: PropTypes.bool.isRequired,
    loadImageDetailTag: PropTypes.func.isRequired,
    loadImageDetailTagConfig: PropTypes.func.isRequired,
    loadPublicImageList: PropTypes.func
  },
  selectComposeType(type) {
    const parentScope = this.props.scope
    if (type == parentScope.state.composeType) return
    parentScope.setState({
      composeType: type,
    })
  },
  onSelectTagChange(tag) {
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      imageVersion: tag
    });
    this.setState({
      currentImageVersion: tag
    })
    if (this.props.other) {
      const config = {
        imageId: this.props.other,
        fullname: this.props.currentSelectedImage,
        imageTag: tag
      }
      loadImageTagConfigs(config, this.props)
    } else {
      loadImageTagConfigs(tag, this.props)
    }
  },
  serviceNameExists(rule, value, callback) {
    const { checkServiceName, isCreate, cluster } = this.props
    const { servicesList } = this.props.scope.props.scope.state
    let i = 0
    let checkMsg = 'success'
    if (!validateK8sResourceForServiceName(value)) {
      checkMsg = '可由3~40位小写字母、数字、中划线组成，以小写字母开头，小写字母或者数字结尾'
    }
    if (checkMsg == 'success') {
      let existFlag = false;
      //check local name exist
      if (!isCreate) {
        const oldServiceName = this.props.form.getFieldProps('name').value
        servicesList.map((service) => {
          if ((value !== oldServiceName) && (service.id === value)) {
            existFlag = true;
            return
          }
        })
      } else {
        servicesList.map((service) => {
          if (service.id === value) {
            existFlag = true;
            return
          }
        })
      }
      if (existFlag) {
        checkMsg = appNameCheck(value, '服务名称', true);
        callback([new Error(checkMsg)])
        return;
      }
      //check all name exist
      clearTimeout(this.serviceNameExistsTimeout)
      this.serviceNameExistsTimeout = setTimeout(() => {
        checkServiceName(cluster, value, {
          success: {
            func: (result) => {
              if (result.data) {
                existFlag = true;
                checkMsg = appNameCheck(value, '服务名称', true);
                callback([new Error(checkMsg)])
                return;
              } else {
                callback();
              }
            },
            isAsync: true
          }
        });
      }, ASYNC_VALIDATOR_TIMEOUT)
    } else {
      callback([new Error(checkMsg)]);
    }
  },
  componentWillMount() {
    loadImageTags(this.props)
    const cluster = this.props.currentCluster
    const storageTypes = cluster.storageTypes
    let canCreate = true
    if (!storageTypes || storageTypes.length <= 0) {
      canCreate = false
    }
    if (cluster.listNodes === 2) {
      loadClusterNodes(this.props)
    }
    this.setState({
      canCreate,
      storageTypes
    })
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    let storageType = getFieldValue('storageType')
    if (storageType) {
      setFieldsValue({
        storageType
      })
      this.setState({
        storageType,
        isHaveVolume: getFieldValue('isHaveVolume')
      })
    } else {
      setFieldsValue({
        storageType: storageTypes[0]
      })
    }
    // For 1st time mount
    setTimeout(() => {
      this.serviceNameInput.refs.input.focus()
    })
  },
  componentWillReceiveProps(nextProps) {
    const { serviceOpen } = nextProps
    if (serviceOpen == this.props.serviceOpen) {
      return
    }
    setTimeout(() => {
      this.serviceNameInput.refs.input.focus()
    })
    if (serviceOpen) {
      loadImageTags(nextProps)
      const { form } = this.props
      const { getFieldValue } = form
      let storageType = getFieldValue('storageType')
      const cluster = this.props.currentCluster
      const storageTypes = cluster.storageTypes
      if (!storageType) {
        storageType = storageTypes[0]
      }
      this.setState({
        storageType: storageType
      })
      form.setFieldsValue({
        storageType: storageType
      })
      if (cluster.listNodes === 2) {
        loadClusterNodes(this.props)
      }
      const volumeSwitch = getFieldValue('volumeSwitch')
      if (!volumeSwitch) {

        let canCreate = true
        if (!storageTypes || storageTypes.length <= 0) {
          canCreate = false
        }
        this.setState({
          canCreate,
          storageTypes,
          isHaveVolume: 0
        })
      }
    }
  },
  changeSwitchOption(e) {
    // For stateful service, force instance to 1
    if (e) {
      const { setFieldsValue } = this.props.form
      setFieldsValue({
        instanceNum: '1'
      });
    }
    this.setState({
      isHaveVolume: e
    })
  },
  getStorageType() {
    const result = []
    const storageTypes = this.state.storageTypes
    if (!storageTypes) {
      return result
    }

    const self = this
    self.state.storageTypes.forEach((type, index) => {
      if (index == 0) {
        defaultCheckedValue = type
      }
      result.push(
        <Radio value={type} key={type}>{self.translationName(type)}</Radio>
      )
    })
    return result
  },
  translationName(type) {
    switch (type) {
      case 'rbd':
        return '分布式存储'
      case 'hostPath':
        return '本地存储'
    }
  },
  changeStorageTypeCallback() {
    const self = this
    return function (type) {
      self.setState({
        storageType: type
      })
    }
  },
  setStorageType(e) {
    const form = this.props.form
    const { setFieldsValue } = form
    this.setState({
      storageType: e.target.value
    })
    setFieldsValue({
      storageType: e.target.value
    })
  },
  render: function () {
    const parentScope = this.props.scope
    const { imageTagsIsFetching, form, composeType, cluster, clusterNodes } = this.props
    const { DIYMemory, DIYCPU } = parentScope.state
    const imageTags = this.props.otherImages ? this.props.otherImages : this.props.imageTags
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.serviceNameExists },
      ],
    });
    const { registryServer, currentSelectedImage, tagConfig, registry, currentCluster } = this.props
    const imageUrlProps = registryServer + '/' + currentSelectedImage
    const selectProps = getFieldProps('imageVersion', {
      rules: [
        { required: true, message: '请选择镜像版本' },
      ],
      initialValue: imageTags[0]
    })
    const bindNodeProps = getFieldProps('bindNode', {
      rules: [
        { required: true },
      ],
      initialValue: SYSTEM_DEFAULT_SCHEDULE,
    })
    let imageVersion = getFieldValue('imageVersion');
    let switchDisable = false
    let mountPath = []
    if (!tagConfig || !tagConfig[registry] || !tagConfig[registry].configList || !tagConfig[registry].configList[imageVersion] ||
      !tagConfig[registry].configList[imageVersion].mountPath || tagConfig[registry].configList[imageVersion].mountPath.length <= 0) {
      switchDisable = true
    }
    let imageVersionShow = (
      <FormItem className="imageTagForm" key='imageTagForm'>
        <Select showSearch
          {...selectProps}
          className="imageTag"
          size="large"
          optionFilterProp="children"
          placeholder="请选择镜像版本"
          notFoundContent="镜像版本为空"
          onSelect={this.onSelectTagChange}
        >
          {
            imageTags && imageTags.map((tag) => {
              return (
                <Option key={tag} value={tag}>{tag}</Option>
              )
            })
          }
        </Select>
      </FormItem>
    )
    return (
      <div id="NormalDeployBox">
        <div className="topBox">
          <div className="inputBox">
            <span className="commonSpan">服务名称</span>
            <FormItem className="serviceNameForm"
              hasFeedback
              help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}>
              <Input {...nameProps} size="large" placeholder="请输入服务名称" autoComplete="off" ref={(ref) => { this.serviceNameInput = ref; }} />
            </FormItem>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="inputBox">
            <span className="commonSpan">镜像地址</span>
            <FormItem className="imageUrlForm" hasFeedback>
              <Input className="imageInput" size="large" value={imageUrlProps} />
              <div style={{ clear: "both" }}></div>
            </FormItem>
            <Button className="checkBtn" size="large" type="primary" onClick={this.checkImageUrl} disabled>检查地址</Button>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="inputBox">
            <span className="commonSpan">镜像版本</span>
            {imageVersionShow}
            <div style={{ clear: "both" }}></div>
          </div>
        </div>
        <div className="infoBox">
          <div className="commonTitle">
            <div className="line"></div>
            <span className="titleSpan">基本配置</span>
            <span className="titleIntro">服务的计算资源、服务类型、以及实例个数等设置</span>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="operaBox">
            <div className="selectCompose">
              <span className="commonSpan">容器配置
                {!enterpriseFlag ?
                  <Tooltip title="专业版及企业认证用户可申请扩大容器配置"><a> <Icon type="question-circle-o" /></a></Tooltip>
                  : null
                }
              </span>
              <ul className="composeList">
                {/*<li className="composeDetail">
                  <Button type={composeType == "1" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "1")}>
                    <div className="topBox">
                      1X
                   </div>
                    <div className="bottomBox">
                      <span>256M&nbsp;内存</span><br />
                      <span>1CPU&nbsp;(共享)</span>
                    </div>
                  </Button>
                </li>*/}
                <li className="composeDetail">
                  <Button type={composeType == "2" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "2")}>
                    <div className="topBox">
                      2X
                   </div>
                    <div className="bottomBox">
                      <span>512M&nbsp;内存</span><br />
                      <span>1CPU&nbsp;(共享)</span>
                      <div className="triangle"></div>
                      <Icon type="check" />
                    </div>
                  </Button>
                </li>
                <li className="composeDetail">
                  <Button type={composeType == "4" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "4")}>
                    <div className="topBox">
                      4X
                   </div>
                    <div className="bottomBox">
                      <span>1GB&nbsp;内存</span><br />
                      <span>1CPU&nbsp;</span>
                      <div className="triangle"></div>
                      <Icon type="check" />
                    </div>
                  </Button>
                </li>
                <li className="composeDetail">
                  <Button type={composeType == "8" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "8")}>
                    <div className="topBox">
                      8X
                   </div>
                    <div className="bottomBox">
                      <span>2GB&nbsp;内存</span><br />
                      <span>1CPU&nbsp;</span>
                      <div className="triangle"></div>
                      <Icon type="check" />
                    </div>
                  </Button>
                </li>
                <li className="composeDetail">
                  <Button type={composeType == "16" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "16")}>
                    <div className="topBox">
                      16X
                   </div>
                    <div className="bottomBox">
                      <span>4GB&nbsp;内存</span><br />
                      <span>1CPU</span>
                      <div className="triangle"></div>
                      <Icon type="check" />
                    </div>
                  </Button>
                </li>
                <li className="composeDetail">
                  <Button type={composeType == "32" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "32")}>
                    <div className="topBox">
                      32X
                   </div>
                    <div className="bottomBox">
                      <span>8GB&nbsp;内存</span><br />
                      <span>2CPU</span>
                      <div className="triangle"></div>
                      <Icon type="check" />
                    </div>
                  </Button>
                </li>
                {/* enterprise */}
                {
                  enterpriseFlag &&
                  <li className="composeDetail DIY">
                    <div className={composeType == RESOURCES_DIY ? "btn ant-btn-primary" : "btn ant-btn-ghost"} onClick={this.selectComposeType.bind(this, RESOURCES_DIY)}>
                      <div className="topBox">
                        自定义
                      </div>
                      <div className="bottomBox">
                        <div className="DIYKey">
                          <InputNumber
                            onChange={(value) => parentScope.setState({ DIYMemory: value })}
                            defaultValue={RESOURCES_MEMORY_MIN}
                            value={parseInt(DIYMemory)}
                            step={RESOURCES_MEMORY_STEP}
                            min={RESOURCES_MEMORY_MIN}
                            max={RESOURCES_MEMORY_MAX} />
                          MB&nbsp;内存
                        </div>
                        <div className="DIYKey">
                          <InputNumber
                            onChange={(value) => parentScope.setState({ DIYCPU: value })}
                            defaultValue={DIYCPU}
                            value={DIYCPU}
                            step={RESOURCES_CPU_STEP}
                            min={RESOURCES_CPU_MIN}
                            max={RESOURCES_CPU_MAX} />
                          核 CPU
                        </div>
                        <div className="triangle"></div>
                        <Icon type="check" />
                      </div>
                    </div>
                  </li>
                }
              </ul>
              <div style={{ clear: "both" }}></div>
            </div>
            {
              currentCluster.listNodes === 2 && (
                <div className="bindNode">
                  <span className="commonSpan">绑定节点</span>
                  <FormItem>
                    <Select showSearch
                      {...bindNodeProps}
                      style={{ width: 300 }}
                      placeholder="请选择绑定节点"
                      optionFilterProp="children"
                      notFoundContent="无法找到"
                    >
                      <Option value={SYSTEM_DEFAULT_SCHEDULE}>使用系统默认调度</Option>
                      {
                        clusterNodes.map(node => {
                          const { name, ip, podCount, schedulable } = node
                          return (
                            <Option value={name} disabled={!schedulable}>
                              {name} | {ip} (容器：{podCount}个)
                            </Option>
                          )
                        })
                      }
                    </Select>
                  </FormItem>
                  <div style={{ clear: "both" }}></div>
                </div>
              )
            }
            <div className="stateService">
              <span className="commonSpan">挂载存储<a onClick={this.handleOpen} target="_blank"><Tooltip title="若需数据持久化，请挂载存储"><Icon type="question-circle-o" /></Tooltip></a></span>
              <Switch disabled={!this.state.canCreate} className="changeBtn"
                {...getFieldProps('volumeSwitch', {
                  valuePropName: 'checked',
                  onChange: (e) => this.changeSwitchOption(e)
                }) }
              />
              <Tooltip title="无存储服务可用, 请配置存储服务"><Icon type="question-circle-o" style={{ verticalAlign: 'middle', marginLeft: '10px', display: this.state.canCreate ? 'none' : 'inline-block' }} /></Tooltip>
              <span className="stateSpan"></span>{/*{form.getFieldValue('volumeSwitch') ? "有状态服务" : "无状态服务"}*/}
              <RadioGroup style={{ display: this.state.isHaveVolume ? 'inline-block' : 'none', marginLeft: '10px' }} onChange={this.setStorageType} value={this.state.storageType || defaultCheckedValue}>
                {this.getStorageType()}
              </RadioGroup>
              {
                form.getFieldValue('volumeSwitch') &&
                <span id="localStorageTip">
                  Tips：选择『本地存储』时，为保证有状态有效，推荐使用『绑定节点』功能&nbsp;
                  <Tooltip title="以保证容器及其Volume存储不被系统调度迁移"
                    placement="topLeft"
                    getTooltipContainer={() => document.getElementById('localStorageTip')}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }
              {form.getFieldValue('volumeSwitch') ? [
                <MyComponent
                  parentScope={parentScope}
                  form={form}
                  cluster={cluster}
                  imageVersion={imageVersion}
                  registry={this.props.registry}
                  other={this.props.other}
                  storageTypes={this.state.storageTypes}
                  storageType={this.state.storageType || defaultCheckedValue}
                  changeStorageType={this.changeStorageTypeCallback}
                  serviceOpen={this.props.serviceOpen} />
              ] : null}
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="containerNum">
              <span className="commonSpan">实例数量</span>
              <FormItem>
                <InputNumber className="inputNum"
                  {...getFieldProps('instanceNum', {
                    initialValue: '1'
                  }) } disabled={form.getFieldValue('volumeSwitch')}
                  size="large" min={1} max={10} />
                &nbsp;&nbsp;个
              </FormItem>
              <div style={{ clear: "both" }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const defaultImageTags = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    tag: []
  }
  const { currentSelectedImage } = props
  const { imageTag, otherImageTag } = state.getImageTag
  let targetImageTag
  if (imageTag[DEFAULT_REGISTRY]) {
    targetImageTag = imageTag[DEFAULT_REGISTRY][currentSelectedImage]
  }
  let { registry, tag, isFetching } = targetImageTag || defaultImageTags
  const { cluster } = state.entities.current
  const otherImages = otherImageTag.imageTag
  const { clusterNodes } = state.cluster_nodes
  return {
    cluster: cluster.clusterID,
    registry,
    imageTags: tag || [],
    imageTagsIsFetching: isFetching,
    currentSelectedImage,
    checkServiceName: state.apps.checkServiceName,
    tagConfig: state.getImageTagConfig.imageTagConfig,
    otherImages,
    currentCluster: cluster,
    clusterNodes: clusterNodes[cluster.clusterID] || []
  }
}

NormalDeployBox = connect(mapStateToProps, {
  loadImageDetailTag,
  loadImageDetailTagConfig,
  checkServiceName,
  getOtherImageTag,
  loadOtherDetailTagConfig,
  getNodes,
})(NormalDeployBox)

export default NormalDeployBox
