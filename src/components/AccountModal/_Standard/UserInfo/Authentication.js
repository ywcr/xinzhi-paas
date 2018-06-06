/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Authentication - Standard
 *
 * v0.1 - 2016-12-13
 * @author Bai Yu
 */
import React, { Component, PropTypes } from 'react'
import { Button, Icon, Input, Tabs, Upload, Radio, Form, Modal} from 'antd'
import { connect } from 'react-redux'
import { browserHistory }  from 'react-router'
import { getQiNiuToken } from '../../../../actions/upload.js'
import { createCertInfo, updateCertInfo } from '../../../../actions/user.js'
import uploadFile from '../../../../common/upload.js'
import { IDValide } from '../../../../common/naming_validation.js'
import { loadStandardUserCertificate } from '../../../../actions/user'
import EnterpriseComponse from './detail/EnterpriseComponse'
import OtherComponse from './detail/OtherComponse'
import NotificationHandler from '../../../../common/notification_handler.js'
import './style/Authentication.less'
const TabPane = Tabs.TabPane
const RadioGroup = Radio.Group
const FormItem = Form.Item

// formert status text
function formetStatus(status) {
  switch(status) {
    case 1:
      return <Button className="btn-auth">待审核</Button>;
    case 2:
      return <Button type="primary">审核中</Button>;
    case 3:
      return <Button className="btn-error" onClick={()=>this.setState({errMessage:true})}>认证失败</Button>;
    case 4:
      return <Button className="btn-success" >认证通过</Button>;
    default:
      return <Button>未认证</Button>;
  }
}

//  个人认证
class Indivduals extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userHold: {},
      userScan: {},
      name: '',
      ID: '',
      isAllDisable: false,
      canUpdate: false,
      canChange: true,
      isFail: false
    }
  }
  componentWillMount() {
    const config = this.props.config
    if(config && config.userScanPic) {
      this.setState({
        userHold: {
          uid: -1,
          name: '',
          status: 'done',
          url: config.userHoldPic,
          thumbUrl: config.userHoldPic
        },
        userScan: {
          uid: -1,
          name: '',
          status: 'done',
          url: config.userScanPic,
          thumbUrl: config.userScanPic
        },
        isAllDisable: true,
        canUpdate: true
      })
      if(config.status == 2 || config.status == 4) {
       this.setState({
          canChange: false
       })
     }
    }
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.config) {
      const config = nextProps.config
      const userHold = {
          uid: -1,
          name: '',
          status: 'done',
          url: config.userHoldPic,
          thumbUrl: config.userHoldPic
      }
      const userScan = {
          uid: -1,
          name: '',
          status: 'done',
          url: config.userScanPic,
          thumbUrl: config.userScanPic
      }
      if(!this.props.config) {
        this.setState({
          userScan,
          userHold,
          canUpdate: true,
          isAllDisable: true
        })
        if(config.status == 2 || config.status == 4) {
          this.setState({
            canChange: false
          })
        }
        return
      }
      if (this.props.config.userHoldPic != userHold.url) {
        this.setState({
          userHold
        })
      }
      if (this.props.config.userScanPic != userScan.url) {
        this.setState({
          userScan
        })
      }
    }
  }
  valideID(rule, values, callback) {
    const message = IDValide(values)
    if(message) {
      callback([new Error(message)])
      return
    }
    callback()
    return
  }
  valideName(rule, values, callback) {
    if(!values) {
      return callback(new Error('请输入真实姓名'))
    }
    callback()
    return
  }
  beforeUpload(file, type) {
    const self = this
    const index = file.name.lastIndexOf('.')
    let ext = file.name.substring(index + 1)
    let fileName = this.props.namespace + (new Date() - 0) + '.' + ext
    this.props.getQiNiuToken('certificate', {fileName, protocol: window.location.protocol}, {
      success: {
        func: (result)=> {
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
            body: body
          }).then(response => {
            self.setState({
              qiniu: result.url,
              origin: result.origin
            })
            const url = `${result.origin}/${response.key}`
            const info = {
              uid: -1,
              name: file.name,
              status: 'done',
              url,
              thumbUrl: url
            }
            if(type == 'hold') {
              self.setState({
                userHold: info
              })
              return
            }
            self.setState({
              userScan: info
            })
          })
        }
      }
    })
    return false
  }
  handUserCert(e, update) {
    e.preventDefault()
    if(this.state.canUpdate) {
      this.setState({
        canUpdate: false,
        isAllDisable: false
      })
      return
    }
    const { form } = this.props
    const { changeUserInfo } = this.props
    const self = this
    form.validateFields(['name', 'ID'], (errors, values) => {
      if (errors) {
        return errors
      }
      const notification = new NotificationHandler()
      let hold = self.state.userHold
      let scan = self.state.userScan
      let certId
      if(update) {
        let individualCert = self.props.config
        certId = individualCert.certID
      }
      if(!hold.url) {
        notification.error('请上传身份证正面照')
        return
      }
      if(!scan.url) {
        notification.error('请上传身份证背面照')
        return
      }
      let message = '提交审核信息'
      if(update) {
        message = '修改审核信息中'
      }
      notification.spin(message)
      const body = {
        certType: 1,
        certUserName: values.name,
        certUserID: values.ID,
        userHoldPic: hold.url,
        userScanPic: scan.url
      }
      const callback = {
        success: {
          func: success,
          isAsync: true
        },
        failed: {
          func: error
        }
      }
      if(update) {
        body.certID = certId
        self.props.updateCertInfo(certId, body, callback)
        return
      }
      self.props.createCertInfo(body, callback)
      function success() {
        notification.close()
        message = '提交审核成功'
        if(update) {
          message = '修改审核信息成功'
        }
        notification.success(message)
        self.props.loadStandardUserCertificate()
        self.setState({
          isAllDisable: true,
          canUpdate: true
        })
      }
      function error() {
        notification.close()
        message = '提交审核失败, 请稍后再试'
        if(update) {
          message = '修改审核失败, 请稍后再试'
        }
        notification.error(message)
      }
    })
  }
  removeFile(type) {
    if(this.state.isAllDisable) {
      return
    }
    if(type === 'scan') {
      this.setState({
        userScan: {}
      })
      return
    }
    this.setState({
      userHold: {}
    })
  }
  render() {
    let hold = this.state.userHold.url ? [this.state.userHold] : null
    let scan = this.state.userScan.url ? [this.state.userScan] : null
    const componstStatus = this.props.config ? this.props.config.status :'0'
    const { getFieldProps } = this.props.form
    let isAllDisable = this.state.isAllDisable
    let individualCert = this.props.config
    let update = false
    if(individualCert) {
      update = true
    }
    if(!individualCert) individualCert = {}
    const name = getFieldProps('name', {
      rules: [
        { require: true, whitespace: true, message:'请输入真实姓名'},
        { validator: this.valideName }
      ],
      initialValue: individualCert.certUserName
    })
    const ID = getFieldProps('ID', {
      rules: [
        { require: true, whitespace: true, message:'请输入真实身份证号码'},
        { validator: this.valideID }
      ],
      initialValue: individualCert.certUserID
    })
    return (
      <Form >
      <div className="Indivduals">
        <div className="description">个人用户通过个人认证可获得5元代金券，请按照提示填写本人的真实照片</div>
        <div className="auth-status">
          {componstStatus == 4 ?
          <svg className="auth-img" style={{fill:'#4ABE44'}}><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#auth-img"></use></svg>
          :
          <svg className="auth-img"><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#auth-img"></use></svg>
          }
          <span className="auth-text">个人认证</span>
          {formetStatus(componstStatus)}
        </div>
        <div className="myInfo">
          <div className="hand">个人信息</div>
          <div className="user-info">
            <div className="list">
              <span className="key">真实姓名 <span className="important">*</span></span>
            <FormItem>
              <Input className="input" size="large" {...name} disabled={ isAllDisable }/>
            </FormItem>
            </div>
            <div className="list">
              <span className="key">身份证号 <span className="important">*</span></span>
            <FormItem>
              <Input className="input" size="large"  {...ID} disabled={ isAllDisable } />
            </FormItem>
            </div>
            <div className="list">
              <span className="key">手持身份证照片 <span className="important">*</span></span>
              <div className="upload">
                <Upload listType="picture-card" accept="image/*" fileList={hold} beforeUpload={(file) =>
                  this.beforeUpload(file, 'hold')
                } customRequest={() => true } onRemove={() => this.removeFile('hold')} disabled={ hold || isAllDisable ? true : false}>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>
              </div>
              <ul className="chk">
                <li>1.持有者需正面、免冠、未化妆、双手持身份证且露出手臂</li>
                <li>2.身份证为本人持有，不得盗用他人身份证且不得遮挡持有者面部，身份证全部信息需清晰可辩认</li>
                <li>3.照片未经任何软件编辑修改</li>
                <li>4.上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
            </div>
            <div className="list">
              <span className="key">身份证反面扫描 <span className="important">*</span></span>
              <div className="upload">
                <Upload listType="picture-card" fileList={scan} disabled={ scan || isAllDisable ? true : false } beforeUpload={ (file) =>
                 this.beforeUpload(file, 'scan')
                } onRemove={() => this.removeFile('scan')} accept="image/*">
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>
              </div>
              <ul className="chk">
                <li>&nbsp;</li>
                <li>1.身份证信息清晰可辩认</li>
                <li>2.上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
              <div style={{ clear: 'both' }}></div>
            </div>
          </div>
          <div className="info-footer" style={{padding:'0 50px'}}>
            <Button size="large" disabled={!this.state.canChange} onClick={(e) => this.handUserCert(e, update)}>{this.state.canUpdate ? '修改': '提交'}</Button>
          </div>
        </div>
      </div>
      <Modal title="抱歉您的本次认证未通过审核，具体原因如下" visible={this.state.isFail}
          onOk={this.restore} onCancel={this.handleCancel} okText="重新输入">
          <p className="blod">{individualCert.failure_message}</p>
          <p className="blod">请您修改信息后, 重新提交</p>
          <div>如有任何疑问，请您与新智云团队联系</div>
          <div>电话：<a>400-626-1876</a> 邮箱： <a href="mailto:service@paas.enncloud.cn">service@paas.enncloud.cn</a></div>
        </Modal>
    </Form>
    )
  }
}

function indivdualsMapStateToProp(state, props) {
  return {
    namespace: state.entities.loginUser.info.namespace
  }
}
Indivduals = Form.create()(Indivduals)
Indivduals = connect(indivdualsMapStateToProp, {
  getQiNiuToken,
  createCertInfo,
  loadStandardUserCertificate,
  updateCertInfo
})(Indivduals)

// 企业 认证
class Enterprise extends Component {
  constructor(props) {
    super(props)
    this.state = {
       trytype: '2',
       otherDisabled: false,
       enterpriseDisabled: false
    }
  }
  componentWillMount() {
    if (!this.props.config) return
    this.setState({
      trytype: this.props.config.certType.toString()
    })
  }
  changeType(e) {
    this.setState({trytype: e})
  }
  componentWillReceiveProps(nextProps){
    if(!nextProps.config) return
    this.setState({
      trytype: nextProps.config.certType.toString()
    })
  }
  //  失败原因
  failureMessage(message) {
    let errMessage = message
    if (message !== ' ' && message.length >0) {
      errMessage = message.map((list, index) => {
        return (
          <p>{index +1} .{ list } <Icon type="exclamation-circle-o" /></p>
        )
      })
    }
    return errMessage
  }
  restorePush() {
    if (this.props.config.certType =='2') {
       this.setState({
         trytype: '2',
         enterpriseDisabled: true
        })
       return
    }
    this.setState({
      trytype: '3',
      otherDisabled: true
    })
  }
  render() {
    let certType =''
    if(this.props.config) {
      certType = this.props.config.certType.toString()
    }
    const enterprise = (
      <div><Radio value="2" checked ={this.state.trytype =='2' ? true : false} disabled={certType =='3' ? true : false}></Radio> 企业</div>
    )
    const otherwise = (
      <div><Radio value="3" checked ={this.state.trytype =='3' ? true : false} disabled={certType =='2' ? true : false}></Radio>其他组织</div>
    )
    const componstStatus = this.props.config ? this.props.config.status :'0'
    const errMessage = this.props.config && this.props.config.failureMessage !='' ? this.props.config.failureMessage : []
    return (
      <div className="Indivduals">
        <div className="description">企业用户通过企业认证可获得50元代金券，认证的企业用户的资源配额拥有比未认证的用户更高的配额。请根据您的组织类型选择类型选择认证，企业指领取营业执照的有限责任公司、股份有限公司、非公司企业法人、合伙企业、个人独资企业及其分支机构、来华从事经营的外国（地区）企业，及其他经营单位；其他组织指在中华人民共和国境内依法注册、依法登记的机关、事业单位、社会团体、学校和民办非企业单位和其他机构。</div>
        <div className="auth-status">
          {componstStatus == 4 ?
          <svg className="auth-img" style={{fill:'#4ABE44'}}><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#auth-img2"></use></svg>
          :
          <svg className="auth-img"><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#auth-img2"></use></svg>
          }
          <span className="auth-text">企业认证</span>
          {formetStatus(componstStatus)} {/* status */}
          {componstStatus == '3'?
          <Icon type="exclamation-circle-o" style={{color:'red'}}/>
          :null
          }
        </div>

        <Tabs defaultActiveKey={this.state.trytype} type="card"  onChange={(e)=> this.changeType(e)}>
          <TabPane tab="请选择组织类型" key="4" disabled ></TabPane>
          <TabPane tab={ enterprise } key="2" disabled={certType =='3' ? true : false}><EnterpriseComponse config={ this.props.config } scope={this} namespace={this.props.namespace}/></TabPane>
          <TabPane tab={ otherwise } key="3"  disabled={certType =='2' ? true : false}><OtherComponse config={ this.props.config } scope={this} namespace={this.props.namespace}/></TabPane>
        </Tabs>
        <Modal title="抱歉您的本次认证未通过审核，具体原因如下" visible={this.state.failureMessage} wrapClassName="vertical-center-modal errorAuth"
          onOk={()=> this.restorePush()} onCancel={()=>this.setState({failureMessage: false})} okText="重新输入">
          <div className="wrapBox">
            { this.failureMessage( errMessage ) }
          </div>

          <p className="blod">请您 “重新输入”以上认证信息，重新认证</p>
          <div>如有任何疑问，请您与新智云团队联系</div>
          <div>电话：<a>400-626-1876</a> 邮箱： <a href="mailto:service@paas.enncloud.cn">service@paas.enncloud.cn</a></div>
        </Modal>

      </div>
    )
  }
}

function enterpriseMapStateToProps(state, props) {
  return props
}

Enterprise =  connect(enterpriseMapStateToProps, {
  getQiNiuToken
})(Enterprise)

class Authentication extends Component {
  constructor(props) {
    super(props)
    this.state= {
      currentHash: ''
    }
  }
  componentWillMount() {
    this.props.loadStandardUserCertificate()
  }
  componentWillReceiveProps(nextProps) {
     if(nextProps.hash === this.props.hash) {
       return
     }
     this.setState({
       currentHash: nextProps.hash
     })
  }
  tabClick(e) {
    let { certificate} = this.props
    if((certificate.enterprise || certificate.other) && !certificate.individual) return
    let hash = '#cert-company'
    if(e === '2') {
      hash = '#cert-user'
    }
    if(hash === this.state.currentHash) {
      return
    }
    this.setState({
      currentHash: hash
    })
    const { pathname } = this.props
    browserHistory.push({
      pathname,
      hash
    })
  }
  render() {
    let { hash, certificate} = this.props
    let activeKey = '2'
    if(hash.indexOf('company') >= 0) {
      activeKey = '1'
    }
    if (!certificate) {
      certificate = {}
    }
    if((certificate.enterprise || certificate.other) && !certificate.individual) {
      activeKey = '1'
    }
    return (
      <div className="Authentication" >
        <Tabs  type="card" activeKey={activeKey} onTabClick={(e) => this.tabClick(e)}>
          <TabPane tab="企业用户" key="1"><Enterprise hash={hash} config={certificate.enterprise || certificate.other} scope={this} namespace={this.props.namespace}/></TabPane>
          <TabPane tab="个人用户" key="2"><Indivduals hash={hash} config={certificate.individual} scope={this}/></TabPane>
        </Tabs>
      </div>
    )
  }
}


function mapStateToProps(state, props) {

  const {userCertificate } = state.user

  const { certificate }  = userCertificate || {}
  return {
    certificate,
    namespace: state.entities.loginUser.info.namespace
  }
}

export default connect(mapStateToProps, {
  getQiNiuToken,
  createCertInfo,
  updateCertInfo,
  loadStandardUserCertificate
})(Authentication)
