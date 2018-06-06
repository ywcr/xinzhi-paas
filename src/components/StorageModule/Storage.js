/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016-09-20
 * @author BaiYu
 */

import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Checkbox, Card, Menu, Button, Dropdown, Icon, Radio, Modal, Input, Slider, InputNumber, Row, Col, Tooltip, Spin, Form } from 'antd'
import { Link, browserHistory } from 'react-router'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import remove from 'lodash/remove'
import findIndex from 'lodash/findIndex'
import { loadStorageList, deleteStorage, createStorage, formateStorage, resizeStorage, SnapshotCreate, SnapshotList } from '../../actions/storage'
import { DEFAULT_IMAGE_POOL, STORAGENAME_REG_EXP } from '../../constants'
import './style/storage.less'
import { calcuDate, parseAmount } from '../../common/tools'
import { volNameCheck } from '../../common/naming_validation'
import NotificationHandler from '../../common/notification_handler'
import noStorageImg from '../../assets/img/no_data/no_storage.png'
import ResourceQuotaModal from '../ResourceQuotaModal/Storage'
import CreateVolume from '../StorageModule/CreateVolume'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
let isActing = false

const messages = defineMessages({
  name: {
    id: "Storage.modal.name",
    defaultMessage: '名称'
  },
  cancelBtn: {
    id: "Storage.modal.cancelBtn",
    defaultMessage: '取消'
  },
  createBtn: {
    id: "Storage.modal.createBtn",
    defaultMessage: '创建'
  },
  createTitle: {
    id: "Storage.modal.createTitle",
    defaultMessage: '创建存储'
  },
  createModalTitle: {
    id: "Storage.menu.create",
    defaultMessage: "创建存储卷",
  },
  storageName: {
    id: 'Storage.titleRow.name',
    defaultMessage: '存储名称',
  },
  delete: {
    id: 'Storage.menu.delete',
    defaultMessage: '删除',
  },
  status: {
    id: 'Storage.titleRow.status',
    defaultMessage: '状态',
  },
  formats: {
    id: 'Storage.titleRow.formats',
    defaultMessage: '格式',
  },
  forin: {
    id: 'Storage.titleRow.forin',
    defaultMessage: '容器挂载点',
  },
  cluster: {
    id: 'Storage.titleRow.cluster',
    defaultMessage: '集群'
  },
  app: {
    id: 'Storage.titleRow.app',
    defaultMessage: '应用',
  },
  size: {
    id: 'Storage.titleRow.size',
    defaultMessage: '大小',
  },
  createTime: {
    id: 'Storage.titleRow.createTime',
    defaultMessage: '创建时间',
  },
  // action: {
  //   id: 'Storage.titleRow.action',
  //   defaultMessage: '操作',
  // },
  formatting: {
    id: 'Storage.titleRow.formatting',
    defaultMessage: '格式化',
  },
  dilation: {
    id: 'Storage.titleRow.dilation',
    defaultMessage: '扩容',
  },
  okRow: {
    id: 'Storage.titleRow.normal',
    defaultMessage: '正常',
  },
  use: {
    id: 'Storage.titleRow.use',
    defaultMessage: '使用中',
  },
  noUse: {
    id: 'Storage.titleRow.noUse',
    defaultMessage: '未使用',
  },
  errorRow: {
    id: 'Storage.titleRow.error',
    defaultMessage: '异常',
  },
  placeholder: {
    id: 'Storage.modal.placeholder',
    defaultMessage: '输入名称',
  },
  inputPlaceholder: {
    id: 'Storage.modal.inputPlaceholder',
    defaultMessage: '按存储名称搜索',
  }
})

