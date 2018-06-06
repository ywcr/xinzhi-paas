/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerList component
 *
 * v0.1 - 2016-09-19
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tooltip, Icon, Checkbox, Card, Menu, Dropdown, Button, Input, Spin, Pagination, Modal, Form, Select } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { camelize } from 'humps'
import './style/ContainerList.less'
import { loadContainerList, deleteContainers, updateContainerList } from '../../actions/app_manage'
import { loadProjectList, loadAllProject, loadRepositoriesTags } from '../../actions/harbor'
import { addTerminal, removeTerminal } from '../../actions/terminal'
import { LABEL_APPNAME, LOAD_STATUS_TIMEOUT, UPDATE_INTERVAL, DEFAULT_REGISTRY } from '../../constants'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import { calcuDate } from '../../common/tools.js'
import { browserHistory } from 'react-router'
import ContainerStatus from '../TenxStatus/ContainerStatus'
import { addPodWatch, removePodWatch } from '../../containers/App/status'
import { instanceExport } from '../../actions/instance_export'
import NotificationHandler from '../../common/notification_handler'
import Title from '../Title'
import cloneDeep from 'lodash/cloneDeep'

const ButtonGroup = Button.Group
const confirm = Modal.confirm
const Option = Select.Option

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  getInitialState(){
    return {
      exportImageModalVisible: false,
      previewImageAddress: false,
      exportImageModalSuccess: false,
      exportImageName: '',
      exportContainerName: '',
      ModalLoadidng: false,
      containerErrorModal: false,
      imageNameEqual: false,
      imageTagEqual: false,
    };
  },
  /*onchange: function (e) {
    e.stopPropagation();
    const { value, checked } = e.target
    const { parentScope } = this.props
    const { containerList } = parentScope.state
    containerList.map((contaienr) => {
      if (contaienr.metadata.name === value) {
        contaienr.checked = checked
      }
    });
    parentScope.setState({
      containerList
    });
  },*/
  containerOperaClick: function (name, status, e) {
    //this function for user click opera menu
    switch (e.key) {
      case 'deleteContainer':
        //this is delete the container
        this.deleteContainer(name);
        return;
      case 'exportImage':
        this.setState({
          imageNameEqual: false,
          imageTagEqual: false,
        })
        this.exportImageModal(name, status)
        return
      default:
        return
    }
  },
  exportImageModal(name, status){
    if(status == 'Running'){
      const { form } = this.props
      const { setFieldsValue } = form
      setFieldsValue({
        'exportImageName': undefined,
        'harborProjectName': '',
        'exportImageVersion': 'latest',
      })
      this.props.funcs.loadProjectList(DEFAULT_REGISTRY, { page_size: 100 })
      this.setState({
        exportImageModalVisible: true,
        exportContainerName: name
      })
      return
    }
    this.setState({
      containerErrorModal: true
    })
  },
  apiInstanceExport(values){
    const { instanceExport, clusterID } = this.props
    const { exportContainerName } = this.state
    let Notification = new NotificationHandler()
    let body = {
      body:{
        imagename: values.exportImageName,
        tag: values.exportImageVersion,
        projectname: values.harborProjectName.split('/detail/')[0],
      },
      clusterID,
      containers:exportContainerName
    }
    instanceExport(body,{
      success: {
        func: (res) => {
          if(res.statusCode && res.statusCode == 204){
            Notification.error('导出镜像失败！当前平台镜像仓库不完整')
            this.setState({
              exportImageModalVisible: false,
              exportContainerName: '',
              ModalLoadidng:false
            })
            return
          }
          this.setState({
            exportImageModalVisible: false,
            exportImageModalSuccess: true,
            exportContainerName: '',
            ModalLoadidng: false
          })
        }
      },
      failed: {
        func: (res) => {
          if(res.message && res.message.message == "The exportInstance operation against timeout could not be completed at this time, please try again."){
            Notification.error('导出镜像超时，请重试！')
            return
          }
          Notification.error('导出镜像失败！')
          this.setState({
            exportImageModalVisible: false,
            exportContainerName: '',
            ModalLoadidng:false
          })
        }
      }
    })
  },
  handleConfirmExportImage(){
    const { form } = this.props
    this.setState({
      ModalLoadidng: true
    })
    form.validateFields((errors, values) => {
      if(errors){
        if(Object.keys(errors).length == 1 && errors.exportImageName && errors.exportImageName.errors[0].message == "名称已存在，使用会覆盖已有镜像"){
          return this.apiInstanceExport(values)
        }
        this.setState({
          ModalLoadidng: false
        })
        return
      }
      this.apiInstanceExport(values)
    })
  },
  hanldeCancleExportImage(){
    this.setState({
      exportImageModalVisible : false
    })
  },
  formatImageInfo(){
    const { form } = this.props
    const { getFieldValue } = form
    let imageName = getFieldValue('exportImageName') ? getFieldValue('exportImageName') : '镜像名称'
    let imageTag = getFieldValue('exportImageVersion') ? getFieldValue('exportImageVersion') : 'latest'
    return {
      imageName,
      imageTag
    }
  },
  handleInfoOK(){
    this.setState({
      containerErrorModal: false
    })
  },
  handleInfoCancel(){
    this.setState({
      containerErrorModal: false
    })
  },
  handleViewImageStore(){
    this.setState({
      exportImageModalSuccess : false
    })
    browserHistory.push(`/app_center/projects/detail/${this.state.projectId}`)
  },
  hanldeClose(){
    this.setState({
      exportImageModalSuccess : false
    })
  },
  checkImageNameEqual(exportImageName, callback){
    const { loadAllProject, loadRepositoriesTags } = this.props
    loadAllProject(DEFAULT_REGISTRY, {q: exportImageName},{
      success: {
        func: (res) => {
          const { form } = this.props
          let projectName = form.getFieldValue('harborProjectName').split('/detail/')[0]
          if(!projectName){
            return
          }
          if(callback){
            callback()
          }
          let imageName = projectName + '/' + exportImageName
          let imageNameArray = res.data.repository
          this.setState({
            imageNameEqual: false
          })
          for(let i = 0; i < imageNameArray.length; i++){
            if(imageName === imageNameArray[i].repositoryName){
              this.setState({
                imageNameEqual: true
              })
              loadRepositoriesTags(DEFAULT_REGISTRY, imageName, {
                success: {
                  func: (res) => {
                    let imageTag = form.getFieldValue('exportImageVersion')
                    let imageTagArray = res.data
                    this.setState({
                      imageTagEqual: false,
                    })
                    if(imageTagArray.indexOf(imageTag) > -1){
                      this.setState({
                        imageTagEqual: true,
                      })
                    }
                  }
                }
              })
              break
            }
          }
        },
        isAsync: true
      }
    })
  },
  checkImageName(rule, value, callback){
    const { form } = this.props
    let projectName = form.getFieldValue('harborProjectName').split('/detail/')[0]
    if(!value){
      return callback('请输入镜像地址')
    }
    if(!/^([a-z0-9]+((?:[._]|__|[-]*)[a-z0-9]+)*)?$/.test(value)){
      return callback('由小写字母或数字组成')
    }
    if(value.length > 128){
      return callback('最多只能为128个字符')
    }
    if(projectName){
      return this.checkImageNameEqual(value, callback)
    }
    return callback()
  },
  checkImageVersion(rule, value, callback){
    const { loadRepositoriesTags, form } = this.props
    if(!value){
      return callback('请输入镜像版本')
    }
    if(!/^([\w][\w.-]*)?$/.test(value)){
      return callback('由小写字母或数字组成')
    }
    if(value.length > 128){
      return callback('最多只能为128个字符')
    }
    if(this.state.imageNameEqual){
      let projectName = form.getFieldValue('harborProjectName').split('/detail/')[0]
      let exporImageName = form.getFieldValue('exportImageName')
      let imageName = projectName + '/' + exporImageName
      loadRepositoriesTags(DEFAULT_REGISTRY, imageName, {
        success: {
          func: (res) => {
            let imageTagArray = res.data
            this.setState({
              imageTagEqual: false,
            })
            if(imageTagArray.indexOf(value) > -1){
              this.setState({
                imageTagEqual: true,
              })
            }
          }
        }
      })
    }
    return callback()
  },
  selectChange(projects){
    const { form } = this.props
    const { getFieldValue } = form
    let exportImageName = getFieldValue("exportImageName")
    let exportImageTag = getFieldValue("exportImageVersion")
    let projectId = projects.split('/detail/')[1]
    this.setState({projectId})
    if(!exportImageName || !exportImageTag){
      return
    }
    this.checkImageNameEqual(exportImageName)
  },
  selectContainerDetail: function (name, e) {
    //this function for user click app detail ,and then this app will be selected
    //when user click the menu button will trigger the function
    //so the first thing should estimate
    //the event target is the menu button or others
    //if the target is menu button , the function will be return null
    let stopPro = e._dispatchInstances;
    if (stopPro.length != 2) {
      const { parentScope } = this.props
      const { containerList } = parentScope.state
      containerList.map((contaienr) => {
        if (contaienr.metadata.name === name) {
          contaienr.checked = !contaienr.checked
        }
      });
      parentScope.setState({
        containerList
      });
    }
  },
  openTerminalModal: function (item, e) {
    //this function for user open the terminal modal
    const { funcs } = this.props
    e.stopPropagation();
    funcs.openTerminal(item);
  },
  deleteContainer: function (name) {
    const { config, funcs } = this.props
    const { confirmDeleteContainer } = funcs
    const container = {
      metadata: {
        name
      }
    }
    confirmDeleteContainer([container])
  },
  handleDropdown: function (e) {
    e.stopPropagation()
  },
  getImages(item) {
    let images = []
    item.spec.containers.map((container) => {
      images.push(container.image)
    })
    return images.join(', ')
  },
  render: function () {
    const { scope, config, loading, form, exportimageUrl } = this.props
    const { getFieldProps, getFieldValue, isFieldValidating, getFieldError } = form
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length < 1) {
      return (
        <div className='loadingBox'>
          <Icon type="frown"/>&nbsp;暂无数据
        </div>
      )
    }
    const items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.containerOperaClick.bind(this, item.metadata.name, item.status.phase)}
          style={{ width: '100px' }}
          >
          <Menu.Item key='exportImage'>
            <span>导出镜像</span>
          </Menu.Item>
          <Menu.Item key='deleteContainer'>
            <span>重新分配</span>
          </Menu.Item>
        </Menu>
      );
      const images = this.getImages(item)
      return (
        <div className={item.checked ? 'selectedContainer containerDetail' : 'containerDetail'}
          key={item.metadata.name}
          onClick={this.selectContainerDetail.bind(this, item.metadata.name)}
          >
          <div className='selectIconTitle commonData'>
            <Checkbox
              value={item.metadata.name}
              checked={item.checked} />
          </div>
          <div className='containerName commonData'>
            <Tooltip placement='topLeft' title={item.metadata.name}>
              <Link to={`/app_manage/container/${item.metadata.name}`} >
                {item.metadata.name}
              </Link>
            </Tooltip>
          </div>
          <div className='containerStatus commonData'>
            <ContainerStatus container={item} />
          </div>
          <div className='serviceName commonData'>
            <Tooltip placement='topLeft' title={item.metadata.labels[LABEL_APPNAME] || ''}>
              {
                item.metadata.labels[LABEL_APPNAME]
                  ? (<Link to={`/app_manage/detail/${item.metadata.labels[LABEL_APPNAME]}`}>{item.metadata.labels[LABEL_APPNAME]}</Link>)
                  : (<span>-</span>)
              }
            </Tooltip>
          </div>
          <div className='imageName commonData'>
            <Tooltip placement='topLeft' title={images}>
              <span>{images}</span>
            </Tooltip>
          </div>
          <div className='visitIp commonData'>
            <Tooltip placement='topLeft' title={item.status.podIP}>
              <span>{item.status.podIP || '-'}</span>
            </Tooltip>
          </div>
          <div className='createTime commonData'>
            <Tooltip placement='topLeft' title={calcuDate(item.metadata.creationTimestamp)}>
              <span>{calcuDate(item.metadata.creationTimestamp)}</span>
            </Tooltip>
          </div>
          <div className='actionBox commonData'>
            <Dropdown.Button
              overlay={dropdown} type='ghost'
              onClick={this.openTerminalModal.bind(this, item)}>
              <svg className='terminal'>
                <use xlinkHref='#terminal' />
              </svg>
              <span style={{ marginLeft: '20px' }}>终端</span>
            </Dropdown.Button>
          </div>
          <div style={{ clear: 'both', width: '0' }}></div>
        </div >
      );
    });
    const harborProjectProps = getFieldProps('harborProjectName', {
      rules: [
        { message: '请选择仓库组', required: true },
      ],
      initialValue:'',
      onChange: this.selectChange
    })
    const exportImageName = getFieldProps('exportImageName',{
      rules :  [{
        validator: this.checkImageName
      }],
    })
    const exportImageVersion = getFieldProps('exportImageVersion',{
      rules: [{
        validator: this.checkImageVersion
      }],
      initialValue: 'latest'
    })
    return (
      <div className='dataBox'>
        {items}
        <Modal
          title="导出镜像"
          visible={this.state.exportImageModalVisible}
          width="570px"
          maskClosable={false}
          wrapClassName="exportImage"
          okText="导出镜像到仓库"
          footer={[
            <Button key="cancel" size='large' onClick={this.hanldeCancleExportImage}>取消</Button>,
            <Button key="ok" type="primary" size="large" onClick={this.handleConfirmExportImage} loading={this.state.ModalLoadidng}>导出到镜像仓库</Button>
          ]}
          onOk={this.handleConfirmExportImage}
          onCancel={this.hanldeCancleExportImage}
        >
          <div className='alertRow'>
            选择仓库组并输入镜像地址，导出的镜像将推送到相应的镜像仓库中
          </div>
          <div className='header'>
            <Form>
              <div className='float imagename'>选择仓库组</div>
              <div className='float imageAddress'>
                <Form.Item>
                  <Select showSearch {...harborProjectProps} size='large'>
                    {
                      (this.props.harborProjects.list || []).map(project => {
                        const currentRoleId = project[camelize('current_user_role_id')]
                        return (
                          <Option key={project.name + `/detail/${project.projectId}`} disabled={currentRoleId === 3}>
                            {project.name} {currentRoleId == 3 && '（访客）'}
                          </Option>
                        )}
                      )
                    }
                  </Select>
                </Form.Item>
              </div>
              <div style={{clear: 'both', height: '15px'}}></div>
              <div className='float imagename'>镜像名称&nbsp;&nbsp;&nbsp;&nbsp;</div>
              <div className='float imageAddress'>
                <Form.Item
                  help={isFieldValidating('exportImageName') ? '校验中...' : (getFieldError('exportImageName') || []).join(', ')}
                >
                  <Input {...exportImageName} placeholder='请填写镜像名称'  />
                </Form.Item>
              </div>
              <div className='float point'>:</div>
              <div className='float previewImageAddress'>
                <Form.Item>
                  <Input {...exportImageVersion} placeholder='请填写标签'/>
                </Form.Item>
              </div>
            </Form>
          </div>
          <div className="main">
            <div className='preview'>预览：</div>
            <div className='address'>
              <span>
                {
                  exportimageUrl
                  ? <span>{exportimageUrl.registryConfig.server}/{getFieldValue('harborProjectName').split('/detail/')[0] || '仓库组名称'}/</span>
                  : <Spin></Spin>
                }
              </span>
              <span className='imagecolor'>{this.formatImageInfo().imageName}</span>
              <span>:</span>
              <span className='imagecolor'>{this.formatImageInfo().imageTag}</span><br/>
              {
                this.state.imageNameEqual && this.state.imageTagEqual && <div className='tips'><i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>镜像已存在，继续使用会覆盖已有镜像</div>
              }
            </div>
          </div>
          <div className='footer'>
            <div className='item'>当前容器有映射 Volume 目录，此次导出的镜像<span className='color'>不包含 Volume 的存储目录</span></div>
          </div>
        </Modal>

        <Modal
          title='导出镜像'
          visible={this.state.exportImageModalSuccess}
          width="570px"
          maskClosable={false}
          wrapClassName="exportImageSuccess"
          okText="查看镜像仓库"
          cancelText="关闭"
          onOk={this.handleViewImageStore}
          onCancel={this.hanldeClose}
        >
          <div className='container'>
            <div className='header'>
              <div>
                <Icon type="check-circle-o" className='icon'/>
              </div>
              <div className='tips'>
                操作成功
              </div>
            </div>
            <div className='footer'>
              <div className='lineone'>
                正在推送 <span>{this.state.exportImageName}</span> 到镜像仓库
              </div>
              <div>可能会花一些时间，请稍后至<span className='item'>『交付中心→镜像仓库』</span>查看</div>
            </div>
          </div>
        </Modal>

        <Modal
          title='提示'
          visible={this.state.containerErrorModal}
          width="570px"
          maskClosable={true}
          wrapClassName="WarningModal"
          onOk={this.handleInfoOK}
          onCancel={this.handleInfoCancel}
          okText="知道了"
        >
         <div><i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>容器为非运行中状态，不能导出镜像</div>
        </Modal>
      </div>
    );
  }
})

