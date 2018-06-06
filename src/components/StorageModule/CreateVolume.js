/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ServiceList component
 *
 * v0.1 - 2017-06-05
 * @author ZhangChengZheng
 */
import React, { Component, PropTypes } from 'react'
import yaml from "js-yaml"
import { Modal, Row, Col, InputNumber, Input, Slider, Button, Form, Select, Icon, Switch, Radio } from 'antd'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/CreateVolume.less'
import { calcuDate, parseAmount, formatDate } from '../../common/tools'
import { SnapshotClone, createStorage, loadStorageList } from '../../actions/storage'
import { DEFAULT_IMAGE_POOL } from '../../constants'
import NotificationHandler from '../../common/notification_handler'
import { YamlDump } from "../../components/Editor"
import { type } from 'os';
// /Users/zhanghongyi/Documents/user-portal-dev/src/components/Editor/Yaml.js
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const messages = defineMessages({
  name: {
    id: "Storage.modal.name",
    defaultMessage: '名称'
  },
  snapshot: {
    id: "Storage.modal.snapshot",
    defaultMessage: '快照'
  },
  cancelBtn: {
    id: "Storage.modal.cancelBtn",
    defaultMessage: '取消'
  },
  formats: {
    id: 'Storage.titleRow.formats',
    defaultMessage: '格式',
  },
  size: {
    id: 'Storage.titleRow.size',
    defaultMessage: '大小',
  },
  placeholder: {
    id: 'Storage.modal.placeholder',
    defaultMessage: '输入名称',
  },
})

class CreateVolume extends Component {
  constructor(props) {
    super(props)
    this.checkVolumeName = this.checkVolumeName.bind(this)
    this.checkVolumeNameaaa = this.checkVolumeNameaaa.bind(this)
    this.changeVolumeSizeSlider = this.changeVolumeSizeSlider.bind(this)
    this.changeVolumeSizeSlideraccessTypePropaa = this.changeVolumeSizeSlideraccessTypePropaa.bind(this)
    this.changeVolumeSizeInputNumber = this.changeVolumeSizeInputNumber.bind(this)
    this.handleFormatSelectOption = this.handleFormatSelectOption.bind(this)
    this.handleComfirmCreateVolume = this.handleComfirmCreateVolume.bind(this)
    this.handleCancelCreateVolume = this.handleCancelCreateVolume.bind(this)
    this.handleResetState = this.handleResetState.bind(this)
    this.handleSelectSnapshot = this.handleSelectSnapshot.bind(this)
    this.SnapshotSwitch = this.SnapshotSwitch.bind(this)
    this.setStorageType = this.setStorageType.bind(this)
    this.setnfsType = this.setnfsType.bind(this)
    // this.onChangevalue = this.onChangevalue.bind(this)
    this.state = {
      volumeSizemin: this.props.volumeSize || 512,
      volumeSize: this.props.volumeSize || 512,
      volumeblock:10,
      // fstype: 'ext4',
      currentSnapshot: this.props.currentSnapshot,
      currentVolume: this.props.currentVolume,
      loading: false,
      ext4Disabled: false,
      xfsDisabled: false,
      swicthChecked: false,
      switchDisabled: false,
      selectChecked: false,
      accessModes: 'ReadWriteOnce',
      valuetype:'',
      storageType:'',
      nfsType:'nfs'
      // accessModesss:'qing',
    }
  }

