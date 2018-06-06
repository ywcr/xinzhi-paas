/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CICDSettingModal component
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Checkbox, Alert, Icon, Spin, Tooltip,DatePicker,TimePicker,Select } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import moment from 'moment'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { UpdateTenxflowCIRules } from '../../../../../actions/cicd_flow'
import './style/CICDSettingModal.less'
import { browserHistory } from 'react-router';
import NotificationHandler from '../../../../../common/notification_handler'

const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;
const REG_EXP = 'RegExp'

const menusText = defineMessages({
  tooltip: {
    id: 'CICD.Tenxflow.CICDSettingModal.tooltip',
    defaultMessage: '当该子任务对应的代码仓库，发生下面的操作时触发持续集成',
  },
  branch: {
    id: 'CICD.Tenxflow.CICDSettingModal.branch',
    defaultMessage: '提交代码到branch',
  },
  tag: {
    id: 'CICD.Tenxflow.CICDSettingModal.tag',
    defaultMessage: '新建tag',
  },
  time: {
    id: 'CICD.Tenxflow.CICDSettingModal.time',
    defaultMessage: '定时执行',
  },
  request: {
    id: 'CICD.Tenxflow.CICDSettingModal.request',
    defaultMessage: '新建一个合并请求 Merge Request（或 Pull Request）',
  },
  cancel: {
    id: 'CICD.Tenxflow.CICDSettingModal.cancel',
    defaultMessage: '取消',
  },
  submit: {
    id: 'CICD.Tenxflow.CICDSettingModal.submit',
    defaultMessage: '确定',
  },
  cicdTitle: {
    id: 'CICD.Tenxflow.CICDSettingModal.cicdTitle',
    defaultMessage: '持续集成触发规则',
  },
})

function checkBranchInit(config) {
  //this function for user check branch is used or not
  if(Boolean(config.config)) {
    if(Boolean(config.config.branch)) {
      return config.config.branch;
    }
    return '';
  }
  return '';
}

function checkTagInit(config) {
  //this function for user check tag is used or not
  if(Boolean(config.config)) {
    if(Boolean(config.config.tag)) {
      return config.config.tag;
    }
    return '';
  }
  return '';
}
function checkBranchUsed(config) {
  //this function for check the branch is used or not

}

