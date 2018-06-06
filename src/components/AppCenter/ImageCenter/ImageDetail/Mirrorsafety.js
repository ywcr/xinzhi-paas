/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * MirrorSafety component
 *
 * v0.1 - 2017-3-14
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import MirrorLayered from './MirrorLayered'
import MirrorSafetyBug from './MirrorSafetyBug'
import SoftwarePackage from './SoftwarePackage'
import BaseScan from './BaseScan'
import './style/MirrorSafety.less'
import { loadMirrorSafetyLayerinfo, loadImageDetailTag, loadMirrorSafetyScanStatus, loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo, loadMirrorSafetyChairinfo } from '../../../../actions/app_center'
import { connect } from 'react-redux'
import { DEFAULT_REGISTRY } from '../../../../constants'
import NotificationHandler from '../../../../common/notification_handler'
import { browserHistory } from 'react-router'

const TabPane = Tabs.TabPane
const Option = Select.Option

class MirrorSafety extends Component {
  constructor(props) {
    super(props);
    this.TemplateSelectOption = this.TemplateSelectOption.bind(this)
    this.handleSelectVesion = this.handleSelectVesion.bind(this)
    this.handleSoftwarepackageToLayer = this.handleSoftwarepackageToLayer.bind(this)
    this.handleTabsSwitch = this.handleTabsSwitch.bind(this)
    this.handleUpgrade = this.handleUpgrade.bind(this)
    this.handleScanFailed = this.handleScanFailed.bind(this)
    this.state = {
      tag: '',
      ScanDisabled: false,
      TabsDisabled: this.props.tabledisabled,
      imgTag: "",
      imageName: this.props.imageName,
      ActiveKey: '1',
      LayerCommandParameters: '',
      tagVersion: this.props.tagVersion,
      inherwidth: 1
    }
  }

  componentWillMount() {
    const { registry, imageName, loadImageDetailTag, tagVersion, envEdition } = this.props
    const standard = require('../../../../../configs/constants').STANDARD_MODE
    const mode = require('../../../../../configs/model').mode
    if( mode === standard && envEdition == 0){
      return
    }
    loadImageDetailTag(registry, imageName)
    if (tagVersion !== '') {
      this.setState({
        tag: tagVersion,
        TabsDisabled: false
      })
    }
  }

  componentWillReceiveProps(nextPorps) {
    const { registry, loadImageDetailTag } = this.props
    const imageName = nextPorps.imageName
    const tagVersion = nextPorps.tagVersion
    let ActiveKeyNext = '1'
    if (this.state.tagVersion !== tagVersion) {
      this.setState({
        tag: tagVersion,
        TabsDisabled: false
      })
    }
    if(this.state.imageName == imageName){
      ActiveKeyNext = this.state.ActiveKey
    }
    if (this.state.imageName !== imageName) {
      loadImageDetailTag(registry, imageName)
      this.setState({
        TabsDisabled: true,
        imageName,
        tag: null,
        ActiveKey:ActiveKeyNext
      })
    }
  }

  TemplateSelectOption() {
    const { imgTag } = this.props
    if (!imgTag) {
      return
    }
    const tags = imgTag.map((item, index) => {
      return (
        <Option value={item} key={index}>{item}</Option>
      )
    })
    return tags
  }