MyComponent = Form.create()(MyComponent)

class ContainerList extends Component {
  constructor(props) {
    super(props)
    this.loadData = this.loadData.bind(this)
    this.onAllChange = this.onAllChange.bind(this)
    this.searchContainers = this.searchContainers.bind(this)
    this.batchDeleteContainers = this.batchDeleteContainers.bind(this)
    this.confirmDeleteContainer = this.confirmDeleteContainer.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onShowSizeChange = this.onShowSizeChange.bind(this)
    this.sortCreateTime = this.sortCreateTime.bind(this)
    this.openTerminal = this.openTerminal.bind(this)
    this.state = {
      containerList: props.containerList,
      searchInputValue: props.name,
      searchInputDisabled: false,
      TerminalLayoutModal: false,
      currentContainer: [],
      checkedContainerList: []
    }
  }

  loadData(nextProps, options) {
    const selt = this
    const {
      loadContainerList, cluster, page,
      size, name, sortOrder,
    } = nextProps || this.props
    const query = { page, size, name, sortOrder }
    query.customizeOpts = options
    loadContainerList(cluster, query, {
      success: {
        func: (result) => {
          // Add pod status watch, props must include statusWatchWs!!!
          addPodWatch(cluster, selt.props, result.data)
          // For fix issue #CRYSTAL-2079(load list again for update status)
          clearTimeout(self.loadStatusTimeout)
          query.customizeOpts = {
            keepChecked: true,
          }
          self.loadStatusTimeout = setTimeout(() => {
            loadContainerList(cluster, query)
          }, LOAD_STATUS_TIMEOUT)
        },
        isAsync: true
      }
    })
  }

