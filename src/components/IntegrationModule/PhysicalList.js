/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  PhysicalList index module
 *
 * v2.0 - 2016-11-22
 * @author by Gaojian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Button, Alert, Card, Spin, Input, Tooltip, Dropdown, Menu, Select } from 'antd'
import { getIntegrationPodDetail } from '../../actions/integration'
import { formatDate, calcuDate } from '../../common/tools'
import './style/PhysicalList.less'
import Title from '../Title'

const ButtonGroup = Button.Group;
const Option = Select.Option;

const menusText = defineMessages({
  reset: {
    id: 'Integration.PhysicalList.reset',
    defaultMessage: '硬件重启',
  },
  id: {
    id: 'Integration.PhysicalList.id',
    defaultMessage: '物理机ID',
  },
  status: {
    id: 'Integration.PhysicalList.status',
    defaultMessage: '状态',
  },
  pod: {
    id: 'Integration.PhysicalList.pod',
    defaultMessage: '所属机型',
  },
  ip: {
    id: 'Integration.PhysicalList.ip',
    defaultMessage: '所属群集',
  },
  runTime: {
    id: 'Integration.PhysicalList.runTime',
    defaultMessage: '运行时间',
  },
  startTime: {
    id: 'Integration.PhysicalList.startTime',
    defaultMessage: '启动时间',
  },
  memory: {
    id: 'Integration.PhysicalList.memory',
    defaultMessage: '内存',
  },
  disk: {
    id: 'Integration.PhysicalList.disk',
    defaultMessage: '硬盘',
  },
  core: {
    id: 'Integration.PhysicalList.core',
    defaultMessage: '核',
  },
  poweronStatus: {
    id: 'Integration.PhysicalList.poweronStatus',
    defaultMessage: '运行中',
  },
  poweroffStatus: {
    id: 'Integration.PhysicalList.poweroffStatus',
    defaultMessage: '已关闭',
  },
})

function diskFormat(num) {
  if(num < 1024) {
    return num + 'MB'
  }
  num = parseInt(num / 1024);
  if(num < 1024) {
    return num + 'GB'
  }
  num = parseInt(num / 1024);
  return num + 'TB'
}

function getTotalDisk(disks) {
  //this function for user get total disk
  let diskTotal = 0;
  disks.map((disk) => {
    if(disk.accessable) {
      diskTotal = diskTotal + disk.capacityMb;
    }
  });
  return diskTotal;
}

function getUsedDisk(disks) {
  //this function for user get used disk
  let diskTotal = 0;
  let diskFree = 0;
  disks.map((disk) => {
    if(disk.accessable) {
      diskTotal = diskTotal + disk.capacityMb;
      diskFree = diskFree + disk.freeMb;
    }
  });
  return diskTotal - diskFree;
}

function getCpuUsedCount(singleHz, usedHz) {
  let usedCpu = Math.round(usedHz/singleHz);
  return usedCpu;
}

function formatStatus(status) {
  //this function for format status
  switch(status) {
    case 'poweron':
      return (
        <span className='poweron'><i className='fa fa-circle' /><FormattedMessage {...menusText.poweronStatus} /></span>
      )
      break;
    case 'poweroff':
      return (
        <span className='poweroff'><i className='fa fa-circle' /><FormattedMessage {...menusText.poweroffStatus} /></span>
      )
      break;
  }
}

class PhysicalList extends Component {
  constructor(props) {
    super(props);
    this.onChangeShowType = this.onChangeShowType.bind(this);
    this.onChangeAppType = this.onChangeAppType.bind(this);
    this.ShowDetailInfo = this.ShowDetailInfo.bind(this);
    this.onSearchPods = this.onSearchPods.bind(this);
    this.state = {
      currentShowApps: 'all',
      currentAppType: '1',
      showType: 'list',
      pods: []
    }
  }

  componentWillMount() {
    const { getIntegrationPodDetail, integrationId, currentDataCenter } = this.props;
    getIntegrationPodDetail(integrationId, currentDataCenter)
  }

  componentWillReceiveProps(nextProps) {
    const { isFetching, pods, getIntegrationPodDetail, integrationId, currentDataCenter } = nextProps;
    if(!isFetching && Boolean(pods)) {
      this.setState({
        pods: pods
      })
    }
    if(nextProps.currentDataCenter != this.props.currentDataCenter) {
      getIntegrationPodDetail(integrationId, currentDataCenter)
    }
  }

  onChangeShowType(type) {
    //this function for user change the type of app list
    this.setState({
      currentShowApps: type
    });
  }

  onChangeAppType(type) {
    //this function for user change the type of app
    this.setState({
      currentAppType: type
    });
  }

