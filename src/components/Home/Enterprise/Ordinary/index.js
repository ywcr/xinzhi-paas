/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  node server list
 *
 * v0.1 - 2016/11/16
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Radio, Icon, Spin, Tooltip, Progress, Button, Select } from 'antd'
import './style/Ordinary.less'
import ReactEcharts from 'echarts-for-react'
import MySpace from './MySpace'
import { getAppStatus, getServiceStatus, getContainerStatus } from '../../../../common/status_identify'
import { connect, connectAdvanced } from 'react-redux'
import { loadClusterInfo } from '../../../../actions/overview_cluster'
import { loadClusterSummary } from '../../../../actions/overview_cluster'
import { loadDbCacheRedisList, loadStatefulsets } from '../../../../actions/database_cache'

import ProgressBox from '../../../ProgressBox'
import { parseAmount } from '../../../../common/tools'
import homeMySQL from '../../../../assets/img/homeMySQL.png'
import homeMongoCluster from '../../../../assets/img/homeMongoCluster.png'
import homeRedis from '../../../../assets/img/homeRedis.png'
import { Link } from 'react-router'
import { AVATAR_HOST } from '../../../../constants'

function getClusterCostOption(costValue, restValue) {
  return {
    tooltip: {
      trigger: 'item',
      formatter: "{b} : {c}<br/> ({d}%)"
    },
    legend: {
      orient: 'vertical',
      left: '60%',
      top: '30%',
      data: [{ name: '余额' }, { name: '消费' }],
      formatter: function (name) {
        if (name === '余额') {
          return name + '：' + restValue.fullAmount
        } else {
          return name + '：' + costValue.fullAmount
        }
      },
      textStyle: {
        fontSize: 14,
        color: '#666'
      },
      itemGap: 15,
      itemWidth: 10,
      itemHeight: 10,
    },
    color: ['#46b2fa', '#2abe84'],
    series: [
      {
        name: '',
        type: 'pie',
        selectedMode: 'single',
        radius: '45%',
        center: ['30%', '50%'],
        data: [
          { value: restValue.amount, name: '余额' },
          { value: costValue.amount, name: '消费', selected: true },
        ],
        itemStyle: {
          normal: {
            borderWidth: 0.5,
            borderColor: '#ffffff'
          },
          emphasis: {
          }
        }
      }
    ]
  }
}

let SvcState = React.createClass({
  getInitialState() {
    return {

    }
  },
  render: function () {
    const { currentState } = this.props
    let item
    if (currentState === 'normal') {
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{ backgroundColor: '#2eb764' }}></div>
          <span style={{ color: '#2eb865' }}>正常</span>
        </div>
      )
    }
    if (currentState === 'warning') {
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{ backgroundColor: '#f0986b' }}></div>
          <span style={{ color: '#f0986b' }}>警告</span>
        </div>
      )
    }
    if (currentState === 'uninstalled') {
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{ backgroundColor: '#f0986b' }}></div>
          <span style={{ color: '#f0986b' }}>未安装</span>
        </div>
      )
    }
    if (currentState === 'abnormal') {
      item = (
        <div>
          <Icon type="exclamation-circle" style={{ color: '#f85a59' }} className='errorDot' />
          <span style={{ color: '#f85a59' }}>异常</span>
        </div>
      )
    }
    if (currentState === 'stopped') {
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{ backgroundColor: '#ffa500' }}></div>
          <span style={{ color: '#ffa500' }}>已停止</span>
        </div>
      )
    }
    return (
      <div id='SvcState'>
        {item}
      </div>
    )
  }
})

class Ordinary extends Component {
  constructor(props) {
    super(props)
    this.handleSize = this.handleSize.bind(this)
    this.thousandBitSeparator = this.thousandBitSeparator.bind(this)
    this.loadClusterSummary = this.loadClusterSummary.bind(this)
    this.state = {
      tab1: true,
      tab2: false,
      tab3: false,
      // tab4: false,
      // tab5: false,
      // tab6: false,
      isTeam: false,
      statefulApp: 'mysql',
      mySQLRunning: 0,
      mySQLStopped: 0,
      mySQLOthers: 0,
      mongoRunning: 0,
      mongoStopped: 0,
      mongoOthers: 0,
      redisRunning: 0,
      redisStopped: 0,
      redisOthers: 0


    }
  }

  loadClusterSummary(clusterID) {
    const { loadClusterSummary } = this.props
    loadClusterSummary(clusterID, {
      failed: {
        func: () => {
          // do not show error in page
        }
      }
    })
  }

  componentWillMount() {
    const { loadClusterInfo, loadDbCacheRedisList, current } = this.props
    const { clusterID } = current.cluster
    loadClusterInfo(clusterID)
    this.loadClusterSummary(clusterID)

    loadDbCacheRedisList(clusterID, 'mysql', 'rdbs', {
      success: {
        func: (result) => {
          const databaseList = result.databaseList
          let mySQLRunning = 0, mySQLStopped = 0, mySQLOthers = 0
          if (databaseList) {
            databaseList.map((item) => {
              if (item.status == 'active') {
                mySQLRunning += 1
              } else if (item.status == 'stopped') {
                mySQLStopped += 1
              } else if (item.status == 'pending') {
                mySQLOthers += 1
              } else if (item.status == 'suspended') {
                mySQLOthers += 1
              }
            })
          }
          this.setState({
            mySQLRunning: mySQLRunning,
            mySQLStopped: mySQLStopped,
            mySQLOthers: mySQLOthers
          })
        }
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    const { loadClusterInfo,loadDbCacheRedisList } = this.props
    const { current } = nextProps
    const { clusterID } = current.cluster
    if (clusterID !== this.props.current.cluster.clusterID || current.space.namespace != this.props.current.space.namespace) {
      loadClusterInfo(clusterID)
      this.loadClusterSummary(clusterID)
      return
    }
    if (current.team.teamID !== 'default') {
      this.setState({
        isTeam: true
      })
    }
  }

  thousandBitSeparator(num) {
    return num && (num.toString().indexOf('.') != -1 ? num.toString().replace(/(\d)(?=(\d{3})+\.)/g, function ($0, $1) {
      return $1 + ",";
    }) : num.toString().replace(/(\d)(?=(\d{3}))/g, function ($0, $1) {
      return $1 + ",";
    }));
  }

  handleSize(size) {
    if (!size) {
      return 0 + 'MB'
    }
    let result = 0
    if (size < 1024) {
      return size + 'MB'
    }
    if (size < 1024 * 1024) {
      result = this.thousandBitSeparator(Math.floor(size / 1024 * 100) / 100)
      return result + 'GB'
    }
    if (size < 1024 * 1024 * 1024) {
      result = this.thousandBitSeparator(Math.floor(size / (1024 * 1024) * 100) / 100)
      return result + 'T'
    }
    result = this.thousandBitSeparator(Math.floor(size / (1024 * 1024 * 1024) * 100) / 100)
    return result + 'T'
  }

  render() {
    const { clusterOperations, databaseList, clusterSysinfo, clusterStorage, clusterAppStatus,
      clusterNodeSummary, clusterDbServices, spaceName, clusterName, clusterNodeSpaceConsumption, clusterSummary, volumeSummary, clusterStaticSummary, isFetching, loginUser, clustername } = this.props
    const { userName, email, avatar, certInfos } = loginUser
    let boxPos = 0
    if ((clusterStorage.freeSize + clusterStorage.usedSize) > 0) {
      boxPos = (clusterStorage.usedSize / (clusterStorage.freeSize + clusterStorage.usedSize)).toFixed(4)
    }
    //应用
    let appRunning = clusterAppStatus.appMap.get('Running')
    let appStopped = clusterAppStatus.appMap.get('Stopped')
    let appOthers = clusterAppStatus.appMap.get('Unknown') || 0 + clusterAppStatus.appMap.get('Pending') || 0
    //服务
    let svcRunning = clusterAppStatus.svcMap.get('Running')
    let svcStopped = clusterAppStatus.svcMap.get('Stopped')
    let svcOthers = clusterAppStatus.svcMap.get('Deploying') ? clusterAppStatus.svcMap.get('Deploying') : 0 +
      clusterAppStatus.svcMap.get('Pending') ? clusterAppStatus.svcMap.get('Pending') : 0
    //容器
    let conRunning = clusterAppStatus.podMap.get('Running')
    let conFailed = clusterAppStatus.podMap.get('Failed') || 0 +
      clusterAppStatus.podMap.get('Abnormal') ? clusterAppStatus.podMap.get('Abnormal') : 0
    let conOthers = clusterAppStatus.podMap.get('Pending') ? clusterAppStatus.podMap.get('Pending') : 0 +
      clusterAppStatus.podMap.get('Terminating') ? clusterAppStatus.podMap.get('Terminating') : 0 +
        clusterAppStatus.podMap.get('Unknown') ? clusterAppStatus.podMap.get('Unknown') : 0

    appRunning = appRunning ? appRunning : 0
    appStopped = appStopped ? appStopped : 0
    appOthers = appOthers ? appOthers : 0
    svcRunning = svcRunning ? svcRunning : 0
    svcStopped = svcStopped ? svcStopped : 0
    svcOthers = svcOthers ? svcOthers : 0
    conRunning = conRunning ? conRunning : 0
    conFailed = conFailed ? conFailed : 0
    conOthers = conOthers ? conOthers : 0
    //计算资源使用率
    //CPU
    let CPUNameArr = []
    let CPUResourceName = []
    let CPUUsedArr = []
    if (clusterNodeSummary.cpu && clusterNodeSummary.cpu.length !== 0) {
      clusterNodeSummary.cpu.slice(0, 3).map((item, index) => {
        let name = item.name.replace(/192.168./, '')
        CPUResourceName.push(name)
        name = name.length > 9 ? `${name.substring(0, 6)}...` : name
        CPUNameArr.push(name)
        CPUUsedArr.push(item.used)
      })
    } else {
      CPUUsedArr = ['没有数据']
    }
    //内存
    let memoryNameArr = []
    let memoryResourceName = []
    let memoryUsedArr = []
    if (clusterNodeSummary.memory && clusterNodeSummary.memory.length !== 0) {
      clusterNodeSummary.memory.slice(0, 3).map((item, index) => {
        let name = item.name.replace(/192.168./, '')
        memoryResourceName.push(name)
        name = name.length > 9 ? `${name.substring(0, 6)}...` : name
        memoryNameArr.push(name)
        memoryUsedArr.push(item.used)
      })
    } else {
      memoryUsedArr = ['没有数据']
    }
    //磁盘
    let diskNameArr = []
    let diskUsedArr = []
    if (clusterNodeSummary.storage && clusterNodeSummary.storage.length !== 0) {
      clusterNodeSummary.storage.slice(0, 3).map((item, index) => {
        let name = item.name.replace(/192.168./, '')
        diskNameArr.push(name)
        // diskNameArr.push(item.name)
        diskUsedArr.push((item.used))
      })
    } else {
      diskUsedArr = ['没有数据']
    }


    //数据库与缓存
    //MySQL
    // const mysqlData = clusterDbServices.get('mysql')
    let mySQLRunning = 0
    let mySQLStopped = 0
    let mySQLOthers = 0

    //Mongo
    // const mongoData = clusterDbServices.get('mongo')
    let mongoRunning = 0
    let mongoStopped = 0
    let mongoOthers = 0

    let redisRunning = 0
    let redisStopped = 0
    let redisOthers = 0
    const statefulApps = {
      mysql: "MySQL",
      mongo: 'Mongo',
      redis: "Redis",
      // zookeeper: "ZooKeeper",
      // elasticsearch: "ElasticSearch",
      // etcd: "Etcd",
    }
    const statefulAppTabMapping = {
      mysql: 'tab1',
      mongo: 'tab2',
      redis: 'tab3',
      // zookeeper: 'tab4',
      // elasticsearch: 'tab5',
      // etcd: 'tab6',
    }
    const defaultState = {
      tab1: false,
      tab2: false,
      tab3: false,
      // tab4: false,
      // tab5: false,
      // tab6: false,
      statefulApp: 'MySQL',
    }
    const onStatefulAppOptionClick = function (app) {
      const { loadDbCacheRedisList, loadStatefulsets, current } = this.props
      this.setState({
        dbType:app
      })
      if (app == 'mysql' || app == 'redis' || app == 'mongo') {
        let type = ''
        let apps = ''
        if (app == 'mysql') {
          type = 'rdbs'
          apps = 'mysql'
        } else if (app == 'redis') {
          type = 'caches'
          apps = 'mysql'
        } else {
          type = "mongos"
          apps = 'mongos'
        }

        // if(app=='redis'){
        //   type='caches'
        // }else{
        //   type = "mongo"
        // }
        loadDbCacheRedisList(current.cluster.clusterID, apps, type, {
          success: {
            func: (result) => {
              const databaseList = result.databaseList
              if (databaseList) {
                databaseList.map((item) => {
                  if (item.status == 'active') {
                    app == 'mysql' ? mySQLRunning += 1 : (app == 'redis' ? redisRunning += 1 : mongoRunning += 1)
                  } else if (item.status == 'stopped') {
                    app == 'mysql' ? mySQLStopped += 1 : ((app == 'redis') ? redisStopped += 1 : mongoStopped += 1)
                  } else if (item.status == 'pending') {
                    app == 'mysql' ? mySQLOthers += 1 : ((app == 'redis') ? redisOthers += 1 : mongoOthers += 1)
                  } else if (item.status == 'suspended') {
                    app == 'mysql' ? mySQLOthers += 1 : ((app == 'redis') ? redisOthers += 1 : mongoOthers += 1)
                  }
                })
              }
              this.setState({
                mySQLRunning: mySQLRunning,
                redisRunning: redisRunning,
                mySQLStopped: mySQLStopped,
                redisStopped: redisStopped,
                mySQLOthers: mySQLOthers,
                redisOthers: redisOthers,
                mongoRunning: mongoRunning,
                mongoStopped: mongoStopped,
                mongoOthers: mongoOthers
              })
            }
          }
        })
      }
      const tab = statefulAppTabMapping[app]
      const newState = {
        [tab]: true,
        statefulApp: statefulApps[app],
      }
      this.setState(Object.assign({}, defaultState, newState))

    }

    // onStatefulAppOptionClick('mysql')

    const statefulAppOptions = Object.getOwnPropertyNames(statefulApps).map(
      app => <Select.Option value={app} key={app}>{statefulApps[app]}</Select.Option>)
    const statefulAppMenus = (
      <Select defaultValue={this.state.statefulApp} value={this.state.statefulApp} style={{ width: '80%', margin: '10px 10%' }} onChange={onStatefulAppOptionClick.bind(this)}>
        {statefulAppOptions}
      </Select>
    )
    //集群mem、cpu和存储概况
    let clusterSummaryCapacity = clusterSummary.capacity
    let clusterSummaryUsed = clusterSummary.used
    //let cpuUsed = Math.ceil(clusterSummaryUsed.cpu / clusterSummaryCapacity.cpu * 100)
    let cpuUsed = clusterSummaryUsed.cpu
    let memoryUsed = clusterSummaryUsed.memory
    let volumeCapacity = volumeSummary.total

    //memory
    const usedMemory = (clusterSummaryUsed.memory / 1024 / 1024).toFixed(2)
    const capacityMemory = (clusterSummaryCapacity.memory / 1024 / 1024).toFixed(2)
    let memoryUsedPrecent = clusterSummaryCapacity.memory == 0 ? 0 : Math.ceil(clusterSummaryUsed.memory / clusterSummaryCapacity.memory * 100)

    //cpu
    let cpuUsedPrecent = Math.ceil(clusterSummaryUsed.cpu / clusterSummaryCapacity.cpu * 100)
    const capacityCPU = (clusterSummaryCapacity.cpu / 1000).toFixed(2)
    const usedCPU = (clusterSummaryUsed.cpu / 1000).toFixed(2)

    let volumeAllocated = parseFloat(volumeSummary.allocated)
    if (volumeCapacity.toLowerCase().indexOf('g') > 0) {
      volumeCapacity = parseFloat(volumeCapacity).toFixed(2)
    } else if (volumeCapacity.toLowerCase().indexOf('t') > 0) {
      volumeCapacity = (parseFloat(volumeCapacity) * 1024).toFixed(2)
    } else {
      volumeCapacity = (parseFloat(volumeCapacity) / 1024).toFixed(2)
    }
    let volumeUsedPrecent = Math.ceil(volumeSummary.total / volumeAllocated * 100)
    let volumeUsed = (volumeAllocated / 1024).toFixed(2)

    // pod number
    let canCreateContainer = Math.floor((clusterSummaryCapacity.memory - clusterSummaryUsed.memory) / 512 / 1024)
    let allocatedPod = clusterStaticSummary.pod
    let allocatedPodNumber = 0
    allocatedPodNumber += allocatedPod['running']
    allocatedPodNumber += allocatedPod['pending']
    let capacityCreateContainer = canCreateContainer + allocatedPodNumber
    //Options
    let appOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '50%',
        top: 'middle',
        data: [{ name: '运行中' }, { name: '已停止' }, { name: '操作中' }],
        formatter: function (name) {
          if (name === '运行中') {
            return name + '  ' + appRunning + ' 个'
          } else if (name === '已停止') {
            return name + '  ' + appStopped + ' 个'
          } else if (name === '操作中') {
            return name + '  ' + appOthers + ' 个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#46b3f8', '#f6575e', '#2abe84'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data: [
          { value: appRunning, name: '运行中' },
          { value: appStopped, name: '已停止' },
          { value: appOthers, name: '操作中', selected: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: true,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
            },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let serviceOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '50%',
        top: 'middle',
        data: [{ name: '运行中' }, { name: '已停止' }, { name: '操作中' }],
        // data: legendData,
        formatter: function (name) {
          if (name === '运行中') {
            return name + '  ' + svcRunning + ' 个'
          } else if (name === '已停止') {
            return name + '  ' + svcStopped + ' 个'
          } else if (name === '操作中') {
            return name + '  ' + svcOthers + ' 个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#46b3f8', '#f6575e', '#2abe84'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data: [
          { value: svcRunning, name: '运行中' },
          { value: svcStopped, name: '已停止' },
          { value: svcOthers, name: '操作中', selected: true },
        ],
        // data: seriesData,
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: true,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
            },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let containerOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '50%',
        top: 'middle',
        data: [{ name: '运行中' }, { name: '异常' }, { name: '操作中' }],
        formatter: function (name) {
          if (name === '运行中') {
            return name + '  ' + conRunning + '个'
          } else if (name === '异常') {
            return '异   常  ' + conFailed + ' 个'
          } else if (name === '操作中') {
            return name + '  ' + conOthers + ' 个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#46b3f8', '#f6575e', '#2abe84'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data: [
          { value: conRunning, name: '运行中' },
          { value: conFailed, name: '异常' },
          { value: conOthers, name: '操作中', selected: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: true,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
            },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let CPUOption = {
      title: {
        text: 'CPU',
        top: '15px',
        left: 'center',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 13
        }
      },
      color: ['#46b2fa'],
      tooltip: {
        width: '100px',
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          let content = '';
          for (let i = 0; i < params.length; i++) {
            if (params[i].name) {
              content += "<div>" + CPUResourceName[params[i]['dataIndex']];
              break;
            }
          }
          for (let i = 0, key = {}; i < params.length; i++) {
            key = params[i];
            if (typeof key.value === 'undefined' || key.value === '-')
              key.value = '暂无';
            content += key.seriesName + " : " + key.value + "%";
          }
          content += '</div>';

          //return出去后echarts会调用html()函数将content字符串代码化
          return content;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: CPUNameArr,
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
      yAxis: [
        {
          type: 'value',
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
      series: [
        {
          name: '',
          type: 'bar',
          barWidth: 16,
          data: CPUUsedArr,
        }
      ]
    }
    let memoryOption = {
      title: {
        text: '内存',
        top: '15px',
        left: 'center',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 13,
          color: '#666'
        }
      },
      color: ['#46b2fa'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          let content = '';
          for (let i = 0; i < params.length; i++) {
            if (params[i].name) {
              content += "<div>" + memoryResourceName[params[i]['dataIndex']];
              break;
            }
          }
          for (let i = 0, key = {}; i < params.length; i++) {
            key = params[i];
            if (typeof key.value === 'undefined' || key.value === '-')
              key.value = '暂无';
            content += key.seriesName + " : " + key.value + "%";
          }
          content += '</div>';

          //return出去后echarts会调用html()函数将content字符串代码化
          return content;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: memoryNameArr,
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
      yAxis: [
        {
          type: 'value',
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
      series: [
        {
          name: '',
          type: 'bar',
          barWidth: 16,
          data: memoryUsedArr,

        }
      ]
    }
    let diskOption = {
      title: {
        text: '磁盘',
        top: '15px',
        left: 'center',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 13,
          color: '#666'
        }
      },
      color: ['#46b2fa'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (!clusterNodeSummary.storage || clusterNodeSummary.storage.length === 0) ? '{c}' : '{b} : {c}%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: diskNameArr,
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
            // rotate: 45,
          },
        }
      ],
      yAxis: [
        {
          type: 'value',
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
      series: [
        {
          name: '',
          type: 'bar',
          barWidth: 16,
          data: diskUsedArr,

        }
      ]
    }
    let statusOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b} : ({d}%)' //function (obj) {
        // if(obj.data.cpu)  {
        //   if (obj.name == '已使用') {
        //     return　`已使用${usedCPU}核`
        //   } else {
        //     return `可使用${((capacityCPU * 100 - usedCPU * 100)/100).toFixed(2)}核`
        //   }
        // }
        // if(obj.data.memory){
        //   if (obj.name == '已使用') {
        //     return  `已使用${usedMemory}GB`
        //   } else {
        //     return  `可使用${((capacityMemory * 100 - usedMemory * 100) / 100).toFixed(2)}GB`
        //   }
        // }
        // if(obj.data.volume) {
        //   if (obj.name == '已使用') {
        //     return `已使用${volumeUsed}GB`
        //   } else {
        //     return `可使用${((volumeCapacity * 100 - volumeUsed * 100 ) / 100).toFixed(2)}GB`
        //   }
        // }
        // }
      },
      // legend: {
      //   left: '50%',
      //   top: '50%',
      //   x: 'left',
      //   itemWidth: '48px',
      //   itemHeight: '31px',
      //   data: [{ name: 'cpu' }, { name: '内存' }, { name: '存储' }]
      // },
      series: [{
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['19', '28'],
        center: ['17%', '50%'],
        data: [
          { value: cpuUsedPrecent, name: '已使用', selected: true, cpu: true },
          { value: 100 - cpuUsedPrecent, name: '可使用', cpu: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,

          },
          emphasis: {
            show: true,
            position: 'center',
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            },
            formatter: function (param) {
              return param.percent.toFixed(0) + '%'
            },
            // formatter: function (param) {
            //   if (param.name == '已使用') {
            //     return 　`${usedCPU}核`
            //   } else {
            //     return `${((capacityCPU * 100 - usedCPU * 100)/100).toFixed(2)}核`
            //   }
            // },
          }
        },
        itemStyle: {
          normal: {
            color: function (params) {
              var colorList = [
                '#44b3fa', '#2abe84', '#FCCE10', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ];
              return colorList[params.dataIndex]
            },
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 7,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          }
        }
      }, {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['19', '28'],
        center: ['50%', '50%'],
        data: [
          { value: memoryUsedPrecent, name: '已使用', selected: true, memory: true },
          { value: 100 - memoryUsedPrecent, name: '可使用', memory: true }
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: true,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%'
            },
            // formatter: function (param) {
            //   if (param.name == '已使用') {
            //     return `${usedMemory}GB`
            //   } else {
            //     return `${((capacityMemory * 100 - usedMemory * 100) / 100).toFixed(2)}GB`
            //   }
            // },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            color: function (params) {
              var colorList = [
                '#44b3fa', '#2abe84', '#FCCE10', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ];
              return colorList[params.dataIndex]
            },
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          }
        }
      }, {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['19', '28'],
        center: ['83%', '50%'],
        data: [
          { value: volumeUsedPrecent, name: '已使用', selected: true, volume: true },
          { value: 100 - volumeUsedPrecent, name: '可使用', volume: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: true,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%'
            },
            // formatter: function (param) {
            //   if (param.name == '已使用') {
            //     return `${volumeUsed}GB`
            //   } else {
            //     return `${((volumeCapacity * 100 - volumeUsed * 100 ) / 100).toFixed(2)}GB`
            //   }
            // },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            color: function (params) {
              var colorList = [
                '#44b3fa', '#2abe84', '#FCCE10', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ];
              return colorList[params.dataIndex]
            },
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          }
        }
      }]
    }

    const img = userName.substr(0, 1).toUpperCase()
    return (
      <div id='Ordinary'>
        <Row className="title">{spaceName || this.props.userName} - {clusterName}集群</Row>
        {loginUser.role  == 2?
        <Row className="content" gutter={16}>
          <Col span={6} className='clusterCost'>
            <Card
              title={
                this.props.userName
                  ? '帐户余额（当前登录用户）'
                  : '帐户余额'
              }
              bordered={false}
              bodyStyle={{ height: 220, padding: '36px 24px' }}
            >
              <div className='costInfo'>
                <div className='loginUser'>
                  <div className='logAvatar'>
                    <Link to='/account'>
                      <span style={{ color: 'white' }}>{img}</span>
                      {/*<img alt={userName} src={`${AVATAR_HOST}${avatar}`} />*/}
                    </Link>
                  </div>
                  <div className="loginText">
                    <div className="text">
                      <Link to='/account'>
                        <p className="userName">
                          {userName}
                        </p>
                      </Link>
                      <Tooltip title={email}>
                        <p className="email">{email || '...'}</p>
                      </Tooltip>
                    </div>
                  </div>
                  {/*<div className='loginTag'>个人</div>*/}
                  <div style={{ clear: 'both' }}></div>
                </div>
                <div>
                  <div className='userCost'>
                    <div>
                      <i style={{ backgroundColor: '#46b2fa' }}></i>
                      {this.state.isTeam ? '团队余额' : '我的余额'}：
                    </div>
                    <span className='costNum'>
                      <Tooltip title={parseAmount(clusterNodeSpaceConsumption.balance).amount + 'T'}>
                        <span>{parseAmount(clusterNodeSpaceConsumption.balance).amount} T</span>
                      </Tooltip>
                    </span>
                    {/*<Link to='/account'><Button type='primary'>去充值</Button></Link>*/}
                  </div>
                  <div className='userCost'>
                    <div>
                      <i style={{ backgroundColor: '#28bd83' }}></i>
                      今日消费：
                    </div>
                    <span className='costNum'>
                      <Tooltip title={parseAmount(clusterNodeSpaceConsumption.consumption).amount + 'T'}>
                        <span>{parseAmount(clusterNodeSpaceConsumption.consumption).amount} T</span>
                      </Tooltip>
                      &nbsp;
                      <Tooltip title="全区域"><Icon type="question-circle-o" /></Tooltip>
                    </span>
                    <Link to='/account/costCenter#consumptions'><Button type='primary'>去查看</Button></Link>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6} className='clusterStatus'>
            <Card title="本集群资源分配状况" bordered={false} bodyStyle={{ height: 220, padding: '0 24px' }}>
              <div className='clusterStatusTitle'>
                计算与存储
              </div>
              <ReactEcharts
                notMerge={true}
                option={statusOption}
                style={{ height: '80px' }}
                showLoading={isFetching}
              />
              <div className='clusterStatusDetail'>
                <table cellPadding={0} cellSpacing={0} style={{ width: '100%', textAlign: 'center', fontSize: '14px', marginBottom: '5px' }} >
                  <tbody>
                    <tr>
                      <Tooltip title={`${usedCPU}核/${capacityCPU}核`}><td>({cpuUsedPrecent}%)</td></Tooltip>
                      <Tooltip title={`${usedMemory}GB/${capacityMemory}GB`}><td>({memoryUsedPrecent}%)</td></Tooltip>
                      <Tooltip title={`${volumeCapacity}GB/${volumeUsed}GB`}><td>({volumeUsedPrecent}%)</td></Tooltip>
                    </tr>
                    <tr>
                      <td>CPU</td>
                      <td>内存</td>
                      <td>存储</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className='statusBottomcontent'>
                <div className='statusBottomleft'>
                  <span className='statusBottomItem'>容器</span>
                  <Tooltip title={<div><div>容器可用配额是按照最小容器配置（512M内存）计算；</div><div>本集群容器可用配额（个）=本集群可用内存（M）/512M；</div></div>}>
                    <Icon type="question-circle-o" style={{ margin: '0 7px', cursor: 'pointer' }} />
                  </Tooltip>
                </div>
                <div className='statusBottomright'>
                  <Progress percent={memoryUsedPrecent} strokeWidth={11} className='statusBottomrightitem' showInfo={false} />
                </div>
                <Tooltip title={<div>{`已创建容器 ${isNaN(allocatedPodNumber) ? '-' : allocatedPodNumber} 个（含系统），还可创建 ${isNaN(allocatedPodNumber) ? '-' : canCreateContainer} 个`}</div>}>
                  <div className='statusBottomthird' >
                    {`已创建容器 ${isNaN(allocatedPodNumber) ? '-' : allocatedPodNumber} 个（含系统），还可创建 ${isNaN(allocatedPodNumber) ? '-' : canCreateContainer} 个`}
                  </div>
                </Tooltip>
              </div>
            </Card>
          </Col>
          <Col span={6} className='sysState'>
            <Spin spinning={isFetching}>
              <Card title="系统状态" bordered={false} bodyStyle={{ height: 220 }}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homekubernetes" />
                        </svg>
                        Kubernetes
                    </td>
                      <td>
                        <SvcState currentState={clusterSysinfo.k8s.status} />
                      </td>
                      {/*<td style={{ textAlign: 'right', paddingRight: 10 }}>
                        {clusterSysinfo.k8s.version}
                      </td>*/}
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homewww" />
                        </svg>
                        DNS
                    </td>
                      <td>
                        <SvcState currentState={clusterSysinfo.dns.status} />
                      </td>
                      {/*<td style={{ textAlign: 'right', paddingRight: 10 }}>
                        {clusterSysinfo.dns.version}
                      </td>*/}
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#engine" />
                        </svg>
                        API Server
                    </td>
                      <td>
                        <SvcState currentState={clusterSysinfo.apiserver.status} />
                      </td>
                      {/*<td style={{ textAlign: 'right', paddingRight: 10 }}>
                        {clusterSysinfo.apiserver.version}
                      </td>*/}
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#cicd" />
                        </svg>
                        Monitor
                    </td>
                      <td>
                        <SvcState currentState={clusterSysinfo.monitor.status} />
                      </td>
                      {/*<td style={{ textAlign: 'right', paddingRight: 10 }}>
                        {clusterSysinfo.monitor.version}
                      </td>*/}
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homelogging" />
                        </svg>
                        Logging
                    </td>
                      <td>
                        <SvcState currentState={clusterSysinfo.logging.status} />
                      </td>
                      {/*<td style={{ textAlign: 'right', paddingRight: 10 }}>
                        {clusterSysinfo.logging.version}
                      </td>*/}
                    </tr>
                  </tbody>
                </table>
              </Card>
            </Spin>
          </Col>
          <Col span={6} className='clusterRecord'>
            <Card title="今日该集群记录" bordered={false} bodyStyle={{ height: 220 }}>
              <div style={{ overflowY: 'auto', height: '172px' }}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        创建应用
                    </td>
                      <td className="recordNum">
                        {clusterOperations.appCreate} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeservicecount" />
                        </svg>
                        创建服务
                    </td>
                      <td className="recordNum">
                        {clusterOperations.svcCreate} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homesavecount" />
                        </svg>
                        创建存储卷
                    </td>
                      <td className="recordNum">
                        {clusterOperations.volumeCreate} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        停止应用
                    </td>
                      <td className="recordNum">
                        {clusterOperations.appStop} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeservicecount" />
                        </svg>
                        删除服务
                    </td>
                      <td className="recordNum">
                        {clusterOperations.svcDelete} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homesavecount" />
                        </svg>
                        删除存储卷
                    </td>
                      <td className="recordNum">
                        {clusterOperations.volumeDelete} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        修改应用
                    </td>
                      <td className="recordNum">
                        {clusterOperations.appModify} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        启动应用
                    </td>
                      <td className="recordNum">
                        {clusterOperations.appStart} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        重新部署
                    </td>
                      <td className="recordNum">
                        {clusterOperations.appRedeploy} 个
                    </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>
        </Row>:''}
        <Row className="content" gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <Card title="应用" bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
              <ReactEcharts
                notMerge={true}
                option={appOption}
                style={{ height: '180px' }}
                showLoading={isFetching}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="服务" bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
              <ReactEcharts
                notMerge={true}
                option={serviceOption}
                style={{ height: '180px' }}
                showLoading={isFetching}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="容器" bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
              <ReactEcharts
                notMerge={true}
                option={containerOption}
                style={{ height: '180px' }}
                showLoading={isFetching}
              />
            </Card>
          </Col>
          <Col span={6} className='storage'>
            <Card title="存储" bordered={false} bodyStyle={{ height: 180, padding: '0px 20px 0px 0px' }}>
              <ProgressBox boxPos={boxPos} />
              <Col span={12} className='storageInf'>
                <div className="storageInfList">
                  <Row className='storageInfItem'>
                    <Col span={12}>已用 <Tooltip title="当前已用配额"><Icon type="question-circle-o" /></Tooltip></Col>
                    <Col span={12} style={{ textAlign: 'right' }}>{this.handleSize(clusterStorage.usedSize)}</Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={12}>可用 <Tooltip title="当前可用配额"><Icon type="question-circle-o" /></Tooltip></Col>
                    <Col span={12} style={{ textAlign: 'right' }}>{this.handleSize(clusterStorage.freeSize)}</Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={12}>存储卷</Col>
                    <Col span={12} style={{ textAlign: 'right' }}>{clusterStorage.totalCnt} 个</Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={12}>使用中</Col>
                    <Col span={12} style={{ textAlign: 'right' }}>{clusterStorage.usedCnt} 个</Col>
                  </Row>
                </div>
              </Col>
            </Card>
          </Col>
        </Row>
        <Row className="content" gutter={16} style={{ marginTop: 16 }}>
          {clustername == 'huawei' ? <div></div> : <Col span={6} className='dataBase'>
            <Card title="数据库与缓存" bordered={false} bodyStyle={{ height: 200, padding: '15px 24px' }}>
              {statefulAppMenus}
              <Row style={{ display: this.state.tab1 ? 'block' : 'none', height: 130 }}>
                <Col span={12} className='dbImg'>
                  <img src={homeMySQL} alt="MySQL" />
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#46b2fa' }}></div>
                          运行中
          </td>
                        <td className="dbNum">
                          {this.state.mySQLRunning} 个
          </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#f6575e' }}></div>
                          已停止
          </td>
                        <td className="dbNum">
                          {this.state.mySQLStopped} 个
          </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#28bd83' }}></div>
                          操作中
          </td>
                        <td className="dbNum">
                          {this.state.mySQLOthers} 个
          </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{ display: this.state.tab2 ? 'block' : 'none', height: 130 }}>
                <Col span={12} className='dbImg'>
                  <img src={homeMongoCluster} alt="MongoCluster" />
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#46b2fa' }}></div>
                          运行中
          </td>
                        <td className="dbNum">
                          {this.state.mongoRunning} 个
          </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#f6575e' }}></div>
                          已停止
          </td>
                        <td className="dbNum">
                          {this.state.mongoStopped} 个
          </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#28bd83' }}></div>
                          操作中
          </td>
                        <td className="dbNum">
                          {this.state.mongoOthers} 个
          </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{ display: this.state.tab3 ? 'block' : 'none', height: 130 }}>
                <Col span={12} className='dbImg'>
                  <img src={homeRedis} alt="Redis" />
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#46b2fa' }}></div>
                          运行中
          </td>
                        <td className="dbNum">
                          {this.state.redisRunning} 个
          </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#f6575e' }}></div>
                          已停止
          </td>
                        <td className="dbNum">
                          {this.state.redisStopped} 个
          </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#28bd83' }}></div>
                          操作中
          </td>
                        <td className="dbNum">
                          {this.state.redisOthers} 个
          </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
            </Card>
          </Col>}
          {loginUser.role == 2?
          <Col span={clustername == 'huawei' ? 24 : 18} className="hostState">
            <Card title={
              <span>计算资源使用率<div style={{ width: 30, display: 'inline-block' }}></div><span style={{ fontSize: '12px', color: '#666' }}>Tips: 显示使用率前三的节点</span></span>
            } bordered={false} bodyStyle={{ height: 200, padding: '0px 20px' }}>
              <Row gutter={16} style={{ height: 200 }}>
                <Col span={8}>
                  <ReactEcharts
                    notMerge={true}
                    option={CPUOption}
                    style={{ height: '200px' }}
                    showLoading={isFetching}
                  />
                </Col>
                <Col span={8}>
                  <ReactEcharts
                    notMerge={true}
                    option={memoryOption}
                    style={{ height: '200px' }}
                    showLoading={isFetching}
                  />
                </Col>
                <Col span={8} style={{ borderLeft: '1px solid #e2e2e2', height: '200px' }}>
                  <Row style={{ fontSize: '14px', textAlign: 'center', height: 60, lineHeight: '60px' }}>主机状态</Row>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#43b4f6' }}></div>
                          主机总数
                      </td>
                        <td className="hostNum">
                          {clusterNodeSummary.nodeInfo ? clusterNodeSummary.nodeInfo.total : 0} 个
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#2abe84' }}></div>
                          健康主机数
                      </td>
                        <td className="hostNum">
                          {clusterNodeSummary.nodeInfo ? clusterNodeSummary.nodeInfo.health : 0} 个
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#a2d8fa' }}></div>
                          未启用主机数
                      </td>
                        <td className="hostNum">
                          {clusterNodeSummary.nodeInfo ? clusterNodeSummary.nodeInfo.unused : 0} 个
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
            </Card>
          </Col>
          :""}
        </Row>
        <MySpace spaceName={spaceName} />
      </div>
    )
  }
}

function setMap(map, key) {
  if (map.get(key) == undefined) {
    map.set(key, 1)
  } else {
    map.set(key, map.get(key) + 1)
  }
}

function getStatus(data) {
  let appMap = new Map()
  let svcMap = new Map()
  let podMap = new Map()

  for (let appName in data) {
    let services = data[appName].deployments
    let pods = data[appName].pods
    let status = getAppStatus(services)
    setMap(appMap, status.phase)
    services.map(service => {
      status = getServiceStatus(service)
      setMap(svcMap, status.phase)
    })
    pods.map(pod => {
      status = getContainerStatus(pod)
      setMap(podMap, status.phase)
    })
  }
  return { appMap, svcMap, podMap }
}

function getDbServiceStatus(data) {
  let dbServiceMap = new Map()
  dbServiceMap.set("mysql", new Map())
  dbServiceMap.set("mongo", new Map())
  dbServiceMap.set("redis", new Map())
  dbServiceMap.set("zookeeper", new Map())
  dbServiceMap.set("elasticsearch", new Map())
  dbServiceMap.set("etcd", new Map())

  data.statefulSet.map(petSet => {
    let key = "unknown"
    if (petSet.objectMeta && petSet.objectMeta.labels
      && petSet.objectMeta.labels['tenxcloud.com/petsetType']) {
      key = petSet.objectMeta.labels['enncloud.com/statefulSetType']
    }

    let map = dbServiceMap.get(key)
    if (map && petSet.pods) {
      if (petSet.pods.failed != 0) {
        setMap(map, "failed")
      } else if (petSet.pods.pending != 0) {
        setMap(map, "pending")
      } else if (petSet.pods.running == petSet.pods.desired) {
        setMap(map, "running")
      } else {
        setMap(map, "unknown")
      }
    }
  })
  return dbServiceMap
}

function mapStateToProp(state, props) {
  const { current, loginUser } = state.entities
  //clustername zhang
  let clustername = ''
  let clusterOperationsData = {
    appCreate: 0,
    appModify: 0,
    svcCreate: 0,
    svcDelete: 0,
    appStop: 0,
    appStart: 0,
    appRedeploy: 0,
    volumeCreate: 0,
    volumeDelete: 0,
  }
  let clusterSysinfoData = {
    k8s: {
      version: "",
      status: ""
    },
    dns: {
      version: "",
      status: ""
    },
    apiserver: {
      version: "",
      status: ""
    },
    monitor: {
      version: "",
      status: ""
    },
    logging: {
      version: "",
      status: ""
    }
  }
  let clusterStorageData = {
    freeSize: 0,
    totalCnt: 0,
    usedCnt: 0,
    usedSize: 0,
  }
  let clusterAppStatusData = {
    appMap: new Map(),
    svcMap: new Map(),
    podMap: new Map(),
  }
  let clusterDbServicesData = new Map()
  clusterDbServicesData.set("mysql", new Map())
  clusterDbServicesData.set("mongo", new Map())
  clusterDbServicesData.set("redis", new Map())
  clusterDbServicesData.set("zookeeper", new Map())
  clusterDbServicesData.set("elasticsearch", new Map())
  clusterDbServicesData.set("etcd", new Map())

  let clusterNodeSummaryData = {
    nodeInfo: {
      total: 0,
      health: 0,
      unused: 0
    },
    cpu: [],
    memory: [],
    storage: [],
  }
  let clusterNodeSpaceConsumption = {
    balance: 0,
    consumption: 0,
  }
  let clusterSummaryInit = {
    capacity: {
      cpu: 1,
      memory: 1
    },
    used: {
      cpu: 0,
      memory: 0
    }
  }
  let clusterStaticSummary = {
    pod: {

    }
  }
  let volumeSummary = {
    used: '0',
    available: '0',
    total: '1',
    allocated: '0'
  }
  const { clusterOperations, clusterSysinfo, clusterStorage,
    clusterAppStatus, clusterDbServices, clusterNodeSummary, clusterInfo, clusterSummary } = state.overviewCluster
  const isFetching = clusterInfo.isFetching
  if (clusterSummary.result && clusterSummary.result.clusterSummary) {
    clusterSummaryInit = clusterSummary.result.clusterSummary
  }
  //clustername zhang
  const { entities } = state
  if (entities && entities.current && entities.current.cluster && entities.current.cluster && entities.current.cluster.clusterName) {
    clustername = entities.current.cluster.clusterName
  }
  if (clusterSummary.result && clusterSummary.result.volumeSummary && clusterSummary.result.volumeSummary.total) {
    volumeSummary = clusterSummary.result.volumeSummary
  }
  if (clusterInfo.result && clusterInfo.result) {
    if (clusterInfo.result.operations) {
      if (clusterInfo.result.operations.app) {
        let data = clusterInfo.result.operations.app
        if (data.appCreate) {
          clusterOperationsData.appCreate = data.appCreate
        }
        if (data.appModify) {
          clusterOperationsData.appModify = data.appModify
        }
        if (data.svcCreate) {
          clusterOperationsData.svcCreate = data.svcCreate
        }
        if (data.svcDelete) {
          clusterOperationsData.svcDelete = data.svcDelete
        }
        if (data.appStop) {
          clusterOperationsData.appStop = data.appStop
        }
        if (data.appStart) {
          clusterOperationsData.appStart = data.appStart
        }
        if (data.appCreate) {
          clusterOperationsData.appCreate = data.appCreate
        }
        if (data.appRedeploy) {
          clusterOperationsData.appRedeploy = data.appRedeploy
        }
      }
      if (clusterInfo.result.operations.volume) {
        let data = clusterInfo.result.operations.volume
        if (data.volumeCreate) {
          clusterOperationsData.volumeCreate = data.volumeCreate
        }
        if (data.volumeDelete) {
          clusterOperationsData.volumeDelete = data.volumeDelete
        }
      }
    }
    if (clusterInfo.result.sysinfo) {
      let data = clusterInfo.result.sysinfo
      if (data.k8s) {
        if (data.k8s.version) {
          clusterSysinfoData.k8s.version = data.k8s.version
        }
        if (data.k8s.status) {
          clusterSysinfoData.k8s.status = data.k8s.status
        }
      }
      if (data.dns) {
        if (data.dns.version) {
          clusterSysinfoData.dns.version = data.dns.version
        }
        if (data.dns.status) {
          clusterSysinfoData.dns.status = data.dns.status
        }
      }
      if (data.apiserver) {
        if (data.apiserver.version) {
          clusterSysinfoData.apiserver.version = data.apiserver.version
        }
        if (data.apiserver.status) {
          clusterSysinfoData.apiserver.status = data.apiserver.status
        }
      }
      if (data.monitor) {
        if (data.monitor.version) {
          clusterSysinfoData.monitor.version = data.monitor.version
        }
        if (data.monitor.status) {
          clusterSysinfoData.monitor.status = data.monitor.status
        }
      }
      if (data.logging) {
        if (data.logging.version) {
          clusterSysinfoData.logging.version = data.logging.version
        }
        if (data.logging.status) {
          clusterSysinfoData.logging.status = data.logging.status
        }
      }
    }
    if (clusterInfo.result.storage) {
      let data = clusterInfo.result.storage
      if (data.freeSize) {
        clusterStorageData.freeSize = data.freeSize
      }
      if (data.totalCnt) {
        clusterStorageData.totalCnt = data.totalCnt
      }
      if (data.usedCnt) {
        clusterStorageData.usedCnt = data.usedCnt
      }
      if (data.usedSize) {
        clusterStorageData.usedSize = data.usedSize
      }
    }
    if (clusterInfo.result.appstatus) {
      let data = clusterInfo.result.appstatus
      clusterAppStatusData = getStatus(data)
    }
    if (clusterInfo.result.dbservices) {
      let data = clusterInfo.result.dbservices
      clusterDbServicesData = getDbServiceStatus(data)
    }
    if (clusterInfo.result.nodesummary) {
      clusterNodeSummaryData = clusterInfo.result.nodesummary
    }
    if (clusterInfo.result.spaceconsumption) {
      clusterNodeSpaceConsumption.balance = clusterInfo.result.spaceconsumption.balance
      clusterNodeSpaceConsumption.consumption = clusterInfo.result.spaceconsumption.consumption
    }
    if (clusterInfo.result.clusterStaticSummary) {
      clusterStaticSummary = clusterInfo.result.clusterStaticSummary
    }
  }

  let databaseList = []
  const { databaseAllRedisList } = state.databaseCache
  if (databaseAllRedisList.mysql) {
    databaseList = databaseAllRedisList.mysql.databaseList
  }
  return {
    current,
    databaseList: databaseList,
    loginUser: loginUser.info,
    clusterOperations: clusterOperationsData,
    clusterSysinfo: clusterSysinfoData,
    clusterStorage: clusterStorageData,
    clusterAppStatus: clusterAppStatusData,
    clusterDbServices: clusterDbServicesData,
    clusterNodeSummary: clusterNodeSummaryData,
    clusterNodeSpaceConsumption: clusterNodeSpaceConsumption,
    volumeSummary,
    clusterSummary: clusterSummaryInit,
    clusterStaticSummary,
    isFetching,
    clustername,
  }
}

export default connect(mapStateToProp, {
  loadStatefulsets,
  loadDbCacheRedisList,
  loadClusterInfo,
  loadClusterSummary
})(Ordinary)