let MyComponent = React.createClass({
  getInitialState() {
    return {
      visible: false,
      modalTitle: '',
      modalSize: 512,
      size: 512,
      createSnapModal: false,
      confirmCreateSnapshotLoading: false,
      volumeName: '',
      volumeFormat: '',
      volumeSize: '',
      CreateSnapshotSuccessModal: '',
      snapshotName: '',
      tipsModal: false,
      dilation: false,
    };
  },
  propTypes: {
    config: React.PropTypes.object
  },
  onchange(e, name) {
    this.props.saveVolumeArray(e, name)
  },
  isChecked(name) {
    return findIndex(this.props.volumeArray, { name }) >= 0
  },
  changeType(e) {
    this.setState({
      formateType: e.target.value
    })
  },
  handleSure() {
    if(isActing) return
    isActing = true
    const type = this.state.modalType
    const self = this
    let notification = new NotificationHandler()
    notification.spin("执行中")
    if (type === 'format') {
      this.props.formateStorage(this.props.imagePool, this.props.cluster, {
        name: this.state.modalName,
        fsType: this.state.formateType
      }, {
          success: {
            isAsync: true,
            func: () => {
              self.setState({
                visible: false,
              })
              isActing = false
              notification.close()
              notification.success('格式化存储卷成功')
              this.props.loadStorageList()
            }
          },
          failed: {
            isAsync: true,
            func: () => {
              self.setState({
                visible: false
              })
              isActing = false
              notification.close()
              notification.error('格式化存储卷失败')
              this.props.loadStorageList()
            }
          }
        })
    } else if (type === 'resize') {
      if (this.state.size <= this.state.modalSize) {
        notification.close()
        notification.info('存储卷大小没有变化')
        isActing = false
        return
      }
      this.props.resizeStorage(this.props.imagePool, this.props.cluster, {
        name: this.state.modalName,
        size: this.state.size
      }, {
          success: {
            isAsync: true,
            func: () => {
              self.setState({
                visible: false
              })
              isActing = false
              notification.close()
              notification.success('扩容成功')
              self.props.loadStorageList()
            }
          },
          failed: {
            isAsync: true,
            func: () => {
              self.setState({
                visible: false
              })
              isActing = false
              notification.close()
              notification.error('扩容失败')
              self.props.loadStorageList()
            }
          }
        })
    }
  },
  cancelModal() {
    this.setState({
      visible: false,
    });
  },
  onChange(value) {
    this.setState({
      size: value,
    });
  },
  showAction(e, type, item) {
    if(e.stopPropagation) e.stopPropagation()
    else e.cancelable = true
    if(e.key && e.key == 'createSnapshot'){
      const { form } = this.props
      const { setFieldsValue } = form
      setFieldsValue({
        snapshotName: undefined
      })
      this.setState({
       createSnapModal: true,
       volumeName: item.name,
       volumeFormat: item.format,
       volumeSize: item.totalSize,
      })
      setTimeout(function() {
        document.getElementById('snapshotName').focus()
      },100)
      return
    }
    if (type === 'format') {
      if(item.isUsed){
        this.setState({
          tipsModal: true,
          dilation: true,
        })
        return
      }
      this.setState({
        visible: true,
        modalType: type,
        modalName: item.name,
        modalFormat: item.format,
        format: item.format,
        formateType: item.format
      });
      this.setState({
        modalTitle: '格式化'
      })
    } else {
      if(item.isUsed){
        this.setState({
          tipsModal: true,
          dilation: false,
        })
        return
      }
      this.setState({
        visible: true,
        modalType: type,
        modalName: item.name,
        modalSize: item.totalSize,
        size: item.totalSize,
        modalTitle: '扩容'
      });
    }
  },
  handleConfirmCreateSnapshot(){
    const { form, SnapshotCreate, cluster, SnapshotList } = this.props
    const { volumeName } = this.state
    let Noti = new NotificationHandler()
    form.validateFields( (errors, values) => {
      if(errors){
        return
      }
      const body = {
        clusterID: cluster,
        volumeName,
        body: {
          snapshotName:values.snapshotName
        }
      }
      this.setState({
        confirmCreateSnapshotLoading: true
      })
      SnapshotCreate(body,{
        success: {
          func: () => {
            Noti.success('创建快照成功！')
            SnapshotList({clusterID: cluster})
            this.setState({
              createSnapModal: false,
              confirmCreateSnapshotLoading: false,
              CreateSnapshotSuccessModal: true,
              snapshotName: values.snapshotName,
            })
          },
          isAsync: true
        },
        failed: {
          func: () => {
            Noti.error('创建快照失败！')
            this.setState({
              createSnapModal: false,
              confirmCreateSnapshotLoading: false
            })
          }
        }
      })
    })
  },
  handleCancelCreateSnapshot(){
    this.setState({
      createSnapModal: false,
      volumeName: '',
      volumeFormat: '',
      volumeSize: '',
      confirmCreateSnapshotLoading: false,
    })
  },
  checksnapshotName(rule, value, callback){
    const { snapshotDataList } = this.props
    if(!value){
      return callback('请输入快照名称')
    }
    if(value.length > 32){
      return callback('快照名称不能超过32个字符')
    }
    if(!/^[A-Za-z]{1}/.test(value)){
      return callback('快照名称必须以字母开头')
    }
    if(!/^[A-Za-z]{1}[A-Za-z0-9_-]*$/.test(value)){
      return callback('快照名称由字母、数字、中划线-、下划线_组成')
    }
    if(value.length < 3){
      return callback('快照名称不能少于3个字符')
    }
    if(!/^[A-Za-z]{1}[A-Za-z0-9_\-]{1,61}[A-Za-z0-9]$/.test(value)){
      return callback('快照名称必须由字母或数字结尾')
    }
    for(let i = 0; i < snapshotDataList.length; i++){
      if(value == snapshotDataList[i].name){
        return callback('快照名称已存在！')
      }
    }
    return callback()
  },
  handleConfirmCreateSnapshotSuccess(){
    this.setState({
      CreateSnapshotSuccessModal: false,
      snapshotName: '',
    })
    browserHistory.push('/app_manage/snapshot')
  },
  handleCancelCreateSnapshotSuccess(){
    this.setState({
      CreateSnapshotSuccessModal: false,
      snapshotName: '',
    })
  },
  changeDilation(size) {
    if (size > 20480) {
      size = 20480
    }
    this.setState({
      size: size
    })
  },

  selectByline(e, item) {
    if(item.isUsed) return
    this.props.saveVolumeArray({target:{checked:!this.isChecked(item.name)}}, item.name, 'rbd', item.serviceName)
  },

  colseTipsModal(){
    this.setState({
      tipsModal: false
    })
  },

  render() {
    if(this.props.isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"></Spin>
        </div>
      )
    }
    const { formatMessage } = this.props.intl
    let list = this.props.storage;
    if (!list.storageList) {
      return <div className="loadingBox"><Icon type="frown"/>&nbsp;暂无数据</div>
    }
    let items = list.storageList.map((item) => {
      const menu = (<Menu onClick={(e) => { this.showAction(e, 'format', item) } } style={{ width: '80px' }}>
        <Menu.Item key="createSnapshot">创建快照</Menu.Item>
        <Menu.Item key="format"><FormattedMessage {...messages.formatting} /></Menu.Item>
      </Menu>
      )
      return (
        <div className="appDetail" key={item.name} onClick={(e) => this.selectByline(e, item)}>
          <div className="selectIconTitle commonData">
            <Checkbox disabled={item.isUsed} onChange={(e) => this.onchange(e, item.name)} checked={this.isChecked(item.name)}></Checkbox>
          </div>
          <div className="name commonData">
            <Link to={`/app_manage/storage/${this.props.imagePool}/${this.props.cluster}/${item.name}?isOld=${item.isOld}&diskType=${item.diskType}`} >
            {item.name}({item.diskType == 'rbd'?'ceph':item.diskType})
            </Link>
          </div>
          <div className="status commonData">
            <i className={item.isUsed == true ? "error fa fa-circle" : "normal fa fa-circle"}></i>
            <span className={item.isUsed == false ? "normal" : "error"} >{item.isUsed == true ? <FormattedMessage {...messages.use} /> : <FormattedMessage {...messages.noUse} />}</span>
          </div>
          <div className="formet commonData">{item.format}</div>
          <div className="forin commonData">{item.mountPoint || '无'}</div>
          <div className="appname commonData">{item.appName || '无'}</div>
          <div className="size commonData">{  item.totalSize/1024}Gi</div>
          <div className="createTime commonData">
            <span className='spanBlock'>
              <Tooltip placement="topLeft" title={calcuDate(item.createTime)}>
                <span>{calcuDate(item.createTime)}</span>
              </Tooltip>
            </span>
          </div>
          {/*<div className="actionBtn commonData">*/}
            {/*<Dropdown.Button*/}
              {/*overlay={menu}*/}
              {/*type='ghost'*/}
              {/*onClick={(e) => { this.showAction(e, 'resize', item) } }*/}
              {/*key="dilation"*/}
            {/*>*/}
              {/*<FormattedMessage {...messages.dilation} />*/}
            {/*</Dropdown.Button>*/}
          {/*</div>*/}
        </div>
      );
    });
    const { scope, form } = this.props
    const { getFieldProps } = form
    const { resourcePrice } = scope.props.currentCluster
    const hourPrice = parseAmount(this.state.size /1024 * resourcePrice.storage, 4)
    const countPrice = parseAmount(this.state.size /1024 * resourcePrice.storage * 24 *30, 4)
    const snapshotName = getFieldProps('snapshotName',{
      rules: [{
        validator: this.checksnapshotName
      }]
    })
    return (
      <div className="dataBox">
        {items}
        <Modal title={this.state.modalTitle} visible={this.state.visible} okText="确定" cancelText="取消" className="storageModal" width={600} onCancel= {() => this.cancelModal() }
         footer={[
            <Button key="back" type="ghost" size="large" onClick={(e) => { this.cancelModal() } }>取消</Button>,
            <Button key="submit" type="primary" size="large" disabled={isActing} loading={this.state.loading} onClick={(e) => { this.handleSure() } }>
              确定
            </Button>
          ]}
         >
          <div className={this.state.modalType === 'resize' ? 'show' : 'hide'}>
            <Row style={{ height: '40px' }}>
              <Col span="3" className="text-center" style={{ lineHeight: '30px' }}><FormattedMessage {...messages.name} /></Col>
              <Col span="12"><input type="text" className="ant-input" value={this.state.modalName} disabled /></Col>
            </Row>
            <Row style={{ height: '40px' }}>
              <Col span="3" className="text-center" style={{ lineHeight: '30px' }}>{formatMessage(messages.size)}</Col>
              <Col span="12">
                <Slider min={(this.state.modalSize <20480 )? this.state.modalSize: 512} disabled={this.state.modalSize ==20480} max={20480} step={512} onChange={(e) => { this.changeDilation(e) } } value={this.state.size} /></Col>
              <Col span="8">
                <InputNumber disabled min={this.state.modalSize} max={20480} step={512} style={{ marginLeft: '16px' }} value={this.state.size} onChange={(e) => { this.onChange(e) } } />
                <span style={{ paddingLeft: 10 }} >MB</span>
              </Col>
            </Row>
            <div className="modal-price">
              <div className="price-left">
                存储：{hourPrice.unit == '￥'? '￥': ''}{ resourcePrice.storage /10000 } {hourPrice.unit == '￥'? '': ' T'}/(GB*小时)
              </div>
              <div className="price-unit">
                <p>合计：<span className="unit">{hourPrice.unit == '￥'? '￥': ''}</span><span className="unit blod"> { hourPrice.amount }{hourPrice.unit == '￥'? '': ' T'}/小时</span></p>
                <p><span className="unit">（约：</span><span className="unit"> { countPrice.fullAmount }/月）</span></p>
              </div>
            </div>

          </div>
          <div className={this.state.modalType === 'format' ? 'show' : 'hide'}>
            <div style={{ height: '30px' }}>确定格式化存储卷{this.state.modalName}吗? <span style={{ color: 'red' }}>(格式化后数据将被清除)。</span></div>
            <Col span="6" style={{ lineHeight: '30px' }}>选择文件系统格式：</Col>
            <RadioGroup defaultValue='ext4' value={this.state.formateType} size="large" onChange={(e) => this.changeType(e)}>
              <RadioButton value="ext4">ext4</RadioButton>
              <RadioButton value="xfs">xfs</RadioButton>

            </RadioGroup>
          </div>
        </Modal>

        <Modal
          title="创建快照"
          visible={this.state.createSnapModal}
          closable={true}
          onOk={this.handleConfirmCreateSnapshot}
          onCancel={this.handleCancelCreateSnapshot}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmCreateSnapshotLoading}
          wrapClassName="CreateSnapshotModal"
          okText="创建快照"
        >
          <div>
            <div className='header'>
              <div className='leftbox'>
                <div className="item">存储名称</div>
                <div className="item">存储大小</div>
                <div className="item">存储格式</div>
                <div className="item">快照名称</div>
              </div>
              <div className="rightbox">
                <div className='item'>{this.state.volumeName}</div>
                <div className="item">{this.state.volumeSize} MB</div>
                <div className="item">{this.state.volumeFormat}</div>
                <div className='item'>
                  <Form.Item>
                    <Input
                      {...snapshotName}
                      placeholder='请输入快照名称'
                      onPressEnter={this.handleConfirmCreateSnapshot}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className='footer'>
              <div className="title">为了保证快照能完整的捕获磁盘数据内容，建议制作快照前，进行以下操作：</div>
              <div className="item"><span className='num'>1</span>数据库业务：Flush & Lock Table</div>
              <div className="item"><span className='num'>2</span>文件系统：进行Sync操作，将内存缓冲区中的数据立刻写入磁盘内</div>
            </div>
          </div>
        </Modal>

        <Modal
          title="创建快照"
          visible={this.state.CreateSnapshotSuccessModal}
          closable={true}
          onOk={this.handleConfirmCreateSnapshotSuccess}
          onCancel={this.handleCancelCreateSnapshotSuccess}
          width='570px'
          maskClosable={false}
          wrapClassName="CreateSnapshotSccessModal"
          okText="去查看"
          cancelText="关闭"
        >
          <div className='container'>
            <div className='header'>
              <div>
                <Icon type="check-circle-o" className='icon'/>
              </div>
              <div className='tips'>
                操作成功
              </div>
            </div>
            <div>快照名称 {this.state.snapshotName}</div>
          </div>
        </Modal>

         <Modal
           title="提示"
           visible={this.state.tipsModal}
           closable={true}
           onOk={this.colseTipsModal}
           onCancel={this.colseTipsModal}
           width='570px'
           maskClosable={true}
           wrapClassName="handleVolumeTips"
         >
           <div className='content'>
             <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
             停止绑定的服务后可
             {
               this.state.dilation
               ? <span>格式化</span>
               : <span>扩容</span>
             }
           </div>
         </Modal>
      </div>
    )
  }
});

