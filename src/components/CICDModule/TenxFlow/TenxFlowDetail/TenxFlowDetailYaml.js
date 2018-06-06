/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowDetailYaml component
 *
 * v0.1 - 2016-10-21
 * @author Yaowei
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Card, Alert,Modal,Form,Row,Icon,Col,Select,Popover } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import cloneDeep from 'lodash/cloneDeep'
import NotificationHandler from '../../../../common/notification_handler'
import {
  loadTeamClustersList
} from '../../../../actions/team'
import { appNameCheck } from '../../../../common/naming_validation'
import { loadUserTeamspaceList, loadUserList } from '../../../../actions/user'
import { ennflowCloneSpace } from '../../../../actions/cicd_flow'
import { USERNAME_REG_EXP_NEW } from '../../../../constants'
import { DEFAULT_REGISTRY,ROLE_SYS_ADMIN,USER_CURRENT_CONFIG } from '../../../../../constants'
import './style/TenxFlowDetailYaml.less'
import { browserHistory } from 'react-router';
import YamlEditor from '../../../Editor/Yaml'
import Title from '../../../Title'
import PopSelect from '../../../PopSelect'
import Content from '../../../PopSelect/Content'
const createForm = Form.create
const FormItem = Form.Item
const standard = require('../../../../../configs/constants').STANDARD_MODE
const mode = require('../../../../../configs/model').mode
const Option = Select.Option;
let notification = new NotificationHandler()
const selectTeam = mode === standard ? '选择团队' : '选择空间'
const menusText = defineMessages({
  tooltips: {
    id: 'CICD.Tenxflow.TenxFlowDetailYaml.tooltips',
    defaultMessage: '同步EnnFlow到指定的空间!',
  },
  name: {
    id: 'CICD.Tenxflow.CreateTenxFlow.name',
    defaultMessage: 'EnnFlow名称',
  },
})

