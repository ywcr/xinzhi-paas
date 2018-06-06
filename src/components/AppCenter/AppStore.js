/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * app store component
 *
 * v0.1 - 2016-10-10
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input, Spin, Modal, Tooltip,Icon } from 'antd'
import QueueAnim from 'rc-queue-anim'
import ScrollAnim from 'rc-scroll-anim'
import Animate from 'rc-animate'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import CreateApp from './CreateTemplate/CreatePrivateTemplate'
import NotificationHandler from '../../common/notification_handler'
import { browserHistory } from 'react-router'
import { loadUserTeamspaceList } from '../../actions/user'

import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadAppStore ,deleteAppTemplate, loadStackDetail } from '../../actions/app_center'
import DetailBox from './StoreDetail'
import { DEFAULT_REGISTRY, TIMESTRAP } from '../../constants'
import Title from '../Title'

import "./style/ImageStore.less"

// const InputGroup = Input.Group;
// const SubMenu = Menu.SubMenu;
// const MenuItemGroup = Menu.ItemGroup;
// const Link = ScrollAnim.Link;
const Element = ScrollAnim.Element;
// const ScrollOverPack = ScrollAnim.OverPack;
// const EventListener = ScrollAnim.Event;
const  notification = new NotificationHandler()


class MyComponent extends Component{
  constructor(props){
    super(props)

      this.showDetail=this.showDetail.bind(this)
      this.showCreate=this.showCreate.bind(this)
  }

  showDetail(id){
    const parentScope = this.props.scope
    const {loadStackDetail} = parentScope.props
    loadStackDetail(id, {
      success: {
        func: (res) => {
          parentScope.setState({
            detailModal: true,
            detailContent: res.data.data
          })
        }
      }
    })
  }
  showCreate(){
      const {scope}=this.props
      const { loadUserTeamspaceList } = this.props.scope.props
      const modalKey='modal'+new Date().getTime();
      loadUserTeamspaceList('default', { size: 1000 })
      
      scope.setState({
          createTemplate:true,
          ModalKey:modalKey
      })
  }
  linkDeploy(id,ispublic){
    const parentScope = this.props.scope
    const {loadStackDetail} = parentScope.props
    loadStackDetail(id).then(({ response }) => {
      if(ispublic == 1){
        browserHistory.push('/app_manage/app_create/compose_file?templateid='+id)
      }else{
        browserHistory.push('/app_manage/app_create/quick_create?templateid='+id)
      }
    }).catch(err => {
    })
  }
  render(){
    const { scope } = this.props;
    let config = this.props.config;
    let items = ''
    if(config && config.length!=0){
      items = config.map((item, index) => {
            return (
              <div className={"moduleDetail store" + index} key={item + "_" + index}>
                <div className="bigTitle">
                  {item.title}
                </div>
                <div className="imageBox">
                  {item.imageList.map((imageDetail) => {
                          return (
                      <Card className="imageDetail" key={imageDetail.name}>
                      <div style={{ float: 'right', padding: '10px 10px 0 0 ' }}>
                      {imageDetail.isPublic == '1' ? <div className='triangle-topright'><span >公有</span></div> : <div className='triangle-topright green'><span>私有</span></div>}
                    </div>
                        <Tooltip title="点击查看">
                        <div className="imgBox" onClick={()=>this.showDetail(imageDetail.id)}>
                          <img src={imageDetail.imageUrl==''?imageDetail.logId:`${imageDetail.imageUrl}`} />
                        </div>
                        </Tooltip>
                        <div className="intro">
                          <span className="span7 textoverflow">{imageDetail.name}</span>
                          <span className='span2'><Button onClick={()=>this.linkDeploy(imageDetail.id,imageDetail.isPublic)} className="btn-deploy">部署</Button></span>
                        </div>
                      </Card>
                    )
                  }
                  )}
                  <div style={{ clear: "both" }}></div>
                </div>
              </div>
            );
      });
    }
    return (
      <div className="storeBody" style={{ transform: "none !important" }}>
        <div className='topCreateButton'>{config && config.length!=0 ? <Button onClick={this.showCreate} className='createButton' type='primary'>创建私有模板应用</Button>:''}</div>
        { config && config.length!=0 ? items:<div style={{textAlign:'center',marginTop:'160px',fontSize:'20px'}}>暂无私有模板，请创建 --> <Button onClick={this.showCreate} className='createButton' type='primary'>创建</Button></div>}
      </div>
    );
  }

};

class AppStore extends Component {
  constructor(props) {
    super(props);
    super(...arguments);
    this.windowScroll = this.windowScroll.bind(this);
    this.state = {
      current: "1",
      scrollTop: 0,
      ElemPaused: true,
      ElemReverse: false,
      ElemMoment: null,
      detailContent: false,
      createTemplate:false,
      delModal:false,
      loading:false,
      modalKey:''
    }
  }

  componentWillMount() {
      const { loadAppStore } = this.props
    loadAppStore(DEFAULT_REGISTRY)
  }

