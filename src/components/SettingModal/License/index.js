/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  license list
 *
 * v0.1 - 2016/11/10
 * @author BaiYu
 */
import React, { Component } from 'react'
import { Row, Col, Spin, Alert, Card, Tooltip, Popover, Icon, Button, Form, Input } from 'antd'
import './style/License.less'
import { loadLicenseList, loadLicensePlatform, addLicense, loadMergedLicense } from '../../../actions/license'
import { connect } from 'react-redux'
import { formatDate } from '../../../common/tools'
import { DEFAULT_LICENSE } from '../../../../constants'
import NotificationHandler from '../../../common/notification_handler'
import { getPortalRealMode } from '../../../common/tools'
import { LITE } from '../../../constants'
import { camelize } from 'humps'
import Title from '../../Title'

const createForm = Form.create;
const FormItem = Form.Item;
const mode = getPortalRealMode
const liteFlag = mode === LITE

let LicenseKey = React.createClass({
  changeValue(e) {
    // fix in ie input change value issue
    this.props.form.setFieldsValue({'rePasswd': e.target.value})
  },
  activeLicense() {
    const parentScope = this.props.scope
    const {validateFields} = this.props.form
    validateFields((errors, values) =>{
      if(errors){
        return
      }
      parentScope.props.addLicense({rawlicense: values.rePasswd}, {
        success: {
          func: () =>{
            new NotificationHandler().success('添加许可证成功')
            parentScope.props.loadLicenseList()
            parentScope.setState({activeClick: false})
          },
          isAsync: true
        },
        failed: {
          func: (res) =>{
            new NotificationHandler().error('添加许可证失败', 'License 错误或不可重复添加！')
          }
        }
      })

    })
  },

  render() {
    const {getFieldProps} = this.props.form;
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{
        required: true, whitespace: true, message: '请输入许可证'
      }]
    });
    const parentScope = this.props.scope
    return (
      <div className="ant-col-10">
        <Form>
          <FormItem hasFeedback>
            <Button type="primary" onClick={() => this.activeLicense()}>添加许可证</Button>&nbsp;&nbsp;&nbsp;
            <Button onClick={() => parentScope.setState({activeClick: false})}>取消</Button>
          </FormItem>
          <FormItem hasFeedback>
            <Input type="textarea" onInput={(e) => this.changeValue(e)} {...rePasswdProps} style={{maxHeight: 200}}/>
          </FormItem>
        </Form>
      </div>
    )
  }
})

LicenseKey = createForm()(LicenseKey)

class License extends Component {
  constructor(props){
    super(props)
    this.state = {
      copySuccess: false,
      activeClick: false,
      leftTrialDays: 14,
      trialEndTime: false
    }
  }

  componentWillMount(){
    const _this = this
    this.props.loadLicensePlatform()
    this.props.loadLicenseList({
      success: {
        func: (res) =>{
          if(!res.data || res.data.licenses.length == 0){
            _this.props.loadMergedLicense({
              success: {
                func: (res) =>{
                  if(res.data){
                    _this.setState({leftTrialDays: res.data.leftTrialDays, trialEndTime: res.data.end || res.data.trialEndTime})
                  }
                }
              }
            })

          }
        },
        isAsync: true
      }
    })

  }

  getAlertType(code){
    switch(code){
      case 0:
        return 'success'
      case -1:
        return 'error'
      case 1:
      default:
        return 'warning'
    }
  }

  copyLicenseCode(index){
    const scope = this;
    let code = document.getElementsByClassName("licenseMoreInput");
    code[index].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  }

  copyDownloadCode(){
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("licenseInput");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  }

  returnDefaultTooltip(){
    const scope = this;
    setTimeout(function(){
      scope.setState({
        copySuccess: false
      });
    }, 500);
  }

  onCharge(){
    this.setState({activeClick: true})
    setTimeout(function(){
      document.getElementById('rePasswd').focus()
    }, 300)
  }

  lincenseList(data){
    if(!data || data.length == 0){
      return (<tr>
        <td colSpan="8" className="text-center"><Icon type="frown"/>&nbsp;暂无数据</td>
      </tr>)
    }
    const listRow = data.map((list, index) =>{
      return (
        <tr className="ant-table-row  ant-table-row-level-0" key={'list' + index}>
          <td>
            {list.licenseUid.substring(0, 15)}
            <Popover getTooltipContainer={() => document.getElementById('License')} trigger="click"
                     content={<div className="popLicense">{list.licenseUid}<Tooltip
                       title={this.state.copySuccess ? '复制成功' : '点击复制'}><a onClick={() => this.copyLicenseCode(index)}
                                                                           onMouseLeave={() => this.returnDefaultTooltip()}>&nbsp;
                       <Icon type="copy"/></a></Tooltip></div>} title={null}>
              <svg className='svgmore'>
                <use xlinkHref='#more'/>
              </svg>
            </Popover>
            <input style={{position: 'absolute', opacity: '0'}} className="licenseMoreInput"
                   defaultValue={list.licenseUid}/>
          </td>
          <td >{list[camelize('max_clusters')] || DEFAULT_LICENSE.max_clusters}</td>
          <td >{list[camelize('max_nodes')]} {/*(list[camelize('max_nodes')] > 0 && index == 0) ? '（当前生效）' : ''*/}</td>
          <td >{formatDate(list.start)}</td>
          <td >{formatDate(list.end)}</td>
          <td >{Math.floor((new Date(list.end).getTime() - new Date(list.start).getTime()) / 24 / 60 / 60 / 1000 *100) /100} 天</td>
          <td >{formatDate(list.addTime)}</td>
          <td >{list.addUser ? list.addUser : '未知'}</td>
        </tr>
      )
    })
    return listRow
  }

