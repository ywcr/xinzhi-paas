/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * select Stack Modal component
 *
 * v0.1 - 2016-12-1
 * @author Bai Yu
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Tabs } from 'antd'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadMyStack, loadStack, searchStack, loadStackDetail } from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import './style/AppAddStackModal.less'

const TabPane = Tabs.TabPane

class PrivateComponent extends Component {
  constructor(props) {
    super(props)
  }
  deployStack(item) {
    const { parentScope } = this.props
    parentScope.props.loadStackDetail(item.id, {
      success: {
        func: (res) => {
          parentScope.setState({
            templateName: item.name,
            appDescYaml: res.data.data.content,
            modalShow: false
          })
        }
      }
    })
  }
  render() {
    const { data, scope} = this.props
    const itemList = data.map(list => {
      return (
        <div className="list" key={`private-`+list.name}>
          <svg className="imgUrl">
            <use xlinkHref='#server' />
          </svg>
          <div className="infoBox">
            <div className="textoverflow">名称：{list.name} </div>
            <div className="textoverflow">描述：{list.description}</div>
          </div>
          <div className="deployBtn">
            <Button type="primary" onClick={()=> this.deployStack(list)}>
              部署
              &nbsp;&nbsp;
              <i className="fa fa-arrow-circle-o-right"></i>
            </Button>
          </div>
        </div>
      )
    })
    return (
      <div className="boxList">
        {itemList}
      </div>
    )
  }
}

class PublicComponent extends Component {
  constructor(props) {
    super(props)
  }
  componentWillMount() {
    const { loadStack } = this.props.scope.props
    loadStack(DEFAULT_REGISTRY)
  }
  deployStack(item) {
    const {parentScope} = this.props
    parentScope.props.loadStackDetail(item.id, {
      success: {
        func: (res) => {
          parentScope.setState({
            templateName: item.name,
            appDescYaml: res.data.data.content,
            modalShow: false
          })
        }
      }
    })
  }
  render() {
    const { stackList } = this.props.scope.props
    if (stackList == undefined || stackList.length == 0) {
      return (<div></div>)
    }
    const itemList = stackList.map(list => {
      return (
        <div className="list" key={`public`+ list.name}>
          <svg className="imgUrl">
            <use xlinkHref='#server' />
          </svg>
          <div className="infoBox">{list.name}</div>
          <div className="deployBtn">
            <Button type="primary" onClick={() => this.deployStack(list)}>
              部署
              &nbsp;
              <i className="fa fa-arrow-circle-o-right"></i>
            </Button>
          </div>
        </div>
      )
    })
    return (
      <div className="boxList">
        {itemList}
      </div>
    )
  }
}
PublicComponent.propTypes = {
  intl: PropTypes.object.isRequired,
  loadStack: PropTypes.func.isRequired
}

class AppAddStackModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentImageType: 'private-stack'
    }
  }

  componentWillMount() {
    this.props.loadMyStack(DEFAULT_REGISTRY)
  }
  changeType(type) {
    document.getElementById('stackName').focus()
    this.setState({
      currentImageType: type
    })
  }
  gosearchStack() {
    const stackType = this.state.currentImageType
    const config = {
      stackType,
      registry: DEFAULT_REGISTRY,
      imageName: document.getElementById('stackName').value
    }
    this.props.searchStack(config)
  }
  render() {
    const parentScope = this.props.scope
    return (
      <div id="AppAddStackModal" key="AppAddStackModal">
        <div className="operaBox">
          {/* <Button type={this.state.currentImageType == "primary" ? "primary" : "ghost"} size="large" onClick={this.selectImageType.bind(this, "privary")}>
            公有
          </Button>
          <Button size="large" type={this.state.currentImageType == "public" ? "primary" : "ghost"} onClick={this.selectImageType.bind(this, "public")}>
            私有
          </Button>
         */}
          <div className="inputBox">
            <Input size="large" style={{paddingRight: '28px'}} placeholder="按名称搜索" onPressEnter={() => this.gosearchStack()} id="stackName"/>
            <i className="fa fa-search" onClick={()=> this.gosearchStack()}></i>
          </div>
        </div>
        <Tabs defaultActiveKey="1" onChange={(e) => this.changeType(e)}>
          <TabPane tab='私有' key="private-stack"><PrivateComponent scope={this} parentScope= { parentScope } data={this.props.myStackList} /></TabPane>
          <TabPane tab="公有" key="public-stack"><PublicComponent scope={this} parentScope= { parentScope } /></TabPane>
        </Tabs>


      </div>
    )
  }

}


AppAddStackModal.propTypes = {
  intl: PropTypes.object.isRequired,
  loadMyStack: PropTypes.func.isRequired
}
function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    myStackList: [],
    stackList: []
  }
  const { stackCenter } = state.images
  const { myStackList, isFetching, registry, stackList} = stackCenter[DEFAULT_REGISTRY] || defaultPrivateImages

  return {
    myStackList,
    isFetching,
    registry,
    stackList
  }
}

export default connect(mapStateToProps, {
  loadMyStack,
  loadStack,
  searchStack,
  loadStackDetail
})(injectIntl(AppAddStackModal, {
  withRef: true,
}))