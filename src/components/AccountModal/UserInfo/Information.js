/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  my Information
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Button, Input, Icon, Form, Modal, Spin, Radio } from 'antd'
import './style/Information.less'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { updateUser } from '../../../actions/user'
import { parseAmount } from '../../../common/tools'
import NotificationHandler from '../../../common/notification_handler'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../constants'
import MemberRecharge from '../_Enterprise/Recharge'
import { chargeUser } from '../../../actions/charge'
import { loadLoginUserDetail } from '../../../actions/entities'
import { loadUserDetail, changeUserRole  } from '../../../actions/user'
import { MAX_CHARGE }  from '../../../constants'


const RadioGroup = Radio.Group
const createForm = Form.create;
const FormItem = Form.Item;

let ResetPassWord = React.createClass({
  getInitialState() {
    return {
      password: 'password',
    }
  },
  handleChange() {
    if (this.state.password === 'text') {
      this.setState({
        password: 'password'
      })
    } else {
      this.setState({
        password: 'text'
      })
    }
  },
  handleCancel(e) {
    e.preventDefault();
    this.props.form.resetFields()
    this.props.onChange()
  },

  handleSubmit(e) {
    const { userID, userDetail } = this.props
    e.preventDefault();
    const noti = new NotificationHandler()
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      noti.spin('修改密码中')
      this.props.updateUser(userID,
        {
          password: values.passwd
        }, {
          success: {
            func: () => {
              noti.close()
              noti.success('密码修改成功')
              this.props.form.resetFields()
              this.props.onChange()
            }
          }
        })
    });
  },
  checkPass(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    return callback()
  },
  checkPass2(rule, value, callback) {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('passwd')) {
      callback('两次输入密码不一致！');
      return
    }
    return callback()
  },
  componentDidMount(){
    this.refs.intPass.refs.input.focus()
  },
  render: function () {
    const { password } = this.state
    const { getFieldProps } = this.props.form;
    const passwdProps = getFieldProps('passwd', {
      rules: [
        { whitespace: true },
        { validator: this.checkPass },
      ],
    });
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{
        required: true,
        whitespace: true,
        message: '请再次输入密码',
      }, {
        validator: this.checkPass2,
      }],
    });
    return (
      <div id='UserInfReset'>
        <Form horizontal form={this.props.form}>
          <Row>
            <Col>
              <FormItem hasFeedback>
                <Input type={password} className="passInt" {...passwdProps} placeholder="输入新密码" autoComplete="off" ref='intPass' />
                <Icon type="eye"
                  onClick={this.handleChange}
                  className={password === 'text' ? 'passIcon' : ''} />
              </FormItem>
            </Col>
          </Row>
          <FormItem hasFeedback>
            <Input type={password} className="passInt" {...rePasswdProps}
              autoComplete="off"
              placeholder="两次输入密码保持一致" />
          </FormItem>
          <FormItem>
            <Button type="ghost" onClick={this.handleCancel} style={{ backgroundColor: '#efefef' }}>
              取消
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button type="primary" onClick={this.handleSubmit}>确定</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
})
ResetPassWord = createForm()(ResetPassWord);
class Information extends Component {
  constructor(props) {
    super(props)
    this.handleRevise = this.handleRevise.bind(this)
    this.resetPsw = this.resetPsw.bind(this)
    this.state = {
      revisePass: false,
      number: 10,
      visibleMember: false,// member account
      selectUserRole: 1
    }
  }
  handleRevise() {
    this.setState({
      revisePass: true
    })
  }
  resetPsw() {
    this.setState({
      revisePass: false
    })
  }
  componentWillMount(){
    const { editPass, location } = this.props
    if(location.hash == '#edit_pass') {
      this.setState({
        revisePass: true
      })
      return
    }
    this.setState({
      revisePass: editPass
    })
  }
  componentWillReceiveProps(nextProps) {
    const hash = nextProps.location.hash
    if(this.props.location.hash != hash) {
      if(hash == '#edit_pass') {
        this.setState({
          revisePass: true
        })
      }
      if(!hash) {
        this.setState({
          revisePass: false
        })
      }
    }
  }
  activeMenu(number) {
    this.setState({number})
  }
  memberRecharge(userDetail, roleName) {
    const record = {
      name: userDetail.displayName,
      namespace:userDetail.namespace,
      style: roleName,
      balance: parseAmount(userDetail.balance || 0).fullAmount
    }
    this.setState({
      visibleMember: true,
      record
    })
  }
  changeUser() {
    let notification = new NotificationHandler()
    const amount = parseInt(this.state.number)
    const body = {
      namespaces: [this.state.record.namespace],
      amount
    }
    if (!amount || amount <=0 ) {
      notification.info('请选择充值金额, 且不能为负数')
      return
    }
    const oldBalance = parseAmount(this.props.userDetail.balance, 4).amount
    if (oldBalance + amount >= MAX_CHARGE ) {
      // balance (T) + charge memory not 200000
      let isnewBalance = Math.floor(MAX_CHARGE - oldBalance )
      let newBalance = isnewBalance > 0 ? isnewBalance : 0
      notification.info(`充值金额大于可充值金额，最多还可充值 ${newBalance}`)
      return
    }
    const { loadLoginUserDetail, loadUserDetail, chargeUser} = this.props
    const _this = this
    const { userID, userDetail, loginUser} = this.props
    chargeUser(body, {
      success: {
        func: (ret) => {
          _this.setState({visibleMember: false})
          notification.success('充值成功')
          if (userDetail.namespace== loginUser.namespace) {
            loadLoginUserDetail()
            return
          }
          loadUserDetail(userID)
        },
        isAsync: true
      }
    })
  }
  changeUserRoleModal() {
    const { userDetail } = this.props
    this.setState({
      changeUserRoleModal: true,
      selectUserRole: userDetail ? userDetail.role + 1 : 3
    })
  }
  changeUserRoleRequest() {
    const { updateUser, loginUser, userID, userDetail, changeUserRole } = this.props
    const notify = new NotificationHandler()
    if(loginUser.role != 2) { return notify.error('只有系统管理员用户有此权限')}
    if(userDetail.role + 1 == this.state.selectUserRole ) {
      notify.error('用户角色没有发生变化')
      return
    }
    notify.spin('更新用户角色中')
    const self = this
    updateUser(userID, { role: this.state.selectUserRole }, {
      success: {
        func: () => {
          notify.close()
          notify.success('用户角色更新成功')
          self.setState({
            changeUserRoleModal: false
          })
          changeUserRole(userID, this.state.selectUserRole - 1)
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          notify.close()
          if(res.statusCode == 401) {
            notify.error('权限不足')
            return
          }
          notify.error('用户角色更新失败')
        }
      }
    })

  }
  render() {
    const { revisePass } = this.state
    const { userID, userDetail, updateUser, loginUser } = this.props
    let roleName
    switch (userDetail.role) {
      case ROLE_TEAM_ADMIN:
        roleName = "团队管理员"
        break
      case ROLE_SYS_ADMIN:
        roleName = "系统管理员"
        break
      default:
        roleName = "普通用户"
    }
    let balance = parseAmount(userDetail.balance || 0).amount
    return (
      <div id='Information'>
        <Row className="Item">
          <Col span={4}>名称</Col>
          <Col span={20}>{userDetail.displayName}</Col>
        </Row>
        <Row className="Item">
          <Col span={4}>类型</Col>
          <Col span={2}>{roleName}</Col>
          {loginUser.role == 2 && userID && userDetail.userName != 'admin' ? <Col span={10}> <Button type="primary" onClick={() => this.changeUserRoleModal()}>修改用户角色</Button></Col> : ''}
        </Row>
        <Row className="Item">
          <Col span={4}>手机</Col>
          <Col span={20}>{userDetail.phone || '-'}</Col>
        </Row>
        <Row className="Item">
          <Col span={4}>邮箱</Col>
          <Col span={20}>{userDetail.email}</Col>
        </Row>
        { userDetail && userDetail.type == 1 ? <Row className="Item">
          <Col span={4}>修改密码</Col>
          <Col span={20}>
            {
              revisePass ?
                <ResetPassWord updateUser={updateUser} userID={userID} userDetail={userDetail} onChange={this.resetPsw} />
                :
                <Button type="primary" onClick={this.handleRevise}>修改密码</Button>
            }
          </Col>
        </Row> : ''}
        <Row className="Item" style={{ border: 'none' }}>
          <Col span={4}>余额</Col>
          <Col span={2}>{balance}T</Col>
          {/*  system user  */}
          {(ROLE_SYS_ADMIN == this.props.loginUser.role) ?
            <Col span={16}><Button type="primary" onClick={()=>　this.memberRecharge(userDetail,roleName)}>充值</Button></Col>
            :null
          }
        </Row>
         {/* 充值modal */}
        <Modal title="成员充值" visible={this.state.visibleMember}
         onCancel={()=> this.setState({visibleMember: false,number: 10})}
         onOk={()=> this.changeUser()}
         width={600}
        >
          <MemberRecharge parentScope={this} visible={this.state.visibleMember}/>
        </Modal>
        <Modal title="修改用户角色" visible={this.state.changeUserRoleModal} onCancel={() => this.setState({ changeUserRoleModal: false, selectUserRole: userDetail.role + 1 })} onOk={() => this.changeUserRoleRequest()}>
          <RadioGroup onChange={(e) => {this.setState({ selectUserRole: e.target.value })}}  value={this.state.selectUserRole}>
            <Radio key="a" value={3}>系统管理员</Radio>
            <Radio key="b" value={2}>团队管理员</Radio>
            <Radio key="c" value={1}>普通成员</Radio>
          </RadioGroup>
        </Modal>
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  const loginUser = state.entities.loginUser.info
  let userDetail = props.userDetail
  if (props.userDetail.namespace == loginUser.namespace) {
    userDetail = loginUser
  }
  return {
    userDetail,
    loginUser
  }
}

export default connect(mapStateToProp, {
  updateUser,
  loadLoginUserDetail, // 登录用户信息
  loadUserDetail,// 用户或者成员信息
  chargeUser,
  changeUserRole
})(Information)
