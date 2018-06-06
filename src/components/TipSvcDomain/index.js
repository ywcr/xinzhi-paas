/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  server and app some port in card
 *
 * v0.1 - 2016/11/14
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Tooltip, Badge, Timeline, Icon, Row, Col, Popover } from 'antd'
import './style/TipSvcDomain.less'

// server tips port card
class SvcTip extends Component {
  constructor(props) {
    super(props)
    this.state = {
      copyStatus: false
    }
  }
  servercopyCode() {
    let code = document.getElementById('serverCodeInput');
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyStatus: true
    });
  }
  returnDefaultTooltip() {
     //this function for return default tooltip message
    const _this = this
    setTimeout(function () {
      _this.setState({
        copyStatus: false
      });
    }, 500);
  }
  startCopyCode(url) {
    //this function for copy code to input
    let code = document.getElementById('serverCodeInput');
    code.value = url
  }
  render() {
    const { svcDomain } = this.props
    const scope = this
    let item = svcDomain.map((element, index) => {
      let linkURL = 'http://' + element.domain
      linkURL = linkURL.replace(/\s/ig,'');
      return (
        <li key={element.domain}>
          <a href="javascript:void(0)" > 容器端口:{element.interPort}</a>
          &nbsp;&nbsp;
          <a href={linkURL} target='_blank'>{lbgroup2Text(element)}:{element.domain}</a>
          <Tooltip placement='top' title={scope.state.copyStatus ? '复制成功' : '点击复制'}>
            <svg className='tipCopySvg' onClick={this.servercopyCode.bind(this)} onMouseLeave={ this.returnDefaultTooltip.bind(this) } onMouseEnter={this.startCopyCode.bind(this,element.domain)}><use xlinkHref='#appcentercopy' /></svg>
          </Tooltip>
        </li>
      )
    })
    return (
      <div className='SvcTip'>
        <ul>
          {item}
        </ul>
        <input id='serverCodeInput' style={{ position: 'absolute', opacity: '0' }} />
      </div>
    )
  }
}

