/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Create Alarm component
 *
 * v0.1 - 2017-3-20
 * @author BaiYu
 */

import React from 'react'
import { Input, Form, Icon, Button, Modal, Transfer, Collapse, Row, Col } from 'antd'

import { sendAlertNotifyInvitation, getAlertNotifyInvitationStatus, sendPhone, sendPhonemobile, getPhoneContent, getPhoneStatus, createNotifyGroup, modifyNotifyGroup, loadNotifyGroups } from '../../../actions/alert'
import { getSpaceList } from '../../../actions/team'
import { connect } from 'react-redux'
import moment from 'moment'
import NotificationHandler from '../../../common/notification_handler'
import MemberTransfer from './taemlist'
import { toUnicode } from 'punycode';
import './style/AlarmModal.less'
import { constants } from 'os';
const EMAIL_STATUS_WAIT_ACCEPT = 0
const EMAIL_STATUS_ACCEPTED = 1
const EMAIL_STATUS_WAIT_SEND = 2
const Panel = Collapse.Panel;

// create alarm group from
let mid = 0
let eid = 0
let CreateAlarmGroup = React.createClass({
  getInitialState() {
    return {
      isAddEmail: 1,
      isAddPhone: 1,
      transitionTime1: '验证邮件',
      statusValue: false,
      connectValue: '',
      dlgTipTxt: '验证手机',
      seconds: 60,
      countingDone: false,
      statueValue: '',
      status: '',
      mockData: [],
      teamUserList: [],
      keys: [],
      phones: [],
      targetKeys: [],
      addKeys: [],
      deleteKeys: [],
      showValue: this.props.teamID == 'default' ? 1 : 0,
      statusProps: ''
    }
  },
  componentWillMount() {
    this.setState({
      statusValue: false
    })
    this.fillEmails(this.props)

    this.fillPhones(this.props)
    this.userlists(this.props)
  },
  componentDidMount() {

  },

  componentWillReceiveProps(nextProps) {
console.log(nextProps.spaceID != this.props.spaceID)
    if(nextProps&&nextProps.data!=undefined){
      console.log(22222222)
      // this.fillEmails(nextProps, this.props)
      this.userlists(nextProps)
      if(nextProps.data.groupID&&nextProps.data.groupID!=this.props.data.groupID){
        this.fillEmails(nextProps, this.props)
        this.fillPhones(nextProps, this.props)
        
        this.setState({
          statusProps: nextProps
        })
        this.userlists(nextProps)
        this.props = nextProps
      }
    }else if (nextProps && nextProps.spaceID != this.props.spaceID) {

      this.fillEmails(nextProps, this.props)
      this.fillPhones(nextProps, this.props)
      
      this.setState({
        statusProps: nextProps
      })
      this.userlists(nextProps)
      this.props = nextProps
     
    }else if(nextProps.data!=undefined){
      this.userlists(nextProps)
      if(nextProps.data.spaceID != this.props.data.spaceID){
        this.fillEmails(nextProps, this.props)
        this.fillPhones(nextProps, this.props)
        
        this.setState({
          statusProps: nextProps
        })
        this.userlists(nextProps)
        this.props = nextProps
      }

    }else{
      // this.userlists(nextProps)
    }
  },
  userlists(props) {
    console.log(111111111)
    const { getSpaceList } = props
    const { spaceID, teamID } = props
    getSpaceList(teamID, spaceID, {
      success: {
        func: (data) => {
          const userList = [];
          const key = []
          if (data.data.users.length > 0) {
            data.data.users.forEach((item) => {
              userList.push({ title: item.userName, description: item.email, key: item.userID, phone: item.phone, email: item.email, userName: item.userName })
              key.push(item.userID)
            })
            this.setState({
              teamUserList: userList,
              keys: key
            })
          }

        }
      }
    })

  },
  // verificationCode${itemPhone}
  fillPhones(newProps, oldProps) {
    const {
      isModify,
      data,
      form,
    } = newProps
    if (isModify) {
      let phone = []
      if(data.receivers.phone!=null){
        for (let item of data.receivers.phone) {
          eid++
          phone.push(eid)
          form.setFieldsValue({
            [`phone${eid}`]: item.num,
          })
          this.setState({
            [`phoneStatus${eid}`]: item.status,
          })
        }
        form.setFieldsValue({
          phone
        })
      }
    
    }
  },
  fillEmails(newProps, oldProps) {
    const {
      isModify,
      data,
      form,
    } = newProps
    // if (form.getFieldValue('keys') && form.getFieldValue('keys').length > 0) {
    //   return
    // }
    if (isModify) {
      // if (oldProps && oldProps.isModify === true) {
      //   return
      // }
      let keys = []
      for (let email of data.receivers.email) {
        mid++

        keys.push(mid)
        form.setFieldsValue({
          [`email${mid}`]: email.addr,
          [`remark${mid}`]: email.desc,
        })
        this.setState({
          [`emailStatus${mid}`]: email.status,
        })
      }
      form.setFieldsValue({
        keys
      })
    }
  },
  removeEmail(k) {
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      keys,
    });
    this.setState({ isAddEmail: 1 })
  },
  removePhone(itemphone) {
    const { form } = this.props;
    // can use data-binding to get
    let phone = form.getFieldValue('phone');
    phone = phone.filter((phone) => {
      return phone !== itemphone;
    });
    // can use data-binding to set
    form.setFieldsValue({
      phone,
    });
    this.setState({ isAddPhone: 1 })
  },
  addEmail() {
    const { form } = this.props
    form.validateFields((error, values) => {
      

      if (!!error) {
        return
      }
    })
    if (!this.state.isAddEmail) return
    
    mid++;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');

    keys = keys.concat(mid);
    
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys,
    });
    
    this.setState({ isAddEmail: false })
  },
  addPhone() {
    const { form } = this.props
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
    })
    
    if (!this.state.isAddPhone) return



    eid++;
    // can use data-binding to get
    let phone = form.getFieldValue('phone');
    phone = phone.concat(eid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      phone,
    });
    this.setState({ isAddPhone: false })
  },
  addRulePhone(key, rule, value, callback) {
    let error
    let newValue = value
    this.setState({
      newValue
    })
    let isAddPhone = true
    if (!Boolean(newValue)) {
      error = '请输入手机号码'
      isAddPhone = false
    }
    // /^1[34578]\d{9}$/
    if (!/^1[34578]\d{9}$/.test(newValue)) {
      error = '请输入正确的手机号码'
      isAddPhone = false
    }
    const { getFieldValue } = this.props.form
    const phone = getFieldValue('phone') || []
    phone.map(_key => {
      const phones = getFieldValue(`phone${_key}`)
      if (_key != key && value === phones) {
        error = '已填写过该手机号码'
        return
      }
    })
    callback(error)
    this.setState({ isAddPhone, newValue })
  },
  addRuleEmail(key, rule, value, callback) {

    let newValue = value
    let isAddEmail = true
    let error
    if (!Boolean(newValue)) {
      error = '请输入邮箱地址'
      isAddEmail = false
    }
    if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(newValue)) {
      error = '请输入正确的邮箱地址'
      isAddEmail = false
    }
    const { getFieldValue } = this.props.form
    const email = getFieldValue('keys') || []
    email.map(_key => {

      const emails = getFieldValue(`email${_key}`)
      if (_key != key && newValue === emails) {
        error = '已填写过该邮箱'
        return
      }
    })
    callback(error)

    this.setState({ isAddEmail, statueValue: value })
  },
  ruleEmail(k) {
    // send rule email
    let notification = new NotificationHandler()
    const _this = this
    let time = 60
    const { getFieldValue } = this.props.form
    const {
      sendAlertNotifyInvitation,
      getAlertNotifyInvitationStatus,
    } = this.props
    let email = getFieldValue(`email${k}`)
    if (!email) {
      return notification.error(`请输入邮箱地址`)
    }
    let sendNotify = function (email) {
      sendAlertNotifyInvitation([email], {
        success: {
          func: (result) => {
            _this.setState({ [`emailStatus${k}`]: EMAIL_STATUS_WAIT_ACCEPT })
            _this.getEmailStatusText(k, time)
            notification.success(`向 ${email} 发送邮件邀请成功`)
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            notification.error(`向 ${email} 发送邮件邀请失败`)
          }
        }
      })
    }
    if (email) {
      // check if email already accept invitation
      getAlertNotifyInvitationStatus(email, {
        success: {
          func: (result) => {
            if (email in result.data && result.data[email] === 1) {
              this.setState({
                [`emailStatus${k}`]: EMAIL_STATUS_ACCEPTED,
                ['transitionTime' + [k]]: '已接收邀请',
                ['transitionEnble' + [k]]: true
              })
            } else {
              sendNotify(email)
            }
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            notification.error(`向 ${email} 发送邮件邀请失败`)
          }
        }
      })
    } else {
      this.okModal()
    }
  },
  callbackValue(itemPhone, val) {
    let notification = new NotificationHandler()
    let isAddPhone = true
    const { getFieldValue } = this.props.form
    const { getPhoneContent } = this.props

    var myDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const {
      sendPhone,
      getPhoneStatus,
      // sendPhonemobile
    } = this.props
    let phone = getFieldValue(`phone${itemPhone}`)
    // `verificationCode${itemPhone}`
    let connect = getFieldValue(`verificationCode${itemPhone}`)
    if (!phone) {
      return notification.error(`请输入手机号码`)
    }
    if (!connect) {
      return notification.error(`请输入验证码`)
    }
    getPhoneContent(connect, myDate, phone).then((d) => {
      let notification = new NotificationHandler()
      if (d.response.result.state==true) {
        notification.success(`验证成功`)
        this.setState({
          stateValue: false,
          isAddPhone: false
        })
      } else {
        notification.error(`验证失败`)
        // callback(new Error('验证失败'))
        this.setState({
          stateValue: false,
          isAddPhone: false
        })
      }
    })
    // callback()
    this.setState({ isAddPhone, connect })
  },
  sendPhonecon(itemPhone, val) {
    let notification = new NotificationHandler()
    const _this = this
    let time = 60
    const { getFieldValue } = this.props.form
    const {
      sendPhone,
      getPhoneStatus,
      // sendPhonemobile
    } = this.props
    let phone = getFieldValue(`phone${itemPhone}`)
    if (!phone) {
      return notification.error(`请输入手机号码`)
    }
    // return false

    let sendNotifyPhone = function (phone) {
      sendPhone([phone], {
        success: {
          func: (result) => {
            if (result.status == 1) {
              _this.setState({
                status: 1
              })
              notification.success(`该 ${phone} 已经校验成功无需再次发送验证码`)
            } else {
              _this.setState({ [`phoneStatus${itemPhone}`]: EMAIL_STATUS_WAIT_ACCEPT })
              _this.getPhoneStatusText(itemPhone, time)
            }
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            notification.error(`${err.message} `)
          }
        }
      })
    }
    sendNotifyPhone(phone)
  },
  groupName(rule, value, callback) {
    // top email rule name
    let newValue = value.trim()
    if (!Boolean(newValue)) {
      callback(new Error('请输入名称'))
      return
    }
    if (newValue.length < 3 || newValue.length > 21) {
      callback(new Error('请输入3~21个字符'))
      return
    }
    callback()
  },
  groupDesc(rule, value, callback) {
    value = value.trim();
    if (value.length < 1) {
      callback(new Error('描述信息不能为空'))
      return
    } else if (value.length > 1024) {
      callback(new Error('描述信息不能大于1024个字符'))
      return
    }
    callback()
  },
  submitAddEmail() {
    // submit add email modal
    const { form } = this.props
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
    })
  },
  handCancel() {
    const { funcs, form } = this.props
    funcs.scope.setState({ createGroup: false, alarmModal: true, modifyGroup: false })
    form.resetFields()
    this.setState({
      isAddEmail: true,
      'transitionEnble0': false,
    })
  },
  okModal() {
    const { form, createNotifyGroup, modifyNotifyGroup, funcs, afterCreateFunc, afterModifyFunc, data, shouldLoadGroup, teamID } = this.props
    let notification = new NotificationHandler()
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      const { keys, teamUserList, targetKey } = this.state
      // have one email at least
      if (teamID == 'default'&&this.state.showValue!=0) {
        if (values.keys.length == 0 || values.phone.length == 0) {
          return notification.error('请至少添加一个邮箱及手机')
          
        }
      } else if (teamID != 'default') {
        if (!targetKey && values.phone.length == 0) {
          return notification.error('请至少添加一个邮箱及手机')
          
        }
      }



      let body = {
        name: values.groupName,
        desc: values.groupDesc,

        receivers: {
          email: [],
          phone: []
        },
      }
      let listValue = {
          email: [],
          status:1
      }
      // const { keys, teamUserList, targetKey } = this.state
      if (teamID != 'default' && targetKey) {
        var arrayA = targetKey;
        var arrayB = teamUserList
        //准备临时数组
        var result = [], arr;
        //遍历
        for (var i = 0; i < arrayA.length; i++) {
          //根据arrayA[i]的值，查找arrayB，如果arrayB中的有满足条件（arrayB中的对象，有key值等于arrayA[i]）的项，就会返回满足条件的项，否则返回underfind;
          arr = arrayB.find(function (val) { return val.key === arrayA[i] });
          //如果arr不是undefind，就会添加arr，否则添加{key:arrayA[i],num1:'0',num2:'0',num3:'0',tot:'0'}。
          arr ? result.push(arr) : null;

        }

        result.map((e) => {
          // listValue.phone.push({
          //   num: e.phone,
          //   status:1
          // })
          listValue.email.push(
             e.email.toLowerCase(),
             e.phone,
          )
          body.receivers.phone.push({
            num: e.phone,
            // desc: values[`verificationCode${itemPhone}`]
          })
          body.receivers.email.push({
            addr: e.email.toLowerCase(),
            // desc: values[`verificationCode${itemPhone}`]
          })
        })
      }
      values.phone.map((itemPhone) => {
        if (values[`phone${itemPhone}`]) {
          body.receivers.phone.push({

            num: values[`phone${itemPhone}`],
            desc: values[`verificationCode${itemPhone}`] || ''
          })
        }
      })
      // return false
      values.keys.map(function (k) {
        if (values[`email${k}`]) {
          body.receivers.email.push({
            addr: values[`email${k}`],
            desc: values[`remark${k}`] || '',
          })
        }
      })
      if (!this.props.isModify) {
        if (body.receivers.email.length == 0) {
          notification.error('请至少添加一个邮箱及手机')
          return
        }
        console.log(listValue,'---listValue----')
        createNotifyGroup(body,listValue, {
          success: {
            func: (result) => {
              funcs.scope.setState({ createGroup: false, alarmModal: true })
              form.resetFields()
              this.setState({
                isAddEmail: true,
                isAddPhone: true,
                'transitionEnble0': false,
                'transitionEnblePhone0': false,
                targetKey: []
              })
              if (afterCreateFunc) {
                afterCreateFunc()
              }
              if (shouldLoadGroup) {
                setTimeout(this.props.loadNotifyGroups(), 0)
              }
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              this.setState({
                'transitionEnble0': false,
              })
              if (err.message.code === 409) {
                notification.error('创建通知组失败', `通知组名字已存在，请修改后重试`)
              } else {
                notification.error(`创建通知组失败`, err.message.message)
              }
            },
            isAsync: true
          }
        })
      } else {
        modifyNotifyGroup(data.groupID, body, {
          success: {
            func: (result) => {
              funcs.scope.setState({ modifyGroup: false, alarmModal: true })
              form.resetFields()
              this.setState({
                isAddEmail: true,
                isAddPhone: true,
                'transitionEnble0': false,
                'transitionEnblePhone0': false,
              })
              if (afterModifyFunc) {
                afterModifyFunc()
              }
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              this.setState({
                'transitionEnble0': false,
                'transitionEnblePhone0': false,
              })
              notification.error(`修改通知组失败`, err.message.message)
            }
          }
        })
      }
    })
  },
  getEmailStatusText(k, time) {
    let text = '验证邮件'
    let enble = true
    switch (this.state[`emailStatus${k}`]) {
      case EMAIL_STATUS_WAIT_ACCEPT: {
        // text = '再次验证邮件'
        let timefunc = setInterval(() => {
          if (this.props.createGroup == false) {
            clearInterval(timefunc)
            this.setState({
              [`transitionEnble${k}`]: false,
            })
            return
          }
          if (time <= 1) {
            enble = false
            clearInterval(timefunc)
          }
          time--
          text = time + '秒后重新验证'
          this.setState({
            ['transitionTime' + [k]]: time == 0 ? '验证邮件' : text,
            ['transitionEnble' + [k]]: enble
          })
        }, 1000)
        return;
      }
      case EMAIL_STATUS_ACCEPTED:
        this.setState({
          ['transitionTime' + [k]]: '已接收邀请',
          ['transitionEnble' + [k]]: enble
        })
        return
      // default: this.setState({transitionTime:text})
    }
  },
  getPhoneStatusText(phone, time) {
    let text = '发送验证码'
    let enble = true
    switch (this.state[`phoneStatus${phone}`]) {
      case EMAIL_STATUS_WAIT_ACCEPT: {
        // text = '再次验证邮件'
        let timefunc = setInterval(() => {
          if (this.props.createGroup == false) {
            clearInterval(timefunc)
            this.setState({
              [`transitionEnblePhone${phone}`]: false,
              // statusValue:false
            })
            return
          }
          if (time <= 1) {
            enble = false
            clearInterval(timefunc)
          }
          time--
          text = time + '秒后重新验证'
          this.setState({
            ['transitionTime' + [phone]]: time == 0 ? '发送验证码' : text,
            ['transitionEnblePhone' + [phone]]: enble,
            // statusValue:true
          })
        }, 1000)
        return;
      }
      case EMAIL_STATUS_ACCEPTED:
        this.setState({
          ['transitionTime' + [phone]]: '已接收邀请',
          ['transitionEnblePhone' + [phone]]: enble
        })
        return
    }
  },
  onChangeList(targetKeys, direction, moveKeys) {
    this.setState({
      targetKey: targetKeys
    })
  },
  callbackList(key) {
    if (key.length != 0) {
      this.setState({
        showValue: 1
      })
    } else {
      this.setState({
        showValue: 0
      })
    }
  },
  render() {
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    let statusdata = this.state.showValue.toString()
    const { getFieldProps, getFieldValue } = this.props.form;
    const { funcs, teamID } = this.props
    getFieldProps('keys', {
      initialValue: [0],
    });
    getFieldProps('phone', {
      initialValue: [0],
    });
    const { isModify, data } = this.state.statusProps? this.state.statusProps:this.props

    const { keys, teamUserList, targetKey } = this.state
    const phoneItems = getFieldValue('phone').map((itemPhone) => {
      let indexPhone = Math.max(0, itemPhone - 1)
      let initAddrValuePhone = ''
      let initDescValueContent = ''
      if (isModify && data.receivers.phone!=null) {
        // initAddrValuePhone = data.receivers.phone[indexPhone].num
        // initDescValueContent = data.receivers.phone[indexPhone].desc
      }
      return (
        <div key={itemPhone} className="createEmailList" style={{ clear: 'both' }}>


          {this.state.showValue == 1 ? <div> <Form.Item style={{ float: 'left' }}>
            <Input {...getFieldProps(`phone${itemPhone}`, {
              rules: [
                { validator: this.addRulePhone.bind(this, itemPhone) }
              ],

              // initialValue: initAddrValuePhone,
            })} style={{ width: '150px', marginRight: 8 }}
            />
          </Form.Item>
            <Form.Item style={{ float: 'left', width: 90 }}>
              <Input placeholder="验证码" size="large" style={{ width: 80, marginRight: 8 }}
                {...getFieldProps(`verificationCode${itemPhone}`,
                )} />
            </Form.Item>
            <Button type="primary" style={{ padding: 5 }}
              disabled={this.state[`transitionEnblePhone${itemPhone}`]}
              size="large" onClick={() => {
                this.sendPhonecon(itemPhone, this)
              }}>
              {this.state[`transitionEnblePhone${itemPhone}`]
                ? this.state[`transitionTime${itemPhone}`]
                : '发送验证码'}
            </Button>
            <Button type="primary" style={{ padding: 5, marginLeft: 5 }}
              size="large" onClick={() => {
                this.callbackValue(itemPhone, this)
              }}>
              验证
            </Button>
            <Button size="large" style={{ marginLeft: 8 }} disabled={this.state[`transitionEnblePhone${itemPhone}`]}
              onClick={() => this.removePhone(itemPhone)}>取消</Button>
          </div> : ''
          }
        </div>
      )
    })
    const formItems = getFieldValue('keys').map((k) => {
      let indexed = Math.max(0, k - 1)
      let initAddrValue = ''
      let initDescValue = ''
      if (isModify && data.receivers.email[indexed]) {
        initAddrValue = data.receivers.email[indexed].addr
        initDescValue = data.receivers.email[indexed].desc
      }
      const { teamID } = this.props
      return (

        <div key={k} className="createEmailList" style={{ clear: 'both' }}>
          {this.state.showValue == 1 ? <div>
            <Form.Item style={{ float: 'left' }}>
              <Input {...getFieldProps(`email${k}`, {
                rules: [
                  { validator: this.addRuleEmail.bind(this, k) }
                ],
                initialValue: initAddrValue,
              })} style={{ width: '150px', marginRight: 8 }}
              />
            </Form.Item>
            <Form.Item style={{ float: 'left' }}>
              <Input placeholder="备注" size="large" style={{ width: 80, marginRight: 8 }} {...getFieldProps(`remark${k}`,
                { initialValue: initDescValue })} />
            </Form.Item>
            <Button type="primary" style={{ padding: 5 }} disabled={this.state[`transitionEnble${k}`]}
              size="large" onClick={() => this.ruleEmail(k)}>{this.state[`transitionEnble${k}`] ? this.state[`transitionTime${k}`] : '验证邮件'}
            </Button>
            <Button size="large" style={{ marginLeft: 8 }} disabled={this.state[`transitionEnble${k}`]}
              onClick={() => this.removeEmail(k)}>取消
            </Button>
          </div> : ''
          }
        </div>
      );
    });
    return (

      <Form className="alarmAction" form={this.props.form}>
        <Form.Item label="名称" {...formItemLayout} >
          <Input placeholder="请输入名称" {...getFieldProps(`groupName`, {
            rules: [
              { validator: this.groupName }
            ],
            initialValue: this.props.isModify ? this.props.data.name : '',
          })}
            disabled={!!this.props.isModify} />
        </Form.Item>
        <Form.Item label="描述" {...formItemLayout} >
          <Input type="textarea" {...getFieldProps(`groupDesc`, {
            rules: [
              { validator: this.groupDesc }
            ],
            initialValue: this.props.isModify ? this.props.data.desc : '',
          })
          } />
        </Form.Item>
        {teamID == 'default' ? '' :
          <div className="lables">
            <div className="keyleb">
              手机及邮箱
        </div>
            <div className="emaillItem" >
              <MemberTransfer
                onChange={this.onChangeList}
                userList={teamUserList}
                UserIDList={keys}
                targetKeys={targetKey}
                propsValue = {this.props}
              />
            </div>
          </div>
        }
        {
          <Row>
            <Col span={3}>
              <div className="keys">
                自定义
          </div>
            </Col>
            <Col span={21}>
              <Collapse defaultActiveKey={[]} onChange={this.callbackList}>
                <Panel header="自定义告警方式" key='1'>
                  {this.state.showValue == 1 ?
                    <div>
                      <div className="lables">
                        <div className="keys">
                          邮箱
                </div>
                        <div className="emaillItem" >
                          {formItems}
                          <div style={{ clear: 'both' }}>
                            <a onClick={() => this.addEmail()}><Icon type="plus-circle-o" /> 添加邮箱</a>
                          </div>
                        </div>
                      </div>
                      <div className="lables">
                        <div className="keys">
                          手机
                </div>
                        <div className="emaillItem" >
                          {phoneItems}
                          <div style={{ clear: 'both' }}>
                            <a onClick={() => this.addPhone()}><Icon type="plus-circle-o" /> 添加手机</a>
                          </div>
                        </div>
                      </div>
                    </div>
                    : undefined
                  }


                </Panel>
              </Collapse>
            </Col>
          </Row>
        }

        <div className="ant-modal-footer" style={{ margin: '0 -30px' }}>
          <Button type="ghost" size="large" onClick={() => this.handCancel()}>取消</Button>
          <Button type="primary" size="large" onClick={() => this.okModal()}>保存</Button>
        </div>
      </Form>
    )
  }
})

CreateAlarmGroup = Form.create()(CreateAlarmGroup)
function mapStateToProps(state, props) {
  const { spaceID, teamID } = state.entities.current.space
  return {
    spaceID,
    teamID
  }
}

export default connect(mapStateToProps, {
  sendAlertNotifyInvitation,
  getAlertNotifyInvitationStatus,
  getPhoneStatus,
  sendPhone,
  sendPhonemobile,
  getPhoneContent,
  createNotifyGroup,
  modifyNotifyGroup,
  loadNotifyGroups,
  getSpaceList
})(CreateAlarmGroup)
