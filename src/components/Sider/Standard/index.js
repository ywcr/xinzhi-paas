/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppSider component
 *
 * v0.1 - 2016-09-06
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card, Button, Tooltip, Popover, Icon, Menu, Modal, Radio, Upload, Badge } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import './style/sider.less'
import { beforeUploadFile, uploading, mergeUploadingIntoList, getUploadFileUlr, uploadFileOptions, getVolumeBindInfo, changeStorageDetail } from '../../../actions/storage'
import cloneDeep from 'lodash/cloneDeep'
import QueueAnim from 'rc-queue-anim'
import NotificationHandler from '../../../common/notification_handler'
import logoPNG from '../../../assets/img/sider/logo.png'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const RadioGroup = Radio.Group

function checkUrlSelectedKey(pathname) {
  //this function for check the pathname and return the selected key of menu and return the opened key of menu
  let pathList = pathname.split('/')
  if (pathList.length == 2) {
    if(pathList[1].length == 0) {
      return ['home', 'home']
    }
    return [pathList[1], pathList[1] + '_default']
  } else {
    if(pathList[1] == 'app_manage' && pathList[2] == 'detail') {
      return [pathList[1], pathList[1] + '_default']
    }
    if(pathList[1] == 'account' && pathList[2] == 'user') {
      return [pathList[1], 'member']
    }
    return [pathList[1], pathList[2]]
  }
}

class Sider extends Component {
  constructor(props) {
    super(props)
    this.selectModel = this.selectModel.bind(this)
    this.onSelectMenu = this.onSelectMenu.bind(this)
    this.onOpenBigMenu = this.onOpenBigMenu.bind(this)
    this.onCloseBigMenu = this.onCloseBigMenu.bind(this)
    this.openNavModal = this.openNavModal.bind(this)
    this.closeNavModal = this.closeNavModal.bind(this)
    this.state = {
      currentKey: 'home',
      isUnzip: false,
      currentOpenMenu: null,
      currentSelectedMenu: null,
      newTestingKonwShow: false,
      oldTestingKonwShow: false
    }
  }

  componentWillMount() {
    const { pathname } = this.props
    // if(pathname.indexOf('/')!=-1){
    //   browserHistory.push('/')
    // }
    let currentKey = pathname.split('/')[1]
    if(!Boolean(currentKey)) {
      currentKey = 'home'
    }
    let currentOpenMenu = checkUrlSelectedKey(pathname)
    let currentSelectedMenu = currentOpenMenu
    if (pathname.indexOf('/account/costCenter') > -1) {
      currentOpenMenu = 'costCenter#consumptions'
      currentSelectedMenu = 'costCenter#consumptions'
    }
    this.setState({
      currentKey: currentKey,
      currentOpenMenu: currentOpenMenu,
      currentSelectedMenu: currentSelectedMenu
    })
  }

  componentWillReceiveProps(nextProps) {
    const { pathname } = nextProps
    const oldPathname = this.props.pathname
    if(pathname != oldPathname) {
      let currentKey = pathname.split('/')[1]
      if(!Boolean(currentKey)) {
        currentKey = 'home'
      }
      let currentOpenMenu = checkUrlSelectedKey(pathname)
      let currentSelectedMenu = currentOpenMenu
      if(currentKey == '') {
        currentKey = 'home'
      }
      if (pathname.indexOf('app_manage/detail/') > -1) {
        currentOpenMenu = ['app_manage','app_manage_default']
        currentSelectedMenu = currentOpenMenu
      }
      this.setState({
        currentOpenMenu: currentOpenMenu,
        currentSelectedMenu: currentSelectedMenu,
        currentKey: currentKey
      })
    }
  }

  handleCancel() {
    const currentOptions = cloneDeep(this.props.uploadFileOptions)
    currentOptions.visible = false
    this.props.changeUploadFileOptions(currentOptions)
  }

  selectModel(currentKey, currentIcon, event) {
    this.setState({
      currentKey: currentKey,
    })
  }

  changeRadioValue(e) {
    this.setState({
      isUnzip: e.target.value
    })
  }

