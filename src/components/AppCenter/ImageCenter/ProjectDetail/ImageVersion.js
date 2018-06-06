/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageVersion component
 *
 * v0.1 - 2017-6-8
 * @author BaiYu
 */
import React, { Component } from 'react'
import { Card, Spin, Tabs } from 'antd'
import { connect } from 'react-redux'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ServiceAPI from './ServiceAPI.js'
import './style/ImageVersion.less'
import { loadRepositoriesTags } from '../../../../actions/harbor'

const TabPane = Tabs.TabPane;

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      currentTag: null
    };
  },
  render() {
    const { loading } = this.props;
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let tagList = this.props.config
    if (!tagList || tagList.length ==0) {
      return (
        <div>镜像版本不存在</div>
      )
    }
    const fullname = this.props.fullname
    let items = tagList.map((item, index) => {
      return (
        <TabPane tab={<span><i className="fa fa-tag"></i>&nbsp;{item}</span>} className="imageDetail" key={`${item}@${index}`} >
          <ServiceAPI imageTags={item} fullname={fullname} />
        </TabPane>
      )
    })

    return (
      <Tabs>
        {items}
      </Tabs>
    )
  }
})

class ImageVersion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageDetail: null,
    }
  }

  componentWillMount() {
    const { loadRepositoriesTags, loadRepositoriesTagConfigInfo } = this.props
    const imageDetail = this.props.config
    let processedName = processImageName(imageDetail.name)
    loadRepositoriesTags(DEFAULT_REGISTRY, processedName)
  }

  componentWillReceiveProps(nextPorps) {
    //this function mean when the user change show image detail
    //it will be check the old iamge is different from the new one or not
    //if the different is true,so that the function will be request the new one's tag
    const oldImageDatail = this.props.config;
    const newImageDetail = nextPorps.config;
    const { loadRepositoriesTags } = this.props
    if (newImageDetail.name != oldImageDatail.name) {
      let processedName = processImageName(newImageDetail.name)
      loadRepositoriesTags(DEFAULT_REGISTRY, processedName)
    }
  }


  render() {
    const { isFetching, imageDetailTag } = this.props;
    const imageDetail = this.props.config;
    return (
      <Card className="ImageVersion">
        <MyComponent loading={isFetching} config={imageDetailTag} fullname={imageDetail.name ? imageDetail.name : imageDetail} />
      </Card>
    )
  }
}

function processImageName(name) {
  let arr = name.split('/')
  if (arr.length > 2) {
    name = arr[0] + '/' + arr[1]
    for (let i = 2; i < arr.length; i++) {
      name += "%2F"

      name += arr[i]
    }
  }
  return name
}

function mapStateToProps(state, props) {
  const defaultImageDetailTag = {
    isFetching: false,
    server: '',
    tag: [],
  }
  const { imageTags } = state.harbor
  let processedName = processImageName(props.config.name)
  let targetImageTag = {}
  if (imageTags[DEFAULT_REGISTRY]) {
    targetImageTag = imageTags[DEFAULT_REGISTRY][processedName] || {}
  }
  const { tag, server } = targetImageTag || defaultImageDetailTag
  return {
    imageDetailTag: tag,
    isFetching: targetImageTag.isFetching
  }
}


export default connect(mapStateToProps, {
  loadRepositoriesTags
})(ImageVersion);