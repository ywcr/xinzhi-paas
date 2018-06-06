/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * OtherSpace component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Spin,Input, Modal, Table } from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DeleteOtherImage, SearchOtherImage, getOtherImageList} from '../../../actions/app_center'
import './style/OtherSpace.less'
import ImageDetailBox from './ImageDetail/OtherDetail.js'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

const menusText = defineMessages({
  search: {
    id: 'AppCenter.ImageCenter.OtherSpace.search',
    defaultMessage: '搜索',
  },
  belong: {
    id: 'AppCenter.ImageCenter.OtherSpace.belong',
    defaultMessage: '类型：',
  },
  imageUrl: {
    id: 'AppCenter.ImageCenter.OtherSpace.imageUrl',
    defaultMessage: '镜像地址：',
  },
  downloadNum: {
    id: 'AppCenter.ImageCenter.OtherSpace.downloadNum',
    defaultMessage: '下载次数：',
  },
  deployService: {
    id: 'AppCenter.ImageCenter.OtherSpace.deployService',
    defaultMessage: '部署服务',
  },
  logout: {
    id: 'AppCenter.ImageCenter.OtherSpace.logout',
    defaultMessage: '注销',
  },
  noData: {
    id: 'AppCenter.ImageCenter.OtherSpace.noData',
    defaultMessage: '暂无数据',
  }
})

class OtherSpace extends Component {
  constructor(props) {
    super(props);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.state = {
      currentImage: null,
      imageDetailModalShow: false
    }
  }

  componentWillMount() {
    const { getOtherImageList, imageId } = this.props;
    getOtherImageList(imageId);
  }
  componentDidUpdate() {
    const { imageId } = this.props
    let searchInput = document.getElementById(imageId);
    searchInput && searchInput.focus()
  }
  closeImageDetailModal() {
    //this function for user close the modal of image detail info
    this.setState({
      imageDetailModalShow: false
    });
  }

  deleteImage() {
    const parentScope = this.props.scope
    this.setState({delModal: false})
    const scope = this
    this.props.DeleteOtherImage(this.state.imageId, {
      success:{
        func: () => {
          const imageRow = scope.props.imageRow
          parentScope.setState({
            otherImageHead: imageRow,
            current: 'imageSpace',
            otherSpace: ''
          })
        },
        isAsync: true
      }
    })

  }
  searchImage(e) {
    const image = document.getElementById(this.props.imageId).value
    this.props.SearchOtherImage(image,this.props.imageId)
    // this.props.getOtherImageList(this.props.imageId)
  }
  showImageDetail (imageName) {
    //this function for user select image and show the image detail info
    this.setState({
      imageDetailModalShow:true,
      currentImage:imageName
    });
  }
  render() {
    const { formatMessage } = this.props.intl;
    const { liteFlag, imageId } = this.props;
    const rootscope = this.props.scope;
    const scope = this;
    const otherHead = this.props.otherHead
    const registryServer = otherHead.url.split('//')[1]
    const columns = [{
      title: '镜像名',
      dataIndex: 'name',
      key: 'name',
      width:'30%',
      render: (text,row) => {
        return (
          <div className="imageList">
            <div className="imageBox">
              <svg className='appcenterlogo'>
                <use xlinkHref='#appcenterlogo' />
              </svg>
            </div>
            <div className="contentBox">
              <div className="title" onClick={()=> this.showImageDetail(row.name)}>
                {text}
              </div>
              <div className='type'>
                <FormattedMessage {...menusText.belong} />&nbsp;私有
              </div>
            </div>
          </div>
        )
      }
    }, {
      title: '地址',
      dataIndex: 'description',
      key: 'description',
      width:'40%',
      render:(text, row) => {
        return (
          <div className="imgurl"><FormattedMessage {...menusText.imageUrl} />{registryServer}/{row.name}</div>
        )
      }
    }, {
      title: '部署',
      dataIndex: 'icon',
      key: 'icon',
      width:'15%',
      render: (text, row)=> {
        return (
          <Button type="ghost" onClick={()=>browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${registryServer}&imageName=${row.name}&other=${imageId}`)}>
            <FormattedMessage {...menusText.deployService} />
          </Button>
        )
      }
    }
    ];
    return (
      <QueueAnim className='OtherSpace'
        type='right'
      >
        <div id='OtherSpace' key='OtherSpace'>
          <Card className='OtherSpaceCard'>
            <div className='operaBox'>
              <div className='infoBox'>
                <div className='url'>
                  <i className='fa fa-link'></i>&nbsp;&nbsp;
                  {otherHead.url}
                </div>
                {otherHead.username ?
                  <div className='name'>
                    <i className='fa fa-user'></i>&nbsp;&nbsp;
                    {otherHead.username}
                  </div>
                  :null
                }
              </div>
              <Button className='logout' size='large' type='ghost' onClick={()=>this.setState({imageId:this.props.imageId, delModal: true})}>
                <FormattedMessage {...menusText.logout} />
              </Button>
              <div className="searchBox">
                <Input size="large" id={imageId} placeholder={formatMessage(menusText.search)} type='text' onPressEnter={()=>this.searchImage()}/>
                <i className='fa fa-search' onClick={()=>this.searchImage()}></i>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <Table className="privateImage" dataSource={this.props.imageList} columns={columns} pagination={{simple:true}} loading={this.props.isFetching}/>
            {/*<MyComponent scope={scope} parentScope={this.props.scope.parentScope} isFetching={this.props.isFetching} imageId ={this.props.imageId} otherHead={otherHead} config={this.props.imageList} />*/}
          </Card>
        </div>
        <Modal
          visible={this.state.imageDetailModalShow}
          className='AppServiceDetail'
          transitionName='move-right'
          onCancel={this.closeImageDetailModal}
        >
          <ImageDetailBox scope={scope}  server={otherHead.url} parentScope={rootscope} imageId ={this.props.imageId} config={this.state.currentImage} />
        </Modal>
        <Modal title="删除第三方镜像操作" visible={this.state.delModal}
          onOk={()=> this.deleteImage()} onCancel={()=> this.setState({delModal: false})}
        >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除这项操作?</div>
        </Modal>
      </QueueAnim>
    )
  }
}

OtherSpace.propTypes = {
  intl: PropTypes.object.isRequired
}
function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    imageList: [],
  }
  const { otherImages} = state.images
  const { imageList, isFetching} = otherImages[props.imageId] || defaultPrivateImages
  const { imageRow } = otherImages
  let privateImage
  if (imageList) {
    privateImage = imageList.map(item => {
      return { name:item }
    })

  }
  return {
    imageList: privateImage,
    imageRow,
    isFetching,
  }
}

export default connect(mapStateToProps,{
  getOtherImageList,
  DeleteOtherImage,
  SearchOtherImage
})(injectIntl(OtherSpace, {
  withRef: true,
}))