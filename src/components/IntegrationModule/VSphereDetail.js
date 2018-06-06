/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  VSphereDetail index module
 *
 * v2.0 - 2016-11-23
 * @author by Gaojian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import ReactEcharts from 'echarts-for-react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Button, Spin, Select, Icon, Tooltip } from 'antd'
import { getIntegrationPodDetail } from '../../actions/integration'
import './style/VSphereDetail.less'
import ProgressBox from '../ProgressBox'
import cpuImg from '../../assets/img/integration/cpu.png'
import memoryImg from '../../assets/img/integration/memory.png'
import networkImg from '../../assets/img/integration/network.png'
import diskImg from '../../assets/img/integration/disk.png'

const Option = Select.Option;

let CPUOption = {
  title: {
    text: 'CPU已分配',
    top: '15px',
    left: 'center',
    textStyle: {
      fontWeight:'normal',
      fontSize:14
    }
  },
  color: ['#3398DB'],
  tooltip : {
    trigger: 'axis',
    axisPointer : {
      type : 'shadow'
    },
    formatter: '{c} 核'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis : [
    {
      type : 'category',
      data : ['node', 'node1', 'node2'],
      splitLine: {
        "show": false
      },
      axisTick: {
        "show": false
      },
      splitArea: {
        "show": false
      },
      axisLabel: {
        "interval": 0,
      },
    }
  ],
  yAxis : [
    {
      type : 'value',
      max: 100,
      splitNumber: 2,
      interval: 50,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        },
      },
    }
  ],
  series : [
    {
      name:'',
      type:'bar',
      barWidth: 60,
      data:[10, 52, 100],

    }
  ]
}

let memoryOption = {
  title: {
    text: '内存已分配',
    top: '15px',
    left: 'center',
    textStyle: {
      fontWeight:'normal',
      fontSize:14
    }
  },
  color: ['#3398DB'],
  tooltip : {
    trigger: 'axis',
    axisPointer : {
      type : 'shadow'
    },
    formatter: '{c} G'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis : [
    {
      type : 'category',
      data : ['node', 'node1', 'node2'],
      splitLine: {
        "show": false
      },
      axisTick: {
        "show": false
      },
      splitArea: {
        "show": false
      },
      axisLabel: {
        "interval": 0,
      },
    }
  ],
  yAxis : [
    {
      type : 'value',
      max: 100,
      splitNumber: 2,
      interval: 50,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        },
      },
    }
  ],
  series : [
    {
      name:'',
      type:'bar',
      barWidth: 60,
      data:[10, 52, 100],

    }
  ]
}

