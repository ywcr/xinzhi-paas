/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  VmList index module
 *
 * v2.0 - 2016-11-22
 * @author by Gaojian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getIntegrationVmList, manageVmDetail } from '../../actions/integration'
import { Button, Alert, Card, Spin, Input, Tooltip, Dropdown, Menu, Select, Modal } from 'antd'
import { formatDate, calcuDate } from '../../common/tools'
import './style/VmList.less'
import CreateVmModal from './CreateVmModal'
import NotificationHandler from '../../common/notification_handler'
import Title from '../Title'
const ButtonGroup = Button.Group;
const Option = Select.Option;

const menusText = defineMessages({
  create: {
    id: 'Integration.VmList.create',
    defaultMessage: '克隆虚拟机',
  },
  ip: {
    id: 'Integration.VmList.ip',
    defaultMessage: '虚拟机名称/IP',
  },
  status: {
    id: 'Integration.VmList.status',
    defaultMessage: '状态',
  },
  pod: {
    id: 'Integration.VmList.pod',
    defaultMessage: '所属物理机',
  },
  memory: {
    id: 'Integration.VmList.memory',
    defaultMessage: '内存',
  },
  disk: {
    id: 'Integration.VmList.disk',
    defaultMessage: '硬盘',
  },
  runTime: {
    id: 'Integration.VmList.runTime',
    defaultMessage: '运行时间',
  },
  startTime: {
    id: 'Integration.VmList.startTime',
    defaultMessage: '启动时间',
  },
  opera: {
    id: 'Integration.VmList.opera',
    defaultMessage: '操作',
  },
  core: {
    id: 'Integration.VmList.core',
    defaultMessage: '核',
  },
  poweron: {
    id: 'Integration.VmList.poweron',
    defaultMessage: '打开电源',
  },
  poweroff: {
    id: 'Integration.VmList.poweroff',
    defaultMessage: '关闭电源',
  },
  shutdown: {
    id: 'Integration.VmList.shutdown',
    defaultMessage: '关闭虚拟机',
  },
  delete: {
    id: 'Integration.VmList.delete',
    defaultMessage: '删除虚拟机',
  },
  createTitle: {
    id: 'Integration.VmList.createTitle',
    defaultMessage: '克隆虚拟机',
  },
  poweronStatus: {
    id: 'Integration.VmList.poweronStatus',
    defaultMessage: '运行中',
  },
  poweroffStatus: {
    id: 'Integration.VmList.poweroffStatus',
    defaultMessage: '已关闭',
  },
  refresh: {
    id: 'Integration.VmList.refresh',
    defaultMessage: '刷新',
  }
})

function diskFormat(num) {
  if (num < 1024) {
    return num + 'MB'
  }
  num = parseInt(num / 1024);
  if (num < 1024) {
    return num + 'GB'
  }
  num = parseInt(num / 1024);
  return num + 'TB'
}

function formatStatus(status) {
  //this function for format status
  switch (status) {
    case 'poweron':
      return (
        <span className='poweron'><i className='fa fa-circle' /><FormattedMessage {...menusText.poweronStatus} /></span>
      )
      break;
    case 'poweroff':
      return (
        <span className='poweroff'><i className='fa fa-circle' /><FormattedMessage {...menusText.poweroffStatus} /></span>
      )
      break;
  }
}

