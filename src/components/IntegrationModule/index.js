/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Integration index module
 *
 * v2.0 - 2016-11-22
 * @author by Gaojian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { getAllIntegration } from '../../actions/integration'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Button, Alert, Card, Spin, Input, Modal } from 'antd'
import './style/Integration.less'
import IntegrationDetail from './IntegrationDetail'
import CreateVSphereModal from './CreateVSphereModal'
import vmwareImg from '../../assets/img/appstore/vmware.png'
import cephImg from '../../assets/img/appstore/ceph.png'
import Title from '../Title'
import Ceph from './Ceph'

const mode = require('../../../configs/model').mode
const standard = require('../../../configs/constants').STANDARD_MODE

const ButtonGroup = Button.Group;

let standardFlag = (mode == standard ? true : false);

const menusText = defineMessages({
  tooltips: {
    id: 'Integration.IntegrationIndex.tooltips',
    defaultMessage: '集成中心提供了业内主流的基础管理软件和开发者工具集合，您可以在这里一键集成安装，并且在当前控制台完成所有应用的安装、卸载以及对应功能的管理。',
  },
  allApps: {
    id: 'Integration.IntegrationIndex.allApps',
    defaultMessage: '全部应用',
  },
  installedApps: {
    id: 'Integration.IntegrationIndex.installedApps',
    defaultMessage: '已安装应用',
  },
  deletedApps: {
    id: 'Integration.IntegrationIndex.deletedApps',
    defaultMessage: '已卸载应用',
  },
  appType: {
    id: 'Integration.IntegrationIndex.appType',
    defaultMessage: '应用分类：',
  },
  showAppDetail: {
    id: 'Integration.IntegrationIndex.showAppDetail',
    defaultMessage: '进入应用',
  },
  running: {
    id: 'Integration.IntegrationIndex.running',
    defaultMessage: '安装中...',
  },
  uninstall: {
    id: 'Integration.IntegrationIndex.uninstall',
    defaultMessage: '集成安装',
  },
  envTitle: {
    id: 'Integration.IntegrationIndex.envTitle',
    defaultMessage: '依赖环境',
  },
  installedFlag: {
    id: 'Integration.IntegrationIndex.installedFlag',
    defaultMessage: '已安装',
  },
  createTitle: {
    id: 'Integration.IntegrationIndex.createTitle',
    defaultMessage: '集成安装',
  },
  commingSoon: {
    id: 'Integration.IntegrationIndex.commingSoon',
    defaultMessage: '敬请期待',
  },
})

class Integration extends Component {
  constructor(props) {
    super(props);
    this.onChangeShowType = this.onChangeShowType.bind(this);
    this.onChangeAppType = this.onChangeAppType.bind(this);
    this.ShowDetailInfo = this.ShowDetailInfo.bind(this);
    this.closeCreateIntegration = this.closeCreateIntegration.bind(this);
    this.openCreateIntegration = this.openCreateIntegration.bind(this);
    this.state = {
      currentShowApps: 'all',
      currentAppType: '1',
      showType: 'list',
      currentIntegration: null,
      createIntegrationModal: false
    }
  }

  componentWillMount() {
    const { getAllIntegration } = this.props;
    getAllIntegration();
  }

  onChangeShowType(type) {
    //this function for user change the type of app list
    this.setState({
      currentShowApps: type
    });
  }

  onChangeAppType(type) {
    //this function for user change the type of app
    this.setState({
      currentAppType: type
    });
  }

  ShowDetailInfo(id) {
    //this function for view the app detail info
    this.setState({
      showType: 'detail',
      currentIntegration: id
    });
  }

  openCreateIntegration() {
    //this function for user open the create integration modal
    this.setState({
      createIntegrationModal: true
    })
    setTimeout(()=> {
      document.getElementById('name').focus()
    },500)
  }