const menusText = defineMessages({
  resource: {
    id: 'Integration.VSphereDetail.resource',
    defaultMessage: '计算资源',
  },
  storage: {
    id: 'Integration.VSphereDetail.storage',
    defaultMessage: '存储',
  },
  podNum: {
    id: 'Integration.VSphereDetail.podNum',
    defaultMessage: '主机总数',
  },
  healthPod: {
    id: 'Integration.VSphereDetail.healthPod',
    defaultMessage: '健康主机数',
  },
  unstartPod: {
    id: 'Integration.VSphereDetail.unstartPod',
    defaultMessage: '未启用主机数',
  },
  unit: {
    id: 'Integration.VSphereDetail.unit',
    defaultMessage: '个',
  },
  podStatus: {
    id: 'Integration.VSphereDetail.podStatus',
    defaultMessage: '主机状态',
  },
  used: {
    id: 'Integration.VSphereDetail.used',
    defaultMessage: '已使用：',
  },
  idle: {
    id: 'Integration.VSphereDetail.idle',
    defaultMessage: '空闲：',
  },
  vgNum: {
    id: 'Integration.VSphereDetail.vgNum',
    defaultMessage: '存储总数：',
  },
  using: {
    id: 'Integration.VSphereDetail.using',
    defaultMessage: '可用存储：',
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

function diskFormatNoUnit(num) {
  if(num < 1024) {
    return num
  }
  num = parseInt(num / 1024);
  if(num < 1024) {
    return num
  }
  num = parseInt(num / 1024);
  return num
}

function checkHealthPods(config) {
  let num = 0;
  config.map((item) => {
    if(item.powerstate == 'poweron') {
      num++
    }
  })
  return num;
}

function checkErrorPods(config) {
  let num = 0;
  config.map((item) => {
    if(item.powerstate == 'poweroff') {
      num++
    }
  })
  return num;
}

function getCpuFreeCount(singleHz, count, usedHz) {
  let usedCpu = Math.round(usedHz/singleHz);
  return (count - usedCpu)
}

function setCpuAllocate(pods, max) {
  let sortList = [];
  let cpuTotal = 0;
  let maxCpu = 0;
  pods.map((item) => {
    let usedCpu = Math.round(item.cpuTotalUsedMhz/item.cpuMhz);
    if(item.cpuNumber > maxCpu) {
      maxCpu = item.cpuNumber;
    }
    cpuTotal = cpuTotal + item.cpuNumber;
    let tempBody = {
      name: item.name,
      usedCpu: usedCpu
    }
    sortList.push(tempBody)
  })
  sortList.sort();
  let nameList = [];
  let cpuList = [];
  sortList.map((item, index) => {
    if(index < 3) {
      nameList.push(item.name);
      cpuList.push(item.usedCpu);
    }
  })
  CPUOption.xAxis[0].data = nameList;
  CPUOption.series[0].data = cpuList;
  CPUOption.yAxis[0].max = maxCpu;
  CPUOption.yAxis[0].interval = Math.round(maxCpu/2);
}

function setMemoryAllocate(pods, max) {
  let sortList = [];
  let memoryTotalMb = 0;
  pods.map((item) => {
    memoryTotalMb = memoryTotalMb + item.memoryTotalMb;
    let tempBody = {
      name: item.name,
      memoryUsedMb: diskFormatNoUnit(item.memoryUsedMb)
    }
    sortList.push(tempBody)
  })
  sortList.sort();
  let nameList = [];
  let memoryUsedMbList = [];
  sortList.map((item, index) => {
    if(index < 3) {
      nameList.push(item.name);
      memoryUsedMbList.push(item.memoryUsedMb);
    }
  })
  memoryTotalMb = diskFormatNoUnit(max)
  memoryOption.xAxis[0].data = nameList;
  memoryOption.series[0].data = memoryUsedMbList;
  memoryOption.yAxis[0].max = memoryTotalMb;
  memoryOption.yAxis[0].interval = Math.round(memoryTotalMb/2);
}

class VSphereDetail extends Component {
  constructor(props) {
    super(props);
    this.onChangeDataCenter = this.onChangeDataCenter.bind(this);
    this.state = {
    }
  }

  componentDidMount() {
    const { getIntegrationPodDetail, dataCenters, integrationId, currentDataCenter } = this.props;
    let datacenter = !!currentDataCenter ? currentDataCenter : dataCenters[0];
    getIntegrationPodDetail(integrationId, currentDataCenter);
  }

  componentWillReceiveProps(nextProps) {
    const { getIntegrationPodDetail, integrationId, currentDataCenter } = nextProps;
    if(nextProps.currentDataCenter != this.props.currentDataCenter) {
      getIntegrationPodDetail(integrationId, currentDataCenter)
    }
  }

  onChangeDataCenter(e) {
    //this function for user change the current data center
    const { scope, getIntegrationPodDetail, integrationId } = this.props;
    scope.setState({
      currentDataCenter: e
    });
    getIntegrationPodDetail(integrationId, e)
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
    let diskTotal = 0;
    let diskUsed = 0;
    let diskFree = 0;
    let diskCount = 0;
    let diskShow = [];
    let diskHealthCount = 0;
    let memoryTotal = 0;
    let memoryUsedTotal = 0;
    let maxMemory = 0;
    let cpuTotal = 0;
    let cpuFree = 0;
    let maxCpu = 0;
    let vmTotal = 0;
    let netTotal = 0;
    let netHealtTotal = 0;
    let netShow = [];
    pods.map((item) => {
      if(item.memoryTotalMb > maxMemory) {
        maxMemory = item.memoryTotalMb;
      }
      if(item.cpuTotal > maxCpu) {
        maxCpu = item.cpuTotal
      }
      memoryTotal= memoryTotal + item.memoryTotalMb;
      memoryUsedTotal= memoryUsedTotal + item.memoryUsedMb;
      cpuTotal = cpuTotal + item.cpuNumber;
      diskCount = diskCount + item.disks.length;
      vmTotal = vmTotal + item.vmNumber;
      cpuFree = cpuFree + getCpuFreeCount(item.cpuMhz, item.cpuNumber, item.cpuTotalUsedMhz);
      netTotal = netTotal + item.networks.length;
      netShow.push(item.networks.map((network) => {
        if(network.vmNumber > 0) {
          netHealtTotal++;
        }
        return (
          <div className='netwrokDetail'>
            <Tooltip placement='topLeft' title={network.name}>
              <span className='leftSpan'>{network.name}</span>
            </Tooltip>
            <span className='rightSpan'>
              {network.vmNumber > 0 ? [<span key='netwrokDetailRightSpan'><Icon style={{ color: '#5cb85c' }} type="check-circle-o" />&nbsp;是</span>] : [<span key='netwrokDetailRightSpan'><Icon style={{ color: '#f85a5a' }} type="cross-circle-o" />&nbsp;否</span>]}
            </span>
          </div>
        )
      }))
      diskShow.push(item.disks.map((disk) => {
        diskTotal = diskTotal + disk.capacityMb;
        diskFree = diskFree + disk.freeMb;
        diskUsed = diskUsed + disk.capacityMb - disk.freeMb;
        if(disk.accessable) {
          diskHealthCount++;
        }
        return (
          <div className='diskDetail'>
            <Tooltip placement='topLeft' title={disk.name}>
              <span className='leftSpan'>{disk.name}</span>
            </Tooltip>
            <span className='rightSpan'>{diskFormat(disk.capacityMb)}</span>
          </div>
        )
      }))
    });
    setCpuAllocate(pods, maxCpu)
    setMemoryAllocate(pods, maxMemory)
    return (
      <div id='VSphereDetail'>
        {
          pods.length == 0 ? [
            <div className='loadingBox' key='loadingBox'>
              <span>没有物理主机哦</span>
            </div>
          ] : null
        }
        {
          pods.length > 0 ? [
            <div key='detailBox'>
              <div className='leftBox'>
                <div className='titleBox'>
                  <FormattedMessage {...menusText.resource} />
                </div>
                <div className='littleLeft'>
                  <ReactEcharts
                    notMerge={true}
                    option={CPUOption}
                    style={{height:'200px', width: '100%'}}
                  />
                </div>
                <div className='littelMiddle'>
                  <ReactEcharts
                    notMerge={true}
                    option={memoryOption}
                    style={{height:'200px', width: '100%'}}
                  />
                </div>
                <div className='littelRight'>
                  <p><FormattedMessage {...menusText.podStatus} /></p>
                  <div className='podNum'>
                    <div className='colorBox'>
                    </div>
                    <span><FormattedMessage {...menusText.podNum} /></span>
                    <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
                    <span className='rightSpan'>{pods.length}</span>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                  <div className='healthPod'>
                    <div className='colorBox'>
                    </div>
                    <span><FormattedMessage {...menusText.healthPod} /></span>
                    <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
                    <span className='rightSpan'>{checkHealthPods(pods)}</span>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                  <div className='unstartPod'>
                    <div className='colorBox'>
                    </div>
                    <span><FormattedMessage {...menusText.unstartPod} /></span>
                    <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
                    <span className='rightSpan'>{checkErrorPods(pods)}</span>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              <div className='rightBox'>
                <div className='titleBox'>
                  <FormattedMessage {...menusText.storage} />
                </div>
                <div className='littleLeft'>
                  <ProgressBox boxPos={parseFloat(diskUsed/diskTotal).toFixed(2)} />
                </div>
                <div className='littelRight'>
                  <div className='commonBox'>
                    <span className='leftSpan'><FormattedMessage {...menusText.used} /></span>
                    <span className='rightSpan'>{diskFormat(diskUsed)}</span>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                  <div className='commonBox'>
                    <span className='leftSpan'><FormattedMessage {...menusText.idle} /></span>
                    <span className='rightSpan'>{diskFormat(diskTotal - diskUsed)}</span>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                  <div className='commonBox'>
                    <span className='leftSpan'><FormattedMessage {...menusText.vgNum} /></span>
                    <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
                    <span className='rightSpan'>{diskCount}</span>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                  <div className='commonBox'>
                    <span className='leftSpan'><FormattedMessage {...menusText.using} /></span>
                    <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
                    <span className='rightSpan'>{diskHealthCount}</span>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              <div style={{ clear: 'both' }}></div>
              <div className='bottomBox'>
                <div className='cpu commonBox'>
                  <img src={cpuImg} />
                  <p>CPU共 {cpuTotal} 核</p>
                  <p>CPU 可用 {cpuFree} 核</p>
                </div>
                <div className='memory commonBox'>
                  <img src={memoryImg} />
                  <p>内存共 {diskFormat(memoryTotal)}</p>
                  <p>可用{diskFormat(memoryTotal - memoryUsedTotal)}</p>
                </div>
                <div className='network commonBox'>
                  <div className='leftCommon'>
                    <img src={networkImg} />
                    <p>网络共{netTotal}个</p>
                    <p>可访问{netHealtTotal}个</p>
                  </div>
                  <div className='rightCommon'>
                    <div className='titleBox'>
                      <span className='leftSpan'>名称</span>
                      <span className='rightSpan'>可访问</span>
                    </div>
                    <div className='dataBox'>
                      {netShow}
                    </div>
                  </div>
                </div>
                <div className='disk commonBox'>
                  <div className='leftCommon'>
                    <img src={diskImg} />
                    <p>磁盘共 {diskFormat(diskTotal)}</p>
                    <p>已用 {diskFormat(diskUsed)}</p>
                  </div>
                  <div className='rightCommon'>
                    <div className='titleBox'>
                      <span className='leftSpan'>存储名</span>
                      <span className='rightSpan'>容量</span>
                    </div>
                    <div className='dataBox'>
                      {diskShow}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ] : null
        }
        <div className='tagBox'>
          <i className='fa fa-tag' />
          <span>vSphere版本:6.0</span>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultApp = {
    isFetching: false,
    pods: []
  }
  const { getIntegrationPodDetail } = state.integration
  const {isFetching, pods} = getIntegrationPodDetail || defaultApp
  return {
    isFetching,
    pods
  }
}
VSphereDetail.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getIntegrationPodDetail
})(injectIntl(VSphereDetail, {
  withRef: true,
}));

