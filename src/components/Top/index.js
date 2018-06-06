/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  login page
 *
 * v0.1 - 2016/12/20
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import './style/Top.less'
import { Link } from 'react-router'
import { getPortalRealMode } from '../../common/tools'
import { LITE } from '../../constants'
const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode

export default class Top extends Component {
  constructor (props) {
  	super(props)
    this.state = {
      type: getPortalRealMode(),
    }
  }

  handleOpen(){
    const thisUrl = window.location.hostname
    window.open('https://'+thisUrl+':9004/')
  }
  Open(){
    const thisUrl = window.location.hostname
    window.open(thisUrl)
  }
  render(){
    if (mode === standard) {
      return (
        <div id='Top'>
          <div className='topWrap'>
            <div className='topLogo'>
              <a href='/'> <svg>
                  <use xlinkHref='#toplogo' />
                </svg>
              </a>
            </div>
            <div className='topNav'>
              <div className='navItem'>
                <a onClick={this.Open}  target='_blank'>官网首页</a>
              </div>
              <div className='navItem'>
                <a onClick={this.handleOpen} target='_blank'>文档中心</a>
              </div>
              <span style={{lineHeight:'25px'}}>|</span>
              <div className='log'>
                <div className='navItem' style={{marginLeft: 0}}>
                  <Link to='/login'>登录</Link>
                </div>
                <div className='navRegister'>
                  <Link to='/signup'>注册</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div id='Top'>
        <div className='topWrap'>
          <div className='topLogo'>
            <a href='/'>
              <img src={this.props.loginLogo} style={{height:40}}/>
            </a>
          </div>
          {
            this.state.type === LITE && (
              <div className='topNav'>
                <div className='log'>
                  <div className='navItem' style={{marginLeft: 0}}>
                    <a onClick={this.Open} target='_blank'>官网首页</a>
                  </div>
                  <div className='navItem' style={{marginLeft: 0}}>
                    <a onClick={this.handleOpen} target='_blank'>文档中心</a>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </div>
    )
  }
}
