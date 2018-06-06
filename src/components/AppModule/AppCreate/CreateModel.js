/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateModel component
 *
 * v0.1 - 2016-09-18
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card, Button, Form, Select, Menu, } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/CreateModel.less'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../../actions/user'
import { loadTeamClustersList } from '../../../actions/team'
import { setCurrent } from '../../../actions/entities'
import { MY_SPACE } from '../../../constants'
import NotificationHandler from '../../../common/notification_handler'
import image from '../../../assets/img/app/image.png'
import imageHover from '../../../assets/img/app/imageHover.png'
import appStore from '../../../assets/img/app/appStore.png'
import appStoreHover from '../../../assets/img/app/appStoreHover.png'
import composeFile from '../../../assets/img/app/composeFile.png'
import composeFileHover from '../../../assets/img/app/composeFileHover.png'

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option;

class CreateModel extends Component {
  constructor(props) {
    super(props)
    this.selectCreateModel = this.selectCreateModel.bind(this)
    this.spaceNameCheck = this.spaceNameCheck.bind(this)
    this.clusterNameCheck = this.clusterNameCheck.bind(this)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.handleClusterChange = this.handleClusterChange.bind(this)
    this.state = {
      createModel: "quick",
      linkUrl: "quick_create",
      disabled: false,
    }
  }

  componentWillMount() {
    const { loadUserTeamspaceList, form, current } = this.props
    loadUserTeamspaceList('default', { size: 1000 })
    form.setFieldsValue({
      'spaceFormCheck': current.space.namespace,
      'clusterFormCheck': current.cluster.clusterID,
    })
  }

  componentWillReceiveProps(nextProps) {
    const { form, current, loadTeamClustersList } = nextProps
    if (current.space.namespace === this.props.current.space.namespace && current.cluster.clusterID === this.props.current.cluster.clusterID) {
      return
    }
    form.setFieldsValue({
      'spaceFormCheck': current.space.namespace,
      'clusterFormCheck': current.cluster.clusterID,
    })
  }

  selectCreateModel(currentSelect) {
    //user select current create model,so that current selected model's css will be change
    let linkUrl = "";
    if (currentSelect == "quick") {
      linkUrl = "quick_create"
    } else if (currentSelect == "store") {
      linkUrl = "app_store"
    } else if (currentSelect == "layout") {
      linkUrl = "compose_file"
    }
    const parentScope = this.props.scope;
    this.setState({
      createModel: currentSelect,
      linkUrl: linkUrl
    });
    parentScope.setState({
      createModel: currentSelect
    });
  }

  spaceNameCheck(rule, value, callback) {
    if (!value) {
      this.setState({
        disabled: true
      })
      callback([new Error('请选择空间')])
      return
    }
    this.setState({
      disabled: false
    })
    callback()
  }

  clusterNameCheck(rule, value, callback) {
    if (!value) {
      this.setState({
        disabled: true
      })
      callback([new Error('请选择集群')])
      return
    }
    this.setState({
      disabled: false
    })
    callback()
  }
  
  handleSpaceChange(value) {
    const { teamspaces, loadTeamClustersList, setCurrent, form, current } = this.props
    let newTeamspaces = ([MY_SPACE]).concat(teamspaces)
    const notification = new NotificationHandler()
    newTeamspaces.map(space => {
      if (space.namespace === value) {
        loadTeamClustersList(space.teamID, { size: 100 }, {
          success: {
            func: (result) => {
              if (!result.data || result.data.length < 1) {
                notification.warn(`空间 [${space.spaceName}] 的集群列表为空，请重新选择空间·`)
                form.resetFields(['clusterFormCheck'])
                return
              }else{
                this.setState({
                  spaceName:value
                })
                
                setCurrent({
                  space,
                  cluster:result.data[0],
                  team: {
                    teamID: space.teamID
                  }
                })
              }
              form.setFieldsValue({
                'clusterFormCheck': result.data[0].clusterID,
              })
            },
            isAsync: true
          }
        })
      }
    })
  }

  handleClusterChange(value) {
    const { teamClusters, setCurrent } = this.props
    teamClusters.map((cluster) => {
      if (cluster.clusterID === value) {
        setCurrent({
          cluster
        })
      }
    })
  }