  onAllChange(e) {
    const {checked} = e.target
    const {containerList} = this.state
    containerList.map((container) => container.checked = checked)
    this.setState({
      containerList
    })
  }

  componentWillMount() {
    this.loadData()
  }

  componentDidMount() {
    // Reload list each UPDATE_INTERVAL
    this.upStatusInterval = setInterval(() => {
      this.loadData(null, { keepChecked: true })
    }, UPDATE_INTERVAL)
  }

  componentWillUnmount() {
    const {
      cluster,
      statusWatchWs,
    } = this.props
    removePodWatch(cluster, statusWatchWs)
    clearTimeout(this.loadStatusTimeout)
    clearInterval(this.upStatusInterval)
  }

  componentWillReceiveProps(nextProps) {
    let { page, size, name, containerList, cluster, sortOrder, currentCluster } = nextProps
    this.setState({
      containerList
    })
    if (currentCluster.clusterID !== this.props.currentCluster.clusterID || currentCluster.namespace !== this.props.currentCluster.namespace) {
      this.loadData(nextProps)
      return
    }
    if (page === this.props.page && size === this.props.size && name === this.props.name
      && sortOrder == this.props.sortOrder) {
      return
    }
    this.setState({
      searchInputDisabled: false
    })
    this.loadData(nextProps)
  }

