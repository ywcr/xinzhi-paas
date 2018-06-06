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
import { Menu, Dropdown, Icon, Select, Input, Button, Form, Popover, Spin } from 'antd'
import './style/PopSelect.less'
import Content from './Content'
import { browserHistory } from 'react-router'
export default class PopSelect extends Component {
  constructor(props) {
    super(props)
    this.setValue = this.setValue.bind(this)
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.state = {
      focus: false,
      visible: props.visible,
    }
  }

  setValue(item) {
    const { onChange } = this.props
    if (onChange) {
      onChange(item)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps
    this.setState({
      visible,
    })
  }

  handleVisibleChange(visible) {
    this.setState({ visible })
  }

  render() {
    const { title, btnStyle, loading, special, selectValue, list, popTeamSelect, Search, isSysAdmin, allUsers } = this.props
    const text = <span className="PopSelectTitle">{title}</span>
    
    if(selectValue == 'huawei' &&window.location.pathname.includes('database_cache')){
      browserHistory.push('/')
    }
    const { visible } = this.state
    const rotate = visible ? 'rotate180' : 'rotate0'
    return (
      <div className="PopSelect">
        <Popover
          placement="bottomLeft"
          overlayClassName="PopSelect"
          title={text}
          content={
            <Content
              Search={Search}
              list={list}
              onChange={this.setValue}
              loading={loading}
              special={special}
              popTeamSelect={popTeamSelect}
              isSysAdmin={isSysAdmin}
              allUsers={allUsers}
              />
          }
          trigger="click"
          visible={this.state.visible}
          onVisibleChange={this.handleVisibleChange}
          getTooltipContainer={() => document.getElementById('root')}>
          {
            btnStyle ?
              <Button className='popBtn'>
                <i className="fa fa-sitemap icon" />
                {selectValue}
                <Icon type="down" className={rotate} />
              </Button> :
              <a className="ant-dropdown-link lineBtn" href="#">
                {selectValue}
                <Icon type="down" className={rotate} style={{float:'right',marginLeft:'10px'}}/>
              </a>
          }
        </Popover>
      </div>
    )
  }
}