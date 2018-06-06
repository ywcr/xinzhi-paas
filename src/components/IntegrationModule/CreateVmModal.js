/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateVmModal component
 *
 * v0.1 - 2016-11-26
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Switch, Radio, Checkbox, Spin, Select, Tooltip } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getCloneVmConfig, createIntegrationVm } from '../../actions/integration'
import './style/CreateVmModal.less'
import NotificationHandler from '../../common/notification_handler'

const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;

const menusText = defineMessages({
  templateTitle: {
    id: 'Integration.CreateVmModal.templateTitle',
    defaultMessage: '选择虚拟机模板',
  },
  name: {
    id: 'Integration.CreateVmModal.name',
    defaultMessage: '虚拟机名称',
  },
  resourcePool: {
    id: 'Integration.CreateVmModal.resourcePool',
    defaultMessage: '计算资源池',
  },
  datastores: {
    id: 'Integration.CreateVmModal.datastores',
    defaultMessage: '存储资源池',
  },
  finishBtn: {
    id: 'Integration.CreateVmModal.finishBtn',
    defaultMessage: '配置完成',
  },
  cancelBtn: {
    id: 'Integration.CreateVmModal.cancelBtn',
    defaultMessage: '取消',
  },
})

function diskFormat(num) {
  if (num < 1024) {
    return num + 'MB'
  }
  num = parseInt(num / 1024);
  if (num < 1024) {
    return num + 'GB'
  }
  num = parseInt(num / 1024);
  return num + 'TB'
}