class VmList extends Component {
  constructor(props) {
    super(props);
    this.onChangeShowType = this.onChangeShowType.bind(this);
    this.onChangeAppType = this.onChangeAppType.bind(this);
    this.ShowDetailInfo = this.ShowDetailInfo.bind(this);
    this.onChangeDataCenter = this.onChangeDataCenter.bind(this);
    this.onPowerOn = this.onPowerOn.bind(this);
    this.meunClick = this.meunClick.bind(this);
    this.closeCreateVmModal = this.closeCreateVmModal.bind(this);
    this.openCreateVmModal = this.openCreateVmModal.bind(this);
    this.refreshVmList = this.refreshVmList.bind(this);
    this.onSearchVmList = this.onSearchVmList.bind(this);
    this.onConfirmOperaVm = this.onConfirmOperaVm.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);
    this.state = {
      currentShowApps: 'all',
      currentAppType: '1',
      showType: 'list',
      createVmModal: false,
      vmList: [],
      confirmMsg: null,
      confirmModal: false,
      currentOperaVm: null
    }
  }

  componentWillMount() {
    const { getIntegrationVmList, integrationId, currentDataCenter } = this.props;
    const _this = this;
    getIntegrationVmList(integrationId, currentDataCenter, {
      success: {
        func: (res) => {
          let vmList = res.result.data;
          if (!Boolean(vmList)) {
            vmList = [];
          }
          _this.setState({
            vmList: vmList
          })
        },
        isAsync: true
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    const { getIntegrationVmList, integrationId, currentDataCenter } = nextProps;
    const _this = this;
    if (nextProps.currentDataCenter != this.props.currentDataCenter) {
      getIntegrationVmList(integrationId, currentDataCenter, {
        success: {
          func: (res) => {
            let vmList = res.result.data;
            if (!Boolean(vmList)) {
              vmList = [];
            }
            _this.setState({
              vmList: vmList
            })
          },
          isAsync: true
        }
      })
    }
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

  ShowDetailInfo(name) {
    //this function for view the app detail info
    this.setState({
      showType: 'detail'
    });
  }

  onChangeDataCenter(e) {
    //this function for user change the current data center
    const { scope, getIntegrationVmList, integrationId } = this.props;
    scope.setState({
      currentDataCenter: e
    });
    getIntegrationVmList(integrationId, e)
  }

  onPowerOn(path, status, name) {
    //this function for user power on the vm
    const { manageVmDetail, integrationId, currentDataCenter, vmList } = this.props;
    let tempBody = {
      action: status,
      vm: path
    }
    let title = null;
    let confirmMsg = null;
    let errorMsg = null;
    let newStatus = null;
    if (status == 'poweron') {
      title = '确认关闭';
      confirmMsg = '是否确定关闭虚拟机' + name + '的客户机操作系统';
      tempBody.action = 'poweroff'
    } else if (status == 'poweroff') {
      title = '确认启动';
      confirmMsg = '是否确定启动虚机' + name;
      tempBody.action = 'poweron'
    }
    this.setState({
      confirmModal: true,
      confirmMsg: confirmMsg,
      confirmTitle: title,
      currentOperaVm: tempBody
    });
  }

  meunClick(path, name, key) {
    //this function for user manage the vm
    const { manageVmDetail, integrationId, currentDataCenter, vmList } = this.props;
    let title = null;
    let confirmMsg = null;
    switch (key.key) {
      case 'poweroff':
        title = '关闭虚拟机';
        confirmMsg = '是否确定关闭虚拟机' + name + '的客户机操作系统';
        break;
      case 'delete':
        title = '删除虚拟机';
        confirmMsg = '是否确定删除虚拟机' + name;
        break;
      case 'poweron':
        title = '启动虚拟机';
        confirmMsg = '是否确定启动虚拟机' + name;
        break;
    }
    let tempBody = {
      action: key.key,
      vm: path
    }
    this.setState({
      confirmModal: true,
      confirmMsg: confirmMsg,
      confirmTitle: title,
      currentOperaVm: tempBody
    });
  }

  openCreateVmModal() {
    //this function for user open the create vm modal
    this.setState({
      createVmModal: true
    })
  }

  closeCreateVmModal() {
    //this function for user close the create vm modal
    this.setState({
      createVmModal: false
    })
  }

  refreshVmList() {
    //this function for refresh the vm list
    const { currentDataCenter, getIntegrationVmList, integrationId } = this.props;
    getIntegrationVmList(integrationId, currentDataCenter);
  }

  onSearchVmList(e) {
    //this function for user search special vm
    let keyword = e.target.value;
    const { vmList } = this.props;
    let newList = [];
    vmList.map((item) => {
      if (item.name.indexOf(keyword) > -1) {
        newList.push(item)
      }
    });
    this.setState({
      vmList: newList
    })
  }

  onConfirmOperaVm() {
    //this function for user confirm opera vm
    let { manageVmDetail, integrationId, currentDataCenter } = this.props;
    let { vmList } = this.state;
    const { currentOperaVm } = this.state;
    let tempBody = {
      action: currentOperaVm.action,
      vm: currentOperaVm.vm
    }
    let errorMsg = '';
    let successMsg = '';
    let title = '';
    if (currentOperaVm.action == 'poweron') {
      title = '启动虚拟机';
      errorMsg = '虚拟机已经启动了';
      successMsg = '启动虚拟机成功';
    } else if (currentOperaVm.action == 'poweroff') {
      title = '关闭虚拟机';
      errorMsg = '虚拟机已经关闭了';
      successMsg = '关闭虚拟机成功';
    }
    this.setState({
      confirmModal: false
    })
    let notification = new NotificationHandler()
    notification.spin(`${title}中...`)
    manageVmDetail(integrationId, currentDataCenter, tempBody, {
      success: {
        func: () => {
          vmList.map((item) => {
            if (item.path == currentOperaVm.vm) {
              item.powerstate = currentOperaVm.action;
            }
          });
          this.setState({
            vmList: vmList
          })
          notification.close()
          notification.success(title, successMsg)
        },
        isAsync: true
      },
      failed: {
        func: (error) => {
          notification.close()
          if (error.message.code == 500) {
            notification.success(title, errorMsg)
          }
        }
      }
    });
  }

  closeConfirmModal() {
    //this function for user close the oprea vm modal
    this.setState({
      confirmModal: false
    })
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { isFetching, dataCenters, currentDataCenter, integrationId } = this.props;
    const scope = this;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const { vmList } = this.state;
    let appShow = null;
    if (Boolean(vmList)) {
      appShow = vmList.map((item, index) => {
        const menu = (
          <Menu onClick={this.meunClick.bind(this, item.path, item.name)} style={{ width: '126px' }}>
            {
              /*item.powerstate == 'poweroff' ? [<Menu.Item key='poweroff'><i className='fa fa-stop' />&nbsp;<FormattedMessage {...menusText.poweroff} /></Menu.Item>] : [<Menu.Item key='poweron'><i className='fa fa-play' />&nbsp;<FormattedMessage {...menusText.poweron} /></Menu.Item>]*/
            }
            <Menu.Item key='delete' disabled><i className='fa fa-trash' />&nbsp;<FormattedMessage {...menusText.delete} /></Menu.Item>
          </Menu>
        )
        return (
          <div className='podDetail' key={'podDetail' + index}>
            <div className='ip commonTitle'>
              <span className='commonSpan'>
                {
                  !!item.ip ? [
                    <span key={'podDetail' + index + 'ip'}>
                      <Tooltip placement='topLeft' title={item.name}>
                        <span className='topSpan'>{item.name}</span>
                      </Tooltip>
                      <Tooltip placement='topLeft' title={!!item.ip ? item.ip : '-'}>
                        <span className='bottomSpan'>{!!item.ip ? item.ip : '-'}</span>
                      </Tooltip>
                    </span>
                  ] : [
                      <span key={'podDetail' + index + 'ip'}>{item.name}</span>
                    ]
                }

              </span>
            </div>
            <div className='status commonTitle'>
              <span className='commonSpan'>
                <span>{formatStatus(item.powerstate)}</span>
              </span>
            </div>
            <div className='pod commonTitle'>
              <span className='commonSpan'>
                <Tooltip placement='topLeft' title={item.hostSystem}>
                  <span>{item.hostSystem}</span>
                </Tooltip>
              </span>
            </div>
            <div className='cpu commonTitle'>
              <span className='commonSpan'>
                <span>{item.cpuNumber}<FormattedMessage {...menusText.core} /></span>
              </span>
            </div>
            <div className='memory commonTitle'>
              <span className='commonSpan'>
                <span>{diskFormat(item.memoryTotal)}</span>
              </span>
            </div>
            <div className='disk commonTitle'>
              <span className='commonSpan'>
                <span>{diskFormat(item.diskTotal)}</span>
              </span>
            </div>
            <div className='runTime commonTitle'>
              <span className='commonSpan'>
                <Tooltip placement='topLeft' title={!!item.bootTime ? calcuDate(item.bootTime) : null}>
                  <span>{!!item.bootTime ? calcuDate(item.bootTime) : '-'}</span>
                </Tooltip>
              </span>
            </div>
            <div className='startTime commonTitle'>
              <span className='commonSpan'>
                <Tooltip placement='topLeft' title={!!item.bootTime ? formatDate(item.bootTime) : null}>
                  <span>{!!item.bootTime ? formatDate(item.bootTime) : '-'}</span>
                </Tooltip>
              </span>
            </div>
            <div className='opera commonTitle'>
              <Dropdown.Button overlay={menu} type='ghost' size='large' onClick={this.onPowerOn.bind(this, item.path, item.powerstate, item.name)}>
                <span>
                  {item.powerstate == 'poweroff' ? [<span><i className='fa fa-play' />&nbsp;<FormattedMessage {...menusText.poweron} /></span>] : [<span><i className='fa fa-stop' />&nbsp;<FormattedMessage {...menusText.poweroff} /></span>]}
                </span>
              </Dropdown.Button>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        )
      });
    }
    return (
      <div id='VmList' key='VmList'>
        <Title title="集成中心" />
        <div className='operaBox'>
          <Button type='primary' size='large' onClick={this.openCreateVmModal.bind(this)}>
            <i className='fa fa-plus' />&nbsp;
            <FormattedMessage {...menusText.create} />
          </Button>
          <Button type='primary' size='large' className='refreshBtn' onClick={this.refreshVmList.bind(this)}>
            <i className='fa fa-refresh' />&nbsp;
            <FormattedMessage {...menusText.refresh} />
          </Button>
          <div className='searchBox'>
            <Input type='text' size='large' onChange={this.onSearchVmList} />
            <i className='fa fa-search' />
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='titleBox'>
          <div className='ip commonTitle'>
            <FormattedMessage {...menusText.ip} />
          </div>
          <div className='status commonTitle'>
            <FormattedMessage {...menusText.status} />
          </div>
          <div className='pod commonTitle'>
            <FormattedMessage {...menusText.pod} />
          </div>
          <div className='cpu commonTitle'>
            <span>CPU</span>
          </div>
          <div className='memory commonTitle'>
            <FormattedMessage {...menusText.memory} />
          </div>
          <div className='disk commonTitle'>
            <FormattedMessage {...menusText.disk} />
          </div>
          <div className='runTime commonTitle'>
            <FormattedMessage {...menusText.runTime} />
          </div>
          <div className='startTime commonTitle'>
            <FormattedMessage {...menusText.startTime} />
          </div>
          <div className='opera commonTitle'>
            <FormattedMessage {...menusText.opera} />
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        {appShow}
        {vmList.length == 0 ? [
          <div className='loadingBox' key='loadingBox'>
            <span>暂无数据</span>
          </div>
        ] : null}
        <Modal
          title={<FormattedMessage {...menusText.createTitle} />}
          className='createIntegrationModal'
          visible={this.state.createVmModal}
          onCancel={this.closeCreateVmModal.bind(this)}
          >
          <CreateVmModal scope={scope} createVmModal={this.state.createVmModal} currentDataCenter={currentDataCenter} integrationId={integrationId} />
        </Modal>
        <Modal
          className='operaVmModal'
          visible={this.state.confirmModal}
          onOk={this.onConfirmOperaVm}
          onCancel={this.closeConfirmModal}
          title={this.state.confirmTitle}
          >
          <Alert message={this.state.confirmMsg} type='warning' />
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultVmList = {
    isFetching: false,
    vmList: []
  }
  const { getIntegrationVmList } = state.integration
  const { isFetching, vmList } = getIntegrationVmList || defaultVmList
  return {
    isFetching,
    vmList
  }
}

VmList.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getIntegrationVmList,
  manageVmDetail
})(injectIntl(VmList, {
  withRef: true,
}));