MyComponent = Form.create()(MyComponent)

function myComponentMapSateToProp(state) {
  return {
    formateStorage: state.storage.formateStorage,
    resizeStorage: state.storage.resizeStorage
  }
}

function myComponentMapDispathToProp(dispath) {
  return {
    formateStorage: (pool, cluster, storage, callback) => {
      dispath(formateStorage(pool, cluster, storage, callback))
    },
    resizeStorage: (pool, cluster, storage, callback) => {
      dispath(resizeStorage(pool, cluster, storage, callback))
    }
  }
}

MyComponent = connect(myComponentMapSateToProp, myComponentMapDispathToProp)(injectIntl(MyComponent, {
  withRef: true,
}))
class Storage extends Component {
  constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.onChange = this.onChange.bind(this)
    this.deleteStorage = this.deleteStorage.bind(this)
    this.refreshstorage = this.refreshstorage.bind(this)
    // this.focus = this.focus.bind(this)
    this.deleteButton = this.deleteButton.bind(this)
    this.state = {
      visible: false,
      volumeArray: [],
      currentType: 'ext4',
      inputName: '',
      size: 512,
      nameError: false,
      nameErrorMsg: '',
      resourceQuotaModal: false,
      resourceQuota: null,
      disableListArray: [],
      ableListArray: [],
    }
  }
  componentWillMount() {
    document.title = '存储 | 新智云'
    this.props.loadStorageList(this.props.currentImagePool, this.props.cluster)
    this.props.SnapshotList({clusterID: this.props.cluster})
  }
  componentWillReceiveProps(nextProps) {
    let { currentCluster, loadStorageList, currentImagePool, cluster, SnapshotList } = nextProps
    if (currentCluster.clusterID !== this.props.currentCluster.clusterID || currentCluster.namespace !== this.props.currentCluster.namespace) {
      loadStorageList(currentImagePool, cluster)
      SnapshotList({clusterID: nextProps.cluster})
    }
  }
  onChange(value) {
    this.setState({
      size: value,
    });
  }
  showModal() {
    this.setState({
      visible: true,
    });
    const self = this
    setTimeout(() => {
      document.getElementById('volumeName').focus()
    },100)
    setTimeout(function () {
      if (self.focusInput) {
        self.focusInput.refs.input.focus()
      }
    }, 0)
  }
  handleCancel() {
    this.setState({
      nameError: false,
      visible: false,
      size: 512,
      name: '',
      currentType: 'ext4'
    });
  }
  deleteStorage() {
    // {
    //   let list = this.props.storage;
    //   if (!list.storageList) {
    //     return <div className="loadingBox"><Icon type="frown"/>&nbsp;暂无数据</div>
    //   }
    //   let items = list.storageList.map((item) => {
    // }
     let list = this.props.storage;
    const { disableListArray } = this.state
    let volumeArray = this.state.ableListArray
    let notification = new NotificationHandler()
    let message = ''
    if(disableListArray.length){
      let serviceStr = disableListArray.map((item, index) => {
        return item.name
      })
      message = '存储卷 ' + serviceStr.join('、') + ' 仍在服务挂载状态，暂时无法删除，请先删除对应服务'
    }
    if (volumeArray && volumeArray.length === 0) {
      notification.info(message)
      this.setState({
        volumeArray: [],
        disableListArray: [],
        ableListArray: [],
        delModal: false,
      })
      return
    }
    volumeArray = volumeArray.map(item => {
      const data= {
        "name": item.name,
        "diskType":item.diskType,
        "isOld":item.isOld
    }
      return data
    })
    this.setState({
      delModal: false,
    })
    notification.spin("删除存储中")
    this.props.deleteStorage(this.props.currentImagePool, this.props.cluster,volumeArray, {
      success: {
        func: () => {
          notification.close()
          this.props.loadStorageList(this.props.currentImagePool, this.props.cluster)
          notification.success('删除存储成功')
          this.setState({
            volumeArray: [],
            disableListArray: [],
            ableListArray: [],
          })
          if(disableListArray.length){
            notification.info(message)
          }
        },
        isAsync: true
      },
      failed: {
        isAsync: true,
        func: () => {
          notification.close()
          notification.error('删除存储失败')
          this.props.loadStorageList(this.props.currentImagePool, this.props.cluster)
        }
      }
    })
  }
  refreshstorage() {
    this.props.loadStorageList(this.props.currentImagePool, this.props.cluster)
    this.props.SnapshotList({clusterID: this.props.cluster})
    this.setState({
      volumeArray: [],
      disableListArray: [],
      ableListArray: [],
    })
  }
  onAllChange(e) {
    const storage = this.props.storageList[this.props.currentImagePool]
    if (!storage || !storage.storageList) {
      return
    }
    if (e.target.checked) {
      let volumeArray = []
      storage.storageList.forEach(item => {
        volumeArray.push({
          name: item.name,
          diskType: item.diskType,
          serviceName: item.serviceName,
        })
      })
      this.setState({
        volumeArray
      })
      return
    }
    this.setState({
      volumeArray: []
    })
  }
  isAllChecked() {
    if (this.state.volumeArray.length === 0) {
      return false
    }
    if (this.state.volumeArray.length === this.props.storageList[this.props.currentImagePool].storageList.length) {
      return true
    }
    return false
  }

  selectItem() {
    return (e, name, diskType, serviceName) => {
      let volumeArray = this.state.volumeArray
      if (e.target.checked) {
        if (findIndex(volumeArray, { name }) >= 0) {
          return
        }
        const list=this.props.storageList[this.props.currentImagePool].storageList
        list.map((item)=>{
          if(name==item.name){
            volumeArray.push({
              name,
              diskType: item.diskType,
              serviceName: serviceName,
              isOld:item.isOld
            })
          }
        })
      } else {
        remove(volumeArray, (item) => {
          return item.name === name
        })
      }
      this.setState({
        volumeArray
      })
    }
  }
  changeType(type) {
    this.setState({
      currentType: type
    })
  }
  disableSelectAll() {
    let selectAll = true
    let { storageList } = this.props.storageList[this.props.currentImagePool]
    if (this.props.storageList && storageList) {
      storageList.some((item) => {
        if (item.isUsed) {
          selectAll = false
        }
      })
      return selectAll
    }
  }
  handleInputName(e) {

    let name = e.target.value;
    let errorMsg = volNameCheck(name, '存储名称');
    let errorFlag = false;
    if(errorMsg != 'success') {
      errorFlag = true;
    }
    this.setState({
      name: e.target.value,
      nameError: errorFlag,
      nameErrorMsg: errorMsg
    })
  }
  getSearchStorageName(e) {
    this.setState({
      storageName: e.target.value
    })
  }
  searchByStorageName(e) {
    this.props.loadStorageList(this.props.currentImagePool, this.props.cluster, this.state.storageName)
  }

  deleteButton(){
    const { volumeArray } = this.state
    let ableList = []
    let disableList = []
    
    for(let i=0;i<volumeArray.length;i++){
      if(volumeArray[i].serviceName){
        disableList.push(volumeArray[i])
      } else {
        ableList.push(volumeArray[i])
      }
    }
    this.setState({
      delModal: true,
      disableListArray: disableList,
      ableListArray: ableList
    })
  }
  render() {
    const { formatMessage } = this.props.intl
    const { getFieldProps } = this.props.form
    const { SnapshotCreate, snapshotDataList } = this.props
    const currentCluster = this.props.currentCluster
    const storage_type = currentCluster.storageTypes
    const standard = require('../../../configs/constants').STANDARD_MODE
    const mode = require('../../../configs/model').mode
    let canCreate = true
    let title = ''
    if (!storage_type || storage_type.indexOf('rbd') < 0) canCreate = false
    if (!canCreate) {
      title = '尚未部署分布式存储，暂不能创建'
    }
    if (!this.props.currentCluster.resourcePrice) return <div></div>
    if (!this.props.storageList[this.props.currentImagePool]) return <div></div>
    const storagePrice = this.props.currentCluster.resourcePrice.storage /10000
    const hourPrice = parseAmount(this.state.size / 1024 * this.props.currentCluster.resourcePrice.storage, 4)
    const countPrice = parseAmount(this.state.size / 1024 * this.props.currentCluster.resourcePrice.storage * 24 *30, 4)
    const dataStorage = this.props.storageList[this.props.currentImagePool].storageList
    return (
      <QueueAnim className="StorageList" type="right">
        <div id="StorageList" key="StorageList">
          { mode === standard ? <div className='alertRow'>您的存储创建在新智云平台，如果帐户余额不足时，1 周内您可以进行充正，继续使用。如无充正，1 周后资源会被彻底销毁，不可恢复。</div> : <div></div> }
          <div className="operationBox">
            <div className="leftBox">
              <Tooltip title={title} placement="right"><Button type="primary" size="large" disabled={!canCreate} onClick={this.showModal}>
                <i className="fa fa-plus" /><FormattedMessage {...messages.createTitle} />
              </Button></Tooltip>
              <Button className="refreshBtn" size='large' onClick={this.refreshstorage}>
                <i className='fa fa-refresh' />刷新
              </Button>
              <Button type="ghost" className="stopBtn" size="large" onClick={this.deleteButton}
                disabled={!this.state.volumeArray || this.state.volumeArray.length < 1}>
                <i className="fa fa-trash-o" />删除
              </Button>
              <Modal title="删除存储卷操作" visible={this.state.delModal}
                onOk={()=> this.deleteStorage()} onCancel={()=> this.setState({delModal: false})}
                wrapClassName="deleteVolumeModal"
                footer={[
                  <Button size='large' onClick={()=> this.setState({delModal: false})} key="cancel">取消</Button>,
                  <Button size='large' type="primary" onClick={()=> this.deleteStorage()} key="ok">确定</Button>
                ]}
              >
                <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除{this.state.volumeArray.map(item => item.name).join(',')} 存储卷吗?</div>
                <div>
                </div>
              </Modal>
              {this.state.visible && 
              <Modal
                title={formatMessage(messages.createModalTitle)}
                visible={this.state.visible} width={550}
                className='createAppStorageModal'
                onCancel= {() => this.handleCancel() }
                footer={[]}
                >
                 <CreateVolume
                   snapshotRequired={false}
                   scope={this}
                   snapshotDataList={snapshotDataList}
                   storageList={dataStorage}
                 />
              </Modal>}
            </div>
            <div className="rightBox">
              <div className="littleLeft">
                <i className="fa fa-search cursor" onClick={() => this.searchByStorageName()}/>
              </div>
              <div className="littleRight">
                <Input size="large" style={{paddingRight: '28px'}} placeholder={formatMessage(messages.inputPlaceholder)} onChange={(e) => this.getSearchStorageName(e)} onPressEnter={() => this.searchByStorageName()} />
              </div>
            </div>
            <div className="clearDiv"></div>
          </div>
          {Array.isArray(dataStorage) && dataStorage.length >0 ?

          <Card className="storageBox appBox">
            <div className="appTitle">
              <div className="selectIconTitle commonTitle">
                <Checkbox onChange={(e) => this.onAllChange(e)} checked={this.isAllChecked()} disabled={!this.disableSelectAll()} />
              </div>
              <div className="name commonTitle"><FormattedMessage {...messages.storageName} /></div>
              <div className="status commonTitle"><FormattedMessage {...messages.status} /></div>
              <div className="formet commonTitle"><FormattedMessage {...messages.formats} /></div>
              <div className="forin commonTitle"><FormattedMessage {...messages.forin} /></div>
              <div className="appname commonTitle"><FormattedMessage {...messages.app} /></div>
              <div className="size commonTitle"><FormattedMessage {...messages.size} /></div>
              <div className="createTime commonTitle"><FormattedMessage {...messages.createTime} /></div>
              {/*<div className="actionBox commonTitle"><FormattedMessage {...messages.action} /></div>*/}
            </div>
            <MyComponent
              storage={this.props.storageList[this.props.currentImagePool]}
              volumeArray={this.state.volumeArray}
              saveVolumeArray={this.selectItem()}
              cluster={this.props.cluster}
              imagePool={this.props.currentImagePool}
              loadStorageList={() => { this.props.loadStorageList(this.props.currentImagePool, this.props.cluster) } }
              scope ={ this }
              isFetching={this.props.storageList[this.props.currentImagePool].isFetching}
              SnapshotCreate={SnapshotCreate}
              snapshotDataList={snapshotDataList}
              SnapshotList={SnapshotList}
              />
          </Card>
          :
          <div className='text-center'><img src={noStorageImg} /><div>您还没有存储卷，创建一个吧！ <Tooltip title={title} placement="right"><Button type="primary" size="large" disabled={!canCreate} onClick={this.showModal}>创建</Button></Tooltip></div></div>
          }
          <ResourceQuotaModal
            visible={this.state.resourceQuotaModal}
            closeModal={() => this.setState({resourceQuotaModal: false})}
            storageResource={this.state.resourceQuota} />
        </div>
      </QueueAnim>
    )
  }
}

Storage = Form.create()(Storage)

Storage.propTypes = {
  intl: PropTypes.object.isRequired,
  loadStorageList: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { cluster } = state.entities.current
  const { snapshotList } = state.storage
  const snapshotDataList = snapshotList.result || []
  return {
    storageList: state.storage.storageList || [],
    createStorage: state.storage.createStorage,
    deleteStorage: state.storage.deleteStorage,
    currentImagePool: DEFAULT_IMAGE_POOL,
    cluster: cluster.clusterID,
    currentCluster: cluster,
    snapshotDataList
  }
}

export default connect(mapStateToProps, {
  deleteStorage,
  createStorage,
  loadStorageList,
  SnapshotCreate,
  SnapshotList,
})(injectIntl(Storage, {
  withRef: true,
}))