  handleNextStep(linkUrl, e) {
    e.preventDefault()
    const { form } = this.props
    const { validateFields, resetFields } = form
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const url = `/app_manage/app_create/${linkUrl}`
      browserHistory.push(url)
    })
  }
  
  render() {
    const {
      form,
      isTeamspacesFetching,
      teamspaces,
      isTeamClustersFetching,
      teamClusters
    } = this.props
    const { getFieldProps, getFieldValue, getFieldError, isFieldValidating } = form
    const { createModel, linkUrl} = this.state
    
    const spaceFormCheck = getFieldProps('spaceFormCheck', {
      rules: [
        { validator: this.spaceNameCheck }
      ],
      onChange: this.handleSpaceChange
    })
    const clusterFormCheck = getFieldProps('clusterFormCheck', {
      rules: [
        { validator: this.clusterNameCheck }
      ],
      onChange: this.handleClusterChange
    })
    return (
      <QueueAnim
        id="CreateModel"
        type="right"
        >
        <div className="CreateModel" key="CreateModel">
          <div className="topBox">
            <div className="contentBox">
              <div className={createModel == "quick" ? "fastCreate commonBox selectedBox" : "fastCreate commonBox"} onClick={this.selectCreateModel.bind(this, "quick")}>
                <img src={createModel == "quick" ? imageHover : image} />
                <div className="infoBox">
                  <p>镜像仓库</p>
                  <span>通过镜像仓库创建应用</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
               <div className={createModel == "store" ? "appStore commonBox selectedBox" : "appStore commonBox"} onClick={this.selectCreateModel.bind(this, "store")}>
                <img src={createModel == "store" ? appStoreHover : appStore} />
                <div className="infoBox">
                  <p>应用商店</p>
                  <span>通过应用商店创建有状态应用</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className={createModel == "layout" ? "layout commonBox selectedBox" : "layout commonBox"} onClick={this.selectCreateModel.bind(this, "layout")}>
                <img src={createModel == "layout" ? composeFileHover : composeFile} />
                <div className="infoBox">
                  <p>编排文件</p>
                  <span>通过编排文件创建应用</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div style={{ clear: "both" }}></div>

            </div>
          </div>
          <div className="envirBox">
            <Form>
              <FormItem hasFeedback key="space" style={{ minWidth: '220px' }}>
                <span>部署环境</span>
                <Select size="large"
                  placeholder="请选择空间"
                  style={{ width: 150,float:'left' }}
                  {...spaceFormCheck}>
                  <Option value="default">我的空间</Option>
                  {
                    teamspaces.map(space => {
                      return (
                        <Option key={space.namespace} value={space.namespace}>
                          {space.spaceName}
                        </Option>
                      )
                    })
                  }
                </Select>
              </FormItem>
              <FormItem hasFeedback key="cluster">
                <Select size="large"
                  placeholder="请选择集群"
                  style={{ width: 150 }}
                  {...clusterFormCheck}>
                  {
                    teamClusters.map(cluster => {
                      return (
                        <Option key={cluster.clusterID} value={cluster.clusterID}>
                          {cluster.clusterName}
                        </Option>
                      )
                    })
                  }
                </Select>
              </FormItem>
            </Form>
          </div>
          <div className="bottomBox">
            <Link to="/app_manage">
              <Button size="large">
                取消
              </Button>
            </Link>
            <Button onClick={this.handleNextStep.bind(this, this.state.linkUrl)} size="large" type="primary" disabled={this.state.disabled}>
              下一步
            </Button>
          </div>
        </div>
      </QueueAnim>
    )
  }
}

CreateModel.propTypes = {
  // Injected by React Router
}
CreateModel = createForm()(CreateModel)

function mapStateToProps(state, props) {
  const { current } = state.entities
  const { teamspaces } = state.user
  const { teamClusters } = state.team
  return {
    current,
    isTeamspacesFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    isTeamClustersFetching: teamClusters.isFetching,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList,
  loadTeamClustersList,
  setCurrent,
})(CreateModel)