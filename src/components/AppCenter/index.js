/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Modal, Tabs, Icon, Menu, Button, Card, Form, Input, Alert } from 'antd'
import TweenOne from 'rc-tween-one';
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ImageDetailBox from './ImageCenter/ImageDetail'
import ImageSpace from './ImageCenter/ImageSpace.js'
import MyCollection from './ImageCenter/MyCollection.js'
import PublicSpace from './ImageCenter/PublicSpace.js'
import OtherSpace from './ImageCenter/OtherSpace.js'
import './style/ImageCenter.less'
import { LoadOtherImage, addOtherStore, getImageDetailInfo, getAppCenterBindUser } from '../../actions/app_center'
import findIndex from 'lodash/findIndex'
import NotificationHandler from '../../common/notification_handler'
import Title from '../Title'

const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const createForm = Form.create;
const FormItem = Form.Item;

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
            &nbsp;&nbsp;&nbsp;
            <Button size='large' onClick={this.handleReset}>取消</Button>
          </div>
        </Form>
      </div>
    );
  },
});

MyComponent = createForm()(MyComponent);

// const otherHead = React.createClass({
//   cosnt otherImageList = this.props.otherImageList
//   let kke = otherImageList.map((list) => {
//    return (
//     <li className={current == 'otherSpace' ? 'titleSelected' : 'titleDetail'}
//       onClick={this.selectCurrentTab.bind(this, 'otherSpace', 'dockerhub',list.id)}
//       >
//       <span>list.title</span>
//     </li>

//   )
// })
// })
class ImageCenter extends Component {
  constructor(props) {
    super(props);
    this.addImageTab = this.addImageTab.bind(this);
    this.closeAddModal = this.closeAddModal.bind(this);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.state = {
      current: 'imageSpace',
      // otherSpace: null,
      createModalShow: false,
      otherSpaceType: '1',
      imageDetailModalShow: false,
      otherHead: {},
      otherImageHead: [],
      configured: false,
      globalConfigured: false,
    }
  }

  componentWillMount() {
    let { getAppCenterBindUser } = this.props;
    const _this = this;
    getAppCenterBindUser({
      success: {
        func: (result) => {
          _this.setState({
            configured: result.configured,
            globalConfigured: result.global
          });
        },
        isAsync: true
      }
    });
  }

  componentDidMount() {
    this.props.LoadOtherImage({
      success: {
        func: (res) => {
          this.setState({
            otherImageHead: res.data
          })
        },
        isAsync: true
      }
    });
  }

  addImageTab() {
    //this function for user add other image store modal
    this.setState({
      createModalShow: true,
      otherSpaceType: '1'
    });
  }

  closeAddModal() {
    //this function for user close add other image store modal
    this.setState({
      createModalShow: false
    });
  }

  closeImageDetailModal() {
    //this function for user close the modal of image detail info
    this.setState({
      imageDetailModalShow: false
    });
  }

  render() {
    const { current, otherSpace } = this.state;
    const { formatMessage } = this.props.intl;
    const scope = this;
    const otherImageHead = this.state.otherImageHead || [];
    let ImageTabList = [];
    let { configured, globalConfigured } = this.state;
    ImageTabList.push(<TabPane tab='私有空间' key='1'><ImageSpace scope={scope} hubConfig={configured} globalHubConfigured={globalConfigured} /></TabPane>)
    ImageTabList.push(<TabPane tab='公有空间' key='2'><PublicSpace scope={scope} /></TabPane>)
    ImageTabList.push(<TabPane tab='我的收藏' key='3'><MyCollection scope={scope} hubConfig={configured} /></TabPane>)

    let tempImageList = otherImageHead.map((list, index) => {
      return (
        <TabPane tab={<span><Icon type='shopping-cart' />&nbsp;<span>{list.title}</span></span>} key={index + 4}>
          <OtherSpace scope={scope} otherHead={list} imageId={list.id} />
        </TabPane>
      )
    });
    ImageTabList = ImageTabList.concat(tempImageList)
    return (
      <QueueAnim className='ImageCenterBox'
        type='right'
        >
        <div id='ImageCenter' key='ImageCenterBox'>
          <Title title="镜像仓库" />
          <Tabs
            key='ImageCenterTabs'
            defaultActiveKey='1'
            tabBarExtraContent={
              <Button className='addBtn' key='addBtn' size='large' type='primary' onClick={this.addImageTab}>
                <Icon type='plus' />&nbsp;
                  <span>添加第三方</span>
              </Button>
            }
            >

            {ImageTabList}
          </Tabs>
          <Modal title='添加第三方' className='addOtherSpaceModal' visible={this.state.createModalShow}
            onCancel={this.closeAddModal}
            >
            <MyComponent scope={scope} addOtherStore={this.props.addOtherStore} />
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

ImageCenter.propTypes = {
  intl: PropTypes.object.isRequired
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

function mapDispatchToProps(dispatch) {
  return {
    addOtherStore: (obj, callback) => {
      dispatch(addOtherStore(obj, callback))
    },
    LoadOtherImage: (callback) => {
      dispatch(LoadOtherImage(callback))
    },
    getAppCenterBindUser
  }
}

export default connect(mapStateToProps, {
  addOtherStore,
  LoadOtherImage,
  getAppCenterBindUser,
})(injectIntl(ImageCenter, {
  withRef: true,
}))