  handleSelectVesion(tag) {
    const { imageName, loadMirrorSafetyLayerinfo, loadMirrorSafetyScanStatus, loadMirrorSafetyScan, cluster_id, loadMirrorSafetyChairinfo, loadMirrorSafetyLyinsinfo, mirrorSafetyScan, mirrorScanUrl, formatErrorMessage } = this.props
    const notificationHandler = new NotificationHandler()
    this.setState({tag})
    loadMirrorSafetyScanStatus({ imageName, tag },{
      success: {
        func: () => {
          loadMirrorSafetyLayerinfo({ imageName, tag })
          this.setState({
            TabsDisabled: false
          })
          const { mirrorScanstatus } = this.props
          const currentImageScanstatus = mirrorScanstatus[imageName][tag]
          const currentImageScanstatusResult = currentImageScanstatus.result
          const statusCode = currentImageScanstatusResult.statusCode
          const full_name = currentImageScanstatusResult.fullName
          const blob_sum = currentImageScanstatusResult.blobSum
          const status = currentImageScanstatusResult.status
          const registry = mirrorScanUrl
          if(statusCode == 500){
            return
          }
          const config = {
            cluster_id,
            imageName,
            tag,
            registry,
            full_name
          }
          if(statusCode && statusCode == 200){
            switch(status){
              case 'lynis':
              case 'clair':
              case 'running':
              case 'both':{
                loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag})
                loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name, tag})
                return
              }
              case 'noresult':{
                if(mirrorSafetyScan[imageName] &&　mirrorSafetyScan[imageName][tag]){
                  loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag})
                  loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name, tag})
                  return
                }
                return loadMirrorSafetyScan({...config}, {
                  success: {
                    func: () =>{
                      loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag})
                      loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name, tag})
                    },
                    isAsync : true
                  }
                })
              }
              case 'different':
              case 'failed':
              default: return false
            }
          }
        },
        isAsync: true
      },
      failed:{
        func: (res) => {
          this.setState({TabsDisabled : true})
          notificationHandler.error('[ '+imageName+ ' ] ' +'镜像的'+ ' [ ' + tag + ' ] ' + formatErrorMessage(res))
        }
      }
    })
  }

  handleSoftwarepackageToLayer(object) {
    if (!object) {
      return
    }
    this.setState({
      ActiveKey: object.ActiveKey.toString(),
      LayerCommandParameters: object.LayerCommandParameters
    })
  }

  handleTabsSwitch(key) {
    this.setState({
      ActiveKey: key,
      inherwidth: key
    })
  }

  handleScanFailed(failed){
    if(failed == 'failed'){
      this.setState({
        TabsDisabled : true
      })
    }
  }

  handleUpgrade(){
    browserHistory.push('/account/version#pro')
  }

  render() {
    const { imgTag, imageName, envEdition, imageType } = this.props
    const { TabsDisabled, LayerCommandParameters } = this.state
    const standard = require('../../../../../configs/constants').STANDARD_MODE
    const mode = require('../../../../../configs/model').mode
    return (
      <div id='mirrorsafety'>
        { (mode === standard && envEdition == 0) ?
          <div className='envEdition'>
            此服务仅支持『专业版』，去查看『新智云|专业版』功能优势
            <Button className='envEditionButton' onClick={this.handleUpgrade}>点击查看</Button>
          </div>:
          <div>
            <div className='safetyselect'>
              <Select showSearch
                className='safetyselectson'
                placeholder='选择镜像版本，查看安全报告'
                value={this.state.tag ? this.state.tag : '选择镜像版本，查看安全报告'}
                onChange={this.handleSelectVesion}
                VersionOption={imgTag}
                optionFilterProp="children"
                notFoundContent="无法找到"
              >
                {this.TemplateSelectOption()}
              </Select>
            </div>
            <div>
              <div className='safetytabcontainer'>
                <div className="safetytabbox">
                  <Tabs onChange={this.handleTabsSwitch} activeKey={ TabsDisabled ? null : this.state.ActiveKey}>
                    <TabPane tab={<span><i className="fa fa-bug safetytabIcon" aria-hidden="true"></i>漏洞扫描</span>} key="1" disabled={this.state.TabsDisabled} >
                      <MirrorSafetyBug imageName={imageName}  tag={this.state.tag} inherwidth={this.state.inherwidth} imageType={imageType} callback={this.handleSoftwarepackageToLayer} scanFailed={this.handleScanFailed} formatErrorMessage={this.props.formatErrorMessage}/>
                    </TabPane>
                    <TabPane tab={<span><i className="fa fa-database safetytabIcon" aria-hidden="true"></i>镜像分层</span>} key="2" disabled={this.state.TabsDisabled}>
                      <MirrorLayered LayerCommandParameters={LayerCommandParameters} imageName={imageName} tag={this.state.tag} />
                    </TabPane>
                    <TabPane tab={<span><i className="fa fa-android safetytabIcon" aria-hidden="true"></i><span className='softspan'>软件包</span></span>} key="3" disabled={this.state.TabsDisabled}>
                      <SoftwarePackage imageName={imageName} tag={this.state.tag} inherwidth={this.state.inherwidth} imageType={imageType} callback={this.handleSoftwarepackageToLayer} scanFailed={this.handleScanFailed} formatErrorMessage={this.props.formatErrorMessage}/>
                    </TabPane>
                    <TabPane tab={<span><i className="fa fa-crosshairs safetytabIcon" aria-hidden="true"></i>基础扫描</span>} key="4" disabled={this.state.TabsDisabled}>
                      <BaseScan imageName={imageName} tag={this.state.tag} imageType={imageType} scanFailed={this.handleScanFailed} formatErrorMessage={this.props.formatErrorMessage}/>
                    </TabPane>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities, getImageTag, images } = state
  const { imageTag } = getImageTag
  const { imageInfo, imageName, imageType } = props
  let imgTag = []
  if (imageTag[DEFAULT_REGISTRY] && imageTag[DEFAULT_REGISTRY][imageName]) {
    imgTag = imageTag[DEFAULT_REGISTRY][imageName].tag || []
  }
  let mirrorScanUrl = ''
  if (images[imageType][DEFAULT_REGISTRY] && images[imageType][DEFAULT_REGISTRY].server) {
    mirrorScanUrl = images[imageType][DEFAULT_REGISTRY].server
  }
  let mirrorSafetyScan = images.mirrorSafetyScan || ''
  let cluster_id = entities.current.cluster.clusterID || ''
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  let mirrorLayeredinfo = images.mirrorSafetyLayerinfo
  let mirrorsafetyClair = images.mirrorSafetyClairinfo
  let mirrorsafetyLyins = images.mirrorSafetyLyinsinfo
  let envEdition = entities.loginUser.info.envEdition || 0
  return {
    cluster_id,
    imageInfo,
    imgTag,
    mirrorLayeredinfo,
    mirrorScanstatus,
    mirrorScanUrl,
    mirrorSafetyScan,
    mirrorsafetyClair,
    mirrorsafetyLyins,
    envEdition
  }
}

export default connect(mapStateToProps, {
  loadMirrorSafetyLayerinfo,
  loadMirrorSafetyLyinsinfo,
  loadMirrorSafetyChairinfo,
  loadMirrorSafetyScan,
  loadMirrorSafetyScanStatus,
  loadImageDetailTag
})(MirrorSafety)