  onSelectMenu(e) {
    //this function for user select the menu item and change the current key
    const { keyPath } = e
    if (keyPath.length > 1) {
      let currentKey = keyPath[1]
      this.setState({
        currentKey: currentKey,
        currentSelectedMenu: keyPath
      })
    } else {
      let currentKey = keyPath[0]
      this.setState({
        currentKey: currentKey,
        currentSelectedMenu: keyPath
      })
    }
  }

  getUploadData() {
    const options = this.props.uploadFileOptions
    const volumeName = options.volumeName
    const self = this
    let notification = new NotificationHandler()
    return {
      showUploadList: false,
      data: {
        isUnzip: self.state.isUnzip,
        volumeName: volumeName,
        pool: options.pool,
        cluster: options.cluster,
        backupId: self.props.beforeUploadState.backupId
      },
      beforeUpload: (file) => {
        const fileSize = file.size
        if ((fileSize / 1024 / 1024).toFixed(2) > (self.props.storageDetail.StorageInfo.size - self.props.storageDetail.StorageInfo.consumption)) {
          notification.error('超出存储卷可用大小')
          return false
        }
        self.props.uploading(0)
        file.isUnzip = self.state.isUnzip
        return new Promise(function (resolve, reject) {
          self.props.beforeUploadFile(options.pool, options.cluster, volumeName, file, {
            success: {
              isAsync: true,
              func() {
                self.props.mergeUploadingIntoList(self.props.beforeUploadState)
                const currentOptions = cloneDeep(options)
                currentOptions.uploadFile = false
                currentOptions.visible = false
                currentOptions.uploadFileStatus = 'active',
                  currentOptions.fileSize = file.size
                self.props.changeUploadFileOptions(currentOptions)
                resolve(true)
              }
            }
          })
        })
      },
      action: getUploadFileUlr(options.pool, options.cluster, volumeName),
      onChange(info) {
        if (info.event) {
          self.props.uploading(info.event.percent.toFixed(2))
        }
        if (info.file.status === 'done') {
          const fileInfo = cloneDeep(self.props.beforeUploadState)
          fileInfo.status = 'Complete'
          self.props.mergeUploadingIntoList(fileInfo)
          self.props.uploading(100)
          const currentOptions = cloneDeep(self.props.uploadFileOptions)
          currentOptions.uploadFile = true
          currentOptions.uploadFileStatus = 'success'
          self.props.changeUploadFileOptions(currentOptions)
          notification.success('文件上传成功')
          const storageInfo = cloneDeep(self.props.storageDetail.StorageInfo)
          storageInfo.consumption = parseFloat(storageInfo.consumption) + parseFloat((currentOptions.fileSize / 1024 / 1024).toFixed(2))
          self.props.changeStorageDetail(storageInfo)
        } else if (info.file.status === 'error') {
          // self.props.uploading(100)
          const currentOptions = cloneDeep(self.props.uploadFileOptions)
          currentOptions.uploadFile = true
          currentOptions.uploadFileStatus = 'exception'
          self.props.changeUploadFileOptions(currentOptions)
          const fileInfo = cloneDeep(self.props.beforeUploadState)
          fileInfo.status = 'Failure'
          self.props.mergeUploadingIntoList(fileInfo)
          notification.error('文件上传失败')
        }
      }
    }
  }

  onOpenBigMenu(e) {
    //this function for show only one menu opened
    let currentOpenMenu = checkUrlSelectedKey(e.key + '/' + e.key)
    this.setState({
      currentOpenMenu: currentOpenMenu
    })
  }

  onCloseBigMenu(e) {
    //this function for close big menu callback
    this.setState({
      currentOpenMenu: []
    })
  }

  openNavModal() {
    //this function for open the nav modal
    let userMigratedType = window.localStorage.getItem('userMigratedType')
    if(userMigratedType != 1) {
      this.setState({
        newTestingKonwShow: true
      })
    } else {
      this.setState({
        oldTestingKonwShow: true
      })
    }
  }

  closeNavModal() {
    //this function for close the nav modal
    this.setState({
      oldTestingKonwShow: false,
      newTestingKonwShow: false
    })
  }

