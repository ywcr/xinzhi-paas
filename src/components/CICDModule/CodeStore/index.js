/**
* Licensed Materials - Property of paas.enncloud.cn
* (C) Copyright 2016 TenxCloud. All Rights Reserved.
*
* CodeStore component
*
* v0.1 - 2016-10-31
* @author BaiYu
*/
import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, Input, message, Tooltip, Icon, Dropdown, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getProjectList, removeProject, searchProject, filterProject } from '../../../actions/cicd_flow'
import NotificationHandler from '../../../common/notification_handler'
import Title from '../../Title'

import './style/CodeStore.less'


const menusText = defineMessages({
  tooltips: {
    id: 'CICD.TenxStorm.tooltips',
    defaultMessage: '代码仓库：这里完成构建前的准备工作，开发者可以在这里关联企业里业务代码所在的代码仓库，关联好代码仓库后，选择激活代码项目为可构建状态， 以便后续构建EnnFlow时选择可构建的代码项目。注：构建时无权访问已注销代码仓库的代码源，下次重新关联后可正常使用',
  },
  show: {
    id: 'CICD.TenxStorm.show',
    defaultMessage: '查看公钥',
  },
  name: {
    id: 'CICD.TenxStorm.name',
    defaultMessage: '名称',
  },
  ID: {
    id: 'CICD.TenxStorm.ID',
    defaultMessage: 'ID',
  },
  attr: {
    id: 'CICD.TenxStorm.attr',
    defaultMessage: '属性',
  },
  action: {
    id: 'CICD.TenxStorm.action',
    defaultMessage: '操作',
  },
  codeSrc: {
    id: 'CICD.TenxStorm.codeSrc',
    defaultMessage: '代码源',
  },
  linkCode: {
    id: 'CICD.TenxStorm.linkCode',
    defaultMessage: '关联代码库',
  },
  releaseActivation: {
    id: 'CICD.TenxStorm.releaseActivation',
    defaultMessage: '解除激活',
  },
  search: {
    id: 'CICD.TenxStorm.search',
    defaultMessage: '搜索',
  },
  copySuccess: {
    id: 'CICD.TenxStorm.copySuccess',
    defaultMessage: '复制成功'
  },
  copyBtn: {
    id: 'CICD.TenxStorm.copyBtn',
    defaultMessage: '复制'
  },
  clickCopy: {
    id: 'CICD.TenxStorm.clickCopy',
    defaultMessage: '点击复制'
  }
})

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  getInitialState() {
    return { showModal: false, keyModal: false }
  },
  operaMenuClick: function (item, e) {
    //this function for user click the dropdown menu
    const key = e.key.split('@')[0]
    switch (key) {
      case '1':
        this.setState({
          showModal: true,
          webhookUrl: item.webhookUrl,
          repoType: item.repoType
        })
        break;
      case '2':
        this.setState({
          keyModal: true,
          publicKey: item.publicKey,
          itemType: item.isPrivate,
          repoType: item.repoType,
          itemName: item.name
        })
        break;
      default:
        this.setState({ showModal: true })
    }
  },
  showItemKeyModal(item) {
    this.setState({
      keyModal: true,
      publicKey: item.publicKey,
      itemType: item.isPrivate,
      repoType: item.repoType,
      itemName: item.name
    })
  },
  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("CodeCopy");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  },
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  },
  copyItemKey() {
    const scope = this;
    let code = document.getElementsByClassName("KeyCopy");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  },
  notActive(id) {
    this.setState({activeModal: true, activeId: id})
    // this.targeActive(id)
    return
  },
  targeActive() {
    this.setState({activeModal: false})
    let notification = new NotificationHandler()
    this.props.scope.props.removeProject(this.state.activeId, {
      success: {
        func: () => {
          notification.success('解除激活成功')
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          if (res.statusCode == 400) {
            notification.error('该项目正在被EnnFlow引用，请解除引用后重试')
          } else {
            notification.error('解除激活失败')
          }
        }
      }
    })
  },
  render: function () {
    const { config, scope, formatMessage } = this.props
    if (!config || config.length == 0) return (<div style={{ lineHeight: '50px', textAlign: 'center' }}>暂无数据</div>)
    let items = config.map((item) => {
      const dropdown = (
        item.webhookUrl ?
          <Menu onClick={this.operaMenuClick.bind(this, item)}
            style={{ width: '113px' }}
            >
            <Menu.Item key={`1@${item.name}`}>
              <i className='fa fa-eye' />&nbsp;
              WebHook
            </Menu.Item>
            {item.isPrivate == 1 && item.repoType != 'svn' ?
              <Menu.Item key={`2@${item.name}`}>
                <span><i className='fa fa-pencil-square-o' />&nbsp;
                <FormattedMessage {...menusText.show} />
                </span>
              </Menu.Item>
              : <Menu.Item key="none" style={{ display: 'none' }}></Menu.Item>
            }
          </Menu>
          :
          <Menu onClick={this.operaMenuClick.bind(this, item)}
            style={{ width: '113px' }}
            >
            {item.isPrivate == 1 && item.repoType != 'svn' ?
            <Menu.Item key={`2@${item.name}`}>
              <span><i className='fa fa-pencil-square-o' />&nbsp;
              <FormattedMessage {...menusText.show} />
              </span>
            </Menu.Item>
            : <Menu.Item key="none" style={{ display: 'none' }}></Menu.Item>
            }
          </Menu>
      );
      return (
        <div className='CodeTable' key={item.id} >
         <div className='name textoverflow'>
            <Tooltip title={item.name}><span>{item.name}</span></Tooltip>
          </div>
          <div className='id textoverflow'>
            <Tooltip title={item.id}><span>{item.id}</span></Tooltip>
          </div>
          {item.isPrivate == 1 ?
            <div className="type private">
              <svg className='privateSvg'>
                <use xlinkHref='#cicdprivate' />
              </svg>
              <span className="margin">private</span>
              {item.repoType != 'svn' ?
              <Button type="ghost" style={{ marginLeft: '10px' }} onClick={() => this.showItemKeyModal(item)}><i className="fa fa-eye"></i> 查看公钥</Button>
              : null
              }
            </div>
            :
            <div className='type public'>
              <svg className='publicSvg'>
                <use xlinkHref='#cicdpublic' />
              </svg>
              <span className="margin">public</span>
            </div>
          }
          <div className='codelink textoverflow'>
            <Tooltip title={item.address}><span><i className={`fa fa-${item.repoType}`}/> {item.address}</span></Tooltip>
          </div>
          <div className='action'>

            {item.webhookId || item.webhookUrl ?
              <Dropdown.Button overlay={dropdown} type='ghost' onClick={() => this.notActive(item.id)} >
                <Icon type='delete' />
                <FormattedMessage {...menusText.releaseActivation} />
              </Dropdown.Button>
            :
              <Button style={{width:'120px'}} overlay={dropdown} type='ghost' onClick={() => this.notActive(item.id)} >
                <Icon type='delete' />
                <FormattedMessage {...menusText.releaseActivation} />
              </Button>
            }

          </div>
        </div>
      );
    });
    return (
      <div className='CodeStore'>
        {items}

        <Modal title="手动添加WebHook" visible={this.state.showModal}
          onCancel={() => { this.setState({ showModal: false }) }}
          maskClosable={false}
          footer={[
            <Button key="back" type="ghost" size="large" onClick={() => { this.setState({ showModal: false }) } }>关闭</Button>,
          ]}
          >
          <div>
            <div className="alertRow">
              <p>
                ① 在激活项目时，EnnFlow 会自动在代码管理工具端添加『访问公钥』、『Webhook』 等集成所需的资源；
              </p>
              <p>
                ② 如果激活时提示添加对应资源失败，可以通过『查看公钥』、『Webhook』 获取的信息，手动添加到对应代码项目的配置中。
              </p>
            </div>
            <p style={{ lineHeight: '40px' }}>* 将该URL填入到 {this.state.repoType ? this.state.repoType.replace('l', 'L').replace('h', 'H').replace('g', 'G') : ''}项目的Web Hooks URL中</p>
            <div style={{ padding: '10px', border: '1px solid #d9d9d9', wordWrap: 'break-word' }} className="valueBox">{this.state.webhookUrl}</div>
            <p style={{ opacity: '0', position: 'absolute' }}><Input type="textarea" className="CodeCopy" autosize={{ minRows: 2, maxRows: 6 }} value={this.state.webhookUrl} /></p>
            <p style={{ marginTop: '10px' }}>
              <Tooltip title={this.state.copySuccess ? formatMessage(menusText.copySuccess) : formatMessage(menusText.clickCopy)} placement="right">
                <Button type="primary" size="large" onClick={this.copyDownloadCode} onMouseLeave={this.returnDefaultTooltip}><FormattedMessage {...menusText.copyBtn} /></Button>
              </Tooltip>
            </p>
          </div>
        </Modal>

        <Modal title="项目公钥" visible={this.state.keyModal} onCancel={() => { this.setState({ keyModal: false }) } }
          footer={[
            <Button key="back" type="ghost" size="large" onClick={() => { this.setState({ keyModal: false }) } }>关闭</Button>,
          ]}
          >
          <div>
            <div className="alertRow">
              <p>
                ① 在激活项目时，EnnFlow 会自动在代码管理工具端添加『访问公钥』、『Webhook』 等集成所需的资源；
              </p>
              <p>
                ② 如果激活时提示添加对应资源失败，可以通过『查看公钥』、『Webhook』 获取的信息，手动添加到对应代码项目的配置中。
              </p>
            </div>
            <p style={{ lineHeight: '30px' }}>检测到关联的代码托管系统：</p>
            <p style={{ lineHeight: '40px' }}><span style={{ color: '#00A0EA' }} className="name">仓库: {this.state.itemName} </span>  <span style={{ color: '#00A0EA', marginLeft: '20px' }} className="type">属性：{this.state.itemType == 1 ? "私有" : "公有"}</span> </p>

            <p style={{ lineHeight: '40px' }}>* 请手动配置以下公钥到<span style={{textTransform:'capitalize'} }>{this.state.repoType ? this.state.repoType.replace('l', 'L').replace('h', 'H') : ''}</span>项目中：</p>
            <div style={{ padding: '10px', border: '1px solid #d9d9d9', wordWrap: 'break-word' }}>{this.state.publicKey}</div>
            <p style={{ opacity: '0', position: 'absolute' }}><Input type="textarea" className="KeyCopy" autosize={{ minRows: 2, maxRows: 6 }} value={this.state.publicKey} /></p>
            <p style={{ marginTop: '10px' }}>
              <Tooltip title={this.state.copySuccess ? formatMessage(menusText.copySuccess) : formatMessage(menusText.clickCopy)} placement="right">
                <Button type="primary" size="large" onClick={this.copyItemKey} onMouseLeave={this.returnDefaultTooltip}><FormattedMessage {...menusText.copyBtn} /></Button>
              </Tooltip>
            </p>
          </div>
        </Modal>

        <Modal title="解除激活操作" visible={this.state.activeModal}
          onOk={()=> this.targeActive()} onCancel={()=> this.setState({activeModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要解除激活这项操作?</div>
        </Modal>
      </div>
    );
  }
});

class CodeStore extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.props.getProjectList()
  }

  componentWillReceiveProps(nextProps) {
    const { currentSpace } = nextProps
    if (currentSpace && this.props.currentSpace && currentSpace != this.props.currentSpace) {
      this.props.getProjectList()
      return
    }
  }

  operaMenuClick(e) {
    //this function for user click the dropdown menu
    switch (e.key) {
      case '1':
        this.setState({ showModal: true })
        break;
      case '2':
        this.setState({ keyModal: true })
        break;
      default:
        this.setState({ showModal: true })
    }
  }

  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("CodeCopy");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  }
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  }
  copyItemKey() {
    const scope = this;
    let code = document.getElementsByClassName("KeyCopy");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  }
  handleSearch(e) {
    let names =''
    if (e) {
      names = e.target.value
      this.props.searchProject(names)
      return
    }
    names = document.getElementById('searchBox').value
    this.props.searchProject(names)
  }
  handleFilter(type) {
    this.props.filterProject(type.key)
  }
  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    const menu = (
      <Menu onClick={(e) => this.handleFilter(e)}>
        <Menu.Item key="1">
          查看 private
        </Menu.Item>
        <Menu.Item key="0">
          查看 public
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="all">
          查看全部
        </Menu.Item>
      </Menu>
    );
    return (
      <QueueAnim className='TenxFlowList'
        type='right'
        >
        <Title title="代码仓库" />
        <div id='CodeStore' key='CodeStore'>
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type='info' />
          <div className='operaBox'>
            <Link to="/ci_cd/coderepo">
              <Button className='createBtn' size='large' type='primary'>
                <i className='fa fa-plus' />&nbsp;
              <FormattedMessage {...menusText.linkCode} />
              </Button>
            </Link>
            <Input className='searchBox' onPressEnter={(e) => this.handleSearch(e)} placeholder={formatMessage(menusText.search)} type='text' id="searchBox"/>
            <i className='fa fa-search' onClick={() => this.handleSearch()}></i>
            <div style={{ clear: 'both' }}></div>
          </div>
          <Card className='tenxflowBox'>
            <div className='titleBox' >
              <div className='name'>
                <FormattedMessage {...menusText.name} />
              </div>
              <div className='id'>
                <FormattedMessage {...menusText.ID} />
              </div>
              <div className='type'>
                <Dropdown overlay={menu} trigger={['click']}>
                  <a className="ant-dropdown-link" href="#">
                    <FormattedMessage {...menusText.attr} />
                    <svg className='filterSvg'>
                      <use xlinkHref='#cicdfilter' />
                    </svg>
                  </a>
                </Dropdown>
              </div>
              <div className='codelink'>
                <FormattedMessage {...menusText.codeSrc} />
              </div>
              <div className='action'>
                <FormattedMessage {...menusText.action} />
              </div>
            </div>
            <MyComponent scope={scope} formatMessage={formatMessage} config={this.props.projectList} />
          </Card>

        </div>

      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultStatus = {
    projectList: [],
    isFetching: false
  }
  const { managed } = state.cicd_flow
  const {projectList, isFetching} = managed || defaultStatus
  return {
    projectList,
    isFetching,
    currentSpace: state.entities.current.space.namespace
  }
}

CodeStore.propTypes = {
  intl: PropTypes.object.isRequired,
  getProjectList: PropTypes.func.isRequired
}

export default connect(mapStateToProps, {

  getProjectList,
  removeProject,
  searchProject,
  filterProject

})(injectIntl(CodeStore, {
  withRef: true,
}));

