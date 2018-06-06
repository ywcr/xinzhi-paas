/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateCompose component
 *
 * v0.1 - 2016-10-15
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Input, Button, Switch, Modal, Radio } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/CreateCompose.less'
import YamlEditor from '../../Editor/Yaml'
import { appNameCheck } from '../../../common/naming_validation'
import NotificationHandler from '../../../common/notification_handler'

const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class CreateCompose extends Component {
  constructor(props) {
    super(props);
    this.onChangeAttr = this.onChangeAttr.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateSubmit = this.updateSubmit.bind(this)
    this.onChangeYamlEditor = this.onChangeYamlEditor.bind(this)
    this.state = {
      composeType: 'stack',
      composeAttr: props.parentState.stackItem.isPublic === 1 ? true : false,
      currentYaml: null
    }
  }

  componentWillReceiveProps(nextProps) {
    const { parentState, scope } = nextProps;
    let currentYaml = '';
    if (!!parentState.stackItemContent && scope.state.createModalShow) {
      currentYaml = parentState.stackItemContent;
      this.setState({
        currentYaml: currentYaml
      })
    }
    if (!this.props.parentState.createModalShow && nextProps.parentState.createModalShow) {
      this.setState({
        composeAttr: nextProps.parentState.stackItem.isPublic === 1 ? true : false
      })
    }
  }

  onChangeAttr(e) {
    //this function for user change the compose attr
    this.setState({
      composeAttr: e
    });
  }

  handleReset(e) {
    //this function for user close add other image space modal
    e.preventDefault();
    this.props.form.resetFields();
    const scope = this.props.scope;
    this.setState({
      currentYaml: ''
    });
    scope.setState({
      createModalShow: false,
    });
  }

  handleSubmit(e) {
    //this function for user submit add other image space
    e.preventDefault();
    const parentScope = this.props.scope;
    const form = this.props.form
    form.validateFields((errors, values) => {
      if (!!errors) {
        //it's mean there are some thing is null,user didn't input
        return;
      }
      let notification = new NotificationHandler()
      const scope = this
      const registry = this.props.registry
      const config = {
        'is_public': this.state.composeAttr ? 1 : 2,
        'content': this.state.currentYaml,
        'name': values.name,
        'description': values.desc
      }
      if(/[\u4e00-\u9fa5]+$/i.test(values.name)){
        notification.info('不支持中文名称')
        return
      }
      if (!this.state.currentYaml) {
        notification.info('请输入编排内容')
        return
      }
      notification.spin(`创建编排 ${values.name} 中...`)
      this.props.createStack(config, {
        success: {
          func: () => {
            parentScope.props.loadMyStack(registry)
            parentScope.setState({
              createModalShow: false
            });
            notification.close();
            notification.success(`创建编排 ${values.name} 成功`);
            scope.props.form.resetFields();
            scope.setState({
              currentYaml: ""
            });
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            notification.close()
            notification.error(`创建编排 ${values.name} 失败`, err.message.message)
            scope.props.form.resetFields();
            scope.setState({
              currentYaml: ""
            });
          }
        }
      })
      //when the code running here,it's meaning user had input all things,
      //and should submit the message to the backend
    });
  }
  updateSubmit(e) {
    //this function for user submit add other image space
    e.preventDefault();
    const parentScope = this.props.scope;
    const form = this.props.form;
    const _this = this;
    form.validateFields((errors, values) => {
      if (!!errors) {
        //it's mean there are some thing is null,user didn't input
        return;
      }
      const scope = this
      const registry = this.props.registry
      const config = {
        registry,
        'id': parentScope.state.stackItem.id,
        'is_public': this.state.composeAttr ? 1 : 2,
        'content': this.state.currentYaml,
        'name': values.name,
        'description': values.desc
      }
      let notification = new NotificationHandler()
      notification.spin(`更新编排 ${values.name} 中...`)
      // return
      this.props.updateStack(config, {
        success: {
          func: () => {
            // parentScope.props.loadMyStack(registry)
            parentScope.setState({
              createModalShow: false,
              stackItem: ''
            });
            notification.close()
            notification.success(`更新编排 ${values.name} 成功`)
            scope.props.form.resetFields();
            scope.setState({
              currentYaml: ""
            });
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            /*Modal.error({
              title: '修改编排文件',
              content: (<h2>{err.message.message}</h2>),
            });*/
            notification.close()
            notification.error(`更新编排 ${values.name} 失败`, err.message.message)
            scope.props.form.resetFields();
            scope.setState({
              currentYaml: ""
            });
          }
        }
      })
      //when the code running here,it's meaning user had input all things,
      //and should submit the message to the backend
    });
  }

  onChangeYamlEditor(e) {
    //this function for editor callback
    this.setState({
      currentYaml: e
    })
  }

  composeFileNameCheck(rule, value, callback) {
    let errorMsg = appNameCheck(value, '编排名称');
    if(errorMsg == 'success') {
      callback()
    } else {
      callback([new Error(errorMsg)])
    }
  }
  composeDescInfoCheck(rule, value, callback) {
     if(value.length<1){
         let errorMsg = "描述信息不能为空"
         callback([new Error(errorMsg)])
     }else if(value.length>1024){
         let errorMsg = "描述信息不能大于1024个字符"
         callback([new Error(errorMsg)])
     }else{
         callback()
     }
  }
  bottomBtnAction() {
    const parentState = this.props.parentState
    if (this.props.readOnly) {
      return
    }
    if (parentState.stackItem.name){
      return (
        <Button size='large' type='primary' onClick={this.updateSubmit}> 保存</Button>
      )
    }
    return (
      <Button size='large' type='primary' onClick={this.handleSubmit}> 确定</Button>
    )
  }
  render() {
    const scope = this.props.scope;
    const parentState = this.props.parentState
    const defaultEditOpts = {
      readOnly: this.props.readOnly ? true : false,
    }
    const { createModalShow } = parentState;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        { message: '编排名称' },
        { validator: this.composeFileNameCheck }
      ],
      initialValue: parentState.stackItem.name
    });
    const descProps = getFieldProps('desc', {
      rules: [
        { message: '描述信息' },
        { validator: this.composeDescInfoCheck }
      ],
      initialValue: parentState.stackItem.description
    });
    const switchProps = getFieldProps('checked', {
      valuePropName: 'checked',
      initialValue: parentState.stackItem.isPublic === 1 ? true : false
    })
    return (
      <div id='createCompose' key='createCompose'>
        <Form horizontal>
          <div className='commonInput'>
            <div className='leftBox' style={{ lineHeight: '35px' }}>
              <span className='title'>编排名称</span>
            </div>
            <div className='rightBox'>
              <FormItem hasFeedback style={{ width: '220px' }} >
                <Input {...nameProps} disabled={parentState.stackItem.name ? true : false} />
              </FormItem>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className='switch commonInput'>
            <div className='leftBox'>
              <span className='title'>编排属性</span>
            </div>
            <div className='rightBox' style={{ width: '100px', paddingTop: '8px' }}>
              <FormItem hasFeedback>
                <Switch {...switchProps} checked={this.state.composeAttr} disabled={this.props.readOnly}  checkedChildren={'公开'} unCheckedChildren={'私有'} onChange={this.onChangeAttr} />
              </FormItem>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className='intro commonInput'>
            <div className='leftBox'>
              <span className='title'>描述信息</span>
            </div>
            <div className='rightBox'>
              <FormItem hasFeedback>
                <Input type='textarea' {...descProps} disabled={this.props.readOnly} autosize={{ minRows: 2, maxRows: 3 }} />
              </FormItem>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className='file commonInput composeText'>
            <div className='leftBox'>
              <span className='title'>编排文件</span>
            </div>
            <div className='rightBox'>
              <YamlEditor value={this.state.currentYaml} options={defaultEditOpts} callback={this.onChangeYamlEditor.bind(this)} />
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        </Form>
        <div className='btnBox'>
          <Button size='large' onClick={this.handleReset} style={{ marginRight: '15px' }}>
            取消
        </Button>
          {
           this.bottomBtnAction()
          }
        </div>
      </div>
    )
  }
}

CreateCompose.propTypes = {

}

CreateCompose = createForm()(CreateCompose);

CreateCompose = connect()(CreateCompose);

export default CreateCompose;