let TenxFlowDetailYaml = React.createClass({
  getInitialState: function() {
    return {
      delFlowModal:false,
      allUsers:[],
      spacesVisible:false,
      visible:false,
      namespace:'',
      isSysAdmin: this.props.loginUser.role == ROLE_SYS_ADMIN
    }
  },
  componentDidMount() {
   this.props.loadUserList({ size: 0 }, {
      success: {
        func: res => {
          this.setState({ allUsers: cloneDeep(res.users || []) })
        }
      }
    })
  },
  handleChange: function(value){
    this.setState({
      namespace:value.namespace,
      visible:false,
    })
  },
  cloneEnnFlow:function(){
    const {detail,ennflowCloneSpace,loginUser,form} = this.props;
    const _this = this;
    let stageInfo = detail.stageInfo.map(function(val){
      val.lastBuildStatus.podName?val.lastBuildStatus['pod_name'] = val.lastBuildStatus.podName:'';
      val.spec.project.repoType?val.spec.project['repo_type'] = val.spec.project.repoType:'';
      val.spec.container.scriptsId?val.spec.container['scripts_id'] = val.spec.container.scriptsId:'';

      val.lastBuildStatus.podName?delete val.lastBuildStatus.podName:'';
      val.spec.container.scriptsId?delete val.spec.container.scriptsId:'';
      val.spec.project.repoType?delete val.spec.project.repoType:'';
      
      return val;
    })
    form.validateFields(['ennFlowName'], (errors, values) => {
      if (!!errors) {
        return errors
      }
      if(this.state.namespace && values.ennFlowName){
        let body = {
          "namespaces": [
            this.state.namespace == 'default'?loginUser.namespace:this.state.namespace
          ],
          "flowName":values.ennFlowName,
          'stage_info': stageInfo
        }
        ennflowCloneSpace(body,detail.flowId,{
          success: {
            func:(res)=>{
              if(res.data.status == 200){
                notification.success('EnnFlow 同步成功！')
                _this.setState({
                  delFlowModal:false,
                  namespace:'',
                })
                form.setFieldsValue({
                  ennFlowName:''
                })
              }
            }
          }
        })
      }
    })
    
  },
  spaceExists(rule, value, callback) {
    const _this = this
    if (!value) {
      callback()
      return
    }
    let errorMsg = appNameCheck(value, 'Ennflow名称');
    if(errorMsg == 'success') {
      callback()
    } else {
      callback([new Error(errorMsg)])
    }
    // if (!USERNAME_REG_EXP_NEW.test(value)) {
    //   callback([new Error('以[a~z]开头，允许[0~9]、[-]，且以小写英文和数字结尾')])
    //   return
    // }
  },
  render() {
    // const { formatMessage } = this.props.intl;
    const {getFieldProps,setFieldsValue,isFieldValidating,getFieldError} = this.props.form
    const { scope, yaml, teamClusters,loginUser,teamspaces,current,isTeamspacesFetching } = this.props;
    const _this = this;
    let Search=true
    teamspaces.map((space) => {
      mode === standard
      ? space.name = space.teamName
      : space.name = space.spaceName
    })
    let selectValue = mode === standard ? current.space.teamName : (current.space.spaceName || current.space.userName)
    const ennFlowName = getFieldProps('ennFlowName', {
      rules: [
        { required: true, message:'请输入EnnFlow名称'},
        { validator: this.spaceExists },
      ]
    })
    return (
    <div id='TenxFlowDetailYaml' key='TenxFlowDetailYaml'>
      <Title title="EnnFlow" />
      <Alert type='info' message={<FormattedMessage {...menusText.tooltips} />} />
      <p className="text-center">
        <Button  type="primary" className='deleteBtn' size='large' onClick={()=> this.setState({delFlowModal: true})}>
        同步EnnFlow
        </Button>
      </p>
        <Modal title="同步EnnFlow操作" visible={this.state.delFlowModal}
          onOk={() => this.cloneEnnFlow()} onCancel={() => {this.setState({ visible:false,delFlowModal: false,namespace:'' }); setFieldsValue({ennFlowName:''})}}
          >
          <div className="modalColor">
          <Alert type='info' message='同步EnnFlow之后请修改子任务代码所关联的代码仓库以及相关的镜像仓库,镜像名称。' />
          <div className='commonBox'>
            <div className='title'>
              <span><FormattedMessage {...menusText.name} /></span>
            </div>
            <div className='input'>
              <FormItem
                hasFeedback
                help={isFieldValidating('ennFlowName') ? '校验中...' : (getFieldError('ennFlowName') || []).join(', ')}
                style={{ width:'220px' }}
              >
                <Input {...ennFlowName} placeholder="请输入EnnFlow名称" type='text' size='large' id="flowName" />
              </FormItem>
            </div>
            <div style={{ clear:'both' }} />
          </div>
          <Row type="flex">
            <Col span={5} order={1} style={{ lineHeight:'30px',color:'#000000' }}>选择空间</Col>
            <Col order={2}>
            <div className="PopSelect">
              <Popover
                content={
                  <div>
                  <Content
                  Search={Search}
                  list={teamspaces}
                  onChange={this.handleChange}
                  loading={isTeamspacesFetching}
                  special={true}
                  popTeamSelect={mode === standard}
                  isSysAdmin={this.state.isSysAdmin}
                  allUsers={this.state.allUsers}
                  />
                  </div>
                }
                trigger="click"
                visible={this.state.visible}
              >
              <div>
                
                <a onClick={()=>{_this.setState({visible:!_this.state.visible})}}>{_this.state.namespace?(_this.state.namespace=='default'?'我的空间':_this.state.namespace):'请选择空间'} <Icon type="down" /></a>
              
              </div>
                {/* <Button type="primary" onClick={()=>{this.setState({visible:true})}} >Click me</Button> */}
              </Popover>
              </div>
            </Col>
          </Row>
          </div>
        </Modal>
    </div>
    )
  }
});

function mapStateToProps(state, props) {
  const { teamClusters } = state.team
  const { teamspaces } = state.user
  const { current, loginUser } = state.entities
  return {
    current,
    isTeamspacesFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    teamClusters:(teamClusters.result ? teamClusters.result.data : []),
    loginUser: loginUser.info,
  }
}

TenxFlowDetailYaml = createForm()(TenxFlowDetailYaml)

export default connect(mapStateToProps, {
  loadTeamClustersList,loadUserTeamspaceList,loadUserList,ennflowCloneSpace
})(TenxFlowDetailYaml);
