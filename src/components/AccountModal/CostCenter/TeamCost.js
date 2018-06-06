/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Card, Row, Col, DatePicker } from 'antd'
import './style/TeamCost.less'
import { connect } from 'react-redux'
import ReactEcharts from 'echarts-for-react'
import { loadTeamSummary } from '../../../actions/consumption'
import { parseAmount } from '../../../common/tools'
import moment from 'moment'
import {getCostBar} from './getCostBar'

const MonthPicker = DatePicker.MonthPicker
let teamCostArr = []
for(let i=1;i<32;i++){
  teamCostArr.push(i)
}

class TeamCost extends Component{
  constructor(props){
    super(props)
    this.transformDate = this.transformDate.bind(this)
    this.onChange = this.onChange.bind(this)
    this.state = {
      summaryDate: '',
    }
  }
  transformDate(){
    let date = new Date
    let y = date.getFullYear()
    let m = date.getMonth()+1
    return (y+'-'+m)
  }
  componentWillMount() {
    const {
      loadTeamSummary,
      currentNamespace,
    } = this.props
    loadTeamSummary(currentNamespace)
  }

  componentWillReceiveProps(nextProps) {
    const { currentNamespace, loadTeamSummary } = nextProps
    if (currentNamespace === this.props.currentNamespace) {
      return
    }
    loadTeamSummary(currentNamespace, this.state.summaryDate)
  }

  onChange(date) {
    let time = moment(date).format('YYYY-MM-DD 00:00:00')
    if (time == 'Invalid date') {
      return
    }
    this.setState({
      summaryDate: time,
    })
    const {
      loadTeamSummary,
      currentNamespace,
    } = this.props
    loadTeamSummary(currentNamespace, time)
  }

  render(){
    const _this = this
    const {
      currentTeamName,
      currentSpaceName,
      teamSummary,
      currentNamespace,
      standard,
    } = this.props
    let teamCostTitle = (
      <div className="teamCostTitle">
        <span>空间{currentSpaceName}对应的团队{currentTeamName}该月消费详情</span>
        <MonthPicker style={{float: 'right',marginLeft:'40px'}} defaultValue={this.transformDate()} onChange={this.onChange} />
      </div>
    )

    let getTeamCostPie = function (){
      let cost = 0
      let balance = 0
      if (!teamSummary.isFetching) {
        cost = parseAmount(teamSummary.consumption).amount
        balance = parseAmount(teamSummary.balance).amount
      }
      return {
        tooltip: {
          trigger: 'item',
          formatter: "{b} : {c}<br/> ({d}%)"
        },
        color: ['#46b2fa','#2abe84'],
        legend: {
          orient : 'vertical',
          left : 'center',
          bottom : '0',
          data: [{name:'余额'}, {name:'消费'}],
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
            fontSize: 14,
          },
          itemGap: 10,
          itemWidth: 10,
          itemHeight: 10,
        },
        series: [{
          name:'',
          type: 'pie',
          selectedMode: 'single',
          selectedOffset: 5,
          center: ['50%','63px'],
          radius: '45%',
          data: [
            {name: '余额',value: balance},
            {name: '消费',value: cost, selected: true}
          ],
          itemStyle: {
            normal: {
              borderWidth: 0,
              borderColor: '#ffffff'
            },
            emphasis: {
            }
          }
        }]
      }
    }
    let getTeamCostBar = function (){
      return getCostBar(teamCostArr, teamSummary, standard)
    }
    return (
      <div id='TeamCost'>
        <Card title={teamCostTitle}>
          <Row>
            <Col span={6}>
             <ReactEcharts
              notMerge={true}
              option={getTeamCostPie()}
              style={{height: '170px'}}
             />
            </Col>
            <Col span={18}>
              <ReactEcharts
              notMerge={true}
              option={getTeamCostBar()}
              style={{height: '170px'}}
             />
            </Col>
          </Row>
        </Card>
      </div>
    )
  }
}

function mapStateToProps (state,props) {
  const { teamSummary } = state.consumption
  let summaryData = {
    balance: 0,
    consumption: 0,
    items: [],
    month: '',
  }
  if (!teamSummary.isFetching) {
    if (teamSummary.result && teamSummary.result.data && teamSummary.result.data.balance) {
      summaryData.balance = teamSummary.result.data.balance
    }
    if (teamSummary.result && teamSummary.result.data && teamSummary.result.data.totalConsumption) {
      summaryData.consumption = teamSummary.result.data.totalConsumption
    }
    if (teamSummary.result && teamSummary.result.data && teamSummary.result.data.detail) {
      summaryData.items = teamSummary.result.data.detail
    }
    if (teamSummary.result && teamSummary.result.data && teamSummary.result.data.month) {
      summaryData.month = teamSummary.result.data.month
    }
  }
  return {
    teamSummary: summaryData,
  }
}
export default connect (mapStateToProps,{
  loadTeamSummary,
})(TeamCost)