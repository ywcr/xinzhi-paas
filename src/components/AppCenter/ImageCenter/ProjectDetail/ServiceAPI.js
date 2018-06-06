/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ServiceAPI component
 *
 * v0.1 - 2017-6-9
 * @author BaiYu
 */
import React, { Component } from 'react'
import { Card, Spin } from 'antd'
import { connect } from 'react-redux'
import { loadRepositoriesTagConfigInfo } from '../../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../constants'
import './style/ServiceAPI.less'

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  formatEnv: function (envList) {
    //this function for format the env list ,change the single elem to an new json
    let newList = new Array();
    envList.map((item) => {
      let tempList = item.split("=");
      let tempElem = {
        "envName": tempList[0],
        "envData": tempList[1]
      }
      newList.push(tempElem);
    });
    return newList;
  },
  render: function () {
    let config = this.props.config;
    let items;
    if (!!config) {
      let showList = this.formatEnv(config);
      items = showList.map((item, index) => {
        return (
          <div className="apiItemDetail" key={index} >
            <span className="leftSpan">{item.envName}</span>
            <span className="rightSpan">{item.envData}</span>
            <div style={{ clear: "both" }}></div>
          </div>
        );
      });
    } else {
      items = (
        <div className="apiItemDetail" key="apiItemDetail" >
          暂无数据
        </div>
      )
    }
    return (
      <div className="apiItemList">
        {items}
      </div>
    );
  }
});

class ServiceAPI extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { registry, loadRepositoriesTagConfigInfo } = this.props;
    const { fullname, imageTags} = this.props;
    let processedName = processImageName(fullname)
    loadRepositoriesTagConfigInfo(registry, processedName, imageTags);
  }
  render() {
    const { isFetching, configList } = this.props
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!configList) {
      return (
        <div style={{lineHeight:'50px'}}>没有加载到该版本的配置信息</div>
      )
    }
    let portsShow = null, dataStorageShow = [], cmdShow = null, entrypointShow = null;
    let ports = configList.containerPorts || null
    if (!!ports) {
      portsShow = ports.map(item => item).join('，')
    }
    let dataStorage = configList.mountPath;
    if (dataStorage && Object.keys(dataStorage).length) {
      for(let key in dataStorage){
        dataStorageShow.push(<p key={key}>&nbsp;&nbsp;&nbsp;&nbsp; - {key}</p>)
      }
      //dataStorageShow = dataStorage.map((item) => {
      //  return (
      //    <p>&nbsp;&nbsp;&nbsp;&nbsp; - {item}</p>
      //  )
      //});
    }
    let { cmd, entrypoint } = configList;
    if (!!cmd) {
      cmdShow = cmd.map((item) => {
        return (
          <span>{item}&nbsp;</span>
        )
      });
    }
    if (!!entrypoint) {
      entrypointShow = entrypoint.map((item) => {
        return (
          <span>{item}&nbsp;</span>
        )
      });
    }
    let size = 0;
    let unit = ' K';
    if (configList.sizeInfo && configList.sizeInfo.totalSize > 0) {
      size = configList.sizeInfo.totalSize;
      if (size > 1024) {
        size = Math.ceil(size /1024)
      }
      if (size > 1024) {
        size = Math.ceil(size /1024)
        unit = ' M'
      }
      if (size > 1024) {
        size = Math.ceil(size /1024)
        unit = ' G'
      }
    }
    let { defaultEnv } = configList;
    return (
      <Card className="imageServiceAPI" key='imageserviceapi'>
        <p><li>服务端口:&nbsp;&nbsp;{portsShow ? portsShow:"该镜像无端口定义"}</li></p>
        <p><li>存储卷</li></p>
        {dataStorageShow.length ? dataStorageShow : <span>&nbsp;&nbsp;&nbsp;&nbsp; - 该镜像无存储卷定义</span>}
        <p><li>运行命令及参数:&nbsp;&nbsp;{entrypointShow}&nbsp;{cmdShow}</li></p>
        <div><li>大小：{(size > 0) ? size + unit : '未知'}</li></div>
        <p><li>环境变量定义</li></p>
        <div className="itemBox">
          <div className="title">
            <span className="leftSpan">变量名</span>
            <span className="rightSpan">默认值</span>
            <div style={{ clear: "both" }}></div>
          </div>
          <MyComponent config={defaultEnv} />
        </div>
      </Card>
    )
  }
}

function processImageName(name) {
  let arr = name.split('/')
  if (arr.length > 2) {
    name = arr[0] + '/' + arr[1]
    for (let i = 2; i < arr.length; i++) {
      name += "%2F"
      name += arr[i]
    }
  }
  return name
}


function mapStateToProps(state, props) {
  const defaultImageDetailTagConfig = {
    isFetching: false,
    registry: DEFAULT_REGISTRY
  }
  const { imageTagConfig } = state.harbor
  const configList =  imageTagConfig[DEFAULT_REGISTRY] || defaultImageDetailTagConfig
  // const { registry, tag, isFetching, server, configList } = otherTagConfig || defaultImageDetailTagConfig
  const tag = props.imageTags
  const fullname = props.fullname
  let list = {}
  if(configList[fullname] && configList[fullname][tag]){
    list = configList[fullname][tag]
  }
  return {
    registry: DEFAULT_REGISTRY,
    registryServer: configList.server,
    configList: list,
    isFetching: configList.isFetching,
    tag
  }
}

ServiceAPI.propTypes = {
  //
}

export default connect(mapStateToProps, {
  loadRepositoriesTagConfigInfo
})(ServiceAPI);