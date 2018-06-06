/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateVSphereModal component
 *
 * v0.1 - 2016-11-26
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Switch, Radio, Checkbox, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { createIntegration } from '../../actions/integration'
import { DEFAULT_REGISTRY } from '../../../constants'
import './style/CreateVSphereModal.less'
import { browserHistory } from 'react-router';

const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;

const menusText = defineMessages({
  name: {
    id: 'Integration.VSphereConfig.name',
    defaultMessage: 'vSphere名称',
  },
  address: {
    id: 'Integration.VSphereConfig.address',
    defaultMessage: 'vSphere地址',
  },
  user: {
    id: 'Integration.VSphereConfig.user',
    defaultMessage: '用户名',
  },
  pwd: {
    id: 'Integration.VSphereConfig.pwd',
    defaultMessage: '密码',
  },
  resetBtn: {
    id: 'Integration.VSphereConfig.resetBtn',
    defaultMessage: '重置应用',
  },
  deleteBtn: {
    id: 'Integration.VSphereConfig.deleteBtn',
    defaultMessage: '卸载应用',
  },
  finishBtn: {
    id: 'Integration.VSphereConfig.finishBtn',
    defaultMessage: '配置完成',
  },
  cancelBtn: {
    id: 'Integration.VSphereConfig.cancelBtn',
    defaultMessage: '取消',
  },
})

let CreateVSphereModal = React.createClass({
  getInitialState: function() {
    return {
      checkPwdType: 'pwd'
    }
  },
  componentWillMount() {
  },
  componentWillReceiveProps(nextProps) {
    const { createIntegrationModal } = nextProps;
    if(!createIntegrationModal) {
      this.props.form.resetFields();
    }
  },
  onChangePwdType() {
    //this function for user change the pwd type to 'password' or 'text'
    if(this.state.checkPwdType == 'pwd') {
      this.setState({
        checkPwdType: 'text'
      })
    } else {
      this.setState({
        checkPwdType: 'pwd'
      })
    }
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    scope.setState({
      createIntegrationModal: false
    });
  },
  handleSubmit(e) {
    //this function for user submit the form
    const { scope, createIntegration } = this.props;
    const { getAllIntegration } = scope.props;
    const _this = this;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        e.preventDefault();
        return;
      }
      if(values.url.indexOf('http://') > -1) {
        let temp = values.url.split('http://');
        values.url = temp[1];
      }
      if(values.url.indexOf('https://') > -1) {
        let temp = values.url.split('https://');
        values.url = temp[1];
      }
      createIntegration(values, {
        success: {
          func: () => {
            scope.setState({
              createIntegrationModal: false
            });
            getAllIntegration();
          },
          isAsync: true
        }
      })
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const configNameProps = getFieldProps('name', {
      rules: [
        { required: true, message: '请输入vSphere名称' },
      ],
    });
    const configAddressProps = getFieldProps('url', {
      rules: [
        { required: true, message: '请输入vSphere地址' },
      ],
    });
    const usernameProps = getFieldProps('username', {
      rules: [
        { required: true, message: '请输入用户名' },
      ],
    });
    const passwordProps = getFieldProps('password', {
      rules: [
        { required: true, message: '请输入密码' },
      ],
    });
    return (
      <div id='CreateVSphereModal' key='CreateVSphereModal'>
        <Form horizontal>
          <div className='commonBox'>
            <div className='titleBox'>
              <span><FormattedMessage {...menusText.name} /></span>
            </div>
            <div className='inputBox'>
              <FormItem style={{ width:'220px' }} >
                <Input {...configNameProps}  type='text' size='large' />
              </FormItem>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className='commonBox'>
            <div className='titleBox'>
              <span><FormattedMessage {...menusText.address} /></span>
            </div>
            <div className='inputBox'>
              <FormItem style={{ width:'220px' }} >
                <Input {...configAddressProps} placeholder="不需要填写地址协议类型" type='text' size='large' />
              </FormItem>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className='commonBox'>
            <div className='titleBox'>
              <span><FormattedMessage {...menusText.user} /></span>
            </div>
            <div className='inputBox'>
              <FormItem style={{ width:'220px' }} >
                <Input {...usernameProps}  type='text' size='large' />
              </FormItem>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className='commonBox'>
            <div className='titleBox'>
              <span><FormattedMessage {...menusText.pwd} /></span>
            </div>
            <div className='inputBox'>
              <FormItem style={{ width:'220px' }} >
                <Input {...passwordProps}  type={this.state.checkPwdType == 'pwd' ? 'password' : 'text' } size='large' />
                <i className='fa fa-eye' onClick={this.onChangePwdType}/>
              </FormItem>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className='bottomBox'>
            <div>
              <Button size='large' type='primary' onClick={this.handleSubmit}>
                <FormattedMessage {...menusText.finishBtn} />
              </Button>
              <Button size='large' type='ghost' onClick={this.handleReset}>
                <FormattedMessage {...menusText.cancelBtn} />
              </Button>
            </div>
          </div>
        </Form>
      </div>
    )
  }
});

function mapStateToProps(state, props) {

  return {

  }
}

CreateVSphereModal = createForm()(CreateVSphereModal);

CreateVSphereModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  createIntegration
})(injectIntl(CreateVSphereModal, {
  withRef: true,
}));

