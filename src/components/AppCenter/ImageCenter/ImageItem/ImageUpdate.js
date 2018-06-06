/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-6
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Input, Icon, Table, Modal, Form, Row, Col, Checkbox, Select, Spin, Radio, Dropdown, Menu } from 'antd'
import { connect } from 'react-redux'
import '../style/ImageUpdate.less'
import {
  loadImageUpdateList,
  imageUpdateSwitch,
  deleteImageUpdateRules,
  editImageUpdateRules,
  createTargetStore,
  iamgeUpdateAddNewRules,
  validationOldTargetStore,
  validationNewTargetStore,
  getTasklogs,
} from '../../../../actions/harbor'
import { formatDate, formatDuration } from  '../../../../common/tools'
import { ecma48SgrEscape } from '../../../../common/ecma48_sgr_escape'
import NotificationHandler from '../../../../common/notification_handler'

const DATE_REG = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{9})?(Z|(\+\d{2}:\d{2}))\b/

let LogsTemplate = React.createClass({
  getInitialState() {
    return {

    }
  },
  formatLogDetails() {
    const { imageUpdateLogs } = this.props
    let { isFetching, logs } = imageUpdateLogs || {}
    if (isFetching) {
      return <div style={{textAlign:'center'}}><Spin /></div>
    }
    const logsArray = []
    logs = logs.split('\n')
    logs.map(log => {
      let logDateArray = log.match(DATE_REG)
      let logDate
      if (logDateArray && logDateArray[0]) {
        logDate = logDateArray[0]
        log = log.replace(logDate, '')
      }
      logsArray.push(
        <div>
          {logDate && <font color="orange">[{formatDate(logDate)}]</font>}
          <span>{log}</span>
        </div>
      )
    })
    return logsArray
    // return ecma48SgrEscape(logs)
  },
  handleExpand(){
    this.props.scope.setState({
      expand: !this.props.scope.state.expand
    })
  },
  render() {
    return (<div id="logsTemplate" className={this.props.scope.state.expand ? 'bigModal' : 'smallModal'}>
      <div className='title'>
        日志记录
        {
          this.props.scope.state.expand
          ? <i className="fa fa-compress" aria-hidden="true" onClick={this.handleExpand}></i>
          : <i className="fa fa-expand" aria-hidden="true" onClick={this.handleExpand}></i>
        }
      </div>
      <pre className='logsbody'>
        {this.formatLogDetails()}
      </pre>
    </div>)
  }
})

class ImageUpdate extends Component {
	constructor(props){
    super(props)
    this.handleSearchRules = this.handleSearchRules.bind(this)
    this.handleInputValue = this.handleInputValue.bind(this)
    this.handleAddRules = this.handleAddRules.bind(this)
    this.modalCancel = this.modalCancel.bind(this)
    this.modalConfirm = this.modalConfirm.bind(this)
    this.testStoreLink = this.testStoreLink.bind(this)
    this.testLinkResult = this.testLinkResult.bind(this)
    this.handleModalFooterDomNodes = this.handleModalFooterDomNodes.bind(this)
    this.handleSelectOption = this.handleSelectOption.bind(this)
    this.checkRulesNameProps = this.checkRulesNameProps.bind(this)
    this.handleConfirmSwitchRules = this.handleConfirmSwitchRules.bind(this)
    this.handleRulesModalText = this.handleRulesModalText.bind(this)
    this.handleImageUpdateSwitch = this.handleImageUpdateSwitch.bind(this)
    this.handleloadImageUpdateList = this.handleloadImageUpdateList.bind(this)
    this.handleDeleteImageUpdataRules = this.handleDeleteImageUpdataRules.bind(this)
    this.handleSelcetOnchange = this.handleSelcetOnchange.bind(this)
    this.handleRadioGroupChange = this.handleRadioGroupChange.bind(this)
    this.handleeditImageUpdateRules = this.handleeditImageUpdateRules.bind(this)
    this.createNewTargetStore = this.createNewTargetStore.bind(this)
    this.handelEidtImageRules = this.handelEidtImageRules.bind(this)
    this.createNewRules = this.createNewRules.bind(this)
    this.postCreateNewRules = this.postCreateNewRules.bind(this)
    this.validationTargetStore = this.validationTargetStore.bind(this)
    this.getLogs = this.getLogs.bind(this)
    this.startUseRules = this.startUseRules.bind(this)
    this.state = {
      inputValue: '',
      addRulesVisible: false,
      testLink: false,
      testLinkResult: false,
      eidtTargetStore: false,
      SwitchRulesVisible: false,
      switchTitle: '停用',
      currentKey: 0,
      editDisabled: false,
      logsVisible: false,
      expand: false,
      editUrlDisabled: false,
      edit: false,
      currentRules: {},
      currentRulesEnabled: false,
    }
  }