let CreateVmModal = React.createClass({
  getInitialState: function () {
    return {
      template: null,
      resourcePool: null,
      datastore: null,
      vm: null,
      templateError: false,
      vmError: false,
      resourcePoolError: false,
      datastoreError: false
    }
  },
  componentWillMount() {
    const { getCloneVmConfig, integrationId, currentDataCenter } = this.props;
    getCloneVmConfig(integrationId, currentDataCenter)
  },
  componentWillReceiveProps(nextProps) {
    const { createIntegrationModal, currentDataCenter, getCloneVmConfig, integrationId } = nextProps;
    if (!createIntegrationModal) {
      this.props.form.resetFields();
    }
    if (this.props.currentDataCenter != currentDataCenter) {
      currentDataCenter(integrationId, currentDataCenter)
    }
  },
  onChangeTemplate(e) {
    //this function for user change the template
    this.setState({
      template: e,
      templateError: false
    })
  },
  onChangeVm(e) {
    //this function for user change the vm
    let value = e.target.value;
    this.setState({
      vm: value
    })
    if (value != '' && Boolean(value)) {
      this.setState({
        vmError: false
      })
    }
  },
  onChangeResourcePool(e) {
    //this function for user change the resourcePool
    this.setState({
      resourcePool: e,
      resourcePoolError: false
    })
  },
  onChangeDatastore(e) {
    //this function for user change the datastore
    this.setState({
      datastore: e,
      datastoreError: false
    })
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    scope.setState({
      createVmModal: false
    });
  },
  handleSubmitCreate() {
    //this function for user submit the form
    const { scope, createIntegrationVm, integrationId, currentDataCenter } = this.props;
    const { getIntegrationVmList } = scope.props;
    let errorFlag = false;
    if (this.state.template == '' || !Boolean(this.state.template)) {
      this.setState({
        templateError: true
      })
      errorFlag = true;
    }
    if (this.state.vm == '' || !Boolean(this.state.vm)) {
      this.setState({
        vmError: true
      })
      errorFlag = true;
    }
    if (this.state.resourcePool == '' || !Boolean(this.state.resourcePool)) {
      this.setState({
        resourcePoolError: true
      })
      errorFlag = true;
    }
    if (this.state.datastore == '' || !Boolean(this.state.datastore)) {
      this.setState({
        datastoreError: true
      })
      errorFlag = true;
    }
    if (errorFlag) {
      return;
    }
    let tempVm = this.state.template.split('/');
    let newTempVm = tempVm.slice(0, tempVm.length - 1).join('/');
    let body = {
      template: this.state.template,
      vm: newTempVm + '/' + this.state.vm,
      resource_pool: this.state.resourcePool,
      datastore: this.state.datastore
    }
    scope.setState({
      createVmModal: false
    });
    let notification = new NotificationHandler()
    notification.spin(`克隆虚拟机中...`)
    createIntegrationVm(integrationId, currentDataCenter, body, {
      success: {
        func: () => {
          notification.close()
          notification.success('克隆虚拟机', '克隆虚拟机成功');
          getIntegrationVmList(integrationId, currentDataCenter);
        },
        isAsync: true
      },
      failed: {
        func: (error) => {
          let errorMsg = '克隆虚拟机失败'
          notification.close()
          if (error.statusCode == 504) {
            notification.info('克隆虚拟机返回超时')
            return
          }
          if (error.message && error.message.message && error.message.message.indexOf('already exists') > -1) {
            errorMsg = '虚拟机名称重复'
          }
          notification.error('克隆虚拟机', errorMsg);
        }
      }
    })
  },
  render() {
    const { isFetching, config } = this.props;
    if (isFetching || !Boolean(config)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const { formatMessage } = this.props.intl;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    let datastores = null;
    if (!!config.datastores) {
      datastores = config.datastores.map((item) => {
        return (
          <Option value={item} key={item}>{item}</Option>
        )
      });
    }
    let resourcePools = null;
    if (!!config.resourcePools) {
      resourcePools = config.resourcePools.map((item) => {
        return (
          <Option value={item} key={item}>{item}</Option>
        )
      });
    }
    let templates = null;
    if (!!config.templates) {
      templates = config.templates.map((item) => {
        return (
          <Option value={item.path} key={item.path}>
            <div className='vmTemplateDetail'>
              <Tooltip placement="right" title={item.path}>
                <p className='path'>{item.path}</p>
              </Tooltip>
              <p className='lowcase'>客户机操作系统：{item.type}</p>
              <p className='lowcase'>虚拟机版本：{item.version}</p>
              <p className='lowcase'>CPU/内存：{item.cpuNumber + 'C'}/{diskFormat(item.memoryTotal)}</p>
            </div>
          </Option>
        )
      })
    }
    return (
      <div id='CreateVmModal' key='CreateVmModal'>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.templateTitle} /></span>
          </div>
          <div className='inputBox'>
            <Select style={{ width: '320px' }} onChange={this.onChangeTemplate} value={this.state.template}
              getPopupContainer={() => document.getElementById('CreateVmModal')}
              >
              {templates}
            </Select>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.name} /></span>
          </div>
          <div className='inputBox'>
            <Input type='text' size='large' onChange={this.onChangeVm} value={this.state.vm} />
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.resourcePool} /></span>
          </div>
          <div className='inputBox'>
            <Select style={{ width: '320px' }} onChange={this.onChangeResourcePool} value={this.state.resourcePool}>
              {resourcePools}
            </Select>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.datastores} /></span>
          </div>
          <div className='inputBox'>
            <Select style={{ width: '320px' }} onChange={this.onChangeDatastore} value={this.state.datastore}>
              {datastores}
            </Select>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='bottomBox'>
          <div>
            <Button size='large' type='primary' onClick={this.handleSubmitCreate}>
              <FormattedMessage {...menusText.finishBtn} />
            </Button>
            <Button size='large' type='ghost' onClick={this.handleReset}>
              <FormattedMessage {...menusText.cancelBtn} />
            </Button>
          </div>
        </div>
      </div>
    )
  }
});

function mapStateToProps(state, props) {
  const defaultVmConfig = {
    isFetching: false,
    config: {}
  }
  const { getCloneVmConfig } = state.integration
  const { isFetching, config } = getCloneVmConfig || defaultVmConfig
  return {
    isFetching,
    config
  }
}

CreateVmModal = createForm()(CreateVmModal);

CreateVmModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getCloneVmConfig,
  createIntegrationVm
})(injectIntl(CreateVmModal, {
  withRef: true,
}));

