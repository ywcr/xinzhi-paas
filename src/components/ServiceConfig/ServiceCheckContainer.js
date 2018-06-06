/**
 *
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/23
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { Button, Icon, Table } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'

let RendContainerName = React.createClass({
  render: function () {
    return (
      <span>
        <i className="fa fa-tasks" style={{ marginRight: "5px" }}></i>
        容器名称
      </span>
    )
  }
})
let RendPoint = React.createClass({
  render: function () {
    return (
      <span>
        <Icon type="link" style={{ marginRight: "5px" }} />
        挂载点
      </span>
    )
  }
})

const containerCol = [
  {
    title: (<RendContainerName />),
    dataIndex: 'containerName',
  },
  {
    title: (<RendPoint />),
    dataIndex: 'pointPath',
  },
];

class CheckContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedContainers: [],
      loading: false,
    }
    this.onSelectChange = this.onSelectChange.bind(this)
    this.start = this.start.bind(this)
  }
  start() {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({
        selectedContainers: [],
        loading: false,
      });
    }, 1000);
  }
  onSelectChange(selectedContainers) {
    this.setState({ selectedContainers });
  }
  render() {
    const { containerList } = this.props
    const { loading, selectedContainers } = this.state;
    const containerSelection = {
      selectedContainers,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedContainers.length > 0;

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>{`关联容器 ( ${containerList.length} )`}</span>
          <Button type="primary" onClick={this.start}
            disabled={!hasSelected} loading={loading}
            >操作</Button>
          <span style={{ marginLeft: 8 }}>{hasSelected ? `选择了 ${selectedContainers.length} 个容器` : ''}</span>
        </div>
        <Table rowSelection={containerSelection} columns={containerCol}
          dataSource={containerList} pagination={{ pageSize: 5 }} rowKey="containerId" />
      </div>
    )
  }
}

CheckContainer.propTypes = {
  containerList: PropTypes.array.isRequired,
  intl: PropTypes.object.isRequired
}

export default injectIntl(CheckContainer, {
  withRef: true,
})

