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
import { Row, Col, Card, } from 'antd'
import './style/Admin.less'
import ReactEcharts from 'echarts-for-react'
import { connect } from 'react-redux'
import { loadTeamInfo } from '../../../../actions/overview_team'
import { parseAmount } from '../../../../common/tools'

function getOption(cost, rest) {
  return {
    title: {
      show: false,
      text: '余额：'+rest+' T\n\n消费：'+cost+' T',
      x:'center',
      top: '65%',
      textStyle:{
        color :'#666',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '13',
      }
    },
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
          return name + '：' + rest + ' T'
        } else if (name === '消费') {
          return name + '：' + cost + ' T'
        }
      },
      textStyle: {
        fontSize: 13,
        color :'#666',
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
              fontSize: '13',
              color :'#666',
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
          {value:rest < 0 ? 0: rest, name:'余额'},
          {value:cost, name:'消费'},
        ]
      }
    ]
  }
}

class Admin extends Component{
  constructor(props){
    super(props)
    this.state = {

    }
  }

  componentWillMount(){
    const { loadTeamInfo } = this.props
    loadTeamInfo()
  }

  componentWillReceiveProps(nextProps) {
    const { loadTeamInfo } = this.props
    const { current } = nextProps
    const { clusterID } = current.cluster
    if (clusterID !== this.props.current.cluster.clusterID || current.space.namespace != this.props.current.space.namespace) {
      loadTeamInfo()
      return
    }
  }
  render(){
    const { spaceName } = this.props
    const teamDetail = this.props.teamDetail
    const teamConsumption = this.props.teamConsumption
    const teamOperations = this.props.teamOperations
    return (
      <div id='Admin' style={{marginBottom:20}}>
        <Row className="title">空间 {spaceName} 对应的团队</Row>
        <Row className="content" gutter={16}>
          <Col span={8} className='teamInf'>
            <Card title="团队信息总览" bordered={false} bodyStyle={{height:170}}>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#homespacecountcolor" />
                    </svg>
                    空间
                  </div>
                  <div style={{textAlign:'left',fontSize: '13px'}} className='tabCell'>
                    {teamDetail.spaceCnt} 个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#homeimagecountcolor" />
                    </svg>
                    镜像
                  </div>
                   <div style={{textAlign:'right',fontSize: '13px'}} className='tabCell'>
                    {teamDetail.imageCnt} 个
                  </div>
                </Col>
              </Row>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#homeappcountcolor" />
                    </svg>
                    应用
                  </div>
                  <div style={{textAlign:'left',fontSize: '13px'}} className='tabCell'>
                    {teamDetail.appCnt} 个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#homelayoutcountcolor" />
                    </svg>
                    编排
                  </div>
                   <div style={{textAlign:'right',fontSize: '13px'}} className='tabCell'>
                    {teamDetail.templateCnt} 个
                  </div>
                </Col>
              </Row>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#homeservicecountcolor" />
                    </svg>
                    服务
                  </div>
                  <div style={{textAlign:'left',fontSize: '13px'}} className='tabCell'>
                    {teamDetail.svcCnt} 个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#homesavecountcolor" />
                    </svg>
                    存储卷
                  </div>
                   <div style={{textAlign:'right',fontSize: '13px'}} className='tabCell'>
                    {teamDetail.volumeCnt} 个
                  </div>
                </Col>
              </Row>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#homecontainercountcolor" />
                    </svg>
                    容器
                  </div>
                  <div style={{textAlign:'left',fontSize: '13px'}} className='tabCell'>
                    {teamDetail.podCnt} 个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#homebuildcountcolor" />
                    </svg>
                    构建项目
                  </div>
                   <div style={{textAlign:'right',fontSize: '13px'}} className='tabCell'>
                    {teamDetail.flowCnt} 个
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={11} className='teamCost'>
            <Card title="本日该团队消费" bordered={false} bodyStyle={{height:170}}>
              <Col span={10} style={{height:170}}>
                  <ReactEcharts
                    notMerge={true}
                    option={getOption(parseAmount(teamConsumption.consumption).amount, parseAmount(teamConsumption.balance).amount)}
                    style={{height:170}}
                  />
              </Col>
              <Col span={14} className='teamCostList'>
                <Row className="teamCostListTitle">
                  <Col span={16} style={{paddingLeft:40,height:40,lineHeight:'40px',fontSize:'13px'}}>空间名称</Col>
                  <Col span={8} style={{height:40,lineHeight:'40px',fontSize:'13px'}}>消费金额</Col>
                </Row>
                <Row className='teamCostListContent'>
                  {
                    teamConsumption.detail.length === 0 ?
                      <div style={{ fontSize:'13px',color:'#666',float:'left',marginLeft:'38%',marginTop:'30px'}}>暂无消费记录</div> :
                    teamConsumption.detail.map((item) => {
                      return (
                        <Row className="teamCostItem">
                          <Col span={16} style={{paddingLeft:40}}>{item.teamname}</Col>
                          <Col span={8} style={{paddingLeft:10}}>消费 {parseAmount(item.consumption).fullAmount}</Col>
                        </Row>
                      )
                    })
                  }
                </Row>
              </Col>
            </Card>
          </Col>
          <Col span={5} className='teamRecord'>
            <Card title="今日该团队记录" bordered={false} bodyStyle={{height:170,fontSize:'14px'}}>
              <div style={{overflowY:'auto',height:'127px'}}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        创建应用
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'13px'}}>
                        {teamOperations.appCreate} 个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeservicecount" />
                        </svg>
                        创建服务
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'13px'}}>
                        {teamOperations.svcCreate} 个
                      </td>
                    </tr>
                     <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homesavecount" />
                        </svg>
                        创建存储卷
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'13px'}}>
                        {teamOperations.volumeCreate} 个
                      </td>
                    </tr>
                     <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        停止应用
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'13px'}}>
                        {teamOperations.appStop} 个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeservicecount" />
                        </svg>
                        删除服务
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'13px'}}>
                        {teamOperations.svcDelete} 个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homesavecount" />
                        </svg>
                        删除存储卷
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'13px'}}>
                        {teamOperations.volumeDelete} 个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        修改应用
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'13px'}}>
                        {teamOperations.appModify} 个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        启动应用
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'13px'}}>
                        {teamOperations.appStart} 个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="teamRecSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        重新部署
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'13px'}}>
                        {teamOperations.appRedeploy} 个
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state,props) {
  const { current, loginUser } = state.entities
  let teamDetailData = {
    spaceCnt: 0,
    appCnt: 0,
    svcCnt: 0,
    podCnt: 0,
    imageCnt: 0,
    templateCnt: 0,
    volumeCnt: 0,
    flowCnt: 0,
  }
  let teamOperationsData = {
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
  let teamConsumption = {
    balance: 0,
    consumption: 0,
    detail: [],
  }
  const {teamDetail, teamOperations, teamInfo} = state.overviewTeam
  if (teamInfo.result) {
    if (teamInfo.result.teamdetail) {
      let data = teamInfo.result.teamdetail
      if (data.spaceCnt) {
        teamDetailData.spaceCnt = data.spaceCnt
      }
      if (data.appCnt) {
        teamDetailData.appCnt = data.appCnt
      }
      if (data.svcCnt) {
        teamDetailData.svcCnt = data.svcCnt
      }
      if (data.podCnt) {
        teamDetailData.podCnt = data.podCnt
      }
      if (data.imageCnt) {
        teamDetailData.imageCnt = data.imageCnt
      }
      if (data.templateCnt) {
        teamDetailData.templateCnt = data.templateCnt
      }
      if (data.volumeCnt) {
        teamDetailData.volumeCnt = data.volumeCnt
      }
      if (data.flowCnt) {
        teamDetailData.flowCnt = data.flowCnt
      }
    }
    if (teamInfo.result.operations) {
      if (teamInfo.result.operations.app) {
        let data = teamInfo.result.operations.app
        if (data.appCreate) {
          teamOperationsData.appCreate = data.appCreate
        }
        if (data.appModify) {
          teamOperationsData.appModify = data.appModify
        }
        if (data.svcCreate) {
          teamOperationsData.svcCreate = data.svcCreate
        }
        if (data.svcDelete) {
          teamOperationsData.svcDelete = data.svcDelete
        }
        if (data.appStop) {
          teamOperationsData.appStop = data.appStop
        }
        if (data.appStart) {
          teamOperationsData.appStart = data.appStart
        }
        if (data.appCreate) {
          teamOperationsData.appCreate = data.appCreate
        }
        if (data.appRedeploy) {
          teamOperationsData.appRedeploy = data.appRedeploy
        }
      }
      if (teamInfo.result.operations.volume) {
        let data = teamInfo.result.operations.volume
        if (data.volumeCreate) {
          teamOperationsData.volumeCreate = data.volumeCreate
        }
        if (data.volumeDelete) {
          teamOperationsData.volumeDelete = data.volumeDelete
        }
      }
    }
    if (teamInfo.result.teamconsumption) {
      teamConsumption.balance = teamInfo.result.teamconsumption.balance || 0
      teamConsumption.consumption = teamInfo.result.teamconsumption.consumption || 0
      teamConsumption.detail = teamInfo.result.teamconsumption.detail || []
    }
  }
  return {
    current,
    teamDetail: teamDetailData,
    teamOperations: teamOperationsData,
    teamConsumption: teamConsumption,
  }
}

export default connect(mapStateToProp, {
  loadTeamInfo,
})(Admin)