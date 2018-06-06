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
import ReactEcharts from 'echarts-for-react'

const MonthPicker = DatePicker.MonthPicker
let teamCostArr = []
for(let i=1;i<32;i++){
  teamCostArr.push(i)
}

export default class TeamCost extends Component{
  constructor(props){
    super(props)
    this.transformDate = this.transformDate.bind(this)
    this.state = {
      
    }
  }
  transformDate(){
    let date = new Date
    let y = date.getFullYear()
    let m = date.getMonth()+1
    return (y+'-'+m)
  }
  
  render(){
    const { currentTeamName, currentSpaceName } = this.props
    let teamCostTitle = (
      <div className="teamCostTitle">
        <span>空间{currentSpaceName}对应的团队{currentTeamName}该月消费详情</span>
        <MonthPicker style={{float: 'right'}} defaultValue={this.transformDate()}/>
      </div>
    )
    let teamCostPie ={
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
            return name + ': ' + 70 + ' T'
          } else {
            return name + ': ' + 30 + ' T'
          }
        },
        textStyle: {
          fontSize: 14,
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [{
        name:'',
        type: 'pie',
        selectedMode: 'single',
        selectedOffset: 5,
        center: ['50%','30%'],
        radius: '45%',
        data: [
          {name: '余额',value:70},
          {name: '消费',value: 30,selected: true}
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
    
    let teamCostBar = {
      color: ['#3398DB'],
      tooltip : {
        trigger: 'axis',
        axisPointer : {
          type : 'shadow'
        },
        formatter: '{b} : {c}%',
        position: function (point, params, dom) {
          return [point[0]-25, '10%'];
        },
        extraCssText: '::after: {content:""}'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        height: 150
      },
      xAxis : [
        {
          type : 'category',
          data : teamCostArr,
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
          barWidth: 16,
          data: teamCostArr,
        }
      ]
    }
    return (
      <div id='TeamCost'>
        <Card title={teamCostTitle}>
          <Row>
            <Col span={6}>
             <ReactEcharts
              notMerge={true}
              option={teamCostPie}
              style={{height: '170px'}}
             />
            </Col>
            <Col span={18}>
              <ReactEcharts
              notMerge={true}
              option={teamCostBar}
              style={{height: '170px'}}
             />
            </Col>
          </Row>
        </Card>
      </div>
    )
  }
}