/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFLowDetailLog component
 *
 * v0.1 - 2016-10-24
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Card, Dropdown, Spin, Menu, Icon, Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { getTenxflowBuildLogs, getTenxflowBuildDetailLogs, getTenxflowBuildLastLogs, changeBuildStatus } from '../../../../actions/cicd_flow'
import moment from 'moment'
import './style/TenxFLowDetailLog.less'
import TenxFlowBuildLog from '../TenxFlowBuildLog'
import Title from '../../../Title'

const menusText = defineMessages({
  bulidLog: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.bulidLog',
    defaultMessage: '执行记录',
  },
  downLoadBulidLog: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.downLoadBulidLog',
    defaultMessage: '下载执行记录',
  },
  viewBulidLog: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.viewBulidLog',
    defaultMessage: '查看执行记录',
  },
  cost: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.cost',
    defaultMessage: '耗时',
  },
  normal: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.normal',
    defaultMessage: '执行成功',
  },
  fail: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.fail',
    defaultMessage: '执行失败',
  },
  msShow: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.msShow',
    defaultMessage: '毫秒',
  },
  sShow: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.sShow',
    defaultMessage: '秒',
  },
  mShow: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.mShow',
    defaultMessage: '分钟',
  },
  hShow: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.hShow',
    defaultMessage: '小时',
  },
  running: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.running',
    defaultMessage: '运行中',
  },
  wait: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.wait',
    defaultMessage: '等待',
  },
})

function checkStatusSpan(status, scope) {
  //this function for user input the status return current words
  const { formatMessage } = scope.props.intl;
  switch(status) {
    case 0:
      return formatMessage(menusText.normal);
    case 1:
      return formatMessage(menusText.fail);
    case 2:
      return formatMessage(menusText.running);
    case 3:
      return formatMessage(menusText.wait);
    default:
      return formatMessage(menusText.normal);
  }
}

function checkStatusClass(status) {
  //this function for user input the status return current className
  switch(status) {
    case 0:
      return 'normal';
    case 1:
      return 'fail';
    case 2:
      return 'runing';
    case 3:
      return 'wait';
  }
}

function dateFormat(dateString) {
  if (!dateString) {
    return '';
  }
  var timeStr = moment(dateString);
  return timeStr.format("YYYY-MM-DD HH:mm:ss")
}

function dateSizeFormat(startTime, endTime, scope) {
  //this function for user get the flow building time
  const { formatMessage } = scope.props.intl;
  if(!Boolean(endTime)) {
    return (<span>{formatMessage(menusText.running)}</span>)
  }
  let newStart = new Date(Date.parse(startTime.replace('T', ' ').replace(/-/g, '/').split('.')[0]));
  let newEnd = new Date(Date.parse(endTime.replace('T', ' ').replace(/-/g, '/').split('.')[0]));
  let timeSize = newEnd.getTime() - newStart.getTime();
  if(timeSize > 1000) {
    timeSize = parseInt(timeSize / 1000);
    if(timeSize > 60) {
      timeSize = parseInt(timeSize / 60);
      if(timeSize > 60) {
        timeSize = parseInt(timeSize / 60);
        return (<span>{timeSize + formatMessage(menusText.hShow)}</span>)
      } else {
        return (<span>{timeSize + formatMessage(menusText.mShow)}</span>)
      }
    } else {
      return (<span>{timeSize + formatMessage(menusText.sShow)}</span>)
    }
  } else {
    return (<span>{timeSize + formatMessage(menusText.msShow)}</span>)
  }
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  operaMenuClick: function () {
    //this function for user click the drop menu
  },
  render: function () {
    const { config, scope, isFetching, spaceName, flowName } = this.props;
    if(isFetching || config == undefined) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!config || config.length <1) {
      return (
        <div className='LogDetail'>
        目前还没有任何构建记录
        </div>
      )
    }
    let items = config.map((item, index) => {
      // const dropdown = (
      //   <Menu onClick={this.operaMenuClick.bind(this, item)}
      //     style={{ width: '130px' }}
      //     >
      //     <Menu.Item key='2'>
      //       <i className='fa fa-eye' style={{ float:'left',lineHeight:'18px',marginRight:'5px' }} />
      //       <span style={{ float:'left' }} ><FormattedMessage {...menusText.viewBulidLog} /></span>
      //       <div style={{ clear:'both' }}></div>
      //     </Menu.Item>
      //   </Menu>
      // );
      return (
        <div className='LogDetail' key={item.buildId + index} >
          <div className='leftBox'>
            <p className={ checkStatusClass(item.status) + ' title' }>
              { checkStatusSpan(item.status, scope) }
            </p>
            <span className='space'>
              <i className='fa fa-github' />&nbsp;
              {item.branch?item.branch:'svn'}
            </span>
            <i className={ checkStatusClass(item.status) + ' fa fa-dot-circle-o dot' } />
          </div>
          <div className='rightBox'>
            <p className='title'>
              {flowName}
            </p>
            <div className='infoBox'>
              <span className='user'>
                <i className='fa fa-user' />
                {item.namespace}
              </span>
              <span className='updateTime'>
                <i className='fa fa-wpforms' />
                {dateFormat(item.creationTime)}
              </span>
              <span className='costTime'>
                <Icon type='clock-circle-o' />
                { item.status != 2 ? [<FormattedMessage {...menusText.cost} />] : null }
                { dateSizeFormat(item.creationTime, item.endTime, scope) }
              </span>
              <div className='btnBox'>
                <Button size='large' type='primary' className='operaBtn'
                  onClick={() => scope.getBuildLogDetailInfo(item.buildId)}>
                  <i className='fa fa-wpforms' />&nbsp;
                  <FormattedMessage {...menusText.bulidLog} />
                </Button>
              </div>
              <div style={{ clear:'both' }}></div>
            </div>
          </div>
            <div style={{ clear:'both' }}></div>
        </div>
      );
    });
    return (
      <div className='DeployLogList'>
        {items}
      </div>
    );
  }
});

