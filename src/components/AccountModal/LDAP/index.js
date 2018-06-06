/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * LDAP component
 *
 * v0.1 - 2017-05-19
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Form, Input, Button, Radio, Modal, InputNumber } from 'antd'
import { getLdap, upsertLdap, syncLdap, removeLdap } from '../../../actions/ldap'
import Notification from '../../../common/notification_handler'
import { formatDate } from '../../../common/tools'
import MemberImg from '../../../assets/img/account/member.png'
import ArrowImg from '../../../assets/img/account/arrow.png'
import LDAPImg from '../../../assets/img/account/ldap.png'
import './style/LDAP.less'
import Title from '../../Title'

const FormItem = Form.Item
const notification = new Notification()
let fieldsChange = false

function showValue(value) {
  if (value === undefined) {
    return '-'
  }
  return value
}

class LDAP extends Component {
  constructor(props){
    super(props)
    this.checkHost = this.checkHost.bind(this)
    this.handleSyncLdap = this.handleSyncLdap.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handelCancelLiftIntegration = this.handelCancelLiftIntegration.bind(this)
    this.handleLiftIntegration = this.handleLiftIntegration.bind(this)
    this.loadLdap = this.loadLdap.bind(this)
    this.renderLastDetail = this.renderLastDetail.bind(this)
    this.removeLdap = this.removeLdap.bind(this)
    this.setLdapForm = this.setLdapForm.bind(this)
    this.cancelEditLdap = this.cancelEditLdap.bind(this)
    this.setFormToDefault = this.setFormToDefault.bind(this)
    this.state = {
      LiftIntegrationModalVisible: false,
      synBtnLoading: false,
      saveBtnLoading: false,
    }
  }

  componentWillMount() {
    this.loadLdap()
  }

  loadLdap() {
    const { getLdap } = this.props
    getLdap({
      success: {
        func: res => {
          if (!res.data) {
            return
          }
          this.setLdapForm(res.data)
        }
      },
      finally: {
        func: () => {
          this.setState({
            saveBtnLoading: false,
          })
        },
      }
    })
  }

  cancelEditLdap(e) {
    this.setLdapForm(this.props.ldap)
  }

  setLdapForm(ldap) {
    const { form } = this.props
    const { setFieldsValue, resetFields } = form
    resetFields()
    const {
      addr, base, bindDN, tls, userFilter, userProperty, emailProperty, bindPassword
    } = ldap.configDetail || {}
    setFieldsValue({
      addr,
      base,
      bindDN,
      tls: tls || 'none',
      bindPassword,
      userFilter,
      userProperty,
      emailProperty,
    })
    fieldsChange = false
  }

  handelCancelLiftIntegration(){
    this.setState({
      LiftIntegrationModalVisible: false
    })
  }

  handleLiftIntegration(){
    this.setState({
      LiftIntegrationModalVisible: true
    })
  }

