/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * project component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal, Icon, Button,Form,Radio, Card, Input,Tooltip,Checkbox } from 'antd'
import QueueAnim from 'rc-queue-anim'
import '../style/Project.less'
import DataTable from './DataTable'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import { loadProjectList, createProject, deleteProject, updateProject, loadSysteminfo,getTargetStore,iamgeUpdateAddNewRules,iamgeGetRules } from '../../../../actions/harbor'
import NotificationHandler from '../../../../common/notification_handler'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { setTimeout } from 'timers';

const RadioGroup = Radio.Group
const notification = new NotificationHandler()
const DEFAULT_QUERY = {
  page: 1,
  page_size: 10,
}

class CreateItem extends Component {
  constructor(props) {
    super()
    this.state = {
      checkeds: false
    }
    this.onChange = this.onChange.bind(this)
  }
  handCancel() {
    const { form,func } = this.props
    form.resetFields()
    func.scope.setState({createItem:false})
  }
  projectNameExists(role, value, callback) {
    if (!Boolean(value)) {
      return callback('请输入仓库组名称')
    }
    if (value.length <3) {
      return callback('仓库组名称至少3位字符')
    }
    if (value.length >30) {
      return callback('仓库组名称长度不可超过30个字符')
    }
    if (!/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(value)) {
      callback('小写英文字母或数学开头和结尾，内容可包括_或者-')
      return
    }
    callback()
  }
  handOk() {
    const { form, func, getTargetStore,iamgeUpdateAddNewRules } = this.props
    
    form.validateFields((error, values)=> {
      if (!!error) {
        return
      }
      func.createProject(DEFAULT_REGISTRY, values, {
        success: {
          func: (datas) => {
            if(this.state.checkeds){
              getTargetStore(DEFAULT_REGISTRY,{
                success:{
                  func:(data) => {
                    const targetId = data.data.filter(function(item) {
                      if(item.type == 1){
                        return item.id
                      }
                    })
                    const body = {}
                    body['project_id'] = Number(datas.projectId)
                    body['target_id'] = targetId[0].id
                    body['name'] = values.project_name
                    body['enabled'] = 1
                    setTimeout(function(){
                      iamgeUpdateAddNewRules(DEFAULT_REGISTRY,body,{
                        success:{
                          func:(data) => {
                          },isAsync: true,
                        }
                      })
                    })
                  },isAsync: true,
                }
              })
              
            }
            notification.success(`仓库组 ${values.project_name} 创建成功`)
            func.loadData()
            func.scope.setState({ createItem:false })
            form.resetFields()
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            const { statusCode } = err
            if (statusCode === 409) {
              notification.error(`仓库组名称 ${values.project_name} 已存在`)
              return
            } else if (statusCode === 400) {
              notification.error(`请求错误，请检查仓库名称： ${values.project_name}`)
              return
            }
            notification.error(`创建仓库组 ${values.project_name} 失败，错误代码: ${statusCode}`)
          },
        }
      })
    })
  }
  onChange(e){
    this.setState({
      checkeds : e.target.checked
    })
  }
  render() {
    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    }
    const itemName= getFieldProps('project_name',{
      rules: [
        { validator: this.projectNameExists },
      ],
    })
    const projectPublic = getFieldProps('public',{
      rules: [
        { required: true },
      ],
      initialValue: 0,
    })
    return (
      <Modal title="新建仓库组" visible={this.props.visible} onOk={()=> this.handOk()} onCancel={()=> this.handCancel()}>
        <Form className="itemCreateFrom">
          <Form.Item label="仓库组名称" {...formItemLayout} className="createForm">
            <Input placeholder="请输入仓库组名称" {...itemName}/>
          </Form.Item>
          <Form.Item label="仓库组类型" {...formItemLayout} className="createForm">
            <RadioGroup {...projectPublic}>
              <Radio value={0}>私有</Radio>
              <Radio value={1}>公开</Radio>
            </RadioGroup>
          </Form.Item>
          <Form.Item label="同步仓库" {...formItemLayout} className="createForm">
            <Checkbox style={{float:'left',width:'300px'}} onChange={this.onChange}>公有云镜像仓库</Checkbox>
          </Form.Item>
          <div className="alertRow">当仓库组设为公开后，所有人都有读取该仓库组内镜像的权限。命令行操作下无需“docker login”即可以拉取该仓库组内的所有镜像。</div>
        </Form>
      </Modal>
    )
  }
}

CreateItem = Form.create()(CreateItem)

class Project extends Component {
  constructor(props) {
    super()
    this.state = {
      createItem: false,// create modal
      deleteItem: false,// delte modal
      selectedRows:[],
      searchInput: '',
    }
    this.loadData = this.loadData.bind(this)
    this.searchProjects = this.searchProjects.bind(this)
    this.deleteItemOk = this.deleteItemOk.bind(this)
  }

