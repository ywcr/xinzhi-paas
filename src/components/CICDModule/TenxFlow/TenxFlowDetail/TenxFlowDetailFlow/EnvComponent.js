/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * EnvComponent component
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Icon, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import NotificationHandler from '../../../../../common/notification_handler'
import { loadImageDetailTagConfig,  loadOtherDetailTagConfig } from '../../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { loadRepositoriesTagConfigInfo } from '../../../../../actions/harbor'
import './style/EnvComponent.less'

const createForm = Form.create;
const FormItem = Form.Item;

let EnvComponent = React.createClass({
  getInitialState: function() {
    return {
      uuid: 0
    }
  },
  loadData() {
    const { scope, loadRepositoriesTagConfigInfo, registryServer, index } = this.props
    const form=scope.props.form
    let imageName = form.getFieldValue(`serviceSelect${index}`)

      if (!imageName) {
        form.setFieldsValue({
          ['service' + index + 'inputs']: []
        })
        return
      }

      this.setState({
      currentImageName: imageName
    })
    let imageTag = 'latest'

      if (imageName.indexOf('/') == imageName.lastIndexOf('/')  && imageName.indexOf('/') > 0) {
      if (imageName.indexOf(':') > 0) {
        imageName = imageName.split(':')
        if (imageName[1]) {
          imageTag = imageName[1]
        }
        imageName = imageName[0]
      }
    } else {
      if (imageName.indexOf(':') > 0) {
        imageName = imageName.split(':')
        if (imageName[1]) {
          imageTag = imageName[1]
        }
        imageName = imageName[0]
      }
      imageName = `library/${imageName}`
    }

    const self = this
    loadRepositoriesTagConfigInfo(DEFAULT_REGISTRY, imageName, imageTag, {
      success: {
        func: (result) => {
          if (!result.data) {
            result.data = {
              defaultEnv: []
            }
          }
          let allEnv = {}
          const { scope, form, registry, config } = self.props;
          const { setFieldsValue, getFieldValue } = form
          let imageEnv = result.data
          let envs = imageEnv.defaultEnv
          if (envs) {
            if (self.state.uuid < envs.length) {
              self.setState({
                uuid: envs.length
              })
            }
            envs.forEach((env, i) => {
              env = env.split('=')
              allEnv[env[0]] = env[1]
            })
          }
          const allEnvName = Object.getOwnPropertyNames(allEnv)
          setFieldsValue({
            ['service' + index + 'inputs']: allEnvName.map((env, i) => i)
          })
          allEnvName.forEach((name, i) => {
            setFieldsValue({
              [`service${index}inputName${i}`]: name,
              [`service${index}inputValue${i}`]: allEnv[name]
            })
          })
          setTimeout(() => {
            const arr = getFieldValue(['service' + index + 'inputs'])
            const i = arr[arr.length - 1]
            if (document.getElementById(`service${index}inputName${i}`)) {
              document.getElementById(`service${index}inputName${i}`).focus()
            }
          }, 300)
        }
      },
      failed: {
        func: (res) => {
          const notify = new NotificationHandler()
          if (res.message == 'Failed to find any tag') {
            notify.error('获取镜像信息失败，请检查镜像是否存在')
          } else {
            notify.error('获取基础镜像信息失败: ' + res.statusCode)
          }
        }
      }
    })
  },
  componentWillMount() {
    this.loadData()
  },
  confirmBtn(){
    const { scope } = this.props;
      this.props.form.validateFields((errors, values) => {
              if (!!errors) {
                  return;
              }else{
                let serviceLength = values.service0inputs;
                let tempList = [];
                serviceLength.map((item) => {
                    let tempLength = values['service' + item + 'inputs'] || [];
                    let emptyFlag = false;
                    tempLength.map((littleItem) => {
                      if (values['service' + item + 'inputName' + littleItem] != '') {
                        if (values['service' + item + 'inputValue' + littleItem] == '') {
                          errorFlag = true;
                          emptyFlag = true;
                        } else {
                          let tempBody = {
                            name: (values['service' + item + 'inputName' + littleItem]).trim(),
                            value: (values['service' + item + 'inputValue' + littleItem]).trim()
                          }
                          tempList.push(tempBody);
                        }
                      }
                    });
                });
                scope.setState({
                  tempList:tempList
                })
                this.props.scope.setState({
                    envModalShow: null
                });
              }
          }
      )
  },
  componentWillReceiveProps(nextProps) {
    const { form, index,imageName } = nextProps
      if(nextProps.visible != this.props.visible && nextProps.visible && this.state.currentImageName != imageName) {
          return this.loadData()
      }
    if (nextProps.visible != this.props.visible && nextProps.visible) {
      const arr = form.getFieldValue(['service' + index + 'inputs'])
      const i = arr[arr.length - 1]
      setTimeout(() => { 
        if(document.getElementById(`service${index}inputName${i}`)) {
          document.getElementById(`service${index}inputName${i}`).focus()
        }
       }, 300)
    }
  },
  shouldComponentUpdate(nextProps) {
    const { form, index } = nextProps
    let imageName = form.getFieldValue('service' + index + 'inputs')
     if(!nextProps.visible) {
       return false
     }
     return true
  },
  addServicesInput(index) {
    const { form } = this.props;
    let tmpUuid = ++this.state.uuid;
    this.setState({
      uuid: tmpUuid
    });
    let keys = form.getFieldValue('service' + index + 'inputs');
      form.validateFields((errors, values) => {
              if (!!errors) {
                  return;
              }
          keys = keys.concat(this.state.uuid);
          let temp = 'service' + index + 'inputs';
          form.setFieldsValue({
            [`${temp}`]: keys
          });
          setTimeout(() => document.getElementById(`service${index}inputName${this.state.uuid}`).focus(), 300)
          }
      )
  },
  removeServicesInput (k, index){
    //this function for user remove the input div
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('service' + index + 'inputs');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    let temp = 'service' + index + 'inputs';
    form.setFieldsValue({
      [`${temp}`]: keys
    });
    if(keys.length == 0) {
      return this.addServicesInput(index)
    }
    setTimeout(() => document.getElementById(`service${index}inputName${keys[keys.length - 1]}`).focus(), 0)
  },
  validateEnvName(item, values, callback) {
    const { validateCallback } = this.props;
    if (!values || values == "") {
      if (validateCallback) {
        validateCallback(false)
      }
      callback([new Error('请输入环境变量名')])
      return
    }
    // Compare after remove all space
    let str = values.replace(/\s+/g, "");
    if (str != values) {
      if (validateCallback) {
        validateCallback(false)
      }
      callback([new Error('环境变量名不允许含有空格')])
      return
    }
    if (validateCallback) {
      validateCallback(true)
    }
    callback()
  },
  closeModal () {
    //this function for user close the env input modal
    const { scope } = this.props;
    scope.setState({
      envModalShow: null
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope, index, form, imageConfig } = this.props;
    if (!imageConfig) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    if (imageConfig) {
      if (imageConfig[DEFAULT_REGISTRY] && imageConfig[DEFAULT_REGISTRY].isFetching) {
        return <div className="loadingBox"><Spin size="large"></Spin></div>
      }
    }
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form;
    getFieldProps('service' + index + 'inputs', {
      initialValue: [0],
    });
    
    const servicesInputItems = getFieldValue('service' + index + 'inputs').map((i) => {
      const servicesInputNameProps = getFieldProps(`service${index}inputName${i}`, {
        rules: [
          { validator: this.validateEnvName },
        ],
        initialValue: '',
      });
      const servicesInputValueProps = getFieldProps(`service${index}inputValue${i}`, {
        rules: [
          {required: true, whitespace: true, message: '请输入环境变量值' },
        ],
        initialValue: '',
      });
      return (
      <QueueAnim key={'service' + index + 'input' + i + 'Animate'}>
        <div className='serviceInputDetail' key={'service' + index + 'input' + i}>
          <div className='commonTitle'>
            <FormItem className='serviceInputForm'>
              <Input {...servicesInputNameProps} type='text' size='large' />
            </FormItem>
          </div>
          <div className='equalTitle'>
            <span>=</span>
          </div>
          <div className='commonTitle'>
            <FormItem className='serviceInputForm'>
              <Input {...servicesInputValueProps} type='text' size='large' />
            </FormItem>
          </div>
          <div className='equalTitle'>
            <i className='fa fa-trash' onClick={() => this.removeServicesInput(i, index)} />
          </div>
          <div style={{ clera:'both' }}></div>
        </div>
      </QueueAnim>
      )
    });
    return (
      <div id='EnvComponent' key='EnvComponent'>
        <div className='titleBox'>
          <div className='commonTitle'>
            <span>变量名</span>
          </div>
          <div className='equalTitle'>
          </div>
          <div className='commonTitle'>
            <span>变量值</span>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
        {servicesInputItems}
        <div className='addBtnBox'>
          <span className='addBtn' onClick={() => this.addServicesInput(index)}>
            <Icon type='plus-circle-o' />
            <span>增加环境变量</span>
          </span>
        </div>
        <div className="ant-modal-footer">
          <button onClick={()=>this.confirmBtn()} type="button" className="ant-btn ant-btn-primary ant-btn-lg"><span>确 定</span></button>
        </div>
      </div>
    )
  }
});

function mapStateToProps(state, props) {
  const defaultImageConfig = {}
  let imageConfig = state.getImageTagConfig
  if(!imageConfig) {
    imageConfig = defaultImageConfig
  }
    const defaultRegistryServer = {
  }
  let registryServer = defaultRegistryServer
  const { availableImage } = state.cicd_flow
  if(availableImage) {
    registryServer = availableImage.server ||  defaultRegistryServer
  }
  return {
    registryServer,
    imageConfig
  }
}
EnvComponent=createForm()(EnvComponent)

EnvComponent.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  loadOtherDetailTagConfig,
  loadRepositoriesTagConfigInfo
})(injectIntl(EnvComponent, {
  withRef: true,
}));