  // triaDays() {
  //   const nowDate = new Date()
  //   let nowTime = formatDate(nowDate.getTime() + (parseInt(this.state.leftTrialDays) + 1) * 24*60*60*1000 )
  //   nowTime = nowTime.substr(0, nowTime.indexOf(' '))
  //   return nowTime + ' 00:00'
  // }
  render(){
    const {isFetching, license, platform} = this.props
    if(isFetching || !license){
      return (
        <div className='loadingBox'>
          <Spin size='large'/>
        </div>
      )
    }
    const { licenses, merged } = license
    return (
      <div id='License'>
        <Title title="授权管理" />
        <div className="title">授权管理</div>
        <Card className="licenseWrap">
          <div className="list list-first">
            <span className="leftKey ant-col-2">平台ID</span>
            <span className="inputGroup ant-col-10">
              <span>{platform.data.platformid}</span>
              <Tooltip title={this.state.copySuccess ? '复制成功' : '点击复制'}><a onClick={() => this.copyDownloadCode()}
                                                                           onMouseLeave={() => this.returnDefaultTooltip()}><Icon
                type="copy"/></a></Tooltip>
              <input className="licenseInput" defaultValue={platform.data.platformid}/>
            </span>
          </div>
          <div className="list">
            <span className="leftKey ant-col-2">License</span>
            {this.state.activeClick ?
              <LicenseKey scope={this}/>
              :
              <div className="ant-col-20">
                <Button type="primary" size="large" onClick={() => this.onCharge()}
                        style={{marginRight: '40px'}}>立即授权</Button>
                {
                  license.licenses.length > 0 ? [<Icon type="check-circle" className="success"/>, ' 已激活',
                    <span className="dataKey">有效期至：{formatDate(license.merged.end || '')} </span>]
                    :
                    [<Icon type="check-circle" className="success"/>, ' 未激活',
                      <span className="dataKey">试用期至：{formatDate(this.state.trialEndTime)} </span>]
                }
              </div>
            }

          </div>
          {
            liteFlag &&
            <div className="list oneTips">
              <div>您可通过以下几种方式联系我们获取『许可证License』：</div>
              <div className="ant-col-20 oneTips">
                ① 发送“ <span style={{color: '#24a7eb'}}>平台ID + 姓名 + 电话 + 公司名 </span>” 到 <a
                href="mailto:support@paas.enncloud.cn" style={{color: '#24a7eb'}}>support@paas.enncloud.cn </a>我们将主动与您联系
              </div>
              <div className="ant-col-20 oneTips">
                ② 如果平台可访问公网，右下角会出现工单小图标，可直接点击与我们取得联系，获取License
              </div>
              <div className="ant-col-20 oneTips">
                ③ 访问新智云的公有云控制台：<a href="https://portal.paas.enncloud.cn" target="_blank">portal.paas.enncloud.cn</a>（即将上线在线购买许可证
                License功能）
              </div>
            </div>
          }
        </Card>
        <br />
        <Card className="licenseWrap">
          {
            merged && (
              <div className="merged">
                <span className="secTitle">当前生效（集群、节点是授权后立即生效，许可证时长为累加）</span>
                <div className="content">
                  <table className="list-table">
                    <thead className="ant-table-thead">
                    <tr>
                      <th ><span>最大集群数</span></th>
                      <th ><span>最大节点数</span></th>
                      <th ><span>失效时间</span></th>
                    </tr>
                    </thead>
                    <tbody className="ant-table-tbody">
                      <tr>
                        <td>{merged[camelize('max_clusters')]}</td>
                        <td>{merged[camelize('max_nodes')]}</td>
                        <td>{formatDate(merged.end)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }
          <div className="licenses">
            <span className="secTitle">授权历史</span>
            <table className="list-table">
              <thead className="ant-table-thead">
              <tr>
                <th ><span>许可证 ID</span></th>
                <th ><span>最大集群数</span></th>
                <th ><span>最大节点数</span></th>
                <th ><span>生效时间</span></th>
                <th ><span>失效时间</span></th>
                <th ><span>有效时长</span></th>
                <th ><span>添加时间</span></th>
                <th ><span>操作人</span></th>
              </tr>
              </thead>
              <tbody className="ant-table-tbody">
                {this.lincenseList(licenses)}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    )
  }
}

function mapStateToProps(state, props){
  const defaultState = {
    isFetching: false,
    result: {'platformid': 'test'}
  }
  const {data} = state.license.licenses.result || {}
  const {isFetching, result} = state.license.platform || defaultState
  return {
    isFetching,
    license: data,
    platform: result
  }
}

export default connect(mapStateToProps, {
  addLicense,
  loadLicenseList,
  loadLicensePlatform,
  loadMergedLicense
})(License)