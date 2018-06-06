/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageDeployLogBox component
 *
 * v0.1 - 2016-10-24
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import AutoDeployService from './ImageDeployLog/AutoDeployService.js'
import ImageDeployLog from './ImageDeployLog/ImageDeployLog.js'
import './style/ImageDeployLogBox.less'

const menusText = defineMessages({
  search: {
    id: 'CICD.Tenxflow.ImageDeployLogBox.search',
    defaultMessage: '搜索',
  },
  name: {
    id: 'CICD.Tenxflow.ImageDeployLogBox.name',
    defaultMessage: '名称',
  },
  updateTime: {
    id: 'CICD.Tenxflow.ImageDeployLogBox.updateTime',
    defaultMessage: '更新时间',
  },
  status: {
    id: 'CICD.Tenxflow.ImageDeployLogBox.status',
    defaultMessage: '构建状态',
  },
  opera: {
    id: 'CICD.Tenxflow.ImageDeployLogBox.opera',
    defaultMessage: '操作',
  },
  tooltips: {
    id: 'CICD.Tenxflow.ImageDeployLogBox.tooltips',
    defaultMessage: 'EnnFlow：这里完成【代码项目构建、测试】等流程的定义与执行，可以实现若干个（≥1）项目组成的一个Flow，由若干个项目流程化完成一个Flow，直至完成整个总项目，其中大部分流程以生成应用镜像为结束标志。',
  },
  create: {
    id: 'CICD.Tenxflow.ImageDeployLogBox.create',
    defaultMessage: '创建EnnFlow',
  },
  deloyLog: {
    id: 'CICD.Tenxflow.ImageDeployLogBox.deloyLog',
    defaultMessage: '构建记录',
  },
  deloyStart: {
    id: 'CICD.Tenxflow.ImageDeployLogBox.deloyStart',
    defaultMessage: '立即构建',
  },
  checkImage: {
    id: 'CICD.Tenxflow.ImageDeployLogBox.checkImage',
    defaultMessage: '查看镜像',
  },
  delete: {
    id: 'CICD.Tenxflow.ImageDeployLogBox.delete',
    defaultMessage: '删除EnnFlow',
  },
});

class ImageDeployLogBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  
  componentWillMount() {
  }

  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    return (
      <Card id='ImageDeployLogBox' >
        <AutoDeployService scope={scope} flowId={this.props.flowId}/>
        <ImageDeployLog scope={scope} flowId={this.props.flowId}/>
      </Card>
    )
  }
}

function mapStateToProps(state, props) {
  
  return {
    
  }
}

ImageDeployLogBox.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  
})(injectIntl(ImageDeployLogBox, {
  withRef: true,
}));