// app card port content
class AppTip extends Component {
  constructor(props) {
    super(props)
    this.copyCode = this.copyCode.bind(this)
    this.returnDefaultTooltip = this.returnDefaultTooltip.bind(this)
    this.startCopyCode = this.startCopyCode.bind(this)
  }
  copyCode(e) {
    //this function for copy url
    const { scope } = this.props;
    let code = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName('input');
    code[0].select();
    document.execCommand('Copy', false);
    scope.setState({
      copyStatus: true
    });
  }
  returnDefaultTooltip() {
    //this function for return default tooltip message
    const { scope } = this.props;
    setTimeout(function () {
      scope.setState({
        copyStatus: false
      });
    }, 500);
  }
  startCopyCode(url) {
    //this function for copy code to input
    let code = document.getElementsByClassName('privateCodeInput');
    for(let index = 0; index < code.length; index++) {
      code[index].value = url.domain;
    }
  }
  render() {
    const { appDomain, scope } = this.props
    let item = appDomain.map((item, index) => {
      if (item.data.length === 0) {
        return (
          <div>
            <span>-</span>
          </div>
        )
      }
      if (item.data.length === 1) {
        let linkURL = 'http://' + item.data[0].domain
        linkURL = linkURL.replace(/\s/ig,'');
        return (
          <div>
            <Row className='firstSvc'>
              <Col style={{ display: 'inline-block', color: '#49b1e2' }}>{item.name}</Col>
            </Row>
            <Timeline>
              <Timeline.Item dot={<div style={{ height: 5, width: 5, backgroundColor: '#2db7f5', margin: '0 auto' }}></div>}>
              </Timeline.Item>
              <Timeline.Item dot={<div></div>}>
                <svg className='branchSvg'><use xlinkHref='#branch' /></svg>
                <a href="javascript:void(0)">容器端口:{item.data[0].interPort}</a>&nbsp;&nbsp;
                <a href={linkURL} target='_blank'>
                  {
                    lbgroup2Text(item.data[0])
                  }:{
                    item.data[0].domain
                  }
                </a>
                <Tooltip placement='top' title={scope.state.copyStatus ? '复制成功' : '点击复制'}>
                  <svg className='tipCopySvg' onClick={this.copyCode} onMouseLeave={this.returnDefaultTooltip} onMouseEnter={this.startCopyCode.bind(this, item.data[0].domain)}><use xlinkHref='#appcentercopy' /></svg>
                </Tooltip>
              </Timeline.Item>
            </Timeline>
          </div>
        )
      }
      if (item.data.length > 1) {
        let emptyArray = ['']
        let list = emptyArray.concat(item.data)
        return (
          <div>
            <Row className='firstSvc'>
              <Col style={{ display: 'inline-block', color: '#49b1e2' }}>{item.name}</Col>
            </Row>
            <Timeline>
              {
                list.map((url, index) => {
                  if (index === 0) {
                    return (
                      <Timeline.Item dot={ <div style={{ height: 5, width: 5, backgroundColor: '#2db7f5', margin: '0 auto' }}></div> }>
                      </Timeline.Item>
                    )
                  }
                  let linkURL = 'http://' + url.domain
                  linkURL = linkURL.replace(/\s/ig,'');
                  return (
                    <Timeline.Item dot={<div></div>}>
                      <svg className='branchSvg'><use xlinkHref='#branch' /></svg>
                      <a href="javascript:void(0)">容器端口:{url.interPort}</a>&nbsp;&nbsp;
                      <a href={linkURL} target='_blank'>{lbgroup2Text(url)}:{url.domain}</a>
                      <Tooltip placement='top' title={scope.state.copyStatus ? '复制成功' : '点击复制'}>
                        <svg className='tipCopySvg' onClick={this.copyCode} onMouseLeave={this.returnDefaultTooltip} onMouseEnter={this.startCopyCode.bind(this, url)}><use xlinkHref='#appcentercopy' /></svg>
                      </Tooltip>
                    </Timeline.Item>
                  )
                })
              }
            </Timeline>
          </div>
        )
      }
    })
    return (
      <div className='AppTip'>
        {item}
        <input className='privateCodeInput' style={{ position: 'absolute', opacity: '0' }} />
      </div>
    )
  }
}

function lbgroup2Text(item) {
  const { isInternal, lbgroup } = item
  let before = '内网'
  let after = '外网'
  if (lbgroup) {
    before = '集群内'
    const { type, id } = lbgroup
    if (type === 'public') {
      after = '公网'
    }
    if (type === 'private') {
      after = '内网'
    }
  }
  return isInternal ? before : after
}

