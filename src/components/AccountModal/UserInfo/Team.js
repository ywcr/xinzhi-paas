/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Button, } from 'antd'
import './style/Team.less'

let TeamList = React.createClass ({
  getInitialState(){
    return {
      
    }
  },
  render: function () {
    let firstRow = true
    let className = ""
    const { teams } = this.props
    return (
      <div>
        <Row className="contentTop">
          <Col span={4}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingname" />
            </svg>
            <span className="infSvgTxt">团队名称</span>
          </Col>
          <Col span={4}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingperspace" />
            </svg>
            <span className="infSvgTxt">空间数</span>
          </Col>
          <Col span={4}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingcluster" />
            </svg>
            <span className="infSvgTxt">集群数</span>
          </Col>
        </Row>
        {
          teams?
            teams.map((team) => {
              if (firstRow) {
                className = "contentList firstItem"
                firstRow = false
              } else {
                className = "contentList"
              }
              return (
                <Row className={className} key={team.teamID}>
                  <Col span={4} className='contentItem' title={team.teamName}>{team.teamName}</Col>
                  <Col span={4} className='contentItem'>{team.spaceCount}</Col>
                  <Col span={4} className='contentItem'>{team.clusterCount}</Col>
                </Row>
              )
            }):
            <div></div>
        }
      </div>
    )
  }
})

export default class Team extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  componentDidMount() {
    
  }

  render(){
    const { teams, userDetail } = this.props
    return (
      <div id='Team'>
        <Row className="teamWrap">
          <div className="teamTitle">
            <svg className="infSvg" style={{marginRight:8,color:'black'}}>
              <use xlinkHref="#settingownteam" />
            </svg>
            <span className="infSvgTxt">
              {userDetail.userName} 所属的团队
            </span>
          </div>
          <div className="teamContent">
            <TeamList teams={teams}/>
          </div>
        </Row>
      </div>
    )
  }
}