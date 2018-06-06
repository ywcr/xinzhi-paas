/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageEnvComponent component
 *
 * v0.1 - 2016-11-21
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Icon, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import NotificationHandler from '../../../../../common/notification_handler'
import { loadImageDetailTagConfig,  loadOtherDetailTagConfig } from '../../../../../actions/app_center'
import { loadRepositoriesTagConfigInfo } from '../../../../../actions/harbor'
import './style/ImageEnvComponent.less'

const createForm = Form.create;
const FormItem = Form.Item;

let ImageEnvComponent = React.createClass({
  getInitialState: function () {
    return {
      uuid: 0
    }
  },
  loadData(imageChange) {1
    const { form, loadRepositoriesTagConfigInfo, registryServer,defaultConfig } = this.props
    
    let imageName = form.getFieldValue('imageName')
    this.setState({
      currentImageName: defaultConfig
    })
    if (!imageName) return
    let tag = 'latest'
    if (imageName.indexOf('/') == imageName.lastIndexOf('/')  && imageName.indexOf('/') > 0) {
      if (imageName.indexOf(':') > 0) {
        imageName = imageName.split(':')
        if (imageName[1]) {
          tag = imageName[1]
        }
        imageName = imageName[0]
      }
    } else {
      if (imageName.indexOf(':') > 0) {
        imageName = imageName.split(':')
        if (imageName[1]) {
          tag = imageName[1]
        }
        imageName = imageName[0]
      }
      imageName = `library/${imageName}`
    }
    const self = this
    loadRepositoriesTagConfigInfo(DEFAULT_REGISTRY, imageName, tag, {
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
            setFieldsValue({
              imageEnvInputs: envs.map((env, index) => index)
            })
            envs.forEach((env, index) => {
              env = env.split('=')
              allEnv[env[0]] = env[1]
              // setFieldsValue({
              //   [`imageEnvName${index}`]: env[0],
              //   [`imageEnvValue${index}`]: env[1]
              // })
            })
          }
          self.setCustomEnvAndFocus(allEnv, imageChange)
        }
      },
      failed: {
        func: (res) => {
          // self.setCustomEnvAndFocus()
          const notify = new NotificationHandler()
          if (res.message == 'Failed to find any tag' || res.statusCode == 404) {
            notify.error('获取基础镜像信息失败，请检查镜像是否存在')
          } else {
            notify.error('获取基础镜像信息失败: ' + res.statusCode)
          }
        }
      }
    })
  },
  componentWillMount() {
    const {form, config ,defaultConfig} = this.props;
    const { setFieldsValue, getFieldValue } = form
    if(form.getFieldValue('imageName') == defaultConfig){
      this.loadData()
    }else{
      this.loadData(true)
    }
  },
  setCustomEnvAndFocus(env, imageChange) {
    const {form, config } = this.props;
    const { setFieldsValue, getFieldValue } = form
    let allEnv = {}
    if(env) {
      allEnv = Object.assign(allEnv, env)
    }
    // fix issue http://jira.paas.enncloud.cn/browse/CRYSTAL-4437
    if (!!config && !imageChange) {
      config.map((item) => {
        allEnv[item.name] = item.value
      })
    }
    const allEnvName = Object.getOwnPropertyNames(allEnv)
    setFieldsValue({
      imageEnvInputs: allEnvName.map((env, index) => index)
    })
    allEnvName.forEach((name, index) => {
      setFieldsValue({
        [`imageEnvName${index}`]: name,
        [`imageEnvValue${index}`]: allEnv[name]
      })
    })
    if (this.state.uuid < allEnvName.length) {
      this.setState({
        uuid: allEnvName.length
      })
    }
    setTimeout(() => {
      const arr = getFieldValue('imageEnvInputs')
      const index = arr[arr.length - 1]
      if (document.getElementById(`imageEnvName${index}`)) {
        document.getElementById(`imageEnvName${index}`).focus()
      }
    }, 300)
  },
  componentWillReceiveProps(nextProps) {
    const { form } = nextProps
    let imageName = form.getFieldValue('imageName')
    if(nextProps.visible != this.props.visible && nextProps.visible && this.state.currentImageName != imageName) {
      form.setFieldsValue({
        imageEnvInputs: [ 0 ]
      })
      return this.loadData(true)
    }else if( nextProps.visible != this.props.visible && nextProps.visible && this.state.currentImageName == imageName ){
      this.setCustomEnvAndFocus({}, false)
    }
    if (nextProps.visible != this.props.visible && nextProps.visible) {
      let keys = form.getFieldValue('imageEnvInputs')
      const index = keys[keys.length - 1]
      setTimeout(() => {
        if (document.getElementById(`imageEnvName${index}`)) {
          document.getElementById(`imageEnvName${index}`).focus()
        }
      }, 0)
    }
  },
  shouldComponentUpdate(nextProps) {
    const { form } = nextProps
    let imageName = form.getFieldValue('imageName')
     if(!nextProps.visible && this.state.currentImageName == imageName) {
       return false
     }
     return true
  },
  addImageEnv (k, index, scope) {
    const { form } = this.props;
    let inputValue = form.getFieldValue('imageEnvInputs');
    let tmpUuid = ++this.state.uuid;
    this.setState({
      uuid: tmpUuid
    });
    let keys = form.getFieldValue('imageEnvInputs');

    form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            }
        keys = keys.concat(this.state.uuid);
        form.setFieldsValue({
            'imageEnvInputs': keys
        });
        setTimeout(()=> document.getElementById(`imageEnvName${this.state.uuid}`).focus(),300)
        }
    )

  },
  removeImageEnv (k, index, scope){
    const { form } = this.props;
    let keys = form.getFieldValue('imageEnvInputs');
    keys = keys.filter((key) => {
      return key !== k;
    });
    form.setFieldsValue({
      'imageEnvInputs': keys
    });
    const envNameKeys = keys.map(key => `imageEnvName${key}`)
    form.validateFields(envNameKeys, { force: true });
    if(keys.length == 0) {
      return this.addImageEnv(scope)
    }
    setTimeout(()=> document.getElementById(`imageEnvName${keys[keys.length - 1]}`).focus(),0)
  },
  validateEnvName(item, values, callback) {
    const { validateCallback } = this.props
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
    const { scope, form, imageConfig, config } = this.props;
    const { formatMessage } = this.props.intl;
    const { setFieldsValue, getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form
    if (!imageConfig) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    if (imageConfig) {
      if (imageConfig[DEFAULT_REGISTRY] && imageConfig[DEFAULT_REGISTRY].isFetching) {
        return <div className="loadingBox"><Spin size="large"></Spin></div>
      }
    }
    getFieldProps('imageEnvInputs', {
      initialValue: [0],
    });
    const ImageEnvInputItems = getFieldValue('imageEnvInputs').map((i) => {
      let itemKey = '';
      const ImageEnvNameInputProps = getFieldProps(`imageEnvName${i}`, {
        rules: [
          { validator: this.validateEnvName },
        ]
      });
      const ImageEnvValueInputProps = getFieldProps(`imageEnvValue${i}`, {
        rules: [
          {required:true,whitespace:true, message: '请输入环境变量值' },
        ]
      });
      return (
      <QueueAnim key={`imageEnvInputs${i}`}>
        <div className='imageEnvInputDetail' key={`imageEnvInputDetail${i}`}>
          <div className='commonTitle'>
            <FormItem className='ImageEnvName'>
              <Input {...ImageEnvNameInputProps} type='text' size='large' />
            </FormItem>
          </div>
          <div className='equalTitle'>
            <span>=</span>
          </div>
          <div className='commonTitle'>
            <FormItem className='ImageEnvValue'>
              <Input {...ImageEnvValueInputProps} type='text' size='large' />
            </FormItem>
          </div>
          <div className='equalTitle'>
            <i className='fa fa-trash' onClick={() => this.removeImageEnv(i)}/>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
      </QueueAnim>
      )
    });
    return (
      <div id='ImageEnvComponent' key='ImageEnvComponent'>
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
        {ImageEnvInputItems}
        <div className='addBtnBox'>
          <span className='addBtn' onClick={this.addImageEnv}>
            <Icon type='plus-circle-o' />
            <span>增加环境变量</span>
          </span>
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

ImageEnvComponent.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  loadOtherDetailTagConfig,
  loadRepositoriesTagConfigInfo
})(injectIntl(ImageEnvComponent, {
  withRef: true,
}));

