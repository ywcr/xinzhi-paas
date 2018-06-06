/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Advanced Setting component
 *
 * v0.1 - 2017-5-10
 * @author ZhangChengZheng
 */
import React, { Component, propTypes } from 'react'
import { Switch, Checkbox, Spin, Modal, Icon, Form, Radio, Button } from 'antd';
import './style/AdvancedSetting.less'
import { connect } from 'react-redux'
import { updateClusterConfig } from '../../../actions/cluster'
import { loadTeamClustersList } from '../../../actions/team'
import { setCurrent } from '../../../actions/entities'
import { updateConfigurations, getConfigurations } from '../../../actions/harbor'
import NotificationHandler from '../../../common/notification_handler'
import { DEFAULT_REGISTRY } from '../../../constants'
import Title from '../../Title'

class AdvancedSetting extends Component {
  constructor(props){
    super(props)
    this.handleSwitch = this.handleSwitch.bind(this)
    this.handleName = this.handleName.bind(this)
    this.handleTag = this.handleTag.bind(this)
    this.updataClusterListNodes = this.updataClusterListNodes.bind(this)
    this.handleConfirmSwitch = this.handleConfirmSwitch.bind(this)
    this.handleCancelSwitch = this.handleCancelSwitch.bind(this)
    this.handleListNodeStatus = this.handleListNodeStatus.bind(this)
    this.handleUpdataConfigMessage = this.handleUpdataConfigMessage.bind(this)
    this.handleImageProjectRight = this.handleImageProjectRight.bind(this)
    this.handleCancelImageProjectRight = this.handleCancelImageProjectRight.bind(this)
    this.handleSaveImageProjectRight = this.handleSaveImageProjectRight.bind(this)
    this.state = {
      swicthChecked: true,
      switchVisible: false,
      Ipdisabled: false,
      Tagdisabled: false,
      switchdisable: false,
      Ipcheckbox: false,
      TagCheckbox: false,
      confirmlodaing: false,
      imageProjectRightIsEdit: false,
    }
  }

  componentWillMount(){
    const { cluster, space, loadTeamClustersList, getConfigurations, harbor } = this.props
    const { listNodes } = cluster
    this.handleListNodeStatus(listNodes)
    loadTeamClustersList(space.teamID, { size: 100 })
    if(!harbor.hasAdminRole) {
      return
    }
    getConfigurations(DEFAULT_REGISTRY, {
      success: {
        func: (res) => {
          let projectCreationRestriction = res.data.projectCreationRestriction
          if (!projectCreationRestriction) {
            projectCreationRestriction = {
              editable: false,
              value: 'adminonly'
            }
          }
          this.setState({
            currentRepoAuth: projectCreationRestriction.value
          })
        }
      },
      failed: {
        func: (res) => {
          const notification = new NotificationHandler()
          let message = '获取仓库组权限信息失败'
          if (res.statusCode && res.statusCode == 403) {
            message = '没有权限获取仓库组权限信息'
          }
          notification.error(message)
        }
      }
    })
  }

  handleUpdataConfigMessage(status,num){
    const Notification = new NotificationHandler()
    if(status == 'success'){
      switch(num){
        case 1:
          return Notification.success('关闭绑定节点成功！')
        case 2:
          return Notification.success('开启【主机名及IP】绑定成功！')
        case 3:
          return Notification.success('开启【主机标签】绑定成功！')
        case 4:
          return Notification.success('开启【主机名及IP】与【主机标签】绑定成功！')
        default:
          return
      }
    }
    if(status == 'failed'){
      switch(num){
        case 1:
          return Notification.success('关闭绑定节点失败！')
        case 2:
          return Notification.success('开启【主机名及IP】绑定失败！')
        case 3:
          return Notification.success('开启【主机标签】绑定失败！')
        case 4:
          return Notification.success('开启【主机名及IP】与【主机标签】绑定失败！')
        default:
          return
      }
    }
  }

  handleListNodeStatus(listNodes){
    switch(listNodes){
      case 0:
      case 1:
        return this.setState({
          swicthChecked: false,
        })
      case 2:
        return this.setState({
          swicthChecked: true,
          Ipcheckbox: true,
          TagCheckbox: false,
        })
      case 3:
        return this.setState({
          swicthChecked: true,
          Ipcheckbox: false,
          TagCheckbox: true,
        })
      case 4:
        return this.setState({
          swicthChecked: true,
          Ipcheckbox: true,
          TagCheckbox: true,
        })
      default:
        return this.setState({
          swicthChecked: false,
        })
    }
  }

  componentWillReceiveProps(nextProps){
    const num = nextProps.cluster.listNodes
    if(!this.props.cluster.listNodes || this.props.cluster.clusterID !== nextProps.cluster.clusterID || this.props.cluster.listNodes !== nextProps.cluster.listNodes){
      this.handleListNodeStatus(num)
    }
  }

