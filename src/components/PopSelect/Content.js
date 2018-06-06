/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Pop content
 *
 * v0.1 - 2016-11-15
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { Input, Button, Spin, Icon, Collapse } from 'antd'
import './style/Content.less'
import { MY_SPACE } from '../../constants'
import classNames from 'classnames'

const mode = require('../../../configs/model').mode
const standard = require('../../../configs/constants').STANDARD_MODE
const Panel = Collapse.Panel

class PopSelect extends Component {
  constructor(props) {
    super(props)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.handleSearchUserInput = this.handleSearchUserInput.bind(this)
    const { list, allUsers } = props
    this.state = {
      list,
      userSearchList: allUsers,
      userSearchInput: '',
    }
  }

  // componentWillMount() {
  //   const { list } = this.props
  //   this.setState({
  //     list,
  //   })
  // }

  componentWillReceiveProps(nextProps) {
    const { list, allUsers } = nextProps
    this.setState({
      list,
      userSearchList: allUsers,
    })
  }

  handleSearchInput() {
    const searchItem = this.refs.titleInput.refs.input.value
    const { list } = this.props
    let last = [];
    if(searchItem=="" || (searchItem.indexOf(" ")!=-1)){
      last = list
    }else {
      for(let i = 0;i < list.length;i++){
        if((list[i].name).indexOf(searchItem)!=-1) {
          last.push(list[i])
        }
      }
    }
    this.setState({
      list:last
    })
  }

  handleSearchUserInput(e) {
    const { userSearchInput, userSearchList } = this.state
    const { allUsers } = this.props
    let value = e.target.value
    if (typeof value !== undefined) {
      value = value.trim()
    } else {
      value = userSearchInput
    }
    this.setState({
      userSearchInput: value,
      userSearchList: allUsers.filter(user => user.userName.indexOf(value) > -1),
    })
  }

  getSpecial() {
    const { onChange, special, popTeamSelect } = this.props
    if (!special && !popTeamSelect) {
      return
    }
    return (
      <div className="searchInt">
        <div style={{lineHeight:'30px'}}>
          用户
        </div>
        <ul className="searchList">
          <li
            onClick={() => onChange(MY_SPACE)}
            className="myItem">
            {
              popTeamSelect
                ? MY_SPACE.teamName
                : MY_SPACE.name
            }
          </li>
        </ul>
      </div>
    )
  }

  render() {
    const { onChange, loading, special, popTeamSelect, Search, isSysAdmin, allUsers } = this.props
    const { list, userSearchList } = this.state
    let searchList = (
      list.length === 0 ?
        <div className='loadingBox'>结果为空</div>
        :
        list.map((item) => {
          let { name, disabled, isOk } = item
          // Only for clusters
          if (disabled === undefined && isOk !== undefined) {
            disabled= !isOk
          }
          let liProps = {
            key: name,
            className: classNames({
              searchItem: true,
              itemDisabled: disabled
            })
          }
          if (!disabled) {
            liProps.onClick = () => onChange(item)
          }
          return (
            <li {...liProps} style={{overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
              {
                popTeamSelect ?
                  item.teamName
                  :
                  item.name
              }
            </li>
          )
        })
    )
    let userList
    if (isSysAdmin) {
      userList = (
        <div>
          <span className='titlesearch'>
            <Input
              placeholder="请输入用户名"
              size="large"
              onChange={this.handleSearchUserInput}
              onPressEnter={this.handleSearchUserInput}
            />
            <Icon type="search" className='titleicon' onClick={this.handleSearchUserInput}/>
          </span>
          <ul className="searchList">
            {
              userSearchList.length === 0
              ? <div className='loadingBox'>结果为空</div>
              :
              userSearchList.map((user, index) => (
                <li style={{overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}} className="searchItem" key={user.namespace + index} onClick={()=>onChange(user)}>
                  {user.userName}
                </li>
              ))
            }
          </ul>
        </div>
      )
    }
    if (loading) {
      searchList = (
        <div className='loadingBox'>
          <Spin />
        </div>
      )
    }
    if (!special && !popTeamSelect) {
      return (
        <div className="PopSelectContent">
          <div style={{lineHeight:'25px'}}>
            {
              Search && (
                <span className='titlesearch'>
                  <Input
                    placeholder="请输入空间名"
                    size="large"
                    ref='titleInput'
                    id='titleInput'
                    onChange={this.handleSearchInput}
                    onPressEnter={this.handleSearchInput}
                  />
                  <Icon type="search" className='titleicon' onClick={this.handleSearchInput}/>
                </span>
              )
            }
            <ul className="searchList">
              {searchList}
            </ul>
          </div>
        </div>
      )
    }
    return (
      <div className="PopSelectContent">
        {this.getSpecial()}
        <Collapse accordion defaultActiveKey={['team']} >
          {
            isSysAdmin && (
              <Panel header="个人空间" key="user">
                {userList}
              </Panel>
            )
          }
          <Panel header="团队空间" key="team">
            {
              Search && (
                <span className='titlesearch'>
                  <Input
                    placeholder="请输入空间名"
                    size="large"
                    ref='titleInput'
                    id='titleInput'
                    onChange={this.handleSearchInput}
                    onPressEnter={this.handleSearchInput}
                  />
                  <Icon type="search" className='titleicon' onClick={this.handleSearchInput}/>
                </span>
              )
            }
            <ul className="searchList">
              {searchList}
            </ul>
          </Panel>
        </Collapse>
      </div>
    )
  }
}

PopSelect.propTypes = {
  list: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  special: PropTypes.bool,
}

export default PopSelect