  closeCreateIntegration() {
    //this function for user close the create integration modal
    this.setState({
      createIntegrationModal: false
    });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const {isFetching, integrations} = this.props;
    const scope = this;
    if(isFetching || !Boolean(integrations)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let appShow = null;
    if(integrations.length > 0) {
      appShow = integrations.map((item, index) => {
        let envList = (
          <div>
            <div className='envDetail' key={'appDetail' + index + 'envDetail0'}>
              <div className='numBox'>
                {'1'}
              </div>
              <span className='envName'>部署好的vSphere环境</span>
              <div style={{ clear:'both' }}></div>
            </div>
            <div className='envDetail' key={'appDetail' + index + 'envDetail1'}>
              <div className='numBox'>
                {'2'}
              </div>
              <span className='envName'>vSphere访问URL</span>
              <div style={{ clear:'both' }}></div>
            </div>
            <div className='envDetail' key={'appDetail' + index + 'envDetail2'}>
              <div className='numBox'>
                {'3'}
              </div>
              <span className='envName'>登录帐号&密码</span>
              <div style={{ clear:'both' }}></div>
            </div>
          </div>
        )
        return (
          <div className='appDetail'>
            <div className='leftBox'>
              <img src={vmwareImg} />
            </div>
            <div className='middleBox'>
              <div className='appInfo'>
                <p>vSphere</p>
                <span>vSphere是VMware公司推出一套服务器虚拟化解决方案。</span>
                <br />
                <span>vSphere将应用程序和操作系统从底层分离出来，从而简化了IT操作，用户现有的应用程序可以看到专有资源，而服务器则可以作为资源池进行管理。</span>
              </div>
              <div className='envInfo'>
                <p><FormattedMessage {...menusText.envTitle} /></p>
                {envList}
              </div>
              <div style={{ clear:'both' }}></div>
            </div>
            <div className='rightBox'>
              {
                standardFlag ? [
                  <Button className='installedBtn' key={'installedBtn' + index} size='large' type={standardFlag ? 'primary':'ghost'} disabled={standardFlag}
                    style={{ width: '102px' }} onClick={this.ShowDetailInfo.bind(scope, item.id)}>
                    <span><span>敬请期待</span></span>
                  </Button>
                ] : [
                  <Button className='installedBtn' key={'installedBtn' + index} size='large' type={standardFlag ? 'primary':'ghost'} disabled={standardFlag}
                    style={{ width: '102px' }} onClick={this.ShowDetailInfo.bind(scope, item.id)}>
                    <span><FormattedMessage {...menusText.showAppDetail} /></span>
                  </Button>
                ]
              }
            </div>
            <div style={{ clear:'both' }}></div>
            {
              !standardFlag ? [
                <div className='installedFlag' key='installedFlag'>
                  <FormattedMessage {...menusText.installedFlag} />
                </div>
              ] : null
            }
          </div>
        )
      });
    }
    return (
      <div className='IntegrationAnimateBox' key='IntegrationAnimateBox'>
        <div id='IntegrationList' key="integration">
          <Title title="集成中心" />
          <Alert message={formatMessage(menusText.tooltips)} type='info' />
          {/*<div className='operaBox'>
            <ButtonGroup size='large'>
              <Button type={this.state.currentShowApps == 'all' ? 'primary' : 'ghost'} onClick={this.onChangeShowType.bind(this, 'all')}>
                <FormattedMessage {...menusText.allApps} />
              </Button>
              <Button type={this.state.currentShowApps == 'install' ? 'primary' : 'ghost'} onClick={this.onChangeShowType.bind(this, 'install')}>
                <FormattedMessage {...menusText.installedApps} />
              </Button>
              <Button type={this.state.currentShowApps == 'delete' ? 'primary' : 'ghost'} onClick={this.onChangeShowType.bind(this, 'delete')}>
                <FormattedMessage {...menusText.deletedApps} />
              </Button>
            </ButtonGroup>
            <div className='searchBox'>
              <Input type='text' size='large' />
              <i className='fa fa-search' />
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>*/}
          { isFetching ? [
              <div className='loadingBox' key='loadingBox'>
                <Spin size='large' />
              </div>
            ] : [
                <div key='infoBoxAnimate'>
                  {/*<div className='typeBox'>
                    <span className='title'><FormattedMessage {...menusText.appType} /></span>
                    <span className={ this.state.currentAppType == '1' ? 'selectedType commonType' : 'commonType'} onClick={this.onChangeAppType.bind(this, '1')}>Iaas平台</span>
                    <span className={ this.state.currentAppType == '2' ? 'selectedType commonType' : 'commonType'} onClick={this.onChangeAppType.bind(this, '2')}>新智云公有云</span>
                    <span className={ this.state.currentAppType == '3' ? 'selectedType commonType' : 'commonType'} onClick={this.onChangeAppType.bind(this, '3')}>存储平台</span>
                    <span className={ this.state.currentAppType == '4' ? 'selectedType commonType' : 'commonType'} onClick={this.onChangeAppType.bind(this, '4')}>安全工具</span>
                    <span className={ this.state.currentAppType == '5' ? 'selectedType commonType' : 'commonType'} onClick={this.onChangeAppType.bind(this, '5')}>企业CRM</span>
                  </div>*/}
                  <Card className='infoBox'>
                    {this.state.showType == 'list' ? [
                      <QueueAnim key='listBoxAnimate'>
                        <div className='listBox' key='listBox'>
                          {appShow}
                          { integrations.length == 0 ? [
                            <div className='appDetail' key='noAppDetail'>
                              <div className='leftBox'>
                                <img src={vmwareImg} />
                              </div>
                              <div className='middleBox'>
                                <div className='appInfo'>
                                  <p>vSphere</p>
                                  <span>vSphere是VMware公司推出一套服务器虚拟化解决方案。</span>
                                  <br />
                                  <span>vSphere将应用程序和操作系统从底层分离出来，从而简化了IT操作，用户现有的应用程序可以看到专有资源，而服务器则可以作为资源池进行管理。</span>
                                </div>
                                <div className='envInfo'>
                                  <p><FormattedMessage {...menusText.envTitle} /></p>
                                  <div className='envDetail'>
                                    <div className='numBox'>
                                      {'1'}
                                    </div>
                                    <span className='envName'>部署好的vSphere环境</span>
                                    <div style={{ clear:'both' }}></div>
                                  </div>
                                  <div className='envDetail'>
                                    <div className='numBox'>
                                      {'2'}
                                    </div>
                                    <span className='envName'>vSphere访问URL</span>
                                    <div style={{ clear:'both' }}></div>
                                  </div>
                                  <div className='envDetail'>
                                    <div className='numBox'>
                                      {'3'}
                                    </div>
                                    <span className='envName'>登录帐号&密码</span>
                                    <div style={{ clear:'both' }}></div>
                                  </div>
                                </div>
                                <div style={{ clear:'both' }}></div>
                              </div>
                              <div className='rightBox'>
                                <Button className='unintsallBtn' key='unintsallBtn' size='large' type='primary'
                                  style={{ width: '102px' }} onClick={this.openCreateIntegration.bind(this)} disabled={standardFlag}>
                                  <span>{ standardFlag ? [<span>敬请期待</span>] : [<FormattedMessage {...menusText.uninstall} />] }</span>
                                </Button>
                              </div>
                              <div style={{ clear:'both' }}></div>
                            </div>
                          ] : null }
                          <div className='cephDetail appDetail'>
                            <div className='leftBox'>
                              <img src={cephImg} />
                            </div>
                            <div className='middleBox'>
                              <div className='appInfo'>
                                <p>Ceph存储总览应用</p>
                                <span>这个应用具备查看Ceph总体存储相关情况的Dashboard，可以配置安装后，立即查看。</span>
                              </div>
                              <div className='envInfo'>
                                <p><FormattedMessage {...menusText.envTitle} /></p>
                                <div className='envDetail'>
                                  <div className='numBox'>
                                    {'1'}
                                  </div>
                                  <span className='envName'>Ceph存储集群</span>
                                  <div style={{ clear:'both' }}></div>
                                </div>
                                <div className='envDetail'>
                                  <div className='numBox'>
                                    {'2'}
                                  </div>
                                  <span className='envName'>Ceph API</span>
                                  <div style={{ clear:'both' }}></div>
                                </div>
                                <div className='envDetail'>
                                  <div className='numBox'>
                                    {'3'}
                                  </div>
                                  <span className='envName'>Ceph授权</span>
                                  <div style={{ clear:'both' }}></div>
                                </div>
                              </div>
                              <div style={{ clear:'both' }}></div>
                            </div>
                            <div className='rightBox'>
                              <Button className='unintsallBtn' onClick={()=> this.setState({showType:'Ceph'})} key='unintsallBtn' size='large' type='primary'
                                style={{ width: '102px' }}>
                                <FormattedMessage {...menusText.showAppDetail} />
                              </Button>
                            </div>
                            <div style={{ clear:'both' }}></div>
                          </div>
                        </div>
                      </QueueAnim>
                    ] : null}
                    {this.state.showType == 'detail' ? [
                      <QueueAnim key='detailBoxAnimate'>
                        <div className='detailBox' key='detailBox'>
                          <IntegrationDetail scope={scope} integrationId={this.state.currentIntegration} />
                        </div>
                      </QueueAnim>
                    ] : null}
                    {this.state.showType === 'Ceph'?
                      <Ceph key="ceph" scope={this}/>
                      :null
                    }
                  </Card>
                </div>

            ]
          }
        </div>
        <Modal
          title={<FormattedMessage {...menusText.createTitle} />}
          className='createIntegrationModal'
          visible={this.state.createIntegrationModal}
          onCancel={this.closeCreateIntegration.bind(this)}
        >
          <CreateVSphereModal scope={scope} createIntegrationModal={this.state.createIntegrationModal}/>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultAppList = {
    isFetching: false,
    integrations: []
  }
  const { getAllIntegration } = state.integration
  const {isFetching, integrations} = getAllIntegration || defaultAppList
  return {
    isFetching,
    integrations
  }
}

Integration.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getAllIntegration
})(injectIntl(Integration, {
  withRef: true,
}));

