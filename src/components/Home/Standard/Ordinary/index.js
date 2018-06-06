/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/16
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Radio, Icon, Spin, Tooltip, Button, Modal, Select } from 'antd'
import './style/Ordinary.less'
import ReactEcharts from 'echarts-for-react'
import MySpace from './MySpace'
import { getAppStatus, getServiceStatus, getContainerStatus } from '../../../../common/status_identify'
import { connect } from 'react-redux'
import { loadStdClusterInfo } from '../../../../actions/overview_cluster'
import ProgressBox from '../../../ProgressBox'
import { Link } from 'react-router'
import { parseAmount } from '../../../../common/tools'
import { AVATAR_HOST } from '../../../../constants'
import homeMySQL from '../../../../assets/img/homeMySQL.png'
import homeMongoCluster from '../../../../assets/img/homeMongoCluster.png'
import homeRedis from '../../../../assets/img/homeRedis.png'
import homeZookeeper from '../../../../assets/img/homeZookeeper.png'
import homeElasticSearch from '../../../../assets/img/homeElasticSearch.png'
import homeEtcd from '../../../../assets/img/homeEtcdCluster.png'

function getClusterCostOption(costValue, restValue) {
  return {
    tooltip : {
      trigger: 'item',
      formatter: "{b} : {c}<br/> ({d}%)"
    },
    legend: {
      orient : 'vertical',
      left : '60%',
      top : '30%',
      data:[{name:'余额'}, {name:'消费'}],
      formatter: function (name) {
        if(name === '余额'){
          return name + '：￥' + restValue
        } else {
          return name + '：￥' + costValue
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
    color: ['#46b2fa', '#2abe84'],
    series : [
      {
        name:'',
        type:'pie',
        selectedMode: 'single',
        selectedOffset: 0,
        radius : '42%',
        center: ['32%', '50%'],
        data:[
          {value:0, name:'余额'},
          {value:0, name:'消费',selected:true},
        ],
        label: {
          normal: {
            show:true,
            position: 'inside',
          },
        },
        labelLine: {
          normal:{
            show: true,
            length:3,
            length2:3,
          },
        },
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
  getInitialState(){
    return {

    }
  },
  render: function(){
    const { currentState } = this.props
    let item
    if(currentState === 'normal'){
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{backgroundColor:'#2eb764'}}></div>
          <span style={{color:'#2eb865'}}>正常</span>
        </div>
      )
    }
    if(currentState === 'warning'){
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{backgroundColor:'#f0986b'}}></div>
          <span style={{color:'#f0986b'}}>警告</span>
        </div>
      )
    }
    if(currentState === 'abnormal'){
      item = (
        <div>
          <Icon type="exclamation-circle" style={{color:'#f85a59'}} className='errorDot'/>
          <span style={{color:'#f85a59'}}>异常</span>
        </div>
      )
    }
    return (
      <div id='SvcState'>
        { item }
      </div>
    )
  }
})

class Ordinary extends Component{
  constructor(props){
    super(props)
    this.handleSize = this.handleSize.bind(this)
    this.thousandBitSeparator = this.thousandBitSeparator.bind(this)
    this.closeNavModal = this.closeNavModal.bind(this)
    this.state = {
      tab1: true,
      tab2: false,
      tab3: false,
      tab4: false,
      tab5: false,
      tab6: false,
      isTeam: false,
      statefulApp: 'mysql',
      oldTestingKonwShow: false,
      newTestingKonwShow: false
    }
  }

  componentWillMount() {
    const {loginUser} = this.props
    const {migrated, displayName} = loginUser
    let testingKnowFlag = window.localStorage.getItem(`testingKnowFlag${displayName}`)
    if(!Boolean(testingKnowFlag)) {
      if(migrated != 1) {
        this.setState({
          newTestingKonwShow: true
        });
      } else {
        this.setState({
          oldTestingKonwShow: true
        })
      }
      window.localStorage.setItem(`testingKnowFlag${displayName}`, true)
      window.localStorage.setItem('userMigratedType', migrated)
    }
  }
  componentDidMount(){
    const { loadStdClusterInfo, current } = this.props
    const {clusterID} = current.cluster
    loadStdClusterInfo(clusterID)
  }
  componentWillReceiveProps(nextProps){
    const { loadStdClusterInfo } = this.props
    const {current} = nextProps
    const {clusterID} = current.cluster
    if(clusterID !== this.props.current.cluster.clusterID){
      loadStdClusterInfo(clusterID)
      return
    }
    if(current.team.teamID !== 'default') {
      this.setState({
        isTeam: true
      })
    }
  }

  thousandBitSeparator(num) {
    return num && (num
        .toString().indexOf('.') != -1 ? num.toString().replace(/(\d)(?=(\d{3})+\.)/g, function($0, $1) {
        return $1 + ",";
      }) : num.toString().replace(/(\d)(?=(\d{3}))/g, function($0, $1) {
        return $1 + ",";
    }));
  }
  handleSize(size){
    if(!size){
      return 0 + ' MB'
    }
    let result = 0
    if(size < 1024){
      return size + ' MB'
    }
    if(size < 1024*1024){
      /*result = this.thousandBitSeparator((size/1024).toFixed(2))*/
      result = this.thousandBitSeparator(Math.floor(size/1024 *100) /100)
      return result + ' GB'
    }
    if(size < 1024*1024*1024){
      /*result = this.thousandBitSeparator((size/(1024*1024)).toFixed(2))*/
      result = this.thousandBitSeparator(Math.floor(size/(1024*1024)*100) /100)
      return result + ' T'
    }
    /*result = this.thousandBitSeparator((size/(1024*1024*1024)).toFixed(2))*/
    result = this.thousandBitSeparator(Math.floor(size/(1024*1024*1024)*100) /100)
    return result + ' T'
  }
  closeNavModal() {
    //this function for close test know modal
    this.setState({
      newTestingKonwShow: false,
      oldTestingKonwShow: false,
    })
  }
  render(){
    const {clusterOperations, clusterSysinfo, clusterStorage, clusterAppStatus,clusterDbServices,spaceName,clusterName,clusterNodeSpaceConsumption,loginUser} = this.props
    const { userName, email, avatar, certInfos } = loginUser
    let certName = '个人'
    //判断类别
    if (certInfos && certInfos.length >= 0) {
      let length = certInfos.length
      for (let i = 0; i < length; i++) {
        if (certInfos[i].type == 2 && certInfos[i].status == 4) {
          certName = "企业"
          break
        }
        if (certInfos[i].type == 3 && certInfos[i].status == 4) {
          certName = "组织"
          break
        }
      }
    }
    let boxPos = 0
    if ((clusterStorage.freeSize + clusterStorage.usedSize) > 0) {
      boxPos = (clusterStorage.usedSize/(clusterStorage.freeSize + clusterStorage.usedSize)).toFixed(4)
    }
    //应用
    let appRunning = clusterAppStatus.appMap.get('Running')
    let appStopped = clusterAppStatus.appMap.get('Stopped')
    let appOthers = clusterAppStatus.appMap.get('Unknown') || 0 + clusterAppStatus.appMap.get('Pending') || 0
    //服务
    let svcRunning = clusterAppStatus.svcMap.get('Running')
    let svcStopped = clusterAppStatus.svcMap.get('Stopped')
    let svcOthers = clusterAppStatus.svcMap.get('Deploying')?clusterAppStatus.svcMap.get('Deploying'):0 +
    clusterAppStatus.svcMap.get('Pending')?clusterAppStatus.svcMap.get('Pending'):0
    //容器
    let conRunning = clusterAppStatus.podMap.get('Running')
    let conFailed = clusterAppStatus.podMap.get('Failed') || 0 +
      clusterAppStatus.podMap.get('Abnormal')?clusterAppStatus.podMap.get('Abnormal'):0
    let conOthers = clusterAppStatus.podMap.get('Pending')?clusterAppStatus.podMap.get('Pending'):0 +
    clusterAppStatus.podMap.get('Terminating')?clusterAppStatus.podMap.get('Terminating'):0 +
    clusterAppStatus.podMap.get('Unknown')?clusterAppStatus.podMap.get('Unknown'):0

    appRunning = appRunning ? appRunning:0
    appStopped = appStopped ? appStopped:0
    appOthers = appOthers ? appOthers:0
    svcRunning = svcRunning ? svcRunning:0
    svcStopped = svcStopped ? svcStopped:0
    svcOthers = svcOthers ? svcOthers:0
    conRunning = conRunning ? conRunning:0
    conFailed = conFailed ? conFailed:0
    conOthers = conOthers ? conOthers:0

    //数据库与缓存
    //MySQL
    const mysqlData = clusterDbServices.get('mysql')
    let mySQLRunning = 0
    let mySQLStopped = 0
    let mySQLOthers = 0
    if(mysqlData.size !== 0){
      const failedCount = mysqlData.get('failed')?mysqlData.get('failed'):0
      const pendingCount = mysqlData.get('pending')?mysqlData.get('pending'):0
      const runningCount = mysqlData.get('running')?mysqlData.get('running'):0
      const unknownCount = mysqlData.get('unknown')?mysqlData.get('unknown'):0
      mySQLRunning = runningCount
      mySQLStopped = failedCount + unknownCount
      mySQLOthers = pendingCount
    }
    //Mongo
    const mongoData = clusterDbServices.get('mongo')
    let mongoRunning = 0
    let mongoStopped = 0
    let mongoOthers = 0
    if(mongoData.size !== 0){
      const failedCount = mongoData.get('failed')?mongoData.get('failed'):0
      const pendingCount = mongoData.get('pending')?mongoData.get('pending'):0
      const runningCount = mongoData.get('running')?mongoData.get('running'):0
      const unknownCount = mongoData.get('unknown')?mongoData.get('unknown'):0
      mongoRunning = runningCount
      mongoStopped = failedCount + unknownCount
      mongoOthers = pendingCount
    }
    //Redis
    const redisData = clusterDbServices.get('redis')
    let redisRunning = 0
    let redisStopped = 0
    let redisOthers = 0
    if(redisData.size !== 0){
      const failedCount = redisData.get('failed')?redisData.get('failed'):0
      const pendingCount = redisData.get('pending')?redisData.get('pending'):0
      const runningCount = redisData.get('running')?redisData.get('running'):0
      const unknownCount = redisData.get('unknown')?redisData.get('unknown'):0
      redisRunning = runningCount
      redisStopped = failedCount + unknownCount
      redisOthers = pendingCount
    }
    // Zookeeper
    const zookeeperData = clusterDbServices.get('zookeeper')
    let zookeeperRunning = 0
    let zookeeperStopped = 0
    let zookeeperOthers = 0
    if (zookeeperData.size !== 0) {
      const failedCount = zookeeperData.get('failed') ? zookeeperData.get('failed') : 0
      const pendingCount = zookeeperData.get('pending') ? zookeeperData.get('pending') : 0
      const runningCount = zookeeperData.get('running') ? zookeeperData.get('running') : 0
      const unknownCount = zookeeperData.get('unknown') ? zookeeperData.get('unknown') : 0
      zookeeperRunning = runningCount
      zookeeperStopped = failedCount + unknownCount
      zookeeperOthers = pendingCount
    }
    // ElasticSearch
    const elasticSearchData = clusterDbServices.get('elasticsearch')
    let elasticSearchRunning = 0
    let elasticSearchStopped = 0
    let elasticSearchOthers = 0
    if (elasticSearchData.size !== 0) {
      const failedCount = elasticSearchData.get('failed') ? elasticSearchData.get('failed') : 0
      const pendingCount = elasticSearchData.get('pending') ? elasticSearchData.get('pending') : 0
      const runningCount = elasticSearchData.get('running') ? elasticSearchData.get('running') : 0
      const unknownCount = elasticSearchData.get('unknown') ? elasticSearchData.get('unknown') : 0
      elasticSearchRunning = runningCount
      elasticSearchStopped = failedCount + unknownCount
      elasticSearchOthers = pendingCount
    }
    // Etcd
    const etcdData = clusterDbServices.get('etcd')
    let etcdRunning = 0
    let etcdStopped = 0
    let etcdOthers = 0
    if (etcdData.size !== 0) {
      const failedCount = etcdData.get('failed') ? etcdData.get('failed') : 0
      const pendingCount = etcdData.get('pending') ? etcdData.get('pending') : 0
      const runningCount = etcdData.get('running') ? etcdData.get('running') : 0
      const unknownCount = etcdData.get('unknown') ? etcdData.get('unknown') : 0
      etcdRunning = runningCount
      etcdStopped = failedCount + unknownCount
      etcdOthers = pendingCount
    }
    const statefulApps = {
      mysql: "MySQL",
      redis: "Redis",
      zookeeper: "ZooKeeper",
      elasticsearch: "ElasticSearch",
      etcd: "Etcd",
    }
    const statefulAppTabMapping = {
      mysql: 'tab1',
      mongo: 'tab2',
      redis: 'tab3',
      zookeeper: 'tab4',
      elasticsearch: 'tab5',
      etcd: 'tab6',
    }
    const defaultState = {
      tab1: false,
      tab2: false,
      tab3: false,
      tab4: false,
      tab5: false,
      tab6: false,
      statefulApp: 'MySQL',
    }
    const onStatefulAppOptionClick = function (app) { 
      const tab = statefulAppTabMapping[app]
      const newState = {
        [tab]: true,
        statefulApp: statefulApps[app],
      }
      this.setState(Object.assign({}, defaultState, newState))
    }
    const statefulAppOptions = Object.getOwnPropertyNames(statefulApps).map(
      app => <Select.Option value={app} key={app}>{statefulApps[app]}</Select.Option>)
    const statefulAppMenus = (
      <Select defaultValue={this.state.statefulApp} value={this.state.statefulApp} style={{ width: '80%', margin:'10px 10%' }} onChange={onStatefulAppOptionClick.bind(this)}>
        {statefulAppOptions}
      </Select>
    )
    //Options
    let appOption = {
      tooltip : {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient : 'vertical',
        left : '50%',
        top : 'middle',
        data:[{name:'运行中'}, {name:'已停止'},{name:'操作中'}],
        formatter: function (name) {
          if(name === '运行中'){
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
      color: ['#46b3f8','#f6575e','#2abe84'],
      series: {
        type:'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data:[
          {value:appRunning, name:'运行中'},
          {value:appStopped, name:'已停止'},
          {value:appOthers, name:'操作中',selected:true},
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
      tooltip : {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient : 'vertical',
        left : '50%',
        top : 'middle',
        data:[{name:'运行中'}, {name:'已停止'},{name:'操作中'}],
        // data: legendData,
        formatter: function (name) {
          if(name === '运行中'){
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
      color: ['#46b3f8','#f6575e','#2abe84'],
      series: {
        type:'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data:[
          {value:svcRunning, name:'运行中'},
          {value:svcStopped, name:'已停止'},
          {value:svcOthers, name:'操作中',selected:true},
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
      tooltip : {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient : 'vertical',
        left : '50%',
        top : 'middle',
        data:[{name:'运行中'}, {name:'异常'},{name:'操作中'}],
        formatter: function (name) {
          if(name === '运行中'){
            return name + '  ' + conRunning + ' 个'
          } else if (name === '异常') {
            return name + '     ' + conFailed + ' 个'
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
      color: ['#46b3f8','#f6575e','#2abe84'],
      series: {
        type:'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data:[
          {value:conRunning, name:'运行中'},
          {value:conFailed, name:'异常'},
          {value:conOthers, name:'操作中',selected:true},
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
    return (
      <div id='OrdinaryStd'>
        <Row className="title">{spaceName} - {clusterName}</Row>
        <Row className="content" gutter={16}>
          <Col span={6} className='clusterCost'>
            <Card title="帐户余额" bordered={false}>
              {/*<ReactEcharts
                notMerge={true}
                option={getClusterCostOption(parseAmount(clusterNodeSpaceConsumption.consumption).amount, parseAmount(clusterNodeSpaceConsumption.balance).amount)}
                style={{height:'200px'}}
              />*/}
              <div className='costInfo'>
                <div className='loginUser'>
                  <div className='logAvatar'>
                    <Link to='/account'>
                      <img alt={userName} src={`${AVATAR_HOST}${avatar}`} />
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
                  <div className='loginTag'>{certName}</div>
                  <div style={{ clear: 'both' }}></div>
                </div>
                <div>
                  <div className='userCost'>
                    <div>
                      <i style={{backgroundColor:'#46b2fa'}}></i>
                      {this.state.isTeam ? '团队余额' : '我的余额'}：
                    </div>
                    <span className='costNum'>
                      <Tooltip title={'¥ ' + parseAmount(clusterNodeSpaceConsumption.balance).amount}>
                        <span>¥ {parseAmount(clusterNodeSpaceConsumption.balance).amount}</span>
                      </Tooltip>
                    </span>
                    <Link to='/account/balance/payment'><Button type='primary'>去充值</Button></Link>
                  </div>
                  <div className='userCost'>
                    <div>
                      <i style={{backgroundColor: '#28bd83'}}></i>
                      今日消费：
                    </div>
                    <span className='costNum'>
                      <Tooltip title={'¥ ' + parseAmount(clusterNodeSpaceConsumption.consumption).amount}>
                        <span>¥ {parseAmount(clusterNodeSpaceConsumption.consumption).amount}</span>
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
          <Col span={6}>
            <Card title="应用" bordered={false} bodyStyle={{height:200,padding:'0'}}>
              <ReactEcharts
                notMerge={true}
                option={appOption}
                style={{height:'180px'}}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="服务" bordered={false} bodyStyle={{height:200,padding:'0'}}>
              <ReactEcharts
                notMerge={true}
                option={serviceOption}
                style={{height:'180px'}}
              />
            </Card>
          </Col>
          <Col className='sysState' span={6}>
            <Spin spinning={
              clusterSysinfo.k8s.status === '' ||
              clusterSysinfo.dns.status === '' ||
              clusterSysinfo.apiserver.status === '' ||
              clusterSysinfo.monitor.status === '' ||
              clusterSysinfo.logging.status === ''
            }>
              <Card title="健康状态" bordered={false} bodyStyle={{height:200,padding:'10px 20px 10px 20px'}}>
                <table>
                  <tbody>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#homekubernetes" />
                      </svg>
                      Engine
                    </td>
                    <td>
                      <SvcState currentState={clusterSysinfo.k8s.status} />
                    </td>
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
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#homeapiservice" />
                      </svg>
                      API Server
                    </td>
                    <td>
                      <SvcState currentState={clusterSysinfo.apiserver.status} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#engine" />
                      </svg>
                      Monitor
                    </td>
                    <td>
                      <SvcState currentState={clusterSysinfo.monitor.status} />
                    </td>
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
                  </tr>
                  </tbody>
                </table>
              </Card>
            </Spin>
          </Col>
        </Row>
        <Row className="content" gutter={16} style={{marginTop:16}}>
          <Col span={6}>
            <Card title="容器" bordered={false} bodyStyle={{height:200,padding:'0 24px'}}>
              <ReactEcharts
                notMerge={true}
                option={containerOption}
                style={{height:'180px'}}
              />
            </Card>
          </Col>
          <Col span={6} className='storage'>
            <Card title="存储" bordered={false} bodyStyle={{height:200,padding:'0'}}>
              <ProgressBox boxPos={boxPos}/>
              <Col span={12} className='storageInf'>
                <div className="storageInfList">
                  <Row className='storageInfItem'>
                    <Col span={12}>已用配额</Col>
                    <Col span={12} style={{textAlign:'right'}}>{this.handleSize(clusterStorage.usedSize)}</Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={12}>可用配额</Col>
                    <Col span={12} style={{textAlign:'right'}}>{this.handleSize(clusterStorage.freeSize)}</Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={12}>存储卷</Col>
                    <Col span={12} style={{textAlign:'right'}}>{clusterStorage.totalCnt} 个</Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={12}>使用中</Col>
                    <Col span={12} style={{textAlign:'right'}}>{clusterStorage.usedCnt} 个</Col>
                  </Row>
                </div>
              </Col>
            </Card>
          </Col>
          <Col span={6} className='dataBase'>
            <Card title="数据库与缓存" bordered={false} bodyStyle={{height:200,padding:'15px 20px'}}>
              {statefulAppMenus}
              <Row style={{display: this.state.tab1?'block':'none',height:130}}>
                <Col span={12} className='dbImg'>
                  <img src={homeMySQL} alt="MySQL"/>
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中
                      </td>
                      <td className="dbNum">
                        {mySQLRunning}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#f6575e'}}></div>
                        已停止
                      </td>
                      <td className="dbNum">
                        {mySQLStopped}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td className="dbNum">
                        {mySQLOthers}&nbsp;个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{display: this.state.tab2?'block':'none',height:130}}>
                <Col span={12} className='dbImg'>
                  <img src={homeMongoCluster} alt="MongoCluster"/>
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中
                      </td>
                      <td className="dbNum">
                        {mongoRunning}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#f6575e'}}></div>
                        已停止
                      </td>
                      <td className="dbNum">
                        {mongoStopped}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td className="dbNum">
                        {mongoOthers}&nbsp;个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{display: this.state.tab3?'block':'none',height:130}}>
                <Col span={12} className='dbImg'>
                  <img src={homeRedis} alt="Redis"/>
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中
                      </td>
                      <td className="dbNum">
                        {redisRunning}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#f6575e'}}></div>
                        已停止
                      </td>
                      <td className="dbNum">
                        {redisStopped}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td className="dbNum">
                        {redisOthers}&nbsp;个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{display: this.state.tab4?'block':'none',height:130}}>
                <Col span={12} className='dbImg'>
                  <img src={homeZookeeper} alt="Zookeeper"/>
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中
                      </td>
                      <td className="dbNum">
                        {zookeeperRunning}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#f6575e'}}></div>
                        已停止
                      </td>
                      <td className="dbNum">
                        {zookeeperStopped}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td className="dbNum">
                        {zookeeperOthers}&nbsp;个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{display: this.state.tab5?'block':'none',height:130}}>
                <Col span={12} className='dbImg'>
                  <img src={homeElasticSearch} alt="ElasticSearch"/>
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中
                      </td>
                      <td className="dbNum">
                        {elasticSearchRunning}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#f6575e'}}></div>
                        已停止
                      </td>
                      <td className="dbNum">
                        {elasticSearchStopped}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td className="dbNum">
                        {elasticSearchOthers}&nbsp;个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{display: this.state.tab6?'block':'none',height:130}}>
                <Col span={12} className='dbImg'>
                  <img src={homeEtcd} alt="Etcd"/>
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中
                      </td>
                      <td className="dbNum">
                        {etcdRunning}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#f6575e'}}></div>
                        已停止
                      </td>
                      <td className="dbNum">
                        {etcdStopped}&nbsp;个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td className="dbNum">
                        {etcdOthers}&nbsp;个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={6} className='clusterRecord'>
            <Card title="今日该区域记录" bordered={false} bodyStyle={{height:200}}>
              <div style={{overflowY:'auto',height:'152px'}}>
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
        </Row>
        <MySpace spaceName={spaceName} />
        <Modal visible={this.state.oldTestingKonwShow} className='testingKnowModal' width='600'>
          <div className='titleBox'>
            <p>欢迎使用新智云</p>
            <Icon className='closeBtn' type='cross' onClick={this.closeNavModal} />
          </div>
          <div className='infoBox'>
            <div className='infoDetail'>
              <span className='info'>欢迎使用新智云 2.0 新版本控制台！检测当前为新智云老用户，以下信息与你同步：</span>
            </div>
            <div className='infoDetail'>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;关于余额：</span>
            </div>
            <div className='infoDetail'>
              <div className='numBox' style={{ marginLeft: '12px' }}>1</div>
              <span className='info' style={{ paddingLeft: '5px' }}>在迁移完成之前，新版本与旧版本暂时独立的帐户余额&消费；</span>
            </div>
            <div className='infoDetail'>
              <div className='numBox' style={{ marginLeft: '12px' }}>2</div>
              <span className='info' style={{ paddingLeft: '5px' }}>官方迁移完成后，将合并新老版本的帐户余额及消费相关信息；</span>
            </div>
            <div className='infoDetail'>
              <div className='numBox' style={{ marginLeft: '12px' }}>3</div>
              <span className='info' style={{ paddingLeft: '5px' }}>用户自行迁移的，可提前通过工单申请合并新老版本费用部分；</span>
            </div>
            <div className='infoDetail'>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;关于迁移（即1.x→2.0）：</span>
            </div>
            <div className='infoDetail'>
              <div className='numBox' style={{ marginLeft: '12px' }}>1</div>
              <span className='info' style={{ paddingLeft: '0px' }}>【用户自行】进行迁移 </span>
            </div>
            <div className='infoDetail'>
              <div className='squareIcon'></div>
              <div className='info' style={{ marginLeft: '33px' }}>使用『容器本地』存储类：即无状态的服务，可以直接在新版通过镜像启动即可完成迁移；</div>
            </div>
            <div className='infoDetail'>
              <div className='squareIcon'></div>
              <div className='info' style={{ marginLeft: '33px' }}>通过『存储卷』持久化类：即有状态的服务，可以通过登录终端，将数据通过 SCP 等命令，传输至新版本；</div>
            </div>
            <div className='infoDetail'>
              <div className='numBox' style={{ marginLeft: '12px' }}>2</div>
              <span className='info' style={{ paddingLeft: '0px' }}>【新智云官方】自动迁移  </span>
            </div>
            <div className='infoDetail'>
              <div className='squareIcon'></div>
              <div className='info' style={{ marginLeft: '33px' }}>新智云团队会在通知的迁移日期，自动将旧平台的运行应用迁移至新平台Portal；</div>
            </div>
            <div className='infoDetail'>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;更多详细迁移说明&amp;指南，请<a href="http://docs.paas.enncloud.cn/guide/upgradeTo2.0" target="_blank">点击这里查看</a>；</span>
            </div>
          </div>
          <div className='btnBox'>
            <div className='knowBtn' onClick={this.closeNavModal}>
              <span>知道了</span>
            </div>
          </div>
        </Modal>
        <Modal visible={this.state.newTestingKonwShow} className='testingKnowModal' width='600'>
          <div className='titleBox'>
            <p>欢迎使用新智云</p>
            <Icon className='closeBtn' type='cross' onClick={this.closeNavModal} />
          </div>
          <div className='infoBox'>
            <div className='infoDetail'>
              <span className='info'>欢迎使用新智云 2.0 新版本 Portal 控制台，这里你几乎可以实现关于容器的一切想法，快来体验新时代的云计算平台吧！ </span>
            </div>
            <div className='infoDetail' style={{ marginTop: '20px', marginBottom: '10px' }}>
              <span className='info'>为了让你更好的上手新智云平台，我们做了一些小Demo，请享用！</span>
            </div>
            <div className='infoDetail' style={{ lineHeight: '30px' }}>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;了解容器&Kubernetes&云计算相关知识&nbsp;→&nbsp;<a href='http://docs.paas.enncloud.cn/guide/concepts' target="_blank"><span style={{ color: '#00A1EA',cursor: 'pointer' }}>点击这里</span></a>；</span>
            </div>
            <div className='infoDetail' style={{ lineHeight: '30px' }}>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;创建我的第一个容器小应用&nbsp;→&nbsp;<a href='http://docs.paas.enncloud.cn/quick-start/' target="_blank"><span style={{ color: '#00A1EA',cursor: 'pointer' }}>点击这里</span></a>；</span>
            </div>
            <div className='infoDetail' style={{ lineHeight: '30px' }}>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;创建我的第一个 EnnFlow 项目（持续集成、自动部署）&nbsp;→&nbsp;<a href='http://docs.paas.enncloud.cn/quick-start/create-first-flow' target="_blank"><span style={{ color: '#00A1EA',cursor: 'pointer' }}>点击这里</span></a>；</span>
            </div>
            <div className='infoDetail littleInfoDetail'>
              <span className='info' style={{ paddingLeft: '11px' }}><span style={{ color: '#00A1EA' }}>▪</span>&nbsp;实现代码构建成容器镜像，进而启动镜像为容器小应用；</span><br />
              <span className='info' style={{ paddingLeft: '11px' }}><span style={{ color: '#00A1EA' }}>▪</span>&nbsp;通过 EnnFlow 还可以实现开发过程中的更多环节自动化，期待你的发现；</span>
            </div>
            <div className='infoDetail' style={{ marginTop: '20px', marginBottom: '10px' }}>
              <span className='info'>来开启你的的Docker开发者之旅吧！ </span>
            </div>
            <div className='infoDetail'>
              <div className='littleUrl'>
                <div className='numBox'>1</div>
                <a href='http://docs.paas.enncloud.cn/developer/' target="_blank">Java开发者之旅</a>
              </div>
              <div className='littleUrl'>
                <div className='numBox'>2</div>
                <a href='http://docs.paas.enncloud.cn/developer/php' target="_blank">PHP开发者之旅</a>
              </div>
              <div className='littleUrl'>
                <div className='numBox'>3</div>
                <a href='http://docs.paas.enncloud.cn/developer/python' target="_blank">Python开发者之旅</a>
              </div>
              <div className='littleUrl'>
                <div className='numBox'>4</div>
                <a href='http://docs.paas.enncloud.cn/developer/node' target="_blank">Node.js开发者之旅</a>
              </div>
              <div className='littleUrl'>
                <div className='numBox'>5</div>
                <a href='http://docs.paas.enncloud.cn/developer/golang' target="_blank">Golang开发者之旅</a>
              </div>
              <div className='littleUrl'>
                <div className='numBox'>6</div>
                <a href='http://docs.paas.enncloud.cn/developer/lamp' target="_blank">LAMP开发者之旅</a>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
          </div>
          <div className='btnBox'>
            <div className='knowBtn' onClick={this.closeNavModal}>
              <span>知道了</span>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

function setMap(map, key) {
  if (map.get(key) == undefined) {
   map.set(key, 1)
  } else {
   map.set(key, map.get(key)+1)
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
  return {appMap, svcMap, podMap}
}

function getDbServiceStatus(data) {
  let dbServiceMap = new Map()
  dbServiceMap.set("mysql", new Map())
  dbServiceMap.set("mongo", new Map())
  dbServiceMap.set("redis", new Map())
  dbServiceMap.set("zookeeper", new Map())
  dbServiceMap.set("elasticsearch", new Map())
  dbServiceMap.set("etcd", new Map())

  data.item.map(petSet => {
    let key = "unknown"
    if (petSet.objectMeta && petSet.objectMeta.labels
      && petSet.objectMeta.labels['paas.enncloud.cn/petsetType']) {
      key = petSet.objectMeta.labels['paas.enncloud.cn/petsetType']
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

function mapStateToProp(state,props) {
  const { current, loginUser } = state.entities
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
    k8s:{
      version: "",
      status: ""
    },
    dns:{
      version: "",
      status: ""
    },
    apiserver:{
      version: "",
      status: ""
    },
    monitor:{
      version: "",
      status: ""
    },
    logging:{
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

  let clusterNodeSpaceConsumption = {
    balance: 0,
    consumption: 0,
  }

  const {clusterOperations, clusterSysinfo, clusterStorage,
    clusterAppStatus, clusterDbServices, clusterInfo} = state.overviewCluster
  if (clusterInfo && clusterInfo.result) {
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
    if (clusterInfo.result.spaceconsumption) {
      clusterNodeSpaceConsumption.balance = clusterInfo.result.spaceconsumption.balance
      clusterNodeSpaceConsumption.consumption = clusterInfo.result.spaceconsumption.consumption
    }
  }
  return {
    current,
    loginUser:loginUser.info,
    clusterOperations: clusterOperationsData,
    clusterSysinfo: clusterSysinfoData,
    clusterStorage: clusterStorageData,
    clusterAppStatus: clusterAppStatusData,
    clusterDbServices: clusterDbServicesData,
    clusterNodeSpaceConsumption: clusterNodeSpaceConsumption,
  }
}

export default connect(mapStateToProp, {
  loadStdClusterInfo,
})(Ordinary)