  updataClusterListNodes(num){
    const {updateClusterConfig, cluster, loadTeamClustersList, space, setCurrent} = this.props
    const {clusterID} = cluster
    this.setState({
      confirmlodaing: true
    })
    updateClusterConfig(clusterID, {ListNodes: num}, {
      success: {
        func: () =>{
          loadTeamClustersList(space.teamID, { size: 100 },{
            success: {
              func: () => {
                const { result } = this.props
                for(let i=0; i<result.data.length; i++){
                  if(result.data[i].clusterID == clusterID){
                    setCurrent({
                      cluster: result.data[i],
                    })
                    break
                  }
                }
                this.handleUpdataConfigMessage('success',num)
                this.setState({
                  switchdisable: false,
                  Tagdisabled: false,
                  Ipdisabled: false,
                  confirmlodaing: false
                })
                this.handleListNodeStatus(num)
              },
              isAsync: true
            }
          })
        },
        isAsync: true
      },
      falied: {
        func: () => {
          this.handleUpdataConfigMessage('failed',num)
          this.setState({
            switchdisable: false,
            Tagdisabled: false,
            Ipdisabled: false,
          })
        }
      }
    })
  }

  handleSwitch(){
    return this.setState({
      switchVisible: true,
      switchdisable: true,
      Ipdisabled: true,
      Tagdisabled: true,
    })
  }

  handleConfirmSwitch(){
    const { swicthChecked } = this.state
    this.setState({
      switchVisible : false
    })
    if(swicthChecked == true){
      this.updataClusterListNodes(1)
      return
    }
    if(swicthChecked == false){
      this.updataClusterListNodes(2)
      return
    }
  }

  handleCancelSwitch(){
    this.setState({
      switchVisible: false,
      switchdisable: false,
      Ipdisabled: false,
      Tagdisabled: false,
    })
  }

  handleName(){
    const { Ipcheckbox, TagCheckbox } = this.state
    this.setState({
      Ipdisabled: true,
      Tagdisabled: true,
    })
    if(TagCheckbox == true){
      switch(Ipcheckbox){
        case true:
          return this.updataClusterListNodes(3)
        case false:
          return this.updataClusterListNodes(4)
        default:
          return
      }
    }
    if(TagCheckbox == false){
      switch(Ipcheckbox){
        case true:
          return this.updataClusterListNodes(1)
        case false:
        default:
          return
      }
    }
  }

  handleTag(){
    const { Ipcheckbox, TagCheckbox } = this.state
    this.setState({
      Ipdisabled: true,
      Tagdisabled: true,
    })
    if(Ipcheckbox == true ){
      switch(TagCheckbox){
        case true:
          return this.updataClusterListNodes(2)
        case false:
          return this.updataClusterListNodes(4)
        default:
          return
      }
    }
    if(Ipcheckbox == false){
      switch(TagCheckbox){
        case true:
          return this.updataClusterListNodes(1)
        case false:
          return this.updataClusterListNodes(3)
        default:
          return
      }
    }
  }

  handleImageProjectRight(){
    this.setState({
      imageProjectRightIsEdit: true
    })
  }

  handleCancelImageProjectRight(){
    this.setState({
      imageProjectRightIsEdit: false
    })
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({
      imageProjectRightProps: this.state.currentRepoAuth
    })
  }

  handleSaveImageProjectRight(){
    const { form, updateConfigurations } = this.props
    const { getFieldValue } = form
    let value = getFieldValue('imageProjectRightProps')
    const notification = new NotificationHandler()
    notification.spin('修改仓库组创建权限中')
    updateConfigurations(DEFAULT_REGISTRY, {
      project_creation_restriction: value
    }, {
        success: {
          func: (res) => {
            notification.close()
            notification.success('修改仓库组创建权限成功')
            this.setState({
              imageProjectRightIsEdit: false,
              currentRepoAuth: value
            })
          }
        },
        failed: {
          func: (res) => {
            notification.close()
            let message = '修改仓库组创建权限失败'
            if(res.statusCode && res.statusCode == 403) {
              message = '没有权限对仓库组权限进行更改'
            }
            notification.error(message)
          }
        }
      })
  }