  handleloadImageUpdateList(){
    const { detail, registry, loadImageUpdateList } = this.props
    let projectID = detail.data.projectId
    const body = {
      registry: registry,
      projectID,
    }
    return new Promise((resolve, reject) => {
      loadImageUpdateList(body, {
        success : {
          func: (res) => {
            resolve({
              result: true,
              policies: res.data.policies
            })
          },
          isAsync: true
        },
        failed: {
          func: () => {
            resolve({
              result: false
            })
          }
        }
      })
    })
  }

  componentWillMount() {
    this.handleloadImageUpdateList()
  }

  componentDidMount() {
    //bind 'esc' key down
    const scope = this;
    function handler(e){
      if(e.keyCode == 27) {
        scope.setState({
          logsVisible: false,
          expand: false,
        });
      }
    }

    document.addEventListener('keyup',handler )
  }

  componentWillUnmount() {
    const scope = this;
    function handler(e){
      if(e.keyCode == 27) {
        scope.setState({
          logsVisible: false,
          expand: false,
        });
      }
    }

    document.removeEventListener('keyup', handler)
  }

  handleInputValue(e){
    this.setState({
      inputValue: e.target.value
    })
  }

  handleSearchRules(){
	  const { inputValue } = this.state
    const { rulesData } = this.props
    let newRulesData  = []
    rulesData.map((item, index) => {
	    if(item.name.indexOf(inputValue) > -1){
        newRulesData.push(item)
      }
    })
    this.setState({
      rulesData: newRulesData
    })
  }

  handleAddRules(){
    const { form } = this.props
    form.resetFields()
    form.setFieldsValue({SelectTargetStore: 'createNewstore'})
    this.setState({
      addRulesVisible: true,
      editDisabled: false,
      editUrlDisabled: false,
      edit: false,
      currentKey: false,
      currentRulesEnabled: false,
    },()=>{
      document.getElementById('rulesName').focus()
    })
  }

  modalCancel(){
    const { form } = this.props
    form.resetFields()
    this.setState({
      addRulesVisible: false,
      testLinkResult: false,
      testLink: false,
    })
  }

