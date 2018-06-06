/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * VisitType component
 *
 * v0.1 - 2017-07-04
 * @author zhangxuan
 */

import React, { Component } from 'react'
import { Alert, Card, Input, Button, Select, Radio, Icon, Modal, Tooltip, Form } from 'antd'
import { Link } from 'react-router'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import "./style/VisitType.less"
import { setServiceProxyGroup } from '../../../actions/services'
import { loadAllServices } from '../../../actions/services'
import { getProxy } from '../../../actions/cluster'
import NotificationHandler from '../../../common/notification_handler'
import { parseServiceDomain } from '../../parseDomain'
const RadioGroup = Radio.Group;
const Option = Select.Option;
class VisitType extends Component{
  constructor(props) {
    super(props)
    this.state = {
      value: undefined,
      disabled:true,
      forEdit: false,
      selectDis: false,
      deleteHint: true,
      svcDomain: [],
      copyStatus: false,
      privateNet: undefined,
      addrHide: false,
      proxyArr: [],
      currentProxy: [],
      initValue: undefined,
      initGroupID:undefined,
      initSelect: undefined,
      isUDP:false,
    }
  }
  componentWillMount() {
    const { service, bindingDomains, bindingIPs, getProxy, cluster } = this.props;
    this.getDomainAndProxy(getProxy,service,cluster,bindingDomains,bindingIPs)
  }
  componentWillReceiveProps(nextProps) {
    let preShow = this.props.serviceDetailmodalShow;
    const { serviceDetailmodalShow, service, bindingDomains, bindingIPs,cluster, getProxy, form} = nextProps;
    if (service.metadata && this.props.service.metadata && (service.metadata.name === this.props.service.metadata.name)) {
      return
    }
    if (serviceDetailmodalShow && !preShow ) {
    this.setState({
      disabled: true,
      forEdit:false,
      value: undefined,
      initValue: undefined,
      initGroupID: undefined,
      initSelect: undefined,
      initSelectDics: undefined,
      addrHide:undefined
    });
    form.setFieldsValue({
      groupID:undefined
    })
    }
    this.getDomainAndProxy(getProxy,service,cluster,bindingDomains,bindingIPs)
  }
  getDomainAndProxy(getProxy,service,cluster,bindingDomains,bindingIPs) {
    this.setState({
      isUDP:false
    })

    if(service.portsForExternal&&service.portsForExternal.length!=0){
      service.portsForExternal.map((val)=>{
        if(val.protocol=='UDP'){
          this.setState({
            isUDP:true
          })
        }
      })
    }
    this.setState({
      svcDomain:parseServiceDomain(service,bindingDomains,bindingIPs)
    })

    let namespace=''
      if(service.metadata&&service.metadata.namespace){
         namespace=service.metadata.namespace
      }
    getProxy(cluster,true,{
      success: {
        func: (res) => {
          this.setState({
            proxyArr:res[camelize(cluster)].data
          },()=>{
            if (service.lbgroup&&service.lbgroup.type === 'private') {
              this.setState({
                initValue: 2,
                initSelectDics: false,
                initGroupID: service.lbgroup&&service.lbgroup.id,
                privateNet: true,
                addrHide:false
              },()=>{
                this.selectProxyArr('private')
              })
            } else if (service.lbgroup&&service.lbgroup.type === 'public'){
              this.setState({
                initValue: 1,
                initSelectDics: false,
                initGroupID: service.lbgroup&&service.lbgroup.id,
                privateNet: false,
                addrHide:false
              },()=>{
                this.selectProxyArr('public')
              })
            }
          })
        },
        isAsync: true
      },
    },namespace)
    if (service.lbgroup&&service.lbgroup.type === 'none') {
      this.setState({
        initValue: 3,
        initSelectDics: true,
        addrHide: true,
      })
    }
    if (service.lbgroup&&service.lbgroup.id === 'mismatch') {
      this.setState({
        initValue:-1,
        addrHide: true,
        initSelectDics: true
      })
    }
  }
  selectProxyArr(type) {
    const { form } = this.props;
    const { proxyArr,initGroupID } = this.state;
    if( proxyArr && proxyArr.length!=0){
      let data = proxyArr.slice(0)
      let selectData = data.filter((item)=>{
        return !type || item.id === initGroupID
      })
      data = data.filter((item)=>{
        return !type || item.type === type
      })
      this.setState({
        currentProxy: data,
        initSelect: selectData
      },()=>{
        if (this.state.currentProxy.length > 0) {
          this.setState({
            deleteHint: true
          })
        } else {
          this.setState({
            deleteHint: false
          })
        }
      })
      form.setFieldsValue({
        groupID: initGroupID
      })
    }
  }
  onChange(e) {
    const { form } = this.props;
    let value = e.target.value;
    let flag;
    if (value === 1) {
      flag = 'public'
      this.setState({
        value: value,
        selectDis: false,
        initSelectDics:false
      });
      this.selectProxyArr(flag)
    } else if (value === 2) {
      flag = 'private'
      this.setState({
        value: value,
        selectDis: false,
        initSelectDics:false
      });
      this.selectProxyArr(flag)
    } else {
      this.info()
      this.setState({
        selectDis:true,
        value: 3,
        deleteHint: true
      })
    }
    form.setFieldsValue({
      groupID:undefined
    })
  }
  toggleDisabled() {
    this.setState({
      disabled: false,
      forEdit:true
    });
  }
  saveEdit() {
    const { value } = this.state;
    const { service, setServiceProxyGroup, cluster, form } = this.props;
    const notification = new NotificationHandler()
    let val = value
    form.validateFields((errors,values)=>{
      if (!!errors) {
        return;
      }
      if(!val) {
        val = this.state.initValue
      }
      let groupID = 'none'
      if(val !== 3) {
        groupID = values.groupID;
        if (groupID === undefined) {
          return notification.info('请选择网络出口')
        }
      }
      notification.spin('保存中更改中')
      setServiceProxyGroup({
        cluster,
        service: service.metadata.name,
        groupID
      },{
        success: {
          func: (res) => {
            notification.close()
            notification.success('出口方式更改成功')
            this.setState({
              disabled: true,
              forEdit:false
            });
            if (val === 3) {
              this.setState({
                addrHide: true,
              })
            } else if (val ===1) {
              this.setState({
                privateNet:false,
                addrHide: false
              })
            } else {
              this.setState({
                privateNet:true,
                addrHide: false
              })
            }
          },
          isAsync: true
        }
      })
    })
    
  }
  cancelEdit() {
    const { initValue, initSelect, initGroupID } = this.state;
    this.selectProxyArr(initSelect && initSelect[0] && initSelect[0].type)
    const { form } = this.props;
    this.setState({
      disabled: true,
      forEdit:false,
      value: initValue,
    });
    form.setFieldsValue({
      groupID: initGroupID
    })
  }
  copyTest() {
    let target = document.getElementsByClassName('copyTest')[0];
    target.select()
    document.execCommand("Copy", false);
    this.setState({
      copyStatus: true
    })
  }
  startCopyCode(domain){
    let target = document.getElementsByClassName('copyTest')[0];
    target.value = domain;
  }
  returnDefaultTooltip() {
    this.setState({
      copyStatus: false
    })
  }
  info() {
    Modal.info({
      title: <div className="deleteHintTitle">请注意若将访问方式切换为【仅在集群内访问】，已映射的服务端口将会被释放</div>,
      width: 460,
      onOk() {},
    });
  }
  domainList(flag) {
    const { svcDomain, copyStatus } = this.state;
    return svcDomain && svcDomain.map((item,index)=>{
      if (item.isInternal === flag) {
        return (
          <dd key={index} className="addrList">
            容器端口：{item.interPort}
            <span className="domain">{item.protocol?item.protocol+'':''}{item.domain}</span>
            <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
              <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this, item.domain)} onClick={this.copyTest.bind(this)}/>
            </Tooltip>
          </dd>
        )
      }
    })
  }
  render() {
    const { form,clusters } = this.props;
    const { getFieldProps } = form;
    const { value, disabled, forEdit, selectDis,deleteHint,privateNet, addrHide, currentProxy, initGroupID, initValue, initSelectDics } = this.state;
    const selectGroup = getFieldProps("groupID", {
      rules:[
        { required: deleteHint && value !== 3 ? true : false, message: "请选择网络出口" }
      ],
      initialValue: initGroupID
    })
    const proxyNode = currentProxy.length > 0 ? currentProxy.map((item,index)=>{
        return (
          <Option key={item.id} value={item.id}>{item.name}</Option>
        )
    }):null
    return (
      <Card id="visitTypePage">
        <div className="visitTypeTopBox">
          <div className="visitTypeTitle">服务访问方式</div>
          <div className="visitTypeInnerBox">
            {
              forEdit ? [
                <Button key="cancel" size="large" onClick={this.cancelEdit.bind(this)}>取消</Button>,
                <Button key="save" type="primary" size="large" onClick={this.saveEdit.bind(this)}>保存</Button>
              ] :
              <Button type="primary" disabled={this.state.isUDP} size="large" onClick={this.toggleDisabled.bind(this)}>编辑</Button>
            }
            <div className="radioBox">
              <RadioGroup onChange={this.onChange.bind(this)} value={value || initValue}>
                <Radio key="a" value={1} disabled={this.state.isUDP||disabled}>可公网访问</Radio>
                {clusters.clusterName == 'huawei' ? '' : <Radio key="b" value={2} disabled={this.state.isUDP||disabled}>内网访问</Radio> } 
                <Radio key="c" value={3} disabled={disabled}>仅在集群内访问</Radio>
              </RadioGroup>
              <p className="typeHint">
                {
                  value === 1 ? '服务可通过公网访问，选择一个网络出口；':''
                }
                {
                  value === 2 ? '服务可通过内网访问，选择一个网络出口；':''
                }
                {
                  value === 3 ? '服务仅提供给集群内其他服务访问；':''
                }
                {
                  this.state.isUDP?'UDP不支持对外网暴露；':''
                }
              </p>
              <div className={classNames("inlineBlock selectBox",{'hide': selectDis || initSelectDics})}>
                <Form.Item>
                  <Select size="large" style={{ width: 180 }} {...selectGroup} disabled={disabled} placeholder='选择网络出口'
                          getPopupContainer={()=>document.getElementsByClassName('selectBox')[0]}
                  >
                    {proxyNode}
                  </Select>
                </Form.Item>
              </div>
              <div className={classNames("inlineBlock deleteHint",{'hide': deleteHint})}><i className="fa fa-exclamation-triangle" aria-hidden="true"/>未配置该网络出口模式，请选择其他模式</div>
            </div>
          </div>
        </div>
        <div className="visitTypeBottomBox">
          <div className="visitTypeTitle">访问地址</div>
          <div className="visitAddrInnerBox">
            <input type="text" className="copyTest" style={{opacity:0}}/>
            <dl className={classNames("addrListBox",{'hide':addrHide})}>
              <dt className="addrListTitle"><Icon type="link"/>{privateNet ? '内网' : '公网'}地址</dt>
              {this.domainList(false)}
            </dl>
            <dl className="addrListBox">
              <dt className="addrListTitle"><Icon type="link"/>集群内访问地址</dt>
              {this.domainList(true)}
            </dl>
          </div>
        </div>
      </Card>
    )
  }
}

function mapSateToProp(state) {
  return {
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
    clusters: state.entities.current.cluster
  }
}

VisitType = connect(mapSateToProp, {
  setServiceProxyGroup,
  getProxy,
  loadAllServices
})(Form.create()(VisitType))
export default VisitType;