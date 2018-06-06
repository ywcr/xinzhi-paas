/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/30
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Icon, Button, DatePicker, Table, Select, Popover, Tooltip } from 'antd'
import './style/CostRecord.less'
import PopSelect from '../../PopSelect'
import PopContent from '../../PopSelect/Content'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../../actions/user'
import { loadTeamClustersList } from '../../../actions/team'
import { setCurrent, loadLoginUserDetail } from '../../../actions/entities'
import { loadConsumptionDetail, loadConsumptionTrend, loadSpaceSummaryInDay, loadSpaceSummary } from '../../../actions/consumption'
import TeamCost from './TeamCost'
import ReactEcharts from 'echarts-for-react'
import { formatDate, parseAmount } from '../../../common/tools'
import moment from 'moment'
import {getCostBar} from './getCostBar'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../constants'

const MonthPicker = DatePicker.MonthPicker
const Option = Select.Option

let spaceCostArr = []
for(let i=1;i<32;i++){
  spaceCostArr.push(i)
}

class CostRecord extends Component{
  constructor(props){
    super(props)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.transformDate = this.transformDate.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
    this.handleTableChange = this.handleTableChange.bind(this)
    this.handleTeamListVisibleChange = this.handleTeamListVisibleChange.bind(this)
    this.state = {
      spacesVisible: false,
      currentSpaceName: '我的空间',
      currentTeamName: '',
      currentNamespace: '',
      sortedInfo: null,
      consumptionDetailCurrentPage: 1, // start from 1
      consumptionDetailPageSize: 10,
      consumptionDetailTimeBegin: '',
      consumptionDetailTimeEnd: '',
      consumptionDetailDate: '',
      consumptionDetailType: 'all',
      consumptionSpaceSummaryDate: '',
      consumptionSpaceSummaryInDayDate: '',
      teamListVisible: false,
    }
  }
  handleSpaceChange(space) {
    this.setState({
      spacesVisible: false,
      currentSpaceName: space.spaceName,
      currentTeamName: space.teamName,
      currentNamespace: space.namespace,
      consumptionDetailCurrentPage: 1,
      teamListVisible: false,
    })
    const {
      loadConsumptionDetail,
      loadConsumptionTrend,
      loadSpaceSummaryInDay,
      loadSpaceSummary,
    } = this.props
    const {
      consumptionDetailTimeBegin,
      consumptionDetailTimeEnd,
      consumptionSpaceSummaryDate,
      consumptionSpaceSummaryInDayDate,
      consumptionDetailType,
    } = this.state
    loadConsumptionDetail(space.namespace, 0, this.state.consumptionDetailPageSize, consumptionDetailTimeBegin, consumptionDetailTimeEnd, consumptionDetailType)
    loadConsumptionTrend(space.namespace)
    loadSpaceSummaryInDay(space.namespace, consumptionSpaceSummaryInDayDate)
    loadSpaceSummary(space.namespace, consumptionSpaceSummaryDate)
  }
  handleTeamListVisibleChange(visible) {
    this.setState({
      teamListVisible: visible
    })
  }
  transformDate(isFullDate){
    function _addZero(text) {
      return text.toString().length === 2 ? text : `0${text}`
    }

    let date = new Date()
    let y = date.getFullYear()
    let m = date.getMonth() + 1
    let d = date.getDate()
    if (isFullDate) {
      return (y + '-' + _addZero(m) + '-' + _addZero(d))
    }
    return (y+'-'+_addZero(m))
  }
  handleTableChange(pagination, filters, sorter){
    this.setState({
      sortedInfo: sorter,
    });
  }
  handleFilter(value,option,e){
    const {
      loadConsumptionDetail,
    } = this.props
    const {
      currentNamespace,
      consumptionDetailPageSize,
      consumptionDetailTimeBegin,
      consumptionDetailTimeEnd,
    } =  this.state
    this.setState({
      consumptionDetailType: value,
      consumptionDetailCurrentPage: 1,
    })
    loadConsumptionDetail(currentNamespace, 0, consumptionDetailPageSize, consumptionDetailTimeBegin, consumptionDetailTimeEnd, value)
  }