  batchDeleteContainers(e) {
    const {containerList} = this.state
    const checkedContainerList = containerList.filter((container) => container.checked)
    this.confirmDeleteContainer(checkedContainerList)
  }

  confirmDeleteContainer(checkedContainerList) {
    // change to handleOk()
    this.setState({Relocating: true, checkedContainerList})
  }
  handleOk() {
    const {cluster, deleteContainers, updateContainerList, removeTerminal, terminalList } = this.props
    const allContainers = this.props.containerList
    const containerNames = this.state.checkedContainerList.map((container) => container.metadata.name)
    if(terminalList.length){
      const deleteList = cloneDeep(this.state.checkedContainerList)
      deleteList.forEach(item => {
        removeTerminal(cluster, item)
      })
    }
    this.setState({Relocating: false})
    return new Promise((resolve) => {
      resolve()
      allContainers.map(container => {
        if (containerNames.indexOf(container.metadata.name) > -1) {
          container.status.phase = 'Rebuilding'
          container.status.progress = {
            percent: 25
          }
        }
      })
      updateContainerList(cluster, allContainers)
      deleteContainers(cluster, containerNames, {
        success: {
          func: () => {
            // loadData(self.props)
          },
          isAsync: true
        }
      })
    });
  }
  searchContainers(e) {
    const {name, pathname, sortOrder } = this.props
    const {searchInputValue} = this.state
    if (searchInputValue === name) {
      return
    }
    this.setState({
      searchInputDisabled: true
    })
    const query = {}
    if (searchInputValue) {
      query.name = searchInputValue
    }
    query.sortOrder = sortOrder
    browserHistory.push({
      pathname,
      query
    })
  }

