/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * SetStageFileLink component
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Checkbox, Alert, Icon, Spin, notification } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY, DEFAULT_SHARE_DIR } from '../../../../../constants'
import { setStageLink } from '../../../../../actions/cicd_flow'
import './style/SetStageFileLink.less'
import { browserHistory } from 'react-router';

const createForm = Form.create;
const FormItem = Form.Item;

function formatSourceFile(config) {
  //this function for format source file
  if(Boolean(config.link)) {
    if(Boolean(config.link.sourceDir)) {
      return config.link.sourceDir
    } else {
      return '';
    }
  } else {
    return '';
  }
}

function formatNextFile(config) {
  //this function for format next file
  if(Boolean(config.link)) {
    if(Boolean(config.link.targetDir)) {
      return config.link.targetDir
    } else {
      return '';
    }
  } else {
    return '';
  }
}

function formatUseFileFlag(config) {
  //this function for format use file flag
  if(Boolean(config.link)) {
    if(config.link.enabled == 0) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

let SetStageFileLink = React.createClass({
  getInitialState: function() {
    return {
      useFileFlag: false
    }
  },
  componentWillMount() {
    if (this.props.config && this.props.config.link && this.props.config.link.enabled) {
      this.setState({
        useFileFlag: this.props.config.link.enabled
      })
    }
  },
  submitForm(config) {
    //this function for submit modal
    const { form, flowId, setStageLink } = this.props;
    let useFileFlag = false;
    let body = {
      enabled: 0,
      sourceDir: '',
      targetDir: ''
    }
    form.validateFields(['useFile'],(errors, values) => {
      if (!!errors) {
        return;
      }
      useFileFlag = values.useFile;
    });
    const _setStageLink = () => {
      setStageLink(flowId, config.metadata.id, config.link.target, body, {
        success: {
          func: () => {
            notification.success({messgae:'设置共享目录',description:'设置共享目录成功'});
            const { scope } = this.props;
            scope.setState({
              setStageFileModal: false
            })
            let rootScope = scope.props.scope;
            const { getTenxFlowStateList } = rootScope.props;
            getTenxFlowStateList(flowId);
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notification.error({messgae:'设置共享目录',description:'设置共享目录失败'});
          },
          isAsync: true
        }
      });
    }
    if (!useFileFlag) {
      return _setStageLink()
    }
    body.enabled = 1
    form.validateFields(['thisFile'], (errors, values) => {
      if (!!errors) {
        return;
      }
      let tempThisFile = '';
      if(values.thisFile.indexOf('/') != 0) {
        tempThisFile = '/' + values.thisFile;
      } else {
        tempThisFile = values.thisFile;
      }
      body.sourceDir = tempThisFile;
      body.targetDir = DEFAULT_SHARE_DIR
      _setStageLink()
    });
  },
  onChangeUseFile(e) {
    //this function for change the input disabled or not
    if(e.target.checked) {
      this.setState({
        useFileFlag: true
      })
    } else {
      this.setState({
        useFileFlag: false
      })
    }
  },
  closeModal() {
    //this function for close the setting modal
    const { scope, form, config } = this.props;
    form.resetFields(['useFile', 'thisFile']);
    let tempFlag = config.link.enabled == 1 ? true : false;
    this.setState({
      useFileFlag: tempFlag
    })
    scope.setState({
      setStageFileModal: false
    })
  },
  checkPath(rule, value, callback) {
    if (/^\/app\/?$/.test(value)) {
      return callback('/app 为系统目录，用于拉取项目代码，请填写其他目录')
    }
    callback()
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope, config } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const thisFileProps = getFieldProps('thisFile', {
      rules: [
        { message: '请输入当前步骤共享目录' },
        { validator: this.checkPath }
      ],
      initialValue: formatSourceFile(config),
    });
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    }
    return (
      <div id='SetStageFileLink' key='SetStageFileLink'>
        <div className='titleBox'>
          <span>设置共享目录</span>
          <Icon type='cross' onClick={this.closeModal} />
        </div>
        <Form horizontal style={{ padding: "10px 20px" }}>
          <FormItem label="是否启用共享目录" {...formItemLayout}>
            <Checkbox {...getFieldProps('useFile', {valuePropName: 'checked',initialValue: formatUseFileFlag(config), onChange: this.onChangeUseFile})}>启用共享目录</Checkbox>
          </FormItem>
          <FormItem label="当前步骤共享目录"  {...formItemLayout}>
            <Input {...thisFileProps} disabled={!this.state.useFileFlag} className='commonInput' size='large' />
          </FormItem>
          <div className='btnBox'>
            <Button size='large' type='primary' onClick={this.submitForm.bind(this, config)}>修改</Button>
            <Button size='large' type='ghost' onClick={this.closeModal}>取消</Button>
          </div>
        </Form>
      </div>
    )
  }
});

function mapStateToProps(state, props) {
  return {}
}

SetStageFileLink = createForm()(SetStageFileLink);

SetStageFileLink.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  setStageLink
})(injectIntl(SetStageFileLink, {
  withRef: true,
}));

