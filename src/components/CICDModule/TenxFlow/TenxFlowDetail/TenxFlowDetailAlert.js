/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowDetailAlert component
 *
 * v0.1 - 2016-10-21
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Switch, Radio, Checkbox, Card } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { updateTenxFlow } from '../../../../actions/cicd_flow'
import './style/TenxFlowDetailAlert.less'
import { browserHistory } from 'react-router';
import NotificationHandler from '../../../../common/notification_handler'
import Title from '../../../Title'

const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;
let DefaultEmailAddress = ''

const menusText = defineMessages({
  email: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.email',
    defaultMessage: '邮件通知',
  },
  otherEmail: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.otherEmail',
    defaultMessage: '使用其它邮箱',
  },
  alert: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.alert',
    defaultMessage: '通知场景',
  },
  alertFirst: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.alertFirst',
    defaultMessage: '每一个项目执行成功时，通知我',
  },
  alertSecond: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.alertSecond',
    defaultMessage: '每一个项目执行失败时，通知我',
  },
  alertThird: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.alertThird',
    defaultMessage: '自动部署成功',
  },
  alertForth: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.alertForth',
    defaultMessage: '自动部署失败',
  },
  cancel: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.cancel',
    defaultMessage: '取消',
  },
  submit: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.submit',
    defaultMessage: '确定',
  },
})

function checkEmailType(emailList, scope, type) {
  if (!Boolean(emailList)) {
    return DefaultEmailAddress;
  }
  if (emailList == DefaultEmailAddress) {
    if (type != 'init') {
      scope.setState({
        emailList: null
      });
    }
    return DefaultEmailAddress;
  } else if (emailList) {
    if (type != 'init') {
      scope.setState({
        emailList: emailList
      });
    }
    return 'others'
  } else {
    return ''
  }
}