  ShowDetailInfo(name) {
    //this function for view the app detail info
    this.setState({
      showType: 'detail'
    });
  }

  onSearchPods(e) {
    //this function for user search the detail pod
    let value = e.target.value;
    if(value.length > 0) {
      let { pods } = this.props;
      let newPods = [];
      pods.map((item) => {
        if(item.name.indexOf(value) > -1) {
          newPods.push(item)
        }
      });
      this.setState({
        pods: newPods
      });
    } else {
      let { pods } = this.props;
      this.setState({
        pods: pods
      });
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const {isFetching, pods, dataCenters, currentDataCenter} = this.props;
    if(isFetching || !Boolean(pods)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const scope = this;
    let appShow = this.state.pods.map((item, index) => {
      return (
        <div className='podDetail' key={'podDetail' + index}>
          <div className='id commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.name}>
                <span className='topSpan'>{item.name}</span>
              </Tooltip>
              <Tooltip placement='topLeft' title={item.ip}>
                <span className='bottomSpan'>{item.ip}</span>
              </Tooltip>
            </span>
          </div>
          <div className='status commonTitle'>
            <span className='commonSpan'>
              <span>{formatStatus(item.powerstate)}</span>
            </span>
          </div>
          <div className='pod commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.model}>
               <span>{item.model}</span>
              </Tooltip>
            </span>
          </div>
          <div className='ip commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.computeResource}>
                <span>{item.computeResource}</span>
              </Tooltip>
            </span>
          </div>
          <div className='cpu commonTitle'>
            <span className='commonSpan'>
              <span className='topSpan'>{item.cpuNumber}<FormattedMessage {...menusText.core} /></span>
              <span className='bottomSpan'>{getCpuUsedCount(item.cpuMhz, item.cpuTotalUsedMhz)}<FormattedMessage {...menusText.core} /></span>
            </span>
          </div>
          <div className='memory commonTitle'>
            <span className='commonSpan'>
              <span className='topSpan'>{diskFormat(item.memoryTotalMb)}</span>
              <span className='bottomSpan'>{parseInt(100*item.memoryUsedMb/item.memoryTotalMb)}%</span>
            </span>
          </div>
          <div className='disk commonTitle'>
            <span className='commonSpan'>
              <span className='topSpan'>{diskFormat(getTotalDisk(item.disks))}</span>
              <span className='bottomSpan'>{parseInt(100*getUsedDisk(item.disks)/getTotalDisk(item.disks))}%</span>
            </span>
          </div>
          <div className='runTime commonTitle'>
            <span className='commonSpan'>
              <span>{(calcuDate(item.bootTime)).replace('前','')}</span>
            </span>
          </div>
          <div className='startTime commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={formatDate(item.bootTime)}>
                <span>{formatDate(item.bootTime)}</span>
              </Tooltip>
            </span>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      )
    });
    return (
      <div id='PhysicalList' key='PhysicalList'>
        <Title title="集成中心" />
        <div className='operaBox'>
          <div className='searchBox'>
            <Input type='text' size='large' onKeyUp={this.onSearchPods.bind(this)}/>
            <i className='fa fa-search' />
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='titleBox'>
          <div className='id commonTitle'>
            <FormattedMessage {...menusText.id} />
          </div>
          <div className='status commonTitle'>
            <FormattedMessage {...menusText.status} />
          </div>
          <div className='pod commonTitle'>
            <FormattedMessage {...menusText.pod} />
          </div>
          <div className='ip commonTitle'>
            <FormattedMessage {...menusText.ip} />
          </div>
          <div className='cpu commonTitle'>
            CPU/已使用
          </div>
          <div className='memory commonTitle'>
            <FormattedMessage {...menusText.memory} />
          </div>
          <div className='disk commonTitle'>
            <FormattedMessage {...menusText.disk} />
          </div>
          <div className='runTime commonTitle'>
            <FormattedMessage {...menusText.runTime} />
          </div>
          <div className='startTime commonTitle'>
            <FormattedMessage {...menusText.startTime} />
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        {appShow}
        { pods.length == 0 ? [
          <div className='loadingBox' key='loadingBox'>
            <span>暂无数据</span>
          </div>
        ] : null }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultPodsList = {
    isFetching: false,
    pods: []
  }
  const { getIntegrationPodDetail } = state.integration
  const {isFetching, pods} = getIntegrationPodDetail || defaultPodsList
  return {
    isFetching,
    pods
  }
}

PhysicalList.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getIntegrationPodDetail
})(injectIntl(PhysicalList, {
  withRef: true,
}));

