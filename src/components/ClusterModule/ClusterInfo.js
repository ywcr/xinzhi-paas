/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster info list component
 *
 * v0.1 - 2017-2-24
 * @author BaiYu
 * v0.1 - 2017-4-28
 * @modifier XuLongcheng
 */
import React from 'react'
import { Icon, Button, Card, Form, Input, Tooltip, Spin, Modal, Dropdown, Menu, Checkbox } from 'antd'
import { updateCluster, loadClusterList, deleteCluster, updateClusterConfig } from '../../actions/cluster'
import NotificationHandler from '../../common/notification_handler'
import { connect } from 'react-redux'
import clusterImg from '../../assets/img/integration/cluster.png'
import { IP_REGEX, HOST_REGEX, EMAIL_REG_EXP } from '../../../constants'

let saveBtnDisabled = true

let ClusterInfo = React.createClass ({
  getInitialState() {
    return {
      editCluster: false, // edit btn
      saveBtnLoading: false,
      deleteClusterModal: false,
      deleteClusterBtnLoading: false,
      selectBuilderEnvironmentModal: false,
      selectedBuilderEnvironment:false,
      checkbox: true
    }
  },
  checkValue(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写用户名')])
      return
    }
    if (value.indexOf('@') > -1) {
      if (!EMAIL_REG_EXP.test(value)) {
        callback([new Error('邮箱地址填写错误')])
        return
      }
      callback()
      return
    }
    callback()
  },
  APIupdateCluster(clusterID, values){
    const { updateCluster, loadClusterList } = this.props
    const notification = new NotificationHandler()
    if(values.isDefault || loadClusterList.length == 1){
      values.isDefault = 1
    } else {
      values.isDefault = 0
    }
    updateCluster(clusterID, values, {
      success: {
        func: result => {
          notification.success(`更新集群信息成功`)
          loadClusterList(null, {
            finally: {
              func: () => {
                this.setState({
                  saveBtnLoading: false,
                  editCluster: false,
                })
              }
            }
          })
        },
        isAsync: true
      },
      failed: {
        func: err => {
          notification.error(`更新集群信息失败`)
          this.setState({
            saveBtnLoading: false,
          })
        },
        isAsync: true
      }
    })
  },
  updateCluster(e) {
    e.preventDefault()
    const { form, updateCluster, cluster, loadClusterList, updateClusterConfig, clusterList } = this.props
    const { validateFields, resetFields } = form
    const { isBuilder } = cluster
    const notification = new NotificationHandler()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        saveBtnLoading: true,
      })
      if(values.agreement){
        updateClusterConfig(cluster.clusterID,{IsBuilder:1},{
          success:{
            func : () => {
              for(let i=0;i<clusterList.length;i++){
                if(clusterList[i].isBuilder == true){
                  updateClusterConfig(clusterList[i].clusterID,{IsBuilder:2},{
                    success:{
                      func:() => {
                        this.APIupdateCluster(cluster.clusterID, values)
                      },
                      isAsync: true,
                    }
                  })
                }
              }
            },
            isAsync: true,
          },
          failed:{
            func: err => {
              notification.error(`更新集群信息失败`)
              this.setState({
                selectedBuilderEnvironment: false,
                saveBtnLoading: false,
                editCluster: false,
              })
            },
            isAsync: true,
          }
        })
        return
      }
      this.APIupdateCluster(cluster.clusterID, values)
    })
  },
  deleteCluster() {
    const { cluster } = this.props
    const { isBuilder } = cluster
    if(isBuilder){
      this.deleteClusterWhenIsBuilderEnvironmentModal()
      return
    }
    this.setState({
      deleteClusterModal: true,
    })
  },
  confirmDeleteCluster() {
    const { deleteCluster, cluster, loadClusterList } = this.props
    const notification = new NotificationHandler()
    this.setState({
      deleteClusterBtnLoading: true,
    })
    deleteCluster(cluster.clusterID, {
      success: {
          func: result => {
            notification.success(`删除集群“${cluster.clusterName}”成功`)
            loadClusterList(null, {
              finally: {
                func: () => {
                  this.setState({
                    deleteClusterModal: false,
                    deleteClusterBtnLoading: false,
                  })
                }
              }
            })
          },
          isAsync: true
        },
        failed: {
          func: err => {
            let { message } = err
            if (typeof message !== 'string') {
              message = ''
            }
            notification.error(`删除集群“${cluster.clusterName}”失败`, message)
            this.setState({
              deleteClusterBtnLoading: false,
            })
          },
          isAsync: true
        }
    })
  },
  eidtClusterBuilderEnvironment(){
    const { cluster, form } = this.props
    const { getFieldProps, setFieldsValue } = form
    const { isBuilder } = cluster
    const agreementProps = getFieldProps('agreement', {
      rules: [
        { required: false, message: '请选择' },
      ],
      valuePropName: 'checked',
      onChange: e => {
        this.selectBuilderEnvironment()
      }
    })
    if(this.clusterListLength().length == 1){
      return <span><Checkbox style={{marginRight:'4px' }}  onClick={this.cancleClusterWhenOnlyOneClusterModal} checked={true}></Checkbox>该集群用来作为构建镜像的环境</span>
    }
    if(isBuilder){
      return <span><Checkbox style={{marginRight:'4px' }}  onClick={this.checkBuilderEnvironment} checked={this.state.checkbox}></Checkbox>该集群用来作为构建镜像的环境</span>
    }
    return <div><Form.Item style={{width:'18px',float:'left'}}><Checkbox {...agreementProps} checked={this.state.selectedBuilderEnvironment}></Checkbox></Form.Item><span>该集群用来作为构建镜像的环境</span></div>
  },
  deleteClusterWhenIsBuilderEnvironmentModal(){
    Modal.info({
      title: '不可删除该集群',
      content: (
        <div>
          <p>此集群为构建环境集群，需选择另一个集群作为构建环境后方可删除此集群</p>
        </div>
      ),
      onOk() {},
    });
  },
  cancleClusterWhenOnlyOneClusterModal(){
    Modal.info({
      title: '提示',
      content: (
        <div>
          <p>由于目前只有一个集群，不可取消构建环境</p>
        </div>
      ),
      onOk() {},
    });
  },
  CancelClusterMemberOnlyOne(){
    Modal.info({
      title: '提示',
      content: (
        <div>
          <p>由于目前只有一个集群，不可取消成员授权</p>
        </div>
      ),
      onOk() {},
    });
  },
  selectBuilderEnvironment(){
    this.setState({
      selectBuilderEnvironmentModal: true
    })
  },
  confirmSelectCurrentCluster(){
    this.setState({
      selectBuilderEnvironmentModal: false,
      selectedBuilderEnvironment: true
    })
  },
  cancleSelectCurrentCluster(){
    this.setState({
      selectBuilderEnvironmentModal: false,
      selectedBuilderEnvironment:false
    })
  },
  checkBuilderEnvironment(){
    const { cluster } = this.props
    const { clusterName } = cluster
    Modal.info({
      title: '不可直接取消构建环境',
      content: (
        <div>
          <p>选择其他集群作为构建环境后，即可自动取消该集群 [ {clusterName} ] 作为构建集群</p>
        </div>
      ),
      onOk() {},
    });
  },
  clusterListLength(){
    const { clusterList } = this.props
    let length = 0
    let currentClusterName = ''
    if(clusterList){
      length = clusterList.length
      for(let i=0; i<clusterList.length; i++){
        if(clusterList[i].isBuilder ==true){
          currentClusterName = clusterList[i].clusterName
        }
      }
    }
    return { length, currentClusterName }
  },
  eidtFasleCheckbox(){
    const { cluster } = this.props
    const { isBuilder } = cluster
    if(isBuilder){
      return <Checkbox disabled style={{marginRight:'4px' }} checked={true}></Checkbox>
    }
    return <Checkbox disabled style={{marginRight:'4px' }} checked={false}></Checkbox>
  },
  render () {
    const { cluster, form, clusterList } = this.props
    const { editCluster, saveBtnLoading } = this.state
    const { getFieldProps } = form
    let {
      clusterName, apiHost, apiProtocol,
      apiVersion, bindingIPs, bindingDomains,
      description, apiToken, isOk, isBuilder, isDefault
    } = cluster
    const apiUrl = `${apiProtocol}://${apiHost}`
    bindingIPs = parseArray(bindingIPs).join(', ')
    bindingDomains = parseArray(bindingDomains).join(', ')
    const nameProps = getFieldProps('clusterName',{
      rules: [
        {
          required: true,
          message: '输入集群名称',
        },
        {
          validator: (rule, value, callback) => {
            if (value && value.length > 30) {
              return callback([new Error('集群名称不能超过30个字符')])
            }
            callback()
          }
        }
      ],
      initialValue: clusterName
    });
    const descProps = getFieldProps('description',{
      rules: [
        { required: false },
      ],
      initialValue: description
    });
    const authorizedProps = getFieldProps('isDefault', {
      rules: [
        { required: false, message: '请选择' },
      ],
      initialValue: isDefault,
      valuePropName: 'checked',
    })
    const dropdown = (
      <Menu onClick={this.deleteCluster} style={{ width: "100px" }} >
        <Menu.Item>
          删除集群
        </Menu.Item>
      </Menu>
    );
    return (
      <Card className="ClusterInfo">
        <div className="h3">集群信息
          { !editCluster ?
          <Dropdown.Button overlay={dropdown} type="ghost" style={{float:'right',marginTop:'6px'}} onClick={()=> this.setState({editCluster: true,selectedBuilderEnvironment:isBuilder})}>
            编辑集群
          </Dropdown.Button>

          :
          <div style={{float:'right'}}>
            <Button
              onClick={()=> {
                this.setState({editCluster: false, saveBtnLoading: false,selectedBuilderEnvironment:isBuilder})
                saveBtnDisabled = true
              }}>
              取消
            </Button>
            <Button
              loading={saveBtnLoading}
              disabled={saveBtnDisabled}
              type="primary" style={{marginLeft:'8px'}}
              onClick={this.updateCluster}>
              保存
            </Button>
          </div>
          }
        </div>
        <div className="imgBox">
          <img src={clusterImg}/>
        </div>
        <Form className="clusterTable" style={{padding:'35px 0',textAlign:'left'}}>
          <div className="formItem">
            <Form.Item >
              <div className="h4 blod">集群名称：</div>
              { editCluster ?
                <Input {...nameProps} placeholder="输入集群名称" />
                :
                <div className="blod cluserName textoverflow">{clusterName}</div>
              }
            </Form.Item>
            <Form.Item>
              <div className="h4">API Server：</div>
              <div className="textoverflow">{apiUrl}</div>
            </Form.Item>
            <Form.Item>
              <div className="h4">API Token：</div>
              <Tooltip title={apiToken} placement="topLeft">
                <div className="textoverflow" style={{cursor: 'pointer'}}>{apiToken}</div>
              </Tooltip>
            </Form.Item>
          </div>
          <div className="formItem">
            <Form.Item>
              <div className="h4 blod">&nbsp;</div>
            </Form.Item>
            <Form.Item style={{textAlign:'left'}}>
              <span className="h5" style={{verticalAlign:'top',lineHeight:'30px'}}>状态：&nbsp;&nbsp;</span>
              {
                isOk
                ? <span style={{ color: '#33b867' }}><i className="fa fa-circle"></i> 正常</span>
                : <span style={{ color: '#f23e3f' }}><i className="fa fa-circle"></i> 异常</span>
              }
            </Form.Item>
            <Form.Item>
              <div style={{float:'left',height:'40px'}}>构建环境：</div>
                {
                  editCluster
                    ? this.eidtClusterBuilderEnvironment()
                    : <span>{this.eidtFasleCheckbox()}该集群用来作为构建镜像的环境</span>
                }
            </Form.Item>
          </div>
          <div className="formItem">
            <Form.Item>
              <div className="h4 blod">&nbsp;</div>
            </Form.Item>
            <Form.Item>
              <div style={{float:'left',height:'40px'}}>授权成员：</div>
              <span>
                {
                  clusterList.length == 1
                  ? <Checkbox checked={true} disabled={!editCluster} onClick={this.CancelClusterMemberOnlyOne}>该集群可被所有成员选择使用</Checkbox>
                  : <Checkbox disabled={!editCluster} {...authorizedProps}>该集群可被所有成员选择使用</Checkbox>
                }
              </span>
            </Form.Item>
            <Form.Item>
              <span className="h5" style={{display: 'inline-block',verticalAlign:'top',lineHeight:'30px'}}>描述：&nbsp;&nbsp;</span>
              { editCluster ?
              <Input {...descProps} type="textarea" placeholder="添加描述" defaultValue={description} />
              :
              <Input value={description || '-'} autosize={{minRows: 2, maxRows: 4}} type="textarea" disabled={true}  style={{width:'70%'}}/>
              }
            </Form.Item>
          </div>
        </Form>
        <Modal title={`删除集群`}
          confirmLoading={this.state.deleteClusterBtnLoading}
          className='deleteClusterModal'
          visible={this.state.deleteClusterModal}
          onOk={this.confirmDeleteCluster}
          onCancel={() => this.setState({deleteClusterModal: false})}>
          <div style={{ color: '#00a0ea', height: "50px" }}>
            <Icon type='exclamation-circle-o' />
            &nbsp;&nbsp;&nbsp;确定要删除“{clusterName}”？
          </div>
          {
            this.clusterListLength().length == 1
              ? <div>
                  <div className="note">提示：</div>
                  <div className="note"><span style={{border:'1px solid red',borderRadius:'50%',width:'14px',height:"14px",display:'inline-block',lineHeight:'14px',textAlign:'center'}}>1</span>、该操作会导致将选中的集群与当前控制台Portal解绑，完全脱离当前控制台的管理，但不影响该集群的容器应用等的运行状态。</div>
                  <div className="note"><span style={{border:'1px solid red',borderRadius:'50%',width:'14px',height:"14px",display:'inline-block',lineHeight:'14px',textAlign:'center'}}>2</span>、删除集群后将没有构建环境，导致构建镜像功能无法正常使用。</div>
            </div>
              :  <div className="note">注意：请确认执行删除集群操作！
              该操作会导致将选中的集群与当前控制台Portal解绑，完全脱离当前控制台的管理，但不影响该集群的容器应用等的运行状态。</div>
          }
        </Modal>
        <Modal
          title={`提示`}
          visible={this.state.selectBuilderEnvironmentModal}
          onOk={this.confirmSelectCurrentCluster}
          onCancel={this.cancleSelectCurrentCluster}
        >
          <div style={{color:"#00a0ea"}}><i className="fa fa-question-circle-o" aria-hidden="true" style={{marginRight:'12px'}}></i>目前只支持一个集群作为构建环境，是否确定取消集群 [ {this.clusterListLength().currentClusterName} ] 作为构建环境，并选择集群 [ {clusterName} ] 作为构建环境</div>
        </Modal>
      </Card>
    )
  }
})

function parseArray(array) {
  try {
    array = JSON.parse(array)
  } catch (error) {
    array = []
  }
  return array
}

function formChange(porps, fileds) {
  saveBtnDisabled = false
}

ClusterInfo = Form.create({
  onFieldsChange: formChange
})(ClusterInfo)

function mapStateToProps(state, props) {
  const { cluster } = state
  let clusterList = cluster.clusters.clusterList || []
  return {
    clusterList
  }
}

export default connect(mapStateToProps, {
  updateCluster,
  loadClusterList,
  deleteCluster,
  updateClusterConfig
})(ClusterInfo)
