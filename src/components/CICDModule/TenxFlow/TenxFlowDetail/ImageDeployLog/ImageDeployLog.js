/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageDeployLog component
 *
 * v0.1 - 2016-10-24
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Icon, Collapse, Alert } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { deploymentLog } from '../../../../../actions/cicd_flow'
import './style/ImageDeployLog.less'

const Panel = Collapse.Panel;

const menusText = defineMessages({
  title: {
    id: 'CICD.Tenxflow.ImageDeployLog.title',
    defaultMessage: '部署记录',
  },
  tooltip: {
    id: 'CICD.Tenxflow.ImageDeployLog.tooltip',
    defaultMessage: '展示自动部署的记录，包含每次部署时的配置情况，部署完成状态，部署消耗时间',
  },
  name: {
    id: 'CICD.Tenxflow.ImageDeployLog.name',
    defaultMessage: '服务名称',
  },
  config: {
    id: 'CICD.Tenxflow.ImageDeployLog.config',
    defaultMessage: '分支名称',
  },
  cluster: {
    id: 'CICD.Tenxflow.ImageDeployLog.cluster',
    defaultMessage: '所属集群',
  },
  updateType: {
    id: 'CICD.Tenxflow.ImageDeployLog.updateType',
    defaultMessage: '升级方式',
  },
  runningStatus: {
    id: 'CICD.Tenxflow.ImageDeployLog.runningStatus',
    defaultMessage: '运行状态',
  },
  operate: {
    id: 'CICD.Tenxflow.ImageDeployLog.operate',
    defaultMessage: '操作',
  },
  appName: {
    id: 'CICD.Tenxflow.ImageDeployLog.appName',
    defaultMessage: '所属应用',
  },
  cost: {
    id: 'CICD.Tenxflow.ImageDeployLog.cost',
    defaultMessage: '耗时',
  },
  runningNormal: {
    id: 'CICD.Tenxflow.ImageDeployLog.runningNormal',
    defaultMessage: '运行中',
  },
  runningAbnormal: {
    id: 'CICD.Tenxflow.ImageDeployLog.runningAbnormal',
    defaultMessage: '异常',
  },
  success: {
    id: 'CICD.Tenxflow.ImageDeployLog.success',
    defaultMessage: '成功',
  },
  fail: {
    id: 'CICD.Tenxflow.ImageDeployLog.fail',
    defaultMessage: '失败',
  },
  normalUpdate: {
    id: 'CICD.Tenxflow.ImageDeployLog.normalUpdate',
    defaultMessage: '普通升级',
  },
  imageUpdate: {
    id: 'CICD.Tenxflow.ImageDeployLog.imageUpdate',
    defaultMessage: '灰度升级',
  },
})

function checkStatusSpan(status, scope) {
  //this function for user input the status return current words
  const { formatMessage } = scope.props.intl;
  if (status == 1) {
    return formatMessage(menusText.success)
  }
  return formatMessage(menusText.fail)

}

function checkStatusClass(status) {
  if (status == 1) {
    return 'normal'
  }
  return 'fail'
 
}

function checkStatusIcon(status) {
  //this function for user input the status return current className
  if (status == 1) {
    return 'normal fa fa-check-circle';
  }
  return 'fail fa fa-times-circle';
}

function checkRunningStatusSpan(status, scope) {
  //this function for user input the status return current words
  const { formatMessage } = scope.props.intl;
  if (status == 1) {
    return formatMessage(menusText.runningNormal);
  }
  return formatMessage(menusText.runningAbnormal);
}

const MyLine = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  render: function () {
    const { config, scope } = this.props;
    if (!config || config.length ==0)  return (<span></span>)
    let items = config.map((item) => {
      const header = (
        <div className='header'>
          <div className='line'></div>
          <i className={ checkStatusIcon(item.result.status) } />
        </div>
      );
      return (
        <Panel header={header} className='lineDetail' key={item.appName + Math.random()} >
          <div className='line'></div>
        </Panel>
      );
    });
    return (
      <div className='leftBox'>
        <Collapse className='logBoxLine' activeKey={scope.state.activePanel}>
          {items}
        </Collapse>
      </div>
    );
  }
});

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  collapseAction: function (e) {
    //this function for user open or close collapse panel action
    //and then the line collapse will be current change
    const { scope } = this.props;
    scope.setState({
      activePanel: e
    });
  },
  render: function () {
    const { config, scope } = this.props;
    if (!config || config.length ==0) {
      return (
        <div style={{lineHeight:'100px', textAlign:'center'}}>暂无记录</div>
      )
    }
    let items = config.map((item, index) => {
      const header = (
        <div className='header'>
          <span className='name commonHeader'>
            {item.imageName}
          </span>
          <span className='status commonHeader'>
            <span className={ checkStatusClass(item.result.status) }>
              <i className='fa fa-circle' />
              { checkStatusSpan(item.result.status, scope) }
            </span>
          </span>
          <span className='updateTime commonHeader'>
            <i className='fa fa-wpforms' />
            {item.createTime}
          </span>
          <span className='commonHeader'>
            <Icon type='clock-circle-o' />
            <FormattedMessage {...menusText.cost} />&nbsp;
            {item.result.duration}
          </span>
        </div>
      );
      return (
        <Panel header={header} className='LogDetail' key={`${item.appName}+${index}`} >
          <div className='titleBox'>
            <span className='name commonTitle'>
              <FormattedMessage {...menusText.name} />
            </span>
            <span className='commonTitle'>
              <FormattedMessage {...menusText.config} />
            </span>
            <span className='cluster commonTitle'>
              <FormattedMessage {...menusText.cluster} />
            </span>
            <span className='commonTitle'>
              <FormattedMessage {...menusText.updateType} />
            </span>
            <span className='status commonTitle'>
              <FormattedMessage {...menusText.operate} />
            </span>
            <div style={{ clear:'both' }}></div>
          </div>
          <div className='infoBox'>
            <span className='name commonInfo'>
              {item.appName}
            </span>
            <span className='commonInfo version'>
              {item.targetVersion}
            </span>
            <span className='cluster commonInfo'>
              {item.clusterName}
            </span>
            <span className='commonInfo upgrade'>
              {item.upgradeStrategy == '1' ? [<FormattedMessage {...menusText.normalUpdate} />] : [<FormattedMessage {...menusText.imageUpdate} />]}
            </span>
            <span className='status commonInfo'>
              <span className={ checkStatusClass(item.result.status) }>
                <Link to={`/app_manage/service?name=${item.appName}`}>查看服务</Link>
              </span>
            </span>
            <div style={{ clear:'both' }}></div>
          </div>
        </Panel>
      );
    });
    return (
      <div className='rightBox'>
        <Collapse className='logBox' onChange={this.collapseAction}> 
          {items}
        </Collapse>
      </div>
    );
  }
});

class ImageDeployLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: []
    }
  }

  componentWillMount() {
    const {deploymentLog , flowId} = this.props
    deploymentLog(flowId)
  }

  render() {
    const scope = this;
    
    return (
      <div id='ImageDeployLog'>
        <div className='title'>
          <FormattedMessage {...menusText.title} />
        </div>
        <div className='paddingBox'>
          <Alert message={<FormattedMessage {...menusText.tooltip} />} type='info' />
          <MyLine config={this.props.deployList} scope={scope} />
          <MyComponent config={this.props.deployList} scope={scope} />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultConfig = {
    isFetching: false,
    deployList: []
  }
  const {deployLog } = state.cicd_flow
  const {deployList, isFetching} = deployLog || defaultConfig
  return {
    deployList,
    isFetching
  }
}

ImageDeployLog.propTypes = {
  intl: PropTypes.object.isRequired,
  deploymentLog: PropTypes.func.isRequired
}

export default connect(mapStateToProps, {
  deploymentLog
})(injectIntl(ImageDeployLog, {
  withRef: true,
}));

