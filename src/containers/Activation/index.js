/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/* activation page for enterprise
 *
 * v0.1 - 2017-2-8
 * @author BaiYu
 */
import React, { PropTypes } from 'react'
import { Button, Form, Input, Card, message, Alert, Col, Row, Icon, Tooltip } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import Top from '../../components/Top'
import '../Login/Enterprise/style/Login.less'
import { addLicense, loadLicensePlatform } from '../../actions/license'
import NotificationHandler from '../../common/notification_handler'

const createForm = Form.create
const FormItem = Form.Item

let Activation = React.createClass({
  getInitialState() {
    return {
      submitting: false,
      loginResult: {},
      intNameFocus: false,
      copySuccess:false
    }
  },

  handleSubmit(e) {
    e.preventDefault()
    const _this = this
    this.props.form.validateFields((error, value) => {
      if (!!error) {
        return
      }
      _this.props.addLicense({rawlicense: value.name}, {
        success: {
          func: () => {
            new NotificationHandler().success('激活成功')
            browserHistory.push('/login')
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            new NotificationHandler().error('激活失败', 'License 错误或不可重复添加！')
          }
        }
      })
    })
  },
  checkName(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写许可证')])
      return
    }
    callback()
  },

  componentWillMount() {
    this.props.loadLicensePlatform()
  },

  componentDidMount() {
    this.refs.intName.refs.input.focus()
  },
  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("CodeInput");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  },
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  },
  render() {
    const { getFieldProps } = this.props.form
    const { submitting, loginResult, submitProps } = this.state
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.checkName },
      ],
    })
    const { result } = this.props
    return (
      <div id="LoginBg">
        <Top loginLogo={result.loginLogo}/>
        <div className="login">
          <div className="loginContent">
          <Row style={{ textAlign: 'center' }}>
            <span className='logoLink'>
              <div className='logTitle'>{result.company.productName}</div>
              <div className=''>技术领先的容器云计算服务商</div>
            </span>
          </Row>
          <Card className="loginForm" bordered={false}>
            <div>
              {
                loginResult.error && <Alert message={loginResult.error} type="error" showIcon />
              }
            </div>
            <div className="platform">平台ID <span className="platformId textoverflow">{this.props.platform.platformid}</span>
              <Tooltip title={this.state.copySuccess ? '复制成功': '点击复制'}>
                <a className={this.state.copySuccess ? "actions copyBtn":"copyBtn"} onClick={()=> this.copyDownloadCode()} onMouseLeave={()=> this.returnDefaultTooltip()}>
                  <Icon type="copy" />
                </a>
              </Tooltip>
              <input className="CodeInput" style={{ position: "absolute", opacity: "0", top:'0'}} value={this.props.platform.platformid} />
            </div>
            <Form onSubmit={(e)=> this.handleSubmit(e)}>
              <FormItem>
                <Input {...nameProps}
                  ref="intName"
                  type="textarea" placeholder="请输入许可证（发送“ 平台ID + 姓名 + 电话 + 公司名 ” 到 support@paas.enncloud.cn 我们将主动与您联系）"
                  style={{ maxHeight: 180 , height:180}} />
              </FormItem>

              <FormItem wrapperCol={{ span: 24, }}>
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={(e)=> this.handleSubmit(e)}
                  loading={submitting}
                  className="subBtn">
                  {submitting ? '激活中...' : '激活'}
                </Button>
              </FormItem>
            </Form>
          </Card>
        </div>
        </div>
        <div className="footer">
         <div class="footer">© 2017 新智云数据服务有限公司 | v2.0.0</div>
        </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const defaultState = {data: {'platformid': ''}}
  const defaultOemInfo = {
    company:{}
  }
  const {data} = state.license.platform.result || defaultState
  const { result } = state.personalized.info
  return {
   platform: data,
   result: result || defaultOemInfo
  }
}

Activation = createForm()(Activation)

Activation = connect(mapStateToProps, {
  loadLicensePlatform,
  addLicense
})(Activation)

export default Activation