  loadData(query) {
    const { loadProjectList } = this.props
    loadProjectList(DEFAULT_REGISTRY, Object.assign({}, DEFAULT_QUERY, query))
  }

  componentWillMount() {
    this.loadData()
    this.props.loadSysteminfo(DEFAULT_REGISTRY)
  }
  componentDidUpdate() {
    let searchInput = document.getElementsByClassName('search')[0]
    searchInput && searchInput.focus()
  }
  searchProjects() {
    this.loadData({ project_name: this.state.searchInput })
  }

  deleteItemOk() {
    // go delete item
    const { deleteProject,iamgeGetRules } = this.props
    const { selectedRows } = this.state
    const doSuccess = () => {
      notification.success(`仓库组 ${selectedRows[0].name} 删除成功`)
      this.setState({
        deleteItem: false,
      })
      this.loadData()
    }
    iamgeGetRules(DEFAULT_REGISTRY,{project_id:selectedRows[0][camelize('project_id')]},{
      success:{
        func:function(data){
          if(data.data){
            notification.error(`项目包含镜像仓库或复制规则，无法删除`)
          }else{
            setTimeout(function(){
              deleteProject(DEFAULT_QUERY, selectedRows[0][camelize('project_id')], {
                success: {
                  func: () => {
                    doSuccess()
                  },
                  isAsync: true,
                },
                failed: {
                  func: err => {
                    const { statusCode } = err
                    if (statusCode === 404) {
                      doSuccess()
                      return
                    }
                    if (statusCode === 412) {
                      notification.error(`项目包含镜像仓库或复制规则，无法删除`)
                      this.setState({
                        deleteItem: false,
                      })
                      return
                    }
                    notification.error(`仓库组删除失败`)
                  },
                }
              })
            })
            
          }
        }
      }
    })
    
  }
  openCreateModal() {
    this.setState({createItem: true},()=>{
      document.getElementById('project_name').focus()
    })
  }
  render() {
    const { harborProjects, harborSysteminfo, createProject, updateProject, loginUser,getTargetStore,iamgeUpdateAddNewRules } = this.props
    const func = {
      scope: this,
      loadData: this.loadData,
      createProject,
      updateProject,
    }
    const isAdmin = loginUser.harbor[camelize('has_admin_role')] == 1
    const isShowCreateBtn = harborSysteminfo[camelize('project_creation_restriction')] === 'everyone' || isAdmin
    return (
      <div className="imageProject">
        <br />
        <QueueAnim>
          <div key="projects">

            <Card className="project">
              <div className="topRow">
                {
                  isShowCreateBtn &&
                  <Button
                    type="primary"
                    size="large"
                    onClick={this.openCreateModal.bind(this)}
                  >
                    <i className='fa fa-plus'/>&nbsp;
                    新建仓库组
                  </Button>
                }
                {/*<Button type="ghost" disabled={this.state.selectedRows.length==0} onClick={()=> this.setState({deleteItem:true})} size="large" icon="delete">删除</Button>*/}
                <Input
                  placeholder="按仓库组名称搜索"
                  className="search"
                  size="large"
                  onChange={e => this.setState({ searchInput: e.target.value })}
                  onPressEnter={this.searchProjects}
                />
                <i className="fa fa-search" onClick={this.searchProjects}></i>
                {/*{harborProjects.total >0 ?
                <span className="totalPage">共计：{harborProjects.total} 条</span>
                :null
                }*/}
              </div>
              <DataTable loginUser={loginUser} dataSource={harborProjects} func={func}/>
            </Card>
            {/* 创建仓库组 Modal */}
            <CreateItem visible={this.state.createItem} getTargetStore={getTargetStore} iamgeUpdateAddNewRules={iamgeUpdateAddNewRules} func={func}/>

            {/* 删除仓库组 Modal */}
            <Modal title="删除仓库组" visible={this.state.deleteItem}
              onCancel={()=> this.setState({deleteItem:false})}
              onOk={()=> this.deleteItemOk()}
            >
              <div className="confirmText">您确认删除 {this.state.selectedRows.map(item=> item.name).join(',')} 仓库组?</div>
            </Modal>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { harbor, entities } = state
  let harborProjects = harbor.projects && harbor.projects[DEFAULT_REGISTRY] || {}
  let harborSysteminfo = harbor.systeminfo && harbor.systeminfo[DEFAULT_REGISTRY] && harbor.systeminfo[DEFAULT_REGISTRY].info || {}
  return {
    harborProjects,
    harborSysteminfo,
    loginUser: entities.loginUser.info,
  }
}

export default connect(mapStateToProps, {
  loadProjectList,
  createProject,
  deleteProject,
  updateProject,
  iamgeGetRules,
  iamgeUpdateAddNewRules,
  loadSysteminfo,
  getTargetStore
})(Project)
