/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateImageEnvComponent component
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
import { loadImageDetailTagConfig,  loadOtherDetailTagConfig } from '../../../../../actions/app_center'
import { loadRepositoriesTagConfigInfo } from '../../../../../actions/harbor'
import NotificationHandler from '../../../../../common/notification_handler'
import './style/CreateImageEnvComponent.less'

const createForm = Form.create;
const FormItem = Form.Item;

let CreateImageEnvComponent = React.createClass({
  getInitialState: function() {
    return {
      uuid: 0,
    }
  },
  loadData() {
    const {scope,loadRepositoriesTagConfigInfo, registryServer } = this.props
    const form=scope.props.form
    let imageName = form.getFieldValue('imageName')
    if (!imageName) return
    this.setState({
      currentImageName: imageName
    })
    let imageTag = 'latest'
    if (imageName.indexOf('/') == imageName.lastIndexOf('/') && imageName.indexOf('/') > 0) {
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
          const { scope,form,registry } = self.props;
          const { setFieldsValue } = form
          let imageEnv = result.data
          let envs = imageEnv.defaultEnv
          if (envs) {
            setFieldsValue({
              imageEnvInputs: envs.map((env, index) => index)
            })
            if (this.state.uuid < envs.length) {
              self.setState({
                uuid: envs.length
              })
            }
            envs.forEach((env, index) => {
              env = env.split('=')
              setFieldsValue({
                [`imageEnvName${index}`]: env[0],
                [`imageEnvValue${index}`]: env[1]
              })
            })
            setTimeout(() => {
              if (document.getElementById(`imageEnvName${envs.length - 1}`)) {
                document.getElementById(`imageEnvName${envs.length - 1}`).focus()
              }
            }, 300)
          }
        }
      },
      failed: {
        func: (res) => {
          const { setFieldsValue } = self.props.form
          const notify = new NotificationHandler()
          setFieldsValue({
            imageEnvInputs: [0]
          })
          setTimeout(() => {
            if (document.getElementById(`imageEnvName0`)) {
              document.getElementById(`imageEnvName0`).focus()
            }
          }, 300)
          if (res.message == 'Failed to find any tag') {
            notify.error('获取镜像信息失败，请检查该基础镜像是否存在')
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
  componentWillReceiveProps(nextProps) {
    const { form ,imageName} = nextProps
    if(nextProps.visible != this.props.visible && nextProps.visible && this.state.currentImageName != imageName) {
        form.setFieldsValue({
            imageEnvInputs: [ 0 ]
        })
        return this.loadData(true)
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
    closeImageEnvModal(){
        const _this=this;
        const {scope} = this.props;

        _this.props.form.validateFields((errors, values) => {
                if (!!errors) {
                    return;
                }else{
                  let imageEnvLength = values.imageEnvInputs || [];
                  let imageEnvList = [];
                  let imageEnvFlag = false;
                  imageEnvLength.map((item, index) => {
                      if (!!values['imageEnvName' + item]) {
                          if (values['imageEnvValue' + item] == '') {
                              _this.setState({
                                  emptyImageEnv: true
                              });
                              errorFlag = true;
                          } else {
                              let Names = values['imageEnvName' + item] ? values['imageEnvName' + item].trim(): ''
                              let Value = values['imageEnvValue' + item] ? values['imageEnvValue' + item].trim(): ''
                              let tempBody = {
                                  name: Names,
                                  value: Value
                              }
                              imageEnvList.push(tempBody)
                          }
                      }
                  });
                  scope.setState({
                    imageEnvList:imageEnvList
                  })
                  _this.props.scope.setState({
                      ImageEnvModal: false
                  });
                }
            }
        )
    },
  addImageEnv (scope) {
    const { form } = this.props;
    let inputValue = form.getFieldValue('imageEnvInputs');
    let tmpUuid = ++this.state.uuid;
    this.setState({
      uuid: tmpUuid
    });
    let keys = form.getFieldValue('imageEnvInputs');
    this.props.form.validateFields((errors,values)=>{
        if (!!errors) {
            return;
        }
        keys = keys.concat(this.state.uuid);
        form.setFieldsValue({
            'imageEnvInputs': keys
        });
        setTimeout(()=> document.getElementById(`imageEnvName${this.state.uuid}`).focus(),300)
    })
  },
  removeImageEnv (k, scope){
    const { form } = this.props;
    let keys = form.getFieldValue('imageEnvInputs');
    keys = keys.filter((key) => {
      return key !== k;
    });
    form.setFieldsValue({
      'imageEnvInputs': keys
    });
    if(keys.length == 0) {
      return this.addImageEnv(scope)
    }
    setTimeout(()=> document.getElementById(`imageEnvName${keys[keys.length - 1]}`).focus(),0)
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

  render() {
    const { scope, form, imageConfig } = this.props;
    const { setFieldsValue } = form
    if(!imageConfig) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    if(DEFAULT_REGISTRY && imageConfig) {
      if(imageConfig[DEFAULT_REGISTRY] && imageConfig[DEFAULT_REGISTRY].isFetching) {
        return <div className="loadingBox"><Spin size="large"></Spin></div>
      }
    }
    const { formatMessage } = this.props.intl;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form;
    getFieldProps('imageEnvInputs', {
      initialValue: [0],
    });
    const ImageEnvInputItems = getFieldValue('imageEnvInputs').map((i) => {
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
      <div id='CreateImageEnvComponent' key='CreateImageEnvComponent'>
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
          <div className='addBtn' onClick={this.addImageEnv}>
            <Icon type='plus-circle-o' />
            {/* <span>增加环境变量</span> */}
          </div>
        </div>
        <div className="ant-modal-footer">
          <button onClick={()=>this.closeImageEnvModal()} type="button" className="ant-btn ant-btn-primary ant-btn-lg"><span>确 定</span></button>
        </div>
      </div>
    )
  }
});

function mapStateToProps(state, props) {
  const defaultImageConfig = {}
  let imageConfig = state.harbor.imageTagConfig
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
CreateImageEnvComponent=createForm()(CreateImageEnvComponent)

CreateImageEnvComponent.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  loadOtherDetailTagConfig,
  loadRepositoriesTagConfigInfo
})(injectIntl(CreateImageEnvComponent, {
  withRef: true,
}));