  componentWillMount() {
    const {
      loadTeamClustersList,
      loadLoginUserDetail,
      loadUserTeamspaceList,
      loginUser,
      userDetail,
      teamspaces,
      loadConsumptionDetail,
      loadConsumptionTrend,
      loadSpaceSummaryInDay,
      loadSpaceSummary,
      current
    } = this.props
    loadUserTeamspaceList(loginUser.info.userID||userDetail.userID||'default',{ size: 1000 }, {
      success: {
        func:()=>{
        },
        isAsync: true
      }
    })
    let currentNamespace = ''
    let currentSpaceName= '我的空间'
    let currentTeamName = ''
    if (current.space && current.space.namespace && current.space.namespace !== 'default') {
      currentNamespace = current.space.namespace
      currentSpaceName = current.space.spaceName || current.space.namespace
      currentTeamName = current.space.teamName
    }
    this.setState({
      currentNamespace,
      currentSpaceName,
      currentTeamName
    })
    loadConsumptionDetail(currentNamespace, 0, this.state.consumptionDetailPageSize)
    loadConsumptionTrend(currentNamespace)
    loadSpaceSummaryInDay(currentNamespace)
    loadSpaceSummary(currentNamespace)
  }
  render(){
    const _this = this
    const {
      current,
      loginUser,
      teamspaces,
      teamClusters,
      consumptionDetail,
      loadConsumptionDetail,
      loadSpaceSummary,
      loadSpaceSummaryInDay,
      consumptionTrend,
      spaceSummaryInDay,
      spaceSummary,
      standard,
    } = this.props
    let {
      spacesVisible,
      currentSpaceName,
      currentTeamName,
      currentNamespace,
      sortedInfo,
      teamListVisible,
    } = this.state
    sortedInfo = sortedInfo || {};
    let getSpaceCostSixMonths = function() {
      let xAxisData = []
      let yAxisData = []
      for (let i = 5; i >= 0; i--) {
        const month = moment().subtract(i, 'months').format('YYYY-MM')
        xAxisData.push(month)
      }
      xAxisData.map(month => {
        let find = false
        for (const item of consumptionTrend) {
          if (item.time == month) {
            yAxisData.push(parseAmount(item.cost).amount)
            find = true
            continue
          }
        }
        if (!find) {
          yAxisData.push(0.00)
        }
      })
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false
          },
          formatter: standard ? '{b}<br/>消费 ￥{c}' : '{b}<br/>消费 {c} T',
          textStyle: {
            color: '#666',
            fontSize: 12,
          },
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#46b2fa',
        },
        color: ['#666'],
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLine: {onZero: true},
          boundaryGap: false,
          axisTick: {
            alignWithLabel: true,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            },
          },
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            },
          },
        },
        grid: {
          top: 20,
          bottom: 30,
        },
        series: [{
          type: 'line',
          data: yAxisData,
          symbolSize: 8,
        },]
      }
    }
    let onCurrentSpaceSummaryDateChange = function (date) {
      let time = moment(date).format('YYYY-MM-DD 00:00:00')
      if (time == 'Invalid date') {
        return
      }
      _this.setState({
        consumptionSpaceSummaryDate:time,
      })
      loadSpaceSummary(_this.state.currentNamespace, time)
    }

    let onCurrentSpaceSummaryInDayDateChange = function (date) {
      let time = moment(date).format('YYYY-MM-DD 00:00:00')
      if (time == 'Invalid date') {
        return
      }
      _this.setState({
        consumptionSpaceSummaryInDayDate:time,
      })
      loadSpaceSummaryInDay(_this.state.currentNamespace, time)
    }

    let onConsumptionDetailDateChange = function (date, dateString) {
      let timeBegin = moment(date).format('YYYY-MM-DD 00:00:00')
      let timeEnd = moment(date).add(1, 'days').format('YYYY-MM-DD 00:00:00')
      if (timeBegin == 'Invalid date' || timeEnd == 'Invalid date') {
        return
      }
      loadConsumptionDetail(_this.state.currentNamespace, 0, _this.state.consumptionDetailPageSize, timeBegin, timeEnd, _this.state.consumptionDetailType)
      // set state
      _this.setState({
        consumptionDetailCurrentPage: 1,
        consumptionDetailTimeBegin: timeBegin,
        consumptionDetailTimeEnd: timeEnd,
        consumptionDetailDate: timeBegin,
      })
    }
    let spaceCostTitle = (
      <div className="teamCostTitle">
        <span>{currentSpaceName}该月消费</span>
        <div className='dataPicker'>
          <MonthPicker defaultValue={this.transformDate(false)} onChange={onCurrentSpaceSummaryDateChange} />
        </div>
      </div>
    )
    let spaceCostDetailTitle = (
      <div className="teamCostTitle">
        <span>{currentSpaceName}该月消费详情</span>
        <div className='dataPicker'>
          <MonthPicker defaultValue={this.transformDate(false)} onChange={onCurrentSpaceSummaryInDayDateChange} />
        </div>
      </div>
    )
    let spaceTableTitle = (
      <div className="teamCostTitle">
        <span>{currentSpaceName}消费明细</span>
        <DatePicker style={{float: 'left',marginLeft: '40px'}} defaultValue={this.transformDate(true)} onChange={onConsumptionDetailDateChange} />
        <div className='dataPicker'>
          <Select defaultValue="all" style={{ width: 120, float: 'left',marginLeft: '40px'}}
                  onSelect={(value,option) => this.handleFilter(value,option)}>
            <Option value="all">全部</Option>
            <Option value="1">容器服务</Option>
            <Option value="4">存储服务</Option>
            {standard ? <Option value="6">专业版订购</Option> : []}
          </Select>
        </div>
      </div>
    )
    let getSpaceCostBar = function() {
      return getCostBar(spaceCostArr, spaceSummaryInDay, standard)
    }
    let convertDetailItems = function(itemsRaw) {
      if (!Array.isArray(itemsRaw)) {
        return []
      }
      let items = JSON.parse(JSON.stringify(itemsRaw))
      const typeMap = {
        '1': '容器服务',
        '3': '主机服务',
        '4': '存储服务',
        '5': '工作任务',
        '6': '专业版订购',
      }
      items.map(function(item) {
        const itemRawType = item.type
        item.type = typeMap[itemRawType]

        if (standard) {
          item.unitPrice = '￥ ' + parseAmount(item.unitPrice, 4).amount
          item.amount = '￥ ' + parseAmount(item.amount, 4).amount
        } else {
          item.unitPrice = parseAmount(item.unitPrice, 4).fullAmount
          item.amount = parseAmount(item.amount, 4).fullAmount
        }
        if (itemRawType === '6') {
          item.unitPrice += '/月'
          item.continueTime += '月'
        } else {
          item.unitPrice += '/小时'
          item.continueTime += '分钟'
        }
        item.createTime = item.createTime ? formatDate(item.createTime) : formatDate(item.startTime)
        item.clusterName = item.clusterName || '-'
      })
      return items
    }
    let costData = convertDetailItems(consumptionDetail.consumptions)

    let pagination = {
      current: _this.state.consumptionDetailCurrentPage,
      total: consumptionDetail.total,
      showSizeChanger: true,
      onShowSizeChange(current, pageSize) {
        const {
          currentNamespace,
          consumptionDetailTimeBegin,
          consumptionDetailTimeEnd,
          consumptionDetailType,
        } = _this.state
        loadConsumptionDetail(currentNamespace, 0, pageSize, consumptionDetailTimeBegin, consumptionDetailTimeEnd, consumptionDetailType)
        _this.setState({
          consumptionDetailPageSize: pageSize,
          consumptionDetailCurrentPage: 1,
        })
      },
      onChange(current) {
        const {
          currentNamespace,
          consumptionDetailTimeBegin,
          consumptionDetailTimeEnd,
          consumptionDetailType,
          consumptionDetailPageSize,
        } = _this.state
        loadConsumptionDetail(currentNamespace, (current-1) * consumptionDetailPageSize, consumptionDetailPageSize, consumptionDetailTimeBegin, consumptionDetailTimeEnd, consumptionDetailType)
        _this.setState({
          consumptionDetailCurrentPage: current,
        })
      },
    }
    //table列配置
    let getTableColumn = function() {
        return [
          {
            title: '消费ID',
            dataIndex: 'id',
            key: 'id',
            className: 'firstCol',
          },
          {
            title: '服务名称',
            dataIndex: 'consumptionName',
            key: 'consumptionName',
          },
          {
            title: '服务类型',
            dataIndex: 'type',
            key: 'type',
          },
          {
            title: '单价',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
          },
          {
            title: '消费金额',
            dataIndex: 'amount',
            key: 'amount',
          },
          {
            title: '扣费时间',
            dataIndex: 'createTime',
            key: 'createTime',
          },
          {
            title: '消费时长',
            dataIndex: 'continueTime',
            key: 'continueTime',
          },
          {
            title: standard?'地域':'集群',
            dataIndex: 'clusterName',
            key: 'clusterName',
          },
        ]
    }
    return (
      <div id='CostRecord'>
        <Card className='selectSpace'>
          {
            standard ?
            <div>
              <svg className='headerteamspace'>
                <use xlinkHref='#headerteamspace' />
              </svg>
              <div className='popTeamSelect'>
                <Popover
                  title='选择团队帐户'
                  placement="bottomLeft"
                  trigger='click'
                  overlayClassName='standardPopTeamOver'
                  onVisibleChange={this.popTeamChange}
                  getTooltipContainer={() => document.getElementById('CostRecord')}
                  visible={teamListVisible}
                  onVisibleChange={this.handleTeamListVisibleChange}
                  content={
                    <PopContent
                      list={teamspaces}
                      onChange={this.handleSpaceChange}
                      loading={false}
                      popTeamSelect={true}
                    />
                  }>
                  <span>{currentTeamName === ''?'我的团队':currentTeamName} <Icon type='down' style={{ fontSize: '8px' }}/></span>
                </Popover>
              </div>
            </div>
            :
            <div>
              <svg className='headerteamspace'>
                <use xlinkHref='#headerteamspace' />
              </svg>
              项目空间：
              <div className='popSelect'>
                <PopSelect
                  title="选择项目空间"
                  btnStyle={false}
                  special={true}
                  visible={spacesVisible}
                  list={teamspaces}
                  loading={false}
                  onChange={this.handleSpaceChange}
                  selectValue={ currentSpaceName }
                  getTooltipContainer={() => document.getElementById('CostRecord')}
                />
              </div>
            </div>
          }
        </Card>
        {
          standard ? <div></div> : (((loginUser.info.role === ROLE_TEAM_ADMIN || loginUser.info.role === ROLE_SYS_ADMIN) && currentNamespace !== '' && currentNamespace !== 'default')?
          <TeamCost currentSpaceName = {currentSpaceName} currentTeamName={currentTeamName} currentNamespace={currentNamespace} standard={standard}/>:
          <div></div>)
        }
        <Row gutter={16} className='currentMonth'>
          <Col span={12} className='teamCost'>
            <Card title={spaceCostTitle} bordered={false} bodyStyle={{height:170}}>
              <Col span={10}>
                  <ReactEcharts
                    notMerge={true}
                    option={getSpaceMonthCost(spaceSummary.balance, spaceSummary.consumption,standard)}
                    style={{height:170}}
                  />
              </Col>
              <Col span={14} className='teamCostList'>
                <Row>
                  <Col span={14} style={{paddingLeft:40}} className="teamCostListTitle">
                    <svg className="headerclusterSvg">
                      <use xlinkHref="#settingcluster"/>
                    </svg>
                    {standard ? '区域' : '集群名称'}
                  </Col>
                  <Col span={10} className="teamCostListTitle">
                    <svg className="headerclusterSvg">
                      <use xlinkHref="#settingbalance"/>
                    </svg>
                    消费金额
                  </Col>
                </Row>
                <Row className='teamCostListContent'>
                  {
                    spaceSummary.clusterConsumptions.map((item) => {
                      return (
                        <Row className="teamCostItem">
                          <Col span={14} style={{paddingLeft:40}}>
                            <Tooltip title={item.name}>
                              <span>{item.name}</span>
                            </Tooltip>
                          </Col>
                          <Col span={10} >
                            {
                              isNaN(item.sum)
                              ? '-'
                              : parseAmount(item.sum).fullAmount
                            }
                          </Col>
                        </Row>
                      )
                    })
                  }
                </Row>
              </Col>
            </Card>
          </Col>
          <Col span={12}>
            <Card title='近6个月的消费走势' bodyStyle={{padding:0}}>
              <ReactEcharts
                option = {getSpaceCostSixMonths()}
                notMerge = {true}
                style = {{height: 170}}
              />
            </Card>
          </Col>
        </Row>
        <Row className='currentMonthDetail'>
          <Card title={spaceCostDetailTitle}>
            <ReactEcharts
              notMerge={true}
              option={getSpaceCostBar()}
              style={{height: '170px'}}
              showLoading={spaceSummaryInDay.isFetching}
             />
          </Card>
        </Row>
        <Row className='SpaceCostDetailTab'>
          <Card title={spaceTableTitle}>
            <Table columns={getTableColumn(standard)} dataSource={costData} pagination={pagination} onChange={this.handleTableChange}/>
          </Card>
        </Row>
      </div>
    )
  }
}


