/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageDetailBox component
 *
 * v0.1 - 2016-10-09
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tabs, Button, Card, Switch, Menu, Tooltip, Icon, Input, Modal, Select } from 'antd'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { imageStore, imageSwitch, loadPublicImageList, loadFavouriteList, loadPrivateImageList, updateImageinfo, getImageDetailInfo, loadImageDetailTag, loadMirrorSafetyScanStatus, loadMirrorSafetyLayerinfo,loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo, loadMirrorSafetyChairinfo } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ImageVersion from './ImageVersion.js'
import DetailInfo from './DetailInfo'
import DockerFile from './Dockerfile'
import Attribute from './Attribute'
import MirrorSafety from './Mirrorsafety'
import './style/ImageDetailBox.less'
import NotificationHandler from '../../../../common/notification_handler'
import UpgradeModal from '../../../AccountModal/Version/UpgradeModal'

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
    this.isSwitch = this.isSwitch.bind(this);
    this.safetyscanShow = this.safetyscanShow.bind(this);
    this.safetyscanhandleOk = this.safetyscanhandleOk.bind(this);
    this.safetyscanhandleCancel = this.safetyscanhandleCancel.bind(this);
    this.TemplateSafetyScan = this.TemplateSafetyScan.bind(this)
    this.handleTabsSwitch = this.handleTabsSwitch.bind(this)
    this.handelSelectedOption = this.handelSelectedOption.bind(this)
    //this.TemplateTabPaneMirrorsafety = this.TemplateTabPaneMirrorsafety.bind(this)
    this.formatErrorMessage = this.formatErrorMessage.bind(this)
    this.state = {
      imageDetail: null,
      copySuccess: false,
      editInfo: false,
      safetyscanVisible: false,
      activeKey: '1',
      disable: true,
      tagVersion: '',
      tag: '',
      UpgradeVisible:false,
      tabledisabled:true,
      safetyscanLoading:false,
    }
  }

  componentWillMount() {
    const imageDetail = this.props.config;
    const imageInfo = this.props.imageInfo
    const { registry, loadImageDetailTag } = this.props
    const imageName = imageDetail.name
    loadImageDetailTag(registry, imageName)
    this.setState({
      imageDetail: imageDetail,
      imageInfo: imageInfo,
      TabsDisabled: true
    });
  }

  componentWillReceiveProps(nextProps) {
    //this function for user select different image
    //the nextProps is mean new props, and the this.props didn't change
    //so that we should use the nextProps
    const imageName = this.props.imageName
    const imageNameNext = nextProps.imageName
    let activekeyNext = '1'
    if (imageName == imageNameNext) {
      activekeyNext = this.state.activeKey
    }
    this.setState({
      nextPorps: nextProps.imageInfo,
      imageDetail: nextProps.config,
      activeKey:activekeyNext
    });
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

  //TemplateTabPaneMirrorsafety() {
  //  const { envEdition, imageInfo, imageType } = this.props
  //  const { formatMessage } = this.props.intl;
  //  const standard = require('../../../../../configs/constants').STANDARD_MODE
  //  const mode = require('../../../../../configs/model').mode
  //  if (mode === standard) {
  //    // standard mode
  //    if(envEdition == 0){
  //      return
  //    }
  //    if(envEdition == 1){
  //      return <TabPane tab={formatMessage(menusText.mirrorSafety)} key="5"><MirrorSafety imageName={imageInfo.name} registry={DEFAULT_REGISTRY} tagVersion={this.state.tag} imageType={imageType}/></TabPane>
  //    }
  //  } else {
  //    return <TabPane tab={formatMessage(menusText.mirrorSafety)} key="5"><MirrorSafety imageName={imageInfo.name} registry={DEFAULT_REGISTRY} tagVersion={this.state.tag} imageType={imageType}/></TabPane>
  //  }
  //}

  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  }
  // callback(key) {
  //   if (key == 2) {
  //     this.props.getImageDetailInfo(DEFAULT_REGISTRY, this.props.config.name)
  //   }
  // }
  setimageStore(image, favourite) {
    // let isPrivate = this.props.imageInfo.isPrivate;
    const config = {
      isFavourite: favourite,
      registry: DEFAULT_REGISTRY,
      // isPrivate,
      image
    }
    const scope = this
    const imageSpace = this.props.parentScope.state.current
    let notification = new NotificationHandler()
    this.props.imageStore(config, {
      success: {
        func: () => {
          if(favourite == 0){
            notification.success('取消收藏！')
            scope.props.loadFavouriteList(DEFAULT_REGISTRY)
            return
          }
          if(favourite == 1){
            notification.success('收藏成功！')
            scope.props.loadFavouriteList(DEFAULT_REGISTRY)
            return
          }
        },
        isAsync: true
      }
    })
  }
  isSwitch(key) {
    let isPrivate = this.props.imageInfo.isPrivate;
    let image = this.state.imageDetail.name
    // const favourite = this.state.imageDetail.isFavourite
    const imageSpace = this.props.parentScope.state.current

    key ? isPrivate = 0 : isPrivate = 1
    const config = {
      isPrivate,
      registry: DEFAULT_REGISTRY,
      image,
      // myfavourite: favourite,
    }
    const scope = this
    let notification = new NotificationHandler()
    this.props.imageSwitch(config, {
      success: {
        func: () => {
          notification.success('更新成功！')
          switch (imageSpace) {
            case 'imageSpace':
              scope.props.loadPrivateImageList(DEFAULT_REGISTRY)
              break
            case 'publicSpace':
              scope.props.loadPublicImageList(DEFAULT_REGISTRY)
              break
            default:
              scope.props.loadPrivateImageList(DEFAULT_REGISTRY)
          }
        },
        isAsync: true
      }
    })
  }
  handChangeInfo() {
    const image = this.props.imageInfo.name
    let notification = new NotificationHandler()
    const desc = document.getElementById('editInfo').value
    if (desc == '') {
      notification.info('请输入描述内容')
      return
    }
    const config = {
      image,
      fullName: image,
      registry: this.props.registry,
      body: { description: desc }
    }
    const { getImageDetailInfo } = this.props
    const _this = this
    this.props.updateImageinfo(config, {
      success: {
        func: () => {
          notification.success('更新成功！')
          getImageDetailInfo(config)
          _this.setState({ editInfo: false })
        },
        isAsync: true
      }
    })
  }
  imageDescription(imageInfo) {
    if (this.state.editInfo) {
      return (
        <div>
          <Input type="textarea" id="editInfo" className="imagedescription" />
          <FormattedMessage {...menusText.type} />
          <Switch checked={(imageInfo.isPrivate == 0) ? true : false} disabled={!imageInfo.isOwner} defaultChecked="true" checkedChildren={<FormattedMessage {...menusText.pubilicType} />} unCheckedChildren={<FormattedMessage {...menusText.privateType} />} />
          <span style={{ float: 'right' }}>
            <Button onClick={() => this.setState({ editInfo: false })}>取消</Button>
            <Button onClick={() => this.handChangeInfo()} type="primary">保存</Button>
          </span>
        </div>
      )
    }
    return (
      <div>
        <Input type="textarea" disabled={true} className="imagedescription" value={imageInfo.description} />
        <div>
          <FormattedMessage {...menusText.type} />
          <Switch onChange={this.isSwitch} checked={(imageInfo.isPrivate == 0) ? true : false} disabled={!imageInfo.isOwner} checkedChildren={<FormattedMessage {...menusText.pubilicType } />} unCheckedChildren={<FormattedMessage {...menusText.privateType} />} />
          {imageInfo.isOwner ?
            <Button icon="edit" style={{ float: 'right' }} onClick={() => this.setState({ editInfo: true })}>编辑</Button>
            : null
          }
        </div>
      </div>
    )

  }

  safetyscanShow() {
    this.setState({
      safetyscanVisible: true,
      tagVersion : ''
    })
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
            disable: false,
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

  formatErrorMessage(body) {
    const mapping = {
      'jobalreadyexist': '版本已经触发扫描，请稍后再试！',
      'no non-empty layer': "版本为空镜像，无法对空镜像进行扫描",
      "The connection could not be established": '版本无法连接到安全服务',
    }
    const message = body.message
    if (!(message in mapping)) {
      return JSON.stringify(message)
    }
    return mapping[message]
  }

  handleTabsSwitch(key) {
    this.setState({
      activeKey: key.toString()
    })
  }

  handelSelectedOption(tag) {
    this.setState({
      disable: false,
      tagVersion: tag
    })
  }
  safetyscanhandleCancel() {
    this.setState({
      safetyscanVisible: false
    })
  }

  render() {
    const { formatMessage } = this.props.intl;
    const imageDetailModalShow = this.props.imageDetailModalShow
    const imageInfo = this.props.imageInfo;
    const { imageType, UpgradeVisible } = this.props
    if (!imageInfo) {
      return ('')
    }
    const imageDetail = this.props.config;
    const scope = this;
    const ipAddress = this.props.server;
    const imageName = this.state.imageDetail.name;
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
              {(imageInfo.isFavourite == 1) ?
                <Tooltip title="取消收藏"><i className="fa fa-star cursor" aria-hidden="true" style={{ marginLeft: '10px' }} onClick={() => this.setimageStore(imageInfo.name, '0')}></i></Tooltip>
                :
                <Tooltip title="点击收藏">
                <i className="fa fa-star-o cursor" aria-hidden="true" style={{ marginLeft: '10px', color: '#2db7f5' }} onClick={() => this.setimageStore(imageInfo.name, '1')}></i></Tooltip>
              }
            </p>
            <div className="leftBox">

              {this.imageDescription(imageInfo)}

              {/*<span className="type">
                <FormattedMessage {...menusText.type} />
                {(imageInfo.isOwner) ?
                  <Switch onChange={this.isSwitch} checked={(imageInfo.isPrivate == 0) ? true : false} checkedChildren={formatMessage(menusText.pubilicType)} unCheckedChildren={formatMessage(menusText.privateType)} />
                  :
                  <Switch checked={(imageInfo.isPrivate == 0) ? true : false} disabled={true} defaultChecked="true" checkedChildren={formatMessage(menusText.pubilicType)} unCheckedChildren={formatMessage(menusText.privateType)} />
                }
              </span>*/}
            </div>
            <div className="rightBox">
              <Icon type='cross' className='cursor' style={{ fontSize: '18px', position: 'absolute', top: '0px', right: '0px' }} onClick={this.props.scope.closeImageDetailModal} />
              <div className='rightBoxleft'>
                <Button size="large" type="primary" onClick={() => browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${ipAddress}&imageName=${imageName}`)}>
                  <FormattedMessage {...menusText.deployImage} />
                </Button>
              </div>

              <div className='rightBoxright'>
                <Button type="ghost" size="large" onClick={this.safetyscanShow}>安全扫描</Button>
                <Modal title="安全扫描" visible={this.state.safetyscanVisible} closable={true}
                  onCancel={this.safetyscanhandleCancel}
                  confirmLoading={true}
                  footer={[
                    <Button
                      key="back"
                      type="ghost"
                      size="large"
                      onClick={this.safetyscanhandleCancel}>
                      取 消
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      size="large"
                      loading={this.state.safetyscanLoading}
                      disabled={this.state.disable}
                      onClick={this.safetyscanhandleOk}>
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
              <UpgradeModal visible={UpgradeVisible} />
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
            {imageDetail.downloadNumber}
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="tabBox">
          <Tabs className="itemList" activeKey={this.state.activeKey} onChange={this.handleTabsSwitch}>
            <TabPane tab={formatMessage(menusText.info)} key="1"><DetailInfo scope={this} registry={DEFAULT_REGISTRY} detailInfo={imageInfo} isOwner={imageInfo.isOwner} /></TabPane>
            <TabPane tab="Dockerfile" key="2"><DockerFile isFetching={this.props.isFetching} scope={this} registry={DEFAULT_REGISTRY} detailInfo={imageInfo} isOwner={imageInfo.isOwner} /></TabPane>
            <TabPane tab={formatMessage(menusText.tag)} key="3"><ImageVersion scope={scope} config={imageDetail} /></TabPane>
            <TabPane tab={formatMessage(menusText.attribute)} key="4"><Attribute detailInfo={imageInfo} /></TabPane>
            <TabPane tab={formatMessage(menusText.mirrorSafety)} key="5"><MirrorSafety imageName={imageInfo.name} registry={DEFAULT_REGISTRY} tagVersion={this.state.tag} imageType={imageType} tabledisabled={this.state.tabledisabled} formatErrorMessage={this.formatErrorMessage}/></TabPane>
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
    isFavourite: 0,
    isFetching: false,
    registry: DEFAULT_REGISTRY
  }
  const { imagesInfo } = state.images
  const { imageInfo } = imagesInfo[DEFAULT_REGISTRY] || defaultConfig
  const imageName = imageInfo.name
  const { getImageTag, entities, images } = state
  const { imageType } = props
  const { imageTag } = getImageTag
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
  let envEdition = entities.loginUser.info.envEdition || 0
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  return {
    imageInfo,
    registry: DEFAULT_REGISTRY,
    imageName,
    envEdition,
    imgTag,
    mirrorSafetyScan,
    cluster_id,
    mirrorScanUrl,
    mirrorScanstatus
  }
}

// function mapDispatchToProps(dispatch) {
//   return {
//     imageStore: (obj, callback) => {
//       dispatch(imageStore(obj, callback))
//     },
//     imageSwitch: (obj, callback) => {
//       dispatch(imageSwitch(obj, callback))
//     },
//     loadPrivateImageList: (DEFAULT_REGISTRY) => {
//       dispatch(loadPrivateImageList(DEFAULT_REGISTRY))
//     },
//     loadPublicImageList: (registry) => {
//       dispatch(loadPublicImageList(registry))
//     },
//     loadFavouriteList: (registry) =>{
//       dispatch(loadFavouriteList(registry))
//     }
//   }
// }

export default connect(mapStateToProps, {
  imageStore,
  imageSwitch,
  loadPrivateImageList,
  loadPublicImageList,
  loadFavouriteList,
  updateImageinfo,
  getImageDetailInfo,
  loadImageDetailTag,
  loadMirrorSafetyScanStatus,
  loadMirrorSafetyLayerinfo,
  loadMirrorSafetyScan,
  loadMirrorSafetyLyinsinfo,
  loadMirrorSafetyChairinfo
})(injectIntl(ImageDetailBox, {
  withRef: true,
}));