/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * app store component
 *
 * v0.1 - 2016-10-10
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input, Icon, Tabs } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/storeDetail.less'
import YamlEditor from '../../Editor/Yaml'
import { TIMESTRAP } from '../../../constants'

const TabPane = Tabs.TabPane;

class DetailInfo extends Component {
  constructor(props) {
    super(props)
  }
  render () {
    const {data} = this.props
    if (!data) {
      return (
        <div>暂无信息</div>
      )
    }
    return (
      <div className="infoList markdown">
        <div style={{'word-wrap':' break-word'}} dangerouslySetInnerHTML={{__html: data.description}}></div>
      </div>
    )
  }
}

class DetailStack extends Component {
  constructor(props) {
    super(props)
  }
  render () {
    const {data} = this.props
    if (!data) {
      return (
        <div>暂无编辑文件</div>
      )
    }
    return (
      <div className="infoList">
        <YamlEditor value={data.content} />
      </div>

    )
  }
}

class DetailBox extends Component {
  constructor(props) {
    super(props)
  }

  deleteApp=()=>{
    const {scope}=this.props
      scope.setState({
          delModal:true
      })
  }


  render() {
    const {data, scope} = this.props
    return (
      <div className="appStoreDetail" key="appStoreDetail">
        <div className="topTitle">
          <span className="rightColse" onClick={()=> {scope.setState({detailModal: false})} }><Icon type="cross" /></span>
        </div>
        <div className="wrapContent">
          <div className="boxDeploy">
            <div className='imgBox'>
              <img className={"detailImage " + data.name.split(' ')[0]} src={data.imageUrl==''?data.logId :`${data.imageUrl}`}/>
            </div>
            <ul className="detailType">
              <li><h3>{data.name}</h3></li>
              <li>类型：{data.category}</li>
              <li>来源：Enncloud</li>
              <li>提供者：{data.owner=='tenxcloud'?'Enncloud':data.owner}</li>
            </ul>
            <div className="right-btn">
              <Button size="large" className='btn-danger' type='ghost' style={{margin:'0px  10px'}}  onClick={this.deleteApp} ><Icon type='delete' />删除</Button>
              <Link to={`/app_manage/app_create/quick_create?templateid=${data.id}`} ><Button size="large" type="primary">部署</Button></Link>
            </div>
          </div>
          <div className="boxContent">
            <Tabs className="itemList" defaultActiveKey="1">
              <TabPane tab={<div style={{lineHeight:'40px'}}>基本信息</div>} key={1}><DetailInfo data={ data } /></TabPane>
              <TabPane tab={<div style={{lineHeight:'40px'}}>编排文件</div>} key={2}><DetailStack data={ data } /></TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

}

export default DetailBox