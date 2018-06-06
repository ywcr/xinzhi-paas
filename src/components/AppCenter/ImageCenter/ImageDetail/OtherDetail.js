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
import { Tabs, Button, Card, Menu, Tooltip ,Icon} from 'antd'
import { Link, browserHistory} from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ImageVersion from './ImageVersion.js'
import './style/ImageDetailBox.less'

const TabPane = Tabs.TabPane;

const menusText = defineMessages({

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
  copyBtn: {
    id: 'AppCenter.ImageCenter.ImageDetail.copyBtn',
    defaultMessage: '点击复制',
  },
  copySuccess: {
    id: 'AppCenter.ImageCenter.ImageDetail.copySuccess',
    defaultMessage: '复制成功',
  }
})

class OtherDetail extends Component {
  constructor(props) {
    super(props);
    this.copyDownloadCode = this.copyDownloadCode.bind(this);
    this.returnDefaultTooltip = this.returnDefaultTooltip.bind(this);
    this.state = {
      imageDetail: null,
      copySuccess: false
    }
  }

  componentWillMount() {
    const imageDetail = this.props.config;
    const imageInfo = ''
    this.setState({
      imageDetail: imageDetail,
      imageInfo: ''
    });
  }

  componentWillReceiveProps(nextPorps) {
    //this function for user select different image
    //the nextProps is mean new props, and the this.props didn't change
    //so that we should use the nextProps
    this.setState({
      imageDetail: nextPorps.config
    });
  }

  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("pullCodeInput");
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

  render() {
    const { formatMessage } = this.props.intl;
    const imageDetail = this.props.config
    const imageInfo = ''
    // const ipAddress = this.props.scope.props.otherHead;
    const ipAddress = (this.props.server).split('//')[1]
    let pullCode = "docker pull " + ipAddress + "/" + imageDetail;
    return (
      <div id="ImageDetailBox">
        <div className="headerBox">
          <div className="imgBox">
            <svg className='appcenterlogo'>
              <use xlinkHref='#appcenterlogo' />
            </svg>
          </div>
          <div className="infoBox">
            <p className="imageName">{imageDetail}</p>
            <div className="rightBox">
              <Icon type='cross' className='cursor' style={{fontSize: '18px',position: 'absolute', top:'0px', right:'0px'}} onClick={this.props.scope.closeImageDetailModal} />
              <Button size="large" type="primary" onClick={()=> browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${ipAddress}&imageName=${imageDetail}&other=${this.props.imageId}`)}>
                <FormattedMessage {...menusText.deployImage} />
              </Button>
            </div>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="downloadBox">
          <div className="code">
            <i className="fa fa-download"></i>&nbsp;
          <FormattedMessage {...menusText.downloadImage} />&nbsp;&nbsp;&nbsp;&nbsp;
           <span className="pullCode textoverflow">docker pull {ipAddress}/{imageDetail}&nbsp;&nbsp;</span>
            <Tooltip title={this.state.copySuccess ? formatMessage(menusText.copySuccess) : formatMessage(menusText.copyBtn)}>
              <i className="fa fa-copy" onClick={this.copyDownloadCode} onMouseLeave={this.returnDefaultTooltip}></i>
            </Tooltip>
            <input className="pullCodeInput" defaultValue={pullCode} style={{ position: "absolute", opacity: "0" }} />
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="tabBox">
          <Tabs className="itemList" defaultActiveKey="1">
            <TabPane tab={formatMessage(menusText.tag)} key="1"><ImageVersion imageId={this.props.imageId} config={imageDetail} /></TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}

OtherDetail.propTypes = {
  intl: PropTypes.object.isRequired,
}

// function mapStateToProps(state, props) {
//   const defaultConfig = {
//     isFavourite:'0',
//     isFetching: false,
//     registry: DEFAULT_REGISTRY
//   }
//   const {imagesInfo } = state.images
//   const { imageInfo } = imagesInfo[DEFAULT_REGISTRY] || defaultConfig

//   return {
//     isFavourite: imageInfo.isFavourite
//   }
// }

// function mapDispatchToProps(dispatch) {
//   return {
//     imageStore: (name, callback) => {
//       dispatch(imageStore(name, callback))
//     },
//   }
// }

export default connect()(injectIntl(OtherDetail, {
  withRef: true,
}));