let CICDSettingModal = React.createClass({
  getInitialState: function () {
    return {
      useBranch: false,
      useTag: false,
      useRequest: false,
      editBranch: false,
      editTag: false,
      crontabTime:'',
      branch:'',
      time:false,
      oldConfig: {}
    }
  },
  componentWillMount() {
    const {isFetching, ciRules} = this.props;
    if(!isFetching) {
      if(Boolean(ciRules)) {
        let config = ciRules.results;
        this.setState({
          oldConfig:config
        })
        if(config.config.branch.name) {
          this.setState({
            useBranch: true
          });
        }
        if(config.config.tag.name) {
          this.setState({
            useTag: true
          });
        }
        if(config.config.crontab.enabled) {
          this.setState({
            time: config.config.crontab.enabled==1?true:false,
            crontabTime: config.config.crontab.crontabTime,
            initTime:moment(config.config.crontab.crontabTime).format('HH:mm:ss'),
            branch:config.config.crontab.branch
          });
        }
        // if(config.config.merge_request) {
        //   this.setState({
        //     useRequest: true
        //   });
        // }
        if (config.config.mergeRequest) {
          this.setState({
            useRequest: true
          });
        } else {
          this.setState({
            useRequest: false
          });
        }
      }
    }
  },
  componentWillReceiveProps(nextProps) {
    const { isFetching, ciRules, visible } = nextProps;
    if (this.props.isFetching != isFetching || (nextProps.visible && this.props.visible != nextProps.visible)) {
      if (Boolean(ciRules)) {
        let config = ciRules.results;
        this.setState({
          oldConfig:config
        })
        if (!Boolean(config.config)) {
          return;
        }
        if (config.config.branch.name) {
          this.setState({
            useBranch: true
          });
        } else {
          this.setState({
            useBranch: false
          });
        }
        if (config.config.tag.name) {
          this.setState({
            useTag: true
          });
        } else {
          this.setState({
            useTag: false
          });
        }
        if (config.config.mergeRequest) {
          this.setState({
            useRequest: true
          });
        } else {
          this.setState({
            useRequest: false
          });
        }
      }
    }
  },
  onChangeUseBranch(e) {
    //this function for use branch or not
    this.setState({
      useBranch: e.target.checked
    });
    if(e.target.checked) {
      this.setState({
        editBranch: true
      });
      setTimeout(function() {
        document.getElementById('branchInput').focus()
      },100)
    } else {
      this.setState({
        editBranch: false
      });
    }
  },
  onChangeUseTag(e) {
    //this function for use tag or not
    this.setState({
      useTag: e.target.checked
    });
    // document.getElementById('tagInput').focus()
    if(e.target.checked) {
      this.setState({
        editTag: true
      });
      setTimeout(function() {
        document.getElementById('tagInput').focus()
      },100)
    } else {
      this.setState({
        editTag: false
      });
    }
  },
  onEditBranch() {
    //this function for edit branch
    if(this.state.useBranch ) {
      this.setState({
        editBranch: true,
        noBranch: false
      });
      setTimeout(function() {
        document.getElementById('branchInput').focus()
      },100)
    } else {
      this.setState({
        editBranch: false
      });
    }
  },
  onEditTag() {
    //this function for edit tag
    if(this.state.useTag) {
      this.setState({
        editTag: true,
        noTag: false
      });
      setTimeout(function() {
        document.getElementById('tagInput').focus()
      },100)
    } else {
      this.setState({
        editTag: false
      });
    }
  },
  onCancelEditBranch() {
    //this function for cancel edit branch
    const { setFieldsValue } = this.props.form
    const { oldConfig } = this.state;
    this.setState({
      editBranch: false,
    },()=>{
      setFieldsValue({
        'branch': oldConfig.config.branch.name,
        'isBranchReg': oldConfig.config.branch.matchWay
      })
    });
  },
  onCancelEditTag() {
    //this function for cancel edit tag
    const { setFieldsValue } = this.props.form
    const { oldConfig } = this.state;
    this.setState({
      editTag: false,
    },()=>{
      setFieldsValue({
        'tag': oldConfig.config.tag.name,
        'isTagReg': oldConfig.config.tag.matchWay
      })
    });
  },
  /*onBlurBranch() {
    //this function for the branch input on blur take the input disable
    this.setState({
      editBranch: false
    })
  },
  onBlurTag() {
    //this function for the tag input on blur take the input disable
    this.setState({
      editTag: false
    })
  },*/
  onChangeUseRequest(e) {
    //this function for user change use merge request or not
    this.setState({
      useRequest: e.target.checked
    })
  },
  onChangeUseTime(e) {
    //this function for user change use merge request or not
    this.setState({
      time: e.target.checked
    })
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    this.setState({
      useBranch: false,
      useTag: false,
      useRequest: false,
      crontabTime:'',
      initTime:'',
      editBranch: false,
      branch:'',
      editTag: false,
      time:false,
      noBranch: false,
      noTag: false
    });
    scope.setState({
      cicdSetModalShow: false
    });
  },
  handleSubmit(e) {
    //this function for user submit the form
    const { scope, UpdateTenxflowCIRules, flowId, form ,project} = this.props;
    const { validateFields, getFieldValue } = form
    const _this = this;
    const { useBranch, useTag, useRequest,time,crontabTime } = this.state;
    let branchInput = null;
    let tagInput = null;
    let checkFlag = true;
    this.setState({
      noBranch: false,
      tagInput: false
    })

    if(useBranch) {
      validateFields(['branch'],(errors, values) => {
        if (!!errors) {
          e.preventDefault();
          checkFlag = false;
          _this.setState({
            noBranch: true
          });
          return;
        }
        branchInput = values;
      });
      branchInput.matchWay = getFieldValue('isBranchReg')
    }
    if(useTag) {
      validateFields(['tag'],(errors, values) => {
        if (!!errors) {
          e.preventDefault();
          checkFlag = false;
          _this.setState({
            noTag: true
          });
          return;
        }
        tagInput = values;
      });
      tagInput.matchWay = getFieldValue('isTagReg')
    }
    if(!checkFlag) {
      return;
    }
    if(!useBranch && !useTag && !useRequest &&!time){
      let notification = new NotificationHandler();
      return notification.error('请选择至少一个触发规则')
    }
    const _config = scope.props.config.spec.ci.config || {}
    let body = {
      enabled: 1,
      config: {
        branch: null,
        tag: null,
        mergeRequest: null,
        buildCluster: _config.buildCluster
      }
    }
    if(useBranch) {
      body.config.branch = {
        name: branchInput.branch,
        matchWay: branchInput.matchWay && REG_EXP,
      }
    }
    if(useTag) {
      body.config.tag = {
        name: tagInput.tag,
        matchWay: tagInput.matchWay && REG_EXP,
      }
    }
    if(time) {
      if(crontabTime!=''){
        let branches = ''
        validateFields(['branchs'],(errors, values) => {
          if (!!errors) {
            e.preventDefault();
            return;
          }
          branches = values;
        });
        
        body.config.crontab = {
          enabled:time?1:0,
          crontabTime:time?moment(crontabTime).format():'',
          branch:project.repoType == "SVN" ? '' : branches.branchs,
          repoType:project.repoType
        }
      }else{
        let notification = new NotificationHandler();
        notification.error('请选择执行时间')
        return false;
      }
    }
    if(useRequest) {
      body.config.mergeRequest = useRequest;
    }
    scope.setState({
      cicdSetModalShow: false,
      ciRulesOpened: true
    });
    UpdateTenxflowCIRules(flowId, body, {
      success: {
        func: () => {
          scope.ciRulesChangeSuccess()
          _this.setState({
            useBranch: false,
            useTag: false,
            useRequest: false,
            editBranch: false,
            editTag: false,
            time:false,
            branch:'',
            crontabTime:'',
          })
        },
        isAsync: true
      }
    })
  },
  setTime(data){
    this.setState({
      crontabTime:data,
      initTime:''
    })
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope, isFetching, ciRules,branch,project  } = this.props;
    const { oldConfig, editBranch, editTag,time } = this.state;
    const _this = this;
    if(isFetching || !Boolean(ciRules) ) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let selectBranch = ''
    if(branch.length>0){
      selectBranch = branch.map((item)=>{
        return <Option value={item.branch}>{item.branch}</Option>
      })
    }
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const disabledDate = function (current) {
      // can not select days after today
      return current && current.getTime() < Date.now() - 8.64e7;
    };
    const branchProps = getFieldProps('branch', {
      rules: [
        { required: true, message: '请输入Branch名称' },
      ],
      initialValue: checkBranchInit(ciRules.results).name,
    });
    const isBranchRegProps = getFieldProps('isBranchReg', {
      valuePropName: 'checked',
      initialValue: checkBranchInit(ciRules.results).matchWay === REG_EXP,
    })
    const tagProps = getFieldProps('tag', {
      rules: [
        { required: true, message: '请输入Tag名称' },
      ],
      initialValue: checkTagInit(ciRules.results).name,
    });
    const branchs = getFieldProps('branchs', {
      rules: [
        { required: true, message: '请选择分支' },
      ],
      initialValue: _this.state.branch?_this.state.branch:project.branch,
    });
    const isTagRegProps = getFieldProps('isTagReg', {
      valuePropName: 'checked',
      initialValue: checkTagInit(ciRules.results).matchWay === REG_EXP,
    })
    return (
    <Form horizontal>
      <div id='CICDSettingModal' key='CICDSettingModal'>
        <div className='titleBox'>
          <span><FormattedMessage {...menusText.cicdTitle} /></span>
          <Icon type='cross' onClick={this.handleReset} />
        </div>
        <div className='paddingBox'>
          <Alert message={<FormattedMessage {...menusText.tooltip} />} type='info' />
            <div className='branch commonBox'>
              <div className='checkBox'>
                <FormItem>
                  <Checkbox onChange={this.onChangeUseBranch} checked={this.state.useBranch}><FormattedMessage {...menusText.branch} /></Checkbox>
                </FormItem>
              </div>
              <div className='inputBox'>
                <FormItem style={{ width:'300px',float:'left',marginRight:'18px' }}>
                  <Input
                    className={ this.state.noBranch ? 'noBranchInput' : '' }
                    key='branchInput'
                    {...branchProps}
                    type='text'
                    id='branchInput'
                    size='large'
                    disabled={ (!this.state.editBranch) }
                    placeholder="branch名称，支持正则表达式，如：^feature.*"
                  />
                    { this.state.noBranch ? [<span className='noValueSpan'>请输入Branch名称</span>] : null}
                </FormItem>
                <FormItem style={{ width:'80px', float:'left' }}>
                  <Checkbox {...isBranchRegProps} disabled={!this.state.editBranch}>正则</Checkbox>
                </FormItem>
                {
                  !this.state.editBranch ? [
                    <i className='fa fa-pencil-square-o' onClick={this.onEditBranch} />
                  ] : [
                    <Button size='large' onClick={()=>this.onCancelEditBranch()}><FormattedMessage {...menusText.cancel} /></Button>
                  ]
                }
                <div style={{ clear:'both' }}></div>
              </div>
            </div>
            <div className='tag commonBox'>
              <div className='checkBox'>
                <FormItem>
                  <Checkbox onChange={this.onChangeUseTag} checked={this.state.useTag}><FormattedMessage {...menusText.tag} /></Checkbox>
                </FormItem>
              </div>
              <div className='request inputBox'>
                <FormItem style={{ width:'300px',float:'left',marginRight:'18px' }}>
                  <Input
                    className={ this.state.noTag ? 'noTagInput' : '' }
                    key='tagInput'
                    {...tagProps}
                    type='text'
                    id='tagInput'
                    size='large'
                    disabled={ !this.state.editTag}
                    placeholder="tag名称，支持正则表达式，如：^feature.*"
                  />
                  { this.state.noTag ? [<span className='noValueSpan'>请输入Tag名称</span>] : null}
                </FormItem>
                <FormItem style={{ width:'80px', float:'left' }}>
                  <Checkbox {...isTagRegProps} disabled={!this.state.editTag}>正则</Checkbox>
                </FormItem>
                {
                  !this.state.editTag ? [
                    <i className='fa fa-pencil-square-o' onClick={this.onEditTag} />
                  ] : [
                    <Button size='large' onClick={this.onCancelEditTag}><FormattedMessage {...menusText.cancel} /></Button>
                  ]
                }
                <div style={{ clear:'both' }}></div>
              </div>
            </div>
            <div className='commonBox'>
              <div className='checkBox'>
                <FormItem>
                  <Checkbox onChange={this.onChangeUseRequest} checked={this.state.useRequest}><FormattedMessage {...menusText.request} /></Checkbox>
                </FormItem>
              </div>
            </div>
            <div className='time commonBox'>
              <div className='checkBox'>
                <FormItem>
                  <Checkbox onChange={this.onChangeUseTime} checked={this.state.time}><FormattedMessage {...menusText.time} /></Checkbox>
                  <TimePicker value={this.state.initTime?this.state.initTime:this.state.crontabTime} disabled={!time} onChange={this.setTime}/>
                  <Select {...branchs} disabled={!time} id="select" size="large" placeholder="请选择分支" style={{ width: 120,display:'inline-block' }} >
                    {selectBranch}
                  </Select>
                </FormItem>
              </div>
            </div>
        </div>
        <div className='BtnBox'>
          <Button size='large' onClick={this.handleReset}>
            <FormattedMessage {...menusText.cancel} />
          </Button>
          <Button size='large' type='primary' onClick={this.handleSubmit}>
            <FormattedMessage {...menusText.submit} />
          </Button>
        </div>
      </div>
    </Form>
    )
  }
});

function mapStateToProps(state, props) {

  return {

  }
}

CICDSettingModal = createForm()(CICDSettingModal);

CICDSettingModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  UpdateTenxflowCIRules
})(injectIntl(CICDSettingModal, {
  withRef: true,
}));

