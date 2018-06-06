/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Create space modal
 *
 * v0.1 - 2016-12-01
 * @author Zhangpc
 */

import React from 'react'
import { Input, Modal, Form, Button, } from 'antd'
import { CREATE_SPACE } from '../../../constants'
import './style/CreateSpaceModal.less'

const createForm = Form.create
const FormItem = Form.Item

let CreateSpaceModal = React.createClass({
  getInitialState() {
    return {
      disabled: false,
    }
  },
  spaceExists(rule, value, callback) {
    const _this = this
    if (!value) {
      callback([new Error('请输入空间名')])
      return
    }
    if (value.length <5 || value.length > 40) {
       callback(new Error('请输入5~40位字符'))
       return
    }
    const { teamID, funcs } = this.props
    const { checkTeamSpaceName } = funcs
    if (!CREATE_SPACE.test(value)) {
      callback([new Error('以[a~z]开头，允许[-]，长度大于4，且以小写英文结尾')])
      return
    }
    // Disabled submit button when checkTeamSpaceName
    this.setState({
      disabled: true
    })
    checkTeamSpaceName(teamID, value, {
      success: {
        func: (result) => {
          _this.setState({
            disabled: false
          })
          if (result.data) {
            callback([new Error('空间名已经存在')])
            return
          }
          callback()
        }
      },
      failed: {
        func: (err) => {
          _this.setState({
            disabled: false
          })
          callback([new Error('空间名校验失败')])
        }
      }
    })
  },
  handleOk() {
    const { form, onSubmit, scope } = this.props
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { spacename, description } = values
      let newSpace = {
        spaceName: spacename,
        description,
      }
      onSubmit(newSpace)
      form.resetFields()
      scope.setState({
        createSpaceModalVisible: false,
      })
    })
  },
  handleCancel(e) {
    e.preventDefault()
    const { scope } = this.props
    scope.setState({
      createSpaceModalVisible: false,
    })
  },
  render() {
    const { form, visible } = this.props
    const { disabled } = this.state
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const nameProps = getFieldProps('spacename', {
      rules: [
        { validator: this.spaceExists },
      ],
    })
    const descriptionProps = getFieldProps('description')
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 21 },
    }
    return (
      <Modal title="创建新空间" visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
        wrapClassName="addSpaceModal"
        width="500px"
        footer={[
          <Button
            key="back"
            type="ghost"
            size="large"
            onClick={this.handleCancel}>
            返 回
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            disabled={disabled}
            onClick={this.handleOk}>
            提 交
          </Button>,
        ]}>
        <Form horizontal>
          <FormItem
            {...formItemLayout}
            label="名称"
            hasFeedback
            help={isFieldValidating('spacename') ? '校验中...' : (getFieldError('spacename') || []).join(', ')}
            >
            <Input {...nameProps} placeholder="新空间名称" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="备注">
            <Input type="textarea" {...descriptionProps} placeholder="备注" />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})

CreateSpaceModal = createForm()(CreateSpaceModal)

export default CreateSpaceModal