/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppStore component
 *
 * v0.1 - 2016-09-21
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Input, Button, Card ,Popconfirm} from 'antd'
import { Link , browserHistory} from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadAppStore,loadStackDetail } from '../../../actions/app_center'
import { DEFAULT_REGISTRY, TIMESTRAP } from '../../../constants'
import "./style/AppStore.less"
import Title from '../../Title'


let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  checkedFunc: function (e) {
    //check this item selected or not
    const {scope} = this.props;
    let oldList = scope.state.selectedList;
    if (oldList.includes(e)) {
      return true;
    } else {
      return false;
    }
  },
  onSelect: function (e,image,tag,mountPath,content,isPublic) {
    //single item selected function
    const {scope} = this.props;
    let oldList = [];
    if (oldList.includes(e)) {
      let index = oldList.indexOf(e);
      oldList.splice(index, 1);
    } else {
      oldList.push(e);
    }
    scope.setState({
      selectedList: oldList,
      condition: true,
      image,
      tag,
      mountPath,
      content,
      isPublic
    });
  },
  render: function () {
    let config = this.props.config
    let items = config.map((item) => {
      return (
        <div key={item.id} className={this.checkedFunc(item.id) ? "selectedApp AppDetail" : "AppDetail"}
          onClick={this.onSelect.bind(this, item.id,item.image,item.imageVersion,item.mountPath,item.content,item.isPublic)}
          >
          <Card className="imgBox">
          <img src={item.imageUrl==''?item.logId:`${item.imageUrl}?_=${TIMESTRAP}`} />
            <i className="selectIcon fa fa-check-circle"></i>
          </Card>
          <span className="textoverflow">{item.name}</span>
        </div>
      );
    });
    return (
      <div className="AppList">
        {items}
      </div>
    );
  }
});

class AppStore extends Component {
  constructor(props) {
    super(props);
    this.onSearchApp = this.onSearchApp.bind(this);
    this.state = {
      selectedList: [],
      appStoreList: [],
      defaultAppStoreList: [],
      visible: false,
      condition: false
    }
  }
  componentWillMount() {
    const self = this
    this.props.loadAppStore(DEFAULT_REGISTRY, {
      success: {
        func: (res) => {
          self.setState({
            appStoreList: res.data.data || [],
            defaultAppStoreList: res.data.data
          })
        }
      }
    })
  }
  godeploystack(visible) {
    if (!visible) {
      this.setState({ visible });
      return;
    }
    if (this.state.condition) {
     // 直接执行下一步
     const temid = this.state.selectedList
     const isPublic = this.state.isPublic
     const { loadStackDetail } = this.props;
     if(isPublic==1){
      browserHistory.push(`/app_manage/app_create/compose_file?templateid=${temid}`)
     }else{
        loadStackDetail(temid).then(({ response }) => {
          if(response.result.data.code == 200){
            browserHistory.push(`/app_manage/app_create/quick_create?templateid=${temid}`)
          }
        }).catch(err => {
            
        })
     }

    } else {
      this.setState({ visible });  // 进行确认
    }
  }
  confirm() {
    const selectedList = []
    selectedList.push(this.state.appStoreList[0].id)
    this.setState({
      condition: true,
      selectedList,
      isPublic:this.state.appStoreList[0].isPublic
    })
  }
  onSearchApp(e) {
    //this function for user search special app
    let keyword = e.target.value;
    const { defaultAppStoreList } = this.state;
    const newList = defaultAppStoreList.filter(list => {
      const search =  new RegExp(keyword)
      if ( search.test(list.name.toLowerCase()) ) {
        return true
      }else if(search.test(list.name.toUpperCase())){//模糊匹配
        return true
      }
      return false
    })
    this.setState({
      appStoreList: newList
    })
  }

  render() {
    const parentScope = this
    return (
      <QueueAnim id="AppStore"
        type="right"
        >
        <Title title="创建应用" />
        <div className="AppStore" key="AppStore">
          <div className="operaBox">
            <div className="line"></div>
            <span>选择应用</span>
            <span className="searchInputBox">
            <Input placeholder="搜索应用" size="large"  onChange={this.onSearchApp} />
            <i className="fa fa-search cursor" onClick={this.searchImages}></i>
            </span>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            <MyComponent config={this.state.appStoreList} scope={parentScope} />
          </div>
          <div className="btnBox">
            <Link to={`/app_manage/app_create`}>
              <Button type="primary" size="large">
                上一步
            </Button>
            </Link>
            <Link to={`/app_manage/app_create/compose_file`}>
            </Link>
            <Popconfirm title="您还没有选择应用，是否默认选择第一个！"
              visible={this.state.visible} onVisibleChange={(e)=>this.godeploystack(e)}
              onConfirm={()=> this.confirm()} >
              <Button type="primary" size="large">
                下一步
              </Button>
            </Popconfirm>
          </div>
        </div>
      </QueueAnim>
    )
  }
}

AppStore.propTypes = {
  selectedList: React.PropTypes.array
}

function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    appStoreList: [],

  }
  const { stackCenter } = state.images
  const { appStoreList, isFetching, registry } = stackCenter[DEFAULT_REGISTRY] || defaultPrivateImages

  return {
    appStoreList,
    isFetching,
    registry,
  }
}

export default connect(mapStateToProps, {
  loadAppStore,
  loadStackDetail
})(injectIntl(AppStore, {
  withRef: true,
}))