  render(){
    const { swicthChecked, Ipcheckbox, TagCheckbox, switchdisable, Tagdisabled, Ipdisabled, imageProjectRightIsEdit } = this.state
    const { cluster, form, configurations, harbor } = this.props
    const { listNodes } = cluster
    const { getFieldProps  } = form
    if(listNodes == undefined || (harbor.hasAdminRole && (!configurations[DEFAULT_REGISTRY] || configurations[DEFAULT_REGISTRY].isFetching))) {
      return <div className='nodata'><Spin></Spin></div>
    }
    let projectCreationRestriction 
    if(harbor.hasAdminRole && configurations[DEFAULT_REGISTRY].data) {
      projectCreationRestriction  = configurations[DEFAULT_REGISTRY].data.projectCreationRestriction
    }
    if(!projectCreationRestriction) {
      projectCreationRestriction = {
        editable: false,
        value: 'adminonly'
      }
    }
    const imageProjectRightProps = getFieldProps('imageProjectRightProps',{
      initialValue: projectCreationRestriction.value
    })
    return (<div id="AdvancedSetting">
      <Title title="高级设置" />
      <div className='title'>高级设置</div>
      <div className='content'>
        <div className='nodes'>
          <div className='contentheader'>允许用户绑定节点（所有集群）</div>
          <div className='contentbody'>
            <div className='contentbodytitle alertRow'>
              即创建服务时，可以将服务对应容器实例，固定在节点或者某些『标签』的节点上来调度
            </div>
            <div>
              <div className='contentbodycontainers'>
                <span>
                  {
                    swicthChecked
                      ? <span>开启</span>
                      : <span>关闭</span>
                  }
                  绑定节点
                  </span>
                <Switch checked={swicthChecked} onChange={this.handleSwitch} className='switchstyle' disabled={switchdisable} />
              </div>
              {
                swicthChecked
                  ? <div className='contentfooter'>
                    <div className='item'>
                      <Checkbox onChange={this.handleName}
                        checked={Ipcheckbox} disabled={Ipdisabled}>允许用户通过『主机名及IP』来实现绑定【单个节点】</Checkbox>
                    </div>
                    <div className='item'>
                      <Checkbox onChange={this.handleTag}
                        checked={TagCheckbox} disabled={Tagdisabled}>用户可通过『主机标签』绑定【某类节点】</Checkbox>
                    </div>
                  </div>
                  : <div></div>
              }
            </div>
          </div>
        </div>
        {harbor.hasAdminRole ? <div className='imageprojectright'>
          <div className="contentheader imageproject">仓库组创建权限</div>
          <div className="contentbody">
            <div className="alertRow">用来确定哪些用户有权限创建『仓库组』，默认为『所有人』，设置为『仅管理员』则只有系统管理员有权限</div>
          </div>
          <div className='radiobox'>
            <Form>
              <Form.Item>
                <Radio.Group disabled={!imageProjectRightIsEdit} {...imageProjectRightProps}>
                  <Radio value="everyone" key="alluser">所有人均可创建</Radio>
                  <Radio value="adminonly" key="admin">仅管理员可创建</Radio>
                </Radio.Group>
              </Form.Item>
            </Form>
          </div>
          <div className='buttonbox'>
            {
              imageProjectRightIsEdit
                ? <span>
                  <Button onClick={this.handleCancelImageProjectRight}>取消</Button>
                  <Button onClick={this.handleSaveImageProjectRight} type="primary" className='saveButton' >保存</Button>
                </span>
                : <Button type="primary" onClick={this.handleImageProjectRight} disabled={!projectCreationRestriction.editable}>编辑</Button>
            }
          </div>
        </div> : ''}
      </div>

      <Modal
        title={swicthChecked ? '关闭绑定节点' : '开启绑定节点'}
        visible={this.state.switchVisible}
        maskClosable={false}
        wrapClassName="AdvancedSettingSwitch"
        onOk={this.handleConfirmSwitch}
        onCancel={this.handleCancelSwitch}
        confirmLoading={this.state.confirmlodaing}
      >
        {
          swicthChecked
          ?<div className='container'>
            <div className='item'>关闭绑定节点，平台用户将不可以把某个服务的容器实例，绑定到固定主机节点上</div>
            <div className='item color'><Icon type="question-circle-o" style={{marginRight:'8px'}}/>确认关闭绑定节点功能？</div>
          </div>
          : <div className='container'>
            <div className='item'>开启绑定节点，平台用户将可以把某个服务的容器实例，绑定到固定主机节点上</div>
            <div className='item color'><Icon type="question-circle-o" style={{marginRight:'8px'}}/>确认开启允许绑定节点功能？</div>
          </div>
        }
      </Modal>
    </div>)
  }
}

AdvancedSetting = Form.create()(AdvancedSetting)

function mapPropsToState(state,props) {
  const { cluster, space } = state.entities.current
  const { harbor } = state.entities.loginUser.info
  const { result } = state.team.teamClusters || {}
  const { configurations } = state.harbor
  return {
    cluster,
    space,
    result,
    configurations,
    harbor
  }
}

export default connect(mapPropsToState,{
  updateClusterConfig,
  loadTeamClustersList,
  setCurrent,
  updateConfigurations,
  getConfigurations
})(AdvancedSetting)