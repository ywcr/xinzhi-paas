/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016-09-22
 * @author BaiYu
 */

import React, { Component, PropTypes } from 'react'
import { Tabs, Card, Menu, Progress, Upload, Radio, Modal, Button, Icon, Col } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import cloneDeep from 'lodash/cloneDeep'
import { getUploadFileUlr, uploadFileRequest, uploadFileSuccess, getStorageFileHistory, exportFile, uploadFileOptions } from '../../actions/storage'
import './style/storage.less'
import NotificationHandler from '../../common/notification_handler'

const RadioGroup = Radio.Group
const messages = defineMessages({
  app: {
    id: "StorageBind.bind.app",
    defaultMessage: "应用"
  },
  modalRedHint: {
    id: "StorageBind.bind.app",
    defaultMessage: "应用"
  }
})
const props = {
  name: 'file',
  showUploadList: false,
  action: '/upload.do',
};

class StorageStatus extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      RadioValue: 1,
      isUnzip: false,
      uploadFile: true,
      uploadFileStatus: 'success',
      downloadFileStatus: 'success'
    }
    this.showUploadModal = this.showUploadModal.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.showUploadModal = this.showUploadModal.bind(this)
    this.changeRadioValue = this.changeRadioValue.bind(this)
  }
  componentWillMount() {
    this.props.getStorageFileHistory(this.props.pool, this.props.cluster, this.props.volumeName)
  }

  showUploadModal() {
    this.props.uploadFileOptions({
      pool: this.props.pool,
      cluster: this.props.cluster,
      volumeName: this.props.volumeName,
      visible: true
    })
  }
  handleCancel() {
    this.setState({
      visible: false
    })
  }
  changeRadioValue(e) {
    this.setState({
      isUnzip: e.target.value
    })
  }

  showPercent(item) {
    if (item.backupId === this.props.beforeUploadState.backupId) {
      return this.props.upload.percent
    } else {
      return 100
    }
  }
  // showStatus(item) {
  //   if (item.backupId === this.props.beforeUploadState.backupId) {
  //     if(this.props.upload.percent < 100) {
  //       return 'Uploading'
  //     }
  //     if(this.state.uploadFileStatus == 'exception') {
  //       return 'Failure'
  //     }
  //     return 'Complete'
  //   }
  //   return item.status
  // }
  getFileStatus(item) {
    // if (item.backupId === this.props.beforeUploadState.backupId) {
    //   if(item.backupType == 1) {
    //     return this.state.uploadFileStatus
    //   }
    //   if(item.backupType ==2) {
    //     return this.state.downloadFileStatus
    //   }
    // }
    switch (item.status) {
      case 'Complete':
        return 'success'
      case 'Failure':
        return 'exception'
      case 'Uploading':
        return 'active'
      default:
        return item.status
    }
  }
  showBackground(item) {
    switch (item.backupType) {
      case 1:
        return 'status-icon success'
      case 0:
        return 'status-icon primary'
    }
  }
  getUploadData() {
    const volumeName = this.props.volumeName
    const self = this
    let notification = new NotificationHandler()
    return {
      showUploadList: false,
      data: {
        isUnzip: self.state.isUnzip,
        volumeName: volumeName,
        pool: 'test',
        backupId: self.props.beforeUploadState.backupId
      },
      beforeUpload: (file) => {
        self.props.uploading(0)
        file.isUnzip = self.state.isUnzip
        self.setState({
          uploadFile: false
        })
        return new Promise(function (resolve, reject) {
          self.props.beforeUploadFile(self.props.pool, self.props.cluster, volumeName, file, {
            success: {
              isAsync: true,
              func() {
                self.props.mergeUploadingIntoList(self.props.beforeUploadState)
                self.setState({
                  visible: false
                })
                resolve(true)
              }
            }
          })
        })
      },
      action: getUploadFileUlr(self.props.pool, self.props.cluster, volumeName),
      onChange(info) {
        if (info.event) {
          self.props.uploading(info.event.percent.toFixed(2))
        }
        if (info.file.status === 'done') {
          self.props.uploadFileSuccess()
          self.setState({
            uploadFile: true,
            uploadFileStatus: 'success'
          })
          const fileInfo = cloneDeep(self.props.beforeUploadState)
          fileInfo.status = 'Complete'
          self.props.mergeUploadingIntoList(fileInfo)
          self.props.uploading(100)
          notification.success('文件上传成功')
        } else if (info.file.status === 'error') {
          // self.props.uploading(100)
          self.setState({
            uploadFile: true,
            uploadFileStatus: 'exception'
          })
          const fileInfo = cloneDeep(self.props.beforeUploadState)
          fileInfo.status = 'Failure'
          self.props.mergeUploadingIntoList(fileInfo)
          notification.error('文件上传失败')
        }
      }
    }
  }
  exportFile() {
    this.props.exportFile(this.props.pool, this.props.cluster, this.props.volumeName)
  }
  render() {
    const {formatMessage} = this.props.intl
    const statusList = this.props.fileHistory.history
    let status_list = []
    if (statusList && statusList.length >= 0) {
      status_list = statusList.map(item => {
        return (<div className="status-list" key={item.backupId}>
          <span className={this.showBackground(item)}><Icon type={item.backupType == 1 ? 'cloud-upload-o' : 'cloud-download-o'} /></span>
          <div className="status-content">
            <div className="status-row">
              <span className="pull-left">{item.backupType == 1 ? '上传' : '下载'}：{item.backupName}({(item.size / 1024 / 1024).toFixed(2)}MB)</span>
              <span className="pull-right">{item.startTime}</span>
            </div>
            <Col span={8} className="fullProgress">
              <Progress percent={this.showPercent(item)} status={this.getFileStatus(item)} showInfo={true} />
            </Col>
            <Col span={4} offset={2}>{item.status}</Col>
          </div>
        </div>)
      })
    }
    return (
      <div className="action-btns" style={{ paddingLeft: '30px', paddingTop: '10px' }}>
        <Button type="primary" onClick={this.showUploadModal} disabled={!this.props.uploadFileOptionsState.uploadFile}><Icon type="cloud-upload-o" />上传文件</Button>
        <span className="margin"></span>
        <Button type="ghost" onClick={() => this.exportFile()} disabled={!this.props.exportFileState.exportFile}><Icon type="cloud-download-o" />导出文件</Button>
        <div className="status-box">
          {status_list}
        </div>
      </div>
    )
  }
}


StorageStatus.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProp(state) {
  return {
    upload: state.storage.uploadFile,
    fileHistory: state.storage.storageFileHistory,
    exportFileState: state.storage.exportFile,
    uploadFileOptionsState: state.storage.uploadFileOptions,
    beforeUploadState: state.storage.beforeUploadFile
  }
}


export default connect(mapStateToProp, {
  uploadFileRequest,
  uploadFileSuccess,
  getStorageFileHistory,
  exportFile,
  uploadFileOptions,
})(injectIntl(StorageStatus, {
  withRef: true,
}))


               // <TabPane tab={<FormattedMessage {...messages.operating} />} key="1">
           //       <StorageStatus key="StorageStatus" volumeName={ StorageInfo.volumeName } pool={ StorageInfo.imagePool  } cluster = {StorageInfo.cluster}/>
          //      </TabPane>