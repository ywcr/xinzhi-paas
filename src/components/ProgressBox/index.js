/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/22
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, } from 'antd'
import './style/ProgressBox.less'

export default class ProgressBox extends Component{
  constructor(props){
    super(props)
    this.state = {

    }
  }
  render(){
    const { boxPos } = this.props
    return (
      <Col id='ProgressBox' span={12}>
        <div className="boxContainer">
          <div className="wrapper">
            <div className="green">
              <div className="progress">
                <div className="inner">
                  <div className="percent">
                    <span className={(boxPos*100).toFixed(2) > 70 ? 'highLightSpan' : ''}>{(boxPos*100).toFixed(2)}%</span>
                  </div>
                  <div className="water" style={{top:`${(1-boxPos)*100}%`}}></div>
                  <div className="water w2" style={{top:`${(1-boxPos)*100}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Col>
    )
  }
}