  checkHost(rule, value, callback){
    if (!value) {
      return callback()
    }
    if (!/^([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的 LDAP 服务地址')
    }
    callback()
  }

  handleSyncLdap(e){
    const { syncLdap } = this.props
    this.setState({
      synBtnLoading: true,
    })
    syncLdap({
      success: {
        func: res => {
          notification.success('同步成功')
          this.loadLdap()
        },
        isAsync: true,
      },
      failed: {
        func: error => {
          notification.error('同步失败')
        },
        isAsync: true,
      },
      finally: {
        func: () => {
          this.setState({
            synBtnLoading: false,
          })
        },
        isAsync: true,
      }
    })
  }

  handleSave(){
    const { form, upsertLdap, ldap } = this.props
    form.validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        saveBtnLoading: true,
      })
      const body = {
        configDetail: JSON.stringify(values)
      }
      upsertLdap(body, {
        success: {
          func: res => {
            notification.success('保存企业集成信息成功')
            this.loadLdap()
          },
          isAsync: true,
        },
        failed: {
          func: error => {
            let errorMessage = error.message
            let { message } = errorMessage
            if (message === undefined) {
              message = errorMessage
            }
            notification.error('保存企业集成信息失败', message)
            this.setState({
              saveBtnLoading: false,
            })
          },
          isAsync: true,
        },
      })
    })
  }

  setFormToDefault() {
    const { form } = this.props
    const { setFieldsValue, resetFields } = form
    resetFields()
    setFieldsValue({
      tls: 'none',
      userFilter: '(objectClass=person)',
      emailProperty: 'mail',
      userProperty: 'cn',
    })
  }

  removeLdap(removeuser) {
    const { removeLdap, getLdap } = this.props
    let query
    if (removeuser !== undefined) {
      query = {
        removeuser,
      }
    }
    removeLdap(query, {
      success: {
        func: res => {
          let message = '解除集成成功'
          if (removeuser) {
            message += `，并移除${res.data.removedUsers}个用户`
          }
          notification.success(message)
          this.setState({
            LiftIntegrationModalVisible: false,
          })
          this.loadLdap()
          this.setFormToDefault()
        },
        isAsync: true,
      },
      failed: {
        func: error => {
          notification.error('解除集成失败')
        },
        isAsync: true,
      },
    })
  }

  renderLastDetail() {
    const { ldap } = this.props
    const { configDetail, userSummary, lastSyncInfo } = ldap
    const { dbUserCount, ldapUserCount, ldapUserInDBCount } = userSummary || {}
    const {
      addedUsers, updatedUsers, deletedUsers,
      invalidUsers, conflictUsers, failedUsers,
      syncDate
    } = lastSyncInfo || {}
    return (
      <div className='lastDetails'>
        <Title title="集成企业目录" />
        <div className='title'>上次同步详情</div>
        <div className='container'>
          <div className='imgcomtainer'>
            <Row>
              <Col span={9} className='leftcol'>
                <img src={MemberImg} alt=""/>
                <div className='leftcoltips'>平台成员：<span>{showValue(dbUserCount)}</span></div>
              </Col>
              <Col span={6} className='centercol'>
                <img src={ArrowImg} alt=""/>
                <Button type="primary" loading={this.state.synBtnLoading} onClick={this.handleSyncLdap}>立即同步</Button>
              </Col>
              <Col span={9} className='rightcol'>
                <img src={LDAPImg} alt=""/>
                <div className='rightcoltips'>LDAP成员：<span>{showValue(ldapUserCount)}</span></div>
              </Col>
            </Row>
          </div>
           {
             lastSyncInfo && (
              <div className="lastSyncInfo">
                <Row className='item itemfirst'>
                  <Col span={4} className='item_title'><div>上次同步时间</div></Col>
                  <Col span={20} className='item_content'><div>{formatDate(syncDate)}</div></Col>
                </Row>
                <Row className='item itemfirst'>
                  <Col span={4} className='item_title'>上次同步成员</Col>
                  <Col span={20} className='item_content'>
                    增<span className='number'>{showValue(addedUsers)}</span>,
                    删<span className='number'>{showValue(deletedUsers)}</span>,
                    改<span className='number'>{showValue(updatedUsers)}</span>
                  </Col>
                </Row>
                <Row className='item itemfirst'>
                  <Col span={4} className='item_title'></Col>
                  <Col span={20} className='item_content'>
                    有<span className="number">{showValue(invalidUsers)}</span>个成员名称不合法，
                    有<span className="number">{showValue(conflictUsers)}</span>个成员与平台成员冲突，
                    有<span className="number">{showValue(failedUsers)}</span>个成员同步时失败<br/>
                    共计<span className="number">{invalidUsers + conflictUsers + failedUsers}</span>个成员同步失败。
                  </Col>
                </Row>
              </div>
            )
           }
        </div>
      </div>
    )
  }

  render() {
    const { form, ldapFetching, ldap } = this.props
    const { configID, configDetail, warningMessage } = ldap
    const { getFieldProps } = form
	  const AddrProps = getFieldProps('addr', {
      rules: [
        { required: true, message: '请输入 LDAP 服务地址' },
        { validator: this.checkHost }
      ],
    })
    // const PortProps = getFieldProps('port')
    const BaseBNProps = getFieldProps('base', {
      rules: [
        { required: true, message: '请输入 Base DN' },
      ],
    })
    const UserDNProps = getFieldProps('bindDN',{
      rules: [
        { message: '请输入 User DN' },
      ],
    })
    const PasswordProps = getFieldProps('bindPassword', {
      rules: [
        { message: '请输入密码' },
      ],
    })
    const TlsProps =  getFieldProps('tls', {
      initialValue: 'none',
    });
    const UserObjectFiltersProps = getFieldProps('userFilter', {
      initialValue: '(objectClass=person)',
    })
    const UserEmailProps = getFieldProps('emailProperty', {
      initialValue: 'mail',
    })
    const UserObjectProps = getFieldProps('userProperty', {
      initialValue: 'cn',
    })
    return (
      <div id="account_ldap">
        <div className='alertRow'>通过配置以下信息可将企业用户目录信息同步到该平台。所有接入的成员都默认是普通成员，同步到平台后，可修改成员类型（系统管理员、团队管理员、普通成员）；*为必填字段，其他为选填字段。</div>
        {configID && this.renderLastDetail()}
        <div className='basicSetup'>
          <div className='title'>
            基本设置
            {
              warningMessage && (
                <font>（ LDAP 连接失败，请检查配置信息是否正确）</font>
              )
            }
          </div>
          <div className="container">
            <Form>
              <div className='type rowPadding'>
                <Row className='itemtype'>
                  <Col span={4} className='item_title'>类型<span className='star'>*</span></Col>
                  <Col span={20} className='item_content'>OpenLDAP</Col>
                </Row>
              </div>
              <div className='host_port rowPadding'>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>Addr<span className='star'>*</span></Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...AddrProps} placeholder="请输入 LDAP 服务地址"/>
                    </FormItem>
                  </Col>
                </Row>
                {/*<Row className='item_input'>
                  <Col span={4} className='item_title'>Port</Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <InputNumber style={{ width: "50%" }} min={0} max={65535} {...PortProps} placeholder='例：389'/>
                    </FormItem>
                  </Col>
                </Row>*/}
              </div>
              <div className='host_port rowPadding'>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>Base DN<span className='star'>*</span></Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...BaseBNProps} placeholder="例：dc=demo, dc=com"/>
                    </FormItem>
                  </Col>
                </Row>
              </div>
              <div className='host_port rowPadding'>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>User DN</Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...UserDNProps} placeholder="例：cn=admin, dc=demo, dc=com"/>
                    </FormItem>
                  </Col>
                </Row>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>Password</Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input type="password" {...PasswordProps} placeholder='请输入密码'/>
                    </FormItem>
                  </Col>
                </Row>
              </div>
              <div className='synchronous rowPadding'>
                <Row className='firstrow'>
                  <Col span={4} className='item_title'>同步方式<span className='star'>*</span></Col>
                  <Col span={20} className='item_content'>
                    <Radio checked={true}></Radio>仅手动同步
                  </Col>
                </Row>
                <Row className='seconderow'>
                  <Col span={4} className='item_title'></Col>
                  <Col span={20} className='item_content'>
                    仅手动同步，需要手动点击『立即同步』按钮即可将用户目录信息接入到平台，会自动覆盖相同名字的成员，在平台上已删除的LDAP成员会被再次同步到平台上，删除LDAP中已删除成员
                  </Col>
                </Row>
                <Row className='thirdrow'>
                  <Col span={4} className='item_title'>协议</Col>
                  <Col span={20} className='item_content'>
                    <Radio.Group {...TlsProps}>
                      <Radio key="ldap" value="none" className='leftradio'>LDAP</Radio>
                      <Radio key="ldaps" value="always">LDAPS</Radio>
                    </Radio.Group>
                  </Col>
                </Row>
              </div>
              <div className="userinfo rowPadding">
                <Row className='item_input'>
                  <Col span={4} className='item_title'>用户对象过滤器</Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...UserObjectFiltersProps} placeholder="例：cn=admin, dc=demo, dc=com"/>
                    </FormItem>
                  </Col>
                </Row>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>用户邮箱属性</Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...UserEmailProps} placeholder='mail'/>
                    </FormItem>
                  </Col>
                </Row>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>用户对象属性</Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...UserObjectProps} placeholder='cn'/>
                    </FormItem>
                  </Col>
                </Row>
              </div>
              <div className='buttonrow rowPadding'>
                <Row>
                  <Col span={4} className='item_title'></Col>
                  <Col span={20} className='item_content'>
                  {
                    fieldsChange && <Button className='leftbutton' onClick={this.cancelEditLdap}>取消</Button>
                  }
                    <Button type="primary" onClick={this.handleSave} loading={this.state.saveBtnLoading}>保存</Button>
                  </Col>
                </Row>
              </div>
            </Form>
          </div>
        </div>
        {
          configID && (
            <div className='handle'>
              <div className="title">操作</div>
              <div className="container">
                <div className='tips'>
                  <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
                  请注意，点击解除企业用户目录集成，可选择仅解除集成或同时移除已经同步的用户，该操作不能被恢复
                </div>
                <div className='remove'>
                  <Button className='removeButton' onClick={this.handleLiftIntegration}>解除</Button>
                </div>
              </div>
            </div>
          )
        }
         <Modal
           title="解除集成"
           visible={this.state.LiftIntegrationModalVisible}
           closable={true}
           onCancel={this.handelCancelLiftIntegration}
           width='570px'
           maskClosable={false}
           wrapClassName="LiftIntegrationModal"
           footer={[
             <Button onClick={this.handelCancelLiftIntegration} size="large">取消</Button>,
             <Button onClick={this.removeLdap.bind(this, 1)} size="large">解除集成并移除用户</Button>,
             <Button onClick={this.removeLdap} type="primary" size="large">仅解除集成</Button>
           ]}
         >
           <div>
             <div className='title'>是否解除集成企业用户目录?</div>
             <div className='tips'>
               <div className='iconcontainer'>
                 <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
               </div>
               <div className='item'>
                 请注意，点击解除企业用户目录集成，可选择仅解除集成或同时移除已经同步的用户，该操作不可被恢复！
               </div>
             </div>
           </div>
         </Modal>
      </div>
    )
  }
}

LDAP = Form.create({
  onFieldsChange: (props, fields) => {
    fieldsChange = true
  },
})(LDAP)

function mapStateToProps(state, props) {
  const { detail } = state.ldap
  return {
    ldapFetching: detail.isFetching,
    ldap: detail.result ? detail.result.data : {},
  }
}


export default connect(mapStateToProps, {
  getLdap,
  upsertLdap,
  syncLdap,
  removeLdap,
})(LDAP)