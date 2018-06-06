/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppGraph component
 *
 * v0.1 - 2016-10-26
 * @author Shouhong_Zhang
 */
import React, { Component } from 'react'
import { Checkbox, Dropdown, Button, Card, Menu, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppGraph.less"
import ReactDOM from 'react-dom';
import { getAppOrchfile } from '../../actions/app_manage'
import YamlEditor from '../Editor/Yaml'

let OrchfileComponent = React.createClass({
  componentWillMount() {
    const {cluster,appName } = this.props
    this.props.getAppOrchfile(cluster, appName)
  },
  render: function () {
    if (!this.props.appOrchfile || !this.props.appOrchfile.result
      || this.props.appOrchfile.result.data <= 0) {
      return <div className="introBox">无</div>
    }
    let content = this.props.appOrchfile.result.data;
    return (
      <div id="AppGraph">
        <div className="bottomBox">
          <YamlEditor value={content} parentId={'AppInfo'} />
          <div style={{ clear: "both" }}></div>
        </div>
      </div>
    )
  }
});

function mapStateToProp(state,props) {
  const defaultServices = {
    serviceList: [],
    total: 0
  }
  const { cluster,appName } = props
  return {
    appOrchfile: state.apps.appOrchfile,
  }
}

OrchfileComponent = connect(mapStateToProp, {
  getAppOrchfile
})(OrchfileComponent)

export default class AppGraph extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <OrchfileComponent cluster={this.props.cluster} appName={this.props.appName} />
    )
  }
}

AppGraph.propTypes = {
  //
}