  onPageChange(page) {
    const {size, sortOrder } = this.props
    this.updateBrowserHistory(page, size, sortOrder)
  }

  onShowSizeChange(page, size) {
    const {sortOrder} = this.props
    this.updateBrowserHistory(page, size, sortOrder)
  }

  updateBrowserHistory(page, size, sortOrder) {
    if (page === this.props.page &&
      size === this.props.size &&
      sortOrder === this.props.sortOrder) {
      return
    }

    const query = {}
    if (page !== DEFAULT_PAGE) {
      query.page = page
    }
    if (size !== DEFAULT_PAGE_SIZE) {
      query.size = size
    }
    const {name} = this.props
    if (name) {
      query.name = name
    }
    query.sortOrder = sortOrder
    const {pathname} = this.props
    browserHistory.push({
      pathname,
      query
    })
  }

  sortCreateTime() {
    let { page, size, sortOrder } = this.props
    if (sortOrder == 'asc') {
      sortOrder = 'desc'
    } else {
      sortOrder = 'asc'
    }
    this.updateBrowserHistory(page, size, sortOrder)
  }

  openTerminal(item) {
    const { addTerminal, cluster } = this.props
    addTerminal(cluster, item)
    this.setState({
      TerminalLayoutModal: true,
    })
  }

  render() {
    const parentScope = this
    const {
      name, page, size,
      sortOrder, total, cluster,
      isFetching, instanceExport, exportimageUrl,
      loadProjectList, harborProjects, loadAllProject, loadRepositoriesTags
    } = this.props
    const {containerList, searchInputValue, searchInputDisabled } = this.state
    const checkedContainerList = containerList.filter((app) => app.checked)
    const isChecked = (checkedContainerList.length > 0)
    let isAllChecked = (containerList.length === checkedContainerList.length)
    if (containerList.length === 0) {
      isAllChecked = false
    }
    const funcs = {
      confirmDeleteContainer: this.confirmDeleteContainer,
      openTerminal: this.openTerminal,
      loadProjectList,
    }
    let oncache = this.state.currentContainer.map((item) => {
      return item.metadata.name;
    })
    return (
      <QueueAnim
        className='ContainerList'
        type='right'
        >
        <Title title="容器列表"/>
        <div id='ContainerList' key='ContainerList'>
          <div className='operationBox'>
            <div className='leftBox'>
              <Button
                type='primary' size='large'
                disabled={!isChecked}
                onClick={this.batchDeleteContainers}>
                <i className='fa fa-undo' />
                重新分配
              </Button>
              <Button
                size='large'
                className="refresh"
                onClick={() => this.loadData(this.props)}>
                <i className='fa fa-refresh'></i>
                刷新
              </Button>
            </div>
            <div className='rightBox'>
              <div className='littleLeft' onClick={this.searchContainers}>
                <i className='fa fa-search'></i>
              </div>
              <div className='littleRight'>
                <Input
                  size='large'
                  onChange={(e) => {
                    this.setState({
                      searchInputValue: e.target.value
                    })
                  } }
                  value={searchInputValue}
                  placeholder='按容器名称搜索'
                  style={{paddingRight: '28px'}}
                  disabled={searchInputDisabled}
                  onPressEnter={this.searchContainers} />
              </div>
            </div>
            <div className='pageBox'>
              <span className='totalPage'>共 {total}条</span>
              <div className='paginationBox'>
                <Pagination
                  simple
                  className='inlineBlock'
                  onChange={this.onPageChange}
                  onShowSizeChange={this.onShowSizeChange}
                  current={page}
                  pageSize={size}
                  total={total} />
              </div>
            </div>
            <div className='clearDiv'></div>
          </div>
          <Modal title="重新分配操作" visible={this.state.Relocating}
            onOk={()=> this.handleOk()} onCancel={()=> this.setState({Relocating: false})} >
            <div className="confirm" style={{color: '#00a0ea'}}>
              <Icon type="question-circle-o" style={{ marginRight: '8px' }} />
              您是否确定要重新分配
              {
                this.state.checkedContainerList.length === 1
                ? `容器 ${this.state.checkedContainerList[0].metadata.name} ？`
                : `这${this.state.checkedContainerList.length}个容器？`
              }
           </div>
          </Modal>
          <Card className='containerBox'>
            <div className='containerTitle'>
              <div className='selectIconTitle commonTitle'>
                <Checkbox
                  checked={isAllChecked}
                  onChange={this.onAllChange}
                  disabled={containerList.length < 1} />
              </div>
              <div className='containerName commonTitle'>
                容器名称
              </div>
              <div className='containerStatus commonTitle'>
                状态
              </div>
              <div className='serviceName commonTitle'>
                所属应用
              </div>
              <div className='imageName commonTitle'>
                镜像
              </div>
              <div className='visitIp commonTitle'>
                访问地址
              </div>
              <div className='createTime commonTitle' onClick={this.sortCreateTime}>
                创建时间
                <div className="ant-table-column-sorter">
                  <span className={sortOrder == 'asc' ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                    <i className="anticon anticon-caret-up" />
                  </span>
                  <span className={sortOrder == 'desc' ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                    <i className="anticon anticon-caret-down" />
                  </span>
                </div>
              </div>
              <div className='actionBox commonTitle'>
                操作
              </div>
            </div>
            <MyComponent
              funcs={funcs}
              name={name}
              config={containerList}
              loading={isFetching}
              parentScope={parentScope}
              instanceExport={instanceExport}
              clusterID={cluster}
              exportimageUrl={exportimageUrl}
              harborProjects={harborProjects}
              loadAllProject={loadAllProject}
              loadRepositoriesTags={loadRepositoriesTags}
            />
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

ContainerList.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  containerList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadContainerList: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  sortOrder: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
  const {query, pathname } = props.location
  let {page, size, name, sortOrder } = query
  if (sortOrder != 'asc' && sortOrder != 'desc') {
    sortOrder = 'desc'
  }
  page = parseInt(page || DEFAULT_PAGE)
  size = parseInt(size || DEFAULT_PAGE_SIZE)
  if (isNaN(page) || page < DEFAULT_PAGE) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const {cluster} = state.entities.current
  const {loginUser} = state.entities
  const {statusWatchWs} = state.entities.sockets
  const { terminal } = state
  const terminalList = terminal.list[cluster.clusterID] || []
  const defaultContainers = {
    isFetching: false,
    cluster: cluster.clusterID,
    size,
    total: 0,
    containerList: []
  }
  const {
    containerItems
  } = state.containers
  const {containerList, isFetching, total } = containerItems[cluster.clusterID] || defaultContainers
  const harborProjects = state.harbor.projects && state.harbor.projects[DEFAULT_REGISTRY] || {}
  const list = harborProjects.list || []
  const newList = []
  const visitorList = []
  list.forEach(project => {
    const currentRoleId = project[camelize('current_user_role_id')]
    if (currentRoleId === 3) {
      visitorList.push(project)
      return
    }
    newList.push(project)
  })
  harborProjects.list = newList.concat(visitorList)

  return {
    cluster: cluster.clusterID,
    exportimageUrl: loginUser.info,
    currentCluster: cluster,
    statusWatchWs,
    pathname,
    page,
    size,
    total,
    name,
    sortOrder,
    containerList,
    terminalList,
    isFetching,
    harborProjects,
  }
}

export default connect(mapStateToProps, {
  loadContainerList,
  deleteContainers,
  updateContainerList,
  addTerminal,
  instanceExport,
  loadProjectList,
  loadAllProject,
  loadRepositoriesTags,
  removeTerminal,
})(ContainerList)