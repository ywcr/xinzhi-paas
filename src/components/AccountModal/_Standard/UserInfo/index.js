/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User info - Standard
 *
 * v0.1 - 2016-12-13
 * @author Bai Yu
 */
import React, { Component, PropTypes } from 'react'
import { Button, Tabs, Input, Icon, Modal, Upload, Dropdown, Form, Spin, Tooltip, } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import Authentication from './Authentication'
import './style/UserInfo.less'
import PhoneRow from './detail/PhoneRow'
import EmailRow from './detail/EmailRow'
import PasswordRow from './detail/PassowrdRow'
import { loadStandardUserInfo, changeUserInfo } from '../../../../actions/user'
import { bindWechat, unbindWechat } from '../../../../actions/user_3rd_account'
import { getQiNiuToken } from '../../../../actions/upload'
import NotificationHandler from '../../../../common/notification_handler'
import uploadFile from '../../../../common/upload'
import { parseAmount } from '../../../../common/tools'
import { AVATAR_HOST, USER_3RD_ACCOUNT_TYPES } from '../../../../constants'
import { loadLoginUserDetail } from '../../../../actions/entities'
import proIcon from '../../../../assets/img/version/proIcon.png'
import proIconGray from '../../../../assets/img/version/proIcon-gray.png'
import WechatQRCodeTicket from '../../../WechatQRCodeTicket'
import Title from '../../../Title'

const TabPane = Tabs.TabPane
const createForm = Form.create

class BaseInfo extends Component {
  constructor(props) {
    super(props)
    this.onScanChange = this.onScanChange.bind(this)
    this.setUser3rdAccountState = this.setUser3rdAccountState.bind(this)
    this.handleUnbind = this.handleUnbind.bind(this)
    this.state = {
      editEmail: false,
      editPsd: (props.hash === '#edit_pass' ? true : false),
      editPhone: false,
      uploadModalVisible: false,
      userIconsrc: 'avatars.png',
      disabledButton: false,
      currentKey: '11',
      user3rdAccounts: [],
      unbindModalShow: false,
      isPasswordSet: false,
    }
  }
  componentWillMount() {
    const self = this
    const { loadStandardUserInfo } = this.props
    loadStandardUserInfo({
      success: {
        func: (result) => {
          self.setState({
            userIconsrc: result.userInfo.avatar
          })
        }
      }
    })
  }
  componentWillReceiveProps(nextProps) {
    const { user } = nextProps
    const oldUserInfo = this.props.user.userInfo
    if(this.props.hash !== nextProps.hash) {
      if(nextProps.hash == '#edit_pass') {
        this.setState({
          editPsd: true
        })
        return
      }
      if(!nextProps.hash) {
        this.setState({
          editPsd: false
        })
      }
    }
    if (user && user.userInfo) {
      const userDetail = user.userInfo
      const { isPasswordSet } = userDetail
      if (oldUserInfo && isPasswordSet === oldUserInfo.isPasswordSet) {
        return
      }
      this.setState({
        isPasswordSet,
      })
    }
    if (!user || !user.user3rdAccounts) {
      return
    }
    this.setUser3rdAccountState(user.user3rdAccounts)
  }

  closeEdit(editType) {
    this.setState({
      [editType]: false
    })
  }
  UploadIconModal() {
    if(this.state.disabledButton) return
    if(this.state.file) {
      this.setState({
        disabledButton: true
      })
      const self = this
      const fileName = this.state.fileName
      const file = this.state.file
      this.props.getQiNiuToken('avatars', {fileName, protocol: window.location.protocol}, {
        success: {
          func: (result) => {
            self.setState({
              uptoken: result.upToken
            })
            const timestamp = new Date() - 0
            const body = {
              file: file,
              token: result.upToken,
              key: fileName
            }
            uploadFile(file, {
              url: result.uploadUrl,
              key: fileName,
              method: 'POST',
              body: body,
              size: 2 * 1024 * 1024,
              fileType: ['jpg', 'png', 'gif']
            }).then(response => {
              const url = `${response.key}`
              self.setState({
                userIconsrc: url,
                disabledButton: false,
                isBase64: false
              })
              self.changeUserAvator(url)
            }).catch(err => {
              self.setState({
                disabledButton: false
              })
            })
          }
        }
      })
      return
    }
    const userDetail = this.props.user.userInfo
    const notification = new NotificationHandler()
    if(userDetail.avatar === this.state.userIconsrc) {
      notification.error('请选和现在头像不同的图片')
      return
    }
    this.changeUserAvator(this.state.userIconsrc)
  }
  changeUserAvator(avatar) {
    const notification = new NotificationHandler()
    notification.spin('更新头像中')
    this.setState({
      disabledButton: true
    })
    const self = this
    this.props.changeUserInfo({
      avatar
    }, {
        success: {
          func: () => {
            self.setState({
              disabledButton: false,
              uploadModalVisible: false
            })
            notification.close()
            notification.success('更换头像成功')
            self.props.loadLoginUserDetail()
          },
          isAsync: true
        },
        failed: {
          func: (result) => {
            notification.close()
            notification.error(result.message)
            self.setState({
              disabledButton: false
            })
          }
        }
      })
  }
  beforeUpload(file) {
    const self = this
    const namespace = this.props.namespace
    const index = file.name.lastIndexOf('.')
    let ext = file.name.substring(index + 1)
    const fileType = ['jpg', 'png', 'gif']
    const notification = new NotificationHandler()
    if (fileType.indexOf(ext.toLowerCase()) < 0) {
      notification.error('头像格式仅支持jpg/png/gif')
      return false
    }
    if (file.size > 2 * 1024 * 1024) {
      notification.error('头像图片大小应小于2mb')
      return false
    }
    let fileName = namespace + (new Date() - 0) + '.' + ext
    const filePath = file.name
    const reader = new FileReader()
    const dataUrl = reader.readAsDataURL(file)
    reader.addEventListener('load', function () {
      self.setState({
        filePath: filePath,
        file: file,
        fileName: fileName,
        userIconsrc: reader.result,
        isBase64: true
      })
    }, false)
    return false
  }
  setUserIcon(icon) {
    this.setState({
      userIconsrc: icon
    })
  }
  cert(type) {
    let { pathname, hash } = this.props
    hash = `#cert-${type}`
    browserHistory.push({
      pathname,
      hash
    })
  }
  getCertStatus(status) {
    switch(status) {
      case 1: {
        return '待审核'
      }
      case 2: {
        return '审核中'
      }
      case 3: {
        return '认证失败'
      }
      case 4: {
        return '认证成功'
      }
      default: {
        return '未认证'
      }
    }
  }
  onTabClick(key) {
    if(key == this.state.currentKey){
      return
    }
    const user = this.props.user.userInfo
    this.setState({
      file: '',
      currentKey: key,
      userIconsrc: user.avatar,
      filePath: '',
      fileName: '',
      isBase64: false
    })
  }
  hideModal() {
    this.setState({ uploadModalVisible: false })
    const user = this.props.user.userInfo
    this.setState({
      file: '',
      userIconsrc: user.avatar,
      filePath: '',
      fileName: '',
      isBase64: false
    })
  }
  renderEdition(envEdition) {
    return (
      <span className="value">
        {
          envEdition == 0
          ? <span>标准版<img className="edition" alt="升级专业版" title="升级专业版" src={proIconGray}/></span>
          : <span>专业版<img className="edition" alt="专业版" title="专业版" src={proIcon}/></span>
        }
        <Button style={{ marginLeft: '10px' }} onClick={() => browserHistory.push('/account/version#pro')}>
          {
            envEdition == 0
            ? '了解专业版'
            : '查看详情'
          }
        </Button> &nbsp;
      </span>
    )
  }
  onScanChange(scan){
    const notification = new NotificationHandler()
    notification.spin('绑定微信帐户中...')
    const { bindWechat } = this.props
    const account = {
      accountType: 'wechat'
    }
    bindWechat(account, {
      success: {
        func: (response) => {
          notification.close()
          notification.success('绑定微信帐户成功')
          account.accountDetail = response
          this.setUser3rdAccountState([account])
        },
        isAsync: true,
      },
      failed: {
        func: (err) => {
          notification.close()
          const { statusCode, message } = err
          if (statusCode === 409) {
            const { reason } = message
            if (reason === 'WeChatAlreayBounded') {
              notification.error('绑定微信帐户失败', '您的微信已绑定其他新智云平台账户')
              return
            }
            if (reason === 'AlreadyExists') {
              notification.warn('您已绑定过微信账户')
              const { loadStandardUserInfo } = this.props
              loadStandardUserInfo()
              return
            }
          }
          notification.error('绑定微信帐户失败')
        },
        isAsync: true,
      }
    })
  }
  /**
   * Format accounts and set state
   *
   * @param {Array} accounts
   *
   * @memberOf BaseInfo
   */
  setUser3rdAccountState(accounts) {
    let { markUpdate } = this.state
    const notBindAccountTypes = USER_3RD_ACCOUNT_TYPES.concat()
    accounts.map(account => {
      const { accountType } = account
      let index = notBindAccountTypes.indexOf(accountType)
      if (index > -1) {
        notBindAccountTypes.splice(index, 1)
      }
    })
    notBindAccountTypes.map(accountType => {
      accounts.push({
        accountType,
        accountDetail: null,
      })
    })
    this.setState({
      user3rdAccounts: accounts,
    })
  }
  handleUnbind(accountType){
    const notification = new NotificationHandler()
    notification.spin('解除绑定中...')
    const { unbindWechat } = this.props
    const { user3rdAccounts } = this.state
    this.setState({
      unbindModalShow: false
    })
    unbindWechat({accountType}).then(({ response, type }) => {
      notification.close()
      const { status } = response.result
      if (status === 'Success') {
        notification.success('解除绑定成功')
        let accounts = user3rdAccounts.filter(account => account.accountType !== accountType)
        this.setUser3rdAccountState(accounts)
        return
      }
      throw new Error('解除绑定失败')
    }).catch(err => {
      // Must catch err here, response may be null
      notification.close()
      notification.error('解除绑定失败')
    })
  }
  renderWechatAccount(account) {
    const { accountType, accountDetail } = account
    if (!accountDetail) {
      return (
        <div className="send-tu" key="wechat">
          <div className="backcolor">
            <i className="fa fa-wechat"></i>
          </div>
          <WechatQRCodeTicket
            message="微信扫一扫立即绑定"
            triggerElement={<Button className="btn-success">立即绑定</Button>}
            getTooltipContainer={() => document.getElementById('baseInfo')}
            onScanChange={this.onScanChange} />
        </div>
      )
    }
    const { nickname } = accountDetail
    return(
      <div className="send-tu" key="wechat">
        <div className="backcolor wechat-success">
          <i className="fa fa-wechat"></i>
        </div>
        <div className="name">{nickname}</div>
        <Button onClick={() => {this.setState({unbindModalShow: true})}}>解除绑定</Button>
      </div>
    )
  }
  renderUser3rdAccount(account) {
    const { accountType } = account
    switch(accountType) {
      case 'wechat':
        return this.renderWechatAccount(account)
    }
  }
  renderPassword(isPasswordSet) {
    if (isPasswordSet) {
      return (
        <li>
          <span className="key">密码</span>
          <span className="value" style={{color: '#5cb85c'}}>已设置</span>
          <Button type="primary" onClick={() => this.setState({ editPsd: true })}>修改密码</Button>
        </li>
      )
    }
    return (
      <li>
        <span className="key">密码</span>
        <span className="value" style={{color: '#9190F8'}}>未设置</span>
        <Button type="primary" onClick={() => this.setState({ editPsd: true })}>设置密码</Button>
      </li>
    )
  }
  render() {
    // const {getFieldProps} = this.props.form
    let { user } = this.props
    if(!user) {
      return <div></div>
    }
    const { isFetching } = user
    const { user3rdAccounts, isPasswordSet } = this.state
    if(isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"></Spin>
        </div>
      )
    }
    const userDetail = user.userInfo
    const cert = user.certInfo
    let userCert, companyCert
    if(!cert) {
      return (<div></div>)
    }
    cert.data.forEach(item => {
      if(item.certType == '1') {
        userCert = item
        return
      }
      companyCert = item
    })
    let disabledUserCert = false
    if(!userCert) {
      userCert = {
        userName: userDetail.userName
      }
      if(companyCert) {
        disabledUserCert = true
      }
    }
    if(!companyCert) {
      companyCert = {}
    }
    return (
      <div className="baseInfo" id="baseInfo">
        <Title title="我的账户" />
        <div className="topBox">
          <div className="userimage">
            <img src={`${AVATAR_HOST}${userDetail.avatar}`} />
          </div>
          <div className="topbar userBtn">
            <p>Hi, 换个自己喜欢的头像吧！</p>
            <Button type="primary" onClick={() => this.setState({ uploadModalVisible: true })}>更换头像</Button>
          </div>
          <div className="to-recharge">
            <p className="money">
              <span className="unit">￥</span>
              <span className="number">{ parseAmount(userDetail.balance).amount }</span>
            </p>
            <p className="money-desc">我的帐户余额</p>
            <Button type="primary" onClick={() => browserHistory.push('/account/balance/payment')}>
              去充值
            </Button>
          </div>
        </div>
        <div className="myInfo">
          <div className="hand">个人信息</div>
          <ul className="info-list">
            <li>
              <span className="key">用户名</span>
              <span className="value">
                {userDetail.userName}
              <Button className="btn-auth" disabled={disabledUserCert} style={{ marginLeft: '10px' }} onClick={() => this.cert('user')}>{this.getCertStatus(userCert.status)}</Button></span>
            </li>
            <li>
              <span className="key">企业名称</span>
              <span className="value">
                {companyCert.enterpriseName}
                <Button className="btn-auth" style={{ marginLeft: '10px' }} onClick={() => this.cert('company')}>{this.getCertStatus(companyCert.status)}</Button> &nbsp;
                <Tooltip title="如已认证企业用户，则不可认证个人用户；如已认证个人用户，还可继续认证企业用户">
                <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            </li>
            <li>
              <span className="key">版本</span>
              {this.renderEdition(userDetail.envEdition)}
            </li>
            {this.state.editEmail ?
              <li>
                <EmailRow scope ={this} email={userDetail.email} />
              </li>
              :
              <li>
                <span className="key">邮箱</span>
                <span className="value">{userDetail.email}</span>
                <Button onClick={() => this.setState({ editEmail: true })}>修改邮箱</Button>
              </li>
            }
            {this.state.editPsd ?
              <li>
                <PasswordRow isPasswordSet={isPasswordSet} scope={this} />
              </li>
              :
              this.renderPassword(isPasswordSet)
            }
            {this.state.editPhone ?
            <li>
              <PhoneRow scope ={this} />
            </li>
            :
            <li>
              <span className="key">手机</span>
              <span className="value">{userDetail.phone}</span>
              <Button type="primary" onClick={() => this.setState({ editPhone: true })}>修改手机</Button>
            </li>
          }
          </ul>
        </div>

        <div className="wechatBox">
          <div className="hand">
            <span className="title">登录授权</span>
            <span className="other">第三方</span>
          </div>
          {
            user3rdAccounts.map(account => this.renderUser3rdAccount(account))
          }
        </div>
        <Modal title={'更换头像'} className="uploadIconModal" visible={this.state.uploadModalVisible}
          onCancel={() => this.hideModal()} onOk={() => this.UploadIconModal()} width={600}
          >
          <Tabs defaultActiveKey="11" onTabClick={key => this.onTabClick(key)}>
            <TabPane tab="个性头像选择" key="11">
              <div className="images">
                <div className="leftBox">
                  <img src={`${AVATAR_HOST}icon-1.jpg`} className="userIcon" onClick={() => this.setUserIcon('icon-1.jpg')} />
                  <img src={`${AVATAR_HOST}icon-10.jpg`} className="userIcon" onClick={() => this.setUserIcon('icon-10.jpg')} />
                  <img src={`${AVATAR_HOST}icon-8.jpg`} className="userIcon" onClick={() => this.setUserIcon('icon-8.jpg')} />
                  <img src={`${AVATAR_HOST}icon-4.jpg`} className="userIcon" onClick={() => this.setUserIcon('icon-4.jpg')} />
                  <img src={`${AVATAR_HOST}icon-5.jpg`} className="userIcon" onClick={() => this.setUserIcon('icon-5.jpg')} />
                  <img src={`${AVATAR_HOST}icon-6.jpg`} className="userIcon" onClick={() => this.setUserIcon('icon-6.jpg')} />
                  <img src={`${AVATAR_HOST}icon-7.jpg`} className="userIcon" onClick={() => this.setUserIcon('icon-7.jpg')} />
                </div>
                <div className="rightBox">
                  <div className="useIcon">
                    <img src={`${AVATAR_HOST}${this.state.userIconsrc}`} />
                  </div>
                  <div>头像预览</div>
                </div>
              </div>
            </TabPane>
            <TabPane tab="本地头像" key="12">
              <div className="images">
                <div className="leftBox">
                  <br />
                  <p className="row">从电脑里挑选一张喜欢的图作为头像吧</p>
                  <Upload beforeUpload={(file) => this.beforeUpload(file)} ref={(instance) => this.uploadInstance = instance } accept="image/*">
                    <Input size="large" placeholder="选择一张照片" style={{ width: '66%' }} value={this.state.filePath}/>
                    <Button type="primary" style={{ marginLeft: '20px' }}>本地照片
                    </Button>
                  </Upload>
                  <p className="row">支持jpg/png/gif 格式图片，文件需小于2M</p>
                </div>
                <div className="rightBox">
                  <div className="useIcon">
                    <img src= {this.state.isBase64 ? this.state.userIconsrc : AVATAR_HOST + this.state.userIconsrc} />
                  </div>
                  <div>头像预览</div>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </Modal>
        <Modal title='解除绑定' visible={this.state.unbindModalShow}
          onCancel={() => this.setState({unbindModalShow: false})} onOk={() => this.handleUnbind(user3rdAccounts[0].accountType)}
        >
          <span style={{ color: '#00a0ea', marginRight: '10px' }}>
            <Icon type='question-circle-o' /><span>您确定解除绑定微信么？</span>
          </span>
        </Modal>
      </div>
    )
  }
}

function baseInfoMapStateToProps(state) {
  return {
    user: state.user.standardUserDetail
  }
}

BaseInfo = connect(baseInfoMapStateToProps, {
  loadStandardUserInfo,
  changeUserInfo,
  getQiNiuToken,
  loadLoginUserDetail,
  bindWechat,
  unbindWechat,
})(BaseInfo)


class UserInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentHash: '#user'
    }
  }
  componentWillReceiveProps(nextProps) {
    if(this.props.hash === nextProps.hash) {
      return
    }
    this.setState({
      currentHash: nextProps.hash
    })
  }
  tabChange(e) {
    const { history } = this.props
    let hash = '#base'
    if(e === '2') {
      hash = '#cert'
    }
    if(hash === this.state.currentHash) {
      return
    }
    this.setState({
      currentHash: hash
    })
    const { pathname } = this.props
    browserHistory.push({
      pathname: pathname,
      hash
    })
  }
  render() {
    const hash = this.props.hash
    let activeKey = '1'
    if(hash.indexOf('#cert') >= 0) {
      activeKey = '2'
    }
    return (
      <div id="public-userinfo">
        <Tabs activeKey={activeKey} onTabClick={(e)=> { this.tabChange(e)}}>
          <TabPane tab="基本信息" key="1"><BaseInfo pathname={this.props.pathname} hash={hash} namespace = {this.props.namespace}/></TabPane>
          <TabPane tab="认证信息" key="2"><Authentication pathname={this.props.pathname} hash={hash}/></TabPane>
        </Tabs>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { pathname, hash } = props.location
  return {
    pathname,
    hash,
    namespace: state.entities.loginUser.info.namespace
  }
}


export default connect(mapStateToProps, {})(UserInfo)
