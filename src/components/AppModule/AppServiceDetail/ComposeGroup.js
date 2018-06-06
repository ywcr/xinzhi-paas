/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ComposeGroup component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card, Spin, Modal ,Input , Button, Popover, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import filter from 'lodash/filter'
import { loadConfigName } from '../../../actions/configs.js'
import "./style/ComposeGroup.less"

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    const service = this.props.service
    let volumes = ''
      if(service&&service.spec&&service.spec.template&&service.spec.template.spec&&service.spec.template.spec.volumes){
          volumes=service.spec.template.spec.volumes
      }

    let container =''
      if(service&&service.spec&&service.spec.template&&service.spec.template.spec&&service.spec.template.spec.containers[0]){
          container=service.spec.template.spec.containers[0]
      }
    if (!volumes) {
      this.setState({
        config: []
      })
      return
    }
    const config = []
    let index = 0
    volumes.forEach((volume) => {
      if (volume.configMap) {
        config.push({
          id: ++index,
          mountPod: filter(container.volumeMounts, ['name', volume.name])[0].mountPath,
          group: volume.configMap.name,
          file: volume.configMap.items
        })
      }
    })
    this.setState({
      config
    })
  },
	loadConfigData(group, name) {
    const self = this
    this.props.loadConfigName(this.props.cluster, { group, Name: name }, {
      success: {
        func: (result) => {
          self.setState({
            modalConfigFile: true,
            configName: name,
            configtextarea: (<pre>{result.data}</pre>)
          })
          // Modal.confirm({
          //   title: '配置文件',
          //   content: <pre>{result.data}</pre>,
          //   okText: '确定'
          // })
        }
      }
    })
	},
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow } = nextProps
    if (!serviceDetailmodalShow) {
      this.setState({
        config: []
      })
      return
    }
    const service = nextProps.service
    if (!service.spec) {
      this.setState({
        config: []
      })
      return
    }
    const volumes = service.spec.template.spec.volumes
    const container = service.spec.template.spec.containers[0]
    if (!volumes) {
      this.setState({
        config: []
      })
      return
    }
    const config = []
    let index = 0
    volumes.forEach((volume) => {
      if (volume.configMap) {
        config.push({
          id: ++index,
          mountPod: filter(container.volumeMounts, ['name', volume.name])[0].mountPath,
          group: volume.configMap.name,
          file: volume.configMap.items
        })
      }
    })
    this.setState({
      config
    })

  },
  render: function () {
    const configData = this.props.configData[this.props.cluster]
    let loading = ''
    if(configData) {
      const { isFetching } = configData

      if(isFetching) {
        loading= <div className="loadingBox" style={{position: 'absolute'}}><Spin size="large" /></div>
      }
    }
    let config = this.state.config;
    if (config.length == 0) {
      return (
        <Card className="composeList">
          <div style={{lineHeight:'60px'}}>暂无配置</div>
        </Card>
      )
    }
    let items = config.map((item) => {
      if (!item.file) {
        // return 'no file'
        item.file = []
      }
      let group = item.file.map(list => {
        return <div title="点击查看配置文件" style={{wordBreak: 'break-all',color:'#2db7f5', cursor:'pointer'}} onClick={() => this.loadConfigData(item.group, list.path) }>{list.path} </div>
      })
      return (
        <div className="composeDetail" key={item.id.toString() }>
          <div className="commonData">
            <span>{item.mountPod}</span>
          </div>
          <div className="commonData">
            <span>{item.group}</span>
          </div>
          <div className="composefile commonData">
            {
              item.file.length > 0
              ? <span title="点击查看配置文件" onClick={() => this.loadConfigData(item.group, item.file[0].path) }>{item.file[0].path}</span>
              : <span>已挂载整个配置组<Link to="/app_manage/configs"> <Icon type="export" /></Link></span>
            }
            {item.file.length > 1 ?
            <Popover content={group} getTooltipContainer={()=> document.getElementById('ComposeGroup')}>
              <svg className="more"><use xlinkHref="#more"></use></svg>
            </Popover>
            :null
            }
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <Card className="composeList">
        {loading}
        { items }
        <Modal
          title='查看配置文件' wrapClassName='read-configFile' visible={this.state.modalConfigFile}
          footer={
           <Button type="primary" onClick={() => { this.setState({ modalConfigFile: false }) } }>确定</Button>
          }
          onCancel={() => { this.setState({ modalConfigFile: false }) } }
          width="600px"
          >
          <div className='configFile-name'>
            <div className="ant-col-3 key">名称：</div>
            <div className="ant-col-19"><Input disabled="true" value={this.state.configName} /></div>
          </div>
          <div className="configFile-wrap">
            <div className="ant-col-3 key">内容：</div>
            <div className="ant-col-19">
              <div className="configFile-content">
              {this.state.configtextarea}
              </div>
            </div>
          </div>
          <br />
        </Modal>
      </Card>
    );
  }
});

function mapStateToProps(state, props) {
  return {
	   cluster: state.entities.current.cluster.clusterID,
				configData: state.configReducers.loadConfigName
		}
}

MyComponent = connect(mapStateToProps, {
  loadConfigName
})(MyComponent)

export default class ComposeGroup extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const parentScope = this;
    return (
      <div id="ComposeGroup">
        <div className="titleBox">
          <div className="commonTitle">
            容器挂载点
          </div>
          <div className="commonTitle">
            配置组
          </div>
          <div className="commonTitle">
            配置文件
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <MyComponent service={this.props.service} serviceName={this.props.serviceName} cluster={this.props.cluster} serviceDetailmodalShow={this.props.serviceDetailmodalShow}/>
      </div>
    )
  }
}

ComposeGroup.propTypes = {
  //
}
