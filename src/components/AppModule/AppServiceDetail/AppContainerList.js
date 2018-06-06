/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppDetail component
 *
 * v0.1 - 2016-09-13
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Checkbox, Button, Card, Menu, Spin, Tooltip } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/AppContainerList.less'
import { calcuDate } from '../../../common/tools'
import { loadServiceContainerList } from '../../../actions/services'
import ContainerStatus from '../../TenxStatus/ContainerStatus'

const MyComponent = React.createClass({
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
  onchange: function (e) {
    //single item selected function
    const {scope} = this.props;
    let oldList = scope.state.selectedList;
    if (oldList.includes(e)) {
      let index = oldList.indexOf(e);
      oldList.splice(index, 1);
    } else {
      oldList.push(e);
    }
    scope.setState({
      selectedList: oldList
    });
  },
  getImages(item) {
    let images = []
    item.spec.containers.map((container) => {
      images.push(container.image)
    })
    return images.join(', ')
  },
  render: function () {
    const {config, loading} = this.props
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length < 1) {
      return (
        <div className='loadingBox' style={{clear:'both'}}>
          无容器实例
        </div>
      )
    }
    const items = config.map((item) => {
      const images = this.getImages(item)
      return (
        <div className="containerDetail" key={item.metadata.name}>
          {/*(<div className="selectIconTitle commonData">
            <Checkbox checked={this.checkedFunc(item.id)} onChange={()=>this.onchange(item.id)}></Checkbox>
          </div>)*/}
          <div className="name commonData" style={{ marginLeft: 24 }} >
            <Tooltip placement="topLeft" title={item.metadata.name} >
              <Link to={`/app_manage/container/${item.metadata.name}`}>
                {item.metadata.name}
              </Link>
            </Tooltip>
          </div>
          <div className="status commonData">
            <ContainerStatus container={item} />
          </div>
          <div className="image commonData">
            <Tooltip placement="topLeft" title={images ? images : ""} >
              <span>{images || '-'}</span>
            </Tooltip>
          </div>
          <div className="address commonData">
            <span>内&nbsp;:&nbsp;{item.status.podIP}</span>
          </div>
          <div className="createTime commonData">
            {calcuDate(item.metadata.creationTimestamp || '')}
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <div className="containerList">
        {items}
      </div>
    );
  }
})

class AppContainerList extends Component {
  constructor(props) {
    super(props);
    this.onchange = this.onchange.bind(this);
    this.allSelectedChecked = this.allSelectedChecked.bind(this);
    this.state = {
      selectedList: []
    }
  }

  allSelectedChecked() {
    if (this.state.selectedList.length == testData.length) {
      return true;
    } else {
      return false;
    }
  }

  onchange() {
    //select title checkbox
    let newList = new Array();
    if (this.state.selectedList.length == testData.length) {
      //had select all item,turn the selectedlist to null
      newList = [];
    } else {
      //select some item or nothing,turn the selectedlist to selecet all item
      for (let elem of testData) {
        newList.push(elem.id);
      }
    }
    this.setState({
      selectedList: newList
    });
  }

  render() {
    const parentScope = this;
    const { containerList, loading } = this.props
    return (
      <div id="AppContainerList">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          {/*(<div className="operaBox">
          <div className="leftBox">
            <Button type="primary" size="large">
              <i className="fa fa-play"></i>
              启动
            </Button>
            <Button size="large">
              <i className="fa fa-stop"></i>
              停止
            </Button>
            <Button size="large">
              <i className="fa fa-trash"></i>
              删除
            </Button>
          </div>
          <div className="rightBox">
            <span>共&nbsp;{testData.length} 容器</span>
            <span>已选中的容器({this.state.selectedList.length}个)</span>
          </div>
          <div style={{ clear:"both" }}></div>
        </div>)*/}
          <Card className="dataBox">
            <div className="titleBox">
              {/*(<div className="selectIconTitle commonData">
              <Checkbox checked={this.allSelectedChecked() } onChange={()=>this.onchange()}></Checkbox>
              </div>)*/}
              <div className="name commonData" style={{ marginLeft: 24 }} >
                名称
              </div>
              <div className="status commonData">
                状态
              </div>
              <div className="image commonData">
                镜像
              </div>
              <div className="address commonData">
                地址
              </div>
              <div className="createTime commonData">
                创建时间
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent scope={parentScope} config={containerList} loading={loading} />
          </Card>
        </QueueAnim>
      </div>
    )
  }
}

AppContainerList.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,
  containerList: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default AppContainerList