  render() {
    const { siderStyle,clustername } = this.props
    const { currentKey } = this.state
    const scope = this
    return (
      <div id='sider'>
        <Modal title='上传文件' wrapClassName='vertical-center-modal' footer='' visible={this.props.uploadFileOptions.visible} onCancel={() => this.handleCancel()}>
          <div className='uploadModal'>
            <RadioGroup onChange={(e) => { this.changeRadioValue(e) } } value={this.state.isUnzip}>
              <Radio key='a' value={false}>直接上传</Radio>
              <Radio key='b' value={true}>上传并解压</Radio>
            </RadioGroup>
            <p>
              <Upload {...this.getUploadData() }>
                <Button type='primary'>
                  <Icon type='upload' /> 选择文件
                </Button>
              </Upload>
            </p>
            <p>或将文件拖到这里</p>
          </div>
          <ul className='uploadhint'>
            <li>1、支持任何格式文件，大小不超过600M</li>
            <li>2、仅支持 zip 格式文件解压，导入时会覆盖存储卷内[同文件名]</li>
            <li style={{ color: 'red' }}>* 请先停止挂载该存储卷的服务再进行文件导入</li>
          </ul>
        </Modal>
        {siderStyle == 'mini' ? [
          <div key='miniSider' className='miniSider'>
            <ul className='siderTop'>
              <li className='logoItem'>
                <Link to='/'>
                  <svg className='logo'>
                    <use xlinkHref='#sidernewlogo' />
                  </svg>
                </Link>
              </li>
              <li onClick={this.selectModel.bind(this, 'home', '#home')} className={currentKey == 'home' ? 'selectedLi' : ''} >
                <Tooltip placement='right' title='总览' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/'>
                    <svg className='home commonImg'>
                      {currentKey == 'home' ? [<use xlinkHref='#homeselected' />] : [<use xlinkHref='#home' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, 'app_manage', '#app')} className={currentKey == 'app_manage' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='应用管理' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/app_manage'>
                    <svg className='app commonImg'>
                      {currentKey == 'app_manage' ? [<use xlinkHref='#appselected' />] : [<use xlinkHref='#app' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, 'app_center', '#appCenter')} className={currentKey == 'app_center' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='交付中心' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/app_center'>
                    <svg className='center commonImg'>
                      {currentKey == 'app_center' ? [<use xlinkHref='#centerselected' />] : [<use xlinkHref='#center' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, 'ci_cd', '#system')} className={currentKey == 'ci_cd' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='CI/CD' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/ci_cd'>
                    <svg className='cicd commonImg'>
                      {currentKey == 'ci_cd' ? [<use xlinkHref='#cicdselected' />] : [<use xlinkHref='#cicd' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              {className =  'huewei'?<div></div>:<li onClick={this.selectModel.bind(this, 'database_cache', '#database')} className={currentKey == 'database_cache' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='数据库与缓存' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/database_cache/mysql_cluster'>
                    <svg className='database commonImg'>
                      {currentKey == 'database_cache' ? [<use xlinkHref='#database-selected' />] : [<use xlinkHref='#database' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>}
              <li onClick={this.selectModel.bind(this, 'manange_monitor', '#manage')} className={currentKey == 'manange_monitor' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='管理与监控' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/manange_monitor'>
                    <svg className='manageMoniter commonImg'>
                      {currentKey == 'manange_monitor' ? [<use xlinkHref='#managemoniterselected' />] : [<use xlinkHref='#managemoniter' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, 'account', '#account')} className={currentKey == 'account' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='帐户中心' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/account'>
                    <svg className='account commonImg'>
                      {currentKey == 'account' ? [<use xlinkHref='#messageselected' />] : [<use xlinkHref='#message' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <div style={{ clear: 'both' }}></div>
            </ul>
            {/*<ul className='siderBottom'>
              <li style={{ display: 'none' }} onClick={this.selectModel.bind(this, 'app_manage/app_create', '#addNewApp')} className={currentKey == 'app_manage/app_create' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='创建应用' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/app_manage/app_create'>
                    <svg className='add commonImg'>
                      { currentKey == 'app_manage/app_create' ? [<use xlinkHref='#addselected' />] : [<use xlinkHref='#add' />] }
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <div style={{ clear: 'both' }}></div>
            </ul>*/}
          </div>
        ] : null}
        {siderStyle == 'bigger' ? [
          <QueueAnim type='left' className='siderBiggerBox'>
            <div key='siderBigger' className='siderBigger'>
              <div className='logBox'>
                <Link to='/'>
                  <img className='logo' src={logoPNG} />
                </Link>
              </div>
              <Menu
                style={{ width: '100%', backgroundColor: '#2b333d', color: '#c4c4c4' }}
                mode='inline'
                theme='dark'
                selectedKeys={this.state.currentSelectedMenu}
                openKeys={this.state.currentOpenMenu}
                onClick={this.onSelectMenu}
                onOpen={this.onOpenBigMenu}
                onClose={this.onCloseBigMenu}
                >
                <Menu.Item key='home'>
                  <Link to='/'>
                    <svg className='home commonImg'>
                      <use xlinkHref='#home' />
                    </svg>
                    <span>总览</span>
                  </Link>
                </Menu.Item>
                <SubMenu key='app_manage'
                  title={
                    <span>
                      <svg className='app commonImg'>
                        <use xlinkHref='#app' />
                      </svg>
                      <span className='commonSiderSpan'>应用管理</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                  >
                  <Menu.Item key='app_manage_default'>
                    <Link to='/app_manage'>
                      <span><div className='sideCircle'></div> 应用</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='service'>
                    <Link to='/app_manage/service'>
                      <span><div className='sideCircle'></div> 服务</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='container'>
                    <Link to='/app_manage/container'>
                      <span><div className='sideCircle'></div> 容器</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='storage'>
                    <Link to='/app_manage/storage'>
                      <span><div className='sideCircle'></div> 存储</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='configs'>
                    <Link to='/app_manage/configs'>
                      <span><div className='sideCircle'></div> 服务配置</span>
                    </Link>
                  </Menu.Item>
                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key='app_center'
                  title={
                    <span>
                      <svg className='center commonImg'>
                        <use xlinkHref='#center' />
                      </svg>
                      <span className='commonSiderSpan'>交付中心</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                  >
                  <Menu.Item key='app_center_default'>
                    <Link to='/app_center'>
                      <span><div className='sideCircle'></div> 镜像仓库</span>
                    </Link>
                  </Menu.Item>
                   <Menu.Item key='image_store'>
                    <Link to='/app_center/image_store'>
                      <span><div className='sideCircle'></div> 应用商店</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='stack_center'>
                    <Link to='/app_center/stack_center'>
                      <span><div className='sideCircle'></div> 编排文件</span>
                    </Link>
                  </Menu.Item>
                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key='ci_cd'
                  title={
                    <span>
                      <svg className='center commonImg'>
                        <use xlinkHref='#cicd' />
                      </svg>
                      <span className='commonSiderSpan'>CI/CD</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                  >
                  <Menu.Item key='ci_cd_default'>
                    <Link to='/ci_cd'>
                      <span><div className='sideCircle'></div> 代码仓库</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='build_image'>
                    <Link to='/ci_cd/build_image'>
                      <span><div className='sideCircle'></div> 构建镜像</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='enn_flow'>
                    <Link to='/ci_cd/enn_flow'>
                      <span><div className='sideCircle'></div> EnnFlow</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='docker_file'>
                    <Link to='/ci_cd/docker_file'>
                      <span><div className='sideCircle'></div> Dockerfile</span>
                    </Link>
                  </Menu.Item>
                  <div className='sline'></div>
                </SubMenu>
                  {clustername == "huawei"?<div></div>:
                   <SubMenu key='database_cache'
                   title={
                     <span>
                       <svg className='database commonImg'>
                         <use xlinkHref='#database' />
                       </svg>
                       <span className='commonSiderSpan'>数据库与缓存</span>
                       <div style={{ clear: 'both' }}></div>
                     </span>
                   }
                   >
                   <Menu.Item key='rdbs_cluster'>
                     <Link to='/database_cache/rdbs_cluster'>
                       <span><div className='sideCircle'></div>关系型数据库</span>
                     </Link>
                   </Menu.Item>
                   <Menu.Item key='mongDB_cluster'>
                     <Link to='/database_cache/mongDB_cluster'>
                       <span><div className='sideCircle'></div> MongoDB</span>
                     </Link>
                   </Menu.Item>
 
                   <Menu.Item key='redis_cluster'>
                     <Link to='/database_cache/redis_cluster'>
                       <span><div className='sideCircle'></div> 缓存</span>
                     </Link>
                   </Menu.Item>
 
                   {/* <Menu.Item key='zookeeper_cluster'>
                     <Link to='/database_cache/zookeeper_cluster'>
                       <span><div className='sideCircle'></div> ZooKeeper</span>
                     </Link>
                   </Menu.Item>
 
                   <Menu.Item key='elasticsearch_cluster'>
                     <Link to='/database_cache/elasticsearch_cluster'>
                       <span><div className='sideCircle'></div> ElasticSearch</span>
                     </Link>
                   </Menu.Item>
 
                   <Menu.Item key='etcd_cluster'>
                     <Link to='/database_cache/etcd_cluster'>
                       <span><div className='sideCircle'></div> Etcd</span>
                     </Link>
                   </Menu.Item> */}
 
                   <div className='sline'></div>
                 </SubMenu>
                }
               
                <SubMenu key='manange_monitor'
                  title={
                    <span>
                      <svg className='manageMoniter commonImg'>
                        <use xlinkHref='#managemoniter' />
                      </svg>
                      <span className='commonSiderSpan'>管理与监控</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                  >
                  <Menu.Item key='manange_monitor_default'>
                    <Link to='/manange_monitor'>
                      <span><div className='sideCircle'></div> 操作审计</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='query_log'>
                    <Link to='/manange_monitor/query_log'>
                      <span><div className='sideCircle'></div> 日志查询</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='alarm_setting'>
                    <Link to='/manange_monitor/alarm_setting'>
                      <span><div className='sideCircle'></div> 告警策略</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='alarm_record'>
                    <Link to='/manange_monitor/alarm_record'>
                      <span><div className='sideCircle'></div> 告警记录</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='alarm_group'>
                    <Link to='/manange_monitor/alarm_group'>
                      <div className='sideCircle'></div> 告警通知组
                    </Link>
                  </Menu.Item>
                  <div className='sline'></div>
                </SubMenu>

                <SubMenu key='account'
                  title={
                    <span>
                      <svg className='account commonImg'>
                        <use xlinkHref='#message' />
                      </svg>
                      <span className='commonSiderSpan'>帐户中心</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                  >
                  <Menu.Item key='account_default'>
                    <Link to='/account'>
                      <span><div className='sideCircle'></div> 我的帐户</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='teams'>
                    <Link to='/account/teams'>
                      <span><div className='sideCircle'></div> 我的团队</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='balance'>
                    <Link to='/account/balance'>
                      <span><div className='sideCircle'></div> 充值/续费</span>
                    </Link>
                  </Menu.Item>
                  {/*<Menu.Item key='cost'>
                    <Link to='/account/cost'>
                      <span><div className='sideCircle'></div> 费用中心</span>
                    </Link>
                  </Menu.Item>*/}
                  <Menu.Item key='costCenter#consumptions'>
                    <Link to='/account/costCenter#consumptions'>
                      <span><div className='sideCircle'></div> 消费记录</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='costCenter#payments'>
                    <Link to='/account/costCenter#payments'>
                      <span><div className='sideCircle'></div> 充值记录</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='version'>
                    <Link to='/account/version'>
                      <span><div className='sideCircle'></div> 版本</span>
                    </Link>
                  </Menu.Item>
                  <div className='sline'></div>
                </SubMenu>
              </Menu>
            </div>
          </QueueAnim>
        ] : null
        }
        <ul className='changeSiderUl'>
          <li className='navBox'>
            {
              siderStyle == 'mini' ? [
                <Tooltip placement='right' title='新版引导'getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <div className='miniNavBtn' onClick={this.openNavModal}>
                    <svg>
                      <use xlinkHref='#navbtn' />
                    </svg>
                  </div>
                </Tooltip>
              ] : [
                <div className='navBtn' onClick={this.openNavModal}>
                  <svg>
                    <use xlinkHref='#navbtn' />
                  </svg>
                  <span>新版引导</span>
                </div>
              ]
            }
          </li>
          <Tooltip placement='right' title={siderStyle == 'mini' ? '展开导航栏' : null} getTooltipContainer={() => document.getElementById('siderTooltip')}>
            <li className='changeStyleBox' onClick={this.props.changeSiderStyle}>
              <span>
                {siderStyle == 'mini' ? [<i key='fa-indent' className='fa fa-indent'></i>] : [<i key='fa-outdent' className='fa fa-outdent'></i>]}
              </span>
              {siderStyle == 'bigger' ? [<span>收起</span>] : null}
            </li>
          </Tooltip>
        </ul>
        <Modal visible={this.state.oldTestingKonwShow} className='testingKnowModal' width='600' footer={null}>
          <div className='titleBox'>
            <p>欢迎使用新智云</p>
            <Icon className='closeBtn' type='cross' onClick={this.closeNavModal} />
          </div>
          <div className='infoBox'>
            <div className='infoDetail'>
              <span className='info'>欢迎使用新智云 2.0 新版本控制台！检测当前为新智云老用户，以下信息与你同步：</span>
            </div>
            <div className='infoDetail'>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;关于余额：</span>
            </div>
            <div className='infoDetail'>
              <div className='numBox' style={{ marginLeft: '12px' }}>1</div>
              <span className='info' style={{ paddingLeft: '5px' }}>在迁移完成之前，新版本与旧版本暂时独立的帐户余额&消费；</span>
            </div>
            <div className='infoDetail'>
              <div className='numBox' style={{ marginLeft: '12px' }}>2</div>
              <span className='info' style={{ paddingLeft: '5px' }}>官方迁移完成后，将合并新老版本的帐户余额及消费相关信息；</span>
            </div>
            <div className='infoDetail'>
              <div className='numBox' style={{ marginLeft: '12px' }}>3</div>
              <span className='info' style={{ paddingLeft: '5px' }}>用户自行迁移的，可提前通过工单申请合并新老版本费用部分；</span>
            </div>
            <div className='infoDetail'>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;关于迁移（即1.x→2.0）：</span>
            </div>
            <div className='infoDetail'>
              <div className='numBox' style={{ marginLeft: '12px' }}>1</div>
              <span className='info' style={{ paddingLeft: '0px' }}>【用户自行】进行迁移 </span>
            </div>
            <div className='infoDetail'>
              <div className='squareIcon'></div>
              <div className='info' style={{ marginLeft: '33px' }}>使用『容器本地』存储类：即无状态的服务，可以直接在新版通过镜像启动即可完成迁移；</div>
            </div>
            <div className='infoDetail'>
              <div className='squareIcon'></div>
              <div className='info' style={{ marginLeft: '33px' }}>通过『存储卷』持久化类：即有状态的服务，可以通过登录终端，将数据通过 SCP 等命令，传输至新版本；</div>
            </div>
            <div className='infoDetail'>
              <div className='numBox' style={{ marginLeft: '12px' }}>2</div>
              <span className='info' style={{ paddingLeft: '0px' }}>【新智云官方】自动迁移  </span>
            </div>
            <div className='infoDetail'>
              <div className='squareIcon'></div>
              <div className='info' style={{ marginLeft: '33px' }}>新智云团队会在通知的迁移日期，自动将旧平台的运行应用迁移至新平台Portal；</div>
            </div>
            <div className='infoDetail'>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;更多详细迁移说明&amp;指南，请<a href="http://docs.paas.enncloud.cn/guide/upgradeTo2.0" target="_blank">点击这里查看</a>；</span>
            </div>
          </div>
          <div className='btnBox'>
            <div className='knowBtn' onClick={this.closeNavModal}>
              <span>知道了</span>
            </div>
          </div>
        </Modal>
        <Modal visible={this.state.newTestingKonwShow} className='testingKnowModal' width='600' footer={null}>
          <div className='titleBox'>
            <p>欢迎使用新智云</p>
            <Icon className='closeBtn' type='cross' onClick={this.closeNavModal} />
          </div>
          <div className='infoBox'>
            <div className='infoDetail'>
              <span className='info'>欢迎使用新智云 2.0 新版本 Portal 控制台，这里你几乎可以实现关于容器的一切想法，快来体验新时代的云计算平台吧！ </span>
            </div>
            <div className='infoDetail' style={{ marginTop: '20px', marginBottom: '10px' }}>
              <span className='info'>为了让你更好的上手新智云平台，我们做了一些小Demo，请享用！</span>
            </div>
            <div className='infoDetail' style={{ lineHeight: '30px' }}>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;了解容器&Kubernetes&云计算相关知识&nbsp;→&nbsp;<a href='http://docs.paas.enncloud.cn/guide/concepts' target="_blank"><span style={{ color: '#00A1EA',cursor: 'pointer' }}>点击这里</span></a>；</span>
            </div>
            <div className='infoDetail' style={{ lineHeight: '30px' }}>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;创建我的第一个容器小应用&nbsp;→&nbsp;<a href='http://docs.paas.enncloud.cn/quick-start/' target="_blank"><span style={{ color: '#00A1EA',cursor: 'pointer' }}>点击这里</span></a>；</span>
            </div>
            <div className='infoDetail' style={{ lineHeight: '30px' }}>
              <span className='info'><span style={{ color: '#00A1EA', fontSize: '12px' }}>▶</span>&nbsp;创建我的第一个 EnnFlow 项目（持续集成、自动部署）&nbsp;→&nbsp;<a href='http://docs.paas.enncloud.cn/quick-start/create-first-flow' target="_blank"><span style={{ color: '#00A1EA',cursor: 'pointer' }}>点击这里</span></a>；</span>
            </div>
            <div className='infoDetail littleInfoDetail'>
              <span className='info' style={{ paddingLeft: '11px' }}><span style={{ color: '#00A1EA' }}>▪</span>&nbsp;实现代码构建成容器镜像，进而启动镜像为容器小应用；</span><br />
              <span className='info' style={{ paddingLeft: '11px' }}><span style={{ color: '#00A1EA' }}>▪</span>&nbsp;通过 EnnFlow 还可以实现开发过程中的更多环节自动化，期待你的发现；</span>
            </div>
            <div className='infoDetail' style={{ marginTop: '20px', marginBottom: '10px' }}>
              <span className='info'>来开启你的的Docker开发者之旅吧！ </span>
            </div>
            <div className='infoDetail'>
              <div className='littleUrl'>
                <div className='numBox'>1</div>
                <a href='http://docs.paas.enncloud.cn/developer/' target="_blank">Java开发者之旅</a>
              </div>
              <div className='littleUrl'>
                <div className='numBox'>2</div>
                <a href='http://docs.paas.enncloud.cn/developer/php' target="_blank">PHP开发者之旅</a>
              </div>
              <div className='littleUrl'>
                <div className='numBox'>3</div>
                <a href='http://docs.paas.enncloud.cn/developer/python' target="_blank">Python开发者之旅</a>
              </div>
              <div className='littleUrl'>
                <div className='numBox'>4</div>
                <a href='http://docs.paas.enncloud.cn/developer/node' target="_blank">Node.js开发者之旅</a>
              </div>
              <div className='littleUrl'>
                <div className='numBox'>5</div>
                <a href='http://docs.paas.enncloud.cn/developer/golang' target="_blank">Golang开发者之旅</a>
              </div>
              <div className='littleUrl'>
                <div className='numBox'>6</div>
                <a href='http://docs.paas.enncloud.cn/developer/lamp' target="_blank">LAMP开发者之旅</a>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
          </div>
          <div className='btnBox'>
            <div className='knowBtn' onClick={this.closeNavModal}>
              <span>知道了</span>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

function checkCurrentPath(pathname) {
  let pathList = pathname.split('/')
  let currentPath = pathList[0]
  if (currentPath.length > 0) {
    return currentPath
  } else {
    return 'home'
  }
}

function mapStateToProp(state) {
  const { entities } = state
  if (entities && entities.current && entities.current.cluster&&entities.current.cluster&&entities.current.cluster.clusterName) {
    clustername = entities.current.cluster.clusterName
    console.log(11111)
  }
  return {
    uploadFileOptions: state.storage.uploadFileOptions,
    beforeUploadState: state.storage.beforeUploadFile,
    storageDetail: state.storage.storageDetail,
    clustername
  }
}

export default connect(mapStateToProp, {
  beforeUploadFile,
  uploading,
  mergeUploadingIntoList,
  changeUploadFileOptions: uploadFileOptions,
  getVolumeBindInfo,
  changeStorageDetail
})(Sider)