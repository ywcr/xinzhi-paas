/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component, PropTypes } from 'react'
import { Modal, Menu,Tabs, Icon, Button,Form, Card, Alert, Input, Tooltip } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { Link,browserHistory } from 'react-router'
import OtherSpace from './ImageCenter/OtherSpace'
import TweenOne from 'rc-tween-one'
import './style/Item.less'
import { LoadOtherImage, addOtherStore, } from '../../actions/app_center'
import NotificationHandler from '../../common/notification_handler'
import Title from '../Title'

const createForm = Form.create;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

let MyComponent = React.createClass({
  getInitialState: function () {
    //this function for init the state
    return {
      UrlReverse: false,
      UrlPaused: true,
      UrlMoment: null,
      NameReverse: false,
      NamePaused: true,
      NameMoment: null,
      PwdReverse: false,
      PwdPaused: true,
      PwdMoment: null,
      urlInput: null,
      nameInput: null,
      textareaInput: null,
      pwdInput: null,
      registryInput: null,
      regMoment: null,
      regPaused: true,
      regReverse: false,
      inputType: 'text',
    };
  },
  propTypes: {
    config: React.PropTypes.array,
  },
  selectSpaceType(type) {
    //this function for user select new other image space type
    const scope = this.props.scope;
    scope.setState({
      otherSpaceType: type
    });
  },
  inputOnFocus(current) {
    //this function for user focus on current input and the title will be add an animate
    switch (current) {
      case 'url':
        this.setState({
          UrlReverse: false,
          UrlPaused: false,
          UrlMoment: null
        });
        break;
      case 'username':
        this.setState({
          NameReverse: false,
          NamePaused: false,
          NameMoment: null
        });
        break;
      case 'password':
        this.setState({
          PwdPaused: false,
          PwdReverse: false,
          PwdMoment: null,
          inputType: 'password'
        });
        break;
      case 'registryName':
        this.setState({
          regPaused: false,
          regReverse: false,
          regMoment: null
        });
        break;
    }
  },
  inputOnBlur(current) {
    //this function for user blur out current input and the title will be add an animate
    let urlInput = this.refs.urlInput;
    let textareaInput = this.refs.textareaInput;
    let nameInput = this.refs.nameInput;
    let pwdInput = this.refs.pwdInput;
    let registryInput = this.refs.registryInput
    switch (current) {
      case 'registryName':
        if (!!!registryInput.props.value) {
          this.setState({
            regPaused: false,
            regReverse: true,
            regMoment: null
          });
        }
        break;
      case 'url':
        if (!urlInput.props.value) {
          //it's meaning user hadn't input message in the input box so that the title will be move
          this.setState({
            UrlPaused: false,
            UrlReverse: true,
            UrlMoment: null
          });
        }
        break;
      case 'username':
        if (!nameInput.props.value) {
          this.setState({
            NamePaused: false,
            NameReverse: true,
            NameMoment: null
          });
        }
        break;
      case 'password':
        if (!pwdInput.props.value) {
          this.setState({
            PwdPaused: false,
            PwdReverse: true,
            PwdMoment: null
          });
        }
        break;

    }
  },
  handleReset(e) {
    //this function for user close add other image space modal
    e.preventDefault();
    this.props.form.resetFields();
    const scope = this.props.scope;
    scope.setState({
      createModalShow: false
    });
  },
  regnameExists(rule ,values, callback) {
    if (!values) {
      callback([new Error('请输入仓库名称')])
      return
    }
    if (values.length < 3) {
      callback([new Error('仓库名称不能少于3位')])
      return
    }
    if (values.length > 63) {
      callback([new Error('仓库名称过长，名称不能超过63位')])
      return
    }
    callback()
    return
  },
  urlExists(rule, values, callback) {
    if (!values) {
      callback([new Error('请输入仓库地址')])
      return
    }
    if (values.indexOf('http') < 0) {
      callback('地址以http或者https开头')
      return
    }
    callback()
    return

  },
  handleSubmit(e) {
    //this function for user submit add other image space
    e.preventDefault();
    const scope = this.props.scope;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        //it's mean there are some thing is null,user didn't input
        return;
      }
      const config = {
        registryName: values.registryName,
        username: values.username || null,
        password: values.passwd || null,
        url: values.url,
      }
      let notification = new NotificationHandler()

      this.setState({ visible: false });
      const self = this
      notification.spin(`添加第三方镜像中...`)
      this.props.addOtherStore(config, {
        success: {
          func: (res) => {
            notification.close()
            notification.success('添加第三方镜像成功')
            setTimeout(() => {
              scope.props.LoadOtherImage({
                success: {
                  func: (res) => {
                    scope.setState({
                      otherImageHead: res.data
                    })
                    self.props.form.resetFields()
                  }
                }
              })

            }, 500)
          }
        },
        failed: {
          func: (err) => {
            /*Modal.error({
              title: '添加第三方镜像失败',
              content: (<h3>{err.message.message}</h3>)
            });*/
            notification.close()
            notification.error('添加第三方镜像失败', err.message.message)
          }
        },
        isAsync: true
      })
      //when the code running here,it's meaning user had input all things,
      //and should submit the message to the backend
      scope.setState({
        createModalShow: false
      });
    });
  },
  render() {
    const scope = this.props.scope;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const registryProps = getFieldProps('registryName', {
      rules: [{ required: true, validator: this.regnameExists}]
    })
    const urlProps = getFieldProps('url', {
      rules: [
        { required: true, validator: this.urlExists }
      ],
    });

    const nameProps = getFieldProps('username', {
      rules: [
        { required: false, message: '请输入用户名' }
      ],
    });
    const passwdProps = getFieldProps('passwd', {
      rules: [
        { required: false, message: '请输入密码' },
      ],
    });
    return (
      <div className='modalBox'>
        <Form className='addForm' horizontal form={this.props.form}>
          <FormItem hasFeedback >
            <TweenOne
              animation={{ top: '-20', duration: 500 }}
              paused={this.state.regPaused}
              reverse={this.state.regReverse}
              moment={this.state.regMoment}
              style={{ position: 'absolute', width: '200px', top: '0' }}
              >
                <span className='title' key='name'>仓库名</span>
            </TweenOne>
            <Input {...registryProps} ref='registryInput' onFocus={this.inputOnFocus.bind(this, 'registryName')} onBlur={this.inputOnBlur.bind(this, 'registryName')} />
          </FormItem>
          <FormItem hasFeedback >
            <TweenOne
              animation={{ top: '-20', duration: 500 }}
              paused={this.state.UrlPaused}
              reverse={this.state.UrlReverse}
              moment={this.state.UrlMoment}
              style={{ position: 'absolute', width: '200px', top: '0' }}
              >
              <span className='title' key='title'>地址</span>
            </TweenOne>
            <Input {...urlProps} ref='urlInput' onFocus={this.inputOnFocus.bind(this, 'url')} onBlur={this.inputOnBlur.bind(this, 'url')} />
          </FormItem>
          <Alert message="私有仓库需要填写用户名和密码" type="info" showIcon />
          <FormItem hasFeedback >
            <TweenOne
              animation={{ top: '-20', duration: 500 }}
              paused={this.state.NamePaused}
              reverse={this.state.NameReverse}
              moment={this.state.NameMoment}
              style={{ position: 'absolute', width: '20%', top: '0' }}
              >
              <span className='title'>用户名</span>
            </TweenOne>
            <Input {...nameProps} ref='nameInput' onFocus={this.inputOnFocus.bind(this, 'username')} onBlur={this.inputOnBlur.bind(this, 'username')} />
          </FormItem>
          <FormItem hasFeedback >
            <TweenOne
              animation={{ top: '-20', duration: 500 }}
              paused={this.state.PwdPaused}
              reverse={this.state.PwdReverse}
              moment={this.state.PwdMoment}
              style={{ position: 'absolute', width: '20%', top: '0' }}
              >
              <span className='title'>密码</span>
            </TweenOne>
            <Input {...passwdProps} ref='pwdInput' type={this.state.inputType} autoComplete='off' onFocus={this.inputOnFocus.bind(this, 'password')} onBlur={this.inputOnBlur.bind(this, 'password')} />
          </FormItem>

          <br />
          <div className='btnBox'>
            <Button size='large' type='primary' onClick={this.handleSubmit}>确定</Button>
            &nbsp;&nbsp;
            <Button size='large' onClick={this.handleReset}>取消</Button>
          </div>
        </Form>
      </div>
    );
  },
});

