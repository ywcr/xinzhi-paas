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
import { Button, Icon, Input, Upload, Form} from 'antd'
import uploadFile from '../../../../../common/upload.js'
import { IDValide } from '../../../../../common/naming_validation.js'
import NotificationHandler from '../../../../../common/notification_handler.js'
const FormItem = Form.Item

let OtherComponse = React.createClass({
  getInitialState() {
    return {
      userLicense:{},
      userFrontId:{},
      backId:{},
      disabled: false
    }
  },
  componentWillMount(){
    const config = this.props.config
    if (!config) return
    if(!config) return
    this.setState({
      disabled: true
    })
    const userLicense = {
      uid: -1,
      name: '',
      status: 'done',
      url: config.enterpriseCertPic,
      thumbUrl: config.enterpriseCertPic
    }
    const userFrontId = {
      uid: -1,
      name: '',
      status: 'done',
      url: config.userHoldPic,
      thumbUrl: config.userScanPic
    }
    const backId = {
      uid: -1,
      name: '',
      status: 'done',
      url: config.userScanPic,
      thumbUrl: config.userScanPic
    }
    this.setState({
        backId,
        userFrontId,
        userLicense,
    })
  },
  componentDidMount() {
    if (this.props.scope.state.otherDisabled) {
      this.setState({disabled: true})
    }
  },
  componentWillReceiveProps(nextProps) {
    if(nextProps.config) {
      const config = nextProps.config
      const userLicense = {
          uid: -1,
          name: '',
          status: 'done',
          url: config.enterpriseCertPic,
          thumbUrl: config.enterpriseCertPic
      }
      const userFrontId = {
          uid: -1,
          name: '',
          status: 'done',
          url: config.userHoldPic,
          thumbUrl: config.userHoldPic
      }
      const backId = {
          uid: -1,
          name: '',
          status: 'done',
          url: config.userScanPic,
          thumbUrl: config.userScanPic
      }
      if(!this.props.config) {
        this.setState({
          backId,
          userFrontId,
          userLicense,
          disabled: true
        })
      } else {
        if(userLicense.url !== this.props.config.enterpriseCertPic) {
          this.setState({
            userLicense
          })
        }
        if(userFrontId.url !== this.props.config.userHoldPic) {
          this.setState({
            userFrontId
          })
        }
        if(backId.url !== this.props.config.userScanPic) {
          this.setState({
            backId
          })
        }
      }
    }
  },
  idCard(rule, values, callback) {
    const message = IDValide(values)
    if(message) {
      callback([new Error(message)])
      return
    }
    callback()
    return
  },
  isPhone(rule, value, callback) {
    if(!Boolean(value)){
      callback(new Error('请输入11位手机号'));
      return
    }
    if (value.length < 11 || value.length > 11) {
      callback(new Error('请输入11位手机号'));
    } else {
      callback();
    }
  },
  removeFile(type) {
    if(this.state.disabled) {
      return
    }
    if(type === 'userLicense') {
      this.setState({
        userLicense: {}
      })
      return
    }
    if(type === 'backId') {
      this.setState({
        backId: {}
      })
      return
    }
    this.setState({
      userFrontId: {}
    })
  },
  beforeUpload(file, type) {
    const self = this
    const index = file.name.lastIndexOf('.')
    let ext = file.name.substring(index + 1)
    let fileName = this.props.namespace + (new Date() - 0) + '.' + ext
    this.props.scope.props.getQiNiuToken('certificate', {fileName, protocol: window.location.protocol}, {
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
            if(type == 'userLicense') {
              self.setState({
                userLicense: info
              })
              return
            }
            if(type == 'frontId') {
              self.setState({
                userFrontId: info
              })
              return
            }
            self.setState({
              backId: info
            })
          })
        }
      }
    })
    return false
  },
  handleSubmit(e) {
    e.preventDefault();
    const {userLicense, userFrontId, backId} = this.state
    const certID = this.props.config ? this.props.config.certID :false
    const parentScope = this.props.scope.props.scope
    const _this = this
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      const notification = new NotificationHandler()
      if (!userLicense.url) {
        notification.error('请上传组织机构代码扫描照')
        return
      }
      if (!userFrontId.url) {
        notification.error('请上传联系人身份证正面扫描照')
        return
      }
      if (!backId.url) {
        notification.error('请上传联系人身份证反面扫描照')
        return
      }
      let message = '提交审核信息'
      notification.spin('提交审核信息中')
      const body = {
        certType: 3,
        certUserName: values.ownerName,
        certUserID: values.ownerNameNumber,
        enterpriseCertPic:userLicense.url,
        userHoldPic: userFrontId.url,
        userScanPic: backId.url,
        enterpriseOwnerPhone: values.ownerNamePhone,
        enterpriseCertID:values.registrationNumber,
        enterpriseName:values.companyName
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
      if (certID) {
        parentScope.props.updateCertInfo(certID, body, callback)
        return
      }
      parentScope.props.createCertInfo(body, callback)
      function success() {
        notification.close()
        message = '提交审核成功'
        if(certID) {
          message = '修改审核信息成功'
        }
        notification.success(message)
        _this.setState({disabled:true})
        parentScope.props.loadStandardUserCertificate()
      }
      function error() {
        notification.close()
        message = '提交审核失败, 请稍后再试'
        if(certID) {
          message = '修改审核失败, 请稍后再试'
        }
        notification.error(message)
        _this.setState({disabled:true})
      }
    });
  },

   render() {
    const data = this.props.config || {}
    const { getFieldProps } = this.props.form;
    const companyNameProps = getFieldProps('companyName', {
      rules: [
        { required: true, whitespace: true, message:'请输入组织名称'}
      ],
      initialValue: data.enterpriseName
    });
    const registrationNumberProps = getFieldProps('registrationNumber', {
      rules: [
        { required: true, whitespace: true, message:'请输入组织机构代码'}
      ],
      initialValue: data.enterpriseCertID
    });
    const ownerNameProps = getFieldProps('ownerName', {
      rules: [
        { required: true, whitespace: true, message:'请输入联系人姓名'}
      ],
      initialValue: data.certUserName
    });
    const ownerNameNumberProps = getFieldProps('ownerNameNumber', {
      rules: [
        { whitespace: true, message:'请输入联系任人身份证号'},
        { validator: this.idCard }
      ],
      initialValue: data.certUserID
    });
    const ownerNamePhoneProps = getFieldProps('ownerNamePhone', {
      rules: [
        { whitespace: true, message:'请输入联系人手机号'},
        { validator: this.isPhone }
      ],
      initialValue: data.enterpriseOwnerPhone
    });

    const userLicense = this.state.userLicense.url ? [this.state.userLicense] : null
    const frontId = this.state.userFrontId.url ? [this.state.userFrontId] : null
    const backId = this.state.backId.url ? [this.state.backId] : null
    return (
      <Form horizontal>
        <div className="myInfo">
          <div className="hand">组织信息</div>
          <div className="user-info">
            <div className="list">
              <span className="key">组织名称 <span className="important">*</span></span>
              <FormItem>
                <Input {...companyNameProps} className="input" size="large" disabled={this.props.config && this.state.disabled}/>
              </FormItem>
            </div>
            <div className="list">
              <span className="key">组织机构代码 <span className="important">*</span></span>
              <FormItem>
                <Input {...registrationNumberProps} className="input" size="large" disabled={this.props.config && this.state.disabled}/>
              </FormItem>
            </div>
            <div className="list">
              <span className="key">组织机构代码扫描件 <span className="important">*</span></span>
              <div className="upload">

                <Upload listType="picture-card" accept="image/*" fileList={userLicense} beforeUpload={(file) =>
                  this.beforeUpload(file, 'userLicense')
                } customRequest={() => true }  onRemove={() => this.removeFile('userLicense')} disabled={ userLicense ? true : false}>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>

              </div>
              <ul className="chk">
                <li>&nbsp;</li>
                <li>1.营业执照正副本均可，文字/盖章需清晰可见</li>
                <li>2.上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>

        </div>
        <div className="myInfo" style={{marginTop:'20px'}}>
          <div className="hand">企业联系人信息</div>
          <div className="user-info">
            <div className="list">
              <span className="key">联系人姓名 <span className="important">*</span></span>
              <FormItem>
                <Input {...ownerNameProps} className="input" size="large" disabled={this.props.config && this.state.disabled}/>
              </FormItem>
            </div>
            <div className="list">
              <span className="key">联系人身份证号码 <span className="important">*</span></span>
              <FormItem>
                <Input {...ownerNameNumberProps} className="input" size="large" disabled={this.props.config && this.state.disabled} />
              </FormItem>
            </div>
            <div className="list">
              <span className="key">联系人手机号 <span className="important">*</span></span>
              <FormItem>
                <Input {...ownerNamePhoneProps} type="number" className="input" size="large" disabled={this.props.config && this.state.disabled}/>
              </FormItem>
            </div>
            <div className="list">
              <span className="key">联系人身份证正面扫描 <span className="important">*</span></span>
              <div className="upload">

                <Upload listType="picture-card" accept="image/*" fileList={frontId} beforeUpload={(file) =>
                  this.beforeUpload(file, 'frontId')
                } customRequest={() => true }  onRemove={() => this.removeFile('frontId')} disabled={ frontId ? true : false}>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>

              </div>
              <ul className="chk">
                <li>&nbsp;</li>
                <li>上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
            </div>
            <div className="list">
              <span className="key">联系人身份证反面扫描 <span className="important">*</span></span>
              <div className="upload">

                <Upload accept="image/*" listType="picture-card" fileList={backId} beforeUpload={(file) =>
                  this.beforeUpload(file, 'backId')
                } customRequest={() => true }  onRemove={() => this.removeFile('backId')}  disabled={ backId ? true : false}>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>

              </div>
              <ul className="chk">
                <li>上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
        <div className="info-footer">
          {this.props.config && this.state.disabled ?
          <Button size="large" onClick={()=> this.setState({disabled: false}) }>修改</Button>
          :
          <Button size="large" onClick={(e)=>this.handleSubmit(e)}>提交</Button>
          }
        </div>
      </Form>
    )
  }
})

OtherComponse = Form.create()(OtherComponse);
export default OtherComponse