  createNewTargetStore(newStoreInfo){
    const { registry, createTargetStore } = this.props
    return new Promise((resolve, reject) => {
      createTargetStore(registry, newStoreInfo, {
        success : {
          func: (res) => {
            resolve({
              useful: true,
              target_id: res.data.id
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            resolve({
              useful: false,
              statusCode: res.statusCode
            })
          }
        }
      })
    })
  }

  handelEidtImageRules(id, body){
    const { editImageUpdateRules, registry } = this.props
    let Notification = new NotificationHandler()
    editImageUpdateRules(registry, id, body, {
      success : {
        func: () => {
          Notification.success('修改规则成功')
          this.handleloadImageUpdateList()
          this.setState({
            addRulesVisible: false
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          if(res.statusCode = 409){
            Notification.error('存在相同规则，修改规则失败')
            return
          }
          Notification.error('修改规则失败')
        }
      }
    })
  }

  validationTargetStore(storeType, storeInfo){
    const { registry, validationOldTargetStore, validationNewTargetStore } = this.props
    return new Promise((resolve, reject) => {
      if(storeType == 'create'){
        // test create store
        validationNewTargetStore(registry, storeInfo, {
          success : {
            func: () => {
              resolve(true)
            },
            isAsync: true
          },
          failed: {
            func: () => {
              resolve(false)
            }
          }
        })
        return
      }
      // test original store
      validationOldTargetStore(registry, storeInfo, {
        success : {
          func: () => {
            resolve(true)
          }
        },
        failed: {
          func: () => {
            resolve(false)
          }
        }
      })
    })
  }

  postCreateNewRules(ruleName, targetId, startUse){
    const { iamgeUpdateAddNewRules, registry, detail } = this.props
    let projectID = detail.data.projectId
    const body = {
      project_id: projectID,
      target_id: targetId,
      name: ruleName,
      enabled: 0
    }
    return new Promise((resolve, reject) => {
      iamgeUpdateAddNewRules(registry, body, {
        success : {
          func: () => {
            this.setState({
              addRulesVisible: false,
              testLink: false,
              testLinkResult: false,
            })
            this.modalCancel()
            resolve({
              result: true
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            resolve({
              result: false,
              statusCode: res.statusCode
            })
          }
        }
      })
    }).then(createRulesResult => {
      if(!createRulesResult.result){
        if(createRulesResult.statusCode == 409){
          throw(new Error('存在相同规则，添加规则失败'))
        }
        throw(new Error('添加规则失败'))
      }
      // reload 镜像同步页面
      return this.handleloadImageUpdateList()
    }).then(loadListResult => {
      if(!loadListResult.result){
        throw(new Error('添加规则成功，页面列表刷新失败，请刷新重试！'))
      }
      if(startUse){
        let id = 0
        for(let i=0;i<loadListResult.policies.length;i++){
          if(loadListResult.policies[i].name == ruleName){
            id = loadListResult.policies[i].id
            break
          }
        }
        // 启用规则
        return this.startUseRules(id)
      }else{
        throw(new Error('添加规则成功'))
      }
    }).then(switchResult => {
      if(!switchResult.result){
        throw(new Error('添加规则成功，启用规则失败，请手动启用！'))
      }
      // reload 镜像同步页面
      return this.handleloadImageUpdateList()
    }).then(loadListResult => {
      if(!loadListResult.result){
        throw(new Error('添加规则成功，页面列表刷新失败，请刷新重试！'))
      }
      throw(new Error('添加规则成功'))
    })
  }

  createNewRules(values){
    const {  targets } = this.props
    let Notification = new NotificationHandler()
    if(values.targetStoreType == "createNewstore"){
      let newStoremInfo = {
        name: values.NewTargetstoreName,
        endpoint: values.URLAddress,
        username: values.userName,
        password: values.passWord
      }
      // 检验新仓库是否可用
      this.validationTargetStore('create', newStoremInfo).then(validateResult => {
        if(!validateResult){
          throw(new Error('新目标仓库未连接，创建规则失败！'))
        }
        // 创建新仓库
        return this.createNewTargetStore(newStoremInfo)
      }).then(createStoreResult => {
        if(!createStoreResult.useful){
          if(createStoreResult.statusCode == 409){
            throw(new Error('仓库名称已存在！请直接选择已有目标仓库！'))
          }
          throw(new Error('新目标仓库创建失败！添加规则失败!'))
        }
        // 创建新规则
        return this.postCreateNewRules(values.rulesName, createStoreResult.target_id, values.startUse)
      }).catch(err => {
        if (err) {
          switch(err.message){
            case 'none':
              return
            case '添加规则成功':
              return Notification.success('添加规则成功')
            default:
              return Notification.error(err.message)
          }
        }
      })
      return
    }
    // 检验原有仓库是否可用
    let targetId = 0
    for(let i=0; i< targets.length; i++){
      if(values.SelectTargetStore == targets[i].name){
        targetId = targets[i].id
        break
      }
    }
    this.validationTargetStore('original', targetId).then(validateResult => {
      if(!validateResult){
        throw(new Error('新目标仓库未连接，创建规则失败！'))
      }
      //创建新规则
      return this.postCreateNewRules(values.rulesName, targetId, values.startUse)
    }).catch(err => {
      if (err) {
        switch(err.message){
          case 'none':
            return
          case '添加规则成功':
            return Notification.success('添加规则成功')
          default:
            return Notification.error(err.message)
        }
      }
    })
  }

  handleeditImageUpdateRules(values){
    const { rulesData, detail, targets } = this.props
    const { currentKey } = this.state
    let id = rulesData[currentKey].id
    let projectID = detail.data.projectId
    let targetId = 0
    let Notification = new NotificationHandler()
    for(let i=0; i < targets.length; i++){
      if(targets[i].name == values.SelectTargetStore){
        targetId = targets[i].id
        break
      }
    }
    if(rulesData[currentKey].enabled == 1){
      Notification.error('规则正在启用中，不可修改规则！')
      return
    }
    let editBody = {
      id:rulesData[currentKey].id,
      project_id:projectID,
      target_id:targetId,
      target_name:values.SelectTargetStore,
      name:values.rulesName,
      enabled:rulesData[currentKey].enabled,
      description:values.description,
    }
    this.handelEidtImageRules(id, editBody)
  }

  modalConfirm(){
    const { form } = this.props
    const { edit } = this.state
    form.validateFields((errors, values) => {
      if(!!errors){
        return
      }
      if(edit){
        this.handleeditImageUpdateRules(values)
        return
      }
      this.createNewRules(values)
    })
  }

  testStoreLink(){
    const { form, targets } = this.props
    form.validateFields((errors, values) => {
      if(!!errors){
        return
      }
      if(values.targetStoreType == "createNewstore"){
        let newStoremInfo = {
          name: values.NewTargetstoreName,
          endpoint: values.URLAddress,
          username: values.userName,
          password: values.passWord
        }
        // 检验新仓库是否可用
        this.validationTargetStore('create', newStoremInfo).then(validateResult => {
          if(!validateResult){
            this.setState({
              testLink: true,
              testLinkResult: false,
            })
            return
          }
          this.setState({
            testLink: true,
            testLinkResult: true,
          })
        })
        return
      }
      // 检验原仓库是否可用
      let targetId = 0
      for(let i=0; i< targets.length; i++){
        if(values.SelectTargetStore == targets[i].name){
          targetId = targets[i].id
          break
        }
      }
      this.validationTargetStore('original', targetId).then(validateResult => {
        if(!validateResult){
          this.setState({
            testLink: true,
            testLinkResult: false,
          })
          return
        }
        this.setState({
          testLink: true,
          testLinkResult: true,
        })
      })
    })
  }

  testLinkResult(){
    const { testLinkResult } = this.state
    if(testLinkResult){
      return <div className='success'><Icon type="check-circle-o icon" />测试连接成功</div>
    }
    return <div className='failed'><Icon type="cross-circle-o icon" />测试连接失败</div>
    return <Spin />
  }

  handleModalFooterDomNodes(){
    const { testLink } = this.state
    return <div>
      <Button  type="primary" className='test' size="large" onClick={this.testStoreLink}>测试仓库连接</Button>
      {
        testLink
        ? <div className='wrap'>{this.testLinkResult()}</div>
        : <span></span>
      }
      <Button size="large" onClick={this.modalCancel}>取消</Button>
      <Button type="primary" size="large" onClick={this.modalConfirm}>确定</Button>
    </div>
  }

  handleSelectOption(){
    const { targets } = this.props
    if(!targets){
      return []
    }
    let options = targets.map((item, index) => {
      return <Select.Option key={item.id} value={item.name + ',' + item.id}>{item.name}</Select.Option>
    })
    return options
  }

  checkRulesNameProps(rule, value, callback){
    if(!value){
      return callback('请输入规则名称')
    }
    if(value.length < 3 || value.length > 26){
      return callback('规则名称为3到25个字符')
    }
    callback()
  }

  startUseRules(id){
    const { registry, imageUpdateSwitch } = this.props
    const body = {
      enabled: 1
    }
    return new Promise((resolve, reject) => {
      imageUpdateSwitch(registry, id, body, {
        success : {
          func: () => {
            resolve({
              result: true
            })
          },
          isAsync: true
        },
        failed: {
          func: () => {
            resolve({
              result: false
            })
          }
        }
      })
    })
  }

  handleImageUpdateSwitch(currentKey){
    const { registry, imageUpdateSwitch, rulesData, deleteImageUpdateRules } = this.props
    let Notification = new NotificationHandler()
    const { switchTitle } = this.state
    let id = rulesData[currentKey].id

    const body = {
      enabled: 0
    }
    if(switchTitle == '启用'){
      body.enabled = 1
    }
    imageUpdateSwitch(registry, id, body, {
      success : {
        func: () => {
          Notification.success(switchTitle + '规则成功')
          this.handleloadImageUpdateList()
          this.setState({
            SwitchRulesVisible: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          Notification.error(switchTitle + '规则失败')
          this.setState({
            SwitchRulesVisible: false
          })
        }
      }
    })
  }

  handleDeleteImageUpdataRules(currentKey){
    const { registry, rulesData, deleteImageUpdateRules } = this.props
    let Notification = new NotificationHandler()
    let id = rulesData[currentKey].id
    if(rulesData[currentKey].enabled == 1){
      Modal.error({
        title: '提示',
        content: '不能直接删除启用中的规则，请停用后再删除',
      });
      return
    }
    deleteImageUpdateRules(registry, id, {
      success : {
        func: () => {
          Notification.success('删除规则成功')
          this.handleloadImageUpdateList()
          this.setState({
            SwitchRulesVisible: false
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          Notification.error('删除规则失败')
          this.setState({
            SwitchRulesVisible: false
          })
        }
      }
    })
  }

  handleSelcetOnchange(values){
    const { form, targets } = this.props
    let id = values.split(',')[1]
    let value = values.split(',')[0]
    this.setState({
      testLink: false,
    })
    for(let i=0;i<targets.length;i++){
      if(targets[i].id == id){
        form.setFieldsValue({
          SelectTargetStore: value,
          URLAddress: targets[i].endpoint,
          userName: targets[i].username,
          passWord: '******',
        })
        break
      }
    }
  }

  handleRadioGroupChange(value){
    const { form } = this.props
    const { edit, currentRules } = this.state
    this.setState({
      testLink: false,
    })
    if(value.target.value == 'selectTargetStore'){
      this.setState({
        editUrlDisabled: true,
        editDisabled: true,
      })
      if(edit){
        form.setFieldsValue({
          URLAddress: currentRules.store.endpoint,
          userName: currentRules.store.username,
          passWord: '******',
          SelectTargetStore: currentRules.store.name
        })
        return
      }
      form.setFieldsValue({
        URLAddress: undefined,
        userName: undefined,
        passWord: undefined,
        SelectTargetStore: undefined
      })
      return
    }

    if(value.target.value == 'createNewstore'){
      this.setState({
        editUrlDisabled: false,
        editDisabled: false,
      })
      form.setFieldsValue({
        URLAddress: undefined,
        userName: undefined,
        passWord: undefined,
        NewTargetstoreName: undefined,
      })
      return
    }
  }

  handleConfirmSwitchRules(){
    const { switchTitle, currentKey } = this.state
    this.setState({
      SwitchRulesVisible: false,
    })
    switch(switchTitle){
      case '停用':
      case '启用':
        return this.handleImageUpdateSwitch(currentKey)
      case '删除':
        return this.handleDeleteImageUpdataRules(currentKey)
      default:
        return
    }
  }

  handleRulesModalText(){
    const { switchTitle } = this.state
    let obj = {}
    switch(switchTitle){
      case '停用':
        return obj = {
          title: '停用规则',
          text: '停用规则后，所有未完成的同步任务将被终止和取消。'
        }
      case '启用':
        return  obj = {
          title: '启用规则',
          text: '启用规则后，该仓库组下的所有镜像仓库将同步到目标实例。'
        }
      case '删除':
        return  obj = {
          title: '删除规则',
          text: '删除规则后，将无法继续同步任务。'
        }
      default:
        return obj = {}
    }
  }

  handleDropDownMenu(key, item){
    this.setState({
      currentKey: key,
    })
    switch(item.key){
      case 'stop':
        return this.setState({
          switchTitle: '停用',
          SwitchRulesVisible: true,
        })
      case 'delete':
        return this.setState({
          switchTitle: '删除',
          SwitchRulesVisible: true,
        })
      case 'start':
        return this.setState({
          switchTitle: '启用',
          SwitchRulesVisible: true,
        })
      default: return
    }
  }

  handleEditRule(key){
    const { form, rulesData, targets } = this.props
    let targetStore = {}
    for(let i=0;i<targets.length;i++){
      if(rulesData[key].targetId == targets[i].id){
        targetStore.targetName = targets[i].name
        targetStore.URL = targets[i].endpoint
        form.setFieldsValue({
          rulesName: rulesData[key].name,
          description: rulesData[key].description,
          targetStoreType: "selectTargetStore",
          URLAddress: targetStore.URL,
          userName: targets[i].username,
          passWord: '******',
          SelectTargetStore: targetStore.targetName,
        })
        this.setState({
          addRulesVisible: true,
          currentKey: key,
          editDisabled: true,
          editUrlDisabled: true,
          edit: true,
          currentRules: {
            rules: rulesData[key],
            store: targets[i],
          },
          currentRulesEnabled: true,
        })
       return
      }
    }
  }

  getLogs(item){
    const { getTasklogs, registry } = this.props
    getTasklogs(registry, item)
    this.setState({
      logsVisible: true
    })
  }

  render(){
    const { form, rulesData, taskUpdataData, imageUpdateLogs } = this.props
    const { edit, currentRules, currentRulesEnabled } = this.state
    if(!rulesData || !taskUpdataData){
      return <div style={{textAlign:'center'}}><Spin style={{textAlign:'center'}}></Spin></div>
    }
    const { getFieldProps, getFieldValue } = form
    const scope = this
    function formatstatus(status){
      switch(status){
        case 1:
          return <span className='using'><i className="fa fa-circle marginR" aria-hidden="true"></i>启用</span>
        case 0:
          return <span className='stop'><i className="fa fa-circle marginR" aria-hidden="true"></i>停止</span>
        default:
          return <span className='default'><i className="fa fa-circle marginR" aria-hidden="true"></i>异常</span>
      }
    }

    const menu = rulesData.map((item, index) => {
      return <Menu onClick={this.handleDropDownMenu.bind(this,index)}>
        {
          item.enabled == 1
            ? <Menu.Item key="stop" style={{width:'90px'}}><i className="fa fa-stop" aria-hidden="true" style={{ marginRight: '8px'}}></i>停用</Menu.Item>
            : <Menu.Item key="start" style={{width:'90px'}}><i className="fa fa-play" aria-hidden="true" style={{ marginRight: '8px'}}></i>启用</Menu.Item>
        }
        <Menu.Item key="delete" style={{width:'90px'}}><i className="fa fa-trash-o" aria-hidden="true" style={{ marginRight: '8px'}}></i>删除</Menu.Item>
      </Menu>
    })

    const rulesColumn = [
      {
        title:'名称',
        dataIndex:'name',
      },{
        title:'描述',
        dataIndex:'description',
        render: (item) => <div>{ item ? item : '--'}</div>
      },{
        title:'目标名',
        dataIndex:'targetName',
      },{
        title:'上次起始时间',
        dataIndex:'updateTime',
        render: (time) => <div>{formatDate(time)}</div>
      },{
        title:'活动状态',
        dataIndex:'enabled',
        render: (status) => <div>{formatstatus(status)}</div>
      },{
        title:'操作',
        dataIndex:'key',
        render: (row) => <div>
          <Dropdown.Button onClick={this.handleEditRule.bind(this, row)} overlay={menu[row]} type="ghost">
            <i className="fa fa-pencil-square-o handleicon"></i>修改
          </Dropdown.Button>
        </div>
      }
    ]

    const updataTaskColumn = [
      {
        title:'名称',
        dataIndex:'repository',
      },
      {
        title:'状态',
        dataIndex:'status',
      },
      {
        title:'操作',
        dataIndex:'operation',
      },
      {
        title:'耗时',
        dataIndex:'timeConsuming',
        render: (item) => <div>{formatDuration(item.begin, item.end, true)}</div>
      },
      {
        title:'创建时间',
        dataIndex:'creationTime',
        render: (time) => <div>{formatDate(time)}</div>
      },
      {
        title:'结束时间',
        dataIndex:'updateTime',
        render: (time) => <div>{formatDate(time)}</div>
      },
      {
        title:'日志',
        dataIndex:'id',
        render: (item) => <div><Icon type="file-text icon" onClick={this.getLogs.bind(this, item)}/></div>
      }
    ]

    const rulesNameProps = getFieldProps('rulesName',{
      rules: [
        { validator: this.checkRulesNameProps}
      ]
    })

    const descriptionProps = getFieldProps('description',{
      rules: [
        {required: false},
      ]
    })

    const targetStoreTypeProps = getFieldProps('targetStoreType',{
      initialValue: 'createNewstore',
      onChange: this.handleRadioGroupChange
    })
    const targetstoretype = getFieldValue('targetStoreType')
    let NewTargetstoreNameProps = getFieldProps('NewTargetstoreName')
    let URLAddressProps = getFieldProps('URLAddress')
    let userNameProps = getFieldProps('userName')
    let passWordProps = getFieldProps('passWord')
    let SelcetTargetStoreProps = getFieldProps('SelectTargetStore')
    if(targetstoretype == 'createNewstore'){
      NewTargetstoreNameProps = getFieldProps('NewTargetstoreName',{
        rules: [
          { required: true, message: '请输入新目标仓库名称' },
        ]
      })
      URLAddressProps = getFieldProps('URLAddress',{
        rules: [
          { required: true, message: '请输入URL地址' },
        ]
      })
      userNameProps = getFieldProps('userName',{
        rules: [
          { required: true, message: '请输入用户名' },
        ]
      })
      passWordProps = getFieldProps('passWord',{
        rules: [
          { required: true, message: '请输入密码' },
        ],
      })
    }
    if(targetstoretype == 'selectTargetStore'){
      SelcetTargetStoreProps = getFieldProps('SelectTargetStore',{
        rules: [
          { required: true, message: '请选择一个目标仓库' },
        ]
      })
    }
    const startUseProps = getFieldProps('startUse',{
      valuePropName:'checked',
      initialValue: false
    })

    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 20},
    }

    return(
      <div id='imageUpdata'>
        <div className='rules'>
          <div className='header'>
            <Button type="primary" size='large' className='buttonadd' onClick={this.handleAddRules}><i className='fa fa-plus'/>&nbsp;添加规则</Button>
            {/*<span className='searchBox'>
              <Input size="large" placeholder='搜索' className='inputStandrd' onPressEnter={this.handleSearchRules}
                onChange={this.handleInputValue}/>
              <Icon type="search" className='iconSearch' onClick={this.handleSearchRules}/>
            </span>*/}
            {
              rulesData.length
              ? <span className='totleNum'>共计：{rulesData.length} 条</span>
              : null
            }
          </div>
          <div className="body">
            <Table
              columns={rulesColumn}
              dataSource={rulesData}
              pagination={{simple: true}}
            />
          </div>
        </div>
        <div className='updataTask'>
          <div className='title'>同步任务</div>
          <div className="header">
            <span className="searchBox">
              <Input size="large" placeholder='搜索' className='inputStandrd' onPressEnter={this.handleSearchRules}
                onChange={this.handleInputValue}/>
              <Icon type="search" className='iconSearch' onClick={this.handleSearchRules}/>
            </span>
            {
              taskUpdataData.length
              ? <span className='totleNum'>共计：{taskUpdataData.length} 条</span>
              : null
            }
          </div>
          <div className="body">
            <Table
              columns={updataTaskColumn}
              dataSource={taskUpdataData}
              pagination={{simple: true}}
            />
          </div>
        </div>

        <Modal
          title={this.state.edit ? '修改规则' : '新建规则'}
          visible={this.state.addRulesVisible}
          closable={true}
          width='460px'
          onCancel={this.modalCancel}
          maskClosable={false}
          wrapClassName="imageUpdataAddRules"
          footer={this.handleModalFooterDomNodes()}
        >
          <Form>
            <Form.Item
              {...formItemLayout}
              label="规则名称"
              key="rulesName"
            >
              <Input size="large" {...rulesNameProps}/>
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label="描述"
              className='description itemMarginBottom'
            >
              <Input size="large" {...descriptionProps} className='textareaStyle' type="textarea"/>
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              key="targeStoreType"
              label={<span></span>}
              className='itemMarginBottom'
            >
              <Radio.Group {...targetStoreTypeProps}>
                <Radio value="createNewstore" key="createNewstore" disabled={currentRulesEnabled}>新建目标仓库</Radio>
                <Radio value="selectTargetStore" key="selectTargetStore">选择已有目标仓库</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label={<span>目标仓库<span className='star'>*</span></span>}
              key="targetStoreName"
            >
              {
                targetstoretype == 'createNewstore'
                  ? <Input {...NewTargetstoreNameProps}/>
                  : <Select
                  showSearch
                  {...SelcetTargetStoreProps}
                  placeholder="选择目标仓库"
                  size='large'
                  onChange={this.handleSelcetOnchange}
                  disabled={currentRulesEnabled}
                >
                  {this.handleSelectOption()}
                </Select>
              }
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label={<span>URL地址<span className='star'>*</span></span>}
            >
              <Input size="large" {...URLAddressProps} disabled={this.state.editUrlDisabled}/>
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label='用户名'
            >
              <Input size="large" {...userNameProps} disabled={this.state.editDisabled}/>
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label="密码"
            >
              <Input type="password" size="large" {...passWordProps} disabled={this.state.editDisabled}/>
            </Form.Item>
            {
              edit
              ? null
              : <Form.Item
                {...formItemLayout}
                label={<span></span>}
                className='itemMarginBottom'
              >
                <Checkbox {...startUseProps}>创建完成后，立即启用</Checkbox>
              </Form.Item>
            }
          </Form>
        </Modal>

        <Modal
          title={this.handleRulesModalText().title}
          visible={this.state.SwitchRulesVisible}
          closable={true}
          onOk={this.handleConfirmSwitchRules}
          onCancel={() => this.setState({SwitchRulesVisible: false})}
          width='570px'
          maskClosable={false}
          wrapClassName="switchRulesModal"
        >
          <div>
            <div className='tipsone'><Icon type="question-circle-o" className='qusetionIcon'/>{this.handleRulesModalText().text}</div>
            <div className='tipstwo'>请确认继续。</div>
          </div>
        </Modal>

        <Modal
          title={null}
          visible={this.state.logsVisible}
          closable={true}
          onOk={() => this.setState({logsVisible: false})}
          onCancel={() => this.setState({logsVisible: false})}
          footer={[]}
          maskClosable={true}
          width="750px"
          wrapClassName="taskUpdataLogsModal"
        >
          <LogsTemplate scope={scope} imageUpdateLogs={imageUpdateLogs}/>
        </Modal>
      </div>
    )
  }
}

ImageUpdate = Form.create()(ImageUpdate)

function mapStateToProp(state, props) {
  const { harbor } = state
  const { detail, imageUpdate, imageUpdateLogs } = harbor
  const { policies, jobs, targets } = imageUpdate
  return {
    detail,
    rulesData: policies || [],
    taskUpdataData: jobs || [],
    targets: targets || [],
    imageUpdateLogs,
  }
}

export default connect(mapStateToProp, {
  loadImageUpdateList,
  imageUpdateSwitch,
  deleteImageUpdateRules,
  editImageUpdateRules,
  createTargetStore,
  iamgeUpdateAddNewRules,
  validationNewTargetStore,
  validationOldTargetStore,
  getTasklogs,
})(ImageUpdate)