let TenxFlowDetailAlert = React.createClass({
  getInitialState: function () {
    return {
      emailAlert: false,
      otherEmail: false,
      checkFirst: false,
      checkSecond: false,
      checkThird: false,
      checkForth: false,
      emailList: ''
    }
  },
  componentWillMount() {
    const { notify } = this.props;
    let flag = !!notify;
    if (notify == 'null') {
      flag = false;
    }
    this.setState({
      emailAlert: flag
    });
    if (flag) {
      let newNotify
      try {
        newNotify = JSON.parse(notify);
      } catch (e) {
        this.setState({
          emailAlert: false
        })
        return
      }
      let otherEmail = true;
      let emailList = newNotify.email_list;
      if (newNotify.email_list == DefaultEmailAddress) {
        otherEmail = null
        emailList = ''
      }
      this.setState({
        checkFirst: newNotify.ci.success_notification,
        checkSecond: newNotify.ci.failed_notification,
        checkThird: newNotify.cd.success_notification,
        checkForth: newNotify.cd.failed_notification,
        emailList: emailList,
        otherEmail: otherEmail
      });
    }
  },
  onChangeEmailAlert(e) {
    //this function for user select email alert or now
    this.props.form.resetFields(['radioEmail']);
    this.props.form.resetFields(['inputEmail']);
    this.setState({
      emailAlert: e
    });
  },
  radioEmailCheck(rule, value, callback) {
    if (this.state.emailAlert && !!!value) {
      callback([new Error('请选择邮件通知地址')]);
    } else {
      callback();
    }
  },
  onChangeAlertEmail(e) {
    //this function for user select alert email
    this.props.form.resetFields(['inputEmail']);
    if (e.target.value == 'others') {
      //it's mean user input the email by himself
      this.setState({
        otherEmail: true
      });
    } else {
      this.setState({
        otherEmail: false
      });
    }
  },
  emailInputCheck(rule, value, callback) {
    if (this.state.otherEmail && !!!value) {
      callback([new Error('请输入邮件通知地址')]);
    } else {
      if (this.state.otherEmail) {
        if (value.indexOf(',', value.length - 1) == -1) {
          value += ',';
        }
        let emailList = value.split(',');
        let emailCheck = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        let flag = true;
        emailList.map((item) => {
          if (item.trim() != '' && !emailCheck.test(item)) {
            flag = false;
            callback([new Error('请输入正确邮件地址')]);
          }
        });
        if (flag) {
          callback();
        }
      } else {
        callback();
      }
    }
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope, notify } = this.props;
    const newNotify = JSON.parse(notify);
  },
  handleSubmit(e) {
    //this function for user submit the form
    const { scope } = this.props;
    const _this = this;
    const { updateTenxFlow, flowId } = this.props;
    let scopeHistory = scope.props.history;
    let notification = new NotificationHandler()
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        e.preventDefault();
        return;
      }
      if (!this.state.emailAlert) {
        let body = {
          'notification_config': null
        }
        updateTenxFlow(flowId, body, {
          success: {
            func: () => {
              notification.success('修改构建通知成功');
              this.setState({
                otherEmail: false,
                checkFirst: false,
                checkSecond: false,
                checkThird: false,
                checkForth: false,
                emailList: null
              });
            },
            isAsync: true
          }
        });
      } else {
        let emailList = ''
        if (this.state.otherEmail) {
          emailList = values.inputEmail
          if (typeof values.inputEmail === 'string') {
            emailList = values.inputEmail.split(',')
          }
        } else {
          emailList = [DefaultEmailAddress];
        }
        let temp = {
          'email_list': emailList,
          'ci': {
            'success_notification': values.checkFirst,
            'failed_notification': values.checkSecond
          },
          'cd': {
            'success_notification': values.checkThird,
            'failed_notification': values.checkForth
          }
        }
        let body = {
          'notification_config': JSON.stringify(temp)
        }
        updateTenxFlow(flowId, body, {
          success: {
            func: () => {
              notification.success('修改构建通知成功');
            },
            isAsync: true
          }
        });
      }
    });
  },
  render() {
    const _this = this;
    const { formatMessage } = this.props.intl;
    const { scope, notify } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const radioEmailProps = getFieldProps('radioEmail', {
      rules: [
        { validator: this.radioEmailCheck },
      ],
      onChange: this.onChangeAlertEmail,
      initialValue: checkEmailType(this.state.emailList, _this, 'init')
    });
    const checkEmailProps = getFieldProps('inputEmail', {
      rules: [
        { validator: this.emailInputCheck },
      ],
      initialValue: this.state.emailList
    });
    return (
      <Card id='TenxFlowDetailAlert' key='TenxFlowDetailAlert'>
        <Title title="EnnFlow" />
        <Form horizontal>
          <div className='commonBox'>
            <div className='title'>
              <span><FormattedMessage {...menusText.email} /></span>
            </div>
            <div className='input'>
              <Switch onChange={this.onChangeEmailAlert} checked={this.state.emailAlert} />
              {this.state.emailAlert ? [
                <QueueAnim type='right' key='selectedEmailAnimate'>
                  <div className='selectedEmail' key='selectedEmail'>
                    <FormItem>
                      <RadioGroup {...radioEmailProps} >
                        <Radio key='a' value={DefaultEmailAddress}>{DefaultEmailAddress}</Radio><br />
                        <Radio key='b' value={'others'}><FormattedMessage {...menusText.otherEmail} /></Radio><br />
                      </RadioGroup>
                    </FormItem>
                    <FormItem className='emailInputForm'>
                      <Input {...checkEmailProps} type='text' size='large' disabled={!this.state.otherEmail} />
                    </FormItem>
                  </div>
                </QueueAnim>
              ] : null}
            </div>
            <div style={{ clear: 'both' }} />
          </div>
          {this.state.emailAlert ? [
            <QueueAnim type='right' key='checkedEmailAnimate'>
              <div className='commonBox' key='checkedEmail'>
                <div className='title'>
                  <span><FormattedMessage {...menusText.alert} /></span>
                </div>
                <div className='input alert'>
                  <FormItem className='checkBox'>
                    <Checkbox {...getFieldProps('checkFirst', { valuePropName: 'checked', initialValue: this.state.checkFirst }) } >
                      <FormattedMessage {...menusText.alertFirst} />
                    </Checkbox><br />
                    <Checkbox {...getFieldProps('checkSecond', { valuePropName: 'checked', initialValue: this.state.checkSecond }) } >
                      <FormattedMessage {...menusText.alertSecond} />
                    </Checkbox><br />
                    <Checkbox {...getFieldProps('checkThird', { valuePropName: 'checked', initialValue: this.state.checkThird }) } >
                      <FormattedMessage {...menusText.alertThird} />
                    </Checkbox><br />
                    <Checkbox {...getFieldProps('checkForth', { valuePropName: 'checked', initialValue: this.state.checkForth }) } >
                      <FormattedMessage {...menusText.alertForth} />
                    </Checkbox>
                  </FormItem>
                </div>
                <div style={{ clear: 'both' }} />
              </div>
            </QueueAnim>
          ] : null}
          <div className='btnBox'>
            <Button size='large' type='ghost' onClick={this.handleReset}>
              <FormattedMessage {...menusText.cancel} />
            </Button>
            <Button size='large' type='primary' onClick={this.handleSubmit}>
              <FormattedMessage {...menusText.submit} />
            </Button>
          </div>
        </Form>
      </Card>
    )
  }
});

function mapStateToProps(state, props) {
  const {entities} = state
  if (entities && entities.loginUser && entities.loginUser.info && entities.loginUser.info) {
    DefaultEmailAddress = entities.loginUser.info.email
  }
  return {

  }
}

TenxFlowDetailAlert = createForm()(TenxFlowDetailAlert);

TenxFlowDetailAlert.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  updateTenxFlow
})(injectIntl(TenxFlowDetailAlert, {
  withRef: true,
}));

