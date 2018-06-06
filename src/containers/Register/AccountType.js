/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/20
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Button } from 'antd'
import './style/AccountType.less'
import registerPerAccountPNG from '../../assets/img/registerPerAccount.png'
import registerComAccountPNG from '../../assets/img/registerComAccount.png'

export default class AccountType extends Component{
  constructor(props){
    super(props)
    this.handlePageChange = this.handlePageChange.bind(this)

    this.state = {

    }
  }
  handlePageChange (person) {
    const { onChange } = this.props
    onChange(person)
  }

  render(){
    return (
      <div id="AccountType">
        <div className="accountInf" style={{paddingRight:'40px',borderRight:'1px dashed #d5d5d5'}}>
          <div className="accountImg">
            <img src={registerPerAccountPNG} alt="registerPerAccount"/>
          </div>
          <div className="accountTitle">
            <div className="line"></div>
            <div className="accountText">个人帐户</div>
            <div className="line"></div>
          </div>
          <ul className="accountList accountListR">
            <li>可使用新智云所有容器服务</li>
            <li>可使用新智云所有 DevOps、CI/CD 服务</li>
            <li>可使用新智云数据库与缓存产品服务</li>
            <li>个人开发者级别的资源配额</li>
            <li>认证帐户后可获得代金券￥5</li>
          </ul>
          <Button onClick={() => this.handlePageChange(true)} className="personBtn">注册个人帐户</Button>
        </div>
        <div className="accountInf" style={{paddingLeft:'40px'}}>
          <div className="accountImg">
            <img src={registerComAccountPNG} alt="registerPerAccount"/>
          </div>
          <div className="accountTitle">
            <div className="line"></div>
            <div className="accountText">企业帐户</div>
            <div className="line"></div>
          </div>
          <ul className="accountList accountListL">
            <li>可使用新智云所有容器服务</li>
            <li>可使用新智云所有 DevOps、CI/CD 服务</li>
            <li>可使用新智云数据库与缓存产品服务</li>
            <li>企业生产级别的资源配额</li>
            <li>认证帐户后可获得代金券￥50</li>
            <li>专业免费的 1v1 技术咨询服务</li>
          </ul>
          <div>
            <Button onClick={() => this.handlePageChange(false)} className="companyBtn">注册企业帐户</Button>
          </div>
        </div>
      </div>
    )
  }
}