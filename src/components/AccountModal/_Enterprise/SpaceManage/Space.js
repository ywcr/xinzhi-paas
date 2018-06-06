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
import { Row, Col, Button, Popover, Spin, Modal,Input } from 'antd'
import './style/Space.less'
import { browserHistory } from 'react-router'
import { setCurrent } from '../../../../actions/entities'
import SearchInput from '../../../SearchInput'
import { loadTeamClustersList } from '../../../../actions/team'
import { connect } from 'react-redux'
import PopContent from '../../../PopSelect/Content'
import NotificationHandler from '../../../../common/notification_handler'
import { parseAmount } from '../../../../common/tools'
import SpaceRecharge from '../Recharge/SpaceRecharge'
import { ROLE_SYS_ADMIN } from '../../../../../constants'

let TeamSpace = React.createClass({
  getInitialState() {
    return {
      currentSpace: null
    }
  },
  handleVisibleChange(teamspace, visible) {
    if (!visible) {
      return
    }
    const { loadTeamClustersList } = this.props.scope.props
    loadTeamClustersList(teamspace.teamID)
    this.setState({
      currentSpace: teamspace
    })
  },
  handleClusterChange(cluster) {
    const { setCurrent } = this.props.scope.props
    const { currentSpace } = this.state
    let notification = new NotificationHandler()
    setCurrent({
      team: {
        teamID: currentSpace.teamID
      },
      space: currentSpace,
      cluster,
    })
    let msg = `已进入空间 ${currentSpace.spaceName}（集群：${cluster.clusterName}）`
    notification.success(msg)
    browserHistory.push('/')
  },
  render: function () {
    let firstRow = true
    let className = ""
    let Search = false
    let items = ""
    const { userDetail } = this.props.scope.props
    const {
      teamspaces,
      isTeamClustersFetching,
      teamClusters,
      teamID,
    } = this.props.scope.props
    var spacelist = this.props.scope.state.searchList || teamspaces
    if(spacelist.length!=0){
      items = spacelist.map((teamspace, index) => {
        if (firstRow) {
          className = "contentList firstItem"
          firstRow = false
        } else {
          className = "contentList"
        }
        let text = <span>请选择集群</span>
        let contentClusterList = []
        if (teamID === teamspace.teamID) {
          contentClusterList = teamClusters
        }
        return (
          <Row className={className} key={teamspace.spaceName}>
            <Col span={4}>{teamspace.spaceName}</Col>
            <Col span={5}>{teamspace.teamName}</Col>
            <Col span={2}>{teamspace.appCount}</Col>
            <Col span={2}>{teamspace.serviceCount}</Col>
            <Col span={2}>{teamspace.containerCount}</Col>
            <Col span={3}>{parseAmount(teamspace.balance).fullAmount}</Col>
            <Col span={6}>
              <Popover
                placement="right"
                title={text}
                content={
                  <PopContent
                    Search={Search}
                    list={contentClusterList}
                    onChange={this.handleClusterChange}
                    loading={isTeamClustersFetching} />
                }
                trigger="click"
                getTooltipContainer={() => document.getElementsByClassName('contentTop')[0]}
                onVisibleChange={this.handleVisibleChange.bind(this, teamspace)}>
                <Button type="primary">进入空间</Button>
              </Popover>
              {(userDetail.role == ROLE_SYS_ADMIN) ?
                <Button type="primary" style={{marginLeft:'20px'}} onClick={()=>　this.props.scope.btnRecharge(index)}>充值</Button>
                :null
              }
            </Col>
          </Row>
        )
      })
    }else{
      items = <div className="ant-table-placeholder"><i className="anticon anticon-frown"></i>暂无数据</div>
    }
    return (
      <div>
        <Row className="contentTop">
          <Col span={4}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingname" />
            </svg>
            <span className="infSvgTxt">空间名称</span>
          </Col>
          <Col span={5}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingownteam" />
            </svg>
            <span className="infSvgTxt">空间所属团队</span>
          </Col>
          <Col span={2}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingapp" />
            </svg>
            <span className="infSvgTxt">应用</span>
          </Col>
          <Col span={2}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingservice" />
            </svg>
            <span className="infSvgTxt">服务</span>
          </Col>
          <Col span={2}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingcontainer" />
            </svg>
            <span className="infSvgTxt">容器</span>
          </Col>
          <Col span={3}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingbalance" />
            </svg>
            <span className="infSvgTxt">余额</span>
          </Col>
          <Col span={6}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingopt" />
            </svg>
            <span className="infSvgTxt">操作</span>
          </Col>
        </Row>
        {items}
      </div>
    )
  }
})

class Space extends Component {
  constructor(props) {
    super(props)
    this.state = {
      spaceVisible: false,
      selected: [],
      searchList:null,
    }
  }
  btnRecharge(index) {
    this.setState({selected: [index], spaceVisible: true})
  }
  render() {
    const {userDetail, appCount, serviceCount, containerCount, teamspaces,teamClusters} = this.props
    const searchIntOption = {
      placeholder: '搜索',
      defaultSearchValue: 'space',
    }
    return (
      <div id='Space'>
        <Row className="spaceWrap">
          <div className="spaceTitle">
            {/* <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingteamspace" />
            </svg> */}
            <span className="infSvgTxt">
              <span className="title"> {userDetail.userName}的团队空间 </span>
              <SearchInput searchIntOption={searchIntOption} scope={this} scope={this} data={teamspaces} />
            </span>
          </div>
          <div className="spaceContent">
            <TeamSpace teamspaces={teamspaces} scope={this} />
          </div>
        </Row>
        {/* 空间充值 */}
        <Modal title="团队空间充值" visible={this.state.spaceVisible}
          onCancel={()=> this.setState({spaceVisible: false})}
          width={600}
          maskClosable={false}
          footer={null}
        >
          <SpaceRecharge parentScope={this} selected={this.state.selected} teamSpacesList={this.state.searchList||this.props.teamspaces} teamList={'default'}/>
        </Modal>
      </div>
    )
  }
}
function mapStateToProps(state, props) {
  const { current } = state.entities
  const { teamClusters } = state.team
  const userDetail = state.entities.loginUser.info
  return {
    userDetail,
    current,
    isTeamClustersFetching: teamClusters.isFetching,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
    teamID: (teamClusters.result ? teamClusters.result.teamID : null),
  }
}

Space = connect(mapStateToProps, {
  loadTeamClustersList,
  setCurrent,
})(Space)

export default Space