  SnapshotSwitch() {
    this.setState({
      swicthChecked: !this.state.swicthChecked
    })
    if (this.state.swicthChecked) {
      this.setState({
        ext4Disabled: false,
        xfsDisabled: false,
      })
    }
  }
  //   onChangevalue(e){
  //     // this.state.accessModes 
  //     this.setState({
  //       accessModes: e.target.value,
  //     },function(){
  //     });
  //  }
  componentWillMount(){
    console.log(this.props.cluster.clusterName,'------this.props.cluster.clusterName')
    this.setState({
      valuetype:this.props.cluster.clusterName == 'huawei' ? 'huawei':'block',
      storageType:this.props.cluster.clusterName == 'huawei' ? 'ssd':'block',
    })
  }
  componentDidMount() {
    const { currentSnapshot } = this.props
    if (currentSnapshot) {
      this.setState({
        volumeSize: currentSnapshot.size,
        // fstype: currentSnapshot.fstype,
        volumeSizemin: currentSnapshot.size,
        // ext4Disabled: currentSnapshot.fstype == 'xfs',
        // xfsDisabled: currentSnapshot.fstype == 'ext4',
        swicthChecked: true,
        switchDisabled: true,
        selectChecked: true,
      })
      return
    }
    this.setState({
      ext4Disabled: false,
      xfsDisabled: false,
      swicthChecked: false,
      switchDisabled: false,
      selectChecked: false,
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentSnapshot !== nextProps.currentSnapshot) {
      this.setState({
        currentSnapshot: nextProps.currentSnapshot,
        currentVolume: nextProps.currentVolume,
        volumeSize: nextProps.currentSnapshot.size,
        // fstype: nextProps.currentSnapshot.fstype,
        volumeSizemin: nextProps.currentSnapshot.size,
        // ext4Disabled: nextProps.currentSnapshot.fstype == 'xfs',
        // xfsDisabled: nextProps.currentSnapshot.fstype == 'ext4',
        swicthChecked: true,
        switchDisabled: true,
        selectChecked: true,
      })
    }
  }

  handleSelectSnapshot(value) {
    const { snapshotDataList, form } = this.props
    for (let i = 0; i < snapshotDataList.length; i++) {
      if (snapshotDataList[i].name == value) {
        this.setState({
          volumeSizemin: snapshotDataList[i].size,
          volumeSize: snapshotDataList[i].size,
          fstype: snapshotDataList[i].fstype,
          ext4Disabled: snapshotDataList[i].fstype == 'xfs',
          xfsDisabled: snapshotDataList[i].fstype == 'ext4',
        })
        form.setFieldsValue({
          selectSnapshotName: value
        })
        return
      }
    }
  }

  handleResetState() {
    const { scope, form, currentSnapshot } = this.props
    form.resetFields()
    scope.setState({
      visible: false,
    })
    this.setState({
      loading: false,
      valuetype:'block',
      ext4Disabled: false,
      xfsDisabled: false,
      volumeSize: 512,
    })
    if (!currentSnapshot) {
      this.setState({
        swicthChecked: false,
        switchDisabled: false,
        selectChecked: false,
      })
    }
  }

  handleComfirmCreateVolume() {
    const { form, SnapshotClone, cluster, currentVolume, createStorage, currentImagePool, loadStorageList, snapshotDataList } = this.props
    const { volumeSize,volumeblock, swicthChecked } = this.state
    this.setState({
      loading: true,
    })
    const validataArray = [
      'volumeName',
    ]
    if (swicthChecked) {
      validataArray.push('selectSnapshotName')
    }
    form.validateFields(validataArray, (errors, values) => {
      if (!!errors) {
        this.setState({
          loading: false,
        })
        return
      }
      let notification = new NotificationHandler()
      notification.spin('创建存储卷中')
      let volumeSize = this.state.volumeSize+"Mi";
      let  volumeblock = this.state.volumeblock +'Gi'
      if (!values.selectSnapshotName) {
        let storageConfig = {
            clusterID: cluster.clusterID,        
            storage:this.state.valuetype == 'rbd'?volumeSize:volumeblock,
            name: values.volumeName,
            type: this.state.valuetype == 'huawei'?this.state.storageType:(this.state.valuetype == 'block'?this.state.nfsType:this.state.valuetype)
        }
        createStorage(storageConfig, {
          success: {
            func: () => {
              this.handleResetState()
              notification.close()
              notification.success('创建存储成功')
              loadStorageList(currentImagePool, cluster.clusterID)
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              this.handleResetState()
              notification.close()
              if (err.statusCode === 409) {
                notification.error('存储卷 ' + storageConfig.name + ' 已经存在')
                return
              }
              if (err.statusCode !== 402) {
                notification.error('创建存储卷失败', err.message.message || err.message)
              }
            }
          }
        })
        return
      }
      let volumeName = ''
      if (currentVolume) {
        volumeName = currentVolume.name
      } else {
        for (let i = 0; i < snapshotDataList.length; i++) {
          if (snapshotDataList[i].name == values.selectSnapshotName) {
            volumeName = snapshotDataList[i].volume
            break
          }
        }
      }
      const body = {
        clusterID: cluster.clusterID,
        
        volumeName,
        body: {
          "snapshotName": values.selectSnapshotName,
          "cloneName": values.volumeName,
          "size": volumeSize,
          "fstype": values.fstype,
          "accessModes": "ReadWriteOnce",
          "type": this.state.valuetype,
        }
      }
      SnapshotClone(body, {
        success: {
          func: () => {
            notification.close()
            notification.success('创建存储成功')
            this.handleResetState()
            loadStorageList(currentImagePool, cluster.clusterID)
          },
          isAsync: true,
        },
        failed: {
          func: (res) => {
            let message = '创建存储卷失败，请重试'
            this.handleResetState()
            notification.close()
            if (res.message) {
              message = res.message
            }
            notification.error(message)
          }
        }
      })
    })
  }

  handleCancelCreateVolume() {
    this.handleResetState()
  }

  checkVolumeName(rule, value, callback) {
    const { storageList } = this.props
    if (!value) {
      return callback('请输入存储名称')
    }
    if (value.length > 32) {
      return callback('存储名称不能超过32个字符')
    }
    if (!/^[a-z]{1}/.test(value)) {
      return callback('存储名称必须以字母开头')
    }
    if (!/^[a-z]{1}[a-z0-9]*$/.test(value)) {
      return callback('存储名称由小写字母、数字组成')
    }
    if (value.length < 3) {
      return callback('存储名称不能少于3个字符')
    }
    if (!/^[a-z]{1}[a-z0-9-]{1,61}[a-z0-9]$/.test(value)) {
      return callback('存储名称必须由小写字母或数字结尾')
    }
    if (storageList) {
      for (let i = 0; i < storageList.length; i++) {
        if (value == storageList[i].name) {
          return callback('存储名称已存在！')
        }
      }
    }

    return callback()
  }
  checkVolumeNameaaa(rule, value, callback) {
    if(value!='huawei'){
      this.setState({
        storageType:'' 
      })
    }
    this.setState({ valuetype: value}, function () {
    })
    // valuetype

    return callback()
  }
  setStorageType(rule, value, callback) {
    this.setState({ storageType: value }, function () {
    })
    return callback()
  }
  setnfsType(rule, value, callback){
    this.setState({ nfsType: value }, function () {
    })
    return callback()
  }
  handleFormatSelectOption() {
    
    const { snapshotDataList } = this.props
    let Options = snapshotDataList.map((item, index) => {
      return <Select.Option key={item.name} value={item.name}>
        <Row>
          <Col span={8} className='snapshotName'>{item.name}</Col>
          <Col span={9}>{formatDate(item.createTime)}</Col>
          <Col span={4}>{item.size} M</Col>
          <Col span={3}>{item.fstype}</Col>
        </Row>
      </Select.Option>
    })
    return Options
  }

  changeVolumeSizeSlider(size) {
    if (size > 20480) {
      size = 20480
    }
    this.setState({
      volumeSize: size
    })
  }
  changeVolumeSizeSlideraccessTypePropaa(size){
    if (size > 2000) {
      size = 2000
    }
    this.setState({
      volumeblock: size
    })
  }

  changeVolumeSizeInputNumber(number) {
    const { volumeSizemin } = this.state
    if (number < volumeSizemin) {
      number = volumeSizemin
    }
    this.setState({
      volumeSize: number
    })
  }

  render() {
    const { form, cluster, snapshotRequired,storageType,nfsType } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
    const { currentSnapshot } = this.state
    // const { getFieldProps } = form
    const VolumeNameProps = getFieldProps('volumeName', {
      rules: [{
        validator: this.checkVolumeName
      }]
    })
    const accessTypePropaa = getFieldProps('accessModesss', { // Verifying Type
      rules: [{
        validator: this.checkVolumeNameaaa
      }]
    })
    const storageTypes = getFieldProps('storageType', { // Verifying Type
      rules: [{
        validator: this.setStorageType
      }]
    })
    const nfsTypes = getFieldProps('nfsType', { // Verifying Type
      rules: [{
        validator: this.setnfsType
      }]
    })
    let selectdefaultValue = undefined
    if (currentSnapshot) {
      selectdefaultValue = currentSnapshot.name
    }
    let selectSnapshotNameProps
    if (this.state.swicthChecked) {
      selectSnapshotNameProps = getFieldProps('selectSnapshotName', {
        rules: [{
          required: true,
          message: '请选择快照名称',
        }],
        initialValue: selectdefaultValue
      })
    }
    const resourcePrice = cluster.resourcePrice
    const storagePrice = resourcePrice.storage / 10000
    const hourPrice = parseAmount(this.state.volumeSize / 1024 * resourcePrice.storage, 4)
    const countPrice = parseAmount(this.state.volumeSize / 1024 * resourcePrice.storage * 24 * 30, 4)

    return (
      <div id="CreateVolume">
        <Form className='formStyle'>
          <Row className='volumeName'>
            <Col span="4" className="name-text-center name">
              存储类型
            </Col>
            <Col span="12" className='nameValue'>
              <Form.Item>
                <RadioGroup{...accessTypePropaa} value={this.state.valuetype}>
                  {cluster.clusterName == 'huawei' ? 
                <RadioGroup{...accessTypePropaa} value={this.state.valuetype}>
                <Radio value={"huawei"}>华为</Radio></RadioGroup>:
                <RadioGroup{...accessTypePropaa} value={this.state.valuetype}>
                <Radio value={'block'}>青云</Radio></RadioGroup>}
                {/* <Radio value={"rbd"}>ceph</Radio> */}
                </RadioGroup>
              </Form.Item>
            </Col>
          </Row>
          <Row className='volumeName'>
            <Col span="4" className="name-text-center name">
              存储卷名称
            </Col>
            <Col span="12" className='nameValue'>
              <Form.Item>
                <Input {...VolumeNameProps} placeholder="请输入存储卷名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row className='volumeSize'>
            <Col span="4" className="name-text-center size">
              <FormattedMessage {...messages.size} />
            </Col>
            {this.state.valuetype == 'rbd'? <Col span="12">
            <Slider
                min={this.state.volumeSizemin}
                max={20480}
                step={512}
                defaultValue={512}
                onChange={(size) => this.changeVolumeSizeSlider(size)}
                value={this.state.volumeSize}
              />  
            </Col>:''
            }
            {this.state.valuetype == 'block' || this.state.valuetype == 'huawei'? <Col span="12">
            <Slider
                min={10}
                max={2000}
                step={10}
                defaultValue={10}
                onChange={(size) => this.changeVolumeSizeSlideraccessTypePropaa(size)}
                value={this.state.volumeblock}
              />  
            </Col>:''
            }
           
            <Col span="7" className='inputbox'>
              <InputNumber
                disabled
                // min={this.state.volumeSizemin}
                // max={20480}
                // step={512}
                // defaultValue={this.state.volumeSizemin}
                value={this.state.valuetype == 'rbd'? this.state.volumeSize:this.state.volumeblock}
                onChange={(number) => this.changeVolumeSizeInputNumber(number)}
              />
              <span style={{ paddingLeft: 10 }} >{this.state.valuetype == 'rbd'?'MB':'Gi'}</span>
            </Col>
          </Row>
          {this.state.valuetype == 'huawei'?
            <Row  className='volumeName'>
              <Col span="4" className="name-text-center name">
                I/O类型
              </Col>
              <Col span="12" className='types'>
                <Form.Item>
                  {/* <Button type="primary" loading={this.state.loading} onClick={this.enterLoading}> */}
                  <RadioGroup{...storageTypes} value={this.state.storageType}>
                    <Radio value={'ssd'}>ssd</Radio>
                    <Radio value={"sata"}>sata</Radio>
                    <Radio value={"sas"}>sas</Radio>
                  </RadioGroup>
                </Form.Item>
              </Col>
            </Row>
          :(this.state.valuetype=='block'?

          <Row  className='volumeName'>
          <Col span="4" className="name-text-center name">
            I/O类型
          </Col>
          <Col span="12" className='types'>
            <Form.Item>
              {/* <Button type="primary" loading={this.state.loading} onClick={this.enterLoading}> */}
              <RadioGroup{...nfsTypes} value={this.state.nfsType}>
                <Radio value={'block'}>块存储</Radio>
                <Radio value={"nfs"}>nfs文件存储</Radio>
              </RadioGroup>
            </Form.Item>
          </Col>
        </Row>

          :'')}
          <div className="modal-price">
            <div className="price-left">
              存储：{hourPrice.unit == '￥' ? '￥' : ''}{storagePrice} {hourPrice.unit == '￥' ? '' : ' T'}/(GB*小时)
            </div>
            <div className="price-unit">
              <p>合计：<span className="unit">{hourPrice.unit == '￥' ? '￥' : ''}</span><span className="unit blod">{hourPrice.amount}{hourPrice.unit == '￥' ? '' : ' T'}/小时</span></p>
              <p><span className="unit">（约：</span><span className="unit">{countPrice.fullAmount}/月）</span></p>
            </div>
          </div>
        </Form>
        <div className='createVolumeFooter'>
          <Button size='large' type="primary" className='buttonConfirm' onClick={this.handleComfirmCreateVolume} loading={this.state.loading}>确定</Button>
          <Button size='large' className='buttonCancel' onClick={this.handleCancelCreateVolume}>取消</Button>
        </div>
      </div>
    )
  }
}

CreateVolume = Form.create()(CreateVolume)

function mapStateToProp(state, props) {
  const { cluster } = state.entities.current
  return {
    cluster,
    currentImagePool: DEFAULT_IMAGE_POOL,
  }
}

export default connect(mapStateToProp, {
  SnapshotClone,
  createStorage,
  loadStorageList,
})(injectIntl(CreateVolume, {
  withRef: true,
}))