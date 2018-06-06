/**
* Licensed Materials - Property of paas.enncloud.cn
* (C) Copyright 2016 TenxCloud. All Rights Reserved.
*
* codeRepo component
*
* v0.1 - 2016-10-31
* @author BaiYu
*/
import React, { Component, PropTypes } from 'react'
import { Alert, Icon, Menu, Button, Card, Input, Tabs, Tooltip, message, Dropdown, Form, Modal, Spin, Switch } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { addSvnManaged, getUserInfo } from '../../../actions/cicd_flow'
import { appNameCheck } from '../../../common/naming_validation'
import NotificationHandler from '../../../common/notification_handler'
import './style/SvnComponent.less'
const TabPane = Tabs.TabPane
const FormItem = Form.Item;
const menusText = defineMessages({
  search: {
    id: 'CICD.TenxStorm.search',
    defaultMessage: '搜索',
  },
  publicKey: {
    id: 'CICD.TenxStorm.publicKey',
    defaultMessage: '公钥授权',
  },
  back: {
    id: 'CICD.TenxStorm.back',
    defaultMessage: '返回',
  },
  creageCodeStore: {
    id: 'CICD.TenxStorm.creageCodeStore',
    defaultMessage: '关联代码仓库',
  },
  logout: {
    id: 'CICD.TenxStorm.logout',
    defaultMessage: '注销',
  },
  clickCopy: {
    id: 'CICD.TenxStorm.clickCopy',
    defaultMessage: '点击复制',
  },
  copyBtn: {
    id: 'CICD.TenxStorm.copyBtn',
    defaultMessage: '复制',
  },
  copySuccess: {
    id: 'CICD.TenxStorm.copySuccess',
    defaultMessage: '复制成功',
  },
  pubilicType: {
    id: 'CICD.TenxStorm.publicType',
    defaultMessage: '公有'
  },
  privateType: {
    id: 'CICD.TenxStorm.privateType',
    defaultMessage: '私有'
  }
})

let SvnComponent = React.createClass({
  getInitialState() {
    return {
      authorizeModal: false,
      privateType: true,
      submiting: false
    }
  },
  setModalStaus(status) {
    const parentScope = this.props.scope
    const typeList = parentScope.state.typeList
    if (!typeList.includes('svn')) {
      parentScope.setState({typeVisible: true})
      return
    }
    const scope = this.props.form
    setTimeout(function() {
      document.getElementById('name').focus()
    }, 0);
    if (status) {
      scope.resetFields()
    }
    this.setState({ authorizeModal: status })
  },
  svnNameCheck(rule, value, callback) {
    //this function for format svn name
    if (!value) {
      callback()
      return
    }
    let errorMsg = appNameCheck(value, '名称');
    if(errorMsg == 'success') {
      callback();
    } else {
      callback([new Error(errorMsg)]);
    }
  },
  handleSubmit(e) {
    e ? e.preventDefault() : null
    const self = this
    const parentScope = this.props.scope.state
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      const config = {
        "name": values.name,
        "repo_type": parentScope.repokey,
        "address": values.address,
        "is_private": self.state.privateType ? 0 : 1
      }
      if (!self.state.privateType) {
        config.username = values.username
        config.password = values.password
      }
      if (config.address.indexOf('http') == -1 && config.address.indexOf('svn') == -1) {
        Modal.warning({
          title: '地址输入有误',
          content: '只支持 HTTP, HTTPS, SVN 协议地址'
        });
        return
      }
      self.setState({ submiting: true })
      self.props.addSvnManaged(config, {
        success: {
          func: (res) => {
            self.setState({
              authorizeModal: false,
              submiting: false,
              actionModal: true,
              privateType: true // default switch on switch private or public
            })
            self.props.form.resetFields()
          }
        },
        failed: {
          func: (res) => {
            let notification = new NotificationHandler()
            self.setState({ submiting: false })
            if (res.statusCode === 500) {
              notification.error('无法连接到 SVN 服务器，请检查输入地址和服务器可用性')
            } else if (res.statusCode === 409) {
              notification.error('所添加项目（' + config.name + '）地址已经存在，修改后重试')
            } else if (res.statusCode === 401) {
              notification.error('用户名、密码错误，或该用户无权访问')
            }else if(res.statusCode==404){
                notification.error('添加失败：所添加项目地址无效')
            } else {
              notification.error('添加失败：请检测您的SVN代码源')
            }
          }
        }
      })
    })
  },
  render() {
    const { config, scope, formatMessage } = this.props
    const { getFieldProps, getFieldValue } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 }, wrapperCol: { span: 18 }
    };
    const forName = getFieldProps('name', {
      rules: [
        { required: true, message: "请输入名称" },
        { validator: this.svnNameCheck }
      ],
    });
    const forUrl = getFieldProps('address', {
      rules: [
        { required: true, message: "请输入地址" }
      ],
    });
    const forType = getFieldProps('type', {
      initialValue: true
    });
    const forUsername = getFieldProps('username', {
    });
    const forPassword = getFieldProps('password', {
    });
    return (
      <div id="svnBox">
        <Button type="primary" size="large" onClick={() => this.setModalStaus(true)}>添加 SVN 代码仓库</Button>
        <Modal title="添加 SVN 代码源" wrapClassName="svnModal" visible={this.state.authorizeModal}
          onCancel={() => this.setModalStaus(false)} maskClosable={false}
          footer={[<Button type="ghost" size="large" onClick={()=>this.setState({authorizeModal: false})}>取消</Button>,
          <Button type="primary" size="large" htmlType="submit" onClick={()=> this.handleSubmit()} loading={this.state.submiting} style={{marginLeft:'8px'}}>确定</Button>]}
          >
          <div style={{ paddingTop: "20px" }}>
            <Form horizontal onSubmit={(e)=> this.handleSubmit(e)}>
              <FormItem  {...formItemLayout} label="名称">
                <Input placeholder="输入名称" id="name" size="large" {...forName} />
              </FormItem>

              <FormItem {...formItemLayout} label="地址" >
                <Input placeholder="如：http://svn.demo.org/project" size="large" {...forUrl} />
              </FormItem>

              <FormItem {...formItemLayout} label="类型">
                <Switch checked={this.state.privateType}  onChange={(e) => { this.setState({ privateType: e }) } } checkedChildren={formatMessage(menusText.pubilicType)} unCheckedChildren={formatMessage(menusText.privateType)} />
              </FormItem>

              {!this.state.privateType ?
                [<QueueAnim type='right' key='svnModal-type'>
                  <FormItem {...formItemLayout} label="用户名 : ">
                    <Input placeholder="输入用户名称" size="large" {...forUsername } />
                  </FormItem>

                  <FormItem {...formItemLayout} label="密码 : ">
                    <Input type="password" placeholder="请输入密码" {...forPassword} />
                  </FormItem>
                </QueueAnim>]
                : null
              }

            </Form>

          </div>

        </Modal>

        <Modal title="添加成功操作" visible={this.state.actionModal}
          onOk={()=> browserHistory.push('/ci_cd')} onCancel={()=> this.setState({actionModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i> 是否去查看所添加的项目！</div>
        </Modal>
      </div>
    )
  }
});

SvnComponent = Form.create()(SvnComponent)

SvnComponent.propTypes = {
  addSvnManaged: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {
  return {}
}

export default connect(mapStateToProps, {
  addSvnManaged
})(SvnComponent)