  windowScroll(e) {
    //this function for user scroll the window
    let moduleList = document.getElementsByClassName("moduleDetail");
    let rootElement = document.getElementsByClassName("ImageStoreBox");
    let rootHeight = rootElement[0].clientHeight;
    let parentHeight = moduleList[0].parentElement.clientHeight;
    let temp = new Array();
    let scroll = e.target.scrollTop;//it's mean the big box scroll height
    for (let i = 0; i < moduleList.length; i++) {
      let offetset = moduleList[i].offsetTop;
      let itemClient = moduleList[i].clientHeight;
      if (scroll > (offetset - 150) && scroll < (offetset + 150)) {
        this.setState({
          current: i + 1
        });
      }
      if ((scroll + rootHeight - itemClient) > (offetset + 350) && i == moduleList.length - 1) {
        this.setState({
          current: i + 1
        });
      }
    }
  }


  /*删除应用模板*/

    deleteTemplate(){
       const {id}=this.state.detailContent
       const {deleteAppTemplate,loginUser}=this.props
       const isRole =loginUser.info.role
      //  return false;
       const _this=this;
       this.setState({
           loading:true
       })
       deleteAppTemplate(id,isRole,{
           success:{
               func:(res)=>{
                   if(res.data.statusCode==200){
                       notification.success('删除成功!')
                       _this.setState({
                           loading:false,
                           delModal:false,
                           detailModal:false
                       })
                       const { loadAppStore } = _this.props
                       loadAppStore(DEFAULT_REGISTRY)
                   }else{
                       notification.error('删除失败，只可删除自己创建的模版!')
                       _this.setState({
                           loading:false,
                           delModal:false,
                           detailModal:false
                       })
                   }

               },
               isAsync: true
           }
       })
    }

  scrollElem(index) {
    let moduleList = document.getElementsByClassName("moduleDetail");
    let rootElement = document.getElementsByClassName("ImageStoreBox");
    let offetset = moduleList[index].offsetTop;
    let domElem = this.refs.ImageStoreBox;
    domElem.Animate({ scrollTop: offetset }, 500)
  }

  render() {
    const { current } = this.state;
    const { formatMessage } = this.props.intl;
    const scope = this;
    let storeList = ''
    let {appStoreList,teams} = this.props
    // if (!appStoreList || appStoreList.length === 0) {
    //    return (<div className='loadingBox'><Spin size='large' /></div>)
    // }
    if(appStoreList){
      storeList = appStoreList.map((list, index) => {
        return (
          <span key={list.title+index}>
            <div className={current == index + 1 ? "currentNav navItem" : "navItem"} onClick={() => this.scrollElem(index)}>
              <i className={current == index + 1 ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
                {list.title}
            </div>
            {(appStoreList.length - 1 > index) ? [<div className="line"></div>] : null}
          </span>
        )
      })
    }else{

    }
    
    return (
        <QueueAnim className="ImageStoreBox"
          type="right"
          onScroll={this.windowScroll.bind(this)}
          ref="ImageStoreBox"
          key="ImageStoreBox"
          >
            <div className="nav">
              {storeList}
              <Title title="应用商店" />
            </div>
            <MyComponent key="ImageStoreBox-component"  scope={scope} config={this.props.appStoreList} />
            <Modal
              visible={this.state.detailModal}
              className="AppServiceDetail"
              transitionName="move-right"
              onCancel={()=> {this.setState({detailModal: false}) }}
              >
              {/* right detail box  */}
              <DetailBox scope={scope} data={this.state.detailContent} />
            </Modal>
            <Modal visible={this.state.createTemplate}
                   className='CreateDatabaseModal' maskClosable={false} width={800}
                   title='创建私有模板应用'
                   key={this.state.modalKey}
                   onCancel={() => { this.setState({ createTemplate: false }) } }
            >
              <CreateApp scope={scope} teams={teams} createTemplate={this.state.createTemplate} />
            </Modal>
          <Modal title="提示"  confirmLoading={this.state.loading}   visible={this.state.delModal} onOk={()=> this.deleteTemplate()}   onCancel={()=> this.setState({delModal: false})}>
            <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除应用模板?</div>
          </Modal>
        </QueueAnim>
    )
  }
}

AppStore.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const { entities } = state
  const { current,loginUser } = entities
  const {teamClusters}=state.team
  const defaultPrivateImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    appStoreList: [],

  }
  const { stackCenter } = state.images
  const { appStoreList, isFetching, registry } = stackCenter[DEFAULT_REGISTRY] || defaultPrivateImages
  const teamspaces = state.user.teamspaces

  return {
    teams:(teamspaces.result ? teamspaces.result.teamspaces : []),
    teamClusters,
    appStoreList,current,loginUser,
    isFetching,
    registry,
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList,  
  loadAppStore,
  loadStackDetail,
  deleteAppTemplate,
})(injectIntl(AppStore, {
  withRef: true,
}))