class TenxFLowDetailLog extends Component {
  constructor(props) {
    super(props);
    this.getBuildLogDetailInfo = this.getBuildLogDetailInfo.bind(this);
    this.closeTenxFlowDeployLogModal = this.closeTenxFlowDeployLogModal.bind(this);
    this.state = {
      TenxFlowDeployLogModal: false
    }
  }

  componentWillMount() {
    const { getTenxflowBuildLogs, flowId } = this.props;
    getTenxflowBuildLogs(flowId);
  }

  closeTenxFlowDeployLogModal() {
    //this function for user close the deploy log
    this.setState({
      TenxFlowDeployLogModal: false
    });
  }

  getBuildLogDetailInfo(buildId) {
    //this function for show user the detail log info
    const { getTenxflowBuildDetailLogs, flowId } = this.props;
    this.setState({
      TenxFlowDeployLogModal: true
    })
    getTenxflowBuildDetailLogs(flowId, buildId)
  }
  callback(flowId) {
    const { getTenxflowBuildLastLogs, changeBuildStatus } = this.props
    return () => {
      getTenxflowBuildLastLogs(flowId, {
        success: {
          func: (result) => {
            const info = result.data.results.results
            changeBuildStatus(info.buildId, info.status)
          },
          isAsync: true
        },
        failed: {
          func: () => {
          }
        }
      })
    }
  }
  render() {
    const { scope, isFetching, logs, spaceName, flowName, detailFetching, detailLogs, flowId } = this.props;
    const thisScope = this;
    return (
      <Card id='TenxFLowDetailLog'>
        <Title title="EnnFlow" />
        <MyComponent config={logs} scope={thisScope} isFetching={isFetching} spaceName={spaceName} flowName={flowName} />
        <Modal
            visible={this.state.TenxFlowDeployLogModal}
            className='TenxFlowBuildLogModal'
            onCancel={this.closeTenxFlowDeployLogModal} >
          <TenxFlowBuildLog scope={thisScope} flowId={flowId} isFetching={detailFetching} logs={detailLogs} callback={this.callback(flowId)} visible={this.state.TenxFlowDeployLogModal}/>
        </Modal>
      </Card>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultLogs = {
    isFetching: false,
    logs: []
  }
  const defaultDetailStageLogs = {
    detailFetching: false,
    logs: []
  }
  const { current } = state.entities
  const { space } = current
  const { spaceName } = space
  const { getTenxflowBuildLogs, getTenxflowBuildDetailLogs } = state.cicd_flow
  const { logs, isFetching } = getTenxflowBuildLogs || defaultLogs
  const detailLogs = getTenxflowBuildDetailLogs.logs || defaultDetailStageLogs.logs
  const detailFetching = getTenxflowBuildDetailLogs.isFetching || defaultDetailStageLogs.detailFetching
  return {
    isFetching,
    logs,
    spaceName,
    detailLogs,
    detailFetching
  }
}

TenxFLowDetailLog.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxflowBuildLogs,
  getTenxflowBuildDetailLogs,
  getTenxflowBuildLastLogs,
  changeBuildStatus
})(injectIntl(TenxFLowDetailLog, {
  withRef: true,
}));

