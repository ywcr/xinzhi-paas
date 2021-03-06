/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * PublicCompose component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, Input, Dropdown, Modal } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/PublicCompose.less"
import { loadStack, loadStackDetail } from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import { calcuDate } from '../../../common/tools'
import CreateCompose from './CreateCompose'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

const menusText = defineMessages({
  search: {
    id: 'AppCenter.ComposeCenter.Stack.search',
    defaultMessage: '搜索',
  },
  delete: {
    id: 'AppCenter.ComposeCenter.Stack.delete',
    defaultMessage: '删除',
  },
  type: {
    id: 'AppCenter.ComposeCenter.Stack.type',
    defaultMessage: '类型',
  },
  name: {
    id: 'AppCenter.ComposeCenter.Stack.name',
    defaultMessage: '编排名称',
  },
  publicType: {
    id: 'AppCenter.ComposeCenter.Stack.publicType',
    defaultMessage: '公开',
  },
  privateType: {
    id: 'AppCenter.ComposeCenter.Stack.privateType',
    defaultMessage: ' 私有',
  },
  time: {
    id: 'AppCenter.ComposeCenter.Stack.time',
    defaultMessage: '创建时间',
  },
  opera: {
    id: 'AppCenter.ComposeCenter.Stack.opera',
    defaultMessage: '操作',
  },
  desc: {
    id: 'AppCenter.ComposeCenter.Stack.desc',
    defaultMessage: '描述',
  },
  author: {
    id: 'AppCenter.ComposeCenter.Stack.author',
    defaultMessage: '创建者',
  },
  deployService: {
    id: 'AppCenter.ComposeCenter.Stack.deployService',
    defaultMessage: '部署服务',
  },
  showService: {
    id: 'AppCenter.ComposeCenter.Stack.showService',
    defaultMessage: '查看服务',
  },
  createCompose: {
    id: 'AppCenter.ComposeCenter.Stack.createCompose',
    defaultMessage: '创建编排',
  },
  tooltipsFirst: {
    id: 'AppCenter.ComposeCenter.Stack.tooltipsFirst',
    defaultMessage: '平台上的编排文件支持原生 Kubernetes 的资源定义方式，并支持服务之间的编排部署自动化，从而帮助开发者和运维人员创建并管理新一代的基于容器技术的微服务架构应用。',
  },
  tooltipsSecond: {
    id: 'AppCenter.ComposeCenter.Stack.tooltipsSecond',
    defaultMessage: '[1] Pod 编排，适用于紧耦合的服务组，保证一组服务始终部署在同一节点，并可以共享网络空间和存储卷',
  },
  tooltipsThird: {
    id: 'AppCenter.ComposeCenter.Stack.tooltipsThird',
    defaultMessage: '[2] Stack 编排，设计上与 Docker Compose 相似，但可以支持跨物理节点的服务之间通过 API 进行网络通信 ',
  },
  tooltipsForth: {
    id: 'AppCenter.ComposeCenter.Stack.tooltipsForth',
    defaultMessage: '* 以上两种编排均支持用 yaml 文件描述多个容器及其之间的关系，定制各个容器的属性，并可一键部署运行',
  }
})


const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  actionStack(itemId, itemIndex) {
    const scope = this
    this.props.scope.props.loadStackDetail(itemId, {
      success: {
        func: (res) => {
          scope.props.scope.setState({
            stackItemContent: res.data.data.content
          })
        }
      }
    })
    this.props.scope.setState({
      createModalShow: true,
      stackItem: this.props.config[itemIndex]
    });

  },
  render: function () {
    const config = this.props.config
    if (config.length == 0) {
      return(
        <div className="loadingBox">暂无数据</div>
      )
    }
    let items = config.map((item, index) => {
      const dropdown = (
        <Menu onClick={()=> browserHistory.push(`/app_manage/app_create/compose_file?templateid=${item.id}`)} style={{ width: '100px' }}>
          <Menu.Item key={`&${item.id}`}>
           <FormattedMessage {...menusText.deployService} />
          </Menu.Item>

        </Menu>
      );
      return (
        <div className="composeDetail" key={`item-${index}`} >
          <div className="name textoverflow">
            <span className="maxSpan">{item.name}</span>
          </div>
          <div className="type">
            {/* <span>{(item.type ==1) ? <FormattedMessage {...menusText.publicType} /> : <FormattedMessage {...menusText.privateType} />}</span> */}
            {item.owner}
          </div>
          <div className="image textoverflow">
            {item.description == ''?<div>暂无描述</div>:
            <span className="maxSpan">{item.description}</span>
            } 
          </div>
          <div className="time textoverflow">
            {calcuDate(item.createTime)}
          </div>
          <div className="opera">
            <Dropdown.Button overlay={dropdown} onClick={()=> this.actionStack(item.id, index)}>
              <FormattedMessage {...menusText.showService} />
            </Dropdown.Button>
          </div>
        </div>
      );
    });
    return (
      <div className="composeList">
        {items}
      </div>
    );
  }
});

class PublicCompose extends Component {
  constructor(props) {
    super(props)
    this.state = {
      //
    }
  }

  componentWillMount() {
    this.props.loadStack(DEFAULT_REGISTRY)
  }

  componentWillReceiveProps(nextProps) {
    const { space } = nextProps
    if (space.namespace !== this.props.space.namespace) {
      this.props.loadStack(DEFAULT_REGISTRY)
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    return (
      <QueueAnim className="PublicCompose"
        type="right"
        >
        <div id="PublicCompose" key="PublicCompose">
          <Alert type="info" message={
            <div>
              <p><FormattedMessage {...menusText.tooltipsFirst} /></p>
              <p><FormattedMessage {...menusText.tooltipsSecond} /></p>
              <p><FormattedMessage {...menusText.tooltipsThird} /></p>
              <p><FormattedMessage {...menusText.tooltipsForth} /></p>
            </div>
          } />
          <Card className="PublicComposeCard">
            <div className="titleBox">
              <div className="name">
                <FormattedMessage {...menusText.name} />
              </div>
              <div className="type">
                <FormattedMessage {...menusText.author} />
              </div>
              <div className="image">
                <FormattedMessage {...menusText.desc} />
              </div>
              <div className="time">
                <FormattedMessage {...menusText.time} />
              </div>
              <div className="opera">
                <FormattedMessage {...menusText.opera} />
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent scope={this} config={this.props.stackList} />
          </Card>
        </div>
        <Modal
          visible={this.state.createModalShow}
          className='AppServiceDetail'
          transitionName='move-right'
          onCancel={() => this.detailModal(false)}
          maskClosable={false}
          >
          <CreateCompose scope={this} parentState={this.state} loadMyStack={this.props.loadMyStack} readOnly={true} registry={this.props.registry} />
        </Modal>
      </QueueAnim>
    )
  }
}

PublicCompose.propTypes = {
  intl: PropTypes.object.isRequired,
  loadStack: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    stackList: [],
  }
  const { stackCenter } = state.images
  const { stackList, isFetching, registry } = stackCenter[DEFAULT_REGISTRY] || defaultPrivateImages
  const { space } = state.entities.current

  return {
    stackList,
    isFetching,
    registry,
    space,
  }
}

export default connect(mapStateToProps, {
  loadStack,
  loadStackDetail
})(injectIntl(PublicCompose, {
  withRef: true,
}))