export default class TipSvcDomain extends Component {
  constructor(props) {
    super(props)
    this.showPop = this.showPop.bind(this)
    this.state = {
      show: false,
      copyStatus: false
    }
  }
  showPop() {
    const {show} = this.state
    this.setState({
      show: !show
    })
  }
  getIconHtml() {
    const { icon } = this.props
    if (icon === 'https') {
      return (<Tooltip title='HTTPS模式'><svg className='https' ><use xlinkHref='#https' /></svg></Tooltip>)
    }
    else {
      return null
    }
  }
  render() {
    const { appDomain, svcDomain, type, parentNode } = this.props
    const scope = this
    if (svcDomain) {
      if (svcDomain.length == 0) {
        return (
          <span>-</span>
        )
      } else if (svcDomain.length == 1) {
        let linkURL = 'http://' + svcDomain[0].domain
        linkURL = linkURL.replace(/\s/ig,'');
        return (
          <div id='TipSvcDomain'>
            <a target='_blank' href={linkURL}>{svcDomain[0].domain}</a>
          </div>
        )
      }
      if (svcDomain.length > 1) {
        let linkURL = 'http://' + svcDomain[0].domain;
         linkURL = linkURL.replace(/\s/ig,'');
        // alert(linkURL);
        return (
          <div className='TipSvcDomain'>
            <span className='appDomain'>
              <a target='_blank' href={linkURL}>{this.getIconHtml()}{svcDomain[0].domain}</a>
            </span>
            <Popover placement='right'
              content={<SvcTip svcDomain={svcDomain} />}
              trigger='click'
              onVisibleChange={this.showPop}
              getTooltipContainer={() => document.getElementsByClassName(parentNode)[0]}
              arrowPointAtCenter={true}
              >
              {/*<svg className={this.state.show ? 'more showPop' : 'more'} onClick={this.showPop}>
                <use xlinkHref='#more' />
              </svg>*/}
              <Icon className={this.state.show ? 'more showPop' : 'more'} type={this.state.show ? 'minus-square' : 'plus-square'} onClick={this.showPop}/>
            </Popover>
          </div>
        )
      }
    }
    if (appDomain) {
      if (appDomain.length === 0) {
        return (
          <div id='TipAppDomain'>
            <span>-</span>
          </div>
        )
      } else if (appDomain.length === 1) {
        if (appDomain[0].data.length == 1) {
          let linkURL = 'http://' + appDomain[0].data[0].domain
          linkURL = linkURL.replace(/\s/ig,'');
          return (
            <a target='_blank' href={linkURL}>{appDomain[0].data[0].domain}</a>
          )
        }
        if (appDomain[0].data.length > 1) {
          let linkURL = 'http://' + appDomain[0].data[0].domain
          linkURL = linkURL.replace(/\s/ig,'');
          return (
            <div className={type ? 'TipAppDomain fixTop' : 'TipAppDomain'}>
              <span className='appDomain'>
                {this.getIconHtml()}
                <a target='_blank' href={linkURL}>{appDomain[0].data[0].domain}</a>
              </span>
              <Popover placement={type ? 'rightBottom' : 'rightTop'}
                content={<AppTip scope={scope} appDomain={appDomain} />}
                trigger='click'
                onVisibleChange={this.showPop}
                getTooltipContainer={() => document.getElementsByClassName(parentNode)[0]}
                arrowPointAtCenter={true}
                >
                {/*<svg className={this.state.show ? 'more showPop' : 'more'} onClick={this.showPop}>
                  <use xlinkHref='#more' />
                </svg>*/}
                <Icon className={this.state.show ? 'more showPop' : 'more'} type={this.state.show ? 'minus-square' : 'plus-square'} onClick={this.showPop}/>
              </Popover>
            </div>
          )
        }
      } else {
        let linkURL = 'http://' + appDomain[0].data[0].domain
        linkURL = linkURL.replace(/\s/ig,'');
        return (
          <div className={type ? 'TipAppDomain fixTop' : 'TipAppDomain'}>
            <span className='appDomain'>
              <a target='_blank' href={linkURL}>{this.getIconHtml()}{appDomain[0].data[0].domain}</a>
            </span>
            <Popover placement={type ? 'rightBottom' : 'rightTop'}
              content={<AppTip scope={scope} appDomain={appDomain} />}
              trigger='click'
              onVisibleChange={this.showPop}
              getTooltipContainer={() => document.getElementsByClassName(parentNode)[0]}
              arrowPointAtCenter={true}
              >
              <Icon className={this.state.show ? 'more showPop' : 'more'} type={this.state.show ? 'minus-square' : 'plus-square'} onClick={this.showPop}/>
              {/*<svg className={this.state.show ? 'more showPop' : 'more'} onClick={this.showPop}>
                <use xlinkHref='#more' />
              </svg>*/}
            </Popover>
          </div>
        )
      }
    }else{
      return (
        <div id='TipAppDomain'>
          <span>-</span>
        </div>
      )
    }
  }
}