function getSpaceMonthCost(balance, cost, standard) {
    balance = parseAmount(balance || 0).amount
    cost =parseAmount(cost || 0).amount
    return {
      color: ['#46b2fa', '#2abe84'],
      backgroundColor: '#fff',
      tooltip: {
        show: true,
        trigger: 'item',
        formatter: "{b}: {c}<br/> ({d}%)"
      },
      legend: {
        show: true,
        orient: 'vertical',
        x: 'center',
        top: '65%',
        data:['余额','消费'],
        formatter: function (name) {
          if(name === '余额'){
            let balanceText = standard ? (name + '：￥ ' + balance) :
                                        (name + '：' +balance + ' T')
            return balanceText
          } else {
            let costText = standard ? (name + '：￥ ' + cost) :
                                      (name + '：' + cost + ' T')
            return costText
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666',
          fontWeight: 'normal',
        },
        itemGap: 8,
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [
        {
          name:'本日该团队消费',
          type:'pie',
          radius: ['28', '40'],
          center: ['50%','40%'],
          avoidLabelOverlap: false,
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
          hoverAnimation: false,
          selectedOffset: 10,
          label: {
            normal: {
              show: false,
              position: 'center'
            },
            emphasis: {
              show: true,
              formatter: function (param) {
               if (param.data && param.data.value < 0) {
                 return '0%'
               }
               return param.percent.toFixed(0) + '%';
              },
              textStyle: {
                fontSize: '14',
                fontWeight: 'normal'
              }
            }
          },
          labelLine: {
            normal: {
              show: true
            }
          },
          data:[
            {value:balance < 0 ? 0 : balance, name:'余额'},
            {value:cost, name:'消费'},
          ]
        }
      ]
    }
}

function mapStateToProps (state,props) {
  const { current, loginUser } = state.entities
  const { teamspaces,userDetail } = state.user
  const { detail, trend, spaceSummaryInDay, spaceSummary } = state.consumption
  let spaceSummaryData = {
    isFetching: spaceSummary.isFetching,
    balance: (spaceSummary.result ? (spaceSummary.result.data.balance ? spaceSummary.result.data.balance : 0) : 0),
    consumption: (spaceSummary.result ? (spaceSummary.result.data.totalConsumption ? spaceSummary.result.data.totalConsumption : 0) : 0),
    clusterConsumptions: (spaceSummary.result ? (spaceSummary.result.data.clusterConsumption ? spaceSummary.result.data.clusterConsumption : []) : []),
  }
  if (spaceSummaryData.clusterConsumptions.length == 0) {
    spaceSummaryData.clusterConsumptions = [{
      name: '-',
      sum: '-',
    }]
  }
  spaceSummaryData.clusterConsumptions.map((item) => {
    item.name = item.name || '-'
    item.name = (item.name === '__PRO_EDITION') ? '-（注：专业版扣费）' : item.name
  })
  return {
    current,
    loginUser,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    userDetail: (userDetail.result ? userDetail.result.data: {}),
    consumptionDetail: (detail.result ? detail.result.data : {}),
    consumptionTrend: (trend.result ? trend.result.data : []),
    spaceSummaryInDay: {
      isFetching: spaceSummaryInDay.isFetching,
      items: (spaceSummaryInDay.result ? (spaceSummaryInDay.result.data.detail ? spaceSummaryInDay.result.data.detail : []) : []),
      month: (spaceSummaryInDay.result ? (spaceSummaryInDay.result.data.month ? spaceSummaryInDay.result.data.month : '') : ''),
    },
    spaceSummary: spaceSummaryData,
  }
}
export default connect (mapStateToProps,{
  loadUserTeamspaceList,
  loadTeamClustersList,
  loadLoginUserDetail,
  loadConsumptionDetail,
  loadConsumptionTrend,
  loadSpaceSummaryInDay,
  loadSpaceSummary,
})(CostRecord)