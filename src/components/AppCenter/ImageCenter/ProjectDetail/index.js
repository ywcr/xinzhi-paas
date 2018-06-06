/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageDetailBox component
 *
 * v0.1 - 2017-6-09
 * @author BaiYu
 */
import React, { Component, PropTypes } from 'react'
import { Tabs, Button, Card, Switch, Menu, Tooltip, Icon, Input, Modal, Select } from 'antd'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { imageStore, imageSwitch, loadPublicImageList, loadFavouriteList, loadPrivateImageList, updateImageinfo, getImageDetailInfo, loadMirrorSafetyScanStatus, loadMirrorSafetyLayerinfo,loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo, loadMirrorSafetyChairinfo } from '../../../../actions/app_center'
import { loadRepositoriesTags } from '../../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ImageVersion from './ImageVersion'
// import DockerFile from './Dockerfile'
import Attribute from './Attribute'
import MirrorSafety from './Mirrorsafety'
import './style/ImageDetailBox.less'
import NotificationHandler from '../../../../common/notification_handler'
import { camelize } from 'humps'

const TabPane = Tabs.TabPane;
const Option = Select.Option;

const menusText = defineMessages({
  type: {
    id: 'AppCenter.ImageCenter.ImageDetail.type',
    defaultMessage: '类型：',
  },
  pubilicType: {
    id: 'AppCenter.ImageCenter.ImageDetail.pubilicType',
    defaultMessage: '公开',
  },
  privateType: {
    id: 'AppCenter.ImageCenter.ImageDetail.privateType',
    defaultMessage: ' 私有',
  },
  colletctImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.colletctImage',
    defaultMessage: '收藏镜像',
  },
  closeImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.closeImage',
    defaultMessage: '取消收藏',
  },
  deployImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.deployService',
    defaultMessage: '部署镜像',
  },
  downloadImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.downloadImage',
    defaultMessage: '下载镜像',
  },
  info: {
    id: 'AppCenter.ImageCenter.ImageDetail.info',
    defaultMessage: '基本信息',
  },
  tag: {
    id: 'AppCenter.ImageCenter.ImageDetail.tag',
    defaultMessage: '版本及接口',
  },
  attribute: {
    id: 'AppCenter.ImageCenter.ImageDetail.attribute',
    defaultMessage: '属性',
  },
  mirrorSafety: {
    id: 'AppCenter.ImageCenter.ImageDetail.mirrorSafety',
    defaultMessage: '镜像安全',
  },
  copyBtn: {
    id: 'AppCenter.ImageCenter.ImageDetail.copyBtn',
    defaultMessage: '点击复制',
  },
  copySuccess: {
    id: 'AppCenter.ImageCenter.ImageDetail.copySuccess',
    defaultMessage: '复制成功',
  }
})

class ImageDetailBox extends Component {
  constructor(props) {
    super(props);
    this.copyDownloadCode = this.copyDownloadCode.bind(this);
    this.returnDefaultTooltip = this.returnDefaultTooltip.bind(this);
    this.handleTabsSwitch = this.handleTabsSwitch.bind(this)
    this.safetyscanShow = this.safetyscanShow.bind(this)
    // this.isSwitch = this.isSwitch.bind(this);
    this.handelSelectedOption = this.handelSelectedOption.bind(this)
    // this.formatErrorMessage = this.formatErrorMessage.bind(this)
    //this.TemplateTabPaneMirrorsafety = this.TemplateTabPaneMirrorsafety.bind(this)
    this.state = {
      imageDetail: null,
      copySuccess: false,
      editInfo: false,
      activeKey: 'tag',
      disable: true,
      tagVersion: '',
      tag: '',
      UpgradeVisible:false,
      tabledisabled:true,
      safetyscanVisible:false,
    }
  }

  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("privateCodeInput");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  }


  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  }
  safetyscanhandleOk() {
    const { loadMirrorSafetyScanStatus, loadMirrorSafetyLayerinfo, loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo, loadMirrorSafetyChairinfo, cluster_id, mirrorSafetyScan, mirrorScanUrl } = this.props
    const imageDetail = this.props.config
    const imageName = imageDetail.name
    const tag = this.state.tagVersion
    const notificationHandler = new NotificationHandler()
    this.setState({safetyscanLoading : true})
    loadMirrorSafetyScanStatus({ imageName, tag },{
      success: {
        func: () => {
          loadMirrorSafetyLayerinfo({ imageName, tag })
          this.setState({
            TabsDisabled: false,
            safetyscanVisible: false,
            activeKey: '5',
            disable: true,
            tag: this.state.tagVersion,
            safetyscanLoading:false
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
                if(mirrorSafetyScan[imageName] && mirrorSafetyScan[imageName][tag]){
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
          if(res.statusCode == 412){
            this.setState({
              safetyscanVisible:false,
              safetyscanLoading:false,
            })
            return
          }
          notificationHandler.error('['+imageName+ ']' +'镜像的'+ '[' + tag + ']' + this.formatErrorMessage(res))
          this.setState({
            safetyscanVisible:false,
            safetyscanLoading:false,
          })
        },
        isAsync : true
      }
    })
  }
  safetyscanShow() {
    this.setState({
      safetyscanVisible: true,
      tagVersion : ''
    })
  }
  handleTabsSwitch(key) {
    this.setState({
      activeKey: key.toString()
    })
  }
  TemplateSafetyScan() {
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
  safetyscanhandleCancel() {
    this.setState({safetyscanVisible: false,disable:false})
  }
  handelSelectedOption(tag) {
    this.setState({
      disable: false,
      tagVersion: tag
    })
  }


  render() {
    const { formatMessage } = this.props.intl;
    const imageInfo = this.props.config;
    const { imageType, UpgradeVisible } = this.props
    if (!imageInfo) {
      return ('')
    }
    const imageDetail = this.props.config;
    const scope = this;
    const ipAddress = this.props.server;
    const imageName = imageDetail.name;
    let pullCode = "docker pull " + ipAddress + "/" + imageName;
    return (
      <div id="ImageDetailBox">
        <div className="headerBox">
          <div className="imgBox">
            <svg className='appcenterlogo'>
              <use xlinkHref='#appcenterlogo' />
            </svg>
          </div>
          <div className="infoBox">
            <p className="imageName">
              {imageDetail.name ? imageDetail.name : imageDetail.imageName}
            </p>
            <div className="textareas">
              {imageInfo.description}
              {/*{this.imageDescription(imageInfo)}*/}

            </div>
            <div className="rightBox">
              <Icon type='cross' className='cursor' style={{ fontSize: '18px', position: 'absolute', top: '0px', right: '0px' }} onClick={this.props.scope.closeImageDetailModal} />
              <div className='rightBoxleft'>
                <Button size="large" type="primary" onClick={() => browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${ipAddress}&imageName=${imageName}`)}>
                  <FormattedMessage {...menusText.deployImage} />
                </Button>
              </div>
              {/* 说扫描 */}
              <div className='rightBoxright'>
                <Button type="ghost" size="large" onClick={this.safetyscanShow}>安全扫描</Button>
                <Modal title="安全扫描" visible={this.state.safetyscanVisible} closable={true}
                  onCancel={()=> this.safetyscanhandleCancel()}
                  confirmLoading={true}
                  footer={[
                    <Button
                      key="back"
                      type="ghost"
                      size="large"
                      onClick={()=> this.safetyscanhandleCancel()}>
                      取 消
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      size="large"
                      loading={this.state.safetyscanLoading}
                      disabled={this.state.disable}
                      onClick={()=> this.safetyscanhandleOk()}>
                      确 定
                    </Button>,
                  ]}>
                  <div>
                    <span style={{ marginRight: '30px' }}>镜像版本</span>
                    <Select
                      showSearch
                      style={{ width: '322px' }}
                      notFoundContent="镜像未找到"
                      placeholder='请选择镜像版本，查看安全报告'
                      value={this.state.tagVersion ? this.state.tagVersion : '请选择镜像版本，查看安全报告'}
                      allowClear={true}
                      confirmLoading={true}
                      onChange={this.handelSelectedOption}
                    >
                      {this.TemplateSafetyScan()}
                    </Select>
                  </div>
                </Modal>
              </div>
            </div>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="downloadBox">
          <div className="code">
            <svg className='appcenterdownload' >
              <use xlinkHref='#appcenterdownload' />
            </svg>
            <FormattedMessage {...menusText.downloadImage} />&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="pullCode textoverflow">docker pull {this.props.server}/{imageName}&nbsp;&nbsp;</span>
            <Tooltip title={this.state.copySuccess ? formatMessage(menusText.copySuccess) : formatMessage(menusText.copyBtn)}>
              <svg className='appcentercopy' onClick={this.copyDownloadCode} onMouseLeave={this.returnDefaultTooltip}>
                <use xlinkHref='#appcentercopy' />
              </svg>
            </Tooltip>
            <input className="privateCodeInput" value={pullCode} style={{ position: "absolute", opacity: "0" }} />
          </div>
          <div className="times">
            <svg className='appcenterdownload' >
              <use xlinkHref='#appcenterdownload' />
            </svg>
            {imageDetail[camelize('pull_count')]}
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="tabBox">
          <Tabs className="itemList" activeKey={this.state.activeKey} onChange={this.handleTabsSwitch}>
            <TabPane tab={formatMessage(menusText.tag)} key="tag"><ImageVersion scope={scope} config={imageDetail} /></TabPane>
            <TabPane tab={formatMessage(menusText.attribute)} key="attr"><Attribute params={this.props.params} detailInfo={imageInfo} /></TabPane>
            <TabPane tab={formatMessage(menusText.mirrorSafety)} key="5"><MirrorSafety imageName={imageInfo.name} imageType="publicImages" registry={DEFAULT_REGISTRY} tagVersion={this.state.tag} tabledisabled={this.state.tabledisabled} /></TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}

ImageDetailBox.propTypes = {
  intl: PropTypes.object.isRequired,
}
function mapStateToProps(state, props) {
  const defaultConfig = {
    isFetching: false,
    registry: DEFAULT_REGISTRY
  }
  const { imagesInfo } = state.images
  const { imageInfo } = imagesInfo[DEFAULT_REGISTRY] || defaultConfig
  const imageName = props.config.name
  const { getImageTag, entities, images } = state
  let imageType  = props.imageType || 'privateImages'
  const { imageTags } = state.harbor
  let imgTag = []
  if (imageTags[DEFAULT_REGISTRY] && imageTags[DEFAULT_REGISTRY][imageName]) {
    imgTag = imageTags[DEFAULT_REGISTRY][imageName].tag || []
  }
  let mirrorScanUrl = ''
  if (images[imageType][DEFAULT_REGISTRY] && images[imageType][DEFAULT_REGISTRY].server) {
    mirrorScanUrl = images[imageType][DEFAULT_REGISTRY].server
  }

  let mirrorSafetyScan = images.mirrorSafetyScan || ''
  let cluster_id = entities.current.cluster.clusterID || ''
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  return {
    imageInfo,
    registry: DEFAULT_REGISTRY,
    imageName,
    imgTag,
    mirrorSafetyScan,
    cluster_id,
    mirrorScanUrl,
    mirrorScanstatus
  }
}


export default connect(mapStateToProps, {
  imageStore,
  imageSwitch,
  loadPrivateImageList,
  loadPublicImageList,
  loadFavouriteList,
  updateImageinfo,
  getImageDetailInfo,
  loadRepositoriesTags,
  loadMirrorSafetyScanStatus,
  loadMirrorSafetyLayerinfo,
  loadMirrorSafetyScan,
  loadMirrorSafetyLyinsinfo,
  loadMirrorSafetyChairinfo
})(injectIntl(ImageDetailBox, {
  withRef: true,
}));