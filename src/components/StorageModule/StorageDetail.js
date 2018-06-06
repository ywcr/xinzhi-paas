/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/22
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { Tabs, Card, Menu, Progress, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
// import StorageStatus from "./StorageStatus"
import StorageBind from './StorageBind'
import StorageRental from './StorageRental'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadStorageInfo } from '../../actions/storage'
import "./style/StorageDetail.less"
import { DEFAULT_IMAGE_POOL } from '../../constants'
import storagePNG from '../../assets/img/storage.png'
import Title from '../Title'



const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane

const messages = defineMessages({
  useStatus: {
    id: "StorageDetail.header.useStatus",
    defaultMessage: '状态'
  },
  using: {
    id: "StorageDetail.header.using",
    defaultMessage: '使用中'
  },
  stop: {
    id: "StorageDetail.header.stop",
    defaultMessage: '未使用'
  },
  create: {
    id: "StorageDetail.header.create",
    defaultMessage: '创建时间'
  },
  useLevel: {
    id: "StorageDetail.header.useLevel",
    defaultMessage: '用量'
  },
  bindContainer: {
    id: "StorageBind.bind.bindContainer",
    defaultMessage: '绑定服务'
  },
  operating: {
    id: "StorageDetail.operating",
    defaultMessage: '操作'
  },
})

class StorageDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentKey: "1"
    }
    this.getQueryString=this.getQueryString.bind(this)
    this.loadData=this.loadData.bind(this)
  }


  getQueryString(name){
      var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if(r!=null)return  unescape(r[2]); return null;
  }
  loadData(props) {
    const { loadStorageInfo } = props
    const isOld=this.getQueryString('isOld')
    const diskType=this.getQueryString('diskType')  
    loadStorageInfo(props.params.pool, props.params.cluster, props.params.storage_name,diskType,isOld)
  }
  componentWillMount() {
    this.loadData(this.props)
  }
  render() {
    const { formatMessage } = this.props.intl
    const { currentKey } = this.state
    const { StorageInfo, isFetching } = this.props
    if (isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"></Spin>
        </div>
       )
    }
    const color = StorageInfo.isUsed ? '#f85a5a' : '#5cb85c'

    return (
      <div id="StorageDetail">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          <div key="ca" className="AppInfo">
            <Title title="存储详情" />
            <Card className="topCard">
              <div className="imgBox">
                <img src={storagePNG} />
              </div>
              <div className="infoBox">
                <div className="appTitle">
                  {StorageInfo.volumeName}
                </div>
                <div className="info">
                  {/*<FormattedMessage {...messages.useStatus} />*/}
                  {/*&nbsp;：*/}
                    {/*<span>*/}
                    {/*<i className= 'fa fa-circle error' style={ {color: color} }></i>&nbsp;*/}
                      {/*<span className={StorageInfo.isUsed ? 'error' : 'normal'} style={{ color: color }}>{StorageInfo.isUsed ? <FormattedMessage {...messages.using} /> : <FormattedMessage {...messages.stop} />}</span>*/}
                  {/*</span>*/}
                  <div className="createDate">
                    <FormattedMessage {...messages.create} />：
                   { StorageInfo.createTime }
                  </div>
                  <div className="use">
                    <FormattedMessage {...messages.useLevel} />
                    ：&nbsp;&nbsp;
                    <Progress strokeWidth={8} showInfo={false} status="active" percent={ StorageInfo.consumption * 100 } />
                    &nbsp;&nbsp; {(StorageInfo.consumption * StorageInfo.size)/(StorageInfo.size)*100 }%
                  </div>
                </div>
                <div style={{ clear:"both" }}></div>
              </div>

              <div style={{ clear:"both" }}></div>
            </Card>
            <Card className="bottomCard">
              <Tabs
                tabPosition="top"
                defaultActiveKey="1"
              >
                <TabPane tab={<FormattedMessage {...messages.bindContainer} />} key="1" >
                  <StorageBind pool={StorageInfo.imagePool} cluster={StorageInfo.cluster} volumeName={ StorageInfo.volumeName } diskType={ StorageInfo.diskType } isOld={ StorageInfo.isOld } />
                </TabPane>
                <TabPane tab="租赁信息" key="2" >
                  <StorageRental config={this.props.resourcePrice} size={StorageInfo.size}/>
                </TabPane>
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

StorageDetail.propTypes = {
  intl: PropTypes.object.isRequired,
  loadStorageInfo: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current 
  const defaultInfo = {
    imagePool: props.params.pool,
    volumeName: props.params.storage_name,  
    cluster: cluster.clusterID
  }
  const StorageInfo  = state.storage.storageDetail.StorageInfo || defaultInfo
  return {
    isFetching: state.storage.storageDetail.isFetching,
    StorageInfo,
    resourcePrice: cluster.resourcePrice
  }
}

export default connect(mapStateToProps,{
  loadStorageInfo,
})(injectIntl(StorageDetail,{withRef: true}))