MyComponent = createForm()(MyComponent);

class ImageCenter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      createModalShow: false,
      otherImageHead: [], // other image store
      other: {}
    }
    if(props.location.query.addUserDefined) {
      this.state.createModalShow = true
    }
  }
  setItem(type,other) {

    other = other || {}
    this.setState({itemType:type,other})
    if (type=='private') {
      browserHistory.push('/app_center/projects')
      return
    }else if(type == ''){
      browserHistory.push('/app_center/projects')
      return
    }
    browserHistory.push(`/app_center/projects/${type}`)
  }
  componentWillMount() {
    const { location } = this.props
    if (location.pathname === '/app_center') {
      browserHistory.replace('/app_center/projects')
      return
    }
    let type='private'
    if (location.pathname.indexOf('/app_center/projects/public') >-1) {
      type = 'public'
    }
    this.setState({itemType:type})
    this.props.LoadOtherImage({
      success: {
        func: (res) => {
          this.setState({
            otherImageHead: res.data
          })
        }
      }
    })
  }
  render() {
    const { children } = this.props
    const { otherImageHead,other } = this.state
    const _this = this
    const OtherItem = otherImageHead.map(item => {
      return (<span key={item.title} className={ other.title == item.title ?'tab active':'tab'} onClick={()=> this.setItem('other',item)}>
        <Icon type="shopping-cart" />&nbsp;{item.title}
      </span>)
    })
    if (OtherItem.length >0) {
      OtherItem.unshift(<span className="otherName">第三方仓库：</span>)
    }
    let tempImageList = otherImageHead.map((list, index) => {
      return (
        <TabPane tab={<span>{list.title}</span>} key={list.title}>
          <OtherSpace scope={_this} otherHead={list} imageId={list.id} />
        </TabPane>
      )
    })
    return (
      <QueueAnim className='ImageCenterBox' type='right'>
        <div id='ImageCenter' key='ImageCenterBox'>
          <Title title="镜像仓库" />
          <div className="ImageCenterTabs">
           <span className={this.state.itemType =='private'|| this.state.itemType ==''?'tab active':'tab'} onClick={()=> this.setItem('private')}>我的仓库组</span>
            <span className={this.state.itemType =='public' ?'tab active':'tab'} onClick={()=> this.setItem('public')}>公开仓库组</span>
            {OtherItem}

          </div>
          {this.state.itemType =='other'?
            <Tabs
              key='ImageCenterTabs'
              className="otherStore"
              activeKey={this.state.other.title}
              >
              {tempImageList}
            </Tabs>
          : children
          }


          <Modal title='添加第三方' className='addOtherSpaceModal' footer={null} onCancel={()=> this.setState({createModalShow:false})} visible={this.state.createModalShow}>
            <MyComponent scope={this} addOtherStore={this.props.addOtherStore} />
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultConfig = {
    isFetching: false,
    otherImageHead: [],
    server: ''
  }
  const defaultBindInfo = {
    configured: false
  }
  const { privateImages, otherImages, imagesInfo, getAppCenterBindUser } = state.images
  const { registry, imageList, isFetching } = privateImages || defaultConfig
  const { imageRow, server} = otherImages || defaultConfig
  const { configured } = getAppCenterBindUser || defaultBindInfo
  return {
    otherImageHead: imageRow,
    isFetching,
    server,
    configured
  }
}


export default connect(mapStateToProps,{
  addOtherStore,
  LoadOtherImage,
})(ImageCenter)