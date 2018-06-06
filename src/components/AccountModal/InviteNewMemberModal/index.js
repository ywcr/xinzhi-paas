/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  InviteNewMemberModal
 *
 * v0.1 - 2016/12/12
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Modal,Alert,Icon,Button,Row,Col,Input,Tag,Select } from 'antd'
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import {EMAIL_REG_EXP} from '../../../constants'
import NotificationHandler from '../../../common/notification_handler'
import { connect } from 'react-redux'


const Option = Select.Option;
let valuesArr = []

class InviteNewMemberModal extends Component{
  constructor(props){
    super(props)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleTagsChange = this.handleTagsChange.bind(this)
    this.handleChangeInput = this.handleChangeInput.bind(this)
    // this.renderInput = this.renderInput.bind(this)
    this.renderTag = this.renderTag.bind(this)
    this.handleOnChangeInput = this.handleOnChangeInput.bind(this)

    this.state = {
      valueArr: [],
      disabled: false,
      tags: [],
      rightTags: [],
    }
  }
  handleOk() {
    const { closeInviteModal, teamID, userEmail } = this.props
    const { tags } = this.state
    let passTags = [] //正确的邮件
    // can't invite self
    const inviteSelf = tags.some((item) => {
      return item === userEmail
    })

    if (inviteSelf) {
      let notification = new NotificationHandler()
      notification.error(`请移除自己的邮箱 ${userEmail} 后重试`)
      return
    }

    passTags=tags.filter((item) => {
      return EMAIL_REG_EXP.test(item)
    })
    // 发送邀请
    if (passTags.length > 0) {
      this.props.inviteOnSubmit(teamID ,passTags)
    } else {
      let notification = new NotificationHandler()
      notification.error('没有正确的邮箱，请修正后重试')
      return
    }
    closeInviteModal() //关闭弹窗
  }
  handleCancel() {
    const { closeInviteModal } = this.props
    closeInviteModal()
  }
  
  handleTagsChange (value){
    this.setState({
      tags:value
    })
  }
  handleChangeInput(tag) {
    this.setState({tag})
  }
 
  renderTag (props) {
    let {tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue,...other} = props
    let {rightTags} = this.state
    if (!EMAIL_REG_EXP.test(tag)) {
      return (
        <span key={key} {...other} className="react-tagsinput-tag errTags">
          {getTagDisplayValue(tag)}
          {!disabled &&
            <a className={classNameRemove} onClick={(e) => onRemove(key)} >
            </a>
          }
        </span>
      )
    } else {
      return (
        <span key={key} {...other}>
          {getTagDisplayValue(tag)}
          {!disabled &&
          <a className={classNameRemove} onClick={(e) => onRemove(key)}>
          </a>
          }
        </span>
      )
    }
  }
  handleOnChangeInput (data) {
  }
  render(){
    const { visible } = this.props
    const { valueArr, disabled, tags } = this.state
    const maxInvitationNum = 20

    return (
      <Modal title='邀请新成员'
             visible={ visible }
             onOk={this.handleOk}
             onCancel={this.handleCancel}
             wrapClassName="InviteNewMemberModal"
             footer={[
               <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>取消</Button>,
               <Button key="submit" type="primary" size="large" onClick={this.handleOk} className="delBtn" disabled={disabled}>
                 发送邀请
               </Button>,
             ]}
      >
        <div className='inviteModal'>
          <Row className='inviteTitle'>
            <Col span={16}>
              请输入被邀请人的邮箱后按Tab或回车键添加
            </Col>
            <Col className="inviteCount" span={8}>
              还可添加{maxInvitationNum - tags.length}人
            </Col>
          </Row>
          <TagsInput value={this.state.tags}
                     onChange={this.handleTagsChange}
                     renderTag={this.renderTag}
                     renderInput={this.renderInput}
                     inputProps={{className: 'react-tagsinput-input', placeholder: ''}}
                     maxTags={maxInvitationNum}
                     addKeys={[9, 13,186]}
                     onChangeInput={this.handleChangeInput}
          />
        </div>
      </Modal>
    )
  }
}

function mapStateToProp(state, props) {
  return {
    userEmail: state.entities.loginUser.info.email,
  }
}
export default connect(mapStateToProp